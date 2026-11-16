// Shared Playwright helpers: local server + fake Supabase (fl_* RPC) so tests never touch real data.
const http=require('http'),fs=require('fs'),path=require('path');
function serve(root,port){
  const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.ico':'image/x-icon','.png':'image/png','.svg':'image/svg+xml','.txt':'text/plain','.css':'text/css'};
  const srv=http.createServer((req,res)=>{ let u=decodeURIComponent(req.url.split('?')[0]); let f=path.join(root,u); if(fs.existsSync(f)&&fs.statSync(f).isDirectory()) f=path.join(f,'index.html'); if(!fs.existsSync(f)&&fs.existsSync(f+'.html')) f+='.html';
    if(!fs.existsSync(f)){ res.writeHead(404); res.end('nf'); srv.log.push('404 '+u); return; } res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'}); fs.createReadStream(f).pipe(res); });
  srv.log=[]; return new Promise(r=>srv.listen(port,()=>r(srv)));
}
function fakeDb(){ const db={progress:{},players:[{slug:'oliver',nickname:'Oliver',avatar:'🦊',games:{}}]};
  return async route=>{ const fn=route.request().url().split('/rpc/')[1]; const b=JSON.parse(route.request().postData()||'{}'); let out={ok:false};
    if(fn==='fl_family') out={ok:true,players:db.players};
    if(fn==='fl_load'){ const r=db.progress[b.p_player+'/'+b.p_game]; out=r?{ok:true,state:r.state,updated:r.updated}:{ok:true,state:null,updated:0}; }
    if(fn==='fl_save'){ const k=b.p_player+'/'+b.p_game, r=db.progress[k]; if(r&&r.updated>b.p_updated) out={ok:false,error:'newer',state:r.state}; else { db.progress[k]={state:b.p_state,updated:b.p_updated}; out={ok:true}; } }
    await route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(out)}); }; }
module.exports={serve,fakeDb};
