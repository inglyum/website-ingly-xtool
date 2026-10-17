/* Sprint 07 — immutable recovery manifest, no write operations.
 * Distinguishes files to stage from identical and obsolete live media.
 * Binary restoration must be committed together with JSON and reviewed separately. */
const SAFE=/^[a-zA-Z0-9][a-zA-Z0-9_.-]*\.(?:webp|png|jpe?g|gif|avif|svg)$/i;
const SHA=/^[0-9a-f]{40}$/i;
export function planHistoricMediaRecovery(historicManifest, historicEntries, liveEntries){
 const errors=[],restore=[],identical=[],preserve=[];
 const names=historicManifest?.file;
 if(!Array.isArray(names))errors.push('Manifest storico immagini.file mancante');
 const index=(entries,label)=>{
  const map=new Map();
  if(!Array.isArray(entries)){errors.push('Inventario '+label+' mancante');return map}
  for(const item of entries){
   if(!item||item.type!=='file')continue;
   if(typeof item.name!=='string'||!SAFE.test(item.name)||item.name.includes('..')||!SHA.test(item.sha||'')||map.has(item.name)){
    errors.push('Inventario '+label+' non valido');continue;
   }
   map.set(item.name,item.sha.toLowerCase());
  }
  return map;
 };
 const old=index(historicEntries,'storico'),now=index(liveEntries,'corrente');
 const seen=new Set();
 if(Array.isArray(names))for(const name of names){
  if(typeof name!=='string'||!SAFE.test(name)||name.includes('..')||seen.has(name)){
   errors.push('Nome o duplicato non valido nel manifest storico');continue;
  }
  seen.add(name);
  const sha=old.get(name);
  if(!sha){errors.push('Binario storico assente: '+name);continue}
  if(now.get(name)===sha)identical.push('img/'+name);
  else restore.push({path:'img/'+name,blobSha:sha,reason:now.has(name)?'changed':'deleted'});
 }
 for(const name of now.keys())if(!seen.has(name))preserve.push('img/'+name);
 return {ok:!errors.length,errors,restore,identical,preserve,
  requiresRestore:restore.length>0,requiresAtomicPublish:restore.length>0};
}
