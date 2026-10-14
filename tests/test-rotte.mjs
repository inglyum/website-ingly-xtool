/* Le rotte e i link interni.

   Questi controlli nascono da un difetto misurato, non immaginato: nella
   home 44 link su 99 uscivano dal sito e rispondevano tutti 404, perché
   erano scritti assoluti (`href="/shop"`) e il sito è pubblicato in una
   sottocartella. Non si vedeva, perché il clic normale lo intercetta il
   router: il difetto compariva aprendo in una nuova scheda, col clic
   centrale, copiando l'indirizzo, e per ogni crawler senza JavaScript.

   Per questo la maggior parte dei controlli qui guarda il MARKUP, non la
   logica: la logica funzionava. */
import * as R from '../assets/js/rotte.js';
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };

console.log('\n=== LA MAPPA ===');
check('ci sono rotte', R.ROTTE.length > 0, String(R.ROTTE.length));
check('ogni rotta ha un id', R.ROTTE.every(r => r.id));
check('nessun id ripetuto', new Set(R.ID).size === R.ID.length);
check('nessun percorso ripetuto', new Set(R.SEGMENTI).size === R.SEGMENTI.length);
check('nessun percorso comincia con una barra', R.SEGMENTI.every(p => !p.startsWith('/')));
check('nessun percorso finisce con una barra', R.SEGMENTI.every(p => !p.endsWith('/')));
check('esiste la home', R.esiste('home'));
/* la home è la radice: una pagina /home esisteva come link in cinque punti
   e rispondeva 404 */
check('la home non ha un percorso proprio', R.trova('home').percorso === '');
check('href della home è ./', R.href('home') === './');
check('href di una rotta è relativo', R.href('shop') === 'shop');
check('href di una scheda', R.href('materiali', 'plexiglass') === 'materiali/plexiglass');
check('href normalizza le barre di troppo', R.href('materiali', '/plexiglass/') === 'materiali/plexiglass');
check('href di una rotta inesistente non esplode', R.href('zzz') === './');
check('una rotta sconosciuta risolve alla home', R.daPercorso('/boh') === 'home');
check('percorso vuoto è la home', R.daPercorso('') === 'home');
check('la scheda risolve alla sua sezione', R.daPercorso('/materiali/plexiglass') === 'materiali');
check('la query non confonde', R.daPercorso('shop?cat=casa') === 'shop');
check('i livelli di menu sono popolati', R.perMenu('principale').length > 0 && R.perMenu('secondaria').length > 0);

console.log('\n=== UNA SOLA LISTA DI ROTTE ===');
const nav = readFileSync('assets/js/navigation.js', 'utf8');
check('navigation.js non ha più la sua lista', !/export const PAGES=\['home'/.test(nav));
check('navigation.js prende la lista dalla mappa', /from '\.\/rotte\.js'/.test(nav));
const q404 = readFileSync('404.html', 'utf8');
check('404.html ha il segnaposto generato', /\/\*ROTTE\*\/[\s\S]*?\/\*FINE-ROTTE\*\//.test(q404));
const generata = JSON.parse(q404.match(/\/\*ROTTE\*\/([\s\S]*?)\/\*FINE-ROTTE\*\//)[1]);
/* era una copia a mano, rimasta indietro di cinque rotte */
check('la lista di 404.html combacia con la mappa', generata.join() === R.ID.join(), generata.join());
check('404.html conosce le rotte del Lab',
  ['materiali', 'tecnologie', 'macchine', 'academy', 'demo'].every(r => generata.includes(r)));
const build = readFileSync('scripts/build.mjs', 'utf8');
check('il build scrive la lista in 404.html', /FINE-ROTTE/.test(build));
check('il build si ferma se il segnaposto sparisce', /manca il segnaposto/.test(build));

console.log('\n=== NESSUN LINK INTERNO ASSOLUTO ===');
/* un href="/shop" esce dal sito quando il sito sta in una sottocartella */
const idx = readFileSync('index.html', 'utf8');
const assoluti = (idx.match(/href="\/[a-z][^"]*"/g) || []);
check('index.html non ha link interni assoluti', assoluti.length === 0, assoluti.slice(0, 5).join(' '));
/* Un tag letterale, non uno script: <base> si risolve quando la pagina
   viene letta, quindi `./` resta la cartella di partenza anche dopo che il
   router ha cambiato l'indirizzo con pushState — e funziona anche per un
   crawler che non esegue JavaScript. Prima il tag veniva inserito solo nel
   ramo del redirect `?p=`, cioè quasi mai. */
check('index.html dichiara la base come primo tag del head',
  /<head>\s*<base href="\.\/">/.test(idx));

/* le 108 pagine statiche nascono da index.html: se il guscio è a posto lo
   sono anche loro, ma è proprio lì che il difetto conta — un crawler senza
   JavaScript non ha un router che gli salvi il link */
function pagine(dir, out = []) {
  for (const v of readdirSync(dir)) {
    if (['node_modules', 'dist', '.git', 'img', 'assets', 'favicon', 'data', 'scripts', 'tests', 'docs'].includes(v)) continue;
    const p = join(dir, v);
    if (statSync(p).isDirectory()) pagine(p, out);
    else if (v === 'index.html') out.push(p);
  }
  return out;
}
const statiche = pagine('.');
check('le pagine statiche esistono', statiche.length > 50, String(statiche.length));
const sporche = statiche.filter(f => /href="\/[a-z][^"]*"/.test(readFileSync(f, 'utf8')));
check('nessuna pagina statica ha link interni assoluti', sporche.length === 0, sporche.slice(0, 4).join(' '));
/* il guscio dichiara `./`, le pagine generate `../` secondo la profondità */
check('ogni pagina dichiara la propria base',
  statiche.every(f => /<base href="[^"]+">/.test(readFileSync(f, 'utf8'))),
  statiche.filter(f => !/<base href=/.test(readFileSync(f, 'utf8'))).join(' '));

console.log('\n=== LE ALTERNATIVE DI LINGUA PUNTANO ALLA PAGINA ===');
/* tutte dichiaravano la home come proprio equivalente italiano */
let hreflangSbagliati = [];
for (const f of statiche) {
  const s = readFileSync(f, 'utf8');
  const can = (s.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
  const it = (s.match(/hreflang="it" href="([^"]*)"/) || [])[1];
  if (can && it && can !== it) hreflangSbagliati.push(f);
}
check('hreflang it combacia con il canonical di ogni pagina',
  hreflangSbagliati.length === 0, hreflangSbagliati.slice(0, 4).join(' '));
const engine = readFileSync('assets/js/prerender-engine.js', 'utf8');
check('il generatore riscrive le alternative di lingua', /hreflang="it"/.test(engine));

console.log('\n=== IL SERVICE WORKER VIVE NELLA SUA SOTTOCARTELLA ===');
const sw = readFileSync('sw.js', 'utf8');
check('la base viene dallo scope', /new URL\('\.\/', self\.location\)/.test(sw));
/* erano assoluti: il precache puntava fuori dal progetto e restava vuoto */
check('il precache non ha percorsi assoluti', !/^\s*'\/(index\.html|assets|data|favicon)/m.test(sw));
check('il precache passa dalla base', /via\(''\)/.test(sw) && /via\('index\.html'\)/.test(sw));
check('il fallback offline passa dalla base', /via\('index\.html'\)\)\);/.test(sw) || /5000, via\('index\.html'\)/.test(sw));
check('il fallback ignora la query', /ignoreSearch:\s*true/.test(sw));
/* addAll fallisce tutto al primo percorso mancante */
check('il precache aggiunge una voce alla volta', !/addAll\(PRECACHE\)/.test(sw));
const cacheVer = (sw.match(/const CACHE_VER\\s*=\\s*['"]ingly-v(\\d+)['"]/) || [])[1];
const htmlCacheVer = (readFileSync('index.html','utf8').match(/CACHE_WANT\\s*=\\s*['"]ingly-v(\\d+)['"]/) || [])[1];
check('la versione della cache è stata alzata', Number(cacheVer) >= 13, String(cacheVer));
check('HTML e service worker usano la stessa cache', !!cacheVer && cacheVer === htmlCacheVer, cacheVer + ' / ' + htmlCacheVer);

console.log('\n=== LA VERSIONE DEI DATI SI MUOVE ===');
/* il sito rilegge i JSON con ?v=<versione>: pubblicando da git la versione
   non si alzava e chi era già passato riceveva i dati vecchi */
check('il build aggiorna version.json quando i dati cambiano', /impronta/.test(build));
const ver = JSON.parse(readFileSync('data/version.json', 'utf8'));
check('version.json porta l\'impronta dei dati', Number.isFinite(ver.impronta));
check('version.json ha una versione', Number.isFinite(ver.v) && ver.v > 0);

console.log('\n=== OGNI ROTTA HA LA SUA PAGINA STATICA ===');
/* Era una TERZA copia dell'elenco rotte, scritta a mano in
   prerender-engine.js, e come quella di 404.html si era fermata indietro.
   Una rotta che il prerender non conosce risponde 404 e viene salvata solo
   dal redirect JavaScript: per un crawler senza JavaScript non esiste. */
const engine2 = readFileSync('assets/js/prerender-engine.js', 'utf8');
check('il prerender non ha più la sua lista',
  !/pagine = \['shop','digital'/.test(engine2));
check('il prerender prende la lista dalla mappa', /PAGINE_STATICHE/.test(engine2));
check('le pagine statiche escludono la home e i prodotti',
  !R.PAGINE_STATICHE.includes('') && !R.PAGINE_STATICHE.includes('product'));
/* il confine è «chi la genera»: business ha le pagine di settore ma la
   genera questo elenco, e marcarla come rotta del Lab l'aveva fatta
   sparire dal prerender */
check('business è fra le pagine statiche', R.PAGINE_STATICHE.includes('business'));
check('le rotte del Lab non sono nell\'elenco statico',
  ['materiali', 'tecnologie', 'macchine', 'academy', 'demo'].every(x => !R.PAGINE_STATICHE.includes(x)));
/* la prova che conta: ogni rotta ha un file su disco */
const senzaPagina = R.ROTTE
  .filter(r => r.percorso && r.id !== 'product')
  .filter(r => !statiche.some(f => f.replace(/\\/g, '/').replace(/^\.\//, '') === r.percorso + '/index.html'));
check('ogni rotta ha la sua pagina su disco', senzaPagina.length === 0, senzaPagina.map(r => r.id).join());
check('personalizza ha la sua pagina', statiche.some(f => /personalizza\/index\.html$/.test(f)));

console.log('\n=== NON SI CHIEDE UNA FOTO CHE NON ESISTE ===');
/* 90 prodotti su 97 dichiarano una foto, 13 ce l'hanno davvero. Il sito le
   chiedeva tutte, e per ciascuna faceva DUE richieste fallite: il .webp e
   poi il tentativo .jpg. Misurato sul catalogo: 43 richieste a vuoto per un
   risultato visivo identico, perché il segnaposto c'era già. */
const man = JSON.parse(readFileSync('data/immagini.json', 'utf8'));
check('l\'elenco delle foto è generato', Array.isArray(man.file) && man.file.length > 0, String(man.file.length));
check('l\'elenco dice di essere generato', /GENERATO/.test(man._nota || ''));
const suDisco = readdirSync('img').filter(f => /\.(webp|jpg|jpeg|png|avif|gif|svg)$/i.test(f));
check('l\'elenco combacia con il disco', man.file.length === suDisco.length, `elenco=${man.file.length} disco=${suDisco.length}`);
check('è un elenco di ciò che c\'è, non di ciò che manca',
  man.file.every(f => suDisco.includes(f)));
const utils = readFileSync('assets/js/utils.js', 'utf8');
check('imgTag non emette nulla per una foto assente', /if\(!esiste\(s\)\) return '';/.test(utils));
/* se l'elenco manca il sito deve comportarsi come prima, non nascondere
   foto che esistono: il guasto deve cadere dal lato sicuro */
check('senza elenco si chiede comunque', /return true;\s*\/\* nessun elenco/.test(utils));
check('il wrapper legacy porta l\'elenco', /IMMAGINI:/.test(readFileSync('scripts/build.mjs', 'utf8')));
check('il sito lo carica', /immagini:'IMMAGINI'/.test(readFileSync('assets/js/data-loader.js', 'utf8')));
/* se la pubblicazione dall'Admin non aggiornasse l'elenco, una foto appena
   caricata resterebbe invisibile fino al build successivo */
const adm = readFileSync('admin.html', 'utf8');
check('l\'Admin aggiorna l\'elenco con le foto che sta pubblicando', /function elencoImmagini\(\)/.test(adm));
check('e lo mette nel wrapper legacy', /IMMAGINI:\$\{jstr\(elencoImmagini\(\)\)\}/.test(adm));
check('l\'Admin carica l\'elenco esistente', /immagini:'IMG'/.test(adm));
check('e tiene conto delle foto cancellate', /DELETES/.test(adm.slice(adm.indexOf('function elencoImmagini'), adm.indexOf('function elencoImmagini') + 700)));

console.log('\n=== LO SBLOCCO CACHE E IL SERVICE WORKER DICONO LA STESSA VERSIONE ===');
/* Il difetto: ho alzato CACHE_VER in sw.js a v7 e lasciato CACHE_WANT a v6
   in index.html. Lo sblocco cerca le cache che NON cominciano per la
   versione voluta: con v6 scritto lì, le cache v6 del browser non
   risultavano vecchie e non venivano toccate — mentre le cache v7 appena
   create dal service worker nuovo risultavano vecchie e venivano
   CANCELLATE, con il worker disiscritto, a ogni sessione. I due si
   combattevano, e sullo schermo restava il sito di prima. */
const swTxt = readFileSync('sw.js', 'utf8');
const idxTxt = readFileSync('index.html', 'utf8');
const verSw = (swTxt.match(/CACHE_VER\s*=\s*'([^']+)'/) || [])[1];
const verIdx = (idxTxt.match(/CACHE_WANT\s*=\s*'([^']+)'/) || [])[1];
check('sw.js dichiara una versione di cache', !!verSw, String(verSw));
check('index.html dichiara quale versione vuole', !!verIdx, String(verIdx));
check('le due versioni COMBACIANO', verSw === verIdx, `sw.js=${verSw} index.html=${verIdx}`);

console.log('\n=== IL VELO DI CARICAMENTO NON INGOIA I CLIC ===');
/* Era sopra tutto con i clic attivi e se ne andava solo all'evento `load`,
   cioè quando era arrivata l'ultima sottorisorsa — font di Google compresi.
   Nel frattempo la pagina sembrava pronta e non rispondeva: il ✕ del menu
   mobile era visibile e il clic finiva nel velo. */
const pagesCss = readFileSync('assets/css/pages.css', 'utf8');
const regolaLoader = (pagesCss.match(/\.loader\{[^}]*\}/) || [''])[0];
check('il velo è trasparente ai clic da sempre, non solo da spento',
  /pointer-events:\s*none/.test(regolaLoader), regolaLoader.slice(0, 80));
check('e lo resta anche da spento', /\.loader\.off\{[^}]*pointer-events:\s*none/.test(pagesCss));
const anim = readFileSync('assets/js/animations.js', 'utf8');
check('la rete di sicurezza non aspetta più 3,5 secondi', /setTimeout\(via, ?2500\)/.test(anim));

console.log(`\n=========== ROTTE: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
