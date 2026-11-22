// Peek-ahead play-test: on the quest map a locked day says "👀 peek"; tapping it opens that day's lesson read-only
// (no loot, no stars, learnDone stays unset, the day stays locked), "Back to the map" returns to the map and the tile
// then says "👀 peeked". Open days still open normally. Runs for maths (default) and science (?subject=science).
const path=require('path');
const {chromium}=require('playwright');const {serve}=require('./mock');
const ARGS={args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']};
const log=(...a)=>console.log(...a);
(async()=>{ const srv=await serve(path.resolve(__dirname,'../../..'),8851); const b=await chromium.launch(ARGS); const errs=[]; let fails=0;
 for(const subj of ['','&subject=science']){
  const p=await (await b.newContext({viewport:{width:1280,height:800}})).newPage();
  p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
  await p.goto('http://localhost:8851/games/fort-defence/?practice&lowgfx'+subj); await p.waitForSelector('.logo',{timeout:30000});
  await p.click('.btn.pulse'); await p.waitForSelector('.dawn .go-day');
  await p.evaluate(()=>__fd.day.openMap()); await p.waitForSelector('.sheet .qtile');
  const info=await p.evaluate(()=>{ const t=[...document.querySelectorAll('.sheet .qtile.locked')].find(x=>!x.classList.contains('lord')); return { label:t.getAttribute('aria-label'), st:t.querySelector('.st').textContent, idx:[...document.querySelectorAll('.sheet .qtile')].indexOf(t) }; });
  const before=await p.evaluate(()=>JSON.stringify({g:__fd.save.state.gold,m:__fd.save.state.mats,lv:__fd.save.state.lv,ld:__fd.save.state.learnDone}));
  await p.evaluate(i=>document.querySelectorAll('.sheet .qtile')[i].click(),info.idx); await p.waitForSelector('.sheet .peek .chunk');
  const eyebrow=await p.locator('.sheet .eyebrow').first().textContent();
  let pages=0; for(let k=0;k<20;k++){ pages++;
    // a "try" card: tap answers until Next unlocks
    for(let t=0;t<6;t++){ const dis=await p.evaluate(()=>document.querySelector('.sheet .chunk .pager .btn.primary').disabled); if(!dis) break;
      await p.evaluate(()=>{ const bs=[...document.querySelectorAll('.sheet .chunk .opts button:not(:disabled)')]; if(bs[0]) return bs[0].click();
        const inp=document.querySelector('.sheet .chunk input.ans:not(:disabled)'); if(inp){ inp.value='zz'; inp.dispatchEvent(new Event('input')); inp.parentElement.querySelector('button').click(); } }); await p.waitForTimeout(150); }
    const txt=await p.evaluate(()=>{ const b=document.querySelector('.sheet .chunk .pager .btn.primary'); const s=b.textContent; b.click(); return s; }); await p.waitForTimeout(150);
    if(/Back to the map/.test(txt)) break; }
  await p.waitForSelector('.sheet .qtile');
  const after=await p.evaluate(()=>JSON.stringify({g:__fd.save.state.gold,m:__fd.save.state.mats,lv:__fd.save.state.lv,ld:__fd.save.state.learnDone}));
  const tile=await p.evaluate(i=>{ const t=document.querySelectorAll('.sheet .qtile')[i]; return {locked:t.classList.contains('locked'),st:t.querySelector('.st').textContent}; },info.idx);
  const ok=info.st==='👀 peek'&&/Peek ahead/.test(eyebrow)&&before===after&&tile.locked&&tile.st==='👀 peeked';
  if(!ok) fails++;
  log((subj?'science':'maths')+':', info.label.split('.')[0], '| tile:', info.st, '| opened:', eyebrow, '|', pages, 'cards | progress unchanged:', before===after, '| still locked:', tile.locked, '| tile now:', tile.st, ok?'OK':'FAIL');
  // an open day still opens the day screen
  await p.evaluate(()=>{ const t=[...document.querySelectorAll('.sheet .qtile')].find(x=>!x.classList.contains('locked')&&!x.classList.contains('chest')&&!x.classList.contains('lord')); t.click(); });
  await p.waitForTimeout(300); const dayOpen=await p.locator('.sheet .peek').count()===0; log('   open day opens normally:', dayOpen); if(!dayOpen) fails++;
  await p.context().close(); }
 log('ERRORS', errs.length?errs.join('\n'):'none'); await b.close(); srv.close(); process.exit(fails||errs.length?1:0); })().catch(e=>{ console.log('FAIL', e.message.split('\n').slice(0,4).join(' ')); process.exit(1); });
