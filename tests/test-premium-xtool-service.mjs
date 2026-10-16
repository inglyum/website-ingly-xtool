import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const master=readFileSync('assets/images/ingly-wordmark-master.svg','utf8');
const premium=readFileSync('assets/images/xtool-authorized-service-centre-premium.svg','utf8');
const parser=markup=>new JSDOM(markup,{contentType:'image/svg+xml'}).window.document;
const m=parser(master),p=parser(premium);
assert.equal(p.documentElement.getAttribute('viewBox'),'0 0 820 520');
for(const [original,copy] of [
 ['#ingly-letter-i-stem','#badge-ingly-i-stem'],
 ['#ingly-letter-i-foot','#badge-ingly-i-foot'],
 ['#ingly-original-ngly','#badge-ingly-ngly']
 ]){
 assert.equal(p.querySelector(copy)?.getAttribute('d'),m.querySelector(original)?.getAttribute('d'),
  'Badge MUST reuse full approved INGLY vector without overlap or redraw');
}
assert.equal(p.querySelectorAll('#badge-ingly-i-stem').length,1);
assert.match(premium,/Authorized <tspan/);
assert.match(premium,/XTOOL SQUAD/);
assert.match(premium,/radialGradient/);
const doc=new JSDOM(readFileSync('index.html','utf8')).window.document;
const badge=doc.querySelector('#page-macchine .ingly-service-centre__badge img');
assert.equal(badge?.getAttribute('src'),'assets/images/xtool-authorized-service-centre-premium.svg');
assert.match(badge.getAttribute('alt'),/INGLY DESIGN/);
assert.ok(doc.querySelector('.ingly-service-centre__copy .ingly-service-centre__scope')?.textContent.includes('caso per caso'),
 'Do not overclaim automatic repair/authorization outcomes');
const css=readFileSync('assets/css/brand-system-2026.css','utf8');
assert.match(css,/#page-macchine \.ingly-service-centre__badge/);
assert.match(css,/aspect-ratio:820\/520/);
console.log('✔ xTool premium vector badge reuses original complete INGLY logo and remains scoped to Machine Lab');
