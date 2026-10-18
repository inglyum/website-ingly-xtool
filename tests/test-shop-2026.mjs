/* SHOP RICOSTRUITO (lancio).
   Prima del primo prodotto c'erano 9 grandi riquadri categoria, una seconda
   riga di collezioni che li ripeteva, un blocco promozionale e solo dopo il
   catalogo, con la ricerca nascosta nella colonna laterale: primo prodotto
   a 1.820 px su computer e 2.925 su telefono. La tendina dei suggerimenti
   ripeteva la griglia senza foto e copriva i filtri.
   Verificato in Chromium (1440 giorno/notte, 390): primo prodotto a ~626 /
   ~614 px; Tutte 63 → Casa 10 → +«legno» 10 → tolta Casa 44 → Azzera 63;
   tendina con foto e prezzo; nessuno scorrimento orizzontale. */
import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';

let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };
const html = readFileSync('index.html', 'utf8');
const doc = new JSDOM(html).window.document;
const shop = doc.getElementById('page-shop');
const prod = readFileSync('assets/js/products.js', 'utf8');
const main = readFileSync('assets/js/main.js', 'utf8');
const css = readFileSync('assets/css/brand-system-2026.css', 'utf8');

console.log('\n=== ORDINE DELLA PAGINA ===');
const ordine = [...shop.children].map(e => e.className.split(' ').find(c => c.startsWith('shop-') || c === 'ingly-commerce-spots') || (e.querySelector('.shop-layout') ? 'catalogo' : e.className));
const pos = k => ordine.indexOf(k);
check('titolo → barra → categorie → catalogo → percorsi promozionali', pos('shop-testa') < pos('shop-barra') && pos('shop-barra') < pos('shop-intro') && pos('shop-intro') < pos('catalogo') && pos('catalogo') < pos('ingly-commerce-spots'), ordine.join(' > '));
check('la ricerca è nella barra in alto, non nella colonna laterale', !!shop.querySelector('.shop-barra .shop-cerca #q') && !shop.querySelector('.filters #q'));
check('i suggerimenti restano legati al campo (accessibilità)', !!shop.querySelector('#q[aria-controls="sugg"]') && !!shop.querySelector('#sugg[role="listbox"]'));
check('un solo selettore di ordinamento visibile', shop.querySelectorAll('select#sortSel').length === 1);
check('categorie in una sola riga (nav), non più riquadri grandi', shop.querySelector('#shopCats')?.tagName === 'NAV' && !/class="scat\$\{/.test(prod));
check('la categoria non è più ripetuta nella colonna filtri', shop.querySelector('.fgroup--cat')?.hasAttribute('hidden'));
check('le collezioni stanno sopra i prodotti, piccole', !!shop.querySelector('.shop-layout #shopColls'));
check('c\'è il posto per i filtri attivi', !!shop.querySelector('#shopAttivi'));

console.log('\n=== COMPORTAMENTO ===');
check('pastiglia «Tutte» + una per categoria con prodotti', /data-action="cat-sola" data-v=""/.test(prod) && /catCount\(c\.id\)>0/.test(prod));
check('una categoria alla volta dalla riga, senza cambiare pagina', /export function soloCat\(id\)\{F\.cat\.clear\(\);F\.sub\.clear\(\);if\(id\)F\.cat\.add\(id\);renderChips\(\);renderShop\(\)\}/.test(prod));
check('ogni filtro attivo si toglie con la sua ✕', /export function togliFiltro\(k,v\)/.test(prod) && /'rm-filtro':el=>prod\.togliFiltro/.test(main));
check('le azioni sono collegate', /'cat-sola':el=>prod\.soloCat\(el\.dataset\.v\)/.test(main));
check('miniature delle categorie solo da foto esistenti (regola 2: varianti vere)', /esisteFoto\(c\.img\)/.test(prod) && /variantsOf\(src\)\.includes\(400\)/.test(prod));

console.log('\n=== SUGGERIMENTI ===');
check('usano il motore della ricerca istantanea (foto e prezzo)', /import \{ initRicerca, cerca, miniatura \} from '\.\/ricerca\.js'/.test(main) && /cerca\(testo,window\.INGLY/.test(main));
check('al massimo 4 prodotti: la griglia sotto è già filtrata', /\{l:L,max:4\}/.test(main));
check('«Vedi tutti i N risultati» chiude e porta alla griglia', /data-tutti="1"/.test(main) && /shopGrid'\)\?\.scrollIntoView/.test(main));
check('un tocco fuori la chiude prima che il clic arrivi sotto', /addEventListener\('pointerdown',e=>\{ if\(!box\.hidden&&!e\.target\.closest\('\.shop-cerca'\)\) close\(\); \},true\)/.test(main));

console.log('\n=== TELEFONO ===');
check('categorie, collezioni e sottocategorie scorrono su una riga', /\.shop-cats\{flex-wrap:nowrap!important;overflow-x:auto/.test(css) && /\.shop-colls\{flex-wrap:nowrap;overflow-x:auto/.test(css) && /#fSub\{flex-wrap:nowrap;overflow-x:auto/.test(css));
check('pulsante Filtri nella barra, accanto all\'ordinamento', /\.shop-barra \.fbar-btn\{display:inline-flex!important/.test(css));
check('sottocategorie vuote nascoste', /\.subwrap \.chip\.chip--zero\{display:none!important\}/.test(css));

console.log(`\n=========== SHOP: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
