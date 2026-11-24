/* The Pattern Expedition (maths Criterion B, day 21 in Pattern Peaks). Content from "Stage 1 content: Pattern Expedition
   and Lab Plan" (24 Nov 2026). Played by js/expedition.js: three rounds (Guided, Hints, On your own) on a fresh pattern each
   time, then the rung ladder. It replaces the old walk-through investigation, which wrote the write-up for him. */
import { h, ri, numVal, shuffle } from "../../js/qcore.js";
import { SV, vis, stickSVG, dotSVG, patternRow } from "./kit.js";
import { writeItem } from "../../js/expedition.js";

const STRANDS = {
  find: { n: "Find it", col: "#2E7BD6" }, describe: { n: "Describe it", col: "#16A07F" },
  test: { n: "Test it", col: "#E3A21A" }, explain: { n: "Explain it", col: "#7A45C9" },
};
const FAMILIES = [
  () => ({ k: "sq", a: 3, b: 1, unit: "sticks", piece: "square", bWhy: "the first stick on the left", aWhy: "each new square adds 3 sticks: top, bottom and right" }),
  () => ({ k: "tri", a: 2, b: 1, unit: "sticks", piece: "triangle", bWhy: "the first stick on the left", aWhy: "each new triangle adds 2 sticks" }),
  () => ({ k: "sq2", a: 5, b: 2, unit: "sticks", piece: "column of two squares", bWhy: "the two sticks on the far left", aWhy: "each new column adds 5 sticks: 3 across and 2 down" }),
  () => ({ k: "hex", a: 5, b: 1, unit: "sticks", piece: "hexagon", bWhy: "the first stick on the left", aWhy: "each new hexagon adds 5 sticks" }),
  () => { const a = ri(2, 5), b = ri(1, 4); return { k: { dots: true, a, b }, a, b, unit: "dots", piece: "column", bWhy: `the ${b} grey dot${b > 1 ? "s" : ""} that never change`, aWhy: `each new shape adds a column of ${a} dots` }; },
];
let lastFam = -1;
function make() {
  let i; do { i = ri(0, FAMILIES.length - 1); } while (i === lastFam && FAMILIES.length > 1); lastFam = i;
  const F = FAMILIES[i](); F.f = n => F.a * n + F.b; F.rule = `${F.a}n + ${F.b}`; return F;
}
const colour = F => !F.k.dots;
const drawN = (F, n) => { const p = F.k.dots ? dotSVG(F.a, F.b, n) : stickSVG(F.k, n, { colour: true }); return vis(SV(p.W, p.hh, p.s, "shape " + n)); };

/* the table of shapes 1 to 5: one check per try; round 3 allows one try */
function TableTask(F, done, round) {
  const ins = [1, 2, 3, 4, 5].map(() => h("input", { type: "text", inputmode: "numeric", "aria-label": "Number of " + F.unit }));
  const t = h("table", { class: "tbl" }, h("tr", {}, h("th", {}, "Shape"), ...[1, 2, 3, 4, 5].map(n => h("td", {}, n))), h("tr", {}, h("th", {}, cap(F.unit)), ...ins.map(i => h("td", {}, i))));
  let tries = 0; const fb = h("div");
  const end = r => { btn.disabled = true; ins.forEach(i => i.disabled = true); done(r); };
  const btn = h("button", { class: "btn primary", type: "button", onclick: () => {
    let all = true; ins.forEach((inp, i) => { const ok = numVal(inp.value) === F.f(i + 1); inp.classList.toggle("ok", ok); inp.classList.toggle("no", !ok); if (!ok) all = false; });
    if (all) { fb.className = "verdict good"; fb.textContent = "Table complete."; return end(tries ? "help" : "own"); }
    tries++;
    if (tries >= (round === 3 ? 1 : 2)) { ins.forEach((inp, i) => { inp.value = F.f(i + 1); inp.classList.remove("no"); inp.classList.add("ok"); }); fb.className = "verdict mid"; fb.textContent = "Here are the counts. Check one against the pictures."; return end("help"); }
    fb.className = "verdict bad"; fb.textContent = round === 1 ? "The red boxes aren't right yet. Count again carefully, one stick at a time." : "Not quite. Count the red ones again.";
  } }, "Check table");
  return h("div", { class: "stack" }, h("p", {}, `Fill in the number of ${F.unit} for shapes 1 to 5. Count from the pictures, then use the pattern for 5.`), patternRow(F.k, 4, { colour: colour(F) }), h("div", { class: "scroll-x" }, t), btn, fb);
}
const cap = s => s[0].toUpperCase() + s.slice(1);

function items(F, round) {
  const a = F.a, b = F.b, f = F.f;
  const choices = (right, wrong) => { const all = [right, ...wrong].sort(() => Math.random() - 0.5); return { choice: all, ans: all.indexOf(right) }; };
  const L = [];
  if (round === 1) L.push({ key: "count", strand: "find", h: "Look and count", body: () => [h("p", {}, `Here are the first three shapes, made of ${F.unit}.`), patternRow(F.k, 3, { colour: colour(F) })],
    a: { num: f(4) }, p: `Picture shape 4 (or draw it on paper). How many ${F.unit} does it use?`, hint: `Each shape adds the same amount. Shape 3 has ${f(3)}.`, after: () => h("div", {}, h("p", { class: "small muted" }, "Here's shape 4:"), drawN(F, 4)) });
  L.push({ key: "find", strand: "find", h: "Make a table", custom: (done, r) => TableTask(F, done, r) });
  if (round !== 2) L.push({ key: "words", strand: "describe", h: "Describe the pattern", body: round === 1 ? () => [h("p", {}, "Look at your table. Each shape uses more than the one before.")] : null,
    a: { num: a }, p: `Each new shape adds how many ${F.unit}?`, hint: `Take shape 1 away from shape 2: ${f(2)} − ${f(1)}.` });
  if (round === 1) L.push({ key: "why", strand: "describe", h: "Where does it come from?", body: () => [patternRow(F.k, 3, { colour: colour(F) })],
    a: choices(`Because ${F.aWhy}`, ["Because every shape doubles", `Because each shape adds one more ${F.k.dots ? "dot" : "stick"}`]), p: "Why does it go up by that much each time? Use the picture.", hint: "Look at what is new in each shape." });
  L.push({ key: "rule", strand: "describe", h: "The general rule", body: round === 1 ? () => [h("p", {}, `It goes up by ${a} each time, so compare with the ${a} times table (${a}n).`)] : null,
    a: { expr: `${a}n+${b}` }, p: `Write the nth term: the number of ${F.unit} in shape n.`, hint: `Compare with the ${a} times table: ${a}n for n = 1 is ${a}, but shape 1 has ${f(1)}.` });
  L.push({ key: "test", strand: "test", h: "Test your rule", body: round < 3 ? () => [h("p", {}, "A rule must work for shapes you haven't looked at yet.")] : null,
    a: { num: f(7) }, p: `Use your rule to predict shape 7.`, hint: `Put n = 7 into your rule: ${a} × 7 + ${b}.`, after: () => h("div", {}, h("p", {}, `Now count shape 7: it has ${f(7)} ${F.unit}. The rule works ✓`), drawN(F, 7)) });
  L.push({ key: "explain", strand: "explain", h: "Explain why it works", body: () => [patternRow(F.k, 2, { colour: colour(F) })],
    a: choices(`It's ${F.bWhy}`, ["It's the number of shapes", "It's the answer for shape 1"]), p: `In ${F.rule}, what does the + ${b} mean in the picture?`, hint: `Look for the part of the picture that is there before any ${F.piece} is added.` });
  return L;
}

function writeup(F, round) {
  const f = F.f;
  return [
    writeItem("w:find", "find", "Find", `I counted the ${F.unit} in the first shapes and made a table: ${[1, 2, 3, 4, 5].map(f).join(", ")}.`, ["I guessed the next numbers."],
      { text: `I counted the ${F.unit} in the first shapes and made a table: ${f(1)}, ${f(2)}, ___, ___, ___.`, ans: [3, 4, 5].map(n => String(f(n))) }, round),
    writeItem("w:describe", "describe", "Describe", `The number goes up by ${F.a} each time, so the rule is ${F.rule}.`, [`The ${F.piece}s get bigger.`],
      { text: "The number goes up by ___ each time, so the rule is ___.", ans: [String(F.a), F.rule] }, round),
    writeItem("w:test", "test", "Test", `My rule predicts shape 7 has ${F.a} × 7 + ${F.b} = ${f(7)} ${F.unit}. I counted shape 7 and it has ${f(7)}, so my rule works.`, ["Shape 7 looks right."],
      { text: `My rule predicts shape 7 has ___ ${F.unit}. I counted shape 7 and it has ___, so my rule works.`, ans: [String(f(7)), String(f(7))] }, round),
    writeItem("w:explain", "explain", "Explain", `The ${F.a}n is because ${F.aWhy}. The + ${F.b} is ${F.bWhy}.`, [`The + ${F.b} is because you always add ${F.b}.`, `The ${F.a}n is the number of shapes.`], null, round),
  ];
}

function text(F) {
  const f = F.f;
  return `Find: I counted the ${F.unit} in the first shapes and made a table: ${[1, 2, 3, 4, 5].map(f).join(", ")}.
Describe: the number goes up by ${F.a} each time, so the rule is ${F.rule}.
Test: my rule predicts shape 7 has ${F.a} × 7 + ${F.b} = ${f(7)} ${F.unit}. I counted shape 7 and it has ${f(7)}, so my rule works.
Explain: the ${F.a}n is because ${F.aWhy}. The + ${F.b} is ${F.bWhy}.`;
}

function watch(F) {
  const line = (k, t) => h("div", { class: "xline", style: `--sc:${STRANDS[k].col}` }, h("b", { class: "xtag", style: `background:${STRANDS[k].col}` }, STRANDS[k].n), h("span", {}, t));
  const f = F.f;
  return h("div", { class: "stack" }, patternRow(F.k, 3, { colour: colour(F) }),
    line("find", `I counted the ${F.unit} and made a table: ${[1, 2, 3, 4, 5].map(f).join(", ")}.`),
    line("describe", `It goes up by ${F.a} each time, so the rule is ${F.rule}.`),
    line("test", `My rule says shape 7 has ${F.a} × 7 + ${F.b} = ${f(7)}. I counted shape 7: ${f(7)}. It works.`),
    line("explain", `${F.a}n: ${F.aWhy}. + ${F.b}: ${F.bWhy}.`));
}

export const PATTERN_EXPEDITION = {
  crit: "B", critName: "Investigating patterns", name: "The Pattern Expedition",
  kid: "Find it, describe it, test it, explain it",
  blurb: "This is the kind of task your teacher gives for Criterion B. Every pattern is new.",
  strands: STRANDS,
  partNames: { count: "count shape 4", find: "table", words: "describe the jump", why: "where the jump comes from", rule: "nth term", test: "test on shape 7", explain: "explain the + number" },
  rungs: [
    { need: [], text: "I found some of the pattern with help", tip: "Count carefully and fill the table: that is \"use a method\"." },
    { need: ["find", "words"], text: "I found the pattern and described it in words", tip: "Turn \"goes up by 3\" into a rule with n in it: 3n + something." },
    { need: ["find", "words", "rule", "test"], text: "I wrote the general rule (the nth term) and tested it on a new shape", tip: "Say what the numbers in your rule mean in the picture." },
    { need: ["find", "words", "rule", "test", "explain"], text: "I found the rule, tested it on a new case and explained why it works, using the picture", tip: "You're at the top. Try a new pattern to keep it sharp." },
  ],
  make, items, writeup, text, watch,
  sheet: F => [h("p", {}, `Here are the first shapes of a pattern made of ${F.unit}. Investigate it.`), patternRow(F.k, 3, { colour: colour(F) })],
  /* round 2 doesn't ask "goes up by how many": the nth term shows it */
  fill: (parts, round) => { if (round === 2) parts.words = parts.rule; },
};

/* review cards for the armoury (asked as "why" cards) */
const ck = (q, right, wrong, why) => { const c = shuffle([right, ...wrong]); return { q, c, a: c.indexOf(right), why }; };
export const PATTERN_CHECKS = [
  ck("What are the four parts of a pattern investigation?", "Find it, describe it, test it, explain it", ["Guess it, check it, draw it, colour it", "Count it, add it, double it, stop"], "Your teacher looks for all four: a method, a general rule, a test on a new case, and why it works."),
  ck("Your rule fits shapes 1 to 4. What must you still do?", "Test it on a shape you haven't used", ["Nothing, it's finished", "Make the rule longer"], "A rule isn't proved by the cases you used to find it. Test it on a new one."),
  ck("In 4n + 2, what does the 4 tell you about the picture?", "Each new shape adds 4", ["There are 4 shapes", "Shape 1 has 4"], "The number in front of n is the jump: each new shape adds that many."),
];
