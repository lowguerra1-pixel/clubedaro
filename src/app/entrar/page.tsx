'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { setSession, isLoggedIn } from '@/lib/userStorage';

const CHECKOUT_URL = 'https://pay.hotmart.com/U107204446L?checkoutMode=10';

export default function Entrar() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (isLoggedIn()) router.replace('/home'); }, [router]);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const val = (inputRef.current?.value || email).trim().toLowerCase();
    if (!val) { setError('Digite o seu e-mail.'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: val }) });
      const data = await res.json();
      if (data.ok) { setSession(data.token, data.user); router.push('/home'); }
      else setError(data.error ?? 'Não foi possível entrar.');
    } catch { setError('Erro de conexão. Tente de novo.'); }
    finally { setLoading(false); }
  };

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F7F4FC' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 30px', background: 'linear-gradient(180deg,#F0E8FB 0%,#F7F4FC 62%)' }}>
        <div style={{ width: 92, height: 92, borderRadius: 28, background: 'linear-gradient(150deg,#6C3FB0,#4A2A80)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 36px rgba(74,42,128,.3)' }}>
          <span className="serif" style={{ color: '#F8EFD6', fontSize: 40, fontWeight: 600 }}>Rô</span>
        </div>
        <h1 className="serif" style={{ fontSize: 30, fontWeight: 700, color: '#4A2A80', margin: '22px 0 0' }}>Clube da Dra. Rô</h1>
        <p style={{ fontSize: 14.5, color: '#7C7090', margin: '8px 0 0', textAlign: 'center' }}>Recursos terapêuticos toda semana.</p>
      </div>
      <div style={{ background: '#fff', borderRadius: '30px 30px 0 0', boxShadow: '0 -14px 34px rgba(91,74,158,.13)', padding: '26px 24px 34px' }}>
        <h2 className="serif" style={{ fontSize: 23, fontWeight: 700, color: '#251A38', margin: '0 0 4px' }}>Entrar</h2>
        <p style={{ fontSize: 13.5, color: '#7C7090', margin: '0 0 16px' }}>Use o e-mail da sua assinatura.</p>
        <form onSubmit={entrar} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input ref={inputRef} type="email" name="email" defaultValue="" onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" autoComplete="email" inputMode="email"
            style={{ width: '100%', height: 54, border: '1.5px solid #E7E3EF', borderRadius: 16, padding: '0 16px', fontSize: 15, background: '#FBFAFE', color: '#251A38' }} />
          {error && <div style={{ background: '#FBEAEA', border: '1px solid #F3C7C1', borderRadius: 12, padding: '10px 12px', fontSize: 12.5, color: '#B24A4A' }}>{error}</div>}
          <button type="submit" disabled={loading} style={{ height: 54, border: 'none', borderRadius: 16, background: '#6C3FB0', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>{loading ? 'Entrando…' : 'Acessar'}</button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <span style={{ flex: 1, height: 1, background: '#EEE9F5' }} />
          <span style={{ fontSize: 11.5, color: '#B0A9C0', fontWeight: 600 }}>ainda não é sócia?</span>
          <span style={{ flex: 1, height: 1, background: '#EEE9F5' }} />
        </div>

        <a href={CHECKOUT_URL} target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, textDecoration: 'none', height: 58, justifyContent: 'center', border: 'none', borderRadius: 16, background: '#F5806C', boxShadow: '0 12px 26px rgba(245,128,108,.34)' }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 16 }}>Começar com 7 dias grátis</span>
          <span style={{ color: '#FFEEEA', fontWeight: 600, fontSize: 11.5 }}>Plano Sócia Fundadora · R$1,23/dia</span>
        </a>
        <p style={{ textAlign: 'center', fontSize: 11.5, color: '#9B95AC', margin: '14px 0 0', lineHeight: 1.5 }}>Sem compromisso — cancele quando quiser.</p>
      </div>
    </main>
  );
}
