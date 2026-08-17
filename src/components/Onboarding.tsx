'use client';

import { useEffect, useState } from 'react';
import { ativarNotificacoes } from '@/lib/push';

const KEY = 'clube_onboarding_v1';

interface Step { emoji: string; titulo: string; texto: string; notif?: boolean; }

const STEPS: Step[] = [
  { emoji: '💜', titulo: 'Seja bem-vinda!', texto: 'Você entrou no Clube da Dra. Rô — seu espaço de recursos terapêuticos, com novidade toda semana e uma comunidade que cresce junto com você.' },
  { emoji: '🔔', titulo: 'Ative as notificações', texto: 'Assim você é avisada quando cai material novo, abre uma enquete ou tem encontro. Prometo não encher — só o que importa 💜', notif: true },
  { emoji: '📲', titulo: 'Instale o app na tela inicial', texto: 'No iPhone: toque em Compartilhar → "Adicionar à Tela de Início". No Android, aparece "Instalar app". Aí o Clube vira um app de verdade (e as notificações funcionam certinho).' },
  { emoji: '🗂️', titulo: 'Um recurso novo toda semana', texto: 'Cada mês tem um tema, e toda semana chega um material pronto pra usar na sua próxima sessão. Sua biblioteca só cresce e fica salva pra sempre.' },
  { emoji: '🗳️', titulo: 'Você escolhe os temas', texto: 'Todo mês tem enquete pra você votar no tema. E não se preocupe: se o seu não ganhar dessa vez, ele entra na fila e sai nas próximas — a gente faz questão de contemplar todo mundo com o tempo.' },
  { emoji: '✨', titulo: 'Inspiração todo dia', texto: 'Além dos materiais, você recebe uma inspiração diária e tem acesso à nossa comunidade no WhatsApp. Bora explorar seu clube?' },
];

export default function Onboarding() {
  const [show, setShow] = useState(false);
  const [i, setI] = useState(0);
  const [ativando, setAtivando] = useState(false);

  useEffect(() => { if (!localStorage.getItem(KEY)) setShow(true); }, []);

  const finish = () => { localStorage.setItem(KEY, '1'); setShow(false); };
  const next = () => { if (i < STEPS.length - 1) setI(i + 1); else finish(); };
  const ativar = async () => { setAtivando(true); await ativarNotificacoes(); setAtivando(false); next(); };

  if (!show) return null;
  const step = STEPS[i];
  const last = i === STEPS.length - 1;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'linear-gradient(180deg,#F0E8FB 0%,#F7F4FC 60%)', display: 'flex', flexDirection: 'column', padding: '0 28px', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ width: 96, height: 96, borderRadius: 30, background: 'linear-gradient(150deg,#6C3FB0,#4A2A80)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 44, boxShadow: '0 16px 36px rgba(74,42,128,.3)' }}>{step.emoji}</div>
        <h1 className="serif" style={{ fontSize: 30, fontWeight: 700, color: '#4A2A80', margin: '26px 0 0', letterSpacing: '-.4px' }}>{step.titulo}</h1>
        <p style={{ fontSize: 15.5, lineHeight: 1.6, color: '#5A5470', margin: '14px 0 0', maxWidth: 320 }}>{step.texto}</p>
      </div>

      <div style={{ paddingBottom: 30 }}>
        <div style={{ display: 'flex', gap: 7, justifyContent: 'center', marginBottom: 18 }}>
          {STEPS.map((_, k) => (
            <span key={k} style={{ width: k === i ? 22 : 6, height: 6, borderRadius: 3, background: k === i ? '#6C3FB0' : '#DCD2EC', transition: 'all .2s' }} />
          ))}
        </div>

        {step.notif ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={ativar} disabled={ativando} style={{ height: 54, border: 'none', borderRadius: 16, background: '#6C3FB0', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', opacity: ativando ? 0.6 : 1 }}>{ativando ? 'Ativando…' : 'Ativar notificações'}</button>
            <button onClick={next} style={{ height: 44, border: 'none', background: 'none', color: '#7C7090', fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>Agora não</button>
          </div>
        ) : (
          <button onClick={next} style={{ width: '100%', height: 54, border: 'none', borderRadius: 16, background: last ? '#C79A2E' : '#6C3FB0', color: '#fff', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: last ? '0 12px 26px rgba(199,154,46,.32)' : 'none' }}>{last ? 'Explorar meu clube' : 'Continuar'}</button>
        )}
        {!last && !step.notif && (
          <button onClick={finish} style={{ display: 'block', margin: '12px auto 0', border: 'none', background: 'none', color: '#9B95AC', fontSize: 13, cursor: 'pointer' }}>Pular</button>
        )}
      </div>
    </div>
  );
}
