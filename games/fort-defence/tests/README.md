# Fort Defence play-tests

Automated checks run with Playwright and a local web server. They use a practice save and a fake database,
so they never touch real progress. Screenshots are written to the folder you run them from.

| Test | What it checks |
| --- | --- |
| `node tests/content-check.js` | Every content pack: renders every lesson card, runs each question maker 40 times and checks each question accepts its own answer, checks every why-question and understanding question. Run this after adding or editing a pack. |
| `node tests/day-test.js` | Plays a whole day like a player: lesson, Train with a slip, riddles, Challenge with a miss, Brain check, loot, land claim, building, quest map, scout report, reload. Also an iPad portrait check. |
| `node tests/builder-test.js` | The fort builder with mouse and touch: drag, paint, upgrade, move, pick up, refund, decorations, land limits, camera, reload. |

In a container without a GPU, Chromium needs `--use-angle=swiftshader` (already set in the tests).
