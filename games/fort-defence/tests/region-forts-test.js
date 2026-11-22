const {chromium,devices}=require('playwright');const {serve}=require('./mock');
const log=(...a)=>console.log(...a);
(async()=>{ const srv=await serve(require('path').resolve(__dirname,'../../..'),8849); const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 const p=await (await b.newContext(process.argv[2]==='ipad'?{...devices['iPad (gen 7) landscape']}:{viewport:{width:1280,height:800}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
 const st=()=>p.evaluate(()=>({region:__fd.fort.region, pieces:__fd.fort.count(), forts:Object.fromEntries(Object.entries(__fd.save.state.forts).map(([k,v])=>[k,(v.pieces||[]).length])), cur:__fd.prog.currentNode().region.name}));
 await p.goto('http://localhost:8849/games/fort-defence/?practice&lowgfx'); await p.waitForSelector('.logo');
 await p.click('.btn.pulse'); await p.waitForSelector('.dawn .go-day'); await p.evaluate(()=>__fd.demoFort());
 log('1 start', JSON.stringify(await st()));
 // beat Letter Land
 await p.evaluate(()=>{ const S=__fd.save.state; for(let i=1;i<=8;i++){ S.lv[String(i)]={stars:3,train:true}; S.learnDone[String(i)]=true; } S.bosses['1']={won:true,best:9}; S.cardsV=1; __fd.save.commit(); __fd.dawnScreen(); });
 await p.waitForTimeout(1500); log('2 after the Guardian', JSON.stringify(await st()), '|', await p.locator('.dsub').textContent());
 await p.screenshot({path:require('path').join(require('os').tmpdir(),'region2-empty.png')});
 await p.evaluate(()=>{ __fd.fort.place('wall',3,3); __fd.fort.place('arrow',4,3); __fd.save.commit(); });
 await p.click('text=📜 Quest map'); await p.waitForSelector('.qtile'); log('3 visit buttons (want 1):', await p.locator('.qregion button',{hasText:'Visit this fort'}).count());
 await p.locator('.qregion button',{hasText:'Visit this fort'}).first().click(); await p.waitForSelector('.dawn .go-day'); await p.waitForTimeout(1200);
 log('4 visiting', JSON.stringify(await st()), '|', await p.locator('.dsub').textContent(), '|', await p.locator('.go-day').textContent());
 await p.click('text=🔨 Build here'); await p.waitForSelector('.tray .item'); await p.evaluate(()=>{ __fd.fort.place('torch',9,9); __fd.save.commit(); }); await p.click('[aria-label="Finish building"]'); await p.waitForSelector('.dawn .go-day');
 log('5 built in old fort', JSON.stringify(await st()));
 await p.click('.go-day'); await p.waitForTimeout(1200); log('6 home', JSON.stringify(await st()), '|', await p.locator('.go-day').textContent());
 // styles of every region, with a demo castle in each
 for(const n of [2,3,4,5]){ await p.evaluate(n=>{ __fd.showRegion(n); __fd.fort.load(); if(__fd.fort.count()<5) __fd.demoFort(); __fd.stage.flyTo({yaw:0.9,pitch:0.62,dist:30,target:new __fd.THREE.Vector3(0,2,0)},0.1); },n); await p.waitForTimeout(2500); await p.screenshot({path:require('path').join(require('os').tmpdir(),`region-style${n}.png`)}); }
 await p.evaluate(()=>__fd.showRegion(2));
 const before=JSON.stringify(await st()); await p.reload(); await p.waitForSelector('.logo'); await p.waitForTimeout(500); log('7 reload', before===JSON.stringify(await st()), JSON.stringify(await st()));
 log('ERRORS', errs.length?errs.join('\n'):'none'); await b.close(); srv.close(); })().catch(e=>{ console.log('FAIL',e.message.split('\n').slice(0,6).join(' ')); process.exit(1); });
