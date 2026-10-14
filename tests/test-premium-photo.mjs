/* INGLY Visual Commerce: checks for the first publish-ready media pass.
   Static checks are separate from browser E2E tests and do not claim LCP or visual QA. */
import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const src=p=>readFileSync(p,'utf8');
const html=src('index.html'), css=src('assets/css/pages.css');
const lab=src('assets/js/lab-ui.js'), lib=src('assets/js/lab.js');
const digital=src('assets/js/digitale-ui.js'), admin=src('admin.html');
const logo=src('assets/images/ingly-logo.svg');
const mats=JSON.parse(src('data/materiali.json')).materiali;
const mac=JSON.parse(src('data/immagini-macchine.json')).macchine;
const digi=JSON.parse(src('data/digitale.json')).bundle;
const cats=JSON.parse(src('data/categories.json'));
assert.ok(html.includes('journey-grid'),'Home includes seven visual pathways');
assert.equal((html.match(/class="journey-card"/g)||[]).length,7,'7 landing cards');
assert.ok(!logo.includes('<rect width="500" height="500" fill="#fff"/>'),'logo has no white square');
assert.match(html,/Fotografia ufficiale xTool P3/);
assert.match(css,/\.xtool-lab-feature \.xtool-lab-copy h2/);
assert.match(css,/color:#f8f5eb!important/,'xTOOL dark panel heading contrast');
assert.match(css,/:root\[data-mode="light"\] body/,'real light theme');
assert.match(css,/@media\(max-width:430px\)/,'mobile layout');
assert.match(admin,/dest\.startsWith\('m:'\)/,'material upload destination');
assert.match(admin,/dest\.startsWith\('x:'\)/,'machine upload destination');
assert.match(admin,/dest\.startsWith\('d:'\)/,'digital upload destination');
assert.match(admin,/dest\.startsWith\('a:'\)/,'academy upload destination');
assert.match(admin,/dest==='hero'/,'hero upload destination');
assert.match(digital,/digital-preview-grid/);
assert.match(lab,/machine-explore-grid/);
assert.match(lib,/immagineRemotaVerificata === true/);
for(const m of mac){
  assert.ok(m.licenza?.stato==='consentito','official machine image license flag: '+m.id);
  assert.ok(m.immagineRemotaVerificata===true,'official image checked: '+m.id);
  assert.match(m.origine,/^https:\/\/cdn\.shopify\.com\//,'official CDN '+m.id);
}
for(const m of mats){
  assert.ok(m.img && existsSync(m.img),'material sample exists: '+m.id);
  assert.ok(m.isDemo===true,'sample not claimed as material inventory: '+m.id);
}
for(const d of digi){
  assert.ok(existsSync(d.img),'digital cover exists: '+d.id);
  assert.ok(d.assetKind==='illustrative-example'&&d.isDemo,'digital draft is labeled: '+d.id);
  assert.equal(d.stato,'bozza','never auto-publish a draft');
}
for(const c of cats){if(c.img)assert.ok(existsSync(c.img),'category cover exists: '+c.id)}
console.log('PASS: Visual commerce asset+model+Admin regression checks');
