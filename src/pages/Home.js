import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { CUTS } from '../data/presets';
import '../index.css';
export function Home() {
    const nav = useNavigate();
    return (_jsxs("div", { style: s.page, children: [_jsxs("header", { className: "glass", style: s.topbar, children: [_jsx("span", { style: s.topbarEmoji, children: "\uD83E\uDD69" }), _jsx("span", { style: s.topbarTitle, children: "\u714E\u725B\u6392" })] }), _jsx("div", { style: s.hero, children: _jsx("p", { style: s.heroSub, children: "\u9009\u62E9\u4F60\u7684\u90E8\u4F4D\uFF0C\u5F00\u59CB\u7CBE\u51C6\u8BA1\u65F6" }) }), _jsx("div", { style: s.grid, children: CUTS.map(cut => (_jsxs("button", { className: "glass", style: s.card, onClick: () => nav(`/setup/${cut.id}`), children: [_jsx("span", { style: s.cardEmoji, children: cut.emoji }), _jsx("span", { style: s.cardName, children: cut.name }), _jsx("span", { style: s.cardEn, children: cut.nameEn }), _jsx("span", { style: s.cardDesc, children: cut.description })] }, cut.id))) }), _jsx("div", { style: { height: 'calc(env(safe-area-inset-bottom) + 24px)' } })] }));
}
const s = {
    page: {
        minHeight: '100dvh',
        display: 'flex', flexDirection: 'column',
        padding: '0 16px',
        paddingTop: 'calc(env(safe-area-inset-top) + 12px)',
    },
    topbar: {
        borderRadius: 16,
        padding: '12px 18px',
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 24,
        flexShrink: 0,
    },
    topbarEmoji: { fontSize: 24 },
    topbarTitle: { fontSize: 18, fontWeight: 700, color: '#f5f0eb' },
    hero: { marginBottom: 20 },
    heroSub: { margin: 0, fontSize: 14, color: 'rgba(245,240,235,0.45)', fontWeight: 500 },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
    },
    card: {
        border: 'none',
        borderRadius: 18,
        padding: '16px 12px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        cursor: 'pointer', textAlign: 'center',
        transition: 'transform 120ms',
    },
    cardEmoji: { fontSize: 44, marginBottom: 6 },
    cardName: { fontSize: 16, fontWeight: 700, color: '#f5f0eb' },
    cardEn: { fontSize: 11, color: 'rgba(245,240,235,0.4)', fontWeight: 500 },
    cardDesc: { fontSize: 11, color: 'rgba(245,240,235,0.35)', marginTop: 4, lineHeight: 1.4 },
};
