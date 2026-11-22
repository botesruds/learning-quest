# Fort Defence play-tests

Automated checks run with Playwright and a local web server. They use a practice save and a fake database,
so they never touch real progress. Screenshots are written to the folder you run them from.

| Test | What it checks |
| --- | --- |
| `node tests/content-check.js` | Every content pack: renders every lesson card, runs each question maker 40 times and checks each question accepts its own answer, checks every why-question and understanding question. Run this after adding or editing a pack. |
| `node tests/science-test.js` | The science track (`?subject=science`): a whole first day and its night, then every science day's questions in the real Challenge screen (tapping pictures, sorting cards, ordering cards, key words with a spelling slip, one wrong answer of each kind), the Blob King, the next land, the Great Germ (13 of 16), and a check that the maths track and its map are untouched. `SHOTS=sci- node tests/science-test.js` also saves screenshots; add `ipad` for iPad size. |
| `node tests/library-test.js` | The Library tower (science): the dawn button and its dot, floor 1's lesson, Challenge with a miss and its mixed check, dispatches (predict hides the text first, glossary words, a clarify miss lights the clue sentence, a tap-the-sentence miss names the key word, ordering), floor 2's mixed check with "Which strategy?", locks, and that reading never changes a science day's stars. Add `ipad` for iPad size; `SHOTS=dir/` saves screenshots. |
| `node tests/interleave-test.js` | Interleaving on the science track: 40 nights on Day 10 (2 patrol runes, never first or side by side, the confusable Day 7 always among them), 30 builds of the Muscle Mountain lord (never the same day twice in a row, 2 questions from Cell City, why-questions in varied places), then a real Day 10 night with a wrong and a right "Which idea is this?" pick and a missed patrol rune; the third star still comes from today's Brain checks. |
| `node tests/day-test.js` | Plays a whole day like a player: lesson, Train with a slip, riddles, Challenge with a miss, loot, building, the night waiting at dawn, quest map, scout report, reload. Also an iPad portrait check. |
| `node tests/night-test.js` | A whole night on a demo castle, laptop and iPad: demons, towers, 6 runes (one answered wrong to crack a wall), the third star from the Brain check, the morning report, fixing the crack, leaving a night, reload. Speeds the battle up 8× because software graphics are slow. |
| `node tests/siege-test.js` | Demon lords: loses to the Letter Guardian (repairs and cracks appear), does every repair, wins the rematch (badge, gold, Balance Bridge opens, the land changes), then beats the Algebra Dragon (13 of 16), reload. `node tests/siege-test.js ipad` runs it at iPad size. |
| `node tests/shop-test.js` | The hero shop on laptop and iPad: buying and choosing a commander and a pet, gold, badge banners on the keep, reload. |
| `node tests/region-forts-test.js` | One fort per region: beating a lord starts an empty fort in the next region, old forts stay as built and can be visited and built on from the quest map, each region's fort style, reload. |
| `node tests/seed-test.js` | A brand-new Fort Defence save copies Algebra Quest stars, lessons and coins (as gold) once, and never writes to the Algebra Quest save. |
| `node tests/parent-test.js` | The parent corner on laptop and iPad: the grown-up sum, stars, recent answers, repairs and demon lords, "open this land now", "open every day" (two taps), back to the title or dawn, reload. |
| `node tests/builder-test.js` | The fort builder with mouse and touch: drag, paint, upgrade, move, pick up, refund, decorations, land limits, camera, reload. |

In a container without a GPU, Chromium needs `--use-angle=swiftshader` (already set in the tests).

The site-wide device pairing test lives at `tests/pairing-test.js` in the repo root (two devices, old bookmarks, removing a device, all against a stand-in database).
