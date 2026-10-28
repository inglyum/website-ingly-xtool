/* DESIGN SYSTEM 2026 — una sola scala (Fase 1.2).
   Misurato in Chromium su 12 pagine. Prima: H1 in 3 famiglie e 9 misure,
   H2 in 3 famiglie e 14 misure (alcuni H2 grandi come l'H1), schede con 4
   raggi, bottoni con 3. Dopo: H1 72 px e H2 52 px in Josefin Sans, schede
   16 px, bottoni 12 px; eccezione voluta la sezione xTool (Inter).
   Nessun elemento esce dallo schermo a 340/390/1440 px. */
import { readFileSync, existsSync } from 'fs';
import { JSDOM } from 'jsdom';

let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };
const css = readFileSync('assets/css/brand-system-2026.css', 'utf8');
const html = readFileSync('index.html', 'utf8');
const doc = new JSDOM(html).window.document;

console.log('\n=== I TOKEN ===');
for (const t of ['--ds-font-titoli', '--ds-h1', '--ds-h2', '--ds-h1-prodotto', '--ds-raggio-scheda', '--ds-raggio-bottone', '--ds-bottone-h'])
  check('token ' + t, new RegExp(t.replace(/-/g, '\\-') + ':').test(css));
check('i titoli usano il carattere del marchio', /:root\[data-mode\] \.page:not\(#page-macchine\) :is\(h1,h2\)[^{]*\{\s*font-family:var\(--ds-font-titoli\)!important/.test(css));
check('la sezione xTool tiene il suo carattere tecnico (esclusa)', /\.page:not\(#page-macchine\) :is\(h1,h2\):not\(:is\(\.ingly-photographic-lab,\.xtool-lab-feature/.test(css));
check('H1 e H2 hanno misure distinte (gerarchia)', /h1\{font-size:var\(--ds-h1\)!important\}/.test(css) && /\{font-size:var\(--ds-h2\)!important\}/.test(css));
check('schede: un raggio', /:is\(\.pcard,\.bcard,\.scat,\.vert-card,\.lab-card,\.rcard,\.dig-vuoto\)\{border-radius:var\(--ds-raggio-scheda\)!important\}/.test(css));
check('bottoni: un raggio e un carattere', /\.btn\{border-radius:var\(--ds-raggio-bottone\)!important;font-family:var\(--ds-font-titoli\)!important/.test(css));
check('bottone disabilitato riconoscibile', /\.btn:is\(:disabled,\[aria-disabled="true"\]\)\{opacity:\.45!important;cursor:not-allowed/.test(css));

console.log('\n=== SCHEDA PRODOTTO ===');
const nome = doc.getElementById('ppName');
check('il nome del prodotto è l\'H1 della scheda (prima era un H2)', nome && nome.tagName === 'H1');
const correlati = doc.querySelector('#page-product [data-i18n="relH2"]');
check('«Stanno bene insieme» è un H2 (prima era l\'H1 di ogni prodotto)', correlati && correlati.tagName === 'H2');
check('una sola H1 nella scheda prodotto', doc.querySelectorAll('#page-product h1').length === 1);
check('su telefono la colonna non si allarga oltre lo schermo', /#page-product \.pp-grid\{grid-template-columns:minmax\(0,1fr\)!important\}/.test(css));
check('le schede Descrizione/Misure/Recensioni scorrono invece di uscire', /#page-product \.pp-tabs\{overflow-x:auto!important/.test(css));

console.log('\n=== PAGINA INTERNA DEL DESIGN SYSTEM ===');
check('design-system.html esiste', existsSync('design-system.html'));
const ds = existsSync('design-system.html') ? readFileSync('design-system.html', 'utf8') : '';
const man = JSON.parse(readFileSync('assets/css/ingly.manifest.json', 'utf8'));
check('è esclusa dai motori di ricerca', /<meta name="robots" content="noindex, nofollow">/.test(ds));
check('usa lo stesso foglio del sito, versione attuale', ds.includes(`href="assets/css/ingly.min.css?v=${man.v}"`));
check('non è nella sitemap', !readFileSync('sitemap.xml', 'utf8').includes('design-system'));

console.log(`\n=========== DESIGN SYSTEM: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
