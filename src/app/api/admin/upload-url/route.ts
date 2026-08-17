import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, CLUBE_BUCKET } from '@/lib/supabase';
import { isAdmin } from '@/lib/adminAuth';

/**
 * POST — devolve uma URL assinada de upload. O navegador envia o arquivo
 * DIRETO pro Supabase Storage (não passa pela função do Netlify), então
 * aguenta arquivos grandes sem estourar o limite de corpo da função.
 */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  const { filename } = await req.json().catch(() => ({}));
  const safe = String(filename || 'arquivo').replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `materiais/${Date.now()}-${safe}`;
  const { data, error } = await supabaseAdmin.storage.from(CLUBE_BUCKET).createSignedUploadUrl(path);
  if (error || !data) return NextResponse.json({ error: error?.message || 'Erro ao preparar upload' }, { status: 500 });
  return NextResponse.json({ path, signedUrl: data.signedUrl, token: data.token });
}
