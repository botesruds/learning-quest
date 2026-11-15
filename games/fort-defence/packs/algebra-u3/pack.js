/* Content pack: MYP Year 2 (Grade 7) maths, Unit 3 "y not x?" (algebra).
   Everything the engine needs to know about this unit is listed here. See packs/README.md for the format. */
import { STEPS, PREVIEWS, EXAM_STEPS, BADGES, Investigation } from "./topics.js";
import { UNDERSTANDING } from "./understanding.js";

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
  special: { invest: Investigation },   // topics with kind:"invest" are played by this function
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
