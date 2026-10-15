import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url),'utf8');
const css = read('assets/css/atelier-foundation.css');
const html = read('index.html');
const dark = css.split(':root,\n:root[data-mode="dark"] {')[1]?.split('\n}')[0] || '';
const light = css.split(':root[data-mode="light"] {')[1]?.split('\n}')[0] || '';
const token = (block,name) => {
  const found = block.match(new RegExp('(?:^|\\n)\\s*'+name+':\\s*(#[0-9a-fA-F]{6})\\s*;'));
  assert.ok(found, 'Missing token ' + name);
  return found[1];
};
function luminance(color) {
  const srgb=[1,3,5].map(x=>parseInt(color.slice(x,x+2),16)/255);
  const lin=srgb.map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);
  return .2126*lin[0]+.7152*lin[1]+.0722*lin[2];
}
function contrast(a,b) {
  const [l1,l2]=[luminance(a),luminance(b)].sort((x,y)=>y-x);
  return (l1+.05)/(l2+.05);
}
for(const [mode,block] of [['dark',dark],['light',light]]){
  assert.ok(block,'Theme missing '+mode);
  assert.ok(contrast(token(block,'--at-text'),token(block,'--at-bg'))>=4.5,'Body text contrast failed '+mode);
  assert.ok(contrast(token(block,'--at-muted'),token(block,'--at-bg'))>=4.5,'Muted copy contrast failed '+mode);
  assert.ok(contrast(token(block,'--at-on-amber'),token(block,'--at-amber'))>=4.5,'CTA contrast failed '+mode);
}
assert.ok(html.includes('href="assets/css/atelier-foundation.css"'),'Shared CSS not loaded');
assert.ok(html.indexOf('href="assets/css/atelier-foundation.css"')>html.indexOf('href="assets/css/premium-2026.css"'),'Atelier stylesheet must be last');
assert.ok(html.includes('var m="dark"'),'Dark should be default without stored preference');
assert.ok(html.includes('saved==="light"||saved==="dark"'),'Respect existing saved theme');
assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'),'Reduced motion styles missing');
assert.ok(css.includes('--at-tech:#39d0ff') && css.includes('--at-amber:#ff7a2f'),'Atelier color palette must be available');
const navTexts=JSON.parse(read('data/texts.json'));
const fallback=read('data/i18n.js');
assert.equal(navTexts.it.navCreate,'Crea il tuo pezzo');
assert.equal(navTexts.en.navCreate,'Create your piece');
assert.ok(fallback.includes('navCreate'), 'i18n fallback must include CTA translation');
assert.ok(html.includes('class="atelier-nav-cta"'), 'Desktop creation CTA missing');
assert.ok(html.includes('class="atelier-mobile-dock"'), 'Mobile quick-action bar missing');
for(const target of ['href="shop" data-nav="shop"','href="personalizza" data-nav="personalizza"','data-action="open-cart"']){
  assert.ok(html.includes(target),'Functional dock destination missing: '+target);
}
assert.ok(css.includes('backdrop-filter:blur(22px)'), 'Translucent nav missing');
assert.ok(css.includes('prefers-reduced-motion:no-preference'), 'Hover motion must be opt-in');
assert.ok(css.includes('@supports not (backdrop-filter:blur(1px))'), 'Glass fallback missing');
console.log('Atelier Phase 1 + navigation polish: theme contrast, glass, CTA, mobile dock PASS');
