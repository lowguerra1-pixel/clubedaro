'use client';

import { useEffect, useState } from 'react';
import { ativarNotificacoes, notifState } from '@/lib/push';

const KEY = 'clube_push_dismiss';

export default function AtivarPush() {
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'erro'>('idle');

  useEffect(() => {
    if (notifState() === 'default' && !localStorage.getItem(KEY)) setShow(true);
  }, []);

  const ativar = async () => {
    setStatus('loading');
    const r = await ativarNotificacoes();
    if (r === 'ok') { setStatus('ok'); setTimeout(() => setShow(false), 2200); }
    else if (r === 'negado' || r === 'indisponivel') { localStorage.setItem(KEY, '1'); setShow(false); }
    else setStatus('erro');
  };
  const dismiss = () => { localStorage.setItem(KEY, '1'); setShow(false); };

  if (!show) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#FEF6E6', border: '1px solid #F7DCA4', borderRadius: 16, padding: '12px 14px', marginBottom: 16 }}>
      <span style={{ fontSize: 20 }}>🔔</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        {status === 'ok'
          ? <div style={{ fontSize: 13, fontWeight: 700, color: '#1F7A50' }}>Notificações ativadas! ✓</div>
          : <>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#8A6716' }}>Ativar notificações</div>
              <div style={{ fontSize: 11.5, color: '#A98B4A' }}>Avisos de material novo, enquetes e encontros.</div>
            </>}
      </div>
      {status !== 'ok' && (
        <>
          <button onClick={ativar} disabled={status === 'loading'} style={{ border: 'none', background: '#6C3FB0', color: '#fff', fontSize: 12.5, fontWeight: 700, padding: '8px 13px', borderRadius: 11, cursor: 'pointer' }}>{status === 'loading' ? '...' : 'Ativar'}</button>
          <button onClick={dismiss} style={{ border: 'none', background: 'none', color: '#A98B4A', fontSize: 16, cursor: 'pointer', padding: 4 }}>×</button>
        </>
      )}
    </div>
  );
}
