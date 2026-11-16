/* Algebra Unit 3 topics: lesson cards, question generators and why-questions for all 23 steps, the treasure-chest previews, the Criterion B investigation and the exam list.
   Moved from games/algebra-quest/index.html by a script; the code below is unchanged apart from imports and exports. */
import { h, H, ri, pick, shuffle, nz, MINUS, N, P, sgn, co, lin, terms, esc, M, gcd, tokenize, parse, evalT, varsOf, stripLHS, numVal, equiv, topTerms, isSimplified, checkAns, speakable, say, SayBtn, checkEq } from "../../js/qcore.js";
import { SV, T, vis, bagSVG, dotsSVG, bags, TILE, tileSVG, tiles, numberLine, areaGrid, balanceSVG, balance, machineSVG, machine, PATS, stickSVG, dotSVG, patternRow, flowSVG, numIn, NumberLineTool, BalanceTool, MachineTool, AreaTool, PatternTool, FlowTool } from "./kit.js";
import { AnswerBox } from "../../js/qui.js";
/* ================= content: stage 1 ================= */
const ASN=["Always true","Sometimes true","Never true"];
const STAGES=[
  {n:1,title:"Letters and expressions",c:1},
  {n:2,title:"Functions and equations",c:2},
  {n:3,title:"Patterns and sequences",c:3},
  {n:4,title:"Flowcharts",c:4},
  {n:5,title:"Exam ready",c:5},
];
const STEPS=[];
const PREVIEWS={};

/* ---------- Preview 1 ---------- */
PREVIEWS[1]={title:"Coming up: y not x?",cards:[
  {t:"show",h:"A magic trick",b:`<p>Try this in your head:</p><ol><li>Think of a number.</li><li>Double it.</li><li>Add 10.</li><li>Halve it.</li><li>Take away the number you first thought of.</li></ol><p>Is your answer <b>5</b>? It is for everyone. Algebra explains why.</p>`},
  {t:"show",h:"Why it always works",b:`<p>Put your secret number in a bag, so nobody can see it. Call the bag <span class="x">n</span>.</p>`,v:()=>h("div",{class:"stack",style:"gap:4px;align-items:flex-start"},bags(["txt:Think of n:","bag:n"]),bags(["txt:Double:","bag:n","bag:n"]),bags(["txt:Add 10:","bag:n","bag:n","dots:10"]),bags(["txt:Halve:","bag:n","dots:5"]),bags(["txt:Take away n:","dots:5"])),
    after:`<p>Double: two bags. Add 10: two bags and 10 marbles. Halve: one bag and 5 marbles. Take away the bag: <b>5 marbles left</b>, whatever was in the bag.</p>`},
  {t:"show",h:"Words you'll hear in class",b:`<div class="kw">
    <div><b>Variable</b>A letter standing for a number, like <span class="x">n</span>.</div>
    <div><b>Term</b>One piece, like ${M("3n")} or ${M("5")}.</div>
    <div><b>Expression</b>Terms joined by + or −, like ${M("3n + 5")}. No = sign.</div>
    <div><b>Coefficient</b>The number in front of a letter. In ${M("3n")} it is 3.</div>
    <div><b>Like terms</b>Terms with exactly the same letters, like ${M("3n")} and ${M("7n")}.</div>
    <div><b>Expand</b>Multiply out a bracket: ${M("2(n + 4) = 2n + 8")}.</div>
    <div><b>Substitute</b>Swap a letter for a number.</div></div>`},
  {t:"show",h:"The big question of this unit",b:`<p>Your unit asks: <b>"How do we represent unknown information when solving problems?"</b></p><p><b>Ingenuity</b> means being clever and inventive. People invented letters for unknown numbers about 400 years ago, and it made hard problems much easier. Before that, mathematicians wrote everything out in long sentences.</p>`},
  {t:"try",h:"Have a go",b:`<p>A bag has <span class="x">n</span> marbles. You add 4 more marbles.</p>`,v:()=>bags(["bag:n","op:+","dots:4"]),q:{ask:"If n = 6, how many marbles are there altogether?",a:{num:10},why:"6 in the bag plus 4 loose ones is 10."}},
  {t:"try",h:"Have a go",b:`<p>Which one means "a number, then add 3"?</p>`,q:{choices:["3n","n + 3","n3"],ans:1,why:"n + 3 means the number, plus 3. 3n means 3 lots of n, which you'll meet in step 2."}},
]};

/* ---------- Step 1: a letter is a number ---------- */
STEPS.push({id:1,stage:1,big:true,title:"A letter is a number we don't know yet",short:"Letters are numbers",
 learn:[
  {t:"show",h:"The mystery bag",b:`<p>This bag has some marbles inside. We can't see how many.</p><p>Instead of saying "the number of marbles in the bag" every time, we give it a short name: <span class="x">n</span>.</p>`,v:()=>bags(["bag:n"]),rule:"A letter is just a number we don't know yet."},
  {t:"try",h:"Open the bag",b:`<p>We open the bag and count 5 marbles. So here <b>n = 5</b>.</p><p>Now there's a bag and 3 more marbles next to it.</p>`,v:()=>bags(["bag:n","op:+","dots:3"]),q:{ask:"How many marbles altogether?",a:{num:8},why:"The bag has 5, plus the 3 loose ones: 5 + 3 = 8. In algebra we write n + 3."}},
  {t:"show",h:"Same letter, same number",b:`<p>Two bags with the <b>same letter</b> always hold the <b>same amount</b>. That's the rule of algebra.</p><p>So <span class="x">n</span> + <span class="x">n</span> means two bags that match.</p>`,v:()=>bags(["bag:n","op:+","bag:n"]),rule:"Inside one problem, the same letter always means the same number."},
  {t:"try",h:"Two matching bags",b:`<p>n = 4. Two bags and one loose marble.</p>`,v:()=>bags(["bag:n","op:+","bag:n","op:+","dots:1"]),q:{ask:"How many marbles altogether?",a:{num:9},why:"Each bag has 4. 4 + 4 + 1 = 9."}},
  {t:"show",h:"Different letters",b:`<p>Different letters are different bags. <span class="x">a</span> and <span class="x">b</span> <i>might</i> hold different amounts, or they might happen to hold the same. We just don't know.</p>`,v:()=>bags(["bag:a","op:+","bag:b"])},
  {t:"show",h:"The letter can change between problems",b:`<p>In one problem n might be 5. In the next problem n might be 20. The letter is a <b>variable</b>: it can vary.</p><table class="tbl"><tr><th>n</th><td>1</td><td>2</td><td>5</td><td>10</td></tr><tr><th>n + 3</th><td>4</td><td>5</td><td>8</td><td>13</td></tr></table><p>The expression <b>n + 3</b> works like a recipe: whatever n is, add 3.</p>`},
  {t:"try",h:"Think of a number",b:`<p>"I think of a number and add 4. I get 11."</p>`,v:()=>bags(["bag:n","op:+","dots:4","txt:= 11"]),q:{ask:"What was in the bag?",a:{num:7},why:"The bag plus 4 makes 11, so the bag has 11 − 4 = 7. You've just solved your first equation!"}},
 ],
 gen:[()=>{ const k=ri(1,3), n=ri(2,9), c=ri(1,6); const items=[]; for(let i=0;i<k;i++){ if(i) items.push("op:+"); items.push("bag:n"); } items.push("op:+","dots:"+c);
   return {q:`Each bag holds <b>n = ${n}</b> marbles.<br>How many marbles altogether?`,v:()=>bags(items),
    steps:[{p:`How many marbles are in the ${k===1?"bag":k+" bags"}?`,a:{num:k*n},hint:k===1?`n = ${n}, so the bag holds ${n}.`:`Each bag holds ${n}. ${k} bags: ${k} × ${n}.`},
           {p:`Add the ${c} loose marble${c>1?"s":""}.`,a:{num:k*n+c},hint:`${k*n} + ${c}. Count on from ${k*n}.`}],
    final:{p:"Total:",a:{num:k*n+c}},why:`${k>1?k+" bags × "+n+" = "+k*n:"The bag holds "+n}, plus ${c} = ${k*n+c}.`}; },
  ()=>{ const n=ri(2,15), c=ri(2,9), tot=n+c; return {q:`"I think of a number and add ${c}. I get ${tot}." What is the number?`,v:()=>bags(["bag:n","op:+","dots:"+Math.min(c,9),"txt:= "+tot]),
    steps:[{p:`The bag and ${c} marbles make ${tot}. Take the ${c} away from ${tot}:`,a:{num:n},hint:`${tot} − ${c}. Count back ${c} from ${tot}, or think: ${c} + ? = ${tot}.`}],
    final:{p:"The number is:",a:{num:n}},why:`n + ${c} = ${tot}, so n = ${tot} − ${c} = ${n}.`}; }],
 checks:[
  {q:"In one problem, can n mean 3 on one line and 7 on the next line?",c:["Yes","No"],a:1,why:"Inside one problem the same letter always means the same number."},
  {q:"a and b are two different letters. Can they be the same number?",c:["Never","Yes, they can","Only if a = 1"],a:1,why:"Different letters are different bags. They might hold the same amount, but they don't have to."},
  {q:"Which one means 'a number plus 5'?",c:["5n","n + 5","n5"],a:1,why:"n + 5: the number, then 5 more."},
  {q:"A bag holds n marbles. Mia says 'n is always 5'. Is she right?",c:["Yes","No"],a:1,why:"n is a variable. It can be different numbers in different problems."},
  {q:"n = 6. What is n + n + n?",c:["666","18","9"],a:1,why:"Three bags of 6: 6 + 6 + 6 = 18."},
 ]});

/* ---------- Step 2: 3n means 3 lots of n ---------- */
STEPS.push({id:2,stage:1,big:true,title:"3n means 3 lots of n",short:"3n = 3 lots of n",
 learn:[
  {t:"show",h:"Three bags",b:`<p>Three bags that match: <span class="x">n</span> + <span class="x">n</span> + <span class="x">n</span>.</p><p>That's long to write, so we write <b>3n</b>. The number in front tells you <b>how many bags</b>.</p>`,v:()=>bags(["bag:n","bag:n","bag:n","txt:= 3n"]),rule:"3n means 3 × n: three lots of n."},
  {t:"show",h:"It's your times tables",b:`<p>If n = 7, then 3n = 3 × 7 = <b>21</b>.</p><p>No × sign is written. A number stuck to a letter always means <b>multiply</b>.</p>`,v:()=>bags(["bag:7","bag:7","bag:7","txt:= 21"])},
  {t:"try",h:"Your turn",b:`<p>n = 6.</p>`,v:()=>bags(["bag:n","bag:n","bag:n","bag:n"]),q:{ask:"What is 4n?",a:{num:24},why:"4 lots of 6 = 24."}},
  {t:"show",h:"3n is not n + 3",b:`<p>These look alike but they're different:</p>`,v:()=>h("div",{class:"stack"},bags(["txt:3n:","bag:n","bag:n","bag:n"]),bags(["txt:n + 3:","bag:n","op:+","dots:3"])),after:`<p><b>3n</b> is three bags. <b>n + 3</b> is one bag and three marbles.</p>`,rule:"3n is 3 × n. n + 3 is 3 more than n."},
  {t:"try",h:"Which is bigger?",b:`<p>n = 10.</p>`,q:{choices:["3n is bigger","n + 3 is bigger","They're equal"],ans:0,why:"3n = 30 and n + 3 = 13."}},
  {t:"try",h:"Now try n = 1",b:`<p>n = 1.</p>`,q:{choices:["3n is bigger","n + 3 is bigger","They're equal"],ans:1,why:"3n = 3 and n + 3 = 4. So which is bigger depends on n. That's why we can't treat them as the same."}},
  {t:"show",h:"Two letters next to each other",b:`<p><b>ab</b> means a × b. Think of a rectangle a long and b wide: its area is ab.</p><p><b>n²</b> ("n squared") means n × n: a square with sides n.</p>`,v:()=>areaGrid({left:"b",parts:["a"],prods:["ab"]}),rule:"Letters next to each other multiply. n² = n × n."},
  {t:"try",h:"Squares",b:`<p>n = 5.</p>`,q:{ask:"What is n²?",a:{num:25},why:"5 × 5 = 25. Not 10! n² is n × n, not 2 × n."}},
  {t:"show",h:"Dividing",b:`<p>Dividing is written as a fraction: <b>n/2</b> means n ÷ 2, half a bag.</p><p>If n = 12, n/2 = 6.</p>`},
 ],
 gen:[()=>{ const n=ri(2,9), k=ri(2,9), c=ri(1,9), t=pick(["k","plus","sq"]);
   if(t==="k") return {q:`n = ${n}. What is <b>${k}n</b>?`,v:()=>bags(Array(Math.min(k,6)).fill("bag:n").concat(k>6?["txt:…"]:[])),steps:[{p:`${k}n means ${k} lots of n. Write it as a times: ${k} × ${n} =`,a:{num:k*n},hint:`Your ${k} times table: ${k} × ${n}.`}],final:{p:`${k}n =`,a:{num:k*n}},why:`${k} × ${n} = ${k*n}.`};
   if(t==="plus") return {q:`n = ${n}. What is <b>n + ${c}</b>?`,v:()=>bags(["bag:n","op:+","dots:"+c]),steps:[{p:`n + ${c} means one bag and ${c} more. ${n} + ${c} =`,a:{num:n+c},hint:`Count on ${c} from ${n}.`}],final:{p:`n + ${c} =`,a:{num:n+c}},why:`${n} + ${c} = ${n+c}. Not ${c} × ${n}!`};
   return {q:`n = ${n}. What is <b>n²</b>?`,v:()=>areaGrid({left:"n",parts:["n"],prods:["n²"]}),steps:[{p:`n² means n × n. ${n} × ${n} =`,a:{num:n*n},hint:`It's a square: ${n} rows of ${n}. Your ${n} times table.`}],final:{p:"n² =",a:{num:n*n}},why:`${n} × ${n} = ${n*n}.`}; },
  ()=>{ const a=ri(2,9), b=ri(2,9), k=ri(2,5); return {q:`a = ${a} and b = ${b}. What is <b>${k}ab</b>?`,steps:[{p:`ab means a × b: ${a} × ${b} =`,a:{num:a*b},hint:`Times tables: ${a} × ${b}.`},{p:`Now ${k} lots of that: ${k} × ${a*b} =`,a:{num:k*a*b},hint:`${k} × ${a*b}. Split it: ${k} × ${Math.floor(a*b/10)*10} and ${k} × ${a*b%10}.`}],final:{p:`${k}ab =`,a:{num:k*a*b}},why:`${k} × ${a} × ${b} = ${k*a*b}.`}; }],
 checks:[
  {q:"'3n is bigger than n + 3.'",c:ASN,a:1,why:"Sometimes. When n = 10, 3n = 30 is bigger. When n = 1, 3n = 3 is smaller than 4."},
  {q:"'5n means 5 lots of n.'",c:ASN,a:0,why:"Always. A number in front of a letter means multiply."},
  {q:"n = 4. Sam says n² = 8. What went wrong?",c:["He did 2 × 4 instead of 4 × 4","He added instead of subtracting","Nothing, he's right"],a:0,why:"n² means n × n = 16, not 2 × n."},
  {q:"What does xy mean?",c:["x + y","x × y","x then y as a two-digit number"],a:1,why:"Letters next to each other multiply."},
  {q:"n = 2. Which two expressions are equal?",c:["n² and 2n","3n and n + 3","n + 1 and 2n"],a:0,why:"2² = 4 and 2 × 2 = 4. They're equal only when n is 0 or 2, so n² and 2n are still different expressions."},
 ]});

/* ---------- Step 3: negatives as moves ---------- */
STEPS.push({id:3,stage:1,big:true,title:"Negatives are moves on a number line",short:"Negatives as moves",
 learn:[
  {t:"show",h:"Numbers live on a line",b:`<p>Numbers to the right are bigger. Numbers to the left are smaller. Left of zero are the <b>negative</b> numbers: −1, −2, −3…</p><p>Think of a lift: 0 is the ground floor, −2 is two floors below ground.</p>`,v:()=>numberLine({min:-6,max:6})},
  {t:"show",h:"Adding means walk right",b:`<p>−3 + 5: start at −3 and walk <b>right</b> 5 steps. You land on <b>2</b>.</p>`,v:()=>numberLine({min:-5,max:5,start:-3,jumps:[5]}),rule:"+ a positive: walk right."},
  {t:"show",h:"Subtracting means walk left",b:`<p>2 − 6: start at 2 and walk <b>left</b> 6 steps. You land on <b>−4</b>.</p><p>Tip: cross zero first. 2 − 2 gets you to 0, then 4 more steps left takes you to −4.</p>`,v:()=>numberLine({min:-6,max:4,start:2,jumps:[-2,-4]}),rule:"− a positive: walk left."},
  {t:"try",h:"Your turn",b:`<p>Start at −4. Walk right 7.</p>`,v:()=>numberLine({min:-6,max:6,start:-4}),q:{ask:"−4 + 7 =",a:{num:3},why:"4 steps right gets to 0, then 3 more gets to 3."}},
  {t:"try",h:"Your turn",b:`<p>Start at 3. Walk left 8.</p>`,v:()=>numberLine({min:-7,max:5,start:3}),q:{ask:"3 − 8 =",a:{num:-5},why:"3 steps left gets to 0, then 5 more gets to −5."}},
  {t:"show",h:"Adding a negative",b:`<p>5 + (−3). The negative sign means "the other way". So instead of walking right, you walk <b>left</b> 3.</p><p>5 + (−3) = 5 − 3 = <b>2</b>.</p>`,v:()=>numberLine({min:-1,max:7,start:5,jumps:[-3]}),rule:"+ (−3) is the same as − 3."},
  {t:"show",h:"Subtracting a negative",b:`<p>2 − (−4). Subtracting means walk left, but the negative turns you round. Two "turn rounds" face you forwards again, so walk <b>right</b> 4.</p><p>2 − (−4) = 2 + 4 = <b>6</b>.</p><p>Real life: if someone takes away a debt of 4 dirhams, you're 4 dirhams better off.</p>`,v:()=>numberLine({min:-1,max:8,start:2,jumps:[4]}),rule:"− (−4) is the same as + 4."},
  {t:"tool",h:"Play with it",b:`<p>Change the numbers and watch the jumps. Try some subtractions of negatives.</p>`,tool:()=>NumberLineTool({a:2,op:"-",b:-4})},
  {t:"show",h:"Multiplying with negatives",b:`<p>Use your times tables for the size, then decide the sign.</p><p>3 × (−4) is three jumps of −4: you land on <b>−12</b>.</p><p>(−3) × (−4) = <b>12</b>. Two negatives cancel out, like two "turn rounds".</p>`,v:()=>numberLine({min:-13,max:1,start:0,jumps:[-4,-4,-4]}),rule:"Same signs → positive. Different signs → negative."},
  {t:"try",h:"Squaring a negative",b:`<p>(−5)² means (−5) × (−5).</p>`,q:{ask:"(−5)² =",a:{num:25},why:"5 × 5 = 25 from your times tables. Same signs, so positive: 25. You'll need this in step 8."}},
 ],
 gen:[()=>{ const t=pick(["add","sub","addneg","subneg"]); let a=ri(-8,8), b=ri(1,9);
   if(t==="add"){ if(a>=0) a=-ri(1,8); return {q:`Work out <b>${N(a)} + ${b}</b>`,v:()=>numberLine({min:Math.min(a,0)-1,max:Math.max(a+b,0)+1,start:a}),steps:[{p:"Which way do you walk?",a:{choice:["Right","Left"],ans:0},hint:"Adding a positive number: walk right."},{p:`Start at ${N(a)}, walk right ${b}. Where do you land?`,a:{num:a+b},hint:`Walk to 0 first (${-a} steps), then ${b+a>0?"the "+(b+a)+" steps left over":"you run out before 0"}.`,hv:()=>numberLine({min:Math.min(a,0)-1,max:Math.max(a+b,0)+1,start:a,jumps:[b]})}],final:{p:`${N(a)} + ${b} =`,a:{num:a+b}},why:`Start at ${N(a)}, walk right ${b}: ${N(a+b)}.`}; }
   if(t==="sub"){ a=ri(-5,8); return {q:`Work out <b>${N(a)} − ${b}</b>`,v:()=>numberLine({min:Math.min(a-b,0)-1,max:Math.max(a,0)+1,start:a}),steps:[{p:"Which way do you walk?",a:{choice:["Right","Left"],ans:1},hint:"Subtracting a positive number: walk left."},{p:`Start at ${N(a)}, walk left ${b}. Where do you land?`,a:{num:a-b},hint:a>0&&b>a?`Walk ${a} steps to 0, then ${b-a} more to ${N(a-b)}.`:`Count back ${b} from ${N(a)}.`,hv:()=>numberLine({min:Math.min(a-b,0)-1,max:Math.max(a,0)+1,start:a,jumps:[-b]})}],final:{p:`${N(a)} − ${b} =`,a:{num:a-b}},why:`${N(a)} walk left ${b}: ${N(a-b)}.`}; }
   if(t==="addneg") return {q:`Work out <b>${N(a)} + (${N(-b)})</b>`,v:()=>numberLine({min:Math.min(a-b,0)-1,max:Math.max(a,0)+1,start:a}),steps:[{p:`Adding a negative is the same as…`,a:{choice:[`${N(a)} + ${b}`,`${N(a)} − ${b}`],ans:1},hint:"The negative sign turns you round: walk left."},{p:`${N(a)} − ${b} =`,a:{num:a-b},hint:`Start at ${N(a)}, walk left ${b}.`,hv:()=>numberLine({min:Math.min(a-b,0)-1,max:Math.max(a,0)+1,start:a,jumps:[-b]})}],final:{p:`${N(a)} + (${N(-b)}) =`,a:{num:a-b}},why:`+ (−${b}) is the same as − ${b}: ${N(a-b)}.`};
   return {q:`Work out <b>${N(a)} − (${N(-b)})</b>`,v:()=>numberLine({min:Math.min(a,0)-1,max:Math.max(a+b,0)+1,start:a}),steps:[{p:`Subtracting a negative is the same as…`,a:{choice:[`${N(a)} + ${b}`,`${N(a)} − ${b}`],ans:0},hint:"Subtract turns you round, and the negative turns you round again: walk right."},{p:`${N(a)} + ${b} =`,a:{num:a+b},hint:`Start at ${N(a)}, walk right ${b}.`,hv:()=>numberLine({min:Math.min(a,0)-1,max:Math.max(a+b,0)+1,start:a,jumps:[b]})}],final:{p:`${N(a)} − (${N(-b)}) =`,a:{num:a+b}},why:`− (−${b}) is the same as + ${b}: ${N(a+b)}.`}; },
  ()=>{ const a=nz(-9,9), b=nz(-9,9); const sq=Math.random()<.3; const A=sq?a:a, B=sq?a:b;
   const q= sq?`(${N(A)})²`:`${P(A)} × ${P(B)}`;
   return {q:`Work out <b>${q}</b>`,steps:[{p:`Ignore the signs. ${Math.abs(A)} × ${Math.abs(B)} =`,a:{num:Math.abs(A*B)},hint:`Times tables: ${Math.abs(A)} × ${Math.abs(B)}.`},{p:"Are the signs the same or different?",a:{choice:["Same → answer positive","Different → answer negative"],ans:(A<0)===(B<0)?0:1},hint:`${N(A)} is ${A<0?"negative":"positive"}, ${N(B)} is ${B<0?"negative":"positive"}.`}],final:{p:`${q} =`,a:{num:A*B}},why:`${Math.abs(A*B)}, and the signs are ${(A<0)===(B<0)?"the same, so positive":"different, so negative"}: ${N(A*B)}.`}; }],
 checks:[
  {q:"Which is the same as 6 − (−2)?",c:["6 − 2","6 + 2","−6 − 2"],a:1,why:"Subtracting a negative turns you round twice: walk right. 6 + 2 = 8."},
  {q:"−3 − 4: which way do you walk from −3?",c:["Right, to 1","Left, to −7","Left, to −1"],a:1,why:"Subtracting 4 means walk left 4: −3 → −7."},
  {q:"'A negative times a negative is positive.'",c:ASN,a:0,why:"Always. Same signs give a positive."},
  {q:"Lily says (−4)² = −16. What's wrong?",c:["Nothing","(−4) × (−4) has the same signs, so it's +16","It should be −8"],a:1,why:"Same signs → positive: 16."},
  {q:"Which number is smaller?",c:["−8","−3"],a:0,why:"−8 is further left on the number line, so it's smaller."},
  {q:"'Adding a number always makes it bigger.'",c:ASN,a:1,why:"Sometimes. Adding a negative makes it smaller: 5 + (−2) = 3."},
 ]});

/* ---------- Step 4: writing expressions ---------- */
const WORDS=[["more than","+"],["plus","+"],["increased by","+"],["less than","− (careful with the order)"],["take away / minus","−"],["times / lots of / product","×"],["twice / double","× 2"],["shared between / divided by","÷"],["squared","²"]];
STEPS.push({id:4,stage:1,title:"Writing expressions from words",short:"Words → algebra",root:1,
 learn:[
  {t:"show",h:"Turning words into algebra",b:`<p>An <b>expression</b> is a short way of writing a calculation that has a mystery number in it.</p><p>"Oliver has some stickers and gets 5 more" becomes <b>s + 5</b>.</p>`,v:()=>bags(["bag:s","op:+","dots:5"])},
  {t:"show",h:"Word bank",b:`<table class="tbl">${WORDS.map(w=>`<tr><th style="text-align:left">${w[0]}</th><td>${w[1]}</td></tr>`).join("")}</table>`,rule:"Find the operation word first, then write it."},
  {t:"show",h:"Watch out: 'less than' flips",b:`<p>"5 less than n" means start with n and take 5 away: <b>n − 5</b>.</p><p>It does <b>not</b> mean 5 − n. If n = 12, 5 less than 12 is 7, and 12 − 5 = 7. ✓</p>`,v:()=>bags(["bag:n","op:−","neg:5"]),rule:"'5 less than n' → n − 5. Test it with a number."},
  {t:"try",h:"Your turn",b:`<p>Pencils cost 3 dirhams each. Oliver buys <b>p</b> pencils.</p>`,q:{ask:"Write an expression for the total cost.",a:{expr:"3p"},why:"p lots of 3 dirhams: 3 × p = 3p."}},
  {t:"try",h:"Your turn",b:`<p>"A number, doubled, then add 1." Call the number n.</p>`,v:()=>bags(["bag:n","bag:n","op:+","dots:1"]),q:{ask:"Write the expression.",a:{expr:"2n+1"},why:"Doubled: 2n. Then add 1: 2n + 1."}},
  {t:"show",h:"Brackets keep things together",b:`<p>"Add 4 to a number, then multiply by 3" is <b>3(n + 4)</b>. The bracket says: do the adding first, then multiply the whole thing.</p><p>"Multiply by 3, then add 4" is <b>3n + 4</b>. Different order, different expression!</p>`,v:()=>machine({input:"n",ops:["+4","×3"],output:"3(n + 4)"})},
  {t:"try",h:"Your turn",b:`<p>"Take 2 from a number, then multiply by 5."</p>`,q:{ask:"Write the expression.",a:{expr:"5(n-2)"},why:"Take 2 first: (n − 2). Then times 5: 5(n − 2)."}},
  {t:"try",h:"Test it with a number",b:`<p>Is "7 less than x" written x − 7 or 7 − x? Try x = 10: 7 less than 10 is 3.</p>`,q:{choices:["x − 7","7 − x"],ans:0,why:"10 − 7 = 3 ✓. Testing with a number is a great way to check."}},
 ],
 gen:[()=>{ const L=pick(["n","x","y","a"]), k=ri(2,9), c=ri(1,12);
   const T=[
    [`${c} more than ${L}`,`${L}+${c}`,"Add"],[`${L} increased by ${c}`,`${L}+${c}`,"Add"],[`${c} less than ${L}`,`${L}-${c}`,"Subtract"],[`${L} take away ${c}`,`${L}-${c}`,"Subtract"],
    [`${k} lots of ${L}`,`${k}${L}`,"Multiply"],[`${L} multiplied by ${k}`,`${k}${L}`,"Multiply"],[`${L} shared equally between ${k}`,`${L}/${k}`,"Divide"],[`${L} divided by ${k}`,`${L}/${k}`,"Divide"],
    [`${L} multiplied by ${k}, then add ${c}`,`${k}${L}+${c}`,"Multiply"],[`twice ${L}, then take away ${c}`,`2${L}-${c}`,"Multiply"],[`${L} squared`,`${L}^2`,"Multiply"],[`add ${c} to ${L}, then multiply by ${k}`,`${k}(${L}+${c})`,"Add"]];
   const [w,e,op]=pick(T);
   return {q:`Write as an expression:<br><b>"${w}"</b>`,steps:[{p:"What's the first thing that happens to the number?",a:{choice:["Add","Subtract","Multiply","Divide"],ans:["Add","Subtract","Multiply","Divide"].indexOf(op)},hint:"Look for the word bank words: more, less, lots of, shared…"}],final:{p:"Expression:",a:{expr:e}},why:`"${w}" → ${e.replace(/-/g," − ").replace(/\+/g," + ").replace("^2","²")}`}; },
  ()=>{ const ctx=pick([
     ()=>{const k=ri(2,9);return [`Apples cost ${k} dirhams each. Write the cost of <b>a</b> apples.`,`${k}a`,`a lots of ${k}: ${k}a`];},
     ()=>{const k=ri(2,6);return [`Oliver is <b>y</b> years old. His dad is ${k} times as old. Write his dad's age.`,`${k}y`,`${k} times y: ${k}y`];},
     ()=>{const c=ri(2,9);return [`Oliver's sister is <b>s</b> years old. Oliver is ${c} years older. Write Oliver's age.`,`s+${c}`,`${c} more than s: s + ${c}`];},
     ()=>{const c=ri(5,20);return [`Oliver has <b>m</b> dirhams and spends ${c}. Write how much is left.`,`m-${c}`,`Take ${c} away: m − ${c}`];},
     ()=>{const k=ri(2,8);return [`<b>p</b> sweets are shared equally between ${k} friends. Write how many each gets.`,`p/${k}`,`Shared means divide: p ÷ ${k}`,k*5];},
     ()=>{const k=ri(3,9),c=ri(2,9);return [`A taxi costs ${c} dirhams to start, plus ${k} dirhams per km. Write the cost for <b>k</b> km.`,`${k}k+${c}`,`${k} per km: ${k}k, plus ${c}: ${k}k + ${c}`];},
   ])(); const TV=ctx[3]||10; return {q:ctx[0],steps:[{p:`Test with a number first. If the letter were ${TV}, what would the answer be?`,a:{num:evalT(parse(ctx[1]),{a:TV,y:TV,s:TV,m:TV,p:TV,k:TV})},hint:`Put ${TV} in place of the letter and work it out in words.`}],final:{p:"Expression:",a:{expr:ctx[1]}},why:ctx[2]}; }],
 checks:[
  {q:"Ali writes '5 less than n' as 5 − n. What's the mistake?",c:["None","It should be n − 5: start with n and take 5 away","It should be 5n"],a:1,why:"Test with n = 12: 5 less than 12 is 7. 12 − 5 = 7 ✓, but 5 − 12 = −7 ✗."},
  {q:"Which means 'add 3 to n, then double'?",c:["2n + 3","2(n + 3)","n + 6"],a:1,why:"Adding comes first, so it goes in a bracket: 2(n + 3)."},
  {q:"Is 3n + 4 the same as 3(n + 4)?",c:["Yes","No"],a:1,why:"Try n = 1: 3n + 4 = 7, but 3(n + 4) = 15."},
  {q:"Pens cost p dirhams each. What does 4p mean?",c:["The cost of 4 pens","4 more than a pen","4 pens and p"],a:0,why:"4 lots of p: the price of 4 pens."},
  {q:"Which is 'n shared between 6'?",c:["6n","n/6","6/n"],a:1,why:"Shared means divide n by 6: n/6."},
 ]});

/* ---------- Step 5: like terms ---------- */
STEPS.push({id:5,stage:1,title:"Collecting like terms",short:"Like terms",root:2,
 learn:[
  {t:"show",h:"Algebra tiles",b:`<p>We'll use tiles. A long blue bar is <span class="x">x</span>. A green bar is <b style="color:var(--yt)">y</b>. A small yellow square is <b>1</b>.</p>`,v:()=>tiles([{v:"x",c:1},{v:"y",c:1},{v:"",c:1}])},
  {t:"show",h:"Same shape → can be counted together",b:`<p>3x + 2x: three x bars and two more x bars. That's <b>5x</b>.</p>`,v:()=>tiles([{v:"x",c:3},{v:"x",c:2}]),after:`<p>Just like 3 apples + 2 apples = 5 apples, except x is a number, not an apple.</p>`,rule:"Like terms have exactly the same letters. Add their numbers."},
  {t:"show",h:"Different shapes stay apart",b:`<p>3x + 2y: you can't join an x bar and a y bar into one shape. The answer stays <b>3x + 2y</b>.</p>`,v:()=>tiles([{v:"x",c:3},{v:"y",c:2}]),rule:"3x + 2y can't be made shorter. It is NOT 5xy."},
  {t:"try",h:"Your turn",b:``,v:()=>tiles([{v:"x",c:4},{v:"",c:2},{v:"x",c:1},{v:"",c:3}]),q:{ask:"Write these tiles as short as possible.",a:{expr:"5x+5",simp:true,terms:2},why:"4x + x = 5x and 2 + 3 = 5. So 5x + 5."}},
  {t:"show",h:"Negative tiles",b:`<p>A red tile is a negative. A positive x and a negative x cancel out to zero, like +1 and −1.</p><p>5x − 2x: five blue, two red. Pair them up: <b>3x</b> left.</p>`,v:()=>tiles([{v:"x",c:5},{v:"x",c:-2}]),rule:"Each red tile cancels one tile of the same shape."},
  {t:"try",h:"Your turn",b:`<p>Collect: 6y + 4 − 2y − 1</p>`,v:()=>tiles([{v:"y",c:6},{v:"",c:4},{v:"y",c:-2},{v:"",c:-1}]),q:{ask:"Answer:",a:{expr:"4y+3",simp:true,terms:2},why:"6y − 2y = 4y. 4 − 1 = 3. So 4y + 3."}},
  {t:"show",h:"Each term keeps its sign",b:`<p>The sign <b>in front</b> of a term belongs to it. In 7a + 3b <b>− 2a</b>, the −2a is negative.</p><p>Group: 7a − 2a = 5a. The 3b stays. Answer: <b>5a + 3b</b>.</p>`,rule:"Draw a circle round each term, including the sign before it."},
  {t:"show",h:"x and x² are different",b:`<p>x² is a big square tile (x by x). It is a different shape from an x bar, so x² and x are <b>not</b> like terms.</p>`,v:()=>tiles([{v:"x2",c:2},{v:"x",c:3}]),after:`<p>2x² + 3x stays as it is.</p>`},
  {t:"try",h:"Which are like terms?",b:``,q:{choices:["3ab and 5ba","2x and 2x²","4y and 4"],ans:0,why:"ab and ba are the same (a × b = b × a), so 3ab + 5ba = 8ab."}},
 ],
 gen:[()=>{ const L1=pick(["x","a","m"]), L2=pick(["y","b","n"]); let a1=ri(1,7),a2=nz(-5,6),b1=ri(1,6),b2=nz(-4,5),c1=ri(1,9),c2=nz(-6,6);
   const useB=Math.random()<.6, useC=Math.random()<.7||!useB;
   const order=shuffle([{c:a1,v:L1},{c:a2,v:L1},...(useB?[{c:b1,v:L2},{c:b2,v:L2}]:[]),...(useC?[{c:c1,v:""},{c:c2,v:""}]:[])]);
   if(order[0].c<0) order.push(order.shift());
   const q=terms(order);
   const A=a1+a2,B=useB?b1+b2:0,C=useC?c1+c2:0;
   const ans=terms([{c:A,v:L1},{c:B,v:L2},{c:C,v:""}]);
   const nT=[A,B,C].filter(Boolean).length||1;
   const steps=[{p:`Collect the <b>${L1}</b> terms: ${a1>0?"":""}${terms([{c:a1,v:L1}])} and ${terms([{c:a2,v:L1}])} make…`,a:{expr:`${A}${L1}`},hint:`Count the ${L1} tiles: ${a1} ${a2<0?"take away "+(-a2):"and "+a2}.`,hv:()=>tiles([{v:L1,s:"x",c:a1},{v:L1,s:"x",c:a2}])}];
   if(useB) steps.push({p:`Collect the <b>${L2}</b> terms: ${terms([{c:b1,v:L2}])} and ${terms([{c:b2,v:L2}])} make…`,a:{expr:`${B}${L2}`},hint:`${b1} ${b2<0?"take away "+(-b2):"and "+b2}.`,hv:()=>tiles([{v:L2,s:"y",c:b1},{v:L2,s:"y",c:b2}])});
   if(useC) steps.push({p:`Collect the numbers: ${N(c1)} and ${N(c2)} make…`,a:{num:C},hint:c2<0?`${c1} − ${-c2}: walk left from ${c1}.`:`${c1} + ${c2}.`,hv:()=>numberLine({min:Math.min(0,c1+c2,c1)-1,max:Math.max(c1,c1+c2)+1,start:c1,jumps:[c2]})});
   return {q:`Simplify <b>${q}</b>`,steps,final:{p:"Simplified:",a:{expr:ans,simp:true,terms:nT}},why:`Group the same letters: ${ans}.`}; }],
 checks:[
  {q:"Is 3x + 2y the same as 5xy?",c:["Yes","No"],a:1,why:"x and y are different tiles, so they can't join. Try x = 1, y = 1: 3 + 2 = 5, but 5xy = 5. Now x = 2, y = 1: 8 vs 10."},
  {q:"'x + x = x²'",c:ASN,a:1,why:"Sometimes, only when x = 0 or 2. x + x = 2x (two bars), x² is a square tile. They're different expressions."},
  {q:"Simplify 4a − a.",c:["4","3a","4a²"],a:1,why:"4 bars take away 1 bar leaves 3 bars: 3a."},
  {q:"Jo simplifies 5y − 2 + 3y as 8y + 2. What went wrong?",c:["She lost the − sign in front of the 2","She added the y's wrongly","Nothing"],a:0,why:"The −2 keeps its sign: 8y − 2."},
  {q:"Which pair are like terms?",c:["2xy and 7yx","3x and 3y","x² and 2x"],a:0,why:"xy and yx are the same (x × y = y × x)."},
 ]});
/* ---------- Step 6: multiplying and dividing terms ---------- */
STEPS.push({id:6,stage:1,title:"Multiplying and dividing terms",short:"× and ÷ terms",root:2,
 learn:[
  {t:"show",h:"Multiplying is a rectangle",b:`<p>3a × 4b: think of a rectangle 3a long and 4b wide.</p><p>Multiply the <b>numbers</b>: 3 × 4 = 12. Multiply the <b>letters</b>: a × b = ab. Answer: <b>12ab</b>.</p>`,v:()=>areaGrid({left:"4b",parts:["3a"],prods:["12ab"]}),rule:"Numbers × numbers, letters × letters."},
  {t:"try",h:"Your turn",b:`<p>2x × 5y</p>`,q:{ask:"Answer:",a:{expr:"10xy",simp:true},why:"2 × 5 = 10, x × y = xy: 10xy."}},
  {t:"show",h:"Same letter twice makes a square",b:`<p>a × a = <b>a²</b>. So 3a × 2a = 3 × 2 × a × a = <b>6a²</b>.</p>`,v:()=>areaGrid({left:"2a",parts:["3a"],prods:["6a²"]}),rule:"a × a = a²"},
  {t:"try",h:"Your turn",b:`<p>4x × 3x</p>`,q:{ask:"Answer:",a:{expr:"12x^2",simp:true},why:"4 × 3 = 12, x × x = x²: 12x². Type x² as x^2 or use the ² button."}},
  {t:"show",h:"Dividing is times tables backwards",b:`<p>12ab ÷ 3a. Write it as a fraction: <b>12ab / 3a</b>.</p><p>Numbers: 3 × ? = 12 → <b>4</b>. Letters: the a on top and bottom cancel, b is left.</p><p>Answer: <b>4b</b>.</p>`,rule:"Divide the numbers (times tables backwards), cancel matching letters."},
  {t:"try",h:"Check by multiplying back",b:`<p>Is 12ab ÷ 3a = 4b right? Multiply back: 3a × 4b.</p>`,q:{ask:"3a × 4b =",a:{expr:"12ab",simp:true},why:"12ab ✓. Multiplying back is how you check any division."}},
  {t:"try",h:"Your turn",b:`<p>20xy ÷ 5y</p>`,q:{ask:"Answer:",a:{expr:"4x",simp:true},why:"5 × 4 = 20, the y's cancel: 4x."}},
 ],
 gen:[()=>{ const a=ri(2,9),b=ri(2,9), L=pick([["x","y"],["a","b"],["m","n"],["x","x"],["a","a"]]); const same=L[0]===L[1];
   const ans=`${a*b}${same?L[0]+"^2":L[0]+L[1]}`;
   return {q:`Simplify <b>${a}${L[0]} × ${b}${L[1]}</b>`,v:()=>areaGrid({left:`${b}${L[1]}`,parts:[`${a}${L[0]}`],prods:["?"]}),
    steps:[{p:`Numbers: ${a} × ${b} =`,a:{num:a*b},hint:`Times tables: ${a} × ${b}.`},{p:`Letters: ${L[0]} × ${L[1]} =`,a:{expr:same?L[0]+"^2":L[0]+L[1],simp:true},hint:same?`The same letter times itself is ${L[0]}².`:`Write them next to each other: ${L[0]}${L[1]}.`}],
    final:{p:"Answer:",a:{expr:ans,simp:true,terms:1}},why:`${a*b}${same?L[0]+"²":L[0]+L[1]}`}; },
  ()=>{ const k=ri(2,9),m=ri(2,9), L=pick(["x","a","y"]), M2=pick(["y","b","n"]), withB=Math.random()<.6;
   const top=`${k*m}${L}${withB?M2:""}`, bot=`${k}${withB?M2:""}`, ans=`${m}${L}`;
   return {q:`Simplify <b>${top} ÷ ${bot}</b>`,steps:[{p:`Numbers: ${k} × ? = ${k*m}`,a:{num:m},hint:`Your ${k} times table: which one gives ${k*m}?`},{p:`Letters: ${L}${withB?M2:""} ÷ ${withB?M2:"(no letters)"} leaves…`,a:{expr:L},hint:withB?`The ${M2} on top and bottom cancel.`:`Nothing to cancel, ${L} stays.`}],
    final:{p:"Answer:",a:{expr:ans,simp:true}},why:`${k*m} ÷ ${k} = ${m}, letters left: ${L}. Check: ${bot} × ${ans} = ${top} ✓`}; }],
 checks:[
  {q:"Tom says 2x × 3x = 6x. What's the mistake?",c:["x × x is x², so it should be 6x²","2 × 3 is 5","Nothing"],a:0,why:"6x²: the x's multiply to make x²."},
  {q:"Is 4a × 2 the same as 8a?",c:["Yes","No"],a:0,why:"4 × 2 = 8, the a stays: 8a."},
  {q:"How can you check 18xy ÷ 6x = 3y?",c:["Multiply back: 6x × 3y = 18xy","Add 6x + 3y","You can't check it"],a:0,why:"Dividing and multiplying undo each other."},
  {q:"What is a × b × a?",c:["2ab","a²b","ab²"],a:1,why:"a × a = a², times b: a²b."},
 ]});

/* ---------- Step 7: expanding a bracket ---------- */
STEPS.push({id:7,stage:1,title:"Expanding a bracket",short:"Expand brackets",root:2,
 learn:[
  {t:"show",h:"3 lots of a bag-and-2",b:`<p>3(n + 2) means three lots of (n + 2).</p>`,v:()=>bags(["bag:n","dots:2","op:|","bag:n","dots:2","op:|","bag:n","dots:2"]),after:`<p>Count: 3 bags and 6 marbles. So 3(n + 2) = <b>3n + 6</b>.</p>`,rule:"Everything inside the bracket gets multiplied."},
  {t:"show",h:"The area grid",b:`<p>Draw a rectangle: 3 tall, (n + 2) long. Split the length into n and 2.</p><p>Box 1: 3 × n = <b>3n</b>. Box 2: 3 × 2 = <b>6</b>. Add them: 3n + 6.</p>`,v:()=>areaGrid({left:"3",parts:["n","+2"],prods:["3n","6"]}),rule:"One box for each term inside the bracket."},
  {t:"try",h:"Your turn",b:`<p>Expand 4(x + 5). Fill the boxes in your head.</p>`,v:()=>areaGrid({left:"4",parts:["x","+5"],prods:["4x","20"],hide:[true,true]}),q:{ask:"4(x + 5) =",a:{expr:"4x+20",noBr:true,simp:true},why:"4 × x = 4x and 4 × 5 = 20: 4x + 20."}},
  {t:"show",h:"A minus inside",b:`<p>5(x − 3): the second box is 5 × (−3) = <b>−15</b>.</p><p>So 5(x − 3) = <b>5x − 15</b>.</p>`,v:()=>areaGrid({left:"5",parts:["x","−3"],prods:["5x","−15"]})},
  {t:"try",h:"Your turn",b:`<p>Expand 2(3y − 4)</p>`,v:()=>areaGrid({left:"2",parts:["3y","−4"],prods:["?","?"]}),q:{ask:"2(3y − 4) =",a:{expr:"6y-8",noBr:true,simp:true},why:"2 × 3y = 6y and 2 × (−4) = −8: 6y − 8."}},
  {t:"tool",h:"Play with it",b:`<p>Change the numbers. Watch each box.</p>`,tool:()=>AreaTool()},
  {t:"show",h:"A letter outside",b:`<p>a(a + 5): box 1 is a × a = <b>a²</b>, box 2 is a × 5 = <b>5a</b>.</p><p>a(a + 5) = <b>a² + 5a</b>.</p>`,v:()=>areaGrid({left:"a",parts:["a","+5"],prods:["a²","5a"]})},
  {t:"show",h:"A negative outside",b:`<p>−2(x + 3): multiply each term by −2.</p><p>−2 × x = −2x, and −2 × 3 = −6. So <b>−2x − 6</b>.</p><p>Remember from step 3: different signs give a negative.</p>`,v:()=>areaGrid({left:"−2",parts:["x","+3"],prods:["−2x","−6"]})},
  {t:"try",h:"Check with a number",b:`<p>Is 3(x + 4) = 3x + 12? Try x = 1: 3(1 + 4) = 15.</p>`,q:{ask:"Now 3x + 12 when x = 1:",a:{num:15},why:"3 + 12 = 15 ✓. Both give the same answer, so the expansion is right."}},
 ],
 gen:[()=>{ const t=pick(["n","n","neg","let"]); const L=pick(["x","n","a","y"]);
   if(t==="let"){ const b=nz(-9,9); const ans=`${L}^2${b<0?"-":"+"}${Math.abs(b)}${L}`;
     return {q:`Expand <b>${L}(${L}${sgn(b)})</b>`,v:()=>areaGrid({left:L,parts:[L,(b<0?MINUS:"+")+Math.abs(b)],prods:["?","?"]}),steps:[{p:`Box 1: ${L} × ${L} =`,a:{expr:`${L}^2`},hint:`A letter times itself is squared: ${L}².`},{p:`Box 2: ${L} × ${P(b)} =`,a:{expr:`${b}${L}`},hint:`${b} lots of ${L}.`}],final:{p:"Answer:",a:{expr:ans,noBr:true,simp:true,terms:2}},why:`${L}² ${b<0?MINUS:"+"} ${Math.abs(b)}${L}`}; }
   let k=ri(2,9); if(t==="neg") k=-ri(2,6); const a=ri(1,5), b=nz(-9,9);
   const ans=lin(k*a,L,k*b).replace(/−/g,"-");
   return {q:`Expand <b>${N(k)}(${lin(a,L,b)})</b>`,v:()=>areaGrid({left:N(k),parts:[co(a,L),(b<0?MINUS:"+")+Math.abs(b)],prods:["?","?"]}),
    steps:[{p:`Box 1: ${N(k)} × ${co(a,L)} =`,a:{expr:`${k*a}${L}`},hint:`Numbers: ${N(k)} × ${a} = ${N(k*a)}. Then the ${L}.${k<0?" Different signs → negative.":""}`},{p:`Box 2: ${N(k)} × ${P(b)} =`,a:{num:k*b},hint:`${Math.abs(k)} × ${Math.abs(b)} = ${Math.abs(k*b)}. Signs ${(k<0)===(b<0)?"same → positive":"different → negative"}.`}],
    final:{p:"Answer:",a:{expr:ans,noBr:true,simp:true,terms:2}},why:`${N(k)}(${lin(a,L,b)}) = ${lin(k*a,L,k*b)}`}; }],
 checks:[
  {q:"Ben writes 3(x + 4) = 3x + 4. What's the mistake?",c:["He only multiplied the x, not the 4","He should have added 3","Nothing"],a:0,why:"Every term inside gets multiplied: 3x + 12."},
  {q:"'2(n + 5) = 2n + 10'",c:ASN,a:0,why:"Always: it's the same as two lots of (n + 5)."},
  {q:"−3(x − 2) =",c:["−3x − 6","−3x + 6","3x + 6"],a:1,why:"−3 × −2: same signs → +6. So −3x + 6."},
  {q:"Why does the area grid work?",c:["A rectangle's area is the same whether you measure it whole or in parts","It's just a trick","Because brackets mean add"],a:0,why:"Splitting a rectangle into parts doesn't change its total area."},
  {q:"Which shows 4(a + 2) as a picture?",c:["4 bags and 2 marbles","4 bags and 8 marbles","1 bag and 8 marbles"],a:1,why:"4 lots of (a bag and 2 marbles) = 4 bags and 8 marbles."},
 ]});

/* ---------- Step 8: substitution ---------- */
STEPS.push({id:8,stage:1,title:"Substituting values (and squaring negatives)",short:"Substitute",root:3,
 learn:[
  {t:"show",h:"Open the bags",b:`<p><b>Substitute</b> means swap the letter for its number. It's opening the bag.</p><p>If a = 4, then 3a + 2 becomes 3 × <b>(4)</b> + 2.</p>`,v:()=>bags(["bag:4","bag:4","bag:4","op:+","dots:2"]),rule:"Swap each letter for its number, in brackets."},
  {t:"show",h:"The order matters",b:`<p>3 × (4) + 2: multiply first, then add. 12 + 2 = <b>14</b>.</p><table class="tbl"><tr><th>1st</th><td>Brackets</td></tr><tr><th>2nd</th><td>Powers (²)</td></tr><tr><th>3rd</th><td>× and ÷</td></tr><tr><th>4th</th><td>+ and −</td></tr></table>`,rule:"Brackets, powers, × ÷, then + −."},
  {t:"try",h:"Your turn",b:`<p>x = 5. Work out 2x − 3.</p>`,q:{ask:"Answer:",a:{num:7},why:"2 × (5) = 10, then 10 − 3 = 7."}},
  {t:"show",h:"Two letters",b:`<p>a = 3, b = 7. Work out 4a + b.</p><p>4 × (3) + (7) = 12 + 7 = <b>19</b>.</p>`},
  {t:"show",h:"Negatives go in brackets",b:`<p>x = −3. Work out 2x + 10.</p><p>2 × (−3) + 10 = −6 + 10 = <b>4</b>.</p><p>The brackets stop the signs getting muddled.</p>`,v:()=>numberLine({min:-7,max:5,start:-6,jumps:[10]})},
  {t:"show",h:"Squaring a negative",b:`<p>x = −3. Work out x².</p><p>x² = (−3)² = (−3) × (−3) = <b>9</b>. Same signs → positive.</p><p>On a calculator, type the bracket: <span class="m">(−3)²</span>. If you type <span class="m">−3²</span> the calculator squares 3 first and gives −9, which is wrong here.</p>`,rule:"A negative number squared is positive. Use brackets on the calculator."},
  {t:"try",h:"Your turn",b:`<p>a = −4. Work out a².</p>`,q:{ask:"a² =",a:{num:16},why:"(−4) × (−4) = 16."}},
  {t:"show",h:"Power before multiply",b:`<p>x = −2. Work out 3x².</p><p>Power first: (−2)² = 4. Then multiply: 3 × 4 = <b>12</b>.</p><p>Don't do 3 × (−2) first! That would give 36 after squaring, which is wrong.</p>`,rule:"In 3x², only the x is squared."},
  {t:"try",h:"Your turn",b:`<p>y = −5. Work out 2y² − 1.</p>`,q:{ask:"Answer:",a:{num:49},why:"(−5)² = 25, × 2 = 50, − 1 = 49."}},
 ],
 gen:[()=>{ const t=pick(["lin","lin2","sq","ksq","bra"]);
   if(t==="lin"){ const a=ri(2,9),b=nz(-9,9),x=nz(-6,9); return {q:`x = ${N(x)}. Work out <b>${lin(a,"x",b)}</b>`,steps:[{p:`Swap: ${a} × ${P(x)} =`,a:{num:a*x},hint:`${a} × ${Math.abs(x)} = ${a*Math.abs(x)}.${x<0?" Different signs → negative.":""}`},{p:`Then ${P(a*x)} ${b<0?MINUS:"+"} ${Math.abs(b)} =`,a:{num:a*x+b},hint:`Walk ${b<0?"left":"right"} ${Math.abs(b)} from ${N(a*x)} on a number line.`,hv:()=>numberLine({min:Math.min(a*x,a*x+b,0)-1,max:Math.max(a*x,a*x+b,0)+1,start:a*x,jumps:[b]})}],final:{p:"Answer:",a:{num:a*x+b}},why:`${a} × ${P(x)} ${b<0?MINUS:"+"} ${Math.abs(b)} = ${N(a*x)} ${b<0?MINUS:"+"} ${Math.abs(b)} = ${N(a*x+b)}`}; }
   if(t==="lin2"){ const p=ri(2,6),q=ri(2,6),a=nz(-5,8),b=nz(-5,8); return {q:`a = ${N(a)}, b = ${N(b)}. Work out <b>${p}a + ${q}b</b>`,steps:[{p:`${p} × ${P(a)} =`,a:{num:p*a},hint:`Times tables, then the sign.`},{p:`${q} × ${P(b)} =`,a:{num:q*b},hint:`Times tables, then the sign.`},{p:`${N(p*a)} + ${P(q*b)} =`,a:{num:p*a+q*b},hint:`Start at ${N(p*a)}, walk ${q*b<0?"left":"right"} ${Math.abs(q*b)}.`}],final:{p:"Answer:",a:{num:p*a+q*b}},why:`${N(p*a)} + ${P(q*b)} = ${N(p*a+q*b)}`}; }
   if(t==="sq"){ const x=nz(-9,9),c=nz(-9,9); return {q:`x = ${N(x)}. Work out <b>x²${sgn(c)}</b>`,steps:[{p:`x² = ${P(x)} × ${P(x)} =`,a:{num:x*x},hint:`${Math.abs(x)} × ${Math.abs(x)} = ${x*x}. Squaring always gives a positive.`},{p:`${x*x} ${c<0?MINUS:"+"} ${Math.abs(c)} =`,a:{num:x*x+c},hint:"Count on or back."}],final:{p:"Answer:",a:{num:x*x+c}},why:`${P(x)}² = ${x*x}, then ${c<0?MINUS:"+"} ${Math.abs(c)} = ${N(x*x+c)}`}; }
   if(t==="ksq"){ const k=ri(2,5),x=nz(-6,6); return {q:`x = ${N(x)}. Work out <b>${k}x²</b>`,steps:[{p:`Power first: ${P(x)}² =`,a:{num:x*x},hint:`${P(x)} × ${P(x)}. Same signs → positive.`},{p:`Then × ${k}:`,a:{num:k*x*x},hint:`${k} × ${x*x}.`}],final:{p:"Answer:",a:{num:k*x*x}},why:`Square first: ${x*x}. Then × ${k} = ${k*x*x}.`}; }
   const k=ri(2,6),x=nz(-6,9),c=nz(-6,6); return {q:`x = ${N(x)}. Work out <b>${k}(x${sgn(c)})</b>`,steps:[{p:`Bracket first: ${P(x)} ${c<0?MINUS:"+"} ${Math.abs(c)} =`,a:{num:x+c},hint:`Walk ${c<0?"left":"right"} ${Math.abs(c)} from ${N(x)}.`,hv:()=>numberLine({min:Math.min(x,x+c,0)-1,max:Math.max(x,x+c,0)+1,start:x,jumps:[c]})},{p:`Then ${k} × ${P(x+c)} =`,a:{num:k*(x+c)},hint:`Times tables, then the sign.`}],final:{p:"Answer:",a:{num:k*(x+c)}},why:`(${N(x)} ${c<0?MINUS:"+"} ${Math.abs(c)}) = ${N(x+c)}, × ${k} = ${N(k*(x+c))}`}; }],
 checks:[
  {q:"x = −4. Sam says x² = −16. What's wrong?",c:["(−4) × (−4) is +16","Nothing","It should be −8"],a:0,why:"Same signs → positive: 16."},
  {q:"x = 2. Is 3x² equal to 36 or 12?",c:["36","12"],a:1,why:"Only x is squared: 2² = 4, then 3 × 4 = 12."},
  {q:"Why do we put a substituted negative number in brackets?",c:["So the signs don't get muddled","Brackets make it bigger","No reason"],a:0,why:"2 × (−3) is clear. 2 × −3 or 2−3 is easy to misread."},
  {q:"On a calculator you type −3² and get −9. Why?",c:["It squares 3 first, then adds the minus","The calculator is broken","(−3)² really is −9"],a:0,why:"Type (−3)² with brackets to get 9."},
  {q:"a = 5. Which is biggest?",c:["2a","a²","a + 10"],a:1,why:"2a = 10, a² = 25, a + 10 = 15."},
 ]});

/* ---------- Preview 2 ---------- */
PREVIEWS[2]={title:"Coming up: solving for the unknown",cards:[
  {t:"show",h:"A balance puzzle",b:`<p>The scale is level. Each blue box weighs the same. Every yellow cube weighs 1 kg.</p>`,v:()=>balance(["x","x",3],[11]),after:`<p>Can you work out how much one box weighs? Hint: take 3 cubes off <b>both</b> sides, so it stays level.</p>`},
  {t:"try",h:"Have a go",b:`<p>Two boxes and 3 cubes balance 11 cubes.</p>`,v:()=>balance(["x","x",3],[11]),q:{ask:"How much does one box weigh?",a:{num:4},why:"Take 3 from both sides: 2 boxes = 8. Split into 2: one box = 4."}},
  {t:"show",h:"Words you'll hear in class",b:`<div class="kw">
    <div><b>Equation</b>Two things that are equal, with an = sign: ${M("2x + 3 = 11")}.</div>
    <div><b>Solve</b>Find the number the letter stands for.</div>
    <div><b>Inverse</b>The opposite operation that undoes it: + and −, × and ÷.</div>
    <div><b>Function</b>A rule that turns every input into one output.</div>
    <div><b>Formula</b>A rule with letters, like ${M("A = lw")} for area.</div>
    <div><b>Subject</b>The letter on its own: in ${M("A = lw")}, A is the subject.</div></div>`},
  {t:"show",h:"Why it matters",b:`<p>Engineers, game designers and scientists solve equations all the time: "How long until the battery runs out?" "How fast must the rocket go?"</p><p>The balance idea works for all of them.</p>`},
]};

/* ---------- Step 9: every operation has an undo ---------- */
STEPS.push({id:9,stage:2,big:true,title:"Every operation has an undo",short:"Undo operations",
 learn:[
  {t:"show",h:"A function machine",b:`<p>A machine does something to every number you put in.</p><p>Put in 3. The machine adds 5. Out comes <b>8</b>.</p>`,v:()=>machine({input:3,ops:["+5"],output:8})},
  {t:"show",h:"The undo machine",b:`<p>What machine turns 8 back into 3? <b>−5</b>. Subtracting undoes adding.</p>`,v:()=>machine({input:8,ops:["−5"],output:3}),rule:"+ is undone by −. × is undone by ÷."},
  {t:"show",h:"Undoing × is your times tables",b:`<p>The ×4 machine turns 7 into 28.</p><p>To undo it, ask: <b>4 × ? = 28</b>. Your times tables say 7. That's ÷ 4.</p>`,v:()=>machine({input:"7",ops:["×4"],output:"28"})},
  {t:"try",h:"Your turn",b:`<p>A ×6 machine gave out 42.</p>`,v:()=>machine({input:null,ops:["×6"],output:42}),q:{ask:"What went in?",a:{num:7},why:"6 × ? = 42 → 7."}},
  {t:"show",h:"Two machines in a row",b:`<p>Put in 4. First ×2 gives 8. Then +3 gives <b>11</b>.</p>`,v:()=>machine({input:4,ops:["×2","+3"],output:11,mid:[8]})},
  {t:"show",h:"Undo in reverse order",b:`<p>To get from 11 back to 4, undo the <b>last</b> machine first.</p><p>11 → undo +3 → 8 → undo ×2 → 4.</p><p>It's like getting undressed: shoes come off before socks, even though socks went on first.</p>`,v:()=>machine({input:11,ops:["−3","÷2"],output:4,mid:[8]}),rule:"Undo the last step first."},
  {t:"try",h:"Your turn",b:`<p>Machines: ×3 then +5. The output was 26.</p>`,v:()=>machine({input:null,ops:["×3","+5"],output:26}),q:{ask:"What was the input?",a:{num:7},why:"Undo +5: 26 − 5 = 21. Undo ×3: 21 ÷ 3 = 7."}},
  {t:"tool",h:"Play with it",b:`<p>Build your own machines and run them backwards.</p>`,tool:()=>MachineTool()},
 ],
 gen:[()=>{ const a=ri(2,9), b=ri(1,12), x=ri(1,10); const o2=pick(["+","−"]); const mid=a*x, out=o2==="+"?mid+b:mid-b; const back=Math.random()<.6;
   if(!back) return {q:`Input <b>${x}</b>. What comes out?`,v:()=>machine({input:x,ops:["×"+a,o2+b],output:null}),steps:[{p:`First machine: ${x} × ${a} =`,a:{num:mid},hint:`Times tables.`},{p:`Second machine: ${mid} ${o2} ${b} =`,a:{num:out},hint:"Count on or back."}],final:{p:"Output:",a:{num:out}},why:`${x} × ${a} = ${mid}, ${o2} ${b} = ${N(out)}`};
   return {q:`The output is <b>${N(out)}</b>. What was the input?`,v:()=>machine({input:null,ops:["×"+a,o2+b],output:N(out)}),steps:[{p:"Which machine do you undo first?",a:{choice:[`The ×${a}`,`The ${o2}${b}`],ans:1},hint:"Undo the last step first."},{p:`Undo ${o2}${b}: ${N(out)} ${o2==="+"?MINUS:"+"} ${b} =`,a:{num:mid},hint:`The undo of ${o2} is ${o2==="+"?MINUS:"+"}.`},{p:`Undo ×${a}: ${a} × ? = ${mid}`,a:{num:x},hint:`Your ${a} times table.`}],final:{p:"Input:",a:{num:x}},why:`${N(out)} → ${mid} → ${x}`}; }],
 checks:[
  {q:"Which undoes 'multiply by 5'?",c:["Add 5","Divide by 5","Subtract 5"],a:1,why:"× and ÷ undo each other."},
  {q:"Machines: ×3 then +1. Is the undo '÷3 then −1'?",c:["Yes","No: it's −1 first, then ÷3"],a:1,why:"Undo in reverse order: the last machine (+1) is undone first."},
  {q:"Why is dividing like times tables backwards?",c:["Because 4 × ? = 28 asks the same as 28 ÷ 4","It isn't","Because they both use 4"],a:0,why:"Division asks 'how many of these make that?'"},
  {q:"A +7 machine gives out 3. What went in?",c:["10","−4","4"],a:1,why:"Undo +7: 3 − 7 = −4. Check: −4 + 7 = 3 ✓."},
 ]});

/* ---------- Step 10: = means balance ---------- */
STEPS.push({id:10,stage:2,big:true,title:"\"=\" means both sides balance",short:"= means balance",
 learn:[
  {t:"show",h:"Not 'the answer is'",b:`<p>Lots of people read = as "here comes the answer". But = really means <b>both sides are worth the same</b>.</p><p>3 + 4 = 5 + 2 is true! Both sides are 7.</p>`,v:()=>balance([3,4],[5,2]),rule:"= means the left side and the right side are equal, like a level scale."},
  {t:"try",h:"Your turn",b:`<p>3 + 4 = ☐ + 2</p>`,v:()=>balance([3,4],[2]),q:{ask:"What goes in the box to keep it level?",a:{num:5},why:"The left is 7, so the right needs 7: 5 + 2."}},
  {t:"try",h:"True or false?",b:`<p>10 − 3 = 4 + 2</p>`,q:{choices:["True","False"],ans:1,why:"Left is 7, right is 6. Not level, so false."}},
  {t:"show",h:"A mystery box on the scale",b:`<p>x + 3 = 7. The scale is level with a mystery box and 3 cubes on one side, and 7 cubes on the other.</p>`,v:()=>balance(["x",3],[7])},
  {t:"show",h:"Keep it level",b:`<p>Take 3 cubes off <b>both</b> sides. It's still level, and now the box is alone: <b>x = 4</b>.</p>`,v:()=>balance(["x"],[4]),rule:"Whatever you do to one side, do to the other side."},
  {t:"show",h:"Splitting into groups",b:`<p>3x = 12. Three boxes balance 12 cubes.</p><p>Split both sides into 3 equal groups. One box balances 4 cubes: <b>x = 4</b>.</p>`,v:()=>balance(["x","x","x"],[12])},
  {t:"tool",h:"Solve it on the scale",b:`<p>Use the buttons. The scale always stays level, so the answer stays true.</p>`,tool:()=>BalanceTool({a:2,b:3,c:0,d:11})},
  {t:"try",h:"Letters on the right are fine",b:`<p>12 = x + 5</p>`,v:()=>balance([12],["x",5]),q:{ask:"x =",a:{num:7},why:"Take 5 from both sides: 7 = x. Same as x = 7."}},
 ],
 gen:[()=>{ const a=ri(1,12),b=ri(1,12),c=ri(1,Math.max(1,a+b-1)); return {q:`Fill the box so both sides balance:<br><b>${a} + ${b} = ☐ + ${c}</b>`,v:()=>balance(a+b<=20?[a,b]:[a+b],[c]),steps:[{p:`What is the left side worth? ${a} + ${b} =`,a:{num:a+b},hint:`Add ${a} and ${b}.`},{p:`☐ + ${c} must also be ${a+b}. So ☐ =`,a:{num:a+b-c},hint:`${c} + ? = ${a+b}.`}],final:{p:"☐ =",a:{num:a+b-c}},why:`Both sides are ${a+b}: ${a+b-c} + ${c} = ${a+b}.`}; },
  ()=>{ const k=ri(1,4), x=ri(1,7), c=ri(0,6); const d=k*x+c; const flip=Math.random()<.3;
   const eq=flip?`${d} = ${lin(k,"x",c)}`:`${lin(k,"x",c)} = ${d}`;
   const steps=[]; if(c) steps.push({p:`Take ${c} off both sides. The cubes on the other side:`,a:{num:k*x},hint:`${d} − ${c}.`,hv:()=>balance(Array(k).fill("x"),[k*x])});
   if(k>1) steps.push({p:`${k} boxes balance ${k*x}. Split into ${k} groups: one box =`,a:{num:x},hint:`${k} × ? = ${k*x}.`});
   if(!steps.length) steps.push({p:"The box is already alone. x =",a:{num:x},hint:"Read it off the scale."});
   return {q:`Solve on the scale: <b>${eq}</b>`,v:()=>flip?balance([d],[...Array(k).fill("x"),c]):balance([...Array(k).fill("x"),c],[d]),steps,final:{p:"x =",a:{num:x}},why:`${eq} → x = ${x}. Check: ${k>1?k+" × "+x:x}${c?" + "+c:""} = ${d} ✓`}; }],
 checks:[
  {q:"Is 4 + 5 = 3 + 6 true?",c:["True","False"],a:0,why:"Both sides are 9."},
  {q:"7 = x + 2. Can the letter be on the right?",c:["Yes, x = 5","No, that's not allowed"],a:0,why:"= means both sides are equal, so either side works."},
  {q:"Why must you do the same thing to both sides?",c:["To keep the scale level, so it's still true","Because teachers say so","To make the numbers smaller"],a:0,why:"If you only change one side, the two sides stop being equal."},
  {q:"Someone writes 2 + 3 = 5 + 4 = 9. What's wrong?",c:["2 + 3 isn't equal to 9, so the first = is false","Nothing","5 + 4 isn't 9"],a:0,why:"Each = must be true. 2 + 3 = 5, not 9."},
 ]});

/* ---------- Step 11: functions ---------- */
STEPS.push({id:11,stage:2,title:"Functions: input, output, finding the rule",short:"Functions",root:9,
 learn:[
  {t:"show",h:"A function is a machine with a rule",b:`<p>A <b>function</b> takes an input and gives exactly one output, using a rule.</p><p>Rule: <b>x → 2x + 1</b>. Put in 4: 2 × 4 + 1 = <b>9</b>.</p><p>You might also see it written as <b>y = 2x + 1</b>.</p>`,v:()=>machine({input:4,ops:["×2","+1"],output:9,mid:[8]})},
  {t:"show",h:"An input-output table",b:`<p>Rule y = 3x − 2:</p><table class="tbl"><tr><th>x</th><td>1</td><td>2</td><td>3</td><td>4</td></tr><tr><th>y</th><td>1</td><td>4</td><td>7</td><td>10</td></tr></table><p>Each time x goes up by 1, y goes up by <b>3</b>. That's the 3 in 3x!</p>`,rule:"The jump in the outputs tells you what x is multiplied by."},
  {t:"show",h:"Finding the rule from a table",b:`<table class="tbl"><tr><th>x</th><td>1</td><td>2</td><td>3</td><td>4</td></tr><tr><th>y</th><td>7</td><td>12</td><td>17</td><td>22</td></tr></table><p>1. The outputs jump by <b>5</b>, so the rule starts with <b>5x</b>.</p><p>2. When x = 1, 5x = 5, but y is 7. We need <b>+2</b>.</p><p>Rule: <b>y = 5x + 2</b>. Check x = 3: 15 + 2 = 17 ✓</p>`,rule:"Jump → multiplier. Then fix with + or −."},
  {t:"try",h:"Your turn",b:`<table class="tbl"><tr><th>x</th><td>1</td><td>2</td><td>3</td><td>4</td></tr><tr><th>y</th><td>4</td><td>8</td><td>12</td><td>16</td></tr></table>`,q:{ask:"Rule: y =",a:{expr:"4x"},why:"Jumps of 4 → 4x. When x = 1, 4x = 4 already, so nothing to add."}},
  {t:"try",h:"Your turn",b:`<table class="tbl"><tr><th>x</th><td>1</td><td>2</td><td>3</td><td>4</td></tr><tr><th>y</th><td>1</td><td>3</td><td>5</td><td>7</td></tr></table>`,q:{ask:"Rule: y =",a:{expr:"2x-1"},why:"Jumps of 2 → 2x. When x = 1, 2x = 2, but y = 1, so −1."}},
 ],
 gen:[()=>{ const a=ri(2,9), b=nz(-6,9), x=ri(-3,10); return {q:`Rule: <b>y = ${lin(a,"x",b)}</b>. Find y when x = ${N(x)}.`,v:()=>machine({input:N(x),ops:["×"+a,(b<0?MINUS:"+")+Math.abs(b)],output:null}),steps:[{p:`${a} × ${P(x)} =`,a:{num:a*x},hint:"Times tables, then the sign."},{p:`${N(a*x)} ${b<0?MINUS:"+"} ${Math.abs(b)} =`,a:{num:a*x+b},hint:"Count on or back on the number line."}],final:{p:"y =",a:{num:a*x+b}},why:`${a} × ${P(x)} ${b<0?MINUS:"+"} ${Math.abs(b)} = ${N(a*x+b)}`}; },
  ()=>{ const a=ri(2,9), b=ri(-5,9); const xs=[1,2,3,4], ys=xs.map(x=>a*x+b);
   const tbl=`<table class="tbl"><tr><th>x</th>${xs.map(x=>`<td>${x}</td>`).join("")}</tr><tr><th>y</th>${ys.map(y=>`<td>${N(y)}</td>`).join("")}</tr></table>`;
   return {q:`Find the rule for this table:${tbl}`,steps:[{p:"When x goes up by 1, y goes up by…",a:{num:a},hint:`${N(ys[1])} − ${N(ys[0])}.`},{p:`So the rule starts with ${a}x. When x = 1, ${a}x = ${a}. y is ${N(ys[0])}. What do you add? (Type a negative if you take away.)`,a:{num:b},hint:`${a} + ? = ${N(ys[0])}.`}],final:{p:"y =",a:{expr:lin(a,"x",b).replace(/−/g,"-")}},why:`Jumps of ${a} → ${a}x, then ${b<0?MINUS:"+"} ${Math.abs(b)}: y = ${lin(a,"x",b)}`}; }],
 checks:[
  {q:"Outputs go 5, 8, 11, 14 for inputs 1, 2, 3, 4. The rule starts with…",c:["5x","3x","x + 3"],a:1,why:"The outputs jump by 3, so it's 3x (then + 2)."},
  {q:"Can a function give two different outputs for the same input?",c:["Yes","No"],a:1,why:"A function gives exactly one output for each input."},
  {q:"Rule y = 2x + 3. Which input gives 13?",c:["5","8","29"],a:0,why:"Run it backwards: 13 − 3 = 10, 10 ÷ 2 = 5."},
  {q:"Why do you check the rule with another value of x?",c:["To make sure it works for every input, not just one","It's not needed","To find the jump"],a:0,why:"A rule has to work for every row of the table."},
 ]});

/* ---------- Step 12: one-step equations ---------- */
const eqHint=(k,c)=>`Undo it on the balance: ${c?`take ${c} off both sides`:`split into ${k} groups`}.`;
STEPS.push({id:12,stage:2,title:"One-step equations",short:"One-step",root:10,
 learn:[
  {t:"show",h:"Solve = find the mystery number",b:`<p>x + 5 = 12. What has happened to x? It's had <b>5 added</b>.</p><p>Undo it: take 5 from both sides. <b>x = 7</b>.</p>`,v:()=>balance(["x",5],[12]),rule:"Ask: what's been done to x? Do the undo to both sides."},
  {t:"show",h:"Check by substituting",b:`<p>Put x = 7 back in: 7 + 5 = 12 ✓</p><p>Always check. It takes five seconds and catches mistakes.</p>`},
  {t:"show",h:"Multiplied",b:`<p>4x = 28. x has been <b>multiplied by 4</b>.</p><p>Undo: divide both sides by 4. 4 × ? = 28 → <b>x = 7</b>.</p>`,v:()=>balance(["x","x","x","x"],[28])},
  {t:"show",h:"Divided",b:`<p>x ÷ 3 = 6, written x/3 = 6. x has been <b>divided by 3</b>.</p><p>Undo: multiply both sides by 3. <b>x = 18</b>.</p><p>Check: 18 ÷ 3 = 6 ✓</p>`},
  {t:"try",h:"Your turn",b:`<p>x − 4 = 10</p>`,q:{ask:"x =",a:{num:14},why:"x had 4 taken away. Undo: add 4 to both sides. 10 + 4 = 14."}},
  {t:"try",h:"Your turn",b:`<p>6x = 54</p>`,q:{ask:"x =",a:{num:9},why:"6 × ? = 54 → 9."}},
  {t:"try",h:"Negative answers are fine",b:`<p>x + 8 = 3</p>`,q:{ask:"x =",a:{num:-5},why:"3 − 8: walk left 8 from 3, you reach −5. Check: −5 + 8 = 3 ✓"}},
 ],
 gen:[()=>{ const t=pick(["add","sub","mul","div"]); const x=t==="mul"||t==="div"?ri(2,12)*(Math.random()<.15?-1:1):nz(-9,15); const k=ri(2,9);
   const cfg={add:[`x + ${k} = ${N(x+k)}`,"Added "+k,`− ${k}`,x+k-k,`${N(x+k)} − ${k}`],sub:[`x − ${k} = ${N(x-k)}`,"Took away "+k,`+ ${k}`,0,`${N(x-k)} + ${k}`],mul:[`${k}x = ${N(k*x)}`,"Multiplied by "+k,`÷ ${k}`,0,`${N(k*x)} ÷ ${k}`],div:[`x/${k} = ${N(x)}`,"Divided by "+k,`× ${k}`,0,`${N(x)} × ${k}`]}[t];
   const sol=t==="div"?x*k:x;
   const choices=[`Added ${k}`,`Took away ${k}`,`Multiplied by ${k}`,`Divided by ${k}`];
   return {q:`Solve <b>${cfg[0]}</b>`,v:t!=="div"&&t!=="sub"&&Math.abs(x)<=12&&x>0&&k*x<=40?()=>balance(t==="mul"?Array(k).fill("x"):["x",k],[t==="mul"?k*x:x+k]):null,
    steps:[{p:"What has been done to x?",a:{choice:choices,ans:["add","sub","mul","div"].indexOf(t)},hint:"Read it: is there a + , −, a number stuck to x, or a ÷?"},{p:`Undo it: do ${cfg[2]} to both sides. ${cfg[4]} =`,a:{num:sol},hint:t==="mul"?`${k} × ? = ${N(k*x)}.`:t==="div"?`${k} lots of ${N(x)}.`:"Count on or back on the number line."}],
    final:{p:"x =",a:{num:sol}},why:`${cfg[4]} = ${N(sol)}. Check it in the equation.`}; }],
 checks:[
  {q:"To solve x − 6 = 2, what do you do to both sides?",c:["Take away 6","Add 6","Divide by 6"],a:1,why:"x had 6 taken away; the undo is + 6. x = 8."},
  {q:"Sara solves 5x = 35 and gets x = 30. What did she do wrong?",c:["She took away 5 instead of dividing by 5","Nothing","She added 5"],a:0,why:"5x means 5 × x, so the undo is ÷ 5: x = 7."},
  {q:"How can you check x = 4 is right for x + 9 = 13?",c:["Put 4 back in: 4 + 9 = 13 ✓","Solve it again","Ask someone"],a:0,why:"Substituting back always checks a solution."},
  {q:"x/4 = 3. What is x?",c:["12","0.75","7"],a:0,why:"Undo ÷ 4 by × 4: 3 × 4 = 12."},
 ]});

/* ---------- Step 13: two-step equations ---------- */
STEPS.push({id:13,stage:2,title:"Two-step equations",short:"Two-step",root:10,
 learn:[
  {t:"show",h:"Two things happened to x",b:`<p>3x + 2 = 17. Think of it as a machine: x went in, got <b>×3</b>, then <b>+2</b>, and 17 came out.</p>`,v:()=>machine({input:"x",ops:["×3","+2"],output:17})},
  {t:"show",h:"Undo the last step first",b:`<p>Run it backwards: 17 → undo +2 → <b>15</b> → undo ×3 → <b>5</b>.</p><p>So x = 5. Check: 3 × 5 + 2 = 17 ✓</p>`,v:()=>machine({input:17,ops:["−2","÷3"],output:5,mid:[15]}),rule:"Undo + or − first, then × or ÷."},
  {t:"show",h:"The same on the balance",b:`<p>Take 2 off both sides: 3x = 15. Split into 3 groups: x = 5.</p>`,v:()=>balance(["x","x","x",2],[17])},
  {t:"try",h:"Your turn",b:`<p>4x − 3 = 25</p>`,q:{ask:"x =",a:{num:7},why:"Undo −3: 25 + 3 = 28. Undo ×4: 28 ÷ 4 = 7."}},
  {t:"try",h:"Your turn",b:`<p>x/2 + 5 = 9</p>`,v:()=>machine({input:"x",ops:["÷2","+5"],output:9}),q:{ask:"x =",a:{num:8},why:"Undo +5: 9 − 5 = 4. Undo ÷2: 4 × 2 = 8."}},
  {t:"try",h:"With negatives",b:`<p>2x + 9 = 1</p>`,q:{ask:"x =",a:{num:-4},why:"1 − 9 = −8. −8 ÷ 2 = −4. Check: 2 × (−4) + 9 = 1 ✓"}},
 ],
 gen:[()=>{ const k=ri(2,9), x=Math.random()<.2?-ri(1,6):ri(1,10), c=nz(-12,12), div=Math.random()<.2;
   if(div){ const r=ri(2,9), d=ri(2,6), cc=ri(1,9); const X=r*d; return {q:`Solve <b>x/${d} + ${cc} = ${r+cc}</b>`,v:()=>machine({input:"x",ops:["÷"+d,"+"+cc],output:r+cc}),steps:[{p:`Undo +${cc}: ${r+cc} − ${cc} =`,a:{num:r},hint:`Count back ${cc}.`},{p:`Undo ÷${d}: ${r} × ${d} =`,a:{num:X},hint:"Times tables."}],final:{p:"x =",a:{num:X}},why:`${r+cc} − ${cc} = ${r}, × ${d} = ${X}`}; }
   const rhs=k*x+c;
   return {q:`Solve <b>${lin(k,"x",c)} = ${N(rhs)}</b>`,v:()=>machine({input:"x",ops:["×"+k,(c<0?MINUS:"+")+Math.abs(c)],output:N(rhs)}),
    steps:[{p:`Undo the ${c<0?MINUS:"+"}${Math.abs(c)} first: ${N(rhs)} ${c<0?"+":MINUS} ${Math.abs(c)} =`,a:{num:k*x},hint:`The undo of ${c<0?"taking away":"adding"} ${Math.abs(c)} is ${c<0?"adding":"taking away"} ${Math.abs(c)}. Use the number line if it crosses zero.`,hv:()=>numberLine({min:Math.min(rhs,k*x,0)-1,max:Math.max(rhs,k*x,0)+1,start:rhs,jumps:[-c]})},
           {p:`Now ${k}x = ${N(k*x)}. Undo ×${k}: ${k} × ? = ${N(k*x)}`,a:{num:x},hint:`Your ${k} times table${x<0?", and the answer is negative because "+N(k*x)+" is negative":""}.`}],
    final:{p:"x =",a:{num:x}},why:`${N(rhs)} ${c<0?"+":MINUS} ${Math.abs(c)} = ${N(k*x)}, ÷ ${k} = ${N(x)}. Check: ${k} × ${P(x)} ${c<0?MINUS:"+"} ${Math.abs(c)} = ${N(rhs)} ✓`}; }],
 checks:[
  {q:"Solving 5x + 4 = 29, what do you undo first?",c:["The + 4","The × 5"],a:0,why:"Undo in reverse order. The +4 happened last, so it comes off first."},
  {q:"Max solves 2x + 6 = 20 by doing 20 ÷ 2 = 10, then 10 − 6 = 4. Is x = 4 right?",c:["Yes","No: check 2 × 4 + 6 = 14, not 20"],a:1,why:"He undid in the wrong order. Correct: 20 − 6 = 14, 14 ÷ 2 = 7."},
  {q:"'Every two-step equation has a whole-number answer.'",c:ASN,a:1,why:"Sometimes. 2x + 1 = 6 gives x = 2.5."},
  {q:"3x − 5 = 10. Which first step is right?",c:["3x = 15","3x = 5","x − 5 = 30"],a:0,why:"Add 5 to both sides: 3x = 15."},
 ]});
/* ---------- Step 14: multi-step ---------- */
STEPS.push({id:14,stage:2,title:"Multi-step equations (brackets, letters on both sides)",short:"Multi-step",root:10,
 learn:[
  {t:"show",h:"A bracket",b:`<p>3(x + 2) = 21: three lots of (x + 2) balance 21.</p><p><b>Way 1:</b> split into 3 groups first. x + 2 = 7, so x = 5.</p><p><b>Way 2:</b> expand first. 3x + 6 = 21, then 3x = 15, x = 5.</p><p>Both work. Way 1 is quicker when the number divides nicely.</p>`,v:()=>balance(["x",2,"x",2,"x",2],[21])},
  {t:"try",h:"Your turn",b:`<p>4(x − 1) = 20</p>`,q:{ask:"x =",a:{num:6},why:"Split into 4 groups: x − 1 = 5, so x = 6."}},
  {t:"show",h:"Boxes on both sides",b:`<p>5x + 3 = 2x + 12. There are boxes on both sides of the scale.</p>`,v:()=>balance(["x","x","x","x","x",3],["x","x",12])},
  {t:"show",h:"Take boxes off both sides",b:`<p>Take 2 boxes off <b>both</b> sides. The scale stays level:</p><p><b>3x + 3 = 12</b>. Now it's a two-step equation you already know: 3x = 9, x = 3.</p>`,v:()=>balance(["x","x","x",3],[12]),rule:"Get the letters on one side by taking the smaller number of boxes off both sides."},
  {t:"tool",h:"Solve it on the scale",b:`<p>Try it yourself with the buttons.</p>`,tool:()=>BalanceTool({a:4,b:1,c:2,d:9})},
  {t:"try",h:"Your turn",b:`<p>7x + 2 = 3x + 18</p>`,q:{ask:"x =",a:{num:4},why:"Take 3x off both sides: 4x + 2 = 18. 4x = 16. x = 4."}},
 ],
 gen:[()=>{ const k=ri(2,6), x=ri(-3,9), c=nz(-8,8); const r=k*(x+c);
   return {q:`Solve <b>${k}(x${sgn(c)}) = ${N(r)}</b>`,steps:[{p:`Split into ${k} groups: x${sgn(c)} = ${N(r)} ÷ ${k} =`,a:{num:x+c},hint:`${k} × ? = ${N(r)}.`},{p:`Undo the ${c<0?MINUS:"+"}${Math.abs(c)}: x =`,a:{num:x},hint:`${N(x+c)} ${c<0?"+":MINUS} ${Math.abs(c)}.`}],final:{p:"x =",a:{num:x}},why:`x${sgn(c)} = ${N(x+c)}, so x = ${N(x)}`}; },
  ()=>{ const c=ri(1,4), a=c+ri(1,4), x=ri(1,8), b=ri(0,9), d=(a-c)*x+b;
   return {q:`Solve <b>${lin(a,"x",b)} = ${lin(c,"x",d)}</b>`,v:()=>balance([...Array(a).fill("x"),b],[...Array(c).fill("x"),d]),steps:[{p:`Take ${co(c,"x")} off both sides. The left side becomes…`,a:{expr:lin(a-c,"x",b).replace(/−/g,"-")},hint:`${a} boxes − ${c} boxes = ${a-c} boxes. The ${b} stays.`},{p:`Now ${lin(a-c,"x",b)} = ${d}. Take ${b} off both sides: ${co(a-c,"x")} =`,a:{num:(a-c)*x},hint:`${d} − ${b}.`},{p:`x =`,a:{num:x},hint:`${a-c} × ? = ${(a-c)*x}.`}],final:{p:"x =",a:{num:x}},why:`${lin(a-c,"x",b)} = ${d} → x = ${x}. Check both sides: ${a*x+b} = ${c*x+d} ✓`}; }],
 checks:[
  {q:"5x + 1 = 2x + 10. Which is a good first move?",c:["Take 2x off both sides","Divide by 5","Add 2x to both sides"],a:0,why:"Taking the smaller number of x's off both sides gets all the x's on one side."},
  {q:"After taking 2x from both sides of 5x + 1 = 2x + 10, you get…",c:["3x + 1 = 10","7x + 1 = 10","3x = 10"],a:0,why:"5x − 2x = 3x on the left. The right is just 10."},
  {q:"2(x + 3) = 14. Ella says x + 3 = 7. Is that allowed?",c:["Yes: she split both sides into 2 groups","No: you must expand first"],a:0,why:"Dividing both sides by 2 keeps it balanced."},
  {q:"How can you be sure x = 3 solves 4x + 2 = x + 11?",c:["Put 3 into both sides: 14 and 14 ✓","It looks right","Solve it again"],a:0,why:"Both sides give the same number, so it balances."},
 ]});

/* ---------- Step 15: forming equations from words ---------- */
STEPS.push({id:15,stage:2,title:"Forming and solving equations from word problems",short:"Word problems",root:4,
 learn:[
  {t:"show",h:"Four moves",b:`<ol><li><b>Name the mystery.</b> "Let x be…"</li><li><b>Write what's equal.</b> Use the words to make an equation.</li><li><b>Solve</b> it.</li><li><b>Answer the question</b> in words, and check it makes sense.</li></ol>`,rule:"Name it, write it, solve it, answer it."},
  {t:"show",h:"Example: ages",b:`<p>Oliver's sister is 3 years older than him. Their ages add up to 25. How old is Oliver?</p><p>1. Let Oliver be <b>x</b>. His sister is <b>x + 3</b>.</p><p>2. Together: <b>x + x + 3 = 25</b>, which is 2x + 3 = 25.</p><p>3. 2x = 22, x = 11.</p><p>4. Oliver is <b>11</b>, his sister 14. Check: 11 + 14 = 25 ✓</p>`,v:()=>bags(["bag:x","op:+","bag:x","dots:3","txt:= 25"])},
  {t:"show",h:"Example: a rectangle",b:`<p>A rectangle is x cm wide and (x + 4) cm long. Its perimeter is 32 cm.</p><p>Perimeter = all four sides: x + (x + 4) + x + (x + 4) = <b>4x + 8</b>.</p><p>4x + 8 = 32 → 4x = 24 → <b>x = 6</b>. The rectangle is 6 cm by 10 cm.</p>`,v:()=>vis(SV(240,110,`<rect x="40" y="20" width="160" height="60" style="fill:var(--accent-soft);stroke:var(--ink);stroke-width:2"/>`+T(120,10,"x + 4")+T(20,50,"x")+T(120,96,"x + 4")+T(218,50,"x")))},
  {t:"try",h:"Your turn",b:`<p>"I think of a number, multiply it by 4 and subtract 7. The answer is 29."</p>`,q:{ask:"Write the equation (use n):",a:{expr:"4n-7=29"},eq:true,why:"4n − 7 = 29. Solving it gives n = 9."}},
  {t:"show",h:"Example: angles",b:`<p>The angles in a triangle are x, 2x and 3x. Angles in a triangle add up to 180°.</p><p>x + 2x + 3x = 180 → 6x = 180 → <b>x = 30</b>. The angles are 30°, 60° and 90°.</p>`},
  {t:"try",h:"Your turn",b:`<p>Three friends share some money. Ali gets x dirhams, Ben gets twice as much as Ali, and Cal gets 10 dirhams more than Ali. Altogether it's 70 dirhams.</p>`,q:{ask:"How much does Ali get?",a:{num:15},why:"x + 2x + (x + 10) = 70 → 4x + 10 = 70 → 4x = 60 → x = 15."}},
 ],
 gen:[()=>{ const T=[
    ()=>{const x=ri(2,15),k=ri(2,6),c=ri(1,12); return {s:`I think of a number, multiply it by ${k} and add ${c}. The answer is ${k*x+c}. What's my number?`,lhs:`${k}n+${c}`,rhs:k*x+c,x,L:"n",ans:x,unit:""};},
    ()=>{const x=ri(5,14),c=ri(1,6); return {s:`Oliver is x years old. His brother is ${c} years older. Their ages add up to ${2*x+c}. How old is Oliver?`,lhs:`2x+${c}`,rhs:2*x+c,x,L:"x",ans:x,unit:" years"};},
    ()=>{const x=ri(2,12),c=ri(1,8); return {s:`A rectangle is x cm wide and (x + ${c}) cm long. Its perimeter is ${4*x+2*c} cm. Find x.`,lhs:`4x+${2*c}`,rhs:4*x+2*c,x,L:"x",ans:x,unit:" cm"};},
    ()=>{const k=pick([[1,2,3],[1,1,2],[2,3,4],[1,3,5]]); const s=k[0]+k[1]+k[2]; if(180%s) return null; const x=180/s; return {s:`The angles in a triangle are ${co(k[0],"x")}, ${co(k[1],"x")} and ${co(k[2],"x")}. Find x.`,lhs:`${s}x`,rhs:180,x,L:"x",ans:x,unit:"°"};},
    ()=>{const p=ri(3,9),c=ri(5,20),n=ri(2,10); return {s:`A gym charges ${c} dirhams to join, then ${p} dirhams a visit. Oliver paid ${c+p*n} dirhams. How many visits (v) did he make?`,lhs:`${p}v+${c}`,rhs:c+p*n,x:n,L:"v",ans:n,unit:" visits"};},
   ]; let o=null; while(!o) o=pick(T)();
   return {q:o.s,steps:[{p:`Write the left side of the equation. ☐ = ${o.rhs}`,a:{expr:o.lhs},hint:`Use ${o.L} for the mystery number. Build it up from the words in order.`},{p:`Solve ${o.lhs.replace(/\+/g," + ")} = ${o.rhs}. ${o.L} =`,a:{num:o.x},hint:`Undo the + first, then the ×.`}],final:{p:`Answer${o.unit?" ("+o.unit.trim()+")":""}:`,a:{num:o.ans}},why:`${o.lhs.replace(/\+/g," + ")} = ${o.rhs} → ${o.L} = ${o.x}.`}; }],
 checks:[
  {q:"'The sum of two numbers is 20. One is 4 more than the other.' Which equation fits?",c:["x + x + 4 = 20","x + 4 = 20","4x = 20"],a:0,why:"The numbers are x and x + 4. Together they make 20."},
  {q:"You solve a problem and get Oliver's age as x = −3. What should you think?",c:["Great, done","Something went wrong: an age can't be negative","Ages can be negative"],a:1,why:"Step 4 is to check the answer makes sense in the story."},
  {q:"Why start with 'Let x be…'?",c:["So everyone knows what the letter stands for","It's just a habit","Teachers like it"],a:0,why:"The letter needs a meaning before you can write an equation."},
  {q:"A rectangle is x wide and 2x long. Its perimeter is…",c:["3x","6x","2x²"],a:1,why:"x + 2x + x + 2x = 6x."},
 ]});

/* ---------- Step 16: rearranging formulas ---------- */
STEPS.push({id:16,stage:2,title:"Rearranging formulas",short:"Rearranging",root:9,
 learn:[
  {t:"show",h:"A formula is a rule with letters",b:`<p>The perimeter of a square: <b>P = 4s</b>. P is the <b>subject</b>: it's on its own.</p><p>If you know s, you get P. But what if you know P and want s?</p>`},
  {t:"show",h:"Use the undo machine",b:`<p>s goes into a ×4 machine and P comes out.</p><p>Run it backwards: P goes into a ÷4 machine and s comes out. So <b>s = P/4</b>.</p>`,v:()=>h("div",{class:"stack"},machine({input:"s",ops:["×4"],output:"P"}),machine({input:"P",ops:["÷4"],output:"s"})),rule:"Rearranging is solving, but you keep the letters."},
  {t:"show",h:"Two steps",b:`<p><b>y = 2x + 5</b>. Make x the subject.</p><p>x → ×2 → +5 → y. Backwards: y → −5 → ÷2 → x.</p><p>So <b>x = (y − 5)/2</b>. The bracket shows you take 5 away <b>before</b> dividing.</p>`,v:()=>machine({input:"y",ops:["−5","÷2"],output:"x"})},
  {t:"try",h:"Check with numbers",b:`<p>If x = 3, then y = 2 × 3 + 5 = 11.</p>`,q:{ask:"Now put y = 11 into x = (y − 5)/2. x =",a:{num:3},why:"(11 − 5)/2 = 3 ✓. The rearranged formula gets you back to the start."}},
  {t:"try",h:"Your turn",b:`<p>y = x + 7. Make x the subject.</p>`,q:{ask:"x =",a:{expr:"y-7"},why:"Undo +7: x = y − 7."}},
  {t:"try",h:"Your turn",b:`<p>Area of a rectangle: A = lw. Make w the subject.</p>`,q:{ask:"w =",a:{expr:"A/l"},why:"w was multiplied by l. Undo: divide by l. w = A/l. Type it as A/l."}},
 ],
 gen:[()=>{ const T=[
    ()=>{const c=ri(2,12);return {f:`y = x + ${c}`,ans:`y-${c}`,st:[{p:"What was done to x?",a:{choice:[`+ ${c}`,`× ${c}`],ans:0}},{p:"So x =",a:{expr:`y-${c}`}}]};},
    ()=>{const c=ri(2,9);return {f:`y = ${c}x`,ans:`y/${c}`,st:[{p:"What was done to x?",a:{choice:[`+ ${c}`,`× ${c}`],ans:1}},{p:"So x =",a:{expr:`y/${c}`}}]};},
    ()=>{const m=ri(2,9),c=ri(1,12);return {f:`y = ${m}x + ${c}`,ans:`(y-${c})/${m}`,st:[{p:`Undo the + ${c} first. Write what's left: ${m}x =`,a:{expr:`y-${c}`}},{p:`Now undo × ${m}. x =`,a:{expr:`(y-${c})/${m}`}}]};},
    ()=>{const m=ri(2,9),c=ri(1,12);return {f:`y = ${m}x − ${c}`,ans:`(y+${c})/${m}`,st:[{p:`Undo the − ${c} first: ${m}x =`,a:{expr:`y+${c}`}},{p:`Now undo × ${m}. x =`,a:{expr:`(y+${c})/${m}`}}]};},
    ()=>{const c=ri(2,9);return {f:`y = x/${c}`,ans:`${c}y`,st:[{p:"What was done to x?",a:{choice:[`÷ ${c}`,`− ${c}`],ans:0}},{p:"So x =",a:{expr:`${c}y`}}]};},
    ()=>({f:"y = mx + c",ans:"(y-c)/m",st:[{p:"Undo the + c first: mx =",a:{expr:"y-c"}},{p:"Now undo × m. x =",a:{expr:"(y-c)/m"}}]}),
   ]; const o=pick(T)();
   return {q:`Make <b>x</b> the subject of <b>${o.f}</b>`,steps:o.st.map(s=>({...s,hint:"Picture the machine: x goes in, y comes out. Run it backwards, undoing the last step first."})),final:{p:"x =",a:{expr:o.ans}},why:`x = ${o.ans.replace(/-/g," − ").replace(/\+/g," + ")}. Test it: pick a number for x, find y, then put y back in.`}; }],
 checks:[
  {q:"y = 3x + 1. Ana writes x = y/3 − 1. Test with x = 2 (so y = 7). Is she right?",c:["Yes","No: 7/3 − 1 isn't 2"],a:1,why:"She undid in the wrong order. Correct: x = (y − 1)/3, and (7 − 1)/3 = 2 ✓."},
  {q:"What does 'make r the subject' mean?",c:["Get r on its own on one side","Put r first","Find a number for r"],a:0,why:"The subject is the letter on its own."},
  {q:"v = u + at. To make u the subject you…",c:["Take at away from both sides","Divide by a","Add t"],a:0,why:"u had at added, so undo it: u = v − at."},
  {q:"Why is rearranging like solving an equation?",c:["You use the same undo moves on both sides","It isn't","You get a number at the end"],a:0,why:"Same balance moves, you just keep letters instead of numbers."},
 ]});

/* ---------- Preview 3 ---------- */
PREVIEWS[3]={title:"Coming up: predicting patterns",cards:[
  {t:"show",h:"How many matchsticks?",b:`<p>Look at these shapes made from matchsticks.</p>`,v:()=>patternRow("sq",4,{more:true}),after:`<p>Shape 1 uses 4, shape 2 uses 7, shape 3 uses 10. How many would shape <b>100</b> use? You could build it… or find a rule.</p>`},
  {t:"try",h:"Have a go",b:`<p>Each new square adds the same number of matchsticks.</p>`,q:{ask:"How many sticks does each new square add?",a:{num:3},why:"4 → 7 → 10: three more each time. Shape 100 uses 301. You'll find out why in step 17."}},
  {t:"show",h:"Words you'll hear in class",b:`<div class="kw">
    <div><b>Sequence</b>Numbers in order following a rule: 4, 7, 10, 13…</div>
    <div><b>Term</b>One number in the sequence.</div>
    <div><b>Position</b>Where a term is: 1st, 2nd, 3rd… (called n).</div>
    <div><b>Term-to-term rule</b>How to get from one term to the next: "+3".</div>
    <div><b>nth term</b>A rule that jumps straight to any position: 3n + 1.</div>
    <div><b>Difference</b>The gap between terms.</div></div>`},
  {t:"show",h:"Your Criterion B task",b:`<p>Your investigation will ask you to find a pattern, write a general rule (the nth term), and test that it works. The lab has a practice investigation at step 21.</p>`},
]};

/* ---------- Step 17: a rule works for every position ---------- */
STEPS.push({id:17,stage:3,big:true,title:"A rule works for every position",short:"Rules for patterns",
 learn:[
  {t:"show",h:"Matchstick squares",b:`<p>Count the sticks in each shape.</p>`,v:()=>patternRow("sq",4),after:`<table class="tbl"><tr><th>Shape</th><td>1</td><td>2</td><td>3</td><td>4</td></tr><tr><th>Sticks</th><td>4</td><td>7</td><td>10</td><td>13</td></tr></table>`},
  {t:"show",h:"See the pattern in the picture",b:`<p>Colour helps. The <b style="color:var(--c4)">purple</b> stick is the very first one. Then each square adds a "⊐" shape of <b>3</b> sticks.</p>`,v:()=>patternRow("sq",4,{colour:true}),rule:"Look for the part that stays the same and the part that grows."},
  {t:"show",h:"So any shape number",b:`<p>Shape n has: 1 purple stick + n lots of 3 sticks.</p><p>Sticks = <b>3n + 1</b>.</p><p>Shape 10: 3 × 10 + 1 = 31. Shape 100: 3 × 100 + 1 = <b>301</b>. No building needed!</p>`},
  {t:"try",h:"Your turn",b:`<p>Use the rule 3n + 1.</p>`,q:{ask:"How many sticks does shape 20 use?",a:{num:61},why:"3 × 20 + 1 = 61."}},
  {t:"tool",h:"Play with patterns",b:`<p>Move the slider. Watch the part that stays the same and the part that grows.</p>`,tool:()=>PatternTool()},
  {t:"show",h:"Dot patterns work the same way",b:`<p>Grey dots stay the same. Each shape adds a new column of coloured dots.</p>`,v:()=>patternRow({dots:true,a:2,b:3},4),after:`<p>3 grey dots + n columns of 2 → <b>2n + 3</b>.</p>`},
  {t:"try",h:"Your turn",b:``,v:()=>patternRow({dots:true,a:4,b:1},3),q:{ask:"Rule for the number of dots in shape n:",a:{expr:"4n+1"},why:"1 grey dot that never changes, plus 4 more dots each shape: 4n + 1."}},
 ],
 gen:[()=>{ const fam=pick([{k:"sq",a:3,b:1},{k:"tri",a:2,b:1},{k:"sq2",a:5,b:2},{k:{dots:true,a:ri(2,5),b:ri(1,4)}}]); const a=fam.a||fam.k.a, b=fam.b!=null?fam.b:fam.k.b; const n=pick([10,12,20,25,50,100]);
   return {q:`Here are the first 3 shapes. How many ${fam.k.dots?"dots":"sticks"} in shape <b>${n}</b>?`,v:()=>patternRow(fam.k,3,{colour:!fam.k.dots}),steps:[{p:"How many does each new shape add?",a:{num:a},hint:"Count shape 1 and shape 2, then find the difference."},{p:"How many are in the part that never changes? (Shape 1 minus the growing part)",a:{num:b},hint:`Shape 1 has ${a+b}. Take away the ${a} that grows.`},{p:`Rule: ${a}n + ${b}. For shape ${n}: ${a} × ${n} + ${b} =`,a:{num:a*n+b},hint:`${a} × ${n} = ${a*n}, then + ${b}.`}],final:{p:"Answer:",a:{num:a*n+b}},why:`${a} × ${n} + ${b} = ${a*n+b}`}; }],
 checks:[
  {q:"Why is a rule better than drawing shape 100?",c:["It works for every shape straight away","It's prettier","It isn't better"],a:0,why:"A general rule works for any position, however big."},
  {q:"In the rule 3n + 1 for matchstick squares, what does the 3 mean?",c:["Each new square adds 3 sticks","There are 3 squares","Start with 3 sticks"],a:0,why:"The number in front of n is how many each new shape adds."},
  {q:"In 3n + 1, what does the + 1 mean?",c:["The one extra stick at the start","Add one square","The first shape"],a:0,why:"It's the part that doesn't grow."},
  {q:"A rule gives shape 2 = 9 sticks, but you count 8. What does that tell you?",c:["The rule is wrong for this pattern","Counting is wrong, rules are always right","Nothing"],a:0,why:"A rule must match every shape. Always test it."},
 ]});

/* ---------- Step 18: continuing sequences ---------- */
STEPS.push({id:18,stage:3,title:"Continuing sequences and predicting terms",short:"Sequences",root:17,
 learn:[
  {t:"show",h:"Term-to-term rules",b:`<p>5, 8, 11, 14, … Each term is <b>3 more</b> than the last. The term-to-term rule is <b>+3</b>.</p>`,v:()=>numberLine({min:4,max:18,start:5,jumps:[3,3,3,3]}),rule:"Find the jump between terms."},
  {t:"try",h:"Next term",b:`<p>5, 8, 11, 14, …</p>`,q:{ask:"What comes next?",a:{num:17},why:"14 + 3 = 17."}},
  {t:"show",h:"Going down",b:`<p>20, 16, 12, 8, … The jump is <b>−4</b>. Keep going: 4, 0, −4, −8…</p><p>Sequences can carry on into the negatives.</p>`,v:()=>numberLine({min:-9,max:21,start:20,jumps:[-4,-4,-4,-4,-4,-4,-4]})},
  {t:"show",h:"Not every sequence adds",b:`<p>3, 6, 12, 24, … <b>doubles</b> (× 2).</p><p>1, 4, 9, 16, … are the <b>square numbers</b>: 1², 2², 3², 4².</p><p>Always check the jump between <b>every</b> pair, not just the first.</p>`},
  {t:"try",h:"Missing term",b:`<p>7, ☐, 19, 25</p>`,q:{ask:"☐ =",a:{num:13},why:"From 19 to 25 is +6, so the jump is 6. 7 + 6 = 13 ✓, and 13 + 6 = 19 ✓."}},
  {t:"try",h:"Will it appear?",b:`<p>2, 5, 8, 11, … (jump +3) Will 30 appear?</p>`,q:{choices:["Yes","No"],ans:1,why:"The terms are 2 more than the 3 times table: 2, 5, 8, …, 29, 32. 30 is 3 × 10, so it can't be 2 more than a multiple of 3."}},
 ],
 gen:[()=>{ const t=pick(["next","next","miss","nth"]); const d=nz(-7,9), s=ri(-5,20); const seq=[0,1,2,3,4,5,6,7].map(i=>s+i*d);
   if(t==="next") return {q:`What are the next two terms?<br><b>${seq.slice(0,4).map(N).join(", ")}, …</b>`,steps:[{p:"The jump between terms is (type − if it goes down):",a:{num:d},hint:`${N(seq[1])} − ${N(seq[0])}.`},{p:"5th term:",a:{num:seq[4]},hint:`${N(seq[3])} ${d<0?MINUS:"+"} ${Math.abs(d)}.`},{p:"6th term:",a:{num:seq[5]},hint:`${N(seq[4])} ${d<0?MINUS:"+"} ${Math.abs(d)}.`}],final:{p:"6th term:",a:{num:seq[5]}},why:`Jump ${d>0?"+":MINUS}${Math.abs(d)}: ${N(seq[4])}, ${N(seq[5])}`};
   if(t==="miss") return {q:`Find the missing term:<br><b>${N(seq[0])}, ☐, ${N(seq[2])}, ${N(seq[3])}</b>`,steps:[{p:`The jump from ${N(seq[2])} to ${N(seq[3])} is:`,a:{num:d},hint:`${N(seq[3])} − ${N(seq[2])}.`}],final:{p:"☐ =",a:{num:seq[1]}},why:`${N(seq[0])} ${d<0?MINUS:"+"} ${Math.abs(d)} = ${N(seq[1])}`};
   return {q:`Find the 8th term:<br><b>${seq.slice(0,4).map(N).join(", ")}, …</b>`,steps:[{p:"The jump is:",a:{num:d},hint:`${N(seq[1])} − ${N(seq[0])}.`},{p:`From term 1 to term 8 is 7 jumps. 7 × ${P(d)} =`,a:{num:7*d},hint:`Times tables: 7 × ${Math.abs(d)}.`},{p:`${N(seq[0])} + ${P(7*d)} =`,a:{num:seq[7]},hint:"Number line."}],final:{p:"8th term:",a:{num:seq[7]}},why:`${N(seq[0])} + 7 jumps of ${N(d)} = ${N(seq[7])}`}; }],
 checks:[
  {q:"2, 4, 8, … Is the next term definitely 10?",c:["Yes","No: it could be doubling, giving 16"],a:1,why:"2 → 4 is +2 but 4 → 8 is +4. Check every jump."},
  {q:"From term 1 to term 10, how many jumps are there?",c:["10","9"],a:1,why:"Like fence posts: 10 terms have 9 gaps between them."},
  {q:"'A sequence that goes down must stop at 0.'",c:ASN,a:2,why:"Never: it carries on into the negatives."},
  {q:"What is the term-to-term rule for 1, 4, 9, 16?",c:["+3","The jumps grow: +3, +5, +7","×4"],a:1,why:"They're square numbers, so the jump keeps growing by 2."},
 ]});

/* ---------- Step 19: nth term linear ---------- */
STEPS.push({id:19,stage:3,title:"The nth term of linear sequences",short:"nth term",root:17,
 learn:[
  {t:"show",h:"Jump straight to any term",b:`<p>Counting on is slow for the 100th term. The <b>nth term</b> is a rule using the position n.</p><table class="tbl"><tr><th>Position n</th><td>1</td><td>2</td><td>3</td><td>4</td></tr><tr><th>Term</th><td>5</td><td>8</td><td>11</td><td>14</td></tr></table>`},
  {t:"show",h:"Step 1: the jump gives a times table",b:`<p>The terms go up by <b>3</b>. So compare with the <b>3 times table</b>, which is 3n:</p><table class="tbl"><tr><th>3n</th><td>3</td><td>6</td><td>9</td><td>12</td></tr><tr><th>Term</th><td>5</td><td>8</td><td>11</td><td>14</td></tr></table><p>Every term is <b>2 more</b> than the times table.</p>`,rule:"Jump of d → compare with the d times table."},
  {t:"show",h:"Step 2: adjust",b:`<p>So the nth term is <b>3n + 2</b>.</p><p>Check position 4: 3 × 4 + 2 = 14 ✓</p><p>100th term: 3 × 100 + 2 = <b>302</b>.</p>`},
  {t:"try",h:"Your turn",b:`<p>7, 11, 15, 19, …</p><table class="tbl"><tr><th>4n</th><td>4</td><td>8</td><td>12</td><td>16</td></tr><tr><th>Term</th><td>7</td><td>11</td><td>15</td><td>19</td></tr></table>`,q:{ask:"nth term =",a:{expr:"4n+3"},why:"Jump of 4 → 4n. Each term is 3 more: 4n + 3."}},
  {t:"show",h:"Below the times table",b:`<p>4, 9, 14, 19: jump 5, so 5n = 5, 10, 15, 20. Every term is <b>1 less</b>. nth term = <b>5n − 1</b>.</p>`},
  {t:"show",h:"Going down",b:`<p>20, 17, 14, 11: the jump is <b>−3</b>, so compare with −3n = −3, −6, −9, −12.</p><p>The terms are 23 more each time. nth term = <b>−3n + 23</b>, which you can also write as 23 − 3n.</p>`},
  {t:"try",h:"Your turn",b:`<p>2, 8, 14, 20, …</p>`,q:{ask:"nth term =",a:{expr:"6n-4"},why:"Jump 6 → 6n = 6, 12, 18, 24. Each term is 4 less: 6n − 4."}},
 ],
 gen:[()=>{ const d=Math.random()<.15?-ri(2,5):ri(2,9), c=ri(-8,10); const seq=[1,2,3,4].map(n=>d*n+c);
   return {q:`Find the nth term:<br><b>${seq.map(N).join(", ")}, …</b>`,steps:[{p:"The jump between terms is:",a:{num:d},hint:`${N(seq[1])} − ${N(seq[0])}.`},{p:`So compare with ${co(d,"n")}. When n = 1, ${co(d,"n")} =`,a:{num:d},hint:`${d} × 1.`},{p:`The first term is ${N(seq[0])}. What do you add to ${N(d)} to get it? (Type a negative if you take away.)`,a:{num:c},hint:`${N(d)} + ? = ${N(seq[0])}. Use the number line if needed.`}],final:{p:"nth term:",a:{expr:lin(d,"n",c).replace(/−/g,"-")}},why:`Jump ${N(d)} → ${co(d,"n")}, adjust by ${c<0?MINUS:"+"}${Math.abs(c)}: ${lin(d,"n",c)}`}; },
  ()=>{ const d=ri(2,9), c=ri(-6,9), n=pick([10,20,25,50,100]); return {q:`The nth term of a sequence is <b>${lin(d,"n",c)}</b>. Find the ${n}th term.`,steps:[{p:`Substitute n = ${n}: ${d} × ${n} =`,a:{num:d*n},hint:"Times tables, then add the zeros."},{p:`${d*n} ${c<0?MINUS:"+"} ${Math.abs(c)} =`,a:{num:d*n+c},hint:"Count on or back."}],final:{p:`${n}th term:`,a:{num:d*n+c}},why:`${d} × ${n} ${c<0?MINUS:"+"} ${Math.abs(c)} = ${d*n+c}`}; }],
 checks:[
  {q:"A sequence goes up by 7 each time. Its nth term starts with…",c:["7n","n + 7","7"],a:0,why:"A jump of 7 means it follows the 7 times table, 7n."},
  {q:"Is 4n + 1 the same as 5n?",c:["Yes","No"],a:1,why:"4n + 1 gives 5, 9, 13. 5n gives 5, 10, 15. They match only at n = 1."},
  {q:"The nth term is 2n + 5. Is 40 in the sequence?",c:["Yes","No"],a:1,why:"2n + 5 is always odd (even + odd), and 40 is even."},
  {q:"How do you check your nth term?",c:["Put in n = 1, 2, 3 and see if you get the sequence","Look at it","Add the terms"],a:0,why:"The rule must give every term."},
 ]});

/* ---------- Step 20: simple quadratic ---------- */
const sqRow=(k,c,m)=>[1,2,3,4,5].slice(0,m||4).map(n=>k*n*n+c);
STEPS.push({id:20,stage:3,title:"Simple quadratic sequences (n², n² + 3, 2n²)",short:"Quadratic",root:17,
 learn:[
  {t:"show",h:"Square numbers",b:`<p>1, 4, 9, 16, … are the <b>square numbers</b>. You can see why: they make squares of dots.</p>`,v:()=>patternRow({dots:true,quad:true,a:0,b:0},4),after:`<p>Position n gives <b>n²</b>: 1², 2², 3², 4².</p>`},
  {t:"show",h:"The jumps aren't the same",b:`<p>1, 4, 9, 16, 25: the jumps are +3, +5, +7, +9. They're not equal, so it's <b>not linear</b>.</p><p>But the jumps go up by <b>2</b> each time. That "second difference" is the sign of an n² sequence.</p>`,rule:"Jumps that grow by the same amount → n² is involved."},
  {t:"show",h:"n² + something",b:`<p>4, 7, 12, 19, … Compare with n²:</p><table class="tbl"><tr><th>n²</th><td>1</td><td>4</td><td>9</td><td>16</td></tr><tr><th>Term</th><td>4</td><td>7</td><td>12</td><td>19</td></tr></table><p>Every term is 3 more: <b>n² + 3</b>.</p>`,v:()=>patternRow({dots:true,quad:true,a:0,b:3},3)},
  {t:"show",h:"Double the squares",b:`<p>2, 8, 18, 32, … is exactly <b>double</b> the square numbers: <b>2n²</b>.</p><p>Its second difference is 4 (twice as big).</p>`,v:()=>patternRow({dots:true,quad:true,k:2,a:0,b:0},3)},
  {t:"try",h:"Your turn",b:`<p>0, 3, 8, 15, 24, …</p>`,q:{ask:"nth term =",a:{expr:"n^2-1"},why:"Compare with 1, 4, 9, 16, 25: every term is 1 less. n² − 1."}},
 ],
 gen:[()=>{ const k=pick([1,1,1,2]), c=ri(-5,6); const seq=sqRow(k,c,5); const d1=[seq[1]-seq[0],seq[2]-seq[1],seq[3]-seq[2]];
   return {q:`Find the nth term:<br><b>${seq.map(N).join(", ")}, …</b>`,steps:[{p:`First jumps: ${d1.map(N).join(", ")}. They go up by (second difference):`,a:{num:2*k},hint:`${d1[1]} − ${d1[0]}.`},{p:`Second difference ${2*k} means ${k===1?"n²":"2n²"}. When n = 1, ${k===1?"n²":"2n²"} =`,a:{num:k},hint:k===1?"1 × 1.":"2 × 1²."},{p:`The first term is ${N(seq[0])}. What do you add? (Negative if you take away.)`,a:{num:c},hint:`${k} + ? = ${N(seq[0])}.`}],final:{p:"nth term:",a:{expr:(k===1?"n^2":"2n^2")+(c<0?"-":"+")+Math.abs(c)}},why:`${k===1?"n²":"2n²"} ${c<0?MINUS:"+"} ${Math.abs(c)}`}; },
  ()=>{ const k=pick([1,2]),c=ri(-5,8),n=ri(5,12); return {q:`The nth term is <b>${k===1?"":k}n²${sgn(c)}</b>. Find the ${n}th term.`,steps:[{p:`${n}² =`,a:{num:n*n},hint:`${n} × ${n}.`},...(k>1?[{p:`× ${k}:`,a:{num:k*n*n},hint:`${k} × ${n*n}.`}]:[]),{p:`${c<0?MINUS:"+"} ${Math.abs(c)}:`,a:{num:k*n*n+c},hint:"Count on or back."}],final:{p:`${n}th term:`,a:{num:k*n*n+c}},why:`${k>1?k+" × ":""}${n}² ${c<0?MINUS:"+"} ${Math.abs(c)} = ${k*n*n+c}`}; }],
 checks:[
  {q:"1, 4, 9, 16: is this a linear sequence?",c:["Yes","No"],a:1,why:"The jumps (+3, +5, +7) aren't equal."},
  {q:"Which is the nth term of 2, 5, 10, 17?",c:["3n − 1","n² + 1","2n²"],a:1,why:"1, 4, 9, 16 plus 1 each time."},
  {q:"How can you tell a sequence involves n²?",c:["The jumps go up by the same amount each time","It has big numbers","It goes up"],a:0,why:"A constant second difference is the n² signal."},
  {q:"Is 2n² the same as (2n)²?",c:["Yes","No"],a:1,why:"n = 3: 2n² = 18, but (2n)² = 36. Only n is squared in 2n²."},
 ]});

/* ---------- Step 21: Criterion B practice ---------- */
STEPS.push({id:21,stage:3,kind:"invest",title:"Criterion B practice investigation",short:"Investigation",root:17,learn:[
  {t:"show",h:"What your teacher looks for",b:`<p>Criterion B is "Investigating patterns". Your teacher marks three things:</p><ol><li><b>Use a method to find the pattern</b>: draw, count, make a table.</li><li><b>Describe the pattern as a general rule</b>: in words and as an nth term.</li><li><b>Check the rule works</b> for other examples you haven't used yet.</li></ol><p>For higher marks, <b>explain why</b> the rule works using the picture.</p>`,rule:"Find it, describe it, test it, explain it."},
  {t:"show",h:"How this practice works",b:`<p>You'll get a new pattern. The lab walks you through it one small step at a time, like the real task.</p><p>At the end you'll see a write-up of your findings, in the kind of sentences your teacher wants.</p>`},
 ],gen:[],checks:[]});

/* ---------- Preview 4 ---------- */
PREVIEWS[4]={title:"Coming up: flowcharts",cards:[
  {t:"show",h:"Instructions for a robot",b:`<p>A robot can't guess. It needs every step, in order. That list of steps is an <b>algorithm</b>.</p><p>A <b>flowchart</b> draws an algorithm as boxes and arrows.</p>`,v:()=>vis(flowSVG([{t:"start",s:"Start"},{t:"io",s:"Input a number"},{t:"do",s:"Multiply by 2"},{t:"io",s:"Output the answer"},{t:"stop",s:"Stop"}]))},
  {t:"show",h:"Words you'll hear in class",b:`<div class="kw">
    <div><b>Algorithm</b>Exact steps to solve a problem.</div>
    <div><b>Input / output</b>What goes in, what comes out (slanted boxes).</div>
    <div><b>Process</b>A step that does something (rectangle).</div>
    <div><b>Decision</b>A yes/no question (diamond).</div>
    <div><b>Loop</b>An arrow going back to repeat steps.</div></div>`},
  {t:"try",h:"Have a go",b:`<p>Follow the flowchart above with the input 7.</p>`,q:{ask:"Output:",a:{num:14},why:"7 × 2 = 14. A flowchart with no decisions is just a function machine!"}},
]};

/* ---------- Step 22: flowcharts ---------- */
function progLinear(a,b,inp){ const nodes=[{t:"start",s:"Start"},{t:"io",s:"Input n"},{t:"do",s:`Multiply by ${a}`},{t:"do",s:`${b<0?"Subtract "+(-b):"Add "+b}`},{t:"io",s:"Output the answer"},{t:"stop",s:"Stop"}];
  return {nodes,input:inp,run(x){ const m=x*a, y=m+b; return [{node:0,note:"Start at the top."},{node:1,note:`The input is ${x}.`},{node:2,note:`${x} × ${a} = ${m}`},{node:3,note:`${m} ${b<0?MINUS:"+"} ${Math.abs(b)} = ${y}`},{node:4,note:`Output ${y}.`,out:y},{node:5,note:"Stop. It's the function machine ×"+a+" then "+(b<0?MINUS:"+")+Math.abs(b)+"."}]; }}; }
function progDecide(lim,sub,addv,inp){ const nodes=[{t:"start",s:"Start"},{t:"io",s:"Input n"},{t:"if",s:`Is n bigger than ${lim}?`,yes:`Subtract ${sub}`,yesTo:4},{t:"do",s:`Add ${addv}`},{t:"io",s:"Output n"},{t:"stop",s:"Stop"}];
  return {nodes,input:inp,run(x){ const big=x>lim, y=big?x-sub:x+addv; return [{node:0,note:"Start."},{node:1,note:`The input is ${x}.`},{node:2,note:`Is ${x} bigger than ${lim}? <b>${big?"Yes":"No"}</b>.`},big?{node:2.5,note:`Yes branch: ${x} − ${sub} = ${y}`}:{node:3,note:`No branch: ${x} + ${addv} = ${y}`},{node:4,note:`Output ${y}.`,out:y},{node:5,note:"Stop."}]; }}; }
function progLoop(s,d,lim){ const nodes=[{t:"start",s:"Start"},{t:"do",s:`n = ${s}`},{t:"io",s:"Output n"},{t:"do",s:`Add ${d} to n`},{t:"if",s:`Is n bigger than ${lim}?`,back:2},{t:"stop",s:"Stop"}];
  return {nodes,input:null,run(){ const tr=[{node:0,note:"Start."},{node:1,note:`n starts at ${s}.`}]; let n=s, guard=0;
    for(;;){ tr.push({node:2,note:`Output ${n}.`,out:n}); n+=d; tr.push({node:3,note:`n is now ${n}.`}); const stop=n>lim; tr.push({node:4,note:`Is ${n} bigger than ${lim}? <b>${stop?"Yes":"No"}</b>${stop?"":", so loop back up"}.`}); if(stop||++guard>20) break; }
    tr.push({node:5,note:"Stop. The outputs make a sequence!"}); return tr; }}; }
STEPS.push({id:22,stage:4,title:"Flowcharts and simple algorithms",short:"Flowcharts",root:9,
 learn:[
  {t:"show",h:"The shapes",b:`<p><b>Rounded box</b>: start or stop. <b>Slanted box</b>: input or output. <b>Rectangle</b>: do something. <b>Diamond</b>: a yes/no question.</p>`,v:()=>vis(flowSVG([{t:"start",s:"Start"},{t:"io",s:"Input n"},{t:"do",s:"Multiply by 3"},{t:"io",s:"Output n"},{t:"stop",s:"Stop"}]))},
  {t:"tool",h:"Follow it step by step",b:`<p>Press <b>Next step</b> and watch the highlighted box. It's the same as a function machine.</p>`,tool:()=>FlowTool(progLinear(3,-2,5))},
  {t:"show",h:"Decisions",b:`<p>A diamond asks a question. The answer decides which way you go.</p>`,v:()=>vis(flowSVG(progDecide(10,10,5).nodes))},
  {t:"tool",h:"Try different inputs",b:`<p>Try 4, then 15. Which branch does each take?</p>`,tool:()=>FlowTool(progDecide(10,10,5,4))},
  {t:"try",h:"Your turn",b:`<p>Use the decision flowchart above with input 12.</p>`,q:{ask:"Output:",a:{num:2},why:"12 is bigger than 10, so Yes: 12 − 10 = 2."}},
  {t:"show",h:"Loops",b:`<p>An arrow going back up makes a <b>loop</b>: the steps repeat until the question says stop.</p><p>This one makes a sequence: 3, 7, 11, 15, 19.</p>`,v:()=>vis(flowSVG(progLoop(3,4,20).nodes))},
  {t:"tool",h:"Run the loop",b:`<p>Step through and watch the outputs build up.</p>`,tool:()=>FlowTool(progLoop(3,4,20))},
  {t:"try",h:"Your turn",b:`<p>A loop starts at n = 5, outputs n, adds 6, and stops when n is bigger than 30.</p>`,q:{ask:"How many numbers does it output?",a:{num:5},why:"5, 11, 17, 23, 29. Then n becomes 35, which is bigger than 30, so it stops."}},
 ],
 gen:[()=>{ const a=ri(2,6),b=nz(-9,9),x=ri(1,12); const p=progLinear(a,b,x); return {q:`Follow the flowchart with input <b>${x}</b>.`,v:()=>vis(flowSVG(p.nodes)),steps:[{p:`After "Multiply by ${a}":`,a:{num:a*x},hint:`${x} × ${a}.`},{p:`After the next box:`,a:{num:a*x+b},hint:`${a*x} ${b<0?MINUS:"+"} ${Math.abs(b)}.`}],final:{p:"Output:",a:{num:a*x+b}},why:`${x} × ${a} ${b<0?MINUS:"+"} ${Math.abs(b)} = ${a*x+b}`}; },
  ()=>{ const lim=ri(8,15),sub=ri(2,9),addv=ri(2,9),x=pick([ri(1,lim-1),ri(lim+1,30)]); const p=progDecide(lim,sub,addv,x); const big=x>lim;
   return {q:`Follow the flowchart with input <b>${x}</b>.`,v:()=>vis(flowSVG(p.nodes)),steps:[{p:`Is ${x} bigger than ${lim}?`,a:{choice:["Yes","No"],ans:big?0:1},hint:`Compare ${x} and ${lim}.`},{p:`So the ${big?"Yes":"No"} branch gives:`,a:{num:big?x-sub:x+addv},hint:big?`${x} − ${sub}.`:`${x} + ${addv}.`}],final:{p:"Output:",a:{num:big?x-sub:x+addv}},why:`${big?"Yes":"No"} branch: ${big?x-sub:x+addv}`}; },
  ()=>{ const s=ri(1,9),d=ri(2,7),lim=s+d*ri(3,5)+ri(0,d-1); const outs=[]; for(let n=s;n<=lim;n+=d) outs.push(n); const p=progLoop(s,d,lim);
   return {q:`What is the <b>last</b> number this flowchart outputs?`,v:()=>vis(flowSVG(p.nodes)),steps:[{p:"First output:",a:{num:s},hint:`n starts at ${s} and is output straight away.`},{p:"Second output:",a:{num:s+d},hint:`Add ${d}.`},{p:`Keep adding ${d}. The last output before n gets bigger than ${lim}:`,a:{num:outs[outs.length-1]},hint:`List them: ${outs.slice(0,3).join(", ")}, … stop before passing ${lim}.`}],final:{p:"Last output:",a:{num:outs[outs.length-1]}},why:`Outputs: ${outs.join(", ")}.`}; }],
 checks:[
  {q:"Which shape asks a yes/no question?",c:["Rectangle","Diamond","Oval"],a:1,why:"Diamonds are decisions."},
  {q:"What makes a flowchart repeat steps?",c:["An arrow going back up (a loop)","A big rectangle","Two outputs"],a:0,why:"A loop sends you back to an earlier step."},
  {q:"A flowchart with no diamonds is just like…",c:["A function machine","A sequence","An equation"],a:0,why:"It does the same steps in order to every input."},
  {q:"Why must an algorithm's steps be exact?",c:["A computer or robot can't guess what you meant","To make it longer","They don't need to be"],a:0,why:"Every step must be clear and in the right order."},
 ]});

/* ---------- Step 23: exam ready ---------- */
STEPS.push({id:23,stage:5,kind:"exam",title:"Mixed review and practice exam",short:"Practice exam",learn:[
  {t:"show",h:"How the practice exam works",b:`<p>16 questions, one from each topic. No steps and no hints, like the real exam.</p><p>At the end you'll see which topics to go back to. Each topic's colour updates too.</p><p>Take your time. Write your working on paper.</p>`,rule:"Read each question twice. Check every answer."},
 ],gen:[],checks:[]});

const stepById=id=>STEPS.find(s=>s.id===id);
/* ================= Criterion B investigation ================= */
function Investigation(onDone,ID,record){
  ID=ID||21;
  const F=pick([
    {k:"sq",a:3,b:1,unit:"matchsticks",piece:"square",bWhy:"the one stick at the start, on the left",aWhy:"each new square adds 3 sticks: top, bottom and right"},
    {k:"tri",a:2,b:1,unit:"matchsticks",piece:"triangle",bWhy:"the one stick at the start",aWhy:"each new triangle adds 2 sticks"},
    {k:"sq2",a:5,b:2,unit:"matchsticks",piece:"column of two squares",bWhy:"the two sticks on the far left",aWhy:"each new column adds 5 sticks: 3 across and 2 down"},
    (()=>{ const a=ri(2,5), b=ri(1,4); return {k:{dots:true,a,b},a,b,unit:"dots",piece:"column",bWhy:`the ${b} grey dot${b>1?"s":""} that never change`,aWhy:`each new shape adds a column of ${a} dots`}; })(),
  ]);
  const a=F.a, b=F.b, f=n=>a*n+b;
  const wrap=h("div",{class:"stack"}), area=h("div");
  let k=0; const log=[];
  const drawN=n=>{ const p=F.k.dots?dotSVG(a,b,n):stickSVG(F.k,n,{colour:true}); return vis(SV(p.W,p.hh,p.s,"shape "+n)); };
  const mark=(tries,rev)=>{ const r=rev?"wrong":tries?"help":"own"; log.push(r); record(ID,r); };
  const screens=[
    {h:"1. Look and count",strand:"Use a method to find the pattern",body:()=>[h("p",{},`Here are the first three shapes, made of ${F.unit}.`),patternRow(F.k,3,{colour:!F.k.dots})],
     q:{a:{num:f(4)},p:`Picture shape 4 (or draw it on paper). How many ${F.unit} does it use?`},after:()=>h("div",{},h("p",{class:"small muted"},"Here's shape 4:"),drawN(4))},
    {h:"2. Make a table",strand:"Use a method to find the pattern",table:true},
    {h:"3. Describe the pattern",strand:"Describe the pattern as a rule",body:()=>[h("p",{},"Look at your table. Each shape uses more than the one before.")],q:{a:{num:a},p:`Each new shape adds how many ${F.unit}?`}},
    {h:"3b. Where does it come from?",strand:"Describe the pattern as a rule",body:()=>[patternRow(F.k,3,{colour:!F.k.dots})],q:{a:{choice:shuffle([`Because ${F.aWhy}`,`Because every shape doubles`,`Because each shape adds one more ${F.piece==="column"?"dot":"stick"}`]),ans:-1},p:"Why does it go up by that much each time? Use the picture."}},
    {h:"4. The general rule",strand:"Describe the pattern as a rule",body:()=>[h("p",{},`It goes up by ${a} each time, so compare with the ${a} times table (${a}n).`)],q:{a:{expr:`${a}n+${b}`},p:"Write the nth term: the number of "+F.unit+" in shape n."}},
    {h:"5. Test your rule",strand:"Check the rule works",body:()=>[h("p",{},"A rule must work for shapes you haven't looked at yet.")],q:{a:{num:f(7)},p:`Use your rule ${a}n + ${b} to predict shape 7.`},after:()=>h("div",{},h("p",{},`Now count shape 7: it has ${f(7)} ${F.unit}. Your rule works ✓`),drawN(7))},
    {h:"6. Explain why it works",strand:"Explain why (for higher marks)",body:()=>[patternRow(F.k,2,{colour:!F.k.dots})],q:{a:{choice:shuffle([`It's ${F.bWhy}`,`It's the number of shapes`,`It's the answer for shape 1`]),ans:-1},p:`In ${a}n + ${b}, what does the + ${b} mean in the picture?`}},
  ];
  // fix choice answers after shuffle
  screens[3].q.a.ans=screens[3].q.a.choice.indexOf(`Because ${F.aWhy}`);
  screens[6].q.a.ans=screens[6].q.a.choice.findIndex(c=>c.includes(F.bWhy));
  function show(){
    if(k>=screens.length) return writeUp();
    const sc=screens[k]; const card=h("div",{class:"card stack pop"});
    card.append(h("div",{class:"row",style:"justify-content:space-between"},h("div",{class:"eyebrow"},`Part ${k+1} of ${screens.length} · ${sc.strand}`),SayBtn(()=>sc.h+". "+(sc.q?sc.q.p:"Fill in the table"))),h("h2",{},sc.h));
    const next=h("button",{class:"btn primary hide",type:"button",onclick:()=>{k++;show();}},"Next ▸");
    if(sc.table){
      card.append(h("p",{},`Fill in the number of ${F.unit} for shapes 1 to 5. Count from the pictures for 1 to 4, then use the pattern for 5.`),patternRow(F.k,4,{colour:!F.k.dots}));
      const ins=[1,2,3,4,5].map(()=>h("input",{type:"text",inputmode:"numeric"}));
      const t=h("table",{class:"tbl"},h("tr",{},h("th",{},"Shape"),...[1,2,3,4,5].map(n=>h("td",{},n))),h("tr",{},h("th",{},F.unit),...ins.map(i=>h("td",{},i))));
      let tries=0; const fb=h("div");
      const btn=h("button",{class:"btn primary",type:"button",onclick:()=>{ let all=true; ins.forEach((inp,i)=>{ const ok=numVal(inp.value)===f(i+1); inp.classList.toggle("ok",ok); inp.classList.toggle("no",!ok); if(!ok) all=false; });
        if(all){ btn.disabled=true; ins.forEach(i=>i.disabled=true); fb.className="verdict good"; fb.textContent="Table complete."; mark(tries,false); next.classList.remove("hide"); }
        else { tries++; if(tries>=2){ ins.forEach((inp,i)=>{ inp.value=f(i+1); inp.classList.add("ok"); inp.disabled=true; }); btn.disabled=true; fb.className="verdict mid"; fb.textContent="Here are the counts. Check one against the pictures."; mark(tries,true); next.classList.remove("hide"); } else { fb.className="verdict bad"; fb.textContent="The red boxes aren't right yet. Count again carefully."; } } }},"Check table");
      card.append(h("div",{class:"scroll-x"},t),btn,fb);
    } else {
      if(sc.body) card.append(...sc.body());
      const afterBox=h("div");
      card.append(AnswerBox(sc.q.a,sc.q.p,(tries)=>{ mark(tries,false); if(sc.after) afterBox.append(sc.after()); next.classList.remove("hide"); },(tries,fb)=>{ fb.className="verdict bad"; fb.textContent= sc.q.a.expr? `Hint: compare with the ${a} times table. ${a}n for n = 1 is ${a}, but shape 1 has ${f(1)}.` : "Not quite. Look at the picture again."; },(fb)=>{ mark(2,true); fb.className="verdict mid"; fb.textContent="That's the answer. Read it, then carry on."; if(sc.after) afterBox.append(sc.after()); next.classList.remove("hide"); }),afterBox);
    }
    card.append(next); area.replaceChildren(card);
  }
  function writeUp(){
    const txt=`Finding the pattern: I counted the ${F.unit} in the first shapes and made a table: ${[1,2,3,4,5].map(f).join(", ")}.
The pattern: the number of ${F.unit} goes up by ${a} each time, because ${F.aWhy}.
General rule: the number of ${F.unit} in shape n is ${a}n + ${b}. The ${a}n comes from adding ${a} each time, like the ${a} times table. The + ${b} is ${F.bWhy}.
Testing the rule: my rule predicts shape 7 has ${a} × 7 + ${b} = ${f(7)} ${F.unit}. I counted shape 7 and it has ${f(7)}, so the rule works. Shape 100 would have ${f(100)}.`;
    const own=log.filter(r=>r==="own").length;
    area.replaceChildren(h("div",{class:"card stack"},h("h2",{},"Your write-up"),h("p",{class:"muted"},`${own} of ${log.length} parts right first time. This is the kind of write-up your teacher wants. Notice it uses words, a table, the rule, a test, and a reason.`),
      h("div",{class:"why",style:"white-space:pre-line"},txt),
      h("div",{class:"row"},h("button",{class:"btn",type:"button",onclick:e=>{ try{ navigator.clipboard.writeText(txt); e.currentTarget.textContent="Copied ✓"; }catch(err){} }},"Copy the write-up")),
      h("p",{style:"font-weight:800"},own>=5?"⭐⭐⭐ 5 or more parts right first time: level mastered!":`You need 5 parts right first time for 3 stars. You got ${own}. A new pattern is waiting.`),
      h("button",{class:"bigbtn go",type:"button",onclick:()=>onDone&&onDone({own})},"Continue ▸")));
  }
  wrap.append(h("p",{class:"muted"},"A new pattern each time. Do each part, then read the write-up at the end."),area);
  show();
  return wrap;
}

const EXAM_STEPS=[3,4,5,6,7,8,11,12,13,14,15,16,18,19,20,22];
const BADGES=[
  {k:"star1",e:"⭐",n:"First Star",d:"Earn your first star"},
  {k:"l3",e:"🥷",n:"Negative Ninja",d:"Master level 3"},
  {k:"l7",e:"💥",n:"Bracket Buster",d:"Master level 7"},
  {k:"w1",e:"🗿",n:"Letter Legend",d:"Beat the Letter Guardian"},
  {k:"l10",e:"⚖️",n:"Balance Master",d:"Master level 10"},
  {k:"l14",e:"🦸",n:"Equation Hero",d:"Master level 14"},
  {k:"w2",e:"🌉",n:"Bridge Builder",d:"Beat the Bridge Troll"},
  {k:"l17",e:"🔍",n:"Pattern Detective",d:"Master level 17"},
  {k:"l21",e:"🕵️",n:"Investigator",d:"Master the investigation"},
  {k:"w3",e:"🏔️",n:"Peak Climber",d:"Beat the Pattern Yeti"},
  {k:"l22",e:"🤖",n:"Robot Engineer",d:"Master level 22"},
  {k:"perfect",e:"🎯",n:"Perfect Challenge",d:"3 in a row on your own, no misses"},
  {k:"fire",e:"🔥",n:"On Fire",d:"Play 3 days in a row"},
  {k:"final",e:"🏆",n:"Algebra Champion",d:"Beat the Algebra Dragon"},
];
export { ASN, STAGES, STEPS, PREVIEWS, WORDS, eqHint, sqRow, progLinear, progDecide, progLoop, stepById, Investigation, EXAM_STEPS, BADGES };
