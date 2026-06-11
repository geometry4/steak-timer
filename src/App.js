import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Setup } from './pages/Setup';
import { Timer } from './pages/Timer';
export default function App() {
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Home, {}) }), _jsx(Route, { path: "/setup/:cutId", element: _jsx(Setup, {}) }), _jsx(Route, { path: "/timer", element: _jsx(Timer, {}) })] }) }));
}
