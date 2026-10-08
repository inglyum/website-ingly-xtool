/* ============ STATO DEL SITO: CONTATORI E MANUTENZIONE ============

   Due cose che sembravano scollegate e sono lo stesso problema: un numero
   visibile che non viene da dove viene il contenuto.

   I CONTATORI erano scritti a mano nell'HTML. «Materiali 8» mentre i
   materiali in catalogo sono nove: nessuno se ne accorge finché non li
   conta, e intanto il sito dichiara una cosa e ne mostra un'altra. Peggio:
   il valore a riposo era `0`, e l'animazione lo portava al numero vero solo
   se l'IntersectionObserver scattava. Chi arrivava con la sezione già a
   schermo, o scorreva in fretta, o leggeva la pagina statica senza eseguire
   JavaScript, vedeva **zero prodotti** su un catalogo pieno.

   La MANUTENZIONE era decisa da uno script a parte che leggeva config.json
   per conto suo, con un catch vuoto. Due conseguenze, entrambe viste:
   se il file non arrivava la manutenzione non compariva pur essendo accesa;
   e quando compariva, copriva un sito che sotto continuava a funzionare —
   catalogo caricato, immagini scaricate, pagina indicizzabile. Un velo
   sopra una bugia.

   Qui le due cose nascono dagli stessi dati che disegnano il sito.
   Funzioni pure: verificate in tests/test-stato.mjs. */

/** I conteggi che il sito può dimostrare, perché li legge dove sta il contenuto. */
export function conteggi(D = {}) {
  const prodotti = (D.P || D.PRODUCTS || []).filter(p => p && !p.hidden);
  return {
    prodotti: prodotti.length,
    categorie: (D.CATS || []).length,
    materiali: ((D.MATERIALI && D.MATERIALI.materiali) || []).length,
    tecnologie: ((D.TECNOLOGIE && D.TECNOLOGIE.tecnologie) || []).length,
    macchine: ((D.MACCHINE && D.MACCHINE.catalogo) || []).length,
    inOfficina: ((D.MACCHINE && D.MACCHINE.catalogo) || []).filter(m => m && m.inOfficina).length,
    corsi: ((D.CORSI && D.CORSI.corsi) || []).filter(c => c && c.stato === 'pubblicato').length
  };
}

/**
 * I contatori da mostrare.
 *
 * Due categorie, trattate in modo diverso:
 *  - quelli DIMOSTRABILI (prodotti, materiali, tecnologie) si contano;
 *  - quelli DICHIARATI (pezzi prodotti, clienti, puntualità) sono
 *    affermazioni commerciali: vivono in config.stats, li scrive una
 *    persona nell'Admin, e se non ci sono il contatore non compare.
 *    Un numero inventato nell'HTML è una promessa che nessuno ha fatto.
 */
export function contatori(D = {}, L = 'it') {
  const n = conteggi(D);
  const s = (D.CONFIG && D.CONFIG.stats) || {};
  const t = (it, en) => (L === 'en' ? en : it);
  const out = [];

  const dimostrabile = (v, et, suf) => { if (v > 0) out.push({ n: v, etichetta: et, suffisso: suf || '', fonte: 'dati' }); };
  const dichiarato = (k, et, suf) => {
    const v = Number(s[k]);
    if (Number.isFinite(v) && v > 0) out.push({ n: v, etichetta: et, suffisso: suf || '', fonte: 'config' });
  };

  dichiarato('pezzi', t('Pezzi prodotti', 'Pieces produced'), '+');
  dichiarato('clienti', t('Clienti business', 'Business clients'), '+');
  dimostrabile(n.materiali, t('Materiali', 'Materials'));
  dimostrabile(n.tecnologie, t('Tecnologie', 'Technologies'));
  dichiarato('puntualita', t('Consegne puntuali', 'On-time deliveries'), '%');

  return out.slice(0, 4);
}

/* ---------- manutenzione ---------- */

/**
 * Lo stato di manutenzione, letto da config dentro la pipeline del sito.
 * @returns {{attiva:boolean, titolo:string, messaggio:string, whatsapp:boolean}}
 */
export function manutenzione(D = {}, L = 'it') {
  const m = (D.CONFIG && D.CONFIG.maintenance) || {};
  const loc = v => (v && (v[L] || v.it)) || '';
  return {
    attiva: m.attivo === true,
    titolo: loc(m.titolo) || (L === 'en' ? 'Site under maintenance' : 'Sito in manutenzione'),
    messaggio: loc(m.messaggio),
    whatsapp: m.mostraWhatsapp !== false
  };
}

/**
 * Decide che cosa deve succedere, e lo dice senza ambiguità.
 *
 * Il punto: un sito «in manutenzione» che sotto il velo continua a
 * caricare il catalogo non è in manutenzione, è un sito funzionante con un
 * cartello davanti. O si ferma, o non lo si dichiara.
 *
 * @returns {'normale'|'ferma'} — 'ferma' significa: non avviare il sito.
 */
export function modalita(D = {}) {
  return manutenzione(D).attiva ? 'ferma' : 'normale';
}
