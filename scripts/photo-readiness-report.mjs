#!/usr/bin/env node
/* INGLY DESIGN — auditable, read-only photo readiness report.
   No fake photographs or SKU matches. The published image manifest is the
   source of truth for LOCAL assets; remote URLs remain unverified.
   Usage: node scripts/photo-readiness-report.mjs [--out DIR] [--json] */
import {readFileSync, mkdirSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {dirname, join} from 'node:path';
import {buildPhotoQueue,photoSummary,exportPhotoCSV,photoStatus} from '../assets/js/admin/photo-worklist.js';

const dir=dirname(fileURLToPath(import.meta.url));
const root=resolve(dir,'..');
const load=name=>JSON.parse(readFileSync(join(root,'data',name+'.json'),'utf8'));
const products=load('products');
const imageData=load('immagini');
if(!Array.isArray(products)||!Array.isArray(imageData.file))
  throw new Error('Invalid catalog or missing real image inventory: no photo readiness numbers may be assumed');
const inventory=imageData.file;
const summary=photoSummary(products,inventory);
const queue=buildPhotoQueue(products,inventory);
const unknown=products.map(p=>({p,status:photoStatus(p,inventory)})).filter(x=>x.status.state==='unknown');
const esc=value=>String(value??'').replace(/\|/g,'\\|').replace(/[\r\n]+/g,' ');
const cat={};
for(const item of queue){
 const category=item.product.cat||'senza-categoria';
 const group=cat[category]??={publicMissing:0,publicGallery:0,hidden:0};
 if(!item.visible)group.hidden++;
 else if(item.state==='missing')group.publicMissing++;
 else if(item.state==='gallery')group.publicGallery++;
}
const result={generatedFrom:'data/products.json + data/immagini.json',
  generatedAt:null, // deterministic: no fake changing timestamp in versioned reports
  inventoryAvailable:true,summary,
  queue:queue.map(x=>({id:x.id,sku:x.product.sku||'',category:x.product.cat||'',
    name:x.product.n?.it||x.product.n?.en||'',visible:x.visible,state:x.state,
    expectedPath:x.main})),
  unverifiedRemoteOrUnknown:unknown.map(x=>({id:x.status.id,visible:x.status.visible,expectedPath:x.status.main})),
  byCategory:cat};
const publicQueue=result.queue.filter(x=>x.visible);
const lines=[
 '# INGLY DESIGN — Photography readiness / Fase 02','',
 '**Fonte:** products.json + inventario effettivo immagini.json. Nessun asset inventato.','',
 '| Verifica | Conteggio |','| --- | ---: |',
 '| Prodotti catalogo | '+summary.total+' |',
 '| Prodotti visibili | '+summary.visible+' |',
 '| Copertine pubbliche mancanti o sostituibili da gallery | '+summary.visibleNeedsCover+' |',
 '| Pubblici senza foto locale (né gallery verificata) | '+summary.visibleMissingAll+' |',
 '| Soltanto gallery locale, cover mancante (tutto il catalogo) | '+summary.galleryOnly+' |',
 '| Tutti i prodotti senza alcuna foto locale | '+summary.missingAll+' |',
 '| Foto remote/non verificabili (stato sconosciuto) | '+summary.unknown+' |',
 '',
 '## Pubblici da fotografare / verificare',
 '',
 '| ID | SKU | Categoria | Prodotto | Stato | File atteso |',
 '| ---: | --- | --- | --- | --- | --- |',
 ...publicQueue.map(x=>`| ${esc(x.id)} | ${esc(x.sku)} | ${esc(x.category)} | ${esc(x.name)} | ${x.state==='gallery'?'Gallery presente, serve cover':'Foto assente'} | \\`${esc(x.expectedPath)}\\` |`),
 '',
 '## Regole di pubblicazione',
 '',
 '- Non sostituire con foto AI o immagini non corrispondenti al prodotto reale.',
 '- Confermare SKU/variante, autorizzazione all’uso, crop e alt IT/EN.',
 '- Usare Admin Media Library: caricare, associare, verificare e pubblicare nello stesso commit manifest + catalogo.',
 '- Le foto remote/non verificabili sono conteggiate separatamente; non equivalgono a fotografie disponibili.',
 '- File nascosti/bozze rimangono nel CSV per la coda completa.',
 '',
 '## Priorità per categoria',
 '',
 '| Categoria | Pubblici senza foto | Pubblici solo gallery | Nascosti in coda |',
 '| --- | ---: | ---: | ---: |',
 ...Object.entries(cat).sort((a,b)=>(b[1].publicMissing+b[1].publicGallery)-(a[1].publicMissing+a[1].publicGallery)).map(([name,v])=>
 `| ${esc(name)} | ${v.publicMissing} | ${v.publicGallery} | ${v.hidden} |`)
];
const pos=process.argv.indexOf('--out');
const target=resolve(process.cwd(),pos>=0&&process.argv[pos+1]?process.argv[pos+1]:'artifacts/photo-readiness');
mkdirSync(target,{recursive:true});
writeFileSync(join(target,'status.json'),JSON.stringify(result,null,2)+'\n');
writeFileSync(join(target,'photo-upload-queue.csv'),exportPhotoCSV(queue));
writeFileSync(join(target,'README.md'),lines.join('\n')+'\n');
if(process.argv.includes('--json')) process.stdout.write(JSON.stringify(summary)+'\n');
else console.log('INGLY photo readiness:',summary.visibleNeedsCover,'public covers to verify; '+queue.length+' total queued. Report in '+target);
