/* Ogni SVG del repository deve essere XML valido.

   Un SVG è un documento XML: un carattere sbagliato e il browser rifiuta
   l'intero file, mostrando un'immagine rotta — senza un errore in console,
   senza un 404, senza niente che lo segnali.

   È successo: «Hotel e B&B» in un aria-label e «Decor & laser cut» nel
   testo di quattro copertine dei File digitali. Una `&` non codificata, e
   cinque immagini sparite. Le copertine si vedevano rotte solo dove
   comparivano, la card Hotel solo da 1440 px in su: due posti in cui
   nessuno guarda per caso. */
import { JSDOM } from 'jsdom';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };

const { DOMParser } = new JSDOM('').window;
const files = execSync('git ls-files "*.svg"', { encoding: 'utf8' }).split('\n').filter(Boolean);

console.log('\n=== OGNI SVG È XML VALIDO ===');
check('ci sono degli SVG da controllare', files.length > 0, String(files.length));

const rotti = [];
for (const f of files) {
  const doc = new DOMParser().parseFromString(readFileSync(f, 'utf8'), 'image/svg+xml');
  const err = doc.getElementsByTagName('parsererror')[0];
  if (err) rotti.push(f + ' — ' + err.textContent.split('\n')[0].slice(0, 90));
}
check(`tutti i ${files.length} SVG si aprono`, rotti.length === 0, '\n      ' + rotti.join('\n      '));

/* Il caso preciso che è successo, così il motivo resta scritto */
/* nei commenti e nelle sezioni CDATA una «&» è lecita: si tolgono prima di
   cercare, o il controllo segnalerebbe come errore un file valido */
const senzaCommenti = t => t.replace(/<!--[\s\S]*?-->/g, '').replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');
const conAmpNuda = files.filter(f => /&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/.test(senzaCommenti(readFileSync(f, 'utf8'))));
check('nessuna «&» non codificata', conAmpNuda.length === 0, conAmpNuda.join(', '));

/* Il controllo deve davvero accorgersene: se domani jsdom cambiasse
   comportamento, un test che non fallisce mai non proteggerebbe niente */
const prova = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg"><text>A & B</text></svg>', 'image/svg+xml');
check('il controllo riconosce davvero un SVG rotto', !!prova.getElementsByTagName('parsererror')[0]);

console.log(`\n=========== SVG: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
