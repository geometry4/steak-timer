import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCut } from '../data/presets';
import { initAudio } from '../utils/audio';
import '../index.css';
const ICONS = {
    cook: '🔥', flip: '↔️', baste: '🧈', rest: '⏱️',
};
export function Setup() {
    const { cutId } = useParams();
    const nav = useNavigate();
    const cut = getCut(cutId);
    const [presetIdx, setPresetIdx] = useState(0);
    const [stages, setStages] = useState(() => JSON.parse(JSON.stringify(cut.presets[0].stages)));
    const [useBaste, setUseBaste] = useState(true);
    const [editIdx, setEditIdx] = useState(null);
    const [picMin, setPicMin] = useState(0);
    const [picSec, setPicSec] = useState(0);
    const segRef = useRef(null);
    // Move liquid indicator to the selected preset button
    function moveIndicator(idx, animate) {
        const el = segRef.current;
        if (!el)
            return;
        const btns = el.querySelectorAll('button');
        const btn = btns[idx];
        if (!btn)
            return;
        const cr = el.getBoundingClientRect();
        const br = btn.getBoundingClientRect();
        const x = br.left - cr.left;
        const w = br.width;
        if (!animate) {
            el.style.setProperty('transition', 'none');
            el.style.setProperty('--ind-x', `${x}px`);
            el.style.setProperty('--ind-w', `${w}px`);
            el.style.setProperty('--ind-scale', '1');
            requestAnimationFrame(() => el.style.removeProperty('transition'));
        }
        else {
            el.style.setProperty('--ind-x', `${x}px`);
            el.style.setProperty('--ind-w', `${w}px`);
            el.style.setProperty('--ind-scale', '1.18');
            setTimeout(() => el.style.setProperty('--ind-scale', '0.96'), 280);
            setTimeout(() => el.style.setProperty('--ind-scale', '1'), 480);
        }
        // Update active class
        btns.forEach((b, i) => b.classList.toggle('active', i === idx));
    }
    useLayoutEffect(() => { moveIndicator(presetIdx, false); }, []);
    function selectPreset(i) {
        setPresetIdx(i);
        setStages(JSON.parse(JSON.stringify(cut.presets[i].stages)));
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
        setStages(prev => prev.map((s, i) => i === editIdx ? { ...s, duration: picMin * 60 + picSec } : s));
        setEditIdx(null);
    }
    function start() {
        initAudio();
        const active = useBaste ? stages : stages.filter(s => s.type !== 'baste');
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
    const visible = stages.filter(s => s.type !== 'baste' || useBaste);
    return (_jsxs("div", { style: s.page, children: [_jsxs("header", { className: "glass", style: s.topbar, children: [_jsx("button", { style: s.backBtn, onClick: () => nav(-1), children: "\u2190" }), _jsxs("span", { style: s.topbarTitle, children: [cut.emoji, " ", cut.name] })] }), _jsxs("div", { style: s.scroll, children: [_jsxs("div", { children: [_jsx("p", { className: "sec-label", children: "\u539A\u5EA6" }), _jsx("div", { ref: segRef, className: "liquid-seg glass", style: s.seg, children: cut.presets.map((p, i) => (_jsxs("button", { className: i === presetIdx ? 'active' : '', onClick: () => selectPreset(i), children: [p.thickness, "cm"] }, p.id))) })] }), _jsxs("div", { className: "glass", style: s.row, children: [_jsxs("div", { children: [_jsx("div", { style: s.rowTitle, children: "\u9EC4\u6CB9 Baste" }), _jsx("div", { style: s.rowSub, children: "\u9EC4\u6CB9 \u00B7 \u5927\u849C \u00B7 \u9999\u8349" })] }), _jsx("button", { className: `toggle-wrap ${useBaste ? 'on' : 'off'}`, onClick: () => setUseBaste(v => !v), "aria-label": "\u9EC4\u6CB9baste\u5F00\u5173" })] }), _jsxs("div", { children: [_jsx("p", { className: "sec-label", children: "\u8BA1\u65F6\u9636\u6BB5\uFF08\u70B9\u65F6\u95F4\u4FEE\u6539\uFF09" }), _jsx("div", { className: "glass", style: s.stageList, children: visible.map((stage, i) => (_jsxs("div", { children: [_jsxs("div", { style: s.stageRow, children: [_jsx("span", { style: { fontSize: 20, width: 28 }, children: ICONS[stage.type] }), _jsx("span", { style: s.stageName, children: stage.label }), _jsx("button", { style: s.durationBtn, onClick: () => openEdit(stages.indexOf(stage)), children: fmt(stage.duration) })] }), i < visible.length - 1 && _jsx("div", { className: "stage-divider" })] }, stage.id))) })] }), _jsx("div", { style: { height: 100 } })] }), _jsx("div", { style: s.footer, children: _jsx("button", { className: "btn-primary", onClick: start, children: "\u5F00\u59CB\u8BA1\u65F6" }) }), editIdx !== null && (_jsx("div", { className: "sheet-backdrop", onClick: () => setEditIdx(null), children: _jsxs("div", { className: "glass sheet", onClick: e => e.stopPropagation(), children: [_jsx("p", { style: s.sheetTitle, children: stages[editIdx].label }), _jsxs("div", { style: s.steppers, children: [_jsx(Stepper, { label: "\u5206", value: picMin, min: 0, max: 30, onChange: setPicMin }), _jsx(Stepper, { label: "\u79D2", value: picSec, min: 0, max: 55, step: 5, onChange: setPicSec })] }), _jsxs("div", { style: s.sheetBtns, children: [_jsx("button", { style: s.cancelBtn, onClick: () => setEditIdx(null), children: "\u53D6\u6D88" }), _jsx("button", { className: "btn-primary", style: { flex: 1, height: 52 }, onClick: confirmEdit, children: "\u786E\u5B9A" })] })] }) }))] }));
}
function Stepper({ label, value, min, max, step = 1, onChange }) {
    return (_jsxs("div", { className: "stepper", children: [_jsx("button", { className: "stepper-btn", onClick: () => onChange(Math.min(max, value + step)), children: "\uFF0B" }), _jsxs("div", { className: "stepper-val", children: [value, _jsxs("span", { className: "stepper-unit", children: [" ", label] })] }), _jsx("button", { className: "stepper-btn", onClick: () => onChange(Math.max(min, value - step)), children: "\uFF0D" })] }));
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
        minHeight: '100dvh', display: 'flex', flexDirection: 'column',
        padding: '0 16px',
        paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
    },
    topbar: {
        borderRadius: 16, padding: '12px 18px',
        display: 'flex', alignItems: 'center', gap: 12,
        marginBottom: 20, flexShrink: 0,
    },
    backBtn: {
        background: 'none', border: 'none',
        color: '#FF8C00', fontSize: 20, padding: '0 4px', lineHeight: 1,
    },
    topbarTitle: { fontSize: 17, fontWeight: 700, color: '#f5f0eb' },
    scroll: { flex: 1, display: 'flex', flexDirection: 'column', gap: 16, overflowY: 'auto' },
    seg: { borderRadius: 14 },
    row: {
        borderRadius: 16, padding: '14px 18px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    },
    rowTitle: { fontSize: 15, fontWeight: 600, color: '#f5f0eb' },
    rowSub: { fontSize: 12, color: 'rgba(245,240,235,0.38)', marginTop: 2 },
    stageList: { borderRadius: 16, overflow: 'hidden' },
    stageRow: {
        display: 'flex', alignItems: 'center',
        padding: '14px 18px', gap: 12,
    },
    stageName: { flex: 1, fontSize: 15, fontWeight: 600, color: '#f5f0eb' },
    durationBtn: {
        background: 'none', border: 'none',
        color: '#FF8C00', fontSize: 15, fontWeight: 600,
    },
    footer: {
        padding: '12px 0',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)',
        flexShrink: 0,
    },
    sheetTitle: {
        fontSize: 17, fontWeight: 700, color: '#f5f0eb',
        textAlign: 'center', margin: '0 0 20px',
    },
    steppers: { display: 'flex', justifyContent: 'space-around', marginBottom: 24 },
    sheetBtns: { display: 'flex', gap: 10 },
    cancelBtn: {
        flex: 1, height: 52, borderRadius: 14,
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.06)',
        color: 'rgba(245,240,235,0.5)', fontSize: 15,
    },
};
