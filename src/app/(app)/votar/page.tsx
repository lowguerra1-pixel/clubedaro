'use client';

export default function Votar() {
  return (
    <div style={{ padding: '22px 20px 20px' }}>
      <h1 className="serif" style={{ fontSize: 26, fontWeight: 700, color: '#4A2A80', margin: '0 0 4px' }}>Votar</h1>
      <p style={{ fontSize: 13.5, color: '#7C7090', margin: '0 0 20px' }}>Você escolhe o tema do próximo mês.</p>
      <div style={{ background: '#fff', border: '1px solid #ECE7F1', borderRadius: 18, padding: 28, textAlign: 'center', color: '#7C7090', fontSize: 14, lineHeight: 1.6 }}>
        🗳️ As enquetes chegam já já. Em breve você vota aqui no tema de cada mês.
      </div>
    </div>
  );
}
