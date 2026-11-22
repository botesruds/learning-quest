/* Question screens shared by every content pack: lesson cards, single questions, stepped and on-your-own answering.
   LearnView, MiniQ, SymKeys, QuestionCard, AnswerBox, runSteps and runOwn are Algebra Quest's code, unchanged apart from
   MiniQ reporting whether it was right. UnderstandCard (the four understanding formats) is new. */
import { h, H, esc, N, shuffle, checkAns, checkEq, equiv, SayBtn } from "./qcore.js";

/* ================= learn (chunks) ================= */
function LearnView(cards,i,goto,done,seen,doneLabel,onTry){
  i=Math.max(0,Math.min(i,cards.length-1)); if(seen) seen(i);
  const c=cards[i];
  const dots=h("div",{class:"chunkdots"},...cards.map((_,k)=>h("i",{class:k<i?"done":k===i?"cur":""})));
  const parts=[h("div",{class:"row",style:"justify-content:space-between"},h("span",{class:"eyebrow"},`Part ${i+1} of ${cards.length}`),dots)];
  const card=h("div",{class:"card chunk pop"});
  card.append(h("div",{class:"row",style:"justify-content:space-between"},h("h2",{},c.h),SayBtn(()=>c.h+". "+(c.b||"")+" "+(c.after||"")+" "+(c.rule||"")+" "+(c.q&&c.q.ask||""))));
  if(c.b) card.append(H(c.b,"body"));
  if(c.v) card.append(c.v());
  if(c.after) card.append(H(c.after,"body"));
  if(c.tool) card.append(c.tool());
  if(c.rule) card.append(h("div",{class:"rule"},c.rule));
  let ready=c.t!=="try";
  const nextBtn=h("button",{class:"btn primary",type:"button",onclick:()=>{ if(i<cards.length-1) goto(i+1); else done(); }},i<cards.length-1?"Next ▸":doneLabel+" ▸");
  if(c.t==="try"){ nextBtn.disabled=true; card.append(MiniQ(c.q,(ok,tries)=>{ nextBtn.disabled=false; onTry&&onTry(ok,tries,card); })); }
  card.append(h("div",{class:"pager"},i>0?h("button",{class:"btn",type:"button",onclick:()=>goto(i-1)},"◂ Back"):h("span"),nextBtn));
  parts.push(card);
  return h("div",{class:"stack"},...parts);
}
/* a single question used inside learn cards and previews */
function MiniQ(q,onDone){
  const box=h("div",{class:"stack",style:"gap:10px"}), fb=h("div");
  let tries=0;
  const finish=(ok)=>{ fb.className="verdict "+(ok?"good":"mid"); fb.innerHTML=(ok?"<b>Yes!</b> ":"<b>Here's how:</b> ")+q.why; onDone(ok,tries); };
  if(q.ask) box.append(h("div",{class:"qs"},H(q.ask)));
  if(q.gap){ box.append(AnswerBox({gap:q.gap},"",(t)=>{ tries=t; finish(true); },(t,f)=>{ tries=t; f.className="verdict bad"; f.textContent="Not quite. The red gap needs another word."; },()=>{ tries=2; finish(false); })); box.append(fb); return box; }
  if(q.choices){ const opts=h("div",{class:"opts"+(q.choices.some(c=>c.length>18)?" col":"")});
    q.choices.forEach((c,k)=>opts.append(h("button",{class:"opt",type:"button",onclick:e=>{ const b=e.currentTarget; if(k===q.ans){ b.classList.add("ok"); opts.querySelectorAll("button").forEach(x=>x.disabled=true); finish(true); } else { b.classList.add("no"); b.disabled=true; tries++; if(tries>=2){ opts.children[q.ans].classList.add("ok"); opts.querySelectorAll("button").forEach(x=>x.disabled=true); finish(false); } else { fb.className="verdict bad"; fb.textContent="Not quite. Have another look."; } } }},c)));
    box.append(opts);
  } else {
    const inp=h("input",{class:"ans",type:"text",autocomplete:"off",spellcheck:"false","aria-label":"Your answer"});
    const go2=()=>{ const r=(q.eq||q.a.eq)?checkEq(q.a.expr,inp.value):checkAns(q.a,inp.value); if(r.empty) return; if(r.ok){ inp.classList.add("ok"); inp.disabled=true; btn.disabled=true; finish(true); } else { inp.classList.add("no"); tries++; if(tries>=2){ inp.disabled=true; btn.disabled=true; finish(false); } else { fb.className="verdict bad"; fb.textContent=r.msg||"Not quite. Try once more."; } } };
    const btn=h("button",{class:"btn primary",type:"button",onclick:go2},"Check");
    inp.addEventListener("keydown",e=>{ if(e.key==="Enter") go2(); }); inp.addEventListener("input",()=>inp.classList.remove("no"));
    box.append(h("div",{class:"ansrow"},inp,btn),SymKeys(inp));
  }
  box.append(fb);
  return box;
}
function SymKeys(inp){
  const keys=["²","−","(",")","/"];
  return h("div",{class:"symkeys"},...keys.map(k=>h("button",{type:"button",tabindex:"-1",onclick:()=>{ const p=inp.selectionStart??inp.value.length; inp.value=inp.value.slice(0,p)+k+inp.value.slice(p); inp.focus(); inp.setSelectionRange(p+k.length,p+k.length); inp.dispatchEvent(new Event("input")); }},k)));
}

/* one question: steps mode or own mode */
function QuestionCard(q,mode,onResult,onNext,fromStep){
  const card=h("div",{class:"card stack pop"});
  if(fromStep) card.append(h("div",{class:"eyebrow"},`From step ${fromStep.id}: ${fromStep.short}`));
  card.append(h("div",{class:"row",style:"justify-content:space-between;align-items:flex-start"},h("div",{class:"qs",html:q.q}),SayBtn(()=>q.q)));
  if(q.v) card.append(q.v());
  const body=h("div",{class:"stack",style:"gap:12px"}); card.append(body);
  const nextBtn=h("button",{class:"btn primary hide",type:"button",onclick:onNext},"Next question ▸");
  card.append(nextBtn);
  let reported=false;
  const report=r=>{ if(reported) return; reported=true; onResult(r); nextBtn.classList.remove("hide"); setTimeout(()=>{ try{ nextBtn.focus({preventScroll:true}); }catch(e){} },400); };
  if(mode==="steps") runSteps(q,body,(r)=>report(r));
  else runOwn(q,body,report);
  return card;
}
function AnswerBox(spec,label,onOk,onWrong,onReveal,opts={}){
  /* returns element; spec.choice → buttons */
  const el=h("div",{class:"stack",style:"gap:8px"}), fb=h("div");
  let tries=0;
  const max=opts.max||2;
  if(label) el.append(h("div",{html:label,style:"font-weight:700"}));
  if(spec.choice){
    const opts2=h("div",{class:"opts"+(spec.choice.some(c=>c.length>16)?" col":"")});
    spec.choice.forEach((c,k)=>opts2.append(h("button",{class:"opt",type:"button",onclick:e=>{ const b=e.currentTarget;
      if(k===spec.ans){ b.classList.add("ok"); opts2.querySelectorAll("button").forEach(x=>x.disabled=true); fb.replaceChildren(); onOk(tries); }
      else { b.classList.add("no"); b.disabled=true; tries++; onWrong&&onWrong(tries,fb); if(tries>=max){ opts2.children[spec.ans].classList.add("ok"); opts2.querySelectorAll("button").forEach(x=>x.disabled=true); onReveal&&onReveal(fb,tidy(spec.choice[spec.ans])); } } }},c)));
    el.append(opts2,fb); return el;
  }
  if(spec.tap) return TapAnswer(spec,el,fb,onOk,onWrong,onReveal,max);
  if(spec.sort) return SortAnswer(spec,el,fb,onOk,onWrong,onReveal,max);
  if(spec.order) return OrderAnswer(spec,el,fb,onOk,onWrong,onReveal,max);
  if(spec.gap) return GapAnswer(spec,el,fb,onOk,onWrong,onReveal,max);
  const inp=h("input",{class:"ans",type:"text",autocomplete:"off",spellcheck:"false","aria-label":"Answer"});
  const btn=h("button",{class:"btn primary",type:"button"},"Check");
  const ans=spec.expr!=null? spec.expr.replace(/\^2/g,"²").replace(/-/g," − ").replace(/\+/g," + ").replace(/\*/g,"") : spec.num!=null? N(spec.num) : "";
  const doCheck=()=>{ const r=checkAns(spec,inp.value); if(r.empty) return;
    if(r.ok){ inp.classList.remove("no"); inp.classList.add("ok"); inp.disabled=true; btn.disabled=true; fb.replaceChildren(); if(r.spell){ inp.value=r.spell; fb.className="verdict mid"; fb.textContent="Right! Check the spelling: "+r.spell; } onOk(tries); return; }
    inp.classList.add("no"); if(!r.close) tries++;
    if(r.msg){ fb.className="verdict mid"; fb.textContent=r.msg; }
    if(!r.close){ onWrong&&onWrong(tries,fb,r); if(tries>=max){ inp.value=ans; inp.disabled=true; btn.disabled=true; onReveal&&onReveal(fb,ans); } } };
  btn.addEventListener("click",doCheck); inp.addEventListener("keydown",e=>{ if(e.key==="Enter") doCheck(); }); inp.addEventListener("input",()=>inp.classList.remove("no"));
  el.append(h("div",{class:"ansrow"},inp,btn)); if(spec.expr!=null) el.append(SymKeys(inp)); el.append(fb);
  setTimeout(()=>{ try{ inp.focus({preventScroll:true}); }catch(e){} },30);
  return el;
}
/* ---------- picture and card answers (science packs) ----------
   {tap:{pic, ans, parts?}}  tap the right part of a picture. pic() returns an svg whose clickable parts carry data-part="name".
   {sort:{bins:[...], items:[[text, binIndex], ...]}}  put each card in the right group, then Check.
   {order:[first, second, ...]}  tap the cards in the right order, then Check. */
const tidy=t=>String(t).replace(/<[^>]+>/g,"");
function TapAnswer(spec,el,fb,onOk,onWrong,onReveal,max){
  const T=spec.tap, pic=T.pic(), wrap=h("div",{class:"tappic"},pic); let tries=0, done=false;
  const parts=[...pic.querySelectorAll("[data-part]")];
  parts.forEach(p=>{ p.setAttribute("tabindex","0"); p.setAttribute("role","button"); p.setAttribute("aria-label",p.getAttribute("data-name")||"a part");
    const hit=()=>{ if(done) return; const nm=p.getAttribute("data-part");
      if(nm===T.ans){ done=true; parts.filter(x=>x.getAttribute("data-part")===nm).forEach(x=>x.classList.add("tap-ok")); fb.replaceChildren(); onOk(tries); }
      else { p.classList.add("tap-no"); setTimeout(()=>p.classList.remove("tap-no"),700); tries++; onWrong&&onWrong(tries,fb); if(!onWrong){ fb.className="verdict bad"; fb.textContent="Not that part. Look again."; }
        if(tries>=max){ done=true; parts.filter(x=>x.getAttribute("data-part")===T.ans).forEach(x=>x.classList.add("tap-ok")); onReveal&&onReveal(fb,T.name||T.ans); } } };
    p.addEventListener("click",hit); p.addEventListener("keydown",e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); hit(); } }); });
  el.append(h("div",{class:"small muted"},"👆 Tap the picture"),wrap,fb); return el;
}
function SortAnswer(spec,el,fb,onOk,onWrong,onReveal,max){
  const S_=spec.sort, items=shuffle(S_.items.map((it,i)=>i)), pickd={}; let tries=0, done=false;
  const rows=items.map(i=>{ const [txt]=S_.items[i];
    const btns=S_.bins.map((b,k)=>h("button",{class:"binb",type:"button",onclick:()=>{ if(done) return; pickd[i]=k; row.classList.remove("no"); btns.forEach((x,j)=>x.classList.toggle("on",j===k)); }},b));
    const row=h("div",{class:"sortrow"},h("span",{class:"sortit",html:txt}),h("span",{class:"bins"},...btns)); row._i=i; row._b=btns; return row; });
  const check=h("button",{class:"btn primary",type:"button",onclick:()=>{ if(done) return;
    if(items.some(i=>pickd[i]==null)){ fb.className="verdict mid"; fb.textContent="Put every card in a group first."; return; }
    const bad=rows.filter(r=>pickd[r._i]!==S_.items[r._i][1]);
    if(!bad.length){ done=true; check.disabled=true; rows.forEach(r=>r.classList.add("ok")); fb.replaceChildren(); onOk(tries); return; }
    bad.forEach(r=>r.classList.add("no")); tries++; onWrong&&onWrong(tries,fb); if(!onWrong){ fb.className="verdict bad"; fb.textContent=`${bad.length} in the wrong group. Fix the red ones.`; }
    if(tries>=max){ done=true; check.disabled=true; rows.forEach(r=>{ const k=S_.items[r._i][1]; r._b.forEach((x,j)=>x.classList.toggle("on",j===k)); r.classList.remove("no"); r.classList.add("ok"); }); onReveal&&onReveal(fb,"shown above"); } }},"Check");
  el.append(h("div",{class:"sortlist"},...rows),check,fb); return el;
}
function OrderAnswer(spec,el,fb,onOk,onWrong,onReveal,max){
  const O=spec.order, order=shuffle(O.map((t,i)=>i)), used=[]; let tries=0, done=false;
  const slot=h("ol",{class:"ordslot"}), tray=h("div",{class:"ordtray"});
  const paint=()=>{ slot.replaceChildren(...(used.length?used.map(i=>h("li",{html:O[i]})):[h("li",{class:"muted"},"Tap the cards in order")])); tray.querySelectorAll("button").forEach(b=>b.disabled=done||used.includes(+b.dataset.i)); };
  order.forEach(i=>tray.append(h("button",{class:"ordt",type:"button","data-i":i,html:O[i],onclick:()=>{ used.push(i); paint(); }})));
  const undo=h("button",{class:"btn small",type:"button",onclick:()=>{ if(!done){ used.pop(); paint(); } }},"↩ Undo");
  const check=h("button",{class:"btn primary",type:"button",onclick:()=>{ if(done) return;
    if(used.length<O.length){ fb.className="verdict mid"; fb.textContent="Use every card first."; return; }
    if(used.every((v,k)=>v===k)){ done=true; slot.classList.add("ok"); undo.disabled=check.disabled=true; fb.replaceChildren(); paint(); onOk(tries); return; }
    tries++; slot.classList.add("no"); setTimeout(()=>slot.classList.remove("no"),600); onWrong&&onWrong(tries,fb); if(!onWrong){ fb.className="verdict bad"; fb.textContent="Not quite in order. Undo and try again."; }
    if(tries>=max){ done=true; used.length=0; O.forEach((t,k)=>used.push(k)); undo.disabled=check.disabled=true; paint(); onReveal&&onReveal(fb,"shown above"); } else { used.length=0; paint(); } }},"Check");
  paint(); el.append(slot,tray,h("div",{class:"row"},undo,check),fb); return el;
}
/* ---------- fill the gap ----------
   {gap:{text:"The ___ of a thing fits the ___ it does.", ans:["shape","job"], bank:[...], key?}}
   Word bank: tap a gap (the first empty one is chosen for him), then tap a word; tap a filled gap to empty it.
   Typed: once the day has 3 stars (window.__fdGapTyped(key) says so) he types each word instead, with the
   usual forgiving spelling check. */
function GapAnswer(spec,el,fb,onOk,onWrong,onReveal,max){
  const G=spec.gap, parts=G.text.split("___"), n=G.ans.length, typed=!!(G.typed||(G.key&&window.__fdGapTyped&&window.__fdGapTyped(G.key)));
  const fill=Array(n).fill(null); let cur=0, tries=0, done=false;
  const slots=[], line=h("div",{class:"gapline"});
  parts.forEach((t,i)=>{ line.append(document.createTextNode(t)); if(i<n){
    const s= typed ? h("input",{class:"gapin",type:"text",autocomplete:"off",spellcheck:"false","aria-label":`Gap ${i+1}`,size:Math.max(6,G.ans[i].length+1)})
      : h("button",{class:"gapslot",type:"button","aria-label":`Gap ${i+1}`,onclick:()=>{ if(done) return; if(fill[i]!=null){ fill[i]=null; } cur=i; paint(); }},"\u00a0");
    if(typed) s.addEventListener("input",()=>s.classList.remove("no"));
    slots.push(s); line.append(s); } });
  const bank=h("div",{class:"gapbank"});
  const words=typed?[]:shuffle(G.bank);
  words.forEach(w=>bank.append(h("button",{class:"gapw",type:"button",onclick:()=>{ if(done) return; let i=fill[cur]==null?cur:fill.indexOf(null); if(i<0) i=cur; fill[i]=w; const nx=fill.indexOf(null); cur=nx<0?i:nx; paint(); }},w)));
  function paint(){ if(typed) return; slots.forEach((s,i)=>{ s.textContent=fill[i]==null?"\u00a0":fill[i]; s.classList.toggle("cur",!done&&i===cur); s.classList.toggle("full",fill[i]!=null); s.classList.remove("no"); });
    bank.querySelectorAll("button").forEach(b=>{ const used=fill.filter(x=>x===b.textContent).length, have=words.filter(x=>x===b.textContent).length; b.disabled=done||used>=have; }); }
  const same=(a,b)=>String(a).trim().toLowerCase()===String(b).trim().toLowerCase();
  const reveal=()=>{ done=true; slots.forEach((s,i)=>{ if(typed){ s.value=G.ans[i]; s.disabled=true; } else s.textContent=G.ans[i]; s.classList.remove("no"); s.classList.add("ok"); }); check.disabled=true; paint(); };
  const check=h("button",{class:"btn primary",type:"button",onclick:()=>{ if(done) return;
    let spell=[];
    const ok=G.ans.map((a,i)=>{ if(!typed) return fill[i]!=null&&same(fill[i],a); const v=slots[i].value; if(!v.trim()) return null; const r=checkAns({words:[a]},v); if(r.ok&&r.spell) spell.push(r.spell); return !!r.ok; });
    if(ok.some(x=>x==null)||(!typed&&fill.some(x=>x==null))){ fb.className="verdict mid"; fb.textContent="Fill every gap first."; return; }
    if(ok.every(Boolean)){ done=true; check.disabled=true; slots.forEach((s,i)=>{ s.classList.add("ok"); if(typed){ s.value=G.ans[i]; s.disabled=true; } }); paint(); fb.replaceChildren(); if(spell.length){ fb.className="verdict mid"; fb.textContent="Right! Check the spelling: "+spell.join(", "); } onOk(tries); return; }
    tries++; ok.forEach((v,i)=>{ if(!v) slots[i].classList.add("no"); else slots[i].classList.add("fine"); });
    onWrong&&onWrong(tries,fb); if(!onWrong){ fb.className="verdict bad"; fb.textContent="Not quite. Change the red gaps."; }
    if(tries>=max){ reveal(); onReveal&&onReveal(fb,G.ans.join(", ")); } else if(!typed){ setTimeout(()=>{ ok.forEach((v,i)=>{ if(!v){ fill[i]=null; } }); cur=Math.max(0,fill.indexOf(null)); paint(); },700); } }},"Check");
  paint();
  el.append(h("div",{class:"small muted"},typed?"⌨️ Type the missing words":"👆 Tap a word to fill the glowing gap"),line,bank,check,fb);
  if(typed) setTimeout(()=>{ try{ slots[0].focus({preventScroll:true}); }catch(e){} },30);
  return el;
}
function runSteps(q,body,done){
  let k=0, helped=false, revealed=false;
  const all=[...q.steps,{...q.final,isFinal:true}];
  function addStep(){
    const st=all[k];
    const box=h("div",{class:"stepbox"+(st.isFinal?" final":"")});
    box.append(h("div",{class:"sn"},st.isFinal?"Final answer":`Step ${k+1} of ${q.steps.length}`));
    const hintArea=h("div");
    box.append(AnswerBox(st.a,st.p,()=>{ box.classList.add("done"); hintArea.replaceChildren(); k++; if(k<all.length) addStep(); else finish(); },
      (tries,fb)=>{ helped=true; fb.className=""; fb.replaceChildren(); if(st.hint||st.hv){ hintArea.replaceChildren(h("div",{class:"hintbox"},h("div",{},h("b",{},"💡 Hint: "),H(st.hint||"Have another go.")),st.hv?st.hv():null)); } else { fb.className="verdict bad"; fb.textContent="Not quite. Have another go."; } },
      (fb,ans)=>{ revealed=true; fb.className="verdict mid"; fb.innerHTML=`<b>The answer is ${esc(ans||"shown above")}.</b> Look at how it was worked out, then carry on.`; box.classList.add("done"); setTimeout(()=>{ k++; if(k<all.length) addStep(); else finish(); },50); }));
    box.append(hintArea);
    body.append(box);
  }
  function finish(){ body.append(h("div",{class:"verdict "+(revealed?"mid":"good"),html:`<b>${revealed?"Done.":helped?"Got there!":"All steps right!"}</b> ${q.why||""}`})); done(revealed?"wrong":helped?"help":"steps"); }
  addStep();
}
function runOwn(q,body,report){
  const area=h("div",{class:"stack",style:"gap:10px"});
  const stepsBtn=h("button",{class:"btn small",type:"button"},"Show me with steps");
  let switched=false;
  const box=AnswerBox(q.final.a,q.final.p,(tries)=>{ stepsBtn.remove(); area.append(h("div",{class:"verdict good",html:`<b>${tries?"Got it on the second try.":"Right, on your own!"}</b> ${q.why||""}`})); report(tries?"help":"own"); },
    (tries,fb)=>{ fb.className="verdict bad"; fb.textContent="Not quite. Try once more, or use steps."; },
    (fb,ans)=>{ stepsBtn.remove(); fb.className="verdict mid"; fb.innerHTML=`<b>The answer is ${esc(ans||"shown above")}.</b> ${q.why||""}`; report("wrong"); });
  stepsBtn.addEventListener("click",()=>{ if(switched) return; switched=true; area.replaceChildren(); box.remove(); stepsBtn.remove(); runSteps(q,area,(r)=>report(r==="steps"?"help":r==="help"?"help":"wrong")); });
  body.append(box,stepsBtn,area);
}


/* ---------- understanding questions ----------
   u.k = "why"     explain why: { q, c:[choices], a, why }
         "method"  choose the method: { q, c:[choices], a, why }
         "mistake" spot the mistake: { q, lines:[worked lines], bad, fixes:[choices for that line], fix, why }
         "build"   build the equation: { q, tiles:[...], ans:"equation or expression", why }
   onResult("first" | "second" | "wrong") is called once; onNext when the Next button is pressed. */
const UQ_LABEL = { why: "🧠 Explain why", method: "🧭 Choose the method", mistake: "🔎 Spot the mistake", build: "🧱 Build the equation" };
function UnderstandCard(u, onResult, onNext, opts = {}) {
  const card = h("div", { class: "card stack pop uq" });
  const said = () => u.q + " " + (u.c || u.lines || []).join(". ");
  card.append(h("div", { class: "row", style: "justify-content:space-between" }, h("div", { class: "eyebrow" }, opts.label || UQ_LABEL[u.k] || "🧠 Think"), SayBtn(said)), h("div", { class: "qs", html: u.q }));
  if (u.v) card.append(u.v());
  const fb = h("div"), nx = h("button", { class: "btn primary hide", type: "button", onclick: () => onNext && onNext() }, opts.nextLabel || "Next ▸");
  let tries = 0, done = false;
  const finish = (r, extra) => { if (done) return; done = true; fb.className = "verdict " + (r === "wrong" ? "mid" : "good"); fb.innerHTML = (r === "wrong" ? "<b>Here's why:</b> " : r === "first" ? "<b>Yes, first time!</b> " : "<b>Yes!</b> ") + (extra || "") + u.why; onResult && onResult(r); if (onNext) nx.classList.remove("hide"); };
  const choices = (list, ans, onRight, max = 2) => {
    const box = h("div", { class: "opts" + (list.some(x => x.length > 16) ? " col" : "") });
    list.forEach((t, i) => box.append(h("button", { class: "opt", type: "button", html: t, onclick: e => {
      const b = e.currentTarget;
      if (i === ans) { b.classList.add("ok"); box.querySelectorAll("button").forEach(x => (x.disabled = true)); onRight(tries); }
      else { b.classList.add("no"); b.disabled = true; tries++; if (tries >= max) { box.children[ans].classList.add("ok"); box.querySelectorAll("button").forEach(x => (x.disabled = true)); finish("wrong"); } else { fb.className = "verdict bad"; fb.textContent = "Not quite. Think about why, and have another go."; } }
    } })));
    return box;
  };
  if (u.k === "why" || u.k === "method") {
    const order = shuffle(u.c.map((t, i) => i)); const list = order.map(i => u.c[i]);
    card.append(choices(list, order.indexOf(u.a), t => finish(t ? "second" : "first")));
  } else if (u.k === "mistake") {
    const lines = h("div", { class: "worked" }); let step = 0;
    card.append(h("p", { class: "small muted" }, "A goblin apprentice worked this out and made a mistake. Tap the first line that goes wrong."), lines);
    u.lines.forEach((t, i) => lines.append(h("button", { class: "wline", type: "button", onclick: e => {
      if (step) return; const b = e.currentTarget;
      if (i === u.bad) { b.classList.add("no"); step = 1; lines.querySelectorAll("button").forEach(x => (x.disabled = true)); askFix(); }
      else { b.classList.add("fine"); b.disabled = true; tries++; if (tries >= 2) { lines.children[u.bad].classList.add("no"); step = 1; lines.querySelectorAll("button").forEach(x => (x.disabled = true)); fb.className = "verdict mid"; fb.textContent = "This is the wrong line. Now pick what it should say."; askFix(true); } else { fb.className = "verdict bad"; fb.textContent = "That line is fine. Check each line again, from the top."; } }
    } }, h("span", { class: "ln" }, String(i + 1)), h("span", { html: t }))));
    function askFix(missed) {
      if (!missed) { fb.className = ""; fb.textContent = ""; }
      const t0 = tries; const order = shuffle(u.fixes.map((t, i) => i));
      card.insertBefore(h("div", { style: "font-weight:700" }, `What should line ${u.bad + 1} say?`), fb);
      card.insertBefore(choices(order.map(i => u.fixes[i]), order.indexOf(u.fix), t => finish(missed || t > t0 ? "second" : "first"), t0 + 2), fb);
    }
  } else if (u.k === "build") {
    const slot = h("div", { class: "eqslot", "aria-live": "polite" }), tray = h("div", { class: "eqtiles" }); const used = [];
    const paint = () => { slot.replaceChildren(...(used.length ? used.map(i => h("span", { class: "eqt", html: u.tiles[i] })) : [h("span", { class: "muted" }, "Tap the tiles in order")])); tray.querySelectorAll("button").forEach((b, i) => (b.disabled = used.includes(i) || done)); };
    u.tiles.forEach((t, i) => tray.append(h("button", { class: "eqt", type: "button", html: t, onclick: () => { used.push(i); paint(); } })));
    const undo = h("button", { class: "btn small", type: "button", onclick: () => { used.pop(); paint(); } }, "↩ Undo");
    const check = h("button", { class: "btn primary", type: "button", onclick: () => {
      if (!used.length) return; const s = used.map(i => u.tiles[i].replace(/<[^>]+>/g, "")).join(" ");
      const ok = u.ans.includes("=") ? checkEq(u.ans, s).ok : equiv(u.ans, s);
      if (ok) { slot.classList.add("ok"); undo.disabled = check.disabled = true; finish(tries ? "second" : "first"); paint(); }
      else { tries++; slot.classList.add("no"); setTimeout(() => slot.classList.remove("no"), 500);
        if (tries >= 2) { undo.disabled = check.disabled = true; slot.replaceChildren(h("span", { class: "eqt", html: esc(u.ans).replace(/\*/g, "×").replace(/-/g, "−") })); finish("wrong", "It should read " + esc(u.ans).replace(/-/g, "−") + ". "); paint(); }
        else { fb.className = "verdict bad"; fb.textContent = "Not quite. Read the words again, one piece at a time."; } }
    } }, "Check");
    paint(); card.append(slot, tray, h("div", { class: "row" }, undo, check));
  }
  card.append(fb, nx);
  return card;
}


/* ---------- confidence check: "How sure are you?" before answering ----------
   One tap: sure / think so / guessing. A soft gate: the answers dim until he picks, but stay tappable,
   so a question is never blocked. The choice goes with the answer (cards.answer / prog.record { conf }),
   and confNote() turns choice + result into one plain sentence. */
const CONF=[{k:"sure",e:"🛡️",n:"Sure"},{k:"think",e:"🤔",n:"Think so"},{k:"guess",e:"❓",n:"Guessing"}];
function ConfidenceRow(target){
  let v=null, locked=false;
  const row=h("div",{class:"conf",role:"group","aria-label":"How sure are you?"},h("span",{class:"conf-q"},"How sure are you?"));
  CONF.forEach(c=>row.append(h("button",{class:"conf-b",type:"button","data-conf":c.k,onclick:e=>{
    if(locked) return; v=c.k; row.querySelectorAll(".conf-b").forEach(b=>b.classList.toggle("on",b===e.currentTarget));
    row.classList.add("picked"); if(target) target.classList.remove("conf-wait"); }},c.e+" "+c.n)));
  if(target) target.classList.add("conf-wait");
  return { el:row, get:()=>v, lock:()=>{ if(locked) return v; locked=true; row.querySelectorAll(".conf-b").forEach(b=>(b.disabled=true)); if(target) target.classList.remove("conf-wait"); return v; } };
}
/* a confidence row inside an existing question card: above the answer area (QuestionCard),
   or straight under the question (UnderstandCard and others) */
function attachConfidence(card){
  const stack=card.querySelector(":scope > .stack"), cf=ConfidenceRow(stack);
  if(stack) card.insertBefore(cf.el,stack);
  else { const qs=card.querySelector(":scope > .qs"); if(qs) qs.after(cf.el); else card.append(cf.el); }
  return cf;
}
/* review = the question is a review card, so the "will it come back" line is true */
function confNote(conf,right,review){
  if(!conf) return null;
  const T={
    sure:  right? ["good","🛡️ Sure and right: rock solid."] : ["bad","😮 Sure, but wrong: a surprise! Surprises are the best ones to fix. Read the reason carefully."],
    think: right? ["good","🤔 You thought so, and you were right. A little more practice makes it solid."] : ["mid","🤔 Close. Read the reason, then you'll know it next time."],
    guess: right? ["mid", review? "🍀 A lucky guess! It won't move up a box until you really know it." : "🍀 A lucky guess! Read the reason so next time it isn't a guess."] : ["mid","❓ Good honest guess. Now you've seen the answer and the reason."],
  }[conf]; if(!T) return null;
  return h("div",{class:"confnote "+T[0]},T[1]);
}

export { ConfidenceRow, attachConfidence, confNote, GapAnswer, TapAnswer, SortAnswer, OrderAnswer, LearnView, MiniQ, SymKeys, QuestionCard, AnswerBox, runSteps, runOwn, UnderstandCard, UQ_LABEL };
