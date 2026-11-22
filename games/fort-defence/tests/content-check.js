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
   // every topic on the road exists
   pack.regions.forEach(rg=>rg.topics.forEach(id=>{ if(!pack.topics.find(t=>t.id===id)) F('region '+rg.n+' lists missing topic '+id); }));
  }
  box.remove(); return out; });
 console.log(JSON.stringify({...r,fail:undefined})); console.log('failures:',r.fail.length); r.fail.forEach(f=>console.log('  ',f)); console.log('page errors',JSON.stringify(errs));
 await b.close(); srv.close(); })();
