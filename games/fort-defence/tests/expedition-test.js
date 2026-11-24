// Expeditions play-test (criteria B): the Pattern Expedition (maths day 21) and the Lab Plan (science day 13).
// Maths: round 1 (watch-me first, every part right: rung 7 to 8, 1 star), round 2 with the rule missed twice (rung 1 to 2,
// 2 stars), round 3 on one page all right (rung 7 to 8, 3 stars, the day mastered), My Quest Report's A B C D strip,
// the criterion's ladder from the strip, the grown-up bands and write-up, review cards, and a reload.
// Science: day 13 after Challenge goes to the Expedition (not the Brain check); rounds 1 to 3 with a typed "because";
// a weak because keeps rung 3 to 4 and 2 stars; a strong one gives 7 to 8 and the third star.
// `SHOTS=dir/` saves screenshots; add `ipad` for iPad size.
const path = require('path');
const { chromium } = require('playwright'); const { serve } = require('./mock');
const ARGS = { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] };
const SHOTS = process.env.SHOTS, IPAD = process.argv.includes('ipad');
const log = (...a) => console.log(...a);
let fails = 0; const ok = (c, m) => { log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };

// answers every item on screen (all of them in round 3); bad = item keys to get wrong every try
const ANSWER = `async (bad) => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const boxes = [...document.querySelectorAll('.sheet .xitem')].filter(b => !b.dataset.done);
  for (const box of boxes) {
    const it = window.__fdxItems[box.dataset.key], I = window.__fdxi, wrong = bad.includes(it.key); box.dataset.done = 1;
    for (let t = 0; t < 2; t++) {
      if (it.custom && it.key === 'find') { box.querySelectorAll('.tbl input').forEach((inp, i) => inp.value = wrong ? '0' : String(I.f(i + 1))); [...box.querySelectorAll('button')].find(b => /Check table/.test(b.textContent)).click(); }
      else if (it.custom && it.key === 'because') { const inp = box.querySelector('input.ans'); inp.value = wrong ? 'because it is fun to do' : 'my muscles need more oxygen for respiration'; [...box.querySelectorAll('button')].find(b => /Check/.test(b.textContent)).click(); break; }
      else if (it.a.choice) { const bs = box.querySelectorAll('.opts button'); const k = wrong ? [...bs].findIndex((b, i) => i !== it.a.ans && !b.disabled) : it.a.ans; if (k < 0 || bs[k].disabled) break; bs[k].click(); }
      else if (it.a.order) { const n = it.a.order.length; const tray = [...box.querySelectorAll('.ordt')]; const seq = wrong ? [...Array(n).keys()].reverse() : [...Array(n).keys()]; seq.forEach(i => tray.find(b => +b.dataset.i === i).click()); [...box.querySelectorAll('button')].find(b => b.textContent === 'Check').click(); }
      else if (it.a.sort) { box.querySelectorAll('.sortrow').forEach(r => { const want = it.a.sort.items[r._i][1]; r._b[wrong ? 1 - want : want].click(); }); [...box.querySelectorAll('button')].find(b => b.textContent === 'Check').click(); }
      else if (it.a.gap) { box.querySelectorAll('.gapin').forEach((inp, i) => inp.value = wrong ? 'zzz' : it.a.gap.ans[i]); [...box.querySelectorAll('button')].find(b => b.textContent === 'Check').click(); }
      else { const inp = box.querySelector('input.ans'); if (!inp || inp.disabled) break; inp.value = wrong ? '999' : (it.a.num != null ? String(it.a.num) : it.a.expr.replace('n+', 'n + ')); inp.parentElement.querySelector('button').click(); }
      await wait(60);
      if (!wrong) break;
    }
  }
}`;

async function playRound(p, bad = [], shot) {
  for (let g = 0; g < 30; g++) {
    if (await p.locator('.sheet .xladder').count()) break;
    const ready = p.locator('.sheet button', { hasText: "I'm ready" }); if (await ready.count()) { if (shot) await p.screenshot({ path: SHOTS + shot + '-watch.png' }); await ready.click(); continue; }
    await p.evaluate(`(${ANSWER})(${JSON.stringify(bad)})`); await p.waitForTimeout(100);
    const fin = p.locator('.sheet button.bigbtn', { hasText: 'Finish' });
    if (await fin.count()) { if (shot) await p.screenshot({ path: SHOTS + shot + '-page.png', fullPage: true }); await fin.click(); continue; }
    const next = p.locator('.sheet .btn.primary:not(.hide)', { hasText: 'Next' }); if (await next.count()) await next.first().click();
  }
  await p.waitForSelector('.sheet .xladder');
  if (shot) await p.screenshot({ path: SHOTS + shot + '-ladder.png' });
  return p.evaluate(() => ({ ...window.__fdx, stars: __fd.prog.stars(window.__fdx.key) }));
}

(async () => {
  const srv = await serve(path.resolve(__dirname, '../../..'), 8857); const b = await chromium.launch(ARGS); const errs = [];
  const vp = IPAD ? { width: 820, height: 1180 } : { width: 1280, height: 800 };
  // ---------------- maths ----------------
  let ctx = await b.newContext({ viewport: vp }); let p = await ctx.newPage();
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://localhost:8857/games/fort-defence/?practice&lowgfx'); await p.waitForSelector('.logo', { timeout: 30000 });
  await p.click('.btn.pulse'); await p.waitForSelector('.dawn .go-day');
  await p.evaluate(() => { const S = __fd.save.state; for (let i = 1; i <= 20; i++) { S.lv[String(i)] = { stars: 3, train: true }; S.learnDone[String(i)] = true; } S.bosses['1'] = { won: true, best: 8 }; S.bosses['2'] = { won: true, best: 8 }; S.learnDone['21'] = true; __fd.save.commit(); });
  ok(await p.evaluate(() => __fd.prog.nextPhase('21')) === 'exp', 'maths day 21 goes to the Expedition');
  await p.evaluate(() => __fd.day.open('21')); await p.waitForSelector('.sheet .xp .xpills');
  const head = await p.locator('.sheet .phases').textContent(); ok(/Expedition/.test(head) && !/Investigate/.test(head), 'day head shows Lesson + Expedition: ' + head.trim());
  if (SHOTS) await p.screenshot({ path: SHOTS + 'x-start.png' });
  await p.locator('.sheet button.bigbtn', { hasText: 'Start round 1' }).click();
  let r = await playRound(p, [], SHOTS && 'x-r1');
  ok(r.round === 1 && r.rung === 3 && r.stars === 1, `round 1 all right: rung ${r.rung} (want 3), stars ${r.stars} (want 1)`);
  await p.locator('.sheet button.bigbtn', { hasText: 'Round 2' }).click();
  r = await playRound(p, ['rule']);
  ok(r.round === 2 && r.rung === 0 && r.parts.rule === 'help' && r.parts.words === 'help' && r.stars === 2, `round 2 with the rule missed: rung ${r.rung} (want 0), stars ${r.stars} (want 2)`);
  const best = await p.evaluate(() => __fd.save.state.crit['21'].best); ok(best === 3, 'best rung kept at 7 to 8 after a weaker round: ' + best);
  await p.locator('.sheet button.bigbtn', { hasText: 'Round 3' }).click();
  r = await playRound(p, [], SHOTS && 'x-r3');
  ok(r.round === 3 && r.rung === 3 && r.stars === 3, `round 3 on one page all right: rung ${r.rung}, stars ${r.stars} (want 3)`);
  await p.locator('.sheet button.bigbtn', { hasText: 'Continue' }).click(); await p.waitForSelector('.sheet .celebrate');
  ok(/Day 21 mastered/.test(await p.locator('.sheet .celebrate').textContent()), 'mastered screen shows');
  const text = await p.evaluate(() => __fd.save.state.crit['21'].text); ok(/Find:.*\n.*Describe:.*\n.*Test:.*\n.*Explain:/s.test(text), 'write-up saved');
  ok(await p.evaluate(() => __fd.cards.ensure() >= 0 && !!__fd.save.state.cards['21|why']), 'review card 21|why joins the armoury');
  // report strip
  await p.evaluate(() => __fd.report.openReport()); await p.waitForSelector('.sheet .rp-crit');
  let fdr = await p.evaluate(() => window.__fdr.crit);
  ok(/^green\|Rung 7 to 8/.test(fdr.B) && /^grey\|Coming up/.test(fdr.C) && /^grey\|Coming up/.test(fdr.D) && /^(green|amber)/.test(fdr.A), 'strip: ' + JSON.stringify(fdr));
  if (SHOTS) await p.screenshot({ path: SHOTS + 'x-report.png' });
  // C is now an Expedition of its own (the Scribe's Slate): its cell opens its ladder too
  await p.click('.sheet .rp-cl[data-crit="C"]'); await p.waitForSelector('.sheet .xladder');
  await p.evaluate(() => __fd.report.openReport()); await p.waitForSelector('.sheet .rp-crit');
  await p.click('.sheet .rp-cl[data-crit="B"]'); await p.waitForSelector('.sheet .xladder');
  ok(/Best so far/.test(await p.locator('.sheet .xladder').textContent()), 'tapping B opens its ladder');
  if (SHOTS) await p.screenshot({ path: SHOTS + 'x-critladder.png' });
  await p.evaluate(() => __fd.report.openGrown()); await p.waitForSelector('.sheet .rp-critgrown');
  const g = await p.locator('.sheet .rp-critgrown').textContent();
  ok(/B, Investigating patterns: band 7 to 8/.test(g) && /not school marks/.test(g) && /C, Communicating: not tried yet/.test(g), 'grown-up bands: ' + g.slice(0, 120));
  // reload keeps it
  await p.reload(); await p.waitForSelector('.logo', { timeout: 30000 });
  ok(await p.evaluate(() => __fd.save.state.crit['21'].best === 3 && __fd.prog.stars('21') === 3), 'reload keeps the Expedition and the stars');
  await ctx.close();

  // ---------------- science ----------------
  ctx = await b.newContext({ viewport: vp }); p = await ctx.newPage();
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://localhost:8857/games/fort-defence/?practice&lowgfx&subject=science'); await p.waitForSelector('.logo', { timeout: 30000 });
  await p.click('.btn.pulse'); await p.waitForSelector('.dawn .go-day');
  await p.evaluate(() => { const S = __fd.save.state; S.lv['sci2:13'] = { stars: 2, train: true }; S.learnDone['sci2:13'] = true; S.unlockAll = true; __fd.save.commit(); });
  ok(await p.evaluate(() => __fd.prog.nextPhase('sci2:13')) === 'exp', 'science day 13 after Challenge goes to the Expedition, not the Brain check');
  await p.evaluate(() => __fd.day.open('sci2:13')); await p.waitForSelector('.sheet .xp .xpills');
  const sh = await p.locator('.sheet .phases').textContent(); ok(/Train/.test(sh) && /Expedition/.test(sh) && !/Brain/.test(sh), 'science head: ' + sh.trim());
  await p.locator('.sheet button.bigbtn', { hasText: 'Start round 1' }).click();
  r = await playRound(p, [], SHOTS && 's-r1'); ok(r.rung === 3 && r.stars === 2, `science round 1: rung ${r.rung}, stars stay ${r.stars}`);
  await p.locator('.sheet button.bigbtn', { hasText: 'Round 2' }).click();
  r = await playRound(p, ['controls']); ok(r.rung === 1, `science round 2 with controls wrong: rung ${r.rung} (want 1)`);
  await p.locator('.sheet button.bigbtn', { hasText: 'Round 3' }).click();
  r = await playRound(p, ['because'], SHOTS && 's-r3'); ok(r.rung === 1 && r.stars === 2, `round 3 with a weak because: rung ${r.rung} (want 1), stars ${r.stars} (want 2)`);
  await p.locator('.sheet button.bigbtn', { hasText: 'Try for' }).click();
  r = await playRound(p, []); ok(r.rung === 3 && r.stars === 3, `round 3 again with a strong because: rung ${r.rung}, stars ${r.stars} (want 3)`);
  const plan = await p.evaluate(() => __fd.save.state.crit['sci2:13'].text); ok(/Question:.*Hypothesis:.*Variables:.*Method:/s.test(plan), 'plan saved');
  await p.evaluate(() => __fd.report.openReport()); await p.waitForSelector('.sheet .rp-crit');
  fdr = await p.evaluate(() => window.__fdr.crit); ok(/^green\|Rung 7 to 8/.test(fdr.B), 'science strip B: ' + fdr.B);
  if (SHOTS) await p.screenshot({ path: SHOTS + 's-report.png' });
  await ctx.close();

  log('ERRORS', errs.length ? errs.join('\n') : 'none'); await b.close(); srv.close(); process.exit(fails || errs.length ? 1 : 0);
})().catch(e => { console.log('FAIL', e.message.split('\n').slice(0, 4).join(' ')); process.exit(1); });
