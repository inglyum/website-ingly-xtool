/* ============ FILE DIGITALI — IL MOTORE ============

   Legge data/digitale.json e risponde alle domande che la pagina pone:
   quali bundle si possono mostrare, cosa c'è dentro, su che macchina
   funzionano, cosa puoi farne, e — la domanda che prima nessuno poneva —
   come arrivano al cliente.

   DUE CONDIZIONI TECNICHE, non estetiche:

   · un bundle NON compare se `stato` non è 'pubblicato'. Così un bundle
     incompleto può stare nei dati senza finire sul sito;

   · un bundle NON mostra il bottone d'acquisto se `consegna.modo` è
     'nessuna'. Prima la pagina scriveva «Download istantaneo» e il bottone
     metteva la riga in un carrello che finisce su WhatsApp: il download non
     esisteva. Un bottone che promette una cosa che non succede è peggio di
     un bottone che non c'è, perché il cliente lo scopre dopo aver pagato.

   Nessuna funzione qui dentro tocca il DOM: si verificano con Node, senza
   browser. La pagina sta in digitale-ui.js. */

import { lingua as L10n, listaLingua } from './lab.js';

export { L10n as lingua, listaLingua };

const idValido = x => x && (typeof x.id === 'string' || typeof x.id === 'number');
const rad = (b = '') => String(b || '').replace(/\/+$/, '');

/* ---------- le radici ---------- */

const dati = (D = {}) => (D.DIGITALE && typeof D.DIGITALE === 'object') ? D.DIGITALE : {};

export const attiva = (D = {}) => !!dati(D).attiva;

/* Tutti i bundle, anche le bozze: serve all'Admin e alla diagnostica. */
export const tutti = (D = {}) => (dati(D).bundle || []).filter(idValido);

/* Quelli che il sito può mostrare. */
export const bundle = (D = {}) => tutti(D).filter(b => b.stato === 'pubblicato');

export const trova = (D, id) => {
  if (id === undefined || id === null || id === '') return null;
  const n = Number(id);
  return tutti(D).find(b => b.id === id || (Number.isFinite(n) && Number(b.id) === n)) || null;
};

export const categorie = (D = {}) => (dati(D).categorie || []).filter(idValido);
export const categoria = (D, id) => categorie(D).find(c => c.id === id) || null;

export const licenze = (D = {}) => (dati(D).licenze || []).filter(idValido);
export const licenza = (D, id) => licenze(D).find(l => l.id === id) || null;

export const programmi = (D = {}) => (dati(D).software || []).filter(idValido);
export const programma = (D, id) => programmi(D).find(s => s.id === id) || null;

export const faq = (D = {}) => (dati(D).faq || []).filter(f => f && f.d && f.r);

export const intro = (D = {}) => dati(D).intro || {};

/* ---------- la consegna: come il file arriva davvero ---------- */

const MODI = ['nessuna', 'email', 'link'];

/* Il nocciolo. `acquistabile` è una conseguenza dei dati, non una scelta
   di chi scrive la pagina: senza un modo di consegna dichiarato il bundle
   non si vende, e la scheda spiega che sta per arrivare invece di
   promettere un download che non c'è. */
export function consegna(b = {}) {
  const c = (b && b.consegna) || {};
  const modo = MODI.includes(c.modo) ? c.modo : 'nessuna';
  if (modo === 'nessuna') {
    return { modo: 'nessuna', acquistabile: false, motivo: 'consegna-non-dichiarata', url: '', tempi: null };
  }
  if (modo === 'link') {
    const url = /^https?:\/\//i.test(String(c.url || '')) ? String(c.url) : '';
    /* «link» senza indirizzo è la stessa promessa vuota di prima, scritta
       in un campo diverso: non passa. */
    if (!url) return { modo: 'link', acquistabile: false, motivo: 'link-mancante', url: '', tempi: c.tempi || null };
    return { modo: 'link', acquistabile: true, motivo: '', url, tempi: c.tempi || null };
  }
  return { modo: 'email', acquistabile: true, motivo: '', url: '', tempi: c.tempi || null };
}

export const acquistabile = b => consegna(b).acquistabile;

/* Quelli che si possono davvero vendere adesso. */
export const invendita = (D = {}) => bundle(D).filter(acquistabile);

/* ---------- compatibilità ---------- */

/* Le macchine su cui il bundle è stato provato, risolte sul catalogo vero:
   un id che non esiste più non deve diventare una riga di testo vuota. */
export function macchineDi(D, b) {
  const ids = (b && b.compatibilita && b.compatibilita.macchine) || [];
  const cat = (D && D.MACCHINE && D.MACCHINE.catalogo) || [];
  return ids.map(id => cat.find(m => m.id === id)).filter(Boolean);
}

export function programmiDi(D, b) {
  const ids = (b && b.compatibilita && b.compatibilita.software) || [];
  return ids.map(id => programma(D, id)).filter(Boolean);
}

/* Un formato è «coperto» da un software se quel software lo apre. Serve a
   dire la verità sul caso più frequente: il file si apre, i parametri no. */
export function formatiCoperti(D, b) {
  const miei = ((b && b.f) || []).map(f => String(f).toUpperCase());
  const aperti = new Set();
  programmiDi(D, b).forEach(s => (s.formati || []).forEach(f => aperti.add(String(f).toUpperCase())));
  return {
    coperti: miei.filter(f => aperti.has(f)),
    scoperti: miei.filter(f => !aperti.has(f)),
  };
}

/* ---------- i filtri ---------- */

/* Tutti i formati presenti nel catalogo pubblicato, in ordine di frequenza:
   un elenco di filtri si legge meglio se i casi comuni vengono prima. */
export function formati(D = {}) {
  const conta = new Map();
  bundle(D).forEach(b => (b.f || []).forEach(f => {
    const k = String(f).toUpperCase();
    conta.set(k, (conta.get(k) || 0) + 1);
  }));
  return [...conta.entries()].sort((a, b2) => b2[1] - a[1] || a[0].localeCompare(b2[0]))
    .map(([id, n]) => ({ id, n }));
}

const prezzo = b => {
  if (!b || b.price == null || b.price === '') return NaN;
  const v = Number(b.price);
  return Number.isFinite(v) ? v : NaN;
};

/* Un bundle senza prezzo non è «gratis»: è senza prezzo. `Number(null)` fa
   zero e lo farebbe finire fra i più economici — lo stesso errore che le
   collezioni avevano, e che qui non si ripete. */
const perPrezzo = verso => (a, b) => {
  const x = prezzo(a), y = prezzo(b);
  if (Number.isNaN(x) && Number.isNaN(y)) return 0;
  if (Number.isNaN(x)) return 1;
  if (Number.isNaN(y)) return -1;
  return verso === 'desc' ? y - x : x - y;
};

export function filtra(D, f = {}) {
  let out = bundle(D);
  if (f.cat) out = out.filter(b => b.cat === f.cat);
  if (f.formato) {
    const k = String(f.formato).toUpperCase();
    out = out.filter(b => (b.f || []).some(x => String(x).toUpperCase() === k));
  }
  if (f.macchina) out = out.filter(b => ((b.compatibilita || {}).macchine || []).includes(f.macchina));
  if (f.software) out = out.filter(b => ((b.compatibilita || {}).software || []).includes(f.software));
  if (f.licenza) out = out.filter(b => b.licenza === f.licenza);
  if (f.soloAcquistabili) out = out.filter(acquistabile);
  if (f.prezzoMax != null && f.prezzoMax !== '') {
    const max = Number(f.prezzoMax);
    if (Number.isFinite(max)) out = out.filter(b => { const p = prezzo(b); return !Number.isNaN(p) && p <= max });
  }
  if (f.testo) {
    const q = String(f.testo).toLowerCase().trim();
    if (q) out = out.filter(b => {
      const n = Object.values(b.n || {}).join(' ').toLowerCase();
      const s = Object.values(b.sommario || {}).join(' ').toLowerCase();
      return n.includes(q) || s.includes(q) || (b.f || []).some(x => String(x).toLowerCase().includes(q));
    });
  }
  const ordine = f.ordine || 'consigliato';
  if (ordine === 'prezzo-su') out = [...out].sort(perPrezzo('asc'));
  else if (ordine === 'prezzo-giu') out = [...out].sort(perPrezzo('desc'));
  else if (ordine === 'novita') out = [...out].sort((a, b) =>
    String(b.aggiornatoIl || '').localeCompare(String(a.aggiornatoIl || '')));
  else out = [...out].sort((a, b) => (b.inEvidenza ? 1 : 0) - (a.inEvidenza ? 1 : 0));
  return out;
}

export const inEvidenza = (D, max = 3) => bundle(D).filter(b => b.inEvidenza).slice(0, max);

export function conteggi(D = {}) {
  const pub = bundle(D);
  return {
    totali: tutti(D).length,
    pubblicati: pub.length,
    acquistabili: pub.filter(acquistabile).length,
    bozze: tutti(D).filter(b => b.stato !== 'pubblicato').length,
    categorie: categorie(D).length,
    formati: formati(D).length,
  };
}

/* ---------- indirizzi ---------- */

export const via = (base = '') => rad(base) + '/digital';
export const viaBundle = (b, base = '') => via(base) + '/' + (b && b.id != null ? b.id : '');

/* ---------- SEO ---------- */

export function schema(D, { base = '', L = 'it' } = {}) {
  const pub = invendita(D);
  if (!pub.length) return null;
  return {
    '@type': 'ItemList',
    name: L10n(intro(D).titolo, L) || 'File digitali',
    numberOfItems: pub.length,
    itemListElement: pub.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: L10n(b.n, L),
        url: rad(base) + viaBundle(b),
        ...(Number.isFinite(prezzo(b)) ? {
          offers: { '@type': 'Offer', price: prezzo(b), priceCurrency: 'EUR', availability: 'https://schema.org/InStock' },
        } : {}),
      },
    })),
  };
}

/* ---------- diagnostica ---------- */

/* Quello che la CI deve vedere prima di una pubblicazione. Separato in
   `gravi` e `avvisi`: un id duplicato rompe il carrello, una descrizione
   mancante no. */
export function problemi(D = {}) {
  const gravi = [], avvisi = [];
  const bs = tutti(D);

  const visti = new Set();
  bs.forEach(b => {
    const k = String(b.id);
    if (visti.has(k)) gravi.push(`bundle #${b.id}: id ripetuto`);
    visti.add(k);
  });

  bs.forEach(b => {
    const et = `bundle #${b.id}`;
    if (!b.n || !L10n(b.n, 'it')) gravi.push(`${et}: senza nome`);
    if (b.cat && !categoria(D, b.cat)) gravi.push(`${et}: categoria «${b.cat}» non esiste`);
    if (b.licenza && !licenza(D, b.licenza)) gravi.push(`${et}: licenza «${b.licenza}» non esiste`);
    if (!(b.f || []).length) gravi.push(`${et}: nessun formato dichiarato`);
    ((b.compatibilita || {}).software || []).forEach(s => {
      if (!programma(D, s)) gravi.push(`${et}: software «${s}» non esiste`);
    });
    const cat = (D && D.MACCHINE && D.MACCHINE.catalogo) || [];
    ((b.compatibilita || {}).macchine || []).forEach(m => {
      if (!cat.find(x => x.id === m)) gravi.push(`${et}: macchina «${m}» non è in catalogo`);
    });

    /* Il controllo che impedisce di tornare al punto di partenza: un bundle
       pubblicato che non dice come arriva al cliente. */
    const c = consegna(b);
    if (b.stato === 'pubblicato' && !c.acquistabile) {
      gravi.push(`${et}: pubblicato ma non consegnabile (${c.motivo})`);
    }
    if (b.stato === 'pubblicato' && Number.isNaN(prezzo(b))) gravi.push(`${et}: pubblicato senza prezzo`);
    if (b.stato === 'pubblicato' && !(b.contenuto || []).length) {
      gravi.push(`${et}: pubblicato senza dire cosa c'è dentro`);
    }

    if (!L10n(b.descrizione, 'it')) avvisi.push(`${et}: senza descrizione`);
    if (!(b.anteprime || []).length) avvisi.push(`${et}: senza anteprime`);
    if (!b.versione) avvisi.push(`${et}: senza numero di versione`);
    if (!((b.compatibilita || {}).macchine || []).length) avvisi.push(`${et}: non dice su che macchine è stato provato`);
    if (b.n && !b.n.en) avvisi.push(`${et}: nome non tradotto`);
  });

  licenze(D).forEach(l => {
    if (!(l.puoi && (l.puoi.it || []).length)) avvisi.push(`licenza «${l.id}»: nessun «puoi»`);
    if (!(l.nonPuoi && (l.nonPuoi.it || []).length)) avvisi.push(`licenza «${l.id}»: nessun «non puoi»`);
  });

  return { gravi, avvisi, ok: gravi.length === 0 };
}
