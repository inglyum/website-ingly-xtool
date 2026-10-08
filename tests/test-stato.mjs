/* Contatori e manutenzione.

   Due numeri visibili che non venivano da dove viene il contenuto, e un
   velo di manutenzione sopra un sito che continuava a funzionare. Sono i
   difetti più insidiosi del sito perché non assomigliano a errori: la
   pagina si disegna, niente va in console, e intanto dichiara il falso. */
import * as ST from '../assets/js/stato-sito.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const leggi = f => JSON.parse(readFileSync(join(ROOT, f), 'utf8'));

let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };

const D = {
  CONFIG: leggi('data/config.json'),
  P: leggi('data/products.json'),
  CATS: leggi('data/categories.json'),
  MATERIALI: leggi('data/materiali.json'),
  TECNOLOGIE: leggi('data/tecnologie.json'),
  MACCHINE: leggi('data/macchine.json'),
  CORSI: leggi('data/corsi.json')
};

console.log('\n=== I CONTEGGI VENGONO DAI DATI ===');
const n = ST.conteggi(D);
check('i prodotti contati sono quelli pubblici',
  n.prodotti === D.P.filter(p => !p.hidden).length && n.prodotti > 0, String(n.prodotti));
/* È il numero che era scritto a mano nell'HTML come 8 mentre i materiali
   erano nove: una bugia che nessuno nota finché non li conta. */
check('i materiali contati sono quelli in catalogo',
  n.materiali === D.MATERIALI.materiali.length, String(n.materiali));
check('le tecnologie contate sono quelle in catalogo',
  n.tecnologie === D.TECNOLOGIE.tecnologie.length);
check('le macchine in officina sono un sottoinsieme della gamma',
  n.inOfficina > 0 && n.inOfficina < n.macchine);
check('un prodotto nascosto non entra nel conteggio',
  ST.conteggi({ P: [{ id: 1 }, { id: 2, hidden: true }] }).prodotti === 1);
check('senza dati i conteggi sono zero, non undefined',
  Object.values(ST.conteggi({})).every(v => v === 0));

console.log('\n=== QUALI CONTATORI SI MOSTRANO ===');
const c = ST.contatori(D);
check('si mostrano solo contatori con un valore vero', c.every(x => x.n > 0));
/* Un numero inventato nell'HTML è una promessa che nessuno ha fatto. */
check('senza config.stats i numeri dichiarati non compaiono',
  !c.some(x => /Pezzi|Clienti|puntuali/i.test(x.etichetta)),
  c.map(x => x.etichetta).join(', '));
check('i materiali compaiono comunque, perché si contano',
  c.some(x => /Materiali/i.test(x.etichetta) && x.fonte === 'dati'));
const conStats = { ...D, CONFIG: { ...D.CONFIG, stats: { pezzi: 12400, clienti: 640, puntualita: 98 } } };
const c2 = ST.contatori(conStats);
check('con i numeri dichiarati nell\'Admin compaiono', c2.some(x => x.n === 12400 && x.fonte === 'config'));
check('non si mostrano più di quattro contatori', c2.length <= 4);
check('uno zero dichiarato non viene mostrato come traguardo',
  !ST.contatori({ ...D, CONFIG: { stats: { pezzi: 0 } } }).some(x => x.n === 0));

console.log('\n=== MANUTENZIONE ===');
check('oggi la manutenzione è spenta', !ST.manutenzione(D).attiva);
check('e il sito parte normalmente', ST.modalita(D) === 'normale');
const inManut = { CONFIG: { maintenance: { attivo: true, titolo: { it: 'Torniamo presto' }, messaggio: { it: 'x' } } } };
check('accesa, il sito NON si avvia', ST.modalita(inManut) === 'ferma',
  'un catalogo che carica sotto un velo non è un sito in manutenzione');
check('titolo e messaggio arrivano dalla configurazione',
  ST.manutenzione(inManut).titolo === 'Torniamo presto');
check('senza titolo c\'è comunque una frase sensata',
  ST.manutenzione({ CONFIG: { maintenance: { attivo: true } } }).titolo.length > 5);
/* Il vecchio script la decideva da solo con un catch vuoto: se il file non
   arrivava, la manutenzione accesa non compariva. Ora lo stato viene dagli
   stessi dati del sito, quindi o arrivano entrambi o non parte niente. */
check('senza configurazione la manutenzione resta spenta', ST.modalita({}) === 'normale');

console.log('\n=== IL MARKUP NON CONTIENE PIÙ NUMERI SCRITTI A MANO ===');
const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
check('nessun contatore con valore fisso nell\'HTML', !/data-to="\d+"/.test(html));
check('il contenitore dei contatori esiste', html.includes('id="counters"'));
/* Lo script che leggeva config.json per conto suo non deve tornare. */
check('la manutenzione non è più decisa da uno script isolato',
  !/var cfgUrl=/.test(html));

console.log(`\n=========== STATO: ${pass} passati, ${fail} falliti ===========\n`);
process.exit(fail ? 1 : 0);
