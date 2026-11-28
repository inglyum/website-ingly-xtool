/* ATMOSFERE DEL SITO — colori della modalità scura che cambiano con la stagione.
   Il titolare sceglie dall'Admin (Temi → «Atmosfera del sito»):
   - modo «auto»: vale l'atmosfera del calendario che contiene la data di oggi,
     altrimenti la base (Aurora mediterranea);
   - modo «fissa»: sempre l'atmosfera scelta.
   I colori veri stanno in restyle-2026.css ([data-atmosfera="…"]), con i
   contrasti verificati da tests/test-atmosfere.mjs. Qui ci sono solo i nomi,
   i colori per le anteprime dell'Admin e la regola del calendario. */

export const BASE = 'aurora';

export const ATMOSFERE = [
  { id: 'aurora', n: { it: 'Aurora mediterranea', en: 'Mediterranean aurora' }, colori: ['#0b1b1f', '#eaa95c', '#268c8c'] },
  { id: 'natale', n: { it: 'Natale', en: 'Christmas' }, colori: ['#0b1a14', '#e6b65e', '#c83434'] },
  { id: 'inverno', n: { it: 'Inverno', en: 'Winter' }, colori: ['#0c1726', '#9dd2f7', '#4682d2'] },
  { id: 'sanvalentino', n: { it: 'San Valentino', en: 'Valentine’s Day' }, colori: ['#17122a', '#ff9aa8', '#823caa'] },
  { id: 'primavera', n: { it: 'Primavera', en: 'Spring' }, colori: ['#0d1c18', '#f2a7bf', '#3c966e'] },
  { id: 'estate', n: { it: 'Estate', en: 'Summer' }, colori: ['#081f2a', '#f6c254', '#148caa'] },
  { id: 'autunno', n: { it: 'Autunno', en: 'Autumn' }, colori: ['#17110e', '#ec8a52', '#aa5028'] },
];

/* calendario di partenza: date «MM-GG», anche a cavallo d'anno */
export const CALENDARIO_BASE = [
  { id: 'natale', dal: '12-01', al: '01-06' },
  { id: 'sanvalentino', dal: '02-01', al: '02-15' },
  { id: 'primavera', dal: '03-20', al: '05-31' },
  { id: 'estate', dal: '06-15', al: '09-15' },
];

const esiste = id => ATMOSFERE.some(a => a.id === id);
const mmgg = d => String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const dataValida = s => typeof s === 'string' && /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(s);
const dentro = (oggi, dal, al) => dal <= al ? (oggi >= dal && oggi <= al) : (oggi >= dal || oggi <= al);

/** L'atmosfera da mostrare oggi secondo la configurazione (mai un id sconosciuto). */
export function atmosferaDi(cfg, data = new Date()) {
  const a = (cfg && cfg.atmosfera) || {};
  if (a.modo === 'fissa') return esiste(a.fissa) ? a.fissa : BASE;
  const cal = Array.isArray(a.calendario) ? a.calendario : CALENDARIO_BASE;
  const oggi = mmgg(data);
  const voce = cal.find(v => v && esiste(v.id) && dataValida(v.dal) && dataValida(v.al) && dentro(oggi, v.dal, v.al));
  return voce ? voce.id : BASE;
}

/** Mette l'atmosfera sulla pagina e la ricorda per il prossimo caricamento (niente lampo di colore). */
export function applicaAtmosfera(cfg, root = document.documentElement) {
  /* anteprima dall'Admin: ?atmosfera=natale vale solo per questa visita */
  let prova = '';
  try { prova = new URLSearchParams(location.search).get('atmosfera') || ''; } catch (e) { /* niente */ }
  if (esiste(prova)) {
    if (prova === BASE) root.removeAttribute('data-atmosfera'); else root.setAttribute('data-atmosfera', prova);
    return prova;
  }
  const id = atmosferaDi(cfg);
  if (id === BASE) root.removeAttribute('data-atmosfera'); else root.setAttribute('data-atmosfera', id);
  try { localStorage.setItem('ingly_atmo', id); } catch (e) { /* navigazione privata */ }
  return id;
}
