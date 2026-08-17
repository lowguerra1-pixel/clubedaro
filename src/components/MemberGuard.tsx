'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isLoggedIn } from '@/lib/userStorage';

export default function MemberGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);
  useEffect(() => {
    if (isLoggedIn()) setOk(true);
    else router.replace('/entrar');
  }, [router]);
  if (!ok) {
    return <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7C7090', fontSize: 14 }}>Carregando sua biblioteca…</div>;
  }
  return <>{children}</>;
}
