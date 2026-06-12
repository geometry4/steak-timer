import { useNavigate } from 'react-router-dom';
import { CUTS } from '../data/presets';
import { loadHistory } from '../utils/storage';
import { DONENESS_LABELS } from '../types';

export function Home() {
  const nav = useNavigate();
  const history = loadHistory().slice(0, 3);

  function relativeTime(ts: number): string {
    const diff = (Date.now() - ts) / 1000;
    if (diff < 60)    return '刚刚';
    if (diff < 3600)  return `${Math.floor(diff / 60)} 分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} 小时前`;
    return `${Math.floor(diff / 86400)} 天前`;
  }

  function fmtDuration(sec: number) {
    const m = Math.floor(sec / 60), s = sec % 60;
    if (m && s) return `${m}分${s}秒`;
    if (m) return `${m}分钟`;
    return `${s}秒`;
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <h1 style={s.title}>煎牛排</h1>
        <p style={s.subtitle}>选择部位开始</p>
      </header>

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
            <span style={s.cardDesc}>{cut.description}</span>
          </button>
        ))}
      </div>

      {/* Recent history */}
      {history.length > 0 && (
        <div style={s.historySection}>
          <p className="sec-label" style={{ marginBottom: 8 }}>最近记录</p>
          <div style={s.historyList}>
            {history.map(entry => (
              <div key={entry.id} className="glass-pill" style={s.historyItem}>
                <span style={s.historyName}>{entry.cutName}</span>
                <span style={s.historyMeta}>
                  {entry.thickness}cm · {DONENESS_LABELS[entry.doneness]}
                </span>
                <span style={s.historyDuration}>{fmtDuration(entry.totalSeconds)}</span>
                <span style={s.historyTime}>{relativeTime(entry.date)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    height: '100dvh', display: 'flex', flexDirection: 'column',
    padding: '0 20px', paddingTop: 'calc(env(safe-area-inset-top) + 24px)',
    paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
    overflow: 'hidden',
  },
  header:   { marginBottom: 18, flexShrink: 0 },
  title:    { fontSize: 34, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: -0.8 },
  subtitle: { fontSize: 15, color: 'rgba(235,235,245,0.55)', margin: '4px 0 0', fontWeight: 400, letterSpacing: -0.2 },
  grid: {
    flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr',
    gridAutoRows: '1fr', gap: 10, minHeight: 0,
  },
  card: {
    padding: '16px 12px 14px', display: 'flex', flexDirection: 'column',
    alignItems: 'flex-start', textAlign: 'left', cursor: 'pointer', border: 'none', color: '#fff',
    minHeight: 0,
  },
  cardEmoji: { fontSize: 28, lineHeight: 1, marginBottom: 8 },
  cardName:  { fontSize: 17, fontWeight: 600, color: '#fff', letterSpacing: -0.3, marginBottom: 4 },
  cardDesc:  { fontSize: 12, color: 'rgba(235,235,245,0.5)', lineHeight: 1.4, fontWeight: 400 },

  historySection: { flexShrink: 0, marginTop: 14 },
  historyList:    { display: 'flex', flexDirection: 'column', gap: 6 },
  historyItem: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 14px', borderRadius: 10,
  },
  historyName:     { fontSize: 13, fontWeight: 600, color: '#fff', minWidth: 32 },
  historyMeta:     { fontSize: 12, color: 'rgba(235,235,245,0.5)', flex: 1 },
  historyDuration: { fontSize: 12, fontWeight: 600, color: '#FF9500' },
  historyTime:     { fontSize: 11, color: 'rgba(235,235,245,0.3)', minWidth: 44, textAlign: 'right' },
};
