import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const style = document.createElement('style');
style.textContent = `
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #000; color: #fff; font-family: -apple-system, sans-serif; }
  button { -webkit-tap-highlight-color: transparent; }
`;
document.head.appendChild(style);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
