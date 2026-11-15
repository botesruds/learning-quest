/* Blocky models built in code: island, trees, clouds, the keep, the hero and cute demons. */
import { THREE, block, group, mat, rbox, noise2 } from "./gfx.js";

export const REGION_LOOK = {
  1: { name: "Letter Land", grass: 0x6cc644, grass2: 0x58b23a, dirt: 0x9a6a3e, sand: 0xf2d98a, water: 0x2fa7e6, leaf: [0x3fae4a, 0x5cc556, 0x2f9a45] },
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
  function paint(claimed = () => true) {
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
export function makeTree(rnd = Math.random, leafCols = REGION_LOOK[1].leaf) {
  const h = 1.2 + rnd() * 0.8, c = leafCols[Math.floor(rnd() * leafCols.length)];
  const g = group(block(0.42, h, 0.42, 0x7a4a26, 0, 0, 0, { r: 0.06 }));
  const s = 1.5 + rnd() * 0.5;
  g.add(block(s, s * 0.8, s, c, 0, h, 0, { r: 0.18 }));
  g.add(block(s * 0.68, s * 0.6, s * 0.68, new THREE.Color(c).offsetHSL(0, 0, 0.06).getHex(), 0, h + s * 0.75, 0, { r: 0.15 }));
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
  }[style] || { wall: 0xc0894f, trim: 0x8a5a2e, roof: 0xd9473b, stone: 0xa9b1bb };
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
export function makeHero({ body = 0x2f6fde, skin = 0xffc98f, helm = 0xc9d2de, cape = 0xe34b4b } = {}) {
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
  g.userData.update = (dt, t) => { const s = Math.sin(t * 2); armL.rotation.x = s * 0.15; armR.rotation.x = -s * 0.15; g.position.y = (g.userData.baseY || 0) + Math.abs(Math.sin(t * 2)) * 0.04; };
  return g;
}

/* ---------- demons: cute, spooky-fun, never gory ---------- */
export const DEMON_TYPES = {
  imp: { body: 0x8b5cf6, belly: 0xc4b5fd, horn: 0xffd23f, size: 0.9 },
  bat: { body: 0x3b3b6d, belly: 0x6d6dbb, horn: 0xff7eb6, size: 0.7 },
};
export function makeDemon(kind = "imp") {
  const D = DEMON_TYPES[kind] || DEMON_TYPES.imp, s = D.size;
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
  if (kind === "bat") for (const sx of [-1, 1]) { const w = block(0.7 * s, 0.4 * s, 0.06 * s, D.belly, sx * 0.75 * s, 0.6 * s, -0.1 * s, { r: 0.05 }); w.userData.side = sx; body.add(w); body.userData.wing = body.userData.wing || []; body.userData.wing.push(w); }
  const phase = Math.random() * 6;
  g.userData.update = (dt, t) => {
    const b = Math.abs(Math.sin(t * 5 + phase)); body.position.y = b * 0.22 * s + (kind === "bat" ? 0.8 : 0);
    body.scale.set(1 + (1 - b) * 0.06, 1 - (1 - b) * 0.08, 1 + (1 - b) * 0.06);
    (body.userData.wing || []).forEach(w => (w.rotation.z = w.userData.side * Math.sin(t * 14 + phase) * 0.6));
  };
  return g;
}
