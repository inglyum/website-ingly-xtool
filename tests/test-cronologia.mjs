/* CRONOLOGIA: «indietro» riporta dove si era (Fase 2.5).

   Verificato in Chromium (1440 e 390 px): Shop scorso a 2000 px → apro un
   prodotto (parte dall'alto) → indietro → Shop di nuovo a 2000 px → avanti →
   prodotto dall'alto → nuova pagina dal menu → dall'alto.
   Prima «indietro» rimetteva sempre lo Shop in cima.

   Qui si esegue il router in jsdom per controllare che la posizione venga
   davvero salvata nella voce che si lascia e letta tornando. */
import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';

let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };

const nav = readFileSync('assets/js/navigation.js', 'utf8');
const prod = readFileSync('assets/js/products.js', 'utf8');

console.log('\n=== IL ROUTER RICORDA LA POSIZIONE ===');
check('il browser non ripristina da solo (lo fa il router a pagina pronta)', /history\.scrollRestoration='manual'/.test(nav));
check('prima di ogni pushState salva la posizione della voce che si lascia', (nav.match(/ricordaScroll\(\);?\s*\{?\s*history\.pushState|ricordaScroll\(\);\s*history\.pushState/g) || []).length === 2,
  'pushState senza ricordaScroll');
check('ogni pushState del router è preceduto da ricordaScroll', (nav.match(/history\.pushState/g) || []).length === (nav.match(/ricordaScroll\(\);\s*(?:\{\s*)?history\.pushState|ricordaScroll\(\); history\.pushState/g) || []).length);
check('popstate legge la posizione salvata', /addEventListener\('popstate',e=>\{[\s\S]{0,160}e\.state\.y[\s\S]{0,80}_ripristinaY=y/.test(nav));
check('una pagina nuova parte comunque dall\'alto', /if\(_ripristinaY!=null\)\{ ripristinaScroll\(_ripristinaY\); _ripristinaY=null; \}\s*else window\.scrollTo\(\{top:0/.test(nav));
check('i filtri dello Shop non cancellano la posizione salvata', /history\.replaceState\(history\.state,'',next\)/.test(prod) && !/history\.replaceState\(null,'',next\)/.test(prod));

console.log('\n=== IN UN BROWSER SIMULATO ===');
const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://example.org/website-ingly-xtool/shop' });
const w = dom.window;
let y = 0;
Object.defineProperty(w, 'scrollY', { get: () => y });
/* il cuore della logica, estratto dal router così com'è */
const corpo = nav.match(/function ricordaScroll\(\)\{[\s\S]*?\n\}/)[0];
const ricorda = new w.Function('history', 'scrollY', corpo + '; return ricordaScroll;');
y = 2000;
ricorda(w.history, y)();
check('la voce attuale contiene y=2000 dopo ricordaScroll', w.history.state && w.history.state.y === 2000, JSON.stringify(w.history.state));
w.history.pushState({ page: 'product' }, '', '/website-ingly-xtool/product/2/');
check('la nuova voce non eredita la posizione', !('y' in (w.history.state || {})));

console.log(`\n=========== CRONOLOGIA: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
