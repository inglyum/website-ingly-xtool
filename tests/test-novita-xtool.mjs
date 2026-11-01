/* NOVITÀ xTool: X1 e C1 nel catalogo, con dati ufficiali (immagini fornite
   dal titolare). INGLY è host xTool Squad, non rivenditore: niente prezzi,
   ordini o prenotazioni; si chiede un consiglio o una demo. */
import { readFileSync, existsSync } from 'fs';
import * as LAB from '../assets/js/lab.js';
let pass = 0, fail = 0;
const check = (n, c) => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n) } };
const M = JSON.parse(readFileSync('data/macchine.json', 'utf8'));
const D = { MACCHINE: M };
const x1 = LAB.modello(D, 'x1'), c1 = LAB.modello(D, 'c1');
check('X1 disponibile, C1 in pre-ordine', x1?.novita?.stato === 'disponibile' && c1?.novita?.stato === 'preordine');
check('X1: specifiche ufficiali (area 615×320, 6.000 mm/s, 299 cm)', JSON.stringify(x1.specificheUfficiali).includes('615 × 320 mm') && JSON.stringify(x1.specificheUfficiali).includes('6.000 mm/s') && JSON.stringify(x1.specificheUfficiali).includes('299 cm'));
check('nessun prezzo né ordine/prenotazione: INGLY non vende macchine', [x1, c1].every(m => !m.novita.configurazioni && !m.novita.notaPrezzi && !m.vendita && !m.shop) && !/Ordinala|Prenotala|Ordina questa|Prenota questa|prezzo di lancio/.test(readFileSync('assets/js/lab-ui.js', 'utf8')));
check('pagina di lancio: consiglio di INGLY, demo e pagina ufficiale xTool', /Chiedi un consiglio a INGLY/.test(readFileSync('assets/js/lab-ui.js', 'utf8')) && /L\\'acquisto si fa sullo shop ufficiale xTool/.test(readFileSync('assets/js/lab-ui.js', 'utf8')));
check('C1: si dice che non è un laser', /non è un laser/.test(c1.specificheUfficiali.note.it));
check('foto presenti', ['img/xtool-x1.webp', 'img/xtool-c1.webp'].every(existsSync));
check('foto della galleria usata dal sito', LAB.fotoMacchina(D, 'x1').foto === 'img/xtool-x1.webp');
check('pagine statiche generate', existsSync('macchine/x1/index.html') && existsSync('macchine/c1/index.html'));
const ui = readFileSync('assets/js/lab-ui.js', 'utf8');
check('sezione «Novità xTool» e riquadro prezzi', /function sezioneNovita\(d, L\)/.test(ui) && /\$\{bloccoNovita\(m, L, true\)\}/.test(ui));
check('Admin: novità modificabile, senza campi prezzo', /key:'novita\.stato'/.test(readFileSync('admin.html', 'utf8')) && !/key:'novita\.configurazioni'|key:'vendita\.configurazioni'|id="pxGo"/.test(readFileSync('admin.html', 'utf8')));
const vid = [...x1.novita.video, ...c1.novita.video];
check('video ufficiali: 4 della X1, 1 della C1, file e copertina presenti', x1.novita.video.length === 4 && c1.novita.video.length === 1 && vid.every(v => existsSync(v.src) && existsSync(v.poster)));
check('video leggeri (< 2 MB ciascuno) e caricati solo quando visibili', vid.every(v => readFileSync(v.src).length < 2e6) && /preload="none" data-auto-video/.test(ui) && /prefers-reduced-motion: reduce/.test(ui));
check('pagina di lancio dedicata alle macchine in pre-ordine', /function paginaLancio\(m, L\)/.test(ui) && /if \(m\.novita && m\.novita\.stato\) \{ pagina\.innerHTML = paginaLancio\(m, L\)/.test(ui));
check('numeri chiave per X1 e C1', x1.novita.numeri.length === 4 && c1.novita.numeri.length === 4);
check('specifiche: niente più «xTool M2» scritto fisso su ogni macchina', !/xTool M2 · Specifiche verificate/.test(ui));
console.log(`\n=========== NOVITÀ xTOOL: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
