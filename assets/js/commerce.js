/* ============ COMMERCE OS — IL MODELLO UNICO ============

   Il sito vende cose diverse: oggetti fisici, materiali al metro o a lastra,
   file da scaricare, corsi, pezzi su misura configurati dal cliente. Finora
   ogni tipo si è aggiunto portandosi dietro la propria forma di riga nel
   carrello, e ogni punto che toccava il carrello ha dovuto imparare a
   distinguerle:

       i.dig ? i.dig.n[L] : i.lab ? i.lab.nome : i.p.n[L]

   Quella catena di ternari sta scritta — con piccole differenze — nel
   disegno delle righe, nel salvataggio, nel ricaricamento e nel checkout.
   Aggiungere un tipo significava ricordarsi di tutti e quattro i posti.
   Non ce li siamo ricordati: in `checkoutWhatsApp` il ramo `lab` non c'è,
   quindi un carrello con una variante di materiale leggeva `i.p.n` su un
   oggetto senza `p` e il checkout si fermava con un errore. Il carrello
   sembrava giusto, il bottone non funzionava, e niente lo diceva.

   Qui la riga di carrello è UNA. Ogni tipo sa come diventare quella riga, e
   da lì in poi nessuno chiede più «che tipo sei»: chiede il nome, il prezzo
   unitario, la quantità.

   Cinque tipi, non di più:
     physical  un oggetto del catalogo
     material  una variante di materiale venduta dal Lab
     digital   un file da scaricare
     course    un posto a un corso
     custom    un pezzo configurato dal cliente (Creator)

   Funzioni pure, nessun DOM, nessuna dipendenza: tests/test-commerce.mjs. */

export const TIPI = ['physical', 'material', 'digital', 'course', 'custom'];

/* ---------- 1. il tipo di un articolo ---------- */

/**
 * Il tipo di un record di catalogo.
 *
 * I 97 prodotti esistenti non hanno alcun campo `tipo` e non devono
 * acquisirlo per forza: un record senza tipo è un oggetto fisico, che è
 * quello che è sempre stato. Scrivere il campo in tutti i record per
 * «completare il modello» avrebbe voluto dire 97 modifiche a dati corretti,
 * e un giorno un record nuovo senza campo si sarebbe comportato in modo
 * diverso dai suoi 97 fratelli.
 */
export function tipo(item = {}) {
  const dichiarato = String(item.tipo || item.type || '').toLowerCase();
  if (TIPI.includes(dichiarato)) return dichiarato;
  if (item.creator || item.configurabile) return 'custom';
  if (Array.isArray(item.f) || item.formati) return 'digital';   /* i file dichiarano i formati */
  if (item.durata && item.programma) return 'course';
  if (item.varianti || item.vendita) return 'material';
  return 'physical';
}

/** Un record di catalogo con il tipo esplicito, senza perdere nulla di suo. */
export function normalizza(item = {}) {
  return { ...item, tipo: tipo(item) };
}

/** Normalizza un elenco. Idempotente: rifarlo non cambia niente. */
export function normalizzaTutti(lista) {
  return (Array.isArray(lista) ? lista : []).map(normalizza);
}

/* ---------- 2. la riga di carrello ---------- */

const str = v => (v == null ? '' : String(v));
const num = v => { const n = Number(v); return Number.isFinite(n) ? n : 0; };

/** Il nome nella lingua richiesta, qualunque forma abbia il campo. */
export function nomeIn(nome, L = 'it') {
  if (!nome) return '';
  if (typeof nome === 'string') return nome;
  return str(nome[L] || nome.it || nome.en || '');
}

/**
 * La riga canonica. Tutto quello che serve a disegnarla, salvarla, sommarla
 * e scriverla in un messaggio di checkout — e niente altro.
 *
 * `rif` identifica la CONFIGURAZIONE, non l'articolo: due taglie dello
 * stesso prodotto sono due righe, la stessa taglia aggiunta due volte è una
 * riga con quantità due. Se `rif` dimenticasse un pezzo della
 * configurazione, due cose diverse si sommerebbero in silenzio e il cliente
 * riceverebbe il doppio di una e zero dell'altra.
 */
export function riga(dati = {}) {
  const t = TIPI.includes(dati.tipo) ? dati.tipo : 'physical';
  return {
    tipo: t,
    rif: str(dati.rif) || t + ':' + str(dati.id),
    id: dati.id != null ? dati.id : null,
    nome: dati.nome || '',
    meta: dati.meta || '',
    icon: str(dati.icon) || '▪',
    bg: str(dati.bg),
    sku: str(dati.sku),
    unitario: num(dati.unitario),
    q: Math.max(1, Math.round(num(dati.q) || 1)),
    /* I file si scaricano: comprarne due copie non vuole dire niente. */
    qFissa: dati.qFissa === true || t === 'digital',
    conf: dati.conf && typeof dati.conf === 'object' ? dati.conf : null,
  };
}

/** La parte di `rif` che viene dalla configurazione scelta. */
function firma(conf) {
  if (!conf || typeof conf !== 'object') return '';
  return Object.keys(conf).sort()
    .map(k => k + '=' + (typeof conf[k] === 'object' ? JSON.stringify(conf[k]) : str(conf[k])))
    .join('|');
}

/** Un prodotto del catalogo (fisico o su misura). */
export function daProdotto(p = {}, opt = {}) {
  const { q = 1, mat = '', txt = '', unitario, conf = null, bg = '' } = opt;
  const f = firma(conf);
  const t = tipo(p) === 'custom' ? 'custom' : 'physical';
  return riga({
    tipo: t, id: p.id, nome: p.n, icon: p.icon, bg, sku: p.sku,
    rif: `${t}:${p.id}:${mat}:${txt}:${f}`,
    meta: [mat, txt ? '“' + txt + '”' : ''].filter(Boolean).join(' · '),
    unitario: unitario != null ? unitario : p.price,
    q, conf,
  });
}

/** Un file digitale. */
export function daDigitale(d = {}, opt = {}) {
  return riga({
    tipo: 'digital', id: d.id, nome: d.n, icon: d.icon,
    rif: 'digital:' + d.id,
    meta: Array.isArray(d.f) ? d.f.join(' · ') : '',
    unitario: opt.unitario != null ? opt.unitario : d.price,
    q: 1,
  });
}

/**
 * Una riga del Lab: una variante di materiale o un posto a un corso.
 * Il Lab costruisce già l'oggetto `{tipo,rif,nome,meta,icon,bg}`; qui si
 * limita a diventare una riga come tutte le altre.
 */
export function daLab(lab = {}, opt = {}) {
  const t = lab.tipo === 'corso' || lab.tipo === 'course' ? 'course' : 'material';
  return riga({
    tipo: t, nome: lab.nome, meta: lab.meta, icon: lab.icon, bg: lab.bg,
    rif: str(lab.rif) || t + ':' + str(lab.nome),
    unitario: opt.unitario != null ? opt.unitario : lab.prezzo,
    q: opt.q != null ? opt.q : 1,
    conf: lab.conf || null,
  });
}

/**
 * Aggiunge una riga a un carrello, sommando se la configurazione è la stessa.
 * Ritorna un carrello nuovo: chi chiama decide quando sostituire il proprio.
 */
export function aggiungi(carrello, nuova) {
  const righe = (Array.isArray(carrello) ? carrello : []).map(r => ({ ...r }));
  if (!nuova || !nuova.rif) return righe;
  const ex = righe.find(r => r.rif === nuova.rif);
  if (ex) {
    ex.q = ex.qFissa ? 1 : ex.q + nuova.q;
    return righe;
  }
  righe.push({ ...nuova });
  return righe;
}

/* ---------- 3. salvataggio, con le forme vecchie ---------- */

/** Il minimo da scrivere in localStorage. */
export function serializza(righe) {
  return (Array.isArray(righe) ? righe : []).map(r => ({
    t: r.tipo, rif: r.rif, id: r.id, q: r.q, u: r.unitario,
    nome: r.nome, meta: r.meta, icon: r.icon, bg: r.bg, sku: r.sku,
    conf: r.conf || undefined,
  }));
}

/**
 * Rilegge il carrello salvato — nella forma nuova e nelle tre vecchie.
 *
 * Un cliente che aveva il carrello pieno quando il sito è stato aggiornato
 * non deve trovarlo vuoto: perdere un carrello è perdere un ordine. Le
 * forme vecchie restano leggibili qui, non in giro per il codice.
 *
 * Prezzo e nome vengono rifatti dal catalogo quando il record esiste
 * ancora: un prezzo cambiato in Admin non deve restare congelato in un
 * localStorage di tre settimane fa. Se il record non c'è più, la riga
 * sopravvive con quello che aveva — ma solo se sa dire il proprio nome.
 */
export function deserializza(raw, D = {}) {
  let dati = raw;
  if (typeof raw === 'string') { try { dati = JSON.parse(raw); } catch (e) { return []; } }
  if (!Array.isArray(dati)) return [];
  const prodotti = D.P || D.PRODUCTS || [];
  const digitali = D.DIG || [];
  const out = [];

  dati.forEach(i => {
    if (!i || typeof i !== 'object') return;

    /* forma vecchia: file digitale, `dig` era l'id */
    if (i.dig !== undefined && i.t === undefined) {
      const d = digitali.find(x => x.id === Number(i.dig));
      if (d) out.push(daDigitale(d, { unitario: i.u }));
      return;
    }
    /* forma vecchia: riga del Lab */
    if (i.lab && i.t === undefined) {
      if (i.lab.tipo && i.lab.nome) out.push(daLab(i.lab, { q: i.q, unitario: i.u }));
      return;
    }
    /* forma vecchia: prodotto del catalogo */
    if (i.t === undefined && i.id !== undefined) {
      const p = prodotti.find(x => x.id === i.id);
      if (p) out.push(daProdotto(p, { q: i.q, mat: i.mat, txt: i.txt, unitario: i.u }));
      return;
    }

    /* forma nuova */
    const t = TIPI.includes(i.t) ? i.t : null;
    if (!t) return;
    if (t === 'physical' || t === 'custom') {
      const p = prodotti.find(x => x.id === i.id);
      if (!p) return;                       /* prodotto ritirato: la riga non si ricostruisce */
      out.push(riga({ ...i, tipo: t, nome: p.n, icon: p.icon, sku: p.sku,
        unitario: i.conf ? i.u : p.price, q: i.q }));
      return;
    }
    if (t === 'digital') {
      const d = digitali.find(x => x.id === i.id);
      if (d) out.push(daDigitale(d));
      return;
    }
    if (!nomeIn(i.nome, 'it')) return;      /* senza nome la riga non è disegnabile */
    out.push(riga({ ...i, tipo: t, unitario: i.u, q: i.q }));
  });

  return out;
}

/* ---------- 4. il motore dei prezzi, uno solo ---------- */

export const SOGLIA_SPEDIZIONE = 79;

/**
 * I totali del carrello.
 *
 * Erano calcolati in tre posti — nel disegno del carrello, nella barra della
 * spedizione e nel messaggio di checkout — ciascuno con la propria riga di
 * `reduce` e il proprio arrotondamento. Tre posti che devono dire lo stesso
 * numero sono tre occasioni di dirne due diversi.
 *
 * L'arrotondamento è ai centesimi su ogni riga e poi sul totale: sommare
 * centesimi di euro in virgola mobile e mostrare il risultato grezzo
 * produce i «€41,370000000000005» che si vedono in giro.
 */
export function totali(righe, opt = {}) {
  const { coupon = null, soglia = SOGLIA_SPEDIZIONE } = opt;
  const cent = n => Math.round(num(n) * 100) / 100;
  const lista = Array.isArray(righe) ? righe : [];

  const pezzi = lista.reduce((s, r) => s + Math.max(1, num(r.q) || 1), 0);
  const subtotale = cent(lista.reduce((s, r) => s + cent(num(r.unitario) * (num(r.q) || 1)), 0));
  const pct = coupon && Number.isFinite(Number(coupon.pct)) ? Number(coupon.pct) : 0;
  const sconto = pct > 0 ? cent(subtotale * pct) : 0;
  const totale = cent(subtotale - sconto);

  return {
    pezzi, subtotale, sconto, totale,
    righe: lista.length,
    spedizioneGratis: subtotale >= soglia,
    mancanti: cent(Math.max(0, soglia - subtotale)),
    percorso: Math.min(100, Math.round((subtotale / soglia) * 100)),
  };
}

/** Il prezzo di una riga, al netto di nulla. */
export function prezzoRiga(r = {}) {
  return Math.round(num(r.unitario) * (num(r.q) || 1) * 100) / 100;
}

/* ---------- 5. il checkout, dietro un adattatore ---------- */

export const ADATTATORI = ['WHATSAPP', 'EMAIL', 'PAYMENT_LINK', 'EXTERNAL_CHECKOUT'];

/**
 * Quale checkout usare, e se è davvero usabile.
 *
 * Il punto non è avere quattro modi di pagare: è che il modo si cambia in
 * Admin senza riscrivere il carrello, e che un modo configurato a metà non
 * diventi un bottone che non porta da nessuna parte. WhatsApp senza numero,
 * un link di pagamento senza URL: in quei casi si ricade sul canale che
 * funziona, e lo si dice a chi guarda i dati, non all'utente.
 */
export function adattatore(config = {}) {
  const c = (config && typeof config.checkout === 'object' && config.checkout) || {};
  const scelto = String(c.modo || '').toUpperCase();
  const num = str(config.whatsapp).replace(/\D/g, '');
  const url = str(c.url).trim();
  const esterno = /^https?:\/\//i.test(url) ? url : '';

  const disponibili = [];
  if (num) disponibili.push('WHATSAPP');
  disponibili.push('EMAIL');                 /* il preventivo è sempre possibile */
  if (esterno) disponibili.push('PAYMENT_LINK', 'EXTERNAL_CHECKOUT');

  const modo = disponibili.includes(scelto) ? scelto
    : (num ? 'WHATSAPP' : 'EMAIL');
  return {
    modo,
    numero: num,
    url: esterno,
    disponibili,
    /* vero quando il modo chiesto in Admin non si può usare: lo dice l'Admin,
       non l'utente, che vede semplicemente un bottone che funziona */
    ricaduta: Boolean(scelto) && scelto !== modo,
  };
}

/* ---------- 6. il carrello in parole ---------- */

/** Una riga come la leggerebbe una persona. */
export function descriviRiga(r = {}, L = 'it') {
  const nome = nomeIn(r.nome, L);
  const meta = r.meta ? ' [' + nomeIn(r.meta, L) + ']' : '';
  const sku = r.sku ? ' (' + r.sku + ')' : '';
  return `${r.q}× ${nome}${meta}${sku}`;
}

/**
 * Il carrello come testo, per WhatsApp o per il campo note del preventivo.
 * Una sola funzione, così il messaggio non può raccontare un carrello
 * diverso da quello disegnato — e nessun tipo di riga resta fuori.
 */
export function descriviCarrello(righe, opt = {}) {
  const { L = 'it', prezzi = true, eur = n => '€' + num(n).toFixed(2) } = opt;
  return (Array.isArray(righe) ? righe : [])
    .map(r => '• ' + descriviRiga(r, L) + (prezzi ? ' — ' + eur(prezzoRiga(r)) : ''))
    .join('\n');
}
