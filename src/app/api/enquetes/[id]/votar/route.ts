import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateToken } from '@/lib/userAuth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = validateToken(req.headers.get('x-user-token'));
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const { id } = await params;
  const { opcao } = await req.json().catch(() => ({}));

  const { data: e } = await supabaseAdmin
    .from('clube_enquetes')
    .select('opcoes, publicar_em, encerrar_em, publicado')
    .eq('id', id)
    .single();

  if (!e || !e.publicado) return NextResponse.json({ error: 'Enquete não encontrada' }, { status: 404 });
  const now = Date.now();
  if (new Date(e.encerrar_em).getTime() <= now || new Date(e.publicar_em).getTime() > now) {
    return NextResponse.json({ error: 'Enquete encerrada' }, { status: 400 });
  }
  const nOpts = Array.isArray(e.opcoes) ? e.opcoes.length : 0;
  if (typeof opcao !== 'number' || opcao < 0 || opcao >= nOpts) {
    return NextResponse.json({ error: 'Opção inválida' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('clube_votos')
    .upsert({ enquete_id: id, email: user.email, opcao }, { onConflict: 'enquete_id,email' });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
