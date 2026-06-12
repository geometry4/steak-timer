import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { CUTS } from '../data/presets';
import { loadHistory } from '../utils/storage';
import { DONENESS_LABELS } from '../types';
export function Home() {
    const nav = useNavigate();
    const history = loadHistory().slice(0, 3);
    function relativeTime(ts) {
        const diff = (Date.now() - ts) / 1000;
        if (diff < 60)
            return '刚刚';
        if (diff < 3600)
            return `${Math.floor(diff / 60)} 分钟前`;
        if (diff < 86400)
            return `${Math.floor(diff / 3600)} 小时前`;
        return `${Math.floor(diff / 86400)} 天前`;
    }
    function fmtDuration(sec) {
        const m = Math.floor(sec / 60), s = sec % 60;
        if (m && s)
            return `${m}分${s}秒`;
        if (m)
            return `${m}分钟`;
        return `${s}秒`;
    }
    return (_jsxs("div", { style: s.page, children: [_jsxs("header", { style: s.header, children: [_jsx("h1", { style: s.title, children: "\u714E\u725B\u6392" }), _jsx("p", { style: s.subtitle, children: "\u9009\u62E9\u90E8\u4F4D\u5F00\u59CB" })] }), _jsx("div", { style: s.grid, children: CUTS.map(cut => (_jsxs("button", { className: "glass", style: s.card, onClick: () => nav(`/setup/${cut.id}`), children: [_jsx("span", { style: s.cardEmoji, children: cut.emoji }), _jsx("span", { style: s.cardName, children: cut.name }), _jsx("span", { style: s.cardDesc, children: cut.description })] }, cut.id))) }), history.length > 0 && (_jsxs("div", { style: s.historySection, children: [_jsx("p", { className: "sec-label", style: { marginBottom: 8 }, children: "\u6700\u8FD1\u8BB0\u5F55" }), _jsx("div", { style: s.historyList, children: history.map(entry => (_jsxs("div", { className: "glass-pill", style: s.historyItem, children: [_jsx("span", { style: s.historyName, children: entry.cutName }), _jsxs("span", { style: s.historyMeta, children: [entry.thickness, "cm \u00B7 ", DONENESS_LABELS[entry.doneness]] }), _jsx("span", { style: s.historyDuration, children: fmtDuration(entry.totalSeconds) }), _jsx("span", { style: s.historyTime, children: relativeTime(entry.date) })] }, entry.id))) })] }))] }));
}
const s = {
    page: {
        height: '100dvh', display: 'flex', flexDirection: 'column',
        padding: '0 20px', paddingTop: 'calc(env(safe-area-inset-top) + 24px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
        overflow: 'hidden',
    },
    header: { marginBottom: 18, flexShrink: 0 },
    title: { fontSize: 34, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: -0.8 },
    subtitle: { fontSize: 15, color: 'rgba(235,235,245,0.55)', margin: '4px 0 0', fontWeight: 400, letterSpacing: -0.2 },
    grid: {
        flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr',
        gridAutoRows: '1fr', gap: 10, minHeight: 0,
    },
    card: {
        padding: '16px 12px 14px', display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start', textAlign: 'left', cursor: 'pointer', border: 'none', color: '#fff',
        minHeight: 0,
    },
    cardEmoji: { fontSize: 28, lineHeight: 1, marginBottom: 8 },
    cardName: { fontSize: 17, fontWeight: 600, color: '#fff', letterSpacing: -0.3, marginBottom: 4 },
    cardDesc: { fontSize: 12, color: 'rgba(235,235,245,0.5)', lineHeight: 1.4, fontWeight: 400 },
    historySection: { flexShrink: 0, marginTop: 14 },
    historyList: { display: 'flex', flexDirection: 'column', gap: 6 },
    historyItem: {
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 14px', borderRadius: 10,
    },
    historyName: { fontSize: 13, fontWeight: 600, color: '#fff', minWidth: 32 },
    historyMeta: { fontSize: 12, color: 'rgba(235,235,245,0.5)', flex: 1 },
    historyDuration: { fontSize: 12, fontWeight: 600, color: '#FF9500' },
    historyTime: { fontSize: 11, color: 'rgba(235,235,245,0.3)', minWidth: 44, textAlign: 'right' },
};
