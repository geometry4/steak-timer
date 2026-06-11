import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Setup } from './pages/Setup';
import { Timer } from './pages/Timer';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/setup/:cutId" element={<Setup />} />
        <Route path="/timer" element={<Timer />} />
      </Routes>
    </BrowserRouter>
  );
}
