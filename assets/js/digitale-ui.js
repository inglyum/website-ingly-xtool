/* ============ FILE DIGITALI — DISEGNO DELLA PAGINA ============

   Il contenuto arriva tutto da digitale.js, che è puro e verificato: qui si
   fa solo HTML. Le stesse due regole di lab-ui.js:

   1. Le classi esistono già nel design system (.wrap, .phero, .pgrid,
      .fitem, .rcard). Una sezione che si porta dietro il suo stile fra sei
      mesi non somiglia più al resto del sito.
   2. Tutto ciò che viene dai dati passa da esc().

   La differenza fra questa pagina e quella di prima non è grafica. Prima
   c'erano sei tessere con nome, formato, prezzo e un'emoji, sotto un titolo
   che prometteva «Download istantaneo, licenza commerciale inclusa» —
   mentre il download non esisteva e il testo della licenza non stava da
   nessuna parte. Qui ogni promessa è un dato: la licenza si apre e si
   legge, la compatibilità elenca macchine vere, e la consegna dice come il
   file arriva. Dove il dato manca, la pagina lo dice invece di riempire il
   buco con una frase. */

import * as DG from './digitale.js';
import { observeAll } from './animations.js';
import { BASE } from './navigation.js';
import * as CART from './products.js';

const via = p => BASE.replace(/\/+$/, '') + p;

const esc = t => String(t == null ? '' : t)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const $ = id => document.getElementById(id);
const D = () => window.INGLY || {};
const t2 = (it, en, L) => (L === 'en' ? en : it);
const T = (v, L) => esc(DG.lingua(v, L));

const euro = v => {
  const n = Number(v);
  return Number.isFinite(n) ? '€' + n.toFixed(2).replace('.', ',').replace(/,00$/, '') : '';
};

/* Lo stato dei filtri vive qui: la pagina si ridisegna da zero a ogni
   cambio, come fa il Material Lab. */
let f = { cat: '', formato: '', software: '', licenza: '', ordine: 'consigliato' };

/* ---------- i filtri ---------- */

export function renderFiltri(L = 'it') {
  const box = $('digFiltri'); if (!box) return;
  const d = D();
  if (!DG.bundle(d).length) { box.innerHTML = ''; return }

  const gruppo = (nome, chiave, voci, etichetta) => {
    if (!voci.length) return '';
    const tutte = `<button type="button" class="fitem${f[chiave] ? '' : ' on'}" data-action="dig-filtro" data-k="${chiave}" data-v="">${esc(t2('Tutti', 'All', L))}</button>`;
    return `<div class="dig-gruppo" role="group" aria-label="${esc(nome)}">
      <span class="dig-getic">${esc(nome)}</span>
      <div class="dig-chips">${tutte}${voci.map(v => `<button type="button" class="fitem${f[chiave] === v.id ? ' on' : ''}" data-action="dig-filtro" data-k="${chiave}" data-v="${esc(v.id)}"${f[chiave] === v.id ? ' aria-pressed="true"' : ' aria-pressed="false"'}>${etichetta(v)}</button>`).join('')}</div>
    </div>`;
  };

  box.innerHTML = `
    ${gruppo(t2('Categoria', 'Category', L), 'cat', DG.categorie(d), c => `${esc(c.ic || '')} ${T(c.n, L)}`)}
    ${gruppo(t2('Formato', 'Format', L), 'formato', DG.formati(d), x => `${esc(x.id)} <small>${x.n}</small>`)}
    ${gruppo(t2('Software', 'Software', L), 'software', DG.programmi(d), s => esc(s.n))}
    ${gruppo(t2('Licenza', 'License', L), 'licenza', DG.licenze(d), l => T(l.n, L))}`;
}

export function impostaFiltro(k, v) {
  if (!(k in f)) return;
  f[k] = v || '';
  const L = (D().__L) || document.documentElement.lang || 'it';
  renderFiltri(L); renderGriglia(L);
}

/* ---------- la griglia ---------- */

/* Una tessera dice quattro cose, nell'ordine in cui servono a decidere:
   cos'è, cosa ci apri, cosa puoi farne, quanto costa. */
function tessera(b, L) {
  const d = D();
  const c = DG.consegna(b);
  const lic = DG.licenza(d, b.licenza);
  const mac = DG.macchineDi(d, b);
  const prog = DG.programmiDi(d, b);
  const cat = DG.categoria(d, b.cat);
  const href = via(DG.viaBundle(b));

  const prezzo = euro(b.price);
  const barrato = Number.isFinite(Number(b.compareAt)) && Number(b.compareAt) > Number(b.price)
    ? `<s>${euro(b.compareAt)}</s>` : '';

  /* Il bottone esiste solo se il file sa come arrivare al cliente. */
  const azione = c.acquistabile
    ? `<button class="btn btn-blue" data-action="dig-add" data-id="${esc(b.id)}">${esc(t2('Aggiungi', 'Add', L))}</button>`
    : `<span class="dig-attesa" title="${esc(t2('Non ancora in vendita', 'Not on sale yet', L))}">${esc(t2('In preparazione', 'Coming soon', L))}</span>`;

  return `<article class="dcard reveal">
    <a class="dig-cop" href="${esc(href)}" data-nav="${esc(DG.viaBundle(b).replace(/^\//, ''))}" aria-label="${T(b.n, L)}">
      ${b.img ? `<img src="${esc(via('/' + b.img))}" alt="${esc(L === 'en' ? b.altEN || DG.lingua(b.n, L) : b.altIT || DG.lingua(b.n, L))}" width="640" height="460" loading="lazy" decoding="async">` : `<span class="dig-ic" aria-hidden="true">◇</span>`}
      ${cat ? `<span class="dig-cat">${T(cat.n, L)}</span>` : ''}
    </a>
    <h3 class="dig-n"><a href="${esc(href)}" data-nav="${esc(DG.viaBundle(b).replace(/^\//, ''))}">${T(b.n, L)}</a></h3>
    ${DG.lingua(b.sommario, L) ? `<p class="dig-s">${T(b.sommario, L)}</p>` : ''}
    <div class="fmt">${(b.f || []).map(x => `<i>${esc(x)}</i>`).join('')}</div>
    ${prog.length ? `<p class="dig-meta">${esc(t2('Si apre con', 'Opens in', L))}: ${prog.map(s => esc(s.n)).join(', ')}</p>` : ''}
    ${mac.length ? `<p class="dig-meta">${esc(t2('Provato su', 'Tested on', L))}: ${mac.map(m => T(m.n, L)).join(', ')}</p>`
      : `<p class="dig-meta dig-manca">${esc(t2('Macchine di prova non ancora dichiarate', 'Tested machines not declared yet', L))}</p>`}
    ${lic ? `<button type="button" class="lic lic-apri" data-action="dig-lic" data-id="${esc(lic.id)}" aria-haspopup="dialog">${T(lic.n, L)} <i aria-hidden="true">?</i></button>` : ''}
    <div class="dl">
      <span class="price">${barrato}${prezzo || esc(t2('Prezzo da definire', 'Price to be set', L))}</span>
      ${azione}
    </div>
  </article>`;
}

export function renderGriglia(L = 'it') {
  const g = $('digGrid'); if (!g) return;
  const d = D();
  const pubblicati = DG.bundle(d);

  /* Catalogo vuoto: non è un errore e non si nasconde. La pagina resta
     utile perché dice cosa fare — il brief chiede che ogni voce primaria
     porti a una pagina utile, non a una pagina vuota. */
  if (!pubblicati.length) {
    const i = DG.intro(d);
    const previews=((d.DIGITALE && d.DIGITALE.bundle) || []).filter(b=>b && b.isDemo === true).slice(0,6);
    g.innerHTML = `<div class="dig-vuoto rcard reveal">
      <span class="eyebrow">${t2('Digital Store · anteprime', 'Digital Store · previews', L)}</span>
      <h3 class="lab-h3">${t2('Idee digitali in preparazione.', 'Digital ideas in development.', L)}</h3>
      <p>${T(i.vuoto, L)}</p>
      <p class="dig-preview-disclaimer">${t2('Le copertine che seguono sono concept illustrativi, non file acquistabili o scaricabili. Prezzi, licenze e contenuti saranno visibili solo dopo la pubblicazione del prodotto.', 'The images below are illustrative concepts, not downloadable or purchasable files. Prices, licenses and content will appear only when a product is published.', L)}</p>
      <div class="hero-ctas">
        <a class="btn btn-primary" href="${esc(via('/quote'))}" data-nav="quote">${esc(t2('Chiedi un file su misura', 'Ask for a custom file', L))} <span class="arr">→</span></a>
      </div>
    </div>
    ${previews.length ? `<div class="digital-preview-grid">${previews.map(b=>`
      <article class="digital-preview-card">
        <a href="${esc(via('/quote'))}" data-nav="quote" aria-label="${esc(t2('Richiedi informazioni su', 'Ask about', L) + ' ' + DG.lingua(b.n,L))}">
          <span class="digital-preview-media"><img src="${esc(via('/' + b.img))}" width="640" height="460" loading="lazy" decoding="async" alt="${esc(L==='en'? b.altEN||DG.lingua(b.n,L):b.altIT||DG.lingua(b.n,L))}"><span class="sample-label">${t2('Concept · non in vendita', 'Concept · not for sale', L)}</span></span>
          <b>${T(b.n,L)}</b><small>${t2('Richiedi informazioni', 'Ask for details', L)} →</small>
        </a>
      </article>`).join('')}</div>` : ''}`;
    const n = $('digConta'); if (n) n.textContent = '';
    return;
  }

  const lista = DG.filtra(d, f);
  const n = $('digConta');
  if (n) n.textContent = lista.length === pubblicati.length
    ? `${pubblicati.length} ${t2('bundle', 'bundles', L)}`
    : `${lista.length} ${t2('su', 'of', L)} ${pubblicati.length}`;

  g.innerHTML = lista.length
    ? lista.map(b => tessera(b, L)).join('')
    : `<p class="dig-nessuno">${esc(t2('Nessun file con questi filtri.', 'No files match these filters.', L))}</p>`;
  observeAll();
}

/* ---------- le licenze, scritte per esteso ---------- */

/* La licenza è il motivo principale per cui si compra un file invece di
   disegnarlo: va letta prima dell'acquisto, non cercata dopo. */
export function renderLicenze(L = 'it') {
  const box = $('digLicenze'); if (!box) return;
  const ls = DG.licenze(D());
  if (!ls.length) { box.innerHTML = ''; return }
  box.innerHTML = `<h2 class="h3">${esc(t2('Cosa puoi farne', 'What you may do with them', L))}</h2>
  <div class="dig-licgrid">${ls.map(l => `
    <article class="rcard reveal" id="lic-${esc(l.id)}">
      <h3>${T(l.n, L)}</h3>
      <p class="dig-s">${T(l.s, L)}</p>
      <ul class="dig-puoi">${DG.listaLingua(l.puoi, L).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <ul class="dig-nonpuoi">${DG.listaLingua(l.nonPuoi, L).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
    </article>`).join('')}</div>`;
}

/* Il clic sull'etichetta nella tessera porta alla licenza per esteso, in
   fondo alla stessa pagina: niente finestra, niente secondo stato da
   chiudere. */
export function vaiAllaLicenza(id) {
  const el = document.getElementById('lic-' + id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('lic-evid');
  setTimeout(() => el.classList.remove('lic-evid'), 1600);
}

/* ---------- le domande ---------- */

export function renderFaq(L = 'it') {
  const box = $('digFaq'); if (!box) return;
  const fs = DG.faq(D());
  if (!fs.length) { box.innerHTML = ''; return }
  box.innerHTML = `<h2 class="h3">${esc(t2('Domande', 'Questions', L))}</h2>
  ${fs.map(x => `<details class="facc reveal"><summary>${T(x.d, L)}</summary><p>${T(x.r, L)}</p></details>`).join('')}`;
}

/* ---------- l'intestazione ---------- */

export function renderIntro(L = 'it') {
  const d = D();
  const i = DG.intro(d);
  const occ = $('digEyebrow'), tit = $('digTitolo'), som = $('digSommario');
  if (occ && DG.lingua(i.eyebrow, L)) occ.textContent = DG.lingua(i.eyebrow, L);
  if (tit && DG.lingua(i.titolo, L)) tit.textContent = DG.lingua(i.titolo, L);
  if (som && DG.lingua(i.sommario, L)) som.textContent = DG.lingua(i.sommario, L);

  /* Come si riceve il file: una riga sola, e dice il vero. Se nessun bundle
     è ancora consegnabile non si scrive niente, perché non c'è nulla da
     promettere. */
  const cons = $('digConsegna');
  if (cons) {
    const pronti = DG.invendita(d);
    if (!pronti.length) { cons.hidden = true; cons.textContent = '' }
    else {
      const modi = new Set(pronti.map(b => DG.consegna(b).modo));
      cons.hidden = false;
      cons.textContent = modi.size === 1 && modi.has('email')
        ? t2('I file arrivano per email dopo la conferma dell\'ordine.', 'Files arrive by email once the order is confirmed.', L)
        : t2('Come ricevi i file è scritto su ogni scheda.', 'How you receive the files is stated on each page.', L);
    }
  }
}

export function renderTutto(L = 'it') {
  renderIntro(L); renderFiltri(L); renderGriglia(L); renderLicenze(L); renderFaq(L);
  /* REGOLA 12: ogni .reveal deve essere raggiunto da observeAll(). Quello
     dentro renderGriglia osserva solo ciò che esiste in quel momento, e
     licenze e domande nascono due righe dopo. Oggi arriva comunque il giro
     finale di renderAll(), ma chi un domani chiamasse solo renderTutto()
     si ritroverebbe due sezioni a opacity:0 per sempre, senza un errore da
     nessuna parte. Il giro si fa a pagina completa. */
  observeAll();
}

/* Il carrello è quello del sito: una riga digitale ci entra come le altre.
   Il controllo di consegna sta anche qui e non solo nella tessera, perché
   un'azione raggiungibile da tastiera o da un indirizzo non deve dipendere
   da quale bottone è stato disegnato. */
export function aggiungi(id) {
  const d = D();
  const b = DG.trova(d, id);
  if (!b) return;
  if (!DG.acquistabile(b)) return;
  CART.addDigital(b.id);
}
