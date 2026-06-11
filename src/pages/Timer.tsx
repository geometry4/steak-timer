import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CountdownRing } from '../components/CountdownRing';
import { playAlarm } from '../utils/audio';
import type { CookingConfig, Stage } from '../types';

const ICONS: Record<Stage['type'], string> = { cook: '🔥', flip: '↔️', baste: '🧈', rest: '⏱️' };

export function Timer() {
  const nav = useNavigate();
  const config: CookingConfig = JSON.parse(sessionStorage.getItem('cookingConfig') || 'null');

  const [stageIdx, setStageIdx] = useState(0);
  const [remaining, setRemaining] = useState(config?.stages[0]?.duration ?? 0);
  const [done, setDone] = useState(false);

  const startRef = useRef(Date.now());
  const durRef = useRef(config?.stages[0]?.duration ?? 0);
  const idxRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const finish = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    playAlarm();
    setDone(true);
  }, []);

  const advanceTo = useCallback((next: number, stages: Stage[]) => {
    if (next >= stages.length) { finish(); return; }
    idxRef.current = next;
    startRef.current = Date.now();
    durRef.current = stages[next].duration;
    setStageIdx(next);
    setRemaining(stages[next].duration);
    playAlarm();
  }, [finish]);

  const tick = useCallback((stages: Stage[]) => {
    const elapsed = (Date.now() - startRef.current) / 1000;
    const left = Math.max(0, durRef.current - elapsed);
    setRemaining(Math.ceil(left));
    if (left <= 0) advanceTo(idxRef.current + 1, stages);
  }, [advanceTo]);

  useEffect(() => {
    if (!config) { nav('/'); return; }
    const { stages } = config;
    timerRef.current = setInterval(() => tick(stages), 300);

    const onVisible = () => { if (document.visibilityState === 'visible') tick(stages); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);   // run once on mount

  if (!config) return null;

  const { stages } = config;
  const cur = stages[stageIdx];
  const next = stages[stageIdx + 1];
  const progress = cur ? 1 - remaining / cur.duration : 1;

  if (done) {
    return (
      <div style={{ ...s.page, justifyContent: 'center' }}>
        <div style={{ fontSize: 90, textAlign: 'center' }}>🎉</div>
        <h2 style={{ textAlign: 'center', fontSize: 36, margin: '16px 0 8px' }}>醒肉完成</h2>
        <p style={{ textAlign: 'center', color: '#FF8C00', fontSize: 24, margin: '0 0 16px' }}>开吃！</p>
        <p style={{ textAlign: 'center', color: '#555' }}>趁热享用你的完美牛排</p>
        <div style={{ flex: 1 }} />
        <button style={s.orangeBtn} onClick={() => nav('/')}>再来一块</button>
      </div>
    );
  }

  return (
    <div style={s.page}>
      {/* Exit */}
      <button style={s.exit} onClick={() => { if (timerRef.current) clearInterval(timerRef.current); nav('/'); }}>✕</button>

      <div style={{ flex: 1 }} />

      {/* Stage name */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 24 }}>{cur && ICONS[cur.type]}</div>
        <h2 style={{ fontSize: 32, fontWeight: 700, margin: '8px 0 4px' }}>{cur?.label}</h2>
        <p style={{ color: '#444', fontSize: 15, margin: 0 }}>
          {next ? `下一步：${next.label}` : '最后一步'}
        </p>
      </div>

      <div style={{ flex: 1 }} />

      {/* Ring */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <CountdownRing progress={progress}>
          <span style={{ fontSize: 52, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
            {fmtTime(remaining)}
          </span>
          <span style={{ color: '#444', fontSize: 13 }}>剩余</span>
        </CountdownRing>
      </div>

      <div style={{ flex: 1 }} />

      {/* Stage dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
        {stages.map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: 4,
            background: i < stageIdx ? 'rgba(255,140,0,0.4)' : i === stageIdx ? '#FF8C00' : '#222',
          }} />
        ))}
      </div>

      <div style={{ flex: 0.5 }} />

      {/* Skip */}
      <button style={s.skipBtn} onClick={() => advanceTo(stageIdx + 1, stages)}>
        跳过此阶段
      </button>

      <div style={{ height: 48 }} />
    </div>
  );
}

function fmtTime(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100dvh', background: '#000', color: '#fff',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '0 24px',
    paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
    paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)',
  },
  exit: { position: 'absolute', top: 'calc(env(safe-area-inset-top) + 16px)', right: 24, background: 'none', border: 'none', color: '#444', fontSize: 20, cursor: 'pointer' },
  orangeBtn: { width: '100%', height: 64, borderRadius: 18, border: 'none', background: '#FF8C00', color: '#000', fontSize: 20, fontWeight: 700, cursor: 'pointer' },
  skipBtn: { width: '100%', height: 52, borderRadius: 14, border: 'none', background: '#111', color: '#444', fontSize: 16, fontWeight: 600, cursor: 'pointer' },
};
