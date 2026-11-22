// Science pack play-test (?subject=science): a whole first day, every day's questions answered in the real screens
// (tap a picture, sort cards, put cards in order, typed key words with a spelling slip), a night, the Blob King, the Great Germ,
// and a check that the maths track is untouched. Practice save, fake database. `node tests/science-test.js ipad` runs at iPad size.
const path=require('path');
const {chromium,devices}=require('playwright');const {serve}=require('./mock');
const ARGS={args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']};
const log=(...a)=>console.log(...a);
const SHOTS=process.env.SHOTS||'';
// answer whatever question is on screen (right, or wrong on purpose) inside root
const ANSWER=`(function(spec, root, wrong){
  const fill=(inp,v)=>{ inp.value=v; inp.dispatchEvent(new Event('input')); inp.parentElement.querySelector('button').click(); };
  const tidy=t=>String(t).replace(/<[^>]+>/g,'');
  if(spec.choice){ const bs=[...root.querySelectorAll('.opts button:not(:disabled)')]; const want=tidy(spec.choice[spec.ans]); const b=bs.find(x=>wrong? x.textContent!==want : x.textContent===want); b.click(); return 'choice'; }
  if(spec.tap){ const parts=[...root.querySelectorAll('.tappic [data-part]')]; const t=wrong? parts.find(x=>x.getAttribute('data-part')!==spec.tap.ans) : parts.find(x=>x.getAttribute('data-part')===spec.tap.ans); t.dispatchEvent(new MouseEvent('click',{bubbles:true})); return 'tap:'+t.getAttribute('data-part'); }
  if(spec.sort){ const S=spec.sort; [...root.querySelectorAll('.sortrow')].forEach(r=>{ const txt=r.querySelector('.sortit').innerHTML; const it=S.items.find(i=>i[0]===txt); const k=wrong?(it[1]+1)%S.bins.length:it[1]; r.querySelectorAll('.binb')[k].click(); });
    [...root.querySelectorAll('button.btn.primary')].filter(b=>b.textContent==='Check'&&!b.disabled).pop().click(); return 'sort'; }
  if(spec.order){ const tr=[...root.querySelectorAll('.ordtray button')]; const seq=wrong?spec.order.slice().reverse():spec.order; seq.forEach(t=>tr.find(b=>b.innerHTML===t).click());
    [...root.querySelectorAll('button.btn.primary')].filter(b=>b.textContent==='Check'&&!b.disabled).pop().click(); return 'order'; }
  const inp=[...root.querySelectorAll('input.ans:not(:disabled)')].pop(); if(!inp) return 'noinput';
  let v= wrong? '999' : 'num' in spec? String(spec.num) : 'words' in spec? spec.words[0] : '?';
  if(!wrong && 'words' in spec && v.length>=5) v=v.slice(0,2)+v[3]+v[2]+v.slice(4);   // a small spelling slip, which should still count
  fill(inp,v); return v;
})`;
(async()=>{ const srv=await serve(path.resolve(__dirname,'../../..'),8848); const b=await chromium.launch(ARGS);
 const ipad=process.argv[2]==='ipad';
 const ctx=await b.newContext(ipad?{...devices['iPad (gen 7)']}:{viewport:{width:1280,height:800}}); const p=await ctx.newPage(); const errs=[];
 p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); }); p.on('response',r=>{ if(r.status()>=400) errs.push('HTTP '+r.status()+' '+r.url()); });
 const wf=(fn,arg,t=30000)=>p.waitForFunction(fn,arg,{timeout:t,polling:300}).then(()=>true).catch(()=>false);
 const q=()=>p.evaluate(()=>window.__fdq);
 const shot=async n=>{ if(SHOTS){ await p.waitForTimeout(600); await p.screenshot({path:SHOTS+n+'.png'}); } };
 const ans=(spec,sel,wrong)=>p.evaluate(([A,spec,sel,wrong])=>eval(A)(spec,[...document.querySelectorAll(sel)].pop(),wrong),[ANSWER,spec,sel,!!wrong]);
 const nextQ=async()=>{ await p.locator('.sheet button.btn.primary:not(.hide)',{hasText:/Next question|Carry on|Next ▸/}).last().click(); };
 const doRiddle=async()=>{ const u=(await q()).obj; await p.evaluate(u=>{ const card=document.querySelector('.sheet .uq'); const clickOpt=t=>[...card.querySelectorAll('.opts button')].find(b=>b.innerHTML===t).click();
   if(u.k==='why'||u.k==='method') clickOpt(u.c[u.a]); else if(u.k==='mistake'){ card.querySelectorAll('.wline')[u.bad].click(); clickOpt(u.fixes[u.fix]); } },u); await p.waitForTimeout(200); await nextQ(); return u.k; };
 const runeAnswer=async(wrong)=>{ const Q=await q();
   if(Q.type==='pick'){ await p.evaluate(k=>document.querySelector('.runecard .ideas button[data-k="'+k+'"]').click(),Q.obj.ans); await p.waitForTimeout(150); await p.evaluate(()=>[...document.querySelectorAll('.runecard button.btn.primary:not(.hide)')].pop().click()); await p.waitForFunction(()=>window.__fdq&&window.__fdq.type!=='pick',null,{timeout:10000}); return 'p'+await runeAnswer(wrong); }
   if(Q.type==='brain'){ const i=wrong?(Q.obj.a+1)%Q.obj.c.length:Q.obj.a; await p.locator('.runecard .opts button').nth(i).click(); }
   else { const r=await ans(Q.obj.final.a,'.runecard .card',wrong); if(Q.type==='own'&&!(await p.locator('.runecard button.btn.primary:not(.hide)').count())){ await p.waitForTimeout(200); } }
   await p.waitForTimeout(250); await p.locator('.runecard button.btn.primary:not(.hide)').last().click(); return Q.type[0]+(wrong?'✗':'✓'); };
 const battle=async(wrongAt=[])=>{ await p.evaluate(()=>{ __fd.night.timeScale=14; }); await wf(()=>__fd.night.running);
   const n=await p.evaluate(()=>__fd.night.state.runes.length); const seen=[];
   for(let r=0;r<n;r++){ if(!await wf(()=>document.querySelector('.runebtn.ready'),null,120000)){ seen.push('stuck'); break; }
     await p.click('.runebtn.ready'); await p.waitForSelector('.runecard'); if(r===1) await shot('rune'); seen.push(await runeAnswer(wrongAt.includes(r))); }
   await wf(()=>document.querySelector('.sheet .celebrate h1'),null,150000); return seen.join(' ')+' | '+await p.locator('.sheet .celebrate h1').textContent(); };

 await p.goto('http://localhost:8848/games/fort-defence/?practice&lowgfx&subject=science'); await p.waitForSelector('.logo',{timeout:30000});
 log('1 title:', await p.locator('.tag').textContent(), '| tab:', await p.title());
 await p.click('.btn.pulse'); await p.waitForSelector('.dawn .go-day'); await p.waitForTimeout(800);
 log('2 dawn:', await p.locator('.go-day').textContent(), '| land:', await p.evaluate(()=>__fd.prog.currentNode().region.name), '| fort look', await p.evaluate(()=>__fd.fort.region)); await shot('dawn');
 // ---- Day 1: lesson, train, riddle, challenge ----
 await p.click('.go-day'); await p.waitForSelector('.daysheet');
 const learn=await p.evaluate(()=>__fd.prog.topic('sci2:1').t.learn.map(c=>c.t==='try'?{choices:c.q.choices,ans:c.q.ans,a:c.q.a}:null));
 for(const c of learn){ const card=p.locator('.sheet .chunk'); if(c){ if(c.choices) await card.locator('.opts button').nth(c.ans).click(); else await ans(c.a,'.sheet .chunk'); } await card.locator('.pager .btn.primary').click(); }
 log('3 lesson done, phase:', await p.locator('.sheet .ph.cur').textContent());
 for(let n=0;n<3;n++){ const Q=(await q()).obj; const specs=[...Q.steps.map(s=>s.a),Q.final.a];
   for(let k=0;k<specs.length;k++){ if(n===0&&k===0){ await ans(specs[k],'.sheet .stepbox',true); await p.waitForTimeout(150); log('   hint after a slip:', await p.locator('.sheet .hintbox').count()); }
     await ans(specs[k],'.sheet .stepbox'); await p.waitForTimeout(150); }
   await nextQ(); await p.waitForTimeout(150); }
 log('4 train stars', await p.evaluate(()=>__fd.prog.stars('sci2:1')), '| next screen', (await q()).type);
 if((await q()).type==='uq') log('   riddle', await doRiddle());
 await p.locator('.sheet button',{hasText:'Start the Challenge'}).last().click();
 for(let n=0;n<3;n++){ const Q=(await q()).obj; await ans(Q.final.a,'.sheet .card'); await p.waitForTimeout(200); await nextQ(); await p.waitForTimeout(200); }
 log('5 challenge stars', await p.evaluate(()=>__fd.prog.stars('sci2:1')));
 if((await q()).type==='uq') log('   bonus riddle', await doRiddle());
 await p.locator('.sheet .bigbtn',{hasText:'Night falls'}).click();
 log('6 night:', await battle([4]), '| stars', await p.evaluate(()=>__fd.prog.stars('sci2:1'))); await shot('morning');
 await p.locator('.sheet .bigbtn',{hasText:'Next day'}).click(); await p.waitForSelector('.dawn .go-day'); log('7 dawn:', await p.locator('.go-day').textContent());
 // ---- every day's questions in the real Challenge screen: 4 right on each, plus one wrong per kind ----
 const kinds={}; const wrongDone={};
 for(let id=2; id<=13; id++){ const key='sci2:'+id;
   await p.evaluate(k=>{ const S=__fd.save.state; S.learnDone[k]=true; Object.assign(__fd.prog.L(k),{train:true}); __fd.save.commit(); __fd.day.close('nav'); __fd.day.open(k); },key);
   await p.waitForSelector('.sheet .card'); let tries=0, seen=[];
   while(tries<12){ const t=await q(); if(!t||t.type!=='own') break; const spec=t.obj.final.a; const kind=spec.choice?'choice':spec.tap?'tap':spec.sort?'sort':spec.order?'order':spec.words?'words':'num';
     kinds[kind]=(kinds[kind]||0)+1; const wrong=!wrongDone[kind]&&tries<2&&kind!=='words'; if(wrong) wrongDone[kind]=true;
     if(!(await p.locator('.sheet .card').last().isVisible())) break;
     if(SHOTS&&!kinds['shot_'+kind]&&['tap','sort','order'].includes(kind)){ kinds['shot_'+kind]=1; await shot('q-'+kind); }
     const r=await ans(spec,'.sheet .card',wrong); if(wrong){ await p.waitForTimeout(150); await ans(spec,'.sheet .card',true).catch(()=>{}); }
     await p.waitForTimeout(250); seen.push((wrong?'✗':'')+kind); tries++;
     const nb=p.locator('.sheet button.btn.primary:not(.hide)',{hasText:/Next question/}); if(await nb.count()) await nb.last().click(); else break; await p.waitForTimeout(200);
     if(await p.locator('.sheet .celebrate').count()) break; }
   if((await q()).type==='uq') await doRiddle();
   const st=await p.evaluate(k=>__fd.prog.stars(k),key); log(`8 day ${id}: ${seen.join(' ')} → stars ${st}`); }
 log('   kinds answered:', JSON.stringify(Object.fromEntries(Object.entries(kinds).filter(([k])=>!k.startsWith('shot_')))));
 // ---- tools on lesson cards ----
 await p.evaluate(()=>{ __fd.day.close('nav'); __fd.day.open('sci2:11'); }); await p.evaluate(()=>{}); await p.waitForTimeout(300);
 await p.evaluate(()=>{ __fd.day.close('nav'); }); 
 // ---- the Blob King ----
 await p.evaluate(()=>{ const S=__fd.save.state; S.lib=S.lib||{fl:{},rd:{}}; S.lib.rd=S.lib.rd||{}; S.wr=S.wr||{fl:{},rp:{},desk:[]}; S.wr.rp=S.wr.rp||{}; for(let i=1;i<=5;i++){ S.lib.rd['sci2:'+i]={done:true}; S.wr.rp['sci2:'+i]={done:true}; S.lv['sci2:'+i]={stars:3,train:true}; S.learnDone['sci2:'+i]=true; delete S.repair['sci2:'+i]; } S.chests['sci2:1']=true; __fd.save.commit(); __fd.demoFort(); __fd.dawnScreen(); });
 await p.waitForSelector('.dawn .go-day'); log('9 dawn:', await p.locator('.go-day').textContent());
 await p.click('.go-day'); log('10 Blob King:', await battle([]), '| won', await p.evaluate(()=>JSON.stringify(__fd.save.state.bosses['sci2:1'])), '| badge', await p.evaluate(()=>!!__fd.save.state.badges['sci2:w1']));
 log('   morning says:', (await p.locator('.sheet .celebrate p').allTextContents()).join(' / ').slice(0,200));
 await p.locator('.sheet .bigbtn',{hasText:'Carry on'}).click(); await p.waitForSelector('.dawn .go-day'); await p.waitForTimeout(1000);
 log('11 next land:', await p.evaluate(()=>__fd.prog.currentNode().region.name), '| fort look', await p.evaluate(()=>__fd.fort.region), '|', await p.locator('.go-day').textContent()); await shot('bodybuilders');
 // ---- the Great Germ (practice test, 13 of 16) ----
 await p.evaluate(()=>{ const S=__fd.save.state; S.lib=S.lib||{fl:{},rd:{}}; S.lib.rd=S.lib.rd||{}; S.wr=S.wr||{fl:{},rp:{},desk:[]}; S.wr.rp=S.wr.rp||{}; for(let i=1;i<=13;i++){ S.lib.rd['sci2:'+i]={done:true}; S.wr.rp['sci2:'+i]={done:true}; S.lv['sci2:'+i]={stars:3,train:true}; S.learnDone['sci2:'+i]=true; delete S.repair['sci2:'+i]; } ['sci2:1','sci2:2','sci2:3'].forEach(k=>S.bosses[k]={won:true,best:9}); __fd.save.commit(); __fd.dawnScreen(); });
 await p.waitForSelector('.dawn .go-day'); await p.waitForTimeout(1000); log('12 dawn:', await p.locator('.go-day').textContent()); await shot('citadel');
 await p.click('.go-day'); log('13 Great Germ:', await battle([2,9]), '|', await p.evaluate(()=>JSON.stringify(__fd.save.state.bosses['sci2:final'])), '| badge', await p.evaluate(()=>!!__fd.save.state.badges['sci2:final']), '| exams', await p.evaluate(()=>JSON.stringify(__fd.save.state.exams.map(e=>e.pack+' '+e.score+'/'+e.total))));
 log('   morning:', (await p.locator('.sheet .celebrate p').allTextContents()).join(' / ').slice(0,160));
 // ---- maths is untouched ----
 const sci=await p.evaluate(()=>JSON.stringify({lv:Object.keys(__fd.save.state.lv).filter(k=>!k.startsWith('sci2:')),final:__fd.save.state.bosses.final||null}));
 await p.goto('http://localhost:8848/games/fort-defence/?practice&lowgfx'); await p.waitForSelector('.logo'); log('14 maths title:', await p.locator('.tag').textContent());
 await p.click('.btn.pulse'); await p.waitForSelector('.dawn .go-day'); log('   maths dawn:', await p.locator('.go-day').textContent(), '| land', await p.evaluate(()=>__fd.prog.currentNode().region.name), '| maths keys/final before:', sci);
 await p.click('text=📜 Quest map'); await p.waitForSelector('.qregion'); log('   maths map lands:', (await p.locator('.qregion h3').allTextContents()).join(', '));
 await p.goto('http://localhost:8848/games/fort-defence/?practice&lowgfx&subject=science'); await p.waitForSelector('.logo'); await p.click('.btn.pulse'); await p.waitForSelector('.dawn .go-day');
 await p.click('text=📜 Quest map'); await p.waitForSelector('.qregion'); log('15 science map lands:', (await p.locator('.qregion h3').allTextContents()).join(', ')); await shot('map');
 log('ERRORS', errs.length?errs.join('\n'):'none'); await b.close(); srv.close(); })().catch(e=>{ console.log('FAIL', e.message.split('\n').slice(0,4).join(' ')); process.exit(1); });
