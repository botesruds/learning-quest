/* Family cloud save: shared by every game on this site.
   The bookmark carries the family key and the player in the address (#k=...&p=...).
   Only a nickname and game progress are stored online. */
(function(){
  "use strict";
  const API="https://zrfyblzhdqojkfdwlaar.supabase.co/rest/v1/rpc/";
  const PUB="sb_publishable_klbKDRvKWMuHrHjW6Wz_ig_6kDQma-e";
  const LS="family.link.v1";

  function readHash(){ const o={}; (location.hash||"").replace(/^#/,"").split("&").forEach(kv=>{ const i=kv.indexOf("="); if(i>0) o[decodeURIComponent(kv.slice(0,i))]=decodeURIComponent(kv.slice(i+1)); }); return o; }
  function lsGet(){ try{ return JSON.parse(localStorage.getItem(LS)||"{}"); }catch(e){ return {}; } }
  function lsSet(o){ try{ localStorage.setItem(LS,JSON.stringify(o)); }catch(e){} }

  const hsh=readHash(), mem=lsGet();
  const key=hsh.k||mem.k||"";
  let player=("p" in hsh)?hsh.p:(hsh.k?"":(mem.p||""));
  if(key) lsSet({k:key,p:player});

  function hashFor(p){ let s="#k="+encodeURIComponent(key); if(p) s+="&p="+encodeURIComponent(p); return s; }
  // keep the key in the address bar, so a bookmark made from any page works
  if(key && location.hash!==hashFor(player)){ try{ history.replaceState(null,"",location.pathname+location.search+hashFor(player)); }catch(e){} }

  async function rpc(fn,body,keepalive){
    const r=await fetch(API+fn,{method:"POST",keepalive:!!keepalive,headers:{"Content-Type":"application/json","apikey":PUB,"Authorization":"Bearer "+PUB},body:JSON.stringify(body)});
    if(!r.ok) throw new Error("http "+r.status);
    return r.json();
  }

  window.Family={
    get ready(){ return !!(key&&player); },
    get hasKey(){ return !!key; },
    get player(){ return player; },
    nickname:"",
    setPlayer(p){ player=p||""; lsSet({k:key,p:player}); try{ history.replaceState(null,"",location.pathname+location.search+hashFor(player)); }catch(e){} },
    link(path,p){ return path+(key?hashFor(p===undefined?player:p):""); },
    async family(){ return key?rpc("fl_family",{p_key:key}):{ok:false}; },
    async load(game){ return rpc("fl_load",{p_key:key,p_player:player,p_game:game}); },
    async save(game,state,updated,keepalive){ return rpc("fl_save",{p_key:key,p_player:player,p_game:game,p_state:state,p_updated:Math.round(updated||0)},keepalive); },
    async addPlayer(nick,avatar){ return rpc("fl_add_player",{p_key:key,p_nickname:nick,p_avatar:avatar||"🦊"}); }
  };
})();
