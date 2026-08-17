'use client';

const FRASES: [string, string][] = [
  ['A arte não reproduz o visível; ela torna visível.', 'Paul Klee'],
  ['Quem olha para fora, sonha. Quem olha para dentro, desperta.', 'Carl Jung'],
  ['O corpo guarda o que a mente não consegue dizer.', 'Bessel van der Kolk'],
  ['A criatividade exige coragem de soltar as certezas.', 'Erich Fromm'],
  ['Ao tocar uma alma humana, seja apenas outra alma humana.', 'Carl Jung'],
  ['Onde há criação, há espaço para a cura.', 'Dra. Rô'],
  ['A imagem chega onde a palavra ainda não alcança.', 'Dra. Rô'],
  ['Cuidar de quem cuida também é parte do trabalho.', 'Dra. Rô'],
  ['Toda emoção quer, antes de tudo, ser vista.', 'Dra. Rô'],
  ['O gesto criativo é um respiro para o sistema nervoso.', 'Dra. Rô'],
  ['Não existe jeito errado de sentir — existe jeito de acolher.', 'Dra. Rô'],
  ['A cor diz o que a boca cala.', 'Dra. Rô'],
  ['Pequenos rituais criam grandes seguranças.', 'Dra. Rô'],
  ['A presença é a técnica mais poderosa que você tem.', 'Dra. Rô'],
];

export default function InspiracaoDia() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dia = Math.floor((now.getTime() - start.getTime()) / 86400000);
  const [frase, autor] = FRASES[dia % FRASES.length];

  return (
    <div style={{ background: '#fff', borderRadius: 22, padding: 20, boxShadow: '0 8px 24px rgba(108,63,176,.08)', marginBottom: 26 }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: '#9163E0' }}>Inspiração do dia</div>
      <p className="serif" style={{ fontSize: 20, lineHeight: 1.35, color: '#251A38', margin: '10px 0 0', fontStyle: 'italic' }}>“{frase}”</p>
      <div style={{ fontSize: 13, color: '#7C7090', marginTop: 8, fontWeight: 600 }}>— {autor}</div>
    </div>
  );
}
