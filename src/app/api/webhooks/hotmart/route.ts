import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

/**
 * Webhook do Hotmart — libera/bloqueia o acesso ao Clube automaticamente.
 * Validação pelo hottok (env HOTMART_HOTTOK), aceito via header, body ou ?token=.
 * Filtro opcional por produto: env HOTMART_PRODUTO_ID (id ou ucode).
 */

const GRANT = new Set(['PURCHASE_APPROVED', 'PURCHASE_COMPLETE', 'APPROVED', 'COMPLETE', 'COMPLETED']);
const REVOKE = new Set([
  'PURCHASE_REFUNDED', 'PURCHASE_CHARGEBACK', 'PURCHASE_CANCELED', 'PURCHASE_PROTEST', 'PURCHASE_EXPIRED',
  'SUBSCRIPTION_CANCELLATION', 'REFUNDED', 'CHARGEBACK', 'CANCELLED', 'CANCELED', 'EXPIRED', 'PROTEST',
]);

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return NextResponse.json({ error: 'JSON inválido' }, { status: 400 }); }

  // ── Validação do hottok ───────────────────────────────────────────
  const expected = process.env.HOTMART_HOTTOK ?? '';
  const sent = req.headers.get('x-hotmart-hottok')
    || (body.hottok as string | undefined)
    || req.nextUrl.searchParams.get('token')
    || '';
  if (expected && sent !== expected) {
    console.warn('[Hotmart webhook] hottok inválido');
    return NextResponse.json({ error: 'hottok inválido' }, { status: 401 });
  }

  const data = (body.data as Record<string, unknown>) || {};
  const product = (data.product as Record<string, unknown>) || {};
  const buyer = (data.buyer as Record<string, unknown>) || {};
  const purchase = (data.purchase as Record<string, unknown>) || {};
  const subscription = (data.subscription as Record<string, unknown>) || {};

  const event = String(body.event || '');
  const status = String(purchase.status || '');
  const email = String(buyer.email || '').trim().toLowerCase();
  const nome = (buyer.name as string) || null;

  console.log('[Hotmart webhook]', JSON.stringify({ event, status, email, product: product.id }));

  // ── Filtro opcional por produto ───────────────────────────────────
  const filtro = process.env.HOTMART_PRODUTO_ID;
  if (filtro && String(product.id) !== filtro && String(product.ucode) !== filtro) {
    return NextResponse.json({ ok: true, ignored: 'produto diferente' });
  }
  if (!email) return NextResponse.json({ ok: true, ignored: 'sem email' });

  const isRevoke = REVOKE.has(event) || REVOKE.has(status);
  const isGrant = GRANT.has(event) || GRANT.has(status);

  // ── Revogação ─────────────────────────────────────────────────────
  if (isRevoke) {
    await supabaseAdmin.from('clube_membros').update({ status: 'cancelado' }).ilike('email', email);
    return NextResponse.json({ ok: true, action: 'revogado', email });
  }

  // ── Liberação (aprovado / completo / trial) ──────────────────────
  if (isGrant) {
    const isTrial = String(purchase.status) === 'STARTED'
      || String(subscription.status).toUpperCase() === 'TRIAL'
      || !!purchase.trial;
    const novoStatus = isTrial ? 'trial' : 'ativo';
    const plano = (product.name as string) || 'clube';

    const { data: existing } = await supabaseAdmin
      .from('clube_membros').select('id').ilike('email', email).limit(1);

    if (existing?.[0]) {
      await supabaseAdmin.from('clube_membros').update({ status: novoStatus, nome, plano }).ilike('email', email);
    } else {
      await supabaseAdmin.from('clube_membros').insert({ email, nome, status: novoStatus, plano, iniciou_em: new Date().toISOString() });
    }
    return NextResponse.json({ ok: true, action: 'liberado', status: novoStatus, email });
  }

  return NextResponse.json({ ok: true, ignored: event || status });
}

export async function GET() {
  return NextResponse.json({ ok: true, service: 'Clube da Dra. Rô — webhook Hotmart' });
}
