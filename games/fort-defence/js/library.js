/* The Library tower: reading for understanding, on its own track so a hard passage never blocks a subject day.
   - Six floors, one reading strategy each (packs/reading/strategies.js). A floor's stars:
       ⭐ 1  the lesson (I do, we do, you do)
       ⭐ 2  3 right on his own before 3 misses, using that strategy
       ⭐ 3  the mixed check: 4 questions from every strategy learned so far. He first picks which strategy the
             question needs, then answers it. 3 of the 4 answers right on his own.
     The next floor opens at 3 stars (or when the parent corner has opened every day).
   - Dispatches: one short reading per subject day (the pack's reading.dispatches). A dispatch opens once that day's
     lesson is done, so he already knows the topic. Reading one earns loot; it never changes the subject's stars.
   - Every question shows its strategy and a 🧰 toolkit card with the steps, so he doesn't have to hold them in his head.
     A miss points him back at the sentence that holds the answer, instead of just showing it.
   Save: S.lib = { fl: { strategyKey: { stars, lesson } }, rd: { topicKey: { done, best, t } } }; answers go into
   S.hist under "lib:<strategy>" like every other answer, so the parent corner can show them. */
import { h, H, esc, shuffle, pick, SayBtn } from "./qcore.js";
import { AnswerBox, LearnView } from "./qui.js";
import { sfx } from "./audio.js";
import { STRATEGIES, STRATEGY } from "../packs/reading/strategies.js";
import { LOOT } from "./day.js";

const peek = (type, obj) => { window.__fdq = { type, obj }; };

export function createLibrary({ save, prog, day, toast, onChange }) {
  const S = () => save.state;
  const pack = () => prog.pack;
  const has = () => !!(pack().reading && pack().reading.dispatches && pack().reading.dispatches.length);
  const lib = () => { const st = S(); st.lib = st.lib || {}; st.lib.fl = st.lib.fl || {}; st.lib.rd = st.lib.rd || {}; return st.lib; };
  const F = k => lib().fl[k] || (lib().fl[k] = { stars: 0, lesson: false });
  const fstars = k => (lib().fl[k] && lib().fl[k].stars) || 0;
  const floorOpen = s => s.n === 1 || S().unlockAll || fstars(STRATEGIES[s.n - 2].k) >= 3;
  const learned = () => STRATEGIES.filter(s => F(s.k).lesson);
  const dkey = d => prog.keyOf(pack(), d.day);
  const dispatches = () => has() ? pack().reading.dispatches : [];
  const dOpen = d => !!S().learnDone[dkey(d)] || S().unlockAll;
  const dDone = d => !!(lib().rd[dkey(d)] && lib().rd[dkey(d)].done);
  const unread = () => dispatches().filter(d => dOpen(d) && !dDone(d));
  /* the floor he is working on: the first open floor without 3 stars */
  const curFloor = () => STRATEGIES.find(s => floorOpen(s) && fstars(s.k) < 3) || null;

  /* questions for a strategy: its own practice texts, plus questions from dispatches he has opened */
  function pool(k) {
    const list = STRATEGY[k].practice.map((it, i) => ({ id: `p:${k}:${i}`, item: it, q: { ...it, s: k } }));
    dispatches().filter(dOpen).forEach(d => d.qs.forEach((q, i) => { if (q.s === k) list.push({ id: `d:${d.day}:${i}`, item: d, q }); }));
    return list;
  }
  const seen = {};   // this session only: avoid repeating a question until the pool runs out
  function draw(k) {
    const p = pool(k); let fresh = p.filter(x => !seen[x.id]); if (!fresh.length) { p.forEach(x => delete seen[x.id]); fresh = p; }
    const x = pick(fresh); seen[x.id] = 1; return x;
  }

  /* is there something new in the tower? (the dawn screen shows a dot) */
  const news = () => has() && (unread().length > 0 || (curFloor() && !F(curFloor().k).lesson));

  /* ---------------- the reading card ---------------- */
  /* item: { title, pic, text:[sentences], words }   q: a reading question   o.pickStrategy: ask which strategy first */
  function ReadCard(item, q, onResult, onNext, o = {}) {
    const strat = STRATEGY[q.s], card = h("div", { class: "card stack pop readq" });
    const gloss = h("div", { class: "gloss", "aria-live": "polite" });
    const sents = item.text.map((t, i) => h("span", { class: "sent", "data-i": i }, ...wordsIn(t, item.words, gloss), " "));
    const passage = h("div", { class: "passage" + (q.s === "predict" ? " veiled" : "") },
      h("div", { class: "row", style: "justify-content:space-between;align-items:center;gap:8px" }, h("b", { class: "ptitle" }, `${item.pic || "📜"}  ${item.title}`), SayBtn(() => item.title + ". " + item.text.join(" "))),
      h("p", { class: "ptext" }, ...sents), gloss);
    if (q.s === "predict") passage.querySelectorAll(".sent").forEach((el, i) => { if (i > 0) el.classList.add("hidden"); });
    const tools = h("div", { class: "toolkit hide" }, h("b", {}, `${strat.icon} ${strat.name}: the steps`), h("ol", {}, ...strat.card.map(c => h("li", {}, c))));
    const kitBtn = h("button", { class: "btn small", type: "button", onclick: () => { tools.classList.toggle("hide"); sfx("click"); } }, "🧰 Toolkit");
    const chip = h("span", { class: "schip" }, `${strat.icon} ${strat.name}`);
    const body = h("div", { class: "stack", style: "gap:10px" });
    const nextBtn = h("button", { class: "btn primary hide", type: "button", onclick: onNext }, o.nextLabel || "Next ▸");
    card.append(passage, h("div", { class: "row", style: "justify-content:space-between;align-items:center;gap:8px" }, o.pickStrategy ? h("span", { class: "schip muted" }, "🧭 Which strategy?") : chip, kitBtn), tools, body, nextBtn);
    let reported = false;
    const report = r => { if (reported) return; reported = true; onResult(r); nextBtn.classList.remove("hide"); if (q.s === "predict") unveil(r); setTimeout(() => { try { nextBtn.focus({ preventScroll: true }); } catch (e) {} }, 400); };
    function unveil() { passage.classList.remove("veiled"); passage.querySelectorAll(".sent.hidden").forEach(el => el.classList.remove("hidden")); body.append(h("div", { class: "verdict mid" }, "📖 Now read the whole text. Was your prediction right? Checking is what good readers do.")); }
    const clue = i => { sents.forEach(s => s.classList.remove("clue")); if (i != null && sents[i]) { sents[i].classList.add("clue"); try { sents[i].scrollIntoView({ block: "nearest", behavior: "smooth" }); } catch (e) {} } };

    const ask = () => {
      body.append(h("div", { class: "qs", html: q.ask }));
      if (q.s === "evidence") return evidence();
      const spec = q.order ? { order: q.order } : (() => { const c = shuffle(q.choice.map((t, i) => i)); return { choice: c.map(i => q.choice[i]), ans: c.indexOf(0) }; })();
      peek("read", { ...q, spec });
      body.append(AnswerBox(spec, "", tries => { clue(null); body.append(h("div", { class: "verdict good", html: `<b>${tries ? "Got it on the second try." : "Right, on your own!"}</b> ${q.why}` })); report(tries ? "help" : "own"); },
        (tries, fb) => { fb.className = "verdict bad"; clue(q.clue); fb.innerHTML = q.clue != null ? "Not quite. Look again at the <b>highlighted sentence</b>, then try once more." : `Not quite. Open the 🧰 toolkit: ${esc(strat.card[1] || strat.card[0])}`; },
        fb => { fb.className = "verdict mid"; clue(q.clue); fb.innerHTML = `<b>The answer is shown above.</b> ${q.why}`; report("wrong"); }));
    };
    /* tap the sentence that proves it: the passage itself is the answer */
    function evidence() {
      peek("read", { ...q, spec: { evidence: q.ans } });
      const fb = h("div"); let tries = 0, done = false; passage.classList.add("tapmode");
      body.append(h("div", { class: "small muted" }, "👆 Tap the sentence in the text"), fb);
      sents.forEach((s, i) => { s.setAttribute("role", "button"); s.setAttribute("tabindex", "0");
        const hit = () => { if (done) return;
          if (q.ans.includes(i)) { done = true; passage.classList.remove("tapmode"); s.classList.add("tap-ok"); fb.className = "verdict good"; fb.innerHTML = `<b>${tries ? "Got it on the second try." : "Right, on your own!"}</b> ${q.why}`; report(tries ? "help" : "own"); return; }
          tries++; s.classList.add("tap-no"); setTimeout(() => s.classList.remove("tap-no"), 800);
          if (tries >= 2) { done = true; passage.classList.remove("tapmode"); q.ans.forEach(j => sents[j].classList.add("tap-ok")); fb.className = "verdict mid"; fb.innerHTML = `<b>This is the proof sentence.</b> ${q.why}`; report("wrong"); return; }
          fb.className = "verdict bad"; fb.innerHTML = `Not that one. The key word is <b>${esc(q.key || "")}</b>. Scan for the sentence that has it.`; };
        s.addEventListener("click", hit); s.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); hit(); } }); });
    }
    /* the mixed check: name the strategy first */
    if (o.pickStrategy) {
      const opts = shuffle([strat, ...shuffle(o.choices.filter(s => s.k !== q.s)).slice(0, 2)]);
      const box = h("div", { class: "stack", style: "gap:8px" }, h("div", { class: "qs" }, "Which strategy does this question need?"), h("div", { class: "qs small", html: "<i>" + q.ask + "</i>" }));
      const row = h("div", { class: "opts" }, ...opts.map(s => h("button", { class: "opt", type: "button", "data-k": s.k, onclick: e => {
        row.querySelectorAll("button").forEach(b => b.disabled = true); const ok = s.k === q.s; e.currentTarget.classList.add(ok ? "ok" : "no"); if (!ok) row.querySelector(`[data-k="${q.s}"]`).classList.add("ok");
        box.append(h("div", { class: "verdict " + (ok ? "good" : "mid"), html: ok ? `<b>Yes!</b> It's a ${strat.icon} ${strat.name} question. Now answer it.` : `<b>This one is ${strat.icon} ${strat.name}:</b> ${esc(strat.does)} Now answer it.` }));
        card.querySelector(".schip").replaceWith(chip); setTimeout(ask, 250); } }, `${s.icon} ${s.name}`)));
      box.append(row); body.append(box); peek("pick", { ans: q.s, q });
    } else ask();
    return card;
  }
  /* glossary: words in the dispatch's word list are underlined; tapping one shows its meaning */
  function wordsIn(t, words, gloss) {
    if (!words) return [t];
    const keys = Object.keys(words).sort((a, b) => b.length - a.length).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    if (!keys.length) return [t];
    const re = new RegExp(`\\b(${keys.join("|")})\\b`, "i"), out = []; let rest = t, m, used = 0;
    while (rest && (m = re.exec(rest)) && used < 3) {
      out.push(rest.slice(0, m.index)); const w = m[0], mean = words[Object.keys(words).find(k => k.toLowerCase() === w.toLowerCase())];
      out.push(h("button", { class: "gword", type: "button", title: "What does it mean?", onclick: e => { e.stopPropagation(); gloss.replaceChildren(h("span", {}, "📘 ", h("b", {}, w), ": " + mean)); sfx("click"); } }, w));
      rest = rest.slice(m.index + w.length); used++;
    }
    out.push(rest); return out;
  }

  /* ---------------- screens ---------------- */
  let K = null;   // the sheet helpers from the day screen
  const mount = title => { K = day.kit(); K.head([h("div", { class: "row", style: "justify-content:space-between;align-items:flex-start;gap:8px" }, h("div", { style: "min-width:0;flex:1" }, h("div", { class: "eyebrow" }, "📚 Library tower"), h("h2", {}, title)), K.closeBtn()), K.lootbar]); };
  const backBtn = () => K.linkbtn("◂ Back to the Library", () => { sfx("click"); open(); });
  const gift = (r, el) => { if (r === "own") K.grant(LOOT.own, el); else if (r === "help") K.grant(LOOT.help, el); else sfx("wrong"); };

  function open() {
    if (!has()) { toast("The Library opens with the science quest."); return; }
    mount("Reading like a scientist");
    const cur = curFloor(), un = unread();
    let next;
    if (cur && !F(cur.k).lesson) next = K.bigbtn(`${cur.icon} Floor ${cur.n}: learn to ${cur.name.toLowerCase()}`, () => lesson(cur));
    else if (un.length) next = K.bigbtn(`📜 New dispatch: Day ${prog.dayNo(dkey(un[0]))}`, () => readDispatch(un[0]));
    else if (cur && fstars(cur.k) < 2) next = K.bigbtn(`${cur.icon} Floor ${cur.n} Challenge`, () => challenge(cur));
    else if (cur) next = K.bigbtn(`🧭 Floor ${cur.n}: mixed check`, () => mixed(cur));
    else next = h("p", { style: "font-weight:800" }, "🏆 Every floor is mastered! Read any dispatch again for loot.");
    const floors = STRATEGIES.map(s => { const op = floorOpen(s), st = fstars(s.k);
      return h("button", { class: "qtile" + (op ? "" : " locked") + (cur === s ? " next" : ""), type: "button", "aria-label": `Floor ${s.n}: ${s.name}. ${st} stars.${op ? "" : " Locked."}`,
        onclick: () => { if (!op) { sfx("wrong"); toast("Get 3 stars on the floor below to open this one."); return; } sfx("click"); floorScreen(s); } },
        h("span", { class: "z" }, s.icon), h("span", { class: "nm" }, `${s.n}. ${s.name}`), h("span", { class: "st" }, "⭐".repeat(st) + "☆".repeat(3 - st))); });
    const reads = dispatches().map(d => { const op = dOpen(d), dn = dDone(d), no = prog.dayNo(dkey(d));
      return h("button", { class: "qtile" + (op ? "" : " locked") + (op && !dn ? " next" : ""), type: "button", "aria-label": `Day ${no} dispatch: ${d.title}.${op ? "" : " Locked."}`,
        onclick: () => { if (!op) { sfx("wrong"); toast(`Finish the lesson on Day ${no} to open this dispatch.`); return; } sfx("click"); readDispatch(d); } },
        h("span", { class: "z" }, String(no)), h("span", { class: "nm" }, d.title), h("span", { class: "kind" }, dn ? "✓ read" : op ? "new" : "locked")); });
    const kit = learned();
    K.set(h("div", { class: "stack" },
      h("div", { class: "mission" }, "📚 Good readers use strategies. Learn one on each floor, then use them on dispatches about your science days. Reading never blocks a science day, but each demon lord waits until that land's dispatches are read."),
      next,
      h("section", { class: "qregion" }, h("h3", {}, "🏰 The six floors"), h("div", { class: "qtiles" }, ...floors)),
      h("section", { class: "qregion" }, h("h3", {}, "📜 Dispatches"), h("p", { class: "small muted" }, "A dispatch opens when you finish that day's science lesson."), h("div", { class: "qtiles" }, ...reads)),
      kit.length ? h("section", { class: "qregion" }, h("h3", {}, "🧰 Your reading toolkit"), ...kit.map(s => h("details", { class: "kitcard" }, h("summary", {}, `${s.icon} ${s.name}: ${s.does}`), h("ol", {}, ...s.card.map(c => h("li", {}, c)))))) : null));
  }

  function floorScreen(s) {
    mount(`Floor ${s.n}: ${s.name}`);
    const st = fstars(s.k);
    K.set(h("div", { class: "stack" },
      h("div", { class: "card stack" }, h("div", { class: "row", style: "justify-content:space-between" }, h("b", {}, `${s.icon} ${s.does}`), h("span", { class: "stars" }, ...[0, 1, 2].map(i => h("span", { class: i < st ? "" : "off" }, "⭐")))),
        h("ol", { class: "small" }, ...s.card.map(c => h("li", {}, c)))),
      K.bigbtn("📖 " + (F(s.k).lesson ? "Read the lesson again" : "Start the lesson"), () => lesson(s), F(s.k).lesson ? "plain" : "go"),
      F(s.k).lesson ? K.bigbtn(`${s.icon} Challenge: 3 right on your own`, () => challenge(s), st < 2 ? "go" : "plain") : null,
      st >= 2 ? K.bigbtn("🧭 Mixed check: which strategy?", () => mixed(s), st < 3 ? "go" : "plain") : null,
      backBtn()));
  }

  function lesson(s, i = 0) {
    mount(`Floor ${s.n}: ${s.name}`);
    K.set(h("div", { class: "stack" }, K.mission(`📖 The Librarian shows you how, then you try with a hint, then on your own.`),
      LearnView(s.lesson, i, j => lesson(s, j), () => { const f = F(s.k), first = !f.lesson; f.lesson = true; if (f.stars < 1) f.stars = 1; if (first) { S().gold += 20; sfx("star"); } save.commit(); onChange && onChange();
        K.set(K.celebrate(h("div", { class: "bigstars" }, "⭐"), h("h2", {}, `${s.icon} ${s.name}: learned!`), h("p", {}, "It's in your 🧰 toolkit now. Open it from any reading question."),
          h("div", { class: "toolkit" }, h("ol", {}, ...s.card.map(c => h("li", {}, c)))),
          K.bigbtn(`${s.icon} Challenge: 3 right on your own`, () => challenge(s)), backBtn())); },
        null, "Finish the lesson", (ok, tries, card) => { if (ok && !F(s.k).lesson) K.grant({ wood: 1 }, card); })));
  }

  /* ⭐2: 3 right on his own before 3 misses */
  function challenge(s) {
    mount(`Floor ${s.n}: ${s.name} Challenge`);
    let hits = 0, misses = 0; const meter = h("div", { class: "row" }), area = h("div");
    const paint = () => meter.replaceChildren(h("b", {}, "Target: "), ...[0, 1, 2].map(i => h("span", { style: "font-size:1.8rem" }, i < hits ? "🎯" : "⚪")), h("span", { class: "muted small" }, misses ? `  ${misses} miss${misses > 1 ? "es" : ""} (3 misses and you read the lesson again)` : ""));
    const next = () => { paint(); if (hits >= 3) return win(); if (misses >= 3) return lose();
      const x = draw(s.k); let card; card = ReadCard(x.item, x.q, r => { prog.record("lib:" + s.k, r); if (r === "own") hits++; else misses++; gift(r, card); paint(); }, next); area.replaceChildren(card); };
    const win = () => { const f = F(s.k), up = f.stars < 2; if (up) { f.stars = 2; S().gold += 20; } save.commit(); sfx("star"); onChange && onChange();
      K.set(K.celebrate(h("div", { class: "bigstars" }, "⭐⭐"), h("h2", {}, up ? "Second star!" : "Challenge won!"), h("p", {}, "Last step for this floor: the mixed check. You'll pick which strategy each question needs."),
        K.bigbtn("🧭 Mixed check", () => mixed(s)), backBtn())); };
    const lose = () => K.set(K.celebrate(h("div", { class: "bigstars" }, "📖"), h("h2", {}, "Not yet. Let's look at the lesson again!"), h("p", {}, "Read the Librarian's example, then try the Challenge again. Every reader practises."),
      K.bigbtn("📖 Read the lesson", () => lesson(s)), K.bigbtn("Try again", () => challenge(s), "plain"), backBtn()));
    K.set(h("div", { class: "stack" }, K.mission(`${s.icon} Use ${s.name.toLowerCase()} to get 3 right on your own. Right first time earns stone and iron.`), meter, area)); next();
  }

  /* ⭐3: mixed check, 4 questions from every floor up to this one (at least 2 from this floor) */
  function mixed(s) {
    mount(`Floor ${s.n}: mixed check`);
    const upto = STRATEGIES.filter(x => x.n <= s.n), others = upto.map(x => x.k), ks = shuffle([s.k, s.k, pick(others), pick(others)]);
    let k = 0, right = 0; const res = [], progEl = h("div", { class: "qprog" }), area = h("div");
    const paint = () => progEl.replaceChildren(...ks.map((_, i) => h("i", { class: { own: "own", help: "hlp", wrong: "bad" }[res[i]] || "" })));
    const next = () => { paint(); if (k >= ks.length) return finish(); const x = draw(ks[k]); let card;
      card = ReadCard(x.item, x.q, r => { prog.record("lib:" + ks[k], r); res[k] = r; if (r === "own") right++; gift(r, card); k++; paint(); }, next, { pickStrategy: s.n > 1, choices: upto });
      area.replaceChildren(card); };
    const finish = () => { const pass = right >= 3, f = F(s.k), up = pass && f.stars < 3; if (up) { f.stars = 3; S().gold += 30; } save.commit(); onChange && onChange(); sfx(pass ? "star" : "wrong");
      const nx = STRATEGIES[s.n];
      K.set(K.celebrate(h("div", { class: "bigstars" }, pass ? "⭐⭐⭐" : "🧭"), h("h2", {}, pass ? `Floor ${s.n} mastered!` : `${right} of 4. 3 are needed.`),
        h("p", {}, pass ? (nx ? `🔓 Floor ${nx.n}: ${nx.icon} ${nx.name} is open!` : "🏆 You've mastered every floor of the Library!") : "Open the 🧰 toolkit when you're not sure, then try again."),
        pass ? (nx ? K.bigbtn(`${nx.icon} Learn ${nx.name.toLowerCase()}`, () => lesson(nx)) : null) : K.bigbtn("🧭 Try the mixed check again", () => mixed(s)), backBtn())); };
    K.set(h("div", { class: "stack" }, K.mission(s.n > 1 ? "🧭 Mixed check: for each question, first pick the strategy it needs, then answer it. 3 of 4 answers right on your own wins the third star." : "🧭 Final check for this floor: 3 of 4 right on your own wins the third star."), progEl, area)); next();
  }

  /* a dispatch: all its questions, labelled with their strategies */
  function readDispatch(d) {
    const no = prog.dayNo(dkey(d)); mount(`Day ${no} dispatch: ${d.title}`);
    let k = 0, own = 0; const res = [], progEl = h("div", { class: "qprog" }), area = h("div");
    const paint = () => progEl.replaceChildren(...d.qs.map((_, i) => h("i", { class: { own: "own", help: "hlp", wrong: "bad" }[res[i]] || "" })));
    const next = () => { paint(); if (k >= d.qs.length) return finish(); const q = d.qs[k]; let card;
      card = ReadCard(d, q, r => { prog.record("lib:" + q.s, r); res[k] = r; if (r === "own") own++; gift(r, card); k++; paint(); }, next, { nextLabel: k < d.qs.length - 1 ? "Next question ▸" : "Finish ▸" });
      area.replaceChildren(card); };
    const finish = () => { const r = lib().rd[dkey(d)] || (lib().rd[dkey(d)] = { done: false, best: 0 }); const first = !r.done; r.done = true; r.best = Math.max(r.best || 0, own); r.t = Date.now();
      if (first) S().gold += 20; save.commit(); onChange && onChange(); sfx("star");
      const more = unread()[0];
      K.set(K.celebrate(h("div", { class: "bigstars" }, own >= 3 ? "📜✨" : "📜"), h("h2", {}, `Dispatch read! ${own} of ${d.qs.length} on your own.`), h("p", {}, first ? "🪙 +20 gold for your first read." : "Great practice."),
        more ? K.bigbtn(`📜 Next dispatch: Day ${prog.dayNo(dkey(more))}`, () => readDispatch(more)) : null, backBtn())); };
    K.set(h("div", { class: "stack" }, K.mission(`📜 A dispatch about Day ${no}. Read it (tap 🔊 to hear it, or tap an underlined word for its meaning), then answer the questions. Each question shows the strategy to use.`), progEl, area)); next();
  }

  return { open, news, has, curFloor, fstars, unread, pool, ReadCard };
}
