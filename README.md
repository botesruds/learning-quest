# Learning Quest (family learning site)

Static site on Vercel. Progress is saved online in Supabase (project "botesruds's Project",
private schema `learning`, reached only through the `fl_*` functions, which need the family key).

- `index.html` home screen: "Hi Oliver", subjects, games, a "For grown-ups" panel.
- `catalog.js` the list of subjects and games. Add one line per new game.
- `shared/family.js` sign-in from the bookmark (`#k=<family key>&p=<player>`) and cloud save.
- `games/<id>/index.html` one folder per game.

## Adding a game
1. Build the game as one HTML file in `games/<id>/index.html`.
2. Add `<script src="../../shared/family.js"></script>` in its head.
3. On load: `Family.load("<id>")` returns `{ok, state, updated}`.
   After each answer: `Family.save("<id>", state, updatedMs)`. The newer copy wins.
4. Add the game to `catalog.js` and redeploy.

Only a nickname and game progress are stored. The site is not indexed (robots.txt + X-Robots-Tag).

## Fort Defence (in development)
`games/fort-defence/` is the Fort Defence rebuild of Algebra Quest (Three.js bundled in `vendor/`, no build step).
It saves under game id `fort-defence` and copies Algebra Quest progress once, read only.
Without the family connection (or with `?practice`) it uses a practice save on that device only. `?dev` shows a test bench.
It is not in `catalog.js` yet, so the home page still opens Algebra Quest.
