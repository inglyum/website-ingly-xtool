/* ============ FORNITURE — materiali da comprare, con link di affiliazione ============

   La vetrina dei consumabili che usiamo e consigliamo: fogli di legno e
   acrilico, oggetti da personalizzare, minuterie, finiture. Non li spediamo
   noi: il cliente compra direttamente dal negozio (Amazon.it, xTool…) e
   INGLY riceve una commissione dal programma di affiliazione.

   Scelte che non si toccano:
   - L'avviso di affiliazione è SEMPRE visibile sulla pagina e su ogni
     scheda dice dove si compra. Lo chiedono l'accordo Amazon Associates
     (senza, l'account viene chiuso e le commissioni perse) e la legge sulla
     pubblicità trasparente. Lo stile e la scelta sono INGLY; il venditore
     è il negozio.
   - Niente prezzi e niente foto prese dai negozi: cambiano ogni giorno e i
     programmi li permettono solo tramite le loro API. Le schede usano le
     tinte dei materiali del sito.
   - Un link esce SOLO verso i domini dichiarati per quel negozio, in https.
     Un indirizzo scritto male nell'Admin non diventa un link.
   - «Lo usiamo in laboratorio» compare solo se il titolare lo ha spuntato.

   I dati stanno in content.json → FORNITURE. Il codice affiliato (per
   Amazon il «tag», es. inglydesign-21) è un identificativo pubblico, non
   una chiave segreta: può stare nel sito (regola 6 rispettata).

   Funzioni pure: tests/test-forniture.mjs. */

export function lingua(v, L = 'it') {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  return String(v[L] || v.it || v.en || '');
}

const vuoto = () => ({ negozi: [], categorie: [], articoli: [] });

/**
 * L'interruttore dell'Admin: FORNITURE.attivo === true accende la sezione.
 * Spenta, sparisce tutto insieme: pagina, voce di menu, «Dove comprarlo»
 * nei materiali e «Materiali consigliati» nello Studio. Il valore di serie è
 * spento: l'affiliazione si attiva quando il titolare ha i codici.
 */
export const visibile = (D = {}) => {
  const F = D && (D.FORNITURE || (D.C && D.C.FORNITURE));
  return !!(F && typeof F === 'object' && F.attivo === true);
};
export const dati = (D = {}) => {
  const F = D && (D.FORNITURE || (D.C && D.C.FORNITURE));
  if (!F || typeof F !== 'object' || Array.isArray(F)) return vuoto();
  return {
    ...F,
    negozi: Array.isArray(F.negozi) ? F.negozi.filter(n => n && n.id) : [],
    categorie: Array.isArray(F.categorie) ? F.categorie.filter(c => c && c.id) : [],
    articoli: Array.isArray(F.articoli) ? F.articoli.filter(a => a && a.id) : [],
  };
};

export const negozio = (F, id) => (F.negozi || []).find(n => n.id === id && n.attivo !== false) || null;

const CODICE = /^[A-Za-z0-9._-]{1,64}$/;
export const codiceValido = c => CODICE.test(String(c || '').trim());

/** L'indirizzo appartiene al negozio? Solo https e solo i suoi domini. */
export function dominioAmmesso(url, neg) {
  if (!neg) return false;
  let u;
  try { u = new URL(String(url || '')); } catch (e) { return false; }
  if (u.protocol !== 'https:' || u.username || u.password) return false;
  const h = u.hostname.toLowerCase();
  return (neg.domini || []).some(d => { d = String(d || '').toLowerCase(); return d && (h === d || h.endsWith('.' + d)); });
}

/**
 * Il link da mettere sul pulsante, già con il codice affiliato.
 * Vuoto se qualcosa non torna: meglio nessun pulsante che un link sbagliato.
 */
export function link(a, F) {
  const neg = negozio(F, a && a.negozio);
  if (!neg) return '';
  let url = String((a && a.url) || '').trim();
  if (!url && a && a.ricerca && neg.ricerca && /\{q\}/.test(neg.ricerca)) {
    url = neg.ricerca.replace('{q}', encodeURIComponent(String(a.ricerca).trim()).replace(/%20/g, '+'));
  }
  if (!url || !dominioAmmesso(url, neg)) return '';
  const u = new URL(url);
  if (neg.parametro && codiceValido(neg.codice) && !u.searchParams.has(neg.parametro)) u.searchParams.set(neg.parametro, String(neg.codice).trim());
  return u.href;
}

/** Il link porta una commissione? (serve a contare e a dirlo bene nell'avviso) */
export const affiliato = (a, F) => {
  const neg = negozio(F, a && a.negozio);
  if (!neg) return false;
  if (neg.parametro) return codiceValido(neg.codice);
  return neg.affiliato === true;
};

/** Gli articoli che si vedono: attivi, con un link valido, filtrabili. */
export function articoli(F, filtro = {}) {
  const { cat, materiale, generatore } = filtro;
  if (!F || F.attivo !== true) return [];
  return (F.articoli || [])
    .filter(a => a.stato === 'attivo' && link(a, F))
    .filter(a => !cat || a.cat === cat)
    .filter(a => !materiale || (a.materiali || []).includes(materiale))
    .filter(a => !generatore || (a.generatori || []).includes(generatore))
    .sort((x, y) => (Number(x.ordine) || 0) - (Number(y.ordine) || 0));
}

/** Le categorie che hanno almeno un articolo visibile, nell'ordine dichiarato. */
export const categorieVive = F => (F.categorie || []).filter(c => articoli(F, { cat: c.id }).length);

/** I negozi effettivamente usati dagli articoli visibili. */
export const negoziUsati = F => [...new Set(articoli(F).map(a => a.negozio))].map(id => negozio(F, id)).filter(Boolean);

/**
 * L'avviso, sempre presente quando c'è almeno un articolo.
 * Per Amazon contiene la frase richiesta dall'accordo operativo.
 */
export function avviso(F, L = 'it') {
  const usati = negoziUsati(F);
  if (!usati.length) return '';
  /* nessun codice ancora inserito: niente commissioni, quindi non si dichiarano */
  const conCommissione = articoli(F).some(a => affiliato(a, F));
  if (!conCommissione) return L === 'en'
    ? 'Products are sold and shipped by the store shown on each card. INGLY DESIGN selects them and adds its workshop tips.'
    : 'I prodotti sono venduti e spediti dal negozio indicato su ogni scheda. INGLY DESIGN li seleziona e aggiunge i consigli del suo laboratorio.';
  const base = lingua(F.avviso, L) || (L === 'en'
    ? 'Some links on this page are affiliate links: if you buy, the price stays the same for you and INGLY DESIGN may receive a small commission. Products are sold and shipped by the store shown on each card.'
    : 'Alcuni link di questa pagina sono link di affiliazione: se acquisti, per te il prezzo non cambia e INGLY DESIGN può ricevere una piccola commissione. I prodotti sono venduti e spediti dal negozio indicato su ogni scheda.');
  const amazon = usati.some(n => n.id === 'amazon' && codiceValido(n.codice))
    ? (L === 'en' ? ' As an Amazon Associate INGLY DESIGN earns from qualifying purchases.' : ' In qualità di Affiliato Amazon, INGLY DESIGN riceve un guadagno dagli acquisti idonei.')
    : '';
  return base + amazon;
}

/** Nome del negozio per il pulsante: «Vedi su Amazon.it». */
export const nomeNegozio = (a, F) => (negozio(F, a && a.negozio) || {}).nome || '';

/** Il nome dell'evento statistico per il clic (GoatCounter accetta solo a-z0-9-). */
export const evento = a => ('fornitura-' + String((a && a.negozio) || 'negozio') + '-' + String((a && a.id) || '')).toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 60);

/** Problemi da mostrare nell'Admin prima di pubblicare. */
export function problemi(F) {
  const out = [];
  const ids = new Set();
  for (const a of F.articoli || []) {
    if (ids.has(a.id)) out.push({ grave: true, testo: 'Articolo ripetuto: ' + a.id });
    ids.add(a.id);
    if (!negozio(F, a.negozio)) out.push({ grave: true, testo: a.id + ': negozio sconosciuto o spento (' + a.negozio + ')' });
    else if (a.stato === 'attivo' && !link(a, F)) out.push({ grave: true, testo: a.id + ': il link non è del negozio indicato o non è https' });
    if (!lingua(a.n, 'it')) out.push({ grave: true, testo: a.id + ': manca il nome' });
    if (a.n && !a.n.en) out.push({ grave: false, testo: a.id + ': manca il nome in inglese' });
    if (a.cat && !(F.categorie || []).some(c => c.id === a.cat)) out.push({ grave: false, testo: a.id + ': categoria inesistente (' + a.cat + ')' });
  }
  for (const n of F.negozi || []) {
    if (n.parametro && n.codice && !codiceValido(n.codice)) out.push({ grave: true, testo: n.nome + ': codice affiliato non valido' });
    if (n.parametro && !n.codice && (F.articoli || []).some(a => a.negozio === n.id && a.stato === 'attivo')) out.push({ grave: false, testo: n.nome + ': manca il codice affiliato, i link funzionano ma non portano commissioni' });
  }
  return out;
}

/** HTML della scheda di un articolo (sito, pagine statiche e Studio usano lo stesso). */
export function scheda(a, F, { L = 'it', esc, tinta = '', compatta = false, reveal = false } = {}) {
  const e = esc || (s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
  const href = link(a, F);
  if (!href) return '';
  const vai = L === 'en' ? 'See it on ' : 'Vedi su ';
  const nostra = a.provato ? `<span class="forn-prova">${L === 'en' ? 'We use it in our workshop' : 'Lo usiamo in laboratorio'}</span>` : '';
  const consiglio = lingua(a.consiglio, L);
  return `<article class="forn-card${compatta ? ' forn-card--mini' : ''}${reveal ? ' reveal' : ''}">
  <div class="forn-tinta" style="--forn-tinta:${e(tinta || 'var(--rs-bg-2)')}" aria-hidden="true"><span>${e(a.icona || '◇')}</span></div>
  <div class="forn-corpo">
    ${nostra}
    <h3>${e(lingua(a.n, L))}</h3>
    ${lingua(a.desc, L) ? `<p>${e(lingua(a.desc, L))}</p>` : ''}
    ${consiglio && !compatta ? `<p class="forn-consiglio"><b>${L === 'en' ? 'INGLY tip' : 'Il consiglio INGLY'}</b> ${e(consiglio)}</p>` : ''}
    <a class="btn btn-ghost forn-vai" href="${e(href)}" target="_blank" rel="sponsored nofollow noopener" data-forn="${e(evento(a))}">${vai}${e(nomeNegozio(a, F))} <span aria-hidden="true">↗</span></a>
  </div>
</article>`;
}
