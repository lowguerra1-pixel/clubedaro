import MemberGuard from '@/components/MemberGuard';
import BottomNav from '@/components/BottomNav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <MemberGuard>
      <div style={{ maxWidth: 480, margin: '0 auto', minHeight: '100dvh', background: '#F7F4FC', paddingBottom: 84, position: 'relative' }}>
        {children}
        <BottomNav />
      </div>
    </MemberGuard>
  );
}
