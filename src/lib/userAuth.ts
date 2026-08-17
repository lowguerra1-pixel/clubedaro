// Auth do assinante (server-side). Token = base64 JSON com um segredo.
const SECRET = () => process.env.USER_TOKEN_SECRET ?? 'clube-user-secret';

export interface ClubeUser { email: string; nome: string; preview?: boolean; }

export function makeToken(u: ClubeUser): string {
  return Buffer.from(JSON.stringify({ ...u, secret: SECRET() })).toString('base64');
}

export function validateToken(token: string | null): ClubeUser | null {
  if (!token) return null;
  try {
    const d = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    if (d.secret !== SECRET() || !d.email) return null;
    return { email: d.email, nome: d.nome ?? String(d.email).split('@')[0], preview: d.preview };
  } catch {
    return null;
  }
}
