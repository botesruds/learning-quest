// Tower gate play-test: a land's demon lord waits until that land's Library dispatches are read and its royal reports
// are sent; days are never blocked. The dawn button leads to the Library, then the Scribe's Tower, then the lord.
// Bosses already open when the rule arrived (no towerGate flag yet) or already fought stay free; maths is unaffected.
const path=require('path');
const {chromium}=require('playwright');const {serve}=require('./mock');
const ARGS={args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']};
const log=(...a)=>console.log(...a);
(async()=>{ const srv=await serve(path.resolve(__dirname,'../../..'),8852); const b=await chromium.launch(ARGS); const errs=[]; let fails=0;
 const check=(name,ok,extra='')=>{ if(!ok) fails++; log((ok?'PASS ':'FAIL ')+name+(extra?' | '+extra:'')); };
 const page=async(q)=>{ const p=await (await b.newContext({viewport:{width:1280,height:800}})).newPage();
   p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
   await p.goto('http://localhost:8852/games/fort-defence/?practice&lowgfx'+q); await p.waitForSelector('.logo',{timeout:30000}); await p.click('.btn.pulse'); await p.waitForSelector('.dawn .go-day'); return p; };
 const master=(p,n)=>p.evaluate(n=>{ const S=__fd.save.state; __fd.prog.road.filter(x=>x.t==='level'&&x.region.n===n).forEach(x=>{ S.lv[x.key]={stars:3,train:true}; S.learnDone[x.key]=true; }); __fd.save.commit(); },n);
 const dawn=async p=>{ await p.evaluate(()=>__fd.dawnScreen()); await p.waitForSelector('.dawn .go-day'); return { btn:(await p.locator('.dawn .go-day').textContent()).trim(), sub:(await p.locator('.dawn .dsub').textContent()).trim() }; };

 // 1 science, Cell City mastered, towers not done
 let p=await page('&subject=science'); await master(p,1);
 const days=await p.evaluate(()=>{ const n=__fd.prog.road.find(x=>x.t==='lord'&&x.region.n===1); return __fd.prog.bossDays(n); });
 let d=await dawn(p); check('1 lord waits for reading', /Read for the battle/.test(d.btn), d.btn+' / '+d.sub);
 check('  days still open', await p.evaluate(()=>__fd.prog.road.filter(x=>x.t==='level'&&x.region.n===1).every(x=>__fd.prog.nodeOpen(x))));
 await p.click('.dawn .go-day'); await p.waitForTimeout(300); check('  button opens the Library', await p.locator('.sheet .qregion').count()>0);
 await p.evaluate(()=>__fd.day.close('nav'));
 await p.evaluate(()=>__fd.startSiege(__fd.prog.road.find(x=>x.t==='lord'&&x.region.n===1))); await p.waitForTimeout(300);
 check('  siege refused', !(await p.evaluate(()=>__fd.night.running)), await p.locator('.toast').last().textContent().catch(()=>''));
 // reading done
 await p.evaluate(ks=>{ const S=__fd.save.state; S.lib=S.lib||{fl:{},rd:{}}; S.lib.rd=S.lib.rd||{}; ks.forEach(k=>S.lib.rd[k]={done:true,best:3}); __fd.save.commit(); },days);
 d=await dawn(p); check('2 then writing', /Write for the battle/.test(d.btn), d.btn+' / '+d.sub);
 await p.click('.dawn .go-day'); await p.waitForTimeout(300); check('  button opens the Scribe\'s Tower', /Scribe|reports/i.test(await p.locator('.sheet').textContent())); await p.evaluate(()=>__fd.day.close('nav'));
 await p.evaluate(ks=>{ const S=__fd.save.state; S.wr=S.wr||{}; S.wr.rp=S.wr.rp||{}; ks.forEach(k=>S.wr.rp[k]={done:true}); __fd.save.commit(); },days);
 d=await dawn(p); check('3 then the lord', /Blob King/.test(d.btn), d.btn);
 await p.context().close();

 // 4 grandfather: a lord already open before the rule (no towerGate flag) stays free
 p=await page('&subject=science'); await master(p,1); await p.evaluate(()=>{ delete __fd.save.state.towerGate; delete __fd.save.state.towerFree; });
 d=await dawn(p); check('4 lord open before the rule stays free', /Blob King/.test(d.btn), d.btn+' | free: '+JSON.stringify(await p.evaluate(()=>__fd.save.state.towerFree)));
 // 5 a lord already fought stays free
 await master(p,2); await p.evaluate(()=>{ __fd.save.state.bosses['sci2:1']={won:true,best:9}; __fd.save.state.bosses['sci2:2']={won:false,best:5}; __fd.save.commit(); });
 d=await dawn(p); check('5 lord already fought stays free', /Bone Breaker/.test(d.btn), d.btn);
 // 6 Unlock all skips it
 await master(p,3); await p.evaluate(()=>{ __fd.save.state.bosses['sci2:2'].won=true; }); d=await dawn(p); const gated=/Read for/.test(d.btn); await p.evaluate(()=>{ __fd.save.state.unlockAll=true; }); const d2=await dawn(p);
 check('6 land 3 gated, Open every day skips it', gated && /Cramp/.test(d2.btn), d.btn+' -> '+d2.btn);
 await p.context().close();

 // 7 maths has no towers: the lord comes straight after the days
 p=await page(''); await master(p,1); d=await dawn(p); check('7 maths lord unchanged', !/for the battle/.test(d.btn), d.btn);
 await p.context().close();
 log('ERRORS', errs.length?errs.join('\n'):'none'); await b.close(); srv.close(); process.exit(fails||errs.length?1:0); })().catch(e=>{ console.log('FAIL', e.message.split('\n').slice(0,4).join(' ')); process.exit(1); });
