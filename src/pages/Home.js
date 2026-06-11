import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import LiquidGlass from 'liquid-glass-react';
import { CUTS } from '../data/presets';
export function Home() {
    const nav = useNavigate();
    return (_jsxs("div", { style: s.page, children: [_jsxs("header", { style: s.header, children: [_jsx("h1", { style: s.title, children: "\u714E\u725B\u6392" }), _jsx("p", { style: s.subtitle, children: "\u9009\u62E9\u90E8\u4F4D\u5F00\u59CB" })] }), _jsx("div", { style: s.grid, children: CUTS.map(cut => (_jsx("div", { style: s.cell, children: _jsx(LiquidGlass, { displacementScale: 55, blurAmount: 0.08, saturation: 150, aberrationIntensity: 1.5, elasticity: 0.2, cornerRadius: 20, padding: "22px 14px 18px", onClick: () => nav(`/setup/${cut.id}`), style: { width: '100%', cursor: 'pointer' }, children: _jsxs("div", { style: s.cardInner, children: [_jsx("span", { style: s.cardEmoji, children: cut.emoji }), _jsx("span", { style: s.cardName, children: cut.name }), _jsx("span", { style: s.cardDesc, children: cut.description })] }) }) }, cut.id))) }), _jsx("div", { style: { height: 'calc(env(safe-area-inset-bottom) + 32px)' } })] }));
}
const s = {
    page: {
        minHeight: '100dvh',
        padding: '0 20px',
        paddingTop: 'calc(env(safe-area-inset-top) + 28px)',
    },
    header: { marginBottom: 28 },
    title: { fontSize: 34, fontWeight: 700, color: '#fff', margin: 0, letterSpacing: -0.8 },
    subtitle: {
        fontSize: 15, color: 'rgba(235, 235, 245, 0.55)',
        margin: '4px 0 0', fontWeight: 400, letterSpacing: -0.2,
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 12,
    },
    cell: { width: '100%' },
    cardInner: {
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start', textAlign: 'left',
    },
    cardEmoji: { fontSize: 32, lineHeight: 1, marginBottom: 12 },
    cardName: {
        fontSize: 17, fontWeight: 600, color: '#fff',
        letterSpacing: -0.3, marginBottom: 4,
    },
    cardDesc: {
        fontSize: 12, color: 'rgba(235, 235, 245, 0.5)',
        lineHeight: 1.4, fontWeight: 400,
    },
};
