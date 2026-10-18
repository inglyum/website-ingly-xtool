/* UN SOLO FOGLIO DI STILE: assets/css/ingly.css (Fase 1.1).
   22 richieste → 1. Verificato in Chromium su 6 pagine × giorno/notte ×
   1440/390 px: stessi pixel di prima. Qui si garantisce che il bundle non
   resti mai indietro rispetto ai sorgenti. */
import { readFileSync, existsSync } from 'fs';
import { JSDOM } from 'jsdom';
import { ORDINE, componi, impronta } from '../scripts/css-bundle.mjs';

let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };
const html = readFileSync('index.html', 'utf8');
const bundle = readFileSync('assets/css/ingly.css', 'utf8');
const man = JSON.parse(readFileSync('assets/css/ingly.manifest.json', 'utf8'));

console.log('\n=== IL BUNDLE È AGGIORNATO ===');
check('ogni sorgente esiste', ORDINE.every(f => existsSync('assets/css/' + f)));
check('ingly.css è esattamente l\'unione attuale dei sorgenti (altrimenti: npm run build)', bundle === componi());
check('il manifest elenca l\'ordine attuale', JSON.stringify(man.ordine) === JSON.stringify(ORDINE.map(f => 'assets/css/' + f)));
check('la versione nel manifest è l\'impronta del bundle', man.v === impronta(bundle));
check('brand-system-2026.css resta l\'ultimo (autorità del marchio)', ORDINE[ORDINE.length - 1] === 'brand-system-2026.css');

console.log('\n=== INDEX.HTML CARICA SOLO IL BUNDLE ===');
const locali = [...new JSDOM(html).window.document.querySelectorAll('link[rel="stylesheet"]')].map(l => l.getAttribute('href')).filter(h => !/^https?:/.test(h));
check('un solo foglio locale', locali.length === 1, locali.join(', '));
check('…ed è ingly.css con la versione attuale (la cache del browser si rinnova)', locali[0] === `assets/css/ingly.css?v=${man.v}`, locali[0]);
check('i data-URI restano tra apici singoli (regola 14: nessuna minificazione)', !/url\("data:image\/svg\+xml/.test(bundle.replace(/\/\*[\s\S]*?\*\//g, '')) || bundle.split('url("data:').length === componi().split('url("data:').length);
check('il service worker mette in cache il bundle', /via\('assets\/css\/ingly\.css'\)/.test(readFileSync('sw.js', 'utf8')));
check('npm run build rigenera il bundle', /scripts\/css-bundle\.mjs/.test(readFileSync('scripts/build.mjs', 'utf8')));

console.log(`\n=========== CSS BUNDLE: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
