/* Content pack: MYP Grade 7 Sciences, Unit 2 "How are we organised?" (cells, organisation, skeleton and muscles, Criterion B pulse investigation).
   Content checked by Rudi on 22 Nov 2026 (content document "Science Unit 2 content"). See packs/README.md for the format. */
import { STEPS, PREVIEWS, FINAL_TOPICS, BADGES } from "./topics.js";
import { UNDERSTANDING } from "./understanding.js";
import { DISPATCHES } from "./reading.js";
import { REPORTS } from "./writing.js";
import { GAPS, SPW, EXPLAIN, MAPS } from "./think.js";
import { shuffle } from "../../js/qcore.js";
import { LAB_PLAN, LAB_CHECKS } from "./expedition.js";
import { RESULTS_ROOM, RESULTS_CHECKS } from "./results.js";
import { HEALERS_CASE, HEALER_CHECKS } from "./healer.js";

/* thinking tasks (js/think.js): each day gets a fill-the-gap card at the end of its lesson and a fill-the-gap
   question maker in Train, Challenge and night runes (typed once the day has 3 stars) */
STEPS.forEach(t => {
  const g = GAPS[t.id]; if (!g) return;
  const full = x => x.ans.reduce((s, a) => s.replace("___", a), x.text);
  t.learn.push({ t: "try", h: "Your turn: fill the gaps", q: { ask: "Tap the words to fill the gaps.", gap: g[0], why: full(g[0]) } });
  t.gen.push(() => { const x = g[Math.floor(Math.random() * g.length)]; return { q: "Fill the gap.", steps: [], final: { p: "", a: { gap: { ...x, bank: shuffle(x.bank), key: "sci2:" + t.id } }, hint: "Read the whole sentence first, then pick the words that fit." }, why: full(x) }; });
});
/* day 13's Brain check is now the Lab Plan Expedition (js/expedition.js); its review cards join the why-questions */
{ const T13 = STEPS.find(t => t.id === 13); T13.exp = LAB_PLAN; T13.checks.push(...LAB_CHECKS); }
/* Expedition days of their own (kind "exp", no day number): the Results Room (Criterion C) after the Lab Plan, and the
   Healer's Case (Criterion D) at the end of Muscle Mountain, before the Cramp Colossus */
STEPS.push({ id: 14, kind: "exp", title: "The Results Room: make sense of the results", short: "Results Room", exp: RESULTS_ROOM, checks: RESULTS_CHECKS, gen: [], learn: [
  { t: "show", h: "What your teacher looks for", b: `<p>Criterion C is <b>Processing and evaluating</b>. After an investigation your teacher looks for four things:</p><ol><li><b>Present</b> the results: means, and the right graph.</li><li><b>Interpret</b> them: describe the trend with numbers, and explain it with science.</li><li>Say whether your <b>hypothesis</b> was supported.</li><li><b>Evaluate</b> the method: a weakness and an improvement.</li></ol>`, rule: "Present, interpret, hypothesis, evaluate." },
  { t: "show", h: "The mean and the anomaly", b: `<p>The <b>mean</b>: add the tries and divide by how many there are. 70, 74 and 72 make 216, and 216 ÷ 3 = 72.</p><p>An <b>anomaly</b> is a result that doesn't fit, like 48 when the others are 90 and 94. Leave it out: (90 + 94) ÷ 2 = 92.</p>`, rule: "Leave the anomaly out of the mean." },
  { t: "show", h: "How the Expedition works", b: `<p>Three rounds, each with new results. <b>Guided</b> shows a finished example first. <b>Hints</b> gives a hint only if you ask. <b>On your own</b> is like the real task.</p><p>After each round, a ladder from 1 to 2 up to 7 to 8 shows what your teacher looks for.</p>`, rule: "Rung 5 to 6 on your own wins 3 stars." },
] });
STEPS.push({ id: 15, kind: "exp", title: "The Healer's Case: science in the real world", short: "Healer's Case", exp: HEALERS_CASE, checks: HEALER_CHECKS, gen: [], learn: [
  { t: "show", h: "What your teacher looks for", b: `<p>Criterion D is <b>Reflecting on the impacts of science</b>. Your teacher looks for four things:</p><ol><li><b>The science</b>: how science is used to solve a problem.</li><li><b>Impacts</b>: benefits and drawbacks for health, money and everyday life, and a judgement.</li><li><b>Communicate</b> clearly, for example in a PEEL paragraph.</li><li><b>Sources</b>: where your facts came from.</li></ol>`, rule: "Science, impacts, communicate, sources." },
  { t: "show", h: "Weigh both sides", b: `<p>A treatment has <b>benefits</b> (good results) and <b>drawbacks</b> (costs, risks or problems). A strong answer gives both, then makes a <b>judgement</b>: which side is bigger, and why?</p>`, rule: "Benefit, drawback, then judge." },
  { t: "show", h: "How the Expedition works", b: `<p>Three rounds, each a new patient. In rounds 1 and 2 you put a PEEL paragraph in order. In round 3 you write it yourself, and the writing coach marks it.</p>`, rule: "Rung 5 to 6 on your own wins 3 stars." },
] });
BADGES.push({ k: "sci2:map1", e: "🗺️", n: "Cell City Mapmaker", d: "Build the Cell City mind-map" });

export default {
  id: "science-u2",
  title: "Science Quest",
  subject: "Science",
  unit: "How are we organised?",
  keyPrefix: "sci2:",            // save keys "sci2:1", "sci2:2"… so they never mix with the maths days
  champion: "You are a Body Champion!",
  criteria: { A: "Know it and use it", B: "Plan a fair test", C: "Make sense of the results", D: "Science in the real world" },
  topics: STEPS,
  previews: PREVIEWS,
  understanding: UNDERSTANDING,
  badges: BADGES,
  // pairs of days that are easy to mix up: a patrol rune on the first day prefers one of these (interleaving)
  confusable: { 3: [2], 5: [2], 6: [2], 8: [7], 9: [7], 10: [7], 11: [10], 12: [10, 7] },
  reading: { dispatches: DISPATCHES },   // the Library tower's readings, one per day (js/library.js)
  think: { gaps: GAPS, spw: SPW, explain: EXPLAIN, maps: MAPS },   // thinking tasks (js/think.js)
  // "I can" statements for the report card (drafted 22 Nov 2026 for Rudi to check; there is no official list)
  can: {
    1: "I can explain how a cell's shape fits its job",
    2: "I can name the parts of a cell and say what each one does",
    3: "I can compare plant and animal cells",
    4: "I can prepare a slide, use a microscope safely and make a scientific drawing",
    5: "I can explain how substances move in and out of cells by diffusion",
    6: "I can put the levels of organisation in order, from cell to organism",
    7: "I can describe the four jobs of the skeleton",
    8: "I can explain how the skeleton protects important organs",
    9: "I can explain how bone marrow makes blood cells",
    10: "I can explain how muscles, tendons and bones work together to move the body",
    11: "I can explain how antagonistic muscle pairs move a joint",
    12: "I can describe how lifestyle and injury affect bones and muscles",
    13: "I can plan a fair pulse-rate investigation: hypothesis, variables, repeats and a mean (Criterion B)",
    14: "I can process results: means, an anomaly, the right graph, the trend, the hypothesis and an improvement (Criterion C)",
    15: "I can explain how science solves a real problem and weigh its benefits and drawbacks (Criterion D)",
  },
  writing: { reports: REPORTS },         // the Scribe's Tower royal reports, one per day (js/scribe.js)
  regions: [
    { n: 1, name: "Cell City", emoji: "🦠", look: 6, blurb: "Every living thing is built from cells, and every part has a job.", topics: [1, 2, 3, 4, 5],
      lord: { name: "the Blob King", badge: "sci2:w1", questions: 8, checks: 2, need: 8 } },
    { n: 2, name: "Body Builders", emoji: "🦴", look: 7, blurb: "Cells build tissues, organs and systems. Bones hold it all up.", topics: [6, 7, 8, 9],
      lord: { name: "the Bone Breaker", badge: "sci2:w2", questions: 8, checks: 2, need: 8 } },
    { n: 3, name: "Muscle Mountain", emoji: "💪", look: 8, blurb: "Muscles pull, tendons pass it on, joints let it happen.", topics: [10, 11, 12, 15],
      lord: { name: "the Cramp Colossus", badge: "sci2:w3", questions: 8, checks: 2, need: 8 } },
    { n: 4, name: "Investigation Lab", emoji: "🧪", look: 9, blurb: "Plan a real investigation into your pulse rate, then make sense of the results.", topics: [13, 14], lord: null },
    { n: 5, name: "Brain Citadel", emoji: "🧠", look: 10, blurb: "Beat the Great Germ to become Body Champion. This is your practice test.", topics: [],
      final: { name: "the Great Germ", badge: "sci2:final", topics: FINAL_TOPICS, need: 13 } },
  ],
};
