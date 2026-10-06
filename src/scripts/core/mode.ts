import { gsap } from 'gsap';

export type Mode = 'cyber' | 'xianxia';
const KEY = 'lk-mode';

export const getMode = (): Mode =>
  document.documentElement.dataset.mode === 'xianxia' ? 'xianxia' : 'cyber';

export function setMode(m: Mode) {
  document.documentElement.dataset.mode = m;
  try {
    localStorage.setItem(KEY, m);
  } catch {}
  window.dispatchEvent(new CustomEvent<Mode>('lk:mode', { detail: m }));
}

export function initModeToggle() {
  document.querySelectorAll('[data-mode-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next: Mode = getMode() === 'cyber' ? 'xianxia' : 'cyber';
      setMode(next);
    });
  });
  
  // Alt+X shortcut
  window.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'x' || e.key === 'X')) {
      const next: Mode = getMode() === 'cyber' ? 'xianxia' : 'cyber';
      setMode(next);
    }
  });
}
