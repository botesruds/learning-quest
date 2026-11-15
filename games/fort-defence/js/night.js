/* The night: demons attack the fort, and today's Brain check is fought with glowing runes.
   - Demons walk the cheapest path to the keep. Walls and buildings in the way are attacked until they break
     (just for tonight: builders patch them by morning). Bats fly straight over. Cracked walls are weak, so demons go for them.
   - Towers and traps fight on their own. Gold drops for every demon defeated.
   - A rune appears with each wave. Tapping it freezes the battle (no clock on any question).
     Right: a star strike blasts the demons and patches the most damaged wall. Wrong: a wall cracks (a weak spot, fixed tomorrow
     with 2 right answers on that topic). Wrong answers always show the reason.
   - 6 runes a night: today's 4 Brain check questions (3 right earns the third star, the same pass mark as Algebra Quest)
     and 2 quick questions on today's topic. The fort can't be lost: demons that reach the keep just bump it and vanish. */
import { THREE, block, reducedMotion, isTouch } from "./gfx.js";
import { makeDemon } from "./models.js";
import { PIECES } from "./pieces.js";
import { h, pick, shuffle } from "./qcore.js";
import { QuestionCard } from "./qui.js";
import { sfx, playMusic } from "./audio.js";

const BLOCKS = new Set(["wall", "gate", "arrow", "cannon", "house", "well", "statue", "torch", "banner", "bush"]);
const HP = { wall: [6, 12, 20], gate: [8, 14, 22], arrow: [10, 16, 24], cannon: [10, 16, 24], house: [6, 8, 10], well: [6, 8, 10], statue: [6, 8, 10], torch: [3, 4, 5], banner: [3, 4, 5], bush: [2, 3, 4] };
const TOWER = { arrow: { dmg: [1, 1.5, 2.2], cd: [1.0, 0.85, 0.7], splash: 0, speed: 16, sound: "arrow" }, cannon: { dmg: [2, 3, 4], cd: [2.2, 2.0, 1.8], splash: 1.5, speed: 10, sound: "cannon" } };
const TRAP = { spikes: [1.5, 2.5, 3.5], goo: [0.45, 0.35, 0.25] };
const DEMON = { imp: { hp: 4, speed: 1.15, fly: false, atk: 1 }, bat: { hp: 2.5, speed: 1.55, fly: true, atk: 1 } };
const WAVES = [["imp", "imp", "imp"], ["imp", "bat", "imp"], ["imp", "imp", "bat", "imp"], ["bat", "imp", "imp", "bat"], ["imp", "imp", "bat", "imp", "imp"], ["imp", "bat", "imp", "bat", "imp"]];
export const NIGHT_VIEW = { yaw: 0.78, pitch: 0.95, dist: isTouch ? 50 : 46, target: new THREE.Vector3(-1, 1, -1) };
const K = (x, z) => x + "," + z;

/* a small binary heap for Dijkstra */
function heap() { const a = []; return { push(n, p) { a.push([p, n]); let i = a.length - 1; while (i) { const j = (i - 1) >> 1; if (a[j][0] <= a[i][0]) break; [a[i], a[j]] = [a[j], a[i]]; i = j; } }, pop() { const top = a[0], last = a.pop(); if (a.length) { a[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < a.length && a[l][0] < a[m][0]) m = l; if (r < a.length && a[r][0] < a[m][0]) m = r; if (m === i) break; [a[i], a[m]] = [a[m], a[i]]; i = m; } } return top[1]; }, get size() { return a.length; } }; }

export function createNight({ stage, fx, fort, island, save, prog, ui, toast, onMorning, onLeave, hud }) {
  const { scene, camera } = stage;
  const S = () => save.state;
  let N = null;            // the running night

  /* ---------- the ground the demons walk on ---------- */
  const land = new Map(); island.userData.cells.forEach(c => land.set(K(c.gx, c.gz), c));
  const spawnCells = [[-30, -20], [4, -32], [-32, 7]].map(([x, z]) => island.userData.cells.filter(c => c.shore).sort((a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z))[0]);
  const blocking = c => c && BLOCKS.has(c.t) && !c.broken;
  function stepCost(from, to) {
    const p = fort.at(to.gx, to.gz); let k = 1;
    if (fort.inKeep(to.gx, to.gz)) k = 1;
    else if (blocking(p)) k = 9 - (p.cracked ? 5 : 0) + p.lv;
    else if (p && p.t === "moat") k = 3;
    return k + Math.abs((to.h || 1) - (from.h || 1)) * 0.6;
  }
  function distances() {
    const dist = new Map(), q = heap();
    land.forEach((c, k) => { if (fort.inKeep(c.gx, c.gz)) { dist.set(k, 0); q.push(c, 0); } });
    while (q.size) {
      const c = q.pop(), d = dist.get(K(c.gx, c.gz));
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const n = land.get(K(c.gx + dx, c.gz + dz)); if (!n) continue;
        const nd = d + stepCost(n, c), key = K(n.gx, n.gz);   // cost of walking from n into c
        if (nd < (dist.has(key) ? dist.get(key) : Infinity)) { dist.set(key, nd); q.push(n, nd); }
      }
    }
    return dist;
  }

  /* ---------- little 3D helpers ---------- */
  const barGeo = new THREE.PlaneGeometry(0.9, 0.12);
  function hpBar() { const g = new THREE.Group(); const bg = new THREE.Mesh(barGeo, new THREE.MeshBasicMaterial({ color: 0x1b1530, depthTest: false, transparent: true, opacity: 0.7 })); const fg = new THREE.Mesh(barGeo, new THREE.MeshBasicMaterial({ color: 0x5cff7a, depthTest: false })); fg.position.z = 0.001; g.add(bg, fg); g.renderOrder = 10; bg.renderOrder = 10; fg.renderOrder = 11; g.userData.fg = fg; return g; }
  function portal(c) { const g = new THREE.Group(); g.position.set(c.x, c.h + 0.02, c.z); const ring = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.12, 8, 24), new THREE.MeshStandardMaterial({ color: 0xb388ff, emissive: 0x8b5cf6, emissiveIntensity: 2 })); ring.rotation.x = Math.PI / 2; g.add(ring); const l = new THREE.PointLight(0xa070ff, 6, 6); l.position.y = 1; g.add(l); g.userData.ring = ring; return g; }
  function makeRune() {
    const g = new THREE.Group(); const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.7), new THREE.MeshStandardMaterial({ color: 0x9ff3ff, emissive: 0x38d9ff, emissiveIntensity: 2.2, flatShading: true }));
    const halo = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.06, 6, 30), new THREE.MeshBasicMaterial({ color: 0xc8fbff })); g.add(gem, halo); const l = new THREE.PointLight(0x7ff0ff, 10, 10); g.add(l);
    g.userData.gem = gem; g.userData.halo = halo; g.position.set(0, 8.4, 0); g.visible = false; return g;
  }
  function beam(x, z) {
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 1.1, 30, 12, 1, true), new THREE.MeshBasicMaterial({ color: 0xbff8ff, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false }));
    m.position.set(x, 15, z); scene.add(m); let t = 0; N.fx.push(dt => { t += dt; m.material.opacity = Math.max(0, 0.85 - t * 1.6); m.scale.x = m.scale.z = 1 + t * 2; if (t > 0.6) { scene.remove(m); m.geometry.dispose(); return false; } return true; });
  }

  /* ---------- start a night ---------- */
  let timeScale = 1;   // tests speed the battle up (software graphics run at a few frames a second)
  function start(key) {
    const tp = prog.topic(key); if (!tp) return;
    stop(true);
    const checks = shuffle(tp.t.checks || []).slice(0, 4);
    const quick = (tp.t.gen || []).length ? [0, 1].map(() => pick(tp.t.gen)()) : [];
    // runes: quick, brain, brain, quick, brain, brain
    const runes = []; const qs = quick.slice(), cs = checks.slice();
    [["q"], ["b"], ["b"], ["q"], ["b"], ["b"]].forEach(([t]) => { if (t === "q" && qs.length) runes.push({ type: "quick", obj: qs.shift() }); else if (cs.length) runes.push({ type: "brain", obj: cs.shift() }); else if (qs.length) runes.push({ type: "quick", obj: qs.shift() }); });
    const strength = 1 + prog.dayNo(key) * 0.05;
    N = { key, tp, runes, seg: -1, segT: 0, spawnQ: [], demons: [], shots: [], fx: [], time: 0, frozen: false, rune: null, runeReady: false, runeDone: true,
      brain: { right: 0, total: checks.length }, kills: 0, bumps: 0, gold: 0, crystal: 0, cracks: [], strength, wave: 0 };
    // tonight every piece is at full strength (cracked ones at half)
    const cr = Object.fromEntries(fort.crackList().map(c => [c.cell, c.topic]));
    fort.cells.forEach(c => { c.broken = false; c.cracked = !!cr[K(c.gx, c.gz)]; c.nightHp = c.maxHp = HP[c.t] ? HP[c.t][c.lv - 1] * (c.cracked ? 0.5 : 1) : 0; c.cd = Math.random(); if (c.obj) c.obj.scale.set(1, 1, 1); });
    N.dist = distances();
    N.portals = spawnCells.map(c => { const p = portal(c); scene.add(p); return p; });
    N.runeObj = makeRune(); scene.add(N.runeObj);
    stage.setMood("night"); fort.cells.forEach(c => { if (c.obj && c.obj.userData.light) c.obj.userData.light.intensity = 6; });
    playMusic("night"); sfx("horn");
    stage.setShift(0, 0); stage.flyTo(NIGHT_VIEW, 1.6); stage.rig.autoSpin = 0;
    N.off = stage.onFrame(update);
    paintHud();
    toast(`Night falls. Defend your fort! Tap each ✨ rune when it appears.`);
    N.nextSeg = 2.2;
  }

  function stop(quiet) {
    if (!N) return;
    N.off && N.off();
    N.demons.forEach(d => scene.remove(d.obj)); N.shots.forEach(s => scene.remove(s.m)); (N.portals || []).forEach(p => scene.remove(p)); if (N.runeObj) scene.remove(N.runeObj);
    fort.cells.forEach(c => { c.broken = false; c.cracked = false; if (c.obj) { c.obj.scale.set(1, 1, 1); if (c.obj.userData.light) c.obj.userData.light.intensity = 0; } });
    document.querySelectorAll(".freeze").forEach(e => e.remove());
    N = null;
    if (!quiet) stage.setMood("day");
  }

  /* ---------- the battle, every frame ---------- */
  function update(dt, t) {
    if (!N) return;
    const live = N.frozen ? 0 : dt * timeScale;
    N.time += live;
    // runes and waves
    if (N.runeObj.visible) { N.runeObj.rotation.y += dt * 1.5; N.runeObj.userData.gem.position.y = Math.sin(t * 3) * 0.25; N.runeObj.userData.halo.rotation.x = Math.PI / 2 + Math.sin(t * 2) * 0.3; }
    N.portals.forEach(p => (p.userData.ring.rotation.z += dt * 2));
    if (!N.frozen) {
      if (N.nextSeg != null) { N.nextSeg -= live; if (N.nextSeg <= 0) { N.nextSeg = null; nextSegment(); } }
      if (N.spawnQ.length) { N.spawnQ[0].t -= live; if (N.spawnQ[0].t <= 0) spawn(N.spawnQ.shift()); }
      if (N.runeAt != null) { N.runeAt -= live; if (N.runeAt <= 0) { N.runeAt = null; showRune(); } }
      if (N.runeDone && N.nextSeg == null && !N.spawnQ.length && N.runeAt == null) {
        N.after = (N.after || 0) + live;
        const alive = N.demons.length;
        if (N.seg < N.runes.length - 1 && (alive <= 1 || N.after > 9)) { N.after = 0; N.nextSeg = 0.8; }
        else if (N.seg >= N.runes.length - 1 && alive === 0) { N.after = 0; return finish(); }
      }
    }
    // demons
    for (const d of N.demons.slice()) {
      d.obj.userData.update && d.obj.userData.update(N.frozen ? dt * 0.2 : dt, t);
      d.bar.quaternion.copy(camera.quaternion); d.bar.userData.fg.scale.x = Math.max(0.001, d.hp / d.max); d.bar.userData.fg.position.x = -0.45 * (1 - d.hp / d.max);
      if (d.hitT > 0) { d.hitT -= dt; const s = 1 + d.hitT * 1.5; d.obj.scale.set(s, s, s); }
      if (!live) continue;
      d.age += live; if (d.age > 70) { removeDemon(d); continue; }
      if (d.fly) {
        const dx = -d.obj.position.x + 0, dz = -d.obj.position.z + 0, len = Math.hypot(dx, dz);
        if (len < 1.8) { bump(d); continue; }
        d.obj.position.x += dx / len * d.speed * live; d.obj.position.z += dz / len * d.speed * live; d.obj.position.y = 2.4; d.obj.rotation.y = Math.atan2(dx, dz);
        continue;
      }
      walk(d, live);
    }
    // towers
    fort.cells.forEach(c => {
      const T = TOWER[c.t]; if (!T || c.broken || !live) return;
      c.cd -= live; const range = PIECES[c.t].range[c.lv - 1];
      let best = null, bd = Infinity;
      for (const d of N.demons) { const dd = Math.hypot(d.obj.position.x - (c.gx + 0.5), d.obj.position.z - (c.gz + 0.5)); if (dd <= range) { const k = N.dist.get(K(d.cx, d.cz)) ?? 99; if (k < bd) { bd = k; best = d; } } }
      if (c.obj && c.obj.userData.aim && best) { const a = Math.atan2(best.obj.position.x - (c.gx + 0.5), best.obj.position.z - (c.gz + 0.5)); c.obj.userData.aim.rotation.y = a; }
      if (best && c.cd <= 0) { c.cd = T.cd[c.lv - 1]; fire(c, best, T); }
    });
    // shots and effects
    for (const s of N.shots.slice()) {
      s.t += live; const k = Math.min(1, s.t / s.dur);
      s.m.position.lerpVectors(s.from, s.to, k); if (s.arc) s.m.position.y += Math.sin(k * Math.PI) * s.arc;
      if (s.dir) s.m.lookAt(s.to);
      if (k >= 1) { scene.remove(s.m); N.shots.splice(N.shots.indexOf(s), 1); land_(s); }
    }
    N.fx = N.fx.filter(f => f(dt));
    if (live) paintCount();
  }

  function walk(d, dt) {
    const cur = land.get(K(d.cx, d.cz));
    if (fort.inKeep(d.cx, d.cz)) return bump(d);
    if (!d.next) {
      let best = null, bd = N.dist.get(K(d.cx, d.cz)) ?? Infinity;
      for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const n = land.get(K(d.cx + dx, d.cz + dz)); if (!n) continue; const v = N.dist.get(K(n.gx, n.gz)); if (v != null && v < bd) { bd = v; best = n; } }
      if (!best) { removeDemon(d); return; }
      d.next = best;
    }
    const piece = fort.at(d.next.gx, d.next.gz);
    if (blocking(piece) && !fort.inKeep(d.next.gx, d.next.gz)) {     // something in the way: attack it
      d.atkT -= dt; d.obj.rotation.y = Math.atan2(d.next.x - d.obj.position.x, d.next.z - d.obj.position.z);
      d.obj.position.x += Math.sin(N.time * 18) * 0.004;
      if (d.atkT <= 0) {
        d.atkT = 0.8; piece.nightHp -= d.atk;
        if (Math.random() < 0.4) sfx("hit");
        fx.emit(new THREE.Vector3(d.next.x, 1.6, d.next.z), { n: 4, colors: [0xc9b48a, 0x9a8a6a], speed: 2, size: 0.12, life: 0.4 });
        if (piece.nightHp <= 0) breakPiece(piece);
      }
      return;
    }
    const slow = (fort.at(d.cx, d.cz) && fort.at(d.cx, d.cz).t === "goo") ? TRAP.goo[fort.at(d.cx, d.cz).lv - 1] : 1;
    const tx = d.next.x, tz = d.next.z, dx = tx - d.obj.position.x, dz = tz - d.obj.position.z, len = Math.hypot(dx, dz), step = d.speed * slow * dt;
    d.obj.rotation.y = Math.atan2(dx, dz);
    const baseY = (cur ? cur.h : 1) + ((d.next.h || 1) - (cur ? cur.h : 1)) * Math.max(0, 1 - len);
    d.obj.position.y = (piece && piece.t === "moat") ? baseY - 0.25 : baseY;
    if (len <= step) {
      d.obj.position.x = tx; d.obj.position.z = tz; d.cx = d.next.gx; d.cz = d.next.gz; d.next = null;
      const here = fort.at(d.cx, d.cz);
      if (here && here.t === "spikes") { damage(d, TRAP.spikes[here.lv - 1]); fx.emit(d.obj.position.clone().setY(1.2), { n: 5, color: 0xdddddd, size: 0.08, speed: 2 }); }
    } else { d.obj.position.x += dx / len * step; d.obj.position.z += dz / len * step; }
  }

  function breakPiece(p) {
    p.broken = true; p.nightHp = 0; sfx("crack"); stage.shake(0.25);
    if (p.obj) p.obj.scale.set(1, 0.35, 1);
    fx.emit(new THREE.Vector3(p.gx + 0.5, 1.4, p.gz + 0.5), { n: 18, colors: [0xc9b48a, 0x8a7a5a, 0xe6dcc8], speed: 3.5, size: 0.2, life: 0.9 });
    N.dist = distances(); N.demons.forEach(d => (d.next = null));
  }

  function spawn(s) {
    const D = DEMON[s.kind], c = spawnCells[s.portal % spawnCells.length];
    const obj = makeDemon(s.kind); obj.position.set(c.x, c.h, c.z); scene.add(obj);
    const bar = hpBar(); bar.position.y = s.kind === "bat" ? 2.3 : 1.5; obj.add(bar);
    const d = { obj, bar, kind: s.kind, fly: D.fly, speed: D.speed * (0.9 + Math.random() * 0.2), hp: D.hp * N.strength, max: D.hp * N.strength, atk: D.atk, atkT: 0.5, cx: c.gx, cz: c.gz, next: null, age: 0, hitT: 0 };
    N.demons.push(d); sfx("demon");
    fx.emit(new THREE.Vector3(c.x, c.h + 0.6, c.z), { n: 14, colors: [0xb388ff, 0x7c4dff, 0xffffff], speed: 3, size: 0.15 });
  }
  function nextSegment() {
    N.seg++; N.wave = N.seg + 1; N.runeDone = false;
    const kinds = WAVES[N.seg % WAVES.length];
    kinds.forEach((k, i) => N.spawnQ.push({ kind: k, portal: (i + N.seg) % 3, t: i ? 0.75 : 0.1 }));
    N.runeAt = 2.4; paintHud();
  }
  function fire(c, d, T) {
    const from = new THREE.Vector3(c.gx + 0.5, 1 + (c.t === "arrow" ? 2.3 + c.lv * 0.4 : 1.3), c.gz + 0.5);
    const lead = d.next ? new THREE.Vector3(d.next.x - d.obj.position.x, 0, d.next.z - d.obj.position.z).normalize().multiplyScalar(d.speed * 0.3) : new THREE.Vector3();
    const to = d.obj.position.clone().add(lead); to.y += d.fly ? 0.4 : 0.5;
    const m = c.t === "arrow" ? block(0.06, 0.06, 0.55, 0x7a4a22, 0, 0, 0, { r: 0.02, cast: false }) : block(0.32, 0.32, 0.32, 0x2a2a35, 0, 0, 0, { r: 0.15, cast: false });
    if (c.t === "arrow") m.geometry = m.geometry.clone().translate(0, -0.03, 0);
    m.position.copy(from); scene.add(m);
    const dur = Math.max(0.15, from.distanceTo(to) / T.speed);
    N.shots.push({ m, from, to, t: 0, dur, arc: c.t === "cannon" ? 1.6 : 0.3, dir: c.t === "arrow", target: d, dmg: T.dmg[c.lv - 1], splash: T.splash });
    sfx(T.sound);
    if (c.t === "cannon") fx.emit(from.clone(), { n: 6, colors: [0xffffff, 0xcccccc], speed: 1.5, size: 0.2, life: 0.5, grav: -1 });
  }
  function land_(s) {
    if (s.splash) {
      fx.emit(s.to.clone(), { n: 16, colors: [0xffb347, 0xff7043, 0x555555], speed: 4, size: 0.2 }); sfx("pop"); stage.shake(0.12);
      N.demons.slice().forEach(d => { if (d.obj.position.distanceTo(s.to) <= s.splash) damage(d, s.dmg); });
    } else if (N.demons.includes(s.target)) damage(s.target, s.dmg);
  }
  function damage(d, n) {
    d.hp -= n; d.hitT = 0.12;
    if (d.hp <= 0) {
      N.kills++; N.gold += 2;
      fx.emit(d.obj.position.clone().setY(d.obj.position.y + 0.6), { n: 22, colors: [0xffd23f, 0xb388ff, 0xffffff, 0x7cf3ff], speed: 4, size: 0.16, life: 0.9 });
      sfx("pop"); removeDemon(d);
    }
  }
  function removeDemon(d) { scene.remove(d.obj); const i = N.demons.indexOf(d); if (i >= 0) N.demons.splice(i, 1); }
  function bump(d) {
    N.bumps++; sfx("crack"); stage.shake(0.3);
    fx.emit(new THREE.Vector3(d.obj.position.x, 2, d.obj.position.z), { n: 16, colors: [0xb388ff, 0xffffff], speed: 3 });
    removeDemon(d);
  }

  /* ---------- runes ---------- */
  function showRune() {
    N.runeReady = true; N.runeObj.visible = true; sfx("star");
    paintHud();
  }
  function tapRune() {
    if (!N || !N.runeReady || N.frozen) return;
    const r = N.runes[N.seg]; if (!r) return;
    N.runeReady = false; N.runeObj.visible = false; N.frozen = true; sfx("freeze"); paintHud();
    const ov = h("div", { class: "freeze" });
    const card = h("div", { class: "runecard sheet", role: "dialog", "aria-label": "Rune question" });
    const label = `✨ Rune ${N.seg + 1} of ${N.runes.length} · ${r.type === "brain" ? "🧠 Brain check" : "⚡ Quick-fire"}`;
    let result = null;
    const resume = () => { ov.remove(); N.frozen = false; N.runeDone = true; N.after = 0; if (result === "right" || result === "half") strike(result === "half" ? 0.55 : 1); else fizzle(); paintHud(); };
    if (r.type === "brain") {
      const c = r.obj, body = h("div", { class: "card stack pop" });
      body.append(h("div", { class: "eyebrow" }, label), h("div", { class: "qs" }, c.q));
      const fb = h("div"), nx = h("button", { class: "btn primary hide", type: "button", onclick: resume }, "✨ Cast the rune");
      const opts = h("div", { class: "opts" + (c.c.some(x => x.length > 14) ? " col" : "") });
      c.c.forEach((txt, i) => opts.append(h("button", { class: "opt", type: "button", onclick: () => {
        opts.querySelectorAll("button").forEach(b => (b.disabled = true)); opts.children[c.a].classList.add("ok");
        if (i === c.a) { result = "right"; N.brain.right++; N.crystal++; S().mats.crystal = (S().mats.crystal || 0) + 1; save.commit(); sfx("correct"); fb.className = "verdict good"; fb.innerHTML = "<b>Yes! The rune glows. +1 💎</b> " + c.why; }
        else { result = "wrong"; sfx("wrong"); opts.children[i].classList.add("no"); fb.className = "verdict bad"; fb.innerHTML = "<b>The rune flickers out.</b> " + c.why; nx.textContent = "Continue"; }
        prog.record(N.key, i === c.a ? "own" : "wrong"); nx.classList.remove("hide"); setTimeout(() => nx.focus({ preventScroll: true }), 50);
      } }, txt)));
      body.append(opts, fb, nx); card.append(body);
      window.__fdq = { type: "brain", obj: c };
    } else {
      const q = r.obj; window.__fdq = { type: "own", obj: q };
      const qc = QuestionCard(q, "own", res => { prog.record(N.key, res); result = res === "own" ? "right" : res === "help" ? "half" : "wrong"; sfx(result === "wrong" ? "wrong" : "correct"); }, resume);
      qc.prepend(h("div", { class: "eyebrow" }, label));
      card.append(qc);
    }
    ov.append(card); document.body.append(ov);
  }
  function strike(power) {
    // aim at the demon closest to the keep
    let target = null, bd = Infinity; N.demons.forEach(d => { const v = d.fly ? Math.hypot(d.obj.position.x, d.obj.position.z) : (N.dist.get(K(d.cx, d.cz)) ?? 99); if (v < bd) { bd = v; target = d; } });
    const at = target ? target.obj.position.clone() : new THREE.Vector3(0, 1, 6);
    beam(at.x, at.z); sfx("zap"); setTimeout(() => sfx("cannon"), 120); stage.shake(0.5 * power);
    fx.emit(new THREE.Vector3(at.x, 1.4, at.z), { n: 40, colors: [0x9ff3ff, 0xffffff, 0xffd23f], speed: 6, size: 0.22, life: 1.1 });
    N.demons.slice().forEach(d => { if (Math.hypot(d.obj.position.x - at.x, d.obj.position.z - at.z) <= 4.5 * power + 0.5) damage(d, 9 * power); });
    // and the builders patch the most damaged piece
    let worst = null; fort.cells.forEach(c => { if (c.maxHp && (c.broken || c.nightHp < c.maxHp) && (!worst || c.nightHp / c.maxHp < worst.nightHp / worst.maxHp)) worst = c; });
    if (worst) { worst.nightHp = worst.maxHp; if (worst.broken) { worst.broken = false; if (worst.obj) worst.obj.scale.set(1, 1, 1); N.dist = distances(); N.demons.forEach(d => (d.next = null)); } sfx("repair"); fx.emit(new THREE.Vector3(worst.gx + 0.5, 1.5, worst.gz + 0.5), { n: 12, colors: [0x5cff7a, 0xffffff], speed: 2.5, grav: -2 }); }
  }
  function fizzle() {
    sfx("wrong"); fx.emit(new THREE.Vector3(0, 8.4, 0), { n: 14, colors: [0x666677, 0x999999], speed: 2, size: 0.18 });
    // a wrong answer cracks a wall (a weak spot to fix tomorrow)
    const walls = [...fort.cells.values()].filter(c => (c.t === "wall" || c.t === "gate") && !fort.crackList().some(k => k.cell === K(c.gx, c.gz)));
    const pickWall = walls.length ? walls.sort((a, b) => (a.nightHp / (a.maxHp || 1)) - (b.nightHp / (b.maxHp || 1)) || Math.random() - 0.5)[0] : null;
    const cell = pickWall ? K(pickWall.gx, pickWall.gz) : "keep";
    if (cell === "keep" && fort.crackList().some(k => k.cell === "keep")) return;
    fort.addCrack(cell, N.key); N.cracks.push(cell); save.commit();
    if (pickWall) { pickWall.cracked = true; pickWall.nightHp = Math.min(pickWall.nightHp, pickWall.maxHp * 0.5); N.dist = distances(); N.demons.forEach(d => (d.next = null)); }
    sfx("crack"); toast(`A ${pickWall ? "wall" : "keep stone"} cracked! You can fix it tomorrow with 2 questions on "${N.tp.t.short}".`);
  }

  /* ---------- the end of the night ---------- */
  function finish() {
    const r = { key: N.key, kills: N.kills, bumps: N.bumps, gold: N.gold, crystal: N.crystal, cracks: N.cracks.slice(), brain: { ...N.brain } };
    S().gold += N.gold;
    const sc = r.brain.total ? r.brain.right / r.brain.total : 0, prev = S().checks[N.key] || {};
    S().checks[N.key] = { last: sc, best: Math.max(prev.best || 0, sc), t: Date.now() };
    r.passed = r.brain.total > 0 && sc >= 0.75;
    save.commit();
    stop(true);
    stage.setMood("dusk"); setTimeout(() => stage.setMood("day"), 900); sfx("rooster"); playMusic("day");
    onMorning && onMorning(r);
  }

  /* ---------- night HUD ---------- */
  let countEl = null, runeBtn = null;
  function paintCount() { if (countEl && N) countEl.textContent = `👾 ${N.demons.length + N.spawnQ.length}  ·  🌊 ${Math.max(1, N.wave)}/${N.runes.length}`; }
  function paintHud() {
    if (!N) return;
    if (!countEl || !countEl.isConnected) {
      countEl = h("span", { class: "chip nightcount", "aria-live": "polite" });
      const leave = h("button", { class: "chip icon", type: "button", "aria-label": "Leave the night", title: "Leave the night", onclick: () => confirmLeave() }, "◀");
      const title = h("span", { class: "chip nighttitle" }, `🌙 Night of Day ${prog.dayNo(N.key)}: ${N.tp.t.short}`);
      runeBtn = h("button", { class: "btn runebtn", type: "button", onclick: tapRune }, "✨ Tap the rune!");
      ui.replaceChildren(hud([leave, title]), h("div", { class: "nightbar" }, countEl), h("div", { class: "grow" }), runeBtn);
    }
    runeBtn.classList.toggle("ready", !!N.runeReady); runeBtn.disabled = !N.runeReady;
    runeBtn.textContent = N.runeReady ? "✨ Tap the rune!" : N.frozen ? "❄️ Battle frozen" : "✨ The next rune is coming…";
    paintCount();
  }
  function confirmLeave() {
    if (!N || document.querySelector(".leavebox")) return;
    N.frozen = true;
    const box = h("div", { class: "freeze leavebox" }, h("div", { class: "runecard sheet" }, h("div", { class: "card stack" }, h("h2", {}, "Leave the night?"), h("p", {}, "Your fort is safe. You can face this night again from the dawn screen."),
      h("div", { class: "row" }, h("button", { class: "btn primary", type: "button", onclick: () => { box.remove(); if (N) { N.frozen = false; } } }, "Keep fighting"), h("button", { class: "btn", type: "button", onclick: () => { box.remove(); stop(); onLeave && onLeave(); } }, "Leave")))));
    document.body.append(box);
  }

  return { start, stop, tapRune, get running() { return !!N; }, get state() { return N; }, set timeScale(v) { timeScale = v; } };
}
