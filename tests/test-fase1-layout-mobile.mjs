/* FASE 1 — tre difetti di impaginazione visibili a tutti, misurati in
   Chromium e corretti. Questo test impedisce che tornino.

   1. Header spostato due volte: atelier-chrome.js gli dava un «top» pari
      all'altezza della barra avvisi (pensato per un header fixed), ma
      l'header sta nel flusso. Risultato: fascia vuota sopra e, su mobile,
      header disegnato sopra il titolo della Hero.
   2. Bottoni della Hero alti 155 px su mobile: colonna + flex-basis:155px.
   3. Barra in basso su mobile con 5 azioni in 4 colonne: «Carrello» a capo,
      barra alta 124 px sopra i contenuti. */
import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';

let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };

const html = readFileSync('index.html', 'utf8');
const doc = new JSDOM(html).window.document;
const chrome = readFileSync('assets/js/atelier-chrome.js', 'utf8');
const css = readFileSync('assets/css/brand-system-2026.css', 'utf8');

console.log('\n=== HEADER AL SUO POSTO ===');
const nav = doc.getElementById('nav');
check('l\'header non ha uno spostamento scritto a mano nell\'HTML', nav && !/top\s*:/.test(nav.getAttribute('style') || ''), nav && nav.getAttribute('style'));
check('il JavaScript sposta l\'header solo se è davvero fixed', /getComputedStyle\(nav\)\.position\s*===\s*'fixed'/.test(chrome));
check('l\'header resta in alto mentre si scorre (sticky, top 0)', /:root\[data-mode\] #nav\.nav\{position:sticky!important;top:0!important\}/.test(css));

console.log('\n=== BOTTONI DELLA HERO SU MOBILE ===');
const blocco = (css.match(/@media\(max-width:590px\)\{\s*:root\[data-mode\] #page-home \.signature-hero \.hero-ctas\{[^}]*\}\s*:root\[data-mode\] #page-home \.signature-hero \.hero-ctas \.btn\{[^}]*\}\s*\}/) || [''])[0];
check('in colonna i bottoni non hanno una «base» che diventa altezza', /flex:0 0 auto!important/.test(blocco));
check('i bottoni sono a tutta larghezza con area di tocco ≥ 48 px', /width:100%!important/.test(blocco) && /min-height:48px!important/.test(blocco));

console.log('\n=== BARRA IN BASSO SU MOBILE ===');
const azioni = doc.querySelectorAll('.atelier-mobile-dock > a, .atelier-mobile-dock > button').length;
const colonne = (css.match(/\.atelier-mobile-dock\{grid-template-columns:repeat\((\d+),minmax\(0,1fr\)\)!important/) || [])[1];
check('una colonna per ogni azione della barra', Number(colonne) === azioni, `${colonne} colonne per ${azioni} azioni`);
check('tutte le etichette della barra hanno lo stesso stile', /\.atelier-mobile-dock>\* span\{font-size:11px!important/.test(css));

console.log(`\n=========== FASE 1 LAYOUT: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
