/* INGLY Media Library — restricted, non-scriptable SVG upload profile.
   Validate BEFORE staging or publishing on the GitHub Pages origin.
   Unsupported constructs are rejected, never silently stripped. */
const TAGS=new Set([
 'svg','g','defs','symbol','use','path','rect','circle','ellipse','line',
 'polyline','polygon','text','tspan','title','desc','lineargradient',
 'radialgradient','stop','clippath','mask','pattern'
]);
const ATTRS=new Set([
 'id','class','viewbox','width','height','version','xmlns','xmlns:xlink',
 'preserveaspectratio','role','aria-label','aria-labelledby',
 'd','points','x','y','x1','y1','x2','y2','dx','dy','cx','cy','r','rx','ry',
 'transform','gradienttransform','gradientunits','patternunits',
 'patterntransform','offset','spreadmethod','mask','maskunits',
 'clippath','clip-path','cliprule','clip-rule',
 'fill','fill-rule','fill-opacity','stroke','stroke-width',
 'stroke-dasharray','stroke-dashoffset','stroke-linecap','stroke-linejoin',
 'stroke-miterlimit','stroke-opacity','opacity','color',
 'stop-color','stop-opacity','display','visibility',
 'font-family','font-size','font-style','font-weight','text-anchor',
 'dominant-baseline','letter-spacing','word-spacing','style',
 'href','xlink:href','vector-effect'
]);
const CSS=new Set([
 'fill','fill-rule','fill-opacity','stroke','stroke-width','stroke-dasharray',
 'stroke-dashoffset','stroke-linecap','stroke-linejoin','stroke-miterlimit',
 'stroke-opacity','opacity','color','stop-color','stop-opacity',
 'display','visibility','font-family','font-size','font-style','font-weight',
 'text-anchor','dominant-baseline','letter-spacing','word-spacing','clip-path'
]);
function unsafeValue(value){
  const compact=String(value).replace(/\s+/g,' ').trim();
  const urls=[...compact.matchAll(/url\s*\(([^)]*)\)/gi)];
  const noUrls=compact.replace(/url\s*\([^)]*\)/gi,'');
  return /javascript\s*:|data\s*:|vbscript\s*:|@import|@font-face|expression\s*\(|[<>]/i.test(compact)||
    /\burl\s*\(/i.test(noUrls)||
    urls.some(m=>!/^['"]?#[a-z0-9_.:-]+['"]?$/i.test(m[1].trim()));
}
function validateStyle(style){
  return String(style).split(';').every(decl=>{
    if(!decl.trim())return true;
    const p=decl.indexOf(':');
    return p>0&&CSS.has(decl.slice(0,p).trim().toLowerCase())&&
      !unsafeValue(decl.slice(p+1));
  });
}
export function validateStaticSvg(source,Parser=globalThis.DOMParser){
  if(typeof source!=='string'||!source.trim())throw Error('SVG vuoto');
  if(source.length>8*1024*1024)throw Error('SVG troppo grande (massimo 8 MB)');
  if(/<!DOCTYPE|<!ENTITY|<\?(?!xml(?:\s|>))/i.test(source))
    throw Error('SVG con entità esterne o istruzioni XML non consentite');
  if(typeof Parser!=='function')throw Error('Parser XML non disponibile');
  const doc=new Parser().parseFromString(source,'image/svg+xml');
  if(doc.querySelector('parsererror')||!doc.documentElement||
     doc.documentElement.localName!=='svg'||
     doc.documentElement.namespaceURI!=='http://www.w3.org/2000/svg')
    throw Error('SVG XML non valido');
  const nodes=doc.querySelectorAll('*');
  if(nodes.length>25000)throw Error('SVG troppo complesso (massimo 25.000 elementi)');
  for(const el of [doc.documentElement,...nodes]){
    const tag=el.localName.toLowerCase();
    if(!TAGS.has(tag)||el.namespaceURI!=='http://www.w3.org/2000/svg')
      throw Error('Elemento SVG non consentito: '+tag);
    for(const attr of el.attributes){
      const name=attr.name.toLowerCase(),value=attr.value;
      if(name.startsWith('on')||!ATTRS.has(name))
        throw Error('Attributo SVG non consentito: '+name);
      if(unsafeValue(value))throw Error('Riferimento o codice non consentito nello SVG: '+name);
      if(name==='style'&&!validateStyle(value))
        throw Error('Stile CSS non consentito nello SVG');
      if((name==='href'||name==='xlink:href')&&!/^#[a-z0-9_.:-]+$/i.test(value))
        throw Error('I riferimenti SVG devono essere interni al file');
      if(name==='xmlns'&&value!=='http://www.w3.org/2000/svg')
        throw Error('Namespace SVG non consentito');
      if(name==='xmlns:xlink'&&value!=='http://www.w3.org/1999/xlink')
        throw Error('Namespace xlink non consentito');
    }
  }
  return true;
}
