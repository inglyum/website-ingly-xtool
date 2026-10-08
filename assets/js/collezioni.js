/* ============ COLLECTION ENGINE ============

   Una collezione è una DOMANDA sul catalogo, non un secondo elenco di
   prodotti.

   Oggi le «collezioni» della home sono un campo `coll` scritto a mano sui
   prodotti, e dice una cosa diversa dal campo `tag` che sta sulla stessa
   riga: `coll` segna 7 best e 2 novità, `tag` segna 10 Best, 3 New e 4
   Limited. Due verità sullo stesso prodotto, mantenute a mano, che
   divergono appena qualcuno aggiorna una sola delle due — ed è già
   successo. Peggio: nessun prodotto ha `coll: ['limited']`, quindi una
   scheda «Edizioni limitate» alimentata da `coll` sarebbe uscita vuota su
   quattro prodotti che esistono.

   Qui una collezione dichiara un criterio e il criterio legge il catalogo.
   Niente prodotti duplicati, niente terza lista da tenere allineata: si
   aggiunge un prodotto con la sua categoria e il suo prezzo, e le
   collezioni si aggiornano da sole.

   Due tipi, entrambi necessari:
     dinamica  un criterio (`query`) — si aggiorna da sola
     manuale   un elenco di id (`prodotti`) — per una vetrina curata

   Funzioni pure, nessun DOM: tests/test-collezioni.mjs. */

const str = v => (v == null ? '' : String(v));
const arr = v => (Array.isArray(v) ? v : []);
const nums = v => arr(v).map(Number).filter(Number.isFinite);
/* Il prezzo di un prodotto, oppure NaN se non ne ha uno. NaN perde ogni
   confronto, che è esattamente il comportamento voluto: «senza prezzo» non
   è né sotto né sopra una soglia. */
const prezzo = p => {
  if (p == null || p.price == null || p.price === '') return NaN;
  const v = Number(p.price);
  return Number.isFinite(v) ? v : NaN;
};

/** Il nome nella lingua richiesta, con l'italiano di riserva. */
export const lingua = (v, L = 'it') =>
  v == null ? '' : (typeof v === 'string' ? v : str(v[L] || v.it || v.en || ''));

/* ---------- 1. il criterio ---------- */

/**
 * Un prodotto soddisfa il criterio?
 *
 * I criteri sono in AND fra loro e in OR dentro ciascuno: `cat:['casa','b2b']`
 * vuol dire «casa oppure b2b», `{cat:['eventi'], sub:[2]}` vuol dire
 * «eventi E sottocategoria 2». È la combinazione che serve per /wedding, che
 * è la sottocategoria Nozze di Eventi e non una categoria a sé.
 *
 * Un criterio vuoto prende tutto il catalogo visibile: è la collezione
 * «tutti i prodotti», che è legittima.
 */
export function soddisfa(p, query = {}) {
  if (!p || p.hidden) return false;
  const q = query && typeof query === 'object' ? query : {};

  if (arr(q.cat).length && !arr(q.cat).includes(p.cat)) return false;
  if (nums(q.sub).length && !nums(q.sub).includes(Number(p.sub))) return false;
  if (arr(q.mat).length && !arr(q.mat).includes(p.mat)) return false;
  /* i tag hanno la maiuscola nei dati ('Best'), ma chi scrive una
     collezione non deve indovinarla */
  if (arr(q.tag).length && !arr(q.tag).some(t => str(t).toLowerCase() === str(p.tag).toLowerCase())) return false;
  if (arr(q.coll).length && !arr(q.coll).some(c => arr(p.coll).includes(c))) return false;
  if (q.hero === true && !p.hero) return false;
  /* Un prodotto senza prezzo non è «sotto 20 euro»: è senza prezzo.
     `Number(null)` fa 0, che è un numero finito: con il solo isFinite ogni
     prodotto a prezzo da concordare finiva fra quelli economici. */
  if (q.prezzoMax != null && !(prezzo(p) <= Number(q.prezzoMax))) return false;
  if (q.prezzoMin != null && !(prezzo(p) >= Number(q.prezzoMin))) return false;
  if (q.personalizzabile === true && !(p.personalizzabile || p.creator)) return false;
  if (q.inStock === true && p.stock === 0) return false;
  return true;
}

/* ---------- 2. l'ordinamento ---------- */

/* Confronta due prezzi tenendo i «senza prezzo» in fondo, in ENTRAMBI i
   versi dell'ordinamento. */
const perPrezzo = verso => (a, b) => {
  const x = prezzo(a), y = prezzo(b);
  if (Number.isNaN(x) && Number.isNaN(y)) return 0;
  if (Number.isNaN(x)) return 1;
  if (Number.isNaN(y)) return -1;
  return verso * (x - y);
};

const ORDINI = {
  rilevanza: (a, b) => (b.rev || 0) - (a.rev || 0),
  /* Chi ordina per prezzo vuole vedere le cifre. Un prodotto senza prezzo
     va in fondo in entrambi i versi: in testa a «dal più economico»
     sarebbe il primo risultato senza numero di una lista di numeri. */
  prezzoSu:  perPrezzo(1),
  prezzoGiu: perPrezzo(-1),
  novita:    (a, b) => (b.id || 0) - (a.id || 0),
  recensioni:(a, b) => (b.rev || 0) - (a.rev || 0),
  manuale:   null,     /* l'ordine dichiarato nell'elenco, non toccato */
};

export const ordinamenti = () => Object.keys(ORDINI);

/* ---------- 3. i prodotti di una collezione ---------- */

/**
 * I prodotti di una collezione, nell'ordine giusto.
 *
 * Una collezione manuale tiene l'ordine in cui gli id sono scritti: è una
 * vetrina, e l'ordine è una scelta. Un id che non esiste più viene
 * saltato in silenzio — non si disegna un buco al suo posto.
 */
export function prodottiDi(c = {}, D = {}) {
  const tutti = arr(D.P || D.PRODUCTS);
  let out;

  const manuali = nums(c.prodotti);
  if (manuali.length) {
    out = manuali.map(id => tutti.find(p => p && p.id === id)).filter(p => p && !p.hidden);
  } else {
    out = tutti.filter(p => soddisfa(p, c.query));
  }

  const cmp = ORDINI[str(c.ordine) || 'rilevanza'];
  if (cmp && !manuali.length) out = [...out].sort(cmp);
  else if (cmp && manuali.length && c.ordine && c.ordine !== 'manuale') out = [...out].sort(cmp);

  const max = Number(c.max);
  return Number.isFinite(max) && max > 0 ? out.slice(0, max) : out;
}

export const conta = (c, D) => prodottiDi(c, D).length;

/* ---------- 4. quali collezioni esistono davvero ---------- */

/**
 * Le collezioni pubblicabili.
 *
 * Due regole, entrambe per non pubblicare pagine vuote:
 *  - `stato` diverso da 'pubblicata' resta fuori (bozza, archiviata);
 *  - una collezione **senza prodotti resta fuori** anche se pubblicata.
 *    Una pagina di collezione vuota è un vicolo cieco con un titolo: il
 *    visitatore ci arriva da un menu, non trova niente e non capisce se è
 *    rotto o se non c'è nulla in vendita. Meglio che la voce non ci sia.
 */
export function pubblicate(D = {}) {
  const liste = arr(D.COLLEZIONI && D.COLLEZIONI.collezioni);
  return liste.filter(c => c && c.id && c.stato === 'pubblicata' && conta(c, D) > 0);
}

/**
 * Una collezione, cercata per id **oppure per slug**.
 *
 * L'indirizzo pubblico porta lo slug (`?coll=edizioni-limitate`), perché è
 * quello che una persona legge e incolla; il codice e l'Admin lavorano con
 * l'id. Accettare solo l'id significava che un indirizzo con lo slug
 * mostrava il catalogo intero senza filtro e senza intestazione: nessun
 * errore, nessun segnale, solo il filtro che non c'era.
 */
export const trova = (rif, D = {}) => {
  const k = str(rif);
  if (!k) return null;
  const liste = arr(D.COLLEZIONI && D.COLLEZIONI.collezioni);
  return liste.find(c => c && c.id === k) || liste.find(c => c && c.slug === k) || null;
};

/** Il riferimento da mettere in un indirizzo: lo slug se c'è. */
export const rifDi = c => str(c && (c.slug || c.id));

/** Le collezioni da mettere in evidenza, nell'ordine dichiarato. */
export function inEvidenza(D = {}, max = 6) {
  return pubblicate(D)
    .filter(c => c.evidenza)
    .sort((a, b) => (Number(a.posizione) || 99) - (Number(b.posizione) || 99))
    .slice(0, max);
}

/** Le collezioni che contengono un prodotto: il cross-link all'indietro. */
export function collezioniDi(p, D = {}) {
  if (!p) return [];
  return pubblicate(D).filter(c => prodottiDi(c, D).some(x => x.id === p.id));
}

/* ---------- 5. rotte ---------- */

export const rottaDi = c => '/collezioni/' + str(c && (c.slug || c.id));

/** Tutte le rotte da dare a sitemap e prerender. */
export function elencoRotte(D = {}) {
  return pubblicate(D).map(c => ({
    rotta: rottaDi(c),
    titolo: c.n,
    descrizione: c.s,
    prodotti: conta(c, D),
  }));
}

/* ---------- 6. SEO ---------- */

/**
 * I dati strutturati di una collezione: `CollectionPage` con l'`ItemList`
 * dei prodotti.
 *
 * Nessuna `Offer` con prezzo qui: la cifra la dichiara la scheda prodotto,
 * e dichiararla due volte significa dichiararla diversa il giorno in cui
 * una delle due resta indietro.
 */
export function schema(c, D = {}, opt = {}) {
  const { L = 'it', base = '' } = opt;
  if (!c) return null;
  const items = prodottiDi(c, D);
  if (!items.length) return null;
  const url = str(base).replace(/\/+$/, '') + rottaDi(c);
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': url,
    name: lingua(c.n, L),
    description: lingua(c.s, L),
    url,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: items.length,
      itemListElement: items.slice(0, 30).map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        name: lingua(p.n, L),
      })),
    },
  };
}

/* ---------- 7. controlli, per il CI e per l'Admin ---------- */

/**
 * Che cosa non torna nelle collezioni dichiarate.
 *
 * Serve prima della pubblicazione: una collezione che punta a una categoria
 * rinominata non dà errore, dà una pagina vuota. Lo stesso per uno slug
 * ripetuto, che fa vincere l'ultima e perdere la prima senza dirlo.
 */
export function problemi(D = {}) {
  const liste = arr(D.COLLEZIONI && D.COLLEZIONI.collezioni);
  const cats = arr(D.CATS).map(c => c.id);
  const out = [];
  const visti = new Set();

  liste.forEach(c => {
    if (!c || !c.id) { out.push('una collezione senza id'); return; }
    const chiave = str(c.slug || c.id);
    if (visti.has(chiave)) out.push(`slug ripetuto: ${chiave}`);
    visti.add(chiave);
    if (!lingua(c.n, 'it')) out.push(`${c.id}: manca il titolo italiano`);

    arr(c.query && c.query.cat).forEach(id => {
      if (!cats.includes(id)) out.push(`${c.id}: la categoria «${id}» non esiste`);
    });
    nums(c.prodotti).forEach(id => {
      if (!arr(D.P).some(p => p && p.id === id)) out.push(`${c.id}: il prodotto ${id} non esiste`);
    });
    if (c.ordine && !ORDINI.hasOwnProperty(c.ordine)) out.push(`${c.id}: ordinamento sconosciuto «${c.ordine}»`);
    if (c.stato === 'pubblicata' && conta(c, D) === 0) {
      out.push(`${c.id}: pubblicata ma non contiene nessun prodotto`);
    }
  });

  return out;
}
