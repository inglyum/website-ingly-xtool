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
/* Era in bozza perché nessun prodotto dichiarava di essere
   personalizzabile. Ora che lo dichiarano, si è accesa da sé — ed è il
   punto: la collezione segue il dato, non un interruttore. */
check('«personalizzabili» si è accesa', C.trova('personalizzabili', VERI).stato === 'pubblicata');
check('ed è pubblicata perché ha prodotti dentro',
  vive.some(c => c.id === 'personalizzabili') && C.conta(C.trova('personalizzabili', VERI), VERI) > 0,
  String(C.conta(C.trova('personalizzabili', VERI), VERI)));
/* togliendo le spunte tornerebbe vuota, e una collezione vuota non si
   pubblica: la regola regge nei due versi */
check('senza prodotti marcati tornerebbe fuori dalle pubblicate',
  !C.pubblicate({ ...VERI, P: VERI.P.map(p => ({ ...p, personalizzabile: false })) })
    .some(c => c.id === 'personalizzabili'));
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

console.log('\n=== LO SHOP: INGRESSO E FILTRI DEL TELEFONO ===');
const idx2 = readFileSync('index.html', 'utf8');
const prod2 = readFileSync('assets/js/products.js', 'utf8');
const css2 = readFileSync('assets/css/pages.css', 'utf8');
const resp2 = readFileSync('assets/css/responsive.css', 'utf8');

/* Lo shop apriva direttamente su 63 prodotti in griglia: chi arriva senza
   sapere cosa vuole non ha un punto di partenza. */
check('lo shop ha un ingresso visivo', /id="shopIntro"/.test(idx2));
check('le categorie dell\'ingresso arrivano dai dati', /id="shopCats"/.test(idx2) && /renderShopIntro/.test(prod2));
check('le collezioni dell\'ingresso arrivano dal motore', /CL\.inEvidenza\(window\.INGLY/.test(prod2));
/* una tessera che apre il vuoto è un vicolo cieco con una bella foto */
check('solo le categorie che hanno prodotti', /catCount\(c\.id\) ?> ?0/.test(prod2));
/* Shop ricostruito (lancio): l'ingresso non è più un blocco grande da
   ritirare, ma una riga di categorie compatta che resta in vista (è da lì
   che si cambia categoria); i filtri attivi compaiono come pastiglie
   togliibili sopra i prodotti, con «Azzera tutto». */
check('la riga delle categorie resta in vista e segna quella attiva', !/intro\.hidden ?= ?filtriAttivi/.test(prod2) && /class="scp\$\{attiva===c\.id\?' on':''\}"/.test(prod2));
check('i filtri attivi sono in vista e si tolgono uno per uno', /export function renderAttivi\(\)/.test(prod2) && /data-action="rm-filtro"/.test(prod2) && /data-action="reset-filters"/.test(prod2));

/* IL DIFETTO: sotto gli 820px `.filters` era display:none e NESSUNO
   metteva la classe `open`. Su telefono un catalogo da 63 prodotti non si
   poteva né cercare né filtrare. */
check('esisteva la regola che nasconde i filtri', /\.filters\{display:none\}/.test(resp2));
check('ora c\'è il pulsante che li apre', /data-action="filtri-apri"/.test(idx2));
check('e l\'azione è collegata', /'filtri-apri':/.test(readFileSync('assets/js/main.js', 'utf8')));
check('il pannello ha una via d\'uscita', /data-action="filtri-chiudi"/.test(idx2));
check('Esc chiude il pannello', /e\.key==='Escape'&&\$\('shopFiltri'\)/.test(prod2));
check('il pulsante dice quanti filtri sono attivi', /export function filtriAttivi/.test(prod2));
/* un pannello che non dice quanti prodotti restano obbliga a chiuderlo
   per scoprirlo */
check('il pannello dice quanti risultati restano', /id="fVediN"/.test(idx2));
/* un secondo insieme di filtri avrebbe voluto dire due verità su cosa è
   filtrato: il pannello è la STESSA colonna, spostata */
check('non c\'è un secondo insieme di filtri',
  (idx2.match(/id="fCat"/g) || []).length === 1 && (idx2.match(/id="q"/g) || []).length === 1);
check('le due tendine di ordinamento condividono lo stato',
  /\[\$\('sortSel'\),\$\('sortSelM'\)\]\.forEach\(riempiSort\)/.test(prod2));

/* `section.page` ha transform e filter per la transizione fra pagine, e un
   elemento con transform diventa il blocco contenitore dei suoi
   discendenti `fixed`: il pannello veniva alto 25.040 pixel — l'altezza
   della pagina, non dello schermo — con il ✕ fuori dalla portata. */
check('il pannello viene spostato sotto body quando si apre',
  /document\.body\.appendChild\(f\)/.test(prod2));
check('e torna al suo posto quando si chiude',
  /postoFiltri\.genitore\.insertBefore/.test(prod2));
check('il commento spiega perché, con la misura', /25\.040/.test(prod2));
check('anche il velo sta fuori dalla pagina',
  idx2.indexOf('class="filters-velo"') < idx2.indexOf('class="page" id="page-shop"'));
check('il pannello sta sotto il toast e sopra il contenuto',
  /z-index:var\(--z-overlay,110\)/.test(css2));

console.log('\n=== PERSONALIZZA: I PEZZI, LE FOTO VERE, NESSUNA PROMESSA ===');
const PV = JSON.parse(readFileSync('data/products.json', 'utf8'));
const marcati = PV.filter(p => p.personalizzabile === true && !p.hidden);
check('ci sono prodotti marcati «si personalizza»', marcati.length > 0, String(marcati.length));
/* la regola è scritta in uno script, non a mano nei dati: si rilegge, si
   ricorre e si corregge dall'Admin */
const rego = readFileSync('scripts/marca-personalizzabili.mjs', 'utf8');
check('la regola è uno script verificabile', /SEGNALI/.test(rego));
check('lo script non tocca chi è già stato deciso a mano',
  /hasOwnProperty\.call\(p, 'personalizzabile'\)/.test(rego));
check('lo script ha un\'anteprima prima di scrivere', /--scrivi/.test(rego));
/* ogni prodotto marcato deve dire nel PROPRIO testo che aspetta qualcosa
   dal cliente: se non lo dice, è una promessa che non viene dal catalogo */
const SEG = /personalizzat|personalizzabil|su misura|\bnome\b|con il tuo|a tua scelta|con scritta|con frase|dedica|con data|anniversario|nascita|battesimo|laurea|matrimonio|nozze|comunione|compleanno|ritratto|con foto|da foto|silhouette|litofania|logo|branding|aziendal|corporate|\bqr\b|profilo digitale|menu digitale|monogramm|iniziali/i;
const senzaProva = marcati.filter(p => !SEG.test([p.n && p.n.it, p.n && p.n.en, p.desc && p.desc.it, p.desc && p.desc.en].filter(Boolean).join(' ')));
check('ogni marcato lo dichiara nel proprio testo', senzaProva.length === 0, senzaProva.map(p => p.id).join());

const perJs = readFileSync('assets/js/products.js', 'utf8');
/* la vetrina usa fotografie di pezzi usciti davvero dall'officina: niente
   immagini di repertorio, niente mockup generati */
check('la vetrina viene dal portfolio vero', /window\.INGLY\.PORT/.test(perJs));
check('una foto che non esiste non diventa una tessera', /esisteFoto\(r\[3\]\)/.test(perJs));
/* due racconti dello stesso processo divergono al primo aggiornamento */
check('i passi sono quelli già dichiarati in content.json', /window\.INGLY\.STEPS/.test(perJs));
check('i titoli del portfolio sono messi al sicuro', /const esc = t =>/.test(perJs));
check('53 pezzi non stanno in una griglia sola: ci sono i filtri', /'per-cat'/.test(readFileSync('assets/js/main.js', 'utf8')));
check('quello che il catalogo non copre porta al preventivo', /perCoda/.test(perJs));

console.log('\n=== I PASSI NON PROMETTONO QUELLO CHE NON C\'È ===');
const steps = JSON.parse(readFileSync('data/content.json', 'utf8')).STEPS || [];
const testoPassi = JSON.stringify(steps);
/* il configuratore non esiste ancora: prometterlo nel primo passo della
   lavorazione, per giunta sulla pagina Personalizza, è la bugia più
   facile da raccontare e la più cara da scoprire */
check('non promettono un configuratore che non esiste', !/configurator/i.test(testoPassi));
/* i materiali sono nove: un numero scritto a mano invecchia da solo */
check('non dichiarano «otto materiali»', !/otto material|eight certified material/i.test(testoPassi));
check('i passi ci sono ancora', steps.length >= 4, String(steps.length));

console.log(`\n=========== COLLEZIONI: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
