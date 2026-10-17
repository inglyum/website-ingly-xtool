/* INGLY / safe historic image blob restoration.
 * Stage all verified binaries only after a complete successful fetch.
 * The Admin's existing Git tree transaction publishes those files with JSON. */
const SHA=/^[0-9a-f]{40}$/i;
const SAFE=/^img\/[a-zA-Z0-9][a-zA-Z0-9_.-]*\.(?:png|jpe?g|webp|gif|avif|svg)$/i;
const encode=new TextEncoder();
const hex=bytes=>[...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');
export async function verifyHistoricBlob(blob,expectedSha,{subtle=globalThis.crypto?.subtle,maxEachBytes=8*1024*1024}={}){
 if(!subtle||!SHA.test(String(expectedSha||'')))throw Error('Verifica crittografica indisponibile');
 if(!blob||String(blob.sha||'').toLowerCase()!==expectedSha.toLowerCase()||blob.encoding!=='base64')
  throw Error('Risposta GitHub blob non valida');
 if(!Number.isSafeInteger(blob.size)||blob.size<0||blob.size>maxEachBytes)
  throw Error('Dimensione immagine storica non ammessa');
 const b64=String(blob.content||'').replace(/\s/g,'');
 if(b64.length>Math.ceil(maxEachBytes*4/3)+16||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(b64))
  throw Error('Contenuto base64 non valido');
 let binary;
 try{binary=Uint8Array.from(atob(b64),c=>c.charCodeAt(0))}catch(_){throw Error('Decodifica immagine non valida')}
 if(binary.length!==blob.size)throw Error('Dimensione blob differente');
 // Git object SHA-1 is over "blob <bytes>\0" + the exact binary payload.
 const prefix=encode.encode('blob '+binary.length+'\0');
 const payload=new Uint8Array(prefix.length+binary.length);
 payload.set(prefix);payload.set(binary,prefix.length);
 const actual=hex(await subtle.digest('SHA-1',payload));
 if(actual!==expectedSha.toLowerCase())throw Error('Immagine storica non autentica (SHA)');
 return {b64,size:binary.length};
}
export async function stageHistoricMedia(plan,fetchBlob,{subtle=globalThis.crypto?.subtle,maxFiles=80,maxEachBytes=8*1024*1024,maxTotalBytes=40*1024*1024}={}){
 const entries=plan?.restore;
 if(!plan?.ok||!Array.isArray(entries)||!Array.isArray(plan?.preserve)||typeof fetchBlob!=='function')
  return {ok:false,errors:['Piano storico non valido'],media:[]};
 if(entries.length>maxFiles)return {ok:false,errors:['Troppe immagini da recuperare in una volta: '+entries.length],media:[]};
 const media=[],errors=[];
 let sum=0;
 for(const file of entries){
  if(!file||!SAFE.test(file.path||'')||!SHA.test(file.blobSha||'')){
   errors.push('Riferimento immagine storico non valido');break;
  }
  try{
   const raw=await fetchBlob(file.blobSha);
   const item=await verifyHistoricBlob(raw,file.blobSha,{subtle,maxEachBytes});
   sum+=item.size;
   if(sum>maxTotalBytes)throw Error('Budget memoria recupero superato');
   media.push({path:file.path,b64:item.b64,size:item.size});
  }catch(error){
   errors.push('Impossibile recuperare '+file.path+': '+String(error.message||error));break;
  }
 }
 return errors.length?{ok:false,errors,media:[]}:
 {ok:true,errors:[],media,totalBytes:sum,preserved:plan.preserve.length};
}
