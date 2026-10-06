import { gsap } from 'gsap';

export type Mode = 'cyber' | 'xianxia' | 'astronaut';
const KEY = 'lk-mode';

export const getMode = (): Mode => {
  const m = document.documentElement.dataset.mode;
  if (m === 'xianxia' || m === 'astronaut') return m as Mode;
  return 'cyber';
};

export function setMode(m: Mode) {
  document.documentElement.dataset.mode = m;
  try {
    localStorage.setItem(KEY, m);
  } catch {}
  window.dispatchEvent(new CustomEvent<Mode>('lk:mode', { detail: m }));
}

export function initModeToggle() {
  document.querySelectorAll('[data-mode-set]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      const next = target.getAttribute('data-mode-set') as Mode;
      if (next) setMode(next);
    });
  });
  
  // Dropdown toggle logic
  const modeBtn = document.querySelector('.mode-btn');
  const modeMenu = document.querySelector('.mode-menu');
  if (modeBtn && modeMenu) {
    modeBtn.addEventListener('click', () => {
      modeMenu.classList.toggle('is-open');
    });
    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!modeBtn.contains(e.target as Node) && !modeMenu.contains(e.target as Node)) {
        modeMenu.classList.remove('is-open');
      }
    });
    // Close on mode select
    modeMenu.querySelectorAll('button').forEach(b => {
      b.addEventListener('click', () => modeMenu.classList.remove('is-open'));
    });
  }
}
