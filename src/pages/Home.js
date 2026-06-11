import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { CUTS } from '../data/presets';
export function Home() {
    const nav = useNavigate();
    return (_jsxs("div", { style: s.page, children: [_jsxs("div", { style: s.hero, children: [_jsx("span", { style: { fontSize: 80 }, children: "\uD83E\uDD69" }), _jsx("h1", { style: s.title, children: "\u714E\u725B\u6392" }), _jsx("p", { style: s.sub, children: "\u7CBE\u51C6\u8BA1\u65F6\uFF0C\u6BCF\u6B21\u5B8C\u7F8E" })] }), _jsx("div", { style: s.grid, children: CUTS.map(cut => (_jsxs("button", { style: s.card, onClick: () => nav(`/setup/${cut.id}`), children: [_jsx("span", { style: { fontSize: 44 }, children: cut.emoji }), _jsx("span", { style: s.cardName, children: cut.name }), _jsx("span", { style: s.cardEn, children: cut.nameEn }), _jsx("span", { style: s.cardDesc, children: cut.description })] }, cut.id))) })] }));
}
const s = {
    page: {
        minHeight: '100dvh', background: '#000', color: '#fff',
        display: 'flex', flexDirection: 'column',
        padding: '0 16px',
        paddingTop: 'calc(env(safe-area-inset-top) + 32px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 24px)',
    },
    hero: { textAlign: 'center', padding: '24px 0 32px' },
    title: { fontSize: 42, fontWeight: 700, margin: '8px 0 4px' },
    sub: { color: '#555', fontSize: 16, margin: 0 },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
    card: {
        background: '#111', border: 'none', borderRadius: 16,
        padding: '14px 10px', cursor: 'pointer', color: '#fff',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        WebkitTapHighlightColor: 'transparent',
    },
    cardName: { fontSize: 17, fontWeight: 600 },
    cardEn: { fontSize: 12, color: '#555' },
    cardDesc: { fontSize: 11, color: '#444', textAlign: 'center', marginTop: 4, lineHeight: 1.4 },
};
