import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CountdownRing } from '../components/CountdownRing';
import { playAlarm } from '../utils/audio';
import type { CookingConfig, Stage } from '../types';
import '../index.css';

const ICONS: Record<Stage['type'], string> = {
  cook: '🔥', flip: '↔️', baste: '🧈', rest: '⏱️',
};

export function Timer() {
  const nav = useNavigate();
  const config: CookingConfig | null = JSON.parse(
    sessionStorage.getItem('cookingConfig') || 'null'
  );

  const [stageIdx, setStageIdx] = useState(0);
  const [remaining, setRemaining] = useState(config?.stages[0]?.duration ?? 0);
  const [done, setDone] = useState(false);

  const startRef   = useRef(Date.now());
  const durRef     = useRef(config?.stages[0]?.duration ?? 0);
  const idxRef     = useRef(0);
  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);

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
  }, []);

  if (!config) return null;

  const { stages } = config;
  const cur  = stages[stageIdx];
  const next = stages[stageIdx + 1];
  const progress = cur ? 1 - remaining / cur.duration : 1;

  if (done) {
    return (
      <div style={s.donePage}>
        <div style={s.doneContent}>
          <span style={{ fontSize: 88 }}>🎉</span>
          <h2 style={s.doneTitle}>醒肉完成</h2>
          <p style={s.doneOrange}>开吃！</p>
          <p style={s.doneSub}>趁热享用你的完美牛排</p>
        </div>
        <div style={s.doneFooter}>
          <button className="btn-primary" onClick={() => nav('/')}>再来一块</button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      {/* Glass exit button */}
      <button
        className="glass-light"
        style={s.exitBtn}
        onClick={() => { if (timerRef.current) clearInterval(timerRef.current); nav('/'); }}
      >
        ✕
      </button>

      <div style={{ flex: 1 }} />

      {/* Stage name — clear content, no glass */}
      <div style={s.stageInfo}>
        <span style={s.stageIcon}>{cur && ICONS[cur.type]}</span>
        <h2 style={s.stageName}>{cur?.label}</h2>
        <p style={s.nextLabel}>
          {next ? `下一步：${ICONS[next.type]} ${next.label}` : '最后一步'}
        </p>
      </div>

      <div style={{ flex: 1 }} />

      {/* Countdown ring — primary content, always clear */}
      <div style={s.ringWrap}>
        <CountdownRing progress={progress}>
          <span style={s.timeText}>{fmtTime(remaining)}</span>
          <span style={s.remainLabel}>剩余</span>
        </CountdownRing>
      </div>

      <div style={{ flex: 1 }} />

      {/* Stage dots — small glass pill */}
      <div className="glass-light" style={s.dotsPill}>
        {stages.map((_, i) => (
          <div key={i} style={{
            width: 7, height: 7, borderRadius: 4,
            background: i < stageIdx
              ? 'rgba(255,140,0,0.4)'
              : i === stageIdx
                ? '#FF8C00'
                : 'rgba(255,255,255,0.18)',
            transition: 'background 400ms',
          }} />
        ))}
      </div>

      <div style={{ flex: 0.5 }} />

      {/* Skip — glass button */}
      <button className="glass" style={s.skipBtn}
        onClick={() => advanceTo(stageIdx + 1, stages)}>
        跳过此阶段
      </button>

      <div style={{ height: 'calc(env(safe-area-inset-bottom) + 40px)' }} />
    </div>
  );
}

function fmtTime(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100dvh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', padding: '0 24px',
    paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
  },
  exitBtn: {
    position: 'absolute',
    top: 'calc(env(safe-area-inset-top) + 16px)',
    right: 24,
    width: 36, height: 36, borderRadius: 18,
    border: 'none', color: 'rgba(245,240,235,0.45)',
    fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  stageInfo: { textAlign: 'center' },
  stageIcon: { fontSize: 32 },
  stageName: {
    fontSize: 34, fontWeight: 700, color: '#f5f0eb',
    margin: '6px 0 4px', letterSpacing: -0.5,
  },
  nextLabel: { color: 'rgba(245,240,235,0.4)', fontSize: 15, margin: 0 },
  ringWrap: { display: 'flex', justifyContent: 'center' },
  timeText: {
    fontSize: 56, fontWeight: 700, color: '#f5f0eb',
    fontVariantNumeric: 'tabular-nums', letterSpacing: -1,
  },
  remainLabel: { fontSize: 13, color: 'rgba(245,240,235,0.38)', marginTop: 2 },
  dotsPill: {
    display: 'flex', gap: 7, alignItems: 'center',
    padding: '8px 16px', borderRadius: 999,
  },
  skipBtn: {
    width: '100%', maxWidth: 320, height: 50,
    borderRadius: 14,
    color: 'rgba(245,240,235,0.5)', fontSize: 15, fontWeight: 600,
    border: 'none',
  },
  donePage: {
    minHeight: '100dvh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'space-between',
    padding: '60px 24px',
    paddingBottom: 'calc(env(safe-area-inset-bottom) + 32px)',
  },
  doneContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  doneTitle: { fontSize: 36, fontWeight: 700, color: '#f5f0eb', margin: 0 },
  doneOrange: { fontSize: 26, fontWeight: 600, color: '#FF8C00', margin: 0 },
  doneSub: { fontSize: 15, color: 'rgba(245,240,235,0.4)', margin: 0 },
  doneFooter: { width: '100%' },
};
