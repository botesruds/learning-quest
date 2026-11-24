/* The Lab Plan (science Criterion B, day 13 in the Investigation Lab). Content from "Stage 1 content: Pattern Expedition
   and Lab Plan" (24 Nov 2026). Played by js/expedition.js after the day's Train and Challenge, in place of the Brain check:
   three rounds (Guided, Hints, On your own), each on one of three pulse-rate investigations, then the rung ladder.
   The plan he builds in his best round is saved; Stage 2's Results Room will start from it. */
import { h, shuffle } from "../../js/qcore.js";

const STRANDS = {
  question: { n: "Question", col: "#2E7BD6" }, hyp: { n: "Hypothesis", col: "#16A07F" },
  vars: { n: "Variables", col: "#E3A21A" }, method: { n: "Method", col: "#7A45C9" },
};
const INVS = [
  { k: "jog", iv: "Time jogging on the spot (minutes)", amounts: "0, 1, 2, 3 minutes", q: "How does the time I spend jogging affect my pulse rate?", ifP: "If I jog on the spot for longer,", act: "Jog on the spot for the set time." },
  { k: "jumps", iv: "Number of star jumps", amounts: "0, 10, 20, 30 star jumps", q: "How does the number of star jumps affect my pulse rate?", ifP: "If I do more star jumps,", act: "Do the star jumps." },
  { k: "steps", iv: "Speed of step-ups (steps a minute)", amounts: "10, 20, 30 steps a minute, for 1 minute", q: "How does the speed of my step-ups affect my pulse rate?", ifP: "If I do step-ups faster,", act: "Do step-ups for 1 minute at the set speed." },
];
const BECAUSE = "because my muscles need more oxygen and glucose for respiration, so my heart pumps blood faster.";
const DV = "Pulse rate (beats per minute)";
let last = -1;
function make() { let i; do { i = Math.floor(Math.random() * INVS.length); } while (i === last); last = i; return INVS[i]; }
const methodSteps = I => ["Rest for 2 minutes and measure your resting pulse.", I.act, "Straight away, count your pulse for 15 seconds and multiply by 4.", "Rest until your pulse is back to resting.", "Do each amount 3 times.", "Work out the mean for each amount."];
const choices = (right, wrong) => { const all = shuffle([right, ...wrong]); return { choice: all, ans: all.indexOf(right) }; };

/* round 3: he types the "because" himself; checked for the science, no AI */
function BecauseTask(I, done) {
  const inp = h("input", { class: "ans", type: "text", autocomplete: "off", "aria-label": "Your because", style: "max-width:none" });
  const fb = h("div");
  const btn = h("button", { class: "btn primary", type: "button", onclick: () => {
    const v = inp.value.toLowerCase(); if (v.trim().split(/\s+/).length < 3) { fb.className = "verdict mid"; fb.textContent = "Write a whole reason first."; return; }
    const ok = /oxygen|glucose/.test(v) && /respir|heart|blood/.test(v);
    btn.disabled = true; inp.disabled = true;
    if (ok) { inp.classList.add("ok"); fb.className = "verdict good"; fb.textContent = "Yes! That's the science behind it."; done("own"); }
    else { fb.className = "verdict mid"; fb.innerHTML = `A strong because uses the science: <i>${BECAUSE}</i>`; done("help"); }
  } }, "Check");
  return h("div", { class: "stack" }, h("p", {}, h("i", {}, `${I.ifP} then my pulse rate will increase, because…`)), h("div", { class: "ansrow" }, inp, btn), fb);
}

function items(I, round) {
  const L = [];
  L.push({ key: "question", strand: "question", h: "The question to test", a: choices(I.q, ["Is exercise good for you?", "What is my pulse rate?"]), p: "Which question can this investigation answer?", hint: "A good question names what you change and what you measure." });
  if (round === 1) L.push({ key: "predict", strand: "hyp", h: "Predict", a: choices("It will go up", ["It will go down", "It will stay the same"]), p: `${I.ifP.replace(/,$/, "")}, what will happen to your pulse rate?`, hint: "Think about how your heart feels after you run." });
  L.push({ key: "ifthen", strand: "hyp", h: "Build the hypothesis", a: { order: round === 3 ? [I.ifP, "then my pulse rate", "will increase,"] : [I.ifP, "then my pulse rate", "will increase,", BECAUSE] }, p: "Put the parts in order.", hint: "Start with \"If\": what you change. Then what you measure, then what will happen." });
  if (round === 3) L.push({ key: "because", strand: "hyp", h: "Your because", custom: done => BecauseTask(I, done) });
  else L.push({ key: "because", strand: "hyp", h: "The scientific reason", a: choices(BECAUSE, ["because my heart gets bigger.", "because exercise makes me tired."]), p: "Which \"because\" uses science?", hint: "What do muscles need more of when they work hard?" });
  L.push({ key: "vars", strand: "vars", h: "Change one, measure one", a: choices(`Change: ${I.iv.toLowerCase()}. Measure: pulse rate.`, [`Change: pulse rate. Measure: ${I.iv.toLowerCase()}.`, "Change: the person. Measure: the time."]), p: "Which is right for this plan?", hint: "The independent variable is what you change on purpose. The dependent variable is what you measure." });
  L.push({ key: "controls", strand: "vars", h: "Keep it fair", a: { sort: { bins: ["Keep the same", "Not a control"], items: [["The same person each time", 0], ["Measuring the pulse the same way", 0], ["Resting before each test", 0], [I.iv, 1], [DV, 1]] } }, p: "Which things do you keep the same?", hint: "Controls are everything except the one you change and the one you measure." });
  L.push({ key: "equip", strand: "method", h: "Equipment", a: { sort: { bins: ["I need it", "I don't need it"], items: [["Stopwatch or timer", 0], ["Space to exercise", 0], ["Results table", 0], ["Thermometer", 1], ["Microscope", 1], ["Ruler", 1]] } }, p: "Sort the equipment.", hint: "You need to time the exercise and the counting, and somewhere to write results." });
  L.push({ key: "method", strand: "method", h: "Method", a: { order: methodSteps(I) }, p: "Put the steps in order.", hint: "Start from rest. Count straight after the exercise. Repeats and the mean come last." });
  L.push({ key: "safety", strand: "method", h: "Safety", a: choices("Stop if you feel dizzy or unwell.", ["Exercise as hard as you can.", "Hold your breath while you count."]), p: "Which safety rule belongs in the plan?", hint: "Which one keeps you safe?" });
  return L;
}

function planLines(I) {
  return [["question", "Question: " + I.q], ["hyp", `Hypothesis: ${I.ifP} then my pulse rate will increase, ${BECAUSE}`],
    ["vars", `Variables: I change ${I.iv.replace(/ \(.*\)$/, "").toLowerCase()} (${I.amounts}). I measure my pulse rate in beats per minute. I keep the same: the same person, the same way of measuring, and resting before each test.`],
    ["method", "Equipment: stopwatch or timer, space to exercise, results table."],
    ["method", "Method: " + methodSteps(I).map((s, i) => `${i + 1} ${s}`).join(" ")], ["method", "Safety: stop if you feel dizzy or unwell."]];
}
const text = I => planLines(I).map(x => x[1]).join("\n");
function watch(I) {
  return h("div", { class: "stack" }, ...planLines(I).map(([k, t]) => h("div", { class: "xline" }, h("b", { class: "xtag", style: `background:${STRANDS[k].col}` }, STRANDS[k].n), h("span", {}, t))));
}

export const LAB_PLAN = {
  crit: "B", critName: "Inquiring and designing", name: "The Lab Plan",
  kid: "Plan a fair test",
  blurb: "This is the kind of plan your teacher marks for Criterion B. Each round is a different pulse investigation.",
  strands: STRANDS,
  partNames: { question: "question", predict: "prediction", ifthen: "if/then hypothesis", because: "scientific because", vars: "change and measure", controls: "controls", equip: "equipment", method: "method in order", safety: "safety" },
  rungs: [
    { need: [], text: "I made a prediction with help", tip: "Use \"If I change ..., then ... will ...\"" },
    { need: ["ifthen", "vars"], text: "I wrote a hypothesis and named the variable I change and the one I measure", tip: "Add a scientific because, and name the things to keep the same." },
    { need: ["ifthen", "vars", "because", "controls"], text: "My hypothesis has a because, and I named what I change, what I measure and what I keep the same", tip: "Add the question, the equipment and the method in order with repeats." },
    { need: ["ifthen", "vars", "because", "controls", "question", "equip", "method", "safety"], text: "My plan has a question, a hypothesis with a scientific because, all three kinds of variable, repeats, and a method someone else could follow", tip: "You're at the top. Try another investigation to keep it sharp." },
  ],
  make, items, text, watch,
  sheet: I => [h("p", {}, "Plan this investigation:"), h("p", {}, h("b", {}, `You will change: ${I.iv.replace(/ \(.*\)$/, "").toLowerCase()} (${I.amounts}). You will measure: your pulse rate.`))],
};

const ck = (q, right, wrong, why) => { const c = shuffle([right, ...wrong]); return { q, c, a: c.indexOf(right), why }; };
export const LAB_CHECKS = [
  ck("What three parts make a strong hypothesis?", "If I change..., then ... will ..., because + the science", ["A question, a guess and a title", "What you like, what you don't, and why"], "Name what you change, predict what happens to what you measure, and give a scientific reason."),
  ck("Which variable do you measure?", "The dependent variable", ["The independent variable", "The control variable"], "You change the independent variable and measure the dependent one."),
];
