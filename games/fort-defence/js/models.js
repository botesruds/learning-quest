/* Blocky models built in code: island, trees, clouds, the keep, the hero and cute demons. */
import { THREE, block, group, mat, rbox, noise2 } from "./gfx.js";

export const REGION_LOOK = {
  1: { name: "Letter Land", grass: 0x6cc644, grass2: 0x58b23a, dirt: 0x9a6a3e, sand: 0xf2d98a, water: 0x2fa7e6, leaf: [0x3fae4a, 0x5cc556, 0x2f9a45] },
  2: { name: "Balance Bridge", grass: 0x9cc95a, grass2: 0x8bb84c, dirt: 0x7a5236, sand: 0xdcc28c, water: 0x1f86c9, leaf: [0xf2a33c, 0xe0782f, 0xd9b23a] },
  3: { name: "Pattern Peaks", grass: 0xeef4fb, grass2: 0xdfe9f4, dirt: 0x7f879c, sand: 0xc9d6e4, water: 0x4c8fca, leaf: [0x2e7d5b, 0x3b8f6c, 0x256b4c], snow: true },
  4: { name: "Robot Factory", grass: 0xc8a96a, grass2: 0xb8995b, dirt: 0x6b4a32, sand: 0xe2c78e, water: 0x3a7ca5, leaf: [0xc98f3a, 0xa8733a, 0xdcae52] },
  5: { name: "Final Castle", grass: 0x5d4b4b, grass2: 0x4f3f40, dirt: 0x2b2127, sand: 0x6c5a52, water: 0xff6a1f, leaf: [0x7a4b3a, 0x5e3a2f, 0x8c3b2a], lava: true },
};
/* each region's demons wear their own colours (troll-lings, frost sprites, wind-up gremlins, lava imps) */
export const REGION_DEMON = {
  2: { imp: { body: 0x5f9e3c, belly: 0xb5d98a, horn: 0xe9d7a8 }, bat: { body: 0x5b4636, belly: 0xa88b6b, horn: 0x9bd36a } },
  3: { imp: { body: 0x7fc8f8, belly: 0xffffff, horn: 0xe8f7ff }, bat: { body: 0x4f7fb8, belly: 0xbfe3ff, horn: 0xffffff } },
  4: { imp: { body: 0xd99a3a, belly: 0xf6d27a, horn: 0x8a8f99 }, bat: { body: 0x6f6a72, belly: 0xc9a14a, horn: 0xffd23f } },
  5: { imp: { body: 0xe2452e, belly: 0xffb347, horn: 0x2b2127 }, bat: { body: 0x4a2a2a, belly: 0xff7a3a, horn: 0xffd23f } },
};

/* ---------- island of chunky columns ---------- */
export function makeIsland(region = 1, { size = 48, flat = 14 } = {}) {
  const L = REGION_LOOK[region] || REGION_LOOK[1];
  const n = noise2(region * 3.1), half = size / 2;
  const cells = [];
  for (let i = 0; i < size; i++) for (let j = 0; j < size; j++) {
    const x = i - half + 0.5, z = j - half + 0.5;
    const d = Math.pow(Math.pow(Math.abs(x), 4) + Math.pow(Math.abs(z), 4), 0.25);   // rounded-square island
    const wob = (n(x * 0.15, z * 0.15) - 0.5) * 5;
    const edge = half - 2.5 + wob;
    if (d > edge) continue;
    const onPlateau = Math.max(Math.abs(x), Math.abs(z)) <= flat;
    let h;
    if (onPlateau) h = 1;                                                    // flat building land
    else { const t = Math.min(1, (d - flat) / 3); h = 1 + Math.round(Math.max(0, (n(x * 0.3 + 9, z * 0.3) - 0.3) * 3.4 * t)); }
    const shore = !onPlateau && d > edge - 1.6;
    cells.push({ x, z, h: shore ? 0.6 : h, shore, plateau: onPlateau, gx: Math.floor(x), gz: Math.floor(z) });
  }
  const top = new THREE.InstancedMesh(rbox(1, 0.34, 1, 0.07), mat(0xffffff), cells.length);
  const dirt = new THREE.InstancedMesh(new THREE.BoxGeometry(0.98, 1, 0.98), mat(L.dirt), cells.length);
  const dummy = new THREE.Object3D(), col = new THREE.Color();
  cells.forEach((c, k) => {
    const depth = c.h + 3;
    dummy.position.set(c.x, c.h - 0.17 - depth / 2, c.z); dummy.scale.set(1, depth, 1); dummy.updateMatrix(); dirt.setMatrixAt(k, dummy.matrix);
    dummy.position.set(c.x, c.h - 0.17, c.z); dummy.scale.set(1, 1, 1); dummy.updateMatrix(); top.setMatrixAt(k, dummy.matrix);
    c.k = k;
  });
  /* colour the grass: claimed building land is bright, unclaimed land is muted */
  let look = L, lastClaimed = () => true;
  function paint(claimed = lastClaimed) {
    lastClaimed = claimed; const L = look;
    cells.forEach(c => {
      col.set(c.shore ? L.sand : ((c.gx + c.gz) & 1 ? L.grass : L.grass2));
      col.offsetHSL(0, 0, (n(c.x * 0.7, c.z * 0.7) - 0.5) * 0.06);
      if (c.plateau && !claimed(c.gx, c.gz)) col.offsetHSL(0.02, -0.28, -0.06);
      top.setColorAt(c.k, col);
    });
    top.instanceColor.needsUpdate = true;
  }
  paint();
  [top, dirt].forEach(m => { m.castShadow = true; m.receiveShadow = true; });
  const g = group(top, dirt); g.userData.cells = cells; g.userData.paint = paint;
  g.userData.setLook = r => { look = REGION_LOOK[r] || REGION_LOOK[1]; dirt.material.color.set(look.dirt); paint(); };
  return g;
}

/* ---------- water with gentle waves ---------- */
export function makeWater(region = 1) {
  const L = REGION_LOOK[region] || REGION_LOOK[1];
  const geo = new THREE.PlaneGeometry(380, 380, 76, 76); geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: L.water, roughness: 0.25, metalness: 0.1, transparent: true, opacity: 0.88, flatShading: true }));
  m.position.y = 0.05; m.receiveShadow = true;
  const pos = geo.attributes.position, base = Float32Array.from(pos.array);
  m.userData.update = (dt, t) => {
    for (let i = 0; i < pos.count; i++) { const x = base[i * 3], z = base[i * 3 + 2]; pos.array[i * 3 + 1] = Math.sin(x * 0.25 + t * 1.1) * 0.12 + Math.cos(z * 0.3 + t * 0.9) * 0.1; }
    pos.needsUpdate = true; geo.computeVertexNormals();
  };
  return m;
}

/* ---------- decor ---------- */
export function makeTree(rnd = Math.random, leafCols = REGION_LOOK[1].leaf, snow = false) {
  const h = 1.2 + rnd() * 0.8, c = leafCols[Math.floor(rnd() * leafCols.length)];
  const g = group(block(0.42, h, 0.42, 0x7a4a26, 0, 0, 0, { r: 0.06 }));
  const s = 1.5 + rnd() * 0.5;
  g.add(block(s, s * 0.8, s, c, 0, h, 0, { r: 0.18 }));
  g.add(block(s * 0.68, s * 0.6, s * 0.68, new THREE.Color(c).offsetHSL(0, 0, 0.06).getHex(), 0, h + s * 0.75, 0, { r: 0.15 }));
  if (snow) { g.add(block(s * 0.72, s * 0.16, s * 0.72, 0xffffff, 0, h + s * 1.3, 0, { r: 0.07, cast: false })); g.add(block(s * 1.04, s * 0.12, s * 1.04, 0xffffff, 0, h + s * 0.74, 0, { r: 0.06, cast: false })); }
  g.rotation.y = rnd() * Math.PI;
  return g;
}
export function makeRock(rnd = Math.random) {
  const s = 0.5 + rnd() * 0.6;
  const g = group(block(s, s * 0.7, s * 0.9, 0x9aa3ad, 0, 0, 0, { r: 0.14 }), block(s * 0.5, s * 0.45, s * 0.5, 0xb6bec7, s * 0.35, 0, s * 0.2, { r: 0.1 }));
  g.rotation.y = rnd() * 3; return g;
}
export function makeFlower(rnd = Math.random) {
  const c = [0xff6b9a, 0xffd23f, 0xffffff, 0xa77bff][Math.floor(rnd() * 4)];
  return group(block(0.08, 0.3, 0.08, 0x3c8f3a, 0, 0, 0, { r: 0, cast: false }), block(0.22, 0.14, 0.22, c, 0, 0.3, 0, { r: 0.05, cast: false }));
}
export function makeCloud(rnd = Math.random) {
  const g = new THREE.Group(), m = mat(0xffffff, { rough: 1 });
  const n = 3 + Math.floor(rnd() * 3);
  for (let i = 0; i < n; i++) { const s = 2 + rnd() * 2.5; const b = new THREE.Mesh(rbox(s, s * 0.7, s * 0.9, 0.4), m); b.position.set(i * 1.8 - n, rnd() * 0.8, rnd() * 1.2); b.castShadow = false; g.add(b); }
  return g;
}

/* ---------- the keep (centre of every fort) ---------- */
export function makeKeep(style = "wood") {
  const S = {
    wood: { wall: 0xc0894f, trim: 0x8a5a2e, roof: 0xd9473b, stone: 0xa9b1bb },
    2: { wall: 0xe0c99c, trim: 0x9c7a4a, roof: 0x3f8f4a, stone: 0xbfa576 },
    3: { wall: 0xdff1ff, trim: 0x8fc0e8, roof: 0x6fb7ff, stone: 0xa9d0f2 },
    4: { wall: 0xc9a14a, trim: 0x6b6f78, roof: 0x8a5a2e, stone: 0x9c7a35 },
    5: { wall: 0x4a4352, trim: 0xffc83d, roof: 0xe2452e, stone: 0x2b2127 },
  }[style === 1 ? "wood" : style] || { wall: 0xc0894f, trim: 0x8a5a2e, roof: 0xd9473b, stone: 0xa9b1bb };
  const g = new THREE.Group();
  g.add(block(3.6, 0.6, 3.6, S.stone, 0, 0, 0, { r: 0.12 }));                 // stone footing
  g.add(block(3.0, 3.2, 3.0, S.wall, 0, 0.6, 0, { r: 0.1 }));                  // tower body
  for (let i = -1; i <= 1; i++) { g.add(block(0.18, 3.2, 0.18, S.trim, i * 1.0, 0.6, 1.52, { r: 0.04 })); g.add(block(0.18, 3.2, 0.18, S.trim, 1.52, 0.6, i * 1.0, { r: 0.04 })); }
  g.add(block(1.0, 1.5, 0.2, 0x5b3417, 0, 0.6, 1.52, { r: 0.08 }));           // door
  g.add(block(0.5, 0.5, 0.2, 0x2a3350, 0, 2.7, 1.52, { r: 0.05, emissive: 0xffc35a, ei: 0.0 }));  // window
  g.add(block(3.5, 0.4, 3.5, S.trim, 0, 3.8, 0, { r: 0.1 }));                  // walkway
  [[-1.4, -1.4], [0, -1.4], [1.4, -1.4], [-1.4, 0], [1.4, 0], [-1.4, 1.4], [0, 1.4], [1.4, 1.4]].forEach(([x, z]) => g.add(block(0.6, 0.6, 0.6, S.wall, x, 4.2, z, { r: 0.08 })));
  // flag
  g.add(block(0.12, 2.2, 0.12, 0x5c5c66, 0, 4.2, 0, { r: 0.03 }));
  const flag = block(1.2, 0.7, 0.08, S.roof, 0.6, 5.6, 0, { r: 0.04 }); flag.geometry = flag.geometry.clone(); flag.geometry.translate(0.6, 0, 0); flag.position.x = 0.06;
  g.add(flag); g.userData.flag = flag;
  g.userData.update = (dt, t) => { flag.rotation.y = Math.sin(t * 3) * 0.25; };
  return g;
}

/* ---------- hero: a blocky commander (original design) ---------- */
/* the hero shop: commanders and pets, bought with gold (rewards only, never needed to progress) */
export const HEROES = [
  { id: "knight", name: "Knight", price: 0, look: {} },
  { id: "ranger", name: "Forest Ranger", price: 120, look: { body: 0x2f8a4a, helm: 0x7a4a26, cape: 0x9ccc65, hood: true } },
  { id: "wizard", name: "Rune Wizard", price: 200, look: { body: 0x5b3fd1, helm: 0x3a2a8a, cape: 0xb388ff, hat: true } },
  { id: "frost", name: "Frost Guard", price: 250, look: { body: 0x7fc8f8, helm: 0xffffff, cape: 0x2f6fbf } },
  { id: "engineer", name: "Brass Engineer", price: 300, look: { body: 0xc98f3a, helm: 0x8a8f99, cape: 0x6b4a32, goggles: true } },
  { id: "rider", name: "Dragon Rider", price: 500, look: { body: 0x8c1f1a, helm: 0xffd23f, cape: 0xff7a3a, hat: false, crest: true } },
];
export const PETS = [
  { id: "pup", name: "Block Pup", price: 120, col: 0xd9a066, ear: 0x8a5a2e },
  { id: "owl", name: "Night Owl", price: 180, col: 0x8d6e63, ear: 0xffd23f, owl: true },
  { id: "slime", name: "Friendly Slime", price: 150, col: 0x5cff7a, ear: 0x2fbf5a, slime: true },
  { id: "drake", name: "Baby Drake", price: 400, col: 0xe2452e, ear: 0xffd23f, wings: true },
];
export function makePet(id) {
  const P = PETS.find(p => p.id === id); if (!P) return null;
  const g = new THREE.Group(), b = new THREE.Group(); g.add(b);
  if (P.slime) b.add(block(0.62, 0.48, 0.62, P.col, 0, 0, 0, { r: 0.22 }));
  else { b.add(block(0.6, 0.5, 0.7, P.col, 0, 0.12, 0, { r: 0.14 })); b.add(block(0.5, 0.46, 0.46, P.col, 0, 0.5, P.owl ? 0 : 0.28, { r: 0.12 })); }
  for (const sx of [-1, 1]) {
    b.add(block(0.1, 0.12, 0.04, 0x1b1530, sx * 0.12, P.slime ? 0.26 : 0.66, P.slime ? 0.31 : (P.owl ? 0.24 : 0.52), { r: 0.02 }));
    if (!P.slime) b.add(block(0.12, 0.18, 0.1, P.ear, sx * 0.17, 0.78, P.owl ? 0 : 0.22, { r: 0.04 }));
    if (P.wings) { const w = block(0.4, 0.22, 0.05, P.ear, sx * 0.42, 0.35, -0.05, { r: 0.04 }); w.userData.side = sx; b.add(w); (b.userData.w = b.userData.w || []).push(w); }
  }
  const ph = Math.random() * 6;
  g.userData.update = (dt, t) => { b.position.y = Math.abs(Math.sin(t * 4 + ph)) * 0.12; (b.userData.w || []).forEach(w => (w.rotation.z = w.userData.side * Math.sin(t * 12) * 0.5)); };
  return g;
}
/* a badge banner for the keep: a cloth flag with the badge's emoji painted on */
export function makeBanner(emoji, color = 0x7c4dff) {
  const cv = document.createElement("canvas"); cv.width = cv.height = 128;
  const x = cv.getContext("2d"); x.fillStyle = "#" + new THREE.Color(color).getHexString(); x.fillRect(0, 0, 128, 128);
  x.fillStyle = "#ffd23f"; x.fillRect(0, 118, 128, 10); x.font = "78px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif"; x.textAlign = "center"; x.textBaseline = "middle"; x.fillText(emoji, 64, 62);
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
  const g = new THREE.Group();
  g.add(block(0.07, 1.5, 0.07, 0x5c5c66, 0, 0, 0, { r: 0.02 }));
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.75), new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, roughness: 0.9 }));
  cloth.position.set(0.42, 1.05, 0); g.add(cloth);
  const ph = Math.random() * 6; g.userData.update = (dt, t) => { cloth.rotation.y = Math.sin(t * 2.5 + ph) * 0.2; };
  return g;
}

/* ---------- hero: a blocky commander (original design) ---------- */
export function makeHero({ body = 0x2f6fde, skin = 0xffc98f, helm = 0xc9d2de, cape = 0xe34b4b, hat = false, hood = false, goggles = false, crest = false } = {}) {
  const g = new THREE.Group();
  const legL = block(0.36, 0.7, 0.4, 0x2b3550, -0.2, 0, 0, { r: 0.06 }), legR = block(0.36, 0.7, 0.4, 0x2b3550, 0.2, 0, 0, { r: 0.06 });
  const torso = block(0.9, 0.85, 0.5, body, 0, 0.7, 0, { r: 0.08 });
  const armL = block(0.3, 0.8, 0.34, body, -0.62, 0.75, 0, { r: 0.07 }), armR = block(0.3, 0.8, 0.34, body, 0.62, 0.75, 0, { r: 0.07 });
  const head = block(0.7, 0.66, 0.66, skin, 0, 1.58, 0, { r: 0.12 });
  const helmet = block(0.78, 0.36, 0.74, helm, 0, 2.0, 0, { r: 0.1, metal: 0.4, rough: 0.4 });
  const eyes = group(block(0.1, 0.14, 0.04, 0x1d1d2b, -0.15, 1.82, 0.34, { r: 0.02 }), block(0.1, 0.14, 0.04, 0x1d1d2b, 0.15, 1.82, 0.34, { r: 0.02 }));
  const smile = block(0.24, 0.05, 0.04, 0x8a3b2e, 0, 1.7, 0.34, { r: 0.01 });
  const capeM = block(0.86, 1.0, 0.08, cape, 0, 0.55, -0.3, { r: 0.03 });
  g.add(legL, legR, torso, armL, armR, head, helmet, eyes, smile, capeM);
  if (hat) { const c = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.9, 8), mat(helm)); c.position.y = 2.6; c.castShadow = true; g.add(c, block(1.0, 0.08, 1.0, helm, 0, 2.14, 0, { r: 0.03 })); }
  if (hood) g.add(block(0.86, 0.5, 0.82, cape, 0, 1.9, -0.04, { r: 0.14 }));
  if (goggles) g.add(block(0.62, 0.16, 0.06, 0x3a3a44, 0, 1.84, 0.34, { r: 0.03 }), block(0.16, 0.16, 0.06, 0x7cf3ff, -0.15, 1.84, 0.37, { r: 0.05, emissive: 0x7cf3ff, ei: 0.6 }), block(0.16, 0.16, 0.06, 0x7cf3ff, 0.15, 1.84, 0.37, { r: 0.05, emissive: 0x7cf3ff, ei: 0.6 }));
  if (crest) g.add(block(0.12, 0.4, 0.7, 0xff7a3a, 0, 2.28, 0, { r: 0.05 }));
  g.userData.update = (dt, t) => { const s = Math.sin(t * 2); armL.rotation.x = s * 0.15; armR.rotation.x = -s * 0.15; g.position.y = (g.userData.baseY || 0) + Math.abs(Math.sin(t * 2)) * 0.04; };
  return g;
}

/* ---------- demons: cute, spooky-fun, never gory ---------- */
export const DEMON_TYPES = {
  imp: { body: 0x8b5cf6, belly: 0xc4b5fd, horn: 0xffd23f, size: 0.9 },
  bat: { body: 0x3b3b6d, belly: 0x6d6dbb, horn: 0xff7eb6, size: 0.7 },
};
export function makeDemon(kind = "imp", region = 1, over = null) {
  const D = { ...(DEMON_TYPES[kind] || DEMON_TYPES.imp), ...((REGION_DEMON[region] || {})[kind] || {}), ...(over || {}) }, s = D.size;
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  body.add(block(1.0 * s, 0.95 * s, 0.9 * s, D.body, 0, 0.18 * s, 0, { r: 0.28 * s }));
  body.add(block(0.6 * s, 0.45 * s, 0.1 * s, D.belly, 0, 0.3 * s, 0.43 * s, { r: 0.12 * s }));
  // big friendly eyes
  for (const sx of [-1, 1]) {
    body.add(block(0.3 * s, 0.34 * s, 0.08 * s, 0xffffff, sx * 0.22 * s, 0.7 * s, 0.45 * s, { r: 0.1 * s }));
    body.add(block(0.14 * s, 0.18 * s, 0.06 * s, 0x1b1530, sx * 0.2 * s, 0.73 * s, 0.5 * s, { r: 0.05 * s }));
    body.add(block(0.05 * s, 0.05 * s, 0.03 * s, 0xffffff, sx * 0.17 * s, 0.85 * s, 0.53 * s, { r: 0.01, cast: false }));
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.11 * s, 0.32 * s, 6), mat(D.horn)); horn.position.set(sx * 0.3 * s, 1.25 * s, 0); horn.rotation.z = -sx * 0.35; horn.castShadow = true; body.add(horn);
    body.add(block(0.24 * s, 0.18 * s, 0.3 * s, D.body, sx * 0.28 * s, 0, 0.05 * s, { r: 0.08 * s })); // feet
  }
  body.add(block(0.26 * s, 0.07 * s, 0.05 * s, 0x1b1530, 0, 0.48 * s, 0.46 * s, { r: 0.02 }));      // little grin
  if (D.crown) for (let i = -1; i <= 1; i++) body.add(block(0.16 * s, 0.24 * s, 0.16 * s, 0xffd23f, i * 0.22 * s, 1.08 * s, 0.1 * s, { r: 0.03 * s, metal: 0.5, rough: 0.35 }));
  if (D.glow) for (const sx of [-1, 1]) body.add(block(0.15 * s, 0.19 * s, 0.07 * s, D.glow, sx * 0.2 * s, 0.73 * s, 0.51 * s, { r: 0.05 * s, emissive: D.glow, ei: 2 }));
  if (D.wings || kind === "bat") for (const sx of [-1, 1]) { const w = block(0.7 * s, 0.4 * s, 0.06 * s, D.wingCol || D.belly, sx * 0.75 * s, 0.6 * s, -0.1 * s, { r: 0.05 }); w.userData.side = sx; body.add(w); body.userData.wing = body.userData.wing || []; body.userData.wing.push(w); }
  const phase = Math.random() * 6;
  g.userData.update = (dt, t) => {
    const b = Math.abs(Math.sin(t * (D.heavy ? 2 : 5) + phase)); body.position.y = b * (D.heavy ? 0.06 : 0.22) * s + (kind === "bat" ? 0.8 : 0);
    body.scale.set(1 + (1 - b) * 0.06, 1 - (1 - b) * 0.08, 1 + (1 - b) * 0.06);
    (body.userData.wing || []).forEach(w => (w.rotation.z = w.userData.side * Math.sin(t * 14 + phase) * 0.6));
  };
  return g;
}

/* ---------- demon lords: big, chunky, a little silly ---------- */
export const LORDS = {
  1: { body: 0x9aa3ad, belly: 0xc9d0d8, horn: 0x6f7782, glow: 0x7cf3ff, size: 2.6, heavy: true },                       // the Letter Guardian, a living rune-statue
  2: { body: 0x4f8f3a, belly: 0xa7cf7a, horn: 0xefe3c0, size: 2.8, heavy: true, crown: true },                          // the Bridge Troll
  3: { body: 0xf4f8ff, belly: 0xcfe6ff, horn: 0x8fc8ff, glow: 0x3aa0ff, size: 2.8, heavy: true },                       // the Pattern Yeti
  5: { body: 0xd2382b, belly: 0xffb347, horn: 0xffd23f, glow: 0xffe066, size: 3.2, heavy: true, wings: true, wingCol: 0x8c1f1a, crown: true },  // the Algebra Dragon
};
export function makeLord(region) { return makeDemon("imp", region, LORDS[region] || LORDS[1]); }
