/* INGLY — verifiche WCAG 2.2 delle coppie semantiche.
   Non equivale a un audit WCAG completo dei contenuti su immagini/gradienti. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const sheets=[
 {path:'assets/css/brand-system-2026.css',prefix:'brand'},
 {path:'assets/css/admin-brand-system.css',prefix:'ab'}
];
function contrast(a,b){
 const c=h=>{
  const hex=h.slice(1);const full=hex.length===3?[...hex].map(x=>x+x).join(''):hex;
  const rgb=[0,2,4].map(i=>parseInt(full.slice(i,i+2),16)/255);
  const lin=v=>v<=0.04045?v/12.92:Math.pow((v+.055)/1.055,2.4);
  return rgb.map(lin).reduce((n,x,i)=>n+x*[.2126,.7152,.0722][i],0);
 };
 const la=c(a),lb=c(b);
 return (Math.max(la,lb)+.05)/(Math.min(la,lb)+.05);
}
function readToken(css,prefix,mode,name){
 const marker=mode==='dark'?':root,:root[data-mode="dark"]':':root[data-mode="light"]';
 const start=css.indexOf(marker);
 assert.ok(start>=0,'Missing '+mode+' selector');
 const open=css.indexOf('{',start),close=css.indexOf('}',open);
 const block=css.slice(open+1,close);
 const value=block.match(new RegExp('--'+prefix+'-'+name+'\\s*:\\s*(#[0-9a-fA-F]{3,6})'));
 assert.ok(value,'Missing '+prefix+'-'+name+' '+mode);
 return value[1];
}
let checks=0;
for(const sheet of sheets){
 const css=read(sheet.path);
 for(const theme of ['dark','light']){
  const token=k=>readToken(css,sheet.prefix,theme,k);
  const surfaces=sheet.prefix==='brand'?['bg','deep','surface','elevated']:['bg','deep','surface','raised'];
  const ink=sheet.prefix==='brand'?'ink':'text';
  const secondary=sheet.prefix==='brand'?'muted':'muted';
  for(const bg of surfaces){
   for(const fg of [ink,secondary]){
    const ratio=contrast(token(bg),token(fg));
    assert.ok(ratio>=4.5,sheet.path+' '+theme+' '+fg+' on '+bg+' ratio='+ratio.toFixed(2));
    checks++;
   }
  }
  const accent=token(sheet.prefix==='brand'?'gold':'gold');
  const base=token('surface');
  const ratio=contrast(accent,base);
  assert.ok(ratio>=4.5,sheet.path+' '+theme+' gold-on-surface '+ratio.toFixed(2));
  checks++;
 }
}
console.log('✔ Contrasto token: '+checks+' coppie WCAG AA (testo normale ≥4.5:1) su entrambi i temi. Non certifica foto, gradienti o widget.');
