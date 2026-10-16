import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const read=p=>readFileSync(p,'utf8');
const storefront=read('index.html'),admin=read('admin.html');
const foundation=read('assets/css/foundation-components.css');
const storeCSS=read('assets/css/brand-system-2026.css');
const adminCSS=read('assets/css/admin-brand-system.css');
const nav=read('assets/js/nav-mega.js'),products=read('assets/js/products.js');
const tests=read('tests/sprint-01-journeys.mjs');
const before=read('tests/sprint-01-compare.mjs');
assert.ok(existsSync('scripts/audit-foundation-css.mjs'),'CSS inventory scanner');
for(const [name,html,last] of [['storefront',storefront,'brand-system-2026.css'],['admin',admin,'admin-brand-system.css']]){
 const shared=html.indexOf('assets/css/foundation-components.css');
 const final=html.indexOf('assets/css/'+last);
 assert.ok(shared>0&&final>shared,'Component layer before final theme layer: '+name);
}
for(const component of ['site-header','primary-cta','site-footer','site-dialog']){
 assert.ok(storefront.includes('data-component="'+component+'"'),'Missing semantic component '+component);
}
for(const component of ['admin-sidebar','admin-topbar','admin-dialog']){
 assert.ok(admin.includes('data-component="'+component+'"'),'Missing Admin component '+component);
}
assert.match(products,/data-component="product-card"/);
for(const token of ['--ui-bg','--ui-fg','--ui-muted','--ui-accent','--ui-touch']){
 assert.ok(foundation.includes(token),'Missing theme component token '+token);
}
assert.ok(foundation.includes('prefers-reduced-motion'),'Respect motion preference');
assert.match(storeCSS,/#nav\.nav\[data-component="site-header"\]/);
assert.match(storeCSS,/\.ia-pannello\{[\s\S]*?background:var\(--brand-surface\)!important/,'Use shared dark/light surface for mega-panel');
assert.match(storeCSS,/@media\(max-width:1100px\)/);
assert.match(adminCSS,/\[data-component="admin-topbar"\]/);
assert.ok(!nav.includes("nav.classList.add('atelier-nav-hidden')"),'No scroll-based hidden header');
assert.ok(nav.includes("if (!pan.classList.contains('aperto')) pan.hidden = true"),'Fast panel switching does not hide opened content');
for(const [name,route] of [['store','shop-product-cart'],['creator','customize-quote'],['lab','lab-demo'],['admin','admin-media-products']]){
 assert.ok(tests.includes("'"+route+"'"),'Missing browser journey '+name);
}
assert.ok(before.includes("after-pr")&&before.includes("before-main"),'Comparison includes baseline and PR');
console.log('✔ Sprint 01: component contracts, theme layers, persistent navbar and four journeys');
