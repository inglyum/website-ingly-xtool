/* Ogni pagina statica deve essere la stessa applicazione di index.html.

   Le 107 pagine pre-renderizzate (/business, /shop, /product/N…) sono la
   porta d'ingresso di chi arriva da Google, da un link condiviso o da un
   preferito. Contengono una copia della testata di index.html: fogli di
   stile, versione della cache, icone. Se quella copia invecchia, chi entra
   da /business vede un sito diverso da chi entra da /.

   È successo: index.html era passato a CACHE_WANT 'ingly-v14' e aveva
   aggiunto premium-2026.css, e tutte le 107 pagine sono rimaste a 'ingly-v7'
   senza quel foglio. Due effetti, entrambi invisibili da index.html:
   · lo sblocco della cache e il service worker (CACHE_VER 'ingly-v14')
     litigavano, e il visitatore restava sulla versione vecchia;
   · lo strato visivo premium mancava proprio sulla pagina Business.
   Il controllo esistente guardava solo index.html, e per questo non se ne
   è accorto nessuno. */
import { readFileSync } from 'fs';
import { execSync } from 'child_process';

let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };

const leggi = f => readFileSync(f, 'utf8');
const cache = h => (h.match(/CACHE_WANT\s*=\s*'([^']+)'/) || [])[1] || null;
/* l'ordine conta: in CSS vince l'ultimo, quindi due pagine con gli stessi
   fogli in ordine diverso sono due siti diversi */
const fogli = h => [...h.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)]
  .map(m => m[1]).filter(u => !/^https?:/.test(u));

const idx = leggi('index.html');
const sw = leggi('sw.js');
const VER = (sw.match(/CACHE_VER\s*=\s*'([^']+)'/) || [])[1];
const BASE_CACHE = cache(idx), BASE_FOGLI = fogli(idx);

console.log('\n=== LA PAGINA DI RIFERIMENTO ===');
check('index.html dichiara la versione della cache', !!BASE_CACHE);
check('ed è la stessa del service worker', BASE_CACHE === VER, `${BASE_CACHE} ≠ ${VER}`);
check('index.html carica dei fogli di stile', BASE_FOGLI.length > 0);

const pagine = execSync('git ls-files "*/index.html"', { encoding: 'utf8' })
  .split('\n').filter(Boolean).filter(f => !f.startsWith('node_modules/') && !f.startsWith('dist/'));

console.log(`\n=== LE ${pagine.length} PAGINE STATICHE ===`);
check('ci sono pagine statiche da controllare', pagine.length > 50, String(pagine.length));

const cacheDiversa = [], fogliDiversi = [];
for (const f of pagine) {
  const h = leggi(f);
  if (cache(h) !== BASE_CACHE) cacheDiversa.push(`${f} (${cache(h)})`);
  if (fogli(h).join('|') !== BASE_FOGLI.join('|')) fogliDiversi.push(f);
}
check(`tutte hanno la versione della cache di index.html (${BASE_CACHE})`,
  cacheDiversa.length === 0, cacheDiversa.slice(0, 4).join(', ') + (cacheDiversa.length > 4 ? ` … e altre ${cacheDiversa.length - 4}` : ''));
check('tutte caricano gli stessi fogli di stile, nello stesso ordine',
  fogliDiversi.length === 0, fogliDiversi.slice(0, 4).join(', ') + (fogliDiversi.length > 4 ? ` … e altre ${fogliDiversi.length - 4}` : ''));

/* Le pagine con cui si entra più spesso, nominate una per una: se il
   controllo generale un giorno cambiasse, queste restano scritte */
for (const f of ['business/index.html', 'shop/index.html', 'personalizza/index.html', 'macchine/index.html']) {
  try {
    const h = leggi(f);
    check(`${f.split('/')[0]}: stessa cache e stessi fogli`, cache(h) === BASE_CACHE && fogli(h).join('|') === BASE_FOGLI.join('|'));
  } catch { check(`${f} esiste`, false) }
}

console.log(`\n=========== PAGINE STATICHE: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
