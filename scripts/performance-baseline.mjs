/* Sprint 17 — deterministic transfer-weight baseline; does not change production runtime.
 * Source-weight proxy only, not an LCP/INP/CLS measurement. */
import {readFileSync,statSync,existsSync,mkdirSync,writeFileSync} from 'node:fs';
import {resolve,extname} from 'node:path';
const html=readFileSync('index.html','utf8');
const assetLinks=[...html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+)"[^>]*>/gi)].map(x=>x[1]);
const paths=[...new Set(assetLinks.filter(x=>/^assets\/(?:css|js)\/[^?#]+\.(?:css|js)$/.test(x)))];
const files=paths.map(path=>({path,bytes:existsSync(path)?statSync(path).size:null,kind:extname(path)==='.css'?'css':'js'}));
const missing=files.filter(x=>x.bytes===null);
const total=kind=>files.filter(x=>x.kind===kind).reduce((a,x)=>a+(x.bytes||0),0);
const report={baseline:'source-html-static-references',notice:'File sizes on disk, not network transfer or Core Web Vitals.',files:files.length,missing:missing.map(x=>x.path),javascriptBytes:total('js'),cssBytes:total('css'),largest:files.filter(x=>x.bytes!==null).sort((a,b)=>b.bytes-a.bytes).slice(0,10)};
mkdirSync('artifacts/performance',{recursive:true});
writeFileSync('artifacts/performance/static-assets.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(missing.length){console.error('Missing critical assets in HTML');process.exitCode=1;}
