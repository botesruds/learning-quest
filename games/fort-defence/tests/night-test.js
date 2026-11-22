const path=require('path');
const {chromium,devices}=require('playwright');const {serve}=require('./mock');
const ARGS={args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']};
const log=(...a)=>console.log(...a);
async function run(b, ctxOpts, tag, full){
 const ctx=await b.newContext(ctxOpts); const p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
 p.on('response',r=>{ if(r.status()>=400) errs.push('HTTP '+r.status()+' '+r.url()); });
 const wf=(fn,arg,t=30000)=>p.waitForFunction(fn,arg,{timeout:t}).then(()=>true).catch(()=>false);
 // a save that has finished Train + Challenge on day 1, with a demo castle
 await p.goto('http://localhost:8845/games/fort-defence/?practice&lowgfx'); await p.waitForSelector('.logo',{timeout:30000});
 await p.evaluate(()=>{ const S=__fd.save.state; S.learnDone['1']=true; S.lv['1']={stars:2,train:true}; __fd.save.commit(); });
 await p.click('.btn.pulse'); await p.waitForSelector('.dawn .go-day');
 await p.evaluate(()=>{ const b=[...document.querySelectorAll('#dev button, .bench button')]; }); 
 log(tag,'1 dawn:', await p.locator('.go-day').textContent());
 // build a demo castle through the bench helper if present
 const demo=await p.evaluate(()=>{ if(__fd.demoFort){ __fd.demoFort(); return 'demo'; } return 'none'; });
 log(tag,'   pieces in fort:', await p.evaluate(()=>__fd.fort.cells.size), demo);
 await p.evaluate(()=>{ __fd.night.timeScale=8; }); await p.click('.go-day'); await wf(()=>__fd.night.running); log(tag,'2 night running:', await p.evaluate(()=>__fd.night.running));
 const answer=async(wrong)=>{ const Q=await p.evaluate(()=>window.__fdq);
   if(Q.type==='pick'){ await p.evaluate(k=>document.querySelector('.runecard .ideas button[data-k="'+k+'"]').click(),Q.obj.ans); await p.waitForTimeout(150); await p.evaluate(()=>[...document.querySelectorAll('.runecard button.btn.primary:not(.hide)')].pop().click()); await p.waitForFunction(()=>window.__fdq&&window.__fdq.type!=='pick',null,{timeout:10000}); return 'p'+await answer(wrong); }
   if(Q.type==='brain'){ const i= wrong? (Q.obj.a+1)%Q.obj.c.length : Q.obj.a; await p.locator('.runecard .opts button').nth(i).click(); await p.waitForTimeout(150); await p.locator('.runecard button.btn.primary:not(.hide)').last().click(); return 'brain'+(wrong?'✗':'✓'); }
   const spec=Q.obj.final.a; const v= wrong?'999': 'num' in spec? String(spec.num) : 'expr' in spec? spec.expr : 'words' in spec? spec.words[0]: null;
   if(spec.choice){ await p.locator('.runecard .opts button').filter({hasText:spec.choice[spec.ans]}).first().click(); }
   else { await p.evaluate(v=>{ const inp=[...document.querySelectorAll('.runecard input.ans:not(:disabled)')].pop(); inp.value=v; inp.dispatchEvent(new Event('input')); inp.parentElement.querySelector('button').click(); },v); }
   await p.waitForTimeout(200);
   if(wrong){ for(let k=0;k<3 && await p.locator('.runecard input.ans:not(:disabled)').count();k++){ await p.evaluate(()=>{ const inp=[...document.querySelectorAll('.runecard input.ans:not(:disabled)')].pop(); inp.value='999'; inp.dispatchEvent(new Event('input')); inp.parentElement.querySelector('button').click(); }); await p.waitForTimeout(150);} }
   await p.locator('.runecard button.btn.primary:not(.hide)').last().click(); return 'quick'+(wrong?'✗':'✓'); };
 let shot=false; const seen=[];
 for(let r=0;r<6;r++){
   const ok=await wf(()=>document.querySelector('.runebtn.ready'),null,60000); if(!ok){ log(tag,'   no rune ready', r, await p.evaluate(()=>JSON.stringify({seg:__fd.night.state&&__fd.night.state.seg,d:__fd.night.state&&__fd.night.state.demons.length}))); break; }
   const st=await p.evaluate(()=>({demons:__fd.night.state.demons.length, kills:__fd.night.state.kills}));
   if(full && !shot && st.demons>2){ await p.screenshot({path:`st6-${tag}-battle.png`}); shot=true; }
   await p.click('.runebtn.ready'); await p.waitForSelector('.runecard'); if(full && r===1) await p.screenshot({path:`st6-${tag}-rune.png`});
   seen.push(await answer(r===2)); await p.waitForTimeout(300);
   if(r===2) log(tag,'   cracks after wrong:', await p.evaluate(()=>JSON.stringify(__fd.fort.crackList())));
 }
 log(tag,'3 runes:', seen.join(' '));
 const morn=await wf(()=>document.querySelector('.sheet .celebrate h1'),null,90000);
 log(tag,'4 morning:', morn && await p.locator('.sheet .celebrate h1').textContent(), '|', morn && (await p.locator('.nightstats').textContent()));
 log(tag,'   stars', await p.evaluate(()=>__fd.prog.stars('1')), 'checks', await p.evaluate(()=>JSON.stringify(__fd.save.state.checks['1'])), 'mats', await p.evaluate(()=>JSON.stringify(__fd.save.state.mats)), 'gold', await p.evaluate(()=>__fd.save.state.gold));
 if(full) await p.screenshot({path:`st6-${tag}-morning.png`});
 await p.locator('.sheet button',{hasText:'Next day'}).last().click(); await p.waitForSelector('.dawn .go-day');
 log(tag,'5 dawn:', await p.locator('.go-day').textContent(), '| fix btn:', await p.locator('.dawn button',{hasText:'Fix a crack'}).count());
 // fix the crack
 if(await p.locator('.dawn button',{hasText:'Fix a crack'}).count()){
   await p.locator('.dawn button',{hasText:'Fix a crack'}).click(); await p.waitForSelector('.daysheet');
   for(let n=0;n<2;n++){ const Q=(await p.evaluate(()=>window.__fdq)).obj; const spec=Q.final.a; const v='num' in spec? String(spec.num) : 'expr' in spec? spec.expr : spec.words? spec.words[0]: null;
     if(spec.choice) await p.locator('.sheet .opts button').filter({hasText:spec.choice[spec.ans]}).first().click(); else await p.evaluate(v=>{ const inp=[...document.querySelectorAll('.sheet input.ans:not(:disabled)')].pop(); inp.value=v; inp.dispatchEvent(new Event('input')); inp.parentElement.querySelector('button').click(); },v);
     await p.waitForTimeout(250); await p.locator('.sheet button.btn.primary:not(.hide)').last().click(); await p.waitForTimeout(250); }
   log(tag,'6 cracks after repair:', await p.evaluate(()=>JSON.stringify(__fd.fort.crackList())));
   const btn=p.locator('.sheet button.btn.primary:not(.hide), .sheet .bigbtn').last(); if(await btn.count()) await btn.click().catch(()=>{});
   await p.waitForSelector('.dawn .go-day',{timeout:10000}).catch(()=>{});
 }
 // leave-night box on day 2
 await p.evaluate(()=>{ const S=__fd.save.state; S.learnDone['2']=true; S.lv['2']={stars:2,train:true}; __fd.save.commit(); __fd.dawnScreen(); });
 await p.waitForSelector('.dawn .go-day'); log(tag,'7 dawn day 2:', await p.locator('.go-day').textContent());
 await p.click('.go-day'); await wf(()=>__fd.night.running); await p.click('[aria-label="Leave the night"]'); await p.waitForTimeout(300);
 log(tag,'8 leave box:', (await p.locator('.freeze, .confirm, .leavebox').allTextContents()).join(' | ').slice(0,160));
 const yes=p.locator('button',{hasText:/Leave|Go back|Yes/}).last(); await yes.click(); await p.waitForSelector('.dawn .go-day'); log(tag,'   after leave running:', await p.evaluate(()=>__fd.night.running));
 // reload keeps everything
 const before=await p.evaluate(()=>JSON.stringify({lv:__fd.save.state.lv,m:__fd.save.state.mats,c:__fd.fort.crackList()}));
 await p.reload(); await p.waitForSelector('.logo'); const after=await p.evaluate(()=>JSON.stringify({lv:__fd.save.state.lv,m:__fd.save.state.mats,c:__fd.fort.crackList()}));
 log(tag,'9 reload identical:', before===after);
 const sw=await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth); log(tag,'   sideways scroll:', sw);
 log(tag,'ERRORS', errs.length? errs.join('\n'):'none'); await ctx.close();
}
(async()=>{ const srv=await serve(path.resolve(__dirname,'../../..'),8845); const b=await chromium.launch(ARGS);
 try{ await run(b,{viewport:{width:1280,height:800}},'lap',true); await run(b,{...devices['iPad (gen 7) landscape']},'ipad',true); }catch(e){ console.log('FAIL',e.message.split('\n')[0]); }
 await b.close(); srv.close(); })();
