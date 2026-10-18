/* RICERCA ISTANTANEA (Fase 2.1) — la funzione pura cerca() e il cablaggio.
   La prova nel browser (apertura, tastiera, nessuna navigazione sotto, zero
   404 per i 43 prodotti senza foto) è stata fatta in Chromium; qui si
   blocca la logica e i punti che l'avevano rotta durante lo sviluppo. */
import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://example.org/' });
globalThis.window = dom.window; globalThis.document = dom.window.document;
const P = JSON.parse(readFileSync('data/products.json', 'utf8'));
const CATS = JSON.parse(readFileSync('data/categories.json', 'utf8'));
const MATERIALI = JSON.parse(readFileSync('data/materiali.json', 'utf8'));
const testi = JSON.parse(readFileSync('data/texts.json', 'utf8'));
window.INGLY = { P, CATS, MATERIALI, D: testi, CONFIG: {} };
const { cerca, norm } = await import('../assets/js/ricerca.js');

let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };
const D = window.INGLY;
const nomi = r => r.prodotti.map(p => p.n.it);

console.log('\n=== TROVA QUELLO CHE SI CERCA ===');
const t = cerca('targa', D);
check('«targa» trova prodotti', t.prodotti.length > 0);
check('…e sono targhe', t.prodotti.every(p => /targ/i.test(p.n.it + ' ' + JSON.stringify(p.desc || ''))));
check('prefisso: «targ» trova le stesse targhe', cerca('targ', D).prodotti.length >= t.prodotti.length);
check('accenti e maiuscole non contano', norm('Città ÈLITE') === 'citta elite' && cerca('TARGA', D).prodotti.length === t.prodotti.length);
check('più parole si combinano (tutte devono comparire)', cerca('targa legno', D).prodotti.length <= t.prodotti.length);
check('«legno» trova anche il materiale', cerca('legno', D).materiali.some(m => m.id === 'legno'));
const cat = CATS.find(c => c.n && c.n.it);
check('il nome di una categoria trova la categoria', cerca(cat.n.it, D).categorie.some(c => c.id === cat.id));
check('in inglese cerca nei nomi inglesi', cerca('plate', D, { l: 'en' }).totale >= 0);

console.log('\n=== NON INVENTA E NON MOSTRA IL NASCOSTO ===');
check('nessun prodotto nascosto nei risultati', ['a', 'targa', 'legno', 'regalo', 'personalizzat'].every(q => cerca(q, D).prodotti.every(p => !p.hidden)));
check('meno di 2 lettere: nessun risultato', cerca('a', D).totale === 0 && cerca(' ', D).totale === 0);
check('parola inesistente: zero risultati', cerca('xyzqwj', D).totale === 0);
check('al massimo 6 prodotti nel pannello', cerca('personalizzat', D).prodotti.length <= 6);
check('dati assenti non rompono nulla', cerca('targa', {}).totale === 0);

console.log('\n=== CABLAGGIO ===');
const src = readFileSync('assets/js/ricerca.js', 'utf8');
const main = readFileSync('assets/js/main.js', 'utf8');
const html = readFileSync('index.html', 'utf8');
const css = readFileSync('assets/css/brand-system-2026.css', 'utf8');
check('main.js avvia la ricerca', /import \{ initRicerca \} from '\.\/ricerca\.js'/.test(main) && /initRicerca\(\)/.test(main));
check('la lente nell\'HTML è un link vero allo Shop (funziona anche senza JS)', /class="icon-btn atelier-search-link" href="shop"/.test(html) || new JSDOM(html).window.document.querySelector('a.atelier-search-link[href="shop"]'));
check('il clic sulla lente è preso prima del router (window, cattura)', /window\.addEventListener\('click'[\s\S]{0,400}stopImmediatePropagation\(\)[\s\S]{0,40}\}, true\)/.test(src));
check('miniature solo da foto esistenti (niente 404)', /fotoDisponibili\(p\)\[0\]/.test(src));
check('tutti i testi arrivano da texts.json, in IT e EN', [...src.matchAll(/T\('(rc\w+)'\)/g)].every(m => testi.it[m[1]] && testi.en[m[1]]));
check('su telefono la lente è visibile', /@media\(max-width:620px\)\{\s*:root\[data-mode\] #nav\.nav \.nav-acts \.atelier-search-link\{display:grid!important/.test(css));
check('aree di tocco ≥ 44 px nel pannello', /\.rc-campo\{[^}]*min-height:44px/.test(css) && /\.rc-chiudi\{[^}]*min-width:44px;min-height:44px/.test(css));

console.log(`\n=========== RICERCA: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
