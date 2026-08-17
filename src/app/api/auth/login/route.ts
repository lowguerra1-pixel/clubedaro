import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { makeToken } from '@/lib/userAuth';

// E-mails com acesso liberado sempre (teste + dona). Os assinantes reais
// entram via clube_membros (populado pelo webhook da Hotmart — Parte 2).
const ALLOWED_ALWAYS = ['teste@clube.com', 'lowguerra1@gmail.com'];

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}));
  if (!email || typeof email !== 'string') {
    return NextResponse.json({ ok: false, error: 'E-mail inválido.' }, { status: 400 });
  }
  const n = email.trim().toLowerCase();

  if (ALLOWED_ALWAYS.includes(n)) {
    const user = { email: n, nome: n === 'teste@clube.com' ? 'Visitante' : 'Dra. Rô', preview: n === 'teste@clube.com' };
    return NextResponse.json({ ok: true, token: makeToken(user), user });
  }

  const { data } = await supabaseAdmin
    .from('clube_membros')
    .select('email, nome, status')
    .ilike('email', n)
    .limit(1);
  const m = data?.[0];
  if (!m || !['trial', 'ativo'].includes(m.status)) {
    return NextResponse.json({ ok: false, error: 'E-mail não encontrado. Assine o Clube para acessar.' }, { status: 401 });
  }
  const user = { email: m.email, nome: m.nome ?? String(m.email).split('@')[0] };
  return NextResponse.json({ ok: true, token: makeToken(user), user });
}
