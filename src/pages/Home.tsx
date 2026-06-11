import { useNavigate } from 'react-router-dom';
import { CUTS } from '../data/presets';

export function Home() {
  const nav = useNavigate();

  return (
    <div style={s.page}>
      <header style={s.header}>
        <h1 style={s.title}>煎牛排</h1>
        <p style={s.subtitle}>选择部位开始</p>
      </header>

      <div style={s.grid}>
        {CUTS.map(cut => (
          <button
            key={cut.id}
            className="glass"
            style={s.card}
            onClick={() => nav(`/setup/${cut.id}`)}
          >
            <span style={s.cardEmoji}>{cut.emoji}</span>
            <span style={s.cardName}>{cut.name}</span>
            <span style={s.cardDesc}>{cut.description}</span>
          </button>
        ))}
      </div>

      <div style={{ height: 'calc(env(safe-area-inset-bottom) + 32px)' }} />
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100dvh',
    padding: '0 20px',
    paddingTop: 'calc(env(safe-area-inset-top) + 28px)',
  },
  header: { marginBottom: 28 },
  title: { fontSize: 34, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: -0.8 },
  subtitle: {
    fontSize: 15, color: 'rgba(235, 235, 245, 0.55)',
    margin: '4px 0 0', fontWeight: 400, letterSpacing: -0.2,
  },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  card: {
    padding: '22px 14px 18px',
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0,
    textAlign: 'left', cursor: 'pointer', border: 'none', color: '#fff',
  },
  cardEmoji: { fontSize: 32, lineHeight: 1, marginBottom: 12 },
  cardName: { fontSize: 17, fontWeight: 600, color: '#fff', letterSpacing: -0.3, marginBottom: 4 },
  cardDesc: { fontSize: 12, color: 'rgba(235, 235, 245, 0.5)', lineHeight: 1.4, fontWeight: 400 },
};
