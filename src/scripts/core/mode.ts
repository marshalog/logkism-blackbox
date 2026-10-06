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

let busy = false;

/** Ink-spread + seal-stamp ritual when switching realms. */
function ritual(origin: Element) {
  if (busy) return;
  busy = true;
  const next: Mode = getMode() === 'cyber' ? 'xianxia' : 'cyber';
  const r = origin.getBoundingClientRect();
  const x = `${r.left + r.width / 2}px`;
  const y = `${r.top + r.height / 2}px`;

  const root = document.createElement('div');
  root.className = 'ritual';
  root.innerHTML = `
    <div class="ritual__ink"></div>
    <div class="ritual__seal ${next === 'cyber' ? 'is-cyber' : ''}">${next === 'xianxia' ? '修' : 'SYS'}</div>
    <div class="ritual__caption">${next === 'xianxia' ? '踏 入 仙 途 · entering the dao' : 'rebooting · mission control'}</div>`;
  document.body.appendChild(root);
  const ink = root.querySelector<HTMLElement>('.ritual__ink')!;
  const seal = root.querySelector<HTMLElement>('.ritual__seal')!;
  const cap = root.querySelector<HTMLElement>('.ritual__caption')!;
  if (next === 'cyber') ink.style.background = '#07070a';

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) {
    setMode(next);
    root.remove();
    busy = false;
    return;
  }

  const tl = gsap.timeline({
    onComplete: () => {
      root.remove();
      busy = false;
    },
  });
  tl.fromTo(
    ink,
    { clipPath: `circle(0% at ${x} ${y})` },
    { clipPath: `circle(150% at ${x} ${y})`, duration: 0.85, ease: 'power3.inOut' }
  )
    .to(seal, { opacity: 1, scale: 1, rotate: -6, duration: 0.32, ease: 'power4.in' }, '-=0.1')
    .add(() => setMode(next))
    .to(seal, { keyframes: { x: [-8, 7, -5, 3, 0] }, duration: 0.3, ease: 'none' })
    .fromTo(cap, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.4 }, '<')
    .to({}, { duration: 0.35 })
    .to([seal, cap], { opacity: 0, scale: 0.85, duration: 0.4, ease: 'power2.in' })
    .to(ink, { clipPath: `circle(0% at 50% 50%)`, duration: 0.8, ease: 'power3.inOut' }, '-=0.25');
}

export function initModeToggle() {
  document.querySelectorAll('[data-mode-toggle]').forEach((btn) =>
    btn.addEventListener('click', () => ritual(btn))
  );
  // Alt+X shortcut
  window.addEventListener('keydown', (e) => {
    if (e.altKey && (e.key === 'x' || e.key === 'X')) {
      const t = document.querySelector('[data-mode-toggle]');
      if (t) ritual(t);
    }
  });
}
