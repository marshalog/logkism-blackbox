import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import { scramble } from './interact';

gsap.registerPlugin(ScrollTrigger, SplitText);

export let lenis: Lenis | null = null;

/* ---------------------------------------------------------------------------
   Smooth scroll (Lenis) wired into GSAP's ticker + ScrollTrigger
   --------------------------------------------------------------------------- */
export function initSmooth() {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), wheelMultiplier: 0.95 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  // in-page anchors
  document.addEventListener('click', (e) => {
    const a = (e.target as Element).closest('a[href*="#"]') as HTMLAnchorElement | null;
    if (!a) return;
    const url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash) return;
    const target = document.querySelector(url.hash);
    if (!target) return;
    e.preventDefault();
    lenis?.scrollTo(target as HTMLElement, { offset: -20, duration: 1.6 });
    history.replaceState(null, '', url.hash);
  });
}

export const stopScroll = () => lenis?.stop();
export const startScroll = () => lenis?.start();

/* ---------------------------------------------------------------------------
   HUD: UTC clock, altitude rail, scroll %
   --------------------------------------------------------------------------- */
export function initHud() {
  const clocks = document.querySelectorAll<HTMLElement>('[data-utc]');
  const tick = () => {
    const d = new Date();
    const s = d.toISOString().slice(11, 19);
    clocks.forEach((c) => (c.textContent = `${s} UTC`));
  };
  tick();
  setInterval(tick, 1000);

  const fill = document.querySelector<HTMLElement>('.alt-rail__fill');
  const val = document.querySelector<HTMLElement>('.alt-rail__val');
  const pct = document.querySelectorAll<HTMLElement>('[data-scroll-pct]');
  if (fill || pct.length) {
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const p = self.progress;
        if (fill) fill.style.transform = `scaleY(${p})`;
        if (val) val.textContent = `ALT ${String(Math.round(p * 100)).padStart(3, '0')}`;
        pct.forEach((el) => (el.textContent = String(Math.round(p * 100)).padStart(2, '0')));
      },
    });
  }
}

/* ---------------------------------------------------------------------------
   Generic scroll reveals
   --------------------------------------------------------------------------- */
export function initReveals(scope: ParentNode = document) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  scope.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
    const delay = parseFloat(el.dataset.reveal || '') || 0;
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: reduce ? 0 : 1.1,
      delay,
      ease: 'power4.out',
      scrollTrigger: { trigger: el, start: 'top 88%', once: true },
    });
  });

  scope.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
    document.fonts.ready.then(() => {
      const type = el.dataset.split === 'chars' ? 'chars' : 'lines';
      const split = SplitText.create(el, { type: type === 'chars' ? 'chars,lines' : 'lines', mask: 'lines', autoSplit: true,
        onSplit(self) {
          gsap.set(el, { visibility: 'visible' });
          return gsap.from(type === 'chars' ? self.chars : self.lines, {
            yPercent: 110,
            rotate: type === 'chars' ? 6 : 2,
            duration: reduce ? 0 : 1.1,
            ease: 'power4.out',
            stagger: type === 'chars' ? 0.025 : 0.08,
            scrollTrigger: { trigger: el, start: 'top 88%', once: true },
          });
        },
      });
      void split;
    });
  });

  scope.querySelectorAll<HTMLElement>('.sec-head').forEach((h) => {
    const rule = h.querySelector('.sec-head__rule');
    const idx = h.querySelector<HTMLElement>('.sec-head__idx');
    gsap.from(rule, { scaleX: 0, duration: 1.4, ease: 'power3.inOut', scrollTrigger: { trigger: h, start: 'top 90%', once: true } });
    if (idx) ScrollTrigger.create({ trigger: h, start: 'top 90%', once: true, onEnter: () => scramble(idx, 0.8) });
  });

  scope.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const end = parseFloat(el.dataset.count || '0');
    const obj = { v: 0 };
    gsap.to(obj, {
      v: end,
      duration: reduce ? 0 : 2,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
      onUpdate: () => (el.textContent = String(Math.round(obj.v)).padStart(el.dataset.pad ? +el.dataset.pad : 0, '0')),
    });
  });

  scope.querySelectorAll<HTMLElement>('[data-scramble-in]').forEach((el) => {
    ScrollTrigger.create({ trigger: el, start: 'top 92%', once: true, onEnter: () => scramble(el, 1) });
  });
}

export { gsap, ScrollTrigger, SplitText };
