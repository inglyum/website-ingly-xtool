/* Fase 2 del catalogo: raccolte per occasione e per oggetto, con pagine vere
   (/collezioni/<nome>) per Google e ingressi visivi nello shop. */
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import * as CL from '../assets/js/collezioni.js';
import { applicaCatalogo } from '../assets/js/catalogo-stato.js';
let ok = 0, ko = 0; const t = (n, c, x = '') => { c ? ok++ : ko++; console.log((c ? '  ✔ ' : '  ✘ ') + n + (c || !x ? '' : ' → ' + x)); };
const leggi = f => JSON.parse(readFileSync(f, 'utf8'));

console.log('\n=== CRITERIO «PAROLE» ===');
t('trova la parola a inizio parola, in nome o descrizione', CL.haParole({ n: { it: 'Segnaposto Nozze' } }, ['nozze']) && CL.haParole({ n: { it: 'X' }, desc: { it: 'per il battesimo' } }, ['battesim']));
t('non trova pezzi di altre parole («anni» non è «pannello»)', !CL.haParole({ n: { it: 'Pannello decorativo' } }, ['anni']));
t('ignora maiuscole e accenti («papà» = «papa»)', CL.haParole({ n: { it: 'Regalo per il PAPÀ' } }, ['papa']));
t('si combina in AND con gli altri criteri', !CL.soddisfa({ cat: 'casa', n: { it: 'nozze' } }, { cat: ['eventi'], parole: ['nozze'] }));

console.log('\n=== RACCOLTE NEI DATI ===');
const COLL = leggi('data/collezioni.json');
const occ = COLL.collezioni.filter(c => c.gruppo === 'occasione');
const ogg = COLL.collezioni.filter(c => c.gruppo === 'oggetto');
t('almeno 8 occasioni e 6 tipi di oggetto', occ.length >= 8 && ogg.length >= 6, occ.length + '/' + ogg.length);
t('ogni raccolta ha un gruppo', COLL.collezioni.every(c => ['occasione', 'oggetto', 'per-chi', 'vetrina'].includes(c.gruppo)));
t('occasioni e oggetti: introduzione e testi per Google in italiano e inglese',
  [...occ, ...ogg].every(c => c.intro && c.intro.it && c.intro.en && c.seo && c.seo.titolo.it && c.seo.descrizione.it && c.seo.descrizione.it.length <= 170));
t('indirizzi puliti (minuscole, numeri, trattini)', COLL.collezioni.every(c => /^[a-z0-9-]+$/.test(CL.rifDi(c))));
t('nessun indirizzo ripetuto', new Set(COLL.collezioni.map(CL.rifDi)).size === COLL.collezioni.length);

console.log('\n=== PAGINE GENERATE ===');
const D = { CONFIG: leggi('data/config.json'), CATS: leggi('data/categories.json'), P: leggi('data/products.json'), MV: leggi('data/content.json').MV, COLLEZIONI: COLL };
applicaCatalogo(D);
const pubbl = CL.pubblicate(D);
const cartelle = existsSync('collezioni') ? readdirSync('collezioni') : [];
t('una pagina per ogni raccolta con prodotti', pubbl.every(c => existsSync(`collezioni/${CL.rifDi(c)}/index.html`)), pubbl.filter(c => !existsSync(`collezioni/${CL.rifDi(c)}/index.html`)).map(CL.rifDi).join());
t('nessuna pagina per raccolte vuote', cartelle.every(d => pubbl.some(c => CL.rifDi(c) === d)), cartelle.join());
const mat = existsSync('collezioni/matrimonio/index.html') ? readFileSync('collezioni/matrimonio/index.html', 'utf8') : '';
t('titolo per Google della raccolta', /<title>Matrimonio: segnaposto, bomboniere e cake topper incisi al laser \| INGLY DESIGN<\/title>/.test(mat));
t('canonico della pagina di raccolta', /rel="canonical" href="https:\/\/www\.inglydesign\.it\/collezioni\/matrimonio"/.test(mat));
t('un solo titolo principale, con il nome della raccolta', (mat.match(/<h1>/g) || []).length === 1 && /<h1>Matrimonio<\/h1>/.test(mat));
t('collega i prodotti e le altre occasioni', /\/product\/\d+\//.test(mat) && /\/collezioni\/nascita-battesimo"/.test(mat));
t('dati strutturati CollectionPage e percorso', /"@type":"CollectionPage"/.test(mat) && /"@type":"BreadcrumbList"/.test(mat));
t('la base dei link relativi risale di due livelli', /<base href="\.\.\/\.\.\/">/.test(mat));
const sitemap = readFileSync('sitemap.xml', 'utf8');
t('le raccolte sono nella sitemap', pubbl.every(c => sitemap.includes('/collezioni/' + CL.rifDi(c) + '</loc>')));
t('il catalogo statico collega le raccolte', /\/collezioni\/matrimonio"/.test(readFileSync('shop/index.html', 'utf8')));

console.log('\n=== SITO: ROTTE E GRAFICA ===');
const nav = readFileSync('assets/js/navigation.js', 'utf8');
const prod = readFileSync('assets/js/products.js', 'utf8');
const css = readFileSync('assets/css/restyle-2026.css', 'utf8');
t('/collezioni/<nome> apre lo Shop sulla raccolta', /if\(p==='collezioni'\) return 'shop';/.test(nav) && /page==='collezioni'&&seg\.length===2/.test(nav));
t('indietro/avanti rileggono la raccolta dall\'indirizzo', /readFiltersFromURL\(\); renderChips\(\); renderShop\(\);/.test(nav));
t('l\'indirizzo della sola raccolta è la sua pagina vera', /BASE\+'collezioni\/'\+CL\.rifDi\(cAtt\)\+'\/'/.test(prod));
t('ingressi «Scegli per occasione» e «Per tipo di oggetto»', /function renderOccasioni\(\)/.test(prod) && /id="shopOcc"/.test(readFileSync('index.html', 'utf8')));
t('ogni tessera usa una foto diversa', /usate\.has\(f\)/.test(prod));
t('la raccolta ha il suo titolo principale e la scheda del browser', /<div class="scb-txt"><h1>/.test(prod) && /document\.title=/.test(prod) && /coll-attiva .shop-testa\{display:none/.test(css));
t('seconda foto al passaggio senza animation sulle foto (regola 1)', /class="pimg-alt"/.test(prod) && !/img\.pimgph\s*\{[^}]*animation\s*:\s*none/.test(css));
t('la riga di luce rispetta «meno movimento»', /@media \(hover:hover\) and \(prefers-reduced-motion:no-preference\)\{\s*:root\[data-mode\]\[data-mode\] :is\(\.occ-foto/.test(css));
t('pagina prodotto: «Perfetto per» e garanzie', /function renderPerfettoPer\(\)/.test(prod) && /id="ppPerfetto"/.test(readFileSync('index.html', 'utf8')));
const tx = leggi('data/texts.json');
t('testi nuovi in italiano e inglese', ['occH', 'oggH', 'collQuote', 'collTutto', 'ppPerfH', 'ppTrust1', 'ppTrust2', 'ppTrust3'].every(k => tx.it[k] && tx.en[k]));

console.log(`\n=========== RACCOLTE: ${ok} passati, ${ko} falliti ===========`);
process.exit(ko ? 1 : 0);
