/* ============ PERCORSO «Home › Sezione › Pagina» (Fase 2.3) ============

   La scheda prodotto aveva già il suo percorso. Le altre pagine profonde
   no: una categoria dello Shop, il dettaglio di un materiale, di una
   tecnologia, di una macchina, di un settore Business. Chi ci arriva da
   Google non sapeva dove si trovava né come risalire.

   - percorso(): funzione pura, dall'indirizzo ai passi (tests/test-percorso.mjs);
   - initPercorso(): lo disegna in cima alla pagina attiva e scrive il
     BreadcrumbList per i motori di ricerca. Se la pagina ha già il suo
     percorso (la scheda prodotto), non ne aggiunge un secondo. */

import { T, L } from './utils.js';

const lingua = (v, l) => (v && typeof v === 'object') ? String(v[l] || v.it || v.en || '') : String(v || '');
const lista = v => Array.isArray(v) ? v : [];

/* Sezione dell'indirizzo → etichetta e dove trovare il nome della scheda */
const SEZIONI = {
  materiali: { chiave: 'pcMateriali', voci: D => lista(D.MATERIALI && D.MATERIALI.materiali) },
  tecnologie: { chiave: 'pcTecnologie', voci: D => lista(D.TECNOLOGIE && D.TECNOLOGIE.tecnologie) },
  macchine: { chiave: 'pcMacchine', voci: D => [...lista(D.MACCHINE && D.MACCHINE.macchine), ...lista(D.MACCHINE && D.MACCHINE.catalogo)] },
  business: { chiave: 'pcBusiness', voci: D => lista(D.VERTICALI && (D.VERTICALI.verticali || D.VERTICALI.settori || D.VERTICALI)) }
};

/**
 * I passi del percorso per un indirizzo relativo alla base del sito.
 * @param {string} rel es. "materiali/legno/" oppure "shop"
 * @param {string} search es. "?cat=casa"
 * @returns {Array<{n:string, href:string}>|null} null = nessun percorso da mostrare
 */
export function percorso(rel, search, D = {}, { l = 'it', t = k => k } = {}) {
  const seg = String(rel || '').split('?')[0].split('/').filter(Boolean);
  const casa = { n: t('nHome'), href: './' };
  if (!seg.length) return null;

  if (seg[0] === 'shop') {
    const cat = new URLSearchParams(search || '').get('cat');
    if (!cat) return null;
    const c = lista(D.CATS).find(x => x && x.id === cat);
    if (!c) return null;
    return [casa, { n: t('pcShop'), href: 'shop' }, { n: lingua(c.n, l), href: 'shop?cat=' + encodeURIComponent(cat) }];
  }

  const s = SEZIONI[seg[0]];
  if (s && seg[1]) {
    const v = s.voci(D).find(x => x && String(x.id) === seg[1]);
    if (!v) return null;
    return [casa, { n: t(s.chiave), href: seg[0] }, { n: lingua(v.n || v.nome || v.titolo, l), href: seg[0] + '/' + seg[1] }];
  }
  return null;
}

const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function relativo() {
  const base = document.querySelector('base');
  const radice = new URL(base ? base.href : './', location.href).pathname;
  const p = location.pathname;
  return p.startsWith(radice) ? p.slice(radice.length) : p.replace(/^\//, '');
}

function aggiorna() {
  const vecchio = document.getElementById('percorsoAuto');
  const ld = document.getElementById('ld-percorso');
  const pagina = document.querySelector('.page.active');
  const passi = pagina ? percorso(relativo(), location.search, window.INGLY || {}, { l: L, t: T }) : null;
  /* una pagina con il suo percorso (scheda prodotto) non ne riceve un altro */
  const proprio = pagina && [...pagina.querySelectorAll('.crumb')].some(c => c.id !== 'percorsoNav');
  if (!passi || proprio) { if (vecchio) vecchio.remove(); if (ld) ld.remove(); return; }

  const html = `<nav class="crumb crumb--auto" id="percorsoNav" aria-label="${esc(T('pcEtichetta'))}"><ol>` +
    passi.map((p, i) => i === passi.length - 1
      ? `<li><span aria-current="page">${esc(p.n)}</span></li>`
      : `<li><a href="${esc(p.href)}">${esc(p.n)}</a><span class="crumb-sep" aria-hidden="true">›</span></li>`).join('') +
    '</ol></nav>';
  let box = vecchio;
  if (!box || box.parentElement !== pagina) {
    if (box) box.remove();
    box = document.createElement('div');
    box.id = 'percorsoAuto';
    box.className = 'wrap percorso-auto';
    pagina.insertBefore(box, pagina.firstChild);
  }
  box.innerHTML = html;

  /* BreadcrumbList: gli indirizzi assoluti, come li vuole Google */
  const assoluto = h => new URL(h, document.baseURI).href;
  const dati = { '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: passi.map((p, i) => ({ '@type': 'ListItem', position: i + 1, name: p.n, item: assoluto(p.href) })) };
  let s = ld;
  if (!s) { s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'ld-percorso'; document.head.appendChild(s); }
  s.textContent = JSON.stringify(dati);
}

let avviato = false;
export function initPercorso() {
  if (avviato) return;
  avviato = true;
  const dopo = () => requestAnimationFrame(aggiorna);
  document.addEventListener('ingly:pagina', dopo);
  window.addEventListener('popstate', dopo);
  window.addEventListener('ingly:language-change', dopo);
  /* lo Shop cambia ?cat= senza cambiare pagina: anche quello è un passo */
  for (const m of ['pushState', 'replaceState']) {
    const orig = history[m];
    history[m] = function (...a) { const r = orig.apply(this, a); dopo(); return r; };
  }
  dopo();
}
