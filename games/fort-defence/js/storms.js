/* Valley storms: now and then weather rolls into Oliver's Valley, and he defends it with a mixed quiz.
   - From the Village era on (6 things mastered), about every 3 days he plays (the parent corner can make it every 7, or off).
     Never while a demon lord is waiting. The day before, Wren the weather-watcher gives a warning on the fort screen.
   - Four kinds, taken in turn: thunderstorm, flood, locust swarm, rockslide. Only the look and the words change.
   - The storm waits for him: nothing happens until he taps "Face the storm". There is no clock, and ignoring it does no harm.
   - 8 questions mixing every subject, only from days he has mastered (3 stars), weighted to what he is shakier on or hasn't
     seen for a while (the armoury's review cards: struggling, due, low box; else his miss rate), and how long since he saw it.
     A question from a review card that is due or struggling also counts as that card's review.
     Each starts with "Which topic is this?" (naming the idea is half the battle), then the question itself.
   - Right (on his own or on the second try): the villagers defend that topic's building and he sees it happen.
     6 of 8 keeps the whole valley safe, earns gold and a keepsake statue in the town square.
   - Wrong: the storm puts a tarp on that topic's roof. Two right on his own mends it (tap the building, or the fort screen notice).
     Stars, buildings and progress are never taken away.
   - Saves only S.storm = { v, every, from, pending, count, tarps: {key: {kind, at}}, statues: [{kind, at}], log: [...] }. */
import { valleyModel } from "./valley.js";
import { PACKS } from "../packs/index.js";
import { pick, shuffle, esc, qStem } from "./qcore.js";
import { QuestionCard } from "./qui.js";

export const KINDS = {
  storm: { e: "🌩️", name: "Thunderstorm", coming: "Dark clouds are piling up over the hills.", fx: "rain", def: ["The lightning rod catches the bolt!", "Shutters slam shut just in time!", "The villagers tie the roof down tight!"], hit: "The wind ripped part of the roof", statue: "⚡ Storm Stone" },
  flood: { e: "🌊", name: "Flood", coming: "The river is rising fast after the rains.", fx: "rain", def: ["Sandbags hold the water back!", "The villagers dig a ditch and the water drains away!", "The new wall keeps the river out!"], hit: "Water got in under the roof", statue: "🌊 Flood Post" },
  locusts: { e: "🦗", name: "Locust swarm", coming: "A buzzing cloud is heading for the fields.", fx: "swarm", def: ["Nets go up over the roof!", "Smoke from the fires drives the swarm away!", "The villagers bang pots and the swarm flies off!"], hit: "The swarm chewed through the thatch", statue: "🦗 Swarm Bell" },
  rockslide: { e: "🪨", name: "Rockslide", coming: "Rocks are loose on the mountain after the rain.", fx: "dust", def: ["A stone wall stops the rocks!", "The rocks bounce off the strong roof!", "The villagers shore up the hillside just in time!"], hit: "A rock cracked the roof", statue: "🪨 Rock Cairn" },
};
const ORDER = ["storm", "flood", "locusts", "rockslide"];
const QN = 8, PASS = 6;
export const STORM_OPTIONS = [{ v: 3, label: "Every 3 days he plays" }, { v: 7, label: "Every 7 days he plays" }, { v: 0, label: "Off" }];

export function createStorms({ h, save, prog, cards = null, valley, toast, sfx = () => {} }) {
  const S = () => save.state;
  const today = () => new Date().toISOString().slice(0, 10);
  const st = () => { const s = S().storm || (S().storm = { v: 1, every: 3, from: null, pending: null, count: 0, tarps: {}, statues: [], log: [] }); s.tarps = s.tarps || {}; s.statues = s.statues || []; s.log = s.log || []; if (s.every == null) s.every = 3; return s; };

  /* ---------- which days can be asked: mastered (3 stars) days with quick questions, from every subject ---------- */
  const usable = k => { const tp = prog.topic(k); return tp && tp.t.gen && tp.t.gen.length && !tp.t.kind; };
  const stars = k => (S().lv[k] && S().lv[k].stars) || 0;
  function pool() {
    const out = []; PACKS.forEach(p => p.topics.forEach(t => { const k = (p.keyPrefix || "") + t.id; if (stars(k) >= 3 && usable(k)) out.push(k); })); return out;
  }
  const subj = k => prog.topic(k).pack.subject;
  const labelOf = k => `${subj(k)} · Day ${prog.dayNo(k)}: ${prog.topic(k).t.short}`;
  /* the armoury's review cards for a day (js/cards.js): the skill cards that are due or struggling are the ones worth asking */
  function cardInfo(k) {
    if (!cards) return null;
    try { const t0 = cards.today(), defs = cards.cardsOf(k).filter(d => d.kind === "skill");
      const recs = defs.map(d => ({ d, r: cards.rec(d.id) })).filter(x => x.r);
      return { want: recs.filter(x => x.r.due <= t0 || cards.struggling(x.r)), struggling: recs.some(x => cards.struggling(x.r)), due: recs.some(x => x.r.due <= t0), low: recs.some(x => x.r.b <= 2) };
    } catch (e) { return null; }
  }
  function weight(k) {
    const age = (Date.now() - ((S().last || {})[k] || 0)) / 864e5, tarp = st().tarps[k] ? 1 : 0, ci = cardInfo(k);
    if (ci) return 1 + (ci.struggling ? 3 : 0) + (ci.due ? 2 : 0) + (ci.low ? 1 : 0) + Math.min(2, age / 7) + tarp;
    const hs = (S().hist[k] || []).slice(-10), miss = hs.length ? hs.filter(x => x.r !== "own").length / hs.length : 0.3;
    return 1 + 3 * miss + Math.min(2, age / 7) + tarp;
  }
  /* 8 keys: weighted picks without repeats while there are enough days, both subjects in the mix, never the same day twice in a row */
  function chooseKeys() {
    const all = pool(); if (!all.length) return [];
    let bag = [];
    const draw = src => { const ws = src.map(weight), tot = ws.reduce((a, b) => a + b, 0); let r = Math.random() * tot, i = 0; while (i < src.length - 1 && (r -= ws[i]) > 0) i++; return src[i]; };
    const cap = Math.ceil(QN / all.length);
    while (bag.length < QN) { const left = all.filter(k => !bag.includes(k)), room = all.filter(k => bag.filter(b => b === k).length < cap); bag.push(draw(left.length ? left : room.length ? room : all)); }
    const subs = [...new Set(all.map(subj))];
    subs.forEach(s => { const have = bag.filter(k => subj(k) === s).length, want = Math.min(2, all.filter(k => subj(k) === s).length);
      for (let n = have; n < want; n++) { const mine = all.filter(k => subj(k) === s && !bag.includes(k)).sort((a, b) => weight(b) - weight(a))[0] || all.find(k => subj(k) === s);
        const counts = {}; bag.forEach(k => (counts[subj(k)] = (counts[subj(k)] || 0) + 1));
        const big = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0], at = bag.map((k, j) => [k, j]).filter(([k]) => subj(k) === big).sort((a, b) => weight(a[0]) - weight(b[0]))[0];
        if (at && big !== s) bag[at[1]] = mine; } });
    for (let t = 0; t < 80; t++) { bag = shuffle(bag); if (bag.every((k, i) => !i || k !== bag[i - 1])) break; }
    return bag;
  }

  /* ---------- the schedule ---------- */
  function playDaysSince(from) { const d = new Set(S().days || []); d.add(today()); return [...d].filter(x => x > from).length; }
  const lordWaiting = () => { try { const c = prog.currentNode(); return c && (c.t === "lord" || c.t === "final"); } catch (e) { return false; } };
  /* worked out on the fort screen: "storm" (waiting for him), "warn" (tomorrow), or null. Saves only when something starts. */
  function status() {
    const s = st();
    if (s.pending) return lordWaiting() ? null : { state: "storm", kind: s.pending.kind };
    if (!s.every) return null;
    if (valleyModel(S()).era < 1 || pool().length < 3 || lordWaiting()) return null;
    if (!s.from) { s.from = today(); save.commit(); return null; }
    const n = playDaysSince(s.from);
    if (n >= s.every) { s.pending = { kind: ORDER[(s.count || 0) % ORDER.length], at: today() }; save.commit(); return { state: "storm", kind: s.pending.kind }; }
    if (n === s.every - 1) return { state: "warn", kind: ORDER[(s.count || 0) % ORDER.length] };
    return null;
  }
  const tarpKeys = () => Object.keys(st().tarps).filter(k => prog.topic(k));
  /* the one line on the fort screen (or null) */
  function dawnLine() {
    const sNow = status(), K = sNow && KINDS[sNow.kind];
    if (sNow && sNow.state === "storm") return h("p", { class: "vgrew vstorm" }, `${K.e} A ${K.name.toLowerCase()} is coming to your valley!`, h("button", { class: "btn small", type: "button", onclick: () => { sfx("horn"); face(); } }, "Face it"));
    const tk = tarpKeys();
    if (tk.length) return h("p", { class: "vgrew vtarp" }, `🧰 ${tk.length} roof${tk.length > 1 ? "s" : ""} in your valley need${tk.length > 1 ? "" : "s"} mending.`, h("button", { class: "btn small", type: "button", onclick: () => { sfx("click"); valley.open({ then: () => valley.showTarp && valley.showTarp(tk[0]) }); } }, "Mend"));
    if (sNow && sNow.state === "warn") return h("p", { class: "vgrew vwarn" }, `🔭 Wren the weather-watcher: "${K.coming} It reaches the valley next time you play."`);
    return null;
  }

  /* ---------- facing the storm ---------- */
  let Q = null, ov = null;
  function face() {
    const s = st(); if (!s.pending) { s.pending = { kind: ORDER[(s.count || 0) % ORDER.length], at: today() }; save.commit(); }
    const keys = chooseKeys(); if (!keys.length) { toast("Master a day first, then your valley can face a storm."); return; }
    Q = { kind: s.pending.kind, keys, i: 0, right: 0, wrongKeys: [], gold: 0, used: new Set() };
    valley.open({ then: () => { valley.weather(Q && KINDS[Q.kind].fx, Q && Q.kind === "storm"); intro(); }, onClose: () => { drop(); Q = null; } });
  }
  function drop() { if (ov) { ov.remove(); ov = null; } }
  function sheet(...kids) { drop(); ov = h("div", { class: "freeze vstormbg" }, h("div", { class: "runecard sheet vstormcard", role: "dialog", "aria-label": "The storm" }, ...kids)); document.body.append(ov); return ov; }
  function intro() {
    if (!Q) return; const K = KINDS[Q.kind];
    valley.say(`${K.e} ${K.name}!`, 3000);
    const go = h("button", { class: "btn primary", type: "button", onclick: () => { sfx("click"); ask(); } }, "⚡ Defend the valley");
    sheet(h("div", { class: "card stack pop" }, h("div", { class: "eyebrow" }, `${K.e} ${K.name}`), h("h2", {}, "Defend your valley!"),
      h("p", {}, `${QN} questions from everything you've mastered, maths and science mixed. Each right answer sends the villagers to defend a building. Get ${PASS} right to keep the whole valley safe.`),
      h("p", { class: "small muted" }, "No clock. Nothing you've earned can be lost: a missed question just puts a tarp on a roof, and 2 questions mend it."), go));
    setTimeout(() => go.focus({ preventScroll: true }), 60);
  }
  function ask() {
    if (!Q) return;
    if (Q.i >= Q.keys.length) return finish();
    const key = Q.keys[Q.i], T = prog.topic(key).t, K = KINDS[Q.kind], made = makeQ(key, Q.used), q = made.q;
    const label = `${K.e} Storm question ${Q.i + 1} of ${Q.keys.length}  ·  🛡️ ${Q.right} defended`;
    // first: which topic is this?
    const others = shuffle(pool().filter(k => k !== key)), same = others.filter(k => subj(k) === subj(key)), diff = others.filter(k => subj(k) !== subj(key));
    const tiles = shuffle([key, ...same.slice(0, 2), ...diff.slice(0, 1)].concat(others).filter((k, i, a) => a.indexOf(k) === i).slice(0, 4));
    const fb = h("div"), nowBtn = h("button", { class: "btn primary hide", type: "button", onclick: () => { sfx("click"); answer(key, q, label, made.card); } }, "Now answer it ▸");
    const opts = h("div", { class: "opts col ideas" }, ...tiles.map(k => h("button", { class: "opt", type: "button", "data-k": k, onclick: e => {
      opts.querySelectorAll("button").forEach(b => (b.disabled = true)); const ok = k === key; e.currentTarget.classList.add(ok ? "ok" : "no"); opts.querySelector(`[data-k="${CSS.escape(key)}"]`).classList.add("ok");
      if (ok) { sfx("correct"); fb.className = "verdict good"; fb.innerHTML = "<b>Yes!</b> Knowing which idea to use is half the battle."; }
      else { sfx("wrong"); fb.className = "verdict mid"; fb.innerHTML = `<b>This one is ${esc(labelOf(key))}.</b> ${esc(T.title)}. Now answer it.`; }
      nowBtn.classList.remove("hide"); setTimeout(() => nowBtn.focus({ preventScroll: true }), 50); } }, labelOf(k))));
    const body = h("div", { class: "card stack pop" }, h("div", { class: "eyebrow" }, label), h("div", { class: "qs" }, "🧭 Which topic is this?"), h("div", { class: "qs small", html: qStem(q) }));
    if (q.v) body.append(q.v());
    body.append(opts, fb, nowBtn); sheet(body);
    window.__fdq = { type: "pick", obj: { ans: key, q } };
  }
  /* a question for a day: from a review card that is due or struggling when there is one (it then counts as that card's review) */
  function makeQ(key, used = new Set()) {
    const T = prog.topic(key).t, ci = cardInfo(key);
    const c = ci && ci.want.filter(x => !used.has(x.d.id) && x.d.t.gen && x.d.t.gen[x.d.i])[0];
    if (c) { used.add(c.d.id); try { return { q: c.d.t.gen[c.d.i](), card: c.d.id }; } catch (e) {} }
    return { q: pick(T.gen)(), card: null };
  }
  function answer(key, q, label, card) {
    if (!Q) return; let res = null;
    window.__fdq = { type: "own", obj: q };
    const qc = QuestionCard(q, "own", r => {
      res = r; prog.record(key, r); if (card && cards) { try { cards.answer(card, r, { q: q.q }); } catch (e) {} }
      const nb = qc.lastElementChild;
      if (nb) nb.textContent = r === "wrong" ? "Continue ▸" : "🛡️ Defend! ▸";
    }, () => after(key, res));
    qc.prepend(h("div", { class: "eyebrow" }, label));
    sheet(qc);
  }
  function after(key, res) {
    if (!Q) return; const K = KINDS[Q.kind], ok = res === "own" || res === "help";
    if (ok) { Q.right++; Q.gold += 5; } else if (!Q.wrongKeys.includes(key)) Q.wrongKeys.push(key);
    Q.i++; drop();
    const line = ok ? pick(K.def) : `${K.hit} of your ${labelOf(key).replace(/ · /, " ")} building. You can mend it later.`;
    valley.defend(key, ok, line);
    setTimeout(ask, valley.reduced ? 900 : 2200);
  }
  function finish() {
    const s = st(), K = KINDS[Q.kind], safe = Q.right >= PASS;
    const gold = Q.gold + (safe ? 30 : 0); S().gold = (S().gold || 0) + gold;
    let statue = null;
    if (safe) { statue = { kind: Q.kind, at: today() }; s.statues.push(statue); if (s.statues.length > 8) s.statues.shift(); }
    else Q.wrongKeys.forEach(k => { if (!s.tarps[k]) s.tarps[k] = { kind: Q.kind, at: today() }; });
    s.log.push({ kind: Q.kind, at: today(), right: Q.right, of: Q.keys.length, keys: Q.keys }); if (s.log.length > 20) s.log.shift();
    s.pending = null; s.from = today(); s.count = (s.count || 0) + 1;
    save.commit();
    const done = Q; Q = null;
    const back = h("button", { class: "btn primary", type: "button", onclick: () => { sfx("click"); drop(); valley.weather(null); valley.refresh(); valley.say(safe ? "The sun's out. " + K.statue.replace(/^\S+ /, "The ") + " now stands in your town square." : "The sun's out. Tap a roof with a tarp to mend it.", 5000); } }, "🏡 Back to my valley");
    const tarpList = safe ? [] : [...new Set(done.wrongKeys)];
    sheet(h("div", { class: "card stack pop" },
      h("div", { class: "eyebrow" }, `${K.e} ${K.name} · ${done.right} of ${done.keys.length} defended`),
      h("h2", {}, safe ? "🏡 Your valley is safe!" : "🌤️ The storm has passed"),
      safe ? h("p", {}, `You defended ${done.right} of ${done.keys.length}. Every building made it through. A keepsake, the ${K.statue}, now stands in your town square.`)
        : h("p", {}, `You defended ${done.right} of ${done.keys.length}. ${tarpList.length} roof${tarpList.length > 1 ? "s" : ""} got a tarp. Each one mends with 2 questions, whenever you like. Your stars and buildings are all still yours.`),
      tarpList.length ? h("ul", { class: "small" }, ...tarpList.map(k => h("li", {}, "🧰 " + labelOf(k)))) : null,
      h("p", { class: "vstars" }, `+${gold} 🪙`), back));
    sfx(safe ? "star" : "repair"); setTimeout(() => back.focus({ preventScroll: true }), 60);
  }

  /* ---------- mending a tarp: 2 right on his own about that day ---------- */
  function mend(key) {
    const tp = prog.topic(key); if (!tp || !st().tarps[key]) return;
    const T = tp.t; let hits = 0;
    const meter = h("div", { class: "row" }), area = h("div");
    const paint = () => meter.replaceChildren(h("b", {}, "Mended: "), ...[0, 1].map(i => h("span", { style: "font-size:1.8rem" }, i < hits ? "🧱" : "⚪")));
    const x = h("button", { class: "chip icon vx", type: "button", "aria-label": "Close", onclick: () => { sfx("click"); drop(); } }, "✕");
    const next = () => {
      paint(); if (hits >= 2) return done();
      const made = makeQ(key), q = made.q; window.__fdq = { type: "own", obj: q };
      area.replaceChildren(QuestionCard(q, "own", r => { prog.record(key, r); if (made.card && cards) { try { cards.answer(made.card, r, { q: q.q }); } catch (e) {} } if (r === "own") { hits++; sfx("correct"); } else sfx("wrong"); paint(); }, next));
    };
    const done = () => { delete st().tarps[key]; S().gold = (S().gold || 0) + 10; save.commit(); drop(); valley.refresh(); valley.defend(key, true, "Roof mended! +10 🪙"); sfx("repair"); };
    sheet(h("div", { class: "card stack pop", style: "position:relative" }, x, h("div", { class: "eyebrow" }, "🧰 Mend the roof · " + labelOf(key)),
      h("p", {}, `Get 2 right on your own about "${T.short}" to take the tarp off. Remembering it again is exactly how it sticks.`), meter, area));
    next();
  }

  /* ---------- the parent corner ---------- */
  function parentSection(dots, when, repaint) {
    const s = st(), sNow = status(), last = s.log[s.log.length - 1];
    const radios = STORM_OPTIONS.map(o => { const r = h("input", { type: "radio", name: "stormEvery", value: String(o.v) }); r.checked = (s.every || 0) === o.v;
      r.addEventListener("change", () => { s.every = o.v; if (o.v && !s.from) s.from = today(); if (!o.v) s.pending = null; save.commit(); repaint(); }); return h("label", { class: "pc-check" }, r, o.label); });
    return h("section", { class: "stack pc-region" }, h("h3", {}, "🌩️ Valley storms (mixed quizzes)"),
      h("p", { class: "small muted" }, `From the Village era on, a storm brings an ${QN}-question quiz that mixes maths and science from days he has mastered, leaning on what he is shakier on. ${PASS} right keeps the valley safe; a miss puts a tarp on that day's building, mended with 2 questions. Nothing is ever taken away, and it waits until he taps it.`),
      h("div", { class: "row", style: "gap:14px;flex-wrap:wrap" }, ...radios),
      h("p", { class: "small" }, sNow && sNow.state === "storm" ? `A ${KINDS[sNow.kind].name.toLowerCase()} is waiting for him now.` : sNow && sNow.state === "warn" ? "The next storm comes next time he plays." : !s.every ? "Storms are off." : "No storm due yet.",
        last ? ` Last one (${last.at}): ${last.right} of ${last.of} defended.` : "", tarpKeys().length ? ` Tarps to mend: ${tarpKeys().map(k => "Day " + prog.dayNo(k) + " " + subj(k)).join(", ")}.` : ""),
      h("button", { class: "btn small", type: "button", onclick: () => { s.pending = { kind: ORDER[(s.count || 0) % ORDER.length], at: today() }; save.commit(); repaint(); toast("A storm is waiting on his fort screen."); } }, "Send a storm now"));
  }

  return { status, dawnLine, face, mend, parentSection, pool, chooseKeys, get running() { return !!Q; }, state: st };
}
