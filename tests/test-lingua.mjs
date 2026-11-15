/* Lingua completa: in inglese i testi fissi del sito passano in inglese,
   in italiano tornano gli originali. Richiesta del titolare (novembre 2026):
   «deve essere full language per la lingua selezionata». */
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
let ok = 0, ko = 0; const t = (n, c, x = '') => { c ? ok++ : ko++; console.log((c ? '  ✔ ' : '  ✘ ') + n + (c || !x ? '' : ' → ' + x)); };

const dom = new JSDOM('<!doctype html><html><head><title>INGLY DESIGN — Incisione laser a Palermo e centro assistenza xTool in Sicilia</title></head><body></body></html>', { url: 'https://example.test/' });
const w = dom.window;
for (const k of ['document', 'NodeFilter', 'MutationObserver']) globalThis[k] = w[k];
const L = await import('../assets/js/lingua-statica.js');
const norm = s => s.replace(/\s+/g, ' ').trim();

console.log('\n=== DIZIONARIO ===');
const voci = Object.entries(L.DIZIONARIO);
t('almeno 300 frasi tradotte', voci.length >= 300, String(voci.length));
t('nessuna traduzione vuota', voci.every(([k, v]) => norm(k) && norm(v)));
const chiavi = new Set(voci.map(([k]) => norm(k)));
const cicli = voci.filter(([k, v]) => norm(k) !== norm(v) && chiavi.has(norm(v)) && norm(L.DIZIONARIO[v] || '') !== norm(v));
t('nessuna traduzione che rimbalza su un\'altra voce', cicli.length === 0, cicli.map(c => c[0]).join(' | '));

console.log('\n=== TRADUZIONE DAL VIVO ===');
const d = w.document;
d.body.innerHTML = '<button aria-label="Carrello">Carrello</button><p translate="no">Carrello</p><input placeholder="Carrello">';
L.applica('en');
const [btn, fermo, inp] = [d.querySelector('button'), d.querySelector('p'), d.querySelector('input')];
t('testo tradotto in inglese', btn.textContent === 'Cart');
t('aria-label e placeholder tradotti', btn.getAttribute('aria-label') === 'Cart' && inp.placeholder === 'Cart');
t('titolo della scheda tradotto', d.title === 'INGLY DESIGN — Laser engraving in Palermo and xTool service centre in Sicily', d.title);
t('translate="no" rispettato', fermo.textContent === 'Carrello');
const nuovo = d.createElement('span'); nuovo.textContent = 'Carrello'; d.body.appendChild(nuovo);
await new Promise(r => setTimeout(r, 20));
t('anche i testi aggiunti dopo vengono tradotti', nuovo.textContent === 'Cart');
d.title = 'INGLY Academy — INGLY DESIGN';
await new Promise(r => setTimeout(r, 50));
t('un titolo uguale nelle due lingue non blocca la pagina', d.title === 'INGLY Academy — INGLY DESIGN');
L.applica('it');
t('tornando in italiano rimettiamo gli originali', btn.textContent === 'Carrello' && btn.getAttribute('aria-label') === 'Carrello' && nuovo.textContent === 'Carrello');

console.log('\n=== COLLEGAMENTI ===');
const main = readFileSync('assets/js/main.js', 'utf8');
t('main.js usa il traduttore in applyI18n e setLang', /import \* as LINGUA from '\.\/lingua-statica\.js'/.test(main) && (main.match(/LINGUA\.applica\(L\)/g) || []).length >= 2);
t('pulsante chiaro/scuro in due lingue', /Switch to dark mode/.test(main) && /Passa alla modalità scura/.test(main));
const cats = JSON.parse(readFileSync('data/categories.json', 'utf8'));
const lista = Array.isArray(cats) ? cats : cats.CATS || Object.values(cats).find(Array.isArray) || [];
t('testi alternativi delle categorie in inglese vero', lista.filter(c => c.altEN).every(c => !/ of [a-z-]+, not an INGLY/.test(c.altEN)));
const gen = readFileSync('generatori.html', 'utf8');
t('Studio: ricerca, zoom e titolo tradotti', ['searchAria:', 'zoomIn:', 'docTitle:', 'data-gi18n-title='].every(s => gen.includes(s)));
t('Studio: niente emoji come icone nei pulsanti', !/🔗|▦ Riempi/.test(gen));
t('Prova incisione e Print & Cut: titolo in inglese', /Try your engraved photo/.test(readFileSync('assets/js/prova-incisione.js', 'utf8')) && /SVG outline generator/.test(readFileSync('assets/js/print-cut-ui.js', 'utf8')));
t('icona carrello: nome italiano di base', /aria-label="Carrello" data-action="open-cart"/.test(readFileSync('index.html', 'utf8')));

w.close();
console.log(`\n=========== LINGUA: ${ok} passati, ${ko} falliti ===========`);
process.exit(ko ? 1 : 0);
