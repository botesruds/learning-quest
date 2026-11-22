// Library tower play-test (?subject=science): the dawn button, floor 1's lesson, Challenge (with one miss) and check,
// a dispatch with every question type (predict, clarify with a miss and clue, tap-a-sentence with a miss, order),
// the mixed check with "which strategy?" on floor 2, glossary words, locks, and that reading never changes a science day's stars.
// Practice save, fake database. `node tests/library-test.js ipad` runs at iPad size; SHOTS=/dir/ saves screenshots.
const path=require('path');
const {chromium,devices}=require('playwright');const {serve}=require('./mock');
const ARGS={args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']};
const log=(...a)=>console.log(...a); const SHOTS=process.env.SHOTS||'';
(async()=>{ const srv=await serve(path.resolve(__dirname,'../../..'),8849); const b=await chromium.launch(ARGS);
 const ipad=process.argv[2]==='ipad';
 const ctx=await b.newContext(ipad?{...devices['iPad (gen 7)']}:{viewport:{width:1280,height:800}}); const p=await ctx.newPage(); const errs=[];
 p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
 const q=()=>p.evaluate(()=>window.__fdq);
 const shot=async n=>{ if(SHOTS){ await p.waitForTimeout(500); await p.screenshot({path:SHOTS+'lib-'+n+'.png'}); } };
 const clickJS=sel=>p.evaluate(s=>{ const el=[...document.querySelectorAll(s)].pop(); el.click(); },sel);
 const nextBtn=()=>p.evaluate(()=>{ const b=[...document.querySelectorAll('.sheet .readq button.btn.primary:not(.hide)')].pop(); b.click(); });
 // answer the reading question on screen; wrong=true gives one wrong answer first (and checks the clue/hint)
 const answer=async(wrong)=>{ let t=await q();
   if(t.type==='pick'){ await p.evaluate(k=>[...document.querySelectorAll('.sheet .readq .opts button')].find(b=>b.dataset.k===k).click(),t.obj.ans); await p.waitForFunction(()=>window.__fdq.type==='read',null,{timeout:5000,polling:100}); t=await q(); }
   const Q=t.obj, sp=Q.spec; let note='';
   if(sp.evidence){ if(wrong){ const bad=[...Array(10).keys()].find(i=>!sp.evidence.includes(i)); await p.evaluate(i=>document.querySelectorAll('.sheet .readq .sent')[i].click(),bad); note=await p.locator('.sheet .readq .verdict.bad').last().textContent(); }
     await p.evaluate(i=>document.querySelectorAll('.sheet .readq .sent')[i].click(),sp.evidence[0]); }
   else if(sp.choice){ const want=sp.choice[sp.ans].replace(/<[^>]+>/g,'');
     if(wrong){ await p.evaluate(w=>[...document.querySelectorAll('.sheet .readq .opts button')].find(b=>b.textContent!==w&&!b.disabled).click(),want); note=(await p.locator('.sheet .readq .verdict.bad').last().textContent())+(await p.locator('.sheet .readq .sent.clue').count()?' [clue lit]':''); }
     await p.evaluate(w=>[...document.querySelectorAll('.sheet .readq .opts button')].find(b=>b.textContent===w).click(),want); }
   else if(sp.order){ for(const t2 of sp.order) await p.evaluate(t=>[...document.querySelectorAll('.sheet .readq .ordtray button')].find(b=>b.innerHTML===t&&!b.disabled).click(),t2);
     await p.evaluate(()=>[...document.querySelectorAll('.sheet .readq button.btn.primary')].filter(b=>b.textContent==='Check').pop().click()); }
   await p.waitForTimeout(250); return Q.s+(wrong?'✗':'')+(note?' ('+note.slice(0,60)+')':''); };

 await p.goto('http://localhost:8849/games/fort-defence/?practice&lowgfx&subject=science'); await p.waitForSelector('.logo',{timeout:30000});
 await p.click('.btn.pulse'); await p.waitForSelector('.dawn .go-day');
 log('1 dawn library button:', await p.locator('.libbtn').count(), '| dot:', await p.locator('.libbtn .dot').count());
 await clickJS('.libbtn'); await p.waitForSelector('.sheet .qregion');
 log('2 library opens. next:', (await p.locator('.sheet .bigbtn').first().textContent()), '| floors:', (await p.locator('.sheet .qregion').first().locator('.qtile .nm').allTextContents()).join(', '));
 log('   dispatches locked:', await p.locator('.sheet .qregion').nth(1).locator('.qtile.locked').count(), 'of', await p.locator('.sheet .qregion').nth(1).locator('.qtile').count()); await shot('home');
 // floor 1 lesson
 await clickJS('.sheet .bigbtn'); await p.waitForSelector('.sheet .chunk');
 for(let i=0;i<4;i++){ const tr=await p.locator('.sheet .chunk .opts').count(); if(tr){ // the right lesson answer is always choice 0 in the data; MiniQ keeps the order
     await p.evaluate(()=>document.querySelector('.sheet .chunk .opts button').click()); }
   await p.evaluate(()=>document.querySelector('.sheet .chunk .pager .btn.primary').click()); await p.waitForTimeout(150); }
 log('3 lesson done:', await p.locator('.sheet .celebrate h2').textContent(), '| stars', await p.evaluate(()=>window.__fd.library.fstars('predict')));
 // challenge: one miss, then 3 right
 await clickJS('.sheet .celebrate .bigbtn'); await p.waitForSelector('.sheet .readq'); await shot('predict');
 const ch=[]; ch.push(await answer(true)); await nextBtn(); await p.waitForTimeout(200);
 for(let i=0;i<3;i++){ ch.push(await answer(false)); await nextBtn(); await p.waitForTimeout(200); }
 log('4 challenge:', ch.join(' | '), '→', await p.locator('.sheet .celebrate h2').textContent(), '| stars', await p.evaluate(()=>window.__fd.library.fstars('predict')));
 await clickJS('.sheet .celebrate .bigbtn'); await p.waitForSelector('.sheet .readq'); const mx=[];
 for(let i=0;i<4;i++){ mx.push(await answer(false)); await nextBtn(); await p.waitForTimeout(200); }
 log('5 floor 1 check:', mx.join(' '), '→', await p.locator('.sheet .celebrate h2').textContent(), '|', await p.locator('.sheet .celebrate p').first().textContent(), '| stars', await p.evaluate(()=>window.__fd.library.fstars('predict')));
 // open science days 1-3 (lessons done), learn floors 2-4 via the save, then read Day 1 and Day 3 dispatches
 const before=await p.evaluate(()=>JSON.stringify(window.__fd.save.state.lv));
 await p.evaluate(()=>{ const S=window.__fd.save.state; ['sci2:1','sci2:2','sci2:3'].forEach(k=>S.learnDone[k]=true); S.lib.fl.clarify={stars:3,lesson:true}; S.lib.fl.question={stars:3,lesson:true}; S.lib.fl.evidence={stars:1,lesson:true}; window.__fd.save.commit(); window.__fd.library.open(); });
 await p.waitForTimeout(300); log('6 library next:', await p.locator('.sheet .bigbtn').first().textContent(), '| open dispatches:', await p.locator('.sheet .qregion').nth(1).locator('.qtile:not(.locked)').count(), '| toolkit cards:', await p.locator('.sheet .kitcard').count());
 await clickJS('.sheet .bigbtn'); await p.waitForSelector('.sheet .readq');
 log('   predict veils the text:', await p.locator('.sheet .readq .passage.veiled').count(), '| hidden sentences:', await p.locator('.sheet .readq .sent.hidden').count());
 const g=await p.locator('.sheet .readq .gword').count(); if(g){ await p.locator('.sheet .readq .gword').first().click(); log('   glossary:', await p.locator('.sheet .readq .gloss').textContent()); }
 const d1=[]; d1.push(await answer(false)); log('   after predicting, text shown:', await p.locator('.sheet .readq .sent.hidden').count()===0); await shot('dispatch-predicted'); await nextBtn(); await p.waitForTimeout(200);
 d1.push(await answer(true)); await nextBtn(); await p.waitForTimeout(200);
 d1.push(await answer(true)); await shot('evidence'); await nextBtn(); await p.waitForTimeout(200);
 d1.push(await answer(false)); await nextBtn(); await p.waitForTimeout(300);
 log('7 day 1 dispatch:', d1.join(' | '), '→', await p.locator('.sheet .celebrate h2').textContent());
 await clickJS('.sheet .celebrate .bigbtn'); await p.waitForSelector('.sheet .readq'); const d2=[];
 for(let i=0;i<4;i++){ d2.push(await answer(false)); await nextBtn(); await p.waitForTimeout(200); }
 log('8 day 2 dispatch:', d2.join(' '), '→', await p.locator('.sheet .celebrate h2').textContent());
 // floor 2 mixed check with the strategy pick (floors 1-2 learned)
 await p.evaluate(()=>{ const S=window.__fd.save.state; S.lib.fl.clarify={stars:2,lesson:true}; S.lib.fl.question={stars:0,lesson:false}; S.lib.fl.evidence={stars:0,lesson:false}; window.__fd.save.commit(); window.__fd.library.open(); });
 await p.waitForTimeout(200); log('9 next:', await p.locator('.sheet .bigbtn').first().textContent());
 await p.evaluate(()=>[...document.querySelectorAll('.sheet .qregion')][0].querySelectorAll('.qtile')[1].click()); await p.waitForTimeout(200);
 log('   floor 2 screen buttons:', (await p.locator('.sheet .bigbtn').allTextContents()).join(' / '));
 await p.evaluate(()=>[...document.querySelectorAll('.sheet .bigbtn')].find(b=>/Mixed/.test(b.textContent)).click()); await p.waitForSelector('.sheet .readq');
 log('   asks which strategy:', await p.locator('.sheet .readq .opts button[data-k]').count()); await shot('pick');
 const m2=[]; for(let i=0;i<4;i++){ m2.push(await answer(false)); await nextBtn(); await p.waitForTimeout(200); }
 log('   floor 2 check:', m2.join(' '), '→', await p.locator('.sheet .celebrate h2').textContent(), '| stars', await p.evaluate(()=>window.__fd.library.fstars('clarify')));
 // locks and side effects
 await p.evaluate(()=>window.__fd.library.open()); await p.waitForTimeout(200);
 await p.evaluate(()=>[...document.querySelectorAll('.sheet .qregion')][0].querySelectorAll('.qtile')[5].click()); await p.waitForTimeout(200);
 log('10 floor 6 locked toast:', await p.locator('.toast').textContent());
 log('   science stars unchanged by reading:', before===await p.evaluate(()=>JSON.stringify(window.__fd.save.state.lv)), '| reading answers saved:', await p.evaluate(()=>Object.keys(window.__fd.save.state.hist).filter(k=>k.startsWith('lib:')).join(',')));
 // maths has no library
 await p.goto('http://localhost:8849/games/fort-defence/?practice&lowgfx'); await p.waitForSelector('.logo'); await p.click('.btn.pulse'); await p.waitForSelector('.dawn .go-day');
 log('11 maths dawn library button:', await p.locator('.libbtn').count());
 log('ERRORS', errs.length?errs.join('\n'):'none'); await b.close(); srv.close(); })().catch(e=>{ console.log('FAIL', e.message.split('\n').slice(0,4).join(' ')); process.exit(1); });
