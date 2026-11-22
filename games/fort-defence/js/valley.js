/* Oliver's Valley: a home behind his forts that builds itself as he learns.
   - Only mastery grows it: every day at 3 stars (every subject pack), every Library and Scribe's Tower floor at 3 stars,
     every demon lord and final boss beaten. Gold, loot, time played and peeking add nothing.
   - It is worked out fresh from the save every time it opens, so his existing progress is already standing on the
     first visit. It saves only S.valley = { name, seen: [item ids he has watched appear], era, v }.
   - Five eras by the total mastered (Camp, Village, Town, City, Great City). Each subject fills its own quarter;
     the shared middle (roads, square, fields, windmill, harbour...) changes with the era.
   - A day that a demon lord marked for repair keeps its building, with scaffolding, until the repair passes.
   - Coming-up plots carry a signpost; tapping one offers the peek-ahead lesson, so the valley previews class topics.
   - It never gates anything and needs nothing managed: he can only look, turn the view and tap.
   Drawn with its own 3D stage (same blocky style as the forts); the fort's stage pauses while the valley is open. */
import { THREE, createStage, createParticles, block, group, mat, isTouch, reducedMotion, lowGfx } from "./gfx.js";
import { makeTree, makeFlower, REGION_LOOK } from "./models.js";
import { mergeGeometries } from "../vendor/addons/BufferGeometryUtils.js";
import { PACKS } from "../packs/index.js";
import { STRATEGIES } from "../packs/reading/strategies.js";
import { FLOORS } from "../packs/writing/floors.js";

/* ---------- what he has mastered ---------- */
export const ERAS = [
  { name: "Camp", at: 0, grew: "" },
  { name: "Village", at: 6, grew: "Your camp grew into a Village!" },
  { name: "Town", at: 16, grew: "Your village grew into a Town!" },
  { name: "City", at: 31, grew: "Your town grew into a City!" },
  { name: "Great City", at: 46, grew: "Your city became a Great City!" },
];
export const eraOf = n => ERAS.reduce((a, e, i) => (n >= e.at ? i : a), 0);

const STATUE_NAMES = { storm: "⚡ The Storm Stone", flood: "🌊 The Flood Post", locusts: "🦗 The Swarm Bell", rockslide: "🪨 The Rock Cairn" };
const statueName = k => STATUE_NAMES[k] || "🗿 A keepsake statue";
const QUARTER_NAMES = { "algebra-u3": "Builders' Yard", "science-u2": "Healers' Garden" };
const PACK_COLS = [0x3d6fd6, 0x2f9e5e, 0xc2453a, 0x2a9bb0, 0xb0663a, 0x6a7a2a];
const PACK_SLOTS = ["NW", "NE", "N", "W", "E", "S"];
const SLOT = { NW: [0, 0], N: [1, 0], NE: [2, 0], W: [0, 1], C: [1, 1], E: [2, 1], SW: [0, 2], S: [1, 2], SE: [2, 2] };

/* the quarters and every piece of the valley, from the save (read only) */
export function valleyModel(S) {
  const quarters = [], items = [];
  const lv = S.lv || {}, bosses = S.bosses || {}, repair = S.repair || {};
  const stars = k => (lv[k] && lv[k].stars) || 0;
  PACKS.forEach((pack, pi) => {
    const q = { id: pack.id, name: QUARTER_NAMES[pack.id] || pack.subject + " Quarter", subject: pack.subject, col: PACK_COLS[pi % PACK_COLS.length], slot: PACK_SLOTS[pi] || null, pack, regions: [] };
    if (!q.slot) return;
    quarters.push(q);
    const pre = pack.keyPrefix || "", byId = new Map(pack.topics.map(t => [t.id, t]));
    let dayNo = 0;
    pack.regions.forEach(r => {
      q.regions.push(r);
      r.topics.forEach(id => {
        const key = pre + id, t = byId.get(id); dayNo++;
        items.push({ id: "d:" + key, q, kind: "day", key, pack, region: r, title: t ? (t.short || t.title) : "Day " + dayNo, full: t ? t.title : "", label: pack.subject + " · Day " + dayNo,
          done: stars(key) >= 3, repair: !!repair[key] && stars(key) >= 3, stars: stars(key) });
      });
      if (r.lord) { const b = bosses[pre + r.n]; items.push({ id: "l:" + pack.id + ":" + r.n, q, kind: "lord", pack, region: r, title: "Beat " + r.lord.name, label: r.emoji + " " + r.name + " demon lord", done: !!(b && b.won) }); }
      if (r.final) { const b = bosses[pre + "final"]; items.push({ id: "f:" + pack.id, q, kind: "final", pack, region: r, title: "Beat " + r.final.name, label: pack.subject + " final boss", done: !!(b && b.won) }); }
    });
  });
  const tower = (id, name, col, slot, list, store, pre, what) => {
    const q = { id, name, subject: what, col, slot, regions: [] }; quarters.push(q);
    const fl = (S[store] && S[store].fl) || {};
    list.forEach((f, i) => items.push({ id: pre + f.k, q, kind: "floor", tower: id, title: f.name, label: what + " · Floor " + (i + 1), done: !!(fl[f.k] && fl[f.k].stars >= 3), stars: (fl[f.k] && fl[f.k].stars) || 0 }));
  };
  tower("library", "Lantern Library", 0x8a5cd6, "SW", STRATEGIES, "lib", "lib:", "Library");
  tower("scribe", "Scribes' Row", 0xd9772f, "SE", FLOORS, "wr", "wr:", "Scribe's Tower");
  const done = items.filter(i => i.done).length;
  const totalStars = Object.values(lv).reduce((a, l) => a + (l.stars || 0), 0) + ["lib", "wr"].reduce((a, s) => a + Object.values((S[s] && S[s].fl) || {}).reduce((b, f) => b + (f.stars || 0), 0), 0);
  return { quarters, items, done, total: items.length, era: eraOf(done), totalStars };
}

/* ---------- layout: a 3 x 3 grid of districts (8 x 8 tiles), roads between, the town square in the middle ---------- */
const D = 8, START = [-14, -4, 6], HALF = 17;
const slotOrigin = s => [START[SLOT[s][0]], START[SLOT[s][1]]];
function plotsFor(slot) {
  const [sx, sz] = slotOrigin(slot), a = [];
  for (let x = 0; x < D; x++) for (let z = 0; z < D; z++) if (x % 3 !== 2 && z % 3 !== 2) a.push([sx + x, sz + z]);
  return a.sort((p, q) => Math.hypot(p[0] + 0.5, p[1] + 0.5) - Math.hypot(q[0] + 0.5, q[1] + 0.5));
}
function tileKind(tx, tz, used) {
  for (const s in SLOT) {
    const [sx, sz] = slotOrigin(s);
    if (tx >= sx && tx < sx + D && tz >= sz && tz < sz + D) {
      if (s === "C") return "square";
      if (!used.has(s)) return "meadow";
      return ((tx - sx) % 3 === 2 || (tz - sz) % 3 === 2) ? "lane" : "plot";
    }
  }
  const road = v => (v >= -6 && v < -4) || (v >= 4 && v < 6);
  if ((road(tx) && tz >= -16 && tz < 16) || (road(tz) && tx >= -16 && tx < 16)) return "road";
  return "grass";
}

/* ---------- models (original blocky designs) ---------- */
const pyrCache = new Map();
function pyramid(side, h, color) {
  const k = side + "|" + h;
  if (!pyrCache.has(k)) pyrCache.set(k, new THREE.ConeGeometry(side / Math.SQRT2, h, 4, 1).rotateY(Math.PI / 4));
  const m = new THREE.Mesh(pyrCache.get(k), mat(color, { flat: true })); m.castShadow = true; m.position.y = h / 2; return m;
}
const at = (o, x, y, z) => { o.position.set(x, y + (o.position.y || 0), z); return o; };
const TIERS = [
  { w: 0.56, h: 0.42, wall: 0xa8743f, roof: 0.45 },
  { w: 0.68, h: 0.6, wall: 0xb98a55, roof: 0.5 },
  { w: 0.74, h: 0.74, wall: 0xd8d2c2, roof: 0.5 },
  { w: 0.78, h: 1.15, wall: 0xe4ddcc, roof: 0.55 },
  { w: 0.8, h: 1.25, wall: 0xece6d6, roof: 0.6 },
];
function house(tier, roofCol, extra) {
  const T = TIERS[tier], g = group(block(T.w, T.h, T.w, T.wall, 0, 0, 0, { r: 0.05 }));
  if (tier >= 1) g.add(block(0.18, 0.3, 0.04, 0x6b4a32, 0, 0, T.w / 2, { r: 0.02, cast: false }));
  if (tier >= 2) { const rows = tier >= 3 ? [0.45, 0.8] : [0.5]; rows.forEach(f => [-0.2, 0.2].forEach(o => { g.add(block(0.04, 0.13, 0.13, 0x3a4654, T.w / 2, T.h * f, o, { r: 0, cast: false })); if (f > 0.6) g.add(block(0.13, 0.13, 0.04, 0x3a4654, o, T.h * f, T.w / 2, { r: 0, cast: false })); })); }
  let top = T.h;
  if (tier === 4) { g.add(block(T.w + 0.06, 0.08, T.w + 0.06, 0xe8b73a, 0, T.h, 0, { r: 0.02 })); top += 0.08; }
  g.add(at(pyramid(T.w + 0.14, T.roof, tier === 0 ? 0xd9b85a : roofCol), 0, top, 0));
  if (extra === "lantern") { g.add(block(0.05, 0.55, 0.05, 0x3a3f46, T.w / 2 + 0.14, 0, T.w / 2 + 0.06, { r: 0 })); g.add(block(0.13, 0.13, 0.13, 0xffe27a, T.w / 2 + 0.14, 0.55, T.w / 2 + 0.06, { r: 0.03, emissive: 0xffb020, ei: 0.5 })); }
  if (extra === "quill") { const q = block(0.05, 0.42, 0.12, 0xffffff, 0, 0, 0, { r: 0.02 }); q.rotation.z = -0.5; g.add(at(q, T.w / 2 + 0.12, 0.05, 0)); g.add(block(0.18, 0.12, 0.18, 0x2b2b3a, T.w / 2 + 0.12, 0, 0.12, { r: 0.04 })); }
  g.userData.h = top + T.roof; g.userData.w = T.w;
  return compact(g);
}
/* merge a model's parts into one mesh per material (it still moves, scales and can be tapped as one) */
function compact(g) {
  const by = new Map();
  g.children.slice().forEach(o => {
    if (!o.isMesh || o.material.transparent) return;
    o.updateMatrix(); let geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); geo.applyMatrix4(o.matrix);
    if (!by.has(o.material)) by.set(o.material, { cast: o.castShadow, list: [] });
    by.get(o.material).list.push(geo); g.remove(o);
  });
  by.forEach((G, m) => { const geo = mergeGeometries(G.list, false); G.list.forEach(x => x.dispose()); const mesh = new THREE.Mesh(geo, m); mesh.castShadow = true; mesh.receiveShadow = true; mesh.userData.baked = true; g.add(mesh); });
  return g;
}
function lordTower(col) {
  const g = group(block(0.74, 2.0, 0.74, 0xbfb8a8, 0, 0, 0, { r: 0.04 }), block(0.84, 0.16, 0.84, 0xa9a291, 0, 2.0, 0, { r: 0.03 }));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(block(0.18, 0.18, 0.18, 0xa9a291, a * 0.33, 2.16, b * 0.33, { r: 0.03 })));
  g.add(at(pyramid(0.7, 0.75, col), 0, 2.16, 0));
  g.add(block(0.04, 0.5, 0.04, 0x4a3b2a, 0, 2.85, 0, { r: 0 }));
  const flag = block(0.36, 0.22, 0.03, col, 0.18, 3.1, 0, { r: 0.01 }); g.add(flag);
  const ph = Math.random() * 6; g.userData.update = (dt, t) => { flag.rotation.y = Math.sin(t * 2.4 + ph) * 0.35; };
  g.userData.h = 3.4; g.userData.w = 0.84; return g;
}
function finalSpire(col) {
  const g = group(block(0.96, 0.9, 0.96, 0xd7d1c2, 0, 0, 0, { r: 0.05 }), block(0.66, 1.9, 0.66, 0xe4ddcc, 0, 0.9, 0, { r: 0.04 }),
    block(0.74, 0.1, 0.74, 0xe8b73a, 0, 2.8, 0, { r: 0.02 }), block(0.98, 0.08, 0.98, col, 0, 0.9, 0, { r: 0.02 }));
  g.add(at(pyramid(0.76, 1.0, 0xe8b73a), 0, 2.9, 0));
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.14), mat(0x9ff3ff, { emissive: 0x4fd8ff, ei: 0.7, flat: true })); gem.position.y = 4.15; g.add(gem);
  g.userData.update = (dt, t) => { gem.rotation.y = t; gem.position.y = 4.15 + Math.sin(t * 2) * 0.06; };
  g.userData.h = 4.3; g.userData.w = 0.98; return g;
}
function scaffold(w, h) {
  const g = new THREE.Group(), o = w / 2 + 0.07;
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(block(0.05, h + 0.15, 0.05, 0x8a6440, a * o, 0, b * o, { r: 0 })));
  [h * 0.35, h * 0.75].forEach(y => { g.add(block(w + 0.22, 0.04, 0.08, 0xb58a5a, 0, y, o, { r: 0 })); g.add(block(0.08, 0.04, w + 0.22, 0xb58a5a, o, y, 0, { r: 0 })); });
  return g;
}
function signpost(col) {
  const g = group(block(0.07, 0.78, 0.07, 0x7a5636, 0, 0, 0, { r: 0.02 }), block(0.52, 0.28, 0.06, 0xf5ecd5, 0, 0.42, 0.04, { r: 0.03 }), block(0.52, 0.06, 0.07, col, 0, 0.42, 0.045, { r: 0.01 }));
  const mark = new THREE.Mesh(new THREE.OctahedronGeometry(0.13), mat(col, { emissive: col, ei: 0.35, flat: true })); mark.position.y = 1.05; g.add(mark);
  const ph = Math.random() * 6; g.userData.update = (dt, t) => { mark.position.y = 1.05 + Math.sin(t * 2.6 + ph) * 0.09; mark.rotation.y = t * 1.5; };
  g.userData.h = 1.3; g.userData.w = 0.5; return g;
}
function field(ripe) {
  const g = group(block(0.9, 0.06, 0.9, 0x8c6a3e, 0, 0, 0, { r: 0.02, cast: false }));
  for (let i = 0; i < 3; i++) g.add(block(0.18, ripe ? 0.2 : 0.12, 0.8, ripe ? 0xe0c25a : 0x6fb04a, -0.28 + i * 0.28, 0.06, 0, { r: 0.04, cast: false }));
  return g;
}
const fire = () => {
  const g = group(block(0.6, 0.08, 0.6, 0x6b5a4a, 0, 0, 0, { r: 0.03 }), block(0.36, 0.08, 0.1, 0x7a4a26, 0, 0.08, 0, { r: 0.02 }), block(0.1, 0.08, 0.36, 0x7a4a26, 0, 0.12, 0, { r: 0.02 }));
  const f = block(0.2, 0.34, 0.2, 0xff8a1f, 0, 0.16, 0, { r: 0.06, emissive: 0xff6a00, ei: 0.8, cast: false }); g.add(f);
  const f2 = block(0.12, 0.22, 0.12, 0xffd34d, 0, 0.2, 0, { r: 0.04, emissive: 0xffc000, ei: 0.8, cast: false }); g.add(f2);
  g.userData.update = (dt, t) => { const s = 1 + Math.sin(t * 11) * 0.12; f.scale.set(1, s, 1); f2.scale.set(1, 2 - s, 1); };
  return g;
};
const well = () => group(block(0.5, 0.32, 0.5, 0x9aa0a6, 0, 0, 0, { r: 0.06 }), block(0.36, 0.04, 0.36, 0x2f7fc0, 0, 0.3, 0, { r: 0, cast: false }),
  block(0.06, 0.4, 0.06, 0x7a5636, -0.2, 0.32, 0, { r: 0 }), block(0.06, 0.4, 0.06, 0x7a5636, 0.2, 0.32, 0, { r: 0 }), at(pyramid(0.6, 0.25, 0xb24a3a), 0, 0.72, 0));
const hut = () => group(block(0.6, 0.42, 0.6, 0xa8743f, 0, 0, 0, { r: 0.05 }), at(pyramid(0.74, 0.45, 0xd9b85a), 0, 0.42, 0));
const stall = c => group(block(0.7, 0.35, 0.45, 0xb98a55, 0, 0, 0, { r: 0.03 }), block(0.8, 0.06, 0.6, c, 0, 0.62, 0, { r: 0.02 }),
  block(0.05, 0.62, 0.05, 0x7a5636, -0.34, 0, 0.26, { r: 0 }), block(0.05, 0.62, 0.05, 0x7a5636, 0.34, 0, 0.26, { r: 0 }), block(0.14, 0.1, 0.14, 0xff9f43, -0.15, 0.35, 0, { r: 0.04 }), block(0.14, 0.1, 0.14, 0x7ed957, 0.12, 0.35, 0, { r: 0.04 }));
function windmill() {
  const g = group(block(0.8, 1.7, 0.8, 0xefe6d2, 0, 0, 0, { r: 0.05 }), at(pyramid(0.9, 0.5, 0xb24a3a), 0, 1.7, 0));
  const hub = new THREE.Group(); hub.position.set(0, 1.45, 0.45);
  for (let i = 0; i < 4; i++) { const b = block(0.14, 0.75, 0.03, 0xf5ecd5, 0, 0, 0, { r: 0.01 }); b.position.set(0, 0.38, 0); const arm = new THREE.Group(); arm.add(b); arm.rotation.z = i * Math.PI / 2; hub.add(arm); }
  g.add(hub); g.userData.update = dt => { hub.rotation.z += dt * 0.9; };
  return g;
}
function fountain() {
  const g = group(block(1.5, 0.22, 1.5, 0xc9c4b6, 0, 0, 0, { r: 0.06 }), block(1.24, 0.04, 1.24, 0x4fb6ea, 0, 0.2, 0, { r: 0, cast: false }), block(0.28, 0.7, 0.28, 0xd7d1c2, 0, 0.2, 0, { r: 0.05 }), block(0.6, 0.08, 0.6, 0xd7d1c2, 0, 0.9, 0, { r: 0.04 }));
  const jet = block(0.12, 0.3, 0.12, 0xbfe9ff, 0, 0.98, 0, { r: 0.05, opacity: 0.85, cast: false }); g.add(jet);
  g.userData.update = (dt, t) => { jet.scale.y = 1 + Math.sin(t * 6) * 0.2; };
  return g;
}
function hall() {
  const g = group(block(2.6, 1.4, 1.9, 0xe4ddcc, 0, 0, 0, { r: 0.05 }), block(2.75, 0.1, 2.05, 0xe8b73a, 0, 1.4, 0, { r: 0.02 }), block(2.9, 0.12, 2.3, 0xd7d1c2, 0, 0, 0, { r: 0.03 }));
  for (let i = 0; i < 5; i++) g.add(block(0.14, 1.4, 0.14, 0xf3eee2, -1.1 + i * 0.55, 0, 1.05, { r: 0.04 }));
  const r = pyramid(2.75, 0.9, 0x3a6b8f); r.scale.z = 2.05 / 2.75; g.add(at(r, 0, 1.5, 0));
  g.add(block(0.4, 0.6, 0.05, 0x6b4a32, 0, 0, 0.96, { r: 0.02 }));
  return g;
}
const lamp = () => group(block(0.07, 0.95, 0.07, 0x3a3f46, 0, 0, 0, { r: 0 }), block(0.17, 0.17, 0.17, 0xfff2b0, 0, 0.95, 0, { r: 0.04, emissive: 0xffd060, ei: 0.45, cast: false }));
function boat() {
  const g = group(block(0.55, 0.28, 1.3, 0x7a4b2a, 0, 0, 0, { r: 0.08 }), block(0.05, 1.1, 0.05, 0x4a3b2a, 0, 0.28, 0, { r: 0 }), block(0.03, 0.7, 0.55, 0xf5ecd5, 0.03, 0.55, 0.05, { r: 0.01 }));
  g.userData.update = (dt, t) => { g.position.y = -0.18 + Math.sin(t * 1.6) * 0.04; g.rotation.z = Math.sin(t * 1.3) * 0.04; };
  return g;
}
function outpost(col) {
  const g = group(block(1.2, 0.55, 1.2, 0x8e8a99, 0, 0, 0, { r: 0.05 }), block(0.5, 1.0, 0.5, 0x9b97a8, 0, 0.55, 0, { r: 0.04 }));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => g.add(block(0.32, 0.85, 0.32, 0xa5a1b0, a * 0.5, 0, b * 0.5, { r: 0.04 })));
  g.add(block(0.04, 0.6, 0.04, 0x4a3b2a, 0, 1.55, 0, { r: 0 }));
  const flag = block(0.34, 0.22, 0.03, col, 0.17, 1.9, 0, { r: 0.01 }); g.add(flag);
  const ph = Math.random() * 6; g.userData.update = (dt, t) => { flag.rotation.y = Math.sin(t * 2.2 + ph) * 0.35; };
  return g;
}
const VCOLS = [0xe34b4b, 0x2f6fde, 0xf2b134, 0x7c4dff, 0x2f9e5e, 0xff8ab8, 0x2fb7c9, 0xa0522d];
/* a storm tarp over a roof (js/storms.js): mended with 2 questions */
function tarp(w, top) {
  const g = new THREE.Group(), s = w + 0.2;
  const a = block(s, 0.05, s * 0.62, 0x2f7fe0, 0, top - 0.32, -s * 0.2, { r: 0.01 }); a.rotation.x = 0.5;
  const b = block(s * 0.7, 0.05, s * 0.5, 0x2a6fc4, 0.05, top - 0.36, s * 0.24, { r: 0.01 }); b.rotation.x = -0.55;
  g.add(a, b);
  [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([x, z]) => g.add(block(0.12, 0.1, 0.12, 0x8d8a83, x * (w / 2 + 0.16), 0, z * (w / 2 + 0.16), { r: 0.03 })));
  g.userData.tarp = true; return g;
}
/* a keepsake statue for a storm fully defended */
function statue(kind) {
  const g = group(block(0.5, 0.3, 0.5, 0xb9b3a6, 0, 0, 0, { r: 0.04 }), block(0.36, 0.08, 0.36, 0xe8b73a, 0, 0.3, 0, { r: 0.02 }));
  if (kind === "storm") { const z1 = block(0.1, 0.38, 0.1, 0xffd23f, 0, 0.38, 0, { r: 0.02, emissive: 0xffb020, ei: 0.4 }); z1.rotation.z = 0.5; const z2 = block(0.1, 0.38, 0.1, 0xffd23f, 0.1, 0.68, 0, { r: 0.02, emissive: 0xffb020, ei: 0.4 }); z2.rotation.z = -0.5; g.add(z1, z2); }
  else if (kind === "flood") { g.add(block(0.14, 0.7, 0.14, 0x6b4a32, 0, 0.38, 0, { r: 0.03 })); [0.55, 0.75, 0.95].forEach(y => g.add(block(0.18, 0.04, 0.18, 0x2fa7e6, 0, y, 0, { r: 0.01 }))); }
  else if (kind === "locusts") { g.add(block(0.06, 0.3, 0.06, 0x6b4a32, 0, 0.38, 0, { r: 0 })); g.add(at(pyramid(0.34, 0.3, 0xc8963a), 0, 0.52, 0)); }
  else { [[0.36, 0.38], [0.26, 0.6], [0.16, 0.78]].forEach(([w, y]) => g.add(block(w, w * 0.8, w, 0x9a958b, 0, y, 0, { r: 0.05 }))); }
  return g;
}
function villager(i) {
  const g = group(block(0.2, 0.26, 0.16, VCOLS[i % VCOLS.length], 0, 0, 0, { r: 0.04 }), block(0.16, 0.16, 0.16, [0xf2c9a0, 0xd9a273, 0x8d5a3b, 0xffe0bd][i % 4], 0, 0.26, 0, { r: 0.04 }));
  return g;
}

/* ---------- the valley view ---------- */
export function createValley({ ui, h, save, prog, day, library, scribe, toast, sfx = () => {}, mainStage, onClose }) {
  const S = () => save.state;
  let stage = null, canvas = null, world = null, open_ = false, pickables = [], walkers = [], info = null, bar = null, caption = null, offFrame = null, popping = [];
  let fx = null, mode = {}, storms = null;
  const V = () => S().valley || null;
  const playerName = () => { const p = (window.Family && Family.ready && Family.player) || ""; return p ? p[0].toUpperCase() + p.slice(1) + "'s Valley" : "My Valley"; };

  function news() {
    const m = valleyModel(S()), v = V();
    if (!v) return { first: m.done > 0, n: 0, model: m };
    const seen = new Set(v.seen || []);
    const fresh = m.items.filter(i => i.done && !seen.has(i.id));
    return { first: false, n: fresh.length, fresh, model: m };
  }

  function ensureStage() {
    if (stage) return;
    canvas = document.createElement("canvas"); canvas.id = "vc"; canvas.setAttribute("aria-label", "Your valley");
    canvas.style.cssText = "position:fixed;inset:0;width:100%;height:100%;display:none;touch-action:none";
    const c0 = document.getElementById("c"); c0.after(canvas);
    stage = createStage(canvas); stage.pause(true);
    fx = createParticles(stage.scene, 400);
    stage.onFrame((dt, t) => { if (world) world.traverse(o => o.userData.update && o.userData.update(dt, t)); walk(dt); pop(dt); fx.update(dt); sky(dt, t); effects(dt); });
    controls();
  }

  /* ---------- build the scene from the save ---------- */
  function build(m) {
    if (world) { stage.scene.remove(world); world.traverse(o => { if (o.isInstancedMesh) o.dispose(); else if (o.userData.baked) o.geometry.dispose(); }); }
    world = new THREE.Group(); stage.scene.add(world); pickables = []; walkers = [];
    const era = m.era, used = new Set(m.quarters.map(q => q.slot)); used.add("C");
    let seed = 13; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

    // ground: one block per tile, coloured by what it is and the era
    const N = HALF * 2, tiles = new THREE.InstancedMesh(new THREE.BoxGeometry(0.98, 0.3, 0.98), mat(0xffffff), N * N);
    tiles.receiveShadow = !lowGfx;
    const grass = [0x7cc35a, 0x76c257, 0x72c055, 0x6fbf55, 0x6cbe55][era], col = new THREE.Color(), dm = new THREE.Object3D();
    const meadowFields = [], near = new Set();   // lanes show only beside plots that are built on (or signposted)
    m.quarters.forEach(q => { const plots = plotsFor(q.slot), list = m.items.filter(i => i.q === q), n = Math.min(plots.length, list.filter(i => i.done).length + 1);
      plots.slice(0, n).forEach(([x, z]) => { for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) near.add((x + a) + "," + (z + b)); }); });
    let k = 0;
    for (let tx = -HALF; tx < HALF; tx++) for (let tz = -HALF; tz < HALF; tz++) {
      const kind = tileKind(tx, tz, used); let c = grass;
      if (kind === "road") c = era === 0 ? grass : era === 1 ? 0xb8935f : ((tx + tz) & 1 ? 0xbdb6a4 : 0xc6bfad);
      else if (kind === "lane") c = era === 0 || !near.has(tx + "," + tz) ? grass : era === 1 ? 0xc4a171 : 0xd0c8b2;
      else if (kind === "square") c = era === 0 ? (Math.hypot(tx + 0.5, tz + 0.5) < 2.6 ? 0xb8935f : grass) : era === 1 ? 0xc4a171 : ((tx + tz) & 1 ? 0xcfc8b6 : 0xd8d1c0);
      else if (kind === "meadow") meadowFields.push([tx, tz]);
      col.set(c); if (kind === "grass" || kind === "plot" || kind === "meadow" || (era === 0 && c === grass)) col.offsetHSL(0, 0, ((tx + tz) & 1) ? 0.015 : -0.015);
      dm.position.set(tx + 0.5, -0.15, tz + 0.5); dm.updateMatrix(); tiles.setMatrixAt(k, dm.matrix); tiles.setColorAt(k, col); k++;
    }
    world.add(tiles);
    world.add(block(N, 2.2, N + 5, 0x8a5a36, 0, -2.5, 2.5, { r: 0.1, cast: false }));
    world.add(block(N, 0.3, 5, 0x2fa7e6, 0, -0.42, HALF + 2.5, { r: 0, cast: false, receive: false }));

    // the quarters: one building per thing mastered, a signpost for what is next
    const tarps = (S().storm && S().storm.tarps) || {};
    m.quarters.forEach(q => {
      const plots = plotsFor(q.slot), list = m.items.filter(i => i.q === q);
      let nextShown = false;
      list.forEach((it, i) => {
        const p = plots[i]; if (!p) return;
        const x = p[0] + 0.5, z = p[1] + 0.5;
        let obj = null;
        if (it.done) {
          obj = it.kind === "lord" ? lordTower(q.col) : it.kind === "final" ? finalSpire(q.col) : house(era, q.col, it.tower === "library" ? "lantern" : it.tower === "scribe" ? "quill" : null);
          if (it.repair) obj.add(scaffold(obj.userData.w, obj.userData.h * 0.8));
          if (it.kind === "day" && tarps[it.key]) { obj.add(tarp(obj.userData.w, obj.userData.h)); it.tarp = tarps[it.key]; }
          obj.rotation.y = Math.floor(rnd() * 4) * Math.PI / 2;
        } else if (!nextShown) { nextShown = true; obj = signpost(q.col); obj.rotation.y = 0.6; it.next = true; }
        else if (era >= 1 && q.slot !== "NW" && q.slot !== "NE" && (i % 2 === 0)) { /* empty tower plots become gardens */ obj = field(era >= 2); }
        if (!obj) return;
        obj.userData.s = it.done ? 1.22 : 1.5; obj.scale.setScalar(obj.userData.s);
        obj.position.set(x, 0, z); obj.userData.item = it; it.obj = obj; world.add(obj);
        if (it.done || it.next) pickables.push(obj);
      });
    });

    // the shared valley, by era
    const add = (o, x, z, tip, ry = 0) => { o.position.set(x, o.position.y, z); o.rotation.y = ry; if (tip) { o.userData.tip = tip; pickables.push(o); } world.add(o); return o; };
    const eraTip = (what, e) => ({ title: what, line: e === 0 ? "Every valley starts with this." : "It arrived when your valley became a " + ERAS[e].name + "." });
    if (era <= 1) add(fire(), 0, 1.5, eraTip("🔥 The campfire", 0));
    add(well(), 2.6, 2.8, eraTip("🪣 The well", 0));
    if (era === 0) { add(hut(), -1.8, -1.2, eraTip("🛖 The first huts", 0), 0.4); add(hut(), 1.6, -1.8, eraTip("🛖 The first huts", 0), -0.3); add(field(false), -2.6, 2.6, eraTip("🌱 The first field", 0)); }
    const fieldSpots = meadowFields.filter(([x, z]) => (x % 3 !== 2) && (z % 3 !== 2)).sort((a, b) => Math.hypot(a[0], a[1]) - Math.hypot(b[0], b[1]));
    fieldSpots.slice(0, [0, 6, 10, 14, 18][era]).forEach(([x, z]) => add(field(era >= 2), x + 0.5, z + 0.5));
    if (era >= 1) { add(windmill(), -15.5, 2.5, eraTip("🌾 The windmill", 1), Math.PI / 2); add(stall(0xe34b4b), -2.6, 2.6, eraTip("🧺 The market", 1)); add(stall(0x2f6fde), 2.6, -2.6, eraTip("🧺 The market", 1), Math.PI); add(stall(0xf2b134), -2.6, -2.6, eraTip("🧺 The market", 1), Math.PI); }
    if (era >= 2) { add(fountain(), 0, 1.5, eraTip("⛲ The fountain", 2)); add(block(0.8, 0.12, 3.4, 0x8a6440, 0, -0.04, 0, { r: 0.02 }), 10.5, HALF + 1.4, eraTip("⚓ The harbour", 2)); add(boat(), 11.6, HALF + 2.4, eraTip("⚓ The harbour", 2)); }
    if (era >= 3) {
      for (let v = -14; v <= 14; v += 4) [[-6.3, v], [6.3, v], [v, -6.3], [v, 6.3]].forEach(([x, z]) => { if (Math.abs(x) > 5 && Math.abs(z) > 5) return; add(lamp(), x + 0.5, z + 0.5); });
      for (let x = -15; x <= 15; x += 2.5) world.add(block(0.35, 1.7, 0.6, 0xc9c4b6, x, 0, -HALF + 0.6, { r: 0.04 }));
      add(group(block(32, 0.32, 0.75, 0xd7d1c2, 0, 1.7, 0, { r: 0.04 }), block(31.6, 0.05, 0.4, 0x4fb6ea, 0, 2.02, 0, { r: 0, cast: false })), 0, -HALF + 0.6, eraTip("🌉 The aqueduct: fresh water for the city", 3));
    }
    if (era >= 4) {
      add(hall(), 0, -1.6, eraTip("🏛️ The grand hall", 4));
      let s2 = 3; const r2 = () => (s2 = (s2 * 16807) % 2147483647) / 2147483647;
      [[-3, 3.3], [3.3, -3.3], [-3.3, -3.3], [3.3, 0.2]].forEach(([x, z]) => { for (let i = 0; i < 5; i++) { const f = makeFlower(r2); f.position.set(x + (r2() - 0.5) * 0.9, 0, z + (r2() - 0.5) * 0.9); world.add(f); } });
    }

    // keepsake statues from storms he kept the valley safe in (js/storms.js)
    const STATUE_SPOTS = [[-3.7, 0.4], [3.7, 0.4], [-0.9, 3.7], [1.1, 3.7], [-3.7, -1.4], [3.7, -1.4], [-1.2, -3.7], [1.4, -3.7]];
    ((S().storm && S().storm.statues) || []).slice(-8).forEach((st, i) => { const [x, z] = STATUE_SPOTS[i]; add(statue(st.kind), x, z, { title: statueName(st.kind), line: "A keepsake: you kept the whole valley safe from this on " + st.at + "." }, i * 0.7); });

    // his forts stand guard on the edge: one small outpost for each land he has reached
    m.quarters.filter(q => q.pack).forEach(q => {
      const [c, r] = SLOT[q.slot], [sx, sz] = slotOrigin(q.slot);
      let n = 0;
      q.regions.forEach(R => {
        if (!R.topics.length) return;
        const pre = q.pack.keyPrefix || "", reached = R.topics.some(id => S().learnDone && S().learnDone[pre + id]);
        if (!reached) return;
        const along = sz + 1 + n * 2.3, alongX = sx + 1 + n * 2.3; n++;
        const pos = c !== 1 ? [c === 0 ? -HALF + 1 : HALF - 1, along] : [alongX, r === 0 ? -HALF + 1 : HALF - 1];
        const look = REGION_LOOK[R.look || R.n] || REGION_LOOK[1];
        add(outpost(look.grass), pos[0], pos[1], { title: "🏰 Your " + R.name + " fort", line: "Your forts guard the valley while it grows." }, c === 0 ? Math.PI / 2 : -Math.PI / 2);
      });
    });

    // trees on the wild edges, clouds above
    const trees = [];
    for (let tx = -HALF; tx < HALF; tx++) for (let tz = -HALF; tz < HALF; tz++) {
      if (tileKind(tx, tz, used) !== "grass" || Math.abs(tx) < 15 && Math.abs(tz) < 15 && rnd() < 0.7) continue;
      if (rnd() < 0.3) trees.push([tx, tz]);
    }
    const busy = new Set(); world.children.forEach(o => busy.add(Math.floor(o.position.x) + "," + Math.floor(o.position.z)));
    trees.filter(([x, z]) => !busy.has(x + "," + z)).forEach(([x, z]) => { const t = makeTree(rnd, [0x3fae4a, 0x5cc556, 0x2f9a45]); t.scale.setScalar(0.42); t.position.set(x + 0.5, 0, z + 0.5); world.add(t); });

    // villagers walk the roads (more as his stars grow)
    const count = Math.min(lowGfx ? 6 : isTouch ? 26 : 40, 3 + Math.floor(m.totalStars * 0.27));
    for (let i = 0; i < count; i++) {
      const v = villager(i); v.userData.walker = true; const line = i % 4, axisX = line < 2, lane = (line % 2 ? 5 : -5) + (rnd() < 0.5 ? -0.45 : 0.45);
      const w = { v, axisX, lane, pos: (rnd() - 0.5) * (era === 0 ? 8 : 28), dir: rnd() < 0.5 ? 1 : -1, sp: 0.5 + rnd() * 0.6, ph: rnd() * 6, lim: era === 0 ? 4.5 : 15 };
      walkers.push(w); world.add(v);
    }
    walk(0); bake();
  }
  /* fewer draw calls: everything that never moves and can't be tapped (ground props, trees, fields, lamps...) is merged
     into one mesh per material. Buildings, signposts and anything animated stay separate. */
  function bake() {
    world.updateMatrixWorld(true);
    const keep = o => o.userData.item || o.userData.tip || o.userData.update || o.userData.walker;
    const groups = new Map(), drop = [];
    world.children.forEach(top => {
      if (keep(top) || top.isInstancedMesh) return;
      let live = false; top.traverse(o => { if (o.userData.update) live = true; }); if (live) return;
      top.traverse(o => {
        if (!o.isMesh || o.material.transparent) return;
        const k = o.material.uuid + (o.castShadow ? "s" : "") + (o.receiveShadow ? "r" : "");
        let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); g = g.applyMatrix4(o.matrixWorld);
        ["uv1", "uv2"].forEach(a => g.deleteAttribute && g.getAttribute(a) && g.deleteAttribute(a));
        if (!groups.has(k)) groups.set(k, { m: o.material, cast: o.castShadow, rec: o.receiveShadow, list: [] });
        groups.get(k).list.push(g);
      });
      drop.push(top);
    });
    drop.forEach(o => world.remove(o));
    groups.forEach(G => { const geo = mergeGeometries(G.list, false); G.list.forEach(g => g.dispose()); if (!geo) return; const m = new THREE.Mesh(geo, G.m); m.castShadow = G.cast; m.receiveShadow = G.rec; m.userData.baked = true; world.add(m); });
  }
  function walk(dt) {
    walkers.forEach(w => {
      if (!reducedMotion) { w.pos += w.dir * w.sp * dt; if (Math.abs(w.pos) > w.lim) { w.pos = Math.sign(w.pos) * w.lim; w.dir *= -1; } }
      const x = w.axisX ? w.pos : w.lane, z = w.axisX ? w.lane : w.pos;
      w.v.position.set(x, Math.abs(Math.sin((w.pos + w.ph) * 6)) * 0.05, z);
      w.v.rotation.y = w.axisX ? (w.dir > 0 ? Math.PI / 2 : -Math.PI / 2) : (w.dir > 0 ? 0 : Math.PI);
    });
  }

  /* new buildings pop up one after another */
  let popT = 0;
  function pop(dt) {
    if (!popping.length) return;
    popT += dt;
    popping.forEach(p => { const k = Math.max(0, Math.min(1, (popT - p.at) / 0.45)); p.obj.scale.setScalar((p.obj.userData.s || 1) * (k <= 0 ? 0.001 : k < 1 ? Math.max(0.001, k * (1 + 0.3 * Math.sin(k * Math.PI))) : 1)); if (!p.played && k > 0) { p.played = true; sfx(p.big ? "horn" : "place"); } });
    if (popping.every(p => popT > p.at + 0.5)) { popping.forEach(p => p.obj.scale.setScalar(p.obj.userData.s || 1)); popping = []; }
  }
  function popIn(list, gap) {
    popT = 0; popping = list.filter(i => i.obj).map((i, n) => ({ obj: i.obj, at: 0.6 + n * gap, big: i.kind !== "day" && i.kind !== "floor" }));
    if (reducedMotion) { popping = []; return; }
    popping.forEach(p => p.obj.scale.setScalar(0.001));
  }

  /* ---------- turning, zooming and tapping ---------- */
  const VIEW = { yaw: 0.75, pitch: 0.8, dist: isTouch ? 50 : 42, target: new THREE.Vector3(0, -1, 1.5) };
  function controls() {
    const pts = new Map(); let moved = 0, pinch0 = 0, dist0 = 0;
    canvas.addEventListener("pointerdown", e => { pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); moved = 0; stage.rig.autoSpin = 0; if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); dist0 = stage.rig.dist; } try { canvas.setPointerCapture(e.pointerId); } catch (er) {} });
    canvas.addEventListener("pointermove", e => {
      const p = pts.get(e.pointerId); if (!p) return;
      const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
      const R = stage.rig;
      if (pts.size === 1) { R.goal = null; R.yaw -= dx * 0.006; R.pitch = Math.max(0.38, Math.min(1.25, R.pitch + dy * 0.004)); }
      else if (pts.size === 2 && pinch0) { const [a, b] = [...pts.values()]; R.goal = null; R.dist = Math.max(20, Math.min(80, dist0 * pinch0 / Math.max(20, Math.hypot(a.x - b.x, a.y - b.y)))); }
    });
    const up = e => { const had = pts.delete(e.pointerId); if (had && moved < 8 && pts.size === 0) pick(e); if (pts.size < 2) pinch0 = 0; };
    canvas.addEventListener("pointerup", up); canvas.addEventListener("pointercancel", e => pts.delete(e.pointerId));
    canvas.addEventListener("wheel", e => { e.preventDefault(); stage.rig.goal = null; stage.rig.dist = Math.max(20, Math.min(80, stage.rig.dist * (1 + Math.sign(e.deltaY) * 0.08))); }, { passive: false });
  }
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function pick(e) {
    const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, stage.camera);
    const hit = ray.intersectObjects(pickables, true)[0];
    if (!hit) { showInfo(null); return; }
    let o = hit.object; while (o && !o.userData.item && !o.userData.tip) o = o.parent;
    if (o) { sfx("click"); bounce(o); showInfo(o); }
  }
  function bounce(o) { if (reducedMotion) return; popT = 0; popping = popping.concat([{ obj: o, at: -0.1, played: true }]); }
  const focus = (o, d = 24) => stage.flyTo({ target: new THREE.Vector3(o.position.x, 0.5, o.position.z), dist: d }, 1.1);

  /* ---------- the panels ---------- */
  const starsTxt = n => "⭐".repeat(n) + "☆".repeat(Math.max(0, 3 - n));
  function lightFor(key) { try { const R = window.__fd && window.__fd.report; return R && R.lightOf ? R.lightOf(key) : null; } catch (e) { return null; } }
  function showInfo(o) {
    if (info) { info.remove(); info = null; }
    if (!o) return;
    const close = h("button", { class: "chip icon vx", type: "button", "aria-label": "Close", onclick: () => { sfx("click"); showInfo(null); } }, "✕");
    let body;
    if (o.userData.tip) body = [h("h3", {}, o.userData.tip.title), h("p", {}, o.userData.tip.line)];
    else {
      const it = o.userData.item, q = it.q;
      if (it.next) {
        const what = it.kind === "day" ? it.label + ": " + it.title : it.kind === "floor" ? it.label + ": " + it.title : it.title;
        const acts = [];
        if (it.kind === "day" && prog.pack === it.pack) {
          const node = prog.road.find(n => n.key === it.key);
          if (node && prog.nodeOpen(node)) acts.push(h("button", { class: "btn small", type: "button", onclick: () => { sfx("whoosh"); close_(); day.open(it.key); } }, "▶ Play this day"));
          else acts.push(h("button", { class: "btn small blue", type: "button", onclick: () => { sfx("click"); close_(); day.peekAhead(it.key); } }, "👀 Peek at the lesson"));
        } else if (it.kind === "day") acts.push(h("p", { class: "vnote" }, "It's in " + it.pack.subject + ". Open " + it.pack.subject + " from the home page to start it."));
        if (it.kind === "floor" && it.tower === "library" && library && library.has()) acts.push(h("button", { class: "btn small blue", type: "button", onclick: () => { sfx("click"); close_(); library.open(); } }, "📚 Open the Library"));
        if (it.kind === "floor" && it.tower === "scribe" && scribe && scribe.has()) acts.push(h("button", { class: "btn small blue", type: "button", onclick: () => { sfx("click"); close_(); scribe.open(); } }, "✍️ Open the Scribe's Tower"));
        body = [h("div", { class: "veyebrow" }, "🪧 Coming up in " + q.name), h("h3", {}, what), h("p", {}, it.kind === "lord" || it.kind === "final" ? "Beat it and a tower goes up here." : "Master it and a new building goes up here."), ...acts];
      } else {
        const L = it.kind === "day" ? lightFor(it.key) : null;
        const lines = [h("div", { class: "veyebrow" }, q.name + " · " + it.label), h("h3", {}, it.kind === "day" ? it.title : it.kind === "floor" ? it.title : it.title.replace(/^Beat /, "Beaten: "))];
        if (L && L.can) lines.push(h("p", { class: "vcan" }, h("i", { class: "vlight " + L.light, "aria-hidden": "true" }), L.can + " ", h("b", {}, "(" + L.word + ")")));
        if (it.kind === "day" || it.kind === "floor") lines.push(h("p", { class: "vstars", "aria-label": it.stars + " stars" }, starsTxt(it.stars) + "  Mastered"));
        if (it.repair) lines.push(h("p", { class: "vrepair" }, "🔧 A demon lord found a weak spot here. Win the repair day and the scaffolding comes down."));
        if (it.tarp && storms) lines.push(h("p", { class: "vrepair" }, "🧰 The storm damaged this roof. Get 2 right on your own to take the tarp off."), h("button", { class: "btn small", type: "button", onclick: () => { sfx("click"); showInfo(null); storms.mend(it.key); } }, "🧰 Mend the roof"));
        if (it.kind === "lord" || it.kind === "final") lines.push(h("p", {}, "This tower went up when you won. It keeps watch over the " + q.name + "."));
        body = lines;
      }
    }
    info = h("div", { class: "vinfo panel fade-in", role: "dialog", "aria-label": "About this building" }, close, ...body);
    ui.append(info);
    focus(o, o.userData.item && (o.userData.item.kind === "lord" || o.userData.item.kind === "final") ? 26 : 22);
  }
  function paintBar(m) {
    const e = ERAS[m.era], next = ERAS[m.era + 1];
    const pct = next ? Math.round(100 * (m.done - e.at) / (next.at - e.at)) : 100;
    bar = h("div", { class: "vbar panel fade-in" },
      h("div", { class: "vera" }, h("b", {}, "Era " + (m.era + 1) + " of 5: " + e.name), h("span", {}, m.done + " of " + m.total + " learned")),
      h("div", { class: "vmeter", role: "progressbar", "aria-valuemin": "0", "aria-valuemax": "100", "aria-valuenow": String(pct) }, h("i", { style: "width:" + pct + "%" })),
      h("p", { class: "vnote" }, next ? `${next.at - m.done} more to master for the ${next.name}. Tap a building to see what built it.` : "Every era reached. Keep mastering to fill every plot."));
    return bar;
  }
  function say(text, ms = 4200) { if (caption) caption.remove(); caption = h("div", { class: "vcaption fade-in", role: "status" }, text); ui.append(caption); const c = caption; setTimeout(() => { if (c.isConnected) c.remove(); }, ms); }

  /* ---------- open and close ---------- */
  function open(opts) {
    if (open_) close_(true);
    mode = opts || {};
    ensureStage(); open_ = true;
    mainStage && mainStage.pause(true);
    canvas.style.display = "block"; stage.resize(); stage.setMood("day"); stage.pause(false);
    const nw = news(), m = nw.model; build(m);
    const R = stage.rig; Object.assign(R, { yaw: VIEW.yaw, pitch: VIEW.pitch, dist: VIEW.dist, autoSpin: 0.025, goal: null }); R.target.copy(VIEW.target);
    const back = h("button", { class: "chip icon", type: "button", "aria-label": "Back to your fort", title: "Back to your fort", onclick: () => { sfx("click"); close_(); } }, "◀");
    const title = h("span", { class: "chip vtitle" }, "🏡 ", h("span", {}, (V() && V().name) || playerName()));
    ui.replaceChildren(h("div", { class: "hud" }, back, title, h("span", { class: "sp" })), h("div", { class: "grow" }), paintBar(m));
    if (!V()) return nameIt(m);
    afterOpen(m, nw);
  }
  const ready = () => { const f = mode.then; mode.then = null; if (f) setTimeout(() => open_ && f(), 400); };
  function afterOpen(m, nw) {
    const v = V(), seen = new Set(v.seen || []);
    const fresh = m.items.filter(i => i.done && !seen.has(i.id));
    const firstTime = !v.toured;
    if (firstTime) {
      const all = m.items.filter(i => i.done);
      Object.assign(stage.rig, { dist: 80, pitch: 1.2 }); stage.flyTo({ dist: VIEW.dist, pitch: VIEW.pitch }, 3.2);
      popIn(all, Math.min(0.25, 3.5 / Math.max(1, all.length)));
      say(all.length ? "This is your valley. Everything here, you built by learning." : "This is your valley. Master your first day and the first house goes up!", 6000);
      v.toured = true;
    } else if (fresh.length) {
      popIn(fresh, Math.min(0.7, 4 / fresh.length));
      const f = fresh[0], what = f.kind === "lord" || f.kind === "final" ? "a tower for " + f.title.replace(/^Beat /, "beating ") : "a new building for " + (f.kind === "floor" ? f.label : f.label.replace(/^.* · /, "")) + ": " + f.title;
      say("Your valley grew! " + (fresh.length > 1 ? fresh.length + " new buildings, including " : "") + what + ".", 5200);
      if (f.obj && fresh.length <= 3) setTimeout(() => open_ && focus(f.obj, 30), 400);   // a big batch keeps the whole valley in view
    }
    if ((v.era || 0) < m.era && !firstTime) { setTimeout(() => { if (open_) { sfx("horn"); say(ERAS[m.era].grew, 5000); } }, fresh.length ? 2600 : 300); }
    v.era = m.era; v.seen = m.items.filter(i => i.done).map(i => i.id); v.v = 1;
    save.commit();
    ready();
  }
  function nameIt(m) {
    const inp = h("input", { class: "vname", type: "text", maxlength: "24", value: playerName(), "aria-label": "Your valley's name", autocomplete: "off" });
    const done = name => { sfx("click"); S().valley = { name: (name || "").trim().slice(0, 24) || playerName(), seen: [], era: m.era, v: 1 }; save.commit(); panel.remove(); const t = ui.querySelector(".vtitle span"); if (t) t.textContent = S().valley.name; afterOpen(m); };
    const panel = h("div", { class: "vinfo vnamebox panel fade-in", role: "dialog", "aria-label": "Name your valley" },
      h("h3", {}, "🏡 Name your valley"), h("p", {}, "Everything you master builds something here. What should it be called?"), inp,
      h("div", { class: "vrow" }, h("button", { class: "btn small", type: "button", onclick: () => done(inp.value) }, "✓ That's the name"), h("button", { class: "btn small plain", type: "button", onclick: () => done("") }, "Skip")));
    inp.addEventListener("keydown", e => { if (e.key === "Enter") done(inp.value); });
    ui.append(panel); setTimeout(() => inp.focus({ preventScroll: true }), 80);
  }
  function close_(quiet) {
    if (!open_) return; open_ = false;
    const m0 = mode; mode = {}; if (m0.onClose) m0.onClose();
    weather(null);
    showInfo(null); if (caption) caption.remove();
    stage.pause(true); canvas.style.display = "none"; popping = [];
    if (world) { stage.scene.remove(world); world.traverse(o => { if (o.isInstancedMesh) o.dispose(); else if (o.userData.baked) o.geometry.dispose(); }); world = null; }
    if (quiet === true) return;
    mainStage && mainStage.pause(false);
    onClose && onClose();
  }

  /* ---------- storms (js/storms.js): the weather, the defences and rebuilding after ---------- */
  let wx = null, flashT = 3, fxList = [];
  function weather(kind, flash) {
    if (wx) { stage.scene.remove(wx.mesh); wx.mesh.geometry.dispose(); wx.mesh.material.dispose(); wx = null; }
    if (!stage) return;
    if (!kind) { stage.setMood("day"); stage.hemi.intensity = 1.25; return; }
    stage.setMood(kind === "dust" ? "dusk" : "dusk"); stage.hemi.intensity = 0.75; stage.sun.intensity = 1.1;
    const n = reducedMotion ? 0 : lowGfx ? 60 : isTouch ? 160 : 280; if (!n) return;
    const geo = kind === "rain" ? new THREE.BoxGeometry(0.035, 0.55, 0.035) : kind === "swarm" ? new THREE.BoxGeometry(0.13, 0.07, 0.13) : new THREE.BoxGeometry(0.22, 0.2, 0.22);
    const mesh = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ color: kind === "rain" ? 0xb9d8ff : kind === "swarm" ? 0x4a4a22 : 0x9a8466, transparent: kind === "rain", opacity: 0.7, roughness: 0.8 }), n);
    mesh.frustumCulled = false; mesh.castShadow = false;
    const P = Array.from({ length: n }, (_, i) => ({ x: (Math.random() - 0.5) * 36, y: Math.random() * 14, z: (Math.random() - 0.5) * 36, a: Math.random() * 6, r: 2 + Math.random() * 6, c: i % 3, s: 0.6 + Math.random() * 0.8 }));
    wx = { kind, mesh, P, flash: !!flash, t: 0, d: new THREE.Object3D() }; stage.scene.add(mesh); flashT = 2;
  }
  const SWARMS = [[-9, -8], [9, -9], [0, 8]];
  function sky(dt, t) {
    if (!wx) return; const { P, d, mesh, kind } = wx; wx.t += dt;
    P.forEach((p, i) => {
      if (kind === "rain") { p.y -= 16 * dt * p.s; p.x += 1.5 * dt; if (p.y < 0) { p.y = 12 + Math.random() * 3; p.x = (Math.random() - 0.5) * 36; } d.position.set(p.x, p.y, p.z); d.rotation.set(0, 0, -0.1); }
      else if (kind === "swarm") { p.a += dt * (1.2 + p.s); const [cx, cz] = SWARMS[p.c]; const sx = cx + Math.sin(wx.t * 0.3 + p.c) * 4; d.position.set(sx + Math.cos(p.a) * p.r * 0.5, 3 + Math.sin(p.a * 1.7) * 1.2 + p.s, cz + Math.sin(p.a) * p.r * 0.5); d.rotation.set(0, p.a, 0); }
      else { p.z += 3 * dt * p.s; p.a += dt * 3; if (p.z > 18) { p.z = -18; p.x = (Math.random() - 0.5) * 36; } d.position.set(p.x, 0.2 + Math.abs(Math.sin(p.a)) * 1.2 * p.s, p.z); d.rotation.set(p.a, p.a * 0.7, 0); }
      d.updateMatrix(); mesh.setMatrixAt(i, d.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (wx.flash && !reducedMotion) { flashT -= dt; if (flashT < 0) { flashT = 3 + Math.random() * 4; stage.hemi.intensity = 3; sfx("cannon"); setTimeout(() => { if (wx) stage.hemi.intensity = 0.75; }, 110); } }
  }
  function effects(dt) {
    fxList = fxList.filter(e => { e.t += dt; const k = Math.min(1, e.t / 1.3); e.mesh.scale.setScalar(0.6 + k * 1.8); e.mesh.material.opacity = 0.55 * (1 - k); if (k >= 1) { world && world.remove(e.mesh); e.mesh.geometry.dispose(); e.mesh.material.dispose(); return false; } return true; });
  }
  const objOf = key => pickables.find(o => o.userData.item && o.userData.item.key === key) || null;
  /* a storm question was answered: the villagers defend that building (or the storm reaches it) */
  function defend(key, ok, line) {
    if (!open_) return; const o = objOf(key);
    if (line) say((ok ? "🛡️ " : "💨 ") + line, 2100);
    if (!o) return;
    focus(o, 26);
    setTimeout(() => {
      if (!open_ || !world) return;
      const p = new THREE.Vector3(o.position.x, 0.8, o.position.z);
      if (ok) {
        const dome = new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x7fe8ff, transparent: true, opacity: 0.55, depthWrite: false }));
        dome.position.set(o.position.x, 0, o.position.z); world.add(dome); fxList.push({ mesh: dome, t: 0 });
        fx.emit(p, { n: 26, colors: [0x9ff3ff, 0xffffff, 0xffd23f], speed: 3, up: 4, size: 0.14 }); sfx("zap"); bounce(o);
      } else { fx.emit(new THREE.Vector3(o.position.x, 1.6, o.position.z), { n: 18, colors: [0x6a6f7a, 0x9a8466, 0x2f7fe0], speed: 2.5, up: 2, size: 0.16 }); stage.shake(0.25); sfx("crack"); }
    }, reducedMotion ? 50 : 650);
  }
  function refresh() { if (!open_) return; showInfo(null); build(valleyModel(S())); }
  function showTarp(key) { const o = objOf(key); if (o) showInfo(o); }
  addEventListener("keydown", e => { if (open_ && e.key === "Escape") { if (info) showInfo(null); else close_(); } });

  return { open, close: close_, news, refresh, weather, defend, say, showTarp, setStorms: s => (storms = s), get reduced() { return reducedMotion; }, model: () => valleyModel(S()), get isOpen() { return open_; }, get stage() { return stage; }, get pickables() { return pickables; }, showInfo };
}
