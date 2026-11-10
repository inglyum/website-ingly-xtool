/* xTool SQUAD: sul sito solo quello che xTool dice ufficialmente degli host
   (support.xtool.com/xtool-squad, letto il 2026-11-01). Niente «vendiamo
   ricambi», niente «Authorized Service Centre» nei testi.
   Aggiornato il 2026-11-10: logo ufficiale ricevuto da xTool. */
import { readFileSync, existsSync } from 'node:fs';
let ok = 0, ko = 0; const t = (n, c) => { c ? ok++ : ko++; console.log((c ? '  ✔ ' : '  ✘ ') + n); };
const ax = readFileSync('scripts/assistenza-xtool.mjs', 'utf8');
const pag = readFileSync('assistenza-xtool-palermo/index.html', 'utf8');
t('pagina assistenza: host xTool Squad con link alla pagina ufficiale', /host di <a href="https:\/\/support\.xtool\.com\/xtool-squad"/.test(pag));
t('servizi ufficiali degli host elencati', ['Demo prima dell\'acquisto', 'Test sui materiali', 'Formazione', 'Installazione e messa in servizio', 'Manutenzione e riparazione'].every(s => pag.includes(s)));
t('ricambi e garanzia rimandati ai canali ufficiali xTool', /Vendete i ricambi xTool\?/.test(ax) && pag.includes('https://support.xtool.com/all-services') && pag.includes('https://www.xtool.eu/'));
t('nessun servizio «ricambi» offerto da INGLY nei dati strutturati', !/Ricambi e sostituzione/.test(ax));
const testi = ['index.html', 'assets/js/main.js', 'assets/js/nav-ia.js', 'assets/js/lab-ui.js', 'assets/js/lab.js', 'data/config.json'].map(f => readFileSync(f, 'utf8')).join('\n');
/* 10 novembre 2026: il titolare ha ricevuto da xTool, via email, il logo
   «xTool Authorized Service Centre». Da qui la dicitura è ammessa, ma solo
   insieme al logo ufficiale (stesso file, non ridisegnato) e mai come testo libero. */
const loghi = (testi.match(/xtool-authorized-service-centre-ufficiale-320\.webp/g) || []).length;
const dicitura = (testi.replace(/<img[^>]*xtool-authorized-service-centre-ufficiale[^>]*>/g, '').replace(/aria-label="xTool Authorized Service Centre:[^"]*"/g, '').match(/Authorized Service Centre|Authorized<br>/g) || []).length;
t('«Authorized Service Centre» solo accanto al logo ufficiale xTool', dicitura === 0 && loghi >= 2 && existsSync('assets/images/xtool-authorized-service-centre-ufficiale.png'));
t('nessun «ricambi» offerto come servizio INGLY', !/riparazioni, ricambi|assistenza e ricambi|service and parts|Repairs, parts/i.test(testi));
const C = JSON.parse(readFileSync('data/content.json', 'utf8'));
t('FAQ del sito: centro ufficiale e ricambi/garanzia', C.FAQS.some(f => /centro ufficiale xTool/.test(f[0].it)) && C.FAQS.some(f => /ricambi/.test(f[0].it) && /support\.xtool\.com/.test(f[1].it)));
t('macchine: nessun prezzo, nessuna vendita (INGLY è host, non rivenditore)', !/Prezzi ufficiali xTool|Ordina questa|Ordinala con INGLY|riparazione e vendita|vendita, demo e assistenza/.test(testi + readFileSync('assets/js/prerender-sito.js', 'utf8') + readFileSync('assets/js/seo.js', 'utf8')) && /Non vendiamo macchine/.test(pag));
console.log(`\n=========== xTOOL SQUAD: ${ok} passati, ${ko} falliti ===========`);
process.exit(ko ? 1 : 0);
