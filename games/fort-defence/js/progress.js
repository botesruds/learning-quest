/* Mastery and progress: the same rules as Algebra Quest, for every content pack.
   - A topic has 3 stars: 1 = lesson + 3 stepped questions, 2 = 3 right on your own before 3 misses, 3 = 3 of 4 why-questions.
   - The road runs through each pack's regions: scout report (never blocks), topics, then the region's demon lord.
   - The next topic opens only when the one before has 3 stars (or the parent opened the region, or unlocked everything).
   - Demon-lord misses mark topics for repair; repairs come first, and every repair must pass before a rematch.
   Topic keys are the pack's keyPrefix + the topic id, so Algebra Quest's saves ("1".."23") carry straight over. */
import { PACKS, activePack } from "../packs/index.js";

const BASE_BADGES = [
  { k: "star1", e: "⭐", n: "First Star", d: "Earn your first star" },
  { k: "perfect", e: "🎯", n: "Perfect Challenge", d: "3 in a row on your own, no misses" },
  { k: "fire", e: "🔥", n: "On Fire", d: "Play 3 days in a row" },
];

export function createProgress(getS, commit, pack0 = activePack()) {
  const S = () => getS();
  const today = () => new Date().toISOString().slice(0, 10);

  /* ---- topics and the road ---- */
  const topics = new Map();        // key -> { key, pack, region, t (the pack's topic object) }
  const road = [];                 // { t:"chest"|"level"|"lord"|"final", pack, region, key? }
  const regions = [];              // { pack, r (region object), key (e.g. "algebra-u3:1") }
  // only the subject being played is on the road; every pack's topics can still be looked up
  [pack0].forEach(pack => {
    const byId = new Map(pack.topics.map(t => [t.id, t]));
    pack.regions.forEach(r => {
      regions.push({ pack, r, key: pack.id + ":" + r.n });
      if (pack.previews && pack.previews[r.n]) road.push({ t: "chest", pack, region: r });
      r.topics.forEach(id => { const key = (pack.keyPrefix || "") + id; topics.set(key, { key, pack, region: r, t: byId.get(id) }); road.push({ t: "level", pack, region: r, key }); });
      if (r.lord) road.push({ t: "lord", pack, region: r });
      if (r.final) road.push({ t: "final", pack, region: r });
    });
    // topics that are not on the road (like the practice exam) can still be looked up
    pack.topics.forEach(t => { const key = (pack.keyPrefix || "") + t.id; if (!topics.has(key)) topics.set(key, { key, pack, region: null, t }); });
  });
  PACKS.filter(p => p !== pack0).forEach(pack => pack.topics.forEach(t => { const key = (pack.keyPrefix || "") + t.id; if (!topics.has(key)) topics.set(key, { key, pack, region: null, t }); }));
  const topic = key => topics.get(String(key));
  const keyOf = (pack, id) => (pack.keyPrefix || "") + id;
  const regionOf = key => topic(key) && topic(key).region;
  const chestKey = (pack, r) => (pack.keyPrefix || "") + r.n;
  const lordKey = (pack, r) => (pack.keyPrefix || "") + r.n;
  const finalKey = pack => (pack.keyPrefix || "") + "final";     // Algebra Quest's stays "final"
  const bossKey = n => n.t === "final" ? finalKey(n.pack) : lordKey(n.pack, n.region);

  /* ---- stars ---- */
  const L = key => S().lv[key] || (S().lv[key] = { stars: 0, train: false });
  const stars = key => (S().lv[key] && S().lv[key].stars) || 0;
  const mastered = key => stars(key) >= 3 && !S().repair[key];
  const masteredCount = () => Object.keys(S().lv).filter(k => stars(k) >= 3).length;
  const totalStars = () => Object.values(S().lv).reduce((a, l) => a + (l.stars || 0), 0);
  function giveStars(key, n) {
    const l = L(key), before = l.stars || 0;
    if (n <= before) { commit(); return 0; }
    l.stars = n; S().gold += 20 * (n - before); commit();
    return n - before;
  }

  /* ---- the road ---- */
  function nodeDone(n) {
    if (n.t === "chest") return !!S().chests[chestKey(n.pack, n.region)];
    if (n.t === "level") return stars(n.key) >= 3;
    if (n.t === "lord") { const b = S().bosses[lordKey(n.pack, n.region)]; return !!(b && b.won); }
    if (n.t === "final") { const b = S().bosses[finalKey(n.pack)]; return !!(b && b.won); }
  }
  function nodeOpen(n) {
    if (n.t === "chest") return true;
    if (S().unlockAll || S().classNow[chestKey(n.pack, n.region)]) return true;
    const i = road.indexOf(n);
    for (let j = i - 1; j >= 0; j--) { if (road[j].t === "chest") continue; return nodeDone(road[j]); }
    return true;
  }
  const lordReady = (pack, r) => r.topics.every(id => !S().repair[keyOf(pack, id)]);
  /* tower tasks: before a demon lord (or the final boss) can be fought, the Library dispatches and the Scribe's
     royal reports for the days since the last boss must be done. Never blocks a single day, only the boss.
     Bosses already fought, or already open when this rule arrived (S.towerFree), are never held back. */
  function bossDays(n) {
    const i = road.indexOf(n), keys = [];
    for (let j = i - 1; j >= 0; j--) { const m = road[j]; if (m.t === "lord" || m.t === "final") break; if (m.t === "level") keys.push(m.key); }
    return keys.reverse();
  }
  function towerTodo(n) {
    if (!n || (n.t !== "lord" && n.t !== "final") || S().unlockAll) return [];
    const bk = bossKey(n); if (S().bosses[bk] || (S().towerFree && S().towerFree[bk])) return [];
    const days = new Set(bossDays(n)), out = [], P = n.pack;
    const rd = (S().lib && S().lib.rd) || {}, rp = (S().wr && S().wr.rp) || {};
    ((P.reading && P.reading.dispatches) || []).forEach(d => { const k = keyOf(P, d.day); if (days.has(k) && !(rd[k] && rd[k].done)) out.push({ kind: "read", key: k }); });
    ((P.writing && P.writing.reports) || []).forEach(r => { const k = keyOf(P, r.day); if (days.has(k) && !(rp[k] && rp[k].done)) out.push({ kind: "write", key: k }); });
    return out;
  }
  /* once per save: bosses that were already open when the tower rule arrived stay free, so nothing he has open locks */
  function towerMigrate() {
    const g = S().towerGate = S().towerGate || {}; if (g[pack0.id]) return; S().towerFree = S().towerFree || {};
    road.forEach(n => { if ((n.t === "lord" || n.t === "final") && nodeOpen(n) && towerTodo(n).length) S().towerFree[bossKey(n)] = true; });
    g[pack0.id] = 1;
  }
  function currentNode() {
    const rep = Object.keys(S().repair).filter(k => S().repair[k] && road.some(n => n.key === k)).sort((a, b) => road.findIndex(n => n.key === a) - road.findIndex(n => n.key === b))[0];
    if (rep) return { ...road.find(n => n.key === rep), repair: true };
    return road.find(n => n.t !== "chest" && nodeOpen(n) && !nodeDone(n)) || road[road.length - 1];
  }
  /* which step of a topic comes next (same order as Algebra Quest) */
  function nextPhase(key) {
    const T = topic(key).t, l = L(key);
    if (S().repair[key]) return "challenge";
    if (!S().learnDone[key]) return "learn";
    if (T.kind === "invest") return l.stars >= 3 ? "done" : "invest";
    if (!l.train) return "train";
    if (l.stars < 2) return "challenge";
    if (l.stars < 3) return "brain";
    return "done";
  }
  /* the day number shown to Oliver: the topic's place in its pack */
  const dayNo = key => { const tp = topic(key); return tp ? tp.pack.topics.filter(t => !t.kind || t.kind !== "exam").findIndex(t => t.id === tp.t.id) + 1 : 0; };

  /* ---- answers and streaks ---- */
  /* o.conf (optional): the confidence tap, "sure" | "think" | "guess", kept with the answer */
  function record(key, r, o) {
    key = String(key);
    const a = S().hist[key] || (S().hist[key] = []); a.push(o && o.conf ? { r, t: Date.now(), conf: o.conf } : { r, t: Date.now() }); if (a.length > 40) a.splice(0, a.length - 40);
    S().last[key] = Date.now();
    const d = today(); if (!S().days.includes(d)) { S().days.push(d); if (S().days.length > 60) S().days.shift(); }
    commit();
  }
  function streak() { let n = 0; const d = new Date(); for (;;) { const k = d.toISOString().slice(0, 10); if (S().days.includes(k)) { n++; d.setDate(d.getDate() - 1); } else break; } return n; }

  /* ---- badges ---- */
  const allBadges = () => BASE_BADGES.concat(...PACKS.map(p => p.badges || []));
  function award(k) { if (S().badges[k]) return null; const b = allBadges().find(x => x.k === k); if (!b) return null; S().badges[k] = Date.now(); S().gold += 30; commit(); return b; }
  function checkBadges() {
    const got = [];
    if (totalStars() > 0) got.push(award("star1"));
    PACKS.forEach(p => (p.badges || []).forEach(b => { const m = /^(?:[a-z0-9]+:)?l(\d+)$/.exec(b.k); if (m && stars(keyOf(p, m[1])) >= 3) got.push(award(b.k)); }));
    if (streak() >= 3) got.push(award("fire"));
    return got.filter(Boolean);
  }

  return { pack: pack0, finalKey, bossKey, road, regions, topics, topic, keyOf, regionOf, chestKey, lordKey, L, stars, mastered, masteredCount, totalStars, giveStars,
    nodeDone, nodeOpen, lordReady, towerTodo, towerMigrate, bossDays, currentNode, nextPhase, dayNo, record, streak, award, checkBadges, allBadges };
}
