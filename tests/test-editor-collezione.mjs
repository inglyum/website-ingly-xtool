/* Test funzionale del motore collezioni: DOM, validazione, archiviazione e bozze. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const script=readFileSync('assets/js/admin/editor-collezione.js','utf8');
assert.doesNotThrow(()=>new Function(script),'codice editor valido');
const dom=new JSDOM('<main id="editor"></main>',{url:'https://inglyum.github.io',runScripts:'outside-only'});
dom.window.eval(script);
const E=dom.window.INGLY_COLLECTION_EDITOR;
assert.ok(E && typeof E.mount==='function','API editor disponibile');
const root=dom.window.document.getElementById('editor');
const items=[{id:'p3',stato:'pubblicato',n:{it:'P3',en:'P3'},prezzo:null,galleria:[]}];
const schema=[
 {key:'n',label:'Nome',type:'testo-it-en',required:true},
 {key:'prezzo',label:'Prezzo',type:'prezzo|null'},
 {key:'galleria',label:'Foto',type:'galleria'}
];
let changed=0;
const instance=E.mount({root,items,schema,title:'Macchine',file:'data/macchine.json',
 onChange:()=>changed++,create:()=>({id:'p3',n:{it:'Nuovo',en:'New'},stato:'bozza'})});
assert.ok(root.textContent.includes('Macchine'),'titolo visibile');
assert.equal(E.read(items[0],'prezzo'),null,'prezzo sconosciuto resta null');
const name=root.querySelector('[data-ed-field="0.n.it"]');
name.value='<img src=x onerror=alert(1)>';
name.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
assert.ok(!root.querySelector('img'),'input non interpretato come markup');
assert.equal(items[0].n.it,'<img src=x onerror=alert(1)>','testo mantenuto nei dati');
const price=root.querySelector('[data-ed-field="0.prezzo"]');
price.value='17.50';
price.dispatchEvent(new dom.window.Event('input',{bubbles:true}));
assert.equal(items[0].prezzo,17.5,'prezzo numerico corretto');
root.querySelector('[data-ed-main="new"]').click();
assert.equal(items.length,2,'aggiunge elemento');
assert.notEqual(items[1].id,items[0].id,'non riutilizza ID');
assert.equal(items[1].stato,'bozza','nuovo elemento in bozza');
const archive=root.querySelector('[data-ed-main="archive"][data-ed-i="1"]');
archive.click();
assert.equal(items[1].stato,'archiviato','archivia senza cancellare');
root.querySelector('[data-ed-main="restore"][data-ed-i="1"]').click();
assert.equal(items[1].stato,'bozza','ripristina stato precedente');
assert.equal(items.length,2,'ripristino conserva gli ID');
assert.ok(changed>=5,'bozza aggiornata tramite callback esistente');
assert.deepEqual(Array.from(E.validate([{id:'a'},{id:'a'}],[])),['ID duplicato: a'],'ID duplicati bloccati');
assert.ok(E.validate([{id:'b',prezzo:-2}],[{key:'prezzo',type:'prezzo|null'}]).length,'prezzi negativi bloccati');
assert.ok(E.validate([{id:'m',galleria:[{src:'assets/images/x.webp',alt:{it:'',en:'Photo'}}]}],
 [{key:'galleria',type:'galleria'}]).length,'alt IT/EN obbligatori');
assert.ok(E.validate([{id:'m',fonte:{url:'javascript:alert(1)'}}],
 [{key:'fonte.url',type:'url'}]).length,'URL non HTTPS bloccati');
console.log('  ✔ Editor collezioni: DOM, XSS, validazione, CRUD, archiviazione e bozza.');
