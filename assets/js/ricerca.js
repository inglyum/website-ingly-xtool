/* ============ RICERCA ISTANTANEA (Fase 2) ============

   Prima la lente nell'header portava allo Shop e basta: per trovare una
   targa bisognava aprire il catalogo e cercare lì. Ora la lente apre una
   ricerca che risponde mentre si scrive, su tutto il sito: prodotti (con
   foto e prezzo), categorie e materiali.

   Due parti:
   - cerca(): funzione pura, nessun DOM — verificata in tests/test-ricerca.mjs;
   - initRicerca(): il pannello. La lente resta un link vero allo Shop: se il
     JavaScript non parte, porta comunque dove si può cercare. */

import { T, L, imgV, variantsOf, eur, fotoDisponibili } from './utils.js';

/* «Targhe in plexiglass» e «targa plexi» devono incontrarsi: minuscole,
   senza accenti, senza punteggiatura. */
export const norm = s => String(s == null ? '' : s)
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const lingua = (v, l) => (v && typeof v === 'object') ? String(v[l] || v.it || v.en || '') : String(v || '');

/* Ogni parola cercata deve comparire (anche come inizio di parola: «targ»
   trova «targa» e «targhe»). Il punteggio premia il nome rispetto alla
   descrizione, e l'inizio del nome rispetto al resto. */
function punteggio(parole, nome, extra) {
  const n = norm(nome), e = norm(extra);
  const tutto = n + ' ' + e;
  let s = 0;
  for (const w of parole) {
    const inNome = n.split(' ').some(x => x.startsWith(w));
    const ovunque = inNome || tutto.split(' ').some(x => x.startsWith(w)) || tutto.includes(w);
    if (!ovunque) return 0;
    s += inNome ? 10 : 2;
  }
  if (n.startsWith(parole[0])) s += 5;
  return s;
}

/**
 * Cerca nei dati del sito.
 * @param {string} q testo scritto
 * @param {object} D window.INGLY (P, CATS, MATERIALI, MATN)
 * @returns {{prodotti:Array, categorie:Array, materiali:Array, totale:number}}
 */
export function cerca(q, D = {}, { l = 'it', max = 6 } = {}) {
  const parole = norm(q).split(' ').filter(w => w.length >= 2);
  const vuoto = { prodotti: [], categorie: [], materiali: [], totale: 0 };
  if (!parole.length) return vuoto;
  const cats = Array.isArray(D.CATS) ? D.CATS : [];
  const nomeCat = id => lingua((cats.find(c => c && c.id === id) || {}).n, l);
  const matN = D.MATN || {};

  const prodotti = (Array.isArray(D.P) ? D.P : [])
    .filter(p => p && !p.hidden && p.n)
    .map(p => ({ p, s: punteggio(parole, lingua(p.n, l),
      [lingua(p.desc, l), nomeCat(p.cat), lingua(matN[p.mat], l) || p.mat, p.sku, p.tag].join(' ')) }))
    .filter(x => x.s > 0)
    .sort((a, b) => b.s - a.s || (b.p.rev || 0) - (a.p.rev || 0));

  const categorie = cats
    .filter(c => c && c.id && c.n)
    .map(c => ({ c, s: punteggio(parole, lingua(c.n, l), lingua(c.s, l)) }))
    .filter(x => x.s > 0).sort((a, b) => b.s - a.s);

  const mats = (D.MATERIALI && Array.isArray(D.MATERIALI.materiali)) ? D.MATERIALI.materiali : [];
  const materiali = mats
    .filter(m => m && m.id && m.n)
    .map(m => ({ m, s: punteggio(parole, lingua(m.n, l), lingua(m.sommario, l)) }))
    .filter(x => x.s > 0).sort((a, b) => b.s - a.s);

  return {
    prodotti: prodotti.slice(0, max).map(x => x.p),
    categorie: categorie.slice(0, 4).map(x => x.c),
    materiali: materiali.slice(0, 4).map(x => x.m),
    totale: prodotti.length + categorie.length + materiali.length
  };
}

/* ---------------- interfaccia ---------------- */

const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* La miniatura: solo una foto che esiste davvero (fotoDisponibili, la stessa
   regola delle card dello Shop — 43 prodotti non hanno ancora foto e
   mostrano la loro icona), e la variante da 400 px solo se esiste (regola 2). */
export const miniatura = p => {
  const src = fotoDisponibili(p)[0];
  if (!src) return '';
  const v = variantsOf(src).includes(400) ? src.replace(/\.webp$/, '-400.webp') : src;
  return imgV(v);
};

let pannello = null, campo = null, lista = null, ultimoFuoco = null, attesa = null;

function voce(href, titolo, sotto, img, icona) {
  const media = img
    ? `<img src="${esc(img)}" alt="" width="48" height="48" loading="lazy" decoding="async">`
    : `<span class="rc-icona" aria-hidden="true">${esc(icona || '•')}</span>`;
  return `<li role="option"><a class="rc-voce" href="${esc(href)}">${media}<span class="rc-testo"><strong>${esc(titolo)}</strong>${sotto ? `<small>${esc(sotto)}</small>` : ''}</span></a></li>`;
}

function disegna(q) {
  const D = window.INGLY || {};
  const r = cerca(q, D, { l: L });
  const testo = q.trim();
  if (!testo || norm(testo).length < 2) {
    lista.innerHTML = `<p class="rc-aiuto">${esc(T('rcAiuto'))}</p>`;
    campo.setAttribute('aria-expanded', 'false');
    return;
  }
  if (!r.totale) {
    lista.innerHTML = `<p class="rc-vuoto">${esc(T('rcNessuno'))} «${esc(testo)}».</p>
      <a class="rc-tutto" href="quote">${esc(T('rcSuMisura'))} →</a>`;
    campo.setAttribute('aria-expanded', 'false');
    return;
  }
  const blocchi = [];
  if (r.prodotti.length) blocchi.push(`<p class="rc-gruppo">${esc(T('rcProdotti'))}</p><ul class="rc-lista" role="listbox">` +
    r.prodotti.map(p => voce('product/' + p.id + '/', lingua(p.n, L),
      p.price != null && Number(p.price) > 0 ? eur(Number(p.price)) : '', miniatura(p), p.icon)).join('') + '</ul>');
  if (r.categorie.length) blocchi.push(`<p class="rc-gruppo">${esc(T('rcCategorie'))}</p><ul class="rc-lista" role="listbox">` +
    r.categorie.map(c => voce('shop?cat=' + encodeURIComponent(c.id), lingua(c.n, L), lingua(c.s, L), '', c.ic)).join('') + '</ul>');
  if (r.materiali.length) blocchi.push(`<p class="rc-gruppo">${esc(T('rcMateriali'))}</p><ul class="rc-lista" role="listbox">` +
    r.materiali.map(m => voce('materiali/' + encodeURIComponent(m.id), lingua(m.n, L), lingua(m.sommario, L), '', '◆')).join('') + '</ul>');
  blocchi.push(`<a class="rc-tutto" href="shop?q=${encodeURIComponent(testo)}">${esc(T('rcTutti'))} (${r.totale}) →</a>`);
  lista.innerHTML = blocchi.join('');
  campo.setAttribute('aria-expanded', 'true');
}

function apri() {
  if (!pannello) return;
  ultimoFuoco = document.activeElement;
  pannello.hidden = false;
  document.documentElement.classList.add('rc-aperta');
  requestAnimationFrame(() => { campo.focus(); campo.select(); });
  disegna(campo.value);
}

function chiudi() {
  if (!pannello || pannello.hidden) return;
  pannello.hidden = true;
  document.documentElement.classList.remove('rc-aperta');
  if (ultimoFuoco && ultimoFuoco.focus) ultimoFuoco.focus();
}

function voci() { return [...lista.querySelectorAll('a')]; }

export function initRicerca() {
  if (pannello) return;
  pannello = document.createElement('div');
  pannello.className = 'rc-pannello';
  pannello.id = 'ricercaPannello';
  pannello.hidden = true;
  pannello.setAttribute('role', 'dialog');
  pannello.setAttribute('aria-modal', 'true');
  pannello.setAttribute('aria-label', T('rcTitolo'));
  pannello.innerHTML = `<div class="rc-velo" data-rc-chiudi></div>
    <div class="rc-box">
      <div class="rc-riga">
        <svg class="rc-lente" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>
        <input id="rcCampo" class="rc-campo" type="search" autocomplete="off" spellcheck="false"
          role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="rcRisultati"
          placeholder="${esc(T('rcPh'))}" aria-label="${esc(T('rcTitolo'))}">
        <button type="button" class="rc-chiudi" data-rc-chiudi aria-label="${esc(T('rcChiudi'))}">Esc</button>
      </div>
      <div id="rcRisultati" class="rc-risultati" aria-live="polite"></div>
    </div>`;
  document.body.appendChild(pannello);
  campo = pannello.querySelector('#rcCampo');
  lista = pannello.querySelector('#rcRisultati');

  campo.addEventListener('input', () => {
    clearTimeout(attesa);
    attesa = setTimeout(() => disegna(campo.value), 60);
  });
  pannello.addEventListener('click', e => {
    if (e.target.closest('[data-rc-chiudi]')) { chiudi(); return; }
    if (e.target.closest('a')) chiudi();   /* il router apre la pagina */
  });
  pannello.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.preventDefault(); chiudi(); return; }
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp' && e.key !== 'Enter') return;
    const v = voci();
    if (!v.length) return;
    const i = v.indexOf(document.activeElement);
    if (e.key === 'Enter') {
      if (document.activeElement === campo) { e.preventDefault(); v[0].click(); }
      return;
    }
    e.preventDefault();
    const j = e.key === 'ArrowDown' ? (i < 0 ? 0 : Math.min(i + 1, v.length - 1)) : (i <= 0 ? -1 : i - 1);
    (j < 0 ? campo : v[j]).focus();
  });

  /* La lente: un clic apre la ricerca invece di andare allo Shop.
     Su window in fase di cattura: arriva PRIMA del router (che ascolta sul
     documento), altrimenti la ricerca si apriva e intanto sotto partiva lo
     Shop. */
  window.addEventListener('click', e => {
    const lente = e.target.closest('.atelier-search-link,[data-action="search-open"]');
    if (!lente || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    apri();
  }, true);
  /* «/» apre la ricerca, come nei negozi online — ma non mentre si scrive. */
  document.addEventListener('keydown', e => {
    if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    if (t && (t.isContentEditable || /^(input|textarea|select)$/i.test(t.tagName))) return;
    e.preventDefault();
    apri();
  });
}

/* Per i test e per la console. */
export const _apri = apri, _chiudi = chiudi;
