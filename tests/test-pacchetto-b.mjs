/* Pacchetto B (impaginazione): niente etichette sopra i titoli, niente
   numerazioni decorative, un solo corsivo di marca, materiali con foto vere. */
import { readFileSync } from 'node:fs';
const css = readFileSync('assets/css/brand-system-2026.css', 'utf8');
const js = readFileSync('assets/js/main.js', 'utf8');
let ok = 0, ko = 0; const t = (n, c) => { c ? ok++ : ko++; console.log((c ? '  ✔ ' : '  ✘ ') + n); };
t('etichette sopra i titoli nascoste in tutto il sito (tranne categoria prodotto e @ingly.design)', css.includes(':not(#ppCat):not(#shEyebrow){display:none!important}'));
t('numerazioni decorative nascoste', /ingly-hero-steps li > span:first-child,\.ingly-commerce-spot__number,\.lab-n/.test(css));
t('corsivo serif solo nel titolo della Home', css.includes(':root[data-mode] .page:not(#page-home) :is(h1,h2,h3) :is(.hl,em)'));
t('materiali di «Chi siamo» con la foto del Lab', js.includes('MAT_LAB_ID') && js.includes('sw2--foto'));
t('scheda materiale collegata alla sua pagina', /\/materiali\/\$\{escHtml\(lm\.id\)\}/.test(js));
t('gerarchia dei vantaggi: titolo 15 px, descrizione 13,5 px', css.includes('.signature-benefit__words strong{font-size:15px'));
console.log(`\n=========== PACCHETTO B: ${ok} passati, ${ko} falliti ===========`);
process.exit(ko ? 1 : 0);
