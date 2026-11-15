/* The fort: a grid of building land around the keep, the pieces on it, and the rules for placing them.
   Cell (gx, gz) has its centre at (gx + 0.5, 1, gz + 0.5). Saved as S.forts[region].pieces = [[type, gx, gz, level], ...]. */
import { THREE, block, mat } from "./gfx.js";
import { PIECES, JOINS, makePiece, maxLevel } from "./pieces.js";

export const MAX_HALF = 14;         // the plateau: cells -14..13 (28 x 28)
export const KEEP = { x0: -2, x1: 1, z0: -2, z1: 1 };
const GROUND = 1;
const key = (x, z) => x + "," + z;

/* how much land is claimed: starts 20 x 20, one more ring for every 3 topics mastered, up to 28 x 28 */
export function claimedHalf(S) {
  const mastered = Object.values(S.lv || {}).filter(l => (l.stars || 0) >= 3).length;
  return Math.min(MAX_HALF, 10 + Math.floor(mastered / 3) + (S.bonusLand || 0));
}

export function createFort({ scene, state, region = 1, island, onFrameObjects }) {
  const root = new THREE.Group(); scene.add(root);
  const cells = new Map();          // key -> { t, gx, gz, lv, obj }
  const S = typeof state === "function" ? state : () => state;
  const F = () => (S().forts[region] || (S().forts[region] = { pieces: [] }));
  let half = claimedHalf(S());

  const inLand = (gx, gz) => gx >= -half && gx < half && gz >= -half && gz < half;
  const inKeep = (gx, gz) => gx >= KEEP.x0 && gx <= KEEP.x1 && gz >= KEEP.z0 && gz <= KEEP.z1;
  const at = (gx, gz) => cells.get(key(gx, gz)) || null;
  const centre = (gx, gz) => new THREE.Vector3(gx + 0.5, GROUND, gz + 0.5);

  function neighbours(gx, gz, type) {
    const joins = type === "bridge" ? (c => c && (c.t === "moat" || c.t === "bridge" || c.t === "path")) : (c => c && JOINS.has(c.t));
    return { e: joins(at(gx + 1, gz)), w: joins(at(gx - 1, gz)), n: joins(at(gx, gz - 1)), s: joins(at(gx, gz + 1)) };
  }
  function dispose(o) { o.traverse(m => { if (m.userData.baked && m.geometry) m.geometry.dispose(); }); }
  function draw(c) {
    if (c.obj) { root.remove(c.obj); onFrameObjects.delete(c.obj); dispose(c.obj); }
    c.obj = makePiece(c.t, c.lv, neighbours(c.gx, c.gz, c.t));
    c.obj.position.copy(centre(c.gx, c.gz)); c.obj.userData.cell = c;
    c.obj.traverse(o => { o.userData.cell = c; });
    root.add(c.obj); if (c.obj.userData.update || c.obj.userData.aim) onFrameObjects.add(c.obj);
    return c.obj;
  }
  function redrawAround(gx, gz) { [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dz]) => { const n = at(gx + dx, gz + dz); if (n && (n.t === "wall" || n.t === "gate" || n.t === "bridge")) draw(n); }); }
  function persist() { F().pieces = [...cells.values()].map(c => [c.t, c.gx, c.gz, c.lv]); }

  /* ---- what can go where ---- */
  // returns { ok, kind: "place" | "upgrade" | "move", reason }
  function check(type, gx, gz, moving = null) {
    if (!inLand(gx, gz)) return { ok: false, reason: Math.abs(gx + 0.5) < MAX_HALF && Math.abs(gz + 0.5) < MAX_HALF ? "This land isn't yours yet. Master more topics to claim it." : "Build on the grass inside your land." };
    if (inKeep(gx, gz)) return { ok: false, reason: "That's your keep." };
    const c = at(gx, gz);
    if (!c || c === moving) return { ok: true, kind: moving ? "move" : "place" };
    if (!moving && c.t === type && c.lv < maxLevel(type)) return { ok: true, kind: "upgrade", cell: c };
    if (!moving && c.t === type) return { ok: false, reason: "That one is already at the top level." };
    return { ok: false, reason: "Something is already built there." };
  }

  function place(type, gx, gz, lv = 1) {
    const c = { t: type, gx, gz, lv }; cells.set(key(gx, gz), c); draw(c); redrawAround(gx, gz); persist(); return c;
  }
  function upgrade(c) { c.lv = Math.min(maxLevel(c.t), c.lv + 1); draw(c); redrawAround(c.gx, c.gz); persist(); return c; }
  function remove(c) { cells.delete(key(c.gx, c.gz)); if (c.obj) { root.remove(c.obj); onFrameObjects.delete(c.obj); dispose(c.obj); } redrawAround(c.gx, c.gz); persist(); }
  function move(c, gx, gz) {
    cells.delete(key(c.gx, c.gz)); const ox = c.gx, oz = c.gz; c.gx = gx; c.gz = gz; cells.set(key(gx, gz), c);
    draw(c); redrawAround(ox, oz); redrawAround(gx, gz); persist(); return c;
  }
  /* everything spent on a piece, refunded in full when it is picked up */
  function spentOn(c) { const tot = {}; PIECES[c.t].cost.slice(0, c.lv).forEach(cost => Object.entries(cost).forEach(([m, n]) => (tot[m] = (tot[m] || 0) + n))); return tot; }

  function load() {
    [...cells.values()].forEach(c => { if (c.obj) { root.remove(c.obj); onFrameObjects.delete(c.obj); dispose(c.obj); } }); cells.clear();
    (F().pieces || []).forEach(([t, gx, gz, lv]) => { if (PIECES[t]) cells.set(key(gx, gz), { t, gx, gz, lv: lv || 1 }); });
    cells.forEach(draw);
  }

  /* ---- land: grid lines and border ---- */
  const gridMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.0 });
  let grid = null, border = null;
  function drawLand() {
    half = claimedHalf(S());
    if (grid) root.remove(grid); if (border) root.remove(border);
    const pts = [];
    for (let i = -half; i <= half; i++) { pts.push(i, GROUND + 0.01, -half, i, GROUND + 0.01, half, -half, GROUND + 0.01, i, half, GROUND + 0.01, i); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    grid = new THREE.LineSegments(g, gridMat); root.add(grid);
    // little marker stones along the edge of claimed land
    border = new THREE.Group();
    for (let i = -half; i <= half; i += 2) [[i, -half], [i, half], [-half, i], [half, i]].forEach(([x, z]) => { if (Math.abs(x) <= MAX_HALF && Math.abs(z) <= MAX_HALF) border.add(block(0.16, 0.34, 0.16, 0xe7d9b0, x, GROUND, z, { r: 0.05, cast: false })); });
    root.add(border);
    island && island.userData.paint((gx, gz) => inLand(gx, gz));
  }
  function showGrid(on) { gridMat.opacity = on ? 0.35 : 0.0; }

  /* highlight square for the cell under a dragged piece */
  const hl = new THREE.Mesh(new THREE.PlaneGeometry(0.96, 0.96), new THREE.MeshBasicMaterial({ color: 0x2fbf4a, transparent: true, opacity: 0.45, depthWrite: false }));
  hl.rotation.x = -Math.PI / 2; hl.visible = false; root.add(hl);
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.97, 1, 64), new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false, side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.visible = false; root.add(ring);
  function highlight(gx, gz, state, range = 0) {
    if (gx == null) { hl.visible = false; ring.visible = false; return; }
    hl.visible = true; hl.position.set(gx + 0.5, GROUND + 0.03, gz + 0.5);
    hl.material.color.set(state === "bad" ? 0xe8463b : state === "upgrade" ? 0xffc83d : 0x2fbf4a);
    ring.visible = !!range && state !== "bad"; if (range) { ring.scale.setScalar(range); ring.position.set(gx + 0.5, GROUND + 0.04, gz + 0.5); }
  }

  drawLand(); load();
  return {
    root, cells, check, place, upgrade, remove, move, spentOn, load, at, centre, highlight, showGrid, redrawLand: drawLand,
    get half() { return half; }, inLand, inKeep,
    count: () => cells.size,
  };
}
