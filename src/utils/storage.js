const KEY = 'customStages_v1';
function load() {
    try {
        return JSON.parse(localStorage.getItem(KEY) || '{}');
    }
    catch {
        return {};
    }
}
function save(store) {
    try {
        localStorage.setItem(KEY, JSON.stringify(store));
    }
    catch { }
}
export function applyCustomDurations(stages, cutId, presetIdx) {
    const custom = load()[cutId]?.[presetIdx] || {};
    return stages.map(s => custom[s.type] != null ? { ...s, duration: custom[s.type] } : s);
}
export function saveStageDuration(cutId, presetIdx, type, duration) {
    const store = load();
    if (!store[cutId])
        store[cutId] = {};
    if (!store[cutId][presetIdx])
        store[cutId][presetIdx] = {};
    store[cutId][presetIdx][type] = duration;
    save(store);
}
