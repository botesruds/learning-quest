/* Content pack: MYP Grade 7 Sciences, Unit 2 "How are we organised?" (cells, organisation, skeleton and muscles, Criterion B pulse investigation).
   Content checked by Rudi on 22 Nov 2026 (content document "Science Unit 2 content"). See packs/README.md for the format. */
import { STEPS, PREVIEWS, FINAL_TOPICS, BADGES } from "./topics.js";
import { UNDERSTANDING } from "./understanding.js";
import { DISPATCHES } from "./reading.js";
import { REPORTS } from "./writing.js";
import { GAPS, SPW, EXPLAIN, MAPS } from "./think.js";
import { shuffle } from "../../js/qcore.js";

/* thinking tasks (js/think.js): each day gets a fill-the-gap card at the end of its lesson and a fill-the-gap
   question maker in Train, Challenge and night runes (typed once the day has 3 stars) */
STEPS.forEach(t => {
  const g = GAPS[t.id]; if (!g) return;
  const full = x => x.ans.reduce((s, a) => s.replace("___", a), x.text);
  t.learn.push({ t: "try", h: "Your turn: fill the gaps", q: { ask: "Tap the words to fill the gaps.", gap: g[0], why: full(g[0]) } });
  t.gen.push(() => { const x = g[Math.floor(Math.random() * g.length)]; return { q: "Fill the gap.", steps: [], final: { p: "", a: { gap: { ...x, bank: shuffle(x.bank), key: "sci2:" + t.id } }, hint: "Read the whole sentence first, then pick the words that fit." }, why: full(x) }; });
});
BADGES.push({ k: "sci2:map1", e: "🗺️", n: "Cell City Mapmaker", d: "Build the Cell City mind-map" });

export default {
  id: "science-u2",
  title: "Science Quest",
  subject: "Science",
  unit: "How are we organised?",
  keyPrefix: "sci2:",            // save keys "sci2:1", "sci2:2"… so they never mix with the maths days
  champion: "You are a Body Champion!",
  topics: STEPS,
  previews: PREVIEWS,
  understanding: UNDERSTANDING,
  badges: BADGES,
  // pairs of days that are easy to mix up: a patrol rune on the first day prefers one of these (interleaving)
  confusable: { 3: [2], 5: [2], 6: [2], 8: [7], 9: [7], 10: [7], 11: [10], 12: [10, 7] },
  reading: { dispatches: DISPATCHES },   // the Library tower's readings, one per day (js/library.js)
  think: { gaps: GAPS, spw: SPW, explain: EXPLAIN, maps: MAPS },   // thinking tasks (js/think.js)
  writing: { reports: REPORTS },         // the Scribe's Tower royal reports, one per day (js/scribe.js)
  regions: [
    { n: 1, name: "Cell City", emoji: "🦠", look: 6, blurb: "Every living thing is built from cells, and every part has a job.", topics: [1, 2, 3, 4, 5],
      lord: { name: "the Blob King", badge: "sci2:w1", questions: 8, checks: 2, need: 8 } },
    { n: 2, name: "Body Builders", emoji: "🦴", look: 7, blurb: "Cells build tissues, organs and systems. Bones hold it all up.", topics: [6, 7, 8, 9],
      lord: { name: "the Bone Breaker", badge: "sci2:w2", questions: 8, checks: 2, need: 8 } },
    { n: 3, name: "Muscle Mountain", emoji: "💪", look: 8, blurb: "Muscles pull, tendons pass it on, joints let it happen.", topics: [10, 11, 12],
      lord: { name: "the Cramp Colossus", badge: "sci2:w3", questions: 8, checks: 2, need: 8 } },
    { n: 4, name: "Investigation Lab", emoji: "🧪", look: 9, blurb: "Plan a real investigation into your pulse rate.", topics: [13], lord: null },
    { n: 5, name: "Brain Citadel", emoji: "🧠", look: 10, blurb: "Beat the Great Germ to become Body Champion. This is your practice test.", topics: [],
      final: { name: "the Great Germ", badge: "sci2:final", topics: FINAL_TOPICS, need: 13 } },
  ],
};
