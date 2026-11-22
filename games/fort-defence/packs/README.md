# Content packs: adding a subject to Fort Defence

Fort Defence keeps the **game** (the fort, building, demons, mastery rules, saving) apart from the **learning content**.
Each unit or subject is a *content pack*: one folder in `packs/` that the engine reads. Every pack feeds the same fort:
materials, gold, plans and land earned in any subject build the one castle.

## What a pack is

```
packs/
  index.js              the list of packs the game plays
  algebra-u3/
    pack.js             the manifest: regions, topics, previews, badges (start here)
    topics.js           lesson cards, question makers and why-questions for each topic
    understanding.js    understanding questions (explain why, spot the mistake, choose the method, build the equation)
    kit.js              pictures and tools this subject needs (bags and marbles, balance, number line…)
```

### The manifest (`pack.js`)

```js
export default {
  id: "science-u2",              // unique, lowercase
  title: "Science Quest",
  subject: "Science",
  unit: "Unit 2: Cells",
  keyPrefix: "sci2:",            // makes this pack's save keys unique ("sci2:1", "sci2:2"…). Only the first pack uses "".
  topics: [...],                 // see below
  previews: { 1: { title, cards } },     // optional scout reports (sneak peeks), by region number
  understanding: { 1: [...], 2: [...] }, // optional understanding questions, by topic id
  badges: [{ k: "l3", e: "🔬", n: "Microscope Master", d: "Master day 3" }],  // "l<id>" badges are awarded automatically
  regions: [
    { n: 1, name: "Cell City", emoji: "🧫", look: 1, blurb: "Everything alive is made of cells.", topics: [1, 2, 3, 4],
      lord: { name: "the Membrane Monster", badge: "w1", questions: 8, checks: 2, need: 8 } },
  ],
};
```

### A topic (one day in the game)

```js
{
  id: 1, title: "What is a cell?", short: "Cells",       // short appears on buttons and the quest map
  big: true,                                              // optional: a "big idea" day
  learn: [                                                // the scout's briefing: small cards, one idea each
    { t: "show", h: "Heading", b: "<p>Text (HTML)</p>", v: () => picture(), rule: "The one thing to remember." },
    { t: "try",  h: "Have a go", b: "<p>…</p>", q: { ask: "Question?", a: { num: 10 }, why: "One or two sentences." } },
    { t: "try",  h: "Pick one", q: { choices: ["A", "B", "C"], ans: 1, why: "…" } },
  ],
  gen: [ () => ({                                         // question makers: each call returns a fresh question
    q: "Question text", v: () => picture(),
    steps: [ { p: "First small step", a: { num: 5 }, hint: "…" } ],   // used in Train (with steps)
    final: { p: "Answer:", a: { num: 12 } },                         // used in Challenge (on his own)
    why: "Why the answer is right, in a sentence.",
  }) ],
  checks: [ { q: "A why-question", c: ["A", "B", "C"], a: 0, why: "…" } ],   // Brain check: 4 are asked, 3 needed
}
```

Answers can be `{ num: 7 }`, `{ expr: "2n+3", simp: true }`, `{ choice: [...], ans: 0 }` or `{ words: ["cell wall"] }`
(key words forgive a small spelling slip and then show the right spelling). For pictures and cards there are also:

- `{ tap: { pic: () => svg, ans: "nucleus", name: "nucleus" } }`: tap the right part of a picture. The svg marks each part with `data-part="..."`.
- `{ sort: { bins: ["Plant only", "Both"], items: [["Nucleus", 1], ["Cell wall", 0]] } }`: put each card in its group, then Check.
- `{ order: ["first", "second", "third"] }`: tap the cards in the right order, then Check (they are shown shuffled).

A question with no `steps` still gets a 💡 hint in Train if its `final` has a `hint`.
The parser accepts numbers, letters, + − × ÷, brackets and ², so `2(n + 3)` and `2n + 6` both match `{ expr: "2n+6" }`.

### Understanding questions

```js
{ k: "why",     q, c: [choices], a: 0, why }
{ k: "method",  q, c: [choices], a: 0, why }
{ k: "mistake", q, lines: ["worked line 1", "line 2", …], bad: 1, fixes: ["what line 2 should say", …], fix: 0, why }
{ k: "build",   q, tiles: ["2", "n", "+", "7"], ans: "2n+7", why }
```

Choices are shuffled when shown, so put the right one first if you like. Wrong answers always show `why`.

## What the engine gives every pack for free

- The day: lesson cards, Train (3 stepped questions, star 1), Challenge (3 right on your own before 3 misses, star 2),
  Brain check (3 of 4 why-questions, star 3). The next day opens only at 3 stars.
- Loot for answers (wood, stone, iron, crystal for understanding, a tower plan for 3 in a row), land that grows with mastery,
  scout reports, the quest map, badges, saving to the family cloud, and (from Stage 4/5) the night battle, weak spots,
  demon lords and repairs.

## Subjects

Each pack is its own subject track with its own quest map, lands, forts, demon lords and final boss. Materials, gold, tower plans,
the hero and badges are shared. The home page opens a pack with `?subject=<subject or pack id>`, for example
`games/fort-defence/?subject=science`; with no subject the first pack (maths) plays. Give each region its own `look` number
(maths uses 1 to 5, science 6 to 10) so each land gets its own fort; add the look's colours in `js/models.js` (REGION_LOOK, REGION_DEMON,
LORDS, makeKeep) and `js/pieces.js` (STYLES). Prefix a pack's badge keys with its keyPrefix (`"sci2:l4"`, `"sci2:w1"`) so they never
clash with another pack's. The final boss is saved under the keyPrefix + `"final"`.

## Adding a pack

1. Copy `algebra-u3/` to a new folder and replace the content (or ask Claude to draft it from the unit overview).
2. Give it a unique `id` and `keyPrefix`.
3. Add it to `packs/index.js`.
4. Run the content check, `node games/fort-defence/tests/content-check.js`: it renders every card and runs every question maker 40 times,
   checking that each question accepts its own answer.
