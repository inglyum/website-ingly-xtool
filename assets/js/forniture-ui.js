/* ============ FORNITURE — DISEGNO ============
   La pagina /forniture e il riquadro «Dove comprarlo» nelle schede dei
   materiali. La logica (link, filtri, avviso) è in forniture.js, pura e
   verificata; qui si fa solo HTML. Tutto ciò che viene dai dati passa da esc. */

import * as F from './forniture.js';
import { BASE } from './navigation.js';
import { observeAll } from './animations.js';

const esc = t => String(t == null ? '' : t)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const $ = id => document.getElementById(id);
const I = () => window.INGLY || {};
const via = p => BASE.replace(/\/+$/, '') + p;

/* la tinta della scheda è quella del materiale nel sito (MAT_ART), con riserva */
function tinta(a) {
  const M = I().MAT_ART || {};
  const t = (a && a.tinta && M[a.tinta]) || M[Object.keys(M)[0]] || null;
  return (t && t.bg) || '';
}

let filtro = '';

export function filtra(cat) {
  filtro = filtro === cat ? '' : String(cat || '');
  renderForniture(document.documentElement.lang === 'en' ? 'en' : 'it');
  try { observeAll(); } catch (e) {}
}

/* i tre passi: si capisce subito chi vende e cosa fa INGLY */
const PASSI = {
  it: [['Scegli il materiale', 'Fogli, oggetti da personalizzare, minuterie: divisi per uso.'],
       ['Leggi il consiglio INGLY', 'Su ogni scheda c’è cosa sapere prima di lavorarlo.'],
       ['Compra dal negozio', 'Vendita e spedizione sono del negozio indicato, direttamente a casa tua.']],
  en: [['Pick the material', 'Sheets, blanks, findings: grouped by use.'],
       ['Read the INGLY tip', 'Every card says what to know before you work it.'],
       ['Buy from the store', 'The store shown sells and ships it straight to you.']]
};

export function renderForniture(L = 'it') {
  const griglia = $('fornGrid');
  if (!griglia) return;
  const acceso = F.visibile(I());
  /* l'interruttore dell'Admin: voce nel piè di pagina e contenuti seguono lo stato */
  document.querySelectorAll('[data-forn-link]').forEach(a => { a.hidden = !acceso; });
  const passi = $('fornPassi'), chiusura = $('fornChiusura');
  if (!acceso) {
    ['fornFiltri', 'fornAvviso'].forEach(id => { const x = $(id); if (x) { x.innerHTML = ''; x.hidden = true; } });
    if (passi) passi.innerHTML = '';
    if (chiusura) chiusura.innerHTML = '';
    griglia.innerHTML = `<p class="sub">${L === 'en' ? 'This section is not available right now.' : 'Questa sezione al momento non è disponibile.'}</p>
      <p><a class="btn btn-primary" href="${via('/shop')}" data-nav="shop">${L === 'en' ? 'Browse the catalogue' : 'Guarda il catalogo'}</a></p>`;
    return;
  }
  const filtriBox = $('fornFiltri'); if (filtriBox) filtriBox.hidden = false;
  if (passi) passi.innerHTML = (PASSI[L] || PASSI.it).map((x, i) => `<li class="reveal"><span class="forn-num">${i + 1}</span><b>${esc(x[0])}</b><span>${esc(x[1])}</span></li>`).join('');
  if (chiusura) chiusura.innerHTML = `<div class="forn-chiudi reveal">
      <div><h2>${L === 'en' ? 'Rather have us make it?' : 'Preferisci che lo facciamo noi?'}</h2>
      <p>${L === 'en' ? 'Send us your idea: we pick the material, engrave or cut it in our workshop and deliver the finished piece.' : 'Mandaci la tua idea: scegliamo il materiale, lo incidiamo o tagliamo nel nostro laboratorio e ti consegniamo il pezzo finito.'}</p></div>
      <div class="forn-chiudi-az"><a class="btn btn-primary" href="${via('/quote')}" data-nav="quote">${L === 'en' ? 'Ask for a quote' : 'Chiedi un preventivo'}</a>
      <a class="btn btn-ghost" href="generatori.html">${L === 'en' ? 'Open the Generator Studio' : 'Apri il Generator Studio'}</a></div>
    </div>`;
  const D = F.dati(I());
  const cats = F.categorieVive(D);
  if (filtro && !cats.some(c => c.id === filtro)) filtro = '';
  const intro = $('fornIntro');
  if (intro) intro.textContent = F.lingua(D.intro, L);
  const filtri = $('fornFiltri');
  if (filtri) filtri.innerHTML = cats.length > 1
    ? `<div class="forn-filtri" role="group" aria-label="${L === 'en' ? 'Filter by category' : 'Filtra per categoria'}">
        <button type="button" class="forn-chip${!filtro ? ' on' : ''}" data-action="forn-cat" data-arg="" aria-pressed="${!filtro}">${L === 'en' ? 'All' : 'Tutto'}</button>
        ${cats.map(c => `<button type="button" class="forn-chip${filtro === c.id ? ' on' : ''}" data-action="forn-cat" data-arg="${esc(c.id)}" aria-pressed="${filtro === c.id}">${esc(F.lingua(c.n, L))}</button>`).join('')}
      </div>` : '';
  const sezioni = (filtro ? cats.filter(c => c.id === filtro) : cats).map(c => {
    const voci = F.articoli(D, { cat: c.id });
    return `<section class="forn-sez" aria-labelledby="forn-${esc(c.id)}">
      <h2 class="forn-tit" id="forn-${esc(c.id)}">${esc(F.lingua(c.n, L))} <span class="forn-conta">${voci.length}</span></h2>
      <div class="forn-grid">${voci.map(a => F.scheda(a, D, { L, esc, tinta: tinta(a), reveal: true })).join('')}</div>
    </section>`;
  }).join('');
  griglia.innerHTML = sezioni || `<p class="sub">${L === 'en' ? 'The selection is being prepared.' : 'La selezione è in preparazione.'}</p>`;
  const av = $('fornAvviso');
  if (av) { const t = F.avviso(D, L); av.textContent = t; av.hidden = !t; }
}

/** Riquadro in fondo alla scheda di un materiale: /materiali/legno → forniture di legno. */
export function renderPerMateriale(id, L = 'it') {
  const pagina = $('matPage');
  if (!pagina || pagina.hidden || !id) return;
  const vecchio = pagina.querySelector('.forn-mat');
  if (vecchio) vecchio.remove();
  const D = F.dati(I());
  const voci = F.articoli(D, { materiale: id }).slice(0, 4);
  if (!voci.length) return;
  const box = document.createElement('section');
  box.className = 'forn-mat';
  box.innerHTML = `<h3 class="vert-tit">${L === 'en' ? 'Where to buy it' : 'Dove comprarlo'}</h3>
    <div class="forn-grid">${voci.map(a => F.scheda(a, D, { L, esc, tinta: tinta(a), compatta: true })).join('')}</div>
    <p class="forn-avviso">${esc(F.avviso(D, L))} <a href="${via('/forniture')}" data-nav="forniture">${L === 'en' ? 'All supplies' : 'Tutte le forniture'} →</a></p>`;
  pagina.appendChild(box);
}
