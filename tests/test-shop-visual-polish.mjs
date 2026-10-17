import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const css=readFileSync('assets/css/brand-system-2026.css','utf8');
const html=readFileSync('index.html','utf8');
assert.match(css,/:root\[data-mode\] #page-shop\s*\{/,'Shop visual surface scoped to the shop page');
assert.match(css,/--shop-halo/,'Theme-driven warm glow');
assert.match(css,/#page-shop > :is\(\.wrap,\.phero,\.shop-intro/,'Remove competing Shop section backgrounds');
assert.match(css,/prefers-reduced-motion:reduce/,'Respect reduced motion');
assert.match(css,/focus-visible/,'Keyboard focus stays visible');
assert.ok(html.indexOf('brand-system-2026.css')>html.indexOf('ingly-responsive-theme.css'),'Brand system remains last storefront CSS');
assert.match(html,/assets\/images\/ingly-wordmark-light\.svg/,'Keep existing vector wordmark, no generated replacement');

assert.match(css,/#page-shop \.shop-cats \.scat\{/,'Actual category component receives polish');
assert.match(css,/#page-shop \.shop-cats \.scat::after/,'Readable photo overlay');
assert.match(css,/#page-shop \.shop-cats \.scat:focus-visible/,'Category keyboard focus');
console.log('✔ Shop visual P0: scoped continuous background, glow, focus, reduced-motion, preserved logo master');
