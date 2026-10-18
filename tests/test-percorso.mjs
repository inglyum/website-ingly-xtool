/* PERCORSO «Home › Sezione › Pagina» (Fase 2.3) e indirizzi dello Shop.

   1. percorso(): dai dati veri, i passi giusti per categoria, materiale,
      tecnologia, macchina e settore Business; nessun percorso dove non serve.
   2. Bug trovato provando il percorso: lo Shop riscriveva l'indirizzo dei
      filtri come «/shop?…» dalla radice del dominio. Su GitHub Pages il sito
      vive in /website-ingly-xtool/: ogni filtro (categoria, materiale,
      ordinamento) dava un indirizzo che, ricaricato o condiviso, era un 404.
      Verificato in Chromium: main → pagina d'errore; ora → Shop filtrato. */
import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://example.org/website-ingly-xtool/' });
globalThis.window = dom.window; globalThis.document = dom.window.document;
const J = f => JSON.parse(readFileSync('data/' + f, 'utf8'));
const testi = J('texts.json');
const content = J('content.json');
const D = { CATS: J('categories.json'), MATERIALI: J('materiali.json'), TECNOLOGIE: J('tecnologie.json'), MACCHINE: J('macchine.json'), VERTICALI: content.VERTICALI, D: testi };
window.INGLY = D;
const { percorso } = await import('../assets/js/percorso.js');

let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };
const t = k => testi.it[k] || k;
const testo = r => r ? r.map(p => p.n).join(' › ') : null;

console.log('\n=== I PASSI GIUSTI ===');
const cat = D.CATS[0];
check('categoria dello Shop', testo(percorso('shop', '?cat=' + cat.id, D, { t })) === `Home › Shop › ${cat.n.it}`, testo(percorso('shop', '?cat=' + cat.id, D, { t })));
check('materiale', testo(percorso('materiali/legno/', '', D, { t })) === 'Home › Materiali › Legno');
check('tecnologia', /^Home › Tecnologie › Laser CO/.test(testo(percorso('tecnologie/co2/', '', D, { t })) || ''));
check('macchina (anche se sta solo nel catalogo)', testo(percorso('macchine/m2/', '', D, { t })) === 'Home › Macchine › xTool M2');
const r = percorso('materiali/legno/', '', D, { t });
check('i link sono relativi alla base del sito', r && r.every(p => !p.href.startsWith('/')));
check('l\'ultimo passo è la pagina stessa', r && r[2].href === 'materiali/legno');
check('in inglese usa i nomi inglesi', testo(percorso('materiali/legno/', '', D, { l: 'en', t: k => testi.en[k] })) === 'Home › Materials › Wood');

console.log('\n=== NIENTE PERCORSO DOVE NON SERVE ===');
check('Home', percorso('', '', D, { t }) === null);
check('Shop senza categoria', percorso('shop', '', D, { t }) === null);
check('categoria inesistente', percorso('shop', '?cat=non-esiste', D, { t }) === null);
check('materiale inesistente', percorso('materiali/plutonio/', '', D, { t }) === null);
check('pagina di sezione senza scheda', percorso('materiali/', '', D, { t }) === null);

console.log('\n=== CABLAGGIO ===');
const src = readFileSync('assets/js/percorso.js', 'utf8');
const main = readFileSync('assets/js/main.js', 'utf8');
const prod = readFileSync('assets/js/products.js', 'utf8');
check('main.js avvia il percorso', /import \{ initPercorso \} from '\.\/percorso\.js'/.test(main) && /initPercorso\(\)/.test(main));
check('non duplica il percorso della scheda prodotto', /some\(c => c\.id !== 'percorsoNav'\)/.test(src));
check('scrive il BreadcrumbList per Google', /'@type': 'BreadcrumbList'/.test(src));
check('il passo attuale è marcato aria-current', /aria-current="page"/.test(src));
check('testi IT/EN in texts.json', [...src.matchAll(/'(pc[A-Z]\w+)'/g)].every(m => testi.it[m[1]] && testi.en[m[1]]));

console.log('\n=== INDIRIZZI DELLO SHOP SOTTO LA BASE ===');
check('i filtri scrivono l\'indirizzo sotto BASE, non dalla radice', /const next=BASE\+'shop'\+/.test(prod) && !/const next='\/shop'/.test(prod));
check('products.js importa BASE dal router', /import \{ go, BASE \} from '\.\/navigation\.js'/.test(prod));

console.log(`\n=========== PERCORSO: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
