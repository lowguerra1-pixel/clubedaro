'use client';

import { useEffect, useState } from 'react';
import { fetchMateriais, abrirMaterial, catColor, type Mat } from '@/lib/material';

export default function Biblioteca() {
  const [mats, setMats] = useState<Mat[]>([]);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<Mat | null>(null);

  useEffect(() => { fetchMateriais().then(m => { setMats(m); setLoading(false); }); }, []);

  return (
    <div style={{ padding: '22px 20px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
        <span className="serif" style={{ fontSize: 44, fontWeight: 600, color: '#6C3FB0', lineHeight: 1 }}>{mats.length}</span>
        <span className="serif" style={{ fontSize: 22, fontWeight: 600, color: '#251A38' }}>recursos seus</span>
      </div>
      <p style={{ fontSize: 13.5, color: '#7C7090', margin: '6px 0 18px' }}>Tudo que já foi liberado, salvo pra sempre.</p>

      {loading ? (
        <div style={{ color: '#9B95AC', fontSize: 14 }}>Carregando…</div>
      ) : mats.length === 0 ? (
        <div style={{ background: '#fff', border: '1px solid #ECE7F1', borderRadius: 18, padding: 24, textAlign: 'center', color: '#7C7090', fontSize: 14 }}>Nenhum recurso liberado ainda.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {mats.map(m => {
            const c = catColor(m.categoria);
            return (
              <button key={m.id} onClick={() => setSel(m)} style={{ border: 'none', padding: 0, background: 'none', cursor: 'pointer', textAlign: 'left' }}>
                <div style={{ height: 130, borderRadius: 18, background: `linear-gradient(150deg, ${c.solid}, rgba(0,0,0,.24))`, padding: 14, display: 'flex', alignItems: 'flex-end', boxShadow: '0 8px 20px rgba(108,63,176,.14)' }}>
                  <span className="serif" style={{ color: c.on, fontSize: 15, lineHeight: 1.2 }}>{m.titulo}</span>
                </div>
                <div style={{ fontWeight: 700, fontSize: 13, marginTop: 8, color: '#251A38', lineHeight: 1.3 }}>{m.titulo}</div>
                <div style={{ fontSize: 11.5, color: '#7C7090', marginTop: 2 }}>{m.categoria}{m.rotulo ? ` · ${m.rotulo}` : ''}</div>
              </button>
            );
          })}
        </div>
      )}

      {/* Popup Visualizar / Baixar */}
      {sel && (
        <div onClick={() => setSel(null)} style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(45,42,61,.42)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ width: '100%', maxWidth: 460, background: '#fff', borderRadius: '26px 26px 0 0', padding: '18px 18px 26px' }}>
            <div style={{ width: 44, height: 4, borderRadius: 4, background: '#E7E3EF', margin: '0 auto 16px' }} />
            <div className="serif" style={{ fontSize: 17, fontWeight: 700, color: '#251A38', marginBottom: 2 }}>{sel.titulo}</div>
            <div style={{ fontSize: 12.5, color: '#7C7090', marginBottom: 16 }}>O que você deseja fazer?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button onClick={() => { abrirMaterial(sel); setSel(null); }} style={{ height: 52, border: 'none', borderRadius: 16, background: '#6C3FB0', color: '#fff', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Visualizar</button>
              <button onClick={() => { abrirMaterial(sel, true); setSel(null); }} style={{ height: 52, border: '1.5px solid #B9E3DF', borderRadius: 16, background: '#E8F6F4', color: '#0F6E68', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Baixar</button>
              <button onClick={() => setSel(null)} style={{ height: 46, border: 'none', background: 'none', color: '#7C7090', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
