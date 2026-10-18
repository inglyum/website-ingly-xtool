import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import { FOGLI, caricato, posizione, ultimo, bundleCaricato } from './_fogli-css.mjs';
const read=p=>readFileSync(p,'utf8');
const storefront=read('index.html'),admin=read('admin.html');
const foundation=read('assets/css/foundation-components.css');
const storeCSS=read('assets/css/brand-system-2026.css');
const adminCSS=read('assets/css/admin-brand-system.css');
const nav=read('assets/js/nav-mega.js'),products=read('assets/js/products.js');
const tests=read('tests/sprint-01-journeys.mjs');
const before=read('tests/sprint-01-compare.mjs');
assert.ok(existsSync('scripts/audit-foundation-css.mjs'),'CSS inventory scanner');
/* vetrina: ordine reale dei sorgenti dentro assets/css/ingly.css */
assert.ok(caricato('foundation-components.css')&&posizione('brand-system-2026.css')>posizione('foundation-components.css'),'Component layer before final theme layer: storefront');
{
 const shared=admin.indexOf('assets/css/foundation-components.css');
 const final=admin.indexOf('assets/css/admin-brand-system.css');
 assert.ok(shared>0&&final>shared,'Component layer before final theme layer: admin');
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
assert.match(storeCSS,/:root\[data-mode\] #nav \.ia-pannello/,'Keep verified theme-owner selector from #66');
assert.match(storeCSS,/#nav \.ia-pannello\s*\{\s*background:var\(--brand-surface\)!important/,'Verified opaque mega-menu surface in both modes');
assert.match(storeCSS,/@media\(max-width:1100px\)/);
assert.match(foundation,/\[data-component="admin-topbar"\]/,'Foundation owns shared topbar contract');
assert.match(adminCSS,/--ab-/,'Admin brand palette remains authoritative');
assert.ok(nav.includes("cancelPanelClose(pan)"),'Preserve fast-reopen fix in #67');
assert.ok(nav.includes("pendingPanelClose.set(pan"),'Avoid stale menu close timer');
for(const [name,route] of [['store','shop-product-cart'],['creator','customize-quote'],['lab','lab-demo'],['admin','admin-media-products']]){
 assert.ok(tests.includes("'"+route+"'"),'Missing browser journey '+name);
}
assert.ok(before.includes("after-pr")&&before.includes("before-main"),'Comparison includes baseline and PR');
console.log('✔ Sprint 01: component contracts, theme layers, persistent navbar and four journeys');
