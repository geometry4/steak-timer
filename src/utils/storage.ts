import type { Stage } from '../types';

// Custom durations keyed by: cutId → thicknessValue → stageType → seconds
// Keying by thickness value (not index) so the storage stays valid when we
// add/remove preset thicknesses in the future.
type Store = Record<string, Record<string, Partial<Record<Stage['type'], number>>>>;

const KEY = 'customStages_v2';

function load(): Store {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
  catch { return {}; }
}

function save(store: Store) {
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch {}
}

export function applyCustomDurations(stages: Stage[], cutId: string, thickness: number): Stage[] {
  const custom = load()[cutId]?.[String(thickness)] || {};
  return stages.map(s =>
    custom[s.type] != null ? { ...s, duration: custom[s.type]! } : s
  );
}

export function saveStageDuration(
  cutId: string, thickness: number, type: Stage['type'], duration: number,
) {
  const store = load();
  if (!store[cutId]) store[cutId] = {};
  const key = String(thickness);
  if (!store[cutId][key]) store[cutId][key] = {};
  store[cutId][key][type] = duration;
  save(store);
}
