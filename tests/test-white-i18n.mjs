import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const main=readFileSync('assets/js/main.js','utf8');
const css=readFileSync('assets/css/ingly-responsive-theme.css','utf8');
const banner=readFileSync('assets/js/atelier-chrome.js','utf8');
assert.match(main,/localStorage\.setItem\('ingly_lang',next\)/);
assert.match(main,/localStorage\.getItem\('ingly_lang'\)/);
assert.match(main,/ingly:language-change/);
assert.match(main,/applyI18n\(\);renderAll\(\)/);
assert.match(banner,/addEventListener\('ingly:language-change', update\)/);
assert.match(css,/:root\[data-mode="light"\] body\{background:radial-gradient/);
assert.match(css,/--ux-bg:#fff/);
assert.ok(css.includes('--ux-header:rgba(255,255,255,.97)'));
console.log('✔ White-mode, IT/EN persistence and updates');

const html=readFileSync('index.html','utf8');
for(const k of ['materials','technologies','machines','theme','serviceIntro','serviceScope']) assert.ok(html.includes('data-inline-i18n="'+k+'"'),'Missing translated UI '+k);
assert.match(main,/function translateInline\(\)/);
assert.match(main,/translateInline\(\);/);
