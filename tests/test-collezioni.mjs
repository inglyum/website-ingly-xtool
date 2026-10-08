/* Il Collection Engine.

   Il rischio non è che una collezione mostri un prodotto in meno: è che
   mostri una pagina vuota raggiungibile da un menu. Metà dei controlli qui
   riguarda quel caso — criterio che non prende niente, categoria
   rinominata, slug ripetuto, id che non esiste più.

   L'altro rischio è il contrario di quello che si teme: che il criterio
   prenda TROPPO. Un `prezzoMax` su un prodotto senza prezzo, o un tag
   confrontato con la maiuscola sbagliata, sono due modi di sbagliare in
   silenzio. */
import * as C from '../assets/js/collezioni.js';
import { readFileSync } from 'fs';

let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };

const P = [
  { id: 1, n: { it: 'Targa casa', en: 'Home sign' }, cat: 'casa', sub: 2, mat: 'Legno', price: 29.9, tag: 'Best', coll: ['best'], rev: 50 },
  { id: 2, n: { it: 'Segnaposto', en: 'Place card' }, cat: 'eventi', sub: 2, mat: 'Legno', price: 4.5, tag: 'New', rev: 10 },
  { id: 3, n: { it: 'Tableau', en: 'Seating chart' }, cat: 'eventi', sub: 2, mat: 'Plexiglass', price: 89, rev: 30 },
  { id: 4, n: { it: 'Compleanno', en: 'Birthday' }, cat: 'eventi', sub: 1, mat: 'Legno', price: 12, rev: 5 },
  { id: 5, n: { it: 'Nascosto', en: 'Hidden' }, cat: 'casa', sub: 1, mat: 'Legno', price: 9, tag: 'Best', hidden: true, rev: 99 },
  { id: 6, n: { it: 'Senza prezzo', en: 'No price' }, cat: 'casa', sub: 1, mat: 'Legno', price: null, rev: 1 },
  { id: 7, n: { it: 'Esaurito', en: 'Sold out' }, cat: 'casa', sub: 1, mat: 'Legno', price: 15, stock: 0, rev: 2 },
];
const CATS = [{ id: 'casa' }, { id: 'eventi' }, { id: 'b2b' }];
const coll = (o) => ({ id: 'x', stato: 'pubblicata', ...o });
const D = (...liste) => ({ P, CATS, COLLEZIONI: { collezioni: liste } });

console.log('\n=== IL CRITERIO PRENDE QUEL CHE DEVE ===');
check('una categoria', C.prodottiDi(coll({ query: { cat: ['casa'] } }), D()).length === 3, 'senza i nascosti');
check('due categorie sono un OR', C.prodottiDi(coll({ query: { cat: ['casa', 'eventi'] } }), D()).length === 6);
check('categoria e sottocategoria sono un AND',
  C.prodottiDi(coll({ query: { cat: ['eventi'], sub: [2] } }), D()).length === 2);
check('un materiale', C.prodottiDi(coll({ query: { mat: ['Plexiglass'] } }), D()).length === 1);
check('un criterio vuoto prende tutto il visibile', C.prodottiDi(coll({ query: {} }), D()).length === 6);
check('nessun criterio prende tutto il visibile', C.prodottiDi(coll({}), D()).length === 6);
/* il prodotto nascosto esiste ed è taggato Best: non deve comparire mai */
check('un prodotto nascosto non entra in nessuna collezione',
  !C.prodottiDi(coll({ query: { tag: ['Best'] } }), D()).some(p => p.id === 5));
check('il tag si confronta senza badare alla maiuscola',
  C.prodottiDi(coll({ query: { tag: ['best'] } }), D()).length === 1);
check('il campo coll vecchio resta interrogabile',
  C.prodottiDi(coll({ query: { coll: ['best'] } }), D()).length === 1);
check('solo in evidenza', C.prodottiDi(coll({ query: { hero: true } }), D()).length === 0);
check('solo disponibili esclude l\'esaurito',
  !C.prodottiDi(coll({ query: { inStock: true } }), D()).some(p => p.id === 7));

console.log('\n=== IL PREZZO: UN PRODOTTO SENZA CIFRA NON È ECONOMICO ===');
const sotto20 = C.prodottiDi(coll({ query: { prezzoMax: 20 } }), D());
check('sotto 20 prende i tre giusti', sotto20.length === 3, sotto20.map(p => p.id).join());
/* il difetto classico: price null diventa 0 e finisce fra gli economici */
check('un prodotto senza prezzo NON è «sotto 20»', !sotto20.some(p => p.id === 6));
check('sopra una soglia minima', C.prodottiDi(coll({ query: { prezzoMin: 50 } }), D()).length === 1);
check('una fascia di prezzo', C.prodottiDi(coll({ query: { prezzoMin: 10, prezzoMax: 30 } }), D()).length === 3);
check('esattamente alla soglia è dentro', C.prodottiDi(coll({ query: { prezzoMax: 4.5 } }), D()).length === 1);

console.log('\n=== PERSONALIZZABILI: IL CRITERIO ESISTE, IL DATO NO ===');
/* onestà: nessun prodotto dichiara di essere personalizzabile, quindi la
   collezione è vuota e NON si pubblica — non si apre una voce di menu
   verso una pagina vuota per far sembrare il Creator già collegato */
check('oggi non prende niente', C.prodottiDi(coll({ query: { personalizzabile: true } }), D()).length === 0);
check('ma funziona appena un prodotto lo dichiara',
  C.prodottiDi(coll({ query: { personalizzabile: true } }),
    { P: [...P, { id: 8, n: { it: 'Su misura' }, cat: 'casa', sub: 1, price: 20, personalizzabile: true }], CATS }).length === 1);

console.log('\n=== L\'ORDINE ===');
check('per prezzo crescente',
  C.prodottiDi(coll({ query: {}, ordine: 'prezzoSu' }), D())[0].id === 2);
check('per prezzo decrescente',
  C.prodottiDi(coll({ query: {}, ordine: 'prezzoGiu' }), D())[0].id === 3);
check('per novità è l\'id più alto', C.prodottiDi(coll({ query: {}, ordine: 'novita' }), D())[0].id === 7);
check('per recensioni', C.prodottiDi(coll({ query: {}, ordine: 'recensioni' }), D())[0].id === 1);
check('un ordinamento sconosciuto non svuota la collezione',
  C.prodottiDi(coll({ query: {}, ordine: 'a-caso' }), D()).length === 6);
check('gli ordinamenti sono dichiarati', C.ordinamenti().includes('prezzoSu'));
check('max taglia l\'elenco', C.prodottiDi(coll({ query: {}, max: 2 }), D()).length === 2);
check('max zero non taglia niente', C.prodottiDi(coll({ query: {}, max: 0 }), D()).length === 6);

console.log('\n=== UNA COLLEZIONE MANUALE È UNA VETRINA ===');
const man = C.prodottiDi(coll({ prodotti: [3, 1, 2] }), D());
check('tiene l\'ordine scritto', man.map(p => p.id).join() === '3,1,2');
check('vince sul criterio', C.prodottiDi(coll({ prodotti: [3], query: { cat: ['casa'] } }), D()).length === 1);
/* un id rimosso dal catalogo non deve diventare un buco nella griglia */
check('un id che non esiste più viene saltato',
  C.prodottiDi(coll({ prodotti: [3, 999, 1] }), D()).length === 2);
check('un id nascosto viene saltato', C.prodottiDi(coll({ prodotti: [5] }), D()).length === 0);
check('un ordinamento esplicito vince anche su una manuale',
  C.prodottiDi(coll({ prodotti: [3, 1, 2], ordine: 'prezzoSu' }), D())[0].id === 2);

console.log('\n=== UNA COLLEZIONE VUOTA NON SI PUBBLICA ===');
const vuota = coll({ id: 'vuota', query: { cat: ['b2b'] } });
check('pubblicata ma vuota resta fuori', C.pubblicate(D(vuota)).length === 0);
check('e viene segnalata come problema', C.problemi(D(vuota)).some(p => /nessun prodotto/.test(p)));
check('una bozza resta fuori', C.pubblicate(D({ id: 'b', stato: 'bozza', query: {} })).length === 0);
check('un\'archiviata resta fuori', C.pubblicate(D({ id: 'a', stato: 'archiviata', query: {} })).length === 0);
check('una senza stato resta fuori', C.pubblicate(D({ id: 'n', query: {} })).length === 0);
check('una piena e pubblicata entra', C.pubblicate(D(coll({ query: { cat: ['casa'] } }))).length === 1);
check('nessun dato non esplode', C.pubblicate({}).length === 0);
check('trova per id', C.trova('x', D(coll({ query: {} }))).id === 'x');
check('trova su un id inesistente dà null', C.trova('zzz', D(coll({ query: {} }))) === null);
/* L'indirizzo pubblico porta lo slug: accettare solo l'id significava che
   /shop?coll=edizioni-limitate mostrava il catalogo intero senza filtro e
   senza intestazione — nessun errore, solo il filtro che non c'era. */
check('trova anche per slug',
  C.trova('ed-lim', D(coll({ id: 'limited', slug: 'ed-lim', query: {} }))).id === 'limited');
check('l\'id vince sullo slug di un\'altra',
  C.trova('a', D(coll({ id: 'b', slug: 'a', query: {} }), coll({ id: 'a', query: {} }))).id === 'a');
check('trova su stringa vuota dà null', C.trova('', D(coll({ query: {} }))) === null);
check('il riferimento per gli indirizzi è lo slug', C.rifDi({ id: 'limited', slug: 'ed-lim' }) === 'ed-lim');
check('senza slug il riferimento è l\'id', C.rifDi({ id: 'casa' }) === 'casa');

console.log('\n=== IN EVIDENZA, NELL\'ORDINE DICHIARATO ===');
const tre = D(
  coll({ id: 'c', query: { cat: ['casa'] }, evidenza: true, posizione: 3 }),
  coll({ id: 'a', query: { cat: ['casa'] }, evidenza: true, posizione: 1 }),
  coll({ id: 'b', query: { cat: ['casa'] }, evidenza: false, posizione: 2 }),
);
check('solo quelle in evidenza', C.inEvidenza(tre).length === 2);
check('nell\'ordine di posizione', C.inEvidenza(tre).map(c => c.id).join() === 'a,c');
check('senza posizione va in fondo',
  C.inEvidenza(D(coll({ id: 'z', query: { cat: ['casa'] }, evidenza: true }),
                 coll({ id: 'a', query: { cat: ['casa'] }, evidenza: true, posizione: 1 }))).map(c => c.id).join() === 'a,z');
check('il massimo si rispetta', C.inEvidenza(tre, 1).length === 1);

console.log('\n=== IL COLLEGAMENTO ALL\'INDIETRO ===');
const due = D(coll({ id: 'casa', query: { cat: ['casa'] } }), coll({ id: 'best', query: { tag: ['Best'] } }));
check('un prodotto sa in quali collezioni sta', C.collezioniDi(P[0], due).length === 2);
check('un prodotto in una sola', C.collezioniDi(P[1], due).length === 0);
check('nessun prodotto non esplode', C.collezioniDi(null, due).length === 0);
/* un prodotto nascosto non deve «appartenere» a una collezione */
check('un nascosto non sta in nessuna collezione', C.collezioniDi(P[4], due).length === 0);

console.log('\n=== ROTTE E SEO ===');
check('la rotta usa lo slug', C.rottaDi({ id: 'limited', slug: 'edizioni-limitate' }) === '/collezioni/edizioni-limitate');
check('senza slug usa l\'id', C.rottaDi({ id: 'casa' }) === '/collezioni/casa');
const rotte = C.elencoRotte(D(coll({ id: 'casa', slug: 'casa', query: { cat: ['casa'] }, n: { it: 'Casa' } })));
check('l\'elenco rotte serve sitemap e prerender', rotte.length === 1 && rotte[0].prodotti === 3);
const sc = C.schema(coll({ id: 'casa', slug: 'casa', n: { it: 'Casa', en: 'Home' }, query: { cat: ['casa'] } }), D(), { base: 'https://x.it' });
check('è una CollectionPage', sc['@type'] === 'CollectionPage');
check('con l\'ItemList dei prodotti', sc.mainEntity.numberOfItems === 3);
check('l\'url è assoluto', sc['@id'] === 'https://x.it/collezioni/casa');
check('il titolo si traduce', C.schema(coll({ id: 'c', n: { it: 'Casa', en: 'Home' }, query: { cat: ['casa'] } }), D(), { L: 'en' }).name === 'Home');
/* nessuna Offer: il prezzo lo dichiara la scheda prodotto, e due
   dichiarazioni dello stesso prezzo prima o poi divergono */
check('nessun prezzo dichiarato nello schema', !JSON.stringify(sc).includes('Offer'));
check('una collezione vuota non produce schema', C.schema(coll({ id: 'v', query: { cat: ['b2b'] } }), D()) === null);
check('schema senza collezione dà null', C.schema(null, D()) === null);

console.log('\n=== I CONTROLLI CHE DEVE FARE IL CI ===');
check('una categoria che non esiste viene segnalata',
  C.problemi(D(coll({ id: 'k', query: { cat: ['turismo'] } }))).some(p => /turismo/.test(p)));
check('uno slug ripetuto viene segnalato',
  C.problemi(D(coll({ id: 'a', slug: 's', query: { cat: ['casa'] } }), coll({ id: 'b', slug: 's', query: { cat: ['casa'] } })))
    .some(p => /ripetuto/.test(p)));
check('un prodotto inesistente in una manuale viene segnalato',
  C.problemi(D(coll({ id: 'm', prodotti: [999] }))).some(p => /999/.test(p)));
check('un titolo italiano mancante viene segnalato',
  C.problemi(D(coll({ id: 't', query: { cat: ['casa'] } }))).some(p => /titolo/.test(p)));
check('un ordinamento sconosciuto viene segnalato',
  C.problemi(D(coll({ id: 'o', ordine: 'boh', n: { it: 'O' }, query: { cat: ['casa'] } }))).some(p => /boh/.test(p)));
check('una collezione senza id viene segnalata', C.problemi(D({ stato: 'pubblicata' })).length > 0);
check('dati buoni: nessun problema',
  C.problemi(D(coll({ id: 'ok', slug: 'ok', n: { it: 'Ok' }, query: { cat: ['casa'] } }))).length === 0);

console.log('\n=== LE COLLEZIONI PUBBLICATE, SUI DATI VERI ===');
const VERI = {
  P: JSON.parse(readFileSync('data/products.json', 'utf8')),
  CATS: JSON.parse(readFileSync('data/categories.json', 'utf8')),
  COLLEZIONI: JSON.parse(readFileSync('data/collezioni.json', 'utf8')),
};
check('i dati pubblicati non hanno problemi', C.problemi(VERI).length === 0, C.problemi(VERI).join(' | '));
const vive = C.pubblicate(VERI);
check('ci sono collezioni pubblicate', vive.length > 0, String(vive.length));
check('nessuna collezione pubblicata è vuota', vive.every(c => C.conta(c, VERI) > 0));
check('ogni collezione pubblicata ha una rotta unica',
  new Set(vive.map(C.rottaDi)).size === vive.length);
check('ogni collezione pubblicata ha titolo in due lingue',
  vive.every(c => C.lingua(c.n, 'it') && C.lingua(c.n, 'en')));
/* le categorie citate devono esistere: una rinominata svuota la collezione
   in silenzio, ed è il modo più facile di rompere un menu */
check('le categorie citate esistono tutte',
  vive.every(c => (c.query && c.query.cat || []).every(id => VERI.CATS.some(k => k.id === id))));
check('«personalizzabili» è ancora in bozza, perché il dato non c\'è',
  C.trova('personalizzabili', VERI).stato === 'bozza');
check('e quindi non è pubblicata', !vive.some(c => c.id === 'personalizzabili'));
/* /collezioni/matrimonio è la sottocategoria Nozze di Eventi: nessuna
   categoria «wedding» è stata inventata */
const wed = C.trova('wedding', VERI);
check('matrimonio riusa eventi + sottocategoria, non una categoria nuova',
  wed.query.cat[0] === 'eventi' && wed.query.sub[0] === 2);
check('e contiene prodotti veri', C.conta(wed, VERI) > 0, String(C.conta(wed, VERI)));

console.log('\n=== IL SITO CARICA LE COLLEZIONI ===');
const loader = readFileSync('assets/js/data-loader.js', 'utf8');
check('data-loader carica collezioni.json', /collezioni/.test(loader));
const build = readFileSync('scripts/build.mjs', 'utf8');
check('il wrapper legacy le porta con sé', /COLLEZIONI/.test(build));
const admin = readFileSync('admin.html', 'utf8');
check('l\'Admin le pubblica', /collezioni\.json|collezioni:/.test(admin));
const prod = readFileSync('assets/js/products.js', 'utf8');
check('la home disegna le schede dai dati', /collVive\(\)/.test(prod));
check('lo shop filtra per collezione', /F\.coll/.test(prod));
check('l\'indirizzo porta lo slug', /CL\.rifDi\(CL\.trova\(F\.coll/.test(prod));
const nav = readFileSync('assets/js/nav-ia.js', 'utf8');
check('il mega menu elenca le collezioni vere', /CL\.inEvidenza\(D, max\)/.test(nav));
/* due voci del menu principale puntavano a valori che nessun prodotto ha
   e che lo shop non leggeva affatto */
check('le vecchie voci morte non ci sono più',
  !/via\(base, 'shop\?coll=(regalo|limited)'\)/.test(nav));
const idx = readFileSync('index.html', 'utf8');
check('le schede della home non sono più scritte a mano',
  /id="collTabs"><\/div>/.test(idx.replace(/\s+/g, '')) || /id="collTabs"\s*><\/div>/.test(idx));
check('c\'è l\'intestazione della collezione nello shop', /id="shopCollBanner"/.test(idx));

console.log(`\n=========== COLLEZIONI: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
