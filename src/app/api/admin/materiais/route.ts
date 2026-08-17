import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdmin } from '@/lib/adminAuth';

// GET — lista todos os materiais (admin), mais recentes/agendados primeiro
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .from('clube_materiais')
    .select('*')
    .order('liberar_em', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ materiais: data ?? [] });
}

// POST — cria um material
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const b = await req.json();
  if (!b.titulo || !String(b.titulo).trim()) {
    return NextResponse.json({ error: 'Título obrigatório' }, { status: 400 });
  }
  const row = {
    titulo: String(b.titulo).trim(),
    descricao: b.descricao ?? null,
    categoria: b.categoria ?? null,
    tipo: b.tipo ?? null,
    arquivo: b.arquivo ?? null,
    link_externo: b.link_externo ?? null,
    tema: b.tema ?? null,
    rotulo: b.rotulo ?? null,
    liberar_em: b.liberar_em ?? new Date().toISOString(),
    gratis: b.gratis ?? true,
    publicado: b.publicado ?? true,
  };
  const { data, error } = await supabaseAdmin
    .from('clube_materiais')
    .insert(row)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ material: data });
}
