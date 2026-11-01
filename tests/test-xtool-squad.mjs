/* xTool SQUAD: sul sito solo quello che xTool dice ufficialmente degli host
   (support.xtool.com/xtool-squad, letto il 2026-11-01). Niente «vendiamo
   ricambi», niente «Authorized Service Centre» nei testi. */
import { readFileSync } from 'node:fs';
let ok = 0, ko = 0; const t = (n, c) => { c ? ok++ : ko++; console.log((c ? '  ✔ ' : '  ✘ ') + n); };
const ax = readFileSync('scripts/assistenza-xtool.mjs', 'utf8');
const pag = readFileSync('assistenza-xtool-palermo/index.html', 'utf8');
t('pagina assistenza: host xTool Squad con link alla pagina ufficiale', /host di <a href="https:\/\/support\.xtool\.com\/xtool-squad"/.test(pag));
t('servizi ufficiali degli host elencati', ['Demo prima dell\'acquisto', 'Test sui materiali', 'Formazione', 'Installazione e messa in servizio', 'Manutenzione e riparazione'].every(s => pag.includes(s)));
t('ricambi e garanzia rimandati ai canali ufficiali xTool', /Vendete i ricambi xTool\?/.test(ax) && pag.includes('https://support.xtool.com/all-services') && pag.includes('https://www.xtool.eu/'));
t('nessun servizio «ricambi» offerto da INGLY nei dati strutturati', !/Ricambi e sostituzione/.test(ax));
const testi = ['index.html', 'assets/js/main.js', 'assets/js/nav-ia.js', 'assets/js/lab-ui.js', 'assets/js/lab.js', 'data/config.json'].map(f => readFileSync(f, 'utf8')).join('\n');
t('nessun «Authorized Service Centre» nei testi del sito', !/Authorized Service Centre|Authorized<br>/.test(testi));
t('nessun «ricambi» offerto come servizio INGLY', !/riparazioni, ricambi|assistenza e ricambi|service and parts|Repairs, parts/i.test(testi));
const C = JSON.parse(readFileSync('data/content.json', 'utf8'));
t('FAQ del sito: centro ufficiale e ricambi/garanzia', C.FAQS.some(f => /centro ufficiale xTool/.test(f[0].it)) && C.FAQS.some(f => /ricambi/.test(f[0].it) && /support\.xtool\.com/.test(f[1].it)));
console.log(`\n=========== xTOOL SQUAD: ${ok} passati, ${ko} falliti ===========`);
process.exit(ko ? 1 : 0);
