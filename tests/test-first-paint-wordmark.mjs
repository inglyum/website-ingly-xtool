import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const html=readFileSync('index.html','utf8');
const main=readFileSync('assets/js/main.js','utf8');
const brand=readFileSync('assets/css/brand-system-2026.css','utf8');
const doc=new JSDOM(html).window.document;
assert.match(html,/document\.documentElement\.classList\.add\('ingly-boot-pending'\)/);
/* Fase 0: la Hero e il menu sono già giusti nell'HTML, quindi la Hero NON si
   nasconde più; restano nascoste solo le sezioni che dipendono dai dati. */
/* durante l'avvio si vede solo la sezione attiva (la Home sulla Home, lo
   Shop su /shop/…) e il testo per Google resta fuori vista: prima /shop/
   mostrava l'hero della Home e l'elenco grezzo, poi saltava */
assert.match(html,/html\.ingly-boot-pending #prerender\{position:absolute!important;[^}]*\}/);
assert.match(html,/html\.ingly-boot-pending main>\.page:not\(\.active\),html\.ingly-boot-pending #page-home>:not\(\.hero\),html\.ingly-boot-pending footer\{visibility:hidden!important\}/);
assert.doesNotMatch(html,/html\.ingly-boot-pending main,/,'La Hero non deve restare nascosta in attesa del JavaScript');
assert.match(main,/document\.documentElement\.classList\.remove\('ingly-boot-pending'\)/);
assert.ok(main.indexOf("show(currentPage())")<main.indexOf("classList.remove('ingly-boot-pending')"),'Reveal must follow first render');
const header=doc.querySelector('#nav img.brand-wordmark');
const footer=doc.querySelector('footer .ft-col--brand img.brand-wordmark');
const signature=doc.querySelector('footer .ingly-footer-signature img.brand-wordmark');
assert.ok(header&&footer&&signature,'Canonical wordmark slots missing');
const path=img=>new URL(img.getAttribute('src'),'https://example.org/').pathname;
assert.equal(path(header),path(footer));
assert.equal(path(header),path(signature));
assert.equal(signature.getAttribute('width'),'1597');
assert.equal(signature.getAttribute('height'),'602');
assert.match(brand,/footer \.ingly-footer-signature img\.brand-wordmark/);
console.log('✔ First paint gating and same canonical INGLY/N vector across header and footer');
