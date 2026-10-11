/* ============ LA MAPPA DELLE ROTTE ============

   Un posto solo in cui è scritto quali indirizzi esistono.

   Perché serve, misurato e non supposto: nella home c'erano **44 link su 99
   che uscivano dal sito**, e tutti e 44 rispondevano 404. Erano scritti
   così — `href="/shop"`, `href="/materiali"`, `href="/home"` — cioè
   assoluti rispetto alla radice del dominio. Il sito però è pubblicato in
   una sottocartella (`inglyum.github.io/website-ingly-xtool/`), quindi
   `/shop` è fuori dal progetto.

   Non si vedeva, perché il clic normale non segue l'indirizzo: lo
   intercetta il router JavaScript, che toglie la base e cambia pagina. Il
   difetto compariva solo facendo quello che la gente fa davvero — aprire in
   una nuova scheda, clic centrale, «copia indirizzo», condividere il
   link — e per ogni crawler che non esegue JavaScript, cioè per le 108
   pagine statiche che esistono proprio per loro.

   E l'elenco delle rotte era scritto DUE volte: in `navigation.js` e in
   `404.html`. Le due copie erano diverse: la seconda non conosceva
   `materiali`, `tecnologie`, `macchine`, `academy`, `demo`. Finché il sito
   sta in una sottocartella la cosa non si nota; il giorno in cui si punta
   `inglydesign.it` qui sopra, `/materiali` viene preso per il nome della
   cartella d'installazione e porta alla home.

   Da qui in avanti l'elenco è uno. `404.html` lo riceve dal build, non lo
   ricopia.

   Funzioni pure, nessun DOM: tests/test-rotte.mjs. */

/**
 * Le rotte del sito.
 *
 * `percorso` è SEMPRE relativo alla base, senza barra iniziale: è la forma
 * che funziona sia nella radice di un dominio sia in una sottocartella,
 * purché il documento dichiari la propria base — e la dichiara (`<base>`).
 *
 * La home ha percorso vuoto, perché **la home è la radice**. Non esiste una
 * pagina `/home`: esisteva come link in cinque punti e rispondeva 404.
 */
export const ROTTE = [
  { id: 'home',       percorso: '',            menu: 'nascosta' },
  { id: 'shop',       percorso: 'shop',        menu: 'principale' },
  { id: 'materiali',  percorso: 'materiali',   menu: 'principale', schede: true },
  { id: 'digital',    percorso: 'digital',     menu: 'principale' },
  { id: 'academy',    percorso: 'academy',     menu: 'principale', schede: true },
  { id: 'macchine',   percorso: 'macchine',    menu: 'principale', schede: true },
  { id: 'business',   percorso: 'business',    menu: 'principale', schede: true },
  { id: 'tecnologie', percorso: 'tecnologie',  menu: 'secondaria', schede: true },
  { id: 'demo',       percorso: 'demo',        menu: 'secondaria' },
  { id: 'portfolio',  percorso: 'portfolio',   menu: 'secondaria' },
  { id: 'about',      percorso: 'about',       menu: 'secondaria' },
  { id: 'faq',        percorso: 'faq',         menu: 'secondaria' },
  { id: 'quote',      percorso: 'quote',       menu: 'secondaria' },
  { id: 'product',    percorso: 'product',     menu: 'nascosta' },
];

/** Gli id, nell'ordine dichiarato. È l'elenco che usa il router. */
export const ID = ROTTE.map(r => r.id);

/** I primi segmenti che il sito possiede. Serve a `404.html` per capire
 *  dove finisce la cartella d'installazione e dove comincia la rotta. */
export const SEGMENTI = ROTTE.map(r => r.percorso).filter(Boolean);

export const trova = id => ROTTE.find(r => r.id === String(id)) || null;
export const esiste = id => Boolean(trova(id));

/**
 * L'indirizzo da scrivere in un `href`.
 *
 * Relativo e senza barra iniziale: il documento dichiara la base, quindi
 * `shop` è giusto sia su `inglydesign.it/` sia su
 * `inglyum.github.io/website-ingly-xtool/`, e resta giusto anche dopo che
 * il router ha cambiato l'indirizzo con pushState — perché `<base>` si
 * risolve una volta, quando la pagina viene letta.
 *
 * La home è `'./'`: un `href=""` ricaricherebbe l'indirizzo corrente
 * compresa la query, che non è la home.
 */
export function href(id, sotto = '') {
  const r = trova(id);
  if (!r) return './';
  const coda = String(sotto || '').replace(/^\/+|\/+$/g, '');
  if (!r.percorso) return './';
  return coda ? r.percorso + '/' + coda : r.percorso;
}

/**
 * La rotta di un percorso già privato della base.
 * Un percorso sconosciuto è la home, non un errore: meglio la home di una
 * pagina bianca.
 */
export function daPercorso(p) {
  const primo = String(p || '').replace(/^\/+/, '').split('?')[0].split('/')[0];
  if (!primo) return 'home';
  const r = ROTTE.find(x => x.percorso === primo);
  return r ? r.id : 'home';
}

/** Le rotte di un livello di menu, nell'ordine dichiarato. */
export const perMenu = livello => ROTTE.filter(r => r.menu === livello);
