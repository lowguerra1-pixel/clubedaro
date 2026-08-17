'use client';

import { useState, useEffect, useRef } from 'react';

const SUPORTE = `https://wa.me/5511943121641?text=${encodeURIComponent('Olá! Preciso de ajuda com o Clube da Dra. Rô.')}`;
const GRUPO = 'https://chat.whatsapp.com/ER61hxDTQqj8SEzlJgHAg3';

const WA = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="26" height="26">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export default function WhatsAppButton() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [open]);

  const link: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, background: '#fff', color: '#251A38', fontSize: 14, fontWeight: 600, padding: '11px 15px', borderRadius: 16, boxShadow: '0 8px 24px rgba(45,42,61,.18)', textDecoration: 'none', whiteSpace: 'nowrap' };
  const dot: React.CSSProperties = { width: 28, height: 28, borderRadius: 999, background: '#25D366', display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 'none' };

  return (
    <div ref={ref} style={{ position: 'fixed', right: 16, bottom: 96, zIndex: 45, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
      {open && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <a href={GRUPO} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} style={link}>
            <span style={dot}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7.6" r="3.4" /><path d="M2.8 20.4v-1.3a4.6 4.6 0 0 1 4.6-4.6h3.2a4.6 4.6 0 0 1 4.6 4.6v1.3" /></svg></span>
            Entrar no Grupo
          </a>
          <a href={SUPORTE} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} style={link}>
            <span style={dot}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.5 14.4a2 2 0 0 1-2 2H8l-4.5 4V5.6a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" /></svg></span>
            Falar com o suporte
          </a>
        </div>
      )}
      <button onClick={() => setOpen(o => !o)} aria-label="WhatsApp" style={{ width: 54, height: 54, borderRadius: 999, border: 'none', background: '#25D366', boxShadow: '0 10px 22px rgba(37,211,102,.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
        {open ? <span style={{ color: '#fff', fontSize: 24 }}>×</span> : WA}
      </button>
    </div>
  );
}
