/* DESCRIZIONI PRODOTTO (passata Humanizer). Prima: emoji come elenco puntato,
   tono pubblicitario, frasi non verificabili («il pezzo più amato dalle
   spose italiane»), la #14 in italiano descriveva un altro prodotto, la #93
   aveva l'inglese scritto in italiano, Spider-Man era «l'eroe arancione».
   E gli a capo venivano ignorati: tutto in un blocco. */
import { readFileSync } from 'fs';
let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };
const P = JSON.parse(readFileSync('data/products.json', 'utf8')).filter(p => !p.hidden);
const tutte = p => ((p.desc && p.desc.it) || '') + ' ' + ((p.desc && p.desc.en) || '');
check('nessuna emoji nelle descrizioni', P.every(p => !/\p{Extended_Pictographic}/u.test(tutte(p))), P.filter(p => /\p{Extended_Pictographic}/u.test(tutte(p))).map(p => p.id).join());
check('nessun trattino lungo usato come punteggiatura', P.every(p => !/ — /.test(tutte(p))));
check('nessuna frase non verificabile', P.every(p => !/più amat|più originale|il regalo perfetto|must-have|mai visto/i.test(tutte(p))));
const p14 = P.find(p => p.id === 14);
check('#14 descrive la targa in vetro, non un altro prodotto', /vetro temprato/.test(p14.desc.it) && !/Spotify/.test(p14.desc.it));
check('#93 ha l\'inglese in inglese', /framed print/.test(P.find(p => p.id === 93).desc.en));
check('Spider-Man non è «arancione»', !P.filter(p => /spider/i.test(p.n.it)).some(p => /arancion|orange hero/i.test(tutte(p))));
check('gli a capo diventano paragrafi', /#ppDesc\{white-space:pre-line/.test(readFileSync('assets/css/brand-system-2026.css', 'utf8')));
console.log(`\n=========== DESCRIZIONI: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
