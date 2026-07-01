import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// Global haptic tap on any .kf-tap element (mobile)
if (typeof window !== 'undefined' && 'vibrate' in navigator) {
  window.addEventListener('pointerdown', (e) => {
    const t = e.target as HTMLElement | null;
    if (!t) return;
    if (t.closest('.kf-tap, button')) {
      try { navigator.vibrate(8); } catch { /* ignore */ }
    }
  }, { passive: true });
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
