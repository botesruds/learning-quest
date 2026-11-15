const {chromium,devices}=require('playwright');const {serve}=require('./mock');
const ARGS={args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']};
const log=(...a)=>console.log(...a);
// answer whatever question is on screen, using the question object the game exposes for tests
const ANSWER=`(function(spec, root, wrong){
  const fill=(inp,v)=>{ inp.value=v; inp.dispatchEvent(new Event('input')); const b=inp.parentElement.querySelector('button'); b.click(); };
  if(spec.choice){ const bs=[...root.querySelectorAll('.opts button:not(:disabled)')]; const want=spec.choice[spec.ans]; const b=bs.find(x=>wrong? x.textContent!==want : x.textContent===want); b.click(); return 'choice'; }
  const inp=[...root.querySelectorAll('input.ans:not(:disabled)')].pop(); if(!inp) return 'noinput';
  const v= wrong? '999' : 'num' in spec? String(spec.num) : 'expr' in spec? spec.expr : 'words' in spec? spec.words[0] : '?';
  fill(inp,v); return v;
})`;
(async()=>{ const srv=await serve(require('path').resolve(__dirname,'../../..'),8845); const b=await chromium.launch(ARGS);
 const ctx=await b.newContext({viewport:{width:1280,height:800}}); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
 const wf=(fn,arg,t=20000)=>p.waitForFunction(fn,arg,{timeout:t}).then(()=>true).catch(()=>false);
 const q=()=>p.evaluate(()=>window.__fdq);
 const clickText=async (txt)=>{ await p.locator('.sheet button',{hasText:txt}).last().click(); };
 const nextQ=async()=>{ await p.locator('.sheet button.btn.primary:not(.hide)',{hasText:/Next question|Carry on|Next ▸/}).last().click(); };
 await p.goto('http://localhost:8845/games/fort-defence/?practice&lowgfx'); await p.waitForSelector('.logo',{timeout:30000}); await p.click('.btn.pulse');
 await p.waitForSelector('.dawn .go-day'); log('1 dawn button:', await p.locator('.go-day').textContent());
 const mats0=await p.evaluate(()=>JSON.stringify(__fd.save.state.mats));
 await p.click('.go-day'); await p.waitForSelector('.daysheet');
 // ---- lesson ----
 const learn=await p.evaluate(()=>__fd.prog.topic('1').t.learn.map(c=>c.t==='try'?{choices:c.q.choices,ans:c.q.ans,a:c.q.a}:null));
 for(let i=0;i<learn.length;i++){ const c=learn[i]; const card=p.locator('.sheet .chunk');
   if(c){ if(c.choices) await card.locator('.opts button').nth(c.ans).click(); else await p.evaluate(([A,spec])=>eval(A)(spec,document.querySelector('.sheet .chunk')),[ANSWER,c.a]); }
   await card.locator('.pager .btn.primary').click(); }
 log('2 lesson done, phase now:', await p.locator('.sheet .ph.cur').textContent(), 'wood', await p.evaluate(()=>__fd.save.state.mats.wood));
 // ---- train: 3 stepped questions, one deliberate slip ----
 for(let n=0;n<3;n++){ const Q=(await q()).obj; const specs=[...Q.steps.map(s=>s.a),Q.final.a];
   for(let k=0;k<specs.length;k++){ const root='.sheet .stepbox:last-of-type';
     if(n===0&&k===0){ await p.evaluate(([A,spec])=>eval(A)(spec,[...document.querySelectorAll('.sheet .stepbox')].pop(),true),[ANSWER,specs[k]]); await p.waitForTimeout(150); log('   hint shown after slip:', await p.locator('.sheet .hintbox').count()>0); }
     await p.evaluate(([A,spec])=>eval(A)(spec,[...document.querySelectorAll('.sheet .stepbox')].pop()),[ANSWER,specs[k]]); await p.waitForTimeout(120); }
   await nextQ(); await p.waitForTimeout(150); }
 log('3 train done, stars:', await p.evaluate(()=>__fd.prog.stars('1')), 'riddle shown:', (await q()).type);
 // ---- riddle ----
 const doRiddle=async()=>{ const u=(await q()).obj; await p.evaluate(u=>{ const card=document.querySelector('.sheet .uq');
   const clickOpt=t=>[...card.querySelectorAll('.opts button')].find(b=>b.innerHTML===t).click();
   if(u.k==='why'||u.k==='method') clickOpt(u.c[u.a]);
   else if(u.k==='mistake'){ card.querySelectorAll('.wline')[u.bad].click(); clickOpt(u.fixes[u.fix]); }
   else { const tiles=[...card.querySelectorAll('.eqtiles button')]; let s=u.ans.replace(/-/g,'−').replace(/\\*/g,'×'); while(s.length){ const t=tiles.filter(b=>s.startsWith(b.textContent)).sort((a,b)=>b.textContent.length-a.textContent.length)[0]; if(!t) break; t.click(); s=s.slice(t.textContent.length); } [...card.querySelectorAll('button')].find(b=>b.textContent==='Check').click(); }
 },u); await p.waitForTimeout(200); const v=await p.locator('.sheet .uq .verdict').last().textContent(); await nextQ(); return u.k+': '+v.slice(0,40); };
 const c0=await p.evaluate(()=>__fd.save.state.mats.crystal); log('4 riddle', await doRiddle(), 'crystal', c0,'->',await p.evaluate(()=>__fd.save.state.mats.crystal));
 await clickText('Start the Challenge');
 // ---- challenge: one miss, then 3 on his own ----
 { const Q=(await q()).obj; for(let t=0;t<2;t++){ await p.evaluate(([A,spec])=>eval(A)(spec,document.querySelector('.sheet .card'),true),[ANSWER,Q.final.a]); await p.waitForTimeout(150); } await nextQ(); }
 for(let n=0;n<3;n++){ const Q=(await q()).obj; await p.evaluate(([A,spec])=>eval(A)(spec,document.querySelector('.sheet .card')),[ANSWER,Q.final.a]); await p.waitForTimeout(200); await nextQ(); await p.waitForTimeout(200); }
 log('5 challenge stars:', await p.evaluate(()=>__fd.prog.stars('1')), 'plans', await p.evaluate(()=>JSON.stringify(__fd.save.state.blueprints)), 'riddle?', (await q()).type);
 log('   bonus riddle', await doRiddle());
 await clickText('Start the Brain check');
 // make day 2 and 3 already mastered, so finishing day 1 claims new land (3 topics mastered)
 await p.evaluate(()=>{ const S=__fd.save.state; S.lv['2']={stars:3,train:true}; S.lv['3']={stars:3,train:true}; });
 for(let n=0;n<4;n++){ const c=(await q()).obj; await p.locator('.sheet .opts button').nth(n===1?(c.a+1)%c.c.length:c.a).click(); await p.waitForTimeout(150); await p.locator('.sheet button.btn.primary:not(.hide)',{hasText:'Next'}).click(); await p.waitForTimeout(150); }
 await p.waitForSelector('.sheet .celebrate h1'); log('6 complete:', await p.locator('.sheet .celebrate h1').textContent(), '| land:', await p.locator('.landnews').textContent().catch(()=>'none'), '| loot:', await p.locator('.lootsum').textContent().catch(()=>''));
 log('   mats', mats0, '->', await p.evaluate(()=>JSON.stringify(__fd.save.state.mats)), 'fort half', await p.evaluate(()=>__fd.fort.half));
 await p.waitForTimeout(1500); await p.screenshot({path:'st4-complete.png'});
 await clickText('Build with your loot'); await p.waitForSelector('.tray .item'); log('7 build screen after the day:', await p.locator('.tray').count());
 await p.click('text=✓ Done building'); await p.waitForSelector('.dawn .go-day'); log('8 dawn now says:', await p.locator('.go-day').textContent());
 // ---- quest map ----
 await p.click('text=📜 Quest map'); await p.waitForSelector('.qtile'); await p.screenshot({path:'st4-map.png'});
 log('9 map tile 1:', await p.locator('.qtile').nth(1).textContent(), '| tile 6 locked:', await p.locator('.qtile').nth(6).evaluate(e=>e.classList.contains('locked')));
 await p.locator('.qtile').nth(6).click(); log('   locked tap toast:', await p.locator('.toast').last().textContent());
 // ---- scout report ----
 const g0=await p.evaluate(()=>__fd.save.state.gold); await p.locator('.qtile.chest').first().click(); await p.waitForSelector('.sheet .chunk');
 const prev=await p.evaluate(()=>__fd.prog.road[0].pack.previews[1].cards.map(c=>c.t==='try'?{choices:c.q.choices,ans:c.q.ans,a:c.q.a}:null));
 for(const c of prev){ const card=p.locator('.sheet .chunk'); if(c){ if(c.choices) await card.locator('.opts button').nth(c.ans).click(); else await p.evaluate(([A,spec])=>eval(A)(spec,document.querySelector('.sheet .chunk')),[ANSWER,c.a]); } await card.locator('.pager .btn.primary').click(); }
 await p.waitForSelector('.dawn .go-day'); log('10 scout report gold', g0,'->',await p.evaluate(()=>__fd.save.state.gold), 'chest saved', await p.evaluate(()=>JSON.stringify(__fd.save.state.chests)));
 // ---- reload keeps everything ----
 const before=await p.evaluate(()=>JSON.stringify([__fd.save.state.lv,__fd.save.state.mats,__fd.save.state.uq]));
 await p.reload(); await p.waitForSelector('.logo',{timeout:30000}); await p.waitForTimeout(400);
 log('11 reload identical:', before===await p.evaluate(()=>JSON.stringify([__fd.save.state.lv,__fd.save.state.mats,__fd.save.state.uq])));
 log('laptop errors:', JSON.stringify(errs)); await ctx.close();
 // ---- iPad portrait: the lesson sheet ----
 const c2=await b.newContext({...devices['iPad (gen 7)'],deviceScaleFactor:1}); const p2=await c2.newPage(); p2.on('pageerror',e=>log('PAGEERR ipad '+e.message));
 await p2.goto('http://localhost:8845/games/fort-defence/?practice&lowgfx'); await p2.waitForSelector('.logo',{timeout:30000}); await p2.locator('.btn.pulse').tap(); await p2.waitForSelector('.go-day'); await p2.waitForTimeout(2500); await p2.screenshot({path:'st4-ipad-dawn.png'});
 await p2.locator('.go-day').tap(); await p2.waitForSelector('.sheet .chunk'); await p2.waitForTimeout(2000); await p2.screenshot({path:'st4-ipad-lesson.png'});
 log('12 ipad sheet width:', await p2.evaluate(()=>document.querySelector('.daysheet').getBoundingClientRect().width), 'page scrolls sideways:', await p2.evaluate(()=>document.querySelector('.sbody').scrollWidth>document.querySelector('.sbody').clientWidth));
 await c2.close();
 log('404s', JSON.stringify(srv.log)); await b.close(); srv.close(); })().catch(e=>{ console.log('FAILED',e.message.split('\n').slice(0,6).join('\n')); process.exit(1); });
