// 3D fold player: draws a clip with the WebGL renderer, with play / pause / replay, a scrubber, slow motion
// and drag-to-rotate. Falls back (returns null) when WebGL is not available.
import { createRenderer } from './gl.js';
import { poseOp } from './engine.js';
import { CLIPS, getOps, clipDuration, clipPose } from './clips.js';
import { t as tr } from '../i18n.js';

const LEAD = 0.5; // seconds to hold the first pose
const TAIL = 0.8; // seconds to hold the last pose

function dashes(a, b, z, out, dash = 7, gap = 4.5, offset = 0) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  const ux = dx / len, uy = dy / len;
  for (let s = offset; s < len; s += dash + gap) {
    const e = Math.min(len, s + dash);
    out.push(a[0] + ux * s, a[1] + uy * s, z, a[0] + ux * e, a[1] + uy * e, z);
  }
}

export function mountPlayer(box, clipId, { autoplay = true } = {}) {
  const clip = CLIPS[clipId];
  if (!clip) return null;
  const ops = getOps();
  const canvas = box.querySelector('canvas');
  let r;
  try { r = createRenderer(canvas); } catch { return null; }
  const cam = r.cam;
  const home = { az: clip.cam?.az ?? 0, el: clip.cam?.el ?? 1.05, dist: clip.cam?.dist ?? clip.dist ?? 350 };
  Object.assign(cam, home);
  cam.target = clip.target || [0, 0, 0];

  const total = clipDuration(clip);
  const animated = total > 0;
  const state = { p: autoplay && animated ? 0 : 1, playing: autoplay && animated, speed: 1, hold: LEAD, raf: 0, last: 0, dead: false };
  const slider = box.querySelector('.pl-slider');
  const playBtn = box.querySelector('[data-pl="play"]');

  const draw = () => {
    const res = clipPose(poseOp, ops, clip, animated ? state.p : 1);
    const extras = {};
    if (res.op?.creases?.length && res.k < (res.op.spec?.creaseUntil ?? 0.85)) {
      const valley = [], mountain = [];
      for (const c of res.op.creases) dashes(c.a, c.b, 0.9, c.kind === 'mountain' ? mountain : valley, c.kind === 'mountain' ? 9 : 7, 4.5);
      extras.creases = { valley, mountain };
    }
    r.render(res.faces, extras);
    if (slider) slider.value = String(Math.round(state.p * 1000));
  };

  const setPlaying = (on) => {
    state.playing = on;
    if (playBtn) {
      playBtn.textContent = on ? '❚❚' : '▶';
      playBtn.setAttribute('aria-label', on ? tr('Pause') : state.p >= 1 ? tr('Play again') : tr('Play'));
    }
  };

  const tick = (now) => {
    if (state.dead) return;
    if (!canvas.isConnected) { api.destroy(); return; }
    const dt = Math.min(0.05, (now - (state.last || now)) / 1000);
    state.last = now;
    if (state.playing) {
      if (state.hold > 0) state.hold -= dt;
      else {
        state.p += (dt * state.speed) / total;
        if (state.p >= 1) { state.p = 1; state.hold = TAIL; setPlaying(false); }
      }
      draw();
    }
    state.raf = requestAnimationFrame(tick);
  };

  // controls
  box.addEventListener('click', (e) => {
    const b = e.target.closest('[data-pl]');
    if (!b) return;
    const act = b.dataset.pl;
    if (act === 'play') {
      if (state.playing) setPlaying(false);
      else { if (state.p >= 1) { state.p = 0; state.hold = 0.15; } setPlaying(true); }
    } else if (act === 'replay') { state.p = 0; state.hold = LEAD; setPlaying(true); }
    else if (act === 'slow') {
      state.speed = state.speed === 1 ? 0.4 : 1;
      b.setAttribute('aria-pressed', String(state.speed !== 1));
      b.classList.toggle('on', state.speed !== 1);
    } else if (act === 'view') { Object.assign(cam, home); }
    draw();
  });
  slider?.addEventListener('input', () => { state.p = Number(slider.value) / 1000; state.hold = 0; setPlaying(false); draw(); });

  // drag to rotate
  let drag = null;
  canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); canvas.classList.add('drag'); });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return;
    cam.az -= (e.clientX - drag.x) * 0.009;
    cam.el = Math.max(-0.2, Math.min(1.5, cam.el + (e.clientY - drag.y) * 0.009));
    drag = { x: e.clientX, y: e.clientY };
    draw();
  });
  const end = () => { drag = null; canvas.classList.remove('drag'); };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);
  canvas.addEventListener('dblclick', () => { Object.assign(cam, home); draw(); });
  canvas.addEventListener('keydown', (e) => {
    const k = { ArrowLeft: [-0.12, 0], ArrowRight: [0.12, 0], ArrowUp: [0, -0.1], ArrowDown: [0, 0.1] }[e.key];
    if (k) { e.preventDefault(); cam.az += k[0]; cam.el = Math.max(-0.2, Math.min(1.5, cam.el + k[1])); draw(); }
  });
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => draw()) : null;
  ro?.observe(canvas);

  setPlaying(state.playing);
  draw();
  if (animated) state.raf = requestAnimationFrame(tick);

  const api = {
    destroy() {
      state.dead = true;
      cancelAnimationFrame(state.raf);
      ro?.disconnect();
      try { r.gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch { /* ignore */ }
    },
    // for tests: jump to progress p and redraw
    seek(p) { state.p = p; state.playing = false; draw(); },
  };
  return api;
}
