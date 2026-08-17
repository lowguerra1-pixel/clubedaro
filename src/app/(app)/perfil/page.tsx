'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getUser, clearSession, type LoggedUser } from '@/lib/userStorage';

export default function Perfil() {
  const router = useRouter();
  const [user, setUser] = useState<LoggedUser | null>(null);
  useEffect(() => { setUser(getUser()); }, []);

  const sair = () => { clearSession(); router.replace('/entrar'); };
  const inicial = (user?.nome || user?.email || '?').charAt(0).toUpperCase();

  return (
    <div style={{ padding: '22px 20px 20px' }}>
      <h1 className="serif" style={{ fontSize: 26, fontWeight: 700, color: '#4A2A80', margin: '0 0 18px' }}>Perfil</h1>

      <div style={{ borderRadius: 24, background: 'linear-gradient(145deg,#4A2A80,#251A38)', padding: 22, color: '#fff', position: 'relative', overflow: 'hidden', marginBottom: 18 }}>
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: 999, background: 'rgba(145,99,224,.28)', top: -90, right: -60 }} />
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{ width: 60, height: 60, borderRadius: 999, background: '#F7B733', color: '#4A3200', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22, flex: 'none' }}>{inicial}</span>
          <div style={{ minWidth: 0 }}>
            <div className="serif" style={{ fontSize: 21, fontWeight: 600 }}>{user?.nome || 'Assinante'}</div>
            <div style={{ fontSize: 12.5, color: '#D9D2F2', marginTop: 2 }}>{user?.email}</div>
          </div>
        </div>
        <div style={{ position: 'relative', marginTop: 16, display: 'inline-block', background: 'rgba(247,183,51,.22)', color: '#F7E6AE', fontSize: 11.5, fontWeight: 700, padding: '5px 11px', borderRadius: 999 }}>
          {user?.preview ? '◆ Modo teste' : '◆ Sócia Fundadora'}
        </div>
      </div>

      <button onClick={sair} style={{ width: '100%', height: 52, border: '1.5px solid #F3C7C1', background: '#FFF6F4', color: '#C0392B', borderRadius: 16, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>Sair</button>
    </div>
  );
}
