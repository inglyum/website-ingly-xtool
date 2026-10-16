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
