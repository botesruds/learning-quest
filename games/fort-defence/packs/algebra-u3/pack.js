/* Content pack: MYP Year 2 (Grade 7) maths, Unit 3 "y not x?" (algebra).
   Everything the engine needs to know about this unit is listed here. See packs/README.md for the format. */
import { STEPS, PREVIEWS, EXAM_STEPS, BADGES, Investigation } from "./topics.js";
import { UNDERSTANDING } from "./understanding.js";
import { PATTERN_EXPEDITION, PATTERN_CHECKS } from "./expedition.js";

/* day 21 is now the Pattern Expedition (js/expedition.js): three rounds, a rung ladder, and review cards */
const T21 = STEPS.find(t => t.id === 21);
T21.exp = PATTERN_EXPEDITION; T21.checks = PATTERN_CHECKS;
T21.learn[1] = { t: "show", h: "How the Expedition works", b: `<p>Three rounds, each with a new pattern. <b>Guided</b> shows you a finished example first and goes one small step at a time. <b>Hints</b> gives bigger steps, with a hint only if you ask. <b>On your own</b> is like the real task, and you build the write-up yourself.</p><p>After each round you'll see a ladder from 1 to 2 up to 7 to 8, so you know what your teacher is looking for.</p>`, rule: "Rung 5 to 6 on your own wins 3 stars." };

export default {
  id: "algebra-u3",
  title: "Algebra Quest",
  subject: "Maths",
  unit: "Unit 3: y not x?",
  keyPrefix: "",                 // save keys: "" keeps Algebra Quest's topic numbers, so Oliver's stars carry over
  seedFrom: "algebra-quest",     // read stars once from this older game's save, if there is one
  topics: STEPS,                 // { id, title, short, big?, kind?, learn:[cards], gen:[generators], checks:[why-questions] }
  previews: PREVIEWS,            // scout reports (treasure chests), keyed by region number
  understanding: UNDERSTANDING,  // new understanding questions, keyed by topic id
  badges: BADGES,                // { k, e, n, d }: "l7" = master topic 7, "w1" = beat region 1's demon lord, "final" = beat the final boss
  special: { invest: Investigation },   // the old walk-through, kept for reference; day 21 now plays its Expedition
  // the four MYP criteria in Oliver's words (My Quest Report)
  criteria: { A: "Know it and use it", B: "Find, describe, test, explain", C: "Show it so anyone can follow", D: "Use maths for real" },   // topics with kind:"invest" are played by this function
  // "I can" statements for the report card (drafted 22 Nov 2026 for Rudi to check; there is no official list)
  can: {
    1: "I can explain that a letter stands for a number we don't know yet",
    2: "I can explain what 3n means, and how it is different from n + 3",
    3: "I can add and subtract negative numbers using a number line",
    4: "I can write an expression from words, like \"5 less than n\"",
    5: "I can collect like terms to make an expression simpler",
    6: "I can multiply and divide terms, like 3a × 2a",
    7: "I can expand a bracket, like 3(x + 4)",
    8: "I can substitute numbers, including negatives, into an expression or formula",
    9: "I can use the inverse operation to undo a step",
    10: "I can explain what the equals sign means, using a balance",
    11: "I can find the rule of a function machine from its inputs and outputs",
    12: "I can solve one-step equations",
    13: "I can solve two-step equations",
    14: "I can solve equations with brackets or letters on both sides",
    15: "I can write and solve an equation from a word problem",
    16: "I can rearrange a formula to make a different letter the subject",
    17: "I can explain why a pattern's rule works for every position",
    18: "I can continue a sequence and predict later terms",
    19: "I can find and use the nth term of a linear sequence",
    20: "I can recognise simple quadratic sequences, like n² + 3",
    21: "I can investigate a pattern: find it, describe it, test it and explain it (Criterion B)",
    22: "I can follow and write simple flowcharts and algorithms",
  },
  regions: [
    { n: 1, name: "Letter Land", emoji: "🏝️", look: 1, blurb: "Letters are just numbers in disguise.", topics: [1, 2, 3, 4, 5, 6, 7, 8],
      lord: { name: "the Letter Guardian", badge: "w1", questions: 8, checks: 2, need: 8 } },
    { n: 2, name: "Balance Bridge", emoji: "🌉", look: 2, blurb: "Keep both sides level and find the mystery number.", topics: [9, 10, 11, 12, 13, 14, 15, 16],
      lord: { name: "the Bridge Troll", badge: "w2", questions: 8, checks: 2, need: 8 } },
    { n: 3, name: "Pattern Peaks", emoji: "🏔️", look: 3, blurb: "Find the rule that works for every step.", topics: [17, 18, 19, 20, 21],
      lord: { name: "the Pattern Yeti", badge: "w3", questions: 8, checks: 2, need: 8 } },
    { n: 4, name: "Robot Factory", emoji: "🏭", look: 4, blurb: "Give robots exact instructions.", topics: [22], lord: null },
    { n: 5, name: "Final Castle", emoji: "🏰", look: 5, blurb: "Beat the Algebra Dragon to become Algebra Champion.", topics: [],
      final: { name: "the Algebra Dragon", badge: "final", topics: EXAM_STEPS, need: 13 } },
  ],
};
