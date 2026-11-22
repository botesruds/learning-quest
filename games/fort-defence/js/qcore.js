/* Question core: DOM helper, number formatting, the expression parser, answer checking and read-aloud. Shared by every content pack.
   Moved from games/algebra-quest/index.html by a script; the code below is unchanged apart from imports and exports. */
/* ================= helpers ================= */
function h(tag,attrs,...kids){
  const el=document.createElement(tag);
  if(attrs) for(const [k,v] of Object.entries(attrs)){
    if(v==null||v===false) continue;
    if(k==="class") el.className=v;
    else if(k==="html") el.innerHTML=v;
    else if(k.startsWith("on")&&typeof v==="function") el.addEventListener(k.slice(2),v);
    else el.setAttribute(k,v===true?"":v);
  }
  for(const c of kids.flat(Infinity)){ if(c==null||c===false) continue; el.append(c instanceof Node?c:document.createTextNode(String(c))); }
  return el;
}
const H=(html,cls)=>h("div",{class:cls||"",html});
const ri=(a,b)=>a+Math.floor(Math.random()*(b-a+1));
const pick=a=>a[Math.floor(Math.random()*a.length)];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const nz=(a,b)=>{let v=0;while(v===0)v=ri(a,b);return v;};
const MINUS="−";
const N=v=>{ if(typeof v!=="number") return String(v); const s=Number.isInteger(v)?String(v):String(+v.toFixed(4)); return s.replace("-",MINUS); };
const P=v=>v<0?`(${N(v)})`:N(v);           // number in brackets if negative
const sgn=v=>v<0?` ${MINUS} ${N(-v)}`:` + ${N(v)}`; // " + 3" / " − 3"
/* coefficient + letter: co(3,"x")="3x", co(1,"x")="x", co(-1,"x")="−x" */
const co=(c,v)=>c===1?v:c===-1?MINUS+v:N(c)+v;
/* linear a·v + b with nice signs */
function lin(a,v,b){
  let s=a===0?"":co(a,v);
  if(b){ s= s? s+sgn(b) : N(b); }
  return s||"0";
}
/* join terms [{c, v}] where v may be "" for constants */
function terms(list){
  let s="";
  for(const t of list){ if(!t.c) continue;
    const body= t.v? (Math.abs(t.c)===1? t.v : N(Math.abs(t.c))+t.v) : N(Math.abs(t.c));
    if(!s) s=(t.c<0?MINUS:"")+body; else s+= (t.c<0?` ${MINUS} `:" + ")+body;
  }
  return s||"0";
}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const M=s=>`<span class="m">${s}</span>`;
/* the question as one line of HTML, for screens that ask "Which idea is this?" before the answer box is shown.
   A fill-the-gap question's text lives in its gap, so it is added here (otherwise all he sees is "Fill the gap."). */
const qStem=q=>{const a=q&&q.final&&q.final.a; let s=(q&&q.q)||""; if(a&&a.gap&&a.gap.text) s+=`<br>${esc(a.gap.text).replace(/_{2,}/g,"_____")}`; return s;};
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a;};

/* ================= expression parser ================= */
/* Accepts: numbers, single letters, + - − × * · / ÷ ^ ², brackets, implicit multiplication. */
function tokenize(src){
  let s=String(src).trim().replace(/\s+/g,"").replace(/[−–—]/g,"-").replace(/[×·*]/g,"*").replace(/÷/g,"/").replace(/²/g,"^2").replace(/³/g,"^3");
  const out=[]; let i=0;
  while(i<s.length){
    const c=s[i];
    if(/[0-9.]/.test(c)){ let j=i; while(j<s.length&&/[0-9.]/.test(s[j])) j++; const t=s.slice(i,j); if((t.match(/\./g)||[]).length>1) throw new Error("num"); out.push({k:"n",v:parseFloat(t)}); i=j; continue; }
    if(/[a-zA-Z]/.test(c)){ out.push({k:"v",v:c}); i++; continue; }
    if("+-*/^()".includes(c)){ out.push({k:"o",v:c}); i++; continue; }
    if(c==="="){ out.push({k:"o",v:"="}); i++; continue; }
    throw new Error("bad char "+c);
  }
  // implicit multiplication
  const res=[];
  for(let j=0;j<out.length;j++){
    const a=res[res.length-1], b=out[j];
    if(a){ const aEnd=a.k==="n"||a.k==="v"||(a.k==="o"&&a.v===")"); const bStart=b.k==="n"||b.k==="v"||(b.k==="o"&&b.v==="(");
      if(aEnd&&bStart&&!(a.k==="n"&&b.k==="n")) res.push({k:"o",v:"*",imp:true}); }
    res.push(b);
  }
  return res;
}
function parse(src){
  const t=tokenize(src); let p=0;
  const peek=()=>t[p], eat=v=>{ if(t[p]&&t[p].v===v){p++;return true;} return false; };
  function expr(){ let n=term(); for(;;){ if(eat("+")) n={op:"+",a:n,b:term()}; else if(eat("-")) n={op:"-",a:n,b:term()}; else return n; } }
  function term(){ let n=unary(); for(;;){ if(eat("*")) n={op:"*",a:n,b:unary()}; else if(eat("/")) n={op:"/",a:n,b:unary()}; else return n; } }
  function unary(){ if(eat("-")) return {op:"neg",a:unary()}; if(eat("+")) return unary(); return pow(); }
  function pow(){ let b=atom(); if(eat("^")){ const e=unary(); return {op:"^",a:b,b:e}; } return b; }
  function atom(){ const k=peek(); if(!k) throw new Error("end");
    if(k.k==="n"){p++;return {n:k.v};} if(k.k==="v"){p++;return {v:k.v};}
    if(eat("(")){ const e=expr(); if(!eat(")")) throw new Error(")"); return {op:"()",a:e}; }
    throw new Error("unexpected "+k.v); }
  const tree=expr(); if(p<t.length) throw new Error("extra");
  return tree;
}
function evalT(n,env){
  if("n" in n) return n.n;
  if("v" in n){ const k=n.v; if(!(k in env)) throw new Error("var "+k); return env[k]; }
  switch(n.op){ case "+":return evalT(n.a,env)+evalT(n.b,env); case "-":return evalT(n.a,env)-evalT(n.b,env);
    case "*":return evalT(n.a,env)*evalT(n.b,env); case "/":return evalT(n.a,env)/evalT(n.b,env);
    case "^":return Math.pow(evalT(n.a,env),evalT(n.b,env)); case "neg":return -evalT(n.a,env); case "()":return evalT(n.a,env); }
}
function varsOf(n,set=new Set()){ if("v" in n) set.add(n.v); if(n.a) varsOf(n.a,set); if(n.b) varsOf(n.b,set); return set; }
function stripLHS(s){ s=String(s).trim(); const m=s.match(/^\s*([a-zA-Z])\s*=\s*(.+)$/); return m? m[2] : s; }
function numVal(s){ try{ const t=parse(stripLHS(s)); if(varsOf(t).size) return null; const v=evalT(t,{}); return isFinite(v)?v:null; }catch(e){ return null; } }
function equiv(a,b){
  let A,B; try{ A=parse(stripLHS(a)); B=parse(stripLHS(b)); }catch(e){ return false; }
  const vs=new Set([...varsOf(A),...varsOf(B)]);
  for(let k=0;k<6;k++){
    const env={}; for(const v of vs) env[v]=[1.37,2.91,-0.73,3.53,0.61,-1.83][(k+v.charCodeAt(0))%6]+k*0.17;
    let x,y; try{ x=evalT(A,env); y=evalT(B,env); }catch(e){ return false; }
    if(!isFinite(x)||!isFinite(y)) return false;
    if(Math.abs(x-y)>1e-7*Math.max(1,Math.abs(x),Math.abs(y))) return false;
  }
  return true;
}
/* "simplified" = no brackets, no ×/÷ signs, each top-level term has ≤1 number and each letter once, at most maxTerms terms */
function topTerms(src){
  const t=tokenize(stripLHS(src)); const list=[]; let cur=[], depth=0;
  t.forEach((k,i)=>{ if(k.v==="(")depth++; if(k.v===")")depth--;
    if(depth===0&&(k.v==="+"||k.v==="-")&&i>0&&!(t[i-1].k==="o"&&t[i-1].v!==")")){ list.push(cur); cur=[]; } else cur.push(k); });
  list.push(cur); return list.filter(x=>x.length);
}
function isSimplified(src,maxTerms){
  try{
    const t=tokenize(stripLHS(src));
    if(t.some(k=>k.v==="("||k.v===")"||(k.k==="o"&&!k.imp&&(k.v==="*"||k.v==="/")))) return false;
    const tt=topTerms(src); if(maxTerms!=null&&tt.length>maxTerms) return false;
    const sig=new Set();
    for(const term of tt){ const nums=term.filter((k,i)=>k.k==="n"&&!(i>0&&term[i-1].v==="^")); if(nums.length>1) return false;
      const letters=term.filter(k=>k.k==="v").map(k=>k.v); if(new Set(letters).size!==letters.length) return false;
      const key=letters.slice().sort().join("")+"|"+term.filter((k,i)=>i>0&&term[i-1].v==="^").map(k=>k.v).join(",");
      if(sig.has(key)) return false; sig.add(key); }
    return true;
  }catch(e){ return false; }
}
/* answer checking. spec: {num}, {expr, simp, terms}, {choice}, {any:[...]}, {words:[...]} */
function checkAns(spec,input){
  const s=String(input||"").trim(); if(!s) return {ok:false,empty:true};
  if("num" in spec){ const v=numVal(s); if(v==null) return {ok:false,msg:"Type a number (like 7, −3 or 2.5)."}; return {ok:Math.abs(v-spec.num)<1e-6}; }
  if("expr" in spec){
    let ok=false; try{ ok=equiv(s,spec.expr); }catch(e){}
    if(!ok){ try{ parse(stripLHS(s)); }catch(e){ return {ok:false,msg:"I couldn't read that. Use letters, numbers, + − and brackets."}; } return {ok:false}; }
    if(spec.simp && !isSimplified(s,spec.terms)) return {ok:false,close:true,msg:"That's equal, but not finished. Collect it into the simplest form."};
    if(spec.noBr && /[()]/.test(s)) return {ok:false,close:true,msg:"That's equal, but the brackets should be gone."};
    return {ok:true};
  }
  if("words" in spec){
    /* key words: small spelling slips are fine (one letter wrong in a short word, two in a long one); the right spelling is shown */
    const norm=t=>String(t).toLowerCase().replace(/[^a-z0-9 ]+/g," ").replace(/\b(the|a|an)\b/g," ").replace(/\s+/g," ").trim();
    const got=norm(s);
    for(const w of spec.words){ const want=norm(w); if(got===want||got===want+"s"||got+"s"===want) return {ok:true};
      const d=lev(got,want), allow=want.length>=8?2:want.length>=4?1:0; if(d<=allow) return {ok:true,spell:spec.words[0]}; }
    return {ok:false};
  }
  return {ok:false};
}

/* edit distance where swapping two neighbouring letters ("tednon") counts as one slip */
function lev(a,b){ const m=a.length,n=b.length; if(Math.abs(m-n)>2) return 9; let pp=null, prev=Array.from({length:n+1},(_,j)=>j);
  for(let i=1;i<=m;i++){ const cur=[i]; for(let j=1;j<=n;j++){ cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));
      if(pp&&i>1&&j>1&&a[i-1]===b[j-2]&&a[i-2]===b[j-1]) cur[j]=Math.min(cur[j],pp[j-2]+1); } pp=prev; prev=cur; } return prev[n]; }

/* ================= speech ================= */
function speakable(txt){
  return String(txt).replace(/<[^>]+>/g," ").replace(/&[a-z]+;/g," ")
    .replace(/([a-z0-9)])²/gi,"$1 squared").replace(/\^2/g," squared")
    .replace(/−/g," minus ").replace(/×/g," times ").replace(/÷/g," divided by ").replace(/=/g," equals ")
    .replace(/(\d)([a-z])\b/g,"$1 $2").replace(/\bn\b/g,"n").replace(/\s+/g," ").trim();
}
function say(txt){ try{ const s=window.speechSynthesis; if(!s) return; s.cancel(); const u=new SpeechSynthesisUtterance(speakable(txt)); u.lang="en-GB"; u.rate=.92; s.speak(u); }catch(e){} }
function SayBtn(getText){ return h("button",{class:"say",type:"button",title:"Read this out loud",onclick:()=>say(typeof getText==="function"?getText():getText)},"🔊 Read"); }
function checkEq(want,got){
  const g=String(got).replace(/[−–]/g,"-"); if(!g.includes("=")) return {ok:false,msg:"Write it as an equation, with an = sign."};
  const [a,b]=want.split("="), [c,d]=g.split("=");
  if(!c||!d) return {ok:false};
  const ok=equiv(`(${a})-(${b})`,`(${c})-(${d})`)||equiv(`(${a})-(${b})`,`(${d})-(${c})`);
  return {ok};
}
export { lev, h, H, ri, pick, shuffle, nz, MINUS, N, P, sgn, co, lin, terms, esc, M, gcd, tokenize, parse, evalT, varsOf, stripLHS, numVal, equiv, topTerms, isSimplified, checkAns, speakable, say, SayBtn, checkEq, qStem };
