import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { validateToken } from '@/lib/userAuth';

interface Voto { enquete_id: string; email: string; opcao: number; }
interface Enq { id: string; pergunta: string; opcoes: string[]; encerrar_em: string; }

// GET — enquete ativa + anteriores (com resultados e o voto do usuário)
export async function GET(req: NextRequest) {
  const user = validateToken(req.headers.get('x-user-token'));
  if (!user) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

  const now = new Date().toISOString();
  const { data: enqs } = await supabaseAdmin
    .from('clube_enquetes')
    .select('id, pergunta, opcoes, encerrar_em')
    .eq('publicado', true)
    .lte('publicar_em', now)
    .order('encerrar_em', { ascending: false });

  const list = (enqs ?? []) as Enq[];
  const ids = list.map(e => e.id);
  let votos: Voto[] = [];
  if (ids.length) {
    const { data } = await supabaseAdmin.from('clube_votos').select('enquete_id, email, opcao').in('enquete_id', ids);
    votos = (data ?? []) as Voto[];
  }

  const build = (e: Enq) => {
    const vs = votos.filter(v => v.enquete_id === e.id);
    const opcoes = (e.opcoes || []).map((label, i) => ({ label, votos: vs.filter(v => v.opcao === i).length }));
    const meu = vs.find(v => v.email === user.email);
    return { id: e.id, pergunta: e.pergunta, opcoes, total: vs.length, encerrar_em: e.encerrar_em, meuVoto: meu ? meu.opcao : null };
  };

  const now2 = Date.now();
  const ativas = list.filter(e => new Date(e.encerrar_em).getTime() > now2);
  const passadas = list.filter(e => new Date(e.encerrar_em).getTime() <= now2);

  return NextResponse.json({
    ativa: ativas[0] ? build(ativas[0]) : null,
    anteriores: passadas.map(build),
  });
}
