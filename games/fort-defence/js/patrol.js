/* The morning patrol and the armoury (see js/cards.js for the box rules).
   - Patrol: today's due cards, one at a time, on the day sheet. Before a sword (skill) card he first picks
     "Which idea is this?" when he knows at least 3 days of that subject. A miss shows the idea's rule card
     (the "one thing to remember" from the lesson), then that card comes back once at the end with a fresh
     version, so the patrol always ends on a try he can win. The second chance never moves the card.
   - Practise one idea (from the report card): the rule card first, then each of that idea's cards.
   - Armoury: every card as a weapon, its metal showing its box, dented ones tagged for repair. */
import { h, H, shuffle, pick, esc, qStem } from "./qcore.js";
import { QuestionCard, UnderstandCard, attachConfidence, confNote } from "./qui.js";
import { sfx } from "./audio.js";
import { LOOT } from "./day.js";
import { METALS } from "./cards.js";

const peek = (type, obj) => { window.__fdq = { type, obj }; };

export function createPatrol({ save, prog, cards, day, toast, onLeave }) {
  const S = () => save.state;
  const metal = b => METALS[b] || METALS[0];
  const tag = b => h("span", { class: "metal m-" + metal(b).c }, metal(b).e + " " + metal(b).n);
  const dayLabel = key => { const tp = prog.topic(key); return tp ? `${tp.pack.subject} · Day ${dayNo(key)}: ${tp.t.short}` : key; };
  /* the day number inside its own pack (prog.dayNo knows every pack's topics) */
  const dayNo = key => prog.dayNo(key);
  const ruleOf = key => { const T = prog.topic(key).t, rs = (T.learn || []).map(c => c.rule).filter(Boolean); return rs.slice(0, 2); };

  /* one question for a card: a fresh version, never the same why/think question as last time when there is a choice */
  function version(d) {
    if (d.kind === "skill") return { type: "own", q: d.t.gen[d.i]() };
    const r = cards.rec(d.id); r.vs = r.vs || [];
    const list = d.kind === "why" ? d.t.checks : d.pack.understanding[d.t.id];
    let idx = list.map((_, i) => i).filter(i => !r.vs.includes(i)); if (!idx.length) { r.vs = []; idx = list.map((_, i) => i); }
    const i = pick(idx); r.vs.push(i);
    const it = list[i];
    return { type: d.kind, u: d.kind === "why" ? { k: "why", q: it.q, c: it.c, a: it.a, why: it.why } : it };
  }
  /* other days he knows in the same subject, for "Which idea is this?" */
  const known = d => [...cards.byTopic.keys()].filter(k => prog.topic(k).pack === d.pack && cards.cardsOf(k).length);

  /* ---------- a run of cards (the patrol, or one idea's practice) ---------- */
  function run({ title, eyebrow, ids, intro, isPatrol, onEnd }) {
    const k = day.kit(); let i = isPatrol ? S().patrol.i : 0; const again = isPatrol ? S().patrol.again : []; const moves = isPatrol ? S().patrol.res : {};
    const queue = () => ids.concat(again.map(x => x));
    k.head([h("div", { class: "row", style: "justify-content:space-between;align-items:flex-start" }, h("div", {}, h("div", { class: "eyebrow" }, eyebrow), h("h2", {}, title)), k.closeBtn()), k.lootbar]);
    const progEl = h("div", { class: "qprog" }), area = h("div", { class: "stack" });
    const paint = () => progEl.replaceChildren(...queue().map((id, j) => h("i", { class: j < i ? (moves[id] && moves[id].k === "wrong" && !again.includes(id) ? "bad" : "own") : "" })));
    const save_ = () => { if (isPatrol) { S().patrol.i = i; save.commit(); } };
    function next() {
      paint(); const Q = queue(); if (i >= Q.length) return finish();
      const id = Q[i], d = cards.def(id), r = cards.rec(id), retry = i >= ids.length;
      if (!d || !r) { i++; save_(); return next(); }
      const head = h("div", { class: "row pt-head" }, h("span", { class: "eyebrow" }, `${cards.iconOf(d)} ${cards.nameOf(d)}`), tag(r.b), retry ? h("span", { class: "small muted" }, "second chance") : null);
      if (r.forge && !retry) return reteach(d, () => ask(id, d, head, retry), "🔥 This one came back from the forge. Remember:");
      if (d.kind === "skill" && !retry && known(d).length >= 3) return pickIdea(id, d, head, () => ask(id, d, head, retry));
      ask(id, d, head, retry);
    }
    function ask(id, d, head, retry) {
      const v = version(d); let card, cf = null;
      const done = res => {
        const conf = cf ? cf.lock() : null;
        const m = cards.answer(id, res, { retry, q: v.q ? v.q.q : v.u.q, conf }); prog.record(d.key, res === "first" ? "own" : res === "second" ? "help" : res, { conf });
        const note = confNote(conf, res !== "wrong", true); if (note && card) { const nb = card.querySelector(":scope > button.btn.primary"); nb ? card.insertBefore(note, nb) : card.append(note); }
        if (!retry) moves[id] = m;
        if (m.k === "right") k.grant(retry ? LOOT.help : LOOT.own, card); else if (m.k === "helped") k.grant(LOOT.help, card); else sfx("wrong");
        if (m.k === "wrong" && !retry && !again.includes(id)) again.push(id);
        if (!retry && m.after > m.before) setTimeout(() => toast(`${cards.nameOf(d)}: ${metal(m.before).n} → ${metal(m.after).n} ${metal(m.after).e}`), 300);
        save_();
      };
      const nx = () => { const m = moves[id]; i++; save_(); if (!retry && m && m.k === "wrong") reteach(d, next); else next(); };
      if (v.type === "own") { peek("own", v.q); card = QuestionCard(v.q, "own", done, nx); }
      else { peek("uq", v.u); card = UnderstandCard(v.u, done, nx, { nextLabel: "Next ▸", label: d.kind === "why" ? "🛡️ Why does it work?" : undefined }); }
      cf = attachConfidence(card);
      k.set(h("div", { class: "stack" }, intro ? k.mission(intro) : null, progEl, head, card));
    }
    function pickIdea(id, d, head, then) {
      const others = shuffle(known(d).filter(x => x !== d.key)).slice(0, 3), tiles = shuffle([d.key, ...others]);
      const q = d.t.gen[d.i](), fb = h("div");
      const go = h("button", { class: "btn primary hide", type: "button", onclick: then }, "Now answer it ▸");
      const opts = h("div", { class: "opts col ideas" }, ...tiles.map(t => h("button", { class: "opt", type: "button", "data-k": t, onclick: e => {
        opts.querySelectorAll("button").forEach(b => (b.disabled = true)); const ok = t === d.key; e.currentTarget.classList.add(ok ? "ok" : "no"); opts.querySelector(`[data-k="${d.key}"]`).classList.add("ok");
        if (ok) { k.grant({ crystal: 1 }, opts); fb.className = "verdict good"; fb.innerHTML = "<b>Yes! +1 💎</b> Knowing which idea to use is half the battle."; }
        else { sfx("wrong"); fb.className = "verdict mid"; fb.innerHTML = `<b>This one is Day ${dayNo(d.key)}: ${esc(d.t.short)}.</b> Now answer it.`; }
        go.classList.remove("hide"); setTimeout(() => go.focus({ preventScroll: true }), 50); } }, `Day ${dayNo(t)}: ${prog.topic(t).t.short}`)));
      peek("pick", { ans: d.key, q });
      k.set(h("div", { class: "stack" }, progEl, head, h("div", { class: "card stack pop" }, h("div", { class: "qs" }, "🧭 Which idea is this?"), h("div", { class: "qs small", html: qStem(q) }), q.v ? q.v() : null, opts, fb, go)));
    }
    function reteach(d, then, lead) {
      const rules = ruleOf(d.key);
      if (!rules.length) return then();
      peek("reteach", { key: d.key });
      k.set(h("div", { class: "stack" }, progEl, h("div", { class: "card stack pop reteach" }, h("div", { class: "eyebrow" }, `🔨 To the forge · Day ${dayNo(d.key)}: ${d.t.short}`),
        h("p", {}, lead || "That one got a dent. Here is the one thing to remember, then it comes back at the end for a second chance:"),
        ...rules.map(t => h("div", { class: "rule" }, t)),
        h("button", { class: "btn primary", type: "button", onclick: () => { sfx("click"); then(); } }, "Got it ▸"))));
    }
    function finish() {
      if (isPatrol) { S().patrol.fin = true; save.commit(); }
      const ups = Object.entries(moves).filter(([, m]) => m.after > m.before), dents = Object.entries(moves).filter(([, m]) => m.k === "wrong");
      sfx("star");
      k.set(k.celebrate(h("div", { class: "bigstars" }, "🛡️"), h("h2", {}, isPatrol ? "Patrol done!" : "Practice done!"),
        h("p", {}, ups.length ? `${ups.length} weapon${ups.length > 1 ? "s" : ""} forged stronger:` : "Every weapon checked. Keeping old ideas sharp keeps the fort safe."),
        ups.length ? h("div", { class: "pt-moves" }, ...ups.map(([id, m]) => h("div", { class: "row", style: "gap:6px;justify-content:center;flex-wrap:wrap" }, h("b", {}, cards.nameOf(cards.def(id))), tag(m.before), "→", tag(m.after)))) : null,
        dents.length ? h("p", { class: "small" }, `🔨 ${dents.length} went back to the forge. They'll come back soon so you can fix them.`) : null,
        k.bigbtn(onEnd ? onEnd.label : "▶ Carry on", () => { day.close("x"); onEnd && onEnd.go(); }),
        k.linkbtn("⚔️ See your armoury", () => openArmoury())));
    }
    next();
  }

  /* ---------- entry points ---------- */
  function openPatrol() {
    const P = cards.patrol(); if (P.fin || !P.ids.length) { toast("No patrol today: every weapon is sharp."); return; }
    const n = P.ids.length;
    run({ title: `Patrol: ${n} card${n > 1 ? "s" : ""}`, eyebrow: "🛡️ Morning patrol", ids: P.ids, isPatrol: true,
      intro: P.i ? null : `🛡️ Check your weapons! ${n} idea${n > 1 ? "s" : ""} you already know, from every subject. Right on your own makes a weapon stronger.` });
  }
  function skipPatrol() { const P = cards.patrol(); P.skip = true; save.commit(); }
  function practiseIdea(key, back) {
    cards.ensure(); const cs = cards.cardsOf(key).map(d => d.id);
    const tp = prog.topic(key); if (!tp) return;
    if (!cs.length) { day.open(key); return; }   // not mastered yet: the day itself is the practice
    const ids = shuffle(cs).slice(0, 3);
    const k = day.kit(); k.head([h("div", { class: "row", style: "justify-content:space-between" }, h("h2", {}, `Practise: ${tp.t.short}`), k.closeBtn()), k.lootbar]);
    const rules = ruleOf(key);
    k.set(h("div", { class: "stack" }, h("div", { class: "card stack pop reteach" }, h("div", { class: "eyebrow" }, `🔨 Scout's revisit · Day ${dayNo(key)}`), h("h2", {}, tp.t.title),
      h("p", {}, "First, the one thing to remember. Then " + ids.length + " questions to sharpen this idea."), ...rules.map(t => h("div", { class: "rule" }, t)),
      h("div", { class: "row", style: "gap:8px;flex-wrap:wrap" }, h("button", { class: "btn primary", type: "button", onclick: () => run({ title: tp.t.short, eyebrow: `🔨 Practise · Day ${dayNo(key)}`, ids, isPatrol: false, onEnd: back }) }, "Start ▸"),
        h("button", { class: "btn", type: "button", onclick: () => day.open(key, { ph: "learn", i: 0 }) }, "📜 Read the whole briefing")))));
  }

  function openArmoury() {
    cards.ensure(); const k = day.kit();
    k.head([h("div", { class: "row", style: "justify-content:space-between;align-items:center" }, h("h2", {}, "⚔️ Armoury"), k.closeBtn()), k.lootbar]);
    const n = Object.keys(S().cards || {}).length;
    const legend = h("div", { class: "row", style: "gap:6px;flex-wrap:wrap" }, ...[1, 2, 3, 4, 5, 6].map(tag));
    const racks = prog.pack ? [prog.pack].concat(require_others()) : [];
    const blocks = racks.map(pack => {
      const keys = [...cards.byTopic.keys()].filter(key => prog.topic(key).pack === pack && cards.cardsOf(key).length);
      if (!keys.length) return h("section", { class: "stack" }, h("h3", {}, `${pack.subject}`), h("p", { class: "small muted" }, "Master a day (3 stars) to forge its first weapons."));
      return h("section", { class: "stack" }, h("h3", {}, `${pack.subject}`), h("div", { class: "rack" }, ...keys.flatMap(key => cards.cardsOf(key).map(d => { const r = cards.rec(d.id);
        return h("div", { class: "weapon m-" + metal(r.b).c + (r.dent ? " dent" : ""), title: `${cards.nameOf(d)}: ${metal(r.b).n}` }, h("span", { class: "wi" }, cards.iconOf(d)), h("span", { class: "wn" }, cards.nameOf(d)), h("span", { class: "wm" }, metal(r.b).e + " " + metal(r.b).n), r.dent ? h("span", { class: "wd" }, "🔨 repair") : null); }))));
    });
    k.set(h("div", { class: "stack" }, h("p", {}, n ? `${n} weapons forged. Each one is an idea you've mastered. Patrols make them stronger, and a weapon reaches Legendary after a month at gold.` : "Your armoury is empty for now. Every day you master (3 stars) forges new weapons."), legend, ...blocks));
  }
  const require_others = () => [...new Set([...cards.byTopic.keys()].map(key => prog.topic(key).pack))].filter(p => p !== prog.pack);

  return { openPatrol, skipPatrol, practiseIdea, openArmoury, run };
}
