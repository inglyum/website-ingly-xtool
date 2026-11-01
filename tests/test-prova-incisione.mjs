/* PROVA LA TUA FOTO INCISA: motore dell'anteprima, pagina, collegamento al
   preventivo. La foto resta sul dispositivo finché il cliente non sceglie di
   chiedere il preventivo. */
import { readFileSync, existsSync } from 'node:fs';
import { MATERIALI, FORME, luminanza, incidi, puntina, dentro, misure } from '../assets/js/prova-incisione-motore.js';
let ok = 0, ko = 0; const t = (n, c) => { c ? ok++ : ko++; console.log((c ? '  ✔ ' : '  ✘ ') + n); };

/* foto finta 40×20: metà sinistra nera, metà destra bianca */
const w = 40, h = 20, rgba = new Uint8ClampedArray(w * h * 4);
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const p = (y * w + x) * 4, v = x < w / 2 ? 0 : 255; rgba[p] = rgba[p + 1] = rgba[p + 2] = v; rgba[p + 3] = 255; }
const lum = luminanza(rgba, w, h);
t('luminanza: nero 0, bianco 1', lum[0] === 0 && Math.abs(lum[w - 1] - 1) < 1e-6);
const scuro = (px, x, y) => { const p = (y * w + x) * 4; return (px[p] + px[p + 1] + px[p + 2]) / 3; };
const legno = incidi({ lum, w, h, materiale: 'legno', retino: false });
t('legno: le zone scure della foto diventano bruciature scure', scuro(legno, 5, 10) < scuro(legno, 35, 10) - 80);
const vetro = incidi({ lum, w, h, materiale: 'vetro', retino: false });
t('vetro: segno chiaro sulle zone chiare della foto', scuro(vetro, 35, 10) > scuro(vetro, 5, 10) + 80);
const pt = puntina(new Float32Array(w * h).fill(0.5), w, h, 1);
const media = pt.reduce((a, b) => a + b, 0) / pt.length;
t('puntinatura: solo puntini pieni o vuoti, densità conservata', pt.every(v => v === 0 || v === 1) && Math.abs(media - 0.5) < 0.05);
const cerchio = incidi({ lum, w: 20, h: 20, materiale: 'legno', forma: 'cerchio', retino: false });
t('cerchio: angoli trasparenti, centro pieno', cerchio[3] === 0 && cerchio[(10 * 20 + 10) * 4 + 3] === 255);
t('angoli arrotondati: l\'angolo esce, il centro no', !dentro('arrotondato', 0, 0, 100, 60) && dentro('arrotondato', 50, 30, 100, 60));
t('misure in cm dal lato lungo', JSON.stringify(misure(900, 600, 15)) === JSON.stringify({ larghezza: 15, altezza: 10 }));
const cat = JSON.parse(readFileSync('data/materiali.json', 'utf8')).materiali.map(m => m.id);
const daCatalogo = { legno: 'legno', bambu: 'bamboo', mdf: 'mdf', pelle: 'pelle', metallo: 'metallo', vetro: 'vetro', plexiglass: 'plexiglass' };
t('solo materiali del catalogo INGLY', Object.keys(MATERIALI).every(k => cat.includes(daCatalogo[k])));
const opzioni = (readFileSync('index.html', 'utf8').match(/<select[^>]*name="materiale"[\s\S]*?<\/select>/) || [''])[0];
t('ogni materiale corrisponde a un\'opzione del modulo preventivo', Object.values(MATERIALI).every(m => opzioni.includes('>' + m.preventivo + '<')));
t('forme: rettangolo, angoli arrotondati, cerchio', FORME.join() === 'rettangolo,arrotondato,cerchio');

const page = readFileSync('prova-incisione.html', 'utf8'), ui = readFileSync('assets/js/prova-incisione.js', 'utf8');
t('pagina con foto, materiali, forme, preventivo e download', ['id="photo"', 'id="mats"', 'id="shapes"', 'id="toQuote"', 'id="download"'].every(s => page.includes(s)));
t('nessun invio della foto a servizi esterni dalla pagina', !/fetch\(|XMLHttpRequest|sendBeacon/.test(ui));
t('anteprima dichiarata indicativa', /Anteprima indicativa/.test(page));
const forms = readFileSync('assets/js/forms.js', 'utf8');
t('preventivo: foto e anteprima allegate da sole', /export function allegaProvaIncisione/.test(forms) && /new DataTransfer\(\)/.test(forms) && /allegaProvaIncisione\(q\)/.test(forms));
t('link dal modulo preventivo e dal catalogo generatori', /href="prova-incisione\.html"/.test(readFileSync('index.html', 'utf8')) && /PAGINE_INTERNE=\['print-cut\.html','prova-incisione\.html'\]/.test(readFileSync('generatori.html', 'utf8')));
t('nella sitemap', readFileSync('scripts/generate-sitemap.mjs', 'utf8').includes("file: 'prova-incisione.html'") && existsSync('prova-incisione.html'));
console.log(`\n=========== PROVA INCISIONE: ${ok} passati, ${ko} falliti ===========`);
process.exit(ko ? 1 : 0);
