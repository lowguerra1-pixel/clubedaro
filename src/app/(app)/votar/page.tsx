'use client';

import { useEffect, useState, useCallback } from 'react';
import { getToken } from '@/lib/userStorage';

interface Opcao { label: string; votos: number; }
interface Enquete { id: string; pergunta: string; opcoes: Opcao[]; total: number; encerrar_em: string; meuVoto: number | null; }

export default function Votar() {
  const [ativa, setAtiva] = useState<Enquete | null>(null);
  const [anteriores, setAnteriores] = useState<Enquete[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch('/api/enquetes', { headers: { 'x-user-token': getToken() ?? '' } });
    if (res.ok) { const d = await res.json(); setAtiva(d.ativa); setAnteriores(d.anteriores ?? []); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const votar = async (i: number) => {
    if (!ativa || busy) return;
    setBusy(true);
    await fetch(`/api/enquetes/${ativa.id}/votar`, { method: 'POST', headers: { 'x-user-token': getToken() ?? '', 'Content-Type': 'application/json' }, body: JSON.stringify({ opcao: i }) });
    await load();
    setBusy(false);
  };

  const fmtD = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const pct = (v: number, t: number) => t > 0 ? Math.round((v / t) * 100) : 0;

  const Resultado = ({ e, mine }: { e: Enquete; mine: number | null }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      {e.opcoes.map((o, i) => {
        const p = pct(o.votos, e.total);
        const chosen = mine === i;
        return (
          <div key={i} style={{ position: 'relative', border: `1.5px solid ${chosen ? '#9163E0' : '#EFEAF7'}`, background: '#fff', borderRadius: 14, padding: '11px 13px', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${p}%`, background: chosen ? '#EFE1FB' : '#F5F2FA' }} />
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: '#251A38' }}>{o.label}{chosen && ' ✓'}</span>
              <span style={{ fontSize: 13, fontWeight: 800, color: chosen ? '#6C3FB0' : '#7C7090' }}>{p}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div style={{ padding: '22px 20px 20px' }}>
      <h1 className="serif" style={{ fontSize: 26, fontWeight: 700, color: '#4A2A80', margin: '0 0 4px' }}>Votar</h1>
      <p style={{ fontSize: 13.5, color: '#7C7090', margin: '0 0 20px' }}>Você escolhe o tema do próximo mês.</p>

      {loading ? (
        <div style={{ color: '#9B95AC', fontSize: 14 }}>Carregando…</div>
      ) : (
        <>
          {ativa ? (
            <div style={{ background: '#fff', border: '1px solid #ECE7F1', borderRadius: 20, padding: 20, boxShadow: '0 8px 24px rgba(108,63,176,.08)', marginBottom: 26 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: '#9163E0' }}>Enquete ativa · encerra {fmtD(ativa.encerrar_em)}</div>
              <p className="serif" style={{ fontSize: 20, fontWeight: 600, color: '#251A38', margin: '10px 0 16px', lineHeight: 1.25 }}>{ativa.pergunta}</p>
              {ativa.meuVoto === null ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {ativa.opcoes.map((o, i) => (
                    <button key={i} onClick={() => votar(i)} disabled={busy} style={{ textAlign: 'left', border: '1.5px solid #E6DDF5', background: '#fff', borderRadius: 14, padding: '13px 15px', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#251A38' }}>{o.label}</button>
                  ))}
                  <div style={{ fontSize: 12, color: '#9B95AC', textAlign: 'center', marginTop: 2 }}>Toque numa opção pra votar</div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#E4F5EC', borderRadius: 12, padding: '9px 12px', marginBottom: 12 }}>
                    <span style={{ color: '#1F7A50', fontSize: 13, fontWeight: 700 }}>✓ Voto registrado · obrigada!</span>
                  </div>
                  <Resultado e={ativa} mine={ativa.meuVoto} />
                  <div style={{ fontSize: 12, color: '#9B95AC', textAlign: 'center', marginTop: 10 }}>{ativa.total} voto{ativa.total !== 1 ? 's' : ''}</div>
                </>
              )}
            </div>
          ) : (
            <div style={{ background: '#fff', border: '1px solid #ECE7F1', borderRadius: 18, padding: 24, textAlign: 'center', color: '#7C7090', fontSize: 14, marginBottom: 26 }}>
              Nenhuma enquete ativa agora. Fica de olho — logo tem votação nova 💜
            </div>
          )}

          {anteriores.length > 0 && (
            <>
              <div className="serif" style={{ fontSize: 18, fontWeight: 700, color: '#251A38', margin: '0 0 12px' }}>Enquetes anteriores</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {anteriores.map(e => (
                  <div key={e.id} style={{ background: '#fff', border: '1px solid #ECE7F1', borderRadius: 18, padding: 16 }}>
                    <p style={{ fontSize: 14.5, fontWeight: 700, color: '#251A38', margin: '0 0 12px' }}>{e.pergunta}</p>
                    <Resultado e={e} mine={e.meuVoto} />
                    <div style={{ fontSize: 11.5, color: '#9B95AC', marginTop: 8 }}>{e.total} voto{e.total !== 1 ? 's' : ''} · encerrada em {fmtD(e.encerrar_em)}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
