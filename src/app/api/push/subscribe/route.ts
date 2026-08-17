import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// POST — registra a inscrição de push do aparelho do assinante.
export async function POST(req: NextRequest) {
  const { endpoint, keys, email } = await req.json().catch(() => ({}));
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return NextResponse.json({ error: 'Inscrição inválida' }, { status: 400 });
  }
  await supabaseAdmin
    .from('clube_push_subs')
    .upsert({ endpoint, p256dh: keys.p256dh, auth: keys.auth, email: email ?? null }, { onConflict: 'endpoint' });
  return NextResponse.json({ ok: true });
}
