import type { CookingConfig } from '../types';

export interface PersistedTimer {
  stageIdx:        number;
  stageStartTime:  number;   // Date.now() when current stage began
  cookingStart:    number;   // Date.now() when cooking began (for total time)
  pausedDuration:  number;   // total ms spent paused so far
  isPaused:        boolean;
  pausedAt:        number;   // Date.now() when current pause started (0 if not paused)
  config:          CookingConfig;
}

const KEY = 'activeTimer_v1';

export function saveTimerState(state: PersistedTimer) {
  try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch {}
}

export function loadTimerState(): PersistedTimer | null {
  try { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); }
  catch { return null; }
}

export function clearTimerState() {
  try { sessionStorage.removeItem(KEY); } catch {}
}
