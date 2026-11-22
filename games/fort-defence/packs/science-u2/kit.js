/* Pictures and hands-on tools for Science Unit 2 (How are we organised?). Original drawings, built as SVG in code.
   Every picture can be labelled (labels:true), can point at one part with a "?" (mark:"nucleus"), and marks its parts
   with data-part so a question can ask Oliver to tap one ({tap:{pic, ans}} answers in js/qui.js). */
import { h } from "../../js/qcore.js";

const NS = "http://www.w3.org/2000/svg";
function svg(w, hgt, inner, title) {
  const el = document.createElementNS(NS, "svg");
  el.setAttribute("viewBox", `0 0 ${w} ${hgt}`); el.setAttribute("class", "sci"); el.setAttribute("role", "img");
  if (title) el.setAttribute("aria-label", title);
  el.innerHTML = inner; return el;
}
const P = (name, label) => `data-part="${name}" data-name="${label || name}"`;
/* label lines: each label is [part, anchorX, anchorY, textX, textY, text]; mark = one part gets "?" instead */
function labelsSvg(list, o) {
  if (!o.labels && !o.mark) return "";
  return list.filter(l => o.labels || l[0] === o.mark).map(([part, ax, ay, tx, ty, text]) => {
    const t = o.labels && part !== o.mark ? text : "?";
    const anchor = tx < ax ? "end" : "start";
    return `<g class="lab" pointer-events="none"><line x1="${ax}" y1="${ay}" x2="${tx + (tx < ax ? 4 : -4)}" y2="${ty - 4}" stroke="#1b2236" stroke-width="1.6"/>` +
      `<circle cx="${ax}" cy="${ay}" r="2.6" fill="#1b2236"/><text x="${tx}" y="${ty}" text-anchor="${anchor}" class="lbl"${t === "?" ? ' style="font-size:20px;fill:#BF342C"' : ""}>${t}</text></g>`;
  }).join("");
}

/* ---------------- cells ---------------- */
const MITO = (x, y, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r})" ${P("mitochondria", "mitochondrion")}><ellipse rx="13" ry="7" fill="#f6a04d" stroke="#b8621a" stroke-width="1.5"/><path d="M-9 0 q3 -5 6 0 q3 5 6 0 q3 -5 6 0" fill="none" stroke="#b8621a" stroke-width="1.4"/></g>`;
const CHLORO = (x, y, r = 0) => `<g transform="translate(${x} ${y}) rotate(${r})" ${P("chloroplast", "chloroplast")}><ellipse rx="12" ry="7" fill="#46b04a" stroke="#1f7a2a" stroke-width="1.5"/><path d="M-7 -2 h14 M-7 2 h14" stroke="#1f7a2a" stroke-width="1.3"/></g>`;
export function animalCell(o = {}) {
  const inner = `
  <path ${P("cytoplasm")} d="M60 70 C 90 20, 230 25, 262 70 C 300 120, 285 200, 230 222 C 170 248, 90 238, 58 196 C 30 160, 34 110, 60 70 Z" fill="#fde2ef"/>
  <path ${P("membrane", "cell membrane")} d="M60 70 C 90 20, 230 25, 262 70 C 300 120, 285 200, 230 222 C 170 248, 90 238, 58 196 C 30 160, 34 110, 60 70 Z" fill="none" stroke="#c2185b" stroke-width="4" style="pointer-events:stroke"/>
  <path d="M60 70 C 90 20, 230 25, 262 70 C 300 120, 285 200, 230 222 C 170 248, 90 238, 58 196 C 30 160, 34 110, 60 70 Z" fill="none" stroke="transparent" stroke-width="14" ${P("membrane", "cell membrane")} style="pointer-events:stroke"/>
  <g ${P("nucleus")}><circle cx="165" cy="132" r="34" fill="#9b6fd6" stroke="#5b3a9a" stroke-width="2.5"/><circle cx="172" cy="126" r="10" fill="#6b45b0"/></g>
  ${MITO(95, 110, -20)}${MITO(230, 170, 25)}${MITO(110, 190, 10)}${MITO(232, 92, -35)}
  ${o.vac ? `<ellipse ${P("vacuole")} cx="205" cy="200" rx="10" ry="7" fill="#bfe6ff" stroke="#4a90c9"/>` : ""}`;
  const labs = [["membrane", 268, 78, 292, 40, "cell membrane"], ["nucleus", 175, 120, 290, 132, "nucleus"], ["cytoplasm", 200, 205, 292, 240, "cytoplasm"], ["mitochondria", 95, 110, 6, 100, "mitochondrion"]];
  return svg(330, 260, inner + labelsSvg(labs, o), "An animal cell");
}
export function plantCell(o = {}) {
  const inner = `
  <rect ${P("wall", "cell wall")} x="40" y="20" width="250" height="220" rx="14" fill="#7cc576" stroke="#2f7d32" stroke-width="3"/>
  <rect ${P("cytoplasm")} x="52" y="32" width="226" height="196" rx="10" fill="#e9f7d6"/>
  <rect ${P("membrane", "cell membrane")} x="52" y="32" width="226" height="196" rx="10" fill="none" stroke="#c2185b" stroke-width="2.5" style="pointer-events:stroke"/>
  <rect x="52" y="32" width="226" height="196" rx="10" fill="none" stroke="transparent" stroke-width="9" ${P("membrane", "cell membrane")} style="pointer-events:stroke"/>
  <rect ${P("vacuole")} x="96" y="62" width="150" height="128" rx="34" fill="#cfeaff" stroke="#4a90c9" stroke-width="2"/>
  <g ${P("nucleus")}><circle cx="78" cy="204" r="18" fill="#9b6fd6" stroke="#5b3a9a" stroke-width="2.5"/><circle cx="82" cy="200" r="6" fill="#6b45b0"/></g>
  ${CHLORO(74, 60, 30)}${CHLORO(262, 70, -20)}${CHLORO(262, 168, 15)}${CHLORO(150, 212, 0)}${CHLORO(74, 130, 80)}${CHLORO(210, 212, -10)}
  ${MITO(258, 120, 90)}${MITO(118, 46, 0)}`;
  const labs = [["wall", 290, 50, 300, 22, "cell wall"], ["membrane", 278, 200, 300, 252, "cell membrane"], ["vacuole", 200, 120, 300, 112, "vacuole"], ["chloroplast", 262, 70, 300, 76, "chloroplast"],
    ["nucleus", 70, 210, 8, 252, "nucleus"], ["cytoplasm", 90, 175, 8, 175, "cytoplasm"], ["mitochondria", 118, 46, 8, 12, "mitochondrion"]];
  return svg(400, 262, inner + labelsSvg(labs, o), "A plant cell");
}
/* a root cell: like a plant cell but no chloroplasts */
export function rootCell(o = {}) {
  const inner = `<rect ${P("wall", "cell wall")} x="40" y="30" width="200" height="120" rx="10" fill="#c9a77a" stroke="#7a5a2e" stroke-width="3"/>
  <rect ${P("cytoplasm")} x="50" y="40" width="180" height="100" rx="8" fill="#fbf3e2" stroke="#c2185b" stroke-width="2"/>
  <rect ${P("vacuole")} x="80" y="52" width="120" height="70" rx="22" fill="#cfeaff" stroke="#4a90c9" stroke-width="2"/>
  <circle ${P("nucleus")} cx="64" cy="124" r="12" fill="#9b6fd6" stroke="#5b3a9a" stroke-width="2"/>${MITO(212, 130, 0)}
  <text x="140" y="172" text-anchor="middle">Root cell (underground)</text>`;
  return svg(280, 182, inner, "A root cell");
}

/* ---------------- Venn diagram: plant only / both / animal only ---------------- */
export function venn(left = ["cell wall", "chloroplasts", "large vacuole"], mid = ["nucleus", "cell membrane", "cytoplasm", "mitochondria"], right = ["(nothing extra)"]) {
  const col = (list, x) => list.map((t, i) => `<text x="${x}" y="${92 + i * 20}" text-anchor="middle" class="lbl">${t}</text>`).join("");
  return svg(400, 210, `<circle cx="140" cy="105" r="95" fill="#7cc57655" stroke="#2f7d32" stroke-width="2"/><circle cx="260" cy="105" r="95" fill="#f48fb155" stroke="#c2185b" stroke-width="2"/>
  <text x="95" y="30" text-anchor="middle">Plant only</text><text x="305" y="30" text-anchor="middle">Animal only</text><text x="200" y="58" text-anchor="middle">Both</text>
  ${col(left, 90)}${col(mid, 200)}${col(right, 312)}`, "Venn diagram of plant and animal cells");
}

/* ---------------- the light microscope ---------------- */
export function microscope(o = {}) {
  const inner = `
  <rect x="50" y="250" width="150" height="22" rx="6" fill="#455a64"/>
  <path d="M150 250 C 175 200, 178 120, 150 70" fill="none" stroke="#546e7a" stroke-width="20" stroke-linecap="round"/>
  <g ${P("lamp", "lamp (light)")}><rect x="90" y="226" width="40" height="22" rx="4" fill="#ffd54f" stroke="#a07a00"/><path d="M100 226 l10 -12 l10 12" fill="#fff59d" opacity=".8"/></g>
  <rect ${P("stage")} x="52" y="190" width="120" height="12" rx="3" fill="#263238"/>
  <g ${P("clips", "stage clips")}><rect x="60" y="184" width="22" height="6" rx="2" fill="#90a4ae"/><rect x="140" y="184" width="22" height="6" rx="2" fill="#90a4ae"/></g>
  <rect x="94" y="184" width="36" height="6" fill="#e3f2fd" stroke="#64b5f6"/>
  <g ${P("objective", "objective lenses")}><rect x="92" y="138" width="14" height="30" rx="3" fill="#b0bec5" stroke="#455a64"/><rect x="110" y="140" width="12" height="38" rx="3" fill="#cfd8dc" stroke="#455a64"/><rect x="126" y="136" width="12" height="24" rx="3" fill="#b0bec5" stroke="#455a64"/></g>
  <rect x="88" y="126" width="54" height="14" rx="5" fill="#607d8b"/>
  <rect ${P("tube", "body tube")} x="100" y="50" width="30" height="78" rx="4" fill="#78909c"/>
  <rect ${P("eyepiece", "eyepiece lens")} x="104" y="20" width="22" height="32" rx="4" fill="#37474f"/>
  <g ${P("coarse", "coarse focus knob")}><circle cx="172" cy="150" r="17" fill="#37474f"/><circle cx="172" cy="150" r="6" fill="#90a4ae"/></g>
  <g ${P("fine", "fine focus knob")}><circle cx="172" cy="186" r="9" fill="#263238"/><circle cx="172" cy="186" r="3" fill="#90a4ae"/></g>`;
  const labs = [["eyepiece", 115, 28, 20, 28, "eyepiece lens"], ["tube", 104, 86, 20, 86, "body tube"], ["objective", 98, 160, 20, 150, "objective lens"], ["clips", 66, 186, 20, 182, "stage clip"],
    ["stage", 60, 196, 20, 212, "stage"], ["lamp", 96, 238, 20, 244, "lamp"], ["coarse", 186, 146, 205, 132, "coarse focus"], ["fine", 180, 188, 205, 196, "fine focus"]];
  return svg(300, 280, inner + labelsSvg(labs, o), "A light microscope");
}
/* what you see down the microscope: onion cells, blurry or sharp */
export function microView(blur = 0, zoom = 1, stained = true) {
  const cells = [];
  const w = 46 * zoom, hh = 24 * zoom;
  for (let r = -1; r < 6; r++) for (let c = -1; c < 7; c++) {
    const x = 20 + c * w + (r % 2 ? w / 2 : 0), y = 20 + r * hh;
    cells.push(`<rect x="${x}" y="${y}" width="${w - 3}" height="${hh - 3}" rx="3" fill="${stained ? "#fff3c4" : "#fbfbf7"}" stroke="${stained ? "#a6782a" : "#d7d2c4"}" stroke-width="2"/>` +
      (stained ? `<circle cx="${x + w * 0.3}" cy="${y + hh * 0.5}" r="${4 * zoom}" fill="#8d5a1e"/>` : ""));
  }
  return svg(220, 220, `<defs><clipPath id="mv"><circle cx="110" cy="110" r="100"/></clipPath><filter id="bl"><feGaussianBlur stdDeviation="${blur}"/></filter></defs>
  <circle cx="110" cy="110" r="104" fill="#1b2236"/><g clip-path="url(#mv)"><rect width="220" height="220" fill="#fffdf2"/><g filter="url(#bl)">${cells.join("")}</g></g>`, "The view down a microscope");
}
/* a student's drawing of onion cells, with one thing wrong (or none) */
export function cellDrawing(fault = "") {
  const sketchy = fault === "sketchy", shade = fault === "shading";
  const rect = (x, y) => sketchy ? `<path d="M${x} ${y} h60 M${x + 3} ${y + 2} h56 M${x + 60} ${y} v34 M${x + 58} ${y + 3} v30 M${x} ${y + 34} h60 M${x} ${y} v34 M${x + 2} ${y + 3} v28" stroke="#444" stroke-width="1.3" fill="none"/>`
    : `<rect x="${x}" y="${y}" width="60" height="34" fill="${shade ? "url(#hatch)" : "none"}" stroke="#333" stroke-width="1.5"/>`;
  let cells = ""; for (const [x, y] of [[40, 40], [100, 40], [160, 40], [70, 74], [130, 74], [40, 108], [100, 108], [160, 108]]) cells += rect(x, y) + `<circle cx="${x + 18}" cy="${y + 17}" r="5" fill="${shade ? "#555" : "none"}" stroke="#333" stroke-width="1.5"/>`;
  const arrow = fault === "arrows" ? ' marker-end="url(#ah)"' : "";
  const l1 = fault === "crossing" ? `<line x1="228" y1="130" x2="62" y2="57" stroke="#333" stroke-width="1.2"/><line x1="228" y1="60" x2="128" y2="125" stroke="#333" stroke-width="1.2"/>`
    : `<line x1="228" y1="57" x2="${fault === "arrows" ? 66 : 64}" y2="57"${arrow} stroke="#333" stroke-width="1.2"/><line x1="228" y1="125" x2="${fault === "arrows" ? 131 : 128}" y2="125"${arrow} stroke="#333" stroke-width="1.2"/>`;
  const labelsTxt = `<text x="232" y="61" class="lbl">nucleus</text><text x="232" y="129" class="lbl">cell wall</text>`;
  const title = fault === "notitle" ? "" : `<text x="130" y="170" text-anchor="middle" class="lbl">Onion cells, ×100</text>`;
  return svg(310, 180, `<defs><pattern id="hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke="#777" stroke-width="1.6"/></pattern>
  <marker id="ah" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="#333"/></marker></defs>
  <rect x="2" y="2" width="306" height="176" rx="8" fill="#fffef8" stroke="#e2d6bd"/>${cells}${l1}${labelsTxt}${title}`, "A student's drawing of onion cells");
}

/* ---------------- diffusion ---------------- */
function dotsIn(n, x0, x1, y0, y1, col, seed) { let s = seed; const r = () => (s = (s * 16807) % 2147483647) / 2147483647; let o = ""; for (let i = 0; i < n; i++) o += `<circle cx="${(x0 + r() * (x1 - x0)).toFixed(1)}" cy="${(y0 + r() * (y1 - y0)).toFixed(1)}" r="5" fill="${col}"/>`; return o; }
export function diffusionPic(stage = "start", flip = false) {
  const L = stage === "start" ? 26 : stage === "mid" ? 18 : 13, R = 26 - L;
  const a = dotsIn(L, 20, 145, 20, 140, "#7c4dff", 7), b = dotsIn(R, 155, 280, 20, 140, "#7c4dff", 3);
  const inner = `<rect x="10" y="10" width="280" height="140" rx="10" fill="#f3f8ff" stroke="#90a4ae" stroke-width="2"/><line x1="150" y1="14" x2="150" y2="146" stroke="#cfd8dc" stroke-dasharray="5 5"/>${a}${b}`;
  return svg(300, 160, flip ? `<g transform="translate(300 0) scale(-1 1)">${inner}</g>` : inner, "Particles in a box");
}
/* air sac and blood capillary: oxygen goes from crowded to less crowded */
export function alveolus(o = {}) {
  const inner = `<path d="M20 30 C 60 0, 200 0, 240 30 C 270 55, 260 110, 230 120 L 30 120 C 5 110, 0 55, 20 30 Z" fill="#e3f2fd" stroke="#64b5f6" stroke-width="2"/>
  <text x="130" y="24" text-anchor="middle" class="lbl">air sac in the lung</text>${dotsIn(18, 35, 225, 35, 110, "#1e88e5", 5)}
  <rect x="10" y="126" width="260" height="46" rx="20" fill="#ffcdd2" stroke="#e53935" stroke-width="2"/><text x="140" y="190" text-anchor="middle" class="lbl">blood capillary</text>${dotsIn(4, 30, 250, 136, 162, "#1e88e5", 9)}
  ${o.arrows ? `<path d="M90 100 v40 M80 128 l10 12 l10 -12 M180 100 v40 M170 128 l10 12 l10 -12" stroke="#1b2236" stroke-width="3" fill="none"/>` : ""}
  <circle cx="232" cy="198" r="5" fill="#1e88e5"/><text x="242" y="202" class="lbl">oxygen</text>`;
  return svg(300, 210, inner, "An air sac next to a blood capillary");
}
/* the hands-on diffusion tank: particles start crowded on the left and spread out on their own */
export function DiffusionTool() {
  const W = 300, H = 150, n = 40; let warm = false, run = false, raf = 0, last = 0;
  const box = h("div", { class: "simbox" });
  const el = svg(W, H, `<rect x="2" y="2" width="${W - 4}" height="${H - 4}" rx="10" fill="#f3f8ff" stroke="#90a4ae" stroke-width="2"/><line x1="${W / 2}" y1="6" x2="${W / 2}" y2="${H - 6}" stroke="#cfd8dc" stroke-dasharray="5 5"/><g class="pts"></g>`, "Diffusion");
  const g = el.querySelector(".pts"); let P = [];
  const count = h("div", { class: "small", style: "font-weight:700" });
  function reset() { P = Array.from({ length: n }, () => ({ x: 14 + Math.random() * 110, y: 14 + Math.random() * (H - 28), vx: 0, vy: 0 })); g.innerHTML = P.map(() => `<circle r="5" fill="#7c4dff"/>`).join(""); draw(); }
  function draw() { const cs = g.children; let left = 0; P.forEach((p, i) => { cs[i].setAttribute("cx", p.x.toFixed(1)); cs[i].setAttribute("cy", p.y.toFixed(1)); if (p.x < W / 2) left++; }); count.textContent = `Left side: ${left} particles · Right side: ${n - left} particles`; }
  function step(t) { if (!run || !el.isConnected) { run = false; return; } const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t; const sp = warm ? 220 : 90;
    P.forEach(p => { p.vx += (Math.random() - 0.5) * sp * 0.9; p.vy += (Math.random() - 0.5) * sp * 0.9; const v = Math.hypot(p.vx, p.vy); if (v > sp) { p.vx *= sp / v; p.vy *= sp / v; }
      p.x += p.vx * dt; p.y += p.vy * dt; if (p.x < 10) { p.x = 10; p.vx *= -1; } if (p.x > W - 10) { p.x = W - 10; p.vx *= -1; } if (p.y < 10) { p.y = 10; p.vy *= -1; } if (p.y > H - 10) { p.y = H - 10; p.vy *= -1; } });
    draw(); raf = requestAnimationFrame(step); }
  const go = h("button", { class: "btn primary", type: "button", onclick: () => { if (run) return; run = true; last = 0; raf = requestAnimationFrame(step); } }, "▶ Let them move");
  const again = h("button", { class: "btn", type: "button", onclick: () => { run = false; cancelAnimationFrame(raf); reset(); } }, "↺ Start again");
  const heat = h("button", { class: "btn", type: "button", onclick: () => { warm = !warm; heat.textContent = warm ? "❄️ Cool it down" : "🔥 Warm it up"; } }, "🔥 Warm it up");
  reset(); box.append(el, count, h("div", { class: "row" }, go, again, heat)); return box;
}

/* ---------------- levels of organisation ---------------- */
const ICON = {
  cell: `<circle cx="0" cy="0" r="20" fill="#ffcdd2" stroke="#c62828" stroke-width="2"/><circle r="7" fill="#8e24aa"/>`,
  tissue: [[-16, -12], [0, -12], [16, -12], [-8, 2], [8, 2], [-16, 16], [0, 16], [16, 16]].map(([x, y]) => `<rect x="${x - 8}" y="${y - 7}" width="16" height="14" rx="4" fill="#ffcdd2" stroke="#c62828" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="2.5" fill="#8e24aa"/>`).join(""),
  organ: `<path d="M0 22 C -30 0, -26 -24, -10 -22 C -2 -21, 0 -14, 0 -10 C 0 -14, 2 -21, 10 -22 C 26 -24, 30 0, 0 22 Z" fill="#e53935" stroke="#8e1b1b" stroke-width="2"/>`,
  system: `<path d="M0 6 C -14 -4, -12 -16, -4 -15 C -1 -15, 0 -11, 0 -9 C 0 -11, 1 -15, 4 -15 C 12 -16, 14 -4, 0 6 Z" fill="#e53935"/><path d="M-4 -14 C -30 -26, -30 20, -10 26 M4 -14 C 30 -26, 30 20, 10 26 M-10 26 C -2 30, 2 30, 10 26" fill="none" stroke="#c62828" stroke-width="3"/><path d="M-6 8 C -18 18, -16 24, -10 26 M6 8 C 18 18, 16 24, 10 26" fill="none" stroke="#1e63c9" stroke-width="2.5"/>`,
  organism: `<circle cx="0" cy="-20" r="8" fill="#ffcc99" stroke="#8a5a2e"/><rect x="-9" y="-11" width="18" height="22" rx="5" fill="#2b6fd6"/><path d="M-9 -8 l-8 14 M9 -8 l8 14 M-5 11 l-3 16 M5 11 l3 16" stroke="#8a5a2e" stroke-width="4" stroke-linecap="round"/>`,
};
const PICON = {
  cell: `<rect x="-18" y="-12" width="36" height="24" rx="4" fill="#c8e6c9" stroke="#2e7d32" stroke-width="2"/>${[-10, 0, 10].map(x => `<ellipse cx="${x}" cy="-5" rx="4" ry="2.5" fill="#2e7d32"/>`).join("")}`,
  tissue: [-16, 0, 16].flatMap(x => [-10, 6].map(y => `<rect x="${x - 7}" y="${y - 7}" width="14" height="14" rx="3" fill="#c8e6c9" stroke="#2e7d32" stroke-width="1.5"/>`)).join(""),
  organ: `<path d="M-20 18 C -26 -10, 0 -26, 22 -22 C 22 4, 4 22, -20 18 Z" fill="#66bb6a" stroke="#2e7d32" stroke-width="2"/><path d="M-20 18 L 18 -18" stroke="#2e7d32" stroke-width="2"/>`,
  system: `<path d="M0 26 V -6" stroke="#6d4c41" stroke-width="4"/><path d="M0 2 C -18 -4, -20 -20, -4 -18 Z M0 -6 C 18 -12, 20 -26, 4 -24 Z" fill="#66bb6a" stroke="#2e7d32"/><circle cx="0" cy="-26" r="5" fill="#ffd54f"/>`,
  organism: `<path d="M0 28 V -2" stroke="#6d4c41" stroke-width="4"/><path d="M0 4 C -20 0, -22 -16, -4 -14 Z M0 -4 C 20 -8, 22 -24, 4 -22 Z" fill="#66bb6a" stroke="#2e7d32"/><circle cx="0" cy="-24" r="7" fill="#ffd54f"/><path d="M-10 28 Q0 22 10 28" stroke="#6d4c41" stroke-width="3" fill="none"/>`,
};
export const LEVELS = ["cell", "tissue", "organ", "system", "organism"];
const LEVEL_NAME = { cell: "cell", tissue: "tissue", organ: "organ", system: "organ system", organism: "organism" };
export function levelsPic(o = {}) {
  const set = o.plant ? PICON : ICON, order = o.order || LEVELS, names = o.names !== false;
  const ex = o.plant ? { cell: "palisade cell", tissue: "palisade tissue", organ: "leaf", system: "shoot system", organism: "plant" } : { cell: "muscle cell", tissue: "muscle tissue", organ: "heart", system: "circulatory system", organism: "human" };
  const parts = order.map((k, i) => `<g transform="translate(${36 + i * 72} 52)" ${P(k, LEVEL_NAME[k])}><rect x="-32" y="-34" width="64" height="68" rx="10" fill="${o.mark === k ? "#fff3cf" : "#ffffff"}" stroke="${o.mark === k ? "#e8a100" : "#cfd8dc"}" stroke-width="2"/>${set[k]}</g>` +
    (names ? `<text x="${36 + i * 72}" y="104" text-anchor="middle" class="lbl">${o.mark === k ? "?" : LEVEL_NAME[k]}</text>${o.examples ? `<text x="${36 + i * 72}" y="120" text-anchor="middle" class="lbl" style="font-weight:400;font-size:10.5px">${o.mark === k ? "" : ex[k]}</text>` : ""}` : "") +
    (i < order.length - 1 ? `<path d="M${70 + i * 72} 52 l6 0" stroke="#90a4ae" stroke-width="3" marker-end="url(#la)"/>` : ""));
  return svg(360, o.examples ? 128 : 112, `<defs><marker id="la" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="#90a4ae"/></marker></defs>${parts.join("")}`, "Levels of organisation");
}
export function levelIcon(k, plant) { return svg(80, 80, `<g transform="translate(40 40)">${(plant ? PICON : ICON)[k]}</g>`, LEVEL_NAME[k]); }

/* ---------------- the skeleton ---------------- */
const BONE = "#f3ead2", BONE_S = "#8c7a5a";
const bone = (x1, y1, x2, y2, w, part, name) => `<g ${P(part, name)}><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${BONE_S}" stroke-width="${w + 3}" stroke-linecap="round"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${BONE}" stroke-width="${w}" stroke-linecap="round"/></g>`;
export function skeleton(o = {}) {
  const ribs = [0, 1, 2, 3, 4, 5].map(i => { const y = 100 + i * 11, wd = 34 - Math.abs(i - 2) * 3; return `<path d="M110 ${y} C ${110 - wd - 6} ${y - 4}, ${110 - wd} ${y + 16}, ${110 - wd + 10} ${y + 18} M110 ${y} C ${110 + wd + 6} ${y - 4}, ${110 + wd} ${y + 16}, ${110 + wd - 10} ${y + 18}" fill="none" stroke="${BONE_S}" stroke-width="6"/><path d="M110 ${y} C ${110 - wd - 6} ${y - 4}, ${110 - wd} ${y + 16}, ${110 - wd + 10} ${y + 18} M110 ${y} C ${110 + wd + 6} ${y - 4}, ${110 + wd} ${y + 16}, ${110 + wd - 10} ${y + 18}" fill="none" stroke="${BONE}" stroke-width="3.5"/>`; }).join("");
  const spineSegs = Array.from({ length: 16 }, (_, i) => `<rect x="104" y="${74 + i * 11}" width="12" height="9" rx="3" fill="${BONE}" stroke="${BONE_S}" stroke-width="1.5"/>`).join("");
  const inner = `
  <g ${P("spine", "spine (backbone)")}>${spineSegs}<rect x="98" y="72" width="24" height="180" fill="transparent"/></g>
  <g ${P("ribs", "ribcage")}>${ribs}<rect x="74" y="96" width="72" height="80" fill="transparent"/></g>
  <g ${P("sternum", "breastbone (sternum)")}><rect x="105" y="96" width="10" height="56" rx="4" fill="${BONE}" stroke="${BONE_S}" stroke-width="1.8"/></g>
  <g ${P("skull", "skull")}><path d="M84 40 C 84 6, 136 6, 136 40 C 136 52, 130 58, 126 60 L 94 60 C 90 58, 84 52, 84 40 Z" fill="${BONE}" stroke="${BONE_S}" stroke-width="2.5"/><circle cx="100" cy="38" r="6" fill="#5d4b3a"/><circle cx="120" cy="38" r="6" fill="#5d4b3a"/><path d="M108 48 l2 -5 l2 5 z" fill="#5d4b3a"/></g>
  <g ${P("jaw", "jaw (mandible)")}><path d="M94 60 L 126 60 L 122 72 C 116 77, 104 77, 98 72 Z" fill="${BONE}" stroke="${BONE_S}" stroke-width="2"/><path d="M100 62 v6 M106 62 v7 M112 62 v7 M118 62 v6" stroke="${BONE_S}" stroke-width="1.2"/></g>
  ${bone(108, 88, 72, 94, 6, "clavicle", "collarbone (clavicle)")}${bone(112, 88, 148, 94, 6, "clavicle", "collarbone (clavicle)")}
  ${bone(70, 98, 60, 180, 9, "humerus", "upper arm bone (humerus)")}${bone(150, 98, 160, 180, 9, "humerus", "upper arm bone (humerus)")}
  ${bone(56, 186, 46, 258, 5, "radius", "radius")}${bone(64, 187, 58, 260, 5, "ulna", "ulna")}${bone(164, 186, 174, 258, 5, "radius", "radius")}${bone(156, 187, 162, 260, 5, "ulna", "ulna")}
  <circle cx="51" cy="270" r="9" fill="${BONE}" stroke="${BONE_S}" stroke-width="2"/><circle cx="169" cy="270" r="9" fill="${BONE}" stroke="${BONE_S}" stroke-width="2"/>
  <g ${P("pelvis", "pelvis (hip bone)")}><path d="M110 250 C 96 238, 74 236, 72 252 C 70 268, 86 284, 100 284 L 120 284 C 134 284, 150 268, 148 252 C 146 236, 124 238, 110 250 Z" fill="${BONE}" stroke="${BONE_S}" stroke-width="2.5"/><circle cx="92" cy="266" r="6" fill="#5d4b3a" opacity=".5"/><circle cx="128" cy="266" r="6" fill="#5d4b3a" opacity=".5"/></g>
  ${bone(94, 286, 90, 372, 11, "femur", "thigh bone (femur)")}${bone(126, 286, 130, 372, 11, "femur", "thigh bone (femur)")}
  <g ${P("patella", "kneecap (patella)")}><circle cx="90" cy="381" r="7" fill="${BONE}" stroke="${BONE_S}" stroke-width="2"/><circle cx="130" cy="381" r="7" fill="${BONE}" stroke="${BONE_S}" stroke-width="2"/></g>
  ${bone(90, 392, 90, 460, 8, "tibia", "shin bone (tibia)")}${bone(99, 394, 100, 458, 4, "fibula", "fibula")}${bone(130, 392, 130, 460, 8, "tibia", "shin bone (tibia)")}${bone(121, 394, 120, 458, 4, "fibula", "fibula")}
  <path d="M82 466 h18 M120 466 h18" stroke="${BONE_S}" stroke-width="7" stroke-linecap="round"/>`;
  const labs = [["skull", 88, 30, 14, 24, "skull"], ["jaw", 96, 68, 14, 72, "jaw"], ["clavicle", 84, 92, 14, 104, "collarbone"], ["ribs", 140, 120, 206, 118, "ribs"], ["sternum", 112, 130, 206, 148, "sternum"],
    ["humerus", 64, 140, 14, 150, "humerus"], ["spine", 116, 215, 206, 214, "spine"], ["radius", 49, 240, 14, 236, "radius"], ["ulna", 172, 230, 206, 244, "ulna"], ["pelvis", 140, 262, 206, 276, "pelvis"],
    ["femur", 92, 330, 14, 330, "femur"], ["patella", 136, 381, 206, 384, "kneecap"], ["tibia", 90, 425, 14, 424, "tibia"], ["fibula", 121, 440, 206, 444, "fibula"]];
  return svg(270, 476, inner + labelsSvg(labs, o), "A human skeleton");
}
/* skull, ribcage and spine with the organs they protect */
export function protectPic(o = {}) {
  const inner = `
  <g ${P("brain")}><path d="M80 42 C 78 14, 142 14, 140 42 C 142 54, 78 54, 80 42 Z" fill="#f8bbd0" stroke="#ad1457" stroke-width="1.5"/><path d="M92 30 q8 -6 14 2 q6 -8 14 0 M96 42 q8 -6 14 0 q6 -6 12 0" fill="none" stroke="#ad1457" stroke-width="1.2"/></g>
  <path ${P("skull")} d="M72 44 C 70 0, 150 0, 148 44 C 148 58, 140 64, 134 66 L 86 66 C 80 64, 72 58, 72 44 Z" fill="none" stroke="#8c7a5a" stroke-width="8" style="pointer-events:stroke"/>
  <g ${P("lungs")}><path d="M104 104 C 80 96, 66 120, 70 168 C 82 176, 100 172, 104 160 Z M116 104 C 140 96, 154 120, 150 168 C 138 176, 120 172, 116 160 Z" fill="#f48fb1" stroke="#ad1457" stroke-width="1.5"/></g>
  <g ${P("heart")}><path d="M118 156 C 100 144, 102 128, 112 128 C 116 128, 118 132, 118 134 C 118 132, 121 128, 126 128 C 136 128, 136 146, 118 156 Z" fill="#e53935" stroke="#8e1b1b" stroke-width="1.5"/></g>
  <g ${P("ribs", "ribcage")}>${[0, 1, 2, 3, 4, 5, 6].map(i => { const y = 98 + i * 13; return `<path d="M110 ${y} C 52 ${y - 6}, 56 ${y + 26}, 74 ${y + 24} M110 ${y} C 168 ${y - 6}, 164 ${y + 26}, 146 ${y + 24}" fill="none" stroke="#8c7a5a" stroke-width="6" opacity=".9"/>`; }).join("")}</g>
  <g ${P("spine", "spine (vertebrae)")}>${Array.from({ length: 6 }, (_, i) => `<rect x="196" y="${80 + i * 20}" width="28" height="16" rx="4" fill="#f3ead2" stroke="#8c7a5a" stroke-width="2"/>`).join("")}</g>
  <line ${P("cord", "spinal cord")} x1="210" y1="76" x2="210" y2="200" stroke="#fbc02d" stroke-width="6"/>
  <text x="210" y="216" text-anchor="middle" class="lbl">backbone</text>`;
  const labs = [["brain", 110, 34, 160, 20, "brain"], ["skull", 74, 50, 8, 50, "skull"], ["lungs", 78, 140, 8, 140, "lungs"], ["heart", 124, 144, 160, 172, "heart"], ["ribs", 150, 112, 160, 96, "ribs"], ["cord", 210, 150, 240, 150, "spinal cord"]];
  return svg(300, 224, inner + labelsSvg(labs, o), "Bones protecting organs");
}
/* a long bone cut open: compact bone, spongy bone with red marrow, yellow marrow */
export function bonePic(o = {}) {
  const spongy = Array.from({ length: 22 }, (_, i) => `<circle cx="${70 + (i * 37) % 80}" cy="${28 + ((i * 53) % 44)}" r="4" fill="#e53935" opacity=".8"/>`).join("");
  const spongy2 = Array.from({ length: 22 }, (_, i) => `<circle cx="${70 + (i * 41) % 80}" cy="${262 + ((i * 29) % 44)}" r="4" fill="#e53935" opacity=".8"/>`).join("");
  const inner = `
  <g ${P("cartilage")}><path d="M60 30 C 60 6, 160 6, 160 30" fill="none" stroke="#81d4fa" stroke-width="8"/><path d="M60 300 C 60 324, 160 324, 160 300" fill="none" stroke="#81d4fa" stroke-width="8"/></g>
  <path ${P("compact", "compact bone (hard outer bone)")} d="M60 30 C 60 70, 86 80, 86 100 L 86 230 C 86 250, 60 260, 60 300 L 160 300 C 160 260, 134 250, 134 230 L 134 100 C 134 80, 160 70, 160 30 Z" fill="#f3ead2" stroke="#8c7a5a" stroke-width="2.5"/>
  <g ${P("red", "red bone marrow (in spongy bone)")}><path d="M68 32 C 68 64, 92 72, 96 90 L 124 90 C 128 72, 152 64, 152 32 Z" fill="#ffccbc" stroke="#d84315" stroke-width="1.2"/>${spongy}<path d="M68 298 C 68 266, 92 258, 96 240 L 124 240 C 128 258, 152 266, 152 298 Z" fill="#ffccbc" stroke="#d84315" stroke-width="1.2"/>${spongy2}</g>
  <rect ${P("yellow", "yellow bone marrow")} x="96" y="92" width="28" height="146" rx="10" fill="#ffe082" stroke="#c49000" stroke-width="1.5"/>`;
  const labs = [["red", 110, 50, 172, 40, "red bone marrow (spongy bone)"], ["compact", 88, 160, 8, 160, "hard (compact) bone"], ["yellow", 112, 170, 172, 170, "yellow bone marrow"], ["cartilage", 80, 16, 8, 12, "cartilage"]];
  return svg(330, 330, inner + labelsSvg(labs, o), "A long bone cut open");
}
/* blood: red cells, white cells, platelets */
export function bloodPic(o = {}) {
  const red = [[40, 40], [90, 30], [140, 52], [60, 100], [180, 30], [200, 96], [120, 110]].map(([x, y]) => `<g transform="translate(${x} ${y})" ${P("red", "red blood cell")}><circle r="16" fill="#e53935"/><circle r="7" fill="#c62828"/></g>`).join("");
  const white = `<g transform="translate(150 86)" ${P("white", "white blood cell")}><circle r="22" fill="#f5f5f5" stroke="#9e9e9e" stroke-width="2"/><path d="M-8 -6 c6 -8 14 -2 8 6 c8 4 0 14 -6 6 c-6 6 -14 -4 -2 -12z" fill="#7e57c2"/></g>`;
  const plat = [[100, 70], [30, 120], [220, 60], [175, 125]].map(([x, y]) => `<g transform="translate(${x} ${y})" ${P("platelet")}><ellipse rx="6" ry="4" fill="#ffb74d"/></g>`).join("");
  return svg(250, 150, `<rect x="2" y="2" width="246" height="146" rx="12" fill="#fff3f0" stroke="#ffcdd2"/>${red}${white}${plat}` + labelsSvg([["red", 40, 40, 8, 14, "red blood cell"], ["white", 150, 70, 160, 14, "white blood cell"], ["platelet", 220, 60, 200, 142, "platelet"]], o), "Blood cells");
}

/* ---------------- the arm: biceps and triceps ---------------- */
function muscle(a, b, t, col, part, name) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
  return `<path ${P(part, name)} d="M${a[0]} ${a[1]} Q ${mx + nx * t} ${my + ny * t} ${b[0]} ${b[1]} Q ${mx - nx * t} ${my - ny * t} ${a[0]} ${a[1]} Z" fill="${col}" stroke="#7f1d1d" stroke-width="1.5"/>`;
}
const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
export function armPic(o = {}) {
  const bent = o.bent ?? false, ang = (o.angle ?? (bent ? -25 : 90)) * Math.PI / 180;
  const sh = [80, 50], el = [80, 170], d = [Math.cos(ang), Math.sin(ang)], hand = [el[0] + d[0] * 112, el[1] + d[1] * 112];
  const front = [d[1], -d[0]], back = [-d[1], d[0]];
  const bIns = [el[0] + d[0] * 24 + front[0] * 7, el[1] + d[1] * 24 + front[1] * 7], tIns = [el[0] - d[0] * 10 + back[0] * 9, el[1] - d[1] * 10 + back[1] * 9];
  const bOri = [92, 62], tOri = [66, 64];
  const k = Math.max(0, Math.min(1, ((o.angle ?? (bent ? -25 : 90)) - 90) / -115));   // 0 straight → 1 fully bent
  const bT = o.bThick ?? 10 + k * 16, tT = o.tThick ?? 22 - k * 10;
  const tend = (p, q) => `<line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="#f5f5f5" stroke-width="5" stroke-linecap="round"/><line x1="${p[0]}" y1="${p[1]}" x2="${q[0]}" y2="${q[1]}" stroke="#bdbdbd" stroke-width="1" stroke-linecap="round"/>`;
  const b1 = lerp(bOri, bIns, 0.1), b2 = lerp(bOri, bIns, 0.84), t1 = lerp(tOri, tIns, 0.08), t2 = lerp(tOri, tIns, 0.86);
  const inner = `
  <rect x="40" y="18" width="70" height="40" rx="18" fill="#ffe0c2" opacity=".6"/>
  ${bone(sh[0], sh[1], el[0], el[1] - 4, 12, "humerus", "humerus (upper arm bone)")}
  ${bone(el[0] + front[0] * 3, el[1] + front[1] * 3, hand[0] + front[0] * 3, hand[1] + front[1] * 3, 6, "radius", "radius")}${bone(el[0] + back[0] * 4, el[1] + back[1] * 4, hand[0] + back[0] * 4, hand[1] + back[1] * 4, 6, "ulna", "ulna")}
  <circle ${P("joint", "elbow joint")} cx="${el[0]}" cy="${el[1]}" r="10" fill="#cfd8dc" stroke="#78909c" stroke-width="2"/>
  <circle cx="${hand[0]}" cy="${hand[1]}" r="13" fill="#ffcc99" stroke="#8a5a2e" stroke-width="2"/>
  ${muscle(t1, t2, tT, o.tCol || "#ef5350", "triceps", "triceps")}${muscle(b1, b2, bT, o.bCol || "#e57373", "biceps", "biceps")}
  <g ${P("tendon")}>${tend(bOri, b1)}${tend(b2, bIns)}${tend(tOri, t1)}${tend(t2, tIns)}</g>`;
  const labs = [["biceps", (b1[0] + b2[0]) / 2 + front[0] * bT * 0.5, (b1[1] + b2[1]) / 2 + front[1] * bT * 0.5, 210, 70, "biceps"], ["triceps", (t1[0] + t2[0]) / 2 + back[0] * tT * 0.5, (t1[1] + t2[1]) / 2, 8, 120, "triceps"],
    ["tendon", b2[0] + (bIns[0] - b2[0]) / 2, b2[1] + (bIns[1] - b2[1]) / 2, 210, 150, "tendon"], ["humerus", 80, 80, 8, 40, "humerus"], ["joint", el[0] - 8, el[1] + 4, 8, 196, "elbow joint"],
    ["radius", (el[0] + hand[0]) / 2 + front[0] * 4, (el[1] + hand[1]) / 2 + front[1] * 4, 210, bent ? 112 : 246, "radius"]];
  return svg(300, 290, inner + labelsSvg(labs, o), bent ? "An arm bending" : "A straight arm");
}
/* the arm machine: contract one muscle at a time and watch the forearm move */
export function ArmTool() {
  let angle = 90, bC = false, tC = false, raf = 0;
  const box = h("div", { class: "simbox" }), pic = h("div"), msg = h("div", { class: "verdict", style: "min-height:2.6em" }, "Tap a muscle button to make it contract (shorten and pull).");
  function paint() { pic.replaceChildren(armPic({ angle, labels: true, bThick: bC ? 26 : 10 + Math.max(0, (90 - angle) / 115) * 8, tThick: tC ? 24 : 12, bCol: bC ? "#d32f2f" : "#ef9a9a", tCol: tC ? "#d32f2f" : "#ef9a9a" })); }
  function animTo(target, then) { cancelAnimationFrame(raf); const step = () => { const dlt = target - angle; if (Math.abs(dlt) < 1) { angle = target; paint(); then && then(); return; } angle += Math.sign(dlt) * Math.min(Math.abs(dlt), 4); paint(); raf = requestAnimationFrame(step); }; step(); }
  const bb = h("button", { class: "btn primary", type: "button", onclick: () => { bC = true; tC = false; msg.className = "verdict good"; msg.innerHTML = "<b>Biceps contracts</b> and pulls on its tendon. The triceps relaxes. The arm <b>bends</b> at the elbow."; animTo(-25); } }, "💪 Contract the biceps");
  const tb = h("button", { class: "btn primary", type: "button", onclick: () => { tC = true; bC = false; msg.className = "verdict good"; msg.innerHTML = "<b>Triceps contracts</b> and pulls. The biceps relaxes. The arm <b>straightens</b>."; animTo(90); } }, "💪 Contract the triceps");
  const both = h("button", { class: "btn", type: "button", onclick: () => { bC = tC = true; paint(); msg.className = "verdict mid"; msg.innerHTML = "<b>Both pull at once:</b> a tug of war! The arm locks and can't move. One muscle must relax for the other to work."; } }, "Both at once?");
  paint(); box.append(pic, h("div", { class: "row" }, bb, tb, both), msg); return box;
}

/* ---------------- the pulse timer ---------------- */
export function PulseTool() {
  const box = h("div", { class: "simbox" }), clock = h("div", { class: "pulse-time" }, "15"), note = h("p", { class: "small", style: "text-align:center" }, "Put two fingers (not your thumb) on your wrist below your thumb, or on the side of your neck. Press Start and count the beats until the timer stops.");
  const inp = h("input", { class: "ans", type: "text", inputmode: "numeric", "aria-label": "Beats counted", style: "max-width:110px" }), out = h("div", { class: "verdict", style: "display:none" });
  let t = null;
  const start = h("button", { class: "btn primary", type: "button", onclick: () => { clearInterval(t); let s = 15; clock.textContent = s; start.disabled = true;
    t = setInterval(() => { s--; clock.textContent = s; if (s <= 0 || !box.isConnected) { clearInterval(t); clock.textContent = "Stop! 🛑"; start.disabled = false; start.textContent = "▶ Again"; try { navigator.vibrate && navigator.vibrate(200); } catch (e) {} } }, 1000); } }, "▶ Start 15 seconds");
  const calc = h("button", { class: "btn", type: "button", onclick: () => { const n = parseInt(inp.value, 10); if (!(n > 0 && n < 80)) { out.style.display = ""; out.className = "verdict mid"; out.textContent = "Type how many beats you counted in 15 seconds."; return; }
    out.style.display = ""; out.className = "verdict good"; out.innerHTML = `${n} beats in 15 seconds × 4 = <b>${n * 4} beats per minute</b>. A resting pulse for someone your age is usually about 60 to 100.`; } }, "Work out my pulse");
  box.append(note, clock, start, h("div", { class: "row" }, h("span", {}, "Beats I counted:"), inp, calc), out); return box;
}

/* a small picture card: an emoji and a caption, for everyday examples */
export function emojiPic(e, cap) { return h("div", { style: "text-align:center;font-size:3.2rem;line-height:1.1" }, e, cap ? h("div", { class: "small", style: "font-size:.95rem;font-weight:700" }, cap) : null); }
