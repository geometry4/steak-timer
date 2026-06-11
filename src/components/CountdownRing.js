import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const SIZE = 260;
const STROKE = 8;
const R = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * R;
const CX = SIZE / 2;
export function CountdownRing({ progress, children }) {
    const dash = CIRC * Math.min(1, Math.max(0, progress));
    const gap = CIRC - dash;
    return (_jsxs("div", { style: { position: 'relative', width: SIZE, height: SIZE, flexShrink: 0 }, children: [_jsxs("svg", { width: SIZE, height: SIZE, style: { position: 'absolute' }, children: [_jsx("circle", { cx: CX, cy: CX, r: R, fill: "none", stroke: "rgba(255, 255, 255, 0.08)", strokeWidth: STROKE }), _jsx("circle", { cx: CX, cy: CX, r: R, fill: "none", stroke: "#FF9500", strokeWidth: STROKE, strokeDasharray: `${dash} ${gap}`, strokeLinecap: "round", transform: `rotate(-90 ${CX} ${CX})`, style: { transition: 'stroke-dasharray 400ms linear' } })] }), _jsx("div", { style: {
                    position: 'absolute', inset: 0,
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                }, children: children })] }));
}
