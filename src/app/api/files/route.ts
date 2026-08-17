import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, CLUBE_BUCKET } from '@/lib/supabase';
import { validateToken } from '@/lib/userAuth';

// GET /api/files?path=materiais/xxx&download=1 — URL assinada (só assinante).
export async function GET(req: NextRequest) {
  const user = validateToken(req.headers.get('x-user-token'));
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const path = req.nextUrl.searchParams.get('path');
  if (!path) return NextResponse.json({ error: 'path obrigatório' }, { status: 400 });

  const download = req.nextUrl.searchParams.get('download') === '1';
  const fileName = path.split('/').pop() || 'arquivo';
  const { data, error } = await supabaseAdmin.storage
    .from(CLUBE_BUCKET)
    .createSignedUrl(path, 3600, download ? { download: fileName } : undefined);

  if (error || !data?.signedUrl) return NextResponse.json({ error: 'Arquivo não encontrado' }, { status: 404 });
  return NextResponse.json({ url: data.signedUrl });
}
