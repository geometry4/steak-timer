import { useNavigate } from 'react-router-dom';
import { CUTS } from '../data/presets';
import '../index.css';

export function Home() {
  const nav = useNavigate();

  return (
    <div style={s.page}>
      {/* Glass top bar */}
      <header className="glass" style={s.topbar}>
        <span style={s.topbarEmoji}>🥩</span>
        <span style={s.topbarTitle}>煎牛排</span>
      </header>

      {/* Hero */}
      <div style={s.hero}>
        <p style={s.heroSub}>选择你的部位，开始精准计时</p>
      </div>

      {/* Cut grid */}
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
            <span style={s.cardEn}>{cut.nameEn}</span>
            <span style={s.cardDesc}>{cut.description}</span>
          </button>
        ))}
      </div>

      <div style={{ height: 'calc(env(safe-area-inset-bottom) + 24px)' }} />
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100dvh',
    display: 'flex', flexDirection: 'column',
    padding: '0 16px',
    paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
  },
  topbar: {
    borderRadius: 16,
    padding: '12px 18px',
    display: 'flex', alignItems: 'center', gap: 10,
    marginBottom: 24,
    flexShrink: 0,
  },
  topbarEmoji: { fontSize: 24 },
  topbarTitle: { fontSize: 18, fontWeight: 700, color: '#f5f0eb' },
  hero: { marginBottom: 20 },
  heroSub: { margin: 0, fontSize: 14, color: 'rgba(245,240,235,0.45)', fontWeight: 500 },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  card: {
    border: 'none',
    borderRadius: 18,
    padding: '16px 12px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    cursor: 'pointer', textAlign: 'center',
    transition: 'transform 120ms',
  },
  cardEmoji: { fontSize: 44, marginBottom: 6 },
  cardName: { fontSize: 16, fontWeight: 700, color: '#f5f0eb' },
  cardEn: { fontSize: 11, color: 'rgba(245,240,235,0.4)', fontWeight: 500 },
  cardDesc: { fontSize: 11, color: 'rgba(245,240,235,0.35)', marginTop: 4, lineHeight: 1.4 },
};
