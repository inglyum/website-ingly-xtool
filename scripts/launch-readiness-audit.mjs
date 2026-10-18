#!/usr/bin/env node
/* INGLY DESIGN — Read-only commercial launch gates.
   Reports configuration, NEVER invents successful external deliveries.
   No network requests, credential access, production writes or checkout mutations. */
import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const data=name=>JSON.parse(readFileSync(join(root,'data',name+'.json'),'utf8'));
const cfg=data('config'),p=data('products'),im=data('immagini');
const endpoints=cfg.moduli||{};
const isConfigured=v=>typeof v==='string'&&/^https:\/\//i.test(v.trim());
const visible=p.filter(x=>x.visible!==false&&x.hidden!==true&&x.published!==false);
const img=new Set(im.file||[]);
const normalizePath=v=>String(v||'').replace(/^\/?img\//,'');
const withLocalCover=visible.filter(x=>x.img&&img.has(normalizePath(x.img)));
const gates=[
 {id:'quotes-private',label:'Private quote endpoint configured',ok:isConfigured(endpoints.formspreePreventivo),evidence:'data/config.json moduli.formspreePreventivo',requiresLiveTest:true},
 {id:'quotes-business',label:'B2B quote endpoint configured',ok:isConfigured(endpoints.formspreePreventivoB2B),evidence:'data/config.json moduli.formspreePreventivoB2B',requiresLiveTest:true},
 {id:'newsletter',label:'Newsletter endpoint configured',ok:isConfigured(endpoints.formspreeNewsletter),evidence:'data/config.json moduli.formspreeNewsletter',requiresLiveTest:true},
 {id:'local-covers',label:'Visible products have local cover inventory entries',ok:visible.length===withLocalCover.length,evidence:'data/products.json + data/immagini.json',requiresLiveTest:false}
];
const report={source:'read-only repository data; not end-to-end acceptance',visibleProducts:visible.length,visibleWithLocalCover:withLocalCover.length,visibleNeedingLocalCover:visible.length-withLocalCover.length,gates,manualGates:['authorized admin upload/publish/rollback','quote inbox receipt + privacy','real iOS and Android UX','verified original photographs and rights','actual Core Web Vitals']};
const out=join(root,'artifacts','launch-readiness');mkdirSync(out,{recursive:true});
writeFileSync(join(out,'status.json'),JSON.stringify(report,null,2)+'\n');
console.log('INGLY launch gate inventory: '+gates.filter(g=>g.ok).length+'/'+gates.length+' configured; manual verification still required.');
if(process.argv.includes('--json'))console.log(JSON.stringify(report));
