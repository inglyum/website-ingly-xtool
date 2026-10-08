/* L'architettura dell'informazione.

   Il rischio di raggruppare tredici voci in cinque famiglie è perderne una
   per strada: una pagina che esiste, è indicizzata, e dal menu non si
   raggiunge più. Qui si verifica che ogni destinazione del sito sia ancora
   a portata di clic, e che il menu non prometta pagine inesistenti. */
import * as IA from '../assets/js/nav-ia.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const leggi = f => JSON.parse(readFileSync(join(ROOT, f), 'utf8'));

let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };

const D = {
  CATS: leggi('data/categories.json'),
  MATERIALI: leggi('data/materiali.json'),
  TECNOLOGIE: leggi('data/tecnologie.json'),
  MACCHINE: leggi('data/macchine.json'),
  CORSI: leggi('data/corsi.json'),
  VERTICALI: leggi('data/content.json').VERTICALI || []
};

console.log('\n=== LE CINQUE FAMIGLIE ===');
check('la barra ha cinque voci, non tredici', IA.FAMIGLIE.length === 5, String(IA.FAMIGLIE.length));
check('ogni famiglia porta a una pagina sua', IA.FAMIGLIE.every(f => f.rotta && /^[a-z-]+$/.test(f.rotta)));
/* Un gruppo che si apre soltanto è una trappola per chi usa la tastiera. */
check('nessuna famiglia è un contenitore vuoto',
  IA.FAMIGLIE.every(f => IA.pannello(f.id, D).colonne.length > 0 || f.rotta));

console.log('\n=== I PANNELLI NASCONO DAI DATI ===');
const lab = IA.pannello('lab', D);
check('il Lab mostra tre colonne', lab.colonne.length === 3);
check('i materiali del menu sono quelli veri',
  lab.colonne[0].voci.some(v => /Plexiglass/i.test(v.n)));
check('le tecnologie del menu sono quelle vere',
  lab.colonne[1].voci.length === D.TECNOLOGIE.tecnologie.length);
/* Le macchine che abbiamo vengono prima: sono le uniche che si possono
   venire a vedere, ed è l'informazione che conta di più. */
check('le macchine in officina sono in cima',
  lab.colonne[2].voci[0].nota !== '' && lab.colonne[2].voci[0].nota != null);
check('ogni colonna ha il suo «vedi tutto»', lab.colonne.every(c => c.tutto && c.tutto.href));

const shop = IA.pannello('shop', D);
check('lo Shop elenca le categorie vere', shop.colonne[0].voci.length > 3);
check('un materiale nuovo entrerebbe nel menu da solo',
  IA.pannello('lab', { ...D, MATERIALI: { materiali: [{ id: 'x', n: { it: 'Nuovo' } }] } })
    .colonne[0].voci[0].n === 'Nuovo');

console.log('\n=== ACADEMY VUOTA ===');
const ac = IA.pannello('academy', D);
check('senza corsi la colonna resta vuota', ac.colonne[0].voci.length === 0);
/* Un menu che mostra «Corsi» e non porta a niente è peggio di un menu che
   dice che il calendario non è aperto. */
check('ma il pannello lo dice, invece di tacere', !!ac.evidenza);
const conCorsi = { ...D, CORSI: { corsi: [{ id: 'p3', n: { it: 'Corso P3' }, stato: 'pubblicato' },
  { id: 'b', n: { it: 'Bozza' }, stato: 'bozza' }] } };
check('un corso pubblicato entra nel menu', IA.pannello('academy', conCorsi).colonne[0].voci.length === 1);
check('una bozza no', !IA.pannello('academy', conCorsi).colonne[0].voci.some(v => v.n === 'Bozza'));

console.log('\n=== NESSUNA DESTINAZIONE PERSA ===');
const dest = IA.destinazioni(D).map(h => h.split('?')[0]);
/* Le pagine che esistevano prima della riorganizzazione devono restare
   raggiungibili: una pagina indicizzata e non più linkata è peggio di una
   pagina cancellata, perché nessuno se ne accorge. */
for (const r of ['/shop', '/digital', '/business', '/portfolio', '/about', '/faq', '/quote',
                 '/materiali', '/tecnologie', '/macchine', '/academy', '/demo']) {
  check('dal menu si raggiunge ancora ' + r, dest.includes(r), dest.join(' '));
}

console.log('\n=== IL MENU NON PROMETTE PAGINE CHE NON ESISTONO ===');
const rotte = new Set(['', 'shop', 'digital', 'business', 'portfolio', 'about', 'faq', 'quote',
  'materiali', 'tecnologie', 'macchine', 'academy', 'demo', 'product']);
const idsMat = new Set(D.MATERIALI.materiali.map(m => m.id));
const idsTec = new Set(D.TECNOLOGIE.tecnologie.map(t => t.id));
const idsMac = new Set(D.MACCHINE.catalogo.map(m => m.id));
const idsVert = new Set(D.VERTICALI.map(v => v.id));
const rotti = [];
for (const h of IA.destinazioni(D)) {
  const seg = h.split('?')[0].replace(/^\/+/, '').split('/');
  if (!rotte.has(seg[0])) { rotti.push(h); continue; }
  if (seg[1]) {
    const ok = seg[0] === 'materiali' ? idsMat.has(seg[1])
      : seg[0] === 'tecnologie' ? idsTec.has(seg[1])
      : seg[0] === 'macchine' ? idsMac.has(seg[1])
      : seg[0] === 'business' ? idsVert.has(seg[1])
      : seg[0] === 'academy';
    if (!ok) rotti.push(h);
  }
}
check('nessun link del menu porta a una pagina inesistente', rotti.length === 0, rotti.join(' '));

console.log('\n=== MARKUP ===');
const barra = IA.barraHtml(D, { base: '' });
check('ogni voce dichiara se si apre', (barra.match(/aria-haspopup/g) || []).length >= 4);
check('e parte da chiusa', !/aria-expanded="true"/.test(barra));
check('gli indirizzi rispettano la base del sito',
  IA.barraHtml(D, { base: '/anteprima' }).includes('href="/anteprima/shop"'));
/* I nomi arrivano dai dati, che li scrive una persona nell'Admin. */
const velenoso = { ...D, CATS: [{ id: 'x', n: { it: '<img src=x onerror=alert(1)>' } }] };
check('un nome con dentro del codice non diventa codice',
  !IA.pannelloHtml({ id: 'shop' }, velenoso, {}).includes('<img src=x'));
check('il cassetto mobile ha le stesse famiglie',
  (IA.cassettoHtml(D, { base: '' }).match(/class="dr-fam"/g) || []).length === 5);

console.log(`\n=========== NAV IA: ${pass} passati, ${fail} falliti ===========\n`);
process.exit(fail ? 1 : 0);
