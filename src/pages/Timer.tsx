import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CountdownRing } from '../components/CountdownRing';
import { playAlarm } from '../utils/audio';
import { acquireWakeLock, releaseWakeLock } from '../utils/wakeLock';
import { saveHistory } from '../utils/storage';
import { saveTimerState, loadTimerState, clearTimerState } from '../utils/timerState';
import { vibrateStageChange, vibrateDone } from '../utils/vibrate';
import type { CookingConfig, Stage } from '../types';
import { DONENESS_LABELS } from '../types';

const ICONS: Record<Stage['type'], string> = {
  cook: '🔥', flip: '↔️', baste: '🧈', rest: '⏱️',
};

function getAlert(endedType: Stage['type'], nextStage: Stage | undefined): string | null {
  if (endedType === 'cook')  return '🔄 翻面！';
  if (endedType === 'baste') return '🍳 起锅，准备醒肉';
  if (endedType === 'flip')
    return nextStage?.type === 'baste' ? '🧈 开始 Baste！' : '🍳 起锅，准备醒肉';
  return null;
}

function fmtTime(sec: number) {
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}
function fmtDuration(sec: number) {
  const m = Math.floor(sec / 60), s = sec % 60;
  if (m && s) return `${m}分${s}秒`;
  if (m) return `${m}分钟`;
  return `${s}秒`;
}

export function Timer() {
  const nav = useNavigate();

  // ── Load config — prefer sessionStorage (new start), fall back to persisted state ──
  const persisted = loadTimerState();
  const config: CookingConfig | null =
    persisted?.config ??
    JSON.parse(sessionStorage.getItem('cookingConfig') || 'null');

  // Determine initial stage from persisted state
  const initIdx = persisted?.stageIdx ?? 0;
  const initDur = config?.stages[initIdx]?.duration ?? 0;

  const [stageIdx, setStageIdx]     = useState(initIdx);
  const [remaining, setRemaining]   = useState(() => {
    if (!persisted) return initDur;
    const elapsed = (Date.now() - persisted.stageStartTime) / 1000;
    return Math.max(0, initDur - Math.ceil(elapsed));
  });
  const [done, setDone]             = useState(false);
  const [isPaused, setIsPaused]     = useState(persisted?.isPaused ?? false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [alertText, setAlertText]   = useState<string | null>(null);
  const [totalCookSecs, setTotalCookSecs] = useState(0);

  const startRef       = useRef(
    persisted
      ? Date.now() - (initDur - Math.max(0, initDur - (Date.now() - persisted.stageStartTime) / 1000)) * 1000
      : Date.now()
  );
  const durRef         = useRef(initDur);
  const idxRef         = useRef(initIdx);
  const timerRef       = useRef<ReturnType<typeof setInterval> | null>(null);
  const alertTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pausedRemRef   = useRef(persisted?.isPaused ? remaining : 0);
  const cookingStartRef = useRef(persisted?.cookingStart ?? Date.now());
  const pausedTotalRef  = useRef(persisted ? persisted.pausedDuration / 1000 : 0);
  const pauseBeginRef   = useRef(persisted?.pausedAt ?? 0);
  const autosPausedForExit = useRef(false);

  const persistState = useCallback((
    idx: number, stageStart: number, pausedMs: number,
    paused: boolean, pausedAtMs: number,
  ) => {
    if (!config) return;
    saveTimerState({
      stageIdx:       idx,
      stageStartTime: stageStart,
      cookingStart:   cookingStartRef.current,
      pausedDuration: pausedMs,
      isPaused:       paused,
      pausedAt:       pausedAtMs,
      config,
    });
  }, [config]);

  const showAlert = useCallback((text: string) => {
    if (alertTimerRef.current) clearTimeout(alertTimerRef.current);
    setAlertText(text);
    alertTimerRef.current = setTimeout(() => setAlertText(null), 2000);
  }, []);

  const finish = useCallback((stages: Stage[]) => {
    if (timerRef.current) clearInterval(timerRef.current);
    releaseWakeLock();
    clearTimerState();
    playAlarm();
    vibrateDone();

    const elapsed = (Date.now() - cookingStartRef.current) / 1000;
    const actual  = Math.round(elapsed - pausedTotalRef.current);
    setTotalCookSecs(actual);

    if (config) {
      saveHistory({
        id: Date.now().toString(), date: Date.now(),
        cutName: config.cutName, thickness: config.thickness,
        doneness: config.doneness ?? 'medium-rare',
        totalSeconds: actual,
      });
    }
    setDone(true);
  }, [config]);

  const advanceTo = useCallback((next: number, stages: Stage[], playSound = true) => {
    if (next >= stages.length) { finish(stages); return; }

    const endedType = stages[idxRef.current]?.type;
    const alert = endedType ? getAlert(endedType, stages[next]) : null;
    if (alert) showAlert(alert);
    if (playSound) { playAlarm(); vibrateStageChange(); }

    idxRef.current   = next;
    startRef.current = Date.now();
    durRef.current   = stages[next].duration;
    setStageIdx(next);
    setRemaining(stages[next].duration);

    persistState(next, startRef.current, pausedTotalRef.current * 1000, false, 0);
  }, [finish, showAlert, persistState]);

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

    // If restored from a pause, don't auto-start
    if (persisted?.isPaused) {
      pausedRemRef.current = remaining;
      pauseBeginRef.current = persisted.pausedAt || Date.now();
      return;
    }

    acquireWakeLock();
    startInterval(stages);
    // Persist initial state immediately
    persistState(initIdx, startRef.current, pausedTotalRef.current * 1000, false, 0);

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        acquireWakeLock();
        tick(stages);
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
    timerRef.current      = null;
    pausedRemRef.current  = remaining;
    pauseBeginRef.current = Date.now();
    setIsPaused(true);
    persistState(idxRef.current, startRef.current, pausedTotalRef.current * 1000, true, Date.now());
  }

  function resume() {
    if (!config) return;
    pausedTotalRef.current += (Date.now() - pauseBeginRef.current) / 1000;
    startRef.current = Date.now() - (durRef.current - pausedRemRef.current) * 1000;
    startInterval(config.stages);
    setIsPaused(false);
    persistState(idxRef.current, startRef.current, pausedTotalRef.current * 1000, false, 0);

    // Re-acquire wake lock after pause
    acquireWakeLock();
  }

  function tryExit() {
    autosPausedForExit.current = !isPaused;
    if (!isPaused) pause();
    setShowExitConfirm(true);
  }
  function cancelExit() {
    setShowExitConfirm(false);
    if (autosPausedForExit.current) resume();
  }
  function confirmExit() {
    if (timerRef.current) clearInterval(timerRef.current);
    releaseWakeLock();
    clearTimerState();
    nav('/');
  }

  if (!config) return null;
  const { stages } = config;
  const cur      = stages[stageIdx];
  const next     = stages[stageIdx + 1];
  const progress = cur ? 1 - remaining / cur.duration : 1;

  // ── Done screen ──────────────────────────────────────────────────────────
  if (done) {
    return (
      <div style={s.donePage}>
        <div style={s.doneContent}>
          <span style={{ fontSize: 80, lineHeight: 1 }}>🎉</span>
          <h2 style={s.doneTitle}>醒肉完成</h2>
          <p style={s.doneSub}>趁热享用</p>
          <div className="glass-pill" style={s.doneStat}>
            <span style={s.doneStatLabel}>本次共计</span>
            <span style={s.doneStatValue}>{fmtDuration(totalCookSecs)}</span>
          </div>
          <p style={s.doneDetail}>
            {config.cutName} · {config.thickness}cm ·{' '}
            {DONENESS_LABELS[config.doneness ?? 'medium-rare']}
          </p>
        </div>
        <button className="btn-primary" onClick={() => nav('/')}>再来一块</button>
      </div>
    );
  }

  // ── Active timer ─────────────────────────────────────────────────────────
  return (
    <div style={s.page}>
      <button className="glass-pill" style={s.exitBtn} onClick={tryExit} aria-label="退出">✕</button>

      <div style={{ flex: 0.8 }} />

      <div style={s.stageInfo}>
        <span style={s.stageIcon}>{cur && ICONS[cur.type]}</span>
        <h2 style={s.stageName}>{cur?.label}</h2>
        <p style={s.nextLabel}>
          {next
            ? `下一步 · ${ICONS[next.type]} ${next.label}`
            : '最后一步 · 完成后醒肉'}
        </p>
      </div>

      <div style={{ flex: 1 }} />

      <div style={s.ringWrap}>
        <CountdownRing progress={progress}>
          <span style={{ ...s.timeText, opacity: isPaused ? 0.35 : 1 }}>
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

      <button
        className={isPaused ? 'btn-primary' : 'glass'}
        style={s.pauseBtn}
        onClick={isPaused ? resume : pause}
      >
        {isPaused ? '▶  继续' : '⏸  暂停'}
      </button>

      <div style={{ height: 10 }} />

      <button className="glass-pill" style={s.skipBtn}
        onClick={() => advanceTo(stageIdx + 1, stages, false)}>
        跳过此阶段
      </button>

      <div style={{ height: 'calc(env(safe-area-inset-bottom) + 24px)' }} />

      {alertText && (
        <div style={s.alertOverlay}>
          <span style={s.alertText}>{alertText}</span>
        </div>
      )}

      {showExitConfirm && (
        <div style={s.confirmBackdrop}>
          <div className="glass" style={s.confirmBox}>
            <p style={s.confirmTitle}>退出计时？</p>
            <p style={s.confirmSub}>当前进度不会保存</p>
            <div style={s.confirmBtns}>
              <button className="glass-pill" style={s.confirmCancelBtn} onClick={cancelExit}>继续计时</button>
              <button className="glass-pill" style={s.confirmExitBtn} onClick={confirmExit}>退出</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '0 24px', paddingTop: 'calc(env(safe-area-inset-top) + 20px)',
    position: 'relative', overflow: 'hidden',
  },
  exitBtn: {
    position: 'absolute', top: 'calc(env(safe-area-inset-top) + 18px)', right: 20,
    width: 34, height: 34, border: 'none', color: 'rgba(235,235,245,0.6)', fontSize: 13,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  stageInfo:   { textAlign: 'center' },
  stageIcon:   { fontSize: 32, lineHeight: 1 },
  stageName:   { fontSize: 32, fontWeight: 600, color: '#fff', margin: '10px 0 6px', letterSpacing: -0.6 },
  nextLabel:   { color: 'rgba(235,235,245,0.5)', fontSize: 14, margin: 0 },
  ringWrap:    { display: 'flex', justifyContent: 'center' },
  timeText:    { fontSize: 60, fontWeight: 300, color: '#fff', fontVariantNumeric: 'tabular-nums', letterSpacing: -2, lineHeight: 1, transition: 'opacity 300ms' },
  remainLabel: { fontSize: 13, color: 'rgba(235,235,245,0.45)', marginTop: 6 },
  dotsPill:    { display: 'flex', gap: 7, alignItems: 'center', padding: '8px 14px' },
  pauseBtn:    { width: '100%', maxWidth: 280, height: 50, borderRadius: 14, border: 'none', fontSize: 16, fontWeight: 600, color: '#fff' },
  skipBtn:     { width: 'auto', minWidth: 160, padding: '10px 28px', border: 'none', color: 'rgba(235,235,245,0.55)', fontSize: 14, fontWeight: 500 },
  donePage:    { height: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '80px 24px 32px', paddingBottom: 'calc(env(safe-area-inset-bottom) + 28px)', overflow: 'hidden' },
  doneContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' },
  doneTitle:   { fontSize: 32, fontWeight: 600, color: '#fff', margin: '12px 0 4px', letterSpacing: -0.6 },
  doneSub:     { fontSize: 15, color: 'rgba(235,235,245,0.5)', margin: 0 },
  doneStat:    { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 24px', marginTop: 8 },
  doneStatLabel: { fontSize: 11, color: 'rgba(235,235,245,0.45)', letterSpacing: 0.5 },
  doneStatValue: { fontSize: 22, fontWeight: 600, color: '#fff', marginTop: 2, letterSpacing: -0.3 },
  doneDetail:  { fontSize: 12, color: 'rgba(235,235,245,0.35)', margin: '4px 0 0' },
  alertOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', animation: 'alertFadeIn 200ms ease', zIndex: 10, pointerEvents: 'none' },
  alertText:   { fontSize: 44, fontWeight: 700, color: '#fff', letterSpacing: -0.8, textAlign: 'center', lineHeight: 1.2 },
  confirmBackdrop: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 20, padding: '0 32px' },
  confirmBox:       { padding: '28px 24px', borderRadius: 24, width: '100%' },
  confirmTitle:     { fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 6px', textAlign: 'center', letterSpacing: -0.4 },
  confirmSub:       { fontSize: 14, color: 'rgba(235,235,245,0.5)', margin: '0 0 24px', textAlign: 'center' },
  confirmBtns:      { display: 'flex', gap: 10 },
  confirmCancelBtn: { flex: 1, height: 50, border: 'none', fontSize: 15, fontWeight: 600, color: '#fff' },
  confirmExitBtn:   { flex: 1, height: 50, border: 'none', fontSize: 15, fontWeight: 600, color: '#ff453a' },
};
