import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync('index.html','utf8');
const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)]
  .map(x=>x[1]).find(x=>x.includes('CACHE_WANT='));
assert.ok(script,'Recovery must be inline in index.html, not delayed via JS cache');
/* Le cache di prova seguono la versione corrente: il test non va riscritto
   a ogni aumento di CACHE_WANT. */
const V=Number((script.match(/CACHE_WANT='ingly-v(\d+)'/)||[])[1]);
assert.ok(V>=15,'CACHE_WANT must declare a numeric version');
const OLD=V-1, FLAG='ingly_cachefix_v'+V;

async function run({names,registrations=[],alreadyRecovered=false}){
  const deleted=[],unregistered=[];
  let reloads=0;
  const states=new Map(alreadyRecovered?[[FLAG,'1']]:[]);
  const origin='https://inglyum.github.io';
  const scope=origin+'/website-ingly-xtool/';
  const context={
    window:{caches:{}},URL,Promise,
    document:{baseURI:scope},
    sessionStorage:{
      getItem(k){return states.get(k)||null},
      setItem(k,v){states.set(k,v)}
    },
    caches:{
      keys:async()=>names.slice(),
      delete:async k=>{deleted.push(k);return true}
    },
    navigator:{serviceWorker:{
      getRegistrations:async()=>registrations.map(s=>({
        scope:s,
        unregister:async()=>{unregistered.push(s);return true}
      }))
    }},
    location:{reload(){reloads++}}
  };
  vm.runInNewContext(script,context);
  await new Promise(resolve=>setTimeout(resolve,25));
  return {deleted,unregistered,reloads,states,scope};
}
const site='https://inglyum.github.io/website-ingly-xtool/';
const unrelated='https://inglyum.github.io/other-pwa/';
const result=await run({
 names:['unrelated-app-cache','ingly-v'+OLD+'-assets','ingly-v'+V+'-img','ingly-v'+OLD+'-data','ingly-v99-unknown'],
 registrations:[unrelated,site]
});
assert.deepEqual(result.deleted,['ingly-v'+OLD+'-assets','ingly-v'+OLD+'-data'],
  'Only previously owned INGLY caches must be invalidated');
assert.deepEqual(result.unregistered,[site],
  'Do not unregister other PWA service workers under the same origin');
assert.equal(result.reloads,1);
assert.equal(result.states.get(FLAG),'1');
const clean=await run({names:['unrelated-app-cache','ingly-v'+V+'-assets'],registrations:[site]});
assert.equal(clean.deleted.length,0);
assert.equal(clean.unregistered.length,0);
assert.equal(clean.reloads,0);
const skipped=await run({names:['ingly-v'+OLD+'-img'],registrations:[site],alreadyRecovered:true});
assert.equal(skipped.deleted.length,0,'Single retry per session');
console.log('✔ PWA cache recovery only touches INGLY-owned caches and this site scope.');
