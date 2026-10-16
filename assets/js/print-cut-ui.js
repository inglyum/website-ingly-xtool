/* INGLY Print & Cut UI — all source pixels stay on the user's device. */
import {alphaMask,padMask,dilate,traceOutlines,cutSvg} from './print-cut-kernel.js';

const $=id=>document.getElementById(id);
const translations={
 it:{
  back:'← Tutti i generatori',title:'Il tuo disegno.<br>Il tuo <span>contorno.</span>',
  intro:'Carica una PNG o WebP con trasparenza. Il motore rileva la sagoma dal canale alpha, aggiunge un margine dimensionato ed esporta un SVG per il percorso di taglio, senza inviare il file a server esterni.',
  settings:'Parametri di lavorazione',file:'1. Immagine con sfondo trasparente',
  fileNote:'Elaborazione locale · PNG consigliato · massimo 15 MB.',
  width:"2. Larghezza dell'immagine (mm)",margin:'Margine esterno (mm)',kerf:'Kerf stimato (mm)',
  threshold:'Soglia alpha',thresholdNote:'Più alta = esclude i pixel quasi trasparenti.',
  cutDownload:'Scarica contorno SVG',printDownload:'Scarica Print + Cut SVG',
  notice:'Il contorno deriva dai pixel e non sostituisce la calibrazione della macchina. Verifica sempre scala, margine, taglio e allineamento su uno scarto prima della produzione. Questo strumento non comunica direttamente con xTool Creative Space.',
  previewTitle:'Anteprima dimensionata',empty:"Carica il disegno per vedere l'anteprima del contorno.",
  ready:'Pronto. Nessun file inviato online.',
  foot:"Motore locale e originale per l'anteprima e l'esportazione SVG dimensionale.",
  choose:'Carica prima un file PNG o WebP trasparente.',many:'Sovrapposizioni o sagome numerose: semplifica il file.',
  done:'Contorno rilevato. Esegui una prova su materiale di scarto prima del taglio.',
  opaque:'Attenzione: lo sfondo è opaco. Il contorno seguirà il rettangolo dell’immagine.',
  fileTooLarge:'File troppo grande (massimo 15 MB).',badFile:'Formato non supportato: carica PNG, WebP o JPG.',
  processing:'Elaborazione in corso…',resolution:'Immagine troppo piccola per rilevare una sagoma affidabile.',
  contours:n=>n+' contorn'+(n===1?'o':'i'),exported:'SVG esportato. Verifica scala 1:1 e parametri macchina.'
 },
 en:{
  back:'← All generators',title:'Your artwork.<br>Your <span>outline.</span>',
  intro:'Upload a transparent PNG or WebP. The engine detects the silhouette from its alpha channel, adds a measured margin and exports a dimensional SVG cut path. Your file stays on this device.',
  settings:'Cut parameters',file:'1. Artwork with transparent background',
  fileNote:'Processed locally · PNG recommended · maximum 15 MB.',
  width:'2. Artwork width (mm)',margin:'Outside margin (mm)',kerf:'Estimated kerf (mm)',
  threshold:'Alpha threshold',thresholdNote:'Higher values ignore nearly transparent pixels.',
  cutDownload:'Download cut outline SVG',printDownload:'Download Print + Cut SVG',
  notice:'This contour comes from image pixels and is not a substitute for machine calibration. Check scale, margin, cutting and alignment on scrap material before production. This tool does not connect directly to xTool Creative Space.',
  previewTitle:'Measured preview',empty:'Upload artwork to preview its outline.',
  ready:'Ready. No files uploaded to a server.',
  foot:'Original local engine for dimensional SVG preview and export.',
  choose:'Please upload a transparent PNG or WebP first.',many:'Too many overlapping shapes: simplify the artwork.',
  done:'Outline detected. Test on scrap material before cutting.',
  opaque:'Warning: the image has an opaque background. The outline will follow its rectangular edges.',
  fileTooLarge:'File too large (15 MB maximum).',badFile:'Unsupported format: upload PNG, WebP or JPG.',
  processing:'Processing…',resolution:'Image resolution is too small for a reliable silhouette.',
  contours:n=>n+' outline'+(n===1?'':'s'),exported:'SVG exported. Check 1:1 scale and machine settings.'
 }
};

let language='it',canvas=null,imageData=null,imageName='design',current=null,trigger=null,loadSequence=0;
const getText=key=>translations[language][key];
function localized(){
 document.documentElement.lang=language;
 document.querySelectorAll('[data-i18n]').forEach(el=>{
  const key=el.dataset.i18n,value=getText(key);
  if(!value)return;
  if(key==='title')el.innerHTML=value; // Only trusted, authored static markup.
  else el.textContent=value;
 });
 $('langSwitch').textContent=language==='it'?'EN':'IT';
 $('langSwitch').setAttribute('aria-label',language==='it'?'Switch to English':'Passa in italiano');
 if(current)show();
}
function setStatus(message,error=false){
 const el=$('cutStatus');el.textContent=message;el.dataset.error=String(error);
}
function download(content,filename){
 const url=URL.createObjectURL(new Blob([content],{type:'image/svg+xml;charset=utf-8'}));
 const a=document.createElement('a');
 a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();
 window.setTimeout(()=>URL.revokeObjectURL(url),2000);
 setStatus(getText('exported'));
}
async function decode(file){
 if(typeof createImageBitmap==='function')return createImageBitmap(file);
 const url=URL.createObjectURL(file);
 try{
  return await new Promise((resolve,reject)=>{
   const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('Immagine illeggibile'));
   img.src=url;
  });
 }finally{URL.revokeObjectURL(url)}
}
function clearArtwork(){
 current=null;canvas=null;imageData=null;imageName='design';
 $('cutDownload').disabled=true;$('printDownload').disabled=true;
 const placeholder=document.createElement('p');
 placeholder.className='empty';placeholder.textContent=getText('empty');
 $('cutPreview').replaceChildren(placeholder);
 $('cutDimensions').textContent='—';$('cutContours').textContent='—';
}
async function loadFile(file){
 const sequence=++loadSequence;
 if(trigger){window.clearTimeout(trigger);trigger=null;}
 clearArtwork();
 if(!file){setStatus(getText('choose'));return}
 if(!['image/png','image/webp','image/jpeg'].includes(file.type)){setStatus(getText('badFile'),true);return}
 if(file.size>15*1024*1024){setStatus(getText('fileTooLarge'),true);return}
 try{
  setStatus(getText('processing'));
  const img=await decode(file);
  // A slower previous decode must never replace a newer file selection.
  if(sequence!==loadSequence){if(typeof img.close==='function')img.close();return;}
  const iw=img.width||img.naturalWidth,ih=img.height||img.naturalHeight;
  if(iw<16||ih<16)throw Error(getText('resolution'));
  const factor=Math.min(1,640/Math.max(iw,ih));
  const w=Math.round(iw*factor),h=Math.round(ih*factor);
  canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const ctx=canvas.getContext('2d',{willReadFrequently:true});
  if(!ctx)throw Error('Canvas non disponibile');
  ctx.clearRect(0,0,w,h);ctx.drawImage(img,0,0,w,h);
  imageData=ctx.getImageData(0,0,w,h);
  if(typeof img.close==='function')img.close();
  imageName=String(file.name||'artwork').replace(/\.[^.]+$/,'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
    .replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40)||'artwork';
  process();
 }catch(e){if(sequence===loadSequence)setStatus(e.message||String(e),true)}
}
function number(id,min,max){
 const value=Number($(id).value);
 if(!Number.isFinite(value)||value<min||value>max)throw Error(id+': '+min+'–'+max);
 return value;
}
function show(){
 if(!current)return;
 $('cutPreview').innerHTML=current.preview;
 $('cutDimensions').textContent=current.width+' × '+current.height+' mm';
 $('cutContours').textContent=getText('contours')(current.count);
}
function process(){
 if(!imageData||!canvas)return;
 try{
  setStatus(getText('processing'));
  const w=canvas.width,h=canvas.height;
  const targetWidth=number('cutWidth',10,600);
  const margin=number('margin',0,8),kerf=number('kerf',0,1);
  const threshold=number('threshold',1,250);
  $('thresholdOut').textContent=threshold;
  const mask=alphaMask(imageData.data,w,h,threshold);
  const filled=mask.reduce((a,b)=>a+b,0);
  if(!filled)throw Error(getText('choose'));
  const pixelMm=targetWidth/w;
  const offsetPx=(margin+kerf/2)/pixelMm;
  if(offsetPx>98)throw Error('Riduci il margine o aumenta la larghezza fisica.');
  const {mask:pad,width:pw,height:ph,padding}=padMask(mask,w,h,Math.ceil(offsetPx)+2);
  const out=offsetPx?dilate(pad,pw,ph,offsetPx):pad;
  const contours=traceOutlines(out,pw,ph,{minArea:4,maxLoops:200});
  if(!contours.length)throw Error(getText('many'));
  const common={contours,widthPx:pw,heightPx:ph,pixelMm,
    paddingPx:padding,imageWidthPx:w,imageHeightPx:h,
    imageHref:canvas.toDataURL('image/png')};
  const cut=cutSvg(common),print=cutSvg({...common,includePrint:true});
  const finalWidth=Number((pw*pixelMm).toFixed(2)),finalHeight=Number((ph*pixelMm).toFixed(2));
  current={cut,print,preview:print,count:contours.length,width:finalWidth,height:finalHeight,opaque:filled>mask.length*.99};
  $('cutDownload').disabled=false;$('printDownload').disabled=false;
  show();
  setStatus(current.opaque?getText('opaque'):getText('done'),false);
 }catch(e){current=null;$('cutDownload').disabled=true;$('printDownload').disabled=true;setStatus(e.message||String(e),true)}
}
function schedule(){
 if(trigger)window.clearTimeout(trigger);
 trigger=window.setTimeout(process,140);
}
function init(){
 try{const x=localStorage.getItem('ingly_lang');language=x==='en'?'en':'it'}catch(_){}
 localized();
 $('langSwitch').addEventListener('click',()=>{
  language=language==='it'?'en':'it';
  try{localStorage.setItem('ingly_lang',language)}catch(_){}
  localized();
 });
 $('modeSwitch').addEventListener('click',()=>{
  const root=document.documentElement,v=root.dataset.mode==='light'?'dark':'light';
  root.dataset.mode=v;
  try{localStorage.setItem('ingly_mode',v)}catch(_){}
 });
 $('artFile').addEventListener('change',e=>loadFile(e.target.files&&e.target.files[0]));
 for(const id of ['cutWidth','margin','kerf','threshold'])$(id).addEventListener('input',schedule);
 $('cutDownload').addEventListener('click',()=>current&&download(current.cut,'ingly-cut-'+imageName+'.svg'));
 $('printDownload').addEventListener('click',()=>current&&download(current.print,'ingly-print-cut-'+imageName+'.svg'));
}
init();
