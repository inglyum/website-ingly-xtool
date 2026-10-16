import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const read=p=>readFileSync(p,'utf8'),site=read('index.html'),admin=read('admin.html');
const css=read('assets/css/brand-system-2026.css');
for(const theme of ['light','dark']){
 const svg=read('assets/images/ingly-wordmark-'+theme+'.svg');
 const d=new JSDOM(svg,{contentType:'image/svg+xml'}).window.document;
 assert.equal(d.documentElement.getAttribute('viewBox'),'-205 -20 1670 630');
 assert.equal(d.querySelector('#ingly-letter-i-stem')?.getAttribute('d'),'M-179 81H-51V509L-179 375Z');
 const original=d.querySelector("#ingly-original-ngly");
 assert.match(original?.getAttribute('d')||'',/M641,322/);
}
const d=new JSDOM(site).window.document;
for(const selector of ['#nav .brand-wordmark','footer .ft-col--brand .brand-wordmark',
 'footer .ingly-footer-signature img.brand-wordmark'])
 assert.equal(d.querySelectorAll(selector).length,1,'Single approved wordmark '+selector);
assert.match(css,/font-family:'Inter',Arial,system-ui,sans-serif!important/);
assert.match(css,/footer \.ingly-footer-signature img\.brand-wordmark[\s\S]*?aspect-ratio:1670\/630/);
assert.match(read('assets/css/admin-brand-system.css'),/aspect-ratio:1670\/630!important/);
assert.match(admin,/assets\/images\/ingly-wordmark-light\.svg/);
console.log('✔ Full INGLY: separate I, unchanged original vectors, consistent admin/footer, Lab typography');
