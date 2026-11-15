/* Buildable fort pieces: costs, upgrade levels, and their blocky models.
   Dropping a piece onto the same kind of piece upgrades it (levels 1 to 3). */
import { THREE, block, group, mat } from "./gfx.js";
import { mergeGeometries } from "../vendor/addons/BufferGeometryUtils.js";

/* cost[level-1] is what it costs to build level 1, or to upgrade to level 2 or 3 */
export const PIECES = {
  // ---- defence: paid with materials ----
  wall:   { cat: "defend", name: "Wall",        cost: [{ wood: 2 }, { stone: 3 }, { stone: 2, iron: 2 }], tip: "Blocks demons. Walls join up by themselves.", lvName: ["Wooden fence", "Stone wall", "Castle wall"] },
  gate:   { cat: "defend", name: "Gate",        cost: [{ wood: 4 }, { stone: 4 }, { stone: 3, iron: 3 }], tip: "A strong door in your wall.", lvName: ["Wooden gate", "Stone gate", "Gatehouse"] },
  arrow:  { cat: "defend", name: "Arrow tower", cost: [{ wood: 4, stone: 2 }, { stone: 4, iron: 1 }, { iron: 3, crystal: 1 }], bp: true, range: [4.5, 5.5, 6.5], tip: "Shoots demons nearby.", lvName: ["Lookout", "Archer tower", "Great tower"] },
  cannon: { cat: "defend", name: "Cannon",      cost: [{ stone: 4, iron: 2 }, { stone: 3, iron: 3 }, { iron: 4, crystal: 2 }], bp: true, range: [5, 6, 7], tip: "Big boom that hits a group.", lvName: ["Cannon", "Double cannon", "Golden cannon"] },
  spikes: { cat: "defend", name: "Spike trap",  cost: [{ wood: 1, iron: 1 }, { iron: 2 }, { iron: 2, crystal: 1 }], tip: "Ouch! Hurts demons that walk over it.", lvName: ["Spikes", "Sharp spikes", "Golden spikes"] },
  goo:    { cat: "defend", name: "Goo trap",    cost: [{ crystal: 1 }, { crystal: 1 }, { crystal: 2 }], tip: "Sticky goo slows demons down.", lvName: ["Goo", "Big goo", "Glowing goo"] },
  // ---- decorations: paid with gold ----
  path:   { cat: "decor", name: "Stone path", cost: [{ gold: 5 }],  tip: "A path through your fort." },
  moat:   { cat: "decor", name: "Moat",       cost: [{ gold: 10 }], tip: "Water. Demons have to wade through it." },
  bridge: { cat: "decor", name: "Bridge",     cost: [{ gold: 15 }], tip: "A bridge over your moat." },
  bush:   { cat: "decor", name: "Bush",       cost: [{ gold: 5 }],  tip: "A round green bush." },
  flowers:{ cat: "decor", name: "Flower bed", cost: [{ gold: 8 }],  tip: "Bright flowers." },
  torch:  { cat: "decor", name: "Torch",      cost: [{ gold: 10 }], tip: "Lights up the night." },
  banner: { cat: "decor", name: "Banner",     cost: [{ gold: 15 }], tip: "Show your colours." },
  house:  { cat: "decor", name: "House",      cost: [{ gold: 40 }], tip: "Somewhere for your helpers to live." },
  well:   { cat: "decor", name: "Well",       cost: [{ gold: 30 }], tip: "Fresh water for the fort." },
  statue: { cat: "decor", name: "Hero statue",cost: [{ gold: 60 }], tip: "A statue of you!" },
};
export const ORDER = { defend: ["wall", "gate", "arrow", "cannon", "spikes", "goo"], decor: ["path", "moat", "bridge", "bush", "flowers", "torch", "banner", "house", "well", "statue"] };
export const MATS = { wood: { icon: "🪵", name: "Wood" }, stone: { icon: "🪨", name: "Stone" }, iron: { icon: "⚙️", name: "Iron" }, crystal: { icon: "💎", name: "Crystal" }, gold: { icon: "🪙", name: "Gold" } };
export const maxLevel = t => PIECES[t].cost.length;
export const JOINS = new Set(["wall", "gate", "arrow", "cannon"]);   // walls connect to these
export const FLAT = new Set(["path", "moat", "bridge", "spikes", "goo", "flowers"]); // low pieces

const C = {
  log: 0xb07a45, log2: 0x9a6638, dark: 0x6e4524, tip: 0xd9a36b,
  stone: 0xb3bac4, stone2: 0x959fab, stone3: 0xd0d6de, roof: 0xd9473b, roof2: 0x2f6fde, metal: 0x50545e, gold: 0xffc83d,
  banner: 0x2f6fde, goo: 0x9b5cf6, leaf: 0x3fae4a, leaf2: 0x5cc556, water: 0x2fa7e6,
};
const pyramid = (r, h, c) => { const m = new THREE.Mesh(new THREE.ConeGeometry(r, h, 4), mat(c)); m.rotation.y = Math.PI / 4; m.castShadow = true; return m; };
const at = (o, x, y, z) => (o.position.set(x, y, z), o);

function log(x, z, h, c) { return group(block(0.2, h, 0.2, c, x, 0, z, { r: 0.05 }), at(pyramid(0.15, 0.26, C.tip), x, h + 0.12, z)); }
function crenels(g, w, d, y, c, step = 0.34) { // little battlement blocks round the top edge
  for (let x = -w / 2 + step / 2; x < w / 2; x += step * 2) { g.add(block(step, 0.26, 0.18, c, x, y, -d / 2 + 0.09, { r: 0.04 })); g.add(block(step, 0.26, 0.18, c, x, y, d / 2 - 0.09, { r: 0.04 })); }
}
const V = { e: [1, 0], w: [-1, 0], n: [0, -1], s: [0, 1] };

/* ---------- walls: join to neighbours (n = {e,w,n,s}) ---------- */
function makeWall(lv, n) {
  const g = new THREE.Group();
  let dirs = Object.entries(n).filter(([, v]) => v).map(([k]) => k); if (!dirs.length) dirs = ["e", "w"];
  if (lv === 1) {
    g.add(block(0.34, 1.75, 0.34, C.log2, 0, 0, 0, { r: 0.06 })); g.add(block(0.4, 0.14, 0.4, C.tip, 0, 1.75, 0, { r: 0.04 }));
    dirs.forEach(d => { const [dx, dz] = V[d]; [0.24, 0.43].forEach((o, i) => g.add(log(dx * o, dz * o, i ? 1.38 : 1.5, i ? C.log : C.log2))); g.add(block(dx ? 0.5 : 0.12, 0.12, dz ? 0.5 : 0.12, C.dark, dx * 0.25, 0.9, dz * 0.25, { r: 0.03 })); });
    return g;
  }
  const H = lv === 2 ? 1.9 : 2.6, T = lv === 2 ? 0.5 : 0.7;
  g.add(block(T + 0.06, H, T + 0.06, C.stone2, 0, 0, 0, { r: 0.07 }));
  dirs.forEach(d => {
    const [dx, dz] = V[d];
    g.add(block(dx ? 0.52 : T, H, dz ? 0.52 : T, C.stone, dx * 0.24, 0, dz * 0.24, { r: 0.06 }));
    // stone courses (lighter blocks) for texture
    for (let y = 0.35; y < H - 0.2; y += 0.55) g.add(block(dx ? 0.22 : T + 0.02, 0.16, dz ? 0.22 : T + 0.02, C.stone3, dx * (0.18 + (y * 7 % 2) * 0.1), y, dz * (0.18 + (y * 7 % 2) * 0.1), { r: 0.03, cast: false }));
    g.add(block(dx ? 0.2 : T + 0.1, 0.3, dz ? 0.2 : T + 0.1, C.stone3, dx * 0.38, H, dz * 0.38, { r: 0.05 })); // battlement
  });
  g.add(block(T + 0.14, 0.34, T + 0.14, C.stone3, 0, H, 0, { r: 0.06 }));
  if (lv === 3) {
    g.add(block(T + 0.2, 0.12, T + 0.2, C.dark, 0, H - 0.25, 0, { r: 0.03 }));       // walkway trim
    if (dirs.length !== 2 || (dirs.includes("e") !== dirs.includes("w"))) {             // corners and ends get a pennant
      g.add(block(0.06, 0.9, 0.06, C.metal, 0, H + 0.34, 0, { r: 0.02 })); g.add(block(0.45, 0.28, 0.04, C.banner, 0.24, H + 0.9, 0, { r: 0.02 }));
    }
  }
  return g;
}

function makeGate(lv, n) {
  const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner);
  if (lv === 1) {
    [-0.42, 0.42].forEach(x => { inner.add(block(0.26, 2.0, 0.34, C.log2, x, 0, 0, { r: 0.06 })); inner.add(block(0.32, 0.14, 0.4, C.tip, x, 2.0, 0, { r: 0.04 })); });
    inner.add(block(1.06, 0.22, 0.36, C.dark, 0, 1.62, 0, { r: 0.05 }));
    inner.add(block(0.34, 0.42, 0.04, C.banner, 0, 1.2, 0.2, { r: 0.03 }));
    [-0.15, 0.15].forEach(x => inner.add(block(0.29, 1.3, 0.14, C.log, x, 0, 0, { r: 0.04 })));
    inner.add(block(0.62, 0.08, 0.16, C.metal, 0, 0.3, 0.02, { r: 0.02 })); inner.add(block(0.62, 0.08, 0.16, C.metal, 0, 0.95, 0.02, { r: 0.02 }));
  } else {
    const H = lv === 2 ? 2.3 : 3.0, D = lv === 2 ? 0.6 : 0.9;
    [-0.4, 0.4].forEach(x => { inner.add(block(0.3, H, D, C.stone, x, 0, 0, { r: 0.07 })); });
    inner.add(block(1.1, 0.6, D, C.stone2, 0, H - 0.6, 0, { r: 0.07 }));
    crenels(inner, 1.1, D, H, C.stone3, 0.22);
    [-0.13, 0.13].forEach(x => inner.add(block(0.25, 1.45, 0.14, C.log, x, 0, 0, { r: 0.04 })));
    inner.add(block(0.56, 0.08, 0.17, C.metal, 0, 0.35, 0.01, { r: 0.02 })); inner.add(block(0.56, 0.08, 0.17, C.metal, 0, 1.05, 0.01, { r: 0.02 }));
    inner.add(block(0.4, 0.36, 0.05, C.banner, 0, H - 0.5, D / 2 + 0.02, { r: 0.02 }));
    inner.add(block(0.14, 0.14, 0.05, C.gold, 0, H - 0.4, D / 2 + 0.05, { r: 0.03 }));
    if (lv === 3) [-0.45, 0.45].forEach(x => { inner.add(block(0.42, 0.9, 0.42, C.stone, x, H, 0, { r: 0.07 })); inner.add(at(pyramid(0.38, 0.6, C.roof), x, H + 1.2, 0)); });
  }
  if ((n.n || n.s) && !(n.e || n.w)) inner.rotation.y = Math.PI / 2;
  return g;
}

function makeArrow(lv) {
  const g = new THREE.Group(); let top;
  if (lv === 1) {
    g.add(block(0.92, 0.3, 0.92, C.stone, 0, 0, 0, { r: 0.08 }));
    [[-0.32, -0.32], [0.32, -0.32], [-0.32, 0.32], [0.32, 0.32]].forEach(([x, z]) => g.add(block(0.18, 1.7, 0.18, C.log2, x, 0.3, z, { r: 0.04 })));
    g.add(block(0.62, 0.1, 0.1, C.dark, 0, 0.9, 0.32, { r: 0.02 })); g.add(block(0.1, 0.1, 0.62, C.dark, 0.32, 0.9, 0, { r: 0.02 }));
    top = 2.0;
  } else {
    const H = lv === 2 ? 2.2 : 3.4;
    g.add(block(0.98, H, 0.98, C.stone, 0, 0, 0, { r: 0.09 }));
    for (let y = 0.4; y < H - 0.3; y += 0.6) g.add(block(1.0, 0.14, 1.0, C.stone2, 0, y, 0, { r: 0.04, cast: false }));
    g.add(block(0.2, 0.36, 0.05, 0x2a3350, 0, H * 0.55, 0.5, { r: 0.03, cast: false }));
    if (lv === 3) g.add(block(0.4, 0.5, 0.05, C.banner, 0, H * 0.3, 0.5, { r: 0.02, cast: false }));
    top = H;
  }
  g.add(block(1.06, 0.16, 1.06, lv === 1 ? C.log : C.stone3, 0, top, 0, { r: 0.05 }));
  if (lv === 1) [[-0.46, 0], [0.46, 0], [0, -0.46], [0, 0.46]].forEach(([x, z]) => g.add(block(x ? 0.1 : 1.0, 0.32, z ? 0.1 : 1.0, C.log2, x, top + 0.16, z, { r: 0.03 })));
  else crenels(g, 1.06, 1.06, top + 0.16, C.stone3, 0.24);
  [-0.42, 0.42].forEach(x => [-0.42, 0.42].forEach(z => g.add(block(0.08, 0.8, 0.08, C.dark, x, top + 0.16, z, { r: 0.02 }))));
  g.add(at(pyramid(0.9, lv === 3 ? 1.1 : 0.75, lv === 3 ? C.roof2 : C.roof), 0, top + (lv === 3 ? 1.5 : 1.2), 0));
  if (lv === 3) { g.add(block(0.06, 0.8, 0.06, C.metal, 0, top + 2.0, 0, { r: 0.02 })); g.add(block(0.5, 0.3, 0.04, C.gold, 0.27, top + 2.45, 0, { r: 0.02 })); }
  const bow = new THREE.Group(); bow.position.y = top + 0.35;
  bow.add(block(0.14, 0.14, 0.62, C.dark, 0, 0, 0, { r: 0.03 })); bow.add(block(lv === 3 ? 0.8 : 0.62, 0.08, 0.1, lv === 3 ? C.gold : C.log, 0, 0.04, 0.2, { r: 0.03 }));
  bow.userData.live = true; g.add(bow); g.userData.aim = bow;
  return g;
}

function makeCannon(lv) {
  const g = new THREE.Group(), H = [1.05, 1.4, 1.8][lv - 1], W = lv === 1 ? 0.96 : 1.0;
  g.add(block(W, H, W, C.stone, 0, 0, 0, { r: 0.1 }));
  if (lv > 1) for (let y = 0.4; y < H - 0.2; y += 0.5) g.add(block(W + 0.02, 0.12, W + 0.02, C.stone2, 0, y, 0, { r: 0.04, cast: false }));
  g.add(block(W + 0.06, 0.16, W + 0.06, C.stone2, 0, H, 0, { r: 0.05 }));
  [[-0.38, -0.38], [0.38, -0.38], [-0.38, 0.38], [0.38, 0.38]].forEach(([x, z]) => g.add(block(0.26, 0.26, 0.26, C.stone3, x, H + 0.16, z, { r: 0.05 })));
  const gun = new THREE.Group(); gun.position.y = H + 0.32;
  gun.add(block(0.56, 0.22, 0.5, C.log2, 0, 0, 0, { r: 0.05 }));
  const metal = lv === 3 ? mat(C.gold, { metal: 0.7, rough: 0.3 }) : mat(C.metal, { metal: 0.6, rough: 0.35 });
  const xs = lv === 2 ? [-0.14, 0.14] : [0];
  xs.forEach(x => {
    const s = lv === 1 ? 1 : lv === 2 ? 0.8 : 1.25;
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.15 * s, 0.19 * s, 0.8 * s, 10), metal); barrel.rotation.x = Math.PI / 2 - 0.25; barrel.position.set(x, 0.32, 0.18); barrel.castShadow = true; gun.add(barrel);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.16 * s, 0.05 * s, 6, 10), metal); rim.position.set(x, 0.32 + 0.1 * s, 0.18 + 0.38 * s); rim.rotation.x = -0.25; gun.add(rim);
  });
  gun.userData.live = true; g.add(gun); g.userData.aim = gun;
  if (lv === 3) { g.add(block(0.06, 0.9, 0.06, C.metal, -0.4, H + 0.4, -0.4, { r: 0.02 })); g.add(block(0.42, 0.26, 0.04, C.roof, -0.18, H + 1.05, -0.4, { r: 0.02 })); }
  return g;
}

function makeSpikes(lv) {
  const g = new THREE.Group();
  g.add(block(0.92, 0.1, 0.92, C.dark, 0, 0, 0, { r: 0.04 }));
  const n = lv === 1 ? 3 : 4, h = [0.32, 0.4, 0.44][lv - 1], col = lv === 3 ? C.gold : 0xc9d0da;
  const cone = new THREE.ConeGeometry(0.08, h, 4), m = mat(col, { metal: 0.6, rough: 0.3 }), step = 0.84 / n;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { const s = new THREE.Mesh(cone, m); s.position.set(-0.42 + step * (i + 0.5), 0.1 + h / 2, -0.42 + step * (j + 0.5)); s.castShadow = true; g.add(s); }
  return g;
}
function makeGoo(lv) {
  const g = new THREE.Group(), ei = [0.25, 0.4, 0.9][lv - 1], s = [0.9, 0.95, 1.0][lv - 1];
  g.add(block(s, 0.08, s * 0.9, C.goo, 0, 0, 0, { r: 0.04, emissive: C.goo, ei, cast: false }));
  g.add(block(s * 0.6, 0.08, s * 0.65, 0xc4a6ff, 0.12, 0.02, -0.05, { r: 0.04, emissive: C.goo, ei, cast: false }));
  const bubbles = Array.from({ length: lv + 2 }, (_, i) => { const b = block(0.14, 0.14, 0.14, 0xd9c8ff, ((i * 37) % 7) / 7 - 0.43, 0.08, ((i * 53) % 5) / 5 - 0.4, { r: 0.06, cast: false }); b.userData.live = true; g.add(b); return b; });
  const ph = Math.random() * 6;
  g.userData.update = (dt, t) => bubbles.forEach((b, i) => { const k = (t * 0.8 + i * 0.27 + ph) % 1; b.position.y = 0.08 + k * 0.35; b.scale.setScalar(1 - k * 0.7); });
  return g;
}

/* ---------- decorations ---------- */
function makeDecor(t, n) {
  const g = new THREE.Group();
  if (t === "path") {
    g.add(block(1.0, 0.06, 1.0, 0xcbb994, 0, 0, 0, { r: 0.02, cast: false }));
    [[-0.22, -0.22, 0.42], [0.22, -0.2, 0.38], [-0.2, 0.22, 0.38], [0.24, 0.24, 0.36]].forEach(([x, z, s]) => g.add(block(s, 0.08, s, 0xa9a9a2, x, 0.03, z, { r: 0.05, cast: false })));
  } else if (t === "moat") {
    g.add(block(1.0, 0.06, 1.0, 0x7a5a3a, 0, -0.04, 0, { r: 0.0, cast: false }));
    const w = block(1.0, 0.05, 1.0, C.water, 0, 0.02, 0, { r: 0.0, cast: false, material: new THREE.MeshStandardMaterial({ color: C.water, roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.9, emissive: 0x0b4f7a, emissiveIntensity: 0.25 }) });
    w.userData.live = true; g.add(w); const ph = Math.random() * 6; g.userData.update = (dt, tt) => { w.position.y = 0.045 + Math.sin(tt * 2 + ph) * 0.012; };
  } else if (t === "bridge") {
    g.add(makeDecor("moat"));
    const deck = new THREE.Group(); g.add(deck);
    for (let i = -2; i <= 2; i++) deck.add(block(0.18, 0.08, 1.0, i % 2 ? C.log : C.log2, i * 0.19, 0.12, 0, { r: 0.02 }));
    [-0.45, 0.45].forEach(z => deck.add(block(1.0, 0.08, 0.06, C.dark, 0, 0.42, z, { r: 0.02 })));
    [-0.45, 0.45].forEach(x => [-0.45, 0.45].forEach(z => deck.add(block(0.08, 0.36, 0.08, C.dark, x, 0.12, z, { r: 0.02 }))));
    if (n && (n.n || n.s) && !(n.e || n.w)) deck.rotation.y = Math.PI / 2;
  } else if (t === "bush") {
    g.add(block(0.8, 0.6, 0.8, C.leaf, 0, 0, 0, { r: 0.22 })); g.add(block(0.5, 0.36, 0.5, C.leaf2, 0.1, 0.5, -0.05, { r: 0.15 }));
  } else if (t === "flowers") {
    g.add(block(0.9, 0.18, 0.9, 0x7a5a3a, 0, 0, 0, { r: 0.04, cast: false }));
    const cols = [0xff6b9a, 0xffd23f, 0xffffff, 0xa77bff, 0xff8a3d];
    for (let i = 0; i < 9; i++) { const x = (i % 3 - 1) * 0.26, z = (Math.floor(i / 3) - 1) * 0.26; g.add(block(0.06, 0.24, 0.06, 0x3c8f3a, x, 0.18, z, { r: 0, cast: false })); g.add(block(0.17, 0.12, 0.17, cols[i % 5], x, 0.4, z, { r: 0.05, cast: false })); }
  } else if (t === "torch") {
    g.add(block(0.12, 1.3, 0.12, C.dark, 0, 0, 0, { r: 0.03 })); g.add(block(0.24, 0.2, 0.24, C.metal, 0, 1.3, 0, { r: 0.04 }));
    const fl = block(0.18, 0.3, 0.18, 0xffa62b, 0, 1.5, 0, { r: 0.07, emissive: 0xff8a00, ei: 1.6, cast: false }); fl.userData.live = true; g.add(fl);
    const light = new THREE.PointLight(0xffa040, 0, 5, 1.6); light.position.y = 1.8; g.add(light); g.userData.light = light;
    const ph = Math.random() * 6; g.userData.update = (dt, tt) => { const f = 1 + Math.sin(tt * 13 + ph) * 0.12 + Math.sin(tt * 7.3) * 0.08; fl.scale.set(f, f * 1.1, f); };
  } else if (t === "banner") {
    g.add(block(0.1, 2.4, 0.1, C.metal, 0, 0, 0, { r: 0.03 }));
    const f = block(0.62, 0.9, 0.05, C.banner, 0.36, 1.3, 0, { r: 0.03 }); f.userData.live = true; g.add(f);
    g.add(block(0.24, 0.24, 0.06, C.gold, 0.36, 1.6, 0, { r: 0.06 }));
    const ph = Math.random() * 6; g.userData.update = (dt, tt) => { f.rotation.y = Math.sin(tt * 2.5 + ph) * 0.2; };
  } else if (t === "house") {
    g.add(block(0.9, 0.9, 0.9, 0xf2e2c2, 0, 0, 0, { r: 0.06 }));
    [-0.4, 0.4].forEach(x => g.add(block(0.1, 0.9, 0.92, C.log2, x, 0, 0, { r: 0.03 })));
    g.add(block(0.3, 0.5, 0.05, C.dark, 0, 0, 0.46, { r: 0.03 })); g.add(block(0.22, 0.2, 0.05, 0x7fb8ff, 0.27, 0.5, 0.46, { r: 0.03, emissive: 0xffd27a, ei: 0.0 }));
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(0.0001, 0.75, 0.62, 4, 1), mat(C.roof)); roof.rotation.y = Math.PI / 4; roof.scale.set(1, 1, 1.0); roof.position.y = 1.2; roof.castShadow = true; g.add(roof);
    g.add(block(0.16, 0.4, 0.16, C.stone2, 0.24, 1.1, -0.2, { r: 0.03 }));
  } else if (t === "well") {
    g.add(block(0.86, 0.5, 0.86, C.stone, 0, 0, 0, { r: 0.12 })); g.add(block(0.6, 0.06, 0.6, C.water, 0, 0.47, 0, { r: 0.02, cast: false }));
    [-0.34, 0.34].forEach(x => g.add(block(0.1, 0.9, 0.1, C.log2, x, 0.5, 0, { r: 0.03 })));
    g.add(at(pyramid(0.62, 0.42, C.roof), 0, 1.6, 0)); g.add(block(0.08, 0.08, 0.7, C.dark, 0, 1.15, 0, { r: 0.02 }));
    g.add(block(0.16, 0.18, 0.16, C.log, 0, 0.85, 0, { r: 0.04 }));
  } else if (t === "statue") {
    g.add(block(0.86, 0.5, 0.86, C.stone2, 0, 0, 0, { r: 0.08 })); g.add(block(0.7, 0.14, 0.7, C.stone3, 0, 0.5, 0, { r: 0.04 }));
    const s = mat(0xd6dbe2, { rough: 0.5 }), y = 0.64;
    [[0.17, 0.4, 0.2, -0.1, y, 0], [0.17, 0.4, 0.2, 0.1, y, 0], [0.45, 0.45, 0.26, 0, y + 0.4, 0], [0.15, 0.42, 0.18, -0.31, y + 0.45, 0], [0.37, 0.35, 0.35, 0, y + 0.85, 0]].forEach(([w, h, d, x, yy, z]) => g.add(block(w, h, d, 0, x, yy, z, { r: 0.05, material: s })));
    g.add(block(0.15, 0.6, 0.18, 0, 0.31, y + 0.75, 0, { r: 0.05, material: s })); g.add(block(0.06, 0.7, 0.06, C.gold, 0.31, y + 1.3, 0, { r: 0.02, metal: 0.6 }));
  }
  return g;
}

function build(type, lv, n) {
  switch (type) {
    case "wall": return makeWall(lv, n);
    case "gate": return makeGate(lv, n);
    case "arrow": return makeArrow(lv);
    case "cannon": return makeCannon(lv);
    case "spikes": return makeSpikes(lv);
    case "goo": return makeGoo(lv);
  }
  return makeDecor(type, n);
}

/* merge a piece's many little blocks into one mesh per material, so a big castle stays fast.
   Parts marked userData.live (turning cannons, bubbling goo, flames) stay separate so they can move. */
function bake(g) {
  g.updateMatrixWorld(true);
  const groups = new Map(), drop = [];
  g.traverse(o => {
    if (!o.isMesh) return;
    for (let p = o; p && p !== g; p = p.parent) if (p.userData.live) return;
    const m = o.material; if (!groups.has(m)) groups.set(m, { geos: [], cast: false, receive: false });
    const e = groups.get(m); let geo = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    for (const k of Object.keys(geo.attributes)) if (!["position", "normal", "uv"].includes(k)) geo.deleteAttribute(k);
    if (!geo.attributes.uv) geo.setAttribute("uv", new THREE.Float32BufferAttribute(new Float32Array(geo.attributes.position.count * 2), 2));
    geo.applyMatrix4(o.matrixWorld); e.geos.push(geo); e.cast = e.cast || o.castShadow; e.receive = e.receive || o.receiveShadow; drop.push(o);
  });
  drop.forEach(o => o.parent.remove(o));
  groups.forEach((e, m) => { const merged = mergeGeometries(e.geos, false); e.geos.forEach(x => x.dispose()); if (!merged) return; const mesh = new THREE.Mesh(merged, m); mesh.userData.baked = true; mesh.castShadow = e.cast; mesh.receiveShadow = true; g.add(mesh); });
  // tidy empty groups
  const empty = []; g.traverse(o => { if (o !== g && o.type === "Group" && !o.children.length && !o.userData.live) empty.push(o); }); empty.forEach(o => o.parent && o.parent.remove(o));
  return g;
}
export function makePiece(type, lv = 1, n = {}, { raw = false } = {}) {
  const g = build(type, lv, n);
  return raw ? g : bake(g);
}
