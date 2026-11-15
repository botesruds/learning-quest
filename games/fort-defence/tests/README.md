# Fort Defence play-tests

Automated checks run with Playwright and a local web server. They use a practice save and a fake database,
so they never touch real progress. Screenshots are written to the folder you run them from.

| Test | What it checks |
| --- | --- |
| `node tests/content-check.js` | Every content pack: renders every lesson card, runs each question maker 40 times and checks each question accepts its own answer, checks every why-question and understanding question. Run this after adding or editing a pack. |
| `node tests/day-test.js` | Plays a whole day like a player: lesson, Train with a slip, riddles, Challenge with a miss, loot, building, the night waiting at dawn, quest map, scout report, reload. Also an iPad portrait check. |
| `node tests/night-test.js` | A whole night on a demo castle, laptop and iPad: demons, towers, 6 runes (one answered wrong to crack a wall), the third star from the Brain check, the morning report, fixing the crack, leaving a night, reload. Speeds the battle up 8× because software graphics are slow. |
| `node tests/siege-test.js` | Demon lords: loses to the Letter Guardian (repairs and cracks appear), does every repair, wins the rematch (badge, gold, Balance Bridge opens, the land changes), then beats the Algebra Dragon (13 of 16), reload. `node tests/siege-test.js ipad` runs it at iPad size. |
| `node tests/shop-test.js` | The hero shop on laptop and iPad: buying and choosing a commander and a pet, gold, badge banners on the keep, reload. |
| `node tests/builder-test.js` | The fort builder with mouse and touch: drag, paint, upgrade, move, pick up, refund, decorations, land limits, camera, reload. |

In a container without a GPU, Chromium needs `--use-angle=swiftshader` (already set in the tests).
