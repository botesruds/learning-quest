/* Content pack: MYP Year 2 (Grade 7) maths, Unit 3 "y not x?" (algebra).
   Everything the engine needs to know about this unit is listed here. See packs/README.md for the format. */
import { STEPS, PREVIEWS, EXAM_STEPS, BADGES, Investigation } from "./topics.js";
import { UNDERSTANDING } from "./understanding.js";
import { PATTERN_EXPEDITION, PATTERN_CHECKS } from "./expedition.js";
import { SCRIBES_SLATE, SLATE_CHECKS, MARKET_DAY, MARKET_CHECKS } from "./slate.js";

/* day 21 is now the Pattern Expedition (js/expedition.js): three rounds, a rung ladder, and review cards */
const T21 = STEPS.find(t => t.id === 21);
T21.exp = PATTERN_EXPEDITION; T21.checks = PATTERN_CHECKS;
T21.learn[1] = { t: "show", h: "How the Expedition works", b: `<p>Three rounds, each with a new pattern. <b>Guided</b> shows you a finished example first and goes one small step at a time. <b>Hints</b> gives bigger steps, with a hint only if you ask. <b>On your own</b> is like the real task, and you build the write-up yourself.</p><p>After each round you'll see a ladder from 1 to 2 up to 7 to 8, so you know what your teacher is looking for.</p>`, rule: "Rung 5 to 6 on your own wins 3 stars." };

/* Expedition days of their own (kind "exp", no day number): the Scribe's Slate (Criterion C) at the end of Balance Bridge,
   and Market Day (Criterion D) in the Final Castle, before the Algebra Dragon */
const howItWorks = what => ({ t: "show", h: "How the Expedition works", b: `<p>Three rounds, each with ${what}. <b>Guided</b> shows a finished example first. <b>Hints</b> gives a hint only if you ask. <b>On your own</b> is like the real task.</p><p>After each round, a ladder from 1 to 2 up to 7 to 8 shows what your teacher looks for.</p>`, rule: "Rung 5 to 6 on your own wins 3 stars." });
STEPS.push({ id: 24, stage: 2, kind: "exp", title: "The Scribe's Slate: show your working", short: "Scribe's Slate", exp: SCRIBES_SLATE, checks: SLATE_CHECKS, gen: [], learn: [
  { t: "show", h: "What your teacher looks for", b: `<p>Criterion C is <b>Communicating</b>: could someone else follow your maths? Your teacher looks for:</p><ol><li>The right <b>maths language</b>: say what the letter means, use = correctly, and give units.</li><li>A good way to <b>represent</b> it, like an equation.</li><li>Clear <b>reasoning</b>: every step shown, and a check.</li><li>A tidy <b>order</b>: one step per line.</li></ol>`, rule: "Letter, equation, one step per line, check, sentence." },
  { t: "show", h: "Using = properly", b: `<p>An = sign says both sides are worth the same. So <b>3d + 5 = 26 − 5 = 21</b> is wrong: 26 − 5 isn't equal to 3d + 5.</p><p>Start a new line for each step instead:</p><p><b>3d + 5 = 26</b><br><b>3d = 21</b><br><b>d = 7</b></p>`, rule: "One step per line. Only write = between equal things." },
  howItWorks("a new word problem"),
] });
STEPS.push({ id: 25, stage: 5, kind: "exp", title: "Market Day: maths in real life", short: "Market Day", exp: MARKET_DAY, checks: MARKET_CHECKS, gen: [], learn: [
  { t: "show", h: "What your teacher looks for", b: `<p>Criterion D is <b>Applying mathematics in real-life contexts</b>. Your teacher looks for:</p><ol><li><b>Identify</b> the facts that matter.</li><li>Choose a <b>strategy</b>: a model like an equation.</li><li><b>Solve</b> it correctly.</li><li>Justify how <b>accurate</b> the answer is, and whether it <b>makes sense</b> in real life.</li></ol>`, rule: "Identify, model, solve, round, check it makes sense." },
  { t: "show", h: "Profit", b: `<p><b>Profit</b> is the money you earn, take away the money you spend.</p><p>Sell something for 5 AED that cost 2 AED to make: you keep 3 AED from each one. Then take away fees you pay once, like the stall fee.</p>`, rule: "Profit = (price − cost) × number sold − fees." },
  howItWorks("a new market stall"),
] });

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
    24: "I can show my working so anyone can follow it: the letter, the equation, one step per line, a check and a sentence (Criterion C)",
    25: "I can use maths to solve a real problem, round sensibly and check the answer makes sense (Criterion D)",
  },
  regions: [
    { n: 1, name: "Letter Land", emoji: "🏝️", look: 1, blurb: "Letters are just numbers in disguise.", topics: [1, 2, 3, 4, 5, 6, 7, 8],
      lord: { name: "the Letter Guardian", badge: "w1", questions: 8, checks: 2, need: 8 } },
    { n: 2, name: "Balance Bridge", emoji: "🌉", look: 2, blurb: "Keep both sides level and find the mystery number.", topics: [9, 10, 11, 12, 13, 14, 15, 16, 24],
      lord: { name: "the Bridge Troll", badge: "w2", questions: 8, checks: 2, need: 8 } },
    { n: 3, name: "Pattern Peaks", emoji: "🏔️", look: 3, blurb: "Find the rule that works for every step.", topics: [17, 18, 19, 20, 21],
      lord: { name: "the Pattern Yeti", badge: "w3", questions: 8, checks: 2, need: 8 } },
    { n: 4, name: "Robot Factory", emoji: "🏭", look: 4, blurb: "Give robots exact instructions.", topics: [22], lord: null },
    { n: 5, name: "Final Castle", emoji: "🏰", look: 5, blurb: "Run a market stall, then beat the Algebra Dragon to become Algebra Champion.", topics: [25],
      final: { name: "the Algebra Dragon", badge: "final", topics: EXAM_STEPS, need: 13 } },
  ],
};
