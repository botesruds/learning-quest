// Scribe's Tower play-test (?subject=science): the dawn button, floor 1's lesson, Challenge (one miss), the writing task
// with instant checks and the coach (a stand-in: first "not yet", then "met" after the fix), floor 4 (Point must use the
// question's words), floor 6 (plan boxes, Explain needs a thinking word, the four checks), a royal report at each level,
// the coach being away (piece waits on the Writing desk), the parent corner's Writing desk giving a star, and that
// writing never changes a science day's stars. Practice save. `node tests/scribe-test.js ipad`; SHOTS=/dir/ saves screenshots.
const path=require('path');
const {chromium,devices}=require('playwright');const {serve}=require('./mock');
const ARGS={args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']};
const log=(...a)=>console.log(...a); const SHOTS=process.env.SHOTS||''; let fails=0;
const ok=(c,m)=>{ if(!c){ fails++; console.log('   ✗ FAIL:',m); } };
(async()=>{ const srv=await serve(path.resolve(__dirname,'../../..'),8851); const b=await chromium.launch(ARGS);
 const ipad=process.argv[2]==='ipad';
 const ctx=await b.newContext(ipad?{...devices['iPad (gen 7)']}:{viewport:{width:1280,height:800}}); const p=await ctx.newPage(); const errs=[];
 p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
 const shot=async n=>{ if(SHOTS){ await p.waitForTimeout(400); await p.screenshot({path:SHOTS+'scribe-'+n+'.png'}); } };
 const clickJS=sel=>p.evaluate(s=>{ const el=[...document.querySelectorAll(s)].pop(); el.click(); },sel);
 const btn=txt=>p.evaluate(t=>{ const el=[...document.querySelectorAll('.sheet button')].filter(b=>b.textContent.includes(t)&&!b.disabled&&!b.classList.contains('hide')).pop(); if(!el) throw new Error('no button '+t); el.click(); },txt);
 const st=k=>p.evaluate(k=>window.__fd.scribe.fstars(k),k);
 // the stand-in coach: records each task; marks "not yet" on the named lines until told otherwise
 await p.addInitScript(()=>{ window.__coachLog=[]; window.__coachFail=[]; window.__fdCoach=async task=>{ window.__coachLog.push(task);
   const names={bbs:['because','but','so'],stem:['Ending'],join:['Thinking word','Facts'],cmd:['Answer 1','Answer 2'],pe:['Point','Evidence','Facts'],el:['Explain','Link','Facts'],peel:['Point','Evidence','Explain','Link','Facts']}[task.kind];
   const fail=window.__coachFail.shift()||[]; return { lines:names.map(n=>({name:n,met:!fail.includes(n),note:fail.includes(n)?'needs a reason':''})), praise:'Great use of the fact card.', fix:fail.length?'Can you say why in your '+fail[0]+' part?':'' }; }; });
 // write every field of the writer on screen. texts: list of answers in order (a function gets the field index)
 const write=async(texts)=>{ for(let i=0;i<texts.length;i++){ await p.waitForSelector('.sheet .writer textarea'); await p.fill('.sheet .writer textarea',texts[i]); await p.evaluate(()=>[...document.querySelectorAll('.sheet .writer .pager .btn.primary')].pop().click()); await p.waitForTimeout(120); } };
 const send=async()=>{ await p.evaluate(()=>document.querySelectorAll('.sheet .writer .pc-check input').forEach(c=>c.checked=true)); await btn('Send to the coach'); await p.waitForTimeout(400); };

 await p.goto('http://localhost:8851/games/fort-defence/?practice&lowgfx&subject=science'); await p.waitForSelector('.logo',{timeout:30000});
 await p.click('.btn.pulse'); await p.waitForSelector('.dawn .go-day');
 const sciBefore=await p.evaluate(()=>JSON.stringify(window.__fd.save.state.lv||{}));
 log('1 dawn scribe button:', await p.locator('.scribebtn').count(), '| dot:', await p.locator('.scribebtn .dot').count()); ok(await p.locator('.scribebtn').count()===1,'scribe button');
 await clickJS('.scribebtn'); await p.waitForSelector('.sheet .qregion');
 log('2 tower opens. next:', await p.locator('.sheet .bigbtn').first().textContent(), '| floors:', (await p.locator('.sheet .qregion').first().locator('.qtile .nm').allTextContents()).join(', '));
 log('   reports locked:', await p.locator('.sheet .qregion').nth(1).locator('.qtile.locked').count(), 'of', await p.locator('.sheet .qregion').nth(1).locator('.qtile').count()); await shot('home');
 // floor 1 lesson
 await clickJS('.sheet .bigbtn'); await p.waitForSelector('.sheet .chunk');
 for(let i=0;i<4;i++){ if(await p.locator('.sheet .chunk .opts').count()) await p.evaluate(()=>document.querySelector('.sheet .chunk .opts button').click()); await p.evaluate(()=>document.querySelector('.sheet .chunk .pager .btn.primary').click()); await p.waitForTimeout(120); }
 log('3 lesson done:', await p.locator('.sheet .celebrate h2').textContent(), '| stars', await st('bbs')); ok(await st('bbs')===1,'floor 1 star 1');
 // challenge: one miss, then 3 right
 await clickJS('.sheet .celebrate .bigbtn'); await p.waitForSelector('.sheet .qs'); await shot('practice');
 const answer=async wrong=>{ const t=await p.evaluate(()=>window.__fdw.obj); const sp=t.spec;
   if(sp.choice){ const want=sp.choice[sp.ans]; if(wrong) await p.evaluate(w=>[...document.querySelectorAll('.sheet .opts button')].find(b=>b.innerHTML!==w&&!b.disabled).click(),want);
     await p.evaluate(w=>[...document.querySelectorAll('.sheet .opts button')].find(b=>b.innerHTML===w).click(),want); }
   else { for(const o of sp.order) await p.evaluate(o=>[...document.querySelectorAll('.sheet .ordtray button')].find(b=>b.innerHTML===o&&!b.disabled).click(),o); await btn('Check'); }
   await p.waitForTimeout(150); await p.evaluate(()=>{ const b=[...document.querySelectorAll('.sheet .card.pop > button.btn.primary:not(.hide)')].pop(); b&&b.click(); }); await p.waitForTimeout(150); };
 await answer(true); for(let i=0;i<3;i++) await answer(false);
 log('4 challenge:', await p.locator('.sheet .celebrate h2').textContent(), '| stars', await st('bbs')); ok(await st('bbs')===2,'floor 1 star 2');
 // the writing task: an empty box is caught, then the coach says "not yet" on "but", then "met"
 await p.evaluate(()=>{ window.__coachFail.push(['but']); });
 await clickJS('.sheet .celebrate .bigbtn'); await p.waitForSelector('.sheet .writer textarea');
 log('5 writing task. question:', (await p.locator('.sheet .writer .wq .qs').first().textContent()).slice(0,70), '| fact card:', await p.locator('.sheet .writer .facts li').count(), 'facts');
 await p.evaluate(()=>[...document.querySelectorAll('.sheet .writer .pager .btn.primary')].pop().click()); await p.waitForTimeout(100);
 const hint1=await p.locator('.sheet .writer .verdict').textContent(); log('   empty box hint:', hint1); ok(/Write something/.test(hint1),'empty hint');
 await write(['they need to stay safe','something else','they work well']); await shot('bbs-review');
 log('   review shows', await p.locator('.sheet .wpiece .pk').count(), 'parts:', (await p.locator('.sheet .wpiece').textContent()).slice(0,90));
 await send(); log('   coach:', (await p.locator('.sheet .wmarks').textContent()).replace(/\s+/g,' '), '|', await p.locator('.sheet .verdict.mid').last().textContent());
 ok(await st('bbs')===2,'not yet keeps 2 stars'); await shot('coach-notyet');
 await btn('Fix it and send again'); await p.waitForSelector('.sheet .writer textarea'); log('   fix keeps his words:', await p.inputValue('.sheet .writer textarea'));
 await write(['they need to stay safe','a very big force can still cause harm','they are protected']); await send();
 log('6 after the fix:', await p.locator('.sheet h2').last().textContent(), '| stars', await st('bbs'), '| floor 2 open:', await p.evaluate(()=>!document.querySelector('.sheet .bigbtn')?false:true)); ok(await st('bbs')===3,'floor 1 mastered');
 log('   coach got:', await p.evaluate(()=>{ const t=window.__coachLog[1]; return t.kind+' | parts: '+Object.values(t.parts).join(' / ')+' | facts '+t.facts.length; }));
 // floor 4: Point and Evidence; a Point without the question's words is caught
 await p.evaluate(()=>{ const W=window.__fd.save.state.wr; ['think','command'].forEach(k=>W.fl[k]={stars:3,lesson:true}); W.fl.pe={stars:2,lesson:true}; window.__fd.save.commit(); });
 await p.evaluate(()=>import('/games/fort-defence/packs/writing/floors.js').then(m=>window.__fd.scribe.task(m.FLOOR.pe))); await p.waitForSelector('.sheet .writer textarea');
 const q4=await p.locator('.sheet .writer .wq .qs').first().textContent(); log('7 floor 4 task:', q4);
 await write(['I like it a lot']); const hint4=await p.locator('.sheet .writer .verdict').textContent(); log('   point hint:', hint4); ok(/key words/.test(hint4),'point hint');
 const pt=/root hair/i.test(q4)?'Root hair cells have a shape that helps them do their job of soaking up water.':'Plant cells stay firm because of their large vacuole.';
 await write([pt,'For example, they have a long thin part and a big surface.']); await send();
 log('   result:', await p.locator('.sheet h2').last().textContent(), '| stars', await st('pe')); ok(await st('pe')===3,'floor 4 mastered');
 // floor 6: plan boxes, then four parts; an Explain with no thinking word is caught; the four checks must be ticked
 await p.evaluate(()=>{ const W=window.__fd.save.state.wr; W.fl.el={stars:3,lesson:true}; W.fl.plan={stars:2,lesson:true}; window.__fd.save.commit(); });
 await p.evaluate(()=>import('/games/fort-defence/packs/writing/floors.js').then(m=>window.__fd.scribe.task(m.FLOOR.plan))); await p.waitForSelector('.sheet .wplan');
 log('8 floor 6: plan boxes', await p.locator('.sheet .wplan').count()); await btn('Now write it'); log('   empty plan:', await p.locator('.sheet .verdict.mid').textContent());
 for(const [i,t] of ['energy','respiration, muscle cells','busy cells need more','no energy without them'].entries()) await p.locator('.sheet .wplan').nth(i).fill(t);
 await shot('plan'); await btn('Now write it'); await p.waitForSelector('.sheet .writer textarea');
 const q6=await p.locator('.sheet .writer .wq .qs').first().textContent(); const mito=/mitochondria/i.test(q6);
 await write([mito?'Mitochondria are important because they release energy for cells.':'Muscles and bones work together to make movement because muscles pull on bones.', mito?'They release energy in respiration, and muscle cells have lots of them.':'For example, the biceps contracts and pulls on the bone it is joined to.', 'Muscle cells are busy cells.']);
 const hint6=await p.locator('.sheet .writer .verdict').textContent(); log('   explain hint:', hint6); ok(/thinking word/.test(hint6),'explain hint');
 await p.locator('.sheet .writer .wstarts button').first().click(); log('   starter tapped:', await p.inputValue('.sheet .writer textarea'));
 await write(['This shows that busy cells need more energy, so they have more of them.', mito?'Therefore, mitochondria are important because cells need energy to work.':'Therefore, movement needs muscles and bones working together.']);
 log('   checks to tick:', await p.locator('.sheet .writer .pc-check').count()); await btn('Send to the coach'); log('   unticked:', await p.locator('.sheet .writer .verdict.mid').textContent()); await shot('peel-review');
 await send(); log('   result:', await p.locator('.sheet h2').last().textContent(), '| stars', await st('plan'), '| model shown:', await p.locator('.sheet details summary').filter({hasText:'Compare'}).count()); ok(await st('plan')===3,'floor 6 mastered');
 // royal reports: Day 1 at full PEEL (with plan), then Day 2 with the coach away → waits on the desk
 await p.evaluate(()=>{ const S=window.__fd.save.state; ['sci2:1','sci2:2'].forEach(k=>S.learnDone[k]=true); window.__fd.save.commit(); window.__fd.scribe.open(); });
 await p.waitForTimeout(300); log('9 tower next:', await p.locator('.sheet .bigbtn').first().textContent(), '| report level:', await p.evaluate(()=>window.__fd.scribe.reportLevel()), '| open reports:', await p.locator('.sheet .qregion').nth(1).locator('.qtile:not(.locked)').count());
 await clickJS('.sheet .bigbtn'); await p.waitForSelector('.sheet .wplan'); log('   King asks:', await p.locator('.sheet .writer .wq .qs').first().textContent());
 for(let i=0;i<4;i++) await p.locator('.sheet .wplan').nth(i).fill('note '+i); await btn('Now write it');
 await write(['A red blood cell has a shape that helps it carry oxygen.','It is a small disc with no nucleus.','This means there is more room for oxygen, so it carries more.','Therefore, a red blood cell shape helps it do its job.']); await send();
 log('   report:', await p.locator('.sheet h2').last().textContent()); ok(await p.evaluate(()=>window.__fd.save.state.wr.rp['sci2:1'].done),'report 1 done');
 await p.evaluate(()=>{ window.__fdCoach=null; }); await btn('Next report'); await p.waitForSelector('.sheet .wplan');
 for(let i=0;i<4;i++) await p.locator('.sheet .wplan').nth(i).fill('note '+i); await btn('Now write it');
 await write(['The nucleus controls the cell because it holds the instructions.','The instructions are called DNA.','This means the cell follows the instructions in the nucleus.','Therefore, the nucleus controls the cell.']); await send();
 log('10 coach away:', await p.locator('.sheet .verdict.mid').last().textContent()); ok(!(await p.evaluate(()=>(window.__fd.save.state.wr.rp['sci2:2']||{}).done)),'away report not done'); await shot('away');
 // parent corner: the Writing desk, give the star
 await p.evaluate(()=>window.__fd.day.openParent()); await p.waitForSelector('.sheet .wdesk');
 log('11 parent corner: writing section', await p.locator('.sheet h3', {hasText:'Scribe'}).count(), '| desk pieces', await p.locator('.sheet .wdesk').count(), '| first:', await p.locator('.sheet .wdesk summary').first().textContent());
 await p.locator('.sheet .wdesk').first().locator('summary').click(); await shot('desk');
 await p.locator('.sheet .wdesk').first().getByText('Give the star').click(); await p.waitForTimeout(200);
 log('   after Give the star:', await p.locator('.sheet .wdesk summary').first().textContent(), '| report 2 done:', await p.evaluate(()=>window.__fd.save.state.wr.rp['sci2:2'].done)); ok(await p.evaluate(()=>window.__fd.save.state.wr.rp['sci2:2'].done),'parent star');
 // reload keeps it; science stars untouched
 await p.reload(); await p.waitForSelector('.logo',{timeout:30000}); await p.click('.btn.pulse'); await p.waitForSelector('.dawn .go-day');
 log('12 after reload: floor stars', await p.evaluate(()=>JSON.stringify(Object.fromEntries(Object.entries(window.__fd.save.state.wr.fl).map(([k,v])=>[k,v.stars])))), '| desk', await p.evaluate(()=>window.__fd.save.state.wr.desk.length));
 const sciAfter=await p.evaluate(()=>JSON.stringify(window.__fd.save.state.lv||{})); log('   science stars unchanged:', sciBefore===sciAfter); ok(sciBefore===sciAfter,'science untouched');
 log(errs.length?'ERRORS:\n'+errs.join('\n'):'no page errors'); if(errs.length) fails++;
 log(fails?`${fails} FAILED`:'ALL PASSED'); await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
