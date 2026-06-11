import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCut } from '../data/presets';
import { initAudio } from '../utils/audio';
import { applyCustomDurations, saveStageDuration } from '../utils/storage';
const ICONS = {
    cook: '🔥', flip: '↔️', baste: '🧈', rest: '⏱️',
};
export function Setup() {
    const { cutId } = useParams();
    const nav = useNavigate();
    const cut = getCut(cutId);
    const [presetIdx, setPresetIdx] = useState(0);
    const [stages, setStages] = useState(() => applyCustomDurations(JSON.parse(JSON.stringify(cut.presets[0].stages)), cut.id, cut.presets[0].thickness));
    const [useBaste, setUseBaste] = useState(true);
    const [editIdx, setEditIdx] = useState(null);
    const [picMin, setPicMin] = useState(0);
    const [picSec, setPicSec] = useState(0);
    const segRef = useRef(null);
    const indRef = useRef(null);
    function moveIndicator(idx, animate) {
        const seg = segRef.current, ind = indRef.current;
        if (!seg || !ind)
            return;
        const btns = seg.querySelectorAll('button');
        const btn = btns[idx];
        if (!btn)
            return;
        const cr = seg.getBoundingClientRect();
        const br = btn.getBoundingClientRect();
        const x = br.left - cr.left;
        const w = br.width;
        if (!animate) {
            ind.style.transition = 'none';
            ind.style.setProperty('--ind-x', `${x}px`);
            ind.style.setProperty('--ind-w', `${w}px`);
            ind.style.setProperty('--ind-scale', '1');
            requestAnimationFrame(() => { ind.style.transition = ''; });
        }
        else {
            ind.style.setProperty('--ind-x', `${x}px`);
            ind.style.setProperty('--ind-w', `${w}px`);
            ind.style.setProperty('--ind-scale', '1.18');
            setTimeout(() => ind.style.setProperty('--ind-scale', '0.96'), 280);
            setTimeout(() => ind.style.setProperty('--ind-scale', '1'), 480);
        }
        btns.forEach((b, i) => b.classList.toggle('active', i === idx));
    }
    useLayoutEffect(() => { moveIndicator(presetIdx, false); }, []);
    function selectPreset(i) {
        setPresetIdx(i);
        setStages(applyCustomDurations(JSON.parse(JSON.stringify(cut.presets[i].stages)), cut.id, cut.presets[i].thickness));
        moveIndicator(i, true);
    }
    function openEdit(idx) {
        const d = stages[idx].duration;
        setPicMin(Math.floor(d / 60));
        setPicSec(d % 60);
        setEditIdx(idx);
    }
    function confirmEdit() {
        if (editIdx === null)
            return;
        const newDur = picMin * 60 + picSec;
        const editedType = stages[editIdx].type;
        setStages(prev => prev.map((st, i) => i === editIdx ? { ...st, duration: newDur } : st));
        saveStageDuration(cut.id, cut.presets[presetIdx].thickness, editedType, newDur);
        setEditIdx(null);
    }
    function start() {
        initAudio();
        const active = useBaste ? stages : stages.filter(st => st.type !== 'baste');
        const config = {
            cutName: cut.name,
            thickness: cut.presets[presetIdx].thickness,
            stages: active,
        };
        sessionStorage.setItem('cookingConfig', JSON.stringify(config));
        nav('/timer');
    }
    if (!cut)
        return null;
    const visible = stages.filter(st => st.type !== 'baste' || useBaste);
    return (_jsxs("div", { style: s.page, children: [_jsxs("header", { style: s.header, children: [_jsx("button", { className: "glass-pill", style: s.backBtn, onClick: () => nav(-1), children: "\u2190" }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("h2", { style: s.title, children: cut.name }), _jsx("p", { style: s.subtitle, children: cut.nameEn })] })] }), _jsxs("div", { style: s.scroll, children: [_jsxs("section", { children: [_jsx("p", { className: "sec-label", children: "\u539A\u5EA6" }), _jsxs("div", { ref: segRef, className: "liquid-seg glass", style: { borderRadius: 14 }, children: [_jsx("div", { ref: indRef, className: "seg-indicator" }), cut.presets.map((p, i) => (_jsxs("button", { className: i === presetIdx ? 'active' : '', onClick: () => selectPreset(i), children: [p.thickness, "cm"] }, p.id)))] })] }), _jsx("section", { children: _jsxs("div", { className: "glass", style: s.row, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: s.rowTitle, children: "\u9EC4\u6CB9 Baste" }), _jsx("div", { style: s.rowSub, children: "\u9EC4\u6CB9 \u00B7 \u5927\u849C \u00B7 \u9999\u8349" })] }), _jsx("button", { className: `toggle ${useBaste ? 'on' : 'off'}`, onClick: () => setUseBaste(v => !v), "aria-label": "butter baste" })] }) }), _jsxs("section", { children: [_jsx("p", { className: "sec-label", children: "\u9636\u6BB5\u65F6\u95F4" }), _jsx("div", { className: "glass", style: s.stageList, children: visible.map((stage, i) => (_jsxs("div", { children: [_jsxs("button", { style: s.stageRow, onClick: () => openEdit(stages.indexOf(stage)), children: [_jsx("span", { style: { fontSize: 18, width: 26 }, children: ICONS[stage.type] }), _jsx("span", { style: s.stageName, children: stage.label }), _jsx("span", { style: s.durationLabel, children: fmt(stage.duration) }), _jsx("span", { style: s.chevron, children: "\u203A" })] }), i < visible.length - 1 && _jsx("div", { className: "divider" })] }, stage.id))) })] }), _jsx("div", { style: { flex: 1 } })] }), _jsx("div", { style: s.footer, children: _jsx("button", { className: "btn-primary", onClick: start, children: "\u5F00\u59CB\u8BA1\u65F6" }) }), editIdx !== null && (_jsx("div", { className: "sheet-backdrop", onClick: () => setEditIdx(null), children: _jsxs("div", { className: "glass sheet", onClick: e => e.stopPropagation(), children: [_jsx("p", { style: s.sheetTitle, children: stages[editIdx].label }), _jsxs("div", { style: s.steppers, children: [_jsx(Stepper, { label: "\u5206", value: picMin, min: 0, max: 30, onChange: setPicMin }), _jsx(Stepper, { label: "\u79D2", value: picSec, min: 0, max: 55, step: 5, onChange: setPicSec, wrap: true })] }), _jsxs("div", { style: s.sheetBtns, children: [_jsx("button", { style: s.cancelBtn, onClick: () => setEditIdx(null), children: "\u53D6\u6D88" }), _jsx("button", { className: "btn-primary", style: { flex: 1, height: 48 }, onClick: confirmEdit, children: "\u786E\u5B9A" })] })] }) }))] }));
}
function Stepper({ label, value, min, max, step = 1, onChange, wrap = false }) {
    const next = value + step > max
        ? (wrap ? min : max)
        : value + step;
    const prev = value - step < min
        ? (wrap ? max : min)
        : value - step;
    return (_jsxs("div", { className: "stepper", children: [_jsx("button", { className: "stepper-btn", onClick: () => onChange(next), children: "\uFF0B" }), _jsxs("div", { className: "stepper-val", children: [value, _jsxs("span", { className: "stepper-unit", children: [" ", label] })] }), _jsx("button", { className: "stepper-btn", onClick: () => onChange(prev), children: "\uFF0D" })] }));
}
function fmt(sec) {
    const m = Math.floor(sec / 60), s = sec % 60;
    if (m && s)
        return `${m}分${s}秒`;
    if (m)
        return `${m}分钟`;
    return `${s}秒`;
}
const s = {
    page: {
        height: '100dvh', display: 'flex', flexDirection: 'column',
        padding: '0 20px',
        paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
        overflow: 'hidden',
    },
    header: {
        display: 'flex', alignItems: 'center', gap: 14,
        marginBottom: 28, flexShrink: 0,
    },
    backBtn: {
        width: 38, height: 38,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: 18, fontWeight: 500, lineHeight: 1, border: 'none',
    },
    title: { fontSize: 22, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: -0.5 },
    subtitle: {
        fontSize: 13, color: 'rgba(235, 235, 245, 0.5)',
        margin: '2px 0 0', fontWeight: 400, letterSpacing: -0.1,
    },
    scroll: { flex: 1, display: 'flex', flexDirection: 'column', gap: 18, overflow: 'hidden' },
    row: { padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 },
    rowTitle: { fontSize: 16, fontWeight: 500, color: '#fff', letterSpacing: -0.2 },
    rowSub: { fontSize: 13, color: 'rgba(235, 235, 245, 0.5)', marginTop: 2, fontWeight: 400 },
    stageList: { overflow: 'hidden' },
    stageRow: {
        width: '100%', background: 'none', border: 'none',
        display: 'flex', alignItems: 'center', padding: '14px 18px', gap: 12,
        color: '#fff', textAlign: 'left', cursor: 'pointer',
    },
    stageName: { flex: 1, fontSize: 16, fontWeight: 500, color: '#fff', letterSpacing: -0.2 },
    durationLabel: { fontSize: 15, fontWeight: 400, color: 'rgba(235, 235, 245, 0.55)', letterSpacing: -0.2 },
    chevron: { fontSize: 18, color: 'rgba(235, 235, 245, 0.3)', marginLeft: 4 },
    footer: {
        padding: '12px 0',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
        flexShrink: 0,
    },
    sheetTitle: {
        fontSize: 16, fontWeight: 600, color: '#fff',
        textAlign: 'center', margin: '0 0 24px', letterSpacing: -0.2,
    },
    steppers: { display: 'flex', justifyContent: 'space-around', marginBottom: 24 },
    sheetBtns: { display: 'flex', gap: 10 },
    cancelBtn: {
        flex: 1, height: 48, borderRadius: 14, border: 'none',
        background: 'rgba(255, 255, 255, 0.10)',
        color: '#fff', fontSize: 16, fontWeight: 500,
    },
};
