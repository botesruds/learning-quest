// Device pairing play-test: two devices against a stand-in database (never the real one).
const {chromium,devices}=require('playwright');const {serve}=require('../games/fort-defence/tests/mock');
const log=(...a)=>console.log(...a); const crypto=require('crypto');
function pairDb(withPairing=true){
  const KEY='fam-secret-key-123';
  const db={players:[{slug:'oliver',nickname:'Oliver',avatar:'🦊',games:{}}],progress:{},devices:[],codes:[],calls:[]};
  const devOk=d=>{ if(!d) return null; const [id,ps]=d.split('.'); const x=db.devices.find(v=>v.id===id&&v.pass===ps); if(x) x.seen=new Date().toISOString(); return x; };
  db.handler=async route=>{ const fn=route.request().url().split('/rpc/')[1]; const b=JSON.parse(route.request().postData()||'{}'); db.calls.push(fn); let out={ok:false};
    const keyOk=b.p_key===KEY;
    if(!withPairing&&(fn.startsWith('fl_dev_')||fn.startsWith('fl_pair'))) return route.fulfill({status:404,body:'{}'});
    const makeCode=()=>{ const c=String(Math.floor(Math.random()*1e6)).padStart(6,'0'); db.codes.push({c,used:false}); return {ok:true,code:c,expires_in:600}; };
    if(fn==='fl_family') out=keyOk?{ok:true,players:db.players}:{ok:false};
    if(fn==='fl_load'||fn==='fl_dev_load'){ if(fn==='fl_load'?keyOk:devOk(b.p_dev)){ const r=db.progress[b.p_player+'/'+b.p_game]; out=r?{ok:true,state:r.state,updated:r.updated}:{ok:true,state:null,updated:0}; } else out={ok:false,error:fn==='fl_load'?'key':'device'}; }
    if(fn==='fl_save'||fn==='fl_dev_save'){ if(fn==='fl_save'?keyOk:devOk(b.p_dev)){ db.progress[b.p_player+'/'+b.p_game]={state:b.p_state,updated:b.p_updated}; out={ok:true}; } else out={ok:false,error:'device'}; }
    if(fn==='fl_pair_start') out=keyOk?makeCode():{ok:false,error:'key'};
    if(fn==='fl_dev_pair_start') out=devOk(b.p_dev)?makeCode():{ok:false,error:'device'};
    if(fn==='fl_pair_finish'){ const c=db.codes.find(x=>x.c===b.p_code&&!x.used); if(!c) out={ok:false,error:'code'}; else { c.used=true; const id=crypto.randomUUID(), pass=crypto.randomBytes(32).toString('hex'); db.devices.push({id,pass,label:b.p_label,created:new Date().toISOString(),seen:new Date().toISOString()}); out={ok:true,device:id+'.'+pass}; } }
    if(fn==='fl_dev_family') out=devOk(b.p_dev)?{ok:true,players:db.players}:{ok:false,error:'device'};
    if(fn==='fl_dev_devices') out=devOk(b.p_dev)?{ok:true,devices:db.devices.map(({id,label,created,seen})=>({id,label,created,seen}))}:{ok:false,error:'device'};
    if(fn==='fl_dev_device_remove'){ if(devOk(b.p_dev)){ db.devices=db.devices.filter(d=>d.id!==b.p_device); out={ok:true}; } else out={ok:false,error:'device'}; }
    if(fn==='fl_dev_forget'){ const d=devOk(b.p_dev); if(d){ db.devices=db.devices.filter(x=>x!==d); out={ok:true}; } }
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(out)}); };
  db.KEY=KEY; return db;
}
(async()=>{ const srv=await serve(require('path').resolve(__dirname,'..'),8846); const b=await chromium.launch(); const errs=[]; const URL='http://localhost:8846/';
  const ctx=async(db,opt)=>{ const c=await b.newContext(opt||{viewport:{width:1100,height:850}}); await c.route('**/rest/v1/rpc/**',db.handler); const p=await c.newPage(); p.on('pageerror',e=>errs.push(e.message)); return p; };
  const db=pairDb(); let ok=true; const check=(name,cond,extra='')=>{ log((cond?'PASS ':'FAIL ')+name,extra); if(!cond) ok=false; };
  const leaks=async p=>p.evaluate(K=>[location.href,document.body.innerText,JSON.stringify(localStorage)].some(s=>s.includes(K)),db.KEY);
  // 1. Laptop opens the old bookmark: pairs itself and forgets the key
  const A=await ctx(db); await A.goto(URL+'#k='+db.KEY+'&p=oliver'); await A.waitForSelector('text=Hi Oliver!'); await A.waitForTimeout(300);
  check('1 old bookmark pairs the laptop', db.devices.length===1, db.devices[0]&&db.devices[0].label);
  check('1 address shows only the player', (await A.evaluate(()=>location.hash))==='#p=oliver', await A.evaluate(()=>location.hash));
  check('1 key gone from address, page and storage', !(await leaks(A)));
  // 2. Saves go through the device
  await A.goto(URL+'games/fort-defence/?lowgfx#p=oliver'); await A.waitForSelector('.logo');
  const r=await A.evaluate(async()=>{ const x=await Family.save('fort-defence',{hello:1},Date.now()); const y=await Family.load('fort-defence'); return {ready:Family.ready,paired:Family.paired,x,y}; });
  check('2 game saves and loads as this device', r.ready&&r.paired&&r.x.ok&&r.y.state&&r.y.state.hello===1, JSON.stringify(r).slice(0,120));
  check('2 used only device calls after pairing', !db.calls.slice(3).some(f=>['fl_save','fl_load','fl_family'].includes(f)), db.calls.join(','));
  // 3. Grown-ups: device list and a code
  await A.goto(URL); await A.waitForSelector('text=Hi Oliver!'); await A.click('summary'); await A.waitForSelector('.dev');
  check('3 device list shows this device', (await A.locator('.dev').count())===1 && (await A.locator('.dev .tag').count())===1);
  check('3 no bookmark links with keys', (await A.locator('code').count())===0);
  await A.click('text=Add a device'); await A.waitForSelector('.pair .code'); const code=(await A.locator('.pair .code').textContent()).replace(/\D/g,'');
  await A.locator('details').scrollIntoViewIfNeeded(); await A.screenshot({path:require('path').join(require('os').tmpdir(),'pair-grownups.png'),fullPage:true});
  check('3 code shown', /^\d{6}$/.test(code), code);
  // 4. iPad: connect screen, a wrong code, then the right one
  const B=await ctx(db,{...devices['iPad (gen 7)']}); await B.goto(URL); await B.waitForSelector('.codein'); await B.screenshot({path:require('path').join(require('os').tmpdir(),'pair-ipad-connect.png')});
  await B.fill('.codein','000 001'); await B.click('button:has-text("Connect")'); await B.waitForSelector("text=That code didn't work");
  check('4 wrong code refused', db.devices.length===1);
  await B.fill('.codein',code.slice(0,3)+' '+code.slice(3)); await B.click('button:has-text("Connect")'); await B.waitForSelector("text=Who's playing?");
  await B.click('.who button'); await B.waitForSelector('text=Hi Oliver!');
  check('4 iPad paired and picked Oliver', db.devices.length===2 && db.devices[1].label.startsWith('iPad'), db.devices[1]&&db.devices[1].label);
  await B.goto(URL); await B.waitForSelector('text=Hi Oliver!'); check('4 iPad remembers after reload', true);
  check('4 used code is spent', (await B.evaluate(async c=>(await fetch('https://zrfyblzhdqojkfdwlaar.supabase.co/rest/v1/rpc/fl_pair_finish',{method:'POST',body:JSON.stringify({p_code:c})})).json(),code)).ok===false);
  // 5. Laptop removes the iPad; the iPad is asked for a new code
  await A.click('text=Refresh'); await A.waitForFunction(()=>document.querySelectorAll('.dev').length===2);
  await A.locator('.dev',{hasText:'iPad'}).locator('text=Remove').click(); await A.locator('.dev',{hasText:'iPad'}).locator('button.btn',{hasText:'Remove'}).click();
  await A.waitForFunction(()=>document.querySelectorAll('.dev').length===1);
  check('5 iPad removed', db.devices.length===1);
  await B.reload(); await B.waitForSelector('.codein'); check('5 iPad asks for a new code', (await B.locator('text=removed from the family list').count())===1);
  await B.screenshot({path:require('path').join(require('os').tmpdir(),'pair-ipad-removed.png')});
  // 6. Before the database change: old bookmarks keep working exactly as now
  const db2=pairDb(false); const C=await ctx(db2); await C.goto(URL+'#k='+db2.KEY+'&p=oliver'); await C.waitForSelector('text=Hi Oliver!'); await C.click('summary');
  check('6 without pairing, key mode carries on', (await C.evaluate(()=>location.hash)).includes('k=') && (await C.locator('code').count())===1 && !(await C.evaluate(()=>Family.paired)));
  const r6=await C.evaluate(async()=>{ const x=await Family.save('fort-defence',{a:1},Date.now()); return x.ok; }); check('6 key-mode save works', r6);
  // 7. Phone width: connect screen fits
  const D=await ctx(db,{viewport:{width:375,height:740}}); await D.goto(URL); await D.waitForSelector('.codein');
  check('7 phone: no sideways scroll', await D.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)); await D.screenshot({path:require('path').join(require('os').tmpdir(),'pair-phone.png')});
  log('ERRORS', errs.length?errs.join('\n'):'none'); log(ok&&!errs.length?'ALL PASS':'SOME FAILED'); await b.close(); srv.close(); })().catch(e=>{ console.log('FAIL',e.message.split('\n').slice(0,6).join(' ')); process.exit(1); });
