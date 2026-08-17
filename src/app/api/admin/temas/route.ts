import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdmin } from '@/lib/adminAuth';

// GET — lista os temas do mês (presets de agendamento)
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .from('clube_temas')
    .select('*')
    .order('inicio_em', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ temas: data ?? [] });
}

// POST — cria um tema do mês
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const b = await req.json();
  if (!b.nome || !String(b.nome).trim() || !b.inicio_em) {
    return NextResponse.json({ error: 'Nome e data de início são obrigatórios' }, { status: 400 });
  }
  const { data, error } = await supabaseAdmin
    .from('clube_temas')
    .insert({ nome: String(b.nome).trim(), inicio_em: b.inicio_em })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ tema: data });
}
