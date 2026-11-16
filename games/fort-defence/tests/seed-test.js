// Copying Algebra Quest progress into a brand-new Fort Defence save (stand-in database, read-only on the old game).
const {chromium}=require('playwright');const {serve}=require('./mock');const path=require('path');
const ARGS={args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']};
(async()=>{ const srv=await serve(path.resolve(__dirname,'../../..'),8851); const b=await chromium.launch(ARGS);
  const old={v:2,coins:137,lv:{'1':{stars:3,train:true},'2':{stars:2}},learnDone:{'1':true,'2':true},bosses:{},badges:{},hist:{},repair:{},exams:{}};
  const saves=[]; let ok=true; const check=(n,c,x='')=>{ console.log((c?'PASS ':'FAIL ')+n,x); if(!c) ok=false; };
  const c=await b.newContext({viewport:{width:1280,height:800}});
  await c.route('**/rest/v1/rpc/**',async route=>{ const fn=route.request().url().split('/rpc/')[1]; const body=JSON.parse(route.request().postData()||'{}'); let out={ok:false};
    if(fn==='fl_family') out={ok:true,players:[{slug:'oliver',nickname:'Oliver',avatar:'🦊',games:{}}]};
    if(fn==='fl_load') out=body.p_game==='algebra-quest'?{ok:true,state:old,updated:5}:{ok:true,state:null,updated:0};
    if(fn==='fl_save'){ saves.push(body.p_game); out={ok:true}; }
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(out)}); });
  const p=await c.newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:8851/games/fort-defence/?lowgfx#k=test-key&p=oliver'); await p.waitForSelector('.logo'); await p.waitForTimeout(1500);
  const S=await p.evaluate(()=>{ const s=__fd.save.state; return {lv:s.lv,gold:s.gold,seeded:s.seededFrom,cur:__fd.prog.currentNode().id||null}; });
  check('stars copied', S.lv['1']&&S.lv['1'].stars===3&&S.lv['2'].stars===2, JSON.stringify(S.lv));
  check('coins become gold (plus the 50 starter gold)', S.gold===137+50, S.gold);
  check('marked as copied', S.seeded==='algebra-quest');
  for(let i=0;i<20&&!saves.length;i++) await p.waitForTimeout(500);
  check('never wrote to Algebra Quest', saves.length>0&&!saves.includes('algebra-quest'), saves.join(','));
  console.log('ERRORS', errs.length?errs.join('\n'):'none'); console.log(ok&&!errs.length?'ALL PASS':'SOME FAILED'); await b.close(); srv.close(); })().catch(e=>{ console.log('FAIL',e.message.split('\n')[0]); process.exit(1); });
