/* Sprint 01 CSS ownership: semantic colors must win in both themes. */
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read=f=>readFileSync(f,'utf8');
const brand=read('assets/css/brand-system-2026.css');
const nav=read('assets/css/nav-ia.css');
const index=read('index.html');
assert.match(nav,/--ingly-surface:var\(--brand-surface/,'Legacy nav background must reference central palette');
assert.match(nav,/--ingly-gold:var\(--brand-gold/,'No detached gold palette');
assert.match(brand,/:root\[data-mode\] #nav \.ia-pannello\s*\{\s*background:var\(--brand-surface\)!important;/,
  'The mega-panel must outrank legacy high-specificity glass rules in both modes');
assert.match(brand,/:root\[data-mode\] #nav \.ia-pannello \.ia-lista a,/,
  'Menu link foreground needs theme-safe override');
assert.match(brand,/:root\[data-mode\] #nav \.ia-pannello \.ia-col-tit,/,
  'Subheading contrast needs semantic muted text');
assert.match(brand,/\.ia-pannello \.ia-evidenza\s*\{\s*background:var\(--brand-elevated\)!important;/,
  'Editorial column must follow theme');
const css=[...index.matchAll(/<link[^>]+rel="stylesheet" href="(assets\/css\/[^"]+)"/g)].map(x=>x[1]);
assert.equal(css.at(-1),'assets/css/brand-system-2026.css',
  'The approved brand stylesheet must be the last loaded theme authority');
const visual=read('tests/visual-audit.mjs');
assert.match(visual,/nav-open-.*mode.*\.png/,'Audit captures open menu both themes');
assert.match(visual,/mega-menu theme tokens mismatch/,'Audit checks computed foreground and background');
console.log('✔ Navigation CSS ownership and theme-specific open-menu browser checks.');
