/* Generator Studio «pro»: kerf, DXF, copie sul piano, quote, avvisi, link,
   annulla/ripeti. Richiesta del titolare (novembre 2026): generatori
   professionali come i migliori in giro. Tutto scritto da zero. */
import { readFileSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';
let ok = 0, ko = 0; const t = (n, c, x = '') => { c ? ok++ : ko++; console.log((c ? '  ✔ ' : '  ✘ ') + n + (c || !x ? '' : ' → ' + x)); };
const proSrc = readFileSync('assets/js/generatori-pro.js', 'utf8');
const nuoviSrc = readFileSync('assets/js/generatori-nuovi.js', 'utf8');
new Function(proSrc).call(globalThis); new Function(nuoviSrc).call(globalThis);
const P = globalThis.INGLY_GEN_PRO, N = globalThis.INGLY_GEN_NUOVI.motori;
const vicino = (a, b, e = 0.02) => Math.abs(a - b) <= e;

console.log('\n=== LETTURA DELLE FORME ===');
const rect = P.polilinee('<rect x="10" y="20" width="100" height="50"/>');
t('rettangolo → contorno chiuso di 4 punti', rect.length === 1 && rect[0].closed && rect[0].pts.length === 4);
const tondo = P.riquadro(P.polilinee('<rect x="0" y="0" width="40" height="20" rx="5"/>'));
t('angoli arrotondati: stessa misura esterna', vicino(tondo.w, 40) && vicino(tondo.h, 20));
const cerchio = P.riquadro(P.polilinee('<circle cx="50" cy="50" r="10"/>'));
t('cerchio: diametro giusto', vicino(cerchio.w, 20, 0.05) && vicino(cerchio.h, 20, 0.05));
const arco = P.riquadro(P.polilinee('<path d="M 0 10 A 10 10 0 0 1 20 10 L 20 30 L 0 30 Z"/>'));
t('percorso con arco SVG: misure giuste', vicino(arco.w, 20, 0.05) && vicino(arco.y, 0, 0.05) && vicino(arco.h, 30, 0.05));
const rel = P.riquadro(P.polilinee('<path d="m 5 5 h 10 v 10 h -10 z"/>'));
t('comandi relativi (m h v z)', vicino(rel.x, 5) && vicino(rel.w, 10) && vicino(rel.h, 10));
const curva = P.polilinee('<path d="M 0 0 C 10 0 20 10 20 20 S 30 40 40 40 Q 50 40 50 50 T 60 60"/>');
t('curve C S Q T in segmenti, senza NaN', curva.length === 1 && curva[0].pts.length > 20 && !JSON.stringify(curva).includes('null'));
t('i motori INGLY si leggono tutti', Object.keys(N).every(id => P.polilinee(N[id].disegna({ ...N[id].stato }).cut).length > 0));

console.log('\n=== KERF ===');
const k = P.riquadro(P.kerf(P.polilinee('<rect x="0" y="0" width="100" height="50"/>'), 0.2));
t('contorno esterno cresce di kerf/2 per lato (100×50 → 100,2×50,2)', vicino(k.w, 100.2, 0.001) && vicino(k.h, 50.2, 0.001));
const foro = P.kerf(P.polilinee('<rect x="0" y="0" width="60" height="60"/><circle cx="30" cy="30" r="5"/>'), 0.2);
const fb = P.riquadro([foro[1]]);
t('il foro dentro il pezzo cala di kerf/2 (Ø10 → Ø9,8)', foro[1].foro === true && vicino(fb.w, 9.8, 0.05));
const aperte = P.kerf(P.polilinee('<path d="M 0 0 L 50 0"/>'), 0.2);
t('le linee aperte (tagli interni) non si spostano', aperte[0].pts[1][0] === 50 && aperte[0].pts[0][1] === 0);
t('kerf 0 = nessuna modifica', vicino(P.riquadro(P.kerf(rect, 0)).w, 100));

console.log('\n=== COPIE SUL PIANO ===');
const rr = P.ripeti({ cut: '<circle cx="5" cy="5" r="5"/>', engrave: '', text: '' }, 10, 10, { colonne: 3, righe: 2, spazio: 2 });
t('3 × 2 copie: misure e numero', rr.copie === 6 && rr.w === 34 && rr.h === 22 && (rr.corpo.cut.match(/<g transform/g) || []).length === 6);
const rf = P.riempi(100, 50, { w: 615, h: 320 }, 3);
t('«Riempi il piano» calcola quante ne entrano (X1: 6 × 6)', rf.colonne === 6 && rf.righe === 6);
t('copie lette anche per il DXF, già spostate', P.riquadro(P.polilineeConCopie(rr.corpo.cut)).w > 33.9);

console.log('\n=== DXF ===');
const d = P.dxf([{ nome: 'CUT', colore: 1, linee: rect }, { nome: 'ENGRAVE', colore: 5, linee: [] }], 100);
t('DXF R12 completo (intestazione, livelli, entità, fine)', /AC1009/.test(d) && /\r\nLAYER\r\n/.test(d) && /\r\nCUT\r\n/.test(d) && /\r\nENGRAVE\r\n/.test(d) && /POLYLINE/.test(d) && d.trim().endsWith('EOF'));
t('asse Y del DXF verso l\'alto (y = altezza − y SVG)', /VERTEX\r\n  ?8\r\nCUT\r\n10\r\n10\r\n20\r\n80\r\n/.test(d.replace(/\r\n\s+/g, '\r\n')) || d.includes('20\r\n80'));

console.log('\n=== CONTROLLI ===');
const av = P.controlli({ w: 700, h: 100, cut: '<circle cx="1" cy="1" r="0.3"/>', engrave: '<text font-size="1.5">x</text>', piano: P.PIANI.find(p => p.id === 'x1'), kerf: 0.7 });
const cod = av.map(a => a.codice);
t('avvisa se il progetto non entra nel piano', cod.includes('piano'));
t('avvisa per dettagli sotto 1 mm, testo sotto 2 mm, kerf anomalo', cod.includes('dettagli') && cod.includes('testo-piccolo') && cod.includes('kerf'));
t('ricorda di convertire il testo in tracciati', cod.includes('testo-tracciati'));
t('nessun avviso per un progetto pulito', P.controlli({ w: 100, h: 50, cut: '<rect x="0" y="0" width="100" height="50"/>', piano: P.PIANI[0] }).length === 0);
t('piani: solo aree dichiarate da xTool riportate nel sito', P.PIANI.every(p => p.w > 0 && p.h > 0 && /^xTool /.test(p.nome)) && P.PIANI.some(p => p.id === 'p3' && p.w === 914 && p.h === 457));

console.log('\n=== LINK ===');
const code = P.codifica({ g: 'puzzle', s: { w: 200, testo: 'Città è' }, p: { kerf: 0.1 } });
const back = P.decodifica(code);
t('il link riporta generatore, parametri e produzione (anche accenti)', back && back.g === 'puzzle' && back.s.testo === 'Città è' && back.p.kerf === 0.1);
t('un link manomesso non entra (chiavi strane, valori enormi, oggetti)', P.decodifica(P.codifica({ g: '../x', s: {} })) === null && Object.keys(P.decodifica(P.codifica({ g: 'a', s: { ok: 1, 'x y': 2, big: 'x'.repeat(500), o: { a: 1 } } })).s).join() === 'ok');
t('testo non valido = nessun progetto', P.decodifica('%%%') === null);

console.log('\n=== STUDIO ===');
const html = readFileSync('generatori.html', 'utf8');
t('script caricato prima dello Studio', html.indexOf('generatori-pro.js') > 0 && html.indexOf('generatori-pro.js') < html.indexOf('const G_TRANSLATIONS'));
t('pannello Produzione, DXF, annulla/ripeti, link, quote, piano', ['id="proBox"', 'id="p_kerf"', 'id="p_piano"', 'id="p_riempi"', 'id="dxf"', 'id="undo"', 'id="redo"', 'id="shareLink"', 'id="togMisure"', 'id="togPiano"', 'id="proAvvisi"'].every(s => html.includes(s)));
const content = JSON.parse(readFileSync('data/content.json', 'utf8'));
const vc = new VirtualConsole(); const errori = []; vc.on('jsdomError', e => errori.push(String(e)));
const dom = new JSDOM(html, { url: 'https://inglyum.github.io/website-ingly-xtool/generatori.html', runScripts: 'outside-only', virtualConsole: vc });
const w = dom.window; w.fetch = async () => ({ ok: true, json: async () => content });
w.eval(nuoviSrc); w.eval(proSrc);
for (const s of [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x => x[1])) w.eval(s);
await new Promise(r => setTimeout(r, 80));
const doc = w.document, $ = id => doc.getElementById(id);
doc.querySelector('[data-tool="sottobicchiere"]').click();
const svgBase = $('canvas').innerHTML;
t('anteprima con quote (non esportate)', /class="pro-ov"/.test(svgBase) && / mm<\/text>/.test(svgBase));
$('p_kerf').value = '0.2'; $('p_kerf').dispatchEvent(new w.Event('input'));
t('kerf applicato ai tagli dell\'anteprima', /INGLY_CUT[^>]*>.*<path d="M /.test($('canvas').innerHTML));
$('p_piano').value = 'x1'; $('p_piano').dispatchEvent(new w.Event('input'));
$('p_riempi').click();
t('«Riempi il piano» moltiplica le copie', Number($('statCopie').textContent) > 1);
$('p_piano').value = 'f2'; $('p_piano').dispatchEvent(new w.Event('input'));
t('avviso se non entra nel piano scelto', /non entra nel piano/.test($('proAvvisi').textContent));
$('p_colonne').value = '1'; $('p_righe').value = '1'; $('p_colonne').dispatchEvent(new w.Event('input'));
const d0 = $('f_d').value; $('f_d').value = '120'; $('f_d').dispatchEvent(new w.Event('input'));
await new Promise(r => setTimeout(r, 400));
$('undo').click();
t('Annulla riporta il valore precedente', $('f_d').value === d0, d0 + ' → ' + $('f_d').value);
$('redo').click();
t('Ripeti lo rimette', $('f_d').value === '120');
$('zoomIn').click();
t('zoom dell\'anteprima', $('zoomVal').textContent === '125%');
t('nessun errore nella pagina', errori.length === 0, errori.join(' | '));
w.close();

console.log(`\n=========== GENERATORI PRO: ${ok} passati, ${ko} falliti ===========`);
process.exit(ko ? 1 : 0);
