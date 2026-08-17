export default function Home() {
  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 28, textAlign: 'center', background: 'linear-gradient(180deg,#F0E8FB 0%,#F7F4FC 60%)' }}>
      <div style={{ width: 92, height: 92, borderRadius: 28, background: 'linear-gradient(150deg,#6C3FB0,#4A2A80)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 16px 36px rgba(74,42,128,.3)' }}>
        <span className="serif" style={{ color: '#F8EFD6', fontSize: 40, fontWeight: 600 }}>Rô</span>
      </div>
      <h1 className="serif" style={{ fontSize: 34, fontWeight: 700, color: '#4A2A80', margin: '24px 0 0', letterSpacing: '-.5px' }}>Clube da Dra. Rô</h1>
      <p style={{ fontSize: 16, color: '#7C7090', margin: '12px 0 0', maxWidth: 320, lineHeight: 1.5 }}>
        Recursos terapêuticos toda semana, inspirações diárias e uma biblioteca clínica que só cresce.
      </p>
      <span style={{ marginTop: 22, background: '#fff', borderRadius: 999, padding: '9px 16px', fontSize: 13.5, fontWeight: 600, color: '#6C3FB0', boxShadow: '0 6px 18px rgba(108,63,176,.1)' }}>
        Em breve · 7 dias grátis 💜
      </span>
    </main>
  );
}
