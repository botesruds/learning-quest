// Valley storms play-test (js/storms.js): a mixed maths + science quiz that defends Oliver's Valley.
// 1. A new practice save (Camp era): no storm, no warning, whatever the days played.
// 2. 14 mastered across maths and science (Village era): the first visit only starts the count; 2 play days later the
//    weather-watcher warns; 3 play days later a storm waits on the fort screen, saved, and still waiting after a reload.
//    It never shows while a demon lord is waiting.
// 3. Face it: the valley opens in storm weather, 8 questions mixing both subjects, each "Which topic is this?" first, never
//    the same day twice in a row, only mastered days. 5 right and 3 missed: 3 tarps, gold, nothing else changes
//    (stars, bosses, repair, valley name and seen list). The count restarts.
// 4. Mend a tarp from the valley: 2 right on his own takes it off. The fort screen says roofs need mending until then.
// 5. A second storm (sent from the parent corner), 8 right: valley safe, a keepsake statue stands in the square.
// 6. The parent corner: every 7 days / off; off clears a waiting storm.
// Add `ipad` for iPad size; SHOTS=dir/ saves screenshots.
const path=require('path');
const {chromium}=require('playwright');const {serve}=require('./mock');
const ARGS={args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']};
const IPAD=process.argv.includes('ipad'), SHOTS=process.env.SHOTS||'', GFX=process.argv.includes('gfx')?'':'&lowgfx';
const log=(...a)=>console.log(...a); let fails=0; const canon=o=>JSON.stringify(o,(k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(x=>[x,v[x]])):v);
const check=(ok,msg)=>{ log((ok?'  ok   ':'  FAIL ')+msg); if(!ok) fails++; };
const ANSWER=`(function(spec, root, wrong){
  const fill=(inp,v)=>{ inp.value=v; inp.dispatchEvent(new Event('input')); inp.parentElement.querySelector('button').click(); };
  const tidy=t=>String(t).replace(/<[^>]+>/g,'');
  if(spec.choice){ const bs=[...root.querySelectorAll('.opts button:not(:disabled)')]; const want=tidy(spec.choice[spec.ans]); const b=bs.find(x=>wrong? x.textContent!==want : x.textContent===want); if(b) b.click(); return 'choice'; }
  if(spec.tap){ const parts=[...root.querySelectorAll('.tappic [data-part]')]; const t=wrong? parts.find(x=>x.getAttribute('data-part')!==spec.tap.ans) : parts.find(x=>x.getAttribute('data-part')===spec.tap.ans); t.dispatchEvent(new MouseEvent('click',{bubbles:true})); return 'tap'; }
  if(spec.sort){ const S=spec.sort; [...root.querySelectorAll('.sortrow')].forEach(r=>{ const txt=r.querySelector('.sortit').innerHTML; const it=S.items.find(i=>i[0]===txt); const k=wrong?(it[1]+1)%S.bins.length:it[1]; r.querySelectorAll('.binb')[k].click(); });
    const c=[...root.querySelectorAll('button.btn.primary')].filter(b=>b.textContent==='Check'&&!b.disabled).pop(); if(c) c.click(); return 'sort'; }
  if(spec.order){ const tr=[...root.querySelectorAll('.ordtray button')]; const seq=wrong?spec.order.slice().reverse():spec.order; seq.forEach(t=>{ const b=tr.find(b=>b.innerHTML===t); b&&b.click(); });
    const c=[...root.querySelectorAll('button.btn.primary')].filter(b=>b.textContent==='Check'&&!b.disabled).pop(); if(c) c.click(); return 'order'; }
  const inp=[...root.querySelectorAll('input.ans:not(:disabled)')].pop(); if(!inp) return 'noinput';
  const v= wrong? '999' : 'num' in spec? String(spec.num) : 'expr' in spec? spec.expr : 'words' in spec? spec.words[0] : '?';
  fill(inp,v); return 'input';
})`;
(async()=>{ const srv=await serve(path.resolve(__dirname,'../../..'),8854); const b=await chromium.launch(ARGS); const errs=[];
 const ctx=await b.newContext(IPAD?{viewport:{width:820,height:1180},hasTouch:true,isMobile:true,deviceScaleFactor:1}:{viewport:{width:1280,height:800}});
 const p=await ctx.newPage(); p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
 const shot=async n=>{ if(SHOTS){ await p.waitForTimeout(1200); await p.screenshot({path:SHOTS+n+'.png'}); } };
 const go=async()=>{ await p.goto('http://localhost:8854/games/fort-defence/?practice'+GFX); await p.waitForSelector('.logo',{timeout:30000}); };
 const toDawn=async()=>{ await p.evaluate(()=>document.querySelector('.btn.pulse').click()); await p.waitForSelector('.dawn'); };
 const line=()=>p.evaluate(()=>{ const l=document.querySelector('.dawn .vgrew'); return l?l.className+' | '+l.textContent:''; });
 const dateAgo=n=>{ const d=new Date(); d.setDate(d.getDate()-n); return d.toISOString().slice(0,10); };
 await go(); await p.evaluate(()=>{ __fd.save.resetPractice(); }); await go(); await toDawn();

 log('1. new save (Camp)');
 await p.evaluate(()=>{ const S=__fd.save.state; S.days=[]; __fd.dawnScreen(); });
 check(!/vstorm|vwarn/.test(await line()),'no storm or warning in the Camp era');
 check(await p.evaluate(()=>__fd.storms.status())===null,'status: nothing');

 log('2. Village era: the schedule');
 const before=await p.evaluate(()=>{ const S=__fd.save.state; for(let i=1;i<=9;i++){ S.lv[String(i)]={stars:3,train:true}; S.learnDone[String(i)]=true; }
   S.bosses['1']={won:true,best:8}; for(let i=1;i<=4;i++){ S.lv['sci2:'+i]={stars:3,train:true}; S.learnDone['sci2:'+i]=true; } S.lv['10']={stars:1,train:true}; S.learnDone['10']=true;
   S.valley={name:'Oakhollow',seen:[],era:0,toured:true,v:1}; __fd.save.commit(); __fd.valley.open(); __fd.valley.close(); __fd.dawnScreen();
   return {lv:S.lv,b:S.bosses,r:S.repair,lib:S.lib||null,valley:S.valley}; });
 const pool=await p.evaluate(()=>__fd.storms.pool());
 check(pool.length===13,'13 mastered days can be asked (9 maths + 4 science): '+pool.join(','));
 let s=await p.evaluate(()=>__fd.save.state.storm);
 check(s&&s.from===new Date().toISOString().slice(0,10)&&!s.pending,'first Village visit only starts the count');
 await p.evaluate(([a])=>{ const S=__fd.save.state; S.storm.from=a; S.days=[]; __fd.dawnScreen(); },[dateAgo(5)]);
 check(!/vstorm|vwarn/.test(await line()),'1 play day since: nothing yet');
 await p.evaluate(([a,b1])=>{ const S=__fd.save.state; S.storm.from=a; S.days=[b1]; __fd.dawnScreen(); },[dateAgo(5),dateAgo(2)]);
 const warn=await line(); check(/vwarn/.test(warn)&&/weather-watcher/.test(warn)&&/next time you play/.test(warn),'2 play days: the warning: '+warn.slice(0,120));
 await shot('storm-warning');
 // a demon lord waiting: no storm
 await p.evaluate(([a,b1,b2])=>{ const S=__fd.save.state; S.storm.from=a; S.days=[b1,b2]; S._lv10=S.lv['10']; S.lv['10']={stars:3,train:true}; for(let i=11;i<=13;i++) S.lv[String(i)]={stars:3,train:true}; __fd.dawnScreen(); },[dateAgo(5),dateAgo(3),dateAgo(2)]);
 const cur=await p.evaluate(()=>__fd.prog.currentNode().t);
 check(cur!=='lord'||!/vstorm/.test(await line()),'no storm while a demon lord waits (current: '+cur+')');
 check(await p.evaluate(()=>!__fd.save.state.storm.pending)||cur!=='lord','nothing saved while a lord waits');
 await p.evaluate(()=>{ const S=__fd.save.state; S.lv['10']=S._lv10; delete S._lv10; for(let i=11;i<=14;i++) delete S.lv[String(i)]; __fd.save.commit(); __fd.dawnScreen(); });
 const storm=await line(); check(/vstorm/.test(storm)&&/thunderstorm/i.test(storm)&&/Face it/.test(storm),'3 play days: a storm waits: '+storm.slice(0,90));
 check(await p.evaluate(()=>__fd.save.state.storm.pending.kind)==='storm','pending storm saved');
 await shot('storm-dawn');
 await go(); await toDawn();
 check(/vstorm/.test(await line()),'still waiting after a reload (ignoring it does nothing)');

 log('3. face it: 5 right, 3 missed');
 const gold0=await p.evaluate(()=>__fd.save.state.gold);
 await p.evaluate(()=>document.querySelector('.dawn .vstorm .btn').click());
 await p.waitForSelector('.vstormcard',{timeout:30000});
 check(/Defend your valley/.test(await p.locator('.vstormcard').textContent()),'intro card');
 check(await p.evaluate(()=>!__fd.valley.stage.paused&&__fd.stage.paused),'valley showing, fort paused');
 await shot('storm-intro');
 await p.evaluate(()=>[...document.querySelectorAll('.vstormcard .btn.primary')].pop().click());
 const keys=[], picks=[]; const plan=[true,false,true,true,false,true,false,true];
 for(let i=0;i<8;i++){
   await p.waitForFunction(()=>window.__fdq&&window.__fdq.type==='pick'&&document.querySelector('.vstormcard .ideas'),null,{timeout:20000});
   const Q=await p.evaluate(()=>window.__fdq.obj.ans); keys.push(Q);
   const tiles=await p.evaluate(()=>[...document.querySelectorAll('.vstormcard .ideas button')].map(b=>b.textContent)); picks.push(tiles.length);
   if(i===0){ check(/Which topic is this\?/.test(await p.locator('.vstormcard').textContent()),'starts with "Which topic is this?"'); check(tiles.every(t=>/^(Maths|Science) · Day \d+: /.test(t)),'tiles name subject and day: '+tiles.join(' / ')); await shot('storm-pick'); }
   // pick wrong once (i=2) to see the kind correction
   await p.evaluate(([k,wrong])=>{ const bs=[...document.querySelectorAll('.vstormcard .ideas button')]; (wrong?bs.find(b=>b.dataset.k!==k):bs.find(b=>b.dataset.k===k)).click(); },[Q,i===2]);
   if(i===2) check(/This one is/.test(await p.locator('.vstormcard .verdict').textContent()),'a wrong pick shows which day it was');
   await p.evaluate(()=>[...document.querySelectorAll('.vstormcard .btn.primary:not(.hide)')].pop().click());
   await p.waitForFunction(()=>window.__fdq&&window.__fdq.type==='own',null,{timeout:10000});
   const spec=await p.evaluate(()=>window.__fdq.obj.final.a);
   for(let t=0;t<4;t++){ const nx=await p.evaluate(()=>{ const b=document.querySelector('.vstormcard .card > .btn.primary:last-child'); return b&&!b.classList.contains('hide'); }); if(nx) break;
     await p.evaluate(([src,spec,wrong])=>eval(src)(spec,document.querySelector('.vstormcard'),wrong),[ANSWER,spec,!plan[i]]); await p.waitForTimeout(150); }
   const btn=await p.evaluate(()=>document.querySelector('.vstormcard .card > .btn.primary:last-child').textContent);
   if(i<2) check(plan[i]?/Defend/.test(btn):/Continue/.test(btn),'button after '+(plan[i]?'a right':'a missed')+' answer: '+btn);
   if(i===1) await shot('storm-answer');
   await p.evaluate(()=>document.querySelector('.vstormcard .card > .btn.primary:last-child').click());
   if(i===0){ await p.waitForSelector('.vcaption'); const c=await p.locator('.vcaption').textContent(); check(/🛡️/.test(c),'the defence is shown: '+c); await shot('storm-defend'); }
 }
 await p.waitForFunction(()=>/storm has passed|valley is safe/.test((document.querySelector('.vstormcard')||{}).textContent||''),null,{timeout:20000});
 const res=await p.locator('.vstormcard').textContent();
 log('     keys: '+keys.join(' '));
 check(keys.length===8&&keys.every(k=>pool.includes(k)),'8 questions, all from mastered days');
 check(keys.some(k=>k.startsWith('sci2:'))&&keys.some(k=>!k.startsWith('sci2:')),'maths and science mixed');
 check(keys.every((k,i)=>!i||k!==keys[i-1]),'never the same day twice in a row');
 check(/storm has passed/.test(res)&&/5 of 8/.test(res),'result: '+res.slice(0,120));
 await shot('storm-result');
 s=await p.evaluate(()=>__fd.save.state.storm);
 const missed=[...new Set(keys.filter((k,i)=>!plan[i]))];
 check(Object.keys(s.tarps).sort().join()===missed.sort().join(),'a tarp on each missed day: '+Object.keys(s.tarps).join(','));
 check(!s.pending&&s.from===new Date().toISOString().slice(0,10)&&s.count===1&&s.log.length===1&&s.log[0].right===5,'storm cleared, count restarts, logged');
 const gold1=await p.evaluate(()=>__fd.save.state.gold); check(gold1===gold0+25,'gold: +'+(gold1-gold0)+' (5 a defence)');
 const after=await p.evaluate(()=>{ const S=__fd.save.state; return {lv:S.lv,b:S.bosses,r:S.repair,lib:S.lib||null,valley:{name:S.valley.name}}; });
 const bj=before; bj.valley={name:bj.valley.name};
 if(canon(after)!==canon(bj)) log(canon(after)+'\n'+canon(bj));
 check(canon(after)===canon(bj),'stars, bosses, repair, Library and valley name unchanged');
 await p.evaluate(()=>[...document.querySelectorAll('.vstormcard .btn.primary')].pop().click());
 await p.waitForFunction(()=>!document.querySelector('.vstormcard'));
 const tarped=await p.evaluate(()=>__fd.valley.pickables.filter(o=>o.userData.item&&o.userData.item.tarp).map(o=>o.userData.item.key).sort());
 check(tarped.join()===missed.sort().join(),'tarps drawn on those buildings: '+tarped.join(','));
 await shot('storm-tarps');

 log('4. mend a tarp');
 const k0=missed[0];
 await p.evaluate(k=>__fd.valley.showTarp(k),k0);
 const info=await p.locator('.vinfo').textContent(); check(/tarp/.test(info)&&/Mend the roof/.test(info),'tapping a tarped building offers mending');
 await p.evaluate(()=>[...document.querySelectorAll('.vinfo .btn')].find(b=>/Mend/.test(b.textContent)).click());
 for(let n=0;n<2;n++){
   await p.waitForFunction(()=>window.__fdq&&window.__fdq.type==='own'&&document.querySelector('.vstormcard'),null,{timeout:10000});
   const spec=await p.evaluate(()=>window.__fdq.obj.final.a);
   await p.evaluate(([src,spec])=>eval(src)(spec,document.querySelector('.vstormcard'),false),[ANSWER,spec]); await p.waitForTimeout(150);
   await p.evaluate(()=>[...document.querySelectorAll('.vstormcard .btn.primary:not(.hide)')].filter(b=>/Next/.test(b.textContent)).pop().click()); await p.waitForTimeout(150);
 }
 await p.waitForFunction(()=>!document.querySelector('.vstormcard'),null,{timeout:10000});
 check(!(await p.evaluate(k=>!!__fd.save.state.storm.tarps[k],k0)),'2 right on his own takes the tarp off');
 await p.evaluate(()=>__fd.valley.close());
 await p.waitForSelector('.dawn');
 const tl=await line(); check(/vtarp/.test(tl)&&new RegExp((missed.length-1)+' roof').test(tl),'fort screen: '+tl.slice(0,80));

 log('5. a second storm, all right');
 await p.evaluate(()=>{ const S=__fd.save.state.storm; S.pending={kind:'flood',at:new Date().toISOString().slice(0,10)}; __fd.save.commit(); __fd.dawnScreen(); });
 check(/flood/.test(await line()),'flood waiting');
 await p.evaluate(()=>document.querySelector('.dawn .vstorm .btn').click()); await p.waitForSelector('.vstormcard',{timeout:30000});
 await p.evaluate(()=>[...document.querySelectorAll('.vstormcard .btn.primary')].pop().click());
 for(let i=0;i<8;i++){
   await p.waitForFunction(()=>window.__fdq&&window.__fdq.type==='pick'&&document.querySelector('.vstormcard .ideas'),null,{timeout:20000});
   await p.evaluate(()=>{ const k=window.__fdq.obj.ans; [...document.querySelectorAll('.vstormcard .ideas button')].find(b=>b.dataset.k===k).click(); [...document.querySelectorAll('.vstormcard .btn.primary:not(.hide)')].pop().click(); });
   await p.waitForFunction(()=>window.__fdq&&window.__fdq.type==='own',null,{timeout:10000});
   const spec=await p.evaluate(()=>window.__fdq.obj.final.a);
   await p.evaluate(([src,spec])=>eval(src)(spec,document.querySelector('.vstormcard'),false),[ANSWER,spec]); await p.waitForTimeout(150);
   await p.evaluate(()=>document.querySelector('.vstormcard .card > .btn.primary:last-child').click());
 }
 await p.waitForFunction(()=>/valley is safe/.test((document.querySelector('.vstormcard')||{}).textContent||''),null,{timeout:20000});
 check(/8 of 8/.test(await p.locator('.vstormcard').textContent()),'valley safe, 8 of 8');
 s=await p.evaluate(()=>__fd.save.state.storm);
 check(s.statues.length===1&&s.statues[0].kind==='flood'&&Object.keys(s.tarps).length===missed.length-1,'a keepsake statue, no new tarps');
 await p.evaluate(()=>[...document.querySelectorAll('.vstormcard .btn.primary')].pop().click()); await p.waitForFunction(()=>!document.querySelector('.vstormcard'));
 const stat=await p.evaluate(()=>__fd.valley.pickables.filter(o=>o.userData.tip&&/Flood Post/.test(o.userData.tip.title)).length);
 check(stat===1,'the Flood Post stands in the square');
 await shot('storm-statue');
 await p.evaluate(()=>__fd.valley.close()); await p.waitForSelector('.dawn');

 log('6. parent corner');
 const pc=await p.evaluate(async()=>{ __fd.day.openParent(); await new Promise(r=>setTimeout(r,300)); const sec=[...document.querySelectorAll('.pc-region')].find(s=>/Valley storms/.test(s.textContent)); return sec?sec.textContent:''; });
 check(/Valley storms/.test(pc)&&/Every 3 days he plays/.test(pc)&&/8 of 8 defended/.test(pc),'storm section in the parent corner');
 await p.evaluate(()=>{ const sec=[...document.querySelectorAll('.pc-region')].find(s=>/Valley storms/.test(s.textContent)); sec.querySelector('input[value="7"]').click(); });
 check(await p.evaluate(()=>__fd.save.state.storm.every)===7,'every 7 days saved');
 await p.evaluate(()=>{ const sec=[...document.querySelectorAll('.pc-region')].find(s=>/Valley storms/.test(s.textContent)); [...sec.querySelectorAll('button')].find(b=>/Send a storm/.test(b.textContent)).click(); });
 check(!!(await p.evaluate(()=>__fd.save.state.storm.pending)),'"Send a storm now" makes one wait');
 await p.evaluate(()=>{ const sec=[...document.querySelectorAll('.pc-region')].find(s=>/Valley storms/.test(s.textContent)); sec.querySelector('input[value="0"]').click(); });
 s=await p.evaluate(()=>__fd.save.state.storm); check(s.every===0&&!s.pending,'off clears the waiting storm');
 await p.evaluate(()=>{ __fd.day.close(); __fd.dawnScreen(); });
 check(!/vstorm|vwarn/.test(await line()),'no storm line when off');

 log('ERRORS '+(errs.length?errs.join('\n'):'none')); if(errs.length) fails++;
 log(fails?`${fails} FAILED`:'ALL PASSED');
 await b.close(); srv.close(); process.exit(fails?1:0);
})().catch(e=>{ console.error('FAIL',e.message); process.exit(1); });
