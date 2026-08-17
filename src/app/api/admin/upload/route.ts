import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, CLUBE_BUCKET } from '@/lib/supabase';
import { isAdmin } from '@/lib/adminAuth';

// POST — upload de arquivo para o bucket privado clube-files.
// Recebe multipart/form-data com o campo "file". Retorna o caminho salvo.
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const form = await req.formData();
  const file = form.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'Arquivo ausente' }, { status: 400 });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `materiais/${Date.now()}-${safeName}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabaseAdmin.storage
    .from(CLUBE_BUCKET)
    .upload(path, buffer, {
      contentType: file.type || 'application/octet-stream',
      upsert: false,
    });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ path, name: file.name });
}
