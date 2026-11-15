/* Fort Defence: boot, title screen, dawn (what next), the day sheet and the fort builder. */
import { THREE, createStage, createParticles, isTouch } from "./gfx.js";
import { makeIsland, makeWater, makeTree, makeRock, makeFlower, makeCloud, makeKeep, makeHero, makeDemon, REGION_LOOK } from "./models.js";
import { createSave } from "./save.js";
import { unlockAudio, sfx, playMusic, stopMusic, setSfx, setMusic, SFX_NAMES } from "./audio.js";
import { createFort, claimedHalf } from "./fort.js";
import { createProgress } from "./progress.js";
import { createDay } from "./day.js";
import { createNight } from "./night.js";
import { MATS, PIECES } from "./pieces.js";
import { createBuilder } from "./builder.js";

const ui = document.getElementById("ui");
const h = (tag, attrs, ...kids) => { const el = document.createElement(tag); for (const [k, v] of Object.entries(attrs || {})) { if (v == null || v === false) continue; if (k.startsWith("on")) el.addEventListener(k.slice(2), v); else if (k === "html") el.innerHTML = v; else el.setAttribute(k, v); } kids.flat().forEach(c => c != null && c !== false && el.append(c.nodeType ? c : document.createTextNode(String(c)))); return el; };
let lastToast = null;
const toast = t => { if (lastToast) lastToast.remove(); const el = h("div", { class: "toast", role: "status" }, t); document.body.append(el); lastToast = el; setTimeout(() => el.remove(), 3400); };
const DEV = new URLSearchParams(location.search).has("dev") || location.hash === "#dev";

/* ---------- save ---------- */
let saveStatus = { ok: true, text: "" };
const save = createSave({ onStatus: s => { saveStatus = s; paintSave(); }, onExternalChange: () => { toast("You played further on another device, so I loaded that game."); if (fort) fort.load(); if (builder) { builder.paintMats(); builder.paintTray(); } } });
const S = () => save.state;

/* ---------- 3D stage ---------- */
const stage = createStage(document.getElementById("c"));
const { scene, rig } = stage;
const fx = createParticles(scene);
stage.onFrame(dt => fx.update(dt));
const live = new Set();                           // objects with their own update()
stage.onFrame((dt, t) => live.forEach(o => o.userData.update && o.userData.update(dt, t)));
const addLive = o => { if (o.userData.update) live.add(o); scene.add(o); return o; };

let island = null, fort = null, builder = null, prog = null, day = null, night = null;
function buildWorld(region = 1) {
  const L = REGION_LOOK[region];
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  island = makeIsland(region); scene.add(island);
  addLive(makeWater(region));
  const keep = addLive(makeKeep("wood")); keep.position.set(0, 1, 0);
  const hero = addLive(makeHero()); hero.position.set(0.7, 5.2, 0.7); hero.userData.baseY = 5.2; hero.rotation.y = 0.7;  // the commander stands on the keep
  island.userData.cells.forEach(c => {
    if (c.shore || c.plateau) return; const r = rnd();
    if (r < 0.13) { const t = makeTree(rnd, L.leaf); t.position.set(c.x, c.h, c.z); scene.add(t); }
    else if (r < 0.18) { const k = makeRock(rnd); k.position.set(c.x, c.h, c.z); scene.add(k); }
    else if (r > 0.93) { const f = makeFlower(rnd); f.position.set(c.x + (rnd() - 0.5) * 0.6, c.h, c.z + (rnd() - 0.5) * 0.6); scene.add(f); }
  });
  const islet = new THREE.Group(); islet.position.set(-30, 0, -20);
  islet.add(makeRock(rnd), makeRock(rnd)); islet.children[1].position.set(1.2, 0, 0.6); islet.children[1].scale.setScalar(1.4);
  islet.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(3, 3.4, 1.2, 8), new THREE.MeshStandardMaterial({ color: 0x6f6a8a, flatShading: true })), { receiveShadow: true }));
  islet.children[2].position.y = -0.2; scene.add(islet);
  [["imp", -0.8, 0.4], ["bat", 0.4, -0.6], ["imp", 1.5, 0.9]].forEach(([k, x, z]) => { const d = addLive(makeDemon(k)); d.position.set(islet.position.x + x, 0.45, islet.position.z + z); d.lookAt(0, 0.45, 0); });
  for (let i = 0; i < 8; i++) { const c = makeCloud(rnd); c.position.set((rnd() - 0.5) * 160, 42 + rnd() * 8, (rnd() - 0.5) * 160); c.userData.update = (dt) => { c.position.x += dt * 0.8; if (c.position.x > 80) c.position.x = -80; }; addLive(c); }
}
buildWorld(1);
const TITLE_VIEW = { yaw: 0.7, pitch: 0.5, dist: isTouch ? 52 : 46, target: new THREE.Vector3(0, 2, 0) };
const DAWN_VIEW = { yaw: 0.9, pitch: 0.62, dist: isTouch ? 44 : 38, target: new THREE.Vector3(0, 2, 0) };
const BUILD_VIEW = { yaw: 0.78, pitch: 0.82, dist: isTouch ? 38 : 34, target: new THREE.Vector3(0, 1, 0) };
Object.assign(rig, { yaw: TITLE_VIEW.yaw, pitch: TITLE_VIEW.pitch, dist: TITLE_VIEW.dist, autoSpin: 0.05 }); rig.target.copy(TITLE_VIEW.target);

/* a starter kit so there is something to build with (from Stage 3, answering questions earns more) */
function starterKit() {
  if (S().kit) return;
  const big = save.practice;  // the preview gets plenty to try everything
  S().mats = { wood: big ? 80 : 20, stone: big ? 40 : 6, iron: big ? 16 : 2, crystal: big ? 8 : 1 };
  S().gold += big ? 400 : 50; S().blueprints = { arrow: big ? 4 : 1, cannon: big ? 2 : 0 };
  S().kit = 1; save.commit();
}

/* ---------- HUD ---------- */
let saveEl = null;
function paintSave() {
  if (!saveEl) return;
  const s = saveStatus; saveEl.querySelector(".save-dot").className = "save-dot " + (s.ok ? (s.text === "Saving…" ? "wait" : "") : "bad");
  saveEl.querySelector(".lbl").textContent = s.mode === "practice" ? "Practice save" : s.text; saveEl.title = s.text;
}
function hud(extra = []) {
  const home = h("a", { class: "chip icon", href: window.Family && Family.hasKey ? Family.link("../../") : "../../", "aria-label": "All subjects", title: "All subjects" }, "🏠");
  saveEl = h("button", { class: "chip", type: "button", title: "Save", onclick: () => { save.saveNow(); toast(save.practice ? "Practice save: kept on this device only." : "Saved. 💾"); } }, h("span", { class: "save-dot" }), h("span", { class: "lbl" }, ""));
  const snd = h("button", { class: "chip icon", type: "button", "aria-label": "Sound on or off", title: "Sound", onclick: () => { const on = !S().sound; S().sound = on; S().music = on; setSfx(on); setMusic(on); save.commit(); snd.textContent = on ? "🔊" : "🔇"; if (on) { unlockAudio(); sfx("click"); } } }, S().sound ? "🔊" : "🔇");
  const bar = h("div", { class: "hud" }, home, ...extra, h("span", { class: "sp" }), saveEl, snd);
  paintSave();
  return bar;
}

/* ---------- screens ---------- */
function titleScreen() {
  if (builder) builder.unmount();
  stage.setShift(0);
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
  if (!S().startedAt) { S().startedAt = Date.now(); save.commit(); }
  dawnScreen();
}

/* dawn: the fort as he left it, and one big glowing button for what's next */
function matsChips() {
  return h("div", { class: "mats", "aria-label": "Your materials" }, ...["wood", "stone", "iron", "crystal", "gold"].map(m => h("span", { class: "mat", title: MATS[m].name }, h("span", { class: "mi" }, MATS[m].icon), h("b", {}, m === "gold" ? S().gold : (S().mats[m] || 0)))),
    h("span", { class: "mat", title: "Tower plans" }, h("span", { class: "mi" }, "📜"), h("b", {}, Object.keys(PIECES).filter(k => PIECES[k].bp).reduce((a, k) => a + (S().blueprints[k] || 0), 0))));
}
function dawnScreen() {
  if (builder) builder.unmount();
  if (day && day.isOpen) day.close("nav");
  stage.setShift(0, 0); rig.autoSpin = 0.03; stage.flyTo(DAWN_VIEW, 1.4);
  const cur = prog.currentNode();
  let main, sub = "";
  if (cur.t === "level" && !cur.repair && prog.nextPhase(cur.key) === "brain") {
    const tp = prog.topic(cur.key);
    main = h("button", { class: "btn pulse go-day night", type: "button", onclick: () => startNight(cur.key) }, `🌙 Night of Day ${prog.dayNo(cur.key)}: ${tp.t.short}`);
    sub = "⭐⭐ so far. Build your defences, then face the night. The Brain check is in the runes.";
  } else if (cur.t === "level") {
    const tp = prog.topic(cur.key), st = prog.stars(cur.key);
    main = h("button", { class: "btn pulse go-day", type: "button", onclick: () => { sfx("whoosh"); day.open(cur.key); } }, cur.repair ? `🔧 Repair: ${tp.t.short}` : `☀️ Day ${prog.dayNo(cur.key)}: ${tp.t.short}`);
    sub = cur.repair ? "A demon lord found a weak spot. Fix it to make the wall strong again." : `${tp.region ? tp.region.emoji + " " + tp.region.name + " · " : ""}${st ? "⭐".repeat(st) + " so far" : "A new day"}`;
  } else {
    const lord = cur.t === "final" ? cur.region.final : cur.region.lord;
    main = h("button", { class: "btn pulse go-day", type: "button", onclick: () => { sfx("horn"); toast(`${lord.name[0].toUpperCase() + lord.name.slice(1)} arrives in a later stage of this build. Every day in ${cur.region.name} is mastered!`); } }, `${cur.t === "final" ? "🐉" : "👹"} ${lord.name[0].toUpperCase() + lord.name.slice(1)}`);
    sub = "Every day in this region is mastered. The demon lord is coming!";
  }
  const chest = prog.road.find(n => n.t === "chest" && !prog.nodeDone(n) && n.region === (cur.region || {}));
  const crack = fort.crackList()[0];
  const back = h("button", { class: "chip icon", type: "button", "aria-label": "Back to the title", title: "Back", onclick: () => { sfx("click"); stage.flyTo(TITLE_VIEW, 1.4); setTimeout(() => (rig.autoSpin = 0.05), 1400); stopMusic(); setTimeout(() => playMusic("title"), 300); titleScreen(); } }, "◀");
  const card = h("div", { class: "dawn panel fade-in" },
    h("p", { class: "dsub" }, sub), main,
    h("div", { class: "drow" },
      h("button", { class: "btn small blue", type: "button", onclick: () => { sfx("click"); rig.autoSpin = 0; stage.flyTo(BUILD_VIEW, 1.2); buildScreen(); } }, "🔨 Build"),
      h("button", { class: "btn small plain", type: "button", onclick: () => { sfx("click"); day.openMap(); } }, "📜 Quest map"),
      chest ? h("button", { class: "btn small gold", type: "button", onclick: () => { sfx("click"); day.openChest(chest.pack, chest.region); } }, "🎁 New scout report") : null,
      crack ? h("button", { class: "btn small crackbtn", type: "button", onclick: () => { sfx("click"); day.openRepair(crack); } }, `🔧 Fix a crack (${fort.crackList().length})`) : null));
  ui.replaceChildren(hud([back]), matsChips(), h("div", { class: "grow" }), card);
  setTimeout(() => main.focus({ preventScroll: true }), 60);
}

/* night falls */
function startNight(key) {
  if (builder) builder.unmount(); if (day && day.isOpen) day.close("nav");
  night.start(key);
}

/* after a day: did he claim more land? */
function landCheck() {
  const before = fort.half, after = claimedHalf(S());
  if (after > before) { fort.redrawLand(); sfx("horn"); return after * 2; }
  return null;
}

function buildScreen() {
  const { mats, tray } = builder.mount();
  const back = h("button", { class: "chip icon", type: "button", "aria-label": "Finish building", title: "Finish building", onclick: () => { sfx("click"); dawnScreen(); } }, "◀");
  const done = h("button", { class: "chip", type: "button", onclick: () => { sfx("click"); dawnScreen(); } }, "✓ Done building");
  const spin = h("button", { class: "chip icon", type: "button", "aria-label": "Turn the view", title: "Turn the view", onclick: () => { sfx("whoosh"); stage.flyTo({ yaw: rig.yaw + Math.PI / 2 }, 0.7); } }, "↻");
  const mission = h("div", { class: "mission fade-in" }, h("b", {}, "Build your fort! "), "Drag pieces onto the grass. Drop a piece on the same piece to upgrade it.");
  const cur = prog.currentNode(), pending = cur.t === "level" && !cur.repair && prog.nextPhase(cur.key) === "brain";
  const nightBtn = pending ? h("button", { class: "chip nightchip", type: "button", onclick: () => startNight(cur.key) }, "🌙 Night falls") : null;
  ui.replaceChildren(hud([back, spin, nightBtn || done]), mats, mission, h("div", { class: "grow" }), tray);
  const lift = () => { if (tray.isConnected) stage.setShift(tray.getBoundingClientRect().height * 0.45); };
  requestAnimationFrame(lift); addEventListener("resize", lift);
}

/* ---------- test bench (?dev or #dev) ---------- */
function bench() {
  const out = h("pre", {}, "");
  const show = () => { out.textContent = JSON.stringify({ fps: Math.round(stage.fps), save: saveStatus.text, mode: save.practice ? "practice" : "cloud", pieces: fort ? fort.count() : 0, land: fort ? fort.half * 2 + " x " + fort.half * 2 : "", mats: S().mats, gold: S().gold, plans: S().blueprints, seededFrom: S().seededFrom }, null, 1); };
  setInterval(show, 500);
  const sfxRow = h("div", { class: "row" }, ...SFX_NAMES.map(n => h("button", { type: "button", onclick: () => { unlockAudio(); sfx(n); } }, n)));
  const musRow = h("div", { class: "row" }, ...["title", "day", "night"].map(n => h("button", { type: "button", onclick: () => { unlockAudio(); stopMusic(); playMusic(n); } }, "♪ " + n)), h("button", { type: "button", onclick: stopMusic }, "■ stop"));
  const moodRow = h("div", { class: "row" }, ...["day", "dusk", "night"].map(n => h("button", { type: "button", onclick: () => { stage.setMood(n); fort.cells.forEach(c => { if (c.obj && c.obj.userData.light) c.obj.userData.light.intensity = n === "day" ? 0 : 6; }); } }, n)));
  const fortRow = h("div", { class: "row" },
    h("button", { type: "button", onclick: () => { Object.keys(S().mats).forEach(m => (S().mats[m] += 30)); S().gold += 200; S().blueprints.arrow = (S().blueprints.arrow || 0) + 3; S().blueprints.cannon = (S().blueprints.cannon || 0) + 2; save.commit(); builder.paintMats(); builder.paintTray(); } }, "+ materials"),
    h("button", { type: "button", onclick: () => { S().bonusLand = Math.min(4, (S().bonusLand || 0) + 1); save.commit(); fort.redrawLand(); toast(`Land is now ${fort.half * 2} × ${fort.half * 2}`); } }, "+ land"),
    h("button", { type: "button", onclick: () => demoFort() }, "build a demo castle"),
    h("button", { type: "button", onclick: () => { S().unlockAll = !S().unlockAll; save.commit(); toast(S().unlockAll ? "Every day is open" : "Days open in order again"); dawnScreen(); } }, "unlock all days"),
    h("button", { type: "button", onclick: () => { const c = prog.currentNode(); if (c.t !== "level") return; Object.assign(prog.L(c.key), { stars: Math.max(2, prog.stars(c.key)), train: true }); S().learnDone[c.key] = true; save.commit(); dawnScreen(); toast("Day done: the night is next"); } }, "skip to tonight"),
    h("button", { type: "button", onclick: () => { const c = prog.currentNode(); if (c.t !== "level") return; Object.assign(prog.L(c.key), { stars: 3, train: true }); S().learnDone[c.key] = true; delete S().repair[c.key]; save.commit(); const land = landCheck(); toast(`Day ${prog.dayNo(c.key)} mastered` + (land ? `, land is now ${land} × ${land}` : "")); dawnScreen(); } }, "master today"),
    save.practice ? h("button", { type: "button", onclick: () => { save.resetPractice(); location.reload(); } }, "reset practice save") : null);
  const panel = h("div", { id: "bench", class: "panel" }, h("button", { type: "button", style: "float:right", onclick: () => panel.classList.toggle("min") }, "–"), h("h3", {}, "Test bench"), h("b", {}, "Fort"), fortRow, h("b", {}, "Sky"), moodRow, h("b", {}, "Music"), musRow, h("b", {}, "Sound effects"), sfxRow, out);
  document.body.append(panel);
}
/* a ready-made castle, to show what a big fort can look like after a few weeks */
function demoFort() {
  S().bonusLand = 4; fort.redrawLand();
  const P = []; const R = 9;
  for (let i = -R; i < R; i++) P.push(["wall", i, -R, 3], ["wall", i, R - 1, 3]);
  for (let i = -R + 1; i < R - 1; i++) P.push(["wall", -R, i, 3], ["wall", R - 1, i, 3]);
  [[-R, -R], [R - 1, -R], [-R, R - 1], [R - 1, R - 1]].forEach(([x, z]) => P.push(["arrow", x, z, 3]));
  [[-R, -2], [R - 1, -2], [-5, -R], [4, -R]].forEach(([x, z]) => P.push(["arrow", x, z, 2]));
  P.push(["gate", -1, R - 1, 3], ["gate", 0, R - 1, 3]);
  for (let i = -R - 2; i <= R + 1; i++) [[i, -R - 2], [i, R + 1]].forEach(([x, z]) => P.push(["moat", x, z, 1]));
  for (let i = -R - 1; i <= R; i++) [[-R - 2, i], [R + 1, i]].forEach(([x, z]) => P.push(["moat", x, z, 1]));
  P.push(["bridge", -1, R + 1, 1], ["bridge", 0, R + 1, 1]);
  for (let z = 2; z < R - 1; z++) P.push(["path", -1, z, 1], ["path", 0, z, 1]);
  [[-4, -5], [3, -5], [-6, 0], [5, 0]].forEach(([x, z], i) => P.push(["cannon", x, z, 2 + (i & 1)]));
  [[-6, 4], [-6, 6], [5, 4], [5, 6], [-6, -6], [5, -7]].forEach(([x, z]) => P.push(["house", x, z, 1]));
  P.push(["well", 3, 4, 1], ["statue", -3, 3, 1], ["statue", 2, 3, 1]);
  [[-2, 2], [1, 2], [-2, 6], [1, 6]].forEach(([x, z]) => P.push(["torch", x, z, 1]));
  [[-3, -3], [2, -3], [-3, -7], [2, -7]].forEach(([x, z]) => P.push(["banner", x, z, 1]));
  [[-7, -3], [6, -3], [-7, 2], [6, 2], [-2, -7], [1, -7]].forEach(([x, z]) => P.push(["bush", x, z, 1]));
  [[-4, 2], [3, 2], [-4, -2], [3, -2]].forEach(([x, z]) => P.push(["flowers", x, z, 1]));
  for (let i = -7; i <= 6; i += 3) P.push(["spikes", i, R + 3, 2], ["goo", i + 1, R + 3, 2]);
  const seen = new Set();
  S().forts[1] = { pieces: P.filter(([, x, z]) => { const k = x + "," + z; if (seen.has(k) || fort.inKeep(x, z)) return false; seen.add(k); return true; }) };
  save.commit(); fort.load(); toast("Demo castle built");
}

/* ---------- boot ---------- */
(async function boot() {
  await save.boot();
  setSfx(S().sound); setMusic(S().music);
  starterKit();
  fort = createFort({ scene, state: S, region: 1, island, onFrameObjects: live });
  builder = createBuilder({ stage, fort, fx, save, toast });
  prog = createProgress(S, () => save.commit());
  day = createDay({ save, prog, stage, toast, onLand: landCheck,
    onBuild: () => { rig.autoSpin = 0; stage.flyTo(BUILD_VIEW, 1.2); buildScreen(); },
    onNight: key => startNight(key),
    onFixCrack: cell => { fort.fixCrack(cell); save.commit(); },
    onClose: why => { if (why === "stop") { stopMusic(); stage.flyTo(TITLE_VIEW, 1.4); setTimeout(() => (rig.autoSpin = 0.05), 1400); titleScreen(); toast("Great work today, Commander. Your fort is saved and waiting."); } else if (why !== "build" && why !== "nav" && why !== "night") dawnScreen(); } });
  night = createNight({ stage, fx, fort, island, save, prog, ui, toast, hud, onMorning: r => day.morning(r), onLeave: () => { playMusic("day"); dawnScreen(); } });
  titleScreen();
  const wake = () => { if (unlockAudio() && S().music && !builder.selected) playMusic("title"); removeEventListener("pointerdown", wake); };
  addEventListener("pointerdown", wake);
  if (DEV) bench();
  window.__fd = { stage, save, fx, fort, builder, prog, day, night, THREE, dawnScreen, startNight, demoFort };
})();
