import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { isAdmin } from '@/lib/adminAuth';

// GET — lista os assinantes/membros do Clube (populado pelo webhook da assinatura)
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const { data, error } = await supabaseAdmin
    .from('clube_membros')
    .select('*')
    .order('criado_em', { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ membros: data ?? [] });
}
