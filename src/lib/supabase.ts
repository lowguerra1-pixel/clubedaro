import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase server-side (service role). Compartilha o MESMO projeto
 * Supabase do app principal — só usa a tabela clube_materiais e o bucket
 * clube-files. Lazy para o build não quebrar quando as env vars faltam.
 */
let _client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (_client) return _client;
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').replace(/\/+$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!url || !key) {
    throw new Error('Faltam env vars: NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.');
  }
  _client = createClient(url, key, { auth: { persistSession: false } });
  return _client;
}

export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_t, prop: string | symbol) {
    const client = getClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(client) : value;
  },
});

export const CLUBE_BUCKET = 'clube-files';
