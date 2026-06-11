import type { Stage } from '../types';

// Custom durations keyed by: cutId → presetIdx → stageType → seconds
// Using stageType (not stage.id) because preset IDs regenerate each page load.
type Store = Record<string, Record<number, Partial<Record<Stage['type'], number>>>>;

const KEY = 'customStages_v1';

function load(): Store {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
  catch { return {}; }
}

function save(store: Store) {
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch {}
}

export function applyCustomDurations(stages: Stage[], cutId: string, presetIdx: number): Stage[] {
  const custom = load()[cutId]?.[presetIdx] || {};
  return stages.map(s =>
    custom[s.type] != null ? { ...s, duration: custom[s.type]! } : s
  );
}

export function saveStageDuration(
  cutId: string, presetIdx: number, type: Stage['type'], duration: number,
) {
  const store = load();
  if (!store[cutId]) store[cutId] = {};
  if (!store[cutId][presetIdx]) store[cutId][presetIdx] = {};
  store[cutId][presetIdx][type] = duration;
  save(store);
}
