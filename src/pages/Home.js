import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { CUTS } from '../data/presets';
export function Home() {
    const nav = useNavigate();
    return (_jsxs("div", { style: s.page, children: [_jsxs("header", { style: s.header, children: [_jsx("h1", { style: s.title, children: "\u714E\u725B\u6392" }), _jsx("p", { style: s.subtitle, children: "\u9009\u62E9\u90E8\u4F4D\u5F00\u59CB" })] }), _jsx("div", { style: s.grid, children: CUTS.map(cut => (_jsxs("button", { className: "glass", style: s.card, onClick: () => nav(`/setup/${cut.id}`), children: [_jsx("span", { style: s.cardEmoji, children: cut.emoji }), _jsx("span", { style: s.cardName, children: cut.name }), _jsx("span", { style: s.cardDesc, children: cut.description })] }, cut.id))) })] }));
}
const s = {
    page: {
        height: '100dvh',
        padding: '0 20px',
        paddingTop: 'calc(env(safe-area-inset-top) + 24px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 20px)',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
    },
    header: { marginBottom: 20, flexShrink: 0 },
    title: { fontSize: 34, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: -0.8 },
    subtitle: {
        fontSize: 15, color: 'rgba(235, 235, 245, 0.55)',
        margin: '4px 0 0', fontWeight: 400, letterSpacing: -0.2,
    },
    grid: {
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gridAutoRows: '1fr',
        gap: 10,
        minHeight: 0,
    },
    card: {
        padding: '16px 12px 14px',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 0,
        textAlign: 'left', cursor: 'pointer', border: 'none', color: '#fff',
        minHeight: 0,
    },
    cardEmoji: { fontSize: 28, lineHeight: 1, marginBottom: 8 },
    cardName: { fontSize: 17, fontWeight: 600, color: '#fff', letterSpacing: -0.3, marginBottom: 4 },
    cardDesc: { fontSize: 12, color: 'rgba(235, 235, 245, 0.5)', lineHeight: 1.4, fontWeight: 400 },
};
