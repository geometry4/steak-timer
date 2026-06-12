import type { Doneness, HistoryEntry, Stage } from '../types';

// ── History ───────────────────────────────────────────────────────────────────

const HISTORY_KEY = 'cookingHistory_v1';
const MAX_HISTORY = 20;

export function loadHistory(): HistoryEntry[] {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]'); }
  catch { return []; }
}

export function saveHistory(entry: HistoryEntry) {
  const list = loadHistory();
  list.unshift(entry);
  if (list.length > MAX_HISTORY) list.length = MAX_HISTORY;
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(list)); } catch {}
}

// Custom durations keyed by: cutId → "${thickness}_${doneness}" → stageType → seconds
type Store = Record<string, Record<string, Partial<Record<Stage['type'], number>>>>;

const KEY = 'customStages_v3';

function load(): Store {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
  catch { return {}; }
}

function save(store: Store) {
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch {}
}

function slotKey(thickness: number, doneness: Doneness) {
  return `${thickness}_${doneness}`;
}

export function applyCustomDurations(
  stages: Stage[], cutId: string, thickness: number, doneness: Doneness,
): Stage[] {
  const custom = load()[cutId]?.[slotKey(thickness, doneness)] || {};
  return stages.map(s =>
    custom[s.type] != null ? { ...s, duration: custom[s.type]! } : s
  );
}

export function saveStageDuration(
  cutId: string, thickness: number, doneness: Doneness,
  type: Stage['type'], duration: number,
) {
  const store = load();
  if (!store[cutId]) store[cutId] = {};
  const k = slotKey(thickness, doneness);
  if (!store[cutId][k]) store[cutId][k] = {};
  store[cutId][k][type] = duration;
  save(store);
}
