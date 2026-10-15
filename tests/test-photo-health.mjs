import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const admin=readFileSync('admin.html','utf8');
const source=admin.slice(admin.indexOf('function hasStaged(path)'),admin.indexOf('/* ===== ANALYTICS MINI-DASHBOARD'));
assert.ok(source.includes('function fotoProdottoMancante(p)'),'Helper centrale assente');
const f=(files=[],staged=[],items=files)=>new Function('MEDIA','REPO_IMG','S',
  source+';return fotoProdottoMancante;')(
   staged.map(path=>({path})),items===null?null:items,{IMG:{file:files}}
  );
assert.equal(f(['1.webp'])({id:1,img:'img/1.webp'}),false);
assert.equal(f(['1.webp'])({id:2,img:'img/2.webp'}),true);
assert.equal(f(['3.webp'])({id:3}),false,'Fallback storico id.webp');
assert.equal(f([])( {id:4}),true,'Nessuna immagine sul disco');
assert.equal(f([],['img/5.webp'])({id:5,img:'img/5.webp'}),false,'Foto staged');
assert.equal(f(['4.webp'],[],null)({id:4}),false,'Inventario pubblicato senza GitHub scan');
assert.equal(f([])({id:12,img:'https://example.com/photo.webp'}),false,'Asset remoto trattato separatamente');
assert.match(admin,/const categoriaSelezionata=\$\('pCatF'\)\.value/,'Filtro categoria preservato');
assert.match(admin,/const noPhoto=P\.filter\(fotoProdottoMancante\)\.length/,'Dashboard usa media realmente presenti');
assert.match(admin,/if\(sf==='nofoto'\)return fotoProdottoMancante\(p\)/,'Filtro fotografia corretto');
const products=JSON.parse(readFileSync('data/products.json','utf8'));
const available=new Set(JSON.parse(readFileSync('data/immagini.json','utf8')).file);
const needs=products.filter(p=>{const path=String(p.img||('img/'+p.id+'.webp')).split(/[?#]/)[0];return path.startsWith('img/')&&!available.has(path.slice(4))});
assert.ok(needs.length>0,'Audit deve rilevare anche path configurati senza foto');
console.log('✔ Admin: file mancante rilevato anche con path presente, filtro categoria persistente; '+needs.length+' schede da verificare.');
