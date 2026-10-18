/* Leggibilità e aree di tocco: le correzioni misurate (contrasto WCAG AA in
   giorno e notte, bersagli ≥ 44 px su mobile) vivono in un foglio caricato per
   ultimo. Se qualcuno lo sposta o lo toglie, i testi tornano invisibili
   (1,00:1 sulle card con foto, 1,08:1 sul bottone xTOOL). */
import { readFileSync } from 'fs';
let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };
const idx = readFileSync('index.html', 'utf8');
/* le correzioni stanno nella sezione finale del foglio del marchio, che per
   regola del progetto è l'ultimo caricato */
const css = readFileSync('assets/css/brand-system-2026.css', 'utf8');
const fogli = [...idx.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"?]+)/g)].map(m => m[1]).filter(u => !/^https?:/.test(u));
check('il foglio del marchio (con le correzioni) è l\'ultimo caricato', fogli[fogli.length - 1] === 'assets/css/brand-system-2026.css', fogli.slice(-2).join(' , '));
check('contiene la sezione leggibilità', /INGLY — LEGGIBILITÀ \(WCAG 2\.2 AA\)/.test(css));
check('le card con foto hanno un fondo scuro sotto il testo bianco', /\.bcard\.bcard--photo/.test(css) && /\.scat\.scat--photo/.test(css) && /#111318!important/.test(css));
check('il bottone del pannello xTOOL ha un colore per ciascuna modalità', /data-mode="light"\] \.xtool-lab-feature \.btn-ghost/.test(css) && /data-mode="dark"\] \.xtool-lab-feature \.btn-ghost/.test(css));
check('aree di tocco di almeno 44 px su mobile', /min-height:44px!important/.test(css) && /min-width:44px!important/.test(css));
const txt = JSON.parse(readFileSync('data/texts.json', 'utf8'));
check('nessuna promessa di sconto sulla newsletter (il modulo non ha destinatario)', !/−10%|-10%/.test(txt.it.nlH2 + txt.en.nlH2));
console.log(`\n=========== LEGGIBILITÀ: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
