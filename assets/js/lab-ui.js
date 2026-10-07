/* ============ LAB — DISEGNO DELLE PAGINE ============

   Materiali, Tecnologie e Macchine. Il contenuto arriva tutto da lab.js,
   che è puro e verificato: qui si fa solo HTML.

   Due regole che valgono per ogni riga di questo file:

   1. Le classi usate esistono già nel design system (.wrap, .phero, .rcard,
      .pgrid, .fitem, .vert-*). Una sezione nuova che si porta dietro il suo
      stile è una sezione che fra sei mesi non somiglia più al resto del sito.
   2. Tutto ciò che viene dai dati passa da esc(). I testi li scrive una
      persona nell'Admin: un apice storto non deve diventare codice. */

import * as LAB from './lab.js';
import { observeAll } from './animations.js';
import { BASE } from './navigation.js';
/* Il carrello è quello del sito: una riga del Lab ci entra come le altre. */
import * as CART from './products.js';

/* Gli indirizzi nascono sempre sotto la base del sito. Scritti assoluti
   funzionavano solo perché il router intercetta il clic: tasto centrale,
   "apri in una nuova scheda" e "copia link" finivano su un 404 ovunque il
   sito non stia nella radice del dominio — cioè in ogni anteprima su
   GitHub Pages, che serve il repository in una sottocartella. */
const via = p => BASE.replace(/\/+$/, '') + p;

const esc = t => String(t == null ? '' : t)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const $ = id => document.getElementById(id);
const D = () => window.INGLY || {};

/* Un'etichetta nella lingua attiva, senza dover importare utils ovunque. */
const t2 = (it, en, L) => (L === 'en' ? en : it);

/* ---------- mattoni comuni ---------- */

function chips(lista) {
  if (!lista || !lista.length) return '';
  return '<div class="lab-chips">' + lista.map(x => `<span class="lab-chip">${esc(x)}</span>`).join('') + '</div>';
}

function elenco(titolo, voci) {
  if (!voci || !voci.length) return '';
  return `<div class="lab-blocco">
    <h3 class="lab-h3">${esc(titolo)}</h3>
    <ul class="lab-lista">${voci.map(v => `<li>${esc(v)}</li>`).join('')}</ul>
  </div>`;
}

function faqHtml(faq, L) {
  if (!faq || !faq.length) return '';
  return `<h3 class="vert-tit">${t2('Domande frequenti', 'FAQ', L)}</h3>` +
    faq.map(f => `<details class="fitem reveal"><summary>${esc(LAB.lingua(f.d, L))}<span class="pl" aria-hidden="true">+</span></summary>
      <div class="fbody"><p>${esc(LAB.lingua(f.r, L))}</p></div></details>`).join('');
}

/* Una pastiglia con il gradiente del materiale: nessuna foto da produrre,
   e il colore è quello già dichiarato nei dati, non uno inventato qui. */
function tesseraMateriale(m, L, n) {
  const g = String(m.grad || '#3a2f26,#6b543e').split(',');
  return `<a class="vert-card lab-card reveal" href="${via('/materiali/' + esc(m.id))}">
    <span class="lab-swatch" style="--a:${esc(g[0] || '#333')};--b:${esc(g[1] || g[0] || '#111')}" aria-hidden="true"></span>
    <b>${esc(LAB.lingua(m.n, L))}</b>
    <span class="vert-sub">${esc(LAB.lingua(m.sommario, L))}</span>
    <span class="vert-go">${(() => {
      const da = LAB.daPrezzo(m);
      if (LAB.inVendita(m) && da != null) return t2('da ', 'from ', L) + prezzoLab(da, L);
      return n ? n + ' ' + t2('creazioni', 'creations', L) : t2('Scopri', 'Explore', L);
    })()} <i class="arr">→</i></span>
  </a>`;
}

function tesseraTecnologia(t, L) {
  return `<a class="vert-card lab-card reveal" href="${via('/tecnologie/' + esc(t.id))}">
    <b>${esc(LAB.lingua(t.n, L))}</b>
    <span class="vert-sub">${esc(LAB.lingua(t.sommario, L))}</span>
    <span class="vert-go">${t2('Scopri', 'Explore', L)} <i class="arr">→</i></span>
  </a>`;
}

/* ---------- MATERIALI ---------- */

export function renderMateriali(L) {
  const box = $('labMatGrid');
  if (!box) return;
  const d = D();
  const lista = LAB.filtra(d, FILTRI);
  const n = LAB.conteggi(d);
  box.innerHTML = lista.length
    ? '<div class="vert-grid">' + lista.map(m => tesseraMateriale(m, L, n[m.id])).join('') + '</div>'
    : `<p class="lab-nulla">${t2('Nessun materiale con questi filtri. Togline uno per allargare la ricerca.',
        'No material matches these filters. Remove one to widen the search.', L)}</p>`;
  const conta = $('fmConta');
  if (conta) conta.textContent = `${lista.length} / ${LAB.materiali(d).length}`;
  renderTrovaSoluzione(L);
}

/* La scheda di un materiale: tutto ciò che la §7 chiede, nell'ordine in cui
   serve a chi deve decidere — cosa è, cosa ci si fa, con cosa si lavora,
   cosa comprare, cosa sapere prima. */
export function renderMateriale(id, L, cardProdotto) {
  const pagina = $('matPage'), hero = document.querySelector('#page-materiali .phero');
  if (!pagina) return;
  const d = D();
  const m = id ? LAB.materiale(d, id) : null;
  if (!m) { pagina.hidden = true; pagina.innerHTML = ''; if (hero) hero.hidden = false; return; }

  if (hero) hero.hidden = true;
  pagina.hidden = false;

  const tecs = LAB.tecnologieDi(d, m);
  const macs = LAB.macchineDi(d, m);
  const prods = LAB.prodottiDi(d, m, { max: 8 });
  const g = String(m.grad || '').split(',');

  pagina.innerHTML = `
    <nav class="vert-back"><a href="${via('/materiali')}" data-nav="materiali">← ${t2('Tutti i materiali', 'All materials', L)}</a></nav>
    <span class="lab-swatch lab-swatch--lg" style="--a:${esc(g[0] || '#333')};--b:${esc(g[1] || g[0] || '#111')}" aria-hidden="true"></span>
    <span class="eyebrow">${t2('Material Lab', 'Material Lab', L)}</span>
    <h1 class="h2" style="font-size:clamp(2.2rem,5vw,3.6rem)">${esc(LAB.lingua(m.n, L))}</h1>
    <p class="sub">${esc(LAB.lingua(m.sommario, L))}</p>
    <p class="vert-intro">${esc(LAB.lingua(m.descrizione, L))}</p>

    ${tecs.length ? `<h3 class="vert-tit">${t2('Come lo lavoriamo', 'How we work it', L)}</h3>
      <div class="b2b-cards">${tecs.map((t, i) => `
        <a class="rcard reveal lab-rel" href="${via('/tecnologie/' + esc(t.id))}" style="transition-delay:${i * .06}s">
          <h3 class="lab-h3">${esc(LAB.lingua(t.n, L))}</h3>
          <p class="lab-p">${esc(LAB.lingua(t.sommario, L))}</p>
          <span class="vert-go">${t2('La tecnologia', 'The technology', L)} <i class="arr">→</i></span>
        </a>`).join('')}</div>` : ''}

    <div class="lab-griglia">
      ${elenco(t2('Lavorazioni possibili', 'Possible operations', L), LAB.listaLingua(m.lavorazioni, L))}
      ${elenco(t2('Usi tipici', 'Typical uses', L), LAB.listaLingua(m.usi, L))}
      ${elenco(t2('Consigli', 'Advice', L), LAB.listaLingua(m.consigli, L))}
      ${elenco(t2('Da sapere prima', 'Know before you start', L), LAB.listaLingua(m.limiti, L))}
    </div>

    ${(m.spessori || []).length ? `<h3 class="vert-tit">${t2('Spessori', 'Thicknesses', L)}</h3>${chips(m.spessori)}` : ''}
    ${LAB.listaLingua(m.finiture, L).length ? `<h3 class="vert-tit">${t2('Finiture', 'Finishes', L)}</h3>${chips(LAB.listaLingua(m.finiture, L))}` : ''}

    ${macs.length ? `<h3 class="vert-tit">${t2('Su quali macchine', 'On which machines', L)}</h3>
      ${chips(macs.map(x => LAB.lingua(x.n, L)))}` : ''}

    ${prods.length ? `<h3 class="vert-tit">${t2('Creazioni in questo materiale', 'Creations in this material', L)}</h3>
      <div class="pgrid">${prods.map(p => cardProdotto(p)).join('')}</div>` : ''}

    ${bloccoVendita(m, L)}

    ${faqHtml(m.faq, L)}

    <div class="hero-ctas lab-ctas">
      <button class="btn btn-primary magnetic" data-action="go" data-arg="quote">
        ${t2('Richiedi un progetto in ' + LAB.lingua(m.n, 'it'), 'Request a project', L)} <span class="arr">→</span></button>
      <a class="btn btn-ghost magnetic" href="${via('/shop')}">${t2('Vedi il catalogo', 'Browse the catalogue', L)}</a>
    </div>`;

  legaVendita(m, L);
  observeAll();
}

/* ---------- TECNOLOGIE ---------- */

export function renderTecnologie(L) {
  const box = $('labTecGrid');
  if (!box) return;
  const lista = LAB.tecnologie(D());
  box.innerHTML = lista.length
    ? '<div class="vert-grid">' + lista.map(t => tesseraTecnologia(t, L)).join('') + '</div>'
    : '';
}

export function renderTecnologia(id, L, cardProdotto) {
  const pagina = $('tecPage'), hero = document.querySelector('#page-tecnologie .phero');
  if (!pagina) return;
  const d = D();
  const t = id ? LAB.tecnologia(d, id) : null;
  if (!t) { pagina.hidden = true; pagina.innerHTML = ''; if (hero) hero.hidden = false; return; }

  if (hero) hero.hidden = true;
  pagina.hidden = false;

  const mats = LAB.materialiDi(d, t);
  const macs = (t.macchine || []).map(x => LAB.macchina(d, x)).filter(Boolean);
  const prods = LAB.prodottiDiTecnologia(d, t, { max: 8 });

  pagina.innerHTML = `
    <nav class="vert-back"><a href="${via('/tecnologie')}" data-nav="tecnologie">← ${t2('Tutte le tecnologie', 'All technologies', L)}</a></nav>
    <span class="eyebrow">${t2('Technology Hub', 'Technology Hub', L)}</span>
    <h1 class="h2" style="font-size:clamp(2.2rem,5vw,3.6rem)">${esc(LAB.lingua(t.n, L))}</h1>
    <p class="sub">${esc(LAB.lingua(t.sommario, L))}</p>
    <p class="vert-intro">${esc(LAB.lingua(t.descrizione, L))}</p>

    ${(t.processo || []).length ? `<h3 class="vert-tit">${t2('Come si lavora', 'The process', L)}</h3>
      <div class="b2b-cards">${t.processo.map((p, i) => `
        <div class="rcard reveal" style="transition-delay:${i * .06}s">
          <span class="lab-n">${String(i + 1).padStart(2, '0')}</span>
          <h3 class="lab-h3">${esc(LAB.lingua(p.t, L))}</h3>
          <p class="lab-p">${esc(LAB.lingua(p.d, L))}</p>
        </div>`).join('')}</div>` : ''}

    ${mats.length ? `<h3 class="vert-tit">${t2('Materiali che lavora', 'Materials it works', L)}</h3>
      <div class="vert-grid">${mats.map(m => tesseraMateriale(m, L, LAB.prodottiDi(d, m, { max: 0 }).length)).join('')}</div>` : ''}

    ${LAB.listaLingua(t.applicazioni, L).length
      ? `<h3 class="vert-tit">${t2('Cosa possiamo creare', 'What we can make', L)}</h3>${chips(LAB.listaLingua(t.applicazioni, L))}` : ''}

    ${macs.length ? `<h3 class="vert-tit">${t2('Con quali macchine', 'On which machines', L)}</h3>
      ${chips(macs.map(x => LAB.lingua(x.n, L)))}` : ''}

    ${prods.length ? `<h3 class="vert-tit">${t2('Creazioni realizzate così', 'Creations made this way', L)}</h3>
      <div class="pgrid">${prods.map(p => cardProdotto(p)).join('')}</div>` : ''}

    ${faqHtml(t.faq, L)}

    <div class="hero-ctas lab-ctas">
      <button class="btn btn-primary magnetic" data-action="go" data-arg="quote">
        ${t2('Parliamo del tuo progetto', 'Talk about your project', L)} <span class="arr">→</span></button>
    </div>`;

  observeAll();
}

/* ---------- MACCHINE ---------- */

export function renderMacchine(L) {
  const box = $('labMacGrid');
  if (!box) return;
  const d = D();
  const lista = LAB.macchine(d);
  const combi = (d.MACCHINE && d.MACCHINE.combinazioni) || [];
  const vietati = (d.MACCHINE && d.MACCHINE.maiLavorare && d.MACCHINE.maiLavorare.materiali) || [];

  box.innerHTML = `
    ${lista.length ? `<div class="b2b-cards">${lista.map((m, i) => `
      <div class="rcard reveal" style="transition-delay:${i * .06}s">
        <span class="lab-n">${esc(m.sorgente || '')}</span>
        <h3 class="lab-h3">${esc(LAB.lingua(m.n, L))}</h3>
        <p class="lab-p">${esc(LAB.lingua(m.ruolo, L))}</p>
        ${m.piano ? `<p class="lab-spec">${esc(m.piano.x + ' × ' + m.piano.y + ' ' + (m.piano.unita || 'mm'))}${m.piano.z ? esc(' · h ' + m.piano.z + ' ' + (m.piano.unita || 'mm')) : ''}</p>` : ''}
        ${(m.puo || []).length ? chips(m.puo) : ''}
      </div>`).join('')}</div>` : ''}

    ${combi.length ? `<h3 class="vert-tit">${t2('Cosa si sblocca mettendole insieme', 'What combining them unlocks', L)}</h3>
      <div class="b2b-cards">${combi.map((c, i) => `
        <div class="rcard reveal" style="transition-delay:${i * .06}s">
          <h3 class="lab-h3">${esc(c.cosa || '')}</h3>
          <p class="lab-p">${esc(c.sblocca || '')}</p>
        </div>`).join('')}</div>` : ''}

    ${vietati.length ? `<h3 class="vert-tit">${t2('Quello che non lavoriamo, e perché', 'What we do not work, and why', L)}</h3>
      <div class="lab-blocco"><ul class="lab-lista lab-lista--no">${vietati.map(v =>
        `<li><b>${esc(v.m)}</b> — ${esc(v.perche)}</li>`).join('')}</ul></div>` : ''}`;
}

/* ---------- TROVA LA SOLUZIONE (§21) ----------

   Chi arriva non sa come si chiama la tecnologia che gli serve: sa su cosa
   vuole stampare e che effetto vuole ottenere. Si parte da lì. */

export function renderTrovaSoluzione(L) {
  const box = $('labTrova');
  if (!box) return;
  const d = D();
  const mats = LAB.materiali(d);
  if (!mats.length) { box.innerHTML = ''; return; }

  const EFF = [
    ['incisione', 'Incidere', 'Engrave'],
    ['taglio', 'Tagliare una forma', 'Cut a shape'],
    ['colore', 'Stampare a colori', 'Print in colour'],
    ['permanente', 'Marchio permanente', 'Permanent mark'],
    ['volume', 'Un pezzo in volume', 'A 3D part']
  ];

  box.innerHTML = `
    <h3 class="vert-tit">${t2('Non sai da dove partire?', 'Not sure where to start?', L)}</h3>
    <p class="lab-p">${t2(
      'Scegli il materiale e che cosa vuoi ottenere: ti diciamo quale tecnologia serve, e perché.',
      'Pick the material and what you want to achieve: we tell you which technology it takes, and why.', L)}</p>
    <div class="lab-trova">
      <label class="lab-campo"><span>${t2('Su cosa', 'On what', L)}</span>
        <select id="trovaMat">
          <option value="">${t2('— qualsiasi —', '— any —', L)}</option>
          ${mats.map(m => `<option value="${esc(m.id)}">${esc(LAB.lingua(m.n, L))}</option>`).join('')}
        </select></label>
      <label class="lab-campo"><span>${t2('Cosa vuoi fare', 'What you want', L)}</span>
        <select id="trovaEff">
          <option value="">${t2('— qualsiasi —', '— any —', L)}</option>
          ${EFF.map(([v, it, en]) => `<option value="${v}">${esc(t2(it, en, L))}</option>`).join('')}
        </select></label>
    </div>
    <div id="trovaEsito" class="lab-esito" aria-live="polite"></div>`;

  const aggiorna = () => {
    const matId = $('trovaMat').value, eff = $('trovaEff').value;
    const esito = $('trovaEsito');
    if (!matId && !eff) { esito.innerHTML = ''; return; }
    const r = LAB.suggerisci(d, { materiale: matId, effetto: eff }, L);
    if (!r.length) {
      /* Nessuna risposta è una risposta: meglio dire che quella combinazione
         non si fa, che indicare una tecnologia che non la esegue. */
      esito.innerHTML = `<p class="lab-nulla">${t2(
        'Questa combinazione non la lavoriamo. Scrivici cosa ti serve: spesso si arriva allo stesso risultato cambiando materiale.',
        'We do not work this combination. Tell us what you need: the same result is often reachable with another material.', L)}</p>`;
      return;
    }
    esito.innerHTML = '<div class="vert-grid">' + r.slice(0, 3).map(s => `
      <a class="vert-card lab-card reveal" href="${via('/tecnologie/' + esc(s.tecnologia.id))}">
        <b>${esc(LAB.lingua(s.tecnologia.n, L))}</b>
        <span class="vert-sub">${esc(LAB.lingua(s.tecnologia.sommario, L))}</span>
        <span class="vert-go">${t2('Scopri', 'Explore', L)} <i class="arr">→</i></span>
      </a>`).join('') + '</div>';
    observeAll();
  };

  $('trovaMat').addEventListener('change', aggiorna);
  $('trovaEff').addEventListener('change', aggiorna);
}

/* La scheda aperta, qualunque sezione sia. Tenuto qui perché main.js deve
   poterne chiamare una sola. */
export function renderScheda(sezione, id, L, cardProdotto) {
  if (sezione === 'materiali') renderMateriale(id, L, cardProdotto);
  else if (sezione === 'tecnologie') renderTecnologia(id, L, cardProdotto);
}

/* ============ VENDITA, ACADEMY, MACCHINE, DEMO ============ */

/* Il prezzo si scrive come lo scrive il resto del sito: una cifra quando
   c'è, «su richiesta» quando non c'è. Non si mette uno zero al posto di un
   prezzo che nessuno ha ancora deciso. */
const prezzoLab = (n, L) => n == null
  ? t2('Prezzo su richiesta', 'Price on request', L)
  : '€' + Number(n).toFixed(2).replace('.', ',');

/* ---------- filtri del negozio materiali (§8) ---------- */

const FILTRI = { q: '', tecnologia: '', spessore: '', colore: '', disponibile: false };

export function renderFiltriMateriali(L) {
  const box = $('labMatFiltri');
  if (!box) return;
  const d = D();
  const tec = LAB.tecnologie(d);
  const sp = [...new Set(LAB.materiali(d).flatMap(m => LAB.varianti(m).map(v => v.spessore)))]
    .filter(x => x && x !== '—').sort();
  const col = [...new Set(LAB.materiali(d).flatMap(m => LAB.varianti(m).map(v => v.colore)))]
    .filter(Boolean).sort();

  box.innerHTML = `
    <div class="lab-filtri">
      <label class="lab-campo lab-campo--cerca">
        <span>${t2('Cerca', 'Search', L)}</span>
        <input type="search" id="fmQ" placeholder="${esc(t2('plexiglass trasparente, legno 3 mm…', 'clear acrylic, 3 mm wood…', L))}">
      </label>
      <label class="lab-campo"><span>${t2('Tecnologia', 'Technology', L)}</span>
        <select id="fmTec"><option value="">${t2('Tutte', 'All', L)}</option>
          ${tec.map(t => `<option value="${esc(t.id)}">${esc(LAB.lingua(t.n, L))}</option>`).join('')}</select></label>
      <label class="lab-campo"><span>${t2('Spessore', 'Thickness', L)}</span>
        <select id="fmSp"><option value="">${t2('Tutti', 'All', L)}</option>
          ${sp.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join('')}</select></label>
      <label class="lab-campo"><span>${t2('Colore', 'Colour', L)}</span>
        <select id="fmCol"><option value="">${t2('Tutti', 'All', L)}</option>
          ${col.map(x => `<option value="${esc(x)}">${esc(x)}</option>`).join('')}</select></label>
    </div>
    <p class="lab-conteggio" id="fmConta" aria-live="polite"></p>`;

  const aggiorna = () => {
    FILTRI.q = $('fmQ').value;
    FILTRI.tecnologia = $('fmTec').value;
    FILTRI.spessore = $('fmSp').value;
    FILTRI.colore = $('fmCol').value;
    renderMateriali(L);
  };
  $('fmQ').addEventListener('input', aggiorna);
  ['fmTec', 'fmSp', 'fmCol'].forEach(id => $(id).addEventListener('change', aggiorna));
}

/* ---------- scheda materiale: le varianti e il carrello ---------- */

function bloccoVendita(m, L) {
  const vs = LAB.varianti(m);
  if (!vs.length) return '';
  const o = LAB.opzioni(m);
  const vendibile = LAB.inVendita(m);
  const sel = (id, et, voci) => voci.length > 1 ? `
    <label class="lab-campo"><span>${esc(et)}</span>
      <select id="${id}">${voci.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('')}</select></label>` : '';

  return `
    <h3 class="vert-tit">${t2('Acquista il materiale', 'Buy the material', L)}</h3>
    <div class="lab-vendita">
      <div class="lab-trova">
        ${sel('vFormato', t2('Formato', 'Size', L), o.formato)}
        ${sel('vSpessore', t2('Spessore', 'Thickness', L), o.spessore)}
        ${sel('vColore', t2('Colore', 'Colour', L), o.colore)}
      </div>
      <div class="lab-prezzo-riga">
        <span class="lab-prezzo" id="vPrezzo"></span>
        ${vendibile
          ? `<button class="btn btn-primary magnetic" id="vAdd">${t2('Aggiungi al carrello', 'Add to cart', L)} <span class="arr">→</span></button>`
          : `<button class="btn btn-primary magnetic" data-action="go" data-arg="quote">${t2('Richiedi disponibilità e prezzo', 'Ask for price and stock', L)} <span class="arr">→</span></button>`}
      </div>
      ${vendibile ? '' : `<p class="lab-nulla">${t2(
        'Questo materiale lo lavoriamo tutti i giorni, ma non è ancora a listino per la vendita diretta: scrivici formato e quantità e ti diciamo prezzo e tempi.',
        'We work this material every day, but it is not yet listed for direct sale: tell us size and quantity and we will send price and lead time.', L)}</p>`}
    </div>`;
}

/** Collega i selettori alla variante scelta e al carrello. */
function legaVendita(m, L) {
  if (!LAB.varianti(m).length) return;
  const leggi = () => {
    const f = $('vFormato')?.value, s = $('vSpessore')?.value, c = $('vColore')?.value;
    return LAB.varianti(m).find(v =>
      (!f || v.formato === f) && (!s || v.spessore === s) && (!c || v.colore === c)) || null;
  };
  const mostra = () => {
    const v = leggi();
    const el = $('vPrezzo');
    if (el) el.textContent = v ? prezzoLab(v.prezzo, L) : t2('Combinazione non disponibile', 'Combination unavailable', L);
    const b = $('vAdd');
    if (b) b.disabled = !v || v.prezzo == null;
  };
  ['vFormato', 'vSpessore', 'vColore'].forEach(id => $(id)?.addEventListener('change', mostra));
  mostra();

  $('vAdd')?.addEventListener('click', () => {
    const v = leggi();
    if (!v || v.prezzo == null) return;
    const g = String(m.grad || '').split(',');
    CART.addLab({
      tipo: 'materiale', rif: 'mat:' + v.id,
      nome: LAB.lingua(m.n, L) + ' · ' + [v.formato, v.spessore, v.colore].filter(x => x && x !== '—').join(' · '),
      meta: (m.vendita && m.vendita.unita) || '',
      icon: '▤', bg: `linear-gradient(140deg,${g[0] || '#333'},${g[1] || g[0] || '#111'})`
    }, 1, v.prezzo);
  });
}

/* ---------- Academy ---------- */

export function renderCorsi(L) {
  const box = $('labCorsiGrid');
  if (!box) return;
  const d = D();
  const lista = LAB.corsi(d);
  const intro = (d.CORSI && d.CORSI.intro) || {};

  /* Nessun corso pubblicato: si dice, e si offre il canale che esiste.
     Un catalogo finto sarebbe peggio di un catalogo vuoto. */
  if (!lista.length) {
    box.innerHTML = `
      <div class="lab-blocco lab-vuoto">
        <p class="lab-p">${esc(LAB.lingua(intro.vuoto, L))}</p>
        <div class="hero-ctas lab-ctas">
          <button class="btn btn-primary magnetic" data-action="go" data-arg="quote">
            ${t2('Dimmi cosa ti serve', 'Tell us what you need', L)} <span class="arr">→</span></button>
          <a class="btn btn-ghost magnetic" href="${via('/macchine')}">${t2('Guarda le macchine', 'See the machines', L)}</a>
        </div>
      </div>`;
    return;
  }

  box.innerHTML = '<div class="vert-grid">' + lista.map(c => `
    <a class="vert-card lab-card reveal" href="${via('/academy/' + esc(c.id))}">
      <span class="lab-n">${esc([LAB.lingua(c.durata, L), c.livello].filter(Boolean).join(' · '))}</span>
      <b>${esc(LAB.lingua(c.n, L))}</b>
      <span class="vert-sub">${esc(LAB.lingua(c.sommario, L))}</span>
      <span class="vert-go">${esc(prezzoLab(c.prezzo, L))} <i class="arr">→</i></span>
    </a>`).join('') + '</div>';
}

export function renderCorso(id, L) {
  const pagina = $('corsoPage'), hero = document.querySelector('#page-academy .phero');
  if (!pagina) return;
  const d = D();
  const c = id ? LAB.corso(d, id) : null;
  if (!c) { pagina.hidden = true; pagina.innerHTML = ''; if (hero) hero.hidden = false; return; }

  if (hero) hero.hidden = true;
  pagina.hidden = false;
  const mac = c.macchina ? LAB.modello(d, c.macchina) : null;
  const tec = c.tecnologia ? LAB.tecnologia(d, c.tecnologia) : null;

  pagina.innerHTML = `
    <nav class="vert-back"><a href="${via('/academy')}" data-nav="academy">← ${t2('Tutti i corsi', 'All courses', L)}</a></nav>
    <span class="eyebrow">INGLY Academy</span>
    <h1 class="h2" style="font-size:clamp(2.2rem,5vw,3.6rem)">${esc(LAB.lingua(c.n, L))}</h1>
    <p class="sub">${esc(LAB.lingua(c.sommario, L))}</p>
    ${LAB.lingua(c.descrizione, L) ? `<p class="vert-intro">${esc(LAB.lingua(c.descrizione, L))}</p>` : ''}
    ${chips([LAB.lingua(c.durata, L), c.livello, c.formato, c.lezioni ? c.lezioni + ' ' + t2('lezioni', 'lessons', L) : ''].filter(Boolean))}

    <div class="lab-griglia">
      ${elenco(t2('A chi è rivolto', 'Who it is for', L), LAB.listaLingua(c.aChi, L))}
      ${elenco(t2('Cosa saprai fare', 'What you will be able to do', L), LAB.listaLingua(c.obiettivi, L))}
      ${elenco(t2('Requisiti', 'Requirements', L), LAB.listaLingua(c.requisiti, L))}
      ${elenco(t2('Materiali', 'Materials', L), LAB.listaLingua(c.materiali, L))}
    </div>

    ${(c.programma || []).length ? `<h3 class="vert-tit">${t2('Programma', 'Programme', L)}</h3>
      <div class="b2b-cards">${c.programma.map((p, i) => `
        <div class="rcard reveal" style="transition-delay:${i * .06}s">
          <span class="lab-n">${String(i + 1).padStart(2, '0')}</span>
          <h3 class="lab-h3">${esc(LAB.lingua(p.t, L))}</h3>
          <p class="lab-p">${esc(LAB.lingua(p.d, L))}</p></div>`).join('')}</div>` : ''}

    ${mac || tec ? `<h3 class="vert-tit">${t2('Su cosa si lavora', 'What you work on', L)}</h3>
      <div class="vert-grid">
        ${mac ? `<a class="vert-card lab-card" href="${via('/macchine/' + esc(mac.id))}"><b>${esc(LAB.lingua(mac.n, L))}</b>
          <span class="vert-sub">${esc(LAB.lingua(mac.ruolo, L))}</span>
          <span class="vert-go">${t2('La macchina', 'The machine', L)} <i class="arr">→</i></span></a>` : ''}
        ${tec ? `<a class="vert-card lab-card" href="${via('/tecnologie/' + esc(tec.id))}"><b>${esc(LAB.lingua(tec.n, L))}</b>
          <span class="vert-sub">${esc(LAB.lingua(tec.sommario, L))}</span>
          <span class="vert-go">${t2('La tecnologia', 'The technology', L)} <i class="arr">→</i></span></a>` : ''}
      </div>` : ''}

    ${LAB.lingua(c.progetto, L) ? `<h3 class="vert-tit">${t2('Il progetto finale', 'The final project', L)}</h3>
      <p class="lab-p">${esc(LAB.lingua(c.progetto, L))}</p>` : ''}

    ${faqHtml(c.faq, L)}

    <div class="lab-prezzo-riga lab-ctas">
      <span class="lab-prezzo">${esc(prezzoLab(c.prezzo, L))}</span>
      ${c.prezzo != null
        ? `<button class="btn btn-primary magnetic" id="cAdd">${t2('Iscriviti', 'Enrol', L)} <span class="arr">→</span></button>`
        : `<button class="btn btn-primary magnetic" data-action="go" data-arg="quote">${t2('Richiedi informazioni', 'Ask for details', L)} <span class="arr">→</span></button>`}
    </div>`;

  $('cAdd')?.addEventListener('click', () => CART.addLab({
    tipo: 'corso', rif: 'corso:' + c.id, nome: LAB.lingua(c.n, L),
    meta: [LAB.lingua(c.durata, L), c.formato].filter(Boolean).join(' · '), icon: '◎'
  }, 1, c.prezzo));

  observeAll();
}

/* ---------- scheda macchina ---------- */

export function renderMacchina(id, L, cardProdotto) {
  const pagina = $('macPage'), hero = document.querySelector('#page-macchine .phero');
  if (!pagina) return;
  const d = D();
  const m = id ? LAB.modello(d, id) : null;
  if (!m) { pagina.hidden = true; pagina.innerHTML = ''; if (hero) hero.hidden = false; return; }

  if (hero) hero.hidden = true;
  pagina.hidden = false;
  const tecs = LAB.tecnologieDiModello(d, m);
  const mats = LAB.materialiDiModello(d, m);
  const corsi = LAB.corsiDiMacchina(d, m.id);
  const dm = LAB.demo(d);
  const prods = mats.flatMap(x => LAB.prodottiDi(d, x, { max: 2 })).slice(0, 8);

  pagina.innerHTML = `
    <nav class="vert-back"><a href="${via('/macchine')}" data-nav="macchine">← ${t2('Tutte le macchine', 'All machines', L)}</a></nav>
    <span class="eyebrow">INGLY Machine Lab</span>
    <h1 class="h2" style="font-size:clamp(2.2rem,5vw,3.6rem)">${esc(LAB.lingua(m.n, L))}</h1>
    <p class="sub">${esc(LAB.lingua(m.ruolo, L))}</p>
    ${chips([
      m.inOfficina ? t2('In officina da noi', 'In our workshop', L) : t2('Assistenza e riparazione', 'Service and repair', L),
      m.assistenza ? t2('Centro ufficiale xTool', 'Official xTool centre', L) : ''
    ].filter(Boolean))}

    ${m.daCompletare ? `<p class="lab-nulla">${t2(
      'Le specifiche di questo modello non sono ancora state verificate da noi: su questa macchina diamo assistenza e ricambi, e preferiamo non riportare numeri che non abbiamo misurato. Per i dati esatti scrivici.',
      'We have not yet verified this model\'s specifications ourselves. We service and repair it, and prefer not to quote figures we have not measured.', L)}</p>` : ''}

    ${m.specs && m.specs.sorgente ? `<h3 class="vert-tit">${t2('Specifiche', 'Specifications', L)}</h3>
      ${chips([m.specs.sorgente,
        m.specs.piano ? `${m.specs.piano.x} × ${m.specs.piano.y} ${m.specs.piano.unita || 'mm'}` : '',
        m.specs.velocitaMax || ''].filter(Boolean))}` : ''}

    ${tecs.length ? `<h3 class="vert-tit">${t2('Tecnologie', 'Technologies', L)}</h3>
      <div class="vert-grid">${tecs.map(t => tesseraTecnologia(t, L)).join('')}</div>` : ''}

    ${mats.length ? `<h3 class="vert-tit">${t2('Materiali che lavora', 'Materials it works', L)}</h3>
      <div class="vert-grid">${mats.slice(0, 6).map(x => tesseraMateriale(x, L, LAB.prodottiDi(d, x, { max: 0 }).length)).join('')}</div>` : ''}

    ${prods.length ? `<h3 class="vert-tit">${t2('Cosa ci si può realizzare', 'What can be made with it', L)}</h3>
      <div class="pgrid">${prods.map(p => cardProdotto(p)).join('')}</div>` : ''}

    ${corsi.length ? `<h3 class="vert-tit">${t2('Impara a usarla', 'Learn to use it', L)}</h3>
      <div class="vert-grid">${corsi.map(c => `
        <a class="vert-card lab-card" href="${via('/academy/' + esc(c.id))}"><b>${esc(LAB.lingua(c.n, L))}</b>
        <span class="vert-sub">${esc(LAB.lingua(c.sommario, L))}</span>
        <span class="vert-go">${esc(prezzoLab(c.prezzo, L))} <i class="arr">→</i></span></a>`).join('')}</div>` : ''}

    ${m.inOfficina && m.demoDisponibile && dm.attiva ? `
      <h3 class="vert-tit">${t2('Provala', 'Try it', L)}</h3>
      <div class="lab-blocco">
        <p class="lab-p">${t2(
          'Questa macchina è in officina e lavora tutti i giorni. Puoi vederla accesa e provarla su un pezzo tuo.',
          'This machine is in the workshop and runs every day. You can see it working and try it on a piece of yours.', L)}</p>
        <div class="hero-ctas lab-ctas">${ctaDemo(dm, L)}</div>
      </div>` : ''}

    <div class="hero-ctas lab-ctas">
      <button class="btn btn-ghost magnetic" data-action="go" data-arg="quote">
        ${t2('Assistenza su questa macchina', 'Service for this machine', L)} <span class="arr">→</span></button>
    </div>`;

  observeAll();
}

/* ---------- demo ---------- */

/** Il bottone della demo, nei tre stati possibili. */
function ctaDemo(dm, L) {
  if (!dm.attiva) return '';
  const et = esc(LAB.lingua(dm.etichetta, L));
  if (dm.prenotabile) {
    return `<a class="btn btn-primary magnetic" href="${esc(dm.url)}"${dm.esterno ? ' target="_blank" rel="noopener"' : ''}>${et} <span class="arr">→</span></a>`;
  }
  /* Nessun link configurato: non si finge un calendario. Si offrono i due
     canali che esistono davvero e funzionano da subito. */
  const cfg = (D().CONFIG || {});
  const wa = cfg.whatsapp || cfg.contatti?.whatsapp || '';
  const mail = cfg.email || cfg.contatti?.email || 'inglydesign@gmail.com';
  return `
    ${wa ? `<a class="btn btn-primary magnetic" href="${esc(wa)}" target="_blank" rel="noopener">${t2('Scrivici su WhatsApp', 'Message us on WhatsApp', L)} <span class="arr">→</span></a>` : ''}
    <a class="btn btn-ghost magnetic" href="mailto:${esc(mail)}?subject=${encodeURIComponent(LAB.lingua(dm.etichetta, 'it'))}">${t2('Scrivi una email', 'Send an email', L)}</a>`;
}

export function renderDemo(L) {
  const box = $('labDemo');
  if (!box) return;
  const d = D();
  const dm = LAB.demo(d);
  const prova = LAB.macchineDaProvare(d);
  const tecs = LAB.tecnologie(d);

  const passi = [
    [t2('Prenota', 'Book', L), t2('Dici quale macchina ti interessa e quando puoi.', 'Tell us which machine interests you and when you can come.', L)],
    [t2('Vieni in officina', 'Come to the workshop', L), t2('A Cesena. Porta un disegno, una foto o il pezzo che vorresti fare.', 'In Cesena. Bring a drawing, a photo, or the piece you want to make.', L)],
    [t2('Prova', 'Try it', L), t2('La macchina lavora davanti a te, sul tuo materiale quando si può.', 'The machine works in front of you, on your material where possible.', L)],
    [t2('Chiedi', 'Ask', L), t2('Costi, tempi, cosa non sa fare. Soprattutto cosa non sa fare.', 'Costs, times, what it cannot do. Above all what it cannot do.', L)],
    [t2('Decidi', 'Decide', L), t2('Con calma, anche dopo. Non si vende niente in quell\'ora.', 'In your own time. Nothing is sold in that hour.', L)]
  ];

  box.innerHTML = `
    ${dm.gratuita ? `<p class="lab-gratis">${t2('La demo è gratuita.', 'The demo is free.', L)}</p>` : ''}

    <div class="hero-ctas lab-ctas">${ctaDemo(dm, L)}</div>
    ${!dm.prenotabile && dm.attiva ? `<p class="lab-nulla">${t2(
      'Il calendario online non è ancora collegato: per ora si fissa scrivendo, ed è anche il modo più veloce per dirci cosa vuoi provare.',
      'The online calendar is not connected yet: for now we arrange it by message, which is also the fastest way to tell us what you want to try.', L)}</p>` : ''}

    ${chips([LAB.lingua(dm.luogo, L), LAB.lingua(dm.durata, L)].filter(Boolean))}
    ${LAB.lingua(dm.note, L) ? `<p class="lab-p">${esc(LAB.lingua(dm.note, L))}</p>` : ''}

    ${prova.length ? `<h3 class="vert-tit">${t2('Le macchine che puoi provare', 'The machines you can try', L)}</h3>
      <div class="vert-grid">${prova.map(m => `
        <a class="vert-card lab-card reveal" href="${via('/macchine/' + esc(m.id))}">
          <b>${esc(LAB.lingua(m.n, L))}</b>
          <span class="vert-sub">${esc(LAB.lingua(m.ruolo, L))}</span>
          <span class="vert-go">${t2('La scheda', 'Details', L)} <i class="arr">→</i></span></a>`).join('')}</div>
      <p class="lab-p">${t2(
        'Sono le macchine che abbiamo in officina. Sul resto della gamma xTool diamo assistenza e ricambi come centro ufficiale, ma provarle qui non si può.',
        'These are the machines we have in the workshop. On the rest of the xTool range we provide service and parts as an official centre.', L)}</p>` : ''}

    ${tecs.length ? `<h3 class="vert-tit">${t2('Cosa puoi vedere lavorare', 'What you can see working', L)}</h3>
      ${chips(tecs.map(t => LAB.lingua(t.n, L)))}` : ''}

    <h3 class="vert-tit">${t2('Come funziona', 'How it works', L)}</h3>
    <div class="b2b-cards">${passi.map(([t, dd], i) => `
      <div class="rcard reveal" style="transition-delay:${i * .06}s">
        <span class="lab-n">${String(i + 1).padStart(2, '0')}</span>
        <h3 class="lab-h3">${esc(t)}</h3>
        <p class="lab-p">${esc(dd)}</p></div>`).join('')}</div>

    <div class="hero-ctas lab-ctas">${ctaDemo(dm, L)}</div>`;

  observeAll();
}
