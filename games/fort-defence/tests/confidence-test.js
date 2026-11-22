// Confidence check and command-word runes (science track, practice save):
// 1. 30 builds of the Muscle Mountain lord: exactly one command-word rune each, never first, same number of runes as before
//    (it replaces a quick question); the final boss has none.
// 2. A real Day 10 night: before each rune he taps sure / think so / guessing, the answers dim until he does, the note under
//    the answer matches (sure + wrong = "surprise"), and the tap is saved with the answer (hist, and the card log for patrol runes).
// 3. A real Muscle Mountain fight: a wrong command-word rune never marks a day for repair.
// 4. The daily patrol: a guessed right answer is saved as "helped" with conf "guess" and says it won't move up a box.
const path=require('path');
const {chromium}=require('playwright');const {serve}=require('./mock');
const ARGS={args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']};
const log=(...a)=>console.log(...a);
// answers whatever question is on screen (copied from science-test.js)
const ANSWER=`(function(spec, root, wrong){
  const fill=(inp,v)=>{ inp.value=v; inp.dispatchEvent(new Event('input')); inp.parentElement.querySelector('button').click(); };
  const tidy=t=>String(t).replace(/<[^>]+>/g,'');
  if(spec.choice){ const bs=[...root.querySelectorAll('.opts button:not(:disabled)')]; const want=tidy(spec.choice[spec.ans]); const b=bs.find(x=>wrong? x.textContent!==want : x.textContent===want); b.click(); return 'choice'; }
  if(spec.tap){ const parts=[...root.querySelectorAll('.tappic [data-part]')]; const t=wrong? parts.find(x=>x.getAttribute('data-part')!==spec.tap.ans) : parts.find(x=>x.getAttribute('data-part')===spec.tap.ans); t.dispatchEvent(new MouseEvent('click',{bubbles:true})); return 'tap:'+t.getAttribute('data-part'); }
  if(spec.sort){ const S=spec.sort; [...root.querySelectorAll('.sortrow')].forEach(r=>{ const txt=r.querySelector('.sortit').innerHTML; const it=S.items.find(i=>i[0]===txt); const k=wrong?(it[1]+1)%S.bins.length:it[1]; r.querySelectorAll('.binb')[k].click(); });
    [...root.querySelectorAll('button.btn.primary')].filter(b=>b.textContent==='Check'&&!b.disabled).pop()?.click(); return 'sort'; }
  if(spec.order){ const tr=[...root.querySelectorAll('.ordtray button')]; const seq=wrong?spec.order.slice().reverse():spec.order; seq.forEach(t=>tr.find(b=>b.innerHTML===t).click());
    [...root.querySelectorAll('button.btn.primary')].filter(b=>b.textContent==='Check'&&!b.disabled).pop()?.click(); return 'order'; }
  const inp=[...root.querySelectorAll('input.ans:not(:disabled)')].pop(); if(!inp) return 'noinput';
  let v= wrong? '999' : 'num' in spec? String(spec.num) : 'words' in spec? spec.words[0] : '?';
  if(!wrong && 'words' in spec && v.length>=5) v=v.slice(0,2)+v[3]+v[2]+v.slice(4);   // a small spelling slip, which should still count
  fill(inp,v); return v;
})`;
(async()=>{ const srv=await serve(path.resolve(__dirname,'../../..'),8861); const b=await chromium.launch(ARGS);
 const p=await (await b.newContext({viewport:{width:1280,height:800}})).newPage(); const errs=[]; let fails=0;
 const check=(ok,msg)=>{ if(!ok){ fails++; log('   ✗ '+msg); } };
 p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
 await p.goto('http://localhost:8861/games/fort-defence/?practice&lowgfx&subject=science'); await p.waitForSelector('.logo',{timeout:30000});
 await p.click('.btn.pulse'); await p.waitForSelector('.dawn .go-day');
 await p.evaluate(()=>{ const S=__fd.save.state; for(let i=1;i<=12;i++){ S.lv['sci2:'+i]={stars:i<10?3:2,train:true}; S.learnDone['sci2:'+i]=true; } ['sci2:1','sci2:2'].forEach(k=>S.bosses[k]={won:true,best:9}); __fd.save.commit(); });
 // 1. rune lists
 const shape=await p.evaluate(()=>{ const node=__fd.prog.road.find(n=>n.t==='lord'&&n.region.n===3), out={fights:0,one:0,first:0,lens:new Set(),cmds:new Set()};
   for(let n=0;n<30;n++){ __fd.night.startSiege(node); const R=__fd.night.state.runes; __fd.night.stop(true); out.fights++;
     const c=R.map((r,i)=>r.cmd?i:-1).filter(i=>i>=0); if(c.length===1) out.one++; if(c[0]===0) out.first++; out.lens.add(R.length); c.forEach(i=>out.cmds.add(R[i].obj.cmd)); }
   const fin=__fd.prog.road.find(n=>n.t==='final'&&n.pack.id==='science-u2'); let finCmd=null; if(fin){ __fd.night.startSiege(fin); finCmd=__fd.night.state.runes.filter(r=>r.cmd).length; __fd.night.stop(true); }
   return {...out,lens:[...out.lens],cmds:[...out.cmds],finCmd}; });
 log('1 lord builds:', shape.fights, '| exactly one command rune:', shape.one, '| first:', shape.first, '| runes per fight:', shape.lens.join(','), '| commands seen:', shape.cmds.join(', '), '| final boss command runes:', shape.finCmd);
 check(shape.one===30&&shape.first===0&&shape.lens.length===1&&shape.finCmd===0,'lord rune lists');

 const val=spec=>'num' in spec? String(spec.num) : 'expr' in spec? spec.expr : spec.words? spec.words[0] : null;
 // answer the open rune card; conf = 'sure'|'think'|'guess'|null; returns a short label
 const answerRune=async(wrong,conf,auto)=>{ try{ return await answerRune0(wrong,conf,auto); }catch(e){ const Q=await p.evaluate(()=>window.__fdq&&{type:window.__fdq.type,spec:window.__fdq.obj&&window.__fdq.obj.final&&Object.keys(window.__fdq.obj.final.a)}); log('   answer error', e.message.split('\n')[0], JSON.stringify(Q)); throw e; } };
 const answerRune0=async(wrong,conf,auto)=>{ let Q=await p.evaluate(()=>window.__fdq); let out='';
   if(Q.type==='pick'){ await p.evaluate(k=>document.querySelector('.runecard .ideas button[data-k="'+k+'"]')?.click(),Q.obj.ans); await p.waitForTimeout(150);
     await p.evaluate(()=>[...document.querySelectorAll('.runecard button.btn.primary:not(.hide)')].pop()?.click()); await p.waitForTimeout(300); Q=await p.evaluate(()=>window.__fdq); out='pick+'; }
   if(auto){ const k=Q.type==='brain'?'b':'o'; const L=auto[k]; [conf,wrong]=L[auto[k+'i']++%L.length]; }
   const dim=await p.evaluate(()=>!!document.querySelector('.runecard .conf-wait'));
   if(conf){ await p.locator(`.runecard .conf-b[data-conf="${conf}"]`).click(); }
   const dimAfter=await p.evaluate(()=>!!document.querySelector('.runecard .conf-wait'));
   if(Q.type==='brain'){ const i= wrong? (Q.obj.a+1)%Q.obj.c.length : Q.obj.a; await p.locator('.runecard .opts button').nth(i).click(); }
   else { const r=await p.evaluate(([src,spec,wrong])=>{ const f=eval(src); const root=[...document.querySelectorAll('.runecard')].pop(); const a=f(spec,root,wrong); if(wrong&&a!=='choice'){ const inp=[...root.querySelectorAll('input.ans:not(:disabled)')].pop(); if(inp){ inp.value='998'; inp.dispatchEvent(new Event('input')); inp.parentElement.querySelector('button').click(); } } return a; },[ANSWER,Q.obj.final.a,wrong]); }
   await p.waitForTimeout(250);
   const note=await p.evaluate(()=>{ const n=document.querySelector('.runecard .confnote'); return n?n.textContent:''; });
   await p.evaluate(()=>[...document.querySelectorAll('.runecard button.btn.primary:not(.hide)')].pop()?.click());
   return { label: out+Q.type+(wrong?'✗':'✓')+(conf?'/'+conf:''), dim, dimAfter, note, cmd: !!(Q.obj&&Q.obj.cmd) }; };

 // 2. a real Day 10 night
 await p.evaluate(()=>{ __fd.night.timeScale=14; __fd.startNight('sci2:10'); }); await p.waitForFunction(()=>__fd.night.running,null,{timeout:60000});
 const auto={b:[['sure',true],['guess',false],['think',false],['guess',true]],o:[['sure',false],[null,false],['think',false]],bi:0,oi:0};
 const n=await p.evaluate(()=>__fd.night.state.runes.length); const seen=[];
 for(let r=0;r<n;r++){ await p.waitForFunction(()=>document.querySelector('.runebtn.ready'),null,{timeout:150000,polling:300});
   await p.evaluate(()=>document.querySelector('.runebtn.ready').click()); await p.waitForSelector('.runecard');
   const a=await answerRune(false,null,auto); seen.push(a); log('    rune', r+1, a.label);
   if(r===0) await p.screenshot({path:'conf-rune.png'}).catch(()=>{});
   await p.waitForFunction(()=>!document.querySelector('.runecard'),null,{timeout:10000}).catch(()=>{}); }
 seen.forEach(a=>log('   ', a.label, '| dimmed before tap:', a.dim, '| after:', a.dimAfter, '|', a.note||'(no note)'));
 check(seen.every(a=>a.dim&&(a.label.includes('/')?!a.dimAfter:true)),'answers dim until the tap');
 check(seen.filter(a=>a.label.includes('✗/sure')).every(a=>/surprise/i.test(a.note)),'sure + wrong says surprise');
 check(seen.filter(a=>!a.label.includes('/')).every(a=>!a.note),'no tap, no note');
 const saved=await p.evaluate(()=>{ const S=__fd.save.state; const h=Object.values(S.hist).flat().filter(x=>x.conf); const cl=Object.values(S.cards||{}).flatMap(c=>(c.log||[]).filter(l=>l.conf)); return { hist:h.length, kinds:[...new Set(h.map(x=>x.conf))], cardLogs:cl.map(l=>l.r+'/'+l.conf+(l.surprise?'/surprise':'')) }; });
 log('   saved with answers:', saved.hist, 'hist entries with a tap', JSON.stringify(saved.kinds), '| card logs:', saved.cardLogs.join(' ')||'(none)');
 check(saved.hist>=4,'confidence saved in hist');
 await p.waitForFunction(()=>document.querySelector('.sheet .celebrate h1'),null,{timeout:120000,polling:500}).catch(()=>{});

 // 3. a real Muscle Mountain fight: answer the command rune wrong, everything else right
 await p.evaluate(()=>{ const sh=document.querySelector('.sheet'); if(window.__fd.day.close) __fd.day.close('nav'); __fd.night.stop(true); });
 await p.evaluate(()=>{ __fd.night.timeScale=14; __fd.startSiege(__fd.prog.road.find(n=>n.t==='lord'&&n.region.n===3)); }).catch(e=>log('   startSiege', e.message));
 await p.waitForFunction(()=>__fd.night.running,null,{timeout:60000});
 const m=await p.evaluate(()=>__fd.night.state.runes.length); const siegeSeen=[]; let cmdWrongBefore=null, cmdWrongAfter=null;
 for(let r=0;r<m;r++){ if(!await p.waitForFunction(()=>document.querySelector('.runebtn.ready'),null,{timeout:150000,polling:300}).then(()=>true).catch(()=>false)) { siegeSeen.push('stuck'); break; }
   await p.evaluate(()=>document.querySelector('.runebtn.ready').click()); await p.waitForSelector('.runecard');
   const isCmd=await p.evaluate(()=>!!(window.__fdq&&window.__fdq.obj&&window.__fdq.obj.cmd));
   if(isCmd){ cmdWrongBefore=await p.evaluate(()=>__fd.night.state.wrong.size); await p.screenshot({path:'conf-command.png'}).catch(()=>{}); }
   const a=await answerRune(isCmd,'think'); siegeSeen.push(a.label);
   if(isCmd) cmdWrongAfter=await p.evaluate(()=>__fd.night.state.wrong.size);
   await p.waitForFunction(()=>!document.querySelector('.runecard'),null,{timeout:10000}).catch(()=>{}); }
 await p.waitForFunction(()=>document.querySelector('.sheet .celebrate h1'),null,{timeout:120000,polling:500}).catch(()=>{});
 const res=await p.evaluate(()=>({ h1:(document.querySelector('.sheet .celebrate h1')||{}).textContent, repair:Object.keys(__fd.save.state.repair).filter(k=>__fd.save.state.repair[k]) }));
 log('3 siege:', siegeSeen.join(' '), '|', res.h1, '| wrong set before/after command rune:', cmdWrongBefore, cmdWrongAfter, '| repairs:', JSON.stringify(res.repair));
 check(cmdWrongBefore!=null&&cmdWrongBefore===cmdWrongAfter&&res.repair.length===0,'command rune never marks a repair');

 // 4. the daily patrol
 await p.reload(); await p.waitForSelector('.logo',{timeout:30000}); await p.click('.btn.pulse'); await p.waitForSelector('.dawn .go-day');
 const due=await p.evaluate(()=>{ const S=__fd.save.state, C=S.cards||{}, t=__fd.cards.today(); const want=Object.keys(C).filter(id=>/\|g\d+$/.test(id)).slice(0,3);
   Object.keys(C).forEach(id=>{ C[id].due=want.includes(id)?t:'2099-01-01'; }); delete S.patrol; __fd.save.commit(); __fd.dawnScreen(); return want; });
 await p.waitForSelector('.dawn .go-day'); const goText=await p.locator('.go-day').textContent();
 let patrolNote='', patrolLog=null;
 if(/Patrol/i.test(goText)){ await p.click('.go-day'); await p.waitForTimeout(800);
   for(let k=0;k<3;k++){ const Q=await p.evaluate(()=>window.__fdq); if(Q && Q.type==='pick'){ await p.evaluate(k=>document.querySelector('.sheet .ideas button[data-k="'+k+'"]')?.click(),Q.obj.ans); await p.evaluate(()=>[...document.querySelectorAll('.sheet button.btn.primary:not(.hide)')].pop()?.click()); await p.waitForTimeout(300); } }
   const Q=await p.evaluate(()=>window.__fdq); const has=await p.locator('.sheet .conf-b[data-conf="guess"]').count();
   if(has){ await p.locator('.sheet .conf-b[data-conf="guess"]').first().click();
     if(Q.type==='own'){ await p.evaluate(([src,spec])=>{ const f=eval(src); f(spec,document.querySelector('.sheet'),false); },[ANSWER,Q.obj.final.a]); }
     else if(Q.obj && Q.obj.c){ const i=Q.obj.a; const want=Q.obj.c[i]; await p.evaluate(w=>[...document.querySelectorAll('.sheet .opts button')].find(b=>b.textContent===w).click(), want); }
     await p.waitForTimeout(300); await p.screenshot({path:'conf-patrol.png'}).catch(()=>{});
     patrolNote=await p.evaluate(()=>{ const n=document.querySelector('.sheet .confnote'); return n?n.textContent:''; });
     patrolLog=await p.evaluate(()=>{ const all=Object.values(__fd.save.state.cards).map(c=>(c.log||[]).slice(-1)[0]).filter(l=>l&&l.conf); return all.map(l=>l.r+'/'+l.conf); }); } }
 log('4 patrol:', goText.trim(), '| note:', patrolNote||'(none)', '| card log:', JSON.stringify(patrolLog));
 check(/won't move up/.test(patrolNote) && patrolLog && patrolLog.includes('helped/guess'),'patrol guess saved as helped');
 // reload keeps the taps
 await p.reload(); await p.waitForSelector('.logo',{timeout:30000});
 const kept=await p.evaluate(()=>Object.values(__fd.save.state.hist).flat().filter(x=>x.conf).length);
 log('5 after reload, answers with a tap:', kept); check(kept>=saved.hist,'taps kept after reload');
 log(errs.length? 'ERRORS '+errs.join(' | ') : 'no page errors'); log(fails? `FAILED ${fails}` : 'ALL CHECKS PASSED');
 await b.close(); srv.close(); process.exit(fails||errs.length?1:0);
})().catch(e=>{ console.log('FAIL',e.message); process.exit(1); });
