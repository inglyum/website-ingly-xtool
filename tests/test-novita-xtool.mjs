/* NOVITÀ xTool IN PRE-ORDINE: X1 e C1 nel catalogo, con dati ufficiali e
   prezzi pubblicati da xTool (immagini fornite dal titolare). Niente dati
   inventati: per la C1 il prezzo europeo non è uscito e si dice così. */
import { readFileSync, existsSync } from 'fs';
import * as LAB from '../assets/js/lab.js';
let pass = 0, fail = 0;
const check = (n, c) => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n) } };
const M = JSON.parse(readFileSync('data/macchine.json', 'utf8'));
const D = { MACCHINE: M };
const x1 = LAB.modello(D, 'x1'), c1 = LAB.modello(D, 'c1');
check('X1 e C1 nel catalogo, in pre-ordine', x1?.novita?.stato === 'preordine' && c1?.novita?.stato === 'preordine');
check('X1: 5 configurazioni con prezzo di lancio e di listino', x1.novita.configurazioni.length === 5 && x1.novita.configurazioni.every(c => c.prezzo < c.listino));
check('X1: specifiche ufficiali (area 615×320, 6.000 mm/s, 299 cm)', JSON.stringify(x1.specificheUfficiali).includes('615 × 320 mm') && JSON.stringify(x1.specificheUfficiali).includes('6.000 mm/s') && JSON.stringify(x1.specificheUfficiali).includes('299 cm'));
check('C1: nessun prezzo in euro inventato', c1.novita.configurazioni.length === 0 && /non è ancora annunciato/.test(c1.novita.notaPrezzi.it));
check('C1: si dice che non è un laser', /non è un laser/.test(c1.specificheUfficiali.note.it));
check('foto presenti', ['img/xtool-x1.webp', 'img/xtool-c1.webp'].every(existsSync));
check('foto della galleria usata dal sito', LAB.fotoMacchina(D, 'x1').foto === 'img/xtool-x1.webp');
check('pagine statiche generate', existsSync('macchine/x1/index.html') && existsSync('macchine/c1/index.html'));
const ui = readFileSync('assets/js/lab-ui.js', 'utf8');
check('sezione «Novità xTool» e riquadro prezzi', /function sezioneNovita\(d, L\)/.test(ui) && /\$\{bloccoNovita\(m, L, true\)\}/.test(ui));
check('Admin: novità, configurazioni e prezzi modificabili', /key:'novita\.configurazioni'/.test(readFileSync('admin.html', 'utf8')));
const vid = [...x1.novita.video, ...c1.novita.video];
check('video ufficiali: 4 della X1, 1 della C1, file e copertina presenti', x1.novita.video.length === 4 && c1.novita.video.length === 1 && vid.every(v => existsSync(v.src) && existsSync(v.poster)));
check('video leggeri (< 2 MB ciascuno) e caricati solo quando visibili', vid.every(v => readFileSync(v.src).length < 2e6) && /preload="none" data-auto-video/.test(ui) && /prefers-reduced-motion: reduce/.test(ui));
console.log(`\n=========== NOVITÀ xTOOL: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
