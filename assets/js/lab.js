/* ============ LAB — MATERIALI, TECNOLOGIE, MACCHINE ============

   Il grafo che tiene insieme il sito:

       MATERIALE → TECNOLOGIA → LAVORAZIONE → PRODOTTI
                 ↘ MACCHINA ↗

   Perché un motore e non tre pagine scritte a mano: le relazioni esistono
   già nei dati — `materiali.json` dichiara `tech` e `macchine`,
   `tecnologie.json` dichiara `materiali` e `macchine`, i prodotti dichiarano
   `mat`. Scriverle di nuovo nell'HTML significherebbe tenerle allineate a
   mano per sempre, e il primo materiale aggiunto romperebbe il patto.

   Qui le relazioni si attraversano, non si ripetono. Aggiungere un materiale
   è aggiungere una voce a un JSON: la sua pagina, i suoi collegamenti e i
   suoi prodotti compaiono da soli.

   Funzioni pure: nessun DOM, nessun filesystem, nessuna variabile globale.
   Verificate in tests/test-lab.mjs. */

/* ---------- lingua ---------- */

/** Un valore può essere stringa o {it,en}: torna SEMPRE una stringa. */
export function lingua(v, L = 'it') {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v.map(x => lingua(x, L)).join(', ');
  return String(v[L] || v.it || v.en || '');
}

/** Una lista localizzata: {it:[…],en:[…]} oppure già un array. */
export function listaLingua(v, L = 'it') {
  if (!v) return [];
  if (Array.isArray(v)) return v.map(x => lingua(x, L)).filter(Boolean);
  const l = v[L] || v.it || v.en || [];
  return Array.isArray(l) ? l.map(x => lingua(x, L)).filter(Boolean) : [];
}

/* ---------- accesso alle entità ---------- */

const idValido = x => x && /^[a-z0-9-]+$/.test(String(x.id || ''));

export const materiali = (D = {}) => ((D.MATERIALI && D.MATERIALI.materiali) || []).filter(idValido);
export const tecnologie = (D = {}) => ((D.TECNOLOGIE && D.TECNOLOGIE.tecnologie) || []).filter(idValido);
export const macchine = (D = {}) => ((D.MACCHINE && D.MACCHINE.macchine) || []).filter(idValido);

export const materiale = (D, id) => materiali(D).find(m => m.id === id) || null;
export const tecnologia = (D, id) => tecnologie(D).find(t => t.id === id) || null;
export const macchina = (D, id) => macchine(D).find(m => m.id === id) || null;

/* ---------- il grafo ---------- */

/** Le tecnologie che lavorano un materiale, nell'ordine dichiarato. */
export function tecnologieDi(D, mat) {
  if (!mat) return [];
  return (mat.tech || []).map(id => tecnologia(D, id)).filter(Boolean);
}

/** Le macchine che lo lavorano davvero (dichiarate dal materiale). */
export function macchineDi(D, mat) {
  if (!mat) return [];
  return (mat.macchine || []).map(id => macchina(D, id)).filter(Boolean);
}

/**
 * I materiali che una tecnologia lavora.
 * Si legge in due direzioni e si tiene l'unione: `tecnologie.json` dichiara
 * i suoi materiali, ma un materiale aggiunto dopo dichiara la tecnologia e
 * non viceversa. Fidarsi di un solo verso significherebbe perdere metà delle
 * relazioni ogni volta che qualcuno ne aggiorna solo uno dei due file.
 */
export function materialiDi(D, tec) {
  if (!tec) return [];
  const visti = new Set();
  const out = [];
  for (const id of (tec.materiali || [])) {
    const m = materiale(D, id);
    if (m && !visti.has(m.id)) { visti.add(m.id); out.push(m); }
  }
  for (const m of materiali(D)) {
    if (!visti.has(m.id) && (m.tech || []).includes(tec.id)) { visti.add(m.id); out.push(m); }
  }
  return out;
}

/** Le creazioni di un materiale: il legame è `materiale.cat` ↔ `prodotto.mat`. */
export function prodottiDi(D, mat, opt = {}) {
  const max = opt.max != null ? opt.max : 8;
  if (!mat || !mat.cat) return [];
  const out = (D.PRODUCTS || D.P || [])
    .filter(p => p && !p.hidden && p.mat === mat.cat);
  return max > 0 ? out.slice(0, max) : out;
}

/** Le creazioni di una tecnologia: l'unione di quelle dei suoi materiali. */
export function prodottiDiTecnologia(D, tec, opt = {}) {
  const max = opt.max != null ? opt.max : 8;
  const visti = new Set();
  const out = [];
  for (const m of materialiDi(D, tec)) {
    for (const p of prodottiDi(D, m, { max: 0 })) {
      if (visti.has(p.id)) continue;
      visti.add(p.id);
      out.push(p);
    }
  }
  return max > 0 ? out.slice(0, max) : out;
}

/** Quante creazioni esistono davvero per ogni materiale. */
export function conteggi(D) {
  const out = {};
  for (const m of materiali(D)) out[m.id] = prodottiDi(D, m, { max: 0 }).length;
  return out;
}

/* ---------- percorsi ---------- */

export const viaMateriali = (base = '') => String(base || '').replace(/\/+$/, '') + '/materiali';
export const viaMateriale = (m, base = '') => viaMateriali(base) + '/' + (m && m.id ? m.id : '');
export const viaTecnologie = (base = '') => String(base || '').replace(/\/+$/, '') + '/tecnologie';
export const viaTecnologia = (t, base = '') => viaTecnologie(base) + '/' + (t && t.id ? t.id : '');
export const viaMacchine = (base = '') => String(base || '').replace(/\/+$/, '') + '/macchine';

/* ---------- la catena completa ----------

   È la risposta a «cosa posso farci»: dal materiale alla creazione,
   passando per la tecnologia e la lavorazione. Una riga per ogni
   combinazione che esiste davvero nei dati — mai una inventata. */

export function catena(D, mat, L = 'it') {
  if (!mat) return [];
  return tecnologieDi(D, mat).map(t => ({
    materiale: lingua(mat.n, L),
    materialeId: mat.id,
    tecnologia: lingua(t.n, L),
    tecnologiaId: t.id,
    lavorazioni: listaLingua(mat.lavorazioni, L),
    applicazioni: listaLingua(t.applicazioni, L),
    prodotti: prodottiDi(D, mat, { max: 4 })
  }));
}

/* ---------- ricerca guidata (§21) ----------

   «Cosa vuoi creare, su cosa, con che effetto»: invece di far scegliere
   all'utente una tecnologia di cui non conosce il nome, si parte da quello
   che sa — il materiale e l'effetto — e si arriva alla tecnologia.

   Il punteggio è volutamente semplice e leggibile: nessun modello, nessuna
   libreria. Un criterio che non si capisce non si può correggere. */

const EFFETTI = {
  incisione: { tech: ['co2', 'fiber'], parole: ['incisione', 'incidere', 'inciso', 'engrav'] },
  taglio: { tech: ['co2'], parole: ['taglio', 'tagliare', 'sagoma', 'cut'] },
  colore: { tech: ['uv', 'dtf', 'mopa'], parole: ['colore', 'colori', 'stampa', 'logo', 'full color', 'colour'] },
  permanente: { tech: ['fiber', 'mopa'], parole: ['permanente', 'indelebile', 'serie', 'tecnic'] },
  volume: { tech: ['stampa3d'], parole: ['3d', 'volume', 'pezzo', 'ricambio', 'prototipo'] }
};

export const effetti = () => Object.keys(EFFETTI);

/**
 * Suggerisce le tecnologie, dal materiale e/o dall'effetto desiderato.
 * @returns {{tecnologia:object, punti:number, perche:string[]}[]} ordinate
 */
export function suggerisci(D, { materiale: matId = '', effetto = '', testo = '' } = {}, L = 'it') {
  const mat = matId ? materiale(D, matId) : null;
  const q = String(testo || '').toLowerCase();
  const out = [];

  for (const t of tecnologie(D)) {
    let punti = 0;
    const perche = [];

    if (mat) {
      /* Una tecnologia che non lavora il materiale scelto non è una
         raccomandazione debole: è sbagliata. Esce dalla lista. */
      if (!(mat.tech || []).includes(t.id)) continue;
      punti += 3;
      perche.push(`lavora ${lingua(mat.n, L)}`);
    }

    const e = EFFETTI[effetto];
    if (e) {
      if (!e.tech.includes(t.id)) continue;
      punti += 2;
      perche.push(effetto);
    }

    if (q) {
      const fieno = [lingua(t.n, L), lingua(t.sommario, L), listaLingua(t.applicazioni, L).join(' '),
        (t.lavorazioni || []).join(' ')].join(' ').toLowerCase();
      const parole = q.split(/\s+/).filter(w => w.length > 2);
      const presi = parole.filter(w => fieno.includes(w)).length;
      if (presi) { punti += presi; perche.push('parole: ' + presi); }
      for (const [nome, cfg] of Object.entries(EFFETTI)) {
        if (!cfg.tech.includes(t.id)) continue;
        if (cfg.parole.some(w => q.includes(w))) { punti += 2; perche.push(nome); }
      }
    }

    if (punti > 0) out.push({ tecnologia: t, punti, perche });
  }

  return out.sort((a, b) => b.punti - a.punti || a.tecnologia.id.localeCompare(b.tecnologia.id));
}

/* ---------- integrità ----------

   Serve ai test e alla validazione in CI: un riferimento rotto qui produce
   una pagina che promette una tecnologia inesistente. */

export function problemi(D) {
  const out = [];
  const tIds = new Set(tecnologie(D).map(t => t.id));
  const mcIds = new Set(macchine(D).map(m => m.id));
  const mats = new Set((D.PRODUCTS || D.P || []).map(p => p && p.mat).filter(Boolean));

  for (const m of materiali(D)) {
    if (!(m.tech || []).length) out.push(`materiale ${m.id}: nessuna tecnologia dichiarata`);
    for (const id of (m.tech || [])) if (!tIds.has(id)) out.push(`materiale ${m.id}: tecnologia inesistente "${id}"`);
    for (const id of (m.macchine || [])) if (!mcIds.has(id)) out.push(`materiale ${m.id}: macchina inesistente "${id}"`);
    if (!m.cat) out.push(`materiale ${m.id}: manca "cat", non si collega a nessuna creazione`);
  }
  for (const t of tecnologie(D)) {
    for (const id of (t.macchine || [])) if (!mcIds.has(id)) out.push(`tecnologia ${t.id}: macchina inesistente "${id}"`);
    for (const id of (t.materiali || [])) {
      if (!materiale(D, id)) out.push(`tecnologia ${t.id}: materiale inesistente "${id}"`);
    }
  }
  /* Un materiale usato dai prodotti ma assente dal Lab è una pagina che
     manca, non un errore bloccante: si segnala. */
  for (const cat of mats) {
    if (!materiali(D).some(m => m.cat === cat)) out.push(`avviso: i prodotti usano "${cat}", che non ha una scheda materiale`);
  }
  return out;
}

/* ============ PRERENDER E DATI STRUTTURATI ============

   Le stesse informazioni che il browser disegna, scritte dentro al file.
   Serve ai crawler dei motori AI — GPTBot, PerplexityBot, ClaudeBot — che
   non eseguono JavaScript: senza questo troverebbero una pagina vuota, e
   nessun dato strutturato rimedia a una pagina senza testo.

   Una sola fonte, due modi di servirla: lab-ui.js per chi ha un browser,
   queste funzioni per chi non ce l'ha. */

const esc = t => String(t == null ? '' : t)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const senzaTag = t => String(t || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export function metaMateriale(m = {}, opt = {}) {
  const { L = 'it', azienda = 'INGLY DESIGN' } = opt;
  const nome = lingua(m.n, L);
  return {
    titolo: L === 'en'
      ? `${nome} — laser cutting, engraving and printing | ${azienda}`
      : `${nome} — taglio, incisione e stampa laser | ${azienda}`,
    descrizione: senzaTag(lingua(m.sommario, L)) || senzaTag(lingua(m.descrizione, L)).slice(0, 155)
  };
}

export function metaTecnologia(t = {}, opt = {}) {
  const { L = 'it', azienda = 'INGLY DESIGN' } = opt;
  const nome = lingua(t.n, L);
  return {
    titolo: L === 'en'
      ? `${nome} — what it does and what it makes | ${azienda}`
      : `${nome} — cosa fa e cosa realizza | ${azienda}`,
    descrizione: senzaTag(lingua(t.sommario, L)) || senzaTag(lingua(t.descrizione, L)).slice(0, 155)
  };
}

function elencoHtml(titolo, voci) {
  if (!voci || !voci.length) return '';
  return '<h2>' + esc(titolo) + '</h2><ul>' + voci.map(v => '<li>' + esc(v) + '</li>').join('') + '</ul>';
}

function faqTesto(faq, L) {
  if (!faq || !faq.length) return '';
  return '<h2>' + esc(L === 'it' ? 'Domande frequenti' : 'FAQ') + '</h2>' +
    faq.map(f => '<h3>' + esc(lingua(f.d, L)) + '</h3><p>' + esc(senzaTag(lingua(f.r, L))) + '</p>').join('');
}

const linkProdotti = (lista, L, base, prezzo) => !lista.length ? '' :
  '<ul>' + lista.map(p => '<li><a href="' + esc(String(base).replace(/\/+$/, '') + '/product/' + p.id + '/') + '">' +
    esc(lingua(p.n, L)) + '</a>' + (prezzo ? ' — ' + esc(prezzo(p.price)) : '') + '</li>').join('') + '</ul>';

export function corpoMateriale(D, m, opt = {}) {
  const { L = 'it', base = '', prezzo = null } = opt;
  if (!m) return '';
  const r = ['<h1>' + esc(lingua(m.n, L)) + '</h1>'];
  const s = senzaTag(lingua(m.sommario, L)); if (s) r.push('<p>' + esc(s) + '</p>');
  const d = senzaTag(lingua(m.descrizione, L)); if (d) r.push('<p>' + esc(d) + '</p>');

  const tecs = tecnologieDi(D, m);
  if (tecs.length) {
    r.push('<h2>' + esc(L === 'it' ? 'Come lo lavoriamo' : 'How we work it') + '</h2><ul>' +
      tecs.map(t => '<li><a href="' + esc(viaTecnologia(t, base)) + '"><b>' + esc(lingua(t.n, L)) + '</b></a> — ' +
        esc(senzaTag(lingua(t.sommario, L))) + '</li>').join('') + '</ul>');
  }
  r.push(elencoHtml(L === 'it' ? 'Lavorazioni possibili' : 'Possible operations', listaLingua(m.lavorazioni, L)));
  r.push(elencoHtml(L === 'it' ? 'Usi tipici' : 'Typical uses', listaLingua(m.usi, L)));
  r.push(elencoHtml(L === 'it' ? 'Spessori' : 'Thicknesses', m.spessori || []));
  r.push(elencoHtml(L === 'it' ? 'Finiture' : 'Finishes', listaLingua(m.finiture, L)));
  r.push(elencoHtml(L === 'it' ? 'Da sapere prima' : 'Know before you start', listaLingua(m.limiti, L)));

  const prods = prodottiDi(D, m, { max: 12 });
  if (prods.length) {
    r.push('<h2>' + esc(L === 'it' ? 'Creazioni in questo materiale' : 'Creations in this material') + '</h2>' +
      linkProdotti(prods, L, base, prezzo));
  }
  r.push(faqTesto(m.faq, L));
  return r.filter(Boolean).join('\n');
}

export function corpoTecnologia(D, t, opt = {}) {
  const { L = 'it', base = '', prezzo = null } = opt;
  if (!t) return '';
  const r = ['<h1>' + esc(lingua(t.n, L)) + '</h1>'];
  const s = senzaTag(lingua(t.sommario, L)); if (s) r.push('<p>' + esc(s) + '</p>');
  const d = senzaTag(lingua(t.descrizione, L)); if (d) r.push('<p>' + esc(d) + '</p>');

  if ((t.processo || []).length) {
    r.push('<h2>' + esc(L === 'it' ? 'Come si lavora' : 'The process') + '</h2><ol>' +
      t.processo.map(p => '<li><b>' + esc(lingua(p.t, L)) + '</b> — ' + esc(senzaTag(lingua(p.d, L))) + '</li>').join('') + '</ol>');
  }
  const mats = materialiDi(D, t);
  if (mats.length) {
    r.push('<h2>' + esc(L === 'it' ? 'Materiali che lavora' : 'Materials it works') + '</h2><ul>' +
      mats.map(m => '<li><a href="' + esc(viaMateriale(m, base)) + '">' + esc(lingua(m.n, L)) + '</a></li>').join('') + '</ul>');
  }
  r.push(elencoHtml(L === 'it' ? 'Cosa possiamo creare' : 'What we can make', listaLingua(t.applicazioni, L)));

  const prods = prodottiDiTecnologia(D, t, { max: 12 });
  if (prods.length) {
    r.push('<h2>' + esc(L === 'it' ? 'Creazioni realizzate così' : 'Creations made this way') + '</h2>' +
      linkProdotti(prods, L, base, prezzo));
  }
  r.push(faqTesto(t.faq, L));
  return r.filter(Boolean).join('\n');
}

/** L'indice di una sezione: elenco completo, così la pagina non è un guscio. */
export function corpoSezione(D, sezione, opt = {}) {
  const { L = 'it', base = '', titolo = '', descrizione = '' } = opt;
  const r = ['<h1>' + esc(titolo || sezione) + '</h1>'];
  if (descrizione) r.push('<p>' + esc(senzaTag(descrizione)) + '</p>');

  if (sezione === 'materiali') {
    r.push('<ul>' + materiali(D).map(m =>
      '<li><a href="' + esc(viaMateriale(m, base)) + '">' + esc(lingua(m.n, L)) + '</a> — ' +
      esc(senzaTag(lingua(m.sommario, L))) + '</li>').join('') + '</ul>');
  } else if (sezione === 'tecnologie') {
    r.push('<ul>' + tecnologie(D).map(t =>
      '<li><a href="' + esc(viaTecnologia(t, base)) + '">' + esc(lingua(t.n, L)) + '</a> — ' +
      esc(senzaTag(lingua(t.sommario, L))) + '</li>').join('') + '</ul>');
  } else if (sezione === 'macchine') {
    r.push('<ul>' + macchine(D).map(m =>
      '<li><b>' + esc(lingua(m.n, L)) + '</b> — ' + esc(m.sorgente || '') +
      (lingua(m.ruolo, L) ? ' · ' + esc(senzaTag(lingua(m.ruolo, L))) : '') + '</li>').join('') + '</ul>');
    const vietati = (D.MACCHINE && D.MACCHINE.maiLavorare && D.MACCHINE.maiLavorare.materiali) || [];
    if (vietati.length) {
      /* Chi cerca «si può incidere il PVC» merita una risposta, e questa
         pagina è l'unico posto del sito dove esiste. */
      r.push('<h2>' + esc(L === 'it' ? 'Quello che non lavoriamo, e perché' : 'What we do not work, and why') +
        '</h2><ul>' + vietati.map(v => '<li><b>' + esc(v.m) + '</b> — ' + esc(v.perche) + '</li>').join('') + '</ul>');
    }
  }
  return r.join('\n');
}

/* ---------- JSON-LD ----------
   Niente schema falso: un materiale non è un Product, e dichiararlo tale
   per guadagnare un rich result è il modo più veloce di perdere fiducia.
   Qui si usano i tipi che descrivono quello che la pagina è davvero. */

export function schemaMateriale(D, m, opt = {}) {
  const { L = 'it', base = '', azienda = 'INGLY DESIGN', idAzienda = '#org' } = opt;
  if (!m) return [];
  const url = viaMateriale(m, base);
  const out = [{
    '@type': 'Article',
    '@id': url + '#article',
    headline: lingua(m.n, L),
    description: senzaTag(lingua(m.sommario, L)),
    articleSection: L === 'it' ? 'Materiali' : 'Materials',
    url,
    isPartOf: { '@type': 'WebSite', '@id': base + '/#website' },
    publisher: { '@id': base + idAzienda },
    about: { '@type': 'Thing', name: lingua(m.n, L) },
    mentions: tecnologieDi(D, m).map(t => ({ '@type': 'Thing', name: lingua(t.n, L), url: viaTecnologia(t, base) }))
  }];

  const prods = prodottiDi(D, m, { max: 12 });
  if (prods.length) {
    out.push({
      '@type': 'ItemList',
      '@id': url + '#lista',
      name: (L === 'it' ? 'Creazioni in ' : 'Creations in ') + lingua(m.n, L),
      numberOfItems: prods.length,
      itemListElement: prods.map((p, i) => ({
        '@type': 'ListItem', position: i + 1,
        name: lingua(p.n, L),
        url: String(base).replace(/\/+$/, '') + '/product/' + p.id + '/'
      }))
    });
  }
  if ((m.faq || []).length) out.push(schemaFaq(m.faq, url, L));
  return out;
}

export function schemaTecnologia(D, t, opt = {}) {
  const { L = 'it', base = '', idAzienda = '#org' } = opt;
  if (!t) return [];
  const url = viaTecnologia(t, base);
  const out = [{
    '@type': 'Service',
    '@id': url + '#service',
    name: lingua(t.n, L),
    description: senzaTag(lingua(t.sommario, L)),
    serviceType: lingua(t.n, L),
    url,
    provider: { '@id': base + idAzienda },
    areaServed: { '@type': 'Country', name: 'Italia' }
  }];
  /* HowTo solo se il processo esiste davvero: uno schema con un passo solo
     è rumore, non struttura. */
  if ((t.processo || []).length >= 2) {
    out.push({
      '@type': 'HowTo',
      '@id': url + '#howto',
      name: (L === 'it' ? 'Come si lavora con ' : 'How we work with ') + lingua(t.n, L),
      step: t.processo.map((p, i) => ({
        '@type': 'HowToStep', position: i + 1,
        name: lingua(p.t, L), text: senzaTag(lingua(p.d, L))
      }))
    });
  }
  if ((t.faq || []).length) out.push(schemaFaq(t.faq, url, L));
  return out;
}

function schemaFaq(faq, url, L) {
  return {
    '@type': 'FAQPage',
    '@id': url + '#faq',
    mainEntity: faq.map(f => ({
      '@type': 'Question',
      name: lingua(f.d, L),
      acceptedAnswer: { '@type': 'Answer', text: senzaTag(lingua(f.r, L)) }
    }))
  };
}

export function briciole(sezione, entita, opt = {}) {
  const { L = 'it', base = '' } = opt;
  const home = String(base).replace(/\/+$/, '') + '/';
  const nomeSez = sezione === 'materiali' ? (L === 'it' ? 'Materiali' : 'Materials')
    : sezione === 'tecnologie' ? (L === 'it' ? 'Tecnologie' : 'Technologies')
      : (L === 'it' ? 'Macchine' : 'Machines');
  const urlSez = String(base).replace(/\/+$/, '') + '/' + sezione;
  const voci = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: home },
    { '@type': 'ListItem', position: 2, name: nomeSez, item: urlSez }
  ];
  if (entita) {
    voci.push({
      '@type': 'ListItem', position: 3, name: lingua(entita.n, L),
      item: urlSez + '/' + entita.id
    });
  }
  return { '@type': 'BreadcrumbList', '@id': (entita ? urlSez + '/' + entita.id : urlSez) + '#crumbs', itemListElement: voci };
}

/** I file da generare per il Lab. */
export function elencoPagine(D) {
  const out = [
    { file: 'materiali/index.html', sezione: 'materiali', id: null },
    { file: 'tecnologie/index.html', sezione: 'tecnologie', id: null },
    { file: 'macchine/index.html', sezione: 'macchine', id: null }
  ];
  for (const m of materiali(D)) out.push({ file: 'materiali/' + m.id + '/index.html', sezione: 'materiali', id: m.id });
  for (const t of tecnologie(D)) out.push({ file: 'tecnologie/' + t.id + '/index.html', sezione: 'tecnologie', id: t.id });
  return out;
}
