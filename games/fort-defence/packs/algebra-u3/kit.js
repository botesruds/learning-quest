/* Algebra Unit 3 kit: the visual models (bags, tiles, number line, area grid, balance, machine, patterns, flowcharts) and the interactive tools.
   Moved from games/algebra-quest/index.html by a script; the code below is unchanged apart from imports and exports. */
import { h, H, ri, pick, shuffle, nz, MINUS, N, P, sgn, co, lin, terms, esc, M, gcd, tokenize, parse, evalT, varsOf, stripLHS, numVal, equiv, topTerms, isSimplified, checkAns, speakable, say, SayBtn, checkEq } from "../../js/qcore.js";
/* ================= visuals (SVG) ================= */
const SV=(w,hh,inner,label)=>`<svg viewBox="0 0 ${w} ${hh}" width="${w}" height="${hh}" role="img" aria-label="${esc(label||"diagram")}" style="font-family:var(--f-mono)">${inner}</svg>`;
const T=(x,y,s,o={})=>`<text x="${x}" y="${y}" text-anchor="${o.a||"middle"}" dominant-baseline="central" style="fill:${o.fill||"var(--ink)"};font-size:${o.size||15}px;font-weight:${o.w||700};${o.style||""}">${esc(s)}</text>`;
function vis(svg,cls){ return h("div",{class:"vis "+(cls||""),html:svg}); }

/* ---- mystery bags and marbles ---- */
function bagSVG(x,y,label,col){
  col=col||"var(--xt)";
  return `<g transform="translate(${x},${y})"><path d="M14 10 Q8 0 18 2 L32 2 Q42 0 36 10 Q50 22 46 44 Q44 56 25 56 Q6 56 4 44 Q0 22 14 10 Z" style="fill:color-mix(in srgb,${col} 22%,var(--surface));stroke:${col};stroke-width:2.5"/><path d="M13 11 L37 11" style="stroke:${col};stroke-width:3"/>${T(25,36,label,{fill:col,size:20,style:"font-family:var(--f-display)"})}</g>`;
}
function dotsSVG(x,y,n,neg){
  let s=""; const cols=Math.min(n,5);
  for(let i=0;i<n;i++){ const cx=x+9+(i%cols)*19, cy=y+28+Math.floor(i/cols)*19-(n>5?9:0);
    s+=`<circle cx="${cx}" cy="${cy}" r="8" style="fill:${neg?"var(--neg)":"var(--one)"};stroke:color-mix(in srgb,var(--ink) 25%,transparent)"/>`; }
  return {s,w:cols*19+2};
}
/* items: "bag:n", "dots:3", "op:+", "txt:= 11" */
function bags(items,label){
  let x=6, s=""; const hh=66;
  for(const it of items){ const [k,v]=it.split(":");
    if(k==="bag"){ s+=bagSVG(x,4,v); x+=56; }
    else if(k==="dots"){ const d=dotsSVG(x,4,+v); s+=d.s; x+=d.w+8; }
    else if(k==="neg"){ const d=dotsSVG(x,4,+v,true); s+=d.s; x+=d.w+8; }
    else if(k==="op"){ s+=T(x+10,34,v,{size:24}); x+=24; }
    else if(k==="txt"){ s+=T(x,34,v,{a:"start",size:22,style:"font-family:var(--f-display)"}); x+=v.length*13+12; }
  }
  return vis(SV(x+6,hh,s,label||"bags and marbles"));
}

/* ---- algebra tiles ---- */
const TILE={x:{w:62,h:22,col:"var(--xt)"},y:{w:44,h:22,col:"var(--yt)"},x2:{w:44,h:44,col:"var(--x2t)"},"":{w:20,h:20,col:"var(--one)"}};
function tileSVG(x,y,v,neg,style){
  const t=TILE[style||v]||TILE[""]; const col=neg?"var(--neg)":t.col; const lab=v==="x2"?"x²":v;
  return `<g transform="translate(${x},${y})"><rect width="${t.w}" height="${t.h}" rx="4" style="fill:color-mix(in srgb,${col} ${neg?30:28}%,var(--surface));stroke:${col};stroke-width:2;${neg?"stroke-dasharray:5 3":""}"/>${lab||neg?T(t.w/2,t.h/2,(neg?"−":"")+lab,{fill:col,size:v===""?12:14}):""}</g>`;
}
/* groups: [{v:"x",c:3},{v:"",c:-2}] → drawn as clusters */
function tiles(groups,opts={}){
  let x=6,s=""; const hh=58;
  groups.forEach((g,gi)=>{
    const n=Math.abs(g.c), t=TILE[g.s||g.v]||TILE[""];
    if(gi>0 && opts.plus!==false){ s+=T(x+8,hh/2,"+",{size:18,fill:"var(--muted)"}); x+=20; }
    for(let i=0;i<n;i++){ s+=tileSVG(x,(hh-t.h)/2,g.v,g.c<0,g.s); x+=t.w+4; }
    if(opts.label){ s+=""; }
  });
  return vis(SV(x+6,hh,s,"algebra tiles"));
}

/* ---- number line with jumps ---- */
function numberLine(o){
  const min=o.min, max=o.max, W=Math.max(360,(max-min)*30+40), hh=110, y=74;
  const X=v=>20+(v-min)*(W-40)/(max-min);
  let s=`<line x1="10" y1="${y}" x2="${W-10}" y2="${y}" style="stroke:var(--ink);stroke-width:2"/>`;
  const stepL=(max-min)>26?5:(max-min)>16?2:1;
  for(let v=min;v<=max;v++){ const big=v%stepL===0; s+=`<line x1="${X(v)}" y1="${y-(big?7:4)}" x2="${X(v)}" y2="${y+(big?7:4)}" style="stroke:var(--ink);stroke-width:${v===0?3:1.5}"/>`; if(big) s+=T(X(v),y+20,N(v),{size:13,w:v===0?800:500}); }
  let at=o.start; const cols=["var(--xt)","var(--c3)","var(--c4)","var(--c2)"];
  if(o.start!=null) s+=`<circle cx="${X(o.start)}" cy="${y}" r="7" style="fill:var(--accent)"/>`;
  (o.jumps||[]).forEach((j,k)=>{
    const to=at+j, x1=X(at), x2=X(to), mid=(x1+x2)/2, top=y-26-Math.min(26,Math.abs(x2-x1)/6);
    const c=cols[k%cols.length];
    s+=`<path d="M${x1} ${y-6} Q${mid} ${top-12} ${x2} ${y-6}" style="fill:none;stroke:${c};stroke-width:2.5"/><path d="M${x2} ${y-6} l${x2>x1?-8:8} -6 l0 10 Z" style="fill:${c}"/>`;
    s+=T(mid,top-14,(j>0?"+":MINUS)+N(Math.abs(j)),{size:13,fill:c});
    at=to;
  });
  if(o.end!==false && o.jumps&&o.jumps.length) s+=`<rect x="${X(at)-7}" y="${y-7}" width="14" height="14" transform="rotate(45 ${X(at)} ${y})" style="fill:var(--good)"/>`;
  if(o.mark!=null) s+=`<circle cx="${X(o.mark)}" cy="${y}" r="7" style="fill:none;stroke:var(--bad);stroke-width:3"/>`;
  return vis(SV(W,hh,s,"number line"));
}

/* ---- area grid for brackets / multiplying ---- */
/* o: {left:"3", parts:["x","2"], prods:["3x","6"], hide:[false,true]} */
function areaGrid(o){
  const ws=o.parts.map(p=>/[a-z]/i.test(p)?120:70), hh=90, x0=56, y0=30, W=x0+ws.reduce((a,b)=>a+b,0)+12;
  let s=T(x0/2,y0+hh/2,o.left,{size:20,fill:"var(--c3)"}), x=x0;
  o.parts.forEach((p,i)=>{
    const col=[ "var(--xt)","var(--one)","var(--yt)"][i%3];
    s+=`<rect x="${x}" y="${y0}" width="${ws[i]}" height="${hh}" style="fill:color-mix(in srgb,${col} 18%,var(--surface));stroke:var(--ink);stroke-width:1.5"/>`;
    s+=T(x+ws[i]/2,y0-14,p,{size:17,fill:col});
    const pr=o.hide&&o.hide[i]?"?":o.prods[i];
    s+=T(x+ws[i]/2,y0+hh/2,pr,{size:19,style:"font-family:var(--f-display)"});
    x+=ws[i];
  });
  return vis(SV(W,y0+hh+8,s,"area grid"));
}

/* ---- balance scale ---- */
/* sides: arrays of "x" (mystery box), numbers (unit weights). */
function balanceSVG(L,R,o={}){
  const W=440, hh=250, cx=W/2, tilt=o.tilt||0, beamY=40, D=150;
  const ang=tilt*6;
  let s=`<path d="M${cx-40} ${hh-6} L${cx+40} ${hh-6} L${cx} ${beamY+6} Z" style="fill:var(--surface-2);stroke:var(--muted);stroke-width:2"/>`;
  s+=`<g transform="rotate(${ang} ${cx} ${beamY})"><rect x="${cx-190}" y="${beamY-5}" width="380" height="10" rx="5" style="fill:var(--muted)"/>`;
  const pan=(px,items)=>{
    let g=`<line x1="${px}" y1="${beamY}" x2="${px-50}" y2="${beamY+D}" style="stroke:var(--muted);stroke-width:1.5"/><line x1="${px}" y1="${beamY}" x2="${px+50}" y2="${beamY+D}" style="stroke:var(--muted);stroke-width:1.5"/><path d="M${px-70} ${beamY+D} L${px+70} ${beamY+D} Q${px+60} ${beamY+D+20} ${px} ${beamY+D+20} Q${px-60} ${beamY+D+20} ${px-70} ${beamY+D} Z" style="fill:var(--surface);stroke:var(--ink);stroke-width:2"/>`;
    // items stacked above pan
    const boxes=items.filter(it=>it==="x").length; let units=0, blocks=[];
    items.forEach(it=>{ if(typeof it==="number"){ if(it<=15) units+=it; else blocks.push(it); } });
    let yy=beamY+D-2;
    // x boxes on the bottom row(s), 4 per row
    for(let i=0;i<boxes;i++){ const r=Math.floor(i/4), c=i%4, xx=px-62+c*32, by=beamY+D-2-30-r*32;
      g+=`<rect x="${xx}" y="${by}" width="30" height="30" rx="4" style="fill:color-mix(in srgb,var(--xt) 30%,var(--surface));stroke:var(--xt);stroke-width:2"/>`+T(xx+15,by+15,o.letter||"x",{fill:"var(--xt)",size:16}); }
    const boxRows=Math.ceil(boxes/4); let base=beamY+D-2-boxRows*32;
    let bx=px-62+(boxes%4&&boxRows===1?(boxes%4)*32:0);
    if(boxes&&boxes%4&&boxRows>=1){ bx=px-62+(boxes%4)*32; base=beamY+D-2-(boxRows-1)*32; }
    blocks.forEach(v=>{ g+=`<rect x="${bx}" y="${base-26}" width="40" height="26" rx="4" style="fill:color-mix(in srgb,var(--one) 45%,var(--surface));stroke:var(--one);stroke-width:2"/>`+T(bx+20,base-13,v,{size:13}); bx+=44; });
    let perRow=Math.floor((px+66-bx)/20);
    if(perRow<5&&units>perRow*2){ bx=px-62; base=beamY+D-2-boxRows*32-(blocks.length?28:0); perRow=6; }
    for(let i=0;i<units;i++){ const r=Math.floor(i/perRow), c=i%perRow; const ux=bx+c*20, uy=base-18-r*20;
      g+=`<rect x="${ux}" y="${uy}" width="18" height="18" rx="3" style="fill:color-mix(in srgb,var(--one) 45%,var(--surface));stroke:var(--one);stroke-width:1.5"/>`; }
    return g;
  };
  s+=pan(cx-150,L)+pan(cx+150,R)+`</g>`;
  s+=`<circle cx="${cx}" cy="${beamY}" r="6" style="fill:var(--ink)"/>`;
  if(o.caption) s+=T(cx,16,o.caption,{size:16,style:"font-family:var(--f-display)"});
  return SV(W,hh,s,"balance scale");
}
const balance=(L,R,o)=>vis(balanceSVG(L,R,o));

/* ---- function machine ---- */
function machineSVG(o){
  const ops=o.ops, bw=84, gap=34, W=20+(ops.length)*(bw+gap)+150, hh=96, y=48;
  let s="", x=16;
  s+=`<rect x="${x}" y="${y-22}" width="58" height="44" rx="22" style="fill:var(--surface-2);stroke:var(--ink);stroke-width:1.5"/>`+T(x+29,y,o.input==null?"?":o.input,{size:18}); x+=58;
  ops.forEach((op,i)=>{
    s+=`<path d="M${x+4} ${y} L${x+gap-6} ${y}" style="stroke:var(--ink);stroke-width:2"/><path d="M${x+gap-4} ${y} l-8 -5 l0 10 Z" style="fill:var(--ink)"/>`; x+=gap;
    const on=o.hi===i;
    s+=`<rect x="${x}" y="${y-28}" width="${bw}" height="56" rx="8" style="fill:color-mix(in srgb,var(--c${(i%4)+1}) ${on?34:16}%,var(--surface));stroke:var(--c${(i%4)+1});stroke-width:${on?3.5:2}"/>`+T(x+bw/2,y,op,{size:20,fill:`var(--c${(i%4)+1})`,style:"font-family:var(--f-display)"});
    if(o.mid&&o.mid[i]!=null) s+=T(x+bw+gap/2,y-20,o.mid[i],{size:13,fill:"var(--muted)"});
    x+=bw;
  });
  s+=`<path d="M${x+4} ${y} L${x+gap-6} ${y}" style="stroke:var(--ink);stroke-width:2"/><path d="M${x+gap-4} ${y} l-8 -5 l0 10 Z" style="fill:var(--ink)"/>`; x+=gap;
  s+=`<rect x="${x}" y="${y-22}" width="64" height="44" rx="22" style="fill:var(--surface-2);stroke:var(--ink);stroke-width:1.5"/>`+T(x+32,y,o.output==null?"?":o.output,{size:18}); x+=64;
  if(o.back) s+=`<path d="M${x-30} ${y+30} Q${(x+16)/2} ${y+56} 46 ${y+30}" style="fill:none;stroke:var(--c5);stroke-width:2;stroke-dasharray:6 4"/><path d="M44 ${y+28} l9 1 l-5 8 Z" style="fill:var(--c5)"/>`;
  return SV(x+10,hh+(o.back?10:0),s,"function machine");
}
const machine=o=>vis(machineSVG(o));

/* ---- patterns ---- */
const PATS={
  sq:{name:"squares made of matchsticks",a:3,b:1,stick:true},
  tri:{name:"triangles made of matchsticks",a:2,b:1,stick:true},
  sq2:{name:"two rows of squares made of matchsticks",a:5,b:2,stick:true},
};
function stickSVG(kind,n,o={}){
  const L=34; let s=""; const st=(x1,y1,x2,y2,c)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" style="stroke:${c||"var(--c3)"};stroke-width:5;stroke-linecap:round"/>`;
  const first=o.colour?"var(--c4)":"var(--c3)";
  let W=0,hh=0; const ox=10, oy=10;
  if(kind==="sq"){ W=ox*2+n*L; hh=oy*2+L;
    s+=st(ox,oy,ox,oy+L,first);
    for(let i=0;i<n;i++){ const x=ox+i*L, c=o.colour?["var(--xt)","var(--c2)"][i%2]:undefined; s+=st(x,oy,x+L,oy,c)+st(x,oy+L,x+L,oy+L,c)+st(x+L,oy,x+L,oy+L,c); } }
  else if(kind==="tri"){ const hgt=L*0.87; W=ox*2+(n+1)*L/2+L/2; hh=oy*2+hgt;
    s+=st(ox,oy+hgt,ox+L/2,oy,first);
    for(let i=0;i<n;i++){ const c=o.colour?["var(--xt)","var(--c2)"][i%2]:undefined;
      if(i%2===0){ const x=ox+i*L/2; s+=st(x,oy+hgt,x+L,oy+hgt,c)+st(x+L,oy+hgt,x+L/2,oy,c); }
      else { const x=ox+(i-1)*L/2+L/2; s+=st(x,oy,x+L,oy,c)+st(x+L,oy,x+L/2,oy+hgt,c); } } }
  else if(kind==="sq2"){ W=ox*2+n*L; hh=oy*2+2*L;
    s+=st(ox,oy,ox,oy+L,first)+st(ox,oy+L,ox,oy+2*L,first);
    for(let i=0;i<n;i++){ const x=ox+i*L, c=o.colour?["var(--xt)","var(--c2)"][i%2]:undefined; s+=st(x,oy,x+L,oy,c)+st(x,oy+L,x+L,oy+L,c)+st(x,oy+2*L,x+L,oy+2*L,c)+st(x+L,oy,x+L,oy+L,c)+st(x+L,oy+L,x+L,oy+2*L,c); } }
  return {s,W,hh};
}
/* dots pattern: a·n + b → b grey dots then n columns of a coloured dots; quad: n×n square (+c grey) */
function dotSVG(a,b,n,o={}){
  const r=6, g=17; let s=""; let x=10;
  if(o.quad){ const k=o.k||1;
    for(let q=0;q<k;q++){ for(let i=0;i<n;i++) for(let j=0;j<n;j++) s+=`<circle cx="${x+r+i*g}" cy="${10+r+j*g}" r="${r}" style="fill:var(--x2t)"/>`; x+=n*g+10; }
    for(let i=0;i<b;i++) s+=`<circle cx="${x+r+(i%3)*g}" cy="${10+r+Math.floor(i/3)*g}" r="${r}" style="fill:var(--grey)"/>`;
    if(b>0) x+=Math.min(b,3)*g;
    return {s,W:x+10,hh:Math.max(n,Math.ceil(b/3))*g+20};
  }
  for(let i=0;i<b;i++) s+=`<circle cx="${x+r}" cy="${10+r+i*g}" r="${r}" style="fill:var(--grey)"/>`;
  if(b>0) x+=g+6;
  for(let c=0;c<n;c++){ for(let i=0;i<a;i++) s+=`<circle cx="${x+r+c*g}" cy="${10+r+i*g}" r="${r}" style="fill:${["var(--xt)","var(--c2)"][c%2]}"/>`; }
  x+=n*g;
  return {s,W:x+10,hh:Math.max(a,b)*g+20};
}
/* show shapes 1..k side by side with labels */
function patternRow(kind,k,o={}){
  let s="", x=0, maxH=0; const parts=[];
  for(let n=1;n<=k;n++){
    const p= kind.dots? dotSVG(kind.a,kind.b,n,kind) : stickSVG(kind,n,o);
    parts.push({p,n}); maxH=Math.max(maxH,p.hh); }
  for(const {p,n} of parts){ s+=`<g transform="translate(${x},0)">${p.s}${T(p.W/2,maxH+14,(o.lab||"Shape ")+n,{size:12,fill:"var(--muted)"})}</g>`; x+=p.W+18; }
  if(o.more) s+=T(x+10,maxH/2,"…",{size:24,fill:"var(--muted)"}), x+=30;
  return vis(SV(x,maxH+28,s,"pattern"));
}

/* ---- flowchart ---- */
/* nodes: {t:"start"|"stop"|"io"|"do"|"if", s:text, yes:text (side box), yesTo:index (where the yes box rejoins), back:index (loop: No → back up)} */
function flowSVG(nodes,cur){
  const W=470, cx=170, bh=40, gap=24; let y=10; const tops=[], hs=[];
  nodes.forEach(n=>{ const hh=n.t==="if"?60:bh; tops.push(y); hs.push(hh); y+=hh+gap; });
  const H=y-gap+12; let s="";
  const mid=i=>tops[i]+hs[i]/2;
  nodes.forEach((n,i)=>{
    const top=tops[i], hh=hs[i], on=cur===i, stroke=on?"var(--accent)":"var(--ink)", sw=on?3.5:1.6, fill=on?"var(--accent-soft)":"var(--surface)";
    if(n.t==="start"||n.t==="stop") s+=`<rect x="${cx-70}" y="${top}" width="140" height="${hh}" rx="20" style="fill:${fill};stroke:${stroke};stroke-width:${sw}"/>`;
    else if(n.t==="io") s+=`<path d="M${cx-90} ${top+hh} L${cx-70} ${top} L${cx+100} ${top} L${cx+80} ${top+hh} Z" style="fill:${fill};stroke:${stroke};stroke-width:${sw}"/>`;
    else if(n.t==="do") s+=`<rect x="${cx-95}" y="${top}" width="190" height="${hh}" rx="3" style="fill:${fill};stroke:${stroke};stroke-width:${sw}"/>`;
    else if(n.t==="if"){
      s+=`<path d="M${cx} ${top} L${cx+115} ${top+hh/2} L${cx} ${top+hh} L${cx-115} ${top+hh/2} Z" style="fill:${fill};stroke:${stroke};stroke-width:${sw}"/>`;
      if(n.yes!=null){ const on2=cur===i+0.5, by=top+hh/2;
        s+=`<path d="M${cx+115} ${by} L${cx+150} ${by}" style="stroke:var(--ink);stroke-width:1.6"/>`+T(cx+132,by-11,"Yes",{size:11,fill:"var(--good)"});
        s+=`<rect x="${cx+150}" y="${by-18}" width="140" height="36" rx="3" style="fill:${on2?"var(--accent-soft)":"var(--surface)"};stroke:${on2?"var(--accent)":"var(--ink)"};stroke-width:${on2?3.5:1.6}"/>`+T(cx+220,by,n.yes,{size:13});
        if(n.yesTo!=null){ const ty=mid(n.yesTo); s+=`<path d="M${cx+220} ${by+18} L${cx+220} ${ty} L${cx+104} ${ty}" style="fill:none;stroke:var(--ink);stroke-width:1.6"/><path d="M${cx+100} ${ty} l9 -5 l0 10 Z" style="fill:var(--ink)"/>`; }
        s+=T(cx+16,top+hh+9,"No",{size:11,fill:"var(--bad)"});
      } else if(n.back!=null) s+=T(cx+18,top+hh+9,"Yes",{size:11,fill:"var(--good)"});
    }
    s+=T(cx,top+hh/2,n.s,{size:n.t==="if"?13:14,w:n.t==="start"||n.t==="stop"?800:700});
    if(i<nodes.length-1) s+=`<path d="M${cx} ${top+hh} L${cx} ${top+hh+gap-6}" style="stroke:var(--ink);stroke-width:1.6"/><path d="M${cx} ${top+hh+gap-1} l-5 -8 l10 0 Z" style="fill:var(--ink)"/>`;
  });
  nodes.forEach((n,i)=>{ if(n.t==="if"&&n.back!=null){ const y1=mid(i), y2=mid(n.back);
    s+=`<path d="M${cx-115} ${y1} L${cx-140} ${y1} L${cx-140} ${y2} L${cx-102} ${y2}" style="fill:none;stroke:var(--c5);stroke-width:2"/><path d="M${cx-96} ${y2} l-9 -5 l0 10 Z" style="fill:var(--c5)"/>`+T(cx-146,(y1+y2)/2,"No",{size:11,fill:"var(--bad)",a:"end"}); } });
  return SV(W,H,s,"flowchart");
}
/* ================= interactive tools ================= */
function numIn(val,min,max,onch){ const i=h("input",{type:"number",value:val,min,max,step:1}); i.addEventListener("input",()=>{ const v=parseInt(i.value,10); if(!isNaN(v)) onch(Math.max(min,Math.min(max,v))); }); return i; }

function NumberLineTool(init){
  let a=init?init.a:-3, op=init?init.op:"+", b=init?init.b:5;
  const out=h("div",{class:"out"}), pic=h("div"), why=h("div",{class:"why"});
  const sel=h("select",{},h("option",{value:"+"},"+  add"),h("option",{value:"-"},"−  subtract"),h("option",{value:"x"},"×  multiply"));
  sel.value=op; sel.addEventListener("change",()=>{op=sel.value;draw();});
  function draw(){
    let res, jumps, txt;
    if(op==="+"){ res=a+b; jumps=[b];
      txt= b>=0? `Start at ${N(a)}. Adding ${N(b)} means walk <b>right</b> ${N(b)}.` : `Start at ${N(a)}. Adding a negative means walk <b>left</b>. Walk left ${N(-b)}.`; }
    else if(op==="-"){ res=a-b; jumps=[-b];
      txt= b>=0? `Start at ${N(a)}. Subtracting ${N(b)} means walk <b>left</b> ${N(b)}.` : `Start at ${N(a)}. Subtracting a negative flips the direction: walk <b>right</b> ${N(-b)}. So ${N(a)} − (${N(b)}) is the same as ${N(a)} + ${N(-b)}.`; }
    else { res=a*b; const step=a, k=Math.abs(b); jumps=[]; for(let i=0;i<k&&i<12;i++) jumps.push(b<0?-step:step);
      txt= `${N(b)} × ${P(a)}: make ${k} jumps of ${N(Math.abs(a))}`+(b<0?`, but the negative sign turns you round`:"")+`. Times tables give the size (${Math.abs(a)} × ${k} = ${Math.abs(a*b)}), the signs give the direction.`; }
    const all=[a,res,0]; let pos=op==="x"?0:a; if(op==="x") for(const j of jumps){pos+=j;all.push(pos);}
    const min=Math.min(...all)-2, max=Math.max(...all)+2;
    pic.replaceChildren(numberLine({min,max,start:op==="x"?0:a,jumps}));
    out.textContent= op==="x"? `${N(b)} × ${P(a)} = ${N(res)}` : `${N(a)} ${op==="+"?"+":MINUS} ${P(b)} = ${N(res)}`;
    why.innerHTML=txt;
  }
  draw();
  return h("div",{class:"tool"},h("div",{class:"ctl"},"Start ",numIn(a,-20,20,v=>{a=v;draw();}),sel,numIn(b,-12,12,v=>{b=v;draw();})),h("div",{class:"scroll-x"},pic),out,why);
}

/* balance solver: ax + b = cx + d */
function BalanceTool(eq,onSolved){
  const start=eq||{a:2,b:3,c:0,d:11}; let st={...start}; const hist=[];
  const pic=h("div"), txt=h("div",{class:"qs"}), msg=h("div"), ctl=h("div",{class:"ctl"});
  const side=(k,n)=>{ const r=[]; for(let i=0;i<k;i++) r.push("x"); if(n) r.push(n); return r; };
  const eqText=()=>`${lin(st.a,"x",st.b)} = ${lin(st.c,"x",st.d)}`;
  function act(kind,v){
    const s={...st};
    if(kind==="sub1"){ if(Math.min(s.b,s.d)<v){ return note(`You can't take ${v} from both sides: one side hasn't got ${v} weights.`,"bad"); } s.b-=v; s.d-=v; hist.push(`Take ${v} from both sides`); }
    if(kind==="subx"){ if(Math.min(s.a,s.c)<1) return note("One side has no x boxes to take away.","bad"); s.a--; s.c--; hist.push("Take one x from both sides"); }
    if(kind==="div"){ if(s.a%v||s.b%v||s.c%v||s.d%v) return note(`Not everything on the scale splits into ${v} equal groups yet.`,"bad"); s.a/=v;s.b/=v;s.c/=v;s.d/=v; hist.push(`Split both sides into ${v} groups, keep one`); }
    st=s; draw();
  }
  function note(t,k){ msg.className="verdict "+(k||"mid"); msg.innerHTML=t; }
  function draw(){
    pic.replaceChildren(balance(side(st.a,st.b),side(st.c,st.d)));
    txt.textContent=eqText();
    msg.className=""; msg.textContent="";
    const solved=(st.a===1&&st.b===0&&st.c===0)||(st.c===1&&st.d===0&&st.a===0);
    ctl.replaceChildren();
    if(solved){ const v=st.a===1?st.d:st.b; note(`<b>Solved: x = ${N(v)}.</b> Every move kept the scale level, so x is still the same number it was at the start. Check: put ${N(v)} in place of x and both sides of ${lin(start.a,"x",start.b)} = ${lin(start.c,"x",start.d)} give ${N(start.a*v+start.b)}.`,"good"); if(onSolved) onSolved(v); }
    else {
      const small=Math.min(st.b,st.d);
      if(small>0) ctl.append(h("button",{class:"btn small",type:"button",onclick:()=>act("sub1",small)},`Take ${small} from both sides`));
      if(st.a>0&&st.c>0) ctl.append(h("button",{class:"btn small",type:"button",onclick:()=>act("subx")},"Take an x from both sides"));
      const k=st.a||st.c; if(k>1 && ((st.a===0&&st.b===0)||(st.c===0&&st.d===0)||small===0)) ctl.append(h("button",{class:"btn small",type:"button",onclick:()=>act("div",k)},`Split both sides into ${k} equal groups`));
    }
    ctl.append(h("button",{class:"btn small",type:"button",onclick:()=>{st={...start};hist.length=0;draw();}},"Start again"));
  }
  draw();
  return h("div",{class:"tool"},h("div",{class:"scroll-x"},pic),txt,ctl,msg);
}

function MachineTool(){
  let o1="×", n1=3, o2="+", n2=2, x=4, back=false;
  const pic=h("div",{class:"scroll-x"}), why=h("div",{class:"why"});
  const opSel=(v,f)=>{ const s=h("select",{},...["+","−","×","÷"].map(o=>h("option",{value:o},o))); s.value=v; s.addEventListener("change",()=>f(s.value)); return s; };
  const ap=(o,v,n)=>o==="+"?v+n:o==="−"?v-n:o==="×"?v*n:v/n;
  const inv={"+":"−","−":"+","×":"÷","÷":"×"};
  const btn=h("button",{class:"btn small",type:"button",onclick:()=>{back=!back;draw();}},"Run it backwards");
  function draw(){
    const m=ap(o1,x,n1), y=ap(o2,m,n2);
    if(!back){ pic.replaceChildren(machine({input:N(x),ops:[o1+n1,o2+n2],output:N(+y.toFixed(3)),mid:[N(+m.toFixed(3))]}));
      why.innerHTML=`Forwards: ${N(x)} ${o1} ${n1} = ${N(+m.toFixed(3))}, then ${N(+m.toFixed(3))} ${o2} ${n2} = <b>${N(+y.toFixed(3))}</b>.`; btn.textContent="Run it backwards"; }
    else { pic.replaceChildren(machine({input:N(+y.toFixed(3)),ops:[inv[o2]+n2,inv[o1]+n1],output:N(x),mid:[N(+m.toFixed(3))]}));
      why.innerHTML=`Backwards: start from the output <b>${N(+y.toFixed(3))}</b>. Undo the <b>last</b> machine first (${o2}${n2} is undone by ${inv[o2]}${n2}), then undo the first (${o1}${n1} is undone by ${inv[o1]}${n1}). You get back to <b>${N(x)}</b>. Like taking off shoes before socks.`; btn.textContent="Run it forwards"; }
  }
  draw();
  return h("div",{class:"tool"},h("div",{class:"ctl"},"Input ",numIn(x,-20,50,v=>{x=v;draw();})," Machine 1 ",opSel(o1,v=>{o1=v;draw();}),numIn(n1,1,12,v=>{n1=v;draw();})," Machine 2 ",opSel(o2,v=>{o2=v;draw();}),numIn(n2,1,20,v=>{n2=v;draw();})),pic,btn,why);
}

function AreaTool(){
  let k=3, a=1, b=4, neg=false;
  const pic=h("div",{class:"scroll-x"}), out=h("div",{class:"out"});
  const sb=h("select",{},h("option",{value:"+"},"+"),h("option",{value:"-"},"−")); sb.addEventListener("change",()=>{neg=sb.value==="-";draw();});
  function draw(){
    const bb=neg?-b:b;
    pic.replaceChildren(areaGrid({left:String(k),parts:[co(a,"x"),(neg?MINUS:"+")+b],prods:[co(k*a,"x"),N(k*bb)]}));
    out.innerHTML=`${k}(${lin(a,"x",bb)}) = ${lin(k*a,"x",k*bb)}`;
  }
  draw();
  return h("div",{class:"tool"},h("div",{class:"ctl"},"Outside ",numIn(k,1,10,v=>{k=v;draw();})," Inside: ",numIn(a,1,9,v=>{a=v;draw();}),"x ",sb,numIn(b,1,12,v=>{b=v;draw();})),pic,out,h("p",{class:"muted small"},"Every part inside the bracket gets its own box, so everything inside gets multiplied."));
}

function PatternTool(){
  let kind="sq", n=3;
  const fam={sq:{k:"sq",r:"3n + 1",f:n=>3*n+1,why:"1 stick to start, then each square adds 3 sticks."},tri:{k:"tri",r:"2n + 1",f:n=>2*n+1,why:"1 stick to start, then each triangle adds 2 sticks."},sq2:{k:"sq2",r:"5n + 2",f:n=>5*n+2,why:"2 sticks to start, then each column of squares adds 5 sticks."},dots:{k:{dots:true,a:4,b:3},r:"4n + 3",f:n=>4*n+3,why:"3 grey dots that never change, then each shape adds a column of 4 dots."}};
  const pic=h("div",{class:"scroll-x"}), out=h("div",{class:"why"});
  const sel=h("select",{},h("option",{value:"sq"},"Squares (matchsticks)"),h("option",{value:"tri"},"Triangles (matchsticks)"),h("option",{value:"sq2"},"Double squares (matchsticks)"),h("option",{value:"dots"},"Dots"));
  sel.addEventListener("change",()=>{kind=sel.value;draw();});
  const rng=h("input",{type:"range",min:1,max:8,value:n}); rng.addEventListener("input",()=>{n=+rng.value;draw();});
  function draw(){ const F=fam[kind];
    const p= F.k.dots? dotSVG(F.k.a,F.k.b,n) : stickSVG(F.k,n,{colour:true});
    pic.replaceChildren(vis(SV(p.W,p.hh,p.s,"shape "+n)));
    out.innerHTML=`<b>Shape ${n}</b> uses <b>${F.f(n)}</b>. ${F.why} So shape n uses <b>${F.r}</b>. Check: ${F.r.replace("n","×"+n).replace(/^(\d)×/,"$1 × ")} = ${F.f(n)}. Shape 100 would use ${F.f(100)}.`; }
  draw();
  return h("div",{class:"tool"},h("div",{class:"ctl"},sel," Shape number ",rng),pic,out);
}

/* flowchart tracer: prog = {nodes, run: function(input) -> trace [{node, vars, out}]} */
function FlowTool(prog){
  let input=prog.input, trace=prog.run(input), k=0;
  const pic=h("div",{class:"scroll-x"}), info=h("div",{class:"why"}), outs=h("div",{class:"out"});
  const next=h("button",{class:"btn small primary",type:"button",onclick:()=>{ if(k<trace.length-1){k++;draw();} }},"Next step ▸");
  const reset=h("button",{class:"btn small",type:"button",onclick:()=>{k=0;draw();}},"Start again");
  function draw(){ const t=trace[k]; pic.replaceChildren(vis(flowSVG(prog.nodes,t.node))); info.innerHTML=t.note;
    const o=trace.slice(0,k+1).filter(s=>s.out!=null).map(s=>N(s.out)); outs.textContent= o.length? "Output so far: "+o.join(", ") : "No output yet";
    next.disabled=k>=trace.length-1; }
  draw();
  const ctl=prog.input!=null? h("div",{class:"ctl"},"Input ",numIn(input,1,40,v=>{input=v;trace=prog.run(input);k=0;draw();})) : null;
  return h("div",{class:"tool"},ctl,pic,h("div",{class:"ctl"},next,reset),info,outs);
}
export { SV, T, vis, bagSVG, dotsSVG, bags, TILE, tileSVG, tiles, numberLine, areaGrid, balanceSVG, balance, machineSVG, machine, PATS, stickSVG, dotSVG, patternRow, flowSVG, numIn, NumberLineTool, BalanceTool, MachineTool, AreaTool, PatternTool, FlowTool };
