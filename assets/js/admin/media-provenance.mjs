/* INGLY DESIGN — pure provenance audit. Never infer that a photograph
   shows an INGLY-made product based on the existence of an image file. */
const text=value=>String(value??'').trim();
function stateOf(item){
 if(item?.assetKind==='licensed-stock' && item?.isDemo===true){
  return item?.sourceUrl?.startsWith('https://')?'repertorio':'da-verificare';
 }
 if(item?.assetKind==='ingly-original' && item?.isDemo===false)return 'originale-dichiarato';
 return 'da-verificare';
}
export function summarizeMediaProvenance(categories=[],materials=[]){
 const list=[
  ...(Array.isArray(categories)?categories:[]).map(x=>({type:'Categoria',item:x})),
  ...(Array.isArray(materials)?materials:[]).map(x=>({type:'Materiale',item:x}))
 ].filter(x=>!!text(x.item?.img));
 const rows=list.map(({type,item})=>({
  id:text(item.id),type,name:text(item.n?.it||item.n?.en||item.id),
  path:text(item.img),sourceUrl:text(item.sourceUrl),
  state:stateOf(item)
 }));
 const totals={
  total:rows.length,
  repertorio:rows.filter(x=>x.state==='repertorio').length,
  originaleDichiarato:rows.filter(x=>x.state==='originale-dichiarato').length,
  daVerificare:rows.filter(x=>x.state==='da-verificare').length
 };
 return {rows,totals};
}

/** After an owner uploads a NEW photo, do not keep a Pexels author, license or
    photographic dimensions that describe the previous stock photograph.
    "ingly-original" means owner-declared, not independently authenticated. */
export function recordOwnerUpload(item,path,{type='Categoria'}={}){
 if(!item||typeof item!=='object')throw Error('Elemento non valido');
 if(typeof path!=='string'||!/^img\/[a-z0-9_./-]+\.(?:webp|png|jpg|jpeg|svg)$/i.test(path)||path.includes('..'))
  throw Error('Il file caricato deve essere un percorso immagini locale');
 item.img=path;
 item.assetKind='ingly-original';
 item.isDemo=false;
 item.replaceable=true;
 item.licenseStatus='Dichiarazione del titolare, diritti da verificare';
 for(const key of ['sourceUrl','photographer','previousCover','imageMeta'])delete item[key];
 const label=item.n?.it||item.n?.en||item.id||'';
 item.altIT=type==='Materiale'
  ?'Fotografia del materiale '+label+' caricata tramite INGLY'
  :'Fotografia per categoria '+label+' caricata tramite INGLY';
 item.altEN=type==='Materiale'
  ?'Material photo '+(item.n?.en||label)+' uploaded to INGLY'
  :'Category photo '+(item.n?.en||label)+' uploaded to INGLY';
 return item;
}
