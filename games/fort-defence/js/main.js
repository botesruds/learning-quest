/* Fort Defence: boot, title screen, dawn (what next), the day sheet and the fort builder. */
import { THREE, createStage, createParticles, isTouch } from "./gfx.js";
import { makeIsland, makeWater, makeTree, makeRock, makeFlower, makeCloud, makeKeep, makeHero, makeDemon, makePet, makeBanner, HEROES, REGION_LOOK } from "./models.js";
import { createSave } from "./save.js";
import { unlockAudio, sfx, playMusic, stopMusic, setSfx, setMusic, SFX_NAMES } from "./audio.js";
import { createFort, claimedHalf } from "./fort.js";
import { setStyle } from "./pieces.js";
import { createProgress } from "./progress.js";
import { createDay } from "./day.js";
import { createNight } from "./night.js";
import { createLibrary } from "./library.js";
import { createCards } from "./cards.js";
import { createPatrol } from "./patrol.js";
import { createReport } from "./report.js";
import { createScribe } from "./scribe.js";
import { createMapRoom } from "./think.js";
import { createValley } from "./valley.js";
import { createStorms } from "./storms.js";
import { MATS, PIECES } from "./pieces.js";
import { createBuilder } from "./builder.js";

const ui = document.getElementById("ui");
const h = (tag, attrs, ...kids) => { const el = document.createElement(tag); for (const [k, v] of Object.entries(attrs || {})) { if (v == null || v === false) continue; if (k.startsWith("on")) el.addEventListener(k.slice(2), v); else if (k === "html") el.innerHTML = v; else el.setAttribute(k, v); } kids.flat().forEach(c => c != null && c !== false && el.append(c.nodeType ? c : document.createTextNode(String(c)))); return el; };
let lastToast = null;
const toast = t => { if (lastToast) lastToast.remove(); const el = h("div", { class: "toast", role: "status" }, t); document.body.append(el); lastToast = el; setTimeout(() => el.remove(), 3400); };
const DEV = new URLSearchParams(location.search).has("dev") || location.hash === "#dev";

/* ---------- save ---------- */
let saveStatus = { ok: true, text: "" };
const save = createSave({ onStatus: s => { saveStatus = s; paintSave(); }, onExternalChange: () => { toast("You played further on another device, so I loaded that game."); if (fort) fort.load(); dressHero(); if (builder) { builder.paintMats(); builder.paintTray(); } } });
const S = () => save.state;

/* ---------- 3D stage ---------- */
const stage = createStage(document.getElementById("c"));
const { scene, rig } = stage;
const fx = createParticles(scene);
stage.onFrame(dt => fx.update(dt));
const live = new Set();                           // objects with their own update()
stage.onFrame((dt, t) => live.forEach(o => o.userData.update && o.userData.update(dt, t)));
const addLive = o => { if (o.userData.update) live.add(o); scene.add(o); return o; };

let keep = null, heroObj = null, petObj = null, bannerG = null, bannerN = -1;
let island = null, water = null, sceneryG = null, lookNow = 1, fort = null, builder = null, prog = null, day = null, night = null, library = null, scribe = null, valley = null, storms = null, cards = null, patrol = null, report = null, maproom = null;
function buildWorld(region = 1) {
  const L = REGION_LOOK[region];
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  island = makeIsland(region); scene.add(island);
  water = addLive(makeWater(region));
  keep = addLive(makeKeep("wood")); keep.position.set(0, 1, 0);
  dressHero(); hangBanners();
  scenery(region);
  const islet = new THREE.Group(); islet.position.set(-30, 0, -20);
  islet.add(makeRock(rnd), makeRock(rnd)); islet.children[1].position.set(1.2, 0, 0.6); islet.children[1].scale.setScalar(1.4);
  islet.add(Object.assign(new THREE.Mesh(new THREE.CylinderGeometry(3, 3.4, 1.2, 8), new THREE.MeshStandardMaterial({ color: 0x6f6a8a, flatShading: true })), { receiveShadow: true }));
  islet.children[2].position.y = -0.2; scene.add(islet);
  [["imp", -0.8, 0.4], ["bat", 0.4, -0.6], ["imp", 1.5, 0.9]].forEach(([k, x, z]) => { const d = addLive(makeDemon(k)); d.position.set(islet.position.x + x, 0.45, islet.position.z + z); d.lookAt(0, 0.45, 0); });
  for (let i = 0; i < 8; i++) { const c = makeCloud(rnd); c.position.set((rnd() - 0.5) * 160, 42 + rnd() * 8, (rnd() - 0.5) * 160); c.userData.update = (dt) => { c.position.x += dt * 0.8; if (c.position.x > 80) c.position.x = -80; }; addLive(c); }
}
/* the commander on the keep wears what he chose in the hero shop; his pet sits beside him */
function dressHero() {
  const st = save && save.state ? save.state : {};
  [heroObj, petObj].forEach(o => { if (o) { scene.remove(o); live.delete(o); } });
  const H = HEROES.find(x => x.id === st.hero) || HEROES[0];
  heroObj = addLive(makeHero(H.look)); heroObj.position.set(0.7, 5.2, 0.7); heroObj.userData.baseY = 5.2; heroObj.rotation.y = 0.7;
  petObj = st.pet ? makePet(st.pet) : null; if (petObj) { addLive(petObj); petObj.position.set(-0.6, 5.2, 0.9); petObj.rotation.y = 0.9; }
}
/* every badge he earns flies as a banner around the top of the keep */
function hangBanners() {
  const st = save && save.state ? save.state : {}, got = prog ? prog.allBadges().filter(b => st.badges && st.badges[b.k]) : [];
  if (got.length === bannerN) return; bannerN = got.length;
  if (bannerG) { scene.remove(bannerG); bannerG.children.forEach(c => live.delete(c)); }
  bannerG = new THREE.Group(); scene.add(bannerG);
  const spots = [[-1.4, -1.4], [1.4, -1.4], [-1.4, 1.4], [1.4, 1.4], [0, -1.4], [-1.4, 0], [1.4, 0], [0, 1.4]];
  got.slice(-8).forEach((b, i) => { const f = makeBanner(b.e, [0x7c4dff, 0x2f6fde, 0xe34b4b, 0x2f8a4a][i % 4]); f.position.set(spots[i][0], 5.5, spots[i][1]); f.rotation.y = Math.atan2(spots[i][0], spots[i][1]) - Math.PI / 2; bannerG.add(f); live.add(f); });
}

/* trees, rocks and flowers in the region's colours (rebuilt when he moves on to a new region) */
function scenery(region) {
  const L = REGION_LOOK[region] || REGION_LOOK[1];
  if (sceneryG) scene.remove(sceneryG);
  sceneryG = new THREE.Group(); scene.add(sceneryG);
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  island.userData.cells.forEach(c => {
    if (c.shore || c.plateau) return; const r = rnd();
    if (r < 0.13) { const t = makeTree(rnd, L.leaf, L.snow); t.position.set(c.x, c.h, c.z); sceneryG.add(t); }
    else if (r < 0.18) { const k = makeRock(rnd); k.position.set(c.x, c.h, c.z); sceneryG.add(k); }
    else if (r > 0.93 && !L.snow && !L.lava) { const f = makeFlower(rnd); f.position.set(c.x + (rnd() - 0.5) * 0.6, c.h, c.z + (rnd() - 0.5) * 0.6); sceneryG.add(f); }
  });
}
/* each region has its own land, its own fort and its own building style. Materials, gold and plans travel with him. */
let visiting = null, inGame = false, afterParent = null;                                    // a region number when he is visiting an older fort
const regionShown = () => visiting || regionNow();
function showRegion(r) {
  setLook(r);
  if (fort && fort.region !== r) {
    setStyle(r); fort.setRegion(r);
    scene.remove(keep); live.delete(keep); keep = addLive(makeKeep(r)); keep.position.set(0, 1, 0); bannerN = -1; hangBanners();
    if (builder) { builder.paintTray && builder.paintTray(); }
  }
}
function setLook(region) {
  if (!REGION_LOOK[region] || region === lookNow) return;
  lookNow = region; const L = REGION_LOOK[region];
  island.userData.setLook(region); scenery(region);
  water.material.color.set(L.water); water.material.emissive && water.material.emissive.set(L.lava ? (L.glow || 0xff4a00) : 0x000000); water.material.emissiveIntensity = L.lava ? 0.8 : 1;
}
const regionNow = () => { const n = prog.currentNode(); return n && n.region ? (n.region.look || n.region.n) : 1; };
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
  const gear = h("button", { class: "chip icon", type: "button", "aria-label": "For grown-ups", title: "For grown-ups", onclick: () => { if (night && night.running) { toast("Finish the night first, then open the parent corner."); return; } if (builder) builder.unmount(); sfx("click"); afterParent = inGame ? "dawn" : "title"; day && day.openParentGate(); } }, "⚙️");
  const bar = h("div", { class: "hud" }, home, ...extra, h("span", { class: "sp" }), saveEl, snd, gear);
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
    h("p", { class: "tag" }, prog.pack.title + " · " + prog.pack.unit),
    play));
  ui.replaceChildren(...parts);
  setTimeout(() => play.focus({ preventScroll: true }), 50);
}

function startGame() {
  inGame = true;
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
  let sub0 = "";
  showRegion(regionShown()); hangBanners();
  if (visiting) return visitScreen();
  if (builder) builder.unmount();
  if (day && day.isOpen) day.close("nav");
  stage.setShift(0, 0); rig.autoSpin = 0.03; stage.flyTo(DAWN_VIEW, 1.4);
  prog.towerMigrate();
  const cur = prog.currentNode(), todo = prog.towerTodo(cur);
  let main, sub = "", skip = null;
  const due = cards ? cards.patrolWaiting() : 0;
  if (due) {
    // the morning patrol comes first: today's review cards from every subject (the day can still be played)
    main = h("button", { class: "btn pulse go-day patrolbtn", type: "button", onclick: () => { sfx("whoosh"); patrol.openPatrol(); } }, `🛡️ Patrol first: ${due} card${due > 1 ? "s" : ""}`);
    sub = `Check the weapons in your armoury: ideas you already know. About ${Math.max(2, Math.round(due * 0.7))} minutes.`;
    skip = h("button", { class: "link skip-patrol", type: "button", onclick: () => { sfx("click"); patrol.skipPatrol(); dawnScreen(); } }, "Skip the patrol for today");
  } else if (todo.length) {   // the demon lord waits until this land's reading and royal reports are done
    const lord = cur.t === "final" ? cur.region.final : cur.region.lord, nr = todo.filter(t => t.kind === "read").length, nw = todo.length - nr;
    const go = nr ? () => library.open() : () => scribe.open();
    main = h("button", { class: "btn pulse go-day", type: "button", onclick: () => { sfx("whoosh"); go(); } }, nr ? `📚 Read for the battle (${todo.length} to go)` : `✍️ Write for the battle (${todo.length} to go)`);
    sub = `${lord.name[0].toUpperCase() + lord.name.slice(1)} is coming! First get ready: ${[nr ? `read ${nr} dispatch${nr > 1 ? "es" : ""} in the 📚 Library` : "", nw ? `send ${nw} report${nw > 1 ? "s" : ""} to the King in the ✍️ Scribe's Tower` : ""].filter(Boolean).join(" and ")}.`;
  } else if (cur.t === "level" && !cur.repair && prog.nextPhase(cur.key) === "brain") {
    const tp = prog.topic(cur.key);
    main = h("button", { class: "btn pulse go-day night", type: "button", onclick: () => startNight(cur.key) }, `🌙 Night of ${prog.dayName(cur.key)}: ${tp.t.short}`);
    sub = "⭐⭐ so far. Build your defences, then face the night. The Brain check is in the runes.";
  } else if (cur.t === "level") {
    const tp = prog.topic(cur.key), st = prog.stars(cur.key);
    main = h("button", { class: "btn pulse go-day", type: "button", onclick: () => { sfx("whoosh"); day.open(cur.key); } }, cur.repair ? `🔧 Repair: ${tp.t.short}` : `☀️ ${prog.dayName(cur.key)}: ${tp.t.short}`);
    if (!cur.repair && fort.count() === 0 && cur.region && cur.region.n > 1) sub0 = `A new land! Tap 🔨 Build to start your ${cur.region.name} fort.`;
    sub = sub0 ? sub0 : cur.repair ? "A demon lord found a weak spot. Fix it to make the wall strong again." : `${tp.region ? tp.region.emoji + " " + tp.region.name + " · " : ""}${st ? "⭐".repeat(st) + " so far" : "A new day"}`;
  } else {
    const lord = cur.t === "final" ? cur.region.final : cur.region.lord;
    main = h("button", { class: "btn pulse go-day", type: "button", onclick: () => { if (cur.t === "lord" && !prog.lordReady(cur.pack, cur.region)) { toast("Repair the weak spots first."); return; } startSiege(cur); } }, `${cur.t === "final" ? "🐉" : "👹"} ${lord.name[0].toUpperCase() + lord.name.slice(1)}`);
    const b = S().bosses[prog.bossKey(cur)];
    sub = b && b.won ? "You beat this demon lord! Fight again for practice and gold." : b ? `Best so far: ${b.best} hits. ${lord.need || 8} win. Your fort is ready!` : `Every day in ${cur.region.name} is mastered. The demon lord is coming! ${lord.need || 8} hits win.`;
  }
  const chest = prog.road.find(n => n.t === "chest" && !prog.nodeDone(n) && n.region === (cur.region || {}));
  const cracks = fort.crackList().filter(c => !S().repair[c.topic]), crack = cracks[0];   // a demon lord's cracks are fixed by the repair day
  const back = h("button", { class: "chip icon", type: "button", "aria-label": "Back to the title", title: "Back", onclick: () => { sfx("click"); stage.flyTo(TITLE_VIEW, 1.4); setTimeout(() => (rig.autoSpin = 0.05), 1400); stopMusic(); setTimeout(() => playMusic("title"), 300); titleScreen(); } }, "◀");
  const vn = valley ? valley.news() : null, vNew = vn && (vn.first || vn.n > 0);
  const grew = vn && vn.n > 0 ? h("p", { class: "vgrew" }, `🏡 Your valley grew: ${vn.n} new building${vn.n > 1 ? "s" : ""}!`, h("button", { class: "btn small", type: "button", onclick: () => { sfx("whoosh"); valley.open(); } }, "See it"))
    : vn && vn.first ? h("p", { class: "vgrew" }, "🏡 Everything you've learned has built a valley!", h("button", { class: "btn small", type: "button", onclick: () => { sfx("whoosh"); valley.open(); } }, "See it")) : null;
  const sl = storms ? storms.dawnLine() : null, news = sl && sl.classList.contains("vstorm") ? sl : (grew || sl);   // one valley line: a storm first, then news, tarps, a warning
  const card = h("div", { class: "dawn panel fade-in" },
    h("p", { class: "dsub" }, sub), main, skip, news,
    h("div", { class: "drow" },
      h("button", { class: "btn small blue", type: "button", onclick: () => { sfx("click"); rig.autoSpin = 0; stage.flyTo(BUILD_VIEW, 1.2); buildScreen(); } }, "🔨 Build"),
      h("button", { class: "btn small plain", type: "button", onclick: () => { sfx("click"); day.openMap(); } }, "📜 Quest map"),
      h("button", { class: "btn small plain rpbtn", type: "button", onclick: () => { sfx("click"); report.openReport(); } }, "📊 Report"),
      valley ? h("button", { class: "btn small plain valleybtn", type: "button", onclick: () => { sfx("click"); valley.open(); } }, "🏡 Valley", vNew ? h("i", { class: "dot", "aria-label": "something new" }) : null) : null,
      h("button", { class: "btn small plain", type: "button", onclick: () => { sfx("click"); day.openShop(); } }, "🛡️ Hero shop"),
      library && library.has() ? h("button", { class: "btn small plain libbtn" + (library.news() ? " new" : ""), type: "button", onclick: () => { sfx("click"); library.open(); } }, "📚 Library", library.news() ? h("i", { class: "dot", "aria-label": "something new" }) : null) : null,
      scribe && scribe.has() ? h("button", { class: "btn small plain scribebtn" + (scribe.news() ? " new" : ""), type: "button", onclick: () => { sfx("click"); scribe.open(); } }, "✍️ Scribe", scribe.news() ? h("i", { class: "dot", "aria-label": "something new" }) : null) : null,
      maproom && maproom.has() ? h("button", { class: "btn small plain mapbtn" + (maproom.news() ? " new" : ""), type: "button", onclick: () => { sfx("click"); maproom.open(); } }, "🗺️ Map Room", maproom.news() ? h("i", { class: "dot", "aria-label": "something new" }) : null) : null,
      chest ? h("button", { class: "btn small gold", type: "button", onclick: () => { sfx("click"); day.openChest(chest.pack, chest.region); } }, "🎁 New scout report") : null,
      crack ? h("button", { class: "btn small crackbtn", type: "button", onclick: () => { sfx("click"); day.openRepair(crack); } }, `🔧 Fix a crack (${cracks.length})`) : null));
  ui.replaceChildren(hud([back]), matsChips(), h("div", { class: "grow" }), card);
  setTimeout(() => main.focus({ preventScroll: true }), 60);
}

/* visiting an older fort: he can look and build there, then head home to today's fort */
function visitScreen() {
  const R = prog.regions.find(x => (x.r.look || x.r.n) === visiting), name = R ? R.r.emoji + " " + R.r.name : "an old fort";
  const home = h("button", { class: "btn pulse go-day", type: "button", onclick: () => { sfx("whoosh"); visiting = null; dawnScreen(); } }, "🏠 Back to today's fort");
  const back = h("button", { class: "chip icon", type: "button", "aria-label": "Back to today's fort", title: "Back", onclick: () => { visiting = null; dawnScreen(); } }, "◀");
  const card = h("div", { class: "dawn panel fade-in" }, h("p", { class: "dsub" }, `You're visiting your fort in ${name}. It stays just as you built it.`), home,
    h("div", { class: "drow" }, h("button", { class: "btn small blue", type: "button", onclick: () => { sfx("click"); rig.autoSpin = 0; stage.flyTo(BUILD_VIEW, 1.2); buildScreen(); } }, "🔨 Build here")));
  ui.replaceChildren(hud([back]), matsChips(), h("div", { class: "grow" }), card);
}
function visitFort(r) { visiting = r === regionNow() ? null : r; if (day && day.isOpen) day.close("nav"); stage.flyTo(DAWN_VIEW, 1.2); dawnScreen(); }

/* a demon lord attacks */
function startSiege(node) {
  if (prog.towerTodo(node).length) { toast("Finish the reading and reports for this land first."); dawnScreen(); return; }
  if (builder) builder.unmount(); if (day && day.isOpen) day.close("nav");
  visiting = null; showRegion(regionNow());
  night.startSiege(node);
}

/* night falls */
function startNight(key) {
  if (builder) builder.unmount(); if (day && day.isOpen) day.close("nav");
  visiting = null; showRegion(regionNow());
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
    h("button", { type: "button", onclick: () => { const c = prog.currentNode(); if (!c.region) return; c.region.topics.forEach(id => { const k = prog.keyOf(c.pack, id); Object.assign(prog.L(k), { stars: 3, train: true }); S().learnDone[k] = true; delete S().repair[k]; }); save.commit(); landCheck(); dawnScreen(); toast("Region mastered: the demon lord is next"); } }, "master this region"),
    h("button", { type: "button", onclick: () => { S().gold += 500; save.commit(); toast("+500 gold"); dawnScreen(); } }, "+500 gold"),
    h("button", { type: "button", onclick: () => { const c = prog.currentNode(); if (c.t !== "level") return; Object.assign(prog.L(c.key), { stars: Math.max(2, prog.stars(c.key)), train: true }); S().learnDone[c.key] = true; save.commit(); dawnScreen(); toast("Day done: the night is next"); } }, "skip to tonight"),
    h("button", { type: "button", onclick: () => { const c = prog.currentNode(); if (c.t !== "level") return; Object.assign(prog.L(c.key), { stars: 3, train: true }); S().learnDone[c.key] = true; delete S().repair[c.key]; save.commit(); const land = landCheck(); toast(`${prog.dayName(c.key)} mastered` + (land ? `, land is now ${land} × ${land}` : "")); dawnScreen(); } }, "master today"),
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
  S().forts[fort.region] = { pieces: P.filter(([, x, z]) => { const k = x + "," + z; if (seen.has(k) || fort.inKeep(x, z)) return false; seen.add(k); return true; }) };
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
  prog.towerMigrate();
  document.title = "Fort Defence · " + prog.pack.subject;
  day = createDay({ save, prog, stage, toast, onLand: landCheck,
    onBuild: () => { rig.autoSpin = 0; stage.flyTo(BUILD_VIEW, 1.2); buildScreen(); },
    onNight: key => startNight(key),
    onFixCrack: cell => { fort.fixCrack(cell); save.commit(); },
    onHero: () => dressHero(),
    onVisit: r => visitFort(r),
    onFixTopic: key => { fort.crackList().filter(c => c.topic === key).forEach(c => fort.fixCrack(c.cell)); save.commit(); },
    onClose: why => { if (why === "stop") { stopMusic(); stage.flyTo(TITLE_VIEW, 1.4); setTimeout(() => (rig.autoSpin = 0.05), 1400); titleScreen(); toast("Great work today, Commander. Your fort is saved and waiting."); } else if (afterParent) { const w = afterParent; afterParent = null; if (w === "title") titleScreen(); else dawnScreen(); } else if (why !== "build" && why !== "nav" && why !== "night") dawnScreen(); } });
  library = createLibrary({ save, prog, day, toast, onChange: () => {} });
  cards = createCards(S, () => save.commit(), prog);
  patrol = createPatrol({ save, prog, cards, day, toast });
  report = createReport({ save, prog, cards, day, patrol, toast });
  day.setReport && day.setReport(report);
  scribe = createScribe({ save, prog, day, toast, onChange: () => {} });
  day.setScribe(scribe);
  day.addParentSection((dots, when, repaint) => scribe.has() ? scribe.parentSection(dots, when, repaint) : null);
  maproom = createMapRoom({ save, prog, day, toast, onChange: () => {} });
  day.addParentSection((dots, when) => maproom.parentSection(dots, when));
  valley = createValley({ ui, h, save, prog, day, library, scribe, toast, sfx, mainStage: stage, onClose: () => { if (inGame) dawnScreen(); else titleScreen(); } });
  storms = createStorms({ h, save, prog, cards, valley, toast, sfx }); valley.setStorms(storms);
  day.addParentSection((dots, when, repaint) => storms.parentSection(dots, when, repaint));
  night = createNight({ stage, fx, fort, island, save, prog, cards, ui, toast, hud, onMorning: r => day.morning(r), onLeave: () => { playMusic("day"); dawnScreen(); } });
  showRegion(regionNow());
  titleScreen();
  const wake = () => { if (unlockAudio() && S().music && !builder.selected) playMusic("title"); removeEventListener("pointerdown", wake); };
  addEventListener("pointerdown", wake);
  if (new URLSearchParams(location.search).has("valley")) { inGame = true; unlockAudio(); valley.open(); }   // the home page's Valley card
  if (DEV && save.practice) bench();   // the test bench never touches a real save
  window.__fd = { stage, save, fx, fort, builder, prog, day, night, library, scribe, valley, storms, cards, patrol, report, maproom, THREE, dawnScreen, startNight, startSiege, demoFort, setLook, dressHero, showRegion, visitFort };
})();
