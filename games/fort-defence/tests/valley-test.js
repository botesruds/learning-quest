// Oliver's Valley play-test (js/valley.js): the valley is worked out from mastery only and never changes progress.
// 1. A new practice save: the Valley button, the name box (skip), an empty camp with a signpost in each quarter.
// 2. Some progress (9 maths days, the Letter Guardian, 3 science days, a Library floor, one repair): the dawn says the
//    valley grew, the new buildings appear, the era is Village, the repair day has scaffolding, tapping a building
//    and a signpost shows the right card, progress is unchanged, the fort's stage pauses and comes back.
// 3. Everything mastered: Great City, 55 of 55. 4. Reload: nothing new at dawn. 5. ?valley opens it straight away.
// Add `ipad` for iPad size; SHOTS=dir/ saves screenshots.
const path=require('path');
const {chromium}=require('playwright');const {serve}=require('./mock');
const ARGS={args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']};
const IPAD=process.argv.includes('ipad'), SHOTS=process.env.SHOTS||'', GFX=process.argv.includes('gfx')?'':'&lowgfx';
const log=(...a)=>console.log(...a); let fails=0; const check=(ok,msg)=>{ log((ok?'  ok   ':'  FAIL ')+msg); if(!ok) fails++; };
(async()=>{ const srv=await serve(path.resolve(__dirname,'../../..'),8853); const b=await chromium.launch(ARGS); const errs=[];
 const ctx=await b.newContext(IPAD?{viewport:{width:820,height:1180},hasTouch:true,isMobile:true,deviceScaleFactor:1}:{viewport:{width:1280,height:800}});
 const p=await ctx.newPage(); p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
 const shot=async n=>{ if(SHOTS){ await p.waitForTimeout(1500); await p.screenshot({path:SHOTS+n+'.png'}); } };
 const go=async(q='')=>{ await p.goto('http://localhost:8853/games/fort-defence/?practice'+GFX+q); await p.waitForSelector(q.includes('valley')?'.vbar':'.logo',{timeout:30000}); };
 await go(); await p.evaluate(()=>{ __fd.save.resetPractice(); }); await go();
 await p.evaluate(()=>document.querySelector('.btn.pulse').click()); await p.waitForSelector('.dawn .go-day');
 log('1. new save');
 check(await p.locator('.dawn .valleybtn').count()===1,'dawn has a Valley button');
 check(await p.locator('.dawn .vgrew').count()===0,'no "valley grew" line before anything is mastered');
 await p.evaluate(()=>document.querySelector('.dawn .valleybtn').click()); await p.waitForSelector('.vnamebox');
 check(await p.evaluate(()=>__fd.stage.paused),'the fort stage pauses while the valley is open');
 const nm=await p.inputValue('.vnamebox input'); check(nm==='My Valley','name box suggests "'+nm+'"');
 await p.fill('.vnamebox input','Oakhollow'); await p.click('.vnamebox .btn:not(.plain)');
 await p.waitForSelector('.vcaption'); await shot('valley-camp');
 let st=await p.evaluate(()=>({ name:__fd.save.state.valley.name, bar:document.querySelector('.vbar').textContent, title:document.querySelector('.vtitle').textContent, signs:__fd.valley.pickables.filter(o=>o.userData.item&&o.userData.item.next).length }));
 check(st.name==='Oakhollow'&&/Oakhollow/.test(st.title),'name saved and shown: '+st.title);
 check(/Era 1 of 5: Camp/.test(st.bar)&&/0 of 55/.test(st.bar),'bar: '+st.bar.replace(/\s+/g,' '));
 check(st.signs===4,'a signpost in each of the 4 quarters ('+st.signs+')');
 // tap the maths signpost: Day 1 is open, so it offers to play it
 const sign=await p.evaluate(()=>{ const o=__fd.valley.pickables.find(o=>o.userData.item&&o.userData.item.next&&o.userData.item.q.id==='algebra-u3'); __fd.valley.showInfo(o); return document.querySelector('.vinfo').textContent; });
 check(/Coming up in Builders' Yard/.test(sign)&&/Play this day/.test(sign),'maths signpost: '+sign.slice(0,80));
 await p.click('.vbar ~ .vinfo .vx, .vinfo .vx'); await p.click('.hud .chip.icon'); await p.waitForSelector('.dawn .go-day');
 check(!(await p.evaluate(()=>__fd.stage.paused)),'back at dawn, the fort stage runs again');

 log('2. some progress');
 const before=await p.evaluate(()=>{ const S=__fd.save.state; for(let i=1;i<=9;i++){ S.lv[String(i)]={stars:3,train:true}; S.learnDone[String(i)]=true; }
   S.bosses['1']={won:true,best:8}; for(let i=1;i<=3;i++){ S.lv['sci2:'+i]={stars:3,train:true}; S.learnDone['sci2:'+i]=true; }
   S.lv['10']={stars:1,train:false}; S.lib=S.lib||{fl:{},rd:{}}; S.lib.fl.predict={stars:3,lesson:true}; S.repair['3']=true; __fd.save.commit(); __fd.dawnScreen();
   return JSON.stringify({lv:S.lv,b:S.bosses,r:S.repair,g:S.gold,m:S.mats,lib:S.lib}); });
 const grew=await p.locator('.dawn .vgrew').textContent().catch(()=>''); check(/14 new buildings/.test(grew),'dawn: '+grew);
 check(await p.locator('.dawn .valleybtn .dot').count()===1,'Valley button has a dot');
 await p.evaluate(()=>document.querySelector('.dawn .vgrew .btn').click()); await p.waitForSelector('.vbar');
 await p.waitForSelector('.vcaption'); const cap=await p.locator('.vcaption').textContent(); check(/Your valley grew!|grew into a Village/.test(cap),'caption: '+cap);
 await shot('valley-village');
 st=await p.evaluate(()=>{ const m=__fd.valley.model(); const built=__fd.valley.pickables.filter(o=>o.userData.item&&o.userData.item.done);
   const rep=built.find(o=>o.userData.item.key==='3'); return { era:m.era, done:m.done, built:built.length, scaff:rep?rep.children.length:0, bar:document.querySelector('.vbar').textContent }; });
 check(st.era===1&&st.done===14&&st.built===14,'Village, 14 mastered, 14 buildings ('+st.era+','+st.done+','+st.built+')');
 check(/Era 2 of 5: Village/.test(st.bar)&&/2 more to master for the Town/.test(st.bar),'bar: '+st.bar.replace(/\s+/g,' '));
 const card=await p.evaluate(()=>{ const o=__fd.valley.pickables.find(o=>o.userData.item&&o.userData.item.key==='3'); __fd.valley.showInfo(o); return document.querySelector('.vinfo').textContent; });
 check(/Maths · Day 3/.test(card)&&/⭐⭐⭐/.test(card)&&/scaffolding/.test(card),'repair day card: '+card.slice(0,90));
 const lordCard=await p.evaluate(()=>{ const o=__fd.valley.pickables.find(o=>o.userData.item&&o.userData.item.kind==='lord'); __fd.valley.showInfo(o); return document.querySelector('.vinfo').textContent; });
 check(/Letter Guardian/.test(lordCard),'lord tower card: '+lordCard.slice(0,70));
 const peek=await p.evaluate(()=>{ const o=__fd.valley.pickables.find(o=>o.userData.item&&o.userData.item.next&&o.userData.item.q.id==='science-u2'); __fd.valley.showInfo(o); return document.querySelector('.vinfo').textContent; });
 check(/Science · Day 4/.test(peek)&&/home page/.test(peek),'science signpost from the maths game: '+peek.slice(0,90));
 const libSign=await p.evaluate(()=>{ const o=__fd.valley.pickables.find(o=>o.userData.item&&o.userData.item.next&&o.userData.item.q.id==='library'); return o?o.userData.item.title:''; });
 check(libSign==='Clarify','Library signpost points at floor 2: '+libSign);
 // a real tap on the canvas picks something or closes the card without errors
 await p.mouse.click(IPAD?410:640, IPAD?560:400); await p.waitForTimeout(300);
 const after=await p.evaluate(()=>{ const S=__fd.save.state; return JSON.stringify({lv:S.lv,b:S.bosses,r:S.repair,g:S.gold,m:S.mats,lib:S.lib}); });
 check(before===after,'progress, gold and materials unchanged by the valley');
 await p.keyboard.press('Escape'); await p.keyboard.press('Escape'); await p.waitForSelector('.dawn .go-day');
 check(await p.locator('.dawn .vgrew').count()===0&&await p.locator('.dawn .valleybtn .dot').count()===0,'after the visit, nothing new at dawn');

 log('3. everything mastered');
 await p.evaluate(()=>{ const S=__fd.save.state; for(let i=1;i<=22;i++){ S.lv[String(i)]={stars:3,train:true}; S.learnDone[String(i)]=true; } for(let i=1;i<=13;i++){ S.lv['sci2:'+i]={stars:3,train:true}; S.learnDone['sci2:'+i]=true; }
   ['1','2','3','final','sci2:1','sci2:2','sci2:3','sci2:final'].forEach(k=>S.bosses[k]={won:true,best:9}); S.repair={};
   S.lib.fl={}; ['predict','clarify','question','evidence','summarise','infer'].forEach(k=>S.lib.fl[k]={stars:3,lesson:true}); S.wr=S.wr||{fl:{},rp:{},desk:[]}; ['bbs','think','command','pe','el','plan'].forEach(k=>S.wr.fl[k]={stars:3,lesson:true}); __fd.save.commit(); __fd.dawnScreen(); });
 await p.evaluate(()=>document.querySelector('.dawn .valleybtn').click()); await p.waitForSelector('.vbar'); await p.waitForTimeout(800);
 st=await p.evaluate(()=>({ m:__fd.valley.model(), bar:document.querySelector('.vbar').textContent, meshes:(()=>{ let n=0; __fd.valley.stage.scene.traverse(o=>{ if(o.isMesh) n++; }); return n; })() }));
 check(st.m.era===4&&st.m.done===55&&st.m.total===55,'Great City, 55 of 55');
 check(/Every era reached/.test(st.bar),'bar: '+st.bar.replace(/\s+/g,' ')); log('     meshes in the valley:', st.meshes);
 await p.waitForTimeout(4000); await shot('valley-great-city');
 await p.click('.hud .chip.icon'); await p.waitForSelector('.dawn .go-day');

 log('4. reload');
 await p.waitForTimeout(800); await go(); await p.evaluate(()=>document.querySelector('.btn.pulse').click()); await p.waitForSelector('.dawn .go-day');
 st=await p.evaluate(()=>({ v:__fd.save.state.valley, grew:document.querySelectorAll('.dawn .vgrew').length }));
 check(st.v&&st.v.name==='Oakhollow'&&st.v.seen.length===55&&st.v.era===4&&st.grew===0,'valley name, seen list and era kept; nothing new at dawn');

 log('5. ?valley (the home page card)');
 await go('&valley'); check(await p.locator('.vbar').count()===1,'opens straight into the valley');
 await p.click('.hud .chip.icon'); await p.waitForSelector('.dawn .go-day'); check(true,'back goes to the dawn screen');
 log('ERRORS', errs.length?errs.join('\n'):'none'); await b.close(); srv.close(); process.exit(fails||errs.length?1:0);
})().catch(e=>{ console.log('FAIL', e.message.split('\n').slice(0,4).join(' ')); process.exit(1); });
