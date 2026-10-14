// End-to-end data wiring regression (static checks, not browser screenshots).
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const html=read('index.html'), css=read('assets/css/pages.css');
const admin=read('admin.html'), lab=read('assets/js/lab-ui.js');
const machineLogic=read('assets/js/lab.js');
const digitalLogic=read('assets/js/digitale-ui.js');
const logo=read('assets/images/ingly-logo.svg');
const mats=JSON.parse(read('data/materiali.json')).materiali;
const mac=JSON.parse(read('data/immagini-macchine.json')).macchine;
const digital=JSON.parse(read('data/digitale.json')).bundle;
const sw=read('sw.js');
assert.equal((html.match(/class="journey-card"/g)||[]).length,7,'seven editorial categories');
assert.ok(!logo.includes('<rect width="500" height="500" fill="#fff"/>'),'transparent logo preserved');
assert.match(html,/FOTO UFFICIALE xTOOL P3/,'feature image');
assert.match(css,/\.xtool-lab-feature \.xtool-lab-copy h2/,'contrast override');
assert.match(css,/#f8f6ef!important/,'dark promo light text');
assert.match(css,/:root\[data-mode="light"\] body/,'clear day mode');
assert.match(css,/:root\[data-mode="dark"\] body/,'night mode');
assert.match(css,/@media\(max-width:385px\)/,'narrow mobile');
assert.match(css,/\.lab-material-cover/,'material photo layout');
assert.match(css,/\.machine-explore-grid/,'informational models visual comparison');
assert.match(css,/\.digital-preview-grid/,'visual covers');
assert.match(digitalLogic,/digital-preview-grid/);
assert.match(lab,/fotoMateriale\(m, L/);
assert.match(machineLogic,/immagineRemotaVerificata === true/);
for(const fragment of ["dest.startsWith('m:')","dest.startsWith('x:')","dest.startsWith('d:')","dest.startsWith('a:')","dest==='hero'"]){
  assert.ok(admin.includes(fragment),'admin binding '+fragment);
}
for(const item of mats){
  assert.ok(item.img && existsSync(item.img),'existing material photo '+item.id);
  assert.equal(item.isDemo,true,'sample labeled '+item.id);
}
for(const item of digital){
  assert.ok(item.img && existsSync(item.img),'digital cover file exists '+item.id);
  assert.equal(item.stato,'bozza','draft remains draft');
  assert.equal(item.isDemo,true,'draft correctly flagged');
}
for(const item of mac){
  assert.ok(item.origine.startsWith('https://cdn.shopify.com/'),'official source '+item.id);
  assert.equal(item.immagineRemotaVerificata,true,'URL verification marked '+item.id);
}
const version=sw.match(/ingly-v\d+/)?.[0];
assert.ok(version && html.includes("CACHE_WANT='"+version+"'"),'HTML and service worker cache agree');
assert.ok(!html.includes('4,9 su 5.'),'no fabricated score in homepage copy');
console.log('PASS Premium visual commerce, originals/samples and visual CMS regression');
