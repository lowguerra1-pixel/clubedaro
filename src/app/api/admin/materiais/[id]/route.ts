import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdmin } from '@/lib/adminAuth';

// PATCH — edita um material
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  delete body.id;
  delete body.criado_em;
  const { data, error } = await supabaseAdmin
    .from('clube_materiais')
    .update(body)
    .eq('id', id)
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ material: data });
}

// DELETE — remove um material (e o arquivo do storage, se houver)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const { id } = await params;

  const { data: mat } = await supabaseAdmin
    .from('clube_materiais')
    .select('arquivo')
    .eq('id', id)
    .single();

  const { error } = await supabaseAdmin.from('clube_materiais').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (mat?.arquivo) {
    await supabaseAdmin.storage.from('clube-files').remove([mat.arquivo as string]);
  }
  return NextResponse.json({ ok: true });
}
