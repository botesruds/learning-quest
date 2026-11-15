/* Fort Defence: boot, title screen and (Stage 1) a test bench for the foundations. */
import { THREE, createStage, createParticles, isTouch } from "./gfx.js";
import { makeIsland, makeWater, makeTree, makeRock, makeFlower, makeCloud, makeKeep, makeHero, makeDemon, REGION_LOOK } from "./models.js";
import { createSave } from "./save.js";
import { unlockAudio, sfx, playMusic, stopMusic, setSfx, setMusic, SFX_NAMES } from "./audio.js";

const ui = document.getElementById("ui");
const h = (tag, attrs, ...kids) => { const el = document.createElement(tag); for (const [k, v] of Object.entries(attrs || {})) { if (v == null || v === false) continue; if (k.startsWith("on")) el.addEventListener(k.slice(2), v); else if (k === "html") el.innerHTML = v; else el.setAttribute(k, v); } kids.flat().forEach(c => c != null && c !== false && el.append(c.nodeType ? c : document.createTextNode(String(c)))); return el; };
const toast = t => { const el = h("div", { class: "toast", role: "status" }, t); document.body.append(el); setTimeout(() => el.remove(), 3200); };
const DEV = new URLSearchParams(location.search).has("dev") || location.hash === "#dev";

/* ---------- save ---------- */
let saveStatus = { ok: true, text: "" };
const save = createSave({ onStatus: s => { saveStatus = s; paintSave(); }, onExternalChange: () => toast("You played further on another device, so I loaded that game.") });
const S = () => save.state;

/* ---------- 3D stage ---------- */
const stage = createStage(document.getElementById("c"));
const { scene, rig } = stage;
const fx = createParticles(scene);
stage.onFrame(dt => fx.update(dt));
const live = [];                                  // objects with their own update()
stage.onFrame((dt, t) => live.forEach(o => o.userData.update(dt, t)));
const addLive = o => { if (o.userData.update) live.push(o); scene.add(o); return o; };

function buildTitleWorld(region = 1) {
  const L = REGION_LOOK[region];
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const island = makeIsland(region); scene.add(island);
  addLive(makeWater(region));
  const cells = island.userData.cells;
  const keep = addLive(makeKeep("wood")); keep.position.set(0, 1, 0);
  const hero = addLive(makeHero()); hero.position.set(2.6, 1, 2.6); hero.userData.baseY = 1; hero.rotation.y = 0.6;
  // trees, rocks and flowers on the hills around the building plateau
  cells.forEach(c => {
    if (c.shore) return; const far = Math.max(Math.abs(c.x), Math.abs(c.z)) > 8.5; const r = rnd();
    if (far && r < 0.11) { const t = makeTree(rnd, L.leaf); t.position.set(c.x, c.h, c.z); scene.add(t); }
    else if (far && r < 0.15) { const k = makeRock(rnd); k.position.set(c.x, c.h, c.z); scene.add(k); }
    else if (r > 0.95) { const f = makeFlower(rnd); f.position.set(c.x + (rnd() - 0.5) * 0.6, c.h, c.z + (rnd() - 0.5) * 0.6); scene.add(f); }
  });
  // a little rocky islet where the demons are peeking from
  const islet = new THREE.Group(); islet.position.set(-21, 0, -14);
  islet.add(makeRock(rnd), makeRock(rnd)); islet.children[1].position.set(1.2, 0, 0.6); islet.children[1].scale.setScalar(1.4);
  islet.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(3, 3.4, 1.2, 8), new THREE.MeshStandardMaterial({ color: 0x6f6a8a, flatShading: true })), { receiveShadow: true }));
  islet.children[2].position.y = -0.2; scene.add(islet);
  [["imp", -0.8, 0.4], ["bat", 0.4, -0.6], ["imp", 1.5, 0.9]].forEach(([k, x, z]) => { const d = addLive(makeDemon(k)); d.position.set(islet.position.x + x, 0.45, islet.position.z + z); d.lookAt(0, 0.45, 0); });
  // clouds drifting
  for (let i = 0; i < 7; i++) { const c = makeCloud(rnd); c.position.set((rnd() - 0.5) * 120, 16 + rnd() * 10, (rnd() - 0.5) * 120); c.userData.update = (dt) => { c.position.x += dt * 0.8; if (c.position.x > 70) c.position.x = -70; }; addLive(c); }
  return { keep, hero };
}
const world = buildTitleWorld(1);
rig.target.set(0, 2, 0); rig.dist = isTouch ? 40 : 36; rig.pitch = 0.5; rig.autoSpin = 0.06;

/* ---------- screens ---------- */
let saveEl = null;
function paintSave() {
  if (!saveEl) return;
  const s = saveStatus; saveEl.querySelector(".save-dot").className = "save-dot " + (s.ok ? (s.text === "Saving…" ? "wait" : "") : "bad");
  saveEl.querySelector(".lbl").textContent = s.mode === "practice" ? "Practice save" : s.text; saveEl.title = s.text;
}
function hud() {
  const home = h("a", { class: "chip icon", href: window.Family && Family.hasKey ? Family.link("../../") : "../../", "aria-label": "All subjects", title: "All subjects" }, "🏠");
  saveEl = h("button", { class: "chip", type: "button", title: "Save", onclick: () => { save.saveNow(); toast(save.practice ? "Practice save: kept on this device only." : "Saved. 💾"); } }, h("span", { class: "save-dot" }), h("span", { class: "lbl" }, ""));
  const snd = h("button", { class: "chip icon", type: "button", "aria-label": "Sound on or off", title: "Sound", onclick: () => { const on = !S().sound; S().sound = on; S().music = on; setSfx(on); setMusic(on); save.commit(); snd.textContent = on ? "🔊" : "🔇"; if (on) { unlockAudio(); sfx("click"); } } }, S().sound ? "🔊" : "🔇");
  const bar = h("div", { class: "hud" }, home, h("span", { class: "sp" }), saveEl, snd);
  paintSave();
  return bar;
}

function titleScreen() {
  const play = h("button", { class: "btn pulse", type: "button", onclick: startGame }, "▶  Play");
  const parts = [hud()];
  if (save.practice) parts.push(h("div", { class: "banner" }, "Practice save: progress stays on this device only"));
  parts.push(h("div", { class: "title fade-in" },
    h("h1", { class: "logo" }, "Fort ", h("span", {}, "Defence")),
    h("p", { class: "tag" }, "Algebra Quest · Letter Land"),
    play));
  ui.replaceChildren(...parts);
  setTimeout(() => play.focus({ preventScroll: true }), 50);
}

function startGame() {
  unlockAudio(); setSfx(S().sound); setMusic(S().music);
  sfx("whoosh"); playMusic("day");
  rig.autoSpin = 0;
  stage.flyTo({ yaw: 0.78, pitch: 0.72, dist: isTouch ? 26 : 22, target: new THREE.Vector3(0, 1.5, 0) }, 1.8);
  setTimeout(() => { fx.emit(new THREE.Vector3(0, 6, 0), { n: 40, colors: [0xffc83d, 0xff6b9a, 0x4a8cf0, 0x2fbf4a], speed: 4, up: 6, size: 0.22, life: 1.6 }); sfx("star"); }, 1700);
  if (!S().startedAt) { S().startedAt = Date.now(); save.commit(); }
  ui.replaceChildren(hud(), h("div", { class: "panel bottom fade-in", style: "animation-delay:1.6s" },
    h("h2", {}, "Your fort will stand here"),
    h("p", {}, "This is the Stage 1 preview: the island, the sounds and saving are ready."),
    h("p", {}, "Stage 2 adds building: drag walls, towers and traps onto the grid."),
    h("div", { style: "display:flex;gap:12px;justify-content:center;margin-top:14px;flex-wrap:wrap" },
      h("button", { class: "btn blue small", type: "button", onclick: () => { sfx("click"); stage.flyTo({ yaw: rig.yaw + 0.5, pitch: 0.5, dist: isTouch ? 40 : 36, target: new THREE.Vector3(0, 2, 0) }, 1.4); rig.autoSpin = 0.06; stopMusic(); setTimeout(() => playMusic("title"), 300); titleScreen(); } }, "◀  Back"))));
}

/* ---------- Stage 1 test bench (?dev) ---------- */
function bench() {
  const out = h("pre", {}, "");
  const show = () => { out.textContent = JSON.stringify({ fps: Math.round(stage.fps), save: saveStatus, mode: save.practice ? "practice" : "cloud", gold: S().gold, stars: Object.values(S().lv).reduce((a, l) => a + (l.stars || 0), 0), seededFrom: S().seededFrom, updated: S().updated }, null, 1); };
  setInterval(show, 500);
  const sfxRow = h("div", { class: "row" }, ...SFX_NAMES.map(n => h("button", { type: "button", onclick: () => { unlockAudio(); sfx(n); } }, n)));
  const musRow = h("div", { class: "row" }, ...["title", "day", "night"].map(n => h("button", { type: "button", onclick: () => { unlockAudio(); stopMusic(); playMusic(n); } }, "♪ " + n)), h("button", { type: "button", onclick: stopMusic }, "■ stop"));
  const moodRow = h("div", { class: "row" }, ...["day", "dusk", "night"].map(n => h("button", { type: "button", onclick: () => stage.setMood(n) }, n)));
  const fxRow = h("div", { class: "row" },
    h("button", { type: "button", onclick: () => { unlockAudio(); sfx("place"); stage.shake(0.35); fx.emit(new THREE.Vector3(3, 1.1, -3), { n: 18, color: 0xd9c7a3, speed: 2.5, up: 2, size: 0.2, life: 0.7 }); } }, "dust + shake"),
    h("button", { type: "button", onclick: () => { unlockAudio(); sfx("cannon"); stage.shake(0.8, 0.5); fx.emit(new THREE.Vector3(-21, 1, -14), { n: 30, colors: [0x8b5cf6, 0xc4b5fd, 0xffffff], speed: 4, up: 5, life: 1.1 }); } }, "boom"),
    h("button", { type: "button", onclick: () => { S().gold += 10; save.commit(); } }, "+10 gold (save test)"),
    save.practice ? h("button", { type: "button", onclick: () => { save.resetPractice(); toast("Practice save cleared"); } }, "reset practice save") : null);
  document.body.append(h("div", { id: "bench", class: "panel" }, h("h3", {}, "Stage 1 test bench"), h("b", {}, "Sound effects"), sfxRow, h("b", {}, "Music"), musRow, h("b", {}, "Sky"), moodRow, h("b", {}, "Effects and save"), fxRow, out));
}

/* ---------- boot ---------- */
(async function boot() {
  await save.boot();
  setSfx(S().sound); setMusic(S().music);
  titleScreen();
  // first tap anywhere wakes the audio (browsers need a gesture), then the title tune plays
  const wake = () => { if (unlockAudio() && S().music) playMusic("title"); removeEventListener("pointerdown", wake); };
  addEventListener("pointerdown", wake);
  if (DEV) bench();
  window.__fd = { stage, save, fx, world }; // for automated play-tests
})();
