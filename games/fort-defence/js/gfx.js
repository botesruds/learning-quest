/* Rendering core: renderer, sky, lights, camera rig, particles, screen shake, and shared blocky helpers. */
import * as THREE from "three";
import { RoundedBoxGeometry } from "../vendor/addons/RoundedBoxGeometry.js";

export { THREE };
export const isTouch = matchMedia("(pointer: coarse)").matches;
export const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
export const lowGfx = new URLSearchParams(location.search).has("lowgfx");   // simpler graphics (automated tests, very old tablets)

/* ---------- cached geometry and materials ---------- */
const geoCache = new Map(), matCache = new Map();
export function rbox(w, h, d, r = 0.08) {
  const k = `${w}|${h}|${d}|${r}`;
  if (!geoCache.has(k)) geoCache.set(k, r > 0 ? new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2)) : new THREE.BoxGeometry(w, h, d));
  return geoCache.get(k);
}
export function mat(color, o = {}) {
  const k = color + JSON.stringify(o);
  if (!matCache.has(k)) matCache.set(k, new THREE.MeshStandardMaterial({ color, roughness: o.rough ?? 0.78, metalness: o.metal ?? 0, emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 1, transparent: !!o.opacity, opacity: o.opacity ?? 1, flatShading: !!o.flat }));
  return matCache.get(k);
}
/* a chunky block: mesh with shadows, placed by its bottom centre */
export function block(w, h, d, color, x = 0, y = 0, z = 0, o = {}) {
  const m = new THREE.Mesh(rbox(w, h, d, o.r ?? 0.08), o.material || mat(color, o));
  m.position.set(x, y + h / 2, z); m.castShadow = o.cast ?? true; m.receiveShadow = o.receive ?? true;
  return m;
}
export const group = (...kids) => { const g = new THREE.Group(); kids.forEach(k => k && g.add(k)); return g; };

/* ---------- the stage ---------- */
export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !lowGfx, powerPreference: "high-performance" });
  const dpr = lowGfx ? 1 : Math.min(window.devicePixelRatio || 1, isTouch ? 1.6 : 2);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !lowGfx; renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(42, 1, 0.5, 400);

  // sky dome with a soft gradient (changes for day and night)
  const skyU = { top: { value: new THREE.Color(0x3a8ee6) }, mid: { value: new THREE.Color(0xa8d8ff) }, bot: { value: new THREE.Color(0xa8d8ff) } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(200, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false, uniforms: skyU,
    vertexShader: "varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }",
    fragmentShader: "uniform vec3 top,mid,bot; varying vec3 vP; void main(){ float h=vP.y; vec3 c = h>0.0 ? mix(mid,top,smoothstep(0.0,0.55,h)) : mix(mid,bot,smoothstep(0.0,-0.3,h)); gl_FragColor=vec4(c,1.0);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}",
  }));
  scene.add(sky);
  scene.fog = new THREE.Fog(0xa8d8ff, 55, 150);

  const hemi = new THREE.HemisphereLight(0xdff1ff, 0x5a7d3a, 1.25); scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xfff1d6, 2.6);
  sun.position.set(18, 30, 12); sun.castShadow = true;
  const sm = isTouch ? 1024 : 2048; sun.shadow.mapSize.set(sm, sm);
  Object.assign(sun.shadow.camera, { left: -26, right: 26, top: 26, bottom: -26, near: 1, far: 90 });
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 3;
  scene.add(sun, sun.target);

  /* palettes for time of day */
  const MOODS = {
    day: { top: 0x3a8ee6, mid: 0xa8d8ff, bot: 0xa8d8ff, fog: 0xa8d8ff, hemi: [0xdff1ff, 0x5a7d3a, 1.25], sun: [0xfff1d6, 2.6], exp: 1.05 },
    dusk: { top: 0x3b3f8f, mid: 0xf2a07c, bot: 0xf2a07c, fog: 0xf2a07c, hemi: [0xffc9a8, 0x4b3d5a, 1.0], sun: [0xffb070, 2.0], exp: 1.0 },
    night: { top: 0x0b0f2e, mid: 0x27306b, bot: 0x27306b, fog: 0x27306b, hemi: [0x6f7dd8, 0x1a1530, 0.9], sun: [0x9fb4ff, 1.1], exp: 1.15 },
  };
  function setMood(name) {
    const m = MOODS[name] || MOODS.day;
    skyU.top.value.set(m.top); skyU.mid.value.set(m.mid); skyU.bot.value.set(m.bot); scene.fog.color.set(m.fog);
    hemi.color.set(m.hemi[0]); hemi.groundColor.set(m.hemi[1]); hemi.intensity = m.hemi[2];
    sun.color.set(m.sun[0]); sun.intensity = m.sun[1]; renderer.toneMappingExposure = m.exp;
  }

  /* camera rig: orbit around a target, smoothed; shake on top */
  const rig = { target: new THREE.Vector3(0, 1, 0), yaw: 0.7, pitch: 0.62, dist: 34, goal: null, autoSpin: 0 };
  let shakeT = 0, shakeAmp = 0;
  function shake(amp = 0.4, dur = 0.35) { if (reducedMotion) return; shakeAmp = Math.max(shakeAmp, amp); shakeT = Math.max(shakeT, dur); }
  function flyTo(goal, secs = 1.6) { rig.goal = { from: { ...rig, target: rig.target.clone() }, to: goal, t: 0, secs }; }
  function applyCamera(dt) {
    if (rig.goal) {
      const g = rig.goal; g.t = Math.min(1, g.t + dt / g.secs); const e = g.t < 0.5 ? 4 * g.t ** 3 : 1 - (-2 * g.t + 2) ** 3 / 2;
      ["yaw", "pitch", "dist"].forEach(k => { if (g.to[k] !== undefined) rig[k] = g.from[k] + (g.to[k] - g.from[k]) * e; });
      if (g.to.target) rig.target.lerpVectors(g.from.target, g.to.target, e);
      if (g.t >= 1) rig.goal = null;
    } else if (rig.autoSpin && !reducedMotion) rig.yaw += rig.autoSpin * dt;
    const cp = Math.cos(rig.pitch);
    camera.position.set(rig.target.x + Math.sin(rig.yaw) * cp * rig.dist, rig.target.y + Math.sin(rig.pitch) * rig.dist, rig.target.z + Math.cos(rig.yaw) * cp * rig.dist);
    camera.lookAt(rig.target);
    if (shakeT > 0) { shakeT -= dt; const a = shakeAmp * Math.max(0, shakeT) * 2.5; camera.position.x += (Math.random() - 0.5) * a; camera.position.y += (Math.random() - 0.5) * a; if (shakeT <= 0) shakeAmp = 0; }
    sun.target.position.copy(rig.target); sun.position.set(rig.target.x + 18, 30, rig.target.z + 12);
  }

  let shiftPx = 0;   // lifts the picture so the fort sits in the space above the build tray
  function resize() {
    const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.fov = w / h < 0.8 ? 58 : 42; // portrait iPad / phone: widen the view
    if (shiftPx) camera.setViewOffset(w, h, 0, shiftPx, w, h); else camera.clearViewOffset();
    camera.updateProjectionMatrix();
  }
  function setShift(px) { shiftPx = Math.round(px || 0); resize(); }
  addEventListener("resize", resize); resize();

  const updaters = new Set();
  const clock = new THREE.Clock();
  let fps = 60, frames = 0, acc = 0, running = true;
  function loop() {
    if (!running) return;
    requestAnimationFrame(loop);
    const dt = Math.min(clock.getDelta(), 0.05), t = clock.elapsedTime;
    frames++; acc += dt; if (acc > 0.5) { fps = frames / acc; frames = 0; acc = 0; }
    updaters.forEach(fn => fn(dt, t));
    applyCamera(dt);
    renderer.render(scene, camera);
  }
  document.addEventListener("visibilitychange", () => { if (document.hidden) running = false; else if (!running) { running = true; clock.getDelta(); loop(); } });
  loop();

  return { renderer, scene, camera, sun, hemi, rig, setMood, shake, flyTo, resize, setShift, onFrame: fn => (updaters.add(fn), () => updaters.delete(fn)), get fps() { return fps; } };
}

/* ---------- particles: pooled little cubes (dust, sparkles, confetti, demon pops) ---------- */
export function createParticles(scene, max = 600) {
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mesh = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ roughness: 0.6 }), max);
  mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(max * 3), 3);
  mesh.frustumCulled = false; mesh.castShadow = false; scene.add(mesh);
  const P = Array.from({ length: max }, () => ({ life: 0 }));
  const dummy = new THREE.Object3D(), col = new THREE.Color(); let head = 0;
  for (let i = 0; i < max; i++) { dummy.scale.setScalar(0); dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix); }
  function emit(pos, { n = 12, color = 0xffffff, colors = null, speed = 3, up = 3, size = 0.18, life = 0.8, grav = 9, spread = 1, spin = 6 } = {}) {
    if (reducedMotion) n = Math.ceil(n / 3);
    for (let k = 0; k < n; k++) {
      const p = P[head]; const i = head; head = (head + 1) % max;
      const a = Math.random() * Math.PI * 2, s = speed * (0.4 + Math.random() * 0.8);
      Object.assign(p, { i, x: pos.x + (Math.random() - 0.5) * spread * 0.5, y: pos.y, z: pos.z + (Math.random() - 0.5) * spread * 0.5,
        vx: Math.cos(a) * s, vy: up * (0.5 + Math.random()), vz: Math.sin(a) * s, life, max: life, size: size * (0.6 + Math.random() * 0.8), grav,
        rx: Math.random() * 6, ry: Math.random() * 6, spin: (Math.random() - 0.5) * spin });
      col.set(colors ? colors[k % colors.length] : color); mesh.setColorAt(i, col);
    }
    mesh.instanceColor.needsUpdate = true;
  }
  function update(dt) {
    let any = false;
    for (const p of P) {
      if (p.life <= 0) continue; any = true;
      p.life -= dt; p.vy -= p.grav * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
      if (p.y < 0.05) { p.y = 0.05; p.vy *= -0.3; p.vx *= 0.7; p.vz *= 0.7; }
      p.rx += p.spin * dt; p.ry += p.spin * dt;
      const k = Math.max(0, p.life / p.max), s = p.size * (k < 0.3 ? k / 0.3 : 1);
      dummy.position.set(p.x, p.y, p.z); dummy.rotation.set(p.rx, p.ry, 0); dummy.scale.setScalar(p.life > 0 ? s : 0); dummy.updateMatrix(); mesh.setMatrixAt(p.i, dummy.matrix);
    }
    if (any) mesh.instanceMatrix.needsUpdate = true;
  }
  return { emit, update };
}

/* ---------- tiny value-noise for terrain ---------- */
export function noise2(seed = 1) {
  const r = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453; return s - Math.floor(s); };
  const sm = t => t * t * (3 - 2 * t);
  return (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const a = r(xi, yi), b = r(xi + 1, yi), c = r(xi, yi + 1), d = r(xi + 1, yi + 1), u = sm(xf), v = sm(yf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
}
