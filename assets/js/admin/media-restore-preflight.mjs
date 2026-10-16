/* INGLY Sprint 07 — read-only media restore preflight.
 * This does NOT restore binary blobs: callers must stage and verify those separately.
 * Manifest values are basenames inside img/, never arbitrary repository paths. */
const VALID_NAME=/^[a-zA-Z0-9][a-zA-Z0-9_.-]*\.(?:webp|png|jpe?g|gif|avif|svg)$/i;
export function auditRestoreMedia(historic,current,historicTree,currentTree){
 const errors=[],missing=[],available=[],unchanged=[];
 const entries=(manifest,label)=>{
  if(!manifest||!Array.isArray(manifest.file)){
   errors.push(label+': immagini.file non è un array');return [];
  }
  const seen=new Set(),out=[];
  for(const value of manifest.file){
   if(typeof value!=='string'||!VALID_NAME.test(value)||value.includes('..')){
    errors.push(label+': nome immagine non sicuro');continue;
   }
   if(seen.has(value)){errors.push(label+': immagine duplicata '+value);continue}
   seen.add(value);out.push(value);
  }
  return out;
 };
 const source=entries(historic,'storico');
 const live=entries(current,'corrente');
 const treeSet=(tree,label)=>{
  if(!Array.isArray(tree)){errors.push(label+': inventario Git mancante');return new Set()}
  return new Set(tree.filter(p=>typeof p==='string'&&p.startsWith('img/')));
 };
 const past=treeSet(historicTree,'storico');
 const now=treeSet(currentTree,'corrente');
 const liveSet=new Set(live);
 for(const name of source){
  const path='img/'+name;
  if(now.has(path))unchanged.push(path);
  else if(past.has(path))available.push(path);
  else missing.push(path);
 }
 const extraLive=live.filter(name=>!source.includes(name)).map(name=>'img/'+name);
 // A clean preflight is necessary, not sufficient: Git blobs and file bytes must
 // still be restored/verified atomically before publishing historic references.
 return {ok:!errors.length&&!missing.length&&!available.length,
  requiresBinaryRestore:available.length>0,
  errors,missing,available,unchanged,extraLive,
  historicalCount:source.length,liveCount:liveSet.size};
}

/* GitHub contents directory entries carry blob SHA; compare bytes by identity,
 * not only filenames. Fail closed for incomplete inventory or changed images. */
export function auditRestoreMediaBlobs(historic,current,historicEntries,currentEntries){
 const names=manifest=>{
  if(!manifest||!Array.isArray(manifest.file))return null;
  const set=new Set();
  for(const n of manifest.file){
   if(typeof n!=='string'||!VALID_NAME.test(n)||n.includes('..')||set.has(n))return null;
   set.add(n);
  }
  return set;
 };
 const historicNames=names(historic),currentNames=names(current);
 const errors=[],mismatched=[];
 if(!historicNames||!currentNames)errors.push('Manifest immagini incompleto o non sicuro');
 const index=(entries,label)=>{
  const map=new Map();
  if(!Array.isArray(entries)){errors.push('Inventario '+label+' non disponibile');return map}
  for(const e of entries){
   if(!e||e.type!=='file'||typeof e.name!=='string')continue;
   if(map.has(e.name)){errors.push('Duplicato in inventario '+label);continue}
   if(!/^[0-9a-f]{40}$/i.test(e.sha||'')){errors.push('SHA non valido in '+label);continue}
   map.set(e.name,e.sha.toLowerCase());
  }
  return map;
 };
 const past=index(historicEntries,'storico'),live=index(currentEntries,'corrente');
 if(historicNames)for(const name of historicNames){
  if(!past.has(name))errors.push('File storico non trovato: '+name);
  else if(!live.has(name))mismatched.push(name+' (assente nel live)');
  else if(past.get(name)!==live.get(name))mismatched.push(name+' (contenuto diverso)');
 }
 return {ok:errors.length===0&&mismatched.length===0,errors,mismatched,
  checked:historicNames?historicNames.size:0};
}
