import { gsap } from 'gsap';
import { getMode, type Mode } from './mode';

/* ---------------------------------------------------------------------------
   WebGL nebula — domain-warped fbm, crimson in cyber, ink + gold in xianxia.
   Rendered at reduced resolution; paused when tab hidden.
   --------------------------------------------------------------------------- */
const FRAG = /* glsl */ `
precision mediump float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_cyber;
uniform float u_xianxia;
uniform float u_astro;
uniform float u_scroll;

float hash(vec2 p){ p = fract(p*vec2(123.34, 456.21)); p += dot(p, p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i+vec2(1.,0.)), c = hash(i+vec2(0.,1.)), d = hash(i+vec2(1.,1.));
  vec2 u = f*f*(3.-2.*f);
  return mix(a,b,u.x) + (c-a)*u.y*(1.-u.x) + (d-b)*u.x*u.y;
}
float fbm(vec2 p){
  float v = 0., a = .5;
  mat2 r = mat2(.8,-.6,.6,.8);
  for(int i=0;i<5;i++){ v += a*noise(p); p = r*p*2.03; a *= .5; }
  return v;
}
void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - .5*u_res) / u_res.y;
  float t = u_time * .035;
  vec2 m = (u_mouse - .5) * vec2(u_res.x/u_res.y, 1.);
  p.y += u_scroll * .25;

  vec2 q = vec2(fbm(p*1.4 + t), fbm(p*1.4 - t + 3.1));
  vec2 r = vec2(fbm(p*1.9 + q*1.8 + vec2(1.7,9.2) + t*1.3), fbm(p*1.9 + q*1.8 + vec2(8.3,2.8) - t));
  float f = fbm(p*1.6 + r*1.5);
  float glow = exp(-length(p - m*.6) * 2.4);

  // cyber: void → blood → crimson filaments
  vec3 cy = mix(vec3(.027,.027,.039), vec3(.17,.012,.03), smoothstep(.38,.9,f));
  cy += vec3(.62,.04,.08) * pow(smoothstep(.55,1.,f), 3.) * 1.1;
  cy += vec3(.42,.02,.05) * glow * .28 * (.5 + f);
  // radar grid, faint
  vec2 g = abs(fract(p * 9.) - .5);
  cy += vec3(.5,.05,.08) * smoothstep(.485,.5,max(g.x,g.y)) * .035;

  // xianxia: ink smoke, ember red, gold qi
  vec3 xi = mix(vec3(.035,.026,.022), vec3(.13,.05,.035), smoothstep(.3,.95,f));
  xi += vec3(.75,.55,.22) * pow(smoothstep(.6,1.,r.y), 4.) * .45;
  xi += vec3(.5,.06,.04) * glow * .3;
  
  // astronaut: deep space, icy cyan, neon blue
  vec3 as = mix(vec3(.012,.015,.022), vec3(.02,.05,.12), smoothstep(.3,.95,f));
  as += vec3(.0,.4,.8) * pow(smoothstep(.55,1.,f), 3.) * 1.1;
  as += vec3(.0,.8,1.) * glow * .3;

  vec3 col = cy * u_cyber + xi * u_xianxia + as * u_astro;
  col *= 1. - .6 * dot(uv-.5, uv-.5) * 1.8;
  gl_FragColor = vec4(col, 1.);
}`;

const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a,0.,1.); }`;

export function initNebula(canvas: HTMLCanvasElement | null) {
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) return;
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = (n: string) => gl.getUniformLocation(prog, n);
  const uRes = U('u_res'), uTime = U('u_time'), uMouse = U('u_mouse'), 
        uCyber = U('u_cyber'), uXianxia = U('u_xianxia'), uAstro = U('u_astro'), uScroll = U('u_scroll');

  const SCALE = 0.45;
  const resize = () => {
    canvas.width = Math.max(1, innerWidth * SCALE);
    canvas.height = Math.max(1, innerHeight * SCALE);
    gl.viewport(0, 0, canvas.width, canvas.height);
  };
  resize();
  addEventListener('resize', resize);

  const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
  addEventListener('pointermove', (e) => {
    mouse.tx = e.clientX / innerWidth;
    mouse.ty = 1 - e.clientY / innerHeight;
  }, { passive: true });

  const m0 = getMode();
  const state = { 
    cyber: m0 === 'cyber' ? 1 : 0, 
    xianxia: m0 === 'xianxia' ? 1 : 0, 
    astro: m0 === 'astronaut' ? 1 : 0 
  };
  addEventListener('lk:mode', (e) => {
    const m = (e as CustomEvent<Mode>).detail;
    gsap.to(state, {
      cyber: m === 'cyber' ? 1 : 0,
      xianxia: m === 'xianxia' ? 1 : 0,
      astro: m === 'astronaut' ? 1 : 0,
      duration: 1.6,
      ease: 'power2.inOut'
    });
  });

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const t0 = performance.now();
  let last = 0;
  const draw = (now: number) => {
    if (document.hidden) return;
    if (now - last < 1000 / 40) return; // ~40fps cap
    last = now;
    mouse.x += (mouse.tx - mouse.x) * 0.04;
    mouse.y += (mouse.ty - mouse.y) * 0.04;
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, reduce ? 20 : (now - t0) / 1000);
    gl.uniform2f(uMouse, mouse.x, mouse.y);
    gl.uniform1f(uCyber, state.cyber);
    gl.uniform1f(uXianxia, state.xianxia);
    gl.uniform1f(uAstro, state.astro);
    gl.uniform1f(uScroll, scrollY / Math.max(1, document.body.scrollHeight));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  gsap.ticker.add(() => draw(performance.now()));
}

/* ---------------------------------------------------------------------------
   Particles — cyber: satellites on long elliptic orbits with fading trails
               xianxia: rising embers + drifting qi motes
   --------------------------------------------------------------------------- */
type Sat = { a: number; b: number; ang: number; sp: number; tilt: number; size: number; hue: number };
type Ember = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; gold: boolean };

export function initParticles(canvas: HTMLCanvasElement | null) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d')!;
  const dpr = Math.min(devicePixelRatio, 1.5);
  let W = 0, H = 0;
  const resize = () => {
    W = canvas.width = innerWidth * dpr;
    H = canvas.height = innerHeight * dpr;
  };
  resize();
  addEventListener('resize', resize);

  const sats: Sat[] = Array.from({ length: 26 }, () => ({
    a: (0.35 + Math.random() * 0.9) * 1,
    b: 0.12 + Math.random() * 0.3,
    ang: Math.random() * Math.PI * 2,
    sp: (0.0006 + Math.random() * 0.0016) * (Math.random() > 0.5 ? 1 : -1),
    tilt: -0.35 + Math.random() * 0.2,
    size: 0.6 + Math.random() * 1.4,
    hue: Math.random(),
  }));
  const embers: Ember[] = [];
  const spawn = (): Ember => ({
    x: Math.random() * W,
    y: H + 10,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -(0.3 + Math.random() * 0.9),
    life: 0,
    max: 400 + Math.random() * 500,
    size: (0.6 + Math.random() * 1.8) * dpr,
    gold: Math.random() > 0.45,
  });

  let mode = getMode();
  let fade = 1; // crossfade alpha
  addEventListener('lk:mode', (e) => {
    const f = { v: 0 };
    fade = 0;
    gsap.to(f, { v: 1, duration: 1.2, onUpdate: () => { fade = f.v; } });
    mode = (e as CustomEvent<Mode>).detail;
    ctx.clearRect(0, 0, W, H);
  });

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  gsap.ticker.add(() => {
    if (document.hidden || reduce) return;
    // trail fade
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = mode === 'cyber' ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0.18)';
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    if (mode === 'cyber' || mode === 'astronaut') {
      const cx = W * 0.62, cy = H * 0.42, R = Math.max(W, H) * 0.6;
      for (const s of sats) {
        s.ang += s.sp;
        const x0 = Math.cos(s.ang) * s.a * R;
        const y0 = Math.sin(s.ang) * s.b * R;
        const x = cx + x0 * Math.cos(s.tilt) - y0 * Math.sin(s.tilt);
        const y = cy + x0 * Math.sin(s.tilt) + y0 * Math.cos(s.tilt);
        if (mode === 'astronaut') {
          ctx.fillStyle = s.hue > 0.82 ? `rgba(255,255,255,${0.8 * fade})` : `rgba(0,255,255,${0.85 * fade})`;
        } else {
          ctx.fillStyle = s.hue > 0.82 ? `rgba(237,233,227,${0.7 * fade})` : `rgba(255,46,63,${0.75 * fade})`;
        }
        ctx.fillRect(x, y, s.size * dpr, s.size * dpr);
      }
    } else {
      if (embers.length < 90 && Math.random() > 0.6) embers.push(spawn());
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.life++;
        e.x += e.vx + Math.sin((e.life + i * 20) * 0.02) * 0.35;
        e.y += e.vy;
        const k = e.life / e.max;
        const a = Math.sin(Math.PI * k) * fade * (0.6 + Math.random() * 0.4);
        ctx.beginPath();
        ctx.fillStyle = e.gold ? `rgba(255,196,110,${a})` : `rgba(230,59,46,${a})`;
        ctx.shadowBlur = 0;
        ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
        ctx.fill();
        if (e.life > e.max || e.y < -20) embers.splice(i, 1);
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  });
}

/* ---------------------------------------------------------------------------
   Background art parallax
   --------------------------------------------------------------------------- */
export function initArtParallax() {
  const arts = document.querySelectorAll<HTMLElement>('.bg-art');
  if (!arts.length || !matchMedia('(pointer: fine)').matches) return;
  const xTo = Array.from(arts, (a) => gsap.quickTo(a, 'x', { duration: 1.6, ease: 'power3.out' }));
  const yTo = Array.from(arts, (a) => gsap.quickTo(a, 'y', { duration: 1.6, ease: 'power3.out' }));
  addEventListener('pointermove', (e) => {
    const dx = (e.clientX / innerWidth - 0.5) * -24;
    const dy = (e.clientY / innerHeight - 0.5) * -16;
    xTo.forEach((f) => f(dx));
    yTo.forEach((f) => f(dy));
  }, { passive: true });
}
