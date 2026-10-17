import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const dir='assets/images/';
const light=readFileSync(dir+'ingly-wordmark-light.svg','utf8');
const dark=readFileSync(dir+'ingly-wordmark-dark.svg','utf8');
const html=readFileSync('index.html','utf8');
const admin=readFileSync('admin.html','utf8');
const css=readFileSync('assets/css/brand-system-2026.css','utf8');
const acss=readFileSync('assets/css/admin-brand-system.css','utf8');
for (const [name,svg] of [['light',light],['dark',dark]]) {
 assert.match(svg,/<title[^>]*>INGLY/,'Brand name must be INGLY: '+name);
 assert.match(svg,/<path id="ingly-letter-i-stem"[^>]*d="M-179 81H-51V509L-179 375Z"/,'I stem from reference: '+name);
 assert.match(svg,/<path id="ingly-letter-i-foot"[^>]*d="M-179 418L-90 512H-179Z"/,'I lower triangle: '+name);
 assert.doesNotMatch(svg,/M1,205 1,506 117,507 118,327Z/,'Reject original truncated leading I');
 assert.match(svg,/viewBox="-200 60 1660 490"/,'Safe bounding box keeps leading I visible');
}
for (const [name,page] of [['store',html],['admin',admin]]) {
 assert.match(page,/assets\/images\/ingly-wordmark-light\.svg/,'Shared approved wordmark: '+name);
 assert.doesNotMatch(page,/ingly-wordmark-(?:light|dark)\.png/,'Avoid raster logo variants: '+name);
}
assert.match(css,/footer \.ingly-footer-signature img\.brand-wordmark\{opacity:\.18!important\}/,'Readable dark watermark');
assert.match(css,/footer \.ingly-footer-signature img\.brand-wordmark\{opacity:\.15!important\}/,'Readable light watermark');
assert.match(acss,/aspect-ratio:1660\/490!important/,'Admin uses same wordmark proportion');
console.log('✔ INGLY wordmark letter I geometry, shared storefront/Admin source and both theme watermarks');
