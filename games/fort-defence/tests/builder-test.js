const {chromium,devices}=require('playwright');const {serve}=require('./mock');
const ARGS={args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']};
const log=(...a)=>console.log(...a);
(async()=>{ const srv=await serve(require('path').resolve(__dirname,'../../..'),8840); const b=await chromium.launch(ARGS);
 const Q=process.argv[2]||'?practice&lowgfx';
 let ctx=await b.newContext({viewport:{width:1280,height:800}}); let p=await ctx.newPage(); const errs=[]; p.on('pageerror',e=>errs.push('PAGEERR '+e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
 const wf=(fn,arg)=>p.waitForFunction(fn,arg,{timeout:30000}).then(()=>true).catch(()=>false);
 await p.goto('http://localhost:8840/games/fort-defence/'+Q); await p.waitForSelector('.logo',{timeout:30000}); await p.click('.btn.pulse'); await p.click('text=🔨 Build'); await p.waitForSelector('.tray .item'); await p.waitForFunction(()=>!__fd.stage.rig.goal,null,{timeout:60000}); await p.waitForTimeout(500);
 const target=async(gx,gz,dy=0)=>p.evaluate(([gx,gz,dy])=>{ const {stage,THREE}=window.__fd; const v=new THREE.Vector3(gx+0.5,1+dy,gz+0.5).project(stage.camera); const r=stage.renderer.domElement.getBoundingClientRect(); return {x:r.left+(v.x+1)/2*r.width,y:r.top+(1-v.y)/2*r.height}; },[gx,gz,dy]);
 const box=async sel=>{ const bb=await p.locator(sel).boundingBox(); return {x:bb.x+bb.width/2,y:bb.y+bb.height/2}; };
 const dragTo=async(from,to)=>{ await p.mouse.move(from.x,from.y); await p.mouse.down(); await p.mouse.move(from.x,from.y-30,{steps:4}); await p.mouse.move(to.x,to.y,{steps:10}); await p.waitForTimeout(300); await p.mouse.up(); };
 // 1. drag a wall from the tray
 await dragTo(await box('.item[data-piece="wall"]'),await target(-6,-6));
 log('1 drag wall placed:', await wf(()=>!!__fd.fort.at(-6,-6)));
 // 2. select wall, paint a line
 await p.click('.item[data-piece="wall"]'); await p.waitForSelector('.tray .done');
 const a=await target(-5,-6), c=await target(0,-6); await p.mouse.move(a.x,a.y); await p.mouse.down(); await p.mouse.move(c.x,c.y,{steps:25}); await p.mouse.up();
 log('2 paint walls -5..0:', await wf(()=>[-5,-4,-3,-2,-1,0].every(x=>__fd.fort.at(x,-6))));
 await p.click('.tray .done');
 // 3. upgrade by dropping a wall on a wall
 await dragTo(await box('.item[data-piece="wall"]'),await target(-6,-6));
 log('3 upgrade to lv2:', await wf(()=>__fd.fort.at(-6,-6).lv===2));
 // 4. arrow tower placement, keep refusal
 await dragTo(await box('.item[data-piece="arrow"]'),await target(-4,-3));
 log('4 arrow placed:', await wf(()=>!!__fd.fort.at(-4,-3)), 'plans left', await p.evaluate(()=>__fd.save.state.blueprints.arrow));
 await dragTo(await box('.item[data-piece="arrow"]'),await target(0,0));
 log('4b keep refused, toast:', await p.locator('.toast').last().textContent().catch(()=>'none'));
 // 5. tap tower -> popup -> upgrade
 const tt=await target(-4,-3,1.2); await p.mouse.click(tt.x,tt.y);
 log('5 popup:', await p.waitForSelector('.popup',{timeout:15000}).then(()=>p.locator('.popup b').textContent()).catch(()=>'NO POPUP'));
 await p.screenshot({path:'st3-popup.png'});
 await p.click('.popup .btn.gold').catch(()=>log('no upgrade button'));
 log('5b tower lv2:', await wf(()=>__fd.fort.at(-4,-3).lv===2));
 // 6. move a wall by dragging it
 const w0=await target(0,-6,0.8), w1=await target(2,-8); await p.mouse.move(w0.x,w0.y); await p.mouse.down(); await p.mouse.move(w1.x,w1.y,{steps:12}); await p.waitForTimeout(300); await p.mouse.up();
 log('6 moved wall:', await wf(()=>!__fd.fort.at(0,-6)&&!!__fd.fort.at(2,-8)), await p.evaluate(()=>JSON.stringify(__fd.save.state.forts[1].pieces)));
 // 7. drag a piece back to the tray to pick it up
 const wood0=await p.evaluate(()=>__fd.save.state.mats.wood); const pk=await target(2,-8,0.3); const tr=await box('.tray');
 await p.mouse.move(pk.x,pk.y); await p.mouse.down(); await p.mouse.move(pk.x,pk.y+40,{steps:5}); await p.waitForTimeout(300);
 log('7 tray shows pick-up:', await p.locator('.tray.pickup').count()); await p.mouse.move(tr.x,tr.y,{steps:10}); await p.waitForTimeout(300); await p.mouse.up();
 log('7b picked up + refund:', await wf(()=>!__fd.fort.at(2,-8)), wood0,'->',await p.evaluate(()=>__fd.save.state.mats.wood), await p.evaluate(()=>JSON.stringify(__fd.save.state.forts[1].pieces)), JSON.stringify(tr));
 // 8. decor tab: place a house, torch with gold
 await p.click('.tab:nth-child(2)'); await p.waitForSelector('.item[data-piece="house"]');
 const g0=await p.evaluate(()=>__fd.save.state.gold); await dragTo(await box('.item[data-piece="house"]'),await target(-8,-2));
 log('8 house placed:', await wf(()=>!!__fd.fort.at(-8,-2)), 'gold', g0, '->', await p.evaluate(()=>__fd.save.state.gold));
 // 9. outside claimed land refused
 await dragTo(await box('.item[data-piece="house"]'),await target(-12,-12));
 log('9 outside land refused:', await p.evaluate(()=>!__fd.fort.at(-12,-12)), await p.locator('.toast').last().textContent().catch(()=>''));
 // 10. orbit and zoom
 const y0=await p.evaluate(()=>__fd.stage.rig.yaw); await p.mouse.move(640,250); await p.mouse.down(); await p.mouse.move(800,250,{steps:6}); await p.mouse.up(); await p.mouse.wheel(0,300);
 log('10 orbit changed yaw:', await wf(y=>Math.abs(__fd.stage.rig.yaw-y)>0.3,y0));
 await p.screenshot({path:'st3-laptop.png'});
 // 11. reload restores exactly
 const saved=await p.evaluate(()=>JSON.stringify(__fd.save.state.forts[1].pieces)); await p.reload(); await p.waitForSelector('.logo',{timeout:30000}); await p.waitForTimeout(500);
 log('11 reload identical:', saved===await p.evaluate(()=>JSON.stringify(__fd.save.state.forts[1].pieces)), 'pieces', await p.evaluate(()=>__fd.fort.count()));
 log('laptop errors:', JSON.stringify(errs)); await ctx.close();
 // ---------- iPad touch ----------
 ctx=await b.newContext({...devices['iPad (gen 7) landscape'],deviceScaleFactor:1}); p=await ctx.newPage(); p.on('pageerror',e=>log('PAGEERR ipad '+e.message));
 await p.goto('http://localhost:8840/games/fort-defence/'+Q); await p.waitForSelector('.logo',{timeout:30000}); await p.locator('.btn.pulse').tap(); await p.locator('text=🔨 Build').tap(); await p.waitForSelector('.tray .item'); await p.waitForFunction(()=>!__fd.stage.rig.goal,null,{timeout:60000}); await p.waitForTimeout(500);
 await p.locator('.item[data-piece="cannon"]').tap(); await p.waitForSelector('.tray .done');
 for (const [gx,gz] of [[-6,-6],[4,-6]]) { const q=await target(gx,gz); await p.touchscreen.tap(q.x,q.y); await p.waitForTimeout(400); }
 log('12 ipad tap-to-build cannons:', await wf(()=>__fd.fort.count()===2));
 await p.locator('.tray .done').tap(); await p.waitForTimeout(300);
 const cdp=await ctx.newCDPSession(p); const g0b=await box('.item[data-piece="gate"]'); const q=await target(-3,-4);
 const T=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts});
 await T('touchStart',[{x:g0b.x,y:g0b.y,id:1}]); for(let i=1;i<=14;i++){ await T('touchMove',[{x:g0b.x+(q.x-g0b.x)*i/14,y:g0b.y+(q.y-g0b.y)*i/14,id:1}]); await p.waitForTimeout(20);} await T('touchEnd',[]);
 log('13 ipad touch-drag gate:', await wf(()=>!!__fd.fort.at(-3,-4)));
 const d0=await p.evaluate(()=>__fd.stage.rig.dist);
 await T('touchStart',[{x:450,y:250,id:1},{x:650,y:250,id:2}]); for(let i=1;i<=8;i++) await T('touchMove',[{x:450-i*15,y:250,id:1},{x:650+i*15,y:250,id:2}]); await T('touchEnd',[]);
 log('14 pinch zoom in:', d0.toFixed(1),'->',(await p.evaluate(()=>__fd.stage.rig.dist)).toFixed(1));
 await p.screenshot({path:'st3-ipad.png'}); await ctx.close();
 log('404s', JSON.stringify(srv.log)); await b.close(); srv.close(); })().catch(e=>{ console.log('FAILED',e.message.split('\n').slice(0,5).join('\n')); process.exit(1); });
