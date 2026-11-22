// Armoury play-test (spaced review, report cards): on a practice save with maths Days 1-6 mastered,
// 1 the first load seeds review cards from his progress (a demon-lord repair -> bronze and forge, old "own on his own" -> steel, else iron)
//   and spreads the first reviews over 10 days;
// 2 with 6 cards due, dawn shows "Patrol first", the patrol asks "Which idea is this?" before sword cards, a miss shows the
//   rule card and comes back once at the end (the second chance never moves the card), right answers move cards up a metal;
// 3 a reload mid-patrol carries on where he was; after the patrol, dawn shows the day again;
// 4 Oliver's report: green / amber / red / grey lights, "You are here", "Practise now" only on red and amber rows,
//   never more than 2 red rows for him (the grown-up view shows all 3), "Practise now" runs the re-teach and that idea's cards;
// 5 the armoury lists every card with its metal; 6 a night's patrol runes take due review cards and record the answer;
// 7 the parent corner opens "What he knows"; the science report tab works.
const path=require('path');
const {chromium}=require('playwright');const {serve}=require('./mock');
const ARGS={args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']};
const log=(...a)=>console.log(...a); let fails=0; const ok=(c,m)=>{ if(!c){ fails++; log('   ✗ '+m); } else log('   ✓ '+m); };
const SHOTS=process.env.SHOTS||'';
(async()=>{ const srv=await serve(path.resolve(__dirname,'../../..'),8863); const b=await chromium.launch(ARGS);
 const p=await (await b.newContext({viewport:{width:1280,height:800}})).newPage(); const errs=[];
 p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
 const url='http://localhost:8863/games/fort-defence/?practice&lowgfx';
 await p.goto(url); await p.waitForSelector('.logo',{timeout:30000});
 // a save with Days 1-6 mastered: Day 1 practised long ago and right on his own 3 times, Day 4 marked for repair
 await p.evaluate(()=>{ const S=__fd.save.state, old=Date.now()-20*864e5;
   for(let i=1;i<=6;i++){ const k=String(i); S.lv[k]={stars:3,train:true}; S.learnDone[k]=true; S.last[k]=i===1?old:Date.now()-864e5; S.hist[k]=[{r:'own',t:old},{r:'own',t:old},{r:'own',t:old}]; }
   S.hist['2'][2].r='help'; S.repair['4']=Date.now(); delete S.cardsV; delete S.cards; delete S.patrol; __fd.save.commit(); });
 await p.reload(); await p.waitForSelector('.logo'); await p.click('.btn.pulse'); await p.waitForSelector('.dawn .go-day');
 // 1 seeding
 const seed=await p.evaluate(()=>{ const C=__fd.save.state.cards, by={}; Object.entries(C).forEach(([id,c])=>{ const k=id.split('|')[0]; (by[k]=by[k]||[]).push(c.b); });
   const dues=[...new Set(Object.values(C).map(c=>c.due))].sort(); return { n:Object.keys(C).length, by, forge:Object.entries(C).filter(([id,c])=>c.forge).map(([id])=>id.split('|')[0]), dues:dues.length, first:dues[0], last:dues[dues.length-1], today:__fd.cards.today() }; });
 log('1 seeded', seed.n, 'cards:', JSON.stringify(seed.by), '| review days', seed.dues, seed.first, '→', seed.last);
 ok(seed.by['1'].every(b=>b===3),'Day 1 (old, own x3) starts at steel'); ok(seed.by['2'].every(b=>b===2),'Day 2 starts at iron'); ok(seed.by['4'].every(b=>b===1)&&seed.forge.every(k=>k==='4'),'Day 4 (repair) starts at bronze, marked for the forge');
 ok(seed.first===seed.today&&seed.dues>=5,'first reviews spread from today over the next days'); ok(!seed.by['7'],'Day 7 (not mastered) has no cards');
 // 2 make 6 cards due today (no understanding cards, to keep the answering simple; one from the forge)
 const ids=await p.evaluate(()=>{ const S=__fd.save.state, C=S.cards, t=__fd.cards.today(), want=['1|g0','2|why','3|g0','5|g0','6|why','4|why'].filter(id=>C[id]);
   Object.keys(C).forEach(id=>{ C[id].due=want.includes(id)?t:'2099-01-01'; }); delete S.patrol; __fd.save.commit(); __fd.dawnScreen(); return want; });
 const btn=await p.locator('.dawn .go-day').textContent(); log('2 dawn:', btn, '| skip link:', await p.locator('.skip-patrol').count());
 ok(/Patrol first: 6 cards/.test(btn),'dawn shows the patrol first');
 if(SHOTS) await p.screenshot({path:SHOTS+'patrol-dawn.png'});
 await p.click('.dawn .go-day'); await p.waitForSelector('.sheet .qprog');
 const order=await p.evaluate(()=>__fd.save.state.patrol.ids); ok(order.every((id,i)=>!i||id.split('|')[0]!==order[i-1].split('|')[0]),'no two cards from the same day side by side: '+order.join(' '));
 const answer=async(right)=>{ // answers whatever is on the sheet
   let Q=await p.evaluate(()=>window.__fdq);
   if(Q.type==='reteach'){ await p.evaluate(()=>[...document.querySelectorAll('.sheet .reteach button.btn.primary')].pop().click()); await p.waitForTimeout(150); Q=await p.evaluate(()=>window.__fdq); }
   if(Q.type==='pick'){ await p.evaluate(k=>document.querySelector(`.sheet .ideas button[data-k="${k}"]`).click(),Q.obj.ans); await p.evaluate(()=>[...document.querySelectorAll('.sheet button.btn.primary:not(.hide)')].pop().click()); await p.waitForTimeout(150); Q=await p.evaluate(()=>window.__fdq); }
   if(Q.type==='uq'){ const u=Q.obj; await p.evaluate(([u,right])=>{ const card=[...document.querySelectorAll('.sheet .uq')].pop(), bs=[...card.querySelectorAll('.opts button')];
     if(u.c){ const want=u.c[u.a]; if(right) bs.find(b=>b.innerHTML===want).click(); else bs.filter(b=>b.innerHTML!==want).slice(0,2).forEach(b=>b.click()); return; }
     if(!right) throw new Error('the test only misses choice questions');
     if(u.k==='mistake'){ card.querySelectorAll('.wline')[u.bad].click(); [...card.querySelectorAll('.opts button')].find(b=>b.innerHTML===u.fixes[u.fix]).click(); return; }
     const tiles=[...card.querySelectorAll('.eqtiles button')]; let s=u.ans.replace(/-/g,'−').replace(/\*/g,'×'); while(s.length){ const t=tiles.filter(b=>s.startsWith(b.textContent)).sort((a,b)=>b.textContent.length-a.textContent.length)[0]; if(!t) break; t.click(); s=s.slice(t.textContent.length); } [...card.querySelectorAll('button')].find(b=>b.textContent==='Check').click(); },[u,right]); }
   else { const spec=Q.obj.final.a; await p.evaluate(([spec,right])=>{ const root=document.querySelector('.sheet');
     if(spec.choice){ const t=x=>x.replace(/<[^>]+>/g,''), want=t(spec.choice[spec.ans]); const bs=[...root.querySelectorAll('.opts button')]; if(right) bs.find(b=>b.textContent===want).click(); else bs.filter(b=>b.textContent!==want).slice(0,2).forEach(b=>b.click()); return; }
     const inp=[...root.querySelectorAll('input.ans:not(:disabled)')].pop(); const v=right?('num' in spec?String(spec.num):spec.expr?spec.expr:spec.words[0]):'zzz9';
     for(let t=0;t<(right?1:2);t++){ inp.value=v; inp.dispatchEvent(new Event('input')); inp.parentElement.querySelector('button').click(); } },[spec,right]); }
   await p.waitForTimeout(200);
   return Q.type; };
 const next=async()=>{ await p.evaluate(()=>{ const b=[...document.querySelectorAll('.sheet button.btn.primary:not(.hide)')].filter(b=>/Next/.test(b.textContent)).pop(); b&&b.click(); }); await p.waitForTimeout(200); };
 const before=await p.evaluate(()=>JSON.stringify(Object.fromEntries(__fd.save.state.patrol.ids.map(id=>[id,__fd.save.state.cards[id].b]))));
 const seen=[]; let picks=0, reteach=0;
 for(let i=0;i<3;i++){ const wrong=i===1; const Q0=await p.evaluate(()=>window.__fdq); if(Q0.type==='reteach') reteach++; const t=await answer(!wrong); if(t==='pick'||Q0.type==='pick') picks++; seen.push((wrong?'✗':'✓')+t); await next();
   if(wrong){ const rt=await p.evaluate(()=>window.__fdq.type); ok(rt==='reteach','a miss shows the rule card'); if(SHOTS) await p.screenshot({path:SHOTS+'patrol-reteach.png'}); await p.evaluate(()=>[...document.querySelectorAll('.sheet .reteach button.btn.primary')].pop().click()); await p.waitForTimeout(150); } }
 // 3 reload mid-patrol
 const mid=await p.evaluate(()=>({i:__fd.save.state.patrol.i,again:__fd.save.state.patrol.again.slice()}));
 await p.reload(); await p.waitForSelector('.logo'); await p.click('.btn.pulse'); await p.waitForSelector('.dawn .go-day');
 const btn2=await p.locator('.dawn .go-day').textContent(); log('3 after reload at card', mid.i+1, '| dawn:', btn2); ok(/Patrol first: 4 cards/.test(btn2),'reload carries on (3 left + 1 second chance)');
 await p.click('.dawn .go-day'); await p.waitForSelector('.sheet .qprog');
 for(let i=0;i<4;i++){ const Q0=await p.evaluate(()=>window.__fdq.type); if(Q0==='reteach') reteach++; const t=await answer(true); seen.push('✓'+t+(i===3?'(2nd chance)':'')); await next(); }
 await p.waitForSelector('.sheet .celebrate h2'); const fin=await p.locator('.sheet .celebrate').textContent();
 const after=await p.evaluate(ids=>Object.fromEntries(ids.map(id=>[id,{b:__fd.save.state.cards[id].b,due:__fd.save.state.cards[id].due,miss:__fd.save.state.cards[id].miss}])),order);
 log('   answers:', seen.join(' '), '| boxes before', before, '\n   after', JSON.stringify(after));
 ok(/Patrol done/.test(fin),'patrol ends with a summary'); ok(reteach>=1,'the forge card started with its rule card');
 const missed=mid.again[0]; ok(missed && after[missed].b===Math.max(1,JSON.parse(before)[missed]-1),'the missed card dropped one box and the second chance did not move it ('+missed+')');
 const rightOnes=order.filter(id=>id!==missed); ok(rightOnes.every(id=>after[id].b===Math.min(6,JSON.parse(before)[id]+1)),'every card right on his own moved up one metal');
 if(SHOTS) await p.screenshot({path:SHOTS+'patrol-done.png'});
 await p.evaluate(()=>[...document.querySelectorAll('.sheet .bigbtn')].pop().click()); await p.waitForSelector('.dawn .go-day');
 const btn3=await p.locator('.dawn .go-day').textContent(); ok(/Day 7|Repair/.test(btn3)&&!/Patrol/.test(btn3),'after the patrol dawn moves on to the day (or its repair): '+btn3);
 // 4 the report: make Days 2, 3 and 4 struggling
 await p.evaluate(()=>{ const C=__fd.save.state.cards; ['2','3'].forEach(k=>Object.keys(C).filter(id=>id.startsWith(k+'|')).slice(0,1).forEach(id=>{ C[id].miss=2; C[id].b=1; })); Object.assign(__fd.prog.L('7'),{stars:1,train:true}); __fd.save.state.learnDone['7']=true; __fd.save.commit(); });
 await p.click('.rpbtn'); await p.waitForSelector('.sheet .rp-row');
 const kid=await p.evaluate(()=>({ L:window.__fdr.lights, here:document.querySelector('.rp-row.here .rp-can').textContent, go:[...document.querySelectorAll('.rp-row')].filter(r=>r.querySelector('.rp-go')).map(r=>r.className), fb:[...document.querySelectorAll('.rp-fb')].map(x=>x.textContent) }));
 log('4 Oliver sees:', JSON.stringify(kid.L), '|', kid.fb.join(' | '));
 const reds=Object.values(kid.L).filter(x=>x==='red').length; ok(reds===2,'only 2 red rows for Oliver (3 ideas struggle)'); ok(kid.L['1']==='green'&&kid.L['7']==='amber'&&kid.L['8']==='grey','green mastered, amber started, grey ahead');
 ok(/You are here/.test(kid.here)&&/I can expand a bracket/.test(kid.here)===false,'You are here on Day 7: '+kid.here.trim()); ok(kid.go.every(c=>/l-red|l-amber/.test(c)),'Practise now only on red and amber rows');
 if(SHOTS) await p.screenshot({path:SHOTS+'report-kid.png',fullPage:true});
 // Practise now on a red row
 await p.evaluate(()=>[...document.querySelectorAll('.rp-row.l-red .rp-go')][0].click()); await p.waitForSelector('.sheet .reteach'); const rv=await p.locator('.sheet .reteach h2').textContent();
 await p.evaluate(()=>[...document.querySelectorAll('.sheet .reteach button.btn.primary')][0].click()); await p.waitForSelector('.sheet .qprog');
 let n=0; while(!(await p.locator('.sheet .celebrate h2').count()) && n<8){ const Q0=await p.evaluate(()=>window.__fdq.type); if(Q0==='reteach'){ await p.evaluate(()=>[...document.querySelectorAll('.sheet .reteach button.btn.primary')].pop().click()); await p.waitForTimeout(150); continue; } await answer(true); await next(); n++; }
 const pd=await p.locator('.sheet .celebrate h2').textContent(); log('   practise now:', rv, '→', n, 'questions →', pd); ok(/Practice done/.test(pd),'Practise now runs that idea\'s cards');
 await p.evaluate(()=>[...document.querySelectorAll('.sheet .bigbtn')].pop().click()); await p.waitForSelector('.sheet .rp-row'); ok(true,'back to the report');
 // 5 armoury
 await p.evaluate(()=>[...document.querySelectorAll('.sheet .rp button.btn')].find(b=>/armoury/.test(b.textContent)).click()); await p.waitForSelector('.sheet .weapon');
 const w=await p.evaluate(()=>({n:document.querySelectorAll('.sheet .weapon').length, dent:document.querySelectorAll('.sheet .weapon.dent').length, first:document.querySelector('.sheet .weapon').textContent}));
 log('5 armoury:', w.n, 'weapons,', w.dent, 'dented | e.g.', w.first); ok(w.n===seed.n,'every card hangs in the armoury');
 if(SHOTS) await p.screenshot({path:SHOTS+'armoury.png',fullPage:true});
 // 6 night patrol runes take due review cards
 const nt=await p.evaluate(()=>{ const C=__fd.save.state.cards, t=__fd.cards.today(); Object.keys(C).forEach(id=>C[id].due='2099-01-01'); C['5|g0'].due=t; C['3|g0'].due=t; __fd.save.commit();
   __fd.night.start('7'); const R=__fd.night.state.runes.filter(r=>r.patrol).map(r=>r.card||'-'); __fd.night.stop(true); return R; });
 log('6 night patrol runes:', nt.join(', ')); ok(nt.includes('5|g0')&&nt.includes('3|g0'),'both due cards became patrol runes');
 // 7 parent corner → What he knows
 await p.evaluate(()=>{ __fd.day.close('nav'); __fd.day.openParent(); }); await p.waitForSelector('.pc-know button');
 await p.click('.pc-know button'); await p.waitForSelector('.sheet .rp.grown');
 const g=await p.evaluate(()=>({ L:window.__fdr.lights, cards:[...document.querySelectorAll('.rp.grown .card b')].map(b=>b.textContent), stuck:document.querySelectorAll('.rp.grown li').length }));
 log('7 grown-up view:', JSON.stringify(g.L), g.cards.join(' · '), '| red:', Object.values(g.L).filter(x=>x==='red').length, '| list items', g.stuck);
 const trueReds=await p.evaluate(()=>Object.keys(__fd.save.state.lv).filter(k=>__fd.cards.idea(k).s==='struggling').sort().join()); ok(Object.keys(g.L).filter(k=>g.L[k]==='red').sort().join()===trueReds&&g.L['4']==='red','grown-ups see every struggling idea, including Day 4 that Oliver sees as amber ('+trueReds+')'); ok(g.cards.some(t=>/Covered: 6 of 22/.test(t)),'statements covered');
 if(SHOTS) await p.screenshot({path:SHOTS+'report-grown.png',fullPage:true});
 await p.evaluate(()=>[...document.querySelectorAll('.rp-subj button')].find(b=>b.textContent==='Science').click()); await p.waitForSelector('.sheet .rp-row');
 const sci=await p.evaluate(()=>({id:window.__fdr.pack,rows:document.querySelectorAll('.rp-row').length,first:document.querySelector('.rp-row .rp-can').textContent}));
 log('   science tab:', sci.id, sci.rows, 'rows |', sci.first); ok(sci.id==='science-u2'&&/I can/.test(sci.first),'science report with its statements');
 log('ERRORS', errs.length?errs.join('\n'):'none'); log(fails?`${fails} CHECK(S) FAILED`:'ALL CHECKS PASSED'); await b.close(); srv.close(); process.exit(fails||errs.length?1:0); })().catch(e=>{ console.log('FAIL', e.message.split('\n').slice(0,4).join(' ')); process.exit(1); });
