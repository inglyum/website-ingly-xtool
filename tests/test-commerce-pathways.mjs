import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const html=readFileSync('index.html','utf8');
const css=readFileSync('assets/css/ingly-responsive-theme.css','utf8');
const main=readFileSync('assets/js/main.js','utf8');
const data=JSON.parse(readFileSync('data/products.json','utf8'));
const files=new Set(JSON.parse(readFileSync('data/immagini.json','utf8')).file);
const categories=new Set(JSON.parse(readFileSync('data/categories.json','utf8')).map(c=>c.id));
for(const [id,img] of [['b2b','cat-b2b.webp'],['accessori','cat-accessori.webp']]){
 assert.ok(categories.has(id),'Categoria non trovata '+id);
 assert.ok(data.some(p=>p.cat===id&&!p.hidden),'Categoria senza prodotti '+id);
 assert.ok(files.has(img),'Immagine editoriale non presente '+img);
 assert.ok(html.includes('data-action="go-shop" data-arg="'+id+'"'),'Pulsante non collegato a filtro reale '+id);
}
for(const key of ['shopPathsTitle','shopGadgetsTitle','shopAccessoriesTitle','shopExplore']){
 assert.ok(html.includes('data-inline-i18n="'+key+'"'),'UI non collegata a traduzione '+key);
 assert.ok(main.includes(key+':{it:'),'Traduzione IT/EN mancante '+key);
}
assert.match(main,/document\.querySelectorAll\('\[data-inline-aria\]'\)/,'Aria localizzato');
assert.ok(css.includes('.ingly-commerce-spots__grid'),'Layout category spotlight mancante');
assert.ok(css.includes('max-width:400px'),'Mobile piccolo non adattato');
console.log('✔ Gadget e Accessori: categorie vere, immagini esistenti, responsive e IT/EN');
