import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdmin } from '@/lib/adminAuth';

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .from('clube_enquetes')
    .select('*')
    .order('publicar_em', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ enquetes: data ?? [] });
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const b = await req.json();
  const opcoes = Array.isArray(b.opcoes) ? b.opcoes.map((s: string) => String(s).trim()).filter(Boolean) : [];
  if (!b.pergunta || !String(b.pergunta).trim()) return NextResponse.json({ error: 'Pergunta obrigatória' }, { status: 400 });
  if (opcoes.length < 2) return NextResponse.json({ error: 'Adicione ao menos 2 opções' }, { status: 400 });
  if (!b.encerrar_em) return NextResponse.json({ error: 'Data de encerramento obrigatória' }, { status: 400 });
  const row = {
    pergunta: String(b.pergunta).trim(),
    opcoes,
    publicar_em: b.publicar_em ?? new Date().toISOString(),
    encerrar_em: b.encerrar_em,
    publicado: b.publicado ?? true,
  };
  const { data, error } = await supabaseAdmin.from('clube_enquetes').insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ enquete: data });
}
