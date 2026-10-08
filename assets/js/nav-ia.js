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

const esc = t => String(t == null ? '' : t)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const L10n = (v, L = 'it') => {
  if (v == null) return '';
  if (typeof v === 'string') return v;
  return String(v[L] || v.it || v.en || '');
};

/* Le cinque famiglie. `rotta` è dove porta il titolo della famiglia stessa:
   un gruppo che non si può aprire cliccando è una trappola per chi usa la
   tastiera, e un sottomenu senza una pagina propria non ha un canonico. */
export const FAMIGLIE = [
  { id: 'shop', rotta: 'shop', n: { it: 'Shop', en: 'Shop' },
    claim: { it: 'Pezzi già progettati, pronti da personalizzare.', en: 'Pieces already designed, ready to personalise.' } },
  { id: 'lab', rotta: 'materiali', n: { it: 'Lab', en: 'Lab' },
    claim: { it: 'Di cosa è fatto, e con cosa lo facciamo.', en: 'What it is made of, and what we make it with.' } },
  { id: 'academy', rotta: 'academy', n: { it: 'Academy', en: 'Academy' },
    claim: { it: 'Imparare a usarle, non solo a comprarle.', en: 'Learning to use them, not just to buy them.' } },
  { id: 'business', rotta: 'business', n: { it: 'Business', en: 'Business' },
    claim: { it: 'Quando l’ordine non è per te ma per l’azienda.', en: 'When the order is for a company.' } },
  { id: 'studio', rotta: 'about', n: { it: 'Studio', en: 'Studio' },
    claim: { it: 'Chi lo fa, e cosa è già uscito dall’officina.', en: 'Who makes it, and what has already left the workshop.' } }
];

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
        col(t('Per occasione', 'By occasion'), [
          { n: t('Personalizzati su misura', 'Made to measure'), href: via(base, 'quote') },
          { n: t('Regali e ricorrenze', 'Gifts and occasions'), href: via(base, 'shop?coll=regalo') },
          { n: t('Edizioni limitate', 'Limited editions'), href: via(base, 'shop?coll=limited') },
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

  if (id === 'lab') {
    return {
      colonne: [
        col(t('Materiali', 'Materials'),
          materiali.slice(0, max).map(m => ({ n: L10n(m.n, L), href: via(base, 'materiali/' + m.id) })),
          { n: t('Tutti i materiali', 'All materials'), href: via(base, 'materiali') }),
        col(t('Tecnologie', 'Technologies'),
          tecnologie.slice(0, max).map(x => ({ n: L10n(x.n, L), href: via(base, 'tecnologie/' + x.id) })),
          { n: t('Tutte le tecnologie', 'All technologies'), href: via(base, 'tecnologie') }),
        col(t('Macchine', 'Machines'),
          /* Prima quelle che abbiamo davvero: sono le uniche che si possono
             venire a vedere, ed è l'informazione che conta di più. */
          [...macchine].sort((a, b) => (b.inOfficina ? 1 : 0) - (a.inOfficina ? 1 : 0))
            .slice(0, max).map(m => ({ n: L10n(m.n, L), href: via(base, 'macchine/' + m.id), nota: m.inOfficina ? t('in officina', 'in the workshop') : '' })),
          { n: t('Tutta la gamma', 'The whole range'), href: via(base, 'macchine') })
      ],
      evidenza: {
        occhiello: t('Gratuita', 'Free'),
        titolo: t('Vedila lavorare, poi decidi.', 'See it working, then decide.'),
        testo: t('Un’ora in officina con la macchina accesa.', 'An hour in the workshop with the machine running.'),
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

  if (id === 'studio') {
    return {
      colonne: [
        col(t('Lo studio', 'The studio'), [
          { n: t('Chi siamo', 'About us'), href: via(base, 'about') },
          { n: t('Portfolio', 'Portfolio'), href: via(base, 'portfolio') },
          { n: t('Come si ordina', 'How to order'), href: via(base, 'faq') },
          { n: t('Contatti', 'Contact'), href: via(base, 'quote') }
        ]),
        col(t('Prima di ordinare', 'Before ordering'), [
          { n: t('Domande frequenti', 'FAQ'), href: via(base, 'faq') },
          { n: t('Tempi e spedizioni', 'Lead times and shipping'), href: via(base, 'faq') },
          { n: t('Preventivo', 'Quote'), href: via(base, 'quote') }
        ])
      ],
      evidenza: null
    };
  }

  return vuoto;
}

/** Tutte le destinazioni raggiungibili dal menu: serve ai test. */
export function destinazioni(D = {}, opt = {}) {
  const out = [];
  for (const f of FAMIGLIE) {
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

/** La barra: cinque voci e nient'altro. */
export function barraHtml(D, { L = 'it', base = '' } = {}) {
  return FAMIGLIE.map(f => {
    const p = pannello(f.id, D, { L, base });
    const apribile = p.colonne.length > 0;
    return `<a class="ia-voce" href="${esc(via(base, f.rotta))}" data-nav="${esc(f.rotta)}" data-fam="${esc(f.id)}"
      ${apribile ? 'aria-haspopup="true" aria-expanded="false" aria-controls="ia-pan-' + esc(f.id) + '"' : ''}>
      <span>${esc(L10n(f.n, L))}</span>${apribile ? '<i class="ia-caret" aria-hidden="true"></i>' : ''}</a>`;
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

/** Il cassetto mobile: le stesse famiglie, aperte a fisarmonica. */
export function cassettoHtml(D, { L = 'it', base = '' } = {}) {
  return FAMIGLIE.map(f => {
    const p = pannello(f.id, D, { L, base });
    const voci = p.colonne.flatMap(c => [...c.voci, ...(c.tutto ? [c.tutto] : [])]);
    if (!voci.length) {
      return `<div class="dr-item"><a class="dr-fam" href="${esc(via(base, f.rotta))}">${esc(L10n(f.n, L))}</a></div>`;
    }
    return `<div class="dr-item">
      <button type="button" class="dr-fam" aria-expanded="false" data-apri="dr-${esc(f.id)}">
        <span>${esc(L10n(f.n, L))}</span><i class="dr-piu" aria-hidden="true"></i></button>
      <div class="dr-sub" id="dr-${esc(f.id)}">
        <p class="dr-claim">${esc(L10n(f.claim, L))}</p>
        ${p.colonne.map(c => `
          <p class="dr-col-tit">${esc(c.titolo)}</p>
          ${c.voci.map(v => `<a href="${esc(v.href)}">${esc(v.n)}</a>`).join('')}
          ${c.tutto ? `<a class="dr-tutto" href="${esc(c.tutto.href)}">${esc(c.tutto.n)} →</a>` : ''}`).join('')}
      </div>
    </div>`;
  }).join('');
}
