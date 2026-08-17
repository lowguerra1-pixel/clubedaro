import { NextRequest } from 'next/server';

/**
 * Autenticação simples do admin do Clube: o painel envia a senha no header
 * `x-admin-password`, comparada com a env var ADMIN_PASSWORD.
 */
export function isAdmin(req: NextRequest): boolean {
  const sent = req.headers.get('x-admin-password') ?? '';
  const expected = process.env.ADMIN_PASSWORD ?? '';
  return expected.length > 0 && sent === expected;
}
