import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CountdownRing } from '../components/CountdownRing';
import { playAlarm } from '../utils/audio';
import { acquireWakeLock, releaseWakeLock } from '../utils/wakeLock';
import type { CookingConfig, Stage } from '../types';

const ICONS: Record<Stage['type'], string> = {
  cook: '🔥', flip: '↔️', baste: '🧈', rest: '⏱️',
};

function getAlert(endedType: Stage['type'], nextStage: Stage | undefined): string | null {
  if (endedType === 'cook')  return '🔄 翻面！';
  if (endedType === 'baste') return '🍳 起锅，准备醒肉';
  if (endedType === 'flip') {
    // Only show baste alert if the next stage is actually baste
    return nextStage?.type === 'baste' ? '🧈 开始 Baste！' : '🍳 起锅，准备醒肉';
  }
  return null;
}

export function Timer() {
  const nav = useNavigate();
  const config: CookingConfig | null = JSON.parse(
    sessionStorage.getItem('cookingConfig') || 'null'
  );

  const [stageIdx, setStageIdx]   = useState(0);
  const [remaining, setRemaining] = useState(config?.stages[0]?.duration ?? 0);
  const [done, setDone]           = useState(false);
  const [isPaused, setIsPaused]   = useState(false);
  const [alertText, setAlertText] = useState<string | null>(null);

  const startRef          = useRef(Date.now());
  const durRef            = useRef(config?.stages[0]?.duration ?? 0);
  const idxRef            = useRef(0);
  const timerRef          = useRef<ReturnType<typeof setInterval> | null>(null);
  const alertTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRemRef      = useRef(0);   // remaining seconds at the moment of pause

  const showAlert = useCallback((text: string) => {
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    setAlertText(text);
    alertTimerRef.current = setTimeout(() => setAlertText(null), 2000);
  }, []);

  const finish = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    releaseWakeLock();
    playAlarm();
    setDone(true);
  }, []);

  const advanceTo = useCallback((next: number, stages: Stage[]) => {
    if (next >= stages.length) { finish(); return; }
    const endedType = stages[idxRef.current]?.type;
    const alert = endedType ? getAlert(endedType, stages[next]) : null;
    if (alert) showAlert(alert);
    idxRef.current   = next;
    startRef.current = Date.now();
    durRef.current   = stages[next].duration;
    setStageIdx(next);
    setRemaining(stages[next].duration);
    playAlarm();
  }, [finish, showAlert]);

  const tick = useCallback((stages: Stage[]) => {
    const elapsed = (Date.now() - startRef.current) / 1000;
    const left    = Math.max(0, durRef.current - elapsed);
    setRemaining(Math.ceil(left));
    if (left <= 0) advanceTo(idxRef.current + 1, stages);
  }, [advanceTo]);

  function startInterval(stages: Stage[]) {
    timerRef.current = setInterval(() => tick(stages), 300);
  }

  useEffect(() => {
    if (!config) { nav('/'); return; }
    const { stages } = config;
    acquireWakeLock();
    startInterval(stages);
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        acquireWakeLock();
        if (!isPaused) tick(stages);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
      document.removeEventListener('visibilitychange', onVisible);
      releaseWakeLock();
    };
  }, []);

  function pause() {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    pausedRemRef.current = remaining;
    setIsPaused(true);
  }

  function resume() {
    if (!config) return;
    // Reposition startRef so elapsed = (duration - pausedRemaining)
    startRef.current = Date.now() - (durRef.current - pausedRemRef.current) * 1000;
    startInterval(config.stages);
    setIsPaused(false);
  }

  function exitTimer() {
    if (timerRef.current) clearInterval(timerRef.current);
    releaseWakeLock();
    nav('/');
  }

  if (!config) return null;
  const { stages } = config;
  const cur      = stages[stageIdx];
  const next     = stages[stageIdx + 1];
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
      <button className="glass-pill" style={s.exitBtn} onClick={exitTimer} aria-label="退出">✕</button>

      <div style={{ flex: 0.8 }} />

      <div style={s.stageInfo}>
        <span style={s.stageIcon}>{cur && ICONS[cur.type]}</span>
        <h2 style={s.stageName}>{cur?.label}</h2>
        <p style={s.nextLabel}>{next ? `下一步 · ${next.label}` : '最后一步'}</p>
      </div>

      <div style={{ flex: 1 }} />

      <div style={s.ringWrap}>
        <CountdownRing progress={progress}>
          <span style={{ ...s.timeText, opacity: isPaused ? 0.4 : 1 }}>
            {fmtTime(remaining)}
          </span>
          <span style={s.remainLabel}>{isPaused ? '已暂停' : '剩余'}</span>
        </CountdownRing>
      </div>

      <div style={{ flex: 1 }} />

      <div className="glass-pill" style={s.dotsPill}>
        {stages.map((_, i) => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: 3,
            background: i < stageIdx ? 'rgba(255,149,0,0.5)' : i === stageIdx ? '#FF9500' : 'rgba(235,235,245,0.2)',
            transition: 'background 400ms',
          }} />
        ))}
      </div>

      <div style={{ height: 20 }} />

      {/* Pause / resume */}
      <button
        className="btn-primary"
        style={s.pauseBtn}
        onClick={isPaused ? resume : pause}
      >
        {isPaused ? '▶ 继续' : '⏸ 暂停'}
      </button>

      <div style={{ height: 10 }} />

      <button className="glass-pill" style={s.skipBtn}
        onClick={() => advanceTo(stageIdx + 1, stages)}>
        跳过此阶段
      </button>

      <div style={{ height: 'calc(env(safe-area-inset-bottom) + 24px)' }} />

      {/* Stage transition alert */}
      {alertText && (
        <div style={s.alertOverlay}>
          <span style={s.alertText}>{alertText}</span>
        </div>
      )}
    </div>
  );
}

function fmtTime(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

const s: Record<string, React.CSSProperties> = {
  page: {
    height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '0 24px', paddingTop: 'calc(env(safe-area-inset-top) + 20px)',
    position: 'relative', overflow: 'hidden',
  },
  exitBtn: {
    position: 'absolute', top: 'calc(env(safe-area-inset-top) + 18px)', right: 20,
    width: 34, height: 34, border: 'none',
    color: 'rgba(235,235,245,0.7)', fontSize: 13,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  stageInfo: { textAlign: 'center' },
  stageIcon: { fontSize: 32, lineHeight: 1 },
  stageName: { fontSize: 32, fontWeight: 600, color: '#fff', margin: '10px 0 6px', letterSpacing: -0.6 },
  nextLabel: { color: 'rgba(235,235,245,0.5)', fontSize: 14, margin: 0 },
  ringWrap:  { display: 'flex', justifyContent: 'center' },
  timeText:  {
    fontSize: 60, fontWeight: 300, color: '#fff',
    fontVariantNumeric: 'tabular-nums', letterSpacing: -2, lineHeight: 1,
    transition: 'opacity 300ms',
  },
  remainLabel: { fontSize: 13, color: 'rgba(235,235,245,0.45)', marginTop: 6 },
  dotsPill:  { display: 'flex', gap: 7, alignItems: 'center', padding: '8px 14px' },
  pauseBtn:  { width: '100%', maxWidth: 280, height: 50, borderRadius: 14, fontSize: 16 },
  skipBtn:   {
    width: 'auto', minWidth: 160, padding: '10px 28px', border: 'none',
    color: 'rgba(235,235,245,0.6)', fontSize: 14, fontWeight: 500,
  },
  donePage: {
    height: '100dvh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'space-between',
    padding: '80px 24px 32px',
    paddingBottom: 'calc(env(safe-area-inset-bottom) + 28px)',
    overflow: 'hidden',
  },
  doneContent: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center',
  },
  doneTitle: { fontSize: 32, fontWeight: 600, color: '#fff', margin: '8px 0 4px', letterSpacing: -0.6 },
  doneSub:   { fontSize: 15, color: 'rgba(235,235,245,0.5)', margin: '4px 0 0' },
  alertOverlay: {
    position: 'absolute', inset: 0,
    background: 'rgba(0,0,0,0.72)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
    animation: 'alertFadeIn 200ms ease',
    zIndex: 10,
  },
  alertText: {
    fontSize: 44, fontWeight: 700, color: '#fff',
    letterSpacing: -0.8, textAlign: 'center', lineHeight: 1.2,
  },
};
