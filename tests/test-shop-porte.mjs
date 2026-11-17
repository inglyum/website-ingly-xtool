/* Shop a tre porte (novembre 2026): oggetti personalizzati, file digitali,
   materiali; privato o azienda. Richiesta del titolare: «lo shop diviso deve
   esserci, professionale, immersivo e versatile», con «prezzo su richiesta». */
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
let ok = 0, ko = 0; const t = (n, c, x = '') => { c ? ok++ : ko++; console.log((c ? '  ✔ ' : '  ✘ ') + n + (c || !x ? '' : ' → ' + x)); };
const leggi = p => readFileSync(p, 'utf8');
const json = p => JSON.parse(leggi(p));

console.log('\n=== PAGINA ===');
const html = leggi('index.html');
t('titolo «Lo Shop» tradotto', /data-i18n="shopH2">Lo <span class="hl on">Shop\.<\/span>/.test(html) && json('data/texts.json').en.shopH2.includes('The'));
t('porte, banda aziende e tre pannelli', ['id="shopPorte"', 'id="shopAzienda"', 'data-porta-pannello="oggetti"', 'data-porta-pannello="file"', 'data-porta-pannello="materiali"'].every(x => html.includes(x)));
t('il catalogo di sempre resta dentro la porta Oggetti', html.indexOf('data-porta-pannello="oggetti"') < html.indexOf('id="shopGrid"') && html.indexOf('id="shopGrid"') < html.indexOf('data-porta-pannello="file"'));

console.log('\n=== IL MODULO NEL BROWSER ===');
const dom = new JSDOM(`<!doctype html><html lang="it"><body><section id="page-shop"><p id="shopSotto"></p><div id="shopPorte"></div><div id="shopAzienda" hidden></div>
  <div data-porta-pannello="oggetti"></div><div id="shopPannelloFile" data-porta-pannello="file" hidden></div><div id="shopPannelloMateriali" data-porta-pannello="materiali" hidden></div></section></body></html>`,
  { url: 'https://www.inglydesign.it/shop?porta=materiali&per=azienda' });
const w = dom.window;
Object.assign(globalThis, { window: w, document: w.document, location: w.location, history: w.history, localStorage: w.localStorage, URLSearchParams: w.URLSearchParams });
const content = json('data/content.json');
w.INGLY = { CONFIG: json('data/config.json'), FORNITURE: content.FORNITURE, DIGITALE: json('data/digitale.json'), VERTICALI: content.VERTICALI, MAT_ART: content.MAT_ART || {} };
const SP = await import('../assets/js/shop-porte.js');
SP.leggiStato();
SP.renderTutto('it');
const d = w.document;
t('l’indirizzo sceglie la porta (?porta=materiali)', SP.portaAttiva() === 'materiali' && d.documentElement.dataset.shopPorta === 'materiali');
t('?per=azienda apre in modalità Azienda e la ricorda', SP.modoAzienda() && w.localStorage.getItem('ingly_shop_modo') === 'azienda');
t('tre porte con foto, quella attiva segnata', d.querySelectorAll('.sp-porta').length === 3 && d.querySelectorAll('.sp-porta img').length === 3 && d.querySelector('.sp-porta.on[aria-current="page"]')?.dataset.arg === 'materiali');
t('le porte passano dalla delega centrale (niente navigazione doppia)', [...d.querySelectorAll('.sp-porta')].every(a => a.dataset.action === 'shop-porta' && a.hasAttribute('data-no-spa')));
t('interruttore Privato / Azienda', d.querySelectorAll('.sp-chi [data-action="shop-modo"]').length === 2 && d.querySelector('.sp-chi [aria-pressed="true"]').dataset.arg === 'azienda');
t('si vede solo il pannello della porta scelta', d.getElementById('shopPannelloMateriali').hidden === false && d.getElementById('shopPannelloFile').hidden === true && d.querySelector('[data-porta-pannello="oggetti"]').hidden === true);
t('banda aziende con preventivo e settori', !d.getElementById('shopAzienda').hidden && /tipo=azienda/.test(d.getElementById('shopAzienda').innerHTML) && d.querySelectorAll('.sp-az__settori a').length === content.VERTICALI.filter(v => v.attivo !== false).length);
const mat = d.getElementById('shopPannelloMateriali');
const attivi = content.FORNITURE.articoli.filter(a => a.stato === 'attivo' && a.cat !== 'macchina');
t('materiali dai dati dell’Admin, senza gli accessori xTool', mat.querySelectorAll('.sp-mat__voce').length === attivi.length && !/Piano a nido/.test(mat.textContent));
t('prezzo su richiesta, nessuna cifra', /Prezzo su richiesta/.test(mat.textContent) && !/€\s?\d|\d,\d\d\s?€/.test(mat.textContent));
t('in modalità Azienda si chiede un’offerta per quantità su WhatsApp', /offerta per quantit/.test(mat.textContent) && [...mat.querySelectorAll('a.btn')].every(a => a.href.startsWith('https://wa.me/') && /per%20la%20mia%20azienda/.test(a.href)));
t('niente link di affiliazione nei materiali', !/amazon\./i.test(mat.innerHTML));
t('accessori originali: shop ufficiale xTool', /xtool\.eu/.test(mat.innerHTML));
SP.filtraMateriali('fogli');
t('filtro per tipo di materiale', mat.querySelectorAll('.sp-mat__voce').length === attivi.filter(a => a.cat === 'fogli').length && /mcat=fogli/.test(w.location.search));
SP.scegliPorta('file', () => SP.renderTutto('it'));
const file = d.getElementById('shopPannelloFile');
t('porta File: strumenti gratuiti veri', ['generatori.html', 'prova-incisione.html', 'litofania.html', 'print-cut.html'].every(u => file.innerHTML.includes(u)));
t('porta File: le categorie dei file su richiesta', file.querySelectorAll('.sp-fcat__voce').length === json('data/digitale.json').categorie.length);
t('porta File: i bundle in bozza non compaiono', !/Bundle 50 File SVG/.test(file.textContent));
t('in modalità Azienda è evidenziata la licenza commerciale', file.querySelector('.sp-lic__voce.on')?.textContent.includes('commerciale'));
t('cambiare porta lascia una voce nella cronologia', /porta=file/.test(w.location.search));
SP.scegliModo('privato', () => SP.renderTutto('en'));
t('in inglese', /Personalised objects/.test(d.getElementById('shopPorte').textContent) && /Build your file for free/.test(d.getElementById('shopSotto').textContent));
t('Privato: banda aziende nascosta', d.getElementById('shopAzienda').hidden === true);

console.log('\n=== CATALOGO, MENU, STILE ===');
const prod = leggi('assets/js/products.js');
t('schede in modalità Azienda: quantità, logo e fattura su richiesta', /SP\.modoAzienda\(\)\?`<span class="pcard-az">/.test(prod));
t('la porta resta nell’indirizzo dei filtri', /q\.push\(\.\.\.SP\.parametriIndirizzo\(\)\)/.test(prod));
const main = leggi('assets/js/main.js');
t('azioni nella delega di main.js', ["'shop-porta'", "'shop-modo'", "'shop-mat-cat'"].every(x => main.includes(x)));
const IA = await import('../assets/js/nav-ia.js');
const pan = IA.pannello('shop', { CATS: json('data/categories.json'), FORNITURE: content.FORNITURE, VERTICALI: content.VERTICALI }, { L: 'it' });
t('menu Shop: oggetti, occasioni, file, materiali, aziende', pan.colonne.map(c => c.titolo).join('|') === 'Oggetti personalizzati|Per occasione|File digitali|Materiali|Per le aziende');
const css = leggi('assets/css/restyle-2026.css');
t('porte con foto e stato attivo in oro, rispetto del movimento ridotto', /\.sp-porta\.on\{outline:2px solid var\(--rs-gold\)\}/.test(css) && /prefers-reduced-motion:reduce\)\{:root\[data-mode\]\[data-mode\] \.sp-porta:hover img\{transform:none\}/.test(css));
t('nessuna animazione sulle foto prodotto (regola 1)', !/\.sp-[\w-]+[^{]*img\.(pimgph|gimg|bimg)/.test(css));
console.log(`\n=========== SHOP A TRE PORTE: ${ok} passati, ${ko} falliti ===========`);
process.exit(ko ? 1 : 0);
