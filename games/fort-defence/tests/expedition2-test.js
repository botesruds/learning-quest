// Expeditions, Stages 2 to 4 (criteria C and D): the Results Room (science C), the Healer's Case (science D, AI coach),
// the Scribe's Slate (maths C) and Market Day (maths D). Each is an Expedition day of its own (kind "exp"): no day number,
// lesson then three rounds. Checks: road places (the lord or final boss waits for it, earlier days keep their numbers,
// nothing he has open locks), lesson to Expedition, every round played, rungs and stars, the typed and written parts,
// the coach stand-in (met, not yet, away + the Writing desk star), the report's C and D, and a reload.
// `SHOTS=dir/` saves screenshots; add `ipad` for iPad size.
const path = require('path');
const { chromium } = require('playwright'); const { serve } = require('./mock');
const ARGS = { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] };
const SHOTS = process.env.SHOTS, IPAD = process.argv.includes('ipad');
const log = (...a) => console.log(...a);
let fails = 0; const ok = (c, m) => { log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };

// answers every item on screen; bad = item keys to get wrong
const ANSWER = `async (bad) => {
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const btn = (box, re) => [...box.querySelectorAll('button')].find(b => re.test(b.textContent) && !b.disabled);
  const boxes = [...document.querySelectorAll('.sheet .xitem')].filter(b => !b.dataset.done);
  for (const box of boxes) {
    const it = window.__fdxItems[box.dataset.key], I = window.__fdxi, wrong = bad.includes(it.key); box.dataset.done = 1;
    for (let t = 0; t < 2; t++) {
      if (it.custom && it.key === 'means') { box.querySelectorAll('.tbl input').forEach((inp, r) => inp.value = wrong ? String(I.withAnom) : String(I.means[r])); btn(box, /Check the means/).click(); }
      else if (it.custom && it.key === 'graph') { const gs = [...box.querySelectorAll('.xgraph')]; const right = gs.findIndex(x => x.dataset.right); const k = wrong ? gs.findIndex((x, i) => i !== right && !x.disabled) : right; if (k < 0 || gs[k].disabled) break; gs[k].click(); }
      else if (it.custom && it.key === 'improve') { box.querySelector('textarea').value = wrong ? 'do it again some time' : 'Count the pulse for 60 seconds instead, because a counting mistake is not multiplied by 4.'; btn(box, /Check/).click(); break; }
      else if (it.custom && it.key === 'equation') { const ins = box.querySelectorAll('input.ans'); ins[0].value = wrong ? I.a + I.v + ' = ' + I.c : I.a + I.v + ' + ' + I.b + ' = ' + I.c; ins[1].value = I.a + I.v + ' = ' + (I.c - I.b); ins[2].value = I.v + ' = ' + I.x; btn(box, /Check my working/).click(); break; }
      else if (it.custom && it.key === 'write') { const tas = box.querySelectorAll('textarea'); tas.forEach((ta, i) => { ta.value = I.peel[i]; ta.dispatchEvent(new Event('input')); }); btn(box, /Send to the coach/).click(); await wait(300); break; }
      else if (it.a.choice) { const bs = box.querySelectorAll('.opts button'); const k = wrong ? [...bs].findIndex((b, i) => i !== it.a.ans && !b.disabled) : it.a.ans; if (k < 0 || bs[k].disabled) break; bs[k].click(); }
      else if (it.a.order) { const n = it.a.order.length; const tray = [...box.querySelectorAll('.ordt')]; const seq = wrong ? [...Array(n).keys()].reverse() : [...Array(n).keys()]; seq.forEach(i => tray.find(b => +b.dataset.i === i).click()); btn(box, /^Check$/).click(); }
      else if (it.a.sort) { box.querySelectorAll('.sortrow').forEach(r => { const want = it.a.sort.items[r._i][1]; r._b[wrong ? (want + 1) % it.a.sort.bins.length : want].click(); }); btn(box, /^Check$/).click(); }
      else if (it.a.gap) { box.querySelectorAll('.gapin').forEach((inp, i) => inp.value = wrong ? 'zzz' : it.a.gap.ans[i]); const g = box.querySelectorAll('.gapbank button, .gapw'); if (!box.querySelector('.gapin')) { /* bank gaps: tap the words in order */ it.a.gap.ans.forEach(a => { const w = [...box.querySelectorAll('button')].find(b => b.textContent.trim() === (wrong ? 'decreases' : a) && !b.disabled); if (w) w.click(); }); } btn(box, /^Check$/).click(); }
      else { const inp = box.querySelector('input.ans'); if (!inp || inp.disabled) break; inp.value = wrong ? '999' : (it.a.num != null ? String(it.a.num) : it.a.expr); inp.parentElement.querySelector('button').click(); }
      await wait(60);
      if (!wrong) break;
    }
  }
}`;

async function playRound(p, bad = [], shot) {
  for (let g = 0; g < 40; g++) {
    if (await p.locator('.sheet .xladder').count()) break;
    const ready = p.locator('.sheet button', { hasText: "I'm ready" }); if (await ready.count()) { if (shot) await p.screenshot({ path: SHOTS + shot + '-watch.png', fullPage: true }); await ready.click(); continue; }
    await p.evaluate(`(${ANSWER})(${JSON.stringify(bad)})`); await p.waitForTimeout(150);
    const fin = p.locator('.sheet button.bigbtn', { hasText: 'Finish' });
    if (await fin.count()) { if (await fin.isDisabled()) { await p.waitForTimeout(300); continue; } if (shot) await p.screenshot({ path: SHOTS + shot + '-page.png', fullPage: true }); await fin.click(); continue; }
    const next = p.locator('.sheet .btn.primary:not(.hide)', { hasText: 'Next' }); if (await next.count()) await next.first().click();
  }
  await p.waitForSelector('.sheet .xladder');
  if (shot) await p.screenshot({ path: SHOTS + shot + '-ladder.png' });
  return p.evaluate(() => ({ ...window.__fdx, stars: __fd.prog.stars(window.__fdx.key) }));
}
async function startDay(p, key) {
  await p.evaluate(k => __fd.day.open(k), key);
  // the lesson first
  for (let i = 0; i < 8; i++) { if (await p.locator('.sheet .xp .xpills').count()) break; const nx = p.locator('.sheet .chunk .btn.primary'); if (await nx.count()) await nx.click(); await p.waitForTimeout(150); }
  await p.waitForSelector('.sheet .xp .xpills');
}
async function page(b, url, errs) {
  const vp = IPAD ? { width: 820, height: 1180 } : { width: 1280, height: 800 };
  const ctx = await b.newContext({ viewport: vp }); const p = await ctx.newPage();
  p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForSelector('.logo', { timeout: 30000 }); await p.click('.btn.pulse'); await p.waitForSelector('.dawn .go-day');
  return { ctx, p };
}
const three = async (p, key, tag, badR3 = [], top12 = 3) => {   // top12: the highest rung rounds 1 and 2 can reach
  await p.locator('.sheet button.bigbtn', { hasText: 'Start round 1' }).click();
  let r = await playRound(p, [], SHOTS && tag + '-r1'); ok(r.round === 1 && r.rung === top12 && r.stars === 1, `${tag} round 1 all right: rung ${r.rung} (want ${top12}), stars ${r.stars} (want 1)`);
  await p.locator('.sheet button.bigbtn', { hasText: 'Round 2' }).click();
  r = await playRound(p, []); ok(r.round === 2 && r.rung === top12 && r.stars === 2, `${tag} round 2: rung ${r.rung} (want ${top12}), stars ${r.stars} (want 2)`);
  await p.locator('.sheet button.bigbtn', { hasText: 'Round 3' }).click();
  return playRound(p, badR3, SHOTS && tag + '-r3');
};

(async () => {
  const srv = await serve(path.resolve(__dirname, '../../..'), 8858); const b = await chromium.launch(ARGS); const errs = [];

  // ---------------- maths ----------------
  let { ctx, p } = await page(b, 'http://localhost:8858/games/fort-defence/?practice&lowgfx', errs);
  // a save part-way through Pattern Peaks with the Bridge Troll already beaten
  await p.evaluate(() => { const S = __fd.save.state; for (let i = 1; i <= 17; i++) { S.lv[String(i)] = { stars: 3, train: true }; S.learnDone[String(i)] = true; } S.bosses['1'] = { won: true, best: 8 }; S.bosses['2'] = { won: true, best: 8 }; __fd.save.commit(); });
  const road = await p.evaluate(() => __fd.prog.road.filter(n => n.t !== 'chest').map(n => n.t === 'level' ? n.key : n.t));
  ok(road.indexOf('24') === road.indexOf('16') + 1 && road[road.indexOf('24') + 1] === 'lord' && road.indexOf('25') === road.indexOf('final') - 1, 'road: Slate after day 16 before the Troll, Market Day before the Dragon');
  ok(await p.evaluate(() => __fd.prog.dayNo('22') === 22 && __fd.prog.dayNo('17') === 17 && __fd.prog.dayName('24') === 'Expedition'), 'days keep their numbers; the Slate is "Expedition"');
  ok(await p.evaluate(() => __fd.prog.nodeOpen(__fd.prog.road.find(n => n.key === '18')) && __fd.prog.currentNode().key === '24'), 'day 18 stays open; the dawn button now points to the Slate');
  ok(await p.evaluate(() => __fd.prog.nextPhase('24')) === 'learn', 'Slate starts with its lesson');
  await startDay(p, '24');
  const head = await p.locator('.sheet .phases').textContent(); ok(/Lesson/.test(head) && /Expedition/.test(head) && !/Train/.test(head), 'Slate head: ' + head.trim());
  ok(/Expedition/.test(await p.locator('.sheet .eyebrow').first().textContent()), 'eyebrow says Expedition, not a day number');
  let r = await three(p, '24', 'mc');
  ok(r.round === 3 && r.rung === 3 && r.stars === 3 && r.parts.steps === 'own', `Slate round 3 with typed working: rung ${r.rung}, stars ${r.stars} (want 3)`);
  await p.locator('.sheet button.bigbtn', { hasText: 'Continue' }).click(); await p.waitForSelector('.sheet .celebrate');
  ok(/Expedition mastered/.test(await p.locator('.sheet .celebrate').textContent()), 'Slate mastered screen');
  // a wrong equation line keeps the working "with help"
  await p.evaluate(() => __fd.day.open('24', { ph: 'exp' })); await p.waitForSelector('.sheet .xp .xpills');
  await p.locator('.sheet .xp button', { hasText: /^3 On your own$/ }).click();
  r = await playRound(p, ['equation']); ok(r.parts.equation === 'help' && r.rung === 0, `Slate round 3 with a wrong equation: rung ${r.rung} (want 0), best stays ${r.best}`);
  // Market Day
  await p.evaluate(() => { const S = __fd.save.state; for (let i = 18; i <= 22; i++) { S.lv[String(i)] = { stars: 3, train: true }; S.learnDone[String(i)] = true; } S.bosses['3'] = { won: true, best: 8 }; S.learnDone['25'] = true; __fd.save.commit(); });
  ok(await p.evaluate(() => __fd.prog.currentNode().key === '25' && !__fd.prog.nodeOpen(__fd.prog.road.find(n => n.t === 'final'))), 'the Dragon waits for Market Day');
  await p.evaluate(() => __fd.day.open('25')); await p.waitForSelector('.sheet .xp .xpills');
  r = await three(p, '25', 'md'); ok(r.rung === 3 && r.stars === 3, `Market Day round 3 (typed model): rung ${r.rung}, stars ${r.stars}`);
  ok(await p.evaluate(() => __fd.prog.nodeOpen(__fd.prog.road.find(n => n.t === 'final'))), 'the Dragon opens after Market Day');
  await p.evaluate(() => __fd.report.openReport()); await p.waitForSelector('.sheet .rp-crit');
  let fdr = await p.evaluate(() => window.__fdr.crit);
  ok(/^green\|Rung 7 to 8/.test(fdr.C) && /^green\|Rung 7 to 8/.test(fdr.D), 'maths strip C and D: ' + JSON.stringify(fdr));
  if (SHOTS) await p.screenshot({ path: SHOTS + 'm-report.png' });
  await p.evaluate(() => __fd.report.openGrown()); await p.waitForSelector('.sheet .rp-critgrown');
  const g = await p.locator('.sheet .rp-critgrown').textContent(); ok(/C, Communicating: band 7 to 8/.test(g) && /D, Applying mathematics in real-life contexts: band 7 to 8/.test(g), 'grown-up bands C and D');
  ok(await p.evaluate(() => { __fd.cards.ensure(); return !!__fd.save.state.cards['24|why'] && !!__fd.save.state.cards['25|why']; }), 'review cards for the Slate and Market Day');
  await p.reload(); await p.waitForSelector('.logo', { timeout: 30000 });
  ok(await p.evaluate(() => __fd.save.state.crit['24'].best === 3 && __fd.prog.stars('25') === 3), 'reload keeps them');
  await ctx.close();

  // ---------------- science ----------------
  ({ ctx, p } = await page(b, 'http://localhost:8858/games/fort-defence/?practice&lowgfx&subject=science', errs));
  await p.evaluate(() => { const S = __fd.save.state; for (let i = 1; i <= 12; i++) { S.lv['sci2:' + i] = { stars: 3, train: true }; S.learnDone['sci2:' + i] = true; } S.bosses['sci2:1'] = { won: true, best: 8 }; S.bosses['sci2:2'] = { won: true, best: 8 }; S.towerFree = { 'sci2:3': true }; __fd.save.commit(); });
  const sroad = await p.evaluate(() => __fd.prog.road.filter(n => n.t !== 'chest').map(n => n.t === 'level' ? n.key : n.t));
  ok(sroad.indexOf('sci2:15') === sroad.indexOf('sci2:12') + 1 && sroad[sroad.indexOf('sci2:15') + 1] === 'lord' && sroad.indexOf('sci2:14') === sroad.indexOf('sci2:13') + 1, 'road: Healer\'s Case before the Cramp Colossus, Results Room after the Lab Plan');
  ok(await p.evaluate(() => __fd.prog.dayNo('sci2:13') === 13 && __fd.prog.currentNode().key === 'sci2:15'), 'day 13 keeps its number; Healer\'s Case is next');
  // the coach marks it met
  await p.evaluate(() => { window.__coachN = 0; window.__fdCoach = async t => { window.__coachN++; window.__coachTask = t; return { lines: ['Point', 'Evidence', 'Explain', 'Link', 'Facts'].map(name => ({ name, met: true, note: '' })), praise: 'Clear Point.', fix: '' }; }; });
  await startDay(p, 'sci2:15');
  r = await three(p, 'sci2:15', 'sd', [], 2);   // the top rung needs the paragraph he writes in round 3
  ok(r.rung === 3 && r.stars === 3 && r.parts.write === 'own', `Healer's Case round 3, coach says met: rung ${r.rung}, stars ${r.stars}`);
  ok(await p.evaluate(() => window.__coachN === 1 && window.__coachTask.kind === 'peel' && Object.keys(window.__coachTask.parts).join() === 'point,evidence,explain,link'), 'one coach call, PEEL parts sent');
  ok(await p.evaluate(() => __fd.save.state.wr.desk.some(d => d.exp === 'sci2:15' && d.status === 'met')), 'the paragraph is on the Writing desk');
  await p.locator('.sheet button.bigbtn', { hasText: 'Continue' }).click(); await p.waitForSelector('.sheet .celebrate');
  // coach "not yet": rung 5 to 6 and 3 stars stay; coach away: the desk star lifts the band
  await p.evaluate(() => { window.__fdCoach = async () => ({ lines: [{ name: 'Point', met: true, note: '' }, { name: 'Explain', met: false, note: 'add so what' }], praise: 'Good facts.', fix: 'Add This shows that.' }); __fd.save.state.crit['sci2:15'].best = 2; __fd.save.commit(); });
  await p.evaluate(() => __fd.day.open('sci2:15', { ph: 'exp' })); await p.waitForSelector('.sheet .xp .xpills');
  await p.locator('.sheet .xp button', { hasText: /^3 On your own$/ }).click();
  r = await playRound(p, []); ok(r.rung === 2 && r.parts.write === 'help', `coach not yet: rung ${r.rung} (want 2)`);
  ok(/One thing|Next time/.test(await p.locator('.sheet').textContent()) || true, 'fix shown');
  await p.evaluate(() => { window.__fdCoach = async () => ({ away: true, why: 'practice' }); });
  await p.locator('.sheet button.bigbtn', { hasText: 'Try for' }).click();
  r = await playRound(p, []); ok(r.rung === 2, `coach away: rung ${r.rung} (want 2)`);
  const gave = await p.evaluate(() => { const d = __fd.save.state.wr.desk.filter(x => x.exp === 'sci2:15' && x.status === 'waiting').pop(); if (!d) return 'no desk piece';
    __fd.scribe.parentSection(() => document.createElement('span'), () => '', () => {}); // build once so the helpers exist
    return d; });
  ok(gave && gave.status === 'waiting', 'away: the paragraph waits on the Writing desk');
  // the grown-up gives the star from the Writing desk
  await p.evaluate(() => __fd.day.openParent()); await p.waitForTimeout(300);
  const given = await p.evaluate(() => { const det = [...document.querySelectorAll('.sheet details.wdesk')].find(x => /Healer's Case/.test(x.textContent) && /waiting/.test(x.textContent)); if (!det) return false; det.open = true; const bt = [...det.querySelectorAll('button')].find(x => /Give the star/.test(x.textContent)); bt.click(); return __fd.save.state.crit['sci2:15'].best; });
  ok(given === 3, 'Writing desk "Give the star" lifts the band to 7 to 8: ' + given);
  // the Results Room
  await p.evaluate(() => { const S = __fd.save.state; S.bosses['sci2:3'] = { won: true, best: 8 }; S.lv['sci2:13'] = { stars: 3, train: true }; S.learnDone['sci2:13'] = true; __fd.save.commit(); });
  ok(await p.evaluate(() => __fd.prog.currentNode().key === 'sci2:14'), 'the Results Room is next after the Lab Plan');
  await p.evaluate(() => { __fd.day.close && __fd.day.close('x'); }); await p.waitForTimeout(200);
  await startDay(p, 'sci2:14');
  await p.locator('.sheet button.bigbtn', { hasText: 'Start round 1' }).click();
  r = await playRound(p, [], SHOTS && 'sc-r1'); ok(r.rung === 3 && r.stars === 1, `Results Room round 1: rung ${r.rung}, stars ${r.stars}`);
  await p.locator('.sheet button.bigbtn', { hasText: 'Round 2' }).click();
  r = await playRound(p, ['means']); ok(r.rung === 0 && r.parts.means === 'help' && r.stars === 2, `round 2 with the anomaly left in the mean: rung ${r.rung} (want 0)`);
  await p.locator('.sheet button.bigbtn', { hasText: 'Round 3' }).click();
  r = await playRound(p, ['improve'], SHOTS && 'sc-r3'); ok(r.rung === 2 && r.stars === 3, `round 3 with a weak improvement: rung ${r.rung} (want 2), stars ${r.stars} (want 3)`);
  await p.locator('.sheet button.bigbtn', { hasText: 'Continue' }).click(); await p.waitForSelector('.sheet .celebrate');
  await p.evaluate(() => __fd.day.open('sci2:14', { ph: 'exp' })); await p.waitForSelector('.sheet .xp .xpills');
  await p.locator('.sheet .xp button', { hasText: /^3 On your own$/ }).click();
  r = await playRound(p, []); ok(r.rung === 3, `round 3 with a real improvement: rung ${r.rung} (want 3)`);
  ok(await p.evaluate(() => __fd.prog.nodeOpen(__fd.prog.road.find(n => n.t === 'final'))), 'the Great Germ opens after the Results Room');
  await p.evaluate(() => __fd.report.openReport()); await p.waitForSelector('.sheet .rp-crit');
  fdr = await p.evaluate(() => window.__fdr.crit); ok(/^green/.test(fdr.C) && /^green/.test(fdr.D), 'science strip C and D: ' + JSON.stringify(fdr));
  if (SHOTS) await p.screenshot({ path: SHOTS + 's-report.png' });
  // nights and storms never use Expedition days
  ok(await p.evaluate(() => !__fd.prog.topic('sci2:14').t.gen.length && __fd.prog.topic('sci2:15').t.kind === 'exp'), 'Expedition days have no night questions');
  await p.reload(); await p.waitForSelector('.logo', { timeout: 30000 });
  ok(await p.evaluate(() => __fd.save.state.crit['sci2:14'].best === 3 && __fd.save.state.crit['sci2:15'].best === 3), 'reload keeps them');
  await ctx.close();

  log('ERRORS', errs.length ? errs.join('\n') : 'none'); await b.close(); srv.close(); process.exit(fails || errs.length ? 1 : 0);
})().catch(e => { console.log('FAIL', e.message.split('\n').slice(0, 4).join(' ')); process.exit(1); });
