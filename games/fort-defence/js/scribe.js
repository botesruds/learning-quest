/* The Scribe's Tower: writing skills, on its own track so writing never blocks a subject day (like the Library tower).
   - Six floors (packs/writing/floors.js). A floor's stars:
       ⭐ 1  the lesson (I do, we do, you do)
       ⭐ 2  3 right on his own before 3 misses (fixed answers)
       ⭐ 3  a writing task he writes himself, marked by the AI coach against the floor's rubric (api/coach.js)
     The next floor opens at 3 stars (or when the parent corner has opened every day).
   - Royal reports: one question from the King per subject day (pack.writing.reports), opened once that day's lesson is
     done. What he writes grows with the floor he has reached: a sentence ending, then Point and Evidence, then full PEEL.
   - He writes one part at a time, each in its brick colour, with sentence starters and the day's fact card on screen.
     Instant checks (no AI) catch empty parts, a Point that misses the question's words and an Explain with no thinking
     word. Then the coach marks each rubric line met or not yet, praises one thing and gives one fix.
   - Every piece goes on the Writing desk in the parent corner, where a grown-up can read it and give or take back a star.
     If the coach can't be reached (or on a practice save), the piece waits on the desk for a grown-up.
   Save: S.wr = { fl: { floorKey: { stars, lesson } }, rp: { topicKey: { done, t } }, desk: [ pieces, newest last ] };
   practice answers go into S.hist under "wr:<floor>". */
import { h, esc, shuffle, pick, SayBtn } from "./qcore.js";
import { AnswerBox, LearnView } from "./qui.js";
import { sfx } from "./audio.js";
import { FLOORS, FLOOR, THINK_WORDS } from "../packs/writing/floors.js";
import { LOOT } from "./day.js";

const peek = (type, obj) => { window.__fdw = { type, obj }; };
const DESK_MAX = 80;

/* the bricks: what each part is called, its colour class, the reader's question and sentence starters */
export const BRICK = {
  point: { c: "p", name: "Point", q: "What do you think? Answer the question.", starts: [] },
  evidence: { c: "e", name: "Evidence", q: "How do you know? Give a fact or example.", starts: ["For example,", "We know this because", "Scientists have found that"] },
  explain: { c: "x", name: "Explain", q: "So what? Say how your fact proves your Point.", starts: ["This shows that", "This means that"] },
  link: { c: "l", name: "Link", q: "Go back to the question's words.", starts: ["Therefore,", "This is why"] },
};
const STOP = new Set("explain why how what does the and are is a an of to in for with that this they their them your you our we it its be by on from as at or do describe state compare contrast".split(" "));
const words = t => (String(t || "").trim().match(/[A-Za-z0-9×'’-]+/g) || []);
const keyWords = t => words(String(t).replace(/<[^>]+>/g, " ")).map(w => w.toLowerCase()).filter(w => w.length > 3 && !STOP.has(w));
const shares = (a, b) => { const A = keyWords(a), B = new Set(keyWords(b)); return A.some(w => B.has(w) || [...B].some(x => x.slice(0, 5) === w.slice(0, 5) && w.length > 4)); };
const hasThink = t => { const s = " " + String(t).toLowerCase() + " "; return THINK_WORDS.some(w => s.includes(" " + w)); };
const plain = t => String(t || "").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
/* tidy one part into a sentence for the joined paragraph: capital letter and full stop, as he wrote it otherwise */
const sentence = t => { let s = String(t || "").trim(); if (!s) return s; if (!/[.!?]$/.test(s)) s += "."; return s; };

/* instant checks for one field (no AI). Returns a hint, or "" when the field is fine. */
export function quickCheck(field, text, ctx) {
  const n = words(text).length;
  if (!n) return "Write something in this box first.";
  if (n < field.min) return field.min > 3 ? "Write a whole sentence here: a few more words." : "Add a few more words to finish the idea.";
  if (n > 70) return "That's a lot for one part. Keep each part to one or two sentences.";
  if (field.id === "point" && ctx.q && !shares(text, ctx.q)) return "Use some of the question's key words in your Point, so it clearly answers the question.";
  if (field.id === "explain" && !hasThink(text)) return "An Explain needs a thinking word, like \"This shows that\", \"This means that\", \"so\" or \"because\".";
  if (field.id === "link" && ctx.q && !shares(text, ctx.q)) return "Your Link should go back to the question: use some of its key words.";
  return "";
}

export function createScribe({ save, prog, day, toast, onChange }) {
  const S = () => save.state;
  const pack = () => prog.pack;
  const has = () => !!(pack().writing && pack().writing.reports && pack().writing.reports.length);
  const wr = () => { const st = S(); st.wr = st.wr || {}; st.wr.fl = st.wr.fl || {}; st.wr.rp = st.wr.rp || {}; st.wr.desk = st.wr.desk || []; return st.wr; };
  const F = k => wr().fl[k] || (wr().fl[k] = { stars: 0, lesson: false });
  const fstars = k => (wr().fl[k] && wr().fl[k].stars) || 0;
  const floorOpen = f => f.n === 1 || S().unlockAll || fstars(FLOORS[f.n - 2].k) >= 3;
  const curFloor = () => FLOORS.find(f => floorOpen(f) && fstars(f.k) < 3) || null;
  const reports = () => has() ? pack().writing.reports : [];
  const rkey = r => prog.keyOf(pack(), r.day);
  const rOpen = r => !!S().learnDone[rkey(r)] || S().unlockAll;
  const rDone = r => !!(wr().rp[rkey(r)] && wr().rp[rkey(r)].done);
  const unwritten = () => reports().filter(r => rOpen(r) && !rDone(r));
  /* what a royal report asks for: grows with the floors he has learned */
  const learnedN = () => FLOORS.reduce((m, f) => (F(f.k).lesson ? Math.max(m, f.n) : m), 0);
  const reportLevel = () => { const n = learnedN(); return n >= 5 ? "peel" : n === 4 ? "pe" : "stem"; };
  const news = () => has() && ((curFloor() && !F(curFloor().k).lesson) || (learnedN() > 0 && unwritten().length > 0));

  /* ---------------- the coach ---------------- */
  /* window.__fdCoach (tests and the preview page) can stand in for the real coach */
  async function coach(task) {
    if (window.__fdCoach) return window.__fdCoach(task);
    const pass = (window.Family && window.Family.pass) || null;
    if (save.practice || !pass) return { away: true, why: "practice" };
    try {
      const r = await fetch("/api/coach", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pass, task }) });
      if (!r.ok) return { away: true, why: "http " + r.status };
      const j = await r.json();
      return j && Array.isArray(j.lines) ? j : { away: true, why: "bad reply" };
    } catch (e) { return { away: true, why: "offline" }; }
  }
  function toDesk(piece) {
    const d = wr().desk; piece.id = piece.id || ("w" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6)); piece.t = Date.now();
    d.push(piece); while (d.length > DESK_MAX) d.shift(); save.commit(); onChange && onChange(); return piece;
  }

  /* ---------------- the sheet ---------------- */
  let K = null;
  const mount = title => { K = day.kit(); K.head([h("div", { class: "row", style: "justify-content:space-between;align-items:flex-start;gap:8px" }, h("div", { style: "min-width:0;flex:1" }, h("div", { class: "eyebrow" }, "✍️ Scribe's Tower"), h("h2", {}, title)), K.closeBtn()), K.lootbar]); };
  const backBtn = () => K.linkbtn("◂ Back to the Scribe's Tower", () => { sfx("click"); open(); });
  const gift = (r, el) => { if (r === "own") K.grant(LOOT.own, el); else if (r === "help") K.grant(LOOT.help, el); else sfx("wrong"); };
  const toolkit = f => h("details", { class: "kitcard" }, h("summary", {}, `🧰 ${f.icon} ${f.name}: the toolkit`), h("ol", {}, ...f.card.map(c => h("li", {}, c))));
  const factCard = facts => facts && facts.length ? h("details", { class: "kitcard facts", open: true }, h("summary", {}, "📜 Fact card"), h("ul", {}, ...facts.map(t => h("li", {}, t)))) : null;

  function open() {
    if (!has()) { toast("The Scribe's Tower opens with the science quest."); return; }
    mount("Writing like a scientist");
    const cur = curFloor(), un = learnedN() > 0 ? unwritten() : [];
    let next;
    if (cur && !F(cur.k).lesson) next = K.bigbtn(`${cur.icon} Floor ${cur.n}: ${cur.name}`, () => lesson(cur));
    else if (un.length) next = K.bigbtn(`👑 Royal report: Day ${prog.dayNo(rkey(un[0]))}`, () => report(un[0]));
    else if (cur && fstars(cur.k) < 2) next = K.bigbtn(`${cur.icon} Floor ${cur.n} Challenge`, () => challenge(cur));
    else if (cur) next = K.bigbtn(`✍️ Floor ${cur.n}: write it yourself`, () => task(cur));
    else next = h("p", { style: "font-weight:800" }, "🏆 Every floor is mastered! Write any royal report again for practice.");
    const floors = FLOORS.map(f => { const op = floorOpen(f), st = fstars(f.k);
      return h("button", { class: "qtile" + (op ? "" : " locked") + (cur === f ? " next" : ""), type: "button", "aria-label": `Floor ${f.n}: ${f.name}. ${st} stars.${op ? "" : " Locked."}`,
        onclick: () => { if (!op) { sfx("wrong"); toast("Get 3 stars on the floor below to open this one."); return; } sfx("click"); floorScreen(f); } },
        h("span", { class: "z" }, f.icon), h("span", { class: "nm" }, `${f.n}. ${f.name}`), h("span", { class: "st" }, "⭐".repeat(st) + "☆".repeat(3 - st))); });
    const reps = reports().map(r => { const op = rOpen(r) && learnedN() > 0, dn = rDone(r), no = prog.dayNo(rkey(r));
      return h("button", { class: "qtile" + (op ? "" : " locked") + (op && !dn ? " next" : ""), type: "button", "aria-label": `Day ${no} royal report.${op ? "" : " Locked."}`,
        onclick: () => { if (!op) { sfx("wrong"); toast(learnedN() ? `Finish the lesson on Day ${no} to open this report.` : "Learn floor 1 first, then the King's reports open."); return; } sfx("click"); report(r); } },
        h("span", { class: "z" }, String(no)), h("span", { class: "nm" }, r.title || `Day ${no}`), h("span", { class: "kind" }, dn ? "✓ sent" : op ? "new" : "locked")); });
    K.set(h("div", { class: "stack" },
      h("div", { class: "mission" }, "✍️ Good writers build answers a reader can follow. Learn one writing move on each floor, then use it in reports to the King about your science days. Writing here never blocks a science day."),
      next,
      h("section", { class: "qregion" }, h("h3", {}, "🏰 The six floors"), h("div", { class: "qtiles" }, ...floors)),
      h("section", { class: "qregion" }, h("h3", {}, "👑 Royal reports"), h("p", { class: "small muted" }, "The King asks about each science day once you've finished its lesson."), h("div", { class: "qtiles" }, ...reps)),
      learnedN() ? h("section", { class: "qregion" }, h("h3", {}, "🧰 Your writing toolkit"), ...FLOORS.filter(f => F(f.k).lesson).map(toolkit)) : null));
  }

  function floorScreen(f) {
    mount(`Floor ${f.n}: ${f.name}`);
    const st = fstars(f.k);
    K.set(h("div", { class: "stack" },
      h("div", { class: "card stack" }, h("div", { class: "row", style: "justify-content:space-between" }, h("b", {}, `${f.icon} ${f.does}`), h("span", { class: "stars" }, ...[0, 1, 2].map(i => h("span", { class: i < st ? "" : "off" }, "⭐")))),
        h("ol", { class: "small" }, ...f.card.map(c => h("li", {}, c)))),
      K.bigbtn("📖 " + (F(f.k).lesson ? "Read the lesson again" : "Start the lesson"), () => lesson(f), F(f.k).lesson ? "plain" : "go"),
      F(f.k).lesson ? K.bigbtn(`${f.icon} Challenge: 3 right on your own`, () => challenge(f), st < 2 ? "go" : "plain") : null,
      st >= 2 ? K.bigbtn("✍️ Write it yourself", () => task(f), st < 3 ? "go" : "plain") : null,
      backBtn()));
  }

  function lesson(f, i = 0) {
    mount(`Floor ${f.n}: ${f.name}`);
    K.set(h("div", { class: "stack" }, K.mission("📖 The Scribe shows you how, then you try with a hint, then on your own."),
      LearnView(f.lesson, i, j => lesson(f, j), () => { const fl = F(f.k), first = !fl.lesson; fl.lesson = true; if (fl.stars < 1) fl.stars = 1; if (first) { S().gold += 20; sfx("star"); } save.commit(); onChange && onChange();
        K.set(K.celebrate(h("div", { class: "bigstars" }, "⭐"), h("h2", {}, `${f.icon} ${f.name}: learned!`), h("p", {}, "It's in your 🧰 writing toolkit now."),
          h("div", { class: "toolkit" }, h("ol", {}, ...f.card.map(c => h("li", {}, c)))),
          K.bigbtn(`${f.icon} Challenge: 3 right on your own`, () => challenge(f)), backBtn())); },
        null, "Finish the lesson", (ok, tries, card) => { if (ok && !F(f.k).lesson) K.grant({ wood: 1 }, card); })));
  }

  /* one practice item (fixed answer) */
  function PracCard(f, it, onResult, onNext) {
    const card = h("div", { class: "card stack pop" }), body = h("div", { class: "stack", style: "gap:10px" });
    const nextBtn = h("button", { class: "btn primary hide", type: "button", onclick: onNext }, "Next ▸");
    let reported = false; const report = r => { if (reported) return; reported = true; onResult(r); nextBtn.classList.remove("hide"); setTimeout(() => { try { nextBtn.focus({ preventScroll: true }); } catch (e) {} }, 400); };
    const spec = it.order ? { order: it.order } : (() => { const c = shuffle(it.choice.map((t, i) => i)); return { choice: c.map(i => it.choice[i]), ans: c.indexOf(0) }; })();
    peek("prac", { ...it, spec });
    card.append(h("div", { class: "row", style: "justify-content:space-between;align-items:flex-start;gap:8px" }, h("span", { class: "schip" }, `${f.icon} ${f.name}`), SayBtn(() => plain(it.ask))),
      h("div", { class: "qs", html: it.ask }), toolkit(f), body, nextBtn);
    body.append(AnswerBox(spec, "", tries => { body.append(h("div", { class: "verdict good", html: `<b>${tries ? "Got it on the second try." : "Right, on your own!"}</b> ${it.why}` })); report(tries ? "help" : "own"); },
      (tries, fb) => { fb.className = "verdict bad"; fb.innerHTML = `Not quite. Open the 🧰 toolkit and try once more.`; },
      fb => { fb.className = "verdict mid"; fb.innerHTML = `<b>The answer is shown above.</b> ${it.why}`; report("wrong"); }));
    return card;
  }
  const seen = {};
  function draw(f) { let fresh = f.practice.map((it, i) => i).filter(i => !seen[f.k + i]); if (!fresh.length) { f.practice.forEach((_, i) => delete seen[f.k + i]); fresh = f.practice.map((_, i) => i); } const i = pick(fresh); seen[f.k + i] = 1; return f.practice[i]; }

  /* ⭐2: 3 right on his own before 3 misses */
  function challenge(f) {
    mount(`Floor ${f.n}: ${f.name} Challenge`);
    let hits = 0, misses = 0; const meter = h("div", { class: "row" }), area = h("div");
    const paint = () => meter.replaceChildren(h("b", {}, "Target: "), ...[0, 1, 2].map(i => h("span", { style: "font-size:1.8rem" }, i < hits ? "🎯" : "⚪")), h("span", { class: "muted small" }, misses ? `  ${misses} miss${misses > 1 ? "es" : ""} (3 misses and you read the lesson again)` : ""));
    const next = () => { paint(); if (hits >= 3) return win(); if (misses >= 3) return lose();
      let card; card = PracCard(f, draw(f), r => { prog.record("wr:" + f.k, r); if (r === "own") hits++; else misses++; gift(r, card); paint(); }, next); area.replaceChildren(card); };
    const win = () => { const fl = F(f.k), up = fl.stars < 2; if (up) { fl.stars = 2; S().gold += 20; } save.commit(); sfx("star"); onChange && onChange();
      K.set(K.celebrate(h("div", { class: "bigstars" }, "⭐⭐"), h("h2", {}, up ? "Second star!" : "Challenge won!"), h("p", {}, "Last step for this floor: write it yourself. The coach will check it with you."),
        K.bigbtn("✍️ Write it yourself", () => task(f)), backBtn())); };
    const lose = () => K.set(K.celebrate(h("div", { class: "bigstars" }, "📖"), h("h2", {}, "Not yet. Let's look at the lesson again!"), h("p", {}, "Read the Scribe's example, then try the Challenge again. Every writer practises."),
      K.bigbtn("📖 Read the lesson", () => lesson(f)), K.bigbtn("Try again", () => challenge(f), "plain"), backBtn()));
    K.set(h("div", { class: "stack" }, K.mission(`${f.icon} Get 3 right on your own. Right first time earns stone and iron.`), meter, area)); next();
  }

  /* ---------------- writing ---------------- */
  /* the fields he writes for each kind of task */
  function fieldsFor(kind, it) {
    const B = (id, min = 4) => ({ id, min, label: BRICK[id].name, brick: BRICK[id].c, hint: BRICK[id].q, starts: BRICK[id].starts });
    if (kind === "bbs") return ["because", "but", "so"].map(w => ({ id: w, min: 2, label: `${it.fact} ${w}…`, pre: w, hint: { because: "Give a reason: why?", but: "Say something different or surprising.", so: "Say what happens as a result." }[w] }));
    if (kind === "stem") return [{ id: "end", min: 2, label: it.stem, hint: "Finish the sentence. Is it true? Check the fact card." }];
    if (kind === "join") return [{ id: "joined", min: 6, label: "Join the two facts with a thinking word", hint: "Pick the word by its job: example, what it proves, result or different.", starts: ["for example", "this shows that", "this means that", "therefore", "as a result", "however", "whereas"] }];
    if (kind === "cmd") return it.qs.map((q, i) => ({ id: "a" + (i + 1), min: i === 0 ? 2 : 4, label: plain(q), html: q, hint: "Read the command word first. What size and kind of answer does it want?" }));
    if (kind === "pe") return [B("point"), B("evidence")];
    if (kind === "el") return [B("explain"), B("link")];
    return [B("point"), B("evidence"), B("explain"), B("link")];
  }
  const PLAN = ["point", "evidence", "explain", "link"];

  /* Writer: one part at a time, then the whole piece in colour, then (for PEEL) the four checks, then the coach.
     o = { kind, it, q, title, facts, given:{point,evidence}, plan:boolean, rubricNote, onDone(result, piece) } */
  function Writer(o) {
    const fields = fieldsFor(o.kind, o.it), ctx = { q: o.q || "" };
    const val = o.draft || {}, notes = o.notes || {};
    const wrap = h("div", { class: "stack writer" });
    const head = () => h("div", { class: "stack", style: "gap:8px" },
      o.q ? h("div", { class: "card wq" }, h("div", { class: "row", style: "justify-content:space-between;gap:8px;align-items:flex-start" }, h("div", { class: "qs", html: (o.lead || "") + esc(o.q) }), SayBtn(() => o.q))) : null,
      o.kind === "join" ? h("div", { class: "card wq" }, h("p", {}, "Fact A: ", h("b", {}, o.it.a)), h("p", {}, "Fact B: ", h("b", {}, o.it.b))) : null,
      o.given ? h("div", { class: "card peelp" }, h("span", { class: "pk p" }, o.given.point), " ", h("span", { class: "pk e" }, o.given.evidence)) : null,
      factCard(o.facts), o.floor ? toolkit(o.floor) : null);

    /* plan: four short note boxes (floor 6 learned) */
    function plan() {
      const inps = PLAN.map(id => { const i = h("input", { class: "ans wplan", type: "text", maxlength: 80, "aria-label": BRICK[id].name + " notes", placeholder: "a few words", value: notes[id] || "" }); i.addEventListener("input", () => { notes[id] = i.value; }); return [id, i]; });
      const fb = h("div");
      wrap.replaceChildren(head(), h("div", { class: "card stack" }, h("b", {}, "📝 Plan first: a few words in each box"),
        ...inps.map(([id, i]) => h("label", { class: "wrow" }, h("span", { class: "pk " + BRICK[id].c }, BRICK[id].name), i)), fb,
        h("button", { class: "btn primary", type: "button", onclick: () => { if (inps.some(([, i]) => !words(i.value).length)) { fb.className = "verdict mid"; fb.textContent = "Put a few words in every box. Notes are fine."; return; } sfx("click"); step(0); } }, "Now write it ▸")));
    }
    /* one field */
    function step(k) {
      const f = fields[k]; if (!f) return review();
      const ta = h("textarea", { class: "wbox" + (f.brick ? " b-" + f.brick : ""), rows: 3, "aria-label": f.label, spellcheck: "true", autocapitalize: "sentences" });
      ta.value = val[f.id] || ""; ta.addEventListener("input", () => { val[f.id] = ta.value; fb.replaceChildren(); fb.className = ""; });
      const fb = h("div");
      const starts = (f.starts || []).length ? h("div", { class: "row wstarts" }, h("span", { class: "small muted" }, "Starters:"), ...f.starts.map(s => h("button", { class: "chip wst", type: "button", onclick: () => { const v = ta.value.trim(); ta.value = v ? v + (/[.!?]$/.test(v) ? " " : " ") + s + " " : s + " "; val[f.id] = ta.value; ta.focus(); sfx("click"); } }, s))) : null;
      const goNext = () => { const msg = quickCheck(f, ta.value, ctx); if (msg) { fb.className = "verdict mid"; fb.textContent = "💡 " + msg; sfx("wrong"); return; } val[f.id] = ta.value.trim(); sfx("click"); step(k + 1); };
      const dots = h("div", { class: "chunkdots" }, ...fields.map((_, j) => h("i", { class: j < k ? "done" : j === k ? "cur" : "" })));
      wrap.replaceChildren(head(), h("div", { class: "card stack" },
        h("div", { class: "row", style: "justify-content:space-between;align-items:center" }, h("span", { class: "eyebrow" }, `Part ${k + 1} of ${fields.length}`), dots),
        f.brick ? h("div", { class: "row", style: "gap:8px;align-items:center" }, h("span", { class: "pk big " + f.brick }, f.label), h("span", { class: "small" }, f.hint)) : h("div", {}, h("div", { class: "qs", html: f.html || esc(f.label) }), h("div", { class: "small muted" }, f.hint)),
        notes[f.id] ? h("div", { class: "small" }, "📝 Your plan: ", h("i", {}, notes[f.id])) : null,
        ta, starts, fb,
        h("div", { class: "pager" }, k > 0 ? h("button", { class: "btn", type: "button", onclick: () => { val[f.id] = ta.value; step(k - 1); } }, "◂ Back") : h("span"),
          h("button", { class: "btn primary", type: "button", onclick: goNext }, k < fields.length - 1 ? "Next part ▸" : "See it all ▸"))));
      setTimeout(() => { try { ta.focus({ preventScroll: true }); } catch (e) {} }, 60);
    }
    const joined = () => fields.map(f => sentence(f.pre ? `${o.it.fact}${f.pre === "because" ? "" : ","} ${f.pre} ${val[f.id]}` : f.id === "end" ? `${o.it.stem.replace(/…$/, "")} ${val[f.id]}` : val[f.id]));
    /* the whole piece, in colour */
    function review() {
      const text = joined(), checks = o.kind === "peel" ? [
        "Check 1: my Point answers the command.", "Check 2: every fact is true (I looked at the fact card).", "Check 3: my Explain answers So what?", "Check 4: I listened to it read aloud and it sounds right."] : [];
      const boxes = checks.map(c => { const cb = h("input", { type: "checkbox" }); return [h("label", { class: "pc-check" }, cb, c), cb]; });
      const fb = h("div");
      const piece = h("div", { class: "card peelp wpiece" }, ...fields.map((f, i) => [h("button", { class: "pk " + (f.brick || "n"), type: "button", title: "Tap to change this part", onclick: () => { sfx("click"); step(i); } }, text[i]), " "]).flat());
      const send = h("button", { class: "btn primary", type: "button", onclick: async () => {
        if (boxes.some(([, cb]) => !cb.checked)) { fb.className = "verdict mid"; fb.textContent = "Do each check, one at a time, and tick it."; return; }
        send.disabled = true; send.textContent = "The coach is reading…"; sfx("click");
        const parts = {}; fields.forEach((f, i) => { parts[f.id] = f.pre || f.id === "end" ? text[i] : val[f.id]; });
        const taskOut = { kind: o.kind, question: o.q || (o.it.qs ? o.it.qs.map(plain) : o.it.fact || o.it.stem || ""), facts: o.facts || [], model: o.it.model || o.model || o.it.end || "", parts, given: o.given || null };
        const res = await coach(taskOut);
        o.onDone(res, { kind: o.kind, where: o.where, title: o.title, q: taskOut.question, parts, text: text.join(" "), notes: o.plan ? { ...notes } : null, draft: { ...val } });
      } }, "Send to the coach ▸");
      wrap.replaceChildren(head(), h("div", { class: "card stack" }, h("div", { class: "row", style: "justify-content:space-between;align-items:center" }, h("b", {}, "✨ Here it is, all together"), SayBtn(() => text.join(" "))),
        piece, h("p", { class: "small muted" }, "Tap any part to change it."), ...boxes.map(b => b[0]), fb, send));
    }
    if (o.plan && !o.draft) plan(); else step(o.draft ? 0 : 0);
    return wrap;
  }

  /* show the coach's marks. Returns true when every line is met. */
  function marks(res, piece) {
    const met = !res.away && res.lines.every(l => l.met);
    const lines = res.away ? [] : res.lines.map(l => h("li", { class: l.met ? "ok" : "no" }, h("b", {}, (l.met ? "✅ " : "🔧 ") + l.name + ": "), l.met ? "met" : "not yet", l.note ? h("span", { class: "small muted" }, " · " + l.note) : null));
    return { met, el: h("div", { class: "card stack" },
      h("div", { class: "card peelp wpiece" }, piece.text),
      res.away ? h("div", { class: "verdict mid" }, res.why === "practice" ? "📮 This is a practice save, so the coach isn't connected. Your writing is saved on the Writing desk for a grown-up to read." : "📮 The coach is away right now. Your writing is saved on the Writing desk, and a grown-up can mark it.")
        : h("div", { class: "stack", style: "gap:6px" }, h("ul", { class: "wmarks" }, ...lines), res.praise ? h("div", { class: "verdict good" }, "🌟 " + res.praise) : null, !met && res.fix ? h("div", { class: "verdict mid" }, "🔧 One thing to try: " + res.fix) : null)) };
  }

  /* ⭐3: the floor's writing task */
  function task(f, draft) {
    mount(`Floor ${f.n}: write it yourself`);
    const it = draft ? draft.it : pick(f.task.items);
    const o = { kind: f.task.kind, it, floor: f, where: "floor:" + f.k, title: `Floor ${f.n}: ${f.name}`, facts: it.facts, draft: draft && draft.val, notes: draft && draft.notes, plan: f.task.kind === "peel",
      q: it.q || (f.task.kind === "bbs" ? `Finish this fact three ways: ${it.fact}…` : f.task.kind === "join" ? "Join Fact A and Fact B with a thinking word." : f.task.kind === "cmd" ? "Answer both questions. Read each command word first." : ""),
      given: f.task.kind === "el" ? { point: it.point, evidence: it.evidence } : null,
      onDone: (res, piece) => {
        const m = marks(res, piece), entry = toDesk({ ...piece, floor: f.k, status: res.away ? "waiting" : m.met ? "met" : "notyet", verdict: res.away ? null : { lines: res.lines, praise: res.praise || "", fix: res.fix || "" } });
        prog.record("wr:" + f.k, res.away ? "help" : m.met ? "own" : "wrong");
        let after;
        if (m.met) { const fl = F(f.k), up = fl.stars < 3; if (up) { fl.stars = 3; S().gold += 30; } save.commit(); onChange && onChange(); sfx("star"); const nx = FLOORS[f.n];
          after = [h("div", { class: "bigstars" }, "⭐⭐⭐"), h("h2", {}, `Floor ${f.n} mastered!`), h("p", {}, nx ? `🔓 Floor ${nx.n}: ${nx.icon} ${nx.name} is open!` : "🏆 You've mastered every floor of the Scribe's Tower!"),
            modelBox(it), nx ? K.bigbtn(`${nx.icon} Learn ${nx.name.toLowerCase()}`, () => lesson(nx)) : null, backBtn()];
        } else if (res.away) after = [K.bigbtn("◂ Back to the Scribe's Tower", () => open(), "plain")];
        else after = [K.bigbtn("🔧 Fix it and send again", () => task(f, { it, val: piece.draft, notes: piece.notes })), backBtn()];
        K.set(h("div", { class: "stack" }, m.el, ...after));
        void entry;
      } };
    K.set(h("div", { class: "stack" }, K.mission(`✍️ Write it yourself. One part at a time. The coach marks it and gives you one thing to fix.`), Writer(o)));
  }
  const modelBox = it => { const m = it.model; if (!m) return null; const txt = typeof m === "string" ? m : Array.isArray(m) ? m.join(" ") : Object.values(m).join(" · ");
    return h("details", { class: "kitcard" }, h("summary", {}, "👀 Compare with the Scribe's answer"), h("p", {}, txt)); };

  /* a royal report */
  function report(r, draft) {
    const no = prog.dayNo(rkey(r)), lv = draft ? draft.lv : reportLevel(), plan = lv === "peel" && F("plan").lesson;
    mount(`Royal report: Day ${no}`);
    const o = { kind: lv, it: { stem: r.stem, model: lv === "stem" ? r.end : r.model }, where: "report:" + rkey(r), title: `Day ${no} report: ${r.title}`, facts: r.facts, q: lv === "stem" ? "" : r.ask, lead: "👑 The King asks: ",
      draft: draft && draft.val, notes: draft && draft.notes, plan,
      onDone: (res, piece) => {
        const m = marks(res, piece); toDesk({ ...piece, report: rkey(r), status: res.away ? "waiting" : m.met ? "met" : "notyet", verdict: res.away ? null : { lines: res.lines, praise: res.praise || "", fix: res.fix || "" } });
        let after;
        if (m.met) { const rp = wr().rp[rkey(r)] || (wr().rp[rkey(r)] = { done: false }); const first = !rp.done; rp.done = true; rp.t = Date.now(); if (first) S().gold += 25; save.commit(); onChange && onChange(); sfx("star");
          const more = unwritten()[0];
          after = [h("div", { class: "bigstars" }, "👑✨"), h("h2", {}, "The King is pleased!"), h("p", {}, first ? "🪙 +25 gold for your report." : "Great practice."), modelBox({ model: lv === "stem" ? r.stem.replace(/…$/, " " + r.end) : r.model }),
            more ? K.bigbtn(`👑 Next report: Day ${prog.dayNo(rkey(more))}`, () => report(more)) : null, backBtn()];
        } else if (res.away) after = [backBtn()];
        else after = [K.bigbtn("🔧 Fix it and send again", () => report(r, { lv, val: piece.draft, notes: piece.notes })), backBtn()];
        K.set(h("div", { class: "stack" }, m.el, ...after));
      } };
    const what = lv === "stem" ? "Finish the King's sentence about this day." : lv === "pe" ? "Answer the King with a Point and your Evidence." : "Answer the King with a full PEEL paragraph.";
    K.set(h("div", { class: "stack" }, K.mission(`👑 A report for the King about Day ${no}. ${what} The fact card has the facts you need.`), Writer(o)));
  }

  /* ---------------- the Writing desk (parent corner) ---------------- */
  function parentSection(dots, when, repaint) {
    const d = wr().desk, nSent = reports().filter(rDone).length;
    const rows = FLOORS.map(f => { const n = fstars(f.k);
      return h("div", { class: "pc-row" }, h("b", { class: "pc-day" }, f.icon), h("div", { class: "pc-t" }, h("b", {}, `Floor ${f.n}: ${f.name}`), h("div", { class: "small muted" }, f.does)),
        h("span", { class: "pc-st", "aria-label": n + " stars" }, "⭐".repeat(n) + "☆".repeat(3 - n)), dots("wr:" + f.k)); });
    const piece = p => {
      const st = { met: "✅ coach: met", notyet: "🔧 coach: not yet", waiting: "📮 waiting for you" }[p.status] || p.status;
      const ov = p.override ? (p.override === "give" ? " · ⭐ you gave the star" : " · you took the star back") : "";
      const give = () => { p.override = "give"; if (p.floor) { const fl = F(p.floor); fl.stars = 3; fl.lesson = true; } if (p.report) { const rp = wr().rp[p.report] || (wr().rp[p.report] = {}); rp.done = true; rp.t = Date.now(); } save.commit(); onChange && onChange(); repaint(); };
      const take = () => { p.override = "take"; if (p.floor) { const fl = F(p.floor); fl.stars = Math.min(fl.stars, 2); } if (p.report && wr().rp[p.report]) wr().rp[p.report].done = false; save.commit(); onChange && onChange(); repaint(); };
      const earned = (p.status === "met" && p.override !== "take") || p.override === "give";
      return h("details", { class: "kitcard wdesk" }, h("summary", {}, `${when(p.t)} · ${p.title} · ${st}${ov}`),
        p.q ? h("p", { class: "small" }, h("b", {}, "Question: "), Array.isArray(p.q) ? p.q.join(" / ") : p.q) : null,
        h("p", { class: "wpiece" }, p.text),
        p.notes ? h("p", { class: "small muted" }, "Plan: " + PLAN.map(k => `${BRICK[k].name}: ${p.notes[k] || ""}`).join(" · ")) : null,
        p.verdict ? h("ul", { class: "wmarks small" }, ...p.verdict.lines.map(l => h("li", {}, (l.met ? "✅ " : "🔧 ") + l.name + (l.note ? ": " + l.note : ""))), p.verdict.fix && p.status !== "met" ? h("li", {}, "Fix suggested: " + p.verdict.fix) : null) : null,
        h("div", { class: "row", style: "gap:8px" }, earned ? h("button", { class: "btn small", type: "button", onclick: take }, "Take back the star") : h("button", { class: "btn small", type: "button", onclick: give }, "Give the star")));
    };
    return h("section", { class: "stack pc-region" }, h("h3", {}, "✍️ Scribe's Tower (writing)"),
      h("p", { class: "small muted" }, `Its own track: it never blocks a science day. Each floor: lesson ⭐, 3 right on his own ⭐⭐, then a piece he writes himself, marked by the AI coach against the floor's rubric ⭐⭐⭐. Royal reports sent: ${nSent} of ${reports().length}.`),
      ...rows,
      h("h3", {}, "🗂️ Writing desk"),
      d.length ? h("p", { class: "small muted" }, "Everything he has written, newest first. You can give or take back the star on any piece.") : h("p", { class: "small muted" }, "Nothing written yet."),
      ...d.slice().reverse().slice(0, 20).map(piece));
  }

  return { open, news, has, curFloor, fstars, unwritten, reportLevel, parentSection, coach, task, report, lesson, challenge };
}
