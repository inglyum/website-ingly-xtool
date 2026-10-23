/* REVISIONE IMPECCABLE — correzioni misurate nel browser.
   Emoji usate come icone (26 nella Home), etichette sopra i titoli che
   ripetevano il titolo, 150–175 px vuoti in cima alle pagine interne,
   riquadro «Invita un amico» finito SOPRA FAQ/Chi siamo/Preventivo,
   contrasti sotto 4,5:1, aree di tocco sotto 44 px. */
import { readFileSync } from 'fs';
let pass = 0, fail = 0;
const check = (n, c) => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n) } };
const prod = readFileSync('assets/js/products.js', 'utf8');
const css = readFileSync('assets/css/brand-system-2026.css', 'utf8');
const html = readFileSync('index.html', 'utf8');
const ref = readFileSync('assets/js/referral.js', 'utf8');
check('schede senza foto: icona disegnata della categoria, non emoji', /function artIcona\(x\)/.test(prod) && !/\$\{x\.icon\}/.test(prod) && !/cur\.icon \+/.test(prod));
check('percorso e categoria senza emoji', !/c\.ic\+' '\+c\.n\[L\]/.test(prod));
check('riga dati prodotto con icone SVG', !/<div>(⚡|📦|🇮🇹|🧱) /.test(html) && /meta-strip[\s\S]{0,400}ingly-icons\.svg#ic-truck/.test(html));
check('etichette sopra i titoli tolte nella Home (resta @ingly.design)', /#page-home \.eyebrow:not\(#shEyebrow\)\{display:none!important\}/.test(css));
check('niente spazio vuoto in cima a prodotto e pagine interne', /\.pp\{padding-top:28px!important\}/.test(css) && /\.phero\{padding-top:56px!important\}/.test(css));
check('«Invita un amico» solo nel piè di pagina', /querySelector\('footer \.ft-inner'\)\|\|document\.querySelector\('footer'\)/.test(ref) && !/#page-about'\)/.test(ref));
check('contrasti corretti (scheda attiva, privato/azienda)', /\.pp-tab\.active\{color:var\(--brand-ink\)!important/.test(css) && /\.qmode-b\.on\{background:var\(--brand-ink\)!important;color:var\(--brand-bg\)!important\}/.test(css));
check('aree di tocco ≥ 44 px', /\.pcard \.wish\{width:44px!important;height:44px!important\}/.test(css));
check('titoli prodotto lunghi più contenuti', /pp-title--lungo',String\(cur\.n\[L\]\|\|''\)\.length>48/.test(prod));
console.log(`\n=========== AUDIT IMPECCABLE: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
