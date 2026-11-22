// Thinking tasks play-test (?subject=science): the Day 1 lesson's fill-the-gap card (one miss), Sentence, Phrase, Word
// (the "watch me first" lesson the first time, an expert sentence, a phrase by first and last word, a word, reasons,
// the Word Vault), a fill-the-gap question typed once the day is mastered (with a spelling slip), Explain it (keyword
// pass; a missing idea gets a hint; then the coach stand-in; coach away), the Map Room's four levels (a real drag,
// a wrong drop, a card from another land, link words, a cross-link, his own map on the Writing desk), the parent
// corner section, and that it all survives a reload. Practice save, fake database. `ipad` runs at iPad size.
const path=require('path');
const {chromium,devices}=require('playwright');const {serve}=require('./mock');
const ARGS={args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']};
const log=(...a)=>console.log(...a); const SHOTS=process.env.SHOTS||'';
(async()=>{ const srv=await serve(path.resolve(__dirname,'../../..'),8850); const b=await chromium.launch(ARGS);
 const ipad=process.argv[2]==='ipad';
 const ctx=await b.newContext(ipad?{...devices['iPad (gen 7)']}:{viewport:{width:1280,height:800}}); const p=await ctx.newPage(); const errs=[];
 p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
 const shot=async n=>{ if(SHOTS){ await p.waitForTimeout(400); await p.screenshot({path:SHOTS+'think-'+n+'.png'}); } };
 const box=i=>p.evaluate(i=>document.querySelectorAll('.sheet .mmb')[i].click(),i);
 const clickT=(sel,txt)=>p.evaluate(([s,t])=>{ const el=[...document.querySelectorAll(s)].filter(e=>e.textContent.includes(t)&&!e.disabled).pop(); if(!el) throw new Error('no '+s+' '+t); el.click(); },[sel,txt]);
 await p.goto('http://localhost:8850/games/fort-defence/?practice&lowgfx&subject=science'); await p.waitForSelector('.logo',{timeout:30000});
 await p.click('.btn.pulse'); await p.waitForSelector('.dawn .go-day');
 log('1 dawn map room button:', await p.locator('.mapbtn').count(), '| dot (no lessons yet):', await p.locator('.mapbtn .dot').count());

 // ---- Day 1 lesson: the gap card is last ----
 await p.evaluate(()=>__fd.day.open('sci2:1')); await p.waitForSelector('.sheet .chunk');
 const learn=await p.evaluate(()=>__fd.prog.topic('sci2:1').t.learn.map(c=>c.t==='try'?{choices:c.q.choices,ans:c.q.ans,gap:c.q.gap}:null));
 let gapNote='';
 for(const c of learn){ const card=p.locator('.sheet .chunk');
   if(c&&c.choices) await card.locator('.opts button').nth(c.ans).click();
   if(c&&c.gap){ await shot('gap-bank');
     const bad=c.gap.bank.filter(w=>!c.gap.ans.includes(w)); for(const w of [bad[0],c.gap.ans[1]]) await card.locator('.gapbank button',{hasText:w}).first().click();
     await card.locator('button.btn.primary',{hasText:'Check'}).click(); gapNote=await card.locator('.verdict').first().textContent(); await p.waitForTimeout(900);
     log('2 gap card: red gaps', await card.locator('.gapslot.no').count(), '| kept right word:', await card.locator('.gapslot.full').count(), '|', gapNote);
     await card.locator('.gapslot').first().click(); await card.locator('.gapbank button',{hasText:c.gap.ans[0]}).first().click();
     await card.locator('button.btn.primary',{hasText:'Check'}).click(); log('   then:', (await card.locator('.verdict').last().textContent()).slice(0,70)); }
   await card.locator('.pager .btn.primary').click(); }
 // ---- Sentence, Phrase, Word ----
 await p.waitForSelector('.sheet .chunk'); log('3 SPW intro:', await p.locator('.sheet .chunk h2').textContent());
 for(let i=0;i<3;i++){ await p.locator('.sheet .chunk .pager .btn.primary').click(); await p.waitForTimeout(100); }
 await p.waitForSelector('.sheet .passage.spw'); await shot('spw');
 const sp=await p.evaluate(()=>window.__fdq.obj);
 await p.locator('.sheet .passage.spw .spws').nth(sp.spw.best[0]).click();
 await clickT('.sheet .spwwhy .opt','It sums up'); await clickT('.sheet .spwwhy .btn.primary','Next');
 const words=sp.item.text[sp.spw.best[0]].split(/\s+/), ph=sp.spw.phrase.split(' '), a=words.findIndex((w,i)=>words.slice(i,i+ph.length).join(' ').replace(/[".,:]/g,'').toLowerCase()===ph.join(' ').toLowerCase());
 const sent=p.locator('.sheet .passage.spw .spws').nth(sp.spw.best[0]);
 await sent.locator('.wd').nth(a).click(); await sent.locator('.wd').nth(a+ph.length-1).click();
 log('4 phrase picked:', await p.locator('.sheet .spwwhy .spwq').textContent());
 await p.fill('.sheet .spwwhy input.ans','it is the key idea'); await clickT('.sheet .spwwhy .btn.primary','Next');
 const wi=words.findIndex(w=>w.replace(/[^\w]/g,'').toLowerCase()===sp.spw.word);
 await sent.locator('.wd').nth(wi).click(); await clickT('.sheet .spwwhy .opt','key science word'); await clickT('.sheet .spwwhy .btn.primary','Compare');
 await p.waitForSelector('.sheet .spwcmp'); await shot('spw-compare');
 log('5 compare:', await p.locator('.sheet .card h3').last().textContent(), '| vault:', await p.evaluate(()=>__fd.save.state.think.vault.map(v=>v.w).join(',')), '| saved:', await p.evaluate(()=>JSON.stringify(__fd.save.state.think.spw['sci2:1'].rs)));
 const cry0=await p.evaluate(()=>__fd.save.state.mats.crystal||0);
 await clickT('.sheet .bigbtn','Carry on'); await p.waitForTimeout(300);
 log('   then the day goes on to:', await p.locator('.sheet .phases .ph.cur').textContent(), '| crystal +', (await p.evaluate(()=>__fd.save.state.mats.crystal||0))-cry0);

 // ---- a typed gap once mastered (spelling slip) ----
 await p.evaluate(()=>{ Object.assign(__fd.prog.L('sci2:1'),{stars:3,train:true}); __fd.save.commit(); });
 const typed=await p.evaluate(async()=>{ const Q=await import('/games/fort-defence/js/qui.js'); const box=document.createElement('div'); box.className='card'; document.querySelector('.sheet .sbody').prepend(box);
   let res='none'; const el=Q.AnswerBox({gap:{text:'A red blood cell has no ___, so it has more room to carry ___.',ans:['nucleus','oxygen'],bank:['nucleus','oxygen','membrane','water'],key:'sci2:1'}},'',t=>{res='ok'+t;},()=>{res='wrong';},()=>{res='reveal';}); box.append(el);
   const ins=[...el.querySelectorAll('.gapin')]; ins[0].value='nucelus'; ins[1].value='oxygen'; el.querySelector('button.btn.primary').click(); const out={inputs:ins.length,bank:el.querySelectorAll('.gapbank button').length,res,fb:el.querySelector('.verdict')?.textContent}; box.remove(); return out; });
 log('6 typed gap (mastered day):', JSON.stringify(typed));

 // ---- Explain it ----
 const ex=await p.evaluate(async()=>{ const T=await import('/games/fort-defence/js/think.js'); const E=__fd.prog.pack.think.explain[1]; const out={};
   const run=async(answers,coach)=>{ window.__fdCoach=coach; const host=document.createElement('div'); document.querySelector('.sheet .sbody').prepend(host); let r=null;
     const card=T.ExplainCard(E,__fd.save,(res,info)=>{ r=res+'/'+info.by; },{key:'sci2:1'}); host.append(card); const notes=[];
     for(const a of answers){ card.querySelector('textarea').value=a; card.querySelector('button.btn.primary')?.click(); await new Promise(z=>setTimeout(z,150)); notes.push(card.querySelector('.verdict')?.textContent.slice(0,60)); }
     host.remove(); delete window.__fdCoach; return {r,notes}; };
   out.pass=await run(['it has to carry messages a long way to the toes']);
   out.hint=await run(['it carries messages','it carries messages around'],async t=>({lines:[{name:'Explains it',met:true},{name:'Facts',met:true}],praise:'Clear!',fix:''}));
   out.away=await run(['it is thin','it is long and thin'],async()=>({away:true,why:'test'}));
   out.short=await run(['messages']); out.saved=__fd.save.state.think.ex['sci2:1'].by; return out; });
 log('7 explain: keywords →', ex.pass.r, '| missing idea →', ex.hint.notes[0], '→ coach →', ex.hint.r, '| coach away →', ex.away.r, '|', ex.away.notes[1], '| one word →', ex.short.notes[0]);
 const runes=await p.evaluate(()=>{ const S=__fd.save.state; Object.assign(__fd.prog.L('sci2:2'),{stars:2,train:true}); S.learnDone['sci2:2']=true; __fd.night.timeScale=14; __fd.startNight('sci2:2'); return __fd.night.state.runes.map(r=>r.obj.explain?'explain':r.type).join(','); });
 log('8 Day 2 night runes:', runes);
 await p.waitForFunction(()=>__fd.night.running,null,{timeout:30000});
 let gotEx=false; const R=await p.evaluate(()=>__fd.night.state.runes.length);
 for(let i=0;i<R;i++){ await p.waitForFunction(()=>document.querySelector('.runebtn.ready'),null,{timeout:150000,polling:300}); await p.click('.runebtn.ready'); await p.waitForSelector('.runecard');
   let Q=await p.evaluate(()=>window.__fdq);
   if(Q.type==='pick'){ await p.evaluate(k=>document.querySelector('.runecard .ideas button[data-k="'+k+'"]').click(),Q.obj.ans); await p.waitForTimeout(100); await p.evaluate(()=>[...document.querySelectorAll('.runecard button.btn.primary:not(.hide)')].pop().click()); await p.waitForFunction(()=>window.__fdq&&window.__fdq.type!=='pick',null,{timeout:10000}); Q=await p.evaluate(()=>window.__fdq); }
   if(Q.type==='explain'){ gotEx=true; await shot('explain-rune'); await p.fill('.runecard textarea.exin',Q.obj.model.slice(Q.obj.starter.length)); await p.locator('.runecard button.btn.primary',{hasText:'Check'}).click(); log('   explain rune:', (await p.locator('.runecard .verdict').textContent()).slice(0,40)); }
   else if(Q.type==='brain') await p.locator('.runecard .opts button').nth(Q.obj.a).click();
   else await p.evaluate(spec=>{ const root=document.querySelector('.runecard'), chk=()=>[...root.querySelectorAll('button.btn.primary')].filter(b=>b.textContent==='Check'&&!b.disabled).pop()?.click(), t=x=>String(x).replace(/<[^>]+>/g,'');
     if(spec.choice) [...root.querySelectorAll('.opts button')].find(b=>b.textContent===t(spec.choice[spec.ans])).click();
     else if(spec.gap){ const ins=[...root.querySelectorAll('.gapin')]; if(ins.length) ins.forEach((x,k)=>x.value=spec.gap.ans[k]); else spec.gap.ans.forEach(w=>[...root.querySelectorAll('.gapbank button:not(:disabled)')].find(x=>x.textContent===w).click()); chk(); }
     else if(spec.tap) root.querySelector('[data-part="'+spec.tap.ans+'"]').dispatchEvent(new MouseEvent('click',{bubbles:true}));
     else if(spec.sort){ [...root.querySelectorAll('.sortrow')].forEach(r=>{ const it=spec.sort.items.find(i=>i[0]===r.querySelector('.sortit').innerHTML); r.querySelectorAll('.binb')[it[1]].click(); }); chk(); }
     else if(spec.order){ const tr=[...root.querySelectorAll('.ordtray button')]; spec.order.forEach(x=>tr.find(b=>b.innerHTML===x).click()); chk(); }
     else { const inp=[...root.querySelectorAll('input.ans')].pop(); inp.value='num' in spec?String(spec.num):spec.words?spec.words[0]:spec.expr; inp.dispatchEvent(new Event('input')); inp.parentElement.querySelector('button').click(); } },Q.obj.final.a);
   await p.waitForTimeout(250); await p.locator('.runecard button.btn.primary:not(.hide)').last().click(); await p.waitForTimeout(200); }
 await p.waitForSelector('.sheet .celebrate h1',{timeout:150000}); log('   night over:', await p.locator('.sheet .celebrate h1').textContent(), '| Brain check', await p.locator('.sheet .nightstats .lm').nth(1).textContent());
 log('   reached the explain rune:', gotEx);
 await p.goto('http://localhost:8850/games/fort-defence/?practice&lowgfx&subject=science'); await p.waitForSelector('.logo',{timeout:30000}); await p.click('.btn.pulse'); await p.waitForSelector('.dawn .go-day');

 // ---- Map Room ----
 await p.evaluate(()=>{ const S=__fd.save.state; [1,2,3,4,5].forEach(i=>S.learnDone['sci2:'+i]=true); __fd.save.commit(); __fd.dawnScreen(); });
 log('9 map room dot after Cell City lessons:', await p.locator('.mapbtn .dot').count());
 await p.click('.mapbtn'); await p.waitForSelector('.sheet .mmlv'); log('   levels:', (await p.locator('.sheet .mmlv').allTextContents()).map(t=>t.slice(0,24)).join(' | ')); await shot('maproom');
 await p.locator('.sheet .mmlv').first().click(); await p.waitForSelector('.sheet .mm');
 const map=await p.evaluate(()=>__fd.prog.pack.think.maps[1]);
 const owner={}; map.branches.forEach((b,i)=>b.cards.forEach(c=>owner[c]=i));
 // one real pointer drag onto the right branch
 { const card=p.locator('.sheet .mmtray .mmcard').first(), t=await card.textContent(), box=p.locator('.sheet .mmb').nth(owner[t]);
   const a1=await card.boundingBox(), b1=await box.boundingBox(); await p.mouse.move(a1.x+20,a1.y+15); await p.mouse.down(); await p.mouse.move(a1.x+60,a1.y-10,{steps:4}); await p.mouse.move(b1.x+b1.width/2,b1.y+b1.height/2,{steps:8}); await p.mouse.up();
   await p.waitForTimeout(200); log('10 drag "'+t.slice(0,22)+'":', await p.locator('.sheet .verdict').last().textContent()); }
 // one wrong drop by tapping, then the rest right
 { const t=await p.locator('.sheet .mmtray .mmcard').first().textContent(); await p.locator('.sheet .mmtray .mmcard').first().click(); await box((owner[t]+1)%map.branches.length); log('   wrong drop:', await p.locator('.sheet .verdict').last().textContent()); }
 for(let k=0;k<30&&await p.locator('.sheet .mmtray .mmcard').count();k++){ const t=await p.locator('.sheet .mmtray .mmcard').first().textContent(); await p.locator('.sheet .mmtray .mmcard').first().click(); await box(owner[t]); await p.waitForTimeout(40); }
 await p.waitForSelector('.sheet .celebrate'); await shot('map-l1');
 log('11 level 1:', await p.locator('.sheet .celebrate h2').textContent(), await p.locator('.sheet .celebrate p').first().textContent());
 // level 2: main branches (with cards from other lands), then details
 await clickT('.sheet .celebrate .bigbtn','Level 2'); await p.waitForSelector('.sheet .mm'); let fake=0;
 for(let k=0;k<40&&await p.locator('.sheet .mmtray .mmcard').count();k++){ const c=p.locator('.sheet .mmtray .mmcard').first(), t=await c.textContent(); await c.click();
   const bi=map.branches.findIndex(x=>x.name===t);
   if(bi>=0||!(t in owner)){ const empty=await p.evaluate(()=>[...document.querySelectorAll('.sheet .mmb')].findIndex(b=>b.classList.contains('empty'))); await box(Math.max(0,empty)); if(bi<0){ fake++; if(fake===1) log('12 other land card:', await p.locator('.sheet .verdict').last().textContent()); } }
   else { const at=await p.evaluate(n=>[...document.querySelectorAll('.sheet .mmb .mmh')].findIndex(h=>h.textContent===n),map.branches[owner[t]].name); await box(at); }
   await p.waitForTimeout(40); }
 await p.waitForSelector('.sheet .celebrate'); log('   level 2:', await p.locator('.sheet .celebrate h2').textContent(), '| badge:', await p.locator('.sheet .celebrate p').nth(1).textContent(), '| other-land cards:', fake); await shot('map-l2');
 // level 3: link words and a cross-link
 await clickT('.sheet .celebrate .bigbtn','Level 3'); await p.waitForSelector('.sheet .mmlink');
 for(let i=0;i<map.branches.length;i++) await p.evaluate(l=>[...document.querySelectorAll('.sheet .mmlink button')].find(b=>b.textContent===l).click(),map.branches[i].link);
 await shot('map-l3'); await p.evaluate(x=>{ const bs=[...document.querySelectorAll('.sheet .opts.col .opt')]; bs.find(b=>b.textContent!==x).click(); },map.cross.link); log('13 cross-link miss:', await p.locator('.sheet .verdict').last().textContent());
 await p.evaluate(x=>[...document.querySelectorAll('.sheet .opts.col .opt')].find(b=>b.textContent===x).click(),map.cross.link);
 await p.waitForSelector('.sheet .celebrate'); log('   level 3:', await p.locator('.sheet .celebrate p').first().textContent());
 // level 4: his own map
 await clickT('.sheet .celebrate .bigbtn','Level 4'); await p.waitForSelector('.sheet .mm');
 await clickT('.sheet .bigbtn','Send my map'); log('14 too early:', await p.locator('.sheet .verdict').last().textContent());
 for(const br of ['Cell parts','Plants','Moving things']){ await p.fill('.sheet input[aria-label="New main branch"]',br); await clickT('.sheet button','＋ Branch'); }
 const wsAll=['nucleus','membrane','cytoplasm','cell wall','chloroplast','diffusion','oxygen'];
 for(const [i,w] of wsAll.entries()){ await p.evaluate(w=>[...document.querySelectorAll('.sheet .mmtray .mmcard')].find(b=>b.textContent===w).click(),w); await box(i<3?0:i<5?1:2); }
 await p.fill('.sheet input[aria-label="New card"]','particles spread out'); await clickT('.sheet button','＋ Card'); await box(2); await shot('map-l4');
 await clickT('.sheet .bigbtn','Send my map'); await p.waitForSelector('.sheet .celebrate');
 log('   own map sent:', await p.locator('.sheet .celebrate h2').textContent(), '| desk:', await p.evaluate(()=>JSON.stringify(__fd.save.state.wr.desk.slice(-1)[0].text)));
 // parent corner section and reload
 const par=await p.evaluate(()=>{ const el=__fd.maproom.parentSection(()=>document.createElement('span'),t=>'now'); return el?el.textContent.slice(0,240):'none'; });
 log('15 parent section:', par);
 await p.reload(); await p.waitForSelector('.logo',{timeout:30000});
 log('16 after reload: map level', await p.evaluate(()=>__fd.save.state.think.maps['science-u2:1'].lv), '| SPW saved', await p.evaluate(()=>!!__fd.save.state.think.spw['sci2:1'].s), '| vault', await p.evaluate(()=>__fd.save.state.think.vault.length));
 log('ERRORS', errs.length?errs.join('\n'):'none'); await b.close(); srv.close(); })().catch(e=>{ console.log('FAIL', e.message.split('\n').slice(0,4).join(' ')); process.exit(1); });
