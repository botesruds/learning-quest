// Interleaving play-test (science track): a night on Day 10 after Days 1-9 are mastered has 2 patrol runes from earlier days
// (one of them the easily confused Day 7, tendons vs ligaments), never first and never side by side, each with
// "Which idea is this?" first (a wrong pick shows the day, a right pick earns a crystal); patrol misses crack a wall for
// that earlier day; the third star still needs 3 of today's 4 Brain checks. Then the Bone Breaker's questions: shuffled,
// never the same day twice in a row, 2 from Cell City, and its why-questions are not always 3rd and 7th.
const path=require('path');
const {chromium}=require('playwright');const {serve}=require('./mock');
const ARGS={args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']};
const log=(...a)=>console.log(...a);
(async()=>{ const srv=await serve(path.resolve(__dirname,'../../..'),8850); const b=await chromium.launch(ARGS);
 const p=await (await b.newContext({viewport:{width:1280,height:800}})).newPage(); const errs=[];
 p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
 await p.goto('http://localhost:8850/games/fort-defence/?practice&lowgfx&subject=science'); await p.waitForSelector('.logo',{timeout:30000});
 await p.click('.btn.pulse'); await p.waitForSelector('.dawn .go-day');
 // the rune lists, built many times (no battle needed)
 const shape=await p.evaluate(()=>{ const S=__fd.save.state; for(let i=1;i<=12;i++){ S.lv['sci2:'+i]={stars:i<10?3:2,train:true}; S.learnDone['sci2:'+i]=true; } ['sci2:1','sci2:2'].forEach(k=>S.bosses[k]={won:true,best:9}); __fd.save.commit();
   const out={nights:0,patrolFirst:0,patrolAdjacent:0,hasDay7:0,patrolDays:{},brainCount:new Set(),lords:0,lordRepeat:0,lordOld:0,lordBrainPos:{}};
   for(let n=0;n<40;n++){ __fd.night.start('sci2:10'); const R=__fd.night.state.runes; __fd.night.stop(true); out.nights++;
     const pi=R.map((r,i)=>r.patrol?i:-1).filter(i=>i>=0); if(pi[0]===0) out.patrolFirst++; if(pi.length===2&&pi[1]-pi[0]===1) out.patrolAdjacent++;
     R.filter(r=>r.patrol).forEach(r=>out.patrolDays[r.key]=(out.patrolDays[r.key]||0)+1); if(R.some(r=>r.patrol&&r.key==='sci2:7')) out.hasDay7++; out.brainCount.add(R.filter(r=>r.type==='brain').length+'/'+R.length); }
   const node=__fd.prog.road.find(n=>n.t==='lord'&&n.region.n===3);
   for(let n=0;n<30;n++){ __fd.night.startSiege(node); const R=__fd.night.state.runes; __fd.night.stop(true); out.lords++;
     const q=R.filter(r=>r.type==='quick').map(r=>r.key); if(q.some((k,i)=>i&&k===q[i-1])) out.lordRepeat++; out.lordOld+=q.filter(k=>['sci2:1','sci2:2','sci2:3','sci2:4','sci2:5','sci2:6','sci2:7','sci2:8','sci2:9'].includes(k)).length;
     const bp=R.map((r,i)=>r.type==='brain'?i+1:0).filter(Boolean).join('+'); out.lordBrainPos[bp]=(out.lordBrainPos[bp]||0)+1; }
   out.brainCount=[...out.brainCount]; return out; });
 log('1 nights:', shape.nights, '| patrol first:', shape.patrolFirst, '| side by side:', shape.patrolAdjacent, '| with Day 7 (confusable):', shape.hasDay7, '| runes:', shape.brainCount.join(','));
 log('   patrol days:', JSON.stringify(shape.patrolDays));
 log('2 Muscle Mountain lord:', shape.lords, 'builds | same day twice in a row:', shape.lordRepeat, '| old-land questions per fight:', (shape.lordOld/shape.lords).toFixed(1), '| why-question places:', Object.keys(shape.lordBrainPos).length, 'different');
 // play the Day 10 night: wrong pick on the first patrol, right on the second, wrong answer on a patrol
 await p.evaluate(()=>{ __fd.dawnScreen(); }); await p.waitForSelector('.dawn .go-day'); log('3 dawn:', await p.locator('.go-day').textContent());
 await p.evaluate(()=>{ __fd.night.timeScale=14; __fd.startNight('sci2:10'); });
 await p.waitForFunction(()=>__fd.night.running,null,{timeout:60000});
 const n=await p.evaluate(()=>__fd.night.state.runes.length); const seen=[]; let picks=0; const crys0=await p.evaluate(()=>__fd.save.state.mats.crystal||0);
 for(let r=0;r<n;r++){ await p.waitForFunction(()=>document.querySelector('.runebtn.ready'),null,{timeout:150000,polling:300});
   await p.evaluate(()=>document.querySelector('.runebtn.ready').click()); await p.waitForSelector('.runecard');
   let Q=await p.evaluate(()=>window.__fdq);
   if(Q.type==='pick'){ picks++; const wrongPick=picks===1; const tiles=await p.locator('.runecard .ideas button').count();
     await p.evaluate(([k,w])=>{ const bs=[...document.querySelectorAll('.runecard .ideas button')]; (w?bs.find(b=>b.dataset.k!==k):bs.find(b=>b.dataset.k===k)).click(); },[Q.obj.ans,wrongPick]);
     const v=await p.locator('.runecard .verdict').last().textContent(); seen.push(`pick${wrongPick?'✗':'✓'}(${tiles} tiles: ${v.slice(0,40)})`);
     await p.evaluate(()=>[...document.querySelectorAll('.runecard button.btn.primary:not(.hide)')].pop().click());
     await p.waitForFunction(()=>window.__fdq&&window.__fdq.type!=='pick',null,{timeout:10000}); Q=await p.evaluate(()=>window.__fdq); }
   if(Q.type==='brain'){ await p.locator('.runecard .opts button').nth(Q.obj.a).click(); seen.push('brain✓'); }
   else { const spec=Q.obj.final.a, wrong=picks===2; const lab=await p.locator('.runecard .eyebrow').first().textContent();
     await p.evaluate(([spec,wrong])=>{ const root=document.querySelector('.runecard');
       if(spec.choice){ const t=x=>x.replace(/<[^>]+>/g,''), want=t(spec.choice[spec.ans]); const bs=[...root.querySelectorAll('.opts button')]; (wrong?bs.find(b=>b.textContent!==want):bs.find(b=>b.textContent===want)).click(); if(wrong){ const b2=[...root.querySelectorAll('.opts button:not(:disabled)')].find(b=>b.textContent!==want); if(b2) b2.click(); } return; }
       if(spec.tap){ const parts=[...root.querySelectorAll('[data-part]')]; const go=k=>parts.find(x=>x.getAttribute('data-part')===k).dispatchEvent(new MouseEvent('click',{bubbles:true}));
         if(wrong){ const bad=parts.find(x=>x.getAttribute('data-part')!==spec.tap.ans).getAttribute('data-part'); go(bad); go(bad); } else go(spec.tap.ans); return; }
       if(spec.sort){ for(let t=0;t<(wrong?2:1);t++){ [...root.querySelectorAll('.sortrow')].forEach(r=>{ const it=spec.sort.items.find(i=>i[0]===r.querySelector('.sortit').innerHTML); r.querySelectorAll('.binb')[wrong?(it[1]+1)%spec.sort.bins.length:it[1]].click(); }); [...root.querySelectorAll('button.btn.primary')].filter(b=>b.textContent==='Check'&&!b.disabled).pop()?.click(); } return; }
       if(spec.order){ for(let t=0;t<(wrong?2:1);t++){ const tr=[...root.querySelectorAll('.ordtray button')]; (wrong?spec.order.slice().reverse():spec.order).forEach(x=>tr.find(b=>b.innerHTML===x).click()); [...root.querySelectorAll('button.btn.primary')].filter(b=>b.textContent==='Check'&&!b.disabled).pop()?.click(); } return; }
       const inp=[...root.querySelectorAll('input.ans:not(:disabled)')].pop(); const v=wrong?'zzzz':('num' in spec?String(spec.num):spec.words[0]); for(let t=0;t<(wrong?2:1);t++){ inp.value=v; inp.dispatchEvent(new Event('input')); inp.parentElement.querySelector('button').click(); } },[spec,wrong]);
     seen.push((lab.includes('Patrol')?'patrol':'quick')+(wrong?'✗':'✓')); }
   await p.waitForTimeout(250); await p.evaluate(()=>[...document.querySelectorAll('.runecard button.btn.primary:not(.hide)')].pop().click()); }
 await p.waitForSelector('.sheet .celebrate h1',{timeout:150000});
 log('4 night:', seen.join(' '), '|', await p.locator('.sheet .celebrate h1').textContent(), '| stars day 10:', await p.evaluate(()=>__fd.prog.stars('sci2:10')), '| crystals +', (await p.evaluate(()=>__fd.save.state.mats.crystal))-crys0);
 log('   cracks:', await p.evaluate(()=>JSON.stringify(__fd.fort.crackList())));
 log('ERRORS', errs.length?errs.join('\n'):'none'); await b.close(); srv.close(); })().catch(e=>{ console.log('FAIL', e.message.split('\n').slice(0,4).join(' ')); process.exit(1); });
