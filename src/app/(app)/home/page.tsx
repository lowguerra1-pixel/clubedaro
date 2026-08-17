'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUser, getToken } from '@/lib/userStorage';
import { fetchMateriais, abrirMaterial, catColor, type Mat } from '@/lib/material';

export default function Home() {
  const [mats, setMats] = useState<Mat[]>([]);
  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState('');
  const [enq, setEnq] = useState<{ id: string; pergunta: string; meuVoto: number | null } | null>(null);

  useEffect(() => {
    setNome(getUser()?.nome ?? '');
    fetchMateriais().then(m => { setMats(m); setLoading(false); });
    fetch('/api/enquetes', { headers: { 'x-user-token': getToken() ?? '' } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.ativa) setEnq({ id: d.ativa.id, pergunta: d.ativa.pergunta, meuVoto: d.ativa.meuVoto }); })
      .catch(() => {});
  }, []);

  const destaque = mats[0];
  const resto = mats.slice(1, 5);

  return (
    <div style={{ padding: '22px 20px 20px' }}>
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12.5, color: '#7C7090', fontWeight: 500 }}>Olá,</div>
        <div className="serif" style={{ fontSize: 26, fontWeight: 700, color: '#6C3FB0' }}>{nome.split(' ')[0] || 'Bem-vinda'}</div>
      </div>

      {enq && (
        <Link href="/votar" style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F0E8FB', border: '1px solid #E0D4F5', borderRadius: 16, padding: '13px 15px', marginBottom: 18, textDecoration: 'none' }}>
          <span style={{ fontSize: 20 }}>🗳️</span>
          <span style={{ flex: 1, minWidth: 0 }}>
            <span style={{ display: 'block', fontSize: 13.5, fontWeight: 700, color: '#4A2A80' }}>Enquete ativa</span>
            <span style={{ display: 'block', fontSize: 12, color: '#6C3FB0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{enq.meuVoto === null ? 'Vote no tema do próximo mês' : 'Ver resultado parcial'}</span>
          </span>
          <span style={{ color: '#9163E0', fontWeight: 700, fontSize: 13, flex: 'none' }}>{enq.meuVoto === null ? 'Votar ›' : 'Ver ›'}</span>
        </Link>
      )}

      {loading ? (
        <div style={{ color: '#9B95AC', fontSize: 14 }}>Carregando…</div>
      ) : mats.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #ECE7F1', borderRadius: 18, padding: 24, textAlign: 'center', color: '#7C7090', fontSize: 14 }}>
          Nenhum recurso liberado ainda. Volte em breve 💜
        </div>
      ) : (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: '#9163E0', margin: '0 0 10px' }}>Recurso da semana</div>
          {destaque && (() => {
            const c = catColor(destaque.categoria);
            return (
              <div style={{ background: '#fff', borderRadius: 24, overflow: 'hidden', boxShadow: '0 14px 34px rgba(108,63,176,.14)', marginBottom: 26 }}>
                <div style={{ height: 150, background: `linear-gradient(145deg, ${c.solid}, rgba(0,0,0,.28))`, display: 'flex', alignItems: 'flex-end', padding: 20 }}>
                  {destaque.tema && <span style={{ background: '#fff', color: c.solid, fontSize: 10.5, fontWeight: 700, letterSpacing: .6, textTransform: 'uppercase', padding: '5px 11px', borderRadius: 999 }}>{destaque.tema}</span>}
                </div>
                <div style={{ padding: '16px 18px 18px' }}>
                  <div className="serif" style={{ fontSize: 20, fontWeight: 600, color: '#251A38', lineHeight: 1.2 }}>{destaque.titulo}</div>
                  {destaque.rotulo && <div style={{ fontSize: 12.5, color: '#7C7090', marginTop: 4 }}>{destaque.rotulo}</div>}
                  <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                    <button onClick={() => abrirMaterial(destaque)} style={{ flex: 1, border: '1.5px solid #DCD2EC', background: '#fff', color: '#4A2A80', fontWeight: 700, fontSize: 14, padding: 13, borderRadius: 14, cursor: 'pointer' }}>Visualizar</button>
                    <button onClick={() => abrirMaterial(destaque, true)} style={{ flex: 1, border: 'none', background: '#C79A2E', color: '#fff', fontWeight: 700, fontSize: 14, padding: 13, borderRadius: 14, cursor: 'pointer' }}>Baixar</button>
                  </div>
                </div>
              </div>
            );
          })()}

          {resto.length > 0 && (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', margin: '0 0 12px' }}>
                <div className="serif" style={{ fontSize: 19, fontWeight: 600, color: '#251A38' }}>Também no seu clube</div>
                <Link href="/biblioteca" style={{ fontSize: 12.5, fontWeight: 700, color: '#17A39A', textDecoration: 'none' }}>Ver tudo</Link>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {resto.map(m => {
                  const c = catColor(m.categoria);
                  return (
                    <button key={m.id} onClick={() => abrirMaterial(m)} style={{ display: 'flex', alignItems: 'center', gap: 13, background: '#fff', border: 'none', borderRadius: 18, padding: 13, boxShadow: '0 6px 18px rgba(108,63,176,.06)', cursor: 'pointer', textAlign: 'left' }}>
                      <span style={{ width: 44, height: 44, borderRadius: 13, background: c.tint, color: c.solid, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flex: 'none' }}>{(m.categoria || '?').charAt(0)}</span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontWeight: 700, fontSize: 14, color: '#251A38' }}>{m.titulo}</span>
                        <span style={{ display: 'block', fontSize: 12, color: '#7C7090' }}>{m.categoria}{m.rotulo ? ` · ${m.rotulo}` : ''}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
