import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=read('assets/css/pages.css');
const home=read('index.html');
const business=read('business/index.html');
const it=JSON.parse(read('data/texts.json'));
const cfg=JSON.parse(read('data/config.json'));
for(const token of ['#f8f7f4','#111318','#c5a46d','--signature-gold','--signature-focus']){
  assert.ok(css.includes(token),'Missing signature token '+token);
}
for(const page of [home,business]){
  assert.ok(!page.includes('TRENTO SPA · VELLUTO'),'Unverified customer strip detected');
  assert.ok(page.includes('class="signature-b2b-visual"'),'Missing business visual');
  assert.ok(page.includes('href="materiali" data-nav="materiali" data-i18n="bizCta2"'),'Secondary business CTA misrouted');
}
assert.ok(it.it.bizSub.includes('aziende'),'B2B copy missing');
assert.ok(cfg.slogan.it.includes('idee'),'New homepage headline missing');
const js=read('data/config.js');
assert.ok(js.includes(cfg.slogan.it.replaceAll('\n','\\n')),'Fallback headline must match JSON');
assert.ok(!js.includes('00000000000'),'Invalid placeholder VAT leaked into config fallback');
console.log('INGLY Signature ecommerce UI invariants verified.');
