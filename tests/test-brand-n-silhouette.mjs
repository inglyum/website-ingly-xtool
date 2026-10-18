/* IL LOGO È QUELLO ORIGINALE.

   Ottobre 2026: il titolare ha confrontato il sito con il file originale e
   ha chiesto la N vera. Quella in uso era stata «normalizzata»: diagonale
   accorciata dentro l'altezza delle altre lettere. Il logo originale invece
   ha la diagonale lunga, che sale sopra le lettere e scende sotto la linea
   di base, e la I separata con il suo triangolo.

   I tre file (master, chiaro, scuro) sono vettorializzati dal file originale
   e devono restare identici fra loro, cambiando solo il colore. Questo test
   prima VIETAVA la diagonale lunga; ora la PRETENDE, misurandola. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const read=(name)=>readFileSync(name,'utf8');
const files=['master','light','dark'].map(n=>'assets/images/ingly-wordmark-'+n+'.svg');
const docs=files.map(p=>new JSDOM(read(p),{contentType:'image/svg+xml'}).window.document);
const viewBox='214 676 1597 602';
const paths=doc=>[...doc.querySelectorAll('path')].map(p=>[p.id,p.getAttribute('d')]);

/* Riquadro di ogni sotto-tracciato: basta per misurare la forma senza un motore grafico */
const box=d=>{const n=(d.match(/-?\d+(?:\.\d+)?/g)||[]).map(Number);const xs=n.filter((_,i)=>i%2===0),ys=n.filter((_,i)=>i%2===1);
  return {x0:Math.min(...xs),x1:Math.max(...xs),y0:Math.min(...ys),y1:Math.max(...ys)}};
const sotto=d=>d.split(/(?=M)/).map(s=>s.trim()).filter(Boolean).map(box);

for(const [index,doc] of docs.entries()){
 const name=files[index];
 assert.equal(doc.documentElement.getAttribute('viewBox'),viewBox,name+': riquadro del logo originale');
 const stem=doc.querySelector('#ingly-letter-i-stem')?.getAttribute('d')||'';
 const foot=doc.querySelector('#ingly-letter-i-foot')?.getAttribute('d')||'';
 const ngly=doc.querySelector('#ingly-original-ngly')?.getAttribute('d')||'';
 assert.ok(stem&&foot&&ngly,name+': I (asta e piede) e NGLY sono tracciati separati');

 const pezzi=sotto(ngly);
 const altezza=b=>b.y1-b.y0;
 /* la diagonale della N è il pezzo più alto di tutti */
 const diagonale=pezzi.reduce((a,b)=>altezza(b)>altezza(a)?b:a);
 /* le lettere G, L, Y: tutto ciò che sta a destra della N */
 const lettere=pezzi.filter(b=>b.x0>diagonale.x1+50);
 const capo=Math.min(...lettere.map(b=>b.y0)), base=Math.max(...lettere.map(b=>b.y1));
 assert.ok(diagonale.y0<capo-40,name+': la diagonale della N sale sopra le altre lettere, come nell\'originale');
 assert.ok(diagonale.y1>base+40,name+': la diagonale della N scende sotto la linea di base, come nell\'originale');

 const I=box(stem);
 assert.ok(I.x1<diagonale.x0,name+': la I è staccata dalla N');
 assert.deepEqual(paths(doc),paths(docs[0]),name+': stesso identico contorno del master');
}
assert.match(read('assets/images/ingly-wordmark-light.svg'),/color="#ffffff"/,'variante chiara = bianca');
assert.match(read('assets/images/ingly-wordmark-dark.svg'),/color="#10151f"/,'variante scura = inchiostro');

const html=read('index.html'),admin=read('admin.html');
for(const [name,source] of [['site',html],['admin',admin]]){
 assert.match(source,/ingly-wordmark-light\.svg\?v=202610\d{2}n\d+/,name+': browser cache bust');
 assert.ok(!/width="1660" height="490"/.test(source),name+': nessuna misura del vecchio logo');
}
assert.match(read('assets/css/brand-system-2026.css'),/aspect-ratio:1597\/602!important/);
assert.match(read('assets/css/admin-brand-system.css'),/aspect-ratio:1597\/602!important/);
assert.ok(!/1660\/490/.test(read('assets/css/brand-system-2026.css')+read('assets/css/admin-brand-system.css')),'nessuna proporzione del vecchio logo');
assert.match(read('sw.js'),/CACHE_VER\s*=\s*'ingly-v17'/,'PWA cache invalidated');
console.log('✔ INGLY logo originale: N con diagonale lunga, I separata, tre varianti identiche, cache aggiornata');
