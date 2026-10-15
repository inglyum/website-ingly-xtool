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
 assert.match(svg,/M1,147 118,147 118,507 1,507Z/,'Initial I ascender and full-height glyph: '+name);
 assert.doesNotMatch(svg,/M1,205 1,506 117,507 118,327Z/,'Reject original truncated leading I');
 assert.match(svg,/viewBox="-20 125 1470 420"/,'Safe bounding box keeps leading I visible');
}
for (const [name,page] of [['store',html],['admin',admin]]) {
 assert.match(page,/assets\/images\/ingly-wordmark-light\.svg/,'Shared approved wordmark: '+name);
 assert.doesNotMatch(page,/ingly-wordmark-(?:light|dark)\.png/,'Avoid raster logo variants: '+name);
}
assert.match(css,/footer \.ingly-footer-signature img\.brand-wordmark\{opacity:\.18!important\}/,'Readable dark watermark');
assert.match(css,/footer \.ingly-footer-signature img\.brand-wordmark\{opacity:\.15!important\}/,'Readable light watermark');
assert.match(acss,/aspect-ratio:1470\/420!important/,'Admin uses same wordmark proportion');
console.log('✔ INGLY wordmark letter I geometry, shared storefront/Admin source and both theme watermarks');
