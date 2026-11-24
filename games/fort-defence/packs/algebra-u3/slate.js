/* The Scribe's Slate (maths Criterion C, Communicating) and Market Day (maths Criterion D, Applying mathematics in
   real-life contexts). Two Expedition days of their own: the Slate at the end of Balance Bridge (the Bridge Troll waits
   for it), Market Day in the Final Castle (the Algebra Dragon waits for it). Content from "Stages 2 to 4 content"
   (24 Nov 2026). Played by js/expedition.js: three rounds (Guided, Hints, On your own), each with new numbers. */
import { h, ri, pick, shuffle, parse, evalT, N } from "../../js/qcore.js";

const choices = (right, wrong) => { const all = shuffle([right, ...wrong]); return { choice: all, ans: all.indexOf(right) }; };
const tidy = s => String(s).replace(/[−–]/g, "-").replace(/×/g, "*").replace(/÷/g, "/");
const line = (k, S, t) => h("div", { class: "xline" }, h("b", { class: "xtag", style: `background:${S[k].col}` }, S[k].n), h("span", {}, t));
const ck = (q, right, wrong, why) => { const c = shuffle([right, ...wrong]); return { q, c, a: c.indexOf(right), why }; };

/* ================= the Scribe's Slate (C) ================= */
const SL = {
  lang: { n: "Maths language", col: "#2E7BD6" }, rep: { n: "Represent", col: "#16A07F" },
  reason: { n: "Reasoning", col: "#E3A21A" }, organise: { n: "Organise", col: "#7A45C9" },
};
const STORIES = [
  { v: "d", what: "the distance in km", unit: "km", say: x => `The ride was ${x} km long.`, wrongVar: "d = the taxi", tell: (a, b, c) => `A taxi charges ${b} AED to start, plus ${a} AED for each km. A ride cost ${c} AED. How far was the ride?` },
  { v: "n", what: "the number of students", unit: "students", say: x => `${x} students went on the trip.`, wrongVar: "n = the bus", tell: (a, b, c) => `A school trip costs ${b} AED for the bus, plus ${a} AED for each student's ticket. The trip cost ${c} AED in total. How many students went?` },
  { v: "c", what: "the number of classes", unit: "classes", say: x => `Maya went to ${x} classes.`, wrongVar: "c = the gym", tell: (a, b, c) => `A climbing gym charges a ${b} AED joining fee, plus ${a} AED for each class. Maya paid ${c} AED. How many classes did she go to?` },
];
let lastS = -1;
function makeSlate() {
  let i; do { i = ri(0, STORIES.length - 1); } while (i === lastS); lastS = i;
  const st = STORIES[i], a = ri(3, 9), x = ri(4, 12); let b; do { b = ri(4, 25); } while (b === a); const c = a * x + b;
  return { ...st, a, b, c, x, eq: `${a}${st.v} + ${b} = ${c}`, l2: `${a}${st.v} = ${c - b}`, l3: `${st.v} = ${x}`, story: st.tell(a, b, c) };
}
/* a line of working is right when it has the same solution as the equation (and is still an equation in the letter) */
function sameSolution(I, s) {
  const t = tidy(s); if (!t.includes("=")) return false;
  const [L, R] = t.split("="); if (!L.trim() || !R.trim()) return false;
  try { const A = parse(L), B = parse(R), f = v => evalT(A, { [I.v]: v }) - evalT(B, { [I.v]: v });
    return Math.abs(f(I.x)) < 1e-9 && Math.abs(f(I.x + 1)) > 1e-9; } catch (e) { return false; }
}
/* round 3: he writes the working himself, one line per step */
function WorkingTask(I, done, round) {
  const mk = lbl => h("input", { class: "ans", type: "text", autocomplete: "off", spellcheck: "false", "aria-label": lbl, style: "max-width:none" });
  const i1 = mk("Line 1: the equation"), i2 = mk("Line 2"), i3 = mk("Line 3: the answer"), fb = h("div");
  const btn = h("button", { class: "btn primary", type: "button", onclick: () => {
    if (![i1, i2, i3].every(i => i.value.trim())) { fb.className = "verdict mid"; fb.textContent = "Write all three lines first."; return; }
    const ok1 = sameSolution(I, i1.value) && new RegExp(String(I.c)).test(i1.value), ok2 = sameSolution(I, i2.value), ok3 = new RegExp(`^\\s*${I.v}\\s*=\\s*${I.x}\\s*$`).test(tidy(i3.value));
    [[i1, ok1], [i2, ok2], [i3, ok3]].forEach(([i, ok]) => { i.classList.toggle("ok", ok); i.classList.toggle("no", !ok); i.disabled = true; });
    btn.disabled = true;
    if (ok1 && ok2 && ok3) { fb.className = "verdict good"; fb.textContent = "Clear working: one step per line, and every line is true."; done("own"); }
    else { fb.className = "verdict mid"; fb.innerHTML = `Clear working looks like this:<br><b>${I.eq}</b><br><b>${I.l2}</b> (take ${I.b} from both sides)<br><b>${I.l3}</b> (divide both sides by ${I.a})`; done("help"); }
  } }, "Check my working");
  return h("div", { class: "stack" }, h("p", {}, `Write your working, one step per line. Use ${I.v}.`), h("label", { class: "small" }, "Line 1: the equation"), i1, h("label", { class: "small" }, "Line 2: after one step"), i2, h("label", { class: "small" }, `Line 3: ${I.v} = …`), i3, btn, fb);
}
const pre = t => h("pre", { class: "xpre" }, t);
const goodWork = I => `${I.eq}\n${I.l2}\n${I.l3}`;
const runOn = I => `${I.eq} − ${I.b} = ${I.c - I.b} ÷ ${I.a} = ${I.x}`;

function slateItems(I, round) {
  const L = [], v = I.v;
  L.push({ key: "letter", strand: "lang", h: "Say what the letter means", body: () => [h("p", {}, I.story)], a: choices(`Let ${v} = ${I.what}`, [`Let ${I.wrongVar}`, `Let ${v} = ${I.c}`]), p: "How should your working start?", hint: "The letter stands for the number you want to find." });
  L.push(round === 3 ? { key: "equation", strand: "rep", h: "Write the equation", custom: (done, r) => WorkingTask(I, done, r) }
    : { key: "equation", strand: "rep", h: "Write the equation", a: choices(I.eq, [`${I.b}${v} + ${I.a} = ${I.c}`, `${I.a} + ${I.b} = ${I.c}${v}`]), p: "Which equation matches the story?", hint: `${I.a} AED for each one means ${I.a}${v}. Then add the ${I.b} that you pay once.` });
  if (round < 3) L.push({ key: "steps", strand: "reason", h: "Put the working in order", a: { order: [I.eq, `${I.l2}   (− ${I.b} from both sides)`, `${I.l3}   (÷ ${I.a} on both sides)`, `Check: ${I.a} × ${I.x} + ${I.b} = ${I.c} ✓`] }, p: "One step per line. Tap them in order.", hint: "Start with the equation. Undo the + first, then the ×. The check comes last." });
  L.push({ key: "check", strand: "reason", h: "Check it", a: { num: I.c }, p: `Put ${v} = ${I.x} back into the story: work out ${I.a} × ${I.x} + ${I.b}.`, hint: "Multiply first, then add.", after: () => h("p", { class: "small" }, `${I.c} matches the story, so ${v} = ${I.x} is right ✓`) });
  L.push({ key: "layout", strand: "organise", h: "Which is easiest to follow?", body: () => [h("p", { class: "small" }, "A"), pre(goodWork(I)), h("p", { class: "small" }, "B"), pre(runOn(I)), h("p", { class: "small" }, "C"), pre(String(I.x))],
    a: choices("A: one step per line, with the = signs lined up", ["B: it's all on one line, so it's shorter", "C: just the answer is enough"]), p: "Your teacher marks how clearly you show your thinking.", hint: "Could someone else follow every step, and is every line true?" });
  L.push({ key: "fix", strand: "lang", h: "Spot the mistake", body: () => [pre(runOn(I))], a: choices(`${I.c} − ${I.b} isn't equal to ${I.eq.split(" =")[0]}, so the = signs say things that aren't true`, ["It has too many numbers", "Nothing is wrong, it gets the right answer"]),
    p: "What's wrong with this working?", hint: "An = sign means both sides are worth the same. Read each = from left to right." });
  L.push({ key: "answer", strand: "lang", h: "Answer the question", a: choices(I.say(I.x), [String(I.x), `${v} = ${I.x} AED`]), p: "Finish with a sentence that answers the question.", hint: "Use words and the right units." });
  return L;
}
export const SCRIBES_SLATE = {
  crit: "C", critName: "Communicating", name: "The Scribe's Slate",
  kid: "Show it so anyone can follow",
  blurb: "Your teacher marks this for Criterion C: can someone else follow your maths? Each round is a new word problem.",
  strands: SL,
  partNames: { letter: "say what the letter means", equation: "the equation", steps: "working in order", check: "check the answer", layout: "clear layout", fix: "spot the = mistake", answer: "answer in a sentence" },
  rungs: [
    { need: [], text: "I showed some working, with help", tip: "Write the equation, then answer the question in a sentence." },
    { need: ["equation", "answer"], text: "I wrote the equation and answered in a sentence with units", tip: "Say what the letter means, show one step per line and check your answer." },
    { need: ["equation", "answer", "letter", "steps", "check"], text: "I said what the letter means, showed one step per line and checked my answer", tip: "Lay it out so anyone can follow, and use = only between things that are equal." },
    { need: ["equation", "answer", "letter", "steps", "check", "layout", "fix"], text: "My working is complete and clear: correct notation, one step per line, a check, and an answer in context", tip: "You're at the top. Try a new problem to keep it sharp." },
  ],
  make: makeSlate, items: slateItems,
  /* round 3 writes the steps in the working task, so it counts for both */
  fill: (parts, round) => { if (round === 3) parts.steps = parts.equation; },
  text: I => `Let ${I.v} = ${I.what}\n${goodWork(I)}\nCheck: ${I.a} × ${I.x} + ${I.b} = ${I.c} ✓\n${I.say(I.x)}`,
  watch: I => h("div", { class: "stack" }, h("p", {}, I.story), line("lang", SL, `Let ${I.v} = ${I.what}`), line("rep", SL, I.eq),
    line("reason", SL, `${I.l2}  (− ${I.b} from both sides) → ${I.l3}  (÷ ${I.a}). Check: ${I.a} × ${I.x} + ${I.b} = ${I.c} ✓`), line("organise", SL, "One step per line, = signs lined up."), line("lang", SL, I.say(I.x))),
  sheet: I => [h("p", {}, h("b", {}, I.story)), h("p", { class: "small muted" }, "Solve it, and show your working so anyone can follow.")],
};
export const SLATE_CHECKS = [
  ck("What does an = sign mean?", "Both sides are worth the same", ["The answer comes next", "Do the next step"], "Only write = between things that are equal. Start a new line for each step."),
  ck("How should a solution to a word problem start and end?", "Say what the letter means; end with a sentence and units", ["Start with the answer; end with a tick", "Start with a drawing; end with the letter"], "\"Let d = the distance in km\" at the start, and \"The ride was 7 km\" at the end."),
];

/* ================= Market Day (D) ================= */
const MD = {
  identify: { n: "Identify", col: "#2E7BD6" }, strategy: { n: "Strategy", col: "#16A07F" },
  solve: { n: "Solve", col: "#E3A21A" }, sense: { n: "Make sense", col: "#7A45C9" },
};
const GOODS = [
  { one: "cup of lemonade", many: "cups of lemonade", short: "cups" }, { one: "bracelet", many: "bracelets", short: "bracelets" }, { one: "cookie", many: "cookies", short: "cookies" },
];
let lastM = -1;
function makeMarket() {
  let i; do { i = ri(0, GOODS.length - 1); } while (i === lastM); lastM = i;
  const G = GOODS[i]; let c, m, F, T;
  do { c = ri(1, 4); m = pick([2, 4, 5]); F = ri(10, 30); T = 10 * ri(4, 9); } while ((T + F) % m === 0 || (T + F) / m < 12 || (T + F) / m > 45);
  const p = c + m, exact = (T + F) / m, n = Math.ceil(exact);
  return { ...G, c, p, m, F, T, exact, n, mins: Math.round(240 / n), profit: k => m * k - F };
}
function marketItems(I, round) {
  const L = [];
  L.push({ key: "relevant", strand: "identify", h: "What do you need?", body: () => [h("p", {}, story(I))], a: { sort: { bins: ["I need it", "I don't need it"], items: [[`Stall fee: ${I.F} AED`, 0], [`Each one costs ${I.c} AED to make`, 0], [`You sell each one for ${I.p} AED`, 0], [`You want ${I.T} AED profit`, 0], ["The stall is painted blue", 1], ["The market has 30 stalls", 1]] } },
    p: "Sort the information.", hint: "You need the money facts: what you pay, what you earn and what you want to make." });
  if (round === 1) L.push({ key: "letter", strand: "identify", h: "Name the unknown", a: choices(`n = the number of ${I.many} you sell`, [`n = the price of one ${I.one}`, "n = the profit"]), p: "What should the letter n stand for?", hint: "What number are you trying to find?" });
  L.push(round === 3 ? { key: "strategy", strand: "strategy", h: "Build the model", a: { expr: `${I.m}n-${I.F}` }, p: `Write the profit for selling n ${I.short}, as an expression in n.`, hint: `Each one earns ${I.p} − ${I.c} = ${I.m} AED. Then take away the fee.` }
    : { key: "strategy", strand: "strategy", h: "Build the model", a: choices(`Profit = (${I.p} − ${I.c}) × n − ${I.F}`, [`Profit = ${I.p} × n`, `Profit = (${I.p} + ${I.c}) × n + ${I.F}`]), p: "Which formula gives your profit?", hint: "Profit is what you earn, take away what you spend. Don't forget the stall fee." });
  L.push({ key: "solve", strand: "solve", h: "Solve it", body: () => [h("p", {}, `To make ${I.T} AED profit: ${I.m}n − ${I.F} = ${I.T}`)], a: { num: I.exact }, p: "Solve the equation. n = ?", hint: `Add ${I.F} to both sides, then divide by ${I.m}. Your answer can be a decimal.` });
  L.push({ key: "accuracy", strand: "sense", h: "How accurate?", a: choices(`${I.n}: round up, because ${I.n - 1} ${I.short} make only ${I.profit(I.n - 1)} AED`, [`${I.n - 1}: always round down`, `${N(I.exact)}: keep the decimal, it's more exact`]),
    p: `You can't sell part of a ${I.one}. How many must you sell, and why?`, hint: `Work out the profit for ${I.n - 1}. Is it enough?` });
  L.push({ key: "check", strand: "sense", h: "Check it", a: { num: I.profit(I.n) }, p: `Check: what profit do ${I.n} ${I.short} make?`, hint: `${I.m} × ${I.n} − ${I.F}` });
  L.push({ key: "sense", strand: "sense", h: "Does it make sense?", a: choices(`Yes: the market is open 4 hours, so that's about one every ${I.mins} minutes`, ["Yes: maths answers are always right", "No: you can never sell that many"]),
    p: `Is selling ${I.n} ${I.short} in a 4-hour market realistic?`, hint: "4 hours is 240 minutes. Share them between the sales." });
  return L;
}
const story = I => `You run a market stall selling ${I.many}. The stall fee is ${I.F} AED. Each one costs ${I.c} AED to make and you sell it for ${I.p} AED. You want to make ${I.T} AED profit. The market is open for 4 hours.`;
export const MARKET_DAY = {
  crit: "D", critName: "Applying mathematics in real-life contexts", name: "Market Day",
  kid: "Use maths for real",
  blurb: "Your teacher marks this for Criterion D: use maths to solve a real problem, and check the answer makes sense. Each round is a new stall.",
  strands: MD,
  partNames: { relevant: "pick the facts you need", letter: "name the unknown", strategy: "the profit model", solve: "solve the equation", accuracy: "round and justify", check: "check the profit", sense: "does it make sense?" },
  rungs: [
    { need: [], text: "I used some of the information, with help", tip: "Pick out the facts you need, then solve the equation." },
    { need: ["relevant", "solve"], text: "I picked the facts I needed and solved the problem", tip: "Build the model yourself and round your answer the right way, saying why." },
    { need: ["relevant", "solve", "strategy", "accuracy"], text: "I chose a model, solved it and justified how I rounded", tip: "Check your answer and say whether it makes sense in real life." },
    { need: ["relevant", "solve", "strategy", "accuracy", "check", "sense"], text: "I modelled a real problem, solved it, justified the accuracy and checked that it makes sense", tip: "You're at the top. Try a new stall to keep it sharp." },
  ],
  make: makeMarket, items: marketItems,
  text: I => `Facts: fee ${I.F} AED, cost ${I.c} AED, price ${I.p} AED, target ${I.T} AED.\nModel: profit = ${I.m}n − ${I.F}\nSolve: ${I.m}n − ${I.F} = ${I.T}, so n = ${N(I.exact)}\nRound up to ${I.n}: ${I.n - 1} make only ${I.profit(I.n - 1)} AED.\nCheck: ${I.m} × ${I.n} − ${I.F} = ${I.profit(I.n)} AED. About one every ${I.mins} minutes, so it makes sense.`,
  watch: I => h("div", { class: "stack" }, h("p", {}, story(I)), line("identify", MD, `I need: fee ${I.F}, cost ${I.c}, price ${I.p}, target ${I.T}. n = the number of ${I.many} sold.`),
    line("strategy", MD, `Profit = (${I.p} − ${I.c}) × n − ${I.F} = ${I.m}n − ${I.F}`), line("solve", MD, `${I.m}n − ${I.F} = ${I.T} → ${I.m}n = ${I.T + I.F} → n = ${N(I.exact)}`),
    line("sense", MD, `Round up to ${I.n} (${I.n - 1} make only ${I.profit(I.n - 1)} AED). Check: ${I.profit(I.n)} AED ✓. About one every ${I.mins} minutes: realistic.`)),
  sheet: I => [h("p", {}, h("b", {}, story(I))), h("p", { class: "small muted" }, "How many must you sell?")],
};
export const MARKET_CHECKS = [
  ck("Your answer is 23.4 people. What do you do?", "Round to a whole number that makes sense, and say why", ["Write 23.4 people", "Always round down"], "Real things often come in whole numbers. Decide up or down from the context, and justify it."),
  ck("What is the last step of a real-life problem?", "Check the answer makes sense in real life", ["Underline the answer", "Make the number bigger"], "Ask: is it realistic? Put the answer back into the situation."),
];
