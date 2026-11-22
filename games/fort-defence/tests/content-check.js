const {chromium}=require('playwright');const {serve}=require('./mock');
const ARGS={args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']};
(async()=>{ const srv=await serve(require('path').resolve(__dirname,'../../..'),8847); const b=await chromium.launch(ARGS);
 const p=await (await b.newContext({viewport:{width:1280,height:800}})).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
 await p.goto('http://localhost:8847/games/fort-defence/?practice&lowgfx'); await p.waitForSelector('.logo',{timeout:30000});
 const r=await p.evaluate(async()=>{
  const {PACKS}=await import('/games/fort-defence/packs/index.js'); const Q=await import('/games/fort-defence/js/qui.js'); const C=await import('/games/fort-defence/js/qcore.js');
  const box=document.createElement('div'); box.className='sheet'; box.style.cssText='position:fixed;left:0;top:0;width:700px;opacity:0;pointer-events:none'; document.body.append(box);
  const out={cards:0,gens:0,qs:0,checks:0,uq:0,previews:0,invest:0,fail:[]}; const F=(m)=>{ if(out.fail.length<40) out.fail.push(m); };
  const selfCheck=(spec,where)=>{ if(spec.choice){ if(!(spec.ans>=0&&spec.ans<spec.choice.length)) F(where+' bad choice index'); if(new Set(spec.choice).size!==spec.choice.length) F(where+' duplicate choices '+JSON.stringify(spec.choice)); return; }
    if(spec.tap){ const pic=spec.tap.pic(); if(!pic.querySelector('[data-part="'+spec.tap.ans+'"]')) F(where+' picture has no part '+spec.tap.ans); return; }
    if(spec.sort){ const S=spec.sort; if(!S.bins||S.bins.length<2||!S.items.length||S.items.some(([t,b])=>!t||!(b>=0&&b<S.bins.length))) F(where+' bad sort'); return; }
    if(spec.gap){ const G=spec.gap; if(G.text.split('___').length-1!==G.ans.length) F(where+' gap count'); G.ans.forEach(a=>{ if(!G.bank.includes(a)) F(where+' gap answer not in bank '+a); }); return; }
    if(spec.order){ if(!(spec.order.length>=2)||new Set(spec.order).size!==spec.order.length) F(where+' bad order'); return; }
    const vals='num' in spec?[String(spec.num),C.N(spec.num)]:'expr' in spec?[spec.expr]:'words' in spec?[spec.words[0]]:null; if(!vals){ F(where+' unknown spec '+JSON.stringify(spec)); return; }
    vals.forEach(v=>{ const res=C.checkAns(spec,v); if(!res.ok) F(where+' rejects its own answer '+v+' '+JSON.stringify(spec)+' '+(res.msg||'')); }); };
  for(const pack of PACKS){
   for(const T of pack.topics){
    const W='topic '+T.id;
    T.learn.forEach((c,i)=>{ try{ box.replaceChildren(Q.LearnView(T.learn,i,()=>{},()=>{},null,'x')); out.cards++; if(c.t==='try'){ if(c.q.choices){ if(!(c.q.ans>=0&&c.q.ans<c.q.choices.length)) F(W+' card '+i+' choice index'); } else if(c.q.a&&!c.q.a.eq&&!c.q.eq) selfCheck(c.q.a,W+' card '+i); } }catch(e){ F(W+' card '+i+': '+e.message); } });
    (T.gen||[]).forEach((g,gi)=>{ out.gens++; for(let n=0;n<40;n++){ try{ const q=g(); out.qs++;
      [...q.steps,q.final].forEach((s,k)=>selfCheck(s.a,W+' gen '+gi+' step '+k+' "'+String(q.q).replace(/<[^>]+>/g,'').slice(0,50)+'"'));
      if(n<3){ box.replaceChildren(Q.QuestionCard(q,'steps',()=>{},()=>{})); box.replaceChildren(Q.QuestionCard(q,'own',()=>{},()=>{})); }
     }catch(e){ F(W+' gen '+gi+': '+e.message); break; } } });
    (T.checks||[]).forEach((c,i)=>{ out.checks++; if(!(c.a>=0&&c.a<c.c.length)||!c.why) F(W+' check '+i+' bad'); });
    ((pack.understanding||{})[T.id]||[]).forEach((u,i)=>{ out.uq++; const w=W+' riddle '+i+' ('+u.k+')';
      try{ box.replaceChildren(Q.UnderstandCard(u,()=>{},()=>{})); }catch(e){ F(w+': '+e.message); }
      if(u.k==='why'||u.k==='method'){ if(!(u.a>=0&&u.a<u.c.length)) F(w+' index'); }
      else if(u.k==='mistake'){ if(!(u.bad>=0&&u.bad<u.lines.length&&u.fix>=0&&u.fix<u.fixes.length)) F(w+' index'); }
      else if(u.k==='build'){ let s=u.ans.replace(/-/g,'−').replace(/\*/g,'×'), used=[]; while(s.length){ const t=u.tiles.filter(x=>s.startsWith(x)).sort((a,b)=>b.length-a.length)[0]; if(!t){ F(w+' cannot build '+u.ans+' from tiles'); break; } used.push(t); s=s.slice(t.length); }
        const joined=used.join(' '); const ok=u.ans.includes('=')?C.checkEq(u.ans,joined).ok:C.equiv(u.ans,joined); if(!ok) F(w+' built answer not accepted: '+joined); }
      else F(w+' unknown kind'); if(!u.why) F(w+' no why'); });
    if(T.kind==='invest'){ for(let n=0;n<6;n++){ try{ box.replaceChildren(pack.special.invest(()=>{},T.id,()=>{})); out.invest++; }catch(e){ F(W+' invest: '+e.message); } } }
   }
   Object.entries(pack.previews||{}).forEach(([k,pv])=>pv.cards.forEach((c,i)=>{ try{ box.replaceChildren(Q.LearnView(pv.cards,i,()=>{},()=>{},null,'x')); out.previews++; }catch(e){ F('preview '+k+' card '+i+': '+e.message); } }));
   // Library tower dispatches: indexes in range, no duplicate choices, every day exists
   const RQ=(w,it,q)=>{ const n=it.text.length; if(!q.s||!q.ask||!q.why) F(w+' missing s/ask/why');
     if(q.s==='evidence'){ if(!(q.ans&&q.ans.length&&q.ans.every(i=>i>=0&&i<n))) F(w+' evidence index'); if(q.key&&!q.ans.some(i=>it.text[i].toLowerCase().includes(q.key.toLowerCase()))) F(w+' key word not in proof sentence'); }
     else if(q.order){ if(q.order.length<2||new Set(q.order).size!==q.order.length) F(w+' order'); }
     else { if(!(q.choice&&q.choice.length>=2)||new Set(q.choice).size!==q.choice.length) F(w+' choices'); }
     if(q.clue!=null&&!(q.clue>=0&&q.clue<n)) F(w+' clue index'); out.reads=(out.reads||0)+1; };
   ((pack.reading||{}).dispatches||[]).forEach(d=>{ if(!pack.topics.find(t=>t.id===d.day)) F('dispatch for missing day '+d.day); d.qs.forEach((q,i)=>RQ('dispatch '+d.day+' q'+i,d,q)); });
   // thinking tasks: SPW picks are in the day's dispatch, every Explain model passes its own keyword check, maps are complete
   if(pack.think){ const TH=await import('/games/fort-defence/js/think.js'); const th=pack.think;
     Object.entries(th.spw||{}).forEach(([day,sp])=>{ const d=((pack.reading||{}).dispatches||[]).find(x=>String(x.day)===day); if(!d){ F('spw '+day+' has no dispatch'); return; }
       if(!sp.best.every(i=>i>=0&&i<d.text.length)) F('spw '+day+' sentence index'); const all=d.text.join(' ').toLowerCase();
       if(!d.text[sp.best[0]].toLowerCase().includes(sp.phrase.toLowerCase())) F('spw '+day+' phrase not in expert sentence'); if(!all.includes(sp.word.toLowerCase())) F('spw '+day+' word not in text'); out.spw=(out.spw||0)+1; });
     Object.entries(th.explain||{}).forEach(([day,E])=>{ if(!pack.topics.find(t=>String(t.id)===day)) F('explain for missing day '+day); const own=E.model.slice(E.starter.length); if(!E.model.startsWith(E.starter)) F('explain '+day+' model must start with the starter');
       const miss=TH.missingIdeas(E,own); if(miss.length) F('explain '+day+' model misses '+miss.map(m=>m.hint).join(' / ')); const bare=TH.missingIdeas(E,'I do not know'); if(bare.length<E.must.length) F('explain '+day+' a blank answer passes an idea'); out.explain=(out.explain||0)+1; });
     Object.entries(th.maps||{}).forEach(([rn,m])=>{ if(!pack.regions.find(r=>String(r.n)===rn)) F('map for missing region '+rn); if(m.branches.length<3||m.branches.length>8) F('map '+rn+' branch count'); const cards=m.branches.flatMap(b=>b.cards); if(new Set(cards).size!==cards.length) F('map '+rn+' duplicate card');
       Object.keys(m.also||{}).forEach(c=>{ if(!cards.includes(c)) F('map '+rn+' also names a missing card '+c); }); if(!cards.includes(m.cross.from)||!m.branches[m.cross.to]) F('map '+rn+' cross-link'); out.maps=(out.maps||0)+1; });
     Object.entries(th.gaps||{}).forEach(([day,gs])=>gs.forEach((G,i)=>{ if(G.text.split('___').length-1!==G.ans.length||G.ans.some(a=>!G.bank.includes(a))||new Set(G.bank).size!==G.bank.length) F('gap '+day+'.'+i); }));
   }
   // every topic on the road exists
   pack.regions.forEach(rg=>rg.topics.forEach(id=>{ if(!pack.topics.find(t=>t.id===id)) F('region '+rg.n+' lists missing topic '+id); }));
  }
  const {STRATEGIES}=await import('/games/fort-defence/packs/reading/strategies.js');
  STRATEGIES.forEach(st=>{ if(st.practice.length<4) F('floor '+st.n+' needs 4 practice texts'); st.practice.forEach((it,i)=>{ const q={...it,s:st.k}; const n=it.text.length;
      if(q.s==='evidence'){ if(!(q.ans.every(j=>j>=0&&j<n))) F('floor '+st.n+' p'+i+' evidence index'); } else if(new Set(q.choice).size!==q.choice.length) F('floor '+st.n+' p'+i+' choices');
      if(q.clue!=null&&!(q.clue>=0&&q.clue<n)) F('floor '+st.n+' p'+i+' clue'); out.reads=(out.reads||0)+1; });
    st.lesson.forEach((c,i)=>{ try{ box.replaceChildren(Q.LearnView(st.lesson,i,()=>{},()=>{},null,'x')); }catch(e){ F('floor '+st.n+' lesson card '+i+': '+e.message); } if(c.t==='try'&&!(c.q.ans>=0&&c.q.ans<c.q.choices.length)) F('floor '+st.n+' lesson try '+i); }); });
  box.remove(); return out; });
 console.log(JSON.stringify({...r,fail:undefined})); console.log('failures:',r.fail.length); r.fail.forEach(f=>console.log('  ',f)); console.log('page errors',JSON.stringify(errs));
 await b.close(); srv.close(); })();
