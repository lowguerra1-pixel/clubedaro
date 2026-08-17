import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdmin } from '@/lib/adminAuth';
import webpush from 'web-push';

interface Sub { endpoint: string; p256dh: string; auth: string; }

// GET — quantos aparelhos inscritos
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const { count } = await supabaseAdmin.from('clube_push_subs').select('id', { count: 'exact', head: true });
  return NextResponse.json({ inscritos: count ?? 0 });
}

// POST — envia uma notificação push para todos os inscritos
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const { titulo, corpo } = await req.json();
  if (!titulo || !String(titulo).trim()) return NextResponse.json({ error: 'Título obrigatório' }, { status: 400 });

  const pub = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';
  const priv = process.env.VAPID_PRIVATE_KEY ?? '';
  const mail = process.env.VAPID_EMAIL ?? 'mailto:admin@oficinadarosana.site';
  if (!pub || !priv) return NextResponse.json({ error: 'VAPID não configurado no Netlify.' }, { status: 500 });

  webpush.setVapidDetails(mail, pub, priv);

  const { data: subs } = await supabaseAdmin.from('clube_push_subs').select('endpoint, p256dh, auth');
  const list = (subs ?? []) as Sub[];
  const payload = JSON.stringify({ title: String(titulo).trim(), body: corpo ? String(corpo) : '', url: '/home' });

  let enviados = 0, removidos = 0;
  await Promise.all(list.map(async (s) => {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload);
      enviados++;
    } catch (e: unknown) {
      const code = (e as { statusCode?: number })?.statusCode;
      if (code === 404 || code === 410) {
        await supabaseAdmin.from('clube_push_subs').delete().eq('endpoint', s.endpoint);
        removidos++;
      }
    }
  }));

  return NextResponse.json({ ok: true, enviados, removidos, total: list.length });
}
