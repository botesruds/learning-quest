/* Build mode: camera controls, the build tray, drag-and-drop, paint-to-build, upgrade and pick up. */
import { THREE, isTouch, reducedMotion } from "./gfx.js";
import { PIECES, ORDER, MATS, maxLevel, FLAT } from "./pieces.js";
import { makePiece } from "./pieces.js";
import { pieceThumb } from "./thumbs.js";
import { sfx, unlockAudio } from "./audio.js";

const h = (tag, attrs, ...kids) => { const el = document.createElement(tag); for (const [k, v] of Object.entries(attrs || {})) { if (v == null || v === false) continue; if (k.startsWith("on")) el.addEventListener(k.slice(2), v); else if (k === "html") el.innerHTML = v; else el.setAttribute(k, v); } kids.flat().forEach(c => c != null && c !== false && el.append(c.nodeType ? c : document.createTextNode(String(c)))); return el; };

export function createBuilder({ stage, fort, fx, save, toast, onChange }) {
  const { camera, rig, renderer } = stage;
  const canvas = renderer.domElement;
  const S = () => save.state;
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), -1);
  const thumbs = {};
  let selected = null;           // tray item chosen for tap/paint building
  let drag = null;               // { kind: "new" | "move", type, cell, ghost, gx, gz, verdict }
  let popup = null, trayEl = null, matsEl = null, tab = "defend", active = false;   // active: build mode is on screen
  const drops = [];              // pieces falling into place

  /* ---------- money ---------- */
  const wallet = () => ({ ...S().mats, gold: S().gold });
  const costOf = (type, lv) => PIECES[type].cost[lv - 1] || {};
  function canPay(cost, needBp) {
    const w = wallet(); for (const [m, n] of Object.entries(cost)) if ((w[m] || 0) < n) return false;
    return !needBp || (S().blueprints[needBp] || 0) > 0;
  }
  function pay(cost, bp) { for (const [m, n] of Object.entries(cost)) { if (m === "gold") S().gold -= n; else S().mats[m] -= n; } if (bp) S().blueprints[bp]--; }
  function refund(tot, bp) { for (const [m, n] of Object.entries(tot)) { if (m === "gold") S().gold += n; else S().mats[m] = (S().mats[m] || 0) + n; } if (bp) S().blueprints[bp] = (S().blueprints[bp] || 0) + 1; }
  const costChips = cost => h("span", { class: "cost" }, ...Object.entries(cost).map(([m, n]) => h("span", { class: "c" + ((wallet()[m] || 0) < n ? " short" : "") }, MATS[m].icon, n)));
  const missing = (cost, bp) => { const w = wallet(); const miss = Object.entries(cost).filter(([m, n]) => (w[m] || 0) < n).map(([m, n]) => `${n - (w[m] || 0)} more ${MATS[m].name.toLowerCase()}`); if (bp && !(S().blueprints[bp] > 0)) miss.push("a tower plan"); return miss.join(" and "); };

  /* ---------- pointer → grid ---------- */
  function cellAt(x, y) {
    const r = canvas.getBoundingClientRect(); ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera); const p = new THREE.Vector3();
    if (!ray.ray.intersectPlane(ground, p)) return null;
    return { gx: Math.floor(p.x), gz: Math.floor(p.z), p };
  }
  function pieceAt(x, y) {
    const r = canvas.getBoundingClientRect(); ndc.set(((x - r.left) / r.width) * 2 - 1, -((y - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hit = ray.intersectObject(fort.root, true).find(i => i.object.userData.cell);
    if (hit) return hit.object.userData.cell;
    const c = cellAt(x, y); return c ? fort.at(c.gx, c.gz) : null;
  }

  /* ---------- ghosts ---------- */
  const ghostMat = { ok: new THREE.MeshStandardMaterial({ color: 0x7dff9a, transparent: true, opacity: 0.55, emissive: 0x2fbf4a, emissiveIntensity: 0.4, depthWrite: false }),
    bad: new THREE.MeshStandardMaterial({ color: 0xff7d7d, transparent: true, opacity: 0.45, emissive: 0xe8463b, emissiveIntensity: 0.4, depthWrite: false }),
    upgrade: new THREE.MeshStandardMaterial({ color: 0xffe17a, transparent: true, opacity: 0.6, emissive: 0xffc83d, emissiveIntensity: 0.5, depthWrite: false }) };
  function makeGhost(type, lv) { const g = makePiece(type, lv, {}); g.traverse(o => { if (o.isMesh) { o.material = ghostMat.ok; o.castShadow = false; } if (o.isLight) o.intensity = 0; }); stage.scene.add(g); return g; }
  function tintGhost(g, kind) { g.traverse(o => { if (o.isMesh) o.material = ghostMat[kind]; }); }

  /* ---------- drops: falling, squash, dust ---------- */
  function dropIn(c, big = false) {
    if (!c.obj) return; const o = c.obj; const y0 = o.position.y;
    if (reducedMotion) { landFx(c, big); return; }
    o.position.y = y0 + 2.4; o.scale.set(0.9, 1.15, 0.9); drops.push({ o, y0, t: 0, c, big });
  }
  function landFx(c, big) {
    const p = fort.centre(c.gx, c.gz); p.y += 0.1;
    fx.emit(p, { n: big ? 26 : 14, color: 0xe2d3ae, colors: [0xe2d3ae, 0xcdb98a, 0xffffff], speed: 2.4, up: 1.6, size: 0.18, life: 0.7, grav: 6 });
    sfx(PIECES[c.t].cat === "decor" ? "wood" : c.t === "wall" && c.lv === 1 ? "place" : c.t === "spikes" || c.t === "goo" ? "wood" : "stone"); if (PIECES[c.t].cat !== "decor") sfx("place");
    stage.shake(big ? 0.3 : 0.12, 0.25);
  }
  stage.onFrame(dt => {
    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i]; d.t += dt; const k = Math.min(1, d.t / 0.22);
      d.o.position.y = d.y0 + 2.4 * (1 - k * k);
      if (k >= 1) {
        const s = Math.min(1, (d.t - 0.22) / 0.18); const sq = Math.sin(s * Math.PI) * 0.18;
        d.o.position.y = d.y0; d.o.scale.set(1 + sq, 1 - sq, 1 + sq);
        if (!d.landed) { d.landed = true; landFx(d.c, d.big); }
        if (s >= 1) { d.o.scale.set(1, 1, 1); drops.splice(i, 1); }
      }
    }
  });

  /* ---------- actions ---------- */
  function tryPlace(type, gx, gz, { quiet = false } = {}) {
    const v = fort.check(type, gx, gz);
    if (!v.ok) { if (!quiet) { sfx("wrong"); toast(v.reason); } return false; }
    if (v.kind === "upgrade") return tryUpgrade(v.cell, quiet);
    const cost = costOf(type, 1), bp = PIECES[type].bp ? type : null;
    if (!canPay(cost, bp)) { if (!quiet) { sfx("wrong"); toast(`You need ${missing(cost, bp)}. Answer questions to earn more!`); } return false; }
    pay(cost, bp); const c = fort.place(type, gx, gz, 1); dropIn(c); commit(); return true;
  }
  function tryUpgrade(c, quiet = false) {
    if (c.lv >= maxLevel(c.t)) { if (!quiet) toast("That one is already at the top level."); return false; }
    const cost = costOf(c.t, c.lv + 1);
    if (!canPay(cost)) { if (!quiet) { sfx("wrong"); toast(`To upgrade you need ${missing(cost)}.`); } return false; }
    pay(cost); fort.upgrade(c); dropIn(c, true);
    setTimeout(() => { fx.emit(fort.centre(c.gx, c.gz).add(new THREE.Vector3(0, 1.5, 0)), { n: 30, colors: [0xffc83d, 0xffffff, 0xffe17a], speed: 3, up: 4, size: 0.16, life: 1.1 }); sfx("star"); }, 300);
    toast(`⬆ ${PIECES[c.t].lvName ? PIECES[c.t].lvName[c.lv - 1] : PIECES[c.t].name}!`); commit(); return true;
  }
  function pickUp(c) {
    const tot = fort.spentOn(c); refund(tot, PIECES[c.t].bp ? c.t : null);
    const p = fort.centre(c.gx, c.gz); fort.remove(c); sfx("pickup"); fx.emit(p.add(new THREE.Vector3(0, 0.5, 0)), { n: 12, colors: [0xffffff, 0xe2d3ae], speed: 2, up: 3, life: 0.6 }); commit();
  }
  function commit() { save.commit(); paintMats(); paintTray(); onChange && onChange(); }

  /* ---------- camera + canvas gestures ---------- */
  const ptrs = new Map(); let gesture = null, paintLast = null;
  function clampRig() { rig.pitch = Math.max(0.32, Math.min(1.3, rig.pitch)); rig.dist = Math.max(12, Math.min(62, rig.dist)); }
  canvas.addEventListener("wheel", e => { e.preventDefault(); rig.goal = null; rig.dist *= Math.exp(e.deltaY * 0.0012); clampRig(); }, { passive: false });
  canvas.addEventListener("contextmenu", e => e.preventDefault());
  canvas.addEventListener("pointerdown", e => {
    unlockAudio(); closePopup(); canvas.setPointerCapture(e.pointerId);
    ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY });
    rig.goal = null; rig.autoSpin = 0;
    if (ptrs.size === 2) { if (drag && drag.kind === "move") cancelDrag(); const [a, b] = [...ptrs.values()]; gesture = { kind: "pinch", d: Math.hypot(a.x - b.x, a.y - b.y), ang: Math.atan2(b.y - a.y, b.x - a.x) }; paintLast = null; return; }
    if (e.button === 2 || e.button === 1) { gesture = { kind: "orbit" }; return; }
    if (selected) { gesture = { kind: "paint" }; paintAt(e.clientX, e.clientY); return; }
    const c = active ? pieceAt(e.clientX, e.clientY) : null;
    gesture = c ? { kind: "piece", cell: c } : { kind: "orbit", tap: true };
  });
  canvas.addEventListener("pointermove", e => {
    const p = ptrs.get(e.pointerId); if (!p) return;
    const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
    if (!gesture) return;
    if (gesture.kind === "pinch" && ptrs.size === 2) {
      const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y), ang = Math.atan2(b.y - a.y, b.x - a.x);
      rig.dist *= gesture.d / Math.max(10, d); rig.yaw -= (ang - gesture.ang); gesture.d = d; gesture.ang = ang;
      rig.pitch += dy * 0.002; clampRig(); return;
    }
    const moved = Math.hypot(e.clientX - p.x0, e.clientY - p.y0) > 8;
    if (gesture.kind === "orbit" && (moved || !gesture.tap)) { gesture.tap = false; rig.yaw -= dx * 0.008; rig.pitch += dy * 0.005; clampRig(); }
    else if (gesture.kind === "piece" && moved) { startMove(gesture.cell, e); gesture = { kind: "drag" }; }
    else if (gesture.kind === "drag") moveDrag(e.clientX, e.clientY);
    else if (gesture.kind === "paint") paintAt(e.clientX, e.clientY);
  });
  const up = e => {
    const p = ptrs.get(e.pointerId); ptrs.delete(e.pointerId); if (!p) return;
    if (!gesture) return;
    if (gesture.kind === "pinch") { if (ptrs.size === 0) gesture = null; return; }
    if (gesture.kind === "piece") openPopup(gesture.cell);
    else if (gesture.kind === "drag") endDrag(e.clientX, e.clientY);
    else if (gesture.kind === "orbit" && gesture.tap) { const c = cellAt(e.clientX, e.clientY); if (c && fort.inKeep(c.gx, c.gz)) toast("This is your keep. Protect it from the demons!"); }
    gesture = null; paintLast = null;
  };
  canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", e => { if (drag) cancelDrag(); ptrs.delete(e.pointerId); gesture = null; });

  function paintAt(x, y) {
    const c = cellAt(x, y); if (!c) return; const k = c.gx + "," + c.gz; if (paintLast === k) return;
    const first = paintLast === null; paintLast = k;
    const ex = fort.at(c.gx, c.gz);
    if (ex && !first) return;                          // while painting, skip cells that are already built (no accidental upgrades)
    tryPlace(selected, c.gx, c.gz, { quiet: !first });
  }

  /* ---------- drag a piece (new from the tray, or one already built) ---------- */
  function startNew(type, e) {
    closePopup(); setSelected(null);
    drag = { kind: "new", type, lv: 1, ghost: makeGhost(type, 1) }; fort.showGrid(true); sfx("pickup"); trayEl.classList.add("dragging");
    moveDrag(e.clientX, e.clientY);
  }
  function startMove(c, e) {
    closePopup();
    drag = { kind: "move", type: c.t, lv: c.lv, cell: c, ghost: makeGhost(c.t, c.lv) }; c.obj.visible = false; fort.showGrid(true); sfx("pickup");
    trayEl.classList.add("dragging", "pickup"); moveDrag(e.clientX, e.clientY);
  }
  function overTray(x, y) { if (!trayEl || !trayEl.isConnected) return false; const r = trayEl.getBoundingClientRect(); return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom; }
  function moveDrag(x, y) {
    if (!drag) return;
    const c = cellAt(x, y);
    if (!c || overTray(x, y)) { drag.ghost.visible = false; fort.highlight(null); drag.gx = null; trayEl.classList.toggle("hot", !!(drag.kind === "move" && overTray(x, y))); return; }
    trayEl.classList.remove("hot");
    drag.ghost.visible = true; drag.gx = c.gx; drag.gz = c.gz;
    const v = fort.check(drag.type, c.gx, c.gz, drag.kind === "move" ? drag.cell : null);
    let kind = v.ok ? (v.kind === "upgrade" ? "upgrade" : "ok") : "bad";
    if (v.ok && drag.kind === "new") { const cost = v.kind === "upgrade" ? costOf(drag.type, v.cell.lv + 1) : costOf(drag.type, 1); if (!canPay(cost, v.kind === "upgrade" ? null : PIECES[drag.type].bp ? drag.type : null)) kind = "bad"; }
    drag.verdict = { ...v, kind2: kind };
    tintGhost(drag.ghost, kind);
    drag.ghost.position.copy(fort.centre(c.gx, c.gz)); drag.ghost.position.y += (kind === "upgrade" ? (v.cell.obj ? 0.4 : 0) : 0.15) + Math.sin(performance.now() / 150) * 0.04;
    const rg = PIECES[drag.type].range; fort.highlight(c.gx, c.gz, kind === "bad" ? "bad" : kind === "upgrade" ? "upgrade" : "ok", rg ? rg[Math.min(rg.length, drag.lv) - 1] : 0);
  }
  function finishDrag() { if (drag) { stage.scene.remove(drag.ghost); } fort.highlight(null); fort.showGrid(!!selected); if (trayEl) trayEl.classList.remove("dragging", "pickup", "hot"); drag = null; }
  function cancelDrag() { if (drag && drag.kind === "move" && drag.cell.obj) drag.cell.obj.visible = true; finishDrag(); }
  function endDrag(x, y) {
    if (!drag) return;
    if (drag.kind === "move") {
      const c = drag.cell;
      if (overTray(x, y)) { finishDrag(); pickUp(c); return; }
      const v = drag.gx != null ? fort.check(c.t, drag.gx, drag.gz, c) : { ok: false };
      if (v.ok && (drag.gx !== c.gx || drag.gz !== c.gz)) { fort.move(c, drag.gx, drag.gz); c.obj.visible = true; finishDrag(); dropIn(c); commit(); return; }
      c.obj.visible = true; finishDrag(); if (!v.ok && v.reason) toast(v.reason); return;
    }
    const { type, gx, gz } = drag; finishDrag();
    if (gx == null) return;
    tryPlace(type, gx, gz);
  }
  addEventListener("pointermove", e => { if (drag && drag.kind === "new") moveDrag(e.clientX, e.clientY); });
  addEventListener("pointerup", e => { if (drag && drag.kind === "new") endDrag(e.clientX, e.clientY); });

  /* ---------- tap a built piece: upgrade or pick up ---------- */
  function closePopup() { if (popup) { popup.remove(); popup = null; } }
  function openPopup(c) {
    closePopup(); sfx("click");
    const P = PIECES[c.t], top = c.lv >= maxLevel(c.t), next = top ? null : costOf(c.t, c.lv + 1);
    const name = P.lvName ? P.lvName[c.lv - 1] : P.name;
    popup = h("div", { class: "popup panel fade-in", role: "dialog", "aria-label": name },
      h("div", { class: "pophead" }, h("img", { src: thumbs[c.t + c.lv] || (thumbs[c.t + c.lv] = pieceThumb(c.t, c.lv)), alt: "" }),
        h("div", {}, h("b", {}, name), maxLevel(c.t) > 1 ? h("div", { class: "lvl" }, ...Array.from({ length: maxLevel(c.t) }, (_, i) => h("i", { class: i < c.lv ? "on" : "" }))) : null, h("div", { class: "tip" }, P.tip))),
      h("div", { class: "popbtns" },
        top ? (maxLevel(c.t) > 1 ? h("span", { class: "maxed" }, "★ Top level") : null)
          : h("button", { class: "btn gold small", type: "button", disabled: canPay(next) ? null : "", onclick: () => { closePopup(); tryUpgrade(c); } }, "⬆ Upgrade ", costChips(next)),
        h("button", { class: "btn blue small", type: "button", onclick: () => { closePopup(); pickUp(c); } }, "↩ Pick up"),
        h("button", { class: "btn plain small", type: "button", "aria-label": "Close", onclick: closePopup }, "✕")));
    document.body.append(popup);
  }

  /* ---------- the tray ---------- */
  function setSelected(t) {
    selected = t; fort.showGrid(!!t); paintTray();
    if (t) { sfx("click"); toast(`Tap or drag on the grass to build ${PIECES[t].name.toLowerCase()}s. Tap ✓ Done when you've finished.`); }
  }
  function paintMats() {
    if (!matsEl) return;
    matsEl.replaceChildren(...Object.keys(MATS).map(m => h("span", { class: "mat", title: MATS[m].name }, h("span", { class: "mi" }, MATS[m].icon), h("b", {}, m === "gold" ? S().gold : (S().mats[m] || 0)))));
  }
  function paintTray() {
    if (!trayEl) return;
    const list = ORDER[tab];
    trayEl.querySelector(".tabs").replaceChildren(
      ...[["defend", "🛡️ Defend"], ["decor", "🌸 Decorate"]].map(([k, l]) => h("button", { type: "button", class: "tab" + (tab === k ? " on" : ""), "aria-pressed": tab === k ? "true" : "false", onclick: () => { tab = k; setSelected(null); sfx("click"); } }, l)),
      selected ? h("button", { type: "button", class: "btn small done", onclick: () => setSelected(null) }, "✓ Done") : h("span", { class: "hint" }, isTouch ? "Drag a piece onto the grass, or tap it to build lots" : "Drag a piece onto the grass, or click it to build lots"));
    trayEl.querySelector(".items").replaceChildren(...list.map(t => {
      const P = PIECES[t], cost = costOf(t, 1), bp = P.bp ? t : null, afford = canPay(cost, bp);
      const el = h("button", { type: "button", class: "item" + (afford ? "" : " poor") + (selected === t ? " sel" : ""), "data-piece": t, "aria-label": `${P.name}. ${P.tip}` },
        h("img", { src: thumbs[t + 1] || (thumbs[t + 1] = pieceThumb(t, 1)), alt: "", draggable: "false" }),
        h("span", { class: "nm" }, P.name), costChips(cost),
        bp ? h("span", { class: "bp" + ((S().blueprints[t] || 0) ? "" : " none") }, `📜 ${S().blueprints[t] || 0} plan${(S().blueprints[t] || 0) === 1 ? "" : "s"}`) : null);
      let st = null;
      el.addEventListener("pointerdown", e => { unlockAudio(); st = { x: e.clientX, y: e.clientY, id: e.pointerId, live: true }; });
      el.addEventListener("pointermove", e => { if (!st || !st.live || drag) return; const dy = st.y - e.clientY, dx = Math.abs(e.clientX - st.x); if (dy > 14 && dy > dx) { st.live = false; try { el.releasePointerCapture(e.pointerId); } catch (_) {} startNew(t, e); } });
      el.addEventListener("pointerup", () => { if (st && st.live && !drag) setSelected(selected === t ? null : t); st = null; });
      el.addEventListener("pointercancel", () => { st = null; });
      el.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setSelected(selected === t ? null : t); } });
      el.addEventListener("click", e => e.preventDefault());
      return el;
    }));
  }
  function mount(ui) {
    matsEl = h("div", { class: "mats", "aria-label": "Your materials" });
    trayEl = h("div", { class: "tray panel", role: "toolbar", "aria-label": "Build tray" }, h("div", { class: "tabs" }), h("div", { class: "items" }), h("div", { class: "drophere" }, "↩ Drop here to pick it up"));
    paintMats(); paintTray(); active = true;
    return { mats: matsEl, tray: trayEl };
  }
  function unmount() { closePopup(); if (drag) cancelDrag(); selected = null; active = false; fort.showGrid(false); }

  /* idle towers look around */
  stage.onFrame((dt, t) => fort.cells.forEach(c => { const a = c.obj && c.obj.userData.aim; if (a) a.rotation.y = Math.sin(t * 0.4 + c.gx * 1.3 + c.gz) * 1.2; }));

  return { mount, unmount, paintMats, paintTray, tryPlace, tryUpgrade, pickUp, get selected() { return selected; }, setSelected, canPay };
}
