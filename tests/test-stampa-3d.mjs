/* Stampa 3D: la pagina /stampa-3d e il generatore Litofania (foto → STL).
   Richiesta del titolare (novembre 2026): «manca la parte stampa 3D».
   Il solido deve essere chiuso e orientato, altrimenti i programmi di
   stampa lo rifiutano o lo riparano a modo loro. */
import { readFileSync, existsSync } from 'node:fs';
import * as LT from '../assets/js/litofania.js';
import * as S3 from '../assets/js/stampa3d.js';
let ok = 0, ko = 0; const t = (n, c, x = '') => { c ? ok++ : ko++; console.log((c ? '  ✔ ' : '  ✘ ') + n + (c || !x ? '' : ' → ' + x)); };
const vicino = (a, b, e) => Math.abs(a - b) <= e;

console.log('\n=== LITOFANIA: DALLA FOTO AGLI SPESSORI ===');
const iw = 40, ih = 30, rgba = new Uint8ClampedArray(iw * ih * 4);
for (let i = 0; i < iw * ih; i++) { const v = Math.round((i % iw) / (iw - 1) * 255); rgba.set([v, v, v, 255], i * 4); }
const L = LT.luminanze(rgba, iw, ih);
t('luminanza 0…1 (nero → 0, bianco → 1)', vicino(L[0], 0, 0.01) && vicino(L[iw - 1], 1, 0.01));
const trasp = LT.luminanze(new Uint8ClampedArray([0, 0, 0, 0]), 1, 1);
t('pixel trasparente = bianco (pezzo sottile)', trasp[0] === 1);
const g = LT.spessori(L, iw, ih, { larghezza: 60, cornice: 0, risoluzione: 0.5 });
const sx = g.t[Math.round(g.ny / 2) * (g.nx + 1)], dx = g.t[Math.round(g.ny / 2) * (g.nx + 1) + g.nx];
t('scuro = spesso, chiaro = sottile (0,8 → 3,0 mm)', vicino(sx, 3.0, 0.05) && vicino(dx, 0.8, 0.05), sx + ' / ' + dx);
t('altezza dalla proporzione della foto (60 × 45)', g.W === 60 && vicino(g.H, 45, 0.01));
const gc = LT.spessori(L, iw, ih, { larghezza: 60, cornice: 3, risoluzione: 0.5 });
t('cornice piena allo spessore massimo', gc.t[0] === gc.p.massimo && gc.t[gc.t.length - 1] === gc.p.massimo);
const n = LT.normalizza({ larghezza: 9999, minimo: 0.1, massimo: 0.2, forma: '<script>', risoluzione: 'x' });
t('parametri fuori scala riportati nei limiti', n.larghezza === 200 && n.minimo === 0.6 && n.massimo >= n.minimo + 0.8 && n.forma === 'piano' && n.risoluzione === 0.3);
const grande = LT.spessori(L, iw, ih, { larghezza: 200, risoluzione: 0.2 });
t('file mai oltre il tetto: la griglia si allarga da sola', LT.stimaTriangoli(grande.nx, grande.ny) <= LT.MAX_TRIANGOLI && grande.passo > 0.2);

console.log('\n=== LITOFANIA: IL SOLIDO ===');
for (const forma of ['piano', 'curva']) {
  const gg = LT.spessori(L, iw, ih, { larghezza: 60, risoluzione: 0.6, forma });
  const s = LT.solido(gg);
  const spigoli = new Map();
  for (let k = 0; k < s.tri.length; k += 3) for (let e = 0; e < 3; e++) { const key = s.tri[k + e] + ',' + s.tri[k + (e + 1) % 3]; spigoli.set(key, (spigoli.get(key) || 0) + 1); }
  let aperti = 0; for (const [k, c] of spigoli) { const [a, b] = k.split(','); if (c !== 1 || spigoli.get(b + ',' + a) !== 1) aperti++; }
  t(`${forma}: solido chiuso, ogni spigolo condiviso in versi opposti`, aperti === 0, aperti + ' spigoli aperti');
  const vol = LT.volume(s);
  let media = 0; for (const x of gg.t) media += x; media /= gg.t.length;
  t(`${forma}: normali verso l'esterno (volume positivo e plausibile)`, vol > 0 && vicino(vol, media * gg.W * gg.H, media * gg.W * gg.H * 0.12), vol.toFixed(0));
  const buf = LT.stl(s), dv = new DataView(buf);
  t(`${forma}: STL binario valido (84 + 50 byte a triangolo)`, buf.byteLength === 84 + 50 * (s.tri.length / 3) && dv.getUint32(80, true) === s.tri.length / 3);
}
t('peso indicativo in PLA', LT.grammi(10000) === 12);
const piatto = LT.spessori(L, iw, ih, { minimo: 1.2, massimo: 2, cornice: 0 });
t('avvisi: poco contrasto e cornice assente', LT.controlli(piatto).map(a => a.codice).join() === 'piatto,cornice');
t('anteprime controluce e luce spenta della misura della griglia', LT.controluce(g).length === (g.nx + 1) * (g.ny + 1) * 4 && LT.rilievo(g).length === LT.controluce(g).length);

console.log('\n=== PAGINA LITOFANIA ===');
const lit = readFileSync('litofania.html', 'utf8'), litUi = readFileSync('assets/js/litofania-ui.js', 'utf8');
t('pagina e script presenti', /assets\/js\/litofania-ui\.js/.test(lit) && /import \* as LT from '\.\/litofania\.js'/.test(litUi));
t('colori del sito nei due temi, nessun testo a gradiente', /:root\[data-mode=light\]\{[^}]*--gold:#8a5a1e/.test(lit) && !/background-clip:text/.test(lit));
t('scelta del file nella lingua del sito', /id="photoName"/.test(lit) && /pick: 'Choose a photo'/.test(litUi));
t('italiano e inglese completi (stesse chiavi)', (() => { const m = litUi.match(/const T = \{([\s\S]*?)\n\};/); return m && (m[1].match(/^\s{4}\w+:/gm) || []).length > 40; })());
t('al preventivo con foto e anteprima (materiale stampa 3D)', /materiale: 'PLA\/PETG \(3D\)'/.test(litUi) && /quote\/\?da=litofania/.test(litUi));
const gen = readFileSync('generatori.html', 'utf8');
t('nel Generator Studio, categoria Stampa 3D', /id:'litofania',modulo:'link-interno'/.test(gen) && gen.includes("'litofania.html']") && gen.includes("'Stampa 3D':'3D printing'"));
t('nella sitemap', readFileSync('scripts/generate-sitemap.mjs', 'utf8').includes("file: 'litofania.html'") && readFileSync('sitemap.xml', 'utf8').includes('/litofania.html'));

console.log('\n=== PAGINA STAMPA 3D ===');
const D = S3.dati({});
t('contenuti in italiano e inglese', [D.titolo, D.intro, ...D.servizi.map(s => s.t), ...D.combinati.voci.map(v => v.d), ...D.faq.map(f => f.r)].every(v => v.it && v.en));
t('sei servizi, quattro combinazioni con laser e UV', D.servizi.length === 6 && D.combinati.voci.length === 4 && D.combinati.voci.some(v => /UV/.test(S3.lingua(v.tag))));
t('l\'Admin può sovrascrivere una sezione senza rompere le altre', S3.dati({ STAMPA3D: { faq: [{ d: { it: 'X' }, r: { it: 'Y' } }], servizi: 'rotto' } }).faq.length === 1 && S3.dati({ STAMPA3D: { servizi: 'rotto' } }).servizi.length === 6);
t('prodotti stampati 3D presi dal catalogo (solo visibili)', S3.prodotti3d([{ id: 1, mat: 'PLA' }, { id: 2, mat: 'Legno' }, { id: 3, mat: 'PLA/PETG', hidden: true }]).map(p => p.id).join() === '1');
t('niente personaggi o marchi senza licenza (domanda frequente)', D.faq.some(f => /licenz/.test(f.r.it)));
const html = readFileSync('index.html', 'utf8');
t('rotta, sezione e voce nel piè di pagina', readFileSync('assets/js/rotte.js', 'utf8').includes("id: 'stampa-3d'") && html.includes('id="page-stampa-3d"') && /href="stampa-3d" data-nav="stampa-3d">Stampa 3D</.test(html));
t('la tessera «Stampa 3D» della home porta alla nuova pagina', /<a class="maison-world" href="stampa-3d" data-nav="stampa-3d">\s*<img src="img\/material-pla\.webp"/.test(html));
t('nel menu Lab', /Stampa 3D su misura/.test(readFileSync('assets/js/nav-ia.js', 'utf8')) && /'stampa-3d'\]/.test(readFileSync('assets/js/nav-mega.js', 'utf8')));
t('main.js disegna la pagina', /S3DUI\.renderStampa3D\(L,p=>prod\.card\(p\)\)/.test(readFileSync('assets/js/main.js', 'utf8')));
t('pagina statica per Google con servizio e domande', existsSync('stampa-3d/index.html') && /"@type":"Service"/.test(readFileSync('stampa-3d/index.html', 'utf8').replace(/\s/g, '')) && /Cosa stampiamo/.test(readFileSync('stampa-3d/index.html', 'utf8')));
t('in sitemap e nel 404', readFileSync('sitemap.xml', 'utf8').includes('/stampa-3d') && /"stampa-3d"/.test(readFileSync('404.html', 'utf8')));
const css = readFileSync('assets/css/restyle-2026.css', 'utf8');
t('stile coerente: angoli vivi, oro nei titoli, movimento ridotto rispettato', /\.s3d-hero/.test(css) && /#page-stampa-3d :is\(h1,h2,\.h2\) \.hl\{color:var\(--rs-gold\)/.test(css) && /prefers-reduced-motion:no-preference\)\{\s*:root\[data-mode\]\[data-mode\] \.s3d-strato/.test(css));

console.log(`\n=========== STAMPA 3D: ${ok} passati, ${ko} falliti ===========`);
process.exit(ko ? 1 : 0);
