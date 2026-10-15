import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const inventory=JSON.parse(readFileSync('data/immagini.json','utf8')).file;
const cfg=JSON.parse(readFileSync('data/config.json','utf8'));
globalThis.window={INGLY:{
  D:{it:{},en:{}},CONFIG:cfg,IMMAGINI:{file:inventory},
  __v:5,MV:{'img/1.webp':[400,800]}
}};
const {fotoDisponibili,imgTag,esiste}=await import('../assets/js/utils.js');

assert.equal(esiste('img/999999.webp'),false,'Missing photo rejected');
assert.equal(esiste('img/1.webp?v=5'),true,'Known photo with cache busting found');
assert.equal(esiste('assets/images/ingly-logo.svg'),true,'Editorial assets not rejected by product inventory');
assert.equal(esiste('https://example.org/remote-image.webp'),true,'External source is not locally verifiable');
assert.equal(esiste(''),false,'Empty src never counts as a photo');
assert.equal(esiste('img/../oops.webp'),false,'Invalid/missing local entry rejected');

const gallery=fotoDisponibili({id:9,img:'img/9.webp',gallery:['img/1.webp','img/1.webp','img/888.webp']});
assert.deepEqual(gallery,['img/1.webp'],'A real gallery shot replaces absent primary; no duplicates');
assert.deepEqual(fotoDisponibili({id:9,img:'img/9.webp',gallery:[]}),[],'No broken image tags for unphotographed products');
assert.ok(!imgTag({id:9,img:'img/9.webp',n:{it:'No photo'}}),'Missing media never emits img');

const fallback=imgTag({id:9,img:'img/9.webp',gallery:['img/1.webp'],n:{it:'Etichetta & "speciale"'}});
assert.match(fallback,/src="img\/1.webp\?v=5"/,'Gallery shot used for shop card');
assert.match(fallback,/alt="Etichetta &amp; &quot;speciale&quot;"/,'Product title escaped for accessibility');
assert.match(fallback,/onerror="this.remove\(\)"/,'Unexpected image loading failure handled');
const products=JSON.parse(readFileSync('data/products.json','utf8'));
const available=new Set(inventory);
const missing=products.filter(p => {
 const main=p.img||(cfg.cartellaImmagini+p.id+'.webp');
 return main.startsWith('img/')&&!available.has(main.slice(4));
});
const visible=missing.filter(p=>p.hidden!==true);
assert.ok(visible.length>0,'Backlog of public product photos is measured');
console.log('✔ Product media: inventory-backed cards, gallery fallback, deduplicated lightbox images; '+missing.length+' missing primary images ('+visible.length+' public).');
