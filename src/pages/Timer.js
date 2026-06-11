import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { CountdownRing } from '../components/CountdownRing';
import { playAlarm } from '../utils/audio';
const ICONS = { cook: '🔥', flip: '↔️', baste: '🧈', rest: '⏱️' };
export function Timer() {
    const nav = useNavigate();
    const config = JSON.parse(sessionStorage.getItem('cookingConfig') || 'null');
    const [stageIdx, setStageIdx] = useState(0);
    const [remaining, setRemaining] = useState(config?.stages[0]?.duration ?? 0);
    const [done, setDone] = useState(false);
    const startRef = useRef(Date.now());
    const durRef = useRef(config?.stages[0]?.duration ?? 0);
    const idxRef = useRef(0);
    const timerRef = useRef(null);
    const finish = useCallback(() => {
        if (timerRef.current)
            clearInterval(timerRef.current);
        playAlarm();
        setDone(true);
    }, []);
    const advanceTo = useCallback((next, stages) => {
        if (next >= stages.length) {
            finish();
            return;
        }
        idxRef.current = next;
        startRef.current = Date.now();
        durRef.current = stages[next].duration;
        setStageIdx(next);
        setRemaining(stages[next].duration);
        playAlarm();
    }, [finish]);
    const tick = useCallback((stages) => {
        const elapsed = (Date.now() - startRef.current) / 1000;
        const left = Math.max(0, durRef.current - elapsed);
        setRemaining(Math.ceil(left));
        if (left <= 0)
            advanceTo(idxRef.current + 1, stages);
    }, [advanceTo]);
    useEffect(() => {
        if (!config) {
            nav('/');
            return;
        }
        const { stages } = config;
        timerRef.current = setInterval(() => tick(stages), 300);
        const onVisible = () => { if (document.visibilityState === 'visible')
            tick(stages); };
        document.addEventListener('visibilitychange', onVisible);
        return () => {
            if (timerRef.current)
                clearInterval(timerRef.current);
            document.removeEventListener('visibilitychange', onVisible);
        };
    }, []); // run once on mount
    if (!config)
        return null;
    const { stages } = config;
    const cur = stages[stageIdx];
    const next = stages[stageIdx + 1];
    const progress = cur ? 1 - remaining / cur.duration : 1;
    if (done) {
        return (_jsxs("div", { style: { ...s.page, justifyContent: 'center' }, children: [_jsx("div", { style: { fontSize: 90, textAlign: 'center' }, children: "\uD83C\uDF89" }), _jsx("h2", { style: { textAlign: 'center', fontSize: 36, margin: '16px 0 8px' }, children: "\u9192\u8089\u5B8C\u6210" }), _jsx("p", { style: { textAlign: 'center', color: '#FF8C00', fontSize: 24, margin: '0 0 16px' }, children: "\u5F00\u5403\uFF01" }), _jsx("p", { style: { textAlign: 'center', color: '#555' }, children: "\u8D81\u70ED\u4EAB\u7528\u4F60\u7684\u5B8C\u7F8E\u725B\u6392" }), _jsx("div", { style: { flex: 1 } }), _jsx("button", { style: s.orangeBtn, onClick: () => nav('/'), children: "\u518D\u6765\u4E00\u5757" })] }));
    }
    return (_jsxs("div", { style: s.page, children: [_jsx("button", { style: s.exit, onClick: () => { if (timerRef.current)
                    clearInterval(timerRef.current); nav('/'); }, children: "\u2715" }), _jsx("div", { style: { flex: 1 } }), _jsxs("div", { style: { textAlign: 'center' }, children: [_jsx("div", { style: { fontSize: 24 }, children: cur && ICONS[cur.type] }), _jsx("h2", { style: { fontSize: 32, fontWeight: 700, margin: '8px 0 4px' }, children: cur?.label }), _jsx("p", { style: { color: '#444', fontSize: 15, margin: 0 }, children: next ? `下一步：${next.label}` : '最后一步' })] }), _jsx("div", { style: { flex: 1 } }), _jsx("div", { style: { display: 'flex', justifyContent: 'center' }, children: _jsxs(CountdownRing, { progress: progress, children: [_jsx("span", { style: { fontSize: 52, fontWeight: 700, fontVariantNumeric: 'tabular-nums' }, children: fmtTime(remaining) }), _jsx("span", { style: { color: '#444', fontSize: 13 }, children: "\u5269\u4F59" })] }) }), _jsx("div", { style: { flex: 1 } }), _jsx("div", { style: { display: 'flex', justifyContent: 'center', gap: 8 }, children: stages.map((_, i) => (_jsx("div", { style: {
                        width: 8, height: 8, borderRadius: 4,
                        background: i < stageIdx ? 'rgba(255,140,0,0.4)' : i === stageIdx ? '#FF8C00' : '#222',
                    } }, i))) }), _jsx("div", { style: { flex: 0.5 } }), _jsx("button", { style: s.skipBtn, onClick: () => advanceTo(stageIdx + 1, stages), children: "\u8DF3\u8FC7\u6B64\u9636\u6BB5" }), _jsx("div", { style: { height: 48 } })] }));
}
function fmtTime(sec) {
    return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}
const s = {
    page: {
        minHeight: '100dvh', background: '#000', color: '#fff',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '0 24px',
        paddingTop: 'calc(env(safe-area-inset-top) + 16px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)',
    },
    exit: { position: 'absolute', top: 'calc(env(safe-area-inset-top) + 16px)', right: 24, background: 'none', border: 'none', color: '#444', fontSize: 20, cursor: 'pointer' },
    orangeBtn: { width: '100%', height: 64, borderRadius: 18, border: 'none', background: '#FF8C00', color: '#000', fontSize: 20, fontWeight: 700, cursor: 'pointer' },
    skipBtn: { width: '100%', height: 52, borderRadius: 14, border: 'none', background: '#111', color: '#444', fontSize: 16, fontWeight: 600, cursor: 'pointer' },
};
