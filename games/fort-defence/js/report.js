/* Report cards.
   - Oliver's "My Quest Report": one screen per subject. Every day is its "I can" statement with a traffic light:
       green  "I can do this"  (3 stars, no recent dents; a ★ once every card is silver or better)
       amber  "Getting there"  (started, or a card dented in the last 2 weeks)
       red    "Needs practice" (struggling: a card missed twice in a row, or twice in 2 weeks, or a demon-lord repair)
       grey   "Coming up"      (not started; shown so he can see what is ahead)
     At most 2 red rows show at once; any more show amber to him (the grown-up view shows the truth).
     One strength and one next step at the top, and the only button is "Practise now" on red and amber rows.
   - The grown-up view ("What he knows"): the same rows with the cards' metals and dates, statements covered,
     what is coming up next (prior knowledge for class), the next 7 days of reviews, and the sticking points
     with the exact questions he missed. Nothing here needs to know where his class is. */
import { h, esc } from "./qcore.js";
import { PACKS } from "../packs/index.js";
import { METALS, CAP } from "./cards.js";
import { sfx } from "./audio.js";
import { RUNGS, Ladder, peekCrit, CRIT_WORDS } from "./expedition.js";

const LIGHT = {
  green: { w: "I can do this", c: "good" }, amber: { w: "Getting there", c: "warn" }, red: { w: "Needs practice", c: "bad" }, grey: { w: "Coming up", c: "grey" },
};
const cap = s => s[0].toUpperCase() + s.slice(1);
const when = t => new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
const whenD = s => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); };

export function createReport({ save, prog, cards, day, patrol, toast }) {
  const S = () => save.state;
  const kp = (pack, id) => (pack.keyPrefix || "") + id;
  const stars = key => (S().lv[key] && S().lv[key].stars) || 0;
  const packs = () => PACKS;

  /* the rows of one subject, in school order, with each idea's true state */
  function rows(pack) {
    const out = [];
    pack.regions.forEach(r => {
      r.topics.forEach(id => {
        const key = kp(pack, id), t = pack.topics.find(x => x.id === id); if (!t) return;
        const I = t.kind ? { s: stars(key) >= 3 ? "growing" : stars(key) || S().learnDone[key] ? "learning" : "ahead", cards: [] } : cards.idea(key);
        out.push({ key, t, region: r, idea: I, can: (pack.can || {})[id] || t.title });
      });
      const lord = r.lord || r.final; if (lord) { const b = S().bosses[r.final ? kp(pack, "final") : kp(pack, r.n)]; out.push({ lord, region: r, fin: !!r.final, b }); }
    });
    return out;
  }
  const trueLight = s => s === "ahead" ? "grey" : s === "struggling" ? "red" : s === "learning" || s === "dented" ? "amber" : "green";
  /* where he is in a subject: the first day without 3 stars (the game's own road for the subject being played) */
  function hereKey(pack) {
    if (pack === prog.pack) { const n = prog.currentNode(); return n && n.key ? n.key : null; }
    for (const r of pack.regions) for (const id of r.topics) if (stars(kp(pack, id)) < 3) return kp(pack, id);
    return null;
  }

  /* one day's statement and light, for other views (e.g. the valley): { can, light, word } or null.
     Oliver's view by default (at most 2 reds per subject); o.grown for the true light. */
  function lightOf(key, o = {}) {
    for (const pack of PACKS) {
      const R = rows(pack).filter(x => x.key), x = R.find(r => r.key === key); if (!x) continue;
      const reds = R.filter(r => r.idea.s === "struggling").sort((a, b) => cards.minBox(a.key) - cards.minBox(b.key)).slice(0, 2).map(r => r.key);
      let L = trueLight(x.idea.s); if (L === "red" && !o.grown && !reds.includes(key)) L = "amber";
      return { can: x.can, light: L, word: LIGHT[L].w };
    }
    return null;
  }

  /* ---------- the four criteria (A B C D) ----------
     A comes from the unit's day lights; B, C and D from that criterion's Expedition (best rung). No Expedition yet = Coming up. */
  function critCells(pack, days, light) {
    const exps = {}; pack.topics.forEach(t => { if (t.exp) exps[t.exp.crit] = { t, key: kp(pack, t.id), spec: t.exp }; });
    return ["A", "B", "C", "D"].map(L => {
      const w = pack.criteria[L];
      if (L === "A") {
        const lit = days.filter(x => !x.t.exp && !x.t.kind).map(light).filter(l => l !== "grey");
        const c = !lit.length ? "grey" : lit.filter(l => l === "red").length >= 2 ? "red" : lit.filter(l => l === "green").length * 3 >= lit.length * 2 ? "green" : "amber";
        return { L, w, light: c, s: LIGHT[c].w };
      }
      const e = exps[L]; if (!e) return { L, w, light: "grey", s: "Coming up", soon: true };
      const c = peekCrit(S(), e.key);
      if (!c || c.best < 0) return stars(e.key) >= 3 ? { L, w, light: "green", s: LIGHT.green.w, e } : stars(e.key) || S().learnDone[e.key] ? { L, w, light: "amber", s: LIGHT.amber.w, e } : { L, w, light: "grey", s: "Coming up", e };
      const lt = c.best >= 2 ? "green" : c.best === 1 ? "amber" : "red";
      return { L, w, light: lt, s: "Rung " + RUNGS[c.best] + (c.best === 3 ? " 👑" : ""), e, c };
    });
  }
  function critStrip(pack, cells, o) {
    return h("div", { class: "card stack rp-critcard" }, h("div", { class: "eyebrow" }, "How I'm doing on the four criteria"),
      h("div", { class: "rp-crit" }, ...cells.map(x => h("button", { class: "rp-cl l-" + x.light, type: "button", "data-crit": x.L, onclick: () => { sfx("click");
        if (x.soon) return toast("Coming soon: a new Expedition for this criterion.");
        if (x.L === "A") return toast("A is knowing and using the ideas: every day's light below.");
        openCrit(pack, x, o); } },
        h("b", { class: "L" }, x.L), h("span", { class: "rp-dot " + LIGHT[x.light].c }), h("span", { class: "w" }, x.w), h("span", { class: "s" }, x.s)))));
  }
  function openCrit(pack, x, o) {
    const k = day.kit(), spec = x.e.spec, best = x.c ? x.c.best : -1;
    const node = prog.road.find(n => n.key === x.e.key);
    const go = pack !== prog.pack ? () => toast(`Open ${pack.subject} from the home page to play this Expedition.`)
      : node && (prog.nodeOpen(node) || prog.nodeDone(node)) ? () => day.open(x.e.key, prog.nextPhase(x.e.key) === "done" ? { ph: "exp" } : {})
        : () => toast("This Expedition opens when you reach it on the quest map.");
    k.head([h("div", { class: "row", style: "justify-content:space-between;align-items:center" }, h("div", {}, h("div", { class: "eyebrow" }, `Criterion ${x.L} · ${spec.critName}`), h("h2", {}, spec.kid)),
      h("button", { class: "btn small", type: "button", onclick: () => { sfx("click"); openReport(pack, o); } }, "◂ My report"))]);
    k.set(h("div", { class: "stack" }, h("div", { class: "card stack" },
      best >= 0 ? Ladder(spec, best, { mine: false }) : h("p", {}, "You haven't tried this Expedition yet. Here's the ladder your teacher uses:"),
      best < 0 ? Ladder(spec, -1) : null,
      h("button", { class: "bigbtn go", type: "button", onclick: () => { sfx("click"); go(); } }, "Practise now ▸"))));
  }

  /* ---------- Oliver's report ---------- */
  function openReport(pack = prog.pack, o = {}) {
    cards.ensure(); const k = day.kit(); const grown = !!o.grown;
    const R = rows(pack), days = R.filter(x => x.key), here = hereKey(pack);
    // Oliver sees at most 2 reds: the most stuck first
    const reds = days.filter(x => x.idea.s === "struggling").sort((a, b) => cards.minBox(a.key) - cards.minBox(b.key)).slice(0, 2).map(x => x.key);
    const light = x => { const L = trueLight(x.idea.s); return L === "red" && !grown && !reds.includes(x.key) ? "amber" : L; };
    const done = days.filter(x => stars(x.key) >= 3).length;
    const mastered = days.filter(x => x.idea.cards.length);
    const best = mastered.slice().sort((a, b) => cards.avgBox(b.key) - cards.avgBox(a.key))[0];
    const nextUp = days.find(x => light(x) === "red") || days.find(x => x.idea.s === "dented") || days.find(x => x.key === here);
    const nWeapons = days.reduce((a, x) => a + x.idea.cards.length, 0);
    const subjects = packs().length > 1 ? h("div", { class: "row rp-subj", style: "gap:6px;flex-wrap:wrap" }, ...packs().map(p => h("button", { class: "btn small" + (p === pack ? " primary" : ""), type: "button", onclick: () => { sfx("click"); openReport(p, o); } }, p.subject))) : null;
    k.head([h("div", { class: "row", style: "justify-content:space-between;align-items:center" }, h("div", {}, h("div", { class: "eyebrow" }, grown ? "⚙️ For grown-ups" : pack.unit), h("h2", {}, grown ? `What he knows: ${pack.subject}` : `📊 My Quest Report: ${pack.subject}`)),
      grown ? h("button", { class: "btn small", type: "button", onclick: () => { sfx("click"); day.openParent(); } }, "◂ Parent corner") : k.closeBtn()), subjects]);
    const bar = h("div", { class: "rp-bar" }, h("i", { style: `width:${Math.round(100 * done / Math.max(days.length, 1))}%` }));
    const top = h("div", { class: "card stack rp-top" },
      h("div", { class: "row", style: "gap:12px;align-items:center;flex-wrap:wrap" }, h("b", {}, `Days done: ${done} of ${days.length}`), bar, h("span", {}, `⚔️ Ideas in the armoury: ${nWeapons}`)),
      h("p", { class: "rp-fb" }, "💪 ", h("b", {}, "Strongest: "), best ? `${best.t.short} (${METALS[cards.minBox(best.key)].n.toLowerCase()})` : "master your first day to forge a weapon!"),
      h("p", { class: "rp-fb" }, "🎯 ", h("b", {}, "Practise next: "), nextUp ? nextUp.t.short : "nothing! Every idea is sharp."));
    const practise = x => {
      if (x.idea.cards.length) return () => patrol.practiseIdea(x.key, { label: "📊 Back to my report", go: () => openReport(pack, o) });
      if (pack !== prog.pack) return () => toast(`Open ${pack.subject} from the home page to play this day.`);
      if (x.key !== here && !prog.nodeOpen(prog.road.find(n => n.key === x.key) || {})) return null;
      return () => day.open(x.key);
    };
    const list = [];
    let lastRegion = null;
    R.forEach(x => {
      if (x.region !== lastRegion) { lastRegion = x.region; list.push(h("h3", { class: "rp-land" }, `${x.region.emoji} ${x.region.name}`)); }
      if (x.lord) { list.push(h("div", { class: "rp-row lord" }, h("span", { class: "rp-dot " + (x.b && x.b.won ? "good" : "grey") }), h("span", { class: "rp-can" }, `${x.fin ? "🐉" : "👹"} ${cap(x.lord.name)}${x.fin ? " (practice test)" : ""}`), h("span", { class: "rp-st" }, x.b ? (x.b.won ? "Beaten!" : `Best: ${x.b.best} hits`) : "Coming up"))); return; }
      const L = light(x), act = (L === "red" || L === "amber") ? practise(x) : null, secure = x.idea.s === "secure";
      const row = h("div", { class: "rp-row l-" + L + (x.key === here ? " here" : "") },
        h("span", { class: "rp-dot " + LIGHT[L].c, "aria-hidden": "true" }),
        h("div", { class: "rp-can" }, h("div", {}, x.can, x.key === here ? h("span", { class: "rp-here" }, " · You are here") : null),
          grown ? h("div", { class: "small muted" }, detail(x)) : null),
        h("span", { class: "rp-st" }, LIGHT[L].w + (L === "green" && secure ? " ★" : "")),
        act ? h("button", { class: "btn small primary rp-go", type: "button", onclick: () => { sfx("click"); act(); } }, "Practise now") : null);
      list.push(row);
    });
    const parts = [top, h("div", { class: "stack rp-list" }, ...list)];
    const cells = pack.criteria ? critCells(pack, days, light) : null;
    if (cells) parts.splice(1, 0, critStrip(pack, cells, o));
    if (cells && grown) parts.push(critGrown(pack, cells));
    if (grown) parts.splice(1, 0, ...grownCards(pack, R, days));
    else parts.push(h("div", { class: "row", style: "gap:8px;justify-content:center;flex-wrap:wrap" }, h("button", { class: "btn", type: "button", onclick: () => { sfx("click"); patrol.openArmoury(); } }, "⚔️ My armoury")));
    k.set(h("div", { class: "stack rp" + (grown ? " grown" : "") }, ...parts));
    window.__fdr = { pack: pack.id, grown, lights: Object.fromEntries(days.map(x => [x.key, light(x)])), crit: cells ? Object.fromEntries(cells.map(x => [x.L, x.light + "|" + x.s])) : null };
  }

  /* the grown-up lines for the four criteria: band, parts on his own and with help, his write-up */
  function critGrown(pack, cells) {
    const names = CRIT_WORDS[pack.subject] || {};
    return h("div", { class: "card small stack rp-critgrown" }, h("b", {}, "The four criteria (practice bands)"),
      ...cells.map(x => {
        const head = `${x.L}, ${names[x.L] || x.w}: `;
        if (x.L === "A") return h("p", {}, head + `from the day lights below (${LIGHT[x.light].w.toLowerCase()}).`);
        if (x.soon) return h("p", { class: "muted" }, head + "no Expedition yet (coming in a later stage).");
        if (!x.c || x.c.best < 0) return h("p", {}, head + (stars(x.e.key) >= 3 ? "mastered under the old investigation; no Expedition round yet." : "not tried yet."));
        const P = x.c.parts || {}, nm = k => (x.e.spec.partNames || {})[k] || k;
        const own = Object.keys(P).filter(k => P[k] === "own").map(nm), help = Object.keys(P).filter(k => P[k] !== "own").map(nm);
        return h("div", {}, h("p", {}, h("b", {}, head + `band ${RUNGS[x.c.best]}`), ` (${when(x.c.at)}, round ${x.c.round || "?"}). On his own: ${own.join(", ") || "none"}. With help: ${help.join(", ") || "none"}.`),
          x.c.text ? h("details", {}, h("summary", {}, "His write-up"), h("div", { class: "why", style: "white-space:pre-line" }, x.c.text)) : null);
      }),
      h("p", { class: "small muted" }, "Practice bands from Fort Defence, not school marks."));
  }

  /* one line of detail for grown-ups: each card's metal, when he last practised, when it comes back */
  function detail(x) {
    const cs = x.idea.cards.map(d => cards.rec(d.id));
    const last = S().last[x.key];
    if (!cs.length) return x.idea.s === "ahead" ? "Not started" : `${"⭐".repeat(stars(x.key)) || "Started"}${last ? " · last practised " + when(last) : ""}`;
    const due = cs.map(c => c.due).sort()[0];
    return `${cs.map(c => METALS[c.b].e).join(" ")} · ${last ? "last practised " + when(last) + " · " : ""}next review ${whenD(due)}`;
  }

  function grownCards(pack, R, days) {
    const covered = days.filter(x => stars(x.key) >= 3).length, ahead = days.filter(x => stars(x.key) < 3);
    const wk = cards.week();
    const stuck = days.filter(x => x.idea.s === "struggling" || x.idea.s === "dented").slice(0, 5);
    const how = h("div", { class: "card small stack" }, h("b", {}, "How to read this"),
      h("p", {}, "Green: mastered (3 stars) with no recent misses; ★ when every review card is silver or better. Amber: started, or a review missed in the last 2 weeks. Red: struggling (a card missed twice in a row, or twice in 2 weeks, or a demon-lord repair). Grey: coming up."),
      h("p", {}, "Oliver sees the same report, except that he never sees more than 2 red rows at once (the rest show amber to him)."),
      h("p", {}, "Metals show each review card's box: 🥉 1 day, ⚙️ 3 days, 🔩 1 week, 🥈 2 weeks, 🥇 1 month, 🌟 2 months."));
    const cov = h("div", { class: "card small stack" }, h("b", {}, `Covered: ${covered} of ${days.length} statements`),
      ahead.length ? h("div", {}, h("p", { class: "small muted" }, "Coming up next (the prior knowledge he will take into class):"), h("ul", {}, ...ahead.slice(0, 3).map(x => h("li", {}, x.can)))) : h("p", {}, "Every statement in this unit is mastered."));
    const max = Math.max(CAP, ...wk.map(w => w.n));
    const week = h("div", { class: "card small stack" }, h("b", {}, "Reviews due, next 7 days (all subjects)"),
      h("div", { class: "rp-week" }, ...wk.map((w, i) => h("div", { class: "rp-wd" }, h("div", { class: "rp-wbar" }, h("i", { style: `height:${Math.round(100 * Math.min(w.n, max) / max)}%` })), h("b", {}, String(w.n)), h("span", { class: "small muted" }, i ? whenD(w.d).split(" ")[0] : "Today")))),
      h("p", { class: "small muted" }, wk[0].n > CAP * 3 ? `⚠️ ${wk[0].n} cards are waiting, more than 3 days of patrols (${CAP} a day). Nothing is lost, but they are coming back later than planned.` : `A patrol takes up to ${CAP} cards a day; the rest wait their turn.`));
    const st = h("div", { class: "card small stack" }, h("b", {}, "Sticking points"),
      stuck.length ? h("div", { class: "stack" }, ...stuck.map(x => { const miss = x.idea.cards.flatMap(d => (cards.rec(d.id).log || []).filter(l => l.r === "wrong" && l.q).map(l => l)).sort((a, b) => b.t - a.t).slice(0, 3);
        return h("div", {}, h("b", {}, `Day ${prog.dayNo(x.key)}: ${x.t.title}`), miss.length ? h("ul", { class: "small" }, ...miss.map(l => h("li", {}, `${when(l.t)}: missed "${l.q}"`))) : h("p", { class: "small muted" }, "Marked for repair by a demon lord.")); }))
        : h("p", { class: "small muted" }, "Nothing is stuck right now."));
    return [how, cov, st, week];
  }

  return { openReport, rows, lightOf, openGrown: pack => openReport(pack || prog.pack, { grown: true }) };
}
