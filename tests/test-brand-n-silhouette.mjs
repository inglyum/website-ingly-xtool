import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const read=(name)=>readFileSync(name,'utf8');
const files=['master','light','dark'].map(n=>'assets/images/ingly-wordmark-'+n+'.svg');
const docs=files.map(p=>new JSDOM(read(p),{contentType:'image/svg+xml'}).window.document);
const viewBox='-200 60 1660 490';
const iStem='M-179 81H-51V509L-179 375Z';
const nGeometry='M1,147 H118 L300,368 V147 H415 V507 H298 L118,289 V507 H1Z';
const paths=doc=>[...doc.querySelectorAll('path')].map(p=>[p.id,p.getAttribute('d')]);
for(const [index,doc] of docs.entries()){
 const name=files[index];
 assert.equal(doc.documentElement.getAttribute('viewBox'),viewBox,name+': safe crop');
 assert.equal(doc.querySelector('#ingly-letter-i-stem')?.getAttribute('d'),iStem,name+': independent I');
 assert.ok(doc.querySelector('#ingly-letter-i-foot'),name+': separate I foot');
 const ngly=doc.querySelector('#ingly-original-ngly')?.getAttribute('d')||'';
 assert.ok(ngly.includes(nGeometry),name+': corrected continuous N');
 assert.ok(!ngly.includes('M1,0 '),name+': no red-marked high spike');
 assert.ok(!ngly.includes('415,589'),name+': no N descender beyond baseline');
 assert.ok(!ngly.includes('M300,147 300,265'),name+': no detached right triangle');
 assert.deepEqual(paths(doc),paths(docs[0]),name+': identical master outline');
}
const html=read('index.html'),admin=read('admin.html');
for(const [name,source] of [['site',html],['admin',admin]]){
 assert.match(source,/ingly-wordmark-light\.svg\?v=20261017n2/,name+': browser cache bust');
}
assert.match(read('assets/css/brand-system-2026.css'),/aspect-ratio:1660\/490!important/);
assert.match(read('assets/css/admin-brand-system.css'),/aspect-ratio:1660\/490!important/);
assert.match(read('sw.js'),/CACHE_VER\s*=\s*'ingly-v16'/,'PWA cache invalidated');
console.log('✔ INGLY logo: no N spike/descender, matching vector variants, cache-busted Home and Admin');
