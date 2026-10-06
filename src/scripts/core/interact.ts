import { gsap } from 'gsap';
import { getMode } from './mode';

const fine = () => matchMedia('(pointer: fine)').matches;

/* ---------------------------------------------------------------------------
   Reticle cursor with live coordinate readout
   --------------------------------------------------------------------------- */
export function initCursor() {
  const root = document.querySelector<HTMLElement>('.cursor');
  if (!root || !fine()) return;
  document.body.classList.add('has-cursor');
  const dot = root.querySelector<HTMLElement>('.cursor__dot')!;
  const ring = root.querySelector<HTMLElement>('.cursor__ring')!;
  const meta = root.querySelector<HTMLElement>('.cursor__meta')!;
  const label = root.querySelector<HTMLElement>('.cursor__label')!;
  const coords = root.querySelector<HTMLElement>('.cursor__coords')!;

  const pos = { x: innerWidth / 2, y: innerHeight / 2 };
  const ringPos = { ...pos };
  const metaPos = { ...pos };
  let visible = false;

  window.addEventListener(
    'pointermove',
    (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!visible) {
        visible = true;
        root.style.opacity = '1';
      }
    },
    { passive: true }
  );
  document.addEventListener('pointerleave', () => {
    visible = false;
    root.style.opacity = '0';
  });
  window.addEventListener('pointerdown', () => root.classList.add('is-down'));
  window.addEventListener('pointerup', () => root.classList.remove('is-down'));

  const pad = (n: number) => String(Math.round(n)).padStart(4, '0');
  gsap.ticker.add(() => {
    ringPos.x += (pos.x - ringPos.x) * 0.2;
    ringPos.y += (pos.y - ringPos.y) * 0.2;
    metaPos.x += (pos.x - metaPos.x) * 0.12;
    metaPos.y += (pos.y - metaPos.y) * 0.12;
    dot.style.transform = `translate3d(${pos.x}px,${pos.y}px,0)`;
    ring.style.transform = `translate3d(${ringPos.x}px,${ringPos.y}px,0)`;
    meta.style.transform = `translate3d(${metaPos.x}px,${metaPos.y}px,0)`;
    coords.textContent =
      getMode() === 'xianxia'
        ? `靈 ${pad(pos.x)} · 氣 ${pad(pos.y)}`
        : `X ${pad(pos.x)} · Y ${pad(pos.y)}`;
  });

  const HOVER = 'a, button, [data-cursor], input, textarea, label, [role="button"]';
  document.addEventListener('pointerover', (e) => {
    const t = (e.target as Element).closest(HOVER) as HTMLElement | null;
    if (!t) return;
    root.classList.add('is-hover');
    const txt = t.dataset.cursor;
    if (txt) {
      label.textContent = txt;
      root.classList.add('has-label');
    }
  });
  document.addEventListener('pointerout', (e) => {
    const t = (e.target as Element).closest(HOVER);
    if (!t) return;
    const to = (e as PointerEvent).relatedTarget as Element | null;
    if (to && t.contains(to)) return;
    root.classList.remove('is-hover', 'has-label');
  });
}

/* ---------------------------------------------------------------------------
   Click burst — reticle shock ring (cyber) / qi lotus (xianxia)
   --------------------------------------------------------------------------- */
const HEX = () => '0x' + Math.floor(Math.random() * 255).toString(16).toUpperCase().padStart(2, '0');
const RUNES = '道剑仙靈氣雷火天玄乾坤';
export function initClickFx() {
  window.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'touch' && e.isPrimary === false) return;
    const fx = document.createElement('div');
    fx.className = 'click-fx';
    fx.style.left = `${e.clientX}px`;
    fx.style.top = `${e.clientY}px`;
    const ticks = Array.from({ length: 6 }, (_, i) => `<i class="click-fx__tick" style="--a:${i * 60 + 30}deg"></i>`).join('');
    const txt = getMode() === 'xianxia' ? RUNES[(Math.random() * RUNES.length) | 0] : HEX();
    fx.innerHTML = `<i class="click-fx__ring"></i><i class="click-fx__ring click-fx__ring--2"></i>${ticks}<span class="click-fx__txt">${txt}</span>`;
    document.body.appendChild(fx);
    setTimeout(() => fx.remove(), 900);
  });
}

/* ---------------------------------------------------------------------------
   Magnetic elements
   --------------------------------------------------------------------------- */
export function initMagnetic(scope: ParentNode = document) {
  if (!fine()) return;
  scope.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    const strength = parseFloat(el.dataset.magnetic || '') || 0.35;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    });
    el.addEventListener('pointerleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, 0.35)' });
    });
  });
}

/* ---------------------------------------------------------------------------
   Text scramble / decode
   --------------------------------------------------------------------------- */
const CY = '!<>-_\\/[]{}=+*^?#01ABCDEF';
const XI = '道法乾坤玄黃宇宙洪荒天地靈氣劍仙';
const running = new WeakMap<HTMLElement, number>();

export function scramble(el: HTMLElement, duration = 0.6) {
  const final = el.dataset.text ?? el.textContent ?? '';
  el.dataset.text = final;
  const pool = getMode() === 'xianxia' ? XI : CY;
  const total = Math.max(10, Math.round(duration * 60));
  let frame = 0;
  const at = Array.from(final, (_, i) => (i / final.length) * total * 0.7 + total * 0.3 * Math.random());
  cancelAnimationFrame(running.get(el) || 0);
  const tick = () => {
    let out = '';
    for (let i = 0; i < final.length; i++) {
      const ch = final[i];
      if (ch === ' ' || frame >= at[i]) out += ch;
      else out += pool[(Math.random() * pool.length) | 0];
    }
    el.textContent = out;
    if (frame++ < total) running.set(el, requestAnimationFrame(tick));
    else el.textContent = final;
  };
  tick();
}

export function initScramble(scope: ParentNode = document) {
  scope.querySelectorAll<HTMLElement>('[data-scramble]').forEach((el) => {
    const host = (el.closest('a, button, [data-scramble-host]') as HTMLElement) || el;
    host.addEventListener('mouseenter', () => scramble(el, 0.45));
  });
}
