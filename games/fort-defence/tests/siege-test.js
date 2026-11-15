const path=require('path');
const {chromium,devices}=require('playwright');const {serve}=require('./mock');
const ARGS={args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']};
const log=(...a)=>console.log(...a);
(async()=>{ const srv=await serve(path.resolve(__dirname,'../../..'),8845); const b=await chromium.launch(ARGS);
 const ctx=await b.newContext(process.argv[2]==='ipad'?{...devices['iPad (gen 7) landscape']}:{viewport:{width:1280,height:800}}); const p=await ctx.newPage(); const errs=[];
 p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); }); p.on('response',r=>{ if(r.status()>=400) errs.push('HTTP '+r.status()+' '+r.url()); });
 const wf=(fn,arg,t=30000)=>p.waitForFunction(fn,arg,{timeout:t}).then(()=>true).catch(()=>false);
 const val=spec=>'num' in spec? String(spec.num) : 'expr' in spec? spec.expr : spec.words? spec.words[0] : null;
 const answerRune=async(wrong)=>{ const Q=await p.evaluate(()=>window.__fdq);
   if(Q.type==='brain'){ const i= wrong? (Q.obj.a+1)%Q.obj.c.length : Q.obj.a; await p.locator('.runecard .opts button').nth(i).click(); }
   else { const spec=Q.obj.final.a; if(spec.choice){ const want=spec.choice[spec.ans]; await p.evaluate(([want,wrong])=>{ const bs=[...document.querySelectorAll('.runecard .opts button')]; (wrong? bs.find(b=>b.textContent!==want): bs.find(b=>b.textContent===want)).click(); },[want,wrong]); }
     else await p.evaluate(v=>{ const inp=[...document.querySelectorAll('.runecard input.ans:not(:disabled)')].pop(); inp.value=v; inp.dispatchEvent(new Event('input')); inp.parentElement.querySelector('button').click(); }, wrong?'999':val(spec)); }
   await p.waitForTimeout(200); await p.locator('.runecard button.btn.primary:not(.hide)').last().click(); return Q.type[0]+(wrong?'✗':'✓'); };
 const siege=async(wrongAt, shots)=>{ await p.evaluate(()=>{ __fd.night.timeScale=12; }); await p.click('.go-day'); await wf(()=>__fd.night.running);
   const n=await p.evaluate(()=>__fd.night.state.runes.length); const seen=[];
   for(let r=0;r<n;r++){ if(!await wf(()=>document.querySelector('.runebtn.ready'),null,90000)){ seen.push('stuck'); break; }
     if(shots && r===1) await p.screenshot({path:shots+'-battle.png'});
     await p.click('.runebtn.ready'); await p.waitForSelector('.runecard'); if(shots && r===2){ await p.waitForTimeout(700); await p.screenshot({path:shots+'-rune.png'}); }
     seen.push(await answerRune(wrongAt.includes(r))); }
   await wf(()=>document.querySelector('.sheet .celebrate h1'),null,120000); if(shots){ await p.waitForTimeout(800); await p.screenshot({path:shots+'-morning.png'}); }
   return seen.join(' ')+' | '+await p.locator('.sheet .celebrate h1').textContent(); };
 await p.goto('http://localhost:8845/games/fort-defence/?practice&lowgfx'); await p.waitForSelector('.logo',{timeout:30000});
 await p.evaluate(()=>{ const S=__fd.save.state; for(let i=1;i<=8;i++){ S.lv[String(i)]={stars:3,train:true}; S.learnDone[String(i)]=true; } S.chests['1']=true; __fd.save.commit(); });
 await p.click('.btn.pulse'); await p.waitForSelector('.dawn .go-day'); await p.evaluate(()=>__fd.demoFort());
 log('1 dawn:', await p.locator('.go-day').textContent(), '|', await p.locator('.dsub').textContent());
 // lose: 3 misses
 log('2 siege (3 wrong):', await siege([0,2,5],'st7-guardian'));
 log('   repairs', await p.evaluate(()=>JSON.stringify(__fd.save.state.repair)), 'boss', await p.evaluate(()=>JSON.stringify(__fd.save.state.bosses)), 'cracks', await p.evaluate(()=>__fd.fort.crackList().length));
 await p.locator('.sheet .bigbtn',{hasText:'Start repairing'}).click(); await p.waitForSelector('.dawn .go-day');
 log('3 dawn:', await p.locator('.go-day').textContent(), '| fix-crack button:', await p.locator('.crackbtn').count());
 // do every repair: Challenge, 3 right
 for(let k=0;k<4;k++){ const t=await p.locator('.go-day').textContent(); if(!t.includes('Repair')) break;
   await p.click('.go-day'); await p.waitForSelector('.sheet .card');
   for(let n=0;n<3;n++){ const Q=(await p.evaluate(()=>window.__fdq)).obj, spec=Q.final.a;
     if(spec.choice) await p.locator('.sheet .card .opts button').filter({hasText:spec.choice[spec.ans]}).first().click(); else await p.evaluate(v=>{ const inp=[...document.querySelectorAll('.sheet .card input.ans:not(:disabled)')].pop(); inp.value=v; inp.dispatchEvent(new Event('input')); inp.parentElement.querySelector('button').click(); },val(spec));
     await p.waitForTimeout(200); await p.locator('.sheet button.btn.primary:not(.hide)').last().click(); await p.waitForTimeout(200); }
   await p.locator('.sheet .bigbtn',{hasText:'Back to the fort'}).click(); await p.waitForSelector('.dawn .go-day'); }
 log('4 after repairs:', await p.locator('.go-day').textContent(), 'repairs', await p.evaluate(()=>JSON.stringify(__fd.save.state.repair)), 'cracks', await p.evaluate(()=>JSON.stringify(__fd.fort.crackList())));
 log('5 rematch (1 wrong):', await siege([4]));
 log('   bosses', await p.evaluate(()=>JSON.stringify(__fd.save.state.bosses)), 'badge w1', await p.evaluate(()=>!!__fd.save.state.badges.w1), 'gold', await p.evaluate(()=>__fd.save.state.gold), '|', (await p.locator('.sheet .celebrate p').allTextContents()).join(' / ').slice(0,200));
 await p.locator('.sheet .bigbtn',{hasText:'Carry on'}).click(); await p.waitForSelector('.dawn .go-day'); await p.waitForTimeout(1500);
 log('6 dawn after the lord:', await p.locator('.go-day').textContent(), '| look', await p.evaluate(()=>__fd.prog.currentNode().region.name)); await p.screenshot({path:'st7-region2.png'});
 // the Dragon
 await p.evaluate(()=>{ const S=__fd.save.state; for(let i=1;i<=22;i++){ S.lv[String(i)]={stars:3,train:true}; S.learnDone[String(i)]=true; } ['2','3'].forEach(k=>S.bosses[k]={won:true,best:9}); __fd.save.commit(); __fd.dawnScreen(); });
 await p.waitForTimeout(1500); log('7 dawn:', await p.locator('.go-day').textContent()); await p.screenshot({path:'st7-volcano.png'});
 log('8 dragon (2 wrong):', await siege([3,9],'st7-dragon'));
 log('   final', await p.evaluate(()=>JSON.stringify(__fd.save.state.bosses.final)), 'exams', await p.evaluate(()=>__fd.save.state.exams.length), 'badge', await p.evaluate(()=>!!__fd.save.state.badges.final));
 const before=await p.evaluate(()=>JSON.stringify([__fd.save.state.bosses,__fd.save.state.repair,__fd.fort.crackList()])); await p.reload(); await p.waitForSelector('.logo');
 log('9 reload identical:', before===await p.evaluate(()=>JSON.stringify([__fd.save.state.bosses,__fd.save.state.repair,__fd.fort.crackList()])));
 log('ERRORS', errs.length?errs.join('\n'):'none'); await b.close(); srv.close(); })().catch(e=>{ console.log('FAIL', e.message.split('\n').slice(0,4).join(' ')); process.exit(1); });
