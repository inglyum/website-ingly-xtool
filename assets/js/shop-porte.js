/* ============ SHOP A TRE PORTE ============
   Richiesta del titolare (novembre 2026): uno Shop diviso, professionale e
   versatile. Chi entra sceglie COSA comprare (oggetti personalizzati, file
   digitali, materiali) e COME compra (privato o azienda).

   - Le porte cambiano il pannello sotto, senza cambiare pagina: /shop,
     /shop?porta=file, /shop?porta=materiali. L'indirizzo si può condividere.
   - Privato / Azienda: la scelta resta sul dispositivo (localStorage) e
     /shop?per=azienda apre già in modalità aziende (email, volantini B2B).
   - Prezzi: restano «su richiesta» finché l'Admin non li accende
     (CONFIG.prezzi.mostra). Qui non si mostra nessuna cifra.
   - Materiali: sono le forniture dell'Admin (FORNITURE), offerte su
     richiesta a INGLY. I link di affiliazione restano spenti come prima;
     gli accessori originali xTool rimandano allo shop ufficiale xTool.
   - File digitali: i bundle sono ancora in bozza e non compaiono. Si offrono
     gli strumenti gratuiti che funzionano già e il file su richiesta.

   Tutto ciò che arriva dai dati passa da esc. */
import * as FORN from './forniture.js';
/* la base del sito, calcolata come in navigation.js: importarla da lì
   legherebbe questo modulo al catalogo intero (navigation → products) */
const BASE = (() => {
  try { const u = new URL('../../', import.meta.url).pathname; return u.endsWith('/') ? u : u + '/'; }
  catch (e) { return '/'; }
})();

const esc = t => String(t == null ? '' : t)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const $ = id => document.getElementById(id);
const I = () => window.INGLY || {};
const via = p => BASE.replace(/\/+$/, '') + '/' + String(p).replace(/^\/+/, '');
const lingua = (v, L) => (v == null ? '' : typeof v === 'string' ? v : String(v[L] || v.it || v.en || ''));
const t2 = (it, en, L) => (L === 'en' ? en : it);

export const PORTE = ['oggetti', 'file', 'materiali'];
const CHIAVE_MODO = 'ingly_shop_modo';
let porta = 'oggetti';
let modo = 'privato';
let matCat = '';

/* ---------- stato ---------- */
export const portaAttiva = () => porta;
export const modoAzienda = () => modo === 'azienda';

export function leggiStato() {
  try { const m = localStorage.getItem(CHIAVE_MODO); if (m === 'azienda' || m === 'privato') modo = m; } catch (e) {}
  try {
    const p = new URLSearchParams(location.search || '');
    const pt = p.get('porta');
    porta = PORTE.includes(pt) ? pt : 'oggetti';
    const per = p.get('per');
    if (per === 'azienda' || per === 'privato') { modo = per; salvaModo(); }
    matCat = p.get('mcat') || '';
  } catch (e) {}
  applicaRadice();
}
function salvaModo() { try { localStorage.setItem(CHIAVE_MODO, modo); } catch (e) {} }
function applicaRadice() {
  const r = document.documentElement;
  r.dataset.shopPorta = porta;
  r.dataset.shopModo = modo;
}
/* parametri dello Shop da aggiungere all'indirizzo (li usa products.js) */
export function parametriIndirizzo() {
  const q = [];
  if (porta !== 'oggetti') q.push('porta=' + porta);
  if (porta === 'materiali' && matCat) q.push('mcat=' + encodeURIComponent(matCat));
  return q;
}
function aggiornaIndirizzo(nuovaVoce = false) {
  try {
    if (!/\/shop\/?$/.test(location.pathname)) return;
    const p = new URLSearchParams(location.search || '');
    ['porta', 'mcat', 'per'].forEach(k => p.delete(k));
    parametriIndirizzo().forEach(x => { const [k, v] = x.split('='); p.set(k, decodeURIComponent(v)); });
    const s = p.toString();
    const next = location.pathname + (s ? '?' + s : '');
    if (location.pathname + location.search === next) return;
    if (nuovaVoce) history.pushState({ page: 'shop' }, '', next); else history.replaceState(history.state, '', next);
  } catch (e) {}
}

/* ---------- porte e interruttore ---------- */
const FOTO = { oggetti: 'img/21-800.webp', file: 'img/cat-digitale-800.webp', materiali: 'img/cat-materiali-800.webp' };
function testiPorta(id, L) {
  return {
    oggetti: [t2('Oggetti personalizzati', 'Personalised objects', L), t2('Li realizziamo noi, nel laboratorio di Palermo', 'Made by us in our Palermo workshop', L)],
    file: [t2('File digitali', 'Digital files', L), t2('Strumenti gratuiti e file pronti per il tuo laser', 'Free tools and files ready for your laser', L)],
    materiali: [t2('Materiali', 'Materials', L), t2('Scelti da noi, venduti dai migliori negozi online', 'Picked by us, sold by trusted online stores', L)]
  }[id];
}

/* quanto c'è dietro ogni porta: numeri veri, dai dati */
function conteggio(id, L) {
  const D = I();
  if (id === 'oggetti') { const n = (D.P || []).filter(x => x && !x.hidden).length; return n ? `${n} ${n === 1 ? t2('creazione', 'piece', L) : t2('creazioni', 'pieces', L)}` : ''; }
  if (id === 'file') { const c = ((D.DIGITALE || {}).categorie || []).length; return `${STRUMENTI.length} ${t2('strumenti gratuiti', 'free tools', L)}${c ? ' · ' + c + ' ' + t2('categorie su richiesta', 'categories on request', L) : ''}`; }
  const n = FORN.articoli(FORN.dati(D)).length;
  return n ? `${n} ${t2('articoli da acquistare online', 'items to buy online', L)}` : '';
}

function sottotitolo(L) {
  const az = modoAzienda();
  if (porta === 'file') return az
    ? t2('File con licenza commerciale per produrre e vendere: crea i tuoi con gli strumenti gratuiti o chiedi il file che ti serve.', 'Files with a commercial licence to produce and sell: build your own with the free tools or ask for the file you need.', L)
    : t2('Crea il tuo file gratis con i nostri strumenti, oppure chiedici il file pronto da incidere.', 'Build your file for free with our tools, or ask us for a file ready to engrave.', L);
  if (porta === 'materiali') return az
    ? t2('Materiali per la tua produzione, scelti da noi: li acquisti dal negozio indicato. Per forniture continuative scrivici.', 'Materials for your production, picked by us: buy them from the store shown. For ongoing supplies, message us.', L)
    : t2('I materiali che usiamo ogni giorno, scelti da noi e con il consiglio per lavorarli. Li acquisti dal negozio indicato, che te li spedisce.', 'The materials we use every day, picked by us with tips on working them. Buy them from the store shown, which ships them to you.', L);
  return az
    ? t2('Gadget, targhe e oggetti con il tuo logo: quantità, campione e fattura su richiesta.', 'Gadgets, signs and objects with your logo: quantities, sample and invoice on request.', L)
    : t2('Regali e oggetti incisi, tagliati e stampati su misura. Scegli, personalizza, chiedi il prezzo.', 'Gifts and objects engraved, cut and printed to order. Choose, personalise, ask for the price.', L);
}

export function renderPorte(L = 'it') {
  const box = $('shopPorte');
  if (!box) return;
  applicaRadice();
  const sotto = $('shopSotto');
  if (sotto) sotto.textContent = sottotitolo(L);
  box.innerHTML = `
    <div class="sp-chi" role="group" aria-label="${t2('Compri come', 'Buying as', L)}">
      <button type="button" data-action="shop-modo" data-arg="privato" aria-pressed="${!modoAzienda()}">${t2('Privato', 'Personal', L)}</button>
      <button type="button" data-action="shop-modo" data-arg="azienda" aria-pressed="${modoAzienda()}">${t2('Azienda', 'Business', L)}</button>
    </div>
    <nav class="sp-porte" aria-label="${t2('Cosa cerchi', 'What are you looking for', L)}">
      ${PORTE.map(id => {
        const [n, s] = testiPorta(id, L);
        const href = via('shop' + (id === 'oggetti' ? '' : '?porta=' + id));
        return `<a class="sp-porta${porta === id ? ' on' : ''}" href="${esc(href)}" data-action="shop-porta" data-arg="${id}" data-no-spa${porta === id ? ' aria-current="page"' : ''}>
          <img src="${esc(via(FOTO[id]))}" alt="" width="800" height="800" loading="eager" decoding="async">
          <span class="sp-porta__testo"><b>${esc(n)}</b><small>${esc(s)}</small>${conteggio(id, L) ? `<span class="sp-porta__conta">${esc(conteggio(id, L))}</span>` : ''}</span>
        </a>`;
      }).join('')}
    </nav>`;
  /* sul telefono le porte scorrono: quella attiva deve essere in vista */
  const nav = box.querySelector('.sp-porte'), on = nav && nav.querySelector('.sp-porta.on');
  if (nav && on) {
    const centra = () => { if (nav.scrollWidth > nav.clientWidth + 4) nav.scrollLeft = Math.max(0, on.offsetLeft - (parseFloat(getComputedStyle(nav).paddingLeft) || 16)); };
    try { requestAnimationFrame(centra); setTimeout(centra, 350); } catch (e) {}
  }
  renderAzienda(L);
  mostraPannello();
}

/* banda per le aziende: compare sopra ogni pannello in modalità Azienda */
function renderAzienda(L) {
  const box = $('shopAzienda');
  if (!box) return;
  box.hidden = !modoAzienda();
  if (!modoAzienda()) { box.innerHTML = ''; return; }
  const vert = (I().VERTICALI || []).filter(v => v && v.id && v.attivo !== false);
  box.innerHTML = `
    <div class="sp-az">
      <div class="sp-az__testa">
        <span class="sp-az__tit">${t2('Area aziende', 'Business area', L)}</span>
        <ul class="sp-az__punti">
          <li>${t2('Preventivo con fattura', 'Quote with invoice', L)}</li>
          <li>${t2('Prezzi per quantità', 'Volume pricing', L)}</li>
          <li>${t2('Campione prima della produzione', 'Sample before production', L)}</li>
          <li>${t2('Il tuo logo su ogni pezzo', 'Your logo on every piece', L)}</li>
        </ul>
        <button type="button" class="btn btn-primary" data-action="go" data-arg="quote" data-search="tipo=azienda">${t2('Chiedi un preventivo aziendale', 'Request a business quote', L)} <span class="arr">→</span></button>
      </div>
      ${vert.length ? `<div class="sp-az__settori"><span>${t2('Per settore', 'By sector', L)}</span>${vert.map(v => `<a href="${esc(via('business/' + v.id))}" data-nav="business">${esc(lingua(v.n, L))}</a>`).join('')}</div>` : ''}
    </div>`;
}

function mostraPannello() {
  document.querySelectorAll('[data-porta-pannello]').forEach(p => { p.hidden = p.dataset.portaPannello !== porta; });
}

/* ---------- pannello File digitali ---------- */
const STRUMENTI = [
  { url: 'generatori.html', n: ['Generator Studio', 'Generator Studio'], d: ['Portachiavi, cake topper, segnaposto, puzzle e molto altro: scegli, scrivi il nome, scarichi l’SVG.', 'Keychains, cake toppers, place cards, puzzles and more: pick, type the name, download the SVG.'], f: 'SVG · DXF · PDF', disegno: 'studio' },
  { url: 'prova-incisione.html', n: ['Prova la tua foto incisa', 'Preview your engraved photo'], d: ['Carichi una foto e vedi come viene incisa su legno, ardesia, acciaio o vetro.', 'Upload a photo and see it engraved on wood, slate, steel or glass.'], f: 'PNG', disegno: 'foto' },
  { url: 'litofania.html', n: ['Litofania', 'Lithophane'], d: ['Dalla foto al pannello da stampare in 3D che si illumina in controluce.', 'From a photo to a 3D-printed panel that lights up when backlit.'], f: 'STL', disegno: 'lito' },
  { url: 'print-cut.html', n: ['Print & Cut', 'Print & Cut'], d: ['Adesivi e sagome da stampare e tagliare, con il contorno già pronto.', 'Stickers and shapes to print and cut, with the cut line ready.'], f: 'PNG · SVG', disegno: 'adesivo' }
];
function disegno(tipo) {
  const d = {
    studio: '<rect x="14" y="14" width="52" height="52"/><circle cx="40" cy="40" r="14"/><path d="M40 14v52M14 40h52"/>',
    foto: '<rect x="12" y="18" width="56" height="44"/><path d="M12 54l16-16 12 12 10-8 18 14"/><circle cx="52" cy="30" r="5"/>',
    lito: '<rect x="18" y="12" width="44" height="56"/><path d="M18 24h44M18 36h44M18 48h44M18 60h44"/>',
    adesivo: '<path d="M16 20h36l12 12v28H16z"/><path d="M52 20v12h12"/><circle cx="36" cy="44" r="9"/>'
  }[tipo] || '';
  return `<svg viewBox="0 0 80 80" aria-hidden="true" focusable="false">${d}</svg>`;
}
function waTesto(testo) {
  const base = String((I().CONFIG || {}).whatsapp || '').split('?')[0];
  return /^https:\/\/wa\.me\//.test(base) ? base + '?text=' + encodeURIComponent(testo) : '';
}

export function renderFile(L = 'it') {
  const box = $('shopPannelloFile');
  if (!box) return;
  const DG = I().DIGITALE || {};
  const cats = (DG.categorie || []).filter(c => c && c.id);
  const lic = (DG.licenze || []).filter(x => x && x.id);
  const az = modoAzienda();
  box.innerHTML = `
    <section class="sp-sez" aria-labelledby="spFileStrumenti">
      <div class="sp-sez__testa"><h2 id="spFileStrumenti">${t2('Crea subito, gratis', 'Create now, for free', L)}</h2>
        <p>${t2('Gli strumenti funzionano nel browser: il file si crea sul tuo dispositivo e lo scarichi pronto per il laser o la stampante.', 'The tools run in your browser: the file is built on your device and you download it ready for the laser or printer.', L)}</p></div>
      <div class="sp-strumenti">${STRUMENTI.map(s => `
        <a class="sp-strumento" href="${esc(via(s.url))}">
          <span class="sp-strumento__arte">${disegno(s.disegno)}</span>
          <span class="sp-strumento__corpo"><b>${esc(t2(s.n[0], s.n[1], L))}</b><span>${esc(t2(s.d[0], s.d[1], L))}</span>
          <small>${esc(s.f)} · ${t2('gratis', 'free', L)}</small></span>
          <span class="sp-strumento__vai" aria-hidden="true">→</span>
        </a>`).join('')}</div>
    </section>

    ${cats.length ? `<section class="sp-sez" aria-labelledby="spFileCats">
      <div class="sp-sez__testa"><h2 id="spFileCats">${t2('Il file che ti serve, su richiesta', 'The file you need, on request', L)}</h2>
        <p>${t2('Disegniamo e proviamo i file sulle nostre macchine. Dicci cosa vuoi realizzare: ti mandiamo prezzo e tempi.', 'We draw and test files on our own machines. Tell us what you want to make: we send price and timing.', L)}</p></div>
      <div class="sp-fcat">${cats.map(c => {
        const nome = lingua(c.n, L);
        const wa = waTesto(t2(`Ciao INGLY DESIGN, vorrei un file digitale per laser: ${nome}.${az ? ' Mi serve la licenza commerciale.' : ''}`, `Hi INGLY DESIGN, I'd like a digital laser file: ${nome}.${az ? ' I need the commercial licence.' : ''}`, L));
        return `<div class="sp-fcat__voce"><b>${esc(nome)}</b>
          ${wa ? `<a href="${esc(wa)}" target="_blank" rel="noopener noreferrer">${t2('Chiedi il file', 'Ask for the file', L)} →</a>` : ''}</div>`;
      }).join('')}</div>
    </section>` : ''}

    ${lic.length ? `<section class="sp-sez" aria-labelledby="spFileLic">
      <div class="sp-sez__testa"><h2 id="spFileLic">${t2('Due licenze, regole chiare', 'Two licences, clear rules', L)}</h2></div>
      <div class="sp-lic">${lic.map(x => `<div class="sp-lic__voce${az === (x.id !== 'personale') ? ' on' : ''}">
        <b>${esc(lingua(x.n, L))}</b><p>${esc(lingua(x.s, L))}</p>
        ${Array.isArray((x.puoi || {})[L] || (x.puoi || {}).it) ? `<ul>${((x.puoi[L] || x.puoi.it) || []).slice(0, 3).map(v => `<li>${esc(v)}</li>`).join('')}</ul>` : ''}
      </div>`).join('')}</div>
      <p class="sp-nota"><a href="${esc(via('digital'))}" data-nav="digital">${t2('Tutto sui file digitali', 'All about digital files', L)} →</a></p>
    </section>` : ''}`;
}

/* ---------- pannello Materiali (affiliazione) ----------
   I materiali si scelgono qui e si comprano dal negozio indicato (Amazon.it,
   xTool Store…), che vende e spedisce. Il link porta il codice affiliato
   dell'Admin: la logica è quella di forniture.js, la stessa della pagina
   /forniture. L'avviso di affiliazione è sempre visibile e ogni scheda dice
   chi vende. Niente prezzi copiati dai negozi: cambiano ogni giorno. */
function tinta(a) {
  const M = I().MAT_ART || {};
  const t = (a && a.tinta && M[a.tinta]) || null;
  return (t && t.bg) || '';
}
export function filtraMateriali(cat) {
  matCat = matCat === cat ? '' : String(cat || '');
  renderMateriali(document.documentElement.lang === 'en' ? 'en' : 'it');
  aggiornaIndirizzo();
}
export function renderMateriali(L = 'it') {
  const box = $('shopPannelloMateriali');
  if (!box) return;
  const D = FORN.dati(I());
  const tutti = FORN.articoli(D);
  const cats = FORN.categorieVive(D);
  if (matCat && !cats.some(c => c.id === matCat)) matCat = '';
  const az = modoAzienda();
  const lista = matCat ? FORN.articoli(D, { cat: matCat }) : tutti;
  const avviso = FORN.avviso(D, L);
  const wa = az ? waTesto(t2('Ciao INGLY DESIGN, per la mia azienda mi servono materiali per il laser in quantità.', 'Hi INGLY DESIGN, my business needs laser materials in quantity.', L)) : '';
  if (!tutti.length) {
    box.innerHTML = `<div class="sp-sez__testa"><h2>${t2('Materiali per il laser', 'Laser materials', L)}</h2>
      <p>${t2('La selezione è in preparazione.', 'The selection is being prepared.', L)}</p></div>`;
    return;
  }
  box.innerHTML = `
    <div class="sp-sez__testa"><h2>${t2('Materiali per il laser', 'Laser materials', L)}</h2>
      ${avviso ? `<p class="sp-avviso" role="note">${esc(avviso)}</p>` : ''}</div>
    ${az && wa ? `<p class="sp-nota sp-nota--az">${t2('Ti servono forniture continuative per la tua produzione?', 'Need ongoing supplies for your production?', L)} <a href="${esc(wa)}" target="_blank" rel="noopener noreferrer">${t2('Scrivici', 'Message us', L)} →</a></p>` : ''}
    ${cats.length > 1 ? `<div class="sp-chips" role="group" aria-label="${t2('Filtra per tipo', 'Filter by type', L)}">
      <button type="button" data-action="shop-mat-cat" data-arg="" aria-pressed="${!matCat}">${t2('Tutti', 'All', L)} <span>${tutti.length}</span></button>
      ${cats.map(c => `<button type="button" data-action="shop-mat-cat" data-arg="${esc(c.id)}" aria-pressed="${matCat === c.id}">${esc(lingua(c.n, L))} <span>${FORN.articoli(D, { cat: c.id }).length}</span></button>`).join('')}
    </div>` : ''}
    <div class="sp-mat">${lista.map(a => {
      const nome = lingua(a.n, L);
      const href = FORN.link(a, D);
      const neg = FORN.nomeNegozio(a, D);
      const cons = lingua(a.consiglio, L);
      return `<article class="sp-mat__voce">
        <div class="sp-mat__tinta" style="--tinta:${esc(tinta(a) || 'var(--rs-bg-2)')}">${a.tinta ? `<span>${esc(lingua(((I().MATN || {})[a.tinta]) || a.tinta, L))}</span>` : ''}</div>
        <div class="sp-mat__corpo">
          ${a.provato ? `<span class="sp-mat__prova">${t2('Lo usiamo in laboratorio', 'We use it in our workshop', L)}</span>` : ''}
          <h3>${esc(nome)}</h3>
          <p>${esc(lingua(a.desc, L))}</p>
          ${cons ? `<details><summary>${t2('Il consiglio INGLY', 'The INGLY tip', L)}</summary><p>${esc(cons)}</p></details>` : ''}
          <span class="sp-venditore">${t2('Venduto e spedito da', 'Sold and shipped by', L)} <b>${esc(neg)}</b></span>
          <a class="btn btn-primary sp-compra" href="${esc(href)}" target="_blank" rel="sponsored nofollow noopener" data-forn="${esc(FORN.evento(a))}">${t2('Acquista su', 'Buy on', L)} ${esc(neg)} <svg class="sp-esterno" viewBox="0 0 16 16" aria-hidden="true" focusable="false"><path d="M6 3h7v7M13 3 5 11M11 9v4H3V5h4"/></svg></a>
        </div>
      </article>`;
    }).join('')}</div>`;
}

/* ---------- azioni (dalla delega di main.js) ---------- */
export function scegliPorta(id, ridisegna) {
  if (!PORTE.includes(id)) return;
  porta = id;
  applicaRadice();
  aggiornaIndirizzo(true);
  if (typeof ridisegna === 'function') ridisegna();
  const top = $('page-shop');
  if (top && top.getBoundingClientRect().top < -40) top.scrollIntoView({ block: 'start' });
}
export function scegliModo(m, ridisegna) {
  if (m !== 'azienda' && m !== 'privato') return;
  modo = m;
  salvaModo();
  applicaRadice();
  if (typeof ridisegna === 'function') ridisegna();
}

/** Tutto lo Shop in un colpo: porte, banda aziende e il pannello attivo. */
export function renderTutto(L = 'it') {
  renderPorte(L);
  if (porta === 'file') renderFile(L);
  if (porta === 'materiali') renderMateriali(L);
}
