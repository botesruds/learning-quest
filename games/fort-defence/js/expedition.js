/* Expeditions: practice for the MYP assessment criteria B, C and D (plan "A to D criteria in Fort Defence", 23 Nov 2026,
   approved by Rudi 24 Nov 2026). An Expedition is a day whose topic has `exp` (a spec from its pack). It is played in
   three rounds, each with a fresh pattern or investigation:
     1 Guided      a "watch me" example first, then one small step per screen; a hint after a miss
     2 Hints       bigger steps; a hint only when he taps 💡 (that part then counts as "with help")
     3 On your own the whole task on one page, one check per part; a wrong part is shown and counts as "with help"
   After each round a four-rung ladder (1 to 2, 3 to 4, 5 to 6, 7 to 8) shows his rung, worked out from the parts he did
   on his own the first time, and one tip to climb. Practice levels, not school marks.
   Stars: round 1 done = 1, round 2 done = 2, round 3 at rung 5 to 6 or higher = 3 (stars only ever go up).
   Save: S.crit = { key: { r: [best rung + 1 for rounds 1..3, 0 = not done], best: -1..3, parts, text, at, n } } (additive).
   Spec (from the pack): { crit, name, kid, strands: {k: {n, col}}, rungs: [{need: [part keys], text, tip}] x4,
     make(round) -> instance, watch(inst) -> element, items(inst, round) -> [item], writeup?(inst, round) -> [item],
     text(inst, parts, picks) -> string }
   Item: { key, strand, h, body?: () => [elements], a?: answer spec, p?: label, hint?, after?: () => element,
     custom?: (done(result), round) => element }   result: "own" | "help" */
import { h, SayBtn } from "./qcore.js";
import { AnswerBox } from "./qui.js";
import { sfx } from "./audio.js";

export const RUNGS = ["1 to 2", "3 to 4", "5 to 6", "7 to 8"];
export const ROUNDS = ["Guided", "Hints", "On your own"];
export const CRIT_WORDS = {   // the official criterion names, for the grown-up view
  Maths: { A: "Knowing and understanding", B: "Investigating patterns", C: "Communicating", D: "Applying mathematics in real-life contexts" },
  Science: { A: "Knowing and understanding", B: "Inquiring and designing", C: "Processing and evaluating", D: "Reflecting on the impacts of science" },
};

export const critOf = (S, key) => { const c = S.crit || (S.crit = {}); return c[key] || (c[key] = { r: [0, 0, 0], best: -1, parts: null, text: "", at: 0, n: 0 }); };
export const peekCrit = (S, key) => (S.crit || {})[key] || null;
/* the highest rung whose needs were all done on his own */
export function rungOf(spec, parts) {
  let r = 0;
  spec.rungs.forEach((g, i) => { if (i && g.need.every(k => parts[k] === "own")) r = i; });
  return r;
}
/* which round to play next: the first not done, else the round that can still climb (3) */
export const nextRound = c => (c.r[0] ? c.r[1] ? 3 : 2 : 1);
export const starsFor = (round, rung) => round >= 3 ? (rung >= 2 ? 3 : 2) : round;

/* ---------- the ladder ---------- */
export function Ladder(spec, rung, o = {}) {
  const rows = [3, 2, 1, 0].map(i => h("div", { class: "xrung" + (i === rung ? " here" : i < rung ? " below" : " above") },
    h("span", { class: "xn" }, RUNGS[i]),
    h("span", {}, i === rung ? h("b", {}, o.mine === false ? "Best so far. " : "You are here. ") : null, spec.rungs[i].text, i <= rung ? " ✓" : "")));
  const tip = rung < 0 ? null : spec.rungs[rung].tip;
  return h("div", { class: "stack xladder" }, ...rows, tip ? h("div", { class: "rule" }, rung < 3 ? "To climb: " : "", tip) : null,
    h("p", { class: "small muted" }, "Practice level, not a school mark."));
}

/* ---------- the Expedition screen ----------
   ctx: { key, S, commit, record(r), grant(r), giveStars(n) -> gained, onMastered(), onExit() } */
export function ExpeditionView(spec, ctx) {
  const wrap = h("div", { class: "stack xp" }), C = () => critOf(ctx.S(), ctx.key);
  const pill = (i, cur) => { const done = C().r[i] > 0; return h("span", { class: "xpill" + (i + 1 === cur ? " on" : done ? " done" : C().r[Math.max(0, i - 1)] || i === 0 ? "" : " lock") }, (done && i + 1 !== cur ? "✓ " : i > 0 && !C().r[i - 1] ? "🔒 " : "") + (i + 1) + " " + ROUNDS[i]); };
  const pills = cur => h("div", { class: "xpills" }, ...[0, 1, 2].map(i => pill(i, cur)));
  const chips = () => h("div", { class: "xchips" }, ...Object.entries(spec.strands).map(([k, s], i) => h("span", { class: "xchip", style: `background:${s.col}` }, `${i + 1} ${s.n}`)));
  const show = (...els) => { wrap.replaceChildren(...els); try { wrap.closest(".sbody, .sheet")?.scrollTo?.({ top: 0 }); } catch (e) {} };

  function start() {
    const c = C(), nr = nextRound(c);
    const bestTxt = c.best >= 0 ? `Your best so far: rung ${RUNGS[c.best]}.` + (c.best < 2 ? " Reach 5 to 6 in round 3 for 3 stars." : "") : "Three rounds. Each one gives you less help. Reach rung 5 to 6 on your own for 3 stars.";
    const card = h("div", { class: "card stack pop" },
      h("div", { class: "row", style: "justify-content:space-between" }, h("div", { class: "eyebrow" }, `Criterion ${spec.crit} · ${spec.critName}`), SayBtn(() => spec.kid + ". " + spec.blurb)),
      h("h2", {}, spec.kid), h("p", {}, spec.blurb), chips(), pills(nr), h("div", { class: "rule" }, bestTxt),
      h("div", { class: "row" },
        h("button", { class: "bigbtn go", type: "button", onclick: () => { sfx("click"); play(nr); } }, `Start round ${nr}: ${ROUNDS[nr - 1]} ▸`),
        h("button", { class: "btn", type: "button", onclick: () => { sfx("click"); watch(spec.make(1), start); } }, "👀 Watch me first")),
      c.r[0] ? h("div", { class: "row small" }, "Play a round again: ", ...[1, 2, 3].filter(n => n === 1 || c.r[n - 2]).map(n => h("button", { class: "btn small", type: "button", onclick: () => play(n) }, `${n} ${ROUNDS[n - 1]}`))) : null);
    show(card);
  }

  function watch(inst, then) {
    show(h("div", { class: "card stack pop" }, h("div", { class: "eyebrow" }, "👀 Watch me first"), h("h2", {}, "A finished example"),
      h("p", { class: "small muted" }, "Each colour is one thing your teacher looks for."), chips(), spec.watch(inst),
      h("button", { class: "bigbtn go", type: "button", onclick: () => { sfx("click"); then(); } }, "I'm ready ▸")));
  }

  function play(round) {
    const inst = spec.make(round), parts = {}, picks = {};
    window.__fdxi = inst; window.__fdxItems = {};   // lets the automated play-test see the task on screen
    const items = spec.items(inst, round), wu = spec.writeup ? spec.writeup(inst, round) : [];
    const mark = (it, r) => { if (parts[it.key] !== "help") parts[it.key] = r; ctx.record(r); ctx.grant(r); };
    if (round === 1 && !C().r[0]) return watch(spec.make(1), () => run());
    run();
    function run() { if (round === 3) onePage(); else paged(0); }

    /* one item as a card section; cb(result) when answered */
    function itemEl(it, cb, single) {
      const s = spec.strands[it.strand] || { n: "", col: "var(--accent)" };
      const box = h("div", { class: "stack xitem" + (single ? "" : " card pop"), style: `--sc:${s.col}`, "data-key": it.key }); window.__fdxItems[it.key] = it;
      box.append(h("div", { class: "row", style: "justify-content:space-between" }, h("span", { class: "xtag", style: `background:${s.col}` }, s.n), it.p ? SayBtn(() => it.h + ". " + String(it.p).replace(/<[^>]+>/g, " ")) : null));
      if (it.h) box.append(h(single ? "h3" : "h2", {}, it.h));
      if (it.body) box.append(...it.body());
      const afterBox = h("div");
      let hinted = false;
      const done = r => { if (it.after) afterBox.append(it.after()); cb(hinted && r === "own" ? "help" : r); };
      if (it.custom) box.append(it.custom(done, round));
      else {
        const hintBtn = round === 2 && it.hint ? h("button", { class: "btn small", type: "button", onclick: e => { hinted = true; e.currentTarget.replaceWith(h("div", { class: "verdict mid" }, "💡 " + it.hint)); } }, "💡 Hint") : null;
        box.append(AnswerBox(it.a, it.p || "", tries => done(tries || hinted ? "help" : "own"),
          (tries, fb) => { fb.className = "verdict bad"; fb.textContent = round === 1 && it.hint ? "Hint: " + it.hint : round === 2 ? "Not quite. Try again, or tap 💡 for a hint." : "Not quite."; },
          fb => { fb.className = "verdict mid"; fb.textContent = "That's the answer. Read it, then carry on."; done("help"); },
          { max: round === 3 ? 1 : 2 }), hintBtn || "");
      }
      box.append(afterBox);
      return box;
    }

    function paged(i) {
      const list = items.concat(wu);
      if (i >= list.length) return finish();
      const it = list[i], isW = i >= items.length;
      const next = h("button", { class: "btn primary hide", type: "button", onclick: () => { sfx("click"); paged(i + 1); } }, "Next ▸");
      const el = itemEl(it, r => { if (isW) picks[it.key] = r; else mark(it, r); next.classList.remove("hide"); });
      el.prepend(h("div", { class: "eyebrow" }, isW ? "Build your write-up" : `Part ${i + 1} of ${items.length}`));
      el.append(next);
      show(pills(round), el);
    }

    function onePage() {
      let left = items.length + wu.length;
      const fin = h("button", { class: "bigbtn go", type: "button", disabled: true, onclick: () => { sfx("click"); finish(); } }, "Finish ▸");
      const tick = () => { left--; if (left <= 0) fin.disabled = false; };
      const task = h("div", { class: "card stack" }, h("div", { class: "eyebrow" }, "The task"), ...(spec.sheet ? spec.sheet(inst) : []),
        ...items.map(it => itemEl(it, r => { mark(it, r); tick(); }, true)));
      const w = wu.length ? h("div", { class: "card stack" }, h("h2", {}, "Build your write-up"), h("p", { class: "small muted" }, "Finish each sentence in your own words."),
        ...wu.map(it => itemEl(it, r => { picks[it.key] = r; tick(); }, true))) : null;
      show(pills(3), task, w, fin);
    }

    function finish() {
      spec.items(inst, round).forEach(it => { if (!parts[it.key]) parts[it.key] = "help"; });
      if (spec.fill) spec.fill(parts, round);
      const rung = rungOf(spec, parts), c = C(), prevBest = c.best;
      c.r[round - 1] = Math.max(c.r[round - 1], rung + 1);
      if (rung > c.best || (rung === c.best && round >= 3)) { c.best = Math.max(c.best, rung); c.parts = { ...parts }; c.text = spec.text(inst, parts, picks); c.round = round; }
      c.at = Date.now(); c.n = (c.n || 0) + 1; ctx.commit();
      const gained = ctx.giveStars(starsFor(round, rung));
      sfx(rung >= 2 ? "star" : "click");
      const mastered = gained && starsFor(round, rung) >= 3;
      const st = ctx.stars();
      show(h("div", { class: "card stack pop" },
        h("div", { class: "row", style: "justify-content:space-between;align-items:center" }, h("h2", {}, `Round ${round} done: your rung`), h("span", { class: "stars" }, "⭐".repeat(st) + "☆".repeat(3 - st))),
        Ladder(spec, rung),
        prevBest >= 0 && rung < prevBest ? h("p", { class: "small" }, `Your best is still rung ${RUNGS[prevBest]}. Only your best is kept.`) : null,
        c.text && round >= 2 ? h("details", {}, h("summary", {}, "Read your write-up"), h("div", { class: "why", style: "white-space:pre-line" }, c.text)) : null,
        h("div", { class: "row" },
          mastered ? h("button", { class: "bigbtn go", type: "button", onclick: () => ctx.onMastered() }, "Continue ▸")
            : round < 3 ? h("button", { class: "bigbtn go", type: "button", onclick: () => { sfx("click"); play(round + 1); } }, `Round ${round + 1}: ${ROUNDS[round]} ▸`)
              : h("button", { class: "bigbtn go", type: "button", onclick: () => { sfx("click"); play(3); } }, rung >= 3 ? "Try a new one" : `Try for ${RUNGS[Math.min(3, rung + 1)]}`),
          h("button", { class: "btn", type: "button", onclick: () => { sfx("click"); ctx.onExit(); } }, "Stop here"))));
      window.__fdx = { key: ctx.key, round, rung, parts: { ...parts }, best: c.best };
    }
  }

  start();
  return wrap;
}

/* the sentence-card part of a write-up: tap the right card (rounds 1 and 2); in round 3 he types the key words to finish it */
export function writeItem(key, strand, title, right, decoys, typed, round) {
  if (round === 3 && typed) return { key, strand, h: title, a: { gap: { text: typed.text, ans: typed.ans, bank: typed.ans, typed: true } }, p: "" };
  const all = [right, ...decoys].map((t, i) => [t, i]).sort(() => Math.random() - 0.5);
  return { key, strand, h: title, a: { choice: all.map(x => x[0]), ans: all.findIndex(x => x[1] === 0) }, p: "Tap the sentence that belongs here." };
}
