const path=require('path');
const {chromium,devices}=require('playwright');const {serve}=require('./mock');
(async()=>{ const srv=await serve(path.resolve(__dirname,'../../..'),8845); const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 for(const [tag,opts] of (process.argv[2]==='ipad'?[['ipad',{...devices['iPad (gen 7)']}]]:[['lap',{viewport:{width:1280,height:800}}],['ipad',{...devices['iPad (gen 7)']}]])){
 const p=await (await b.newContext(opts)).newPage(); const errs=[]; p.on('pageerror',e=>errs.push(e.message)); p.on('console',m=>{ if(m.type()==='error') errs.push(m.text()); });
 await p.goto('http://localhost:8845/games/fort-defence/?practice&lowgfx'); await p.waitForSelector('.logo');
 await p.evaluate(()=>{ const S=__fd.save.state; S.gold=700; S.badges={star1:1,w1:1,fire:1,l3:1}; __fd.save.commit(); });
 await p.locator('.btn.pulse').click(); await p.waitForSelector('.dawn .go-day');
 await p.waitForTimeout(1500); console.log(tag, 'dawn', JSON.stringify(errs), (await p.locator('.dawn').innerText()).replace(/\n/g,' | ')); await p.locator('button',{hasText:'Hero shop'}).click(); await p.waitForSelector('.shopitem'); await p.waitForTimeout(1200);
 await p.locator('.shopitem',{hasText:'Rune Wizard'}).locator('button').click(); await p.locator('.shopitem',{hasText:'Block Pup'}).locator('button').click(); await p.waitForTimeout(800);
 await p.screenshot({path:`st8-${tag}-shop.png`});
 console.log(tag,'gold', await p.evaluate(()=>__fd.save.state.gold), 'hero', await p.evaluate(()=>__fd.save.state.hero), 'pet', await p.evaluate(()=>__fd.save.state.pet), 'owned', await p.evaluate(()=>JSON.stringify(__fd.save.state.owned)), 'disabled dragon rider', await p.locator('.shopitem',{hasText:'Dragon Rider'}).locator('button').isDisabled(), 'sideways', await p.evaluate(()=>document.querySelector('.sbody').scrollWidth>document.querySelector('.sbody').clientWidth));
 await p.locator('.sheet button',{hasText:'Fort'}).first().click(); await p.waitForSelector('.dawn .go-day');
 await p.evaluate(()=>{ const r=__fd.stage.rig; __fd.stage.flyTo({yaw:0.8,pitch:0.45,dist:12,target:new __fd.THREE.Vector3(0,5,0)},0.1); }); await p.waitForTimeout(2500); await p.screenshot({path:`st8-${tag}-keep.png`});
 await p.reload(); await p.waitForSelector('.logo'); console.log(tag,'after reload hero', await p.evaluate(()=>__fd.save.state.hero+'/'+__fd.save.state.pet), 'errors', JSON.stringify(errs)); }
 await b.close(); srv.close(); })().catch(e=>{ console.log('FAIL',e.message.split('\n').slice(0,14).join(' ')); process.exit(1); });
