/* LAB MODIFICABILE DALL'ADMIN: foto delle macchine xTool, materiali e aree
   Academy; aggiungere e togliere macchine.
   Prima: la galleria caricata nell'editor delle macchine era ignorata dal
   sito (contava solo il manifest con licenza); «Archivia» non toglieva nulla
   (il sito filtrava solo le bozze); le aree Academy erano scritte nel
   codice. Verificato in Chromium: foto admin su /macchine/ e /macchine/p3/,
   F2 archiviata sparita anche dal riquadro fisso. */
import { readFileSync } from 'fs';
import * as LAB from '../assets/js/lab.js';
let pass = 0, fail = 0;
const check = (n, c) => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n) } };
const MAC = JSON.parse(readFileSync('data/macchine.json', 'utf8'));
const COR = JSON.parse(readFileSync('data/corsi.json', 'utf8'));
const D = { MACCHINE: JSON.parse(JSON.stringify(MAC)), IMMAGINI_MACCHINE: JSON.parse(readFileSync('data/immagini-macchine.json', 'utf8')), CORSI: COR };
const p3 = D.MACCHINE.catalogo.find(m => m.id === 'p3');
p3.galleria = [{ src: 'img/mia-p3.webp', alt: { it: 'La nostra P3', en: 'Our P3' } }];
const f = LAB.fotoMacchina(D, 'p3');
check('la foto caricata dall\'Admin vince sul manifest', f.foto === 'img/mia-p3.webp' && f.alt.it === 'La nostra P3' && f.tipoAsset === 'admin');
check('percorsi strani ignorati', LAB.fotoGalleria({ galleria: [{ src: 'javascript:x' }, { src: '../x.webp' }] }) === null);
D.MACCHINE.catalogo.find(m => m.id === 'f2').stato = 'archiviato';
D.MACCHINE.macchine.find(m => m.id === 'f2').stato = 'archiviato';
check('macchina archiviata tolta dal catalogo', !LAB.catalogo(D).some(m => m.id === 'f2'));
check('…e dall\'elenco «in officina»', !LAB.macchine(D).some(m => m.id === 'f2'));
check('corsi archiviati non mostrati', LAB.corsi({ CORSI: { corsi: [{ id: 'a', stato: 'archiviato' }, { id: 'b' }] } }).map(c => c.id).join() === 'b');
check('aree Academy nei dati (6, modificabili)', Array.isArray(COR.aree) && COR.aree.length === 6 && COR.aree.every(a => a.n && a.n.it && a.img));
const ui = readFileSync('assets/js/lab-ui.js', 'utf8');
check('il sito legge le aree dai dati', /d\.CORSI\.aree/.test(ui));
check('foto dei materiali anche dalla galleria', /const file = String\(m\.img \|\| \(g && g\.src\) \|\| ''\)/.test(ui));
check('riquadro fisso: le archiviate spariscono', /nascondiArchiviate\(d\);/.test(ui));
const admin = readFileSync('admin.html', 'utf8');
check('Admin: schede chiare per foto/aggiungi/rimuovi', admin.includes('📸 Macchine xTool: foto, aggiungi, rimuovi') && admin.includes('📸 Materiali: foto, aggiungi, rimuovi') && admin.includes('data-labtab="aree"'));
check('Admin: editor delle aree Academy', /function labAree\(B\)/.test(admin) && /if\(LABTAB==='aree'\)return labAree\(B\);/.test(admin));
check('Admin: testi del metodo «TU + INGLY»', admin.includes('data-b="CONFIG.heroMetodo.passi.2.testo.en"'));
check('nessuna nota interna «[DA CONFERMARE]» visibile ai clienti', !readFileSync('index.html', 'utf8').includes('[DA CONFERMARE]'));
console.log(`\n=========== LAB MODIFICABILE: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
