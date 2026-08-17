import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateToken } from '@/lib/userAuth';

// GET — materiais LIBERADOS para o assinante (drip): publicado + já na data.
export async function GET(req: NextRequest) {
  const user = validateToken(req.headers.get('x-user-token'));
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const nowIso = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('clube_materiais')
    .select('id, titulo, descricao, categoria, tipo, arquivo, link_externo, tema, rotulo, liberar_em')
    .eq('publicado', true)
    .lte('liberar_em', nowIso)
    .order('liberar_em', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ materiais: data ?? [] });
}
