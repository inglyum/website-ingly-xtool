/* SEO LOCALE: «assistenza xTool Palermo / Sicilia».
   Prima: nessuna pagina per chi cerca assistenza xTool, titoli generici
   («Macchine — INGLY DESIGN»), città e regione vuote nei dati SEO, «Cesena»
   in sei punti mentre la sede è Palermo. */
import { readFileSync, existsSync } from 'fs';
import { JSDOM } from 'jsdom';
let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };
const F = 'assistenza-xtool-palermo/index.html';
check('pagina «Centro assistenza xTool a Palermo» generata', existsSync(F));
const doc = new JSDOM(readFileSync(F, 'utf8')).window.document;
check('titolo e H1 con xTool, assistenza, Palermo, Sicilia', /assistenza xTool a Palermo e in Sicilia/i.test(doc.title) && /Palermo e in Sicilia/.test(doc.querySelector('h1').textContent));
const ld = JSON.parse(doc.querySelector('script[type="application/ld+json"]').textContent)['@graph'];
const lb = ld.find(g => [].concat(g['@type']).includes('LocalBusiness'));
check('dati per Google: attività locale a Palermo con zone servite', lb && lb.address.addressLocality === 'Palermo' && lb.areaServed.some(a => a.name === 'Sicilia'));
check('dati per Google: domande frequenti e percorso', ld.some(g => g['@type'] === 'FAQPage') && ld.some(g => g['@type'] === 'BreadcrumbList'));
check('link a ogni macchina del catalogo', doc.querySelectorAll('.ax-lista a[href^="macchine/"]').length >= 10);
check('nella sitemap', /assistenza-xtool-palermo/.test(readFileSync('sitemap.xml', 'utf8')));
check('generata dalla build e aggiornata', /assistenza-xtool\.mjs/.test(readFileSync('scripts/build.mjs', 'utf8')));
check('linkata dal piè di pagina e dalla pagina Macchine', /href="assistenza-xtool-palermo\/"/.test(readFileSync('index.html', 'utf8')) && /ingly-assistenza-banner/.test(readFileSync('assets/js/lab-ui.js', 'utf8')));
const cfg = JSON.parse(readFileSync('data/config.json', 'utf8'));
check('città e regione SEO compilate', cfg.seo.citta === 'Palermo' && cfg.seo.regione === 'Sicilia');
check('titoli macchine locali', /a Palermo: vendita, demo e assistenza/.test(readFileSync('macchine/index.html', 'utf8')) && /ricambi a Palermo/.test(readFileSync('macchine/p2/index.html', 'utf8')));
const tutto = ['index.html', 'data/content.json', 'data/corsi.json', 'data/products.json', 'assets/js/faq-engine.js', 'scripts/prerender.mjs'].map(f => readFileSync(f, 'utf8')).join(' ');
check('nessun «Cesena» rimasto: la sede è Palermo', !/Cesena/.test(tutto));
console.log(`\n=========== SEO LOCALE: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
