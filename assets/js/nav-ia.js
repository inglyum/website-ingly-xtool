/* ============ ARCHITETTURA DELL'INFORMAZIONE ============

   Il problema, detto in una riga: tredici voci allineate in una barra non
   sono una navigazione, sono un indice. Chi arriva legge «molte cose
   interessanti» invece di «un'azienda organizzata», e non perché manchi
   qualcosa — perché c'è tutto, allo stesso livello.

   Qui le destinazioni restano TUTTE. Cambia solo come si presentano:
   cinque famiglie, ognuna con una ragione di esistere che si spiega in
   mezza frase.

       SHOP      cosa puoi comprare già fatto
       LAB       di cosa è fatto e con cosa lo facciamo
       ACADEMY   imparare a farlo da soli
       BUSINESS  se compri per un'azienda
       STUDIO    chi siamo e cosa abbiamo già fatto

   I pannelli non sono scritti a mano: le voci arrivano dai dati del sito —
   categorie, materiali, tecnologie, macchine, settori. Un materiale nuovo
   compare nel menu senza che nessuno tocchi il menu.

   Funzioni pure: nessun DOM. Verificate in tests/test-nav-ia.mjs. */

import * as CL from './collezioni.js';

const esc = t => String(t == null ? '' : t)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const L10n = (v, L = 'it') => {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  return String(v[L] || v.it || v.en || '');
};

/* LE SETTE FAMIGLIE, ordinate per obiettivo di chi arriva.
   `rotta` è dove porta il titolo della famiglia stessa: un gruppo che non
   si può aprire cliccando è una trappola per chi usa la tastiera, e un
   sottomenu senza una pagina propria non ha un canonico.

   Prima erano cinque, e mettevano sullo stesso piano cose di natura
   diversa: «Lab» conteneva materiali, tecnologie E macchine — tre mondi
   commerciali distinti dentro una tendina sola — mentre i file digitali,
   che si vendono, non avevano una voce propria e stavano in fondo a una
   colonna. «Studio» (chi siamo, portfolio, FAQ, contatti) occupava una
   delle cinque posizioni della barra per contenuti che nessuno cerca
   prima di aver deciso di comprare: ora vive nel piè di pagina e nel
   cassetto mobile.

   PERSONALIZZA è `condizionata`: compare solo se almeno un prodotto è
   marcato «si personalizza» nell'Admin. Una voce di menu verso una pagina
   vuota è peggio di una voce che non c'è. */
export const FAMIGLIE = [
  { id: 'shop', rotta: 'shop', n: { it: 'Shop', en: 'Shop' },
    claim: { it: 'Pezzi già progettati, pronti da ordinare.', en: 'Pieces already designed, ready to order.' } },
  { id: 'personalizza', rotta: 'personalizza', condizionata: true, n: { it: 'Personalizza', en: 'Customise' },
    claim: { it: 'Tu scegli il pezzo, il resto lo scrivi tu.', en: 'You pick the piece, you write the rest.' } },
  { id: 'materiali', rotta: 'materiali', n: { it: 'Materiali', en: 'Materials' },
    claim: { it: 'Di cosa è fatto, e come si lavora.', en: 'What it is made of, and how it is worked.' } },
  { id: 'digital', rotta: 'digital', n: { it: 'File digitali', en: 'Digital files' },
    claim: { it: 'Progetti pronti da tagliare e incidere.', en: 'Projects ready to cut and engrave.' } },
  { id: 'academy', rotta: 'academy', n: { it: 'Academy', en: 'Academy' },
    claim: { it: 'Imparare a usarle, non solo a comprarle.', en: 'Learning to use them, not just to buy them.' } },
  { id: 'xtool', rotta: 'macchine', n: { it: 'xTOOL Lab', en: 'xTOOL Lab' },
    claim: { it: 'Le macchine, provate in officina.', en: 'The machines, tried in the workshop.' } },
  { id: 'business', rotta: 'business', n: { it: 'Business', en: 'Business' },
    claim: { it: 'Quando l\u2019ordine non \u00e8 per te ma per l\u2019azienda.', en: 'When the order is for a company.' } }
];

/* Le voci che NON stanno nella barra: piè di pagina e cassetto mobile.
   Non sono meno importanti, sono di un altro momento — si cercano dopo
   aver deciso, non prima. */
export const SECONDARIE = [
  { id: 'portfolio', rotta: 'portfolio', n: { it: 'Portfolio', en: 'Portfolio' } },
  { id: 'about', rotta: 'about', n: { it: 'Chi siamo', en: 'About' } },
  { id: 'faq', rotta: 'faq', n: { it: 'Domande frequenti', en: 'FAQ' } },
  { id: 'quote', rotta: 'quote', n: { it: 'Contatti e preventivo', en: 'Contact and quote' } }
];

/** Quanti prodotti si possono personalizzare, secondo i dati. */
const quantiPersonalizzabili = D =>
  ((D && (D.P || D.PRODUCTS)) || []).filter(p => p && !p.hidden && (p.personalizzabile === true || p.creator === true)).length;

/**
 * Le famiglie da mostrare DAVVERO, per questi dati.
 * Una famiglia condizionata senza contenuto non entra nella barra.
 */
export function famiglieVive(D = {}) {
  return FAMIGLIE.filter(f => !f.condizionata || (f.id === 'personalizza' && quantiPersonalizzabili(D) > 0));
}

const via = (base, p) => String(base || '').replace(/\/+$/, '') + '/' + String(p).replace(/^\/+/, '');

/** Una colonna del pannello: titolo, voci, e dove porta «vedi tutto». */
const col = (titolo, voci, tutto) => ({ titolo, voci: voci.filter(v => v && v.n), tutto });

/**
 * Il contenuto di una famiglia, costruito dai dati veri del sito.
 * @returns {{colonne:Array, evidenza:object|null}}
 */
export function pannello(id, D = {}, { L = 'it', base = '', max = 8 } = {}) {
  const t = (it, en) => (L === 'en' ? en : it);
  const vuoto = { colonne: [], evidenza: null };
  const materiali = (D.MATERIALI && D.MATERIALI.materiali) || [];
  const tecnologie = (D.TECNOLOGIE && D.TECNOLOGIE.tecnologie) || [];
  const macchine = (D.MACCHINE && D.MACCHINE.catalogo) || [];
  const corsi = (D.CORSI && D.CORSI.corsi) || [];

  if (id === 'shop') {
    const cats = (D.CATS || []).filter(c => c && c.id);
    return {
      colonne: [
        col(t('Categorie', 'Categories'),
          cats.slice(0, max).map(c => ({ n: L10n(c.n, L), href: via(base, 'shop?cat=' + c.id) })),
          { n: t('Tutto il catalogo', 'Full catalogue'), href: via(base, 'shop') }),
        /* Le collezioni arrivano dai dati e sono garantite non vuote.
           Prima questa colonna portava a `shop?coll=regalo` e
           `shop?coll=limited`: due valori che nessun prodotto ha e che lo
           shop non leggeva affatto, quindi due voci del menu principale
           aprivano il catalogo intero come se il filtro non esistesse. */
        col(t('Collezioni', 'Collections'),
          CL.inEvidenza(D, max).map(c => ({
            n: CL.lingua(c.n, L),
            href: via(base, 'shop?coll=' + CL.rifDi(c)),
            nota: String(CL.conta(c, D))
          })),
          { n: t('Tutto il catalogo', 'Full catalogue'), href: via(base, 'shop') }),
        col(t('Oppure', 'Or'), [
          { n: t('Personalizzati su misura', 'Made to measure'), href: via(base, 'quote') },
          { n: t('File digitali', 'Digital files'), href: via(base, 'digital') }
        ])
      ],
      evidenza: {
        occhiello: t('Non trovi quello che cerchi?', 'Not finding it?'),
        titolo: t('Si parte dal tuo disegno.', 'We start from your drawing.'),
        testo: t('Un pezzo solo è un ordine valido.', 'A single piece is a valid order.'),
        cta: { n: t('Richiedi un preventivo', 'Request a quote'), href: via(base, 'quote') }
      }
    };
  }

  if (id === 'materiali') {
    return {
      colonne: [
        col(t('Materiali', 'Materials'),
          materiali.slice(0, max).map(m => ({ n: L10n(m.n, L), href: via(base, 'materiali/' + m.id) })),
          { n: t('Tutti i materiali', 'All materials'), href: via(base, 'materiali') }),
        col(t('Tecnologie', 'Technologies'),
          tecnologie.slice(0, max).map(x => ({ n: L10n(x.n, L), href: via(base, 'tecnologie/' + x.id) })),
          { n: t('Tutte le tecnologie', 'All technologies'), href: via(base, 'tecnologie') })
      ],
      evidenza: {
        occhiello: t('Non sai quale scegliere?', 'Not sure which one?'),
        titolo: t('Si parte da cosa devi fare.', 'Start from what you need to make.'),
        testo: t('Il materiale giusto dipende dall\u2019uso, non dal catalogo.', 'The right material depends on the use, not the catalogue.'),
        cta: { n: t('Trova il materiale', 'Find the material'), href: via(base, 'materiali') }
      }
    };
  }

  if (id === 'xtool') {
    /* Prima quelle che abbiamo davvero: sono le uniche che si possono
       venire a vedere, ed è l'informazione che conta di più. */
    const inOfficina = macchine.filter(m => m && m.inOfficina);
    const altre = macchine.filter(m => m && !m.inOfficina);
    return {
      colonne: [
        col(t('In officina', 'In the workshop'),
          inOfficina.slice(0, max).map(m => ({ n: L10n(m.n, L), href: via(base, 'macchine/' + m.id), nota: t('provabile', 'you can try it') })),
          { n: t('Tutta la gamma', 'The whole range'), href: via(base, 'macchine') }),
        /* Qui l'elenco è completo, non tagliato a `max`: una macchina
           nascosta dalla fetta sarebbe una pagina che esiste e dal menu
           non si raggiunge. La colonna è un elenco semplice, ci sta. */
        col(t('Il resto della gamma', 'The rest of the range'),
          altre.map(m => ({ n: L10n(m.n, L), href: via(base, 'macchine/' + m.id) })))
      ],
      evidenza: {
        occhiello: t('Gratuita', 'Free'),
        titolo: t('Vedila lavorare, poi decidi.', 'See it working, then decide.'),
        testo: t('Un\u2019ora in officina con la macchina accesa.', 'An hour in the workshop with the machine running.'),
        cta: { n: t('Prenota la demo', 'Book the demo'), href: via(base, 'demo') }
      }
    };
  }

  if (id === 'academy') {
    const pubblicati = corsi.filter(c => c && c.stato !== 'bozza');
    return {
      colonne: [
        col(t('Corsi', 'Courses'),
          pubblicati.slice(0, max).map(c => ({ n: L10n(c.n, L), href: via(base, 'academy/' + c.id) })),
          { n: t('Tutti i corsi', 'All courses'), href: via(base, 'academy') }),
        col(t('Impara da qui', 'Start here'), [
          { n: t('Come si lavora ogni tecnologia', 'How each technology works'), href: via(base, 'tecnologie') },
          { n: t('Cosa regge ogni materiale', 'What each material can take'), href: via(base, 'materiali') },
          { n: t('Quello che non lavoriamo, e perché', 'What we do not work, and why'), href: via(base, 'macchine') }
        ])
      ],
      evidenza: pubblicati.length ? null : {
        occhiello: t('In preparazione', 'Coming'),
        titolo: t('Il calendario non è ancora aperto.', 'The calendar is not open yet.'),
        testo: t('I primi percorsi nascono dalle richieste che arrivano.', 'The first courses come from the requests we receive.'),
        cta: { n: t('Dimmi cosa ti serve', 'Tell us what you need'), href: via(base, 'quote') }
      }
    };
  }

  if (id === 'business') {
    const vert = (D.VERTICALI || []).filter(v => v && v.attivo !== false && v.id);
    return {
      colonne: [
        col(t('Il tuo settore', 'Your sector'),
          vert.slice(0, max).map(v => ({ n: L10n(v.n, L), href: via(base, 'business/' + v.id) })),
          { n: t('Tutti i settori', 'All sectors'), href: via(base, 'business') }),
        col(t('Come lavoriamo', 'How we work'), [
          { n: t('Produzione in serie', 'Batch production'), href: via(base, 'business') },
          { n: t('Gadget e regalistica aziendale', 'Corporate gifts'), href: via(base, 'business') },
          { n: t('Prototipi e conto terzi', 'Prototypes and subcontracting'), href: via(base, 'business') },
          { n: t('Materiali per la tua produzione', 'Materials for your production'), href: via(base, 'materiali') }
        ])
      ],
      evidenza: {
        occhiello: t('Da 50 a 50.000 pezzi', 'From 50 to 50,000 pieces'),
        titolo: t('Dicci quantità e tempi.', 'Tell us quantity and timing.'),
        testo: t('Il preventivo aziendale è un modulo diverso: chiede quello che serve davvero.', 'The business quote asks what actually matters.'),
        cta: { n: t('Preventivo aziendale', 'Business quote'), href: via(base, 'quote?tipo=azienda') }
      }
    };
  }

  if (id === 'personalizza') {
    /* Nessuna colonna: è un collegamento diretto. La voce compare solo se
       c'è qualcosa da personalizzare (famiglieVive), quindi qui non serve
       nessun rimedio per il caso vuoto. */
    return vuoto;
  }

  if (id === 'digital') {
    const dig = (D.DIG || []).filter(d => d && d.id != null);
    const formati = [...new Set(dig.flatMap(d => Array.isArray(d.f) ? d.f : []))];
    return {
      colonne: [
        col(t('I file', 'The files'),
          dig.slice(0, max).map(d => ({ n: L10n(d.n, L), href: via(base, 'digital') })),
          { n: t('Tutti i file', 'All files'), href: via(base, 'digital') }),
        /* I formati arrivano dai file che esistono: un elenco scritto a
           mano prometterebbe tipi che nessun file fornisce. */
        col(t('Formati disponibili', 'Available formats'),
          formati.slice(0, max).map(f => ({ n: f, href: via(base, 'digital') }))),
        col(t('Strumenti creativi', 'Creative tools'), [
          { n: t('Generator Studio INGLY', 'INGLY Generator Studio'), href: via(base, 'generatori.html'), nota: 'SVG' },
          { n: t('Scatole, tag e forme', 'Boxes, tags & shapes'), href: via(base, 'generatori.html') }
        ])
      ],
      evidenza: {
        occhiello: t('Licenza d\u2019uso', 'Usage licence'),
        titolo: t('Si scaricano e si usano.', 'Download and use.'),
        testo: t('Compatibilit\u00e0 e materiali consigliati su ogni scheda.', 'Compatibility and suggested materials on each file.'),
        cta: { n: t('Vai ai file', 'Go to the files'), href: via(base, 'digital') }
      }
    };
  }

  return vuoto;
}

/** Tutte le destinazioni raggiungibili dal menu: serve ai test. */
export function destinazioni(D = {}, opt = {}) {
  const out = [];
  /* Le secondarie contano: sono uscite dalla barra, non dal sito. Vivono
     nel cassetto mobile e nel piè di pagina, e se sparissero da qui una
     pagina indicizzata resterebbe senza nessun collegamento interno. */
  for (const v of SECONDARIE) out.push('/' + v.rotta);
  for (const f of famiglieVive(D)) {
    out.push('/' + f.rotta);
    const p = pannello(f.id, D, opt);
    for (const c of p.colonne) {
      for (const v of c.voci) out.push(v.href);
      if (c.tutto) out.push(c.tutto.href);
    }
    if (p.evidenza && p.evidenza.cta) out.push(p.evidenza.cta.href);
  }
  return [...new Set(out)];
}

/* ---------- markup ---------- */

/** La barra: le famiglie vive, e nient'altro. */
export function barraHtml(D, { L = 'it', base = '', attiva = '' } = {}) {
  return famiglieVive(D).map(f => {
    const p = pannello(f.id, D, { L, base });
    const apribile = p.colonne.length > 0;
    const qui = attiva && (attiva === f.id || attiva === f.rotta);
    /* Il TESTO è un link e basta: un clic ci porta. La freccia è un
       PULSANTE separato, fratello del link, non annidato dentro — un
       bottone dentro un link non è markup valido e i lettori di schermo
       lo annunciano a caso.
       Prima il clic sul link veniva annullato con preventDefault() per
       aprire il pannello: chi voleva lo Shop doveva prima scegliere una
       sottosezione. */
    return `<span class="ia-gruppo${qui ? ' qui' : ''}">
      <a class="ia-voce" href="${esc(via(base, f.rotta))}" data-nav="${esc(f.rotta)}" data-fam="${esc(f.id)}"
        ${qui ? 'aria-current="page"' : ''}>${esc(L10n(f.n, L))}</a>
      ${apribile ? `<button type="button" class="ia-freccia" data-apri="${esc(f.id)}"
        aria-haspopup="true" aria-expanded="false" aria-controls="ia-pan-${esc(f.id)}"
        aria-label="${esc(L === 'en' ? 'Open the ' + L10n(f.n, L) + ' menu' : 'Apri il menu ' + L10n(f.n, L))}"><i class="ia-caret" aria-hidden="true"></i></button>` : ''}
    </span>`;
  }).join('');
}

/** Il pannello editoriale di una famiglia. */
export function pannelloHtml(f, D, { L = 'it', base = '' } = {}) {
  const p = pannello(f.id, D, { L, base });
  if (!p.colonne.length) return '';
  const colonne = p.colonne.map(c => `
    <div class="ia-col">
      <p class="ia-col-tit">${esc(c.titolo)}</p>
      <ul class="ia-lista">
        ${c.voci.map(v => `<li><a href="${esc(v.href)}">${esc(v.n)}${v.nota ? `<em>${esc(v.nota)}</em>` : ''}</a></li>`).join('')}
      </ul>
      ${c.tutto ? `<a class="ia-tutto" href="${esc(c.tutto.href)}">${esc(c.tutto.n)} <i class="arr">→</i></a>` : ''}
    </div>`).join('');

  const ev = p.evidenza ? `
    <aside class="ia-evidenza">
      <p class="ia-ev-occhiello">${esc(p.evidenza.occhiello)}</p>
      <p class="ia-ev-tit">${esc(p.evidenza.titolo)}</p>
      <p class="ia-ev-testo">${esc(p.evidenza.testo)}</p>
      <a class="ia-ev-cta" href="${esc(p.evidenza.cta.href)}">${esc(p.evidenza.cta.n)} <i class="arr">→</i></a>
    </aside>` : '';

  return `<div class="ia-pannello" id="ia-pan-${esc(f.id)}" data-fam="${esc(f.id)}" role="region"
            aria-label="${esc(L10n(f.n, L))}" hidden>
    <div class="wrap ia-pannello-in">
      <div class="ia-colonne" data-col="${p.colonne.length}">${colonne}</div>
      ${ev}
    </div>
  </div>`;
}

/** Il cassetto mobile: le stesse famiglie, aperte a fisarmonica, più le
 *  voci secondarie che nella barra non entrano. */

/** Il cassetto mobile: le stesse famiglie, aperte a fisarmonica, più le
 *  voci secondarie che nella barra non entrano. */
export function cassettoHtml(D, { L = 'it', base = '' } = {}) {
  return famiglieVive(D).map(f => {
    const p = pannello(f.id, D, { L, base });
    const voci = p.colonne.flatMap(c => [...c.voci, ...(c.tutto ? [c.tutto] : [])]);
    if (!voci.length) {
      return `<div class="dr-item"><a class="dr-fam" href="${esc(via(base, f.rotta))}" data-nav="${esc(f.rotta)}">${esc(L10n(f.n, L))}</a></div>`;
    }
    /* Due controlli distinti, affiancati: il NOME porta alla pagina, la
       freccia apre i sottolink. Prima il nome era un pulsante che apriva
       soltanto: dal cassetto del telefono alla pagina Shop non ci si
       arrivava affatto — si poteva solo scendere in una sottosezione. */
    return `<div class="dr-item">
      <div class="dr-riga">
        <a class="dr-fam" href="${esc(via(base, f.rotta))}" data-nav="${esc(f.rotta)}">${esc(L10n(f.n, L))}</a>
        <button type="button" class="dr-freccia" aria-expanded="false" data-apri="dr-${esc(f.id)}"
          aria-controls="dr-${esc(f.id)}"
          aria-label="${esc(L === 'en' ? 'Show the ' + L10n(f.n, L) + ' sections' : 'Mostra le sezioni di ' + L10n(f.n, L))}"
          data-open-label="${esc(L === 'en' ? 'Show the ' + L10n(f.n, L) + ' sections' : 'Mostra le sezioni di ' + L10n(f.n, L))}"
          data-close-label="${esc(L === 'en' ? 'Hide the ' + L10n(f.n, L) + ' sections' : 'Nascondi le sezioni di ' + L10n(f.n, L))}"><i class="dr-piu" aria-hidden="true"></i></button>
      </div>
      <div class="dr-sub" id="dr-${esc(f.id)}">
        <p class="dr-claim">${esc(L10n(f.claim, L))}</p>
        ${p.colonne.map(c => `
          <p class="dr-col-tit">${esc(c.titolo)}</p>
          ${c.voci.map(v => `<a href="${esc(v.href)}">${esc(v.n)}</a>`).join('')}
          ${c.tutto ? `<a class="dr-tutto" href="${esc(c.tutto.href)}">${esc(c.tutto.n)} →</a>` : ''}`).join('')}
      </div>
    </div>`;
  }).join('') + `<div class="dr-sec">
    <p class="dr-col-tit">${L === 'en' ? 'The studio' : 'Lo studio'}</p>
    ${SECONDARIE.map(v => `<a href="${esc(via(base, v.rotta))}" data-nav="${esc(v.rotta)}">${esc(L10n(v.n, L))}</a>`).join('')}
  </div>`;
}
