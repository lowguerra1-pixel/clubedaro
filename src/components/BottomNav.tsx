'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ON = '#6C3FB0', OFF = '#A99CBE';

const items = [
  { href: '/home', label: 'Início', icon: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 10.5L12 4l8 6.5V20H4z" /><path d="M9.5 20v-5.5h5V20" /></svg> },
  { href: '/biblioteca', label: 'Biblioteca', icon: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="4" width="6" height="16" rx="1.6" /><rect x="12" y="4" width="6" height="16" rx="1.6" /><path d="M20.5 6.5l1.2 12" /></svg> },
  { href: '/votar', label: 'Votar', icon: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 20V11M12 20V5M19 20v-6" /></svg> },
  { href: '/perfil', label: 'Perfil', icon: (c: string) => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20c0-4 3.4-6.5 7.5-6.5S19.5 16 19.5 20" /></svg> },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav style={{ position: 'fixed', left: '50%', transform: 'translateX(-50%)', bottom: 0, width: '100%', maxWidth: 480, background: 'rgba(255,255,255,.96)', backdropFilter: 'blur(12px)', borderTop: '1px solid #EFEAF7', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', padding: '9px 8px 22px', zIndex: 40 }}>
      {items.map(it => {
        const active = pathname === it.href;
        const c = active ? ON : OFF;
        return (
          <Link key={it.href} href={it.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, textDecoration: 'none' }}>
            {it.icon(c)}
            <span style={{ fontSize: 10.5, fontWeight: active ? 800 : 600, color: c }}>{it.label}</span>
            <span style={{ width: 18, height: 3, borderRadius: 3, background: active ? ON : 'transparent' }} />
          </Link>
        );
      })}
    </nav>
  );
}
