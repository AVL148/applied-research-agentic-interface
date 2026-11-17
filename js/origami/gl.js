// Minimal WebGL renderer for flat-shaded two-sided paper polygons, edges and dashed crease lines.
// No libraries: one program for triangles (coloured front / white back) and one for lines.

const VS = `
attribute vec3 aPos; attribute vec3 aNormal;
uniform mat4 uMvp; uniform mat3 uNormalMat;
varying vec3 vN; varying vec3 vPos;
void main(){ vN = uNormalMat * aNormal; vPos = aPos; gl_Position = uMvp * vec4(aPos, 1.0); }`;
const FS = `
precision mediump float;
varying vec3 vN; varying vec3 vPos;
uniform vec3 uFront; uniform vec3 uBack; uniform vec3 uLight;
void main(){
  vec3 n = normalize(vN);
  vec3 base = gl_FrontFacing ? uFront : uBack;
  if(!gl_FrontFacing) n = -n;
  float d = max(dot(n, normalize(uLight)), 0.0);
  float l = 0.78 + 0.28 * d;
  gl_FragColor = vec4(base * l, 1.0);
}`;
const LVS = `attribute vec3 aPos; uniform mat4 uMvp; void main(){ gl_Position = uMvp * vec4(aPos,1.0); gl_Position.z -= 0.0006 * gl_Position.w; }`;
const LFS = `precision mediump float; uniform vec4 uColor; void main(){ gl_FragColor = uColor; }`;

function mat4Persp(fov, aspect, near, far) {
  const f = 1 / Math.tan(fov / 2);
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, (2 * far * near) / (near - far), 0];
}
function mat4Mul(a, b) {
  const o = new Array(16).fill(0);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let k = 0; k < 4; k++) o[j * 4 + i] += a[k * 4 + i] * b[j * 4 + k];
  return o;
}
function lookAt(eye, c, up) {
  const z = norm(sub(eye, c)); const x = norm(cross(up, z)); const y = cross(z, x);
  return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1];
}
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };

function shader(gl, type, src) {
  const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}
function program(gl, vs, fs) {
  const p = gl.createProgram(); gl.attachShader(p, shader(gl, gl.VERTEX_SHADER, vs)); gl.attachShader(p, shader(gl, gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  return p;
}

export function createRenderer(canvas, { front = [0.851, 0.475, 0.31], back = [1, 0.992, 0.973] } = {}) {
  const gl = canvas.getContext('webgl', { antialias: true, alpha: true, preserveDrawingBuffer: true });
  if (!gl) throw new Error('no webgl');
  const tri = program(gl, VS, FS);
  const lin = program(gl, LVS, LFS);
  const buf = gl.createBuffer();
  const cam = { az: -0.55, el: 0.95, dist: 430, target: [0, 0, 0] };
  const L = (p, n) => ({ a: gl.getAttribLocation(p, n), u: (m) => gl.getUniformLocation(p, m) });

  function resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
  }

  function render(faces, extras = {}) {
    resize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    const eye = [
      cam.target[0] + cam.dist * Math.cos(cam.el) * Math.sin(cam.az),
      cam.target[1] - cam.dist * Math.cos(cam.el) * Math.cos(cam.az),
      cam.target[2] + cam.dist * Math.sin(cam.el),
    ];
    const view = lookAt(eye, cam.target, [0, 0, 1]);
    const proj = mat4Persp(0.62, canvas.width / canvas.height, 20, 1400);
    const mvp = mat4Mul(proj, view);
    // triangles
    const tv = [];
    for (const f of faces) {
      const P = f.P;
      const a = sub(P[1], P[0]);
      for (let i = 1; i < P.length - 1; i++) {
        const b = sub(P[i + 1], P[0]);
        const n = norm(cross(sub(P[i], P[0]), b));
        for (const p of [P[0], P[i], P[i + 1]]) tv.push(p[0], p[1], p[2], n[0], n[1], n[2]);
      }
      void a;
    }
    gl.useProgram(tri);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tv), gl.DYNAMIC_DRAW);
    const aPos = gl.getAttribLocation(tri, 'aPos'), aNor = gl.getAttribLocation(tri, 'aNormal');
    gl.enableVertexAttribArray(aPos); gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 24, 0);
    gl.enableVertexAttribArray(aNor); gl.vertexAttribPointer(aNor, 3, gl.FLOAT, false, 24, 12);
    gl.uniformMatrix4fv(gl.getUniformLocation(tri, 'uMvp'), false, new Float32Array(mvp));
    gl.uniformMatrix3fv(gl.getUniformLocation(tri, 'uNormalMat'), false, new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]));
    gl.uniform3fv(gl.getUniformLocation(tri, 'uFront'), front);
    gl.uniform3fv(gl.getUniformLocation(tri, 'uBack'), back);
    gl.uniform3fv(gl.getUniformLocation(tri, 'uLight'), [0.35, -0.45, 0.82]);
    gl.enable(gl.POLYGON_OFFSET_FILL); gl.polygonOffset(1, 1);
    gl.drawArrays(gl.TRIANGLES, 0, tv.length / 6);
    gl.disable(gl.POLYGON_OFFSET_FILL);
    // lines
    const drawLines = (verts, color, mode = gl.LINES) => {
      if (!verts.length) return;
      gl.useProgram(lin);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);
      const la = gl.getAttribLocation(lin, 'aPos');
      gl.enableVertexAttribArray(la); gl.vertexAttribPointer(la, 3, gl.FLOAT, false, 12, 0);
      gl.uniformMatrix4fv(gl.getUniformLocation(lin, 'uMvp'), false, new Float32Array(mvp));
      gl.uniform4fv(gl.getUniformLocation(lin, 'uColor'), color);
      gl.drawArrays(mode, 0, verts.length / 3);
    };
    const edgeV = [], boundV = [];
    for (const f of faces) {
      const n = f.P.length;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const bound = isBoundary(f.uv[i], f.uv[j]);
        (bound ? boundV : edgeV).push(...f.P[i], ...f.P[j]);
      }
    }
    drawLines(edgeV, [0.17, 0.15, 0.13, 0.35]);
    drawLines(boundV, [0.17, 0.15, 0.13, 0.9]);
    if (extras.creases) drawLines(extras.creases.valley || [], [0.12, 0.31, 0.6, 1]);
    if (extras.creases) drawLines(extras.creases.mountain || [], [0.54, 0.18, 0.18, 1]);
  }

  return { gl, cam, render, canvas };
}

const SZ = 160;
function isBoundary(a, b) {
  const e = 1e-3;
  return (Math.abs(a[0]) < e && Math.abs(b[0]) < e) || (Math.abs(a[0] - SZ) < e && Math.abs(b[0] - SZ) < e) || (Math.abs(a[1]) < e && Math.abs(b[1]) < e) || (Math.abs(a[1] - SZ) < e && Math.abs(b[1] - SZ) < e);
}
