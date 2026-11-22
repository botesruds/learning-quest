/* The day: the scout's briefing (lesson), gathering (Train and Challenge), riddles (understanding questions)
   and the Brain check, shown on a sheet beside the 3D fort. Every right answer drops materials.
   The phases, pass marks and messages are Algebra Quest's, unchanged; only the rewards and the setting are new. */
import { h, H, shuffle, pick, esc } from "./qcore.js";
import { LearnView, QuestionCard, UnderstandCard } from "./qui.js";
import { sfx } from "./audio.js";
import { MATS, PIECES } from "./pieces.js";
import { HEROES, PETS, makeHero, makePet } from "./models.js";
import { objThumb } from "./thumbs.js";

/* what each kind of answer earns (see the design document) */
export const LOOT = {
  learnTry: { wood: 1 },               // a "have a go" card in the lesson
  steps: { wood: 3 },                  // right with steps, no hints
  help: { wood: 2 },                   // right with a hint, a second try, or steps
  own: { stone: 2, iron: 1 },          // right first time on his own
  brain: { crystal: 1 },               // a Brain check (why-question) right
  riddleFirst: { crystal: 2 },         // an understanding question right first time
  riddleSecond: { crystal: 1 },
  streak: 3,                           // this many in a row on his own earns a tower plan
};
const PLANS = Object.keys(PIECES).filter(k => PIECES[k].bp);
const peek = (type, obj) => { window.__fdq = { type, obj }; };   // lets the automated play-test see the question on screen

export function createDay({ save, prog, stage, toast, onClose, onBuild, onLand, onChange, onNight, onFixCrack, onFixTopic, onHero, onVisit }) {
  const S = () => save.state;
  let sheet = null, body = null, lootbar = null, ctx = null;

  /* ---------- the sheet ---------- */
  const wide = () => innerWidth >= 980 && innerWidth / innerHeight > 1.15;
  function layout() { if (!sheet) return; const w = wide() ? sheet.getBoundingClientRect().width : 0; stage.setShift(0, w ? -w / 2 : 0); }
  function mountSheet() {
    if (sheet) sheet.remove();
    lootbar = h("div", { class: "lootbar", "aria-label": "Your materials" });
    body = h("div", { class: "sbody" });
    sheet = h("div", { class: "sheet daysheet", role: "dialog", "aria-label": "Today's lesson" }, h("div", { class: "shead" }), body);
    document.body.append(sheet); paintLoot(); layout(); addEventListener("resize", layout);
    document.body.classList.add("sheet-open");
  }
  function close(why) {
    if (!sheet) return; try { window.speechSynthesis && speechSynthesis.cancel(); } catch (e) {}
    sheet.remove(); sheet = null; ctx = null; removeEventListener("resize", layout); stage.setShift(0, 0);
    document.body.classList.remove("sheet-open"); onClose && onClose(why);
  }
  function head(parts) { sheet.querySelector(".shead").replaceChildren(...parts); }
  const closeBtn = (label = "✕ Fort") => h("button", { class: "btn small", type: "button", "aria-label": "Back to the fort", onclick: () => { sfx("click"); close("x"); } }, label);
  const set = el => { body.replaceChildren(el); body.scrollTop = 0; sheet.scrollTop = 0; };
  const mission = t => h("div", { class: "mission" }, t);
  const celebrate = (...kids) => h("div", { class: "card celebrate pop" }, ...kids);
  const bigbtn = (label, fn, cls = "go") => h("button", { class: "bigbtn " + cls, type: "button", onclick: () => { sfx("click"); fn(); } }, label);
  const linkbtn = (label, fn) => h("button", { class: "link", type: "button", onclick: fn }, label);

  /* ---------- loot ---------- */
  function paintLoot() {
    if (!lootbar) return;
    lootbar.replaceChildren(...["wood", "stone", "iron", "crystal", "gold"].map(m => h("span", { class: "lm", "data-m": m, title: MATS[m].name }, MATS[m].icon, h("b", {}, m === "gold" ? S().gold : S().mats[m] || 0))),
      h("span", { class: "lm", "data-m": "plan", title: "Tower plans" }, "📜", h("b", {}, PLANS.reduce((a, k) => a + (S().blueprints[k] || 0), 0))));
  }
  function grant(gift, from) {
    if (!gift) return;
    const got = [];
    for (const [m, n] of Object.entries(gift)) {
      if (!n) continue;
      if (m === "gold") S().gold += n; else if (m === "plan") { S().blueprints[n] = (S().blueprints[n] || 0) + 1; } else S().mats[m] = (S().mats[m] || 0) + n;
      if (ctx) { const k = m === "plan" ? "plan:" + n : m; ctx.loot[k] = (ctx.loot[k] || 0) + (m === "plan" ? 1 : n); }
      got.push(m === "plan" ? ["plan", `📜 ${PIECES[n].name} plan!`] : [m, `+${n} ${MATS[m].icon}`]);
    }
    save.commit(); paintLoot(); onChange && onChange();
    sfx(gift.crystal ? "star" : gift.iron || gift.stone ? "stone" : gift.plan ? "horn" : "wood"); setTimeout(() => sfx("coin"), 120);
    // flyers rise from the answer towards the loot bar
    const src = (from && from.isConnected ? from : body).getBoundingClientRect();
    got.forEach(([m, label], i) => {
      const target = lootbar.querySelector(`[data-m="${m}"]`); const tr = target ? target.getBoundingClientRect() : { left: src.left, top: 0, width: 0 };
      const el = h("div", { class: "flyer" + (m === "plan" ? " plan" : "") }, label); document.body.append(el);
      const x0 = src.left + Math.min(src.width - 60, 40 + i * 70), y0 = src.top + Math.min(src.height, 80);
      el.style.left = x0 + "px"; el.style.top = y0 + "px";
      requestAnimationFrame(() => requestAnimationFrame(() => { el.style.transform = `translate(${tr.left + tr.width / 2 - x0 - 20}px, ${tr.top - y0}px) scale(.7)`; el.style.opacity = "0.2"; }));
      setTimeout(() => { el.remove(); if (target) { target.classList.remove("bump"); void target.offsetWidth; target.classList.add("bump"); } }, 900 + i * 60);
    });
  }
  const nextPlan = () => { const k = PLANS[(S().planTurn || 0) % PLANS.length]; S().planTurn = (S().planTurn || 0) + 1; return k; };

  /* ---------- riddles (understanding questions) ---------- */
  function riddleFor(key) {
    const tp = prog.topic(key), list = (tp.pack.understanding || {})[tp.t.id] || []; if (!list.length) return null;
    const st = S().uq[key] || (S().uq[key] = { seen: [], right: 0 });
    let fresh = list.map((u, i) => i).filter(i => !st.seen.includes(i)); if (!fresh.length) { st.seen = []; fresh = list.map((u, i) => i); }
    const i = pick(fresh); return { u: list[i], i, st };
  }
  function riddle(key, then, intro) {
    const r = riddleFor(key); if (!r) return then(); peek("uq", r.u);
    const wrap = h("div", { class: "stack" }, mission(intro || "💎 Riddle of the day: show you understand WHY. Right answers earn crystal, the rarest loot."));
    const card = UnderstandCard(r.u, res => {
      r.st.seen.push(r.i); if (res !== "wrong") r.st.right++;
      prog.record(key, res === "first" ? "own" : res === "second" ? "help" : "wrong");
      if (res === "first") grant(LOOT.riddleFirst, card); else if (res === "second") grant(LOOT.riddleSecond, card); else { sfx("wrong"); save.commit(); }
    }, then, { nextLabel: "Carry on ▸" });
    wrap.append(card); set(wrap);
  }

  /* ---------- a topic ---------- */
  function open(key, o = {}) {
    key = String(key); const tp = prog.topic(key); if (!tp) return;
    if (!sheet) mountSheet();
    if (!ctx || ctx.key !== key) ctx = { key, loot: {}, own: 0, landBefore: o.landBefore };
    const ph = o.ph || prog.nextPhase(key);
    paintHead(key, ph);
    if (ph === "learn") learn(key, o.i || 0, o.back);
    else if (ph === "train") train(key, o.n || 3);
    else if (ph === "challenge") challenge(key, o.replay);
    else if (ph === "brain") nightPrompt(key);
    else if (ph === "invest") invest(key);
    else donePhase(key);
  }

  function paintHead(key, ph) {
    const tp = prog.topic(key);
    const T = tp.t, l = prog.L(key);
    const list = T.kind === "invest" ? [["learn", "📖 Lesson"], ["invest", "🕵️ Investigate"]] : [["learn", "📖 Lesson"], ["train", "🏋️ Train"], ["challenge", "⚔️ Challenge"], ["brain", "🧠 Brain check"]];
    const doneSet = new Set(); if (S().learnDone[key]) doneSet.add("learn"); if (l.train) doneSet.add("train"); if (l.stars >= 2) doneSet.add("challenge"); if (l.stars >= 3) { doneSet.add("brain"); doneSet.add("invest"); }
    const R = tp.region;
    head([h("div", { class: "row", style: "justify-content:space-between;align-items:flex-start;gap:8px" },
      h("div", { style: "min-width:0;flex:1" }, h("div", { class: "eyebrow" }, `${R ? R.emoji + " " + R.name + " · " : ""}Day ${prog.dayNo(key)}`), h("h2", {}, T.title)),
      closeBtn()),
      h("div", { class: "row", style: "justify-content:space-between" }, h("div", { class: "phases" }, ...list.map(([k, lab]) => h("span", { class: "ph" + (k === ph ? " cur" : doneSet.has(k) ? " done" : "") }, doneSet.has(k) && k !== ph ? "✓ " + lab.split(" ").slice(1).join(" ") : lab))),
        h("span", { class: "stars", "aria-label": `${l.stars || 0} of 3 stars` }, ...[0, 1, 2].map(i => h("span", { class: i < (l.stars || 0) ? "" : "off" }, "⭐")))),
      lootbar]);
  }

  function learn(key, i, back) {
    const T = prog.topic(key).t, first = !S().learnDone[key];
    set(h("div", { class: "stack" },
      mission(T.big ? "🌟 Scout's briefing: a big idea. Everything later is built on this, so take your time." : "📜 Scout's briefing: read each card. Answer the question on the card to move on."),
      LearnView(T.learn, i, j => learn(key, j, back), () => { S().learnDone[key] = true; save.commit(); open(key, { ph: back || undefined }); },
        j => { S().learned[key] = Math.max(S().learned[key] || 0, j); save.commit(); },
        back ? "Back to the " + (back === "brain" ? "Brain check" : back === "challenge" ? "Challenge" : "day") : "Start gathering",
        (ok, tries, card) => { if (ok && first) grant(LOOT.learnTry, card); })));
  }

  function train(key, count) {
    const T = prog.topic(key).t;
    let k = 0; const wrap = h("div", { class: "stack" }), area = h("div"), progEl = h("div", { class: "qprog" }); const res = [];
    const paint = () => progEl.replaceChildren(...Array.from({ length: count }, (_, i) => h("i", { class: { own: "own", steps: "stp", help: "hlp", wrong: "bad" }[res[i]] || "" })));
    function next() { paint(); if (k >= count) return finish(); const q = pick(T.gen)(); peek("steps", q); let card; card = QuestionCard(q, "steps", r => { res[k] = r; prog.record(key, r); if (r === "steps") grant(LOOT.steps, card); else if (r === "help") grant(LOOT.help, card); else sfx("wrong"); k++; paint(); }, next); area.replaceChildren(card); }
    function finish() {
      const l = prog.L(key); const first = !l.train; l.train = true; prog.giveStars(key, 1); prog.checkBadges(); save.commit(); onChange && onChange();
      if (first) sfx("star");
      const after = () => set(celebrate(h("div", { class: "bigstars" }, first ? "⭐" : "💪"), h("h2", {}, first ? "First star!" : "Training done!"),
        h("p", {}, "Now the Challenge: get 3 right on your own, with no steps."), bigbtn("⚔️ Start the Challenge", () => open(key, { ph: "challenge" }))));
      riddle(key, after);
    }
    wrap.append(mission(`🏋️ Gathering with steps: ${count} questions, one small step at a time. Mistakes are fine: you get a 💡 hint. Every right answer sends wood to the fort.`), progEl, area);
    set(wrap); next();
  }

  function challenge(key, replay) {
    const T = prog.topic(key).t, repair = !!S().repair[key];
    let hits = 0, misses = 0, perfect = true, row = 0; const wrap = h("div", { class: "stack" }), area = h("div"), meter = h("div", { class: "row" });
    const paint = () => meter.replaceChildren(h("b", {}, "Target: "), ...[0, 1, 2].map(i => h("span", { style: "font-size:1.8rem" }, i < hits ? "🎯" : "⚪")), h("span", { class: "muted small" }, misses ? `  ${misses} miss${misses > 1 ? "es" : ""} (3 misses and you train again)` : ""));
    function next() {
      paint(); if (hits >= 3) return win(); if (misses >= 3) return lose();
      const q = pick(T.gen)(); peek("own", q); let card;
      card = QuestionCard(q, "own", r => {
        prog.record(key, r);
        if (r === "own") { hits++; row++; grant(LOOT.own, card); if (row % LOOT.streak === 0) { const p = nextPlan(); setTimeout(() => { grant({ plan: p }, card); toast(`3 in a row on your own! You found a ${PIECES[p].name.toLowerCase()} plan 📜`); }, 700); } }
        else { misses++; perfect = false; row = 0; if (r === "help") grant(LOOT.help, card); else sfx("wrong"); }
        paint();
      }, next);
      area.replaceChildren(card);
    }
    function win() {
      const first = (prog.L(key).stars || 0) < 2; prog.giveStars(key, 2); const nb = []; if (perfect) { const b = prog.award("perfect"); if (b) nb.push(b); }
      if (repair) { delete S().repair[key]; save.commit(); onFixTopic && onFixTopic(key); }
      nb.push(...prog.checkBadges()); sfx("star"); onChange && onChange();
      const mastered = prog.L(key).stars >= 3;
      const after = () => set(celebrate(h("div", { class: "bigstars" }, repair ? "🔧✅" : first ? "⭐⭐" : "🎯"), h("h2", {}, repair ? "Weak spot repaired!" : first ? "Second star!" : "Challenge won!"),
        h("p", {}, repair ? "That wall is strong again. When every weak spot is repaired, you can face the demon lord again." : mastered ? "You already have all 3 stars here. Great practice, and more loot!" : "Tonight the demons attack! Your 🧠 Brain check is in the night's runes: questions about WHY it works. Build your defences first, then face the night."),
        ...nb.map(b => h("p", {}, `🏅 New badge: ${b.e} ${b.n}`)),
        ...(repair ? [bigbtn("🏰 Back to the fort", () => close("repaired"))] : mastered ? [bigbtn("Continue", () => open(key))] : nightButtons(key))));
      repair ? after() : riddle(key, after, "💎 Bonus riddle! Crystal for understanding WHY.");
    }
    function lose() {
      set(celebrate(h("div", { class: "bigstars" }, "🏋️"), h("h2", {}, "Not yet. Let's train a bit more!"), h("p", {}, "Two more questions with steps, then you can try the Challenge again. Every hero trains."),
        bigbtn("🏋️ Train 2 more", () => open(key, { ph: "train", n: 2 })), linkbtn("Or read the scout's briefing again", () => open(key, { ph: "learn", i: 0, back: "challenge" }))));
    }
    wrap.append(mission(repair ? "🔧 Repair: get 3 right on your own to fix this weak spot." : replay ? "⚔️ Gathering run: get 3 right on your own for extra loot." : "⚔️ Challenge: get 3 right on your own. No steps this time, like a test. Right first time earns stone and iron. Stuck? You can still ask for steps, but it won't count as a hit."), meter, area);
    set(wrap); next();
  }

  const nightButtons = key => [bigbtn("🔨 Build defences", () => { close("build"); onBuild && onBuild(); }, "blue"), bigbtn("🌙 Night falls", () => { close("night"); onNight && onNight(key); })];
  function nightPrompt(key) {
    set(celebrate(h("div", { class: "bigstars" }, "🌙"), h("h2", {}, "The night is coming"),
      h("p", {}, "Your 🧠 Brain check happens tonight: each rune is a question about WHY it works. Get 3 of the 4 right to earn the third star."),
      ...nightButtons(key), linkbtn("Read the scout's briefing first", () => open(key, { ph: "learn", i: 0, back: "brain" }))));
  }

  /* ---------- fix a cracked wall: 2 right on your own from that topic ---------- */
  function openRepair(crack) {
    const key = crack.topic, tp = prog.topic(key); if (!tp) return;
    if (!sheet) mountSheet(); ctx = { key, loot: {} };
    head([h("div", { class: "row", style: "justify-content:space-between;align-items:flex-start" }, h("div", {}, h("div", { class: "eyebrow" }, `🔧 Weak spot · Day ${prog.dayNo(key)}`), h("h2", {}, "Fix the cracked " + (crack.cell === "keep" ? "keep" : "wall"))), closeBtn()), lootbar]);
    const T = tp.t; let hits = 0, tries = 0; const wrap = h("div", { class: "stack" }), area = h("div"), meter = h("div", { class: "row" });
    const paint = () => meter.replaceChildren(h("b", {}, "Repairs: "), ...[0, 1].map(i => h("span", { style: "font-size:1.8rem" }, i < hits ? "🧱" : "⚪")));
    function next() {
      paint(); if (hits >= 2) return done();
      tries++;
      if (!T.gen || !T.gen.length) { hits = 2; return done(); }
      const q = pick(T.gen)(); peek("own", q); let card;
      card = QuestionCard(q, "own", r => { prog.record(key, r); if (r === "own") { hits++; grant(LOOT.own, card); } else sfx("wrong"); paint(); }, next);
      area.replaceChildren(card);
    }
    function done() {
      onFixCrack && onFixCrack(crack.cell); sfx("repair");
      set(celebrate(h("div", { class: "bigstars" }, "🧱✨"), h("h2", {}, "Crack fixed!"), h("p", {}, `Your ${crack.cell === "keep" ? "keep" : "wall"} is strong again. Practising "${T.short}" again is exactly how you remember it.`), bigbtn("🏰 Back to the fort", () => close("fixed"))));
    }
    wrap.append(mission(`🔧 A wrong answer cracked this ${crack.cell === "keep" ? "keep" : "wall"}. Get 2 right on your own about "${T.short}" to fix it. Demons go for cracks first!`), meter, area);
    set(wrap); next();
  }

  /* ---------- the morning after a night ---------- */
  /* after a demon lord's siege */
  function siegeMorning(r) {
    if (!sheet) mountSheet(); ctx = { key: null, loot: {} };
    const name = cap(r.lord.name), nb = [];
    if (r.won) { const b = prog.award(r.lord.badge || (r.fin ? "final" : "")); if (b) nb.push(b); nb.push(...prog.checkBadges()); }
    const i = prog.road.findIndex(n => (n.t === "lord" || n.t === "final") && n.region === r.region), nxt = prog.road.slice(i + 1).find(n => n.t !== "chest");
    const nextRegion = nxt && nxt.region && nxt.region !== r.region ? nxt.region : null;
    head([h("div", { class: "row", style: "justify-content:space-between;align-items:flex-start" }, h("div", {}, h("div", { class: "eyebrow" }, `☀️ Morning · ${r.region.emoji} ${r.region.name}`), h("h2", {}, r.won ? `${name} is beaten!` : `${name} retreats… for now`)), closeBtn()), lootbar]);
    const st = save.status(); onChange && onChange(); paintLoot();
    const repairs = r.wrong.filter(k => prog.topic(k)).sort((a, b) => prog.dayNo(a) - prog.dayNo(b));
    set(celebrate(h("div", { class: "bigstars" }, r.won ? (r.fin ? "🏆" : "🏅") : "🌅"),
      h("h1", {}, r.won ? `You beat ${r.lord.name}!` : `${r.hits} hits. ${r.need} were needed.`),
      h("div", { class: "nightstats" },
        h("span", { class: "lm" }, `💥 ${r.hits} of ${r.total} hits`), h("span", { class: "lm" }, `👾 ${r.kills} defeated`),
        r.gold ? h("span", { class: "lm" }, `🪙 +${r.gold}`) : null, r.crystal ? h("span", { class: "lm" }, `💎 +${r.crystal}`) : null),
      r.won ? h("p", { style: "font-weight:800" }, r.fin ? (prog.pack.champion || "You are a champion.") + " You're ready for the test." : nextRegion ? `🔓 ${nextRegion.emoji} ${nextRegion.name} is open! Build a new fort there in a new style. Your materials, gold and plans come with you, and your ${r.region.name} fort stays just as you built it.` : "🔓 The next part of the quest is open!")
        : h("p", {}, "The demon lord cracked your walls where you missed. Repair these days (3 right on your own each), then face the lord again:"),
      !r.won && repairs.length ? h("div", { class: "row", style: "justify-content:center;flex-wrap:wrap;gap:8px" }, ...repairs.map(k => h("span", { class: "lm" }, `🔧 Day ${prog.dayNo(k)}: ${prog.topic(k).t.short}`))) : null,
      r.won && r.cracks.length ? h("p", { class: "cracknews" }, `💜 ${r.cracks.length} weak spot${r.cracks.length > 1 ? "s" : ""} cracked. Fix ${r.cracks.length > 1 ? "them" : "it"} from the dawn screen with 2 right answers.`) : null,
      ...nb.map(b => h("p", {}, `🏅 New badge: ${b.e} ${b.n}`)),
      h("p", { class: "savedok" }, st.mode === "practice" ? "💾 Saved on this device" : "💾 Game saved"),
      bigbtn(r.won ? "▶ Carry on" : "🔧 Start repairing", () => close("next")),
      linkbtn("Stop here for today", () => close("stop"))));
    if (r.won) sfx("star");
  }

  function morning(r) {
    if (r.siege) return siegeMorning(r);
    const key = r.key, tp = prog.topic(key); if (!sheet) mountSheet(); ctx = { key, loot: {} };
    let up = 0, nb = [], land = null, unlockTxt = "";
    if (r.passed) {
      up = prog.giveStars(key, 3); nb = prog.checkBadges(); land = onLand ? onLand() : null;
      const i = prog.road.findIndex(n => n.t === "level" && n.key === key); const nxt = prog.road.slice(i + 1).find(n => n.t !== "chest");
      unlockTxt = !nxt ? "" : nxt.t === "level" ? `🔓 Day ${prog.dayNo(nxt.key)}: ${prog.topic(nxt.key).t.short} is unlocked!` : nxt.t === "lord" ? `👹 ${cap(nxt.region.lord.name)} is gathering his army…` : "🐉 The Final Castle is open!";
    }
    paintHead(key, r.passed ? "done" : "brain");
    head([h("div", { class: "row", style: "justify-content:space-between;align-items:flex-start" }, h("div", {}, h("div", { class: "eyebrow" }, `☀️ Morning · Day ${prog.dayNo(key)}`), h("h2", {}, tp.t.title)), closeBtn()), lootbar]);
    const st = save.status(); onChange && onChange(); paintLoot();
    set(celebrate(h("div", { class: "bigstars" }, r.passed ? "⭐⭐⭐" : "🌅"), h("h1", {}, r.passed ? `Day ${prog.dayNo(key)} mastered!` : "You survived the night!"),
      h("div", { class: "nightstats" },
        h("span", { class: "lm" }, `👾 ${r.kills} defeated`), r.bumps ? h("span", { class: "lm" }, `🏰 ${r.bumps} reached the keep`) : null,
        h("span", { class: "lm" }, `🧠 Brain check ${r.brain.right} of ${r.brain.total}`), r.gold ? h("span", { class: "lm" }, `🪙 +${r.gold}`) : null, r.crystal ? h("span", { class: "lm" }, `💎 +${r.crystal}`) : null),
      r.passed ? h("p", {}, "You can do it on your own AND you know why it works.") : h("p", {}, `The Brain check needs 3 right. Read the scout's briefing again (the answers are all in there), then face the night again.`),
      r.cracks.length ? h("p", { class: "cracknews" }, `💜 ${r.cracks.length} weak spot${r.cracks.length > 1 ? "s" : ""} cracked. Fix ${r.cracks.length > 1 ? "them" : "it"} from the dawn screen with 2 right answers.`) : null,
      land ? h("p", { class: "landnews" }, `🚩 New land claimed! Your fort can now be ${land} × ${land} squares.`) : null,
      unlockTxt ? h("p", { style: "font-weight:800" }, unlockTxt) : null, ...nb.map(b => h("p", {}, `🏅 New badge: ${b.e} ${b.n}`)),
      h("p", { class: "savedok" }, st.mode === "practice" ? "💾 Saved on this device" : "💾 Game saved"),
      r.passed ? bigbtn("▶ Next day", () => close("next")) : bigbtn("📜 Read the briefing again", () => open(key, { ph: "learn", i: 0, back: "brain" })),
      r.passed ? null : bigbtn("🌙 Face the night again", () => { close("night"); onNight && onNight(key); }, "blue"),
      linkbtn("Stop here for today", () => close("stop"))));
    sfx(r.passed ? "star" : "rooster");
  }

  function invest(key) {
    const tp = prog.topic(key), fn = tp.pack.special && tp.pack.special.invest; if (!fn) return donePhase(key);
    const rec = (id, r) => { prog.record(key, r); if (r === "own") grant(LOOT.own); else if (r === "help") grant(LOOT.help); };
    set(fn(res => { const st = res.own >= 5 ? 3 : res.own >= 3 ? 2 : 1; prog.giveStars(key, st); if (st >= 3) return complete(key); open(key); }, tp.t.id, rec));
  }

  function donePhase(key) {
    set(celebrate(h("div", { class: "bigstars" }, "⭐⭐⭐"), h("h2", {}, "Mastered!"), h("p", {}, "Play again to gather more loot, or read the briefing again."),
      bigbtn(prog.topic(key).t.kind === "invest" ? "🕵️ New investigation" : "⚔️ Gathering run for loot", () => open(key, { ph: prog.topic(key).t.kind === "invest" ? "invest" : "challenge", replay: true })),
      bigbtn("📜 Read the briefing again", () => open(key, { ph: "learn", i: 0 }), "plain"),
      linkbtn("Back to the fort", () => close("x"))));
  }

  /* ---------- a day is won ---------- */
  function complete(key) {
    const nb = prog.checkBadges(); save.commit(); sfx("star"); onChange && onChange(); paintHead(key, "done");
    const i = prog.road.findIndex(n => n.t === "level" && n.key === key); const nxt = prog.road.slice(i + 1).find(n => n.t !== "chest");
    const unlockTxt = !nxt ? "" : nxt.t === "level" ? `🔓 Day ${prog.dayNo(nxt.key)}: ${prog.topic(nxt.key).t.short} is unlocked!` : nxt.t === "lord" ? `👹 ${cap(nxt.region.lord.name)} is gathering his army…` : "🐉 The Final Castle is open!";
    const land = onLand ? onLand() : null;
    const lootRow = h("div", { class: "lootsum" }, ...Object.entries(ctx ? ctx.loot : {}).map(([m, n]) => h("span", { class: "lm" }, m.startsWith("plan:") ? "📜 " + PIECES[m.slice(5)].name + (n > 1 ? " ×" + n : "") : MATS[m].icon + " " + n)));
    const st = save.status();
    set(celebrate(h("div", { class: "bigstars" }, "⭐⭐⭐"), h("h1", {}, `Day ${prog.dayNo(key)} mastered!`), h("p", {}, "You can do it on your own AND you know why it works."),
      lootRow.children.length ? h("div", {}, h("p", { class: "small muted" }, "Loot gathered today:"), lootRow) : null,
      land ? h("p", { class: "landnews" }, `🚩 New land claimed! Your fort can now be ${land} × ${land} squares.`) : null,
      h("p", { style: "font-weight:800" }, unlockTxt), ...nb.map(b => h("p", {}, `🏅 New badge: ${b.e} ${b.n}`)),
      h("p", { class: "savedok" }, st.mode === "practice" ? "💾 Saved on this device" : "💾 Game saved"),
      bigbtn("🔨 Build with your loot", () => { close("build"); onBuild && onBuild(); }),
      linkbtn("Stop here for today", () => close("stop"))));
  }
  const cap = s => s[0].toUpperCase() + s.slice(1);

  /* ---------- scout reports (treasure chests: previews of upcoming class topics) ---------- */
  function openChest(pack, r, i = 0) {
    if (!sheet) mountSheet(); ctx = null;
    const p = pack.previews[r.n], ck = prog.chestKey(pack, r);
    head([h("div", { class: "row", style: "justify-content:space-between;align-items:flex-start" }, h("div", {}, h("div", { class: "eyebrow" }, "📜 Scout report · sneak peek"), h("h2", {}, p.title.replace("Coming up: ", ""))), closeBtn()), lootbar]);
    set(h("div", { class: "stack" }, mission("📜 A 5-minute peek at what's coming up in class. Open it any time."),
      LearnView(p.cards, i, j => openChest(pack, r, j), () => { const first = !S().chests[ck]; S().chests[ck] = true; if (first) grant({ gold: 20 }); else save.commit(); setTimeout(() => close("chest"), first ? 700 : 0); }, null, S().chests[ck] ? "Done" : "Collect 20 🪙")));
  }

  /* ---------- the quest map: every region and day, with stars ---------- */
  function openMap() {
    if (!sheet) mountSheet(); ctx = null;
    head([h("div", { class: "row", style: "justify-content:space-between;align-items:center" }, h("h2", {}, "📜 Quest map"), closeBtn()), lootbar]);
    const cur = prog.currentNode();
    const blocks = prog.regions.map(({ pack, r }) => {
      const nodes = prog.road.filter(n => n.pack === pack && n.region === r);
      const tiles = nodes.map(n => {
        const open = prog.nodeOpen(n), done = prog.nodeDone(n), isCur = cur && cur.t === n.t && cur.key === n.key && cur.region === n.region;
        if (n.t === "chest") return h("button", { class: "qtile chest" + (done ? " done" : ""), type: "button", onclick: () => openChest(pack, r) }, h("span", { class: "z" }, "📜"), h("span", { class: "nm" }, "Scout report"), h("span", { class: "kind" }, done ? "read" : "sneak peek"));
        if (n.t === "level") { const tp = prog.topic(n.key), st = prog.stars(n.key), rep = S().repair[n.key];
          return h("button", { class: "qtile" + (open ? "" : " locked") + (isCur ? " next" : "") + (tp.t.big ? " big" : ""), type: "button", "aria-label": `Day ${prog.dayNo(n.key)}: ${tp.t.short}. ${st} stars.${open ? "" : " Locked."}`,
            onclick: () => { if (!open) { sfx("wrong"); toast("Get 3 stars on the day before to open this one."); return; } sfx("click"); open_(n.key); } },
            h("span", { class: "z" }, String(prog.dayNo(n.key))), h("span", { class: "nm" }, tp.t.short), h("span", { class: "st" }, rep ? "🔧 repair" : "⭐".repeat(st) + "☆".repeat(3 - st))); }
        const lord = n.t === "lord" ? r.lord : r.final;
        return h("button", { class: "qtile lord" + (open ? "" : " locked") + (done ? " done" : ""), type: "button", onclick: () => toast(done ? `You beat ${lord.name}!` : open ? `${cap(lord.name)} is waiting. Face him from the dawn screen.` : "Master every day in this region first.") }, h("span", { class: "z" }, n.t === "final" ? "🐉" : "👹"), h("span", { class: "nm" }, cap(lord.name)), h("span", { class: "kind" }, done ? "beaten" : "demon lord"));
      });
      const locked = !nodes.some(n => n.t !== "chest" && prog.nodeOpen(n));
      const fk = r.look || r.n, F = S().forts && S().forts[fk], built = F && F.pieces && F.pieces.length;
      const here = cur && cur.region && (cur.region.look || cur.region.n) === fk;
      const visit = !locked && built && !here && onVisit ? h("button", { class: "btn small blue", type: "button", onclick: () => { sfx("click"); onVisit(fk); } }, "🏰 Visit this fort") : null;
      return h("section", { class: "qregion" + (locked ? " lockedr" : "") }, h("div", { class: "row", style: "justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap" }, h("h3", {}, `${r.emoji} ${r.name}`), visit), h("p", { class: "small muted" }, r.blurb), h("div", { class: "qtiles" }, ...tiles));
    });
    set(h("div", { class: "stack" }, ...blocks));
  }
  const open_ = key => { ctx = null; open(key); };

  /* the hero shop: gold buys a new look for the commander and a pet. Rewards only: nothing here opens a day. */
  function openShop() {
    if (!sheet) mountSheet(); ctx = null;
    head([h("div", { class: "row", style: "justify-content:space-between;align-items:center" }, h("h2", {}, "🛡️ Hero shop"), closeBtn()), lootbar]); paintLoot();
    const S_ = S(); S_.owned = S_.owned || ["knight"]; S_.pets = S_.pets || [];
    const tile = (it, owned, on, buy, wear, pic) => h("div", { class: "shopitem" + (on ? " on" : "") },
      h("img", { src: pic, alt: "" }), h("b", {}, it.name),
      on ? h("span", { class: "muted small" }, "✓ Wearing") : owned ? h("button", { class: "btn small", type: "button", onclick: wear }, "Choose")
        : h("button", { class: "btn small primary", type: "button", disabled: S_.gold < it.price, onclick: buy }, `🪙 ${it.price}`));
    const buyIt = (list, it, then) => { if (S_.gold < it.price) return; S_.gold -= it.price; list.push(it.id); then(); sfx("star"); toast(`You got the ${it.name}!`); };
    const paint = () => {
      const heroes = HEROES.map(it => tile(it, S_.owned.includes(it.id), S_.hero === it.id, () => buyIt(S_.owned, it, () => wearH(it)), () => wearH(it), pics[it.id] || (pics[it.id] = objThumb(makeHero(it.look), 112, true))));
      const pets = PETS.map(it => tile(it, S_.pets.includes(it.id), S_.pet === it.id, () => buyIt(S_.pets, it, () => wearP(it)), () => wearP(it), pics["p" + it.id] || (pics["p" + it.id] = objThumb(makePet(it.id), 112, true))));
      set(h("div", { class: "stack" }, h("p", {}, "Spend your gold on a new look for your commander, or a pet to keep him company on the keep. Gold comes from stars, scout reports, demons and demon lords."),
        h("h3", {}, "Commanders"), h("div", { class: "shopgrid" }, ...heroes),
        h("h3", {}, "Pets"), h("div", { class: "shopgrid" }, ...pets, S_.pet ? h("button", { class: "link", type: "button", onclick: () => { S_.pet = ""; save.commit(); onHero && onHero(); paint(); } }, "No pet for now") : null)));
      paintLoot();
    };
    const wearH = it => { S_.hero = it.id; save.commit(); onHero && onHero(); paint(); };
    const wearP = it => { S_.pet = it.id; save.commit(); onHero && onHero(); paint(); };
    paint();
  }
  const pics = {};

  /* ---------- parent corner: behind a grown-up sum, like Algebra Quest ---------- */
  function openParentGate() {
    if (!sheet) mountSheet(); ctx = null;
    const a = 11 + Math.floor(Math.random() * 9), b = 11 + Math.floor(Math.random() * 9);
    head([h("div", { class: "row", style: "justify-content:space-between;align-items:center" }, h("h2", {}, "⚙️ For grown-ups"), closeBtn("✕ Back"))]);
    const inp = h("input", { class: "ans", type: "text", inputmode: "numeric", "aria-label": "Answer" });
    const go = () => { if (Number(String(inp.value).replace(/\s/g, "")) === a * b) openParent(); else { inp.classList.add("no"); sfx("wrong"); } };
    inp.addEventListener("keydown", e => { if (e.key === "Enter") go(); }); inp.addEventListener("input", () => inp.classList.remove("no"));
    set(h("div", { class: "stack" }, h("p", {}, `To open the parent corner, work out ${a} × ${b}.`), h("div", { class: "row", style: "gap:8px;flex-wrap:wrap" }, inp, h("button", { class: "btn primary", type: "button", onclick: go }, "Open"))));
    setTimeout(() => inp.focus(), 30);
  }
  const dotKind = r => r === "own" ? "own" : /st/.test(r) ? "stp" : /h/.test(r) ? "hlp" : "bad";
  const dots = key => h("span", { class: "rdots", title: "Most recent answers, newest on the right" }, ...(S().hist[key] || []).slice(-8).map(x => h("i", { class: dotKind(x.r) })));
  const when = t => new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  function openParent() {
    if (!sheet) mountSheet(); ctx = null;
    head([h("div", { class: "row", style: "justify-content:space-between;align-items:center" }, h("div", {}, h("div", { class: "eyebrow" }, `${prog.pack.subject} · ${prog.pack.unit}`), h("h2", {}, "⚙️ Parent corner")), closeBtn("✕ Back to the game"))]);
    const paint = () => {
      const parts = [h("div", { class: "card small pc-how" }, h("b", {}, "How progress is earned"),
        h("p", { class: "small muted" }, "This shows the subject being played. Open the other subject from the home page to see its progress."), h("p", {}, "Each day is one topic. ⭐ 1: the briefing and 3 step-by-step questions. ⭐ 2: 3 right on his own before 3 misses. ⭐ 3: the Brain check at night, 3 of 4 'why' questions right. The next day only opens at 3 stars."),
        h("p", {}, "Each land ends with a demon lord: 8 quick questions plus 2 'why' questions, 8 hits to win. Every miss marks that day for repair, and he must pass its Challenge again before the rematch. The next land only opens after the lord is beaten. The final boss is the practice exam (13 of 16)."),
        h("p", { class: "row", style: "gap:6px;flex-wrap:wrap;align-items:center" }, "Recent answers: ", h("span", { class: "rdots" }, h("i", { class: "own" })), "on his own ", h("span", { class: "rdots" }, h("i", { class: "stp" })), "with steps ", h("span", { class: "rdots" }, h("i", { class: "hlp" })), "second try ", h("span", { class: "rdots" }, h("i", { class: "bad" })), "wrong"))];
      prog.regions.forEach(({ pack, r }) => {
        const rows = prog.road.filter(n => n.pack === pack && n.region === r && n.t === "level").map(n => {
          const tp = prog.topic(n.key), st = prog.stars(n.key), rep = S().repair[n.key], seen = S().last[n.key];
          return h("div", { class: "pc-row" }, h("b", { class: "pc-day" }, String(prog.dayNo(n.key))),
            h("div", { class: "pc-t" }, h("b", {}, tp.t.title), h("div", { class: "small muted" }, rep ? "🔧 Marked for repair by a demon lord" : seen ? "Last practised " + when(seen) : "Not started")),
            h("span", { class: "pc-st", "aria-label": st + " stars" }, "⭐".repeat(st) + "☆".repeat(3 - st)), dots(n.key));
        });
        const ck = prog.chestKey(pack, r), cb = h("input", { type: "checkbox" }); cb.checked = !!S().classNow[ck];
        cb.addEventListener("change", () => { S().classNow[ck] = cb.checked; save.commit(); onChange && onChange(); });
        const lk = r.final ? prog.finalKey(pack) : prog.lordKey(pack, r), bs = S().bosses[lk], lord = r.final || r.lord;
        parts.push(h("section", { class: "stack pc-region" }, h("div", { class: "row", style: "justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap" }, h("h3", {}, `${r.emoji} ${r.name}`),
          h("label", { class: "pc-check" }, cb, "Open this land now (class is doing it)")), ...rows,
          lord ? h("p", { class: "small" }, `${r.final ? "🐉" : "👹"} ${cap(lord.name)}: ${bs ? (bs.won ? "beaten" : "not beaten yet") + `, best ${bs.best} hits` : "not faced yet"}`) : null));
      });
      const ex = (S().exams || []).filter(e => (e.pack || "algebra-u3") === prog.pack.id);
      if (ex.length) parts.push(h("div", { class: "card small" }, h("b", {}, `Practice exam (${prog.pack.regions.find(r => r.final) ? cap(prog.pack.regions.find(r => r.final).final.name) : "final boss"}) attempts`), h("p", {}, ex.slice(-6).map(e => `${when(e.t)}: ${e.score}/${e.total}`).join(" · "))));
      let armed = false;
      const ub = h("button", { class: "btn small", type: "button", onclick: () => { if (S().unlockAll) { S().unlockAll = false; save.commit(); onChange && onChange(); paint(); return; } if (!armed) { armed = true; ub.textContent = "Tap again to open every day"; return; } S().unlockAll = true; save.commit(); onChange && onChange(); paint(); } }, S().unlockAll ? "Lock days to mastery again" : "Open every day");
      const st = save.status();
      parts.push(h("div", { class: "card small stack" }, h("b", {}, "Settings"), h("div", {}, ub),
        h("p", { class: "small muted" }, "Opening every day skips the mastery lock. Use it only if he needs to jump ahead for class. Demon lords still need their 8 hits."),
        h("p", { class: "small muted" }, st.mode === "practice" ? "This is a practice save: it stays on this device only." : "Progress saves online automatically for this player.")));
      set(h("div", { class: "stack" }, ...parts));
    };
    paint();
  }

  /* the sheet's helpers, for other screens that live on the same sheet (the Library tower) */
  const kit = () => { if (!sheet) mountSheet(); ctx = { key: null, loot: {} }; paintLoot(); return { head, set, closeBtn, mission, celebrate, bigbtn, linkbtn, grant, lootbar }; };

  return { kit, open: open_, openChest, openMap, openShop, openParentGate, openParent, openRepair, morning, close, grant, get isOpen() { return !!sheet; }, paintLoot };
}
