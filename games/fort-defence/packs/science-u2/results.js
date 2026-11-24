/* The Results Room (science Criterion C, Processing and evaluating). An Expedition day of its own in the Investigation Lab,
   after the Lab Plan. Content from "Stages 2 to 4 content" (24 Nov 2026). Played by js/expedition.js: three rounds
   (Guided, Hints, On your own), each with a fresh set of pulse results from one of the three Lab Plan investigations.
   He works out the means, spots the anomaly, picks the right graph, describes and explains the trend, says whether the
   hypothesis was supported, and evaluates the method. Ready-made results: entering his own is for later. */
import { h, ri, shuffle, numVal } from "../../js/qcore.js";

const STRANDS = {
  present: { n: "Present", col: "#2E7BD6" }, interpret: { n: "Interpret", col: "#16A07F" },
  hyp: { n: "Hypothesis", col: "#E3A21A" }, evaluate: { n: "Evaluate", col: "#7A45C9" },
};
const INVS = [
  { k: "jog", iv: "time jogging", unit: "min", xs: [0, 1, 2, 3], xl: "Time jogging (minutes)", amt: x => `${x} min`, more: "jogs for longer", step: [14, 20] },
  { k: "jumps", iv: "number of star jumps", unit: "", xs: [0, 10, 20, 30], xl: "Number of star jumps", amt: x => `${x} jumps`, more: "does more star jumps", step: [12, 18] },
  { k: "steps", iv: "speed of step-ups", unit: "steps a minute", xs: [10, 20, 30], xl: "Speed of step-ups (steps a minute)", amt: x => `${x} a min`, more: "does step-ups faster", step: [16, 24] },
];
const BECAUSE = "muscles need more oxygen and glucose for respiration, so the heart pumps blood faster";
let last = -1;
function make() {
  let i; do { i = ri(0, INVS.length - 1); } while (i === last); last = i;
  const I = { ...INVS[i] }, n = I.xs.length;
  const rest = ri(68, 80), step = ri(I.step[0], I.step[1]);
  I.means = I.xs.map((_, j) => rest + j * step + (j ? ri(-2, 2) : 0));
  // three repeats per amount, spread around the mean so the mean is a whole number
  I.rows = I.means.map(m => { const d = ri(1, 4); return shuffle([m - d, m, m + d]); });
  // one anomaly, never in the first row: a count made for 10 seconds instead of 15 (about a third too low)
  const ar = ri(1, n - 1), m = I.means[ar], d = ri(2, 4);
  I.rows[ar] = [m - d, Math.round(m * 0.66), m + d]; I.anom = { r: ar, c: 1, v: Math.round(m * 0.66) };
  I.withAnom = Math.round((m - d + I.anom.v + m + d) / 3);   // the mean if the anomaly is wrongly left in
  I.rise = I.means[n - 1] - I.means[0];
  return I;
}

/* the results table; o.means: show the means column (values or input boxes) */
function table(I, o = {}) {
  const head = h("tr", {}, h("th", {}, I.xl), h("th", {}, "Try 1"), h("th", {}, "Try 2"), h("th", {}, "Try 3"), o.means ? h("th", {}, "Mean") : null);
  const rows = I.xs.map((x, r) => h("tr", {}, h("th", {}, String(x)), ...I.rows[r].map((v, c) => h("td", { class: o.mark && I.anom.r === r && I.anom.c === c ? "xanom" : "" }, String(v))),
    o.means ? h("td", {}, o.inputs ? o.inputs[r] : String(I.means[r])) : null));
  return h("div", { class: "scroll-x" }, h("table", { class: "tbl xres" }, head, ...rows), h("p", { class: "small muted" }, "Pulse rate in beats per minute."));
}

/* a line graph of the means as an SVG string. o.swap: axes the wrong way round; o.wrong: plot this mean instead at row r */
function graphSVG(I, o = {}) {
  const W = 300, H = 190, L = 44, B = 36, T = 12, R = 12;
  const ys = I.means.map((m, r) => o.wrong && o.wrong.r === r ? o.wrong.v : m);
  const ymin = Math.floor((Math.min(...ys) - 10) / 10) * 10, ymax = Math.ceil((Math.max(...ys) + 10) / 10) * 10;
  const xmin = I.xs[0], xmax = I.xs[I.xs.length - 1];
  const px = (x, lo, hi, a, b) => a + (x - lo) / (hi - lo || 1) * (b - a);
  let pts, xlab, ylab, xt, yt;
  if (!o.swap) {
    pts = I.xs.map((x, r) => [px(x, xmin, xmax, L + 10, W - R - 6), px(ys[r], ymin, ymax, H - B, T)]);
    xlab = I.xl; ylab = "Pulse rate (bpm)";
    xt = I.xs.map(x => [px(x, xmin, xmax, L + 10, W - R - 6), String(x)]);
    yt = [ymin, (ymin + ymax) / 2, ymax].map(v => [px(v, ymin, ymax, H - B, T), String(v)]);
  } else {
    pts = I.xs.map((x, r) => [px(ys[r], ymin, ymax, L + 10, W - R - 6), px(x, xmin, xmax, H - B, T)]);
    xlab = "Pulse rate (bpm)"; ylab = I.xl.replace(/ \(.*\)$/, "");
    xt = [ymin, (ymin + ymax) / 2, ymax].map(v => [px(v, ymin, ymax, L + 10, W - R - 6), String(v)]);
    yt = I.xs.map(x => [px(x, xmin, xmax, H - B, T), String(x)]);
  }
  const line = pts.map(p => p.map(v => v.toFixed(1)).join(",")).join(" ");
  return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:${W}px" role="img" aria-label="line graph">
  <rect x="0" y="0" width="${W}" height="${H}" fill="#fff"/>
  <line x1="${L}" y1="${T}" x2="${L}" y2="${H - B}" stroke="#333" stroke-width="1.5"/><line x1="${L}" y1="${H - B}" x2="${W - R}" y2="${H - B}" stroke="#333" stroke-width="1.5"/>
  ${xt.map(([x, t]) => `<text x="${x.toFixed(1)}" y="${H - B + 14}" font-size="11" text-anchor="middle" fill="#333">${t}</text>`).join("")}
  ${yt.map(([y, t]) => `<text x="${L - 5}" y="${(y + 4).toFixed(1)}" font-size="11" text-anchor="end" fill="#333">${t}</text>`).join("")}
  <text x="${(L + W - R) / 2}" y="${H - 6}" font-size="11" text-anchor="middle" fill="#333">${xlab}</text>
  <text x="11" y="${(T + H - B) / 2}" font-size="11" text-anchor="middle" fill="#333" transform="rotate(-90 11 ${(T + H - B) / 2})">${ylab}</text>
  <polyline points="${line}" fill="none" stroke="#2E7BD6" stroke-width="2"/>
  ${pts.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="4" fill="#2E7BD6"/>`).join("")}</svg>`;
}

/* the means column: one input per row; round 3 allows one check */
function MeansTask(I, done, round) {
  const ins = I.xs.map(() => h("input", { type: "text", inputmode: "numeric", "aria-label": "Mean", style: "width:4.5em" }));
  let tries = 0; const fb = h("div");
  const end = r => { btn.disabled = true; ins.forEach(i => i.disabled = true); done(r); };
  const btn = h("button", { class: "btn primary", type: "button", onclick: () => {
    let all = true; ins.forEach((inp, r) => { const ok = numVal(inp.value) === I.means[r]; inp.classList.toggle("ok", ok); inp.classList.toggle("no", !ok); if (!ok) all = false; });
    if (all) { fb.className = "verdict good"; fb.textContent = "All the means are right."; return end(tries ? "help" : "own"); }
    tries++;
    const wrongAnom = numVal(ins[I.anom.r].value) === I.withAnom;
    if (tries >= (round === 3 ? 1 : 2)) { ins.forEach((inp, r) => { inp.value = I.means[r]; inp.classList.remove("no"); inp.classList.add("ok"); }); fb.className = "verdict mid";
      fb.textContent = `Here are the means. For ${I.amt(I.xs[I.anom.r])}, leave out the anomaly (${I.anom.v}) and find the mean of the other two.`; return end("help"); }
    fb.className = "verdict bad"; fb.textContent = wrongAnom ? "Nearly! One mean still has the anomaly in it. Leave the odd result out and use the other two." : round === 1 ? "The red boxes aren't right yet. Add the three tries, then divide by 3. Leave out the anomaly." : "Not quite. Check the red ones again.";
  } }, "Check the means");
  return h("div", { class: "stack" }, h("p", {}, "Work out the mean pulse rate for each row. Leave out the anomaly."), table(I, { means: true, inputs: ins, mark: round < 3 }), btn, fb);
}

/* pick the graph that is drawn correctly (three drawn graphs); round 3 allows one try */
function GraphTask(I, done, round) {
  const opts = shuffle([{ ok: true, svg: graphSVG(I) }, { why: "The axes are the wrong way round. What you change goes along the bottom.", svg: graphSVG(I, { swap: true }) },
    { why: `One point is wrong: it uses the mean with the anomaly left in (${I.withAnom}).`, svg: graphSVG(I, { wrong: { r: I.anom.r, v: I.withAnom } }) }]);
  let tries = 0; const fb = h("div"); const btns = [];
  const box = h("div", { class: "xgraphs" }, ...opts.map((o, k) => { const b = h("button", { class: "xgraph", type: "button", "aria-label": "Graph " + "ABC"[k], "data-right": o.ok ? "1" : null, onclick: () => {
    if (o.ok) { b.classList.add("ok"); btns.forEach(x => x.disabled = true); fb.className = "verdict good"; fb.textContent = "Yes: a line graph, what you change along the bottom, and the right means."; done(tries ? "help" : "own"); return; }
    b.classList.add("no"); b.disabled = true; tries++; fb.className = "verdict bad"; fb.textContent = o.why;
    if (tries >= (round === 3 ? 1 : 2)) { btns.forEach((x, j) => { x.disabled = true; if (opts[j].ok) x.classList.add("ok"); }); fb.className = "verdict mid"; fb.textContent = o.why + " The green one is right."; done("help"); }
  } }, h("b", {}, "Graph " + "ABC"[k]), h("div", { html: o.svg })); btns.push(b); return b; }));
  return h("div", { class: "stack" }, h("p", {}, "Which graph shows the means correctly? Tap it."), box, fb);
}

/* round 3: he types an improvement himself, checked for a real one (no AI) */
function ImproveTask(I, done) {
  const inp = h("textarea", { class: "wbox", rows: 2, "aria-label": "Your improvement" });
  const fb = h("div");
  const btn = h("button", { class: "btn primary", type: "button", onclick: () => {
    const v = inp.value.toLowerCase(); if (v.trim().split(/\s+/).length < 4) { fb.className = "verdict mid"; fb.textContent = "Write a whole sentence first."; return; }
    const what = /sensor|monitor|watch|machine|60 sec|30 sec|minute|longer|more (people|students|tries|repeats|times)|more than one person|other people|repeat|same time|rest (for )?longer|someone else count/.test(v);
    const why = /because|so |so that|to make|which|more (accurate|reliable)|mistake|error|fair/.test(v);
    btn.disabled = true; inp.disabled = true;
    if (what && why) { fb.className = "verdict good"; fb.textContent = "Yes! A real improvement, and you said why it helps."; done("own"); }
    else { fb.className = "verdict mid"; fb.innerHTML = what ? "Good idea. Next time say <b>why</b> it helps, with \"because\" or \"so that\"." : "A strong improvement changes the method and says why: <i>Count the pulse for 60 seconds instead of 15, because a counting mistake is then not multiplied by 4.</i>"; done("help"); }
  } }, "Check");
  return h("div", { class: "stack" }, h("p", {}, "How could the method be improved? Say what to change and why it helps."), inp, btn, fb);
}

const choices = (right, wrong) => { const all = shuffle([right, ...wrong]); return { choice: all, ans: all.indexOf(right) }; };
function items(I, round) {
  const n = I.xs.length, L = [], lo = I.amt(I.xs[0]), hi = I.amt(I.xs[n - 1]);
  // the two other tries in its row, and one more result that is not close to the anomaly
  const rowMates = I.rows[I.anom.r].filter((v, c) => c !== I.anom.c), far = shuffle(I.rows.flat().filter(v => Math.abs(v - I.anom.v) > 8 && !rowMates.includes(v)));
  const others = [...new Set([...rowMates, ...far.slice(0, 1)])].map(String);
  L.push({ key: "anomaly", strand: "present", h: "Spot the anomaly", body: () => [table(I)], a: choices(String(I.anom.v), others), p: "Which result doesn't fit the pattern?",
    hint: "Look along each row. The tries for one amount should be close together." });
  L.push({ key: "means", strand: "present", h: "Work out the means", custom: (done, r) => MeansTask(I, done, r) });
  if (round === 1) L.push({ key: "gtype", strand: "present", h: "Which kind of graph?", a: choices("A line graph, because the amounts are numbers on a scale", ["A pie chart, because there are four rows", "A bar chart, because pulse rate is a word"]),
    p: `You change the ${I.iv}. Which graph fits?`, hint: "When what you change is a number on a scale, join the points with a line." });
  L.push({ key: "graph", strand: "present", h: "Draw it right", custom: (done, r) => GraphTask(I, done, r) });
  L.push(round === 3
    ? { key: "trend", strand: "interpret", h: "Describe the trend", a: { gap: { text: `As the ${I.iv} increases, the pulse rate ___.`, ans: ["increases"], bank: shuffle(["increases", "decreases", "stays the same"]) } }, p: "" }
    : { key: "trend", strand: "interpret", h: "Describe the trend", a: choices(`As the ${I.iv} increases, the pulse rate increases.`, [`As the ${I.iv} increases, the pulse rate decreases.`, "The pulse rate is about the same each time."]), p: "Which sentence describes the graph?", hint: "Follow the line from left to right. Does it go up or down?" });
  L.push({ key: "numbers", strand: "interpret", h: "Use the numbers", a: { num: I.rise }, p: `By how many beats per minute did the mean go up, from ${lo} to ${hi}?`, hint: `Take the first mean away from the last: ${I.means[n - 1]} − ${I.means[0]}.` });
  L.push({ key: "science", strand: "interpret", h: "Explain it with science", a: choices(`Because ${BECAUSE}.`, ["Because the heart gets tired and slows down.", "Because exercise makes your blood thicker."]), p: "Why does the pulse rate go up?", hint: "What do working muscles need more of?" });
  L.push({ key: "hyp", strand: "hyp", h: "Was the hypothesis right?", body: () => [h("p", {}, h("i", {}, `Hypothesis: if the person ${I.more}, then their pulse rate will increase.`))],
    a: choices(`Supported: the mean pulse rate rose from ${I.means[0]} to ${I.means[n - 1]} bpm, as predicted.`, ["Not supported: one result was lower.", "Supported, because exercise is good for you."]), p: "Was the hypothesis supported? Pick the answer with evidence.", hint: "Use numbers from the results to say yes or no." });
  L.push({ key: "valid", strand: "evaluate", h: "How good was the method?", a: choices("Counting for only 15 seconds and multiplying by 4 makes any counting mistake 4 times bigger.", ["The method was perfect because it had a table.", "Using a stopwatch made the results wrong."]),
    p: "Which is a real weakness of the method?", hint: "Think about how the pulse was counted." });
  L.push(round === 3 ? { key: "improve", strand: "evaluate", h: "Improve it", custom: done => ImproveTask(I, done) }
    : { key: "improve", strand: "evaluate", h: "Improve it", a: choices("Use a heart-rate monitor, or count for 60 seconds, so counting mistakes are smaller.", ["Do the test only once, to save time.", "Change two things at once, to see more."]),
      p: "Which improvement would make the results more reliable?", hint: "A good improvement makes counting mistakes smaller or adds more repeats." });
  return L;
}

function lines(I) {
  const n = I.xs.length;
  return [["present", `Means: ${I.xs.map((x, r) => `${I.amt(x)} ${I.means[r]} bpm`).join(", ")}. I left out the anomaly (${I.anom.v}) and drew a line graph with the ${I.iv} along the bottom.`],
    ["interpret", `As the ${I.iv} increases, the pulse rate increases: it rose by ${I.rise} bpm, from ${I.means[0]} to ${I.means[n - 1]}. This is because ${BECAUSE}.`],
    ["hyp", `My hypothesis was supported, because the pulse rate went up as predicted.`],
    ["evaluate", "Weakness: counting for 15 seconds and multiplying by 4 makes counting mistakes 4 times bigger. Improvement: use a heart-rate monitor or count for 60 seconds."]];
}
const text = I => lines(I).map(x => x[1]).join("\n");
function watch(I) {
  return h("div", { class: "stack" }, table(I, { means: true, mark: true }), h("div", { html: graphSVG(I) }),
    ...lines(I).map(([k, t]) => h("div", { class: "xline" }, h("b", { class: "xtag", style: `background:${STRANDS[k].col}` }, STRANDS[k].n), h("span", {}, t))));
}

export const RESULTS_ROOM = {
  crit: "C", critName: "Processing and evaluating", name: "The Results Room",
  kid: "Make sense of the results",
  blurb: "Your teacher marks this for Criterion C. Each round has new results from a pulse investigation.",
  strands: STRANDS,
  partNames: { anomaly: "spot the anomaly", means: "means", gtype: "kind of graph", graph: "correct graph", trend: "describe the trend", numbers: "use the numbers", science: "explain with science", hyp: "hypothesis supported?", valid: "weakness of the method", improve: "improvement" },
  rungs: [
    { need: [], text: "I presented some results with help", tip: "Work out the means, then pick the graph that shows them correctly." },
    { need: ["means", "graph"], text: "I worked out the means and presented them on the right graph", tip: "Spot the anomaly, describe the trend and say if the hypothesis was supported." },
    { need: ["means", "graph", "anomaly", "trend", "hyp"], text: "I left out the anomaly, described the trend and said whether the hypothesis was supported", tip: "Use numbers from the results, explain with science, and judge the method with an improvement." },
    { need: ["means", "graph", "anomaly", "trend", "hyp", "numbers", "science", "valid", "improve"], text: "I processed the data correctly, explained the trend with numbers and science, discussed the hypothesis and the method, and suggested an improvement", tip: "You're at the top. Try new results to keep it sharp." },
  ],
  make, items, text, watch,
  sheet: I => [h("p", {}, `A student investigated how the ${I.iv} affects pulse rate. Here are the results.`), table(I)],
};

const ck = (q, right, wrong, why) => { const c = shuffle([right, ...wrong]); return { q, c, a: c.indexOf(right), why }; };
export const RESULTS_CHECKS = [
  ck("What is an anomaly?", "A result that doesn't fit the pattern", ["The biggest result", "The mean of the results"], "An anomaly is a result that doesn't fit. Leave it out when you work out the mean."),
  ck("Why do scientists repeat a test and find the mean?", "To make the results more reliable", ["To make the table longer", "To get a bigger number"], "One try can have a mistake. The mean of several tries is more reliable."),
  ck("When what you change is a number on a scale, which graph do you draw?", "A line graph", ["A pie chart", "A bar chart"], "Use a line graph, with what you change along the bottom (x-axis) and what you measure up the side (y-axis)."),
];
