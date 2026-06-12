import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCut } from '../data/presets';
import { initAudio } from '../utils/audio';
import { applyCustomDurations, saveStageDuration } from '../utils/storage';
import { DONENESS_LABELS, DONENESS_MULT } from '../types';
const ICONS = {
    cook: '🔥', flip: '↔️', baste: '🧈', rest: '⏱️',
};
const DONENESS_LIST = ['rare', 'medium-rare', 'medium', 'well-done'];
const DONENESS_TEMP = {
    'rare': '52°C',
    'medium-rare': '57°C',
    'medium': '63°C',
    'well-done': '71°C+',
};
function applyDoneness(stages, mult) {
    return stages.map(s => (s.type === 'cook' || s.type === 'flip')
        ? { ...s, duration: Math.round(s.duration * mult / 5) * 5 }
        : s);
}
export function Setup() {
    const { cutId } = useParams();
    const nav = useNavigate();
    const cut = getCut(cutId);
    const [presetIdx, setPresetIdx] = useState(0);
    const [doneness, setDoneness] = useState('medium-rare');
    const [stages, setStages] = useState(() => buildStages(0, 'medium-rare'));
    const [useBaste, setUseBaste] = useState(true);
    const [editIdx, setEditIdx] = useState(null);
    const [picMin, setPicMin] = useState(0);
    const [picSec, setPicSec] = useState(0);
    const segRef = useRef(null);
    const indRef = useRef(null);
    function buildStages(idx, don) {
        const base = JSON.parse(JSON.stringify(cut.presets[idx].stages));
        return applyCustomDurations(applyDoneness(base, DONENESS_MULT[don]), cut.id, cut.presets[idx].thickness, don);
    }
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
        setStages(buildStages(i, doneness));
        moveIndicator(i, true);
    }
    function selectDoneness(d) {
        setDoneness(d);
        setStages(buildStages(presetIdx, d));
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
        saveStageDuration(cut.id, cut.presets[presetIdx].thickness, doneness, editedType, newDur);
        setEditIdx(null);
    }
    function start() {
        initAudio();
        const active = useBaste ? stages : stages.filter(st => st.type !== 'baste');
        const config = {
            cutName: cut.name,
            thickness: cut.presets[presetIdx].thickness,
            doneness,
            stages: active,
        };
        sessionStorage.setItem('cookingConfig', JSON.stringify(config));
        nav('/timer');
    }
    if (!cut)
        return null;
    const visible = stages.filter(st => st.type !== 'baste' || useBaste);
    return (_jsxs("div", { style: s.page, children: [_jsxs("header", { style: s.header, children: [_jsx("button", { className: "glass-pill", style: s.backBtn, onClick: () => nav(-1), children: "\u2190" }), _jsxs("div", { style: { flex: 1 }, children: [_jsx("h2", { style: s.title, children: cut.name }), _jsx("p", { style: s.subtitle, children: cut.nameEn })] })] }), _jsxs("div", { style: s.scroll, children: [_jsxs("section", { children: [_jsx("p", { className: "sec-label", children: "\u539A\u5EA6" }), _jsxs("div", { ref: segRef, className: "liquid-seg glass", style: { borderRadius: 14 }, children: [_jsx("div", { ref: indRef, className: "seg-indicator" }), cut.presets.map((p, i) => (_jsxs("button", { className: i === presetIdx ? 'active' : '', onClick: () => selectPreset(i), children: [p.thickness, "cm"] }, p.id)))] })] }), _jsxs("section", { children: [_jsx("p", { className: "sec-label", children: "\u719F\u5EA6" }), _jsx("div", { style: s.donenessRow, children: DONENESS_LIST.map(d => (_jsxs("button", { className: d === doneness ? 'glass' : 'glass-pill', style: {
                                        ...s.donenessBtn,
                                        ...(d === doneness ? s.donenessBtnActive : {}),
                                    }, onClick: () => selectDoneness(d), children: [_jsx("span", { style: s.donenessName, children: DONENESS_LABELS[d] }), _jsx("span", { style: {
                                                ...s.donenessTemp,
                                                color: d === doneness ? 'rgba(255,149,0,0.9)' : 'rgba(235,235,245,0.35)',
                                            }, children: DONENESS_TEMP[d] })] }, d))) })] }), _jsx("section", { children: _jsxs("div", { className: "glass", style: s.row, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsx("div", { style: s.rowTitle, children: "\u9EC4\u6CB9 Baste" }), _jsx("div", { style: s.rowSub, children: "\u9EC4\u6CB9 \u00B7 \u5927\u849C \u00B7 \u9999\u8349" })] }), _jsx("button", { className: `toggle ${useBaste ? 'on' : 'off'}`, onClick: () => setUseBaste(v => !v), "aria-label": "butter baste" })] }) }), _jsxs("section", { children: [_jsx("p", { className: "sec-label", children: "\u9636\u6BB5\u65F6\u95F4 \u00B7 \u70B9\u51FB\u53EF\u4FEE\u6539" }), _jsx("div", { className: "glass", style: s.stageList, children: visible.map((stage, i) => (_jsxs("div", { children: [_jsxs("button", { style: s.stageRow, onClick: () => openEdit(stages.indexOf(stage)), children: [_jsx("span", { style: { fontSize: 18, width: 26 }, children: ICONS[stage.type] }), _jsx("span", { style: s.stageName, children: stage.label }), _jsx("span", { style: s.durationChip, children: fmt(stage.duration) })] }), i < visible.length - 1 && _jsx("div", { className: "divider" })] }, stage.id))) })] }), _jsx("div", { style: { flex: 1 } })] }), _jsx("div", { style: s.footer, children: _jsx("button", { className: "btn-primary", onClick: start, children: "\u5F00\u59CB\u8BA1\u65F6" }) }), editIdx !== null && (_jsx("div", { className: "sheet-backdrop", onClick: () => setEditIdx(null), children: _jsxs("div", { className: "glass sheet", onClick: e => e.stopPropagation(), children: [_jsx("p", { style: s.sheetTitle, children: stages[editIdx].label }), _jsxs("div", { style: s.steppers, children: [_jsx(Stepper, { label: "\u5206", value: picMin, min: 0, max: 30, onChange: setPicMin }), _jsx(Stepper, { label: "\u79D2", value: picSec, min: 0, max: 55, step: 5, onChange: setPicSec, wrap: true })] }), _jsxs("div", { style: s.sheetBtns, children: [_jsx("button", { style: s.cancelBtn, onClick: () => setEditIdx(null), children: "\u53D6\u6D88" }), _jsx("button", { className: "btn-primary", style: { flex: 1, height: 48 }, onClick: confirmEdit, children: "\u786E\u5B9A" })] })] }) }))] }));
}
function Stepper({ label, value, min, max, step = 1, onChange, wrap = false }) {
    const next = value + step > max ? (wrap ? min : max) : value + step;
    const prev = value - step < min ? (wrap ? max : min) : value - step;
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
        padding: '0 20px', paddingTop: 'calc(env(safe-area-inset-top) + 14px)',
        overflow: 'hidden',
    },
    header: { display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, flexShrink: 0 },
    backBtn: {
        width: 38, height: 38, display: 'flex', alignItems: 'center',
        justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 500, lineHeight: 1, border: 'none',
    },
    title: { fontSize: 20, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: -0.5 },
    subtitle: { fontSize: 12, color: 'rgba(235,235,245,0.5)', margin: '2px 0 0' },
    scroll: { flex: 1, display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' },
    donenessRow: { display: 'flex', gap: 8 },
    donenessBtn: {
        flex: 1, height: 52, border: 'none', borderRadius: 12,
        cursor: 'pointer', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 2,
    },
    donenessBtnActive: {},
    donenessName: { fontSize: 13, fontWeight: 600, color: '#fff' },
    donenessTemp: { fontSize: 11, fontWeight: 500, transition: 'color 200ms' },
    row: { padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 },
    rowTitle: { fontSize: 15, fontWeight: 500, color: '#fff', letterSpacing: -0.2 },
    rowSub: { fontSize: 12, color: 'rgba(235,235,245,0.5)', marginTop: 2 },
    stageList: { overflow: 'hidden' },
    stageRow: {
        width: '100%', background: 'none', border: 'none',
        display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 12,
        color: '#fff', textAlign: 'left', cursor: 'pointer',
    },
    stageName: { flex: 1, fontSize: 15, fontWeight: 500, color: '#fff', letterSpacing: -0.2 },
    // Chip style makes it obvious the time is tappable/editable
    durationChip: {
        fontSize: 13, fontWeight: 600, color: '#FF9500',
        background: 'rgba(255,149,0,0.12)',
        border: '1px solid rgba(255,149,0,0.25)',
        borderRadius: 8, padding: '3px 10px',
    },
    footer: { padding: '10px 0', paddingBottom: 'calc(env(safe-area-inset-bottom) + 14px)', flexShrink: 0 },
    sheetTitle: { fontSize: 16, fontWeight: 600, color: '#fff', textAlign: 'center', margin: '0 0 24px' },
    steppers: { display: 'flex', justifyContent: 'space-around', marginBottom: 24 },
    sheetBtns: { display: 'flex', gap: 10 },
    cancelBtn: {
        flex: 1, height: 48, borderRadius: 14, border: 'none',
        background: 'rgba(255,255,255,0.10)', color: '#fff', fontSize: 16, fontWeight: 500,
    },
};
