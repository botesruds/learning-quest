/* Thinking tasks (content document "Thinking tasks: science content to check", 22 Nov 2026):
   - Sentence, Phrase, Word: after a day's lesson he reads that day's Library dispatch, taps the most important sentence,
     then phrase, then word, and picks a reason for each. No single right answer: an expert sentence earns a bonus 💎,
     and he always sees the expert picks beside his own. The first time, a short "watch me first" lesson shows how.
   - Explain it: one Brain check rune per day is a short typed answer after a sentence starter. A free keyword check
     looks for the key ideas; a missing idea gets a hint and one more try; only then (and within a daily cap) is the
     writing coach asked. If the coach is away, the model answer is shown and the rune fizzles.
   - The Map Room: a layered mind-map of a land (centre, primary branches, secondary cards) in four levels with fading
     support. Levels 1-3 are marked by the game; level 4 (his own map) goes to the Writing desk.
   Fill the gap lives in qui.js (GapAnswer), since every question screen uses it.
   Save: S.think = { intro, spw: { topicKey: { s, p, w, rs, why, t } }, vault: [{ w, key, t }], ex: { topicKey: { text, ok, by, t } },
                     maps: { "<pack id>:<region>": { lv, own } }, coach: { d, n } } */
import { h, esc, shuffle, SayBtn } from "./qcore.js";
import { LearnView } from "./qui.js";
import { sfx } from "./audio.js";

export const REASONS = ["It sums up the whole text", "It gives the main reason", "It names the key idea", "It's a key science word"];
const COACH_PER_DAY = 5;

export function thinkState(S) { const t = S.think || (S.think = {}); t.spw = t.spw || {}; t.vault = t.vault || []; t.ex = t.ex || {}; t.maps = t.maps || {}; return t; }
const today = () => new Date().toISOString().slice(0, 10);

/* ---------------- the writing coach (same endpoint as the Scribe's Tower) ---------------- */
export async function askCoach(save, task) {
  const T = thinkState(save.state), c = T.coach && T.coach.d === today() ? T.coach : (T.coach = { d: today(), n: 0 });
  if (c.n >= COACH_PER_DAY) return { away: true, why: "cap" };
  if (window.__fdCoach) { c.n++; return window.__fdCoach(task); }
  const pass = (window.Family && window.Family.pass) || null;
  if (save.practice || !pass) return { away: true, why: "practice" };
  c.n++; save.commit();
  try {
    const r = await fetch("/api/coach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pass, task }) });
    if (!r.ok) return { away: true, why: "http " + r.status };
    const j = await r.json(); return j && Array.isArray(j.lines) ? j : { away: true, why: "bad reply" };
  } catch (e) { return { away: true, why: "offline" }; }
}

/* ---------------- Explain it ---------------- */
const norm = s => String(s).toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, " ");
/* which key ideas are missing from his answer (only his own words, not the starter) */
export function missingIdeas(E, text) {
  const t = " " + norm(text) + " ";
  return E.must.filter(idea => !idea.w.some(w => new RegExp("(^|[^a-z])" + norm(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).test(t)));
}
/* ExplainCard(E, save, onResult("right"|"wrong", info), opts) → element. opts.label is the eyebrow. */
export function ExplainCard(E, save, onResult, opts = {}) {
  const card = h("div", { class: "card stack pop explain" }), fb = h("div");
  const ta = h("textarea", { class: "exin", rows: 3, "aria-label": "Your explanation", placeholder: "…finish the sentence in your own words" });
  card.append(h("div", { class: "row", style: "justify-content:space-between" }, h("div", { class: "eyebrow" }, opts.label || "✍️ Explain it"), SayBtn(() => E.q + " Start with: " + E.starter)),
    h("div", { class: "qs" }, E.q), h("p", { class: "small muted" }, "Finish the sentence. One or two sentences is enough."),
    h("div", { class: "exstart" }, E.starter + " …"), ta);
  let tries = 0, done = false;
  const btn = h("button", { class: "btn primary", type: "button" }, "Check");
  const finish = (ok, by, extra) => {
    done = true; ta.disabled = true; btn.remove();
    fb.className = "verdict " + (ok ? "good" : "mid");
    fb.innerHTML = (ok ? "<b>Yes! That explains it.</b> " : "<b>Here's a strong answer:</b> ") + (extra ? esc(extra) + " " : "") + (ok ? "" : esc(E.model));
    if (ok) card.append(h("p", { class: "small muted" }, "A model answer: " + E.model));
    const T = thinkState(save.state); T.ex[opts.key || E.q] = { text: E.starter + " " + ta.value.trim(), ok, by, t: Date.now() }; save.commit();
    onResult(ok ? "right" : "wrong", { by });
  };
  btn.addEventListener("click", async () => {
    if (done) return; const v = ta.value.trim();
    if (v.split(/\s+/).filter(Boolean).length < 3) { fb.className = "verdict mid"; fb.textContent = "Write a bit more: finish the whole sentence."; return; }
    const miss = missingIdeas(E, v);
    if (!miss.length) return finish(true, "keywords");
    tries++;
    if (tries === 1) { fb.className = "verdict mid"; fb.innerHTML = "<b>Nearly.</b> 💡 " + esc(miss[0].hint) + " Add that, then check again."; ta.focus(); return; }
    btn.disabled = true; btn.textContent = "The coach is reading…";
    const res = await askCoach(save, { kind: "explain", question: E.q, facts: [E.model], model: E.model, parts: { answer: E.starter + " " + v } });
    if (!res.away && res.lines && res.lines.every(l => l.met)) return finish(true, "coach", res.praise || "");
    finish(false, res.away ? "keywords" : "coach", res.away ? "" : res.fix || "");
  });
  card.append(btn, fb);
  setTimeout(() => { try { ta.focus({ preventScroll: true }); } catch (e) {} }, 60);
  return card;
}

/* ---------------- Sentence, Phrase, Word ---------------- */
const INTRO = [
  { t: "show", h: "Sentence, Phrase, Word", b: "<p>Good readers ask: <b>what matters most here?</b></p><p>You'll read a short text, then pick:</p><p>1️⃣ the <b>sentence</b> that holds the main idea<br>2️⃣ the most important <b>phrase</b> (a few words)<br>3️⃣ the most important <b>word</b></p>", rule: "Sentence → phrase → word. Each time, say why." },
  { t: "show", h: "Watch me first", b: "<p class=\"spwdemo\"><span>Bees fly from flower to flower.</span> <mark>Bees carry pollen, which helps plants make seeds.</mark> <span>Some bees live in hives.</span></p><p><b>Sentence:</b> the middle one. Without it, you wouldn't know why bees matter. <i>It gives the main reason.</i></p><p><b>Phrase:</b> \"helps plants make seeds\". <i>It names the key idea.</i></p><p><b>Word:</b> \"pollen\". <i>It's a key science word.</i></p>", rule: "There's no single right answer. A good choice has a good reason." },
  { t: "show", h: "Your turn", b: "<p>The text stays on screen the whole time. Tap a sentence, then pick your reason. Then the phrase, then the word.</p><p>At the end you'll see what a scientist picked, so you can compare.</p>" },
];
/* SPWView(item, spw, save, key, onDone(result)) → element. result = { expert: bool } */
export function SPWView(item, spw, save, key, onDone) {
  const T = thinkState(save.state), wrap = h("div", { class: "stack" });
  if (!T.intro) {
    const show = i => wrap.replaceChildren(LearnView(INTRO, i, show, () => { T.intro = true; save.commit(); run(); }, null, "Start"));
    show(0); return wrap;
  }
  run(); return wrap;
  function run() {
    const pick = { s: null, p: null, w: null, rs: {}, own: {} };
    let stage = "s", pStart = null;
    const tok = item.text.map((t, si) => t.split(/\s+/).filter(Boolean).map((w, k) => ({ w, si, k, bare: w.replace(/^[^\w×]+|[^\w×]+$/g, "") })));
    const passage = h("div", { class: "passage spw" });
    const ask = h("div", { class: "qs" }), hint = h("p", { class: "small muted" }), reasonBox = h("div"), area = h("div", { class: "stack" });
    const paint = () => {
      passage.replaceChildren(...item.text.map((t, si) => {
        const sEl = h("span", { class: "sent spws" + (pick.s === si ? " picked" : "") + (stage === "s" ? " tapable" : "") });
        tok[si].forEach((x, k) => {
          const inP = pick.p && pick.p.si === si && k >= pick.p.a && k <= pick.p.b, isW = pick.w && pick.w.si === si && pick.w.k === k, isStart = pStart && pStart.si === si && pStart.k === k;
          sEl.append(h("span", { class: "wd" + (inP ? " inp" : "") + (isW ? " isw" : "") + (isStart ? " pstart" : "") + (stage === "p" || stage === "w" ? " tapable" : ""),
            onclick: e => { if (stage === "p" || stage === "w") { e.stopPropagation(); tapWord(si, k); } } }, x.w), " ");
        });
        sEl.addEventListener("click", () => { if (stage === "s") { pick.s = si; sfx("click"); paint(); reasons("s"); } });
        return sEl;
      }));
    };
    function tapWord(si, k) {
      sfx("click");
      if (stage === "w") { if (!tok[si][k].bare) return; pick.w = { si, k, text: tok[si][k].bare }; paint(); reasons("w"); return; }
      if (!pStart || pStart.si !== si) { pStart = { si, k }; pick.p = null; hint.textContent = "Now tap the last word of your phrase (in the same sentence)."; paint(); return; }
      let a = Math.min(pStart.k, k), b = Math.max(pStart.k, k);
      if (b - a > 7) { hint.textContent = "A phrase is short: 8 words at most. Tap a nearer last word."; return; }
      pick.p = { si, a, b, text: tok[si].slice(a, b + 1).map(x => x.w).join(" ").replace(/^["“'(]+|["”'),.;:!?]+$/g, "") }; pStart = null; paint(); reasons("p");
    }
    const label = { s: "sentence", p: "phrase", w: "word" };
    function reasons(st) {
      const chosen = st === "s" ? item.text[pick.s] : pick[st].text;
      const own = h("input", { class: "ans", type: "text", placeholder: "or type your own reason", "aria-label": "Your own reason", maxlength: 120 });
      const next = h("button", { class: "btn primary", type: "button", disabled: true, onclick: () => { pick.own[st] = own.value.trim(); if (!pick.rs[st] && !pick.own[st]) return; advance(st); } }, st === "w" ? "Compare with a scientist ▸" : "Next ▸");
      own.addEventListener("input", () => { next.disabled = !(pick.rs[st] || own.value.trim()); });
      const chips = h("div", { class: "opts col" }, ...REASONS.map(r => h("button", { class: "opt" + (pick.rs[st] === r ? " ok" : ""), type: "button", onclick: e => { pick.rs[st] = r; chips.querySelectorAll("button").forEach(b => b.classList.remove("ok")); e.currentTarget.classList.add("ok"); next.disabled = false; } }, r)));
      reasonBox.replaceChildren(h("div", { class: "card stack spwwhy" }, h("div", {}, h("b", {}, `Your ${label[st]}: `), h("span", { class: "spwq" }, "“" + chosen + "”")), h("div", { style: "font-weight:700" }, "Why did you pick it?"), chips, own, h("div", { class: "row" }, h("button", { class: "btn small", type: "button", onclick: () => { if (st === "s") pick.s = null; else pick[st] = null; reasonBox.replaceChildren(); paint(); } }, "↩ Choose again"), next)));
    }
    function advance(st) {
      reasonBox.replaceChildren();
      if (st === "s") { stage = "p"; ask.textContent = "2️⃣ Tap the most important PHRASE."; hint.textContent = "Tap its first word, then its last word. It can come from any sentence."; }
      else if (st === "p") { stage = "w"; ask.textContent = "3️⃣ Tap the most important WORD."; hint.textContent = "One word that the whole text needs."; }
      else return finish();
      paint();
    }
    function finish() {
      stage = "done"; paint();
      const expert = spw.best.includes(pick.s), why = r => pick.own[r] || pick.rs[r];
      T.spw[key] = { s: item.text[pick.s], p: pick.p.text, w: pick.w.text, rs: { s: why("s"), p: why("p"), w: why("w") }, expert, t: Date.now() };
      if (!T.vault.some(v => v.w.toLowerCase() === pick.w.text.toLowerCase())) T.vault.push({ w: pick.w.text, key, t: Date.now() });
      if (spw.word && pick.w.text.toLowerCase() !== spw.word.toLowerCase() && !T.vault.some(v => v.w.toLowerCase() === spw.word.toLowerCase())) T.vault.push({ w: spw.word, key, t: Date.now(), expert: true });
      save.commit();
      const row = (lab, mine, theirs) => h("tr", {}, h("th", {}, lab), h("td", {}, mine), h("td", {}, theirs));
      area.replaceChildren(h("div", { class: "card stack" },
        h("h3", {}, expert ? (pick.s === spw.best[0] ? "💎 A scientist picked that sentence too!" : "💎 Good pick: a scientist would accept that sentence too!") : "Compare with a scientist"),
        h("table", { class: "sci-t spwcmp" }, h("tr", {}, h("th", {}), h("th", {}, "You"), h("th", {}, "A scientist")),
          row("Sentence", item.text[pick.s], item.text[spw.best[0]]), row("Phrase", pick.p.text, spw.phrase), row("Word", pick.w.text, spw.word)),
        h("p", {}, h("b", {}, "Why the scientist picked it: "), spw.why),
        spw.none ? h("p", { class: "small muted" }, "💡 Sometimes no sentence says it all. Pick the one the others hang on.") : null,
        expert ? null : h("p", { class: "small" }, "Read both sentences again. Which one would help a friend understand the whole text?"),
        h("p", { class: "small muted" }, `📒 “${pick.w.text}” went into your Word Vault.`),
        h("button", { class: "bigbtn go", type: "button", onclick: () => { sfx("click"); onDone({ expert }); } }, "Carry on ▸")));
    }
    ask.textContent = "1️⃣ Read the text. Tap the SENTENCE that holds the main idea.";
    hint.textContent = "Take your time. You can read it aloud with 🔊.";
    paint();
    wrap.replaceChildren(h("div", { class: "mission" }, `🧠 Think it through: ${item.title}. Sentence, phrase, word.`),
      h("div", { class: "card stack" }, h("div", { class: "row", style: "justify-content:space-between" }, ask, SayBtn(() => item.text.join(" "))), hint, passage), reasonBox, area);
  }
}

/* ---------------- the Map Room ---------------- */
const COLORS = ["#e57373", "#64b5f6", "#81c784", "#ffb74d", "#ba68c8", "#4db6ac", "#f06292", "#a1887f"];
const DISTRACT = ["Muscles and tendons", "The skeleton", "Fractions"];
export function createMapRoom({ save, prog, day, toast, onChange }) {
  const S = () => save.state;
  const T = () => thinkState(S());
  const maps = () => ((prog.pack.think || {}).maps) || {};
  const regions = () => prog.pack.regions.filter(r => maps()[r.n]);
  const mk = r => prog.pack.id + ":" + r.n;
  const M = r => T().maps[mk(r)] || (T().maps[mk(r)] = { lv: 0 });
  const isOpen = r => S().unlockAll || r.topics.every(id => S().learnDone[prog.keyOf(prog.pack, id)]);
  const has = () => regions().length > 0;
  const news = () => regions().some(r => isOpen(r) && M(r).lv < 2);
  let K = null;
  const mount = t => { K = day.kit(); K.head([h("div", { class: "row", style: "justify-content:space-between;align-items:flex-start;gap:8px" }, h("div", { style: "min-width:0;flex:1" }, h("div", { class: "eyebrow" }, "🗺️ Map Room"), h("h2", {}, t)), K.closeBtn()), K.lootbar]); };
  const backBtn = () => K.linkbtn("◂ Back to the Map Room", () => { sfx("click"); open(); });
  const LV = [["1", "Fill the branches", "The branches are there. Put each card on the right one."], ["2", "Build the layers", "Place the main branches first, then the cards."], ["3", "Name the links", "Say how each branch links to the big idea."], ["4", "My own map", "Build your own map. A grown-up reads it."]];

  function open() {
    if (!has()) { toast("The Map Room opens with the science quest."); return; }
    mount("Mind-maps: how ideas connect");
    const list = regions().map(r => {
      const m = M(r), ok = isOpen(r);
      return h("div", { class: "card stack" }, h("h3", {}, `${r.emoji} ${r.name}`),
        ok ? h("div", { class: "stack" }, ...LV.map(([n, name, does], i) => { const can = i <= m.lv || S().unlockAll, done = i < m.lv;
          return h("button", { class: "opt mmlv" + (done ? " ok" : ""), type: "button", disabled: !can, onclick: () => { sfx("click"); play(r, i + 1); } }, `${done ? "✅" : can ? "▶" : "🔒"} Level ${n}: ${name}`, h("div", { class: "small muted" }, does)); }))
          : h("p", { class: "small muted" }, `🔒 Read every lesson in ${r.name} first.`));
    });
    K.set(h("div", { class: "stack" }, K.mission("🗺️ A mind-map shows how ideas connect: the big idea in the middle, main branches around it, details on each branch. Building one is a great way to remember a whole land."), ...list));
  }

  /* the board: centre + branch boxes. slots[i] = branch index shown in box i (or null while empty, level 2) */
  function board(map, slots, placed, onBox, links) {
    const wide = innerWidth >= 700, el = h("div", { class: "mm" + (wide ? " wide" : "") });
    const centre = h("div", { class: "mmc" }, map.centre);
    const boxes = slots.map((b, i) => {
      const col = COLORS[i % COLORS.length], br = b == null ? null : map.branches[b];
      const box = h("div", { class: "mmb" + (b == null ? " empty" : ""), style: `--c:${col}`, "data-i": i, onclick: () => onBox && onBox(i) },
        h("div", { class: "mmh" }, br ? br.name : "＋ a main branch"),
        links && br ? links(b) : null,
        h("ul", {}, ...Object.entries(placed).filter(([c, at]) => at === i).map(([c]) => h("li", {}, c))));
      return box;
    });
    if (wide) { const order = [0, 1, 2, 3, null, 4, 5, 6, 7]; order.forEach((k, i) => { if (k === null) el.append(centre); else if (boxes[k]) el.append(boxes[k]); else if (i < 9) el.append(h("div", { class: "mmgap" })); }); }
    else el.append(centre, ...boxes);
    return el;
  }

  function play(r, lv) {
    const map = maps()[r.n]; mount(`${r.emoji} ${r.name}: level ${lv}`);
    if (lv === 3) return linksLevel(r, map);
    if (lv === 4) return ownLevel(r, map);
    const nb = map.branches.length;
    const slots = lv === 1 ? map.branches.map((b, i) => i) : Array(nb).fill(null);
    const owner = {}; map.branches.forEach((b, i) => b.cards.forEach(c => (owner[c] = i)));
    let queue = lv === 2 ? shuffle([...map.branches.map((b, i) => ({ prim: i, t: b.name })), ...DISTRACT.slice(0, 2).map(t => ({ fake: true, t }))]) : [];
    const secs = shuffle(Object.keys(owner).map(t => ({ t })));
    if (lv === 1) queue = secs;
    const placed = {}, miss = {}; let sel = null, firstRight = 0, total = 0;
    const fb = h("div"), trayEl = h("div", { class: "mmtray" }), boardWrap = h("div");
    const tray = () => queue.slice(0, 3);
    function paint() {
      boardWrap.replaceChildren(board(map, slots, placed, i => { if (sel) drop(sel, i); }));
      trayEl.replaceChildren(...(tray().length ? tray().map(c => { const b = h("button", { class: "mmcard" + (sel === c ? " sel" : "") + (c.prim != null || c.fake ? " prim" : ""), type: "button", onclick: () => { sel = sel === c ? null : c; sfx("click"); paint(); } }, c.t); dragify(b, c); return b; }) : [h("span", { class: "muted" }, "")]));
    }
    function dragify(b, c) {
      let sx, sy, ghost = null;
      b.addEventListener("pointerdown", e => { sx = e.clientX; sy = e.clientY; b.setPointerCapture && b.setPointerCapture(e.pointerId); });
      b.addEventListener("pointermove", e => { if (sx == null) return; if (!ghost && Math.hypot(e.clientX - sx, e.clientY - sy) > 10) { ghost = h("div", { class: "mmghost" }, c.t); document.body.append(ghost); sel = c; }
        if (ghost) { ghost.style.left = e.clientX - 40 + "px"; ghost.style.top = e.clientY - 20 + "px"; } });
      const end = e => { if (ghost) { ghost.remove(); ghost = null; const under = document.elementFromPoint(e.clientX, e.clientY), box = under && under.closest(".mmb"); if (box) drop(c, +box.dataset.i); else paint(); b._dragged = true; setTimeout(() => (b._dragged = false), 50); } sx = null; };
      b.addEventListener("pointerup", end); b.addEventListener("pointercancel", () => { if (ghost) { ghost.remove(); ghost = null; } sx = null; });
      b.addEventListener("click", e => { if (b._dragged) e.stopImmediatePropagation(); }, true);
    }
    function drop(c, i) {
      let ok;
      if (c.fake) ok = false;
      else if (c.prim != null) ok = slots[i] == null;
      else { const b = slots[i]; ok = b != null && (owner[c.t] === b || ((map.also || {})[c.t] || []).includes(b)); }
      if (ok) {
        if (!miss[c.t]) firstRight++; total++;
        if (c.prim != null) slots[i] = c.prim; else placed[c.t] = i;
        queue = queue.filter(x => x !== c); sel = null; sfx("correct"); fb.className = "verdict good"; fb.textContent = c.prim != null ? `“${c.t}” is a main branch.` : "Yes! It belongs there.";
        if (lv === 2 && c.prim != null && !queue.some(x => x.prim != null)) { queue = queue.filter(x => !x.fake).concat(secs); fb.textContent = "Every main branch is in place. Now the details."; }
      } else {
        sfx("wrong"); miss[c.t] = (miss[c.t] || 0) + 1; fb.className = "verdict bad";
        if (c.fake) { fb.textContent = `“${c.t}” isn't about ${r.name}. It belongs to another land.`; queue = queue.filter(x => x !== c); sel = null; }
        else if (c.prim != null) fb.textContent = "That branch is taken. Put it on an empty one.";
        else if (slots[i] == null) fb.textContent = "Place the main branches first.";
        else if (miss[c.t] >= 2) { const b = owner[c.t], at = slots.indexOf(b); placed[c.t] = at; queue = queue.filter(x => x !== c); sel = null; total++; fb.className = "verdict mid"; fb.textContent = `It goes on “${map.branches[b].name}”. Read the branch and the card together.`; }
        else fb.textContent = `Not “${map.branches[slots[i]].name}”. Which branch is “${c.t.split(":")[0]}” about?`;
      }
      paint(); if (!queue.length) setTimeout(done, 600);
    }
    function done() {
      const m = M(r), first = m.lv < lv; m.lv = Math.max(m.lv, lv); save.commit(); onChange && onChange();
      if (first) K.grant({ crystal: 2, gold: 0 }, boardWrap); sfx("star");
      const b = lv === 2 ? prog.award(prog.pack.keyPrefix + "map" + r.n) : null;
      K.set(h("div", { class: "stack" }, K.celebrate(h("div", { class: "bigstars" }, "🗺️"), h("h2", {}, `Level ${lv} done!`), h("p", {}, `${firstRight} of ${total} cards right first time.`),
        b ? h("p", {}, `🏅 New badge: ${b.e} ${b.n}`) : null,
        K.bigbtn(`▶ Level ${lv + 1}`, () => play(r, lv + 1)), backBtn()), board(map, slots, placed)));
    }
    K.set(h("div", { class: "stack" }, K.mission(lv === 1 ? "🗺️ Drag each card onto its branch, or tap the card and then the branch." : "🗺️ First drag the MAIN branches into the empty boxes. Watch out: some cards are from other lands. Then the details."), boardWrap, h("div", { class: "mmtrayw" }, h("div", { class: "small muted" }, "Your cards (3 at a time)"), trayEl), fb, backBtn()));
    paint();
  }

  function linksLevel(r, map) {
    const slots = map.branches.map((b, i) => i), placed = {}; map.branches.forEach((b, i) => b.cards.forEach(c => (placed[c] = i)));
    const named = {}; let right = 0; const fb = h("div"), wrap = h("div");
    const linkUI = b => {
      if (named[b]) return h("div", { class: "mmlink ok" }, "↳ " + map.branches[b].link);
      const others = shuffle(map.branches.filter((x, j) => j !== b).map(x => x.link)).slice(0, 2), opts = shuffle([map.branches[b].link, ...others]);
      let tries = 0;
      return h("div", { class: "mmlink" }, h("div", { class: "small" }, `The big idea … ? … ${map.branches[b].name}`), ...opts.map(o => h("button", { class: "btn small", type: "button", onclick: e => { e.stopPropagation();
        if (o === map.branches[b].link) { if (!tries) right++; named[b] = true; sfx("correct"); fb.className = "verdict good"; fb.textContent = `${map.centre.split(":")[0]} ${o} … ${map.branches[b].name.toLowerCase()}.`; paint(); }
        else { tries++; sfx("wrong"); e.currentTarget.disabled = true; fb.className = "verdict bad"; fb.textContent = "Read it as a sentence: big idea + link + branch. Does it make sense?"; if (tries >= 2) { named[b] = true; paint(); } } } }, o)));
    };
    function paint() {
      wrap.replaceChildren(board(map, slots, placed, null, linkUI));
      if (Object.keys(named).length === map.branches.length) cross();
    }
    function cross() {
      const X = map.cross, opts = shuffle([X.link, ...X.wrong]);
      wrap.append(h("div", { class: "card stack" }, h("b", {}, "🔗 One more: a cross-link between two branches"), h("div", {}, `“${X.from}” … ? … “${map.branches[X.to].name}”`),
        h("div", { class: "opts col" }, ...opts.map(o => h("button", { class: "opt", type: "button", onclick: e => { const b = e.currentTarget;
          if (o === X.link) { b.classList.add("ok"); right++; sfx("correct"); finish(); } else { b.classList.add("no"); b.disabled = true; sfx("wrong"); fb.className = "verdict bad"; fb.textContent = "Which link would a scientist say out loud? Try another."; } } }, o)))));
    }
    function finish() {
      const m = M(r), first = m.lv < 3; m.lv = Math.max(m.lv, 3); save.commit(); onChange && onChange(); if (first) K.grant({ crystal: 2 }, wrap); sfx("star");
      K.set(h("div", { class: "stack" }, K.celebrate(h("div", { class: "bigstars" }, "🔗"), h("h2", {}, "Level 3 done!"), h("p", {}, `${right} of ${map.branches.length + 1} links right first time. Links turn a list into understanding.`), K.bigbtn("▶ Level 4: my own map", () => play(r, 4)), backBtn())));
    }
    K.set(h("div", { class: "stack" }, K.mission("🔗 Name each link: pick the words that join the big idea to the branch, so it reads as a sentence."), wrap, fb, backBtn()));
    paint();
  }

  function ownLevel(r, map) {
    const m = M(r), own = m.own || { branches: [], cards: {} };
    let sel = null; const fb = h("div"), wrap = h("div");
    const bankWords = map.words.filter(w => !Object.keys(own.cards).includes(w));
    function paint() {
      const el = h("div", { class: "mm" }, h("div", { class: "mmc" }, map.centre),
        ...own.branches.map((b, i) => h("div", { class: "mmb", style: `--c:${COLORS[i % COLORS.length]}`, onclick: () => { if (sel) { own.cards[sel] = i; sel = null; sfx("correct"); paint(); } } },
          h("div", { class: "mmh" }, b), h("ul", {}, ...Object.entries(own.cards).filter(([c, at]) => at === i).map(([c]) => h("li", {}, c, " ", h("button", { class: "link", type: "button", "aria-label": "Take off", onclick: e => { e.stopPropagation(); delete own.cards[c]; paint(); } }, "✕")))))));
      const addB = h("input", { class: "ans", type: "text", placeholder: "a main branch, e.g. Cell parts", maxlength: 40, "aria-label": "New main branch" });
      const addC = h("input", { class: "ans", type: "text", placeholder: "my own card", maxlength: 60, "aria-label": "New card" });
      const free = map.words.filter(w => !(w in own.cards)).concat(Object.keys(own.extra || {}).filter(w => !(w in own.cards)));
      wrap.replaceChildren(el,
        h("div", { class: "row", style: "gap:8px;flex-wrap:wrap" }, addB, h("button", { class: "btn small", type: "button", onclick: () => { const v = addB.value.trim(); if (!v || own.branches.length >= 6) return; own.branches.push(v); paint(); } }, "＋ Branch")),
        h("div", { class: "small muted" }, own.branches.length ? "Tap a word, then tap its branch." : "Start by adding 3 to 5 main branches."),
        h("div", { class: "mmtray" }, ...free.map(w => h("button", { class: "mmcard" + (sel === w ? " sel" : ""), type: "button", onclick: () => { sel = sel === w ? null : w; paint(); } }, w))),
        h("div", { class: "row", style: "gap:8px;flex-wrap:wrap" }, addC, h("button", { class: "btn small", type: "button", onclick: () => { const v = addC.value.trim(); if (!v) return; own.extra = own.extra || {}; own.extra[v] = 1; sel = v; paint(); } }, "＋ Card")));
      m.own = own; save.commit();
    }
    const send = h("button", { class: "bigbtn go", type: "button", onclick: () => {
      const placedN = Object.keys(own.cards).length;
      if (own.branches.length < 3 || placedN < 6) { fb.className = "verdict mid"; fb.textContent = "Add at least 3 branches and place at least 6 cards first."; return; }
      const text = `${map.centre}\n` + own.branches.map((b, i) => `• ${b}: ${Object.entries(own.cards).filter(([c, at]) => at === i).map(([c]) => c).join(", ") || "(empty)"}`).join("\n");
      const st = S(); st.wr = st.wr || {}; st.wr.desk = st.wr.desk || [];
      st.wr.desk.push({ id: "m" + Date.now().toString(36), t: Date.now(), title: `My map: ${r.name}`, text, status: "waiting", map: mk(r) });
      const first = m.lv < 4; m.lv = 4; save.commit(); onChange && onChange(); if (first) K.grant({ crystal: 3 }, wrap); sfx("star");
      K.set(h("div", { class: "stack" }, K.celebrate(h("div", { class: "bigstars" }, "🗺️✨"), h("h2", {}, "Your own map!"), h("p", {}, "It's on the Writing desk for a grown-up to look at. You can change it here any time."), backBtn())));
    } }, "📮 Send my map to the Writing desk");
    K.set(h("div", { class: "stack" }, K.mission("🗺️ Your own map. You choose the main branches and where each idea goes. There's no single right map."), wrap, send, fb, backBtn()));
    paint();
  }

  /* parent corner: what he picked and wrote */
  function parentSection(dots, when) {
    const t = T(), spw = Object.entries(t.spw), ex = Object.entries(t.ex);
    if (!spw.length && !ex.length && !Object.keys(t.maps).length) return null;
    const day_ = k => { const tp = prog.topic(k); return tp ? `Day ${prog.dayNo(k)}` : k; };
    return h("section", { class: "stack pc-region" }, h("h3", {}, "🧠 Thinking tasks"),
      h("p", { class: "small muted" }, "Sentence, Phrase, Word after each lesson (bonus only), Explain it in the Brain check, and the Map Room mind-maps."),
      ...spw.map(([k, v]) => h("details", { class: "kitcard" }, h("summary", {}, `${when(v.t)} · ${day_(k)} · Sentence, Phrase, Word${v.expert ? " · 💎 matched the expert" : ""}`),
        h("p", { class: "small" }, h("b", {}, "Sentence: "), v.s, h("i", {}, " (" + v.rs.s + ")")), h("p", { class: "small" }, h("b", {}, "Phrase: "), v.p, h("i", {}, " (" + v.rs.p + ")")), h("p", { class: "small" }, h("b", {}, "Word: "), v.w, h("i", {}, " (" + v.rs.w + ")")))),
      ...ex.map(([k, v]) => h("details", { class: "kitcard" }, h("summary", {}, `${when(v.t)} · ${day_(k)} · Explain it · ${v.ok ? "✅" : "🔧"} (${v.by === "coach" ? "coach" : "keyword check"})`), h("p", { class: "wpiece" }, v.text))),
      ...regions().map(r => h("p", { class: "small" }, `🗺️ ${r.name} map: level ${M(r).lv} of 4 done`)),
      t.vault.length ? h("p", { class: "small" }, h("b", {}, "📒 Word Vault: "), t.vault.map(v => v.w).join(", ")) : null);
  }

  return { open, has, news, parentSection };
}
