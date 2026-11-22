/* The armoury: spaced review in Leitner boxes, across every subject.
   - Every mastered idea (a day with 3 stars) becomes cards: one "skill" card per question maker (fresh numbers every
     time), one "why" card (rotates through the day's why-questions) and one "think" card (its understanding questions).
   - A card sits in a box, shown as a metal: 1 bronze, 2 iron, 3 steel, 4 silver, 5 gold, 6 legendary.
     Right on his own moves it up a box and spaces the next review further out (1, 3, 7, 14, 30, 60 days).
     Right with help keeps the box and brings it back in half the gap. A first miss drops one box ("dented");
     a second miss in a row sends it back to bronze and marks it for the forge (a re-teach before it is asked again).
   - Each day's patrol is the cards that are due, lowest box and most overdue first, at most 8, at most 2 struggling.
   - Nothing here uses AI and nothing is ever taken away: stars, gold and forts are untouched.
   Save: S.cards = { id: { b, due, miss, dent, forge, n, t, log:[{t, r, q?}] } }, S.cardsV (1 once seeded),
         S.patrol = { d, ids, i, again, res, fin, skip }.
   Card ids: "<topic key>|g<maker index>", "<topic key>|why", "<topic key>|uq". */
import { PACKS } from "../packs/index.js";

export const GAP = [0, 1, 3, 7, 14, 30, 60];
export const METALS = [
  { n: "Forge", e: "🔥", c: "forge" }, { n: "Bronze", e: "🥉", c: "bronze" }, { n: "Iron", e: "⚙️", c: "iron" }, { n: "Steel", e: "🔩", c: "steel" },
  { n: "Silver", e: "🥈", c: "silver" }, { n: "Gold", e: "🥇", c: "gold" }, { n: "Legendary", e: "🌟", c: "legend" },
];
export const CAP = 8, MAX_STRUGGLING = 2;
const KIND_NAME = { skill: "Sword", why: "Shield", uq: "Bow" }, KIND_ICON = { skill: "⚔️", why: "🛡️", uq: "🏹" };

/* local calendar dates (Oliver's own day, not UTC) */
export const ymd = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const addDays = (s, n) => { const [y, m, d] = s.split("-").map(Number); return ymd(new Date(y, m - 1, d + n)); };
const daysBetween = (a, b) => { const [y1, m1, d1] = a.split("-").map(Number), [y2, m2, d2] = b.split("-").map(Number); return Math.round((new Date(y2, m2 - 1, d2) - new Date(y1, m1 - 1, d1)) / 864e5); };
const plain = s => String(s || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

export function createCards(getS, commit, prog) {
  const S = () => getS();
  const today = () => ymd();

  /* ---- the catalogue: every possible card, for every pack ---- */
  const cat = new Map();          // id -> { id, kind, key, pack, t, i? }
  const byTopic = new Map();      // topic key -> [card defs]
  PACKS.forEach(pack => pack.topics.forEach(t => {
    if (t.kind) return;           // investigations and the practice exam have their own scoring
    const key = (pack.keyPrefix || "") + t.id, list = [];
    (t.gen || []).forEach((g, i) => list.push({ id: `${key}|g${i}`, kind: "skill", key, pack, t, i }));
    if ((t.checks || []).length) list.push({ id: `${key}|why`, kind: "why", key, pack, t });
    if (((pack.understanding || {})[t.id] || []).length) list.push({ id: `${key}|uq`, kind: "uq", key, pack, t });
    list.forEach(c => cat.set(c.id, c)); if (list.length) byTopic.set(key, list);
  }));
  const def = id => cat.get(id);
  const C = () => S().cards || (S().cards = {});
  const rec = id => C()[id];
  const stars = key => (S().lv[key] && S().lv[key].stars) || 0;
  const cardsOf = key => (byTopic.get(key) || []).filter(d => rec(d.id));
  const nameOf = d => { const n = (byTopic.get(d.key) || []).filter(x => x.kind === "skill").length; return `${KIND_NAME[d.kind]} of ${d.t.short}${d.kind === "skill" && n > 1 ? " " + (d.i + 1) : ""}`; };
  const iconOf = d => KIND_ICON[d.kind];

  /* ---- new cards: a day's cards join the armoury once it has 3 stars ---- */
  function ensure() {
    const c = C(), t0 = today(); let added = 0;
    if (!S().cardsV) return seed();
    byTopic.forEach((list, key) => { if (stars(key) < 3) return; list.forEach(d => { if (!c[d.id]) { c[d.id] = { b: 1, due: addDays(t0, 1), miss: 0, n: 0, t: 0, log: [] }; added++; } }); });
    if (added) commit();
    return added;
  }
  /* the first time: his existing progress decides where each card starts, and the first reviews are spread over 10 days */
  function seed() {
    const c = C(), t0 = today(), H = S().hist || {}, last = S().last || {}, out = [];
    const keys = [...byTopic.keys()].filter(k => stars(k) >= 3).sort((a, b) => (last[a] || 0) - (last[b] || 0));
    keys.forEach(key => {
      const h = (H[key] || []).slice(-3), old = !last[key] || Date.now() - last[key] > 7 * 864e5;
      const rep = !!(S().repair || {})[key];
      const b = rep ? 1 : h.length === 3 && h.every(x => x.r === "own") && old ? 3 : 2;
      byTopic.get(key).forEach(d => { if (!c[d.id]) { c[d.id] = { b, due: t0, miss: rep ? 2 : 0, dent: rep, forge: rep, n: 0, t: 0, log: [] }; out.push(d.id); } });
    });
    out.forEach((id, i) => { c[id].due = addDays(t0, Math.min(9, Math.floor(i * 10 / Math.max(out.length, 1)))); });
    S().cardsV = 1; commit();
    return out.length;
  }

  /* ---- answering ---- */
  const kindOf = r => r === "own" || r === "first" ? "right" : r === "wrong" ? "wrong" : "helped";
  /* r: own | first | help | steps | second | wrong.  o.retry: the second chance at the end of a patrol (logged, never moves the card) */
  /* o.conf (optional, for a confidence tap): "sure" | "think" | "guess". A guessed right answer counts as helped
     (it doesn't move the card up); a sure but wrong answer is flagged in the log ("surprise": the best ones to fix). */
  function answer(id, r, o = {}) {
    const c = rec(id); if (!c) return null;
    const before = c.b, t0 = today(); let k = kindOf(r);
    if (k === "right" && o.conf === "guess") k = "helped";
    c.n = (c.n || 0) + 1; c.t = Date.now();
    c.log = (c.log || []).concat([{ t: c.t, r: k, ...(o.conf ? { conf: o.conf } : {}), ...(k === "wrong" && o.conf === "sure" ? { surprise: true } : {}), ...(k === "wrong" && o.q ? { q: plain(o.q).slice(0, 160) } : {}) }]).slice(-8);
    if (!o.retry) {
      if (k === "right") { c.b = Math.min(6, c.b + 1); c.miss = 0; c.dent = false; c.forge = false; c.due = addDays(t0, GAP[c.b]); }
      else if (k === "helped") { c.due = addDays(t0, Math.max(1, Math.floor(GAP[c.b] / 2))); }
      else { c.miss = (c.miss || 0) + 1; c.dent = true; if (c.miss >= 2) { c.b = 1; c.forge = true; } else c.b = Math.max(1, c.b - 1); c.due = addDays(t0, 1); }
    }
    commit();
    return { before, after: c.b, k };
  }

  /* ---- what is due ---- */
  const struggling = c => (c.miss || 0) >= 2 || (c.log || []).filter(x => x.r === "wrong" && Date.now() - x.t < 14 * 864e5).length >= 2;
  function dueList(day = today()) {
    return Object.keys(C()).filter(id => def(id) && C()[id].due <= day)
      .sort((a, b) => C()[a].b - C()[b].b || (C()[a].due < C()[b].due ? -1 : C()[a].due > C()[b].due ? 1 : 0));
  }
  /* today's patrol: at most CAP cards, at most MAX_STRUGGLING struggling ones, and never two from the same day side by side */
  function pickPatrol() {
    const out = []; let hard = 0;
    for (const id of dueList()) { if (out.length >= CAP) break; const s = struggling(C()[id]); if (s && hard >= MAX_STRUGGLING) continue; if (s) hard++; out.push(id); }
    return spread(out);
  }
  function spread(ids) {
    const left = ids.slice(), res = [];
    while (left.length) { const prev = res.length ? def(res[res.length - 1]).key : null; let j = left.findIndex(id => def(id).key !== prev); if (j < 0) j = 0; res.push(left.splice(j, 1)[0]); }
    return res;
  }
  /* today's patrol, kept in the save so a reload carries on where he was */
  function patrol() {
    const t0 = today(), P = S().patrol;
    if (P && P.d === t0) return P;
    const ids = pickPatrol();
    S().patrol = { d: t0, ids, i: 0, again: [], res: {}, fin: !ids.length, skip: false }; commit();
    return S().patrol;
  }
  const patrolWaiting = () => { ensure(); const P = patrol(); return !P.fin && !P.skip && P.ids.length ? P.ids.length - Math.min(P.i, P.ids.length) + (P.again || []).length : 0; };

  /* night patrol runes: due skill cards from other mastered days of this pack */
  function nightPicks(key, pack, n) {
    const pre = pack.keyPrefix || "", out = [];
    for (const id of dueList(addDays(today(), 1))) { const d = def(id); if (d.kind !== "skill" || d.pack !== pack || d.key === key || out.some(x => x.key === d.key)) continue; out.push({ id, key: d.key, maker: d.t.gen[d.i] }); if (out.length >= n) break; }
    return out;
  }

  /* ---- an idea's state (one day of a subject) ---- */
  /* "ahead" (not started), "learning" (started, not 3 stars), "struggling", "dented" (a miss in the last 14 days),
     "secure" (every card silver or better), "growing" */
  function idea(key) {
    const st = stars(key), rep = !!(S().repair || {})[key];
    if (st < 3) return { s: S().learnDone[key] || st > 0 || rep ? (rep ? "struggling" : "learning") : "ahead", cards: [] };
    const cs = cardsOf(key), rs = cs.map(d => rec(d.id));
    if (rep || rs.some(struggling)) return { s: "struggling", cards: cs };
    if (rs.some(c => c.dent && (c.log || []).some(x => x.r === "wrong" && Date.now() - x.t < 14 * 864e5))) return { s: "dented", cards: cs };
    if (rs.length && rs.every(c => c.b >= 4)) return { s: "secure", cards: cs };
    return { s: "growing", cards: cs };
  }
  const minBox = key => { const rs = cardsOf(key).map(d => rec(d.id).b); return rs.length ? Math.min(...rs) : 0; };
  const avgBox = key => { const rs = cardsOf(key).map(d => rec(d.id).b); return rs.length ? rs.reduce((a, b) => a + b, 0) / rs.length : 0; };
  /* the next 7 days of reviews (anything overdue counts as today) */
  function week() { const t0 = today(); return Array.from({ length: 7 }, (_, i) => { const d = addDays(t0, i); return { d, n: Object.values(C()).filter(c => i ? c.due === d : c.due <= d).length }; }); }

  return { cat, byTopic, def, rec, cardsOf, nameOf, iconOf, ensure, seed, answer, dueList, pickPatrol, patrol, patrolWaiting, nightPicks, idea, struggling, minBox, avgBox, week, today, daysBetween };
}
