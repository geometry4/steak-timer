import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CountdownRing } from '../components/CountdownRing';
import { playAlarm } from '../utils/audio';
import type { CookingConfig, Stage } from '../types';

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
          <span style={{ fontSize: 80, lineHeight: 1, marginBottom: 16 }}>🎉</span>
          <h2 style={s.doneTitle}>醒肉完成</h2>
          <p style={s.doneSub}>趁热享用</p>
        </div>
        <button className="btn-primary" onClick={() => nav('/')}>再来一块</button>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <button
        className="glass-pill"
        style={s.exitBtn}
        onClick={() => { if (timerRef.current) clearInterval(timerRef.current); nav('/'); }}
        aria-label="退出"
      >
        ✕
      </button>

      <div style={{ flex: 0.8 }} />

      <div style={s.stageInfo}>
        <span style={s.stageIcon}>{cur && ICONS[cur.type]}</span>
        <h2 style={s.stageName}>{cur?.label}</h2>
        <p style={s.nextLabel}>
          {next ? `下一步 · ${next.label}` : '最后一步'}
        </p>
      </div>

      <div style={{ flex: 1 }} />

      <div style={s.ringWrap}>
        <CountdownRing progress={progress}>
          <span style={s.timeText}>{fmtTime(remaining)}</span>
          <span style={s.remainLabel}>剩余</span>
        </CountdownRing>
      </div>

      <div style={{ flex: 1 }} />

      <div className="glass-pill" style={s.dotsPill}>
        {stages.map((_, i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: 3,
            background: i < stageIdx
              ? 'rgba(255, 149, 0, 0.5)'
              : i === stageIdx
                ? '#FF9500'
                : 'rgba(235, 235, 245, 0.2)',
            transition: 'background 400ms',
          }} />
        ))}
      </div>

      <div style={{ height: 24 }} />

      <button className="glass-pill" style={s.skipBtn}
        onClick={() => advanceTo(stageIdx + 1, stages)}>
        跳过此阶段
      </button>

      <div style={{ height: 'calc(env(safe-area-inset-bottom) + 28px)' }} />
    </div>
  );
}

function fmtTime(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100dvh',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '0 24px',
    paddingTop: 'calc(env(safe-area-inset-top) + 20px)',
    position: 'relative',
  },
  exitBtn: {
    position: 'absolute',
    top: 'calc(env(safe-area-inset-top) + 18px)',
    right: 20,
    width: 34, height: 34,
    border: 'none',
    color: 'rgba(235, 235, 245, 0.7)',
    fontSize: 13, fontWeight: 400,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  stageInfo: { textAlign: 'center' },
  stageIcon: { fontSize: 32, lineHeight: 1 },
  stageName: { fontSize: 32, fontWeight: 600, color: '#fff', margin: '10px 0 6px', letterSpacing: -0.6 },
  nextLabel: { color: 'rgba(235, 235, 245, 0.5)', fontSize: 14, margin: 0, fontWeight: 400 },
  ringWrap: { display: 'flex', justifyContent: 'center' },
  timeText: {
    fontSize: 60, fontWeight: 300, color: '#fff',
    fontVariantNumeric: 'tabular-nums', letterSpacing: -2, lineHeight: 1,
  },
  remainLabel: { fontSize: 13, color: 'rgba(235, 235, 245, 0.45)', marginTop: 6, fontWeight: 400 },
  dotsPill: { display: 'flex', gap: 7, alignItems: 'center', padding: '8px 14px' },
  skipBtn: {
    width: 'auto', minWidth: 160,
    padding: '12px 28px', border: 'none',
    color: 'rgba(235, 235, 245, 0.7)',
    fontSize: 14, fontWeight: 500,
  },
  donePage: {
    minHeight: '100dvh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'space-between',
    padding: '80px 24px 32px',
    paddingBottom: 'calc(env(safe-area-inset-bottom) + 28px)',
  },
  doneContent: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center',
  },
  doneTitle: { fontSize: 32, fontWeight: 600, color: '#fff', margin: '8px 0 4px', letterSpacing: -0.6 },
  doneSub: { fontSize: 15, color: 'rgba(235, 235, 245, 0.5)', margin: '4px 0 0' },
};
