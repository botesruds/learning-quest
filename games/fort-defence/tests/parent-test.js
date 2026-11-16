// The parent corner: grown-up sum, stars, answers, demon lords, "open this land now", "open every day". Practice save only.
const {chromium,devices}=require('playwright');const {serve}=require('./mock');const path=require('path');const os=require('os');
const ARGS={args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']};
(async()=>{ const srv=await serve(path.resolve(__dirname,'../../..'),8852); const b=await chromium.launch(ARGS); let ok=true; const errs=[];
  const check=(n,c,x='')=>{ console.log((c?'PASS ':'FAIL ')+n,x); if(!c) ok=false; };
  for(const dev of ['laptop','ipad']){
    const c=await b.newContext(dev==='ipad'?{...devices['iPad (gen 7) landscape']}:{viewport:{width:1280,height:800}}); const p=await c.newPage(); p.on('pageerror',e=>errs.push(dev+': '+e.message));
    await p.goto('http://localhost:8852/games/fort-defence/?practice&lowgfx'); await p.waitForSelector('.logo');
    await p.evaluate(()=>{ const S=__fd.save.state; S.lv['1']={stars:3,train:true}; S.lv['2']={stars:2,train:true}; S.learnDone['1']=S.learnDone['2']=true;
      S.hist['1']=[{r:'own'},{r:'own'},{r:'wrong'},{r:'help'},{r:'own'}]; S.hist['2']=[{r:'step'},{r:'own'}]; S.last['1']=Date.now(); S.repair['2']=true;
      S.bosses['1']={won:false,best:7,t:Date.now()}; __fd.save.commit(); });
    // from the title screen
    await p.click('[aria-label="For grown-ups"]'); await p.waitForSelector('text=To open the parent corner');
    const [a,bb]=(await p.locator('text=To open the parent corner').textContent()).match(/(\d+) × (\d+)/).slice(1).map(Number);
    await p.fill('.sheet .ans','1'); await p.click('.sheet button:has-text("Open")'); check(dev+' wrong sum refused', (await p.locator('.sheet .ans.no').count())===1);
    await p.fill('.sheet .ans',String(a*bb)); await p.click('.sheet button:has-text("Open")'); await p.waitForSelector('text=Parent corner');
    const txt=await p.locator('.sheet').innerText();
    check(dev+' shows lands and days', (await p.locator('.pc-region').count())>=5 && (await p.locator('.pc-row').count())>=20, (await p.locator('.pc-row').count())+' days');
    check(dev+' shows stars, repair and lord', txt.includes('⭐⭐⭐')&&txt.includes('Marked for repair')&&/best 7 hits/.test(txt));
    check(dev+' answer dots', (await p.locator('.pc-row').first().locator('.rdots i').count())===5);
    await p.screenshot({path:path.join(os.tmpdir(),`parent-${dev}.png`)});
    // open land 2 now
    const r2day=await p.evaluate(()=>__fd.prog.road.find(n=>n.t==='level'&&n.region.n===2).key);
    check(dev+' land 2 locked before', !(await p.evaluate(k=>__fd.prog.nodeOpen(__fd.prog.road.find(n=>n.key===k)),r2day)));
    await p.locator('.pc-region').nth(1).locator('input[type=checkbox]').check();
    check(dev+' land 2 opens for class', await p.evaluate(k=>__fd.prog.nodeOpen(__fd.prog.road.find(n=>n.key===k)),r2day));
    await p.click('text=Open every day'); check(dev+' needs a second tap', !(await p.evaluate(()=>__fd.save.state.unlockAll)));
    await p.click('text=Tap again to open every day'); check(dev+' every day open', await p.evaluate(()=>__fd.save.state.unlockAll));
    await p.click('text=Lock days to mastery again'); check(dev+' locked again', !(await p.evaluate(()=>__fd.save.state.unlockAll)));
    check(dev+' no sideways scroll', await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    await p.click('text=✕ Back to the game'); await p.waitForSelector('.logo'); check(dev+' back to the title', true);
    // from the dawn screen
    await p.click('.btn.pulse'); await p.waitForSelector('.dawn .go-day'); await p.click('[aria-label="For grown-ups"]'); await p.waitForSelector('text=To open the parent corner');
    await p.click('text=✕ Back'); await p.waitForSelector('.dawn .go-day'); check(dev+' back to dawn', true);
    await p.reload(); await p.waitForSelector('.logo'); check(dev+' class choice saved', await p.evaluate(()=>Object.values(__fd.save.state.classNow).some(Boolean)));
    await c.close();
  }
  console.log('ERRORS', errs.length?errs.join('\n'):'none'); console.log(ok&&!errs.length?'ALL PASS':'SOME FAILED'); await b.close(); srv.close(); })().catch(e=>{ console.log('FAIL',e.message.split('\n').slice(0,4).join(' ')); process.exit(1); });
