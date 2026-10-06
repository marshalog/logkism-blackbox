import { gsap } from 'gsap';
import { getMode } from './mode';

/**
 * Page transitions
 *  - internal links  → 6-bar curtain closes, next page opens it (sessionStorage flag)
 *  - [data-warp]     → hyperspace "uplink" jump to the sibling site (?from=… on arrival)
 */
const html = document.documentElement;
const reduce = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

function curtainEls() {
  const c = document.querySelector<HTMLElement>('.curtain');
  return {
    c,
    bars: c ? Array.from(c.querySelectorAll<HTMLElement>('.curtain__bar')) : [],
    hud: c?.querySelector<HTMLElement>('.curtain__hud'),
    target: c?.querySelector<HTMLElement>('.curtain__target'),
    line: c?.querySelector<HTMLElement>('.curtain__line i'),
  };
}

function cover(url: URL, label: string) {
  const { c, bars, hud, target, line } = curtainEls();
  if (!c || reduce()) {
    location.href = url.href;
    return;
  }
  c.style.pointerEvents = 'all';
  if (target) target.textContent = label;
  const tl = gsap.timeline({
    onComplete: () => {
      sessionStorage.setItem('lk-transit', label);
      location.href = url.href;
    },
  });
  tl.set(bars, { transformOrigin: 'bottom' })
    .to(bars, { scaleY: 1, duration: 0.6, ease: 'power3.inOut', stagger: { each: 0.05, from: 'center' } })
    .to(hud!, { opacity: 1, duration: 0.25 }, '-=0.25')
    .fromTo(line!, { scaleX: 0 }, { scaleX: 1, duration: 0.35, ease: 'power2.inOut' }, '<');
}

export function revealCurtain(): Promise<void> {
  return new Promise((resolve) => {
    const { c, bars, hud, target, line } = curtainEls();
    const label = sessionStorage.getItem('lk-transit');
    sessionStorage.removeItem('lk-transit');
    if (!c || !html.classList.contains('is-arriving')) return resolve();
    if (target && label) target.textContent = label;
    gsap.set(hud!, { opacity: 1 });
    gsap.set(line!, { scaleX: 1 });
    const tl = gsap.timeline({
      delay: 0.15,
      onComplete: () => {
        c.style.pointerEvents = '';
        resolve();
      },
    });
    tl.to(hud!, { opacity: 0, duration: 0.25 })
      .add(() => html.classList.remove('is-arriving'))
      .set(bars, { scaleY: 1, transformOrigin: 'top' })
      .to(bars, { scaleY: 0, duration: 0.7, ease: 'power3.inOut', stagger: { each: 0.05, from: 'edges' } });
  });
}

/* ---------------------------------------------------------------------------
   WARP
   --------------------------------------------------------------------------- */
type Star = { x: number; y: number; z: number; pz: number };

function starfield(canvas: HTMLCanvasElement, speedRef: { v: number }) {
  const ctx = canvas.getContext('2d')!;
  const dpr = Math.min(devicePixelRatio, 2);
  const W = (canvas.width = innerWidth * dpr);
  const H = (canvas.height = innerHeight * dpr);
  const stars: Star[] = Array.from({ length: 420 }, () => {
    const z = Math.random() * W;
    return { x: (Math.random() - 0.5) * W, y: (Math.random() - 0.5) * H, z, pz: z };
  });
  const gold = getMode() === 'xianxia';
  let raf = 0;
  const loop = () => {
    ctx.fillStyle = gold ? 'rgba(10,7,6,0.35)' : 'rgba(7,7,10,0.35)';
    ctx.fillRect(0, 0, W, H);
    for (const s of stars) {
      s.pz = s.z;
      s.z -= speedRef.v * dpr;
      if (s.z < 1) {
        s.z = W;
        s.pz = W;
        s.x = (Math.random() - 0.5) * W;
        s.y = (Math.random() - 0.5) * H;
      }
      const sx = (s.x / s.z) * W * 0.5 + W / 2;
      const sy = (s.y / s.z) * H * 0.5 + H / 2;
      const px = (s.x / s.pz) * W * 0.5 + W / 2;
      const py = (s.y / s.pz) * H * 0.5 + H / 2;
      const a = 1 - s.z / W;
      ctx.strokeStyle = gold
        ? `rgba(${220 + 35 * a | 0},${150 + 60 * a | 0},70,${a})`
        : Math.random() > 0.15
          ? `rgba(255,46,63,${a})`
          : `rgba(237,233,227,${a})`;
      ctx.lineWidth = a * 2.2 * dpr;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(sx, sy);
      ctx.stroke();
    }
    raf = requestAnimationFrame(loop);
  };
  loop();
  return () => cancelAnimationFrame(raf);
}

function warp(url: URL, name: string) {
  const w = document.querySelector<HTMLElement>('.warp');
  url.searchParams.set('from', document.body.dataset.site || 'site');
  url.searchParams.set('mode', getMode());
  if (!w || reduce()) {
    location.href = url.href;
    return;
  }
  const canvas = w.querySelector('canvas')!;
  const panel = w.querySelector<HTMLElement>('.warp__panel')!;
  const title = w.querySelector<HTMLElement>('.warp__title')!;
  const log = w.querySelector<HTMLElement>('.warp__log')!;
  const xian = getMode() === 'xianxia';
  title.textContent = xian ? `Phá không · ${name}` : `Uplink → ${name}`;
  const lines = xian
    ? [
        ['Ngưng tụ linh lực', '...... <span class="ok">viên mãn</span>'],
        ['Khắc trận truyền tống', '.. <span class="ok">thành</span>'],
        [`Toạ độ: <span class="hl">${url.host}</span>`, ''],
        ['Xé rách hư không — xuất phát', ''],
      ]
    : [
        [`resolve <span class="hl">${url.host}${url.pathname}</span>`, ''],
        ['handshake tls1.3 / x25519', ' .... <span class="ok">OK</span>'],
        ['verify signature ed25519', ' .... <span class="ok">OK</span>'],
        ['uplink locked · engaging jump drive', ''],
      ];
  log.innerHTML = lines.map(([a, b]) => `<span>&gt; ${a}${b}</span>`).join('');
  const spans = log.querySelectorAll('span:not(.ok):not(.hl)');

  const speed = { v: 2 };
  w.style.pointerEvents = 'all';
  const stop = starfield(canvas, speed);
  const tl = gsap.timeline({
    onComplete: () => {
      location.href = url.href;
      setTimeout(stop, 1500);
    },
  });
  tl.to(w, { opacity: 1, duration: 0.35 })
    .fromTo(panel, { opacity: 0, y: 20, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' }, '<')
    .fromTo(spans, { opacity: 0, x: -10 }, { opacity: 1, x: 0, stagger: 0.18, duration: 0.25 })
    .to(speed, { v: 90, duration: 1.1, ease: 'power3.in' }, '<0.2')
    .to(panel, { opacity: 0, scale: 1.4, filter: 'blur(8px)', duration: 0.35, ease: 'power2.in' }, '-=0.35');
}

/** Arrival from the sibling site — decelerate out of hyperspace. */
function warpArrival(): Promise<void> {
  return new Promise((resolve) => {
    const params = new URLSearchParams(location.search);
    const from = params.get('from');
    const w = document.querySelector<HTMLElement>('.warp');
    if (!from || !w) return resolve();
    params.delete('from');
    params.delete('mode');
    const q = params.toString();
    history.replaceState(null, '', location.pathname + (q ? `?${q}` : '') + location.hash);
    html.classList.remove('is-warping-in');
    if (reduce()) return resolve();
    const canvas = w.querySelector('canvas')!;
    const panel = w.querySelector<HTMLElement>('.warp__panel')!;
    panel.style.display = 'none';
    gsap.set(w, { opacity: 1 });
    const speed = { v: 90 };
    const stop = starfield(canvas, speed);
    gsap
      .timeline({
        onComplete: () => {
          stop();
          panel.style.display = '';
          w.style.pointerEvents = '';
          resolve();
        },
      })
      .to(speed, { v: 1, duration: 1.1, ease: 'power3.out' })
      .to(w, { opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.5');
  });
}

export function initTransitions() {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element).closest('a');
    if (!a || !a.href) return;
    if (a.target === '_blank' || a.hasAttribute('download') || 'noTransit' in a.dataset) return;
    const url = new URL(a.href, location.href);
    if ('warp' in a.dataset) {
      e.preventDefault();
      warp(url, a.dataset.warp || url.host);
      return;
    }
    if (url.origin !== location.origin || url.protocol.indexOf('http') !== 0) return;
    if (url.pathname === location.pathname && url.search === location.search) return; // anchors
    e.preventDefault();
    const label = a.dataset.label || a.textContent?.trim().slice(0, 40) || url.pathname;
    cover(url, label);
  });

  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      const { c, bars, hud } = curtainEls();
      if (c) {
        gsap.set(bars, { scaleY: 0 });
        gsap.set(hud!, { opacity: 0 });
        c.style.pointerEvents = '';
      }
      const w = document.querySelector<HTMLElement>('.warp');
      if (w) {
        gsap.set(w, { opacity: 0 });
        w.style.pointerEvents = '';
      }
    }
  });
}

/** Resolves when any arrival animation (curtain or warp) has finished. */
export function arrive(): Promise<void> {
  return Promise.all([revealCurtain(), warpArrival()]).then(() => undefined);
}
