import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const lab = readFileSync('assets/js/lab-ui.js','utf8');
const html = readFileSync('index.html','utf8');
const css = readFileSync('assets/css/pages.css','utf8');
const sw = readFileSync('sw.js','utf8');
const cfg = JSON.parse(readFileSync('data/config.json','utf8'));
const corsi = JSON.parse(readFileSync('data/corsi.json','utf8'));
assert.match(lab,/function ctaDemo\(dm, L\)/);
assert.match(lab,/demoCfg\.bookingUrl/);
assert.match(lab,/Request a tailored learning path/);
assert.match(lab,/Aree formative su richiesta/);
assert.match(html,/id="page-macchine"/);
assert.match(html,/xtool-lab-feature/);
assert.match(html,/assets\/images\/xtool-lab-default\.svg/);
assert.match(html,/https:\/\/support\.xtool\.com\/demo-room\/host-instruction\?id=2528&amp;name=Giuseppe%20Inglima/);
/* palette del brief enterprise 2026 (sostituisce petrolio/champagne):
   sta in tokens.css, l'unica fonte. */
const tokens = readFileSync('assets/css/tokens.css','utf8');
assert.match(tokens,/--c-titanium:#111318;/);
assert.match(tokens,/--c-champagne:#C5A46D;/);
assert.match(tokens,/--brand-petrol-950:var\(--c-titanium\);/, 'i nomi petrolio restano definiti, ma sul Titanium');
assert.match(tokens,/--brand-champagne:var\(--accent\);/);
assert.match(css,/\.xtool-lab-feature/);
assert.match(css,/\.academy-topic-card/);
assert.match(css,/\.coin,\.hero-visual \.coin,\.coin img,\.brand img,\.loader \.lin>img,\.logo-big img\{\s*animation:none!important/);
/* la versione della cache deve salire a ogni rilascio visivo: si verifica
   che HTML e service worker coincidano e non tornino indietro, non un
   numero fisso (che bloccherebbe il rilascio successivo) */
const verSw = +(sw.match(/const CACHE_VER\s*=\s*'ingly-v(\d+)'/)||[])[1];
const verHtml = +(html.match(/CACHE_WANT='ingly-v(\d+)'/)||[])[1];
assert.ok(verSw >= 14, 'cache non tornata indietro');
assert.equal(verSw, verHtml, 'HTML e service worker chiedono la stessa versione');
assert.ok(cfg.demo.bookingUrl.includes('id=2528'));
assert.equal(corsi.corsi.length,0,'Do not fabricate published courses');
console.log('INGLY brand/xTool Lab/Academy regression: PASS');
