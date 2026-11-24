/* The Healer's Case (science Criterion D, Reflecting on the impacts of science). An Expedition day of its own in Muscle
   Mountain, after day 12 (lifestyle and injury); the Cramp Colossus waits for it. Content from "Stages 2 to 4 content"
   (24 Nov 2026). Three rounds, each a different patient case: how science solves the problem, its benefits and
   drawbacks of different kinds, a judgement, a reliable source, and a PEEL paragraph. In rounds 1 and 2 he puts a PEEL
   paragraph in order; in round 3 he writes it himself and the AI writing coach marks it (api/coach.js, the "peel"
   rubric). If the coach can't be reached, the paragraph goes to the Writing desk and a grown-up can give the star.
   The top rung needs the coach's (or the grown-up's) "met"; 3 stars don't. */
import { h, shuffle } from "../../js/qcore.js";

const STRANDS = {
  science: { n: "The science", col: "#2E7BD6" }, impact: { n: "Impacts", col: "#16A07F" },
  comm: { n: "Communicate", col: "#E3A21A" }, sources: { n: "Sources", col: "#7A45C9" },
};
const CASES = [
  { k: "arm", who: "Sam, 12, fell off a bike and broke a bone in his forearm.", fix: "an X-ray and a plaster cast",
    problem: "The bone has a fracture, so it can't hold the arm up or let the muscles move it.",
    problemNo: ["The muscle has run out of glucose.", "The arm has too many cells."],
    science: "The X-ray shows where the bone is broken. The cast holds the two pieces still, so bone cells can make new bone and join the break.",
    scienceNo: ["The cast makes the bone grow longer.", "The X-ray mends the bone with light."],
    benefit: "The bone heals straight, so Sam can use his arm normally again.", benefitNo: ["Sam gets a day off school.", "The cast looks cool."],
    drawback: "Keeping the arm still for six weeks makes its muscles weaker, so Sam needs exercises afterwards.", drawbackNo: ["The cast makes the bone break again.", "X-rays make bones heavier."],
    kinds: [["The bone heals straight", 0], ["The arm muscles get weaker in the cast", 0], ["Casts and X-rays cost the hospital money", 1], ["Sam can't play sport or write easily for six weeks", 2], ["Sam can go back to football when it heals", 2]],
    judge: "Yes: a straight, strong arm matters more than six weeks in a cast, and exercises fix the weak muscles.",
    judgeNo: ["No: the cast is too heavy.", "Yes: because doctors always know best."],
    q: "How does science help Sam's broken arm, and is the treatment worth it?",
    facts: ["A fracture is a broken bone.", "An X-ray passes through soft tissue but not bone, so it shows where the break is.", "A cast holds the broken pieces still so bone cells can make new bone.", "A broken arm usually heals in about six weeks.", "Muscles that aren't used get weaker, so exercises help after the cast comes off."],
    peel: ["Science helps Sam's broken arm heal straight with an X-ray and a cast.", "The X-ray shows where the bone is broken, and the cast holds the pieces still for about six weeks.", "This means bone cells can make new bone and join the break, even though his arm muscles get weaker and need exercises.", "So the treatment is worth it, because it gives Sam back a strong, straight arm."] },
  { k: "bones", who: "Mrs Khan, 70, has osteoporosis: her bones have become weak and break easily.", fix: "a bone scan, calcium and vitamin D, and weight-bearing exercise",
    problem: "Her bones have lost minerals, so they are weak and can break in a small fall.",
    problemNo: ["Her muscles have turned into bone.", "Her heart is pumping too fast."],
    science: "Bones need calcium to be hard, and vitamin D helps the body take in calcium. Weight-bearing exercise like walking makes bones build more bone.",
    scienceNo: ["Calcium makes muscles longer.", "Vitamin D turns bone into cartilage."],
    benefit: "Stronger bones mean fewer breaks, so she can stay active and live on her own.", benefitNo: ["She gets to take lots of tablets.", "Her bones get bigger than other people's."],
    drawback: "Tablets cost money every month, and exercise can be hard when your bones already hurt.", drawbackNo: ["Calcium makes bones too strong.", "Walking makes bones weaker."],
    kinds: [["Fewer broken bones", 0], ["Exercise can hurt at first", 0], ["Tablets cost money every month", 1], ["Fewer hospital stays save the health service money", 1], ["She can keep living on her own", 2]],
    judge: "Yes: fewer breaks and staying independent matter more than the cost and effort.",
    judgeNo: ["No: old people don't need strong bones.", "Yes: because tablets are always good."],
    q: "How does science help people with osteoporosis, and is the treatment worth it?",
    facts: ["Osteoporosis means the bones lose minerals and become weak.", "Calcium makes bones hard.", "Vitamin D helps the body take in calcium.", "Weight-bearing exercise, like walking, makes bones build more bone.", "Weak bones can break in a small fall."],
    peel: ["Science helps people with osteoporosis make their bones stronger.", "Calcium makes bones hard, vitamin D helps the body take it in, and walking makes bones build more bone.", "This means their bones break less often, even though the tablets cost money and exercise can be hard at first.", "So the treatment is worth it, because it helps them stay active and live on their own."] },
  { k: "tendon", who: "Ali, 25, is a footballer who tore his Achilles tendon, which joins his calf muscle to his heel bone.", fix: "surgery to stitch the tendon, then physiotherapy",
    problem: "The torn tendon can't pass the calf muscle's pull to the heel, so he can't push off to walk or run.",
    problemNo: ["His heel bone has turned to muscle.", "His calf has too much blood."],
    science: "Surgeons stitch the two ends of the tendon together. Physiotherapy then strengthens the calf slowly, so the tendon can pull on the heel bone again.",
    scienceNo: ["Surgery makes the tendon into a bone.", "Physiotherapy makes muscles push instead of pull."],
    benefit: "Ali can walk, run and play football again.", benefitNo: ["Ali gets a new heel bone.", "Ali never has to train again."],
    drawback: "Surgery has a risk of infection, and it takes many months of physiotherapy before he can play.", drawbackNo: ["Surgery makes tendons too long.", "Physiotherapy makes muscles weaker."],
    kinds: [["Ali can walk and run again", 0], ["A risk of infection after surgery", 0], ["Surgery and physiotherapy cost money", 1], ["Ali can't earn money from football for months", 1], ["Ali misses playing with his team", 2]],
    judge: "Yes: walking and playing again matter more than the risk and the long recovery.",
    judgeNo: ["No: footballers should stop playing.", "Yes: because surgery is quick and easy."],
    q: "How does science help Ali's torn tendon, and is the treatment worth it?",
    facts: ["A tendon joins a muscle to a bone.", "When the calf muscle contracts, it pulls on the heel bone through the Achilles tendon.", "Surgeons can stitch a torn tendon back together.", "Physiotherapy strengthens muscles slowly with exercises.", "Recovery can take six months or more."],
    peel: ["Science helps Ali's torn tendon heal so he can play football again.", "Surgeons stitch the tendon back together, and physiotherapy strengthens his calf over many months.", "This means the calf muscle can pull on the heel bone again, even though surgery has a risk of infection.", "So the treatment is worth it, because Ali can walk, run and play again."] },
];
const BRICKS = [["point", "Point", "p"], ["evidence", "Evidence", "e"], ["explain", "Explain", "x"], ["link", "Link", "l"]];
let last = -1;
function make() { let i; do { i = Math.floor(Math.random() * CASES.length); } while (i === last); last = i; return CASES[i]; }
const choices = (right, wrong) => { const all = shuffle([right, ...wrong]); return { choice: all, ans: all.indexOf(right) }; };

/* round 3: he writes the PEEL paragraph himself; the AI coach marks it, else it waits on the Writing desk */
function WriteTask(C, done, env) {
  const val = {}, boxes = BRICKS.map(([id, name, c]) => { const ta = h("textarea", { class: "wbox b-" + c, rows: 2, "aria-label": name }); ta.addEventListener("input", () => { val[id] = ta.value; }); return [id, name, c, ta]; });
  const fb = h("div"), out = h("div", { class: "stack" });
  const facts = h("details", { class: "kitcard facts", open: true }, h("summary", {}, "📜 Fact card"), h("ul", {}, ...C.facts.map(t => h("li", {}, t))));
  const send = h("button", { class: "btn primary", type: "button", onclick: async () => {
    if (boxes.some(([id]) => String(val[id] || "").trim().split(/\s+/).filter(Boolean).length < 3)) { fb.className = "verdict mid"; fb.textContent = "Write a sentence in each box first."; return; }
    send.disabled = true; send.textContent = "The coach is reading…"; boxes.forEach(b => b[3].disabled = true);
    const parts = Object.fromEntries(BRICKS.map(([id]) => [id, String(val[id]).trim()]));
    const task = { kind: "peel", question: C.q, facts: C.facts, model: C.peel.join(" "), parts };
    let res; try { res = await env.coach(task); } catch (e) { res = { away: true, why: "offline" }; }
    const met = !res.away && Array.isArray(res.lines) && res.lines.every(l => l.met);
    const textAll = BRICKS.map(([id]) => parts[id]).join(" ");
    if (env.desk) env.desk({ kind: "peel", where: "exp:" + env.key, title: "Healer's Case: " + C.fix, q: C.q, parts, text: textAll, status: res.away ? "waiting" : met ? "met" : "notyet",
      verdict: res.away ? null : { lines: res.lines, praise: res.praise || "", fix: res.fix || "" }, exp: env.key, expItem: "write", expParts: env.parts });
    out.replaceChildren(
      res.away ? h("div", { class: "verdict mid" }, res.why === "practice" ? "📮 The coach isn't connected on a practice save. Your paragraph is on the Writing desk for a grown-up to read." : "📮 The coach is away right now. Your paragraph is on the Writing desk, and a grown-up can mark it.")
        : h("div", { class: "stack", style: "gap:6px" }, h("ul", { class: "wmarks" }, ...res.lines.map(l => h("li", { class: l.met ? "ok" : "no" }, h("b", {}, (l.met ? "✅ " : "🔧 ") + l.name + ": "), l.met ? "met" : "not yet", l.note ? h("span", { class: "small muted" }, " · " + l.note) : null))),
          res.praise ? h("div", { class: "verdict good" }, "🌟 " + res.praise) : null, !met && res.fix ? h("div", { class: "verdict mid" }, "🔧 Next time: " + res.fix) : null),
      h("details", { class: "kitcard" }, h("summary", {}, "👀 Compare with the Healer's answer"), h("p", {}, C.peel.join(" "))));
    done(met ? "own" : "help");
  } }, "Send to the coach ▸");
  return h("div", { class: "stack" }, h("p", {}, h("b", {}, C.q)), h("p", { class: "small muted" }, "Write one or two sentences in each box. The coach marks it and gives you one thing to try."), facts,
    ...boxes.map(([, name, c, ta]) => h("label", { class: "stack", style: "gap:4px" }, h("span", { class: "pk " + c }, name), ta)), fb, send, out);
}

function items(C, round) {
  const L = [];
  L.push({ key: "problem", strand: "science", h: "What's the problem?", body: () => [h("p", {}, C.who)], a: choices(C.problem, C.problemNo), p: "What is going wrong in the body?", hint: "Think about what that part of the body normally does." });
  L.push({ key: "science", strand: "science", h: "How does science help?", body: () => [h("p", {}, `The treatment: ${C.fix}.`)], a: choices(C.science, C.scienceNo), p: "How does the treatment work?", hint: "Which answer uses what you learned about bones and muscles?" });
  L.push({ key: "benefit", strand: "impact", h: "A benefit", a: choices(C.benefit, C.benefitNo), p: "Which is a real benefit of the treatment?", hint: "A benefit is a good result for the patient's health or life." });
  L.push({ key: "drawback", strand: "impact", h: "A drawback", a: choices(C.drawback, C.drawbackNo), p: "Which is a real drawback?", hint: "A drawback is a cost, a risk or a problem it causes. It must be true." });
  L.push({ key: "kinds", strand: "impact", h: "Different kinds of impact", a: { sort: { bins: ["Health", "Money", "Everyday life"], items: C.kinds } }, p: "Sort each impact.", hint: "Health is the body. Money is cost or earning. Everyday life is school, work, family and fun." });
  L.push({ key: "judge", strand: "impact", h: "Your judgement", a: choices(C.judge, C.judgeNo), p: "Is the treatment worth it? Pick the answer that weighs both sides.", hint: "A strong judgement says which side is bigger, and why." });
  L.push({ key: "source", strand: "sources", h: "Where did the facts come from?", a: choices("A health service website, with the page name and the date I read it", ["A comment on a video", "An advert for a cast company"]), p: "Which source would you trust, and how would you write it down?", hint: "Trust experts with nothing to sell, and write down where and when." });
  if (round === 3) L.push({ key: "write", strand: "comm", h: "Write it up: PEEL", custom: (done, r, env) => WriteTask(C, done, env) });
  else L.push({ key: "order", strand: "comm", h: "Build the PEEL paragraph", a: { order: C.peel }, p: "Put the sentences in PEEL order: Point, Evidence, Explain, Link.", hint: "The Point answers the question. The Link ties back to it at the end." });
  return L;
}

function watch(C) {
  const row = (k, t) => h("div", { class: "xline" }, h("b", { class: "xtag", style: `background:${STRANDS[k].col}` }, STRANDS[k].n), h("span", {}, t));
  return h("div", { class: "stack" }, h("p", {}, h("b", {}, C.who)), row("science", C.science), row("impact", `Benefit: ${C.benefit} Drawback: ${C.drawback} ${C.judge}`),
    row("sources", "Source: a health service website, with the page name and the date I read it."), row("comm", C.peel.join(" ")));
}
const text = C => [C.who, "Science: " + C.science, "Benefit: " + C.benefit, "Drawback: " + C.drawback, "Judgement: " + C.judge, "Paragraph: " + C.peel.join(" ")].join("\n");

export const HEALERS_CASE = {
  crit: "D", critName: "Reflecting on the impacts of science", name: "The Healer's Case",
  kid: "Science in the real world",
  blurb: "Your teacher marks this for Criterion D. Each round is a new patient: how does science help, and is it worth it?",
  strands: STRANDS,
  partNames: { problem: "the problem", science: "how the science helps", benefit: "a benefit", drawback: "a drawback", kinds: "kinds of impact", judge: "judgement", source: "reliable source", order: "PEEL in order", write: "PEEL paragraph (coach)" },
  rungs: [
    { need: [], text: "I said something about how science is used, with help", tip: "Say what the problem is and how the treatment works." },
    { need: ["problem", "science"], text: "I outlined the problem and how science helps solve it", tip: "Add a benefit, a drawback and a source you can trust." },
    { need: ["problem", "science", "benefit", "drawback", "source"], text: "I described how science solves the problem, with a benefit, a drawback and a reliable source", tip: "Sort the different kinds of impact, make a judgement, and write it up in PEEL yourself." },
    { need: ["problem", "science", "benefit", "drawback", "source", "kinds", "judge", "write"], text: "I summarised the science, weighed different kinds of impact, made a judgement and wrote it up clearly in PEEL", tip: "You're at the top. Try another patient to keep it sharp." },
  ],
  make, items, text, watch,
  sheet: C => [h("p", {}, h("b", {}, C.who)), h("p", {}, `The doctors use ${C.fix}.`)],
};

const ck = (q, right, wrong, why) => { const c = shuffle([right, ...wrong]); return { q, c, a: c.indexOf(right), why }; };
export const HEALER_CHECKS = [
  ck("A strong Criterion D answer about a treatment includes…", "How the science works, benefits AND drawbacks, and a judgement", ["Only the good things", "A list of facts with no opinion"], "Explain the science, weigh the benefits against the drawbacks, then judge whether it is worth it."),
  ck("Which source is most reliable for a health fact?", "A health service or university website", ["A comment under a video", "An advert"], "Trust experts with nothing to sell, and write down the page name and the date you read it."),
];
