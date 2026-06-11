import { useNavigate } from 'react-router-dom';
import { CUTS } from '../data/presets';

export function Home() {
  const nav = useNavigate();
  return (
    <div style={s.page}>
      <div style={s.hero}>
        <span style={{ fontSize: 80 }}>🥩</span>
        <h1 style={s.title}>煎牛排</h1>
        <p style={s.sub}>精准计时，每次完美</p>
      </div>

      <div style={s.grid}>
        {CUTS.map(cut => (
          <button key={cut.id} style={s.card} onClick={() => nav(`/setup/${cut.id}`)}>
            <span style={{ fontSize: 44 }}>{cut.emoji}</span>
            <span style={s.cardName}>{cut.name}</span>
            <span style={s.cardEn}>{cut.nameEn}</span>
            <span style={s.cardDesc}>{cut.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100dvh', background: '#000', color: '#fff',
    display: 'flex', flexDirection: 'column',
    padding: '0 16px',
    paddingTop: 'calc(env(safe-area-inset-top) + 32px)',
    paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)',
  },
  hero: { textAlign: 'center', padding: '24px 0 32px' },
  title: { fontSize: 42, fontWeight: 700, margin: '8px 0 4px' },
  sub: { color: '#555', fontSize: 16, margin: 0 },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  card: {
    background: '#111', border: 'none', borderRadius: 16,
    padding: '14px 10px', cursor: 'pointer', color: '#fff',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    WebkitTapHighlightColor: 'transparent',
  },
  cardName: { fontSize: 17, fontWeight: 600 },
  cardEn: { fontSize: 12, color: '#555' },
  cardDesc: { fontSize: 11, color: '#444', textAlign: 'center', marginTop: 4, lineHeight: 1.4 },
};
