/* Family cloud save: shared by every game on this site.
   Each device is paired once (a 6-digit code from a grown-up's device). After that the device keeps
   its own pass, and the address only ever shows the player (#p=...), never a family key.
   Old bookmarks (#k=...) still work: the first visit pairs the device and wipes the key from the address.
   If pairing isn't available yet, the old key mode carries on exactly as before.
   Only a nickname and game progress are stored online. */
(function(){
  "use strict";
  const API="https://zrfyblzhdqojkfdwlaar.supabase.co/rest/v1/rpc/";
  const PUB="sb_publishable_klbKDRvKWMuHrHjW6Wz_ig_6kDQma-e";
  const LS="family.link.v1", LSD="family.device.v1";

  function readHash(){ const o={}; (location.hash||"").replace(/^#/,"").split("&").forEach(kv=>{ const i=kv.indexOf("="); if(i>0) o[decodeURIComponent(kv.slice(0,i))]=decodeURIComponent(kv.slice(i+1)); }); return o; }
  function get(k){ try{ return JSON.parse(localStorage.getItem(k)||"{}"); }catch(e){ return {}; } }
  function put(k,o){ try{ if(o) localStorage.setItem(k,JSON.stringify(o)); else localStorage.removeItem(k); }catch(e){} }

  const hsh=readHash(), old=get(LS), devMem=get(LSD);
  let dev=devMem.d||"";
  let key=dev?"":(hsh.k||old.k||"");
  let player=("p" in hsh)?hsh.p:(hsh.k?"":((dev?devMem.p:old.p)||""));

  function hashFor(p){ let s=""; if(key) s="k="+encodeURIComponent(key); if(p) s+=(s?"&":"")+"p="+encodeURIComponent(p); return s?"#"+s:""; }
  function remember(){ if(dev){ put(LSD,{d:dev,p:player}); put(LS,null); } else if(key) put(LS,{k:key,p:player}); }
  function fixAddress(){ const want=hashFor(player); if(location.hash!==want){ try{ history.replaceState(null,"",location.pathname+location.search+want); }catch(e){} } }
  remember(); fixAddress();

  async function rpc(fn,body,keepalive){
    const r=await fetch(API+fn,{method:"POST",keepalive:!!keepalive,headers:{"Content-Type":"application/json","apikey":PUB,"Authorization":"Bearer "+PUB},body:JSON.stringify(body)});
    if(!r.ok) throw new Error("http "+r.status);
    return r.json();
  }

  function deviceName(){
    const u=navigator.userAgent||""; let n="Computer";
    if(/iPad/.test(u)||(/Macintosh/.test(u)&&navigator.maxTouchPoints>1)) n="iPad"; else if(/iPhone/.test(u)) n="iPhone";
    else if(/Android/.test(u)) n=/Mobile/.test(u)?"Android phone":"Android tablet"; else if(/Mac/.test(u)) n="Mac";
    else if(/Windows/.test(u)) n="Windows PC"; else if(/CrOS/.test(u)) n="Chromebook";
    return n+" · "+new Date().toLocaleDateString(undefined,{day:"numeric",month:"short",year:"numeric"});
  }
  function adopt(d){ dev=d; key=""; remember(); fixAddress(); }

  // An old key bookmark: pair this device once, then forget the key. If pairing isn't set up yet, keep the key.
  let upgrading=null;
  function upgrade(){
    if(dev||!key) return Promise.resolve();
    if(!upgrading) upgrading=(async()=>{
      try{
        const s=await rpc("fl_pair_start",{p_key:key}); if(!s||!s.ok) return;
        const f=await rpc("fl_pair_finish",{p_code:s.code,p_label:deviceName()}); if(f&&f.ok&&f.device) adopt(f.device);
      }catch(e){}
    })();
    return upgrading;
  }
  upgrade();

  async function call(devFn,keyFn,args,keepalive){
    if(!keepalive) await upgrade();
    if(dev){
      const r=await rpc(devFn,Object.assign({p_dev:dev},args),keepalive);
      if(r&&r.error==="device"){ dev=""; put(LSD,null); fixAddress(); }   // removed from the grown-ups' list
      return r;
    }
    if(key&&keyFn) return rpc(keyFn,Object.assign({p_key:key},args),keepalive);
    return {ok:false,error:"device"};
  }

  window.Family={
    get ready(){ return !!((dev||key)&&player); },
    get hasKey(){ return !!(dev||key); },          // "this device is connected to the family"
    get paired(){ return !!dev; },
    get player(){ return player; },
    nickname:"",
    deviceName,
    setPlayer(p){ player=p||""; remember(); fixAddress(); },
    link(path,p){ const q=p===undefined?player:p; return path+(key?hashFor(q):(q?"#p="+encodeURIComponent(q):"")); },
    async family(){ return call("fl_dev_family","fl_family",{}); },
    async load(game){ return call("fl_dev_load","fl_load",{p_player:player,p_game:game}); },
    async save(game,state,updated,keepalive){ return call("fl_dev_save","fl_save",{p_player:player,p_game:game,p_state:state,p_updated:Math.round(updated||0)},keepalive); },
    async addPlayer(nick,avatar){ return call("fl_dev_add_player","fl_add_player",{p_nickname:nick,p_avatar:avatar||"🦊"}); },
    // pairing
    async pairCode(){ return call("fl_dev_pair_start","fl_pair_start",{}); },
    // a grown-up can connect a device by typing the family key once (it is not kept on the device)
    async pairWithKey(k){ k=String(k||"").trim().replace(/^.*#k=/,"").replace(/&.*$/,""); try{ k=decodeURIComponent(k); }catch(e){}
      const s=await rpc("fl_pair_start",{p_key:k}); if(!s||!s.ok) return s||{ok:false};
      return this.pair(s.code); },
    async pair(code){ const r=await rpc("fl_pair_finish",{p_code:String(code||""),p_label:deviceName()}); if(r&&r.ok&&r.device){ adopt(r.device); } return r; },
    async devices(){ return call("fl_dev_devices",null,{}); },
    async removeDevice(id){ return call("fl_dev_device_remove",null,{p_device:id}); },
    get thisDevice(){ return dev?dev.split(".")[0]:""; },
    async forget(){ if(dev){ try{ await rpc("fl_dev_forget",{p_dev:dev}); }catch(e){} } dev=""; key=""; put(LSD,null); put(LS,null); player=""; fixAddress(); }
  };
})();
