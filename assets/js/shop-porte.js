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
    materiali: [t2('Materiali', 'Materials', L), t2('Fogli e oggetti da personalizzare, scelti da noi', 'Sheets and blanks, picked by us', L)]
  }[id];
}

function sottotitolo(L) {
  const az = modoAzienda();
  if (porta === 'file') return az
    ? t2('File con licenza commerciale per produrre e vendere: crea i tuoi con gli strumenti gratuiti o chiedi il file che ti serve.', 'Files with a commercial licence to produce and sell: build your own with the free tools or ask for the file you need.', L)
    : t2('Crea il tuo file gratis con i nostri strumenti, oppure chiedici il file pronto da incidere.', 'Build your file for free with our tools, or ask us for a file ready to engrave.', L);
  if (porta === 'materiali') return az
    ? t2('Materiali per la tua produzione: chiedi prezzo, quantità e tempi per la tua azienda.', 'Materials for your production: ask for price, quantities and lead times for your business.', L)
    : t2('I materiali che usiamo ogni giorno, con il consiglio per lavorarli. Prezzo e disponibilità su richiesta.', 'The materials we use every day, with tips on working them. Price and availability on request.', L);
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
          <span class="sp-porta__testo"><b>${esc(n)}</b><small>${esc(s)}</small></span>
        </a>`;
      }).join('')}
    </nav>`;
  /* sul telefono le porte scorrono: quella attiva deve essere in vista */
  const nav = box.querySelector('.sp-porte'), on = nav && nav.querySelector('.sp-porta.on');
  if (nav && on && nav.scrollWidth > nav.clientWidth + 4) {
    try { nav.scrollLeft += on.getBoundingClientRect().left - nav.getBoundingClientRect().left - 16; } catch (e) {}
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

/* ---------- pannello Materiali ---------- */
const CAT_ESCLUSE = ['macchina'];   /* accessori originali xTool: si comprano da xTool */
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
  const F = I().FORNITURE || {};
  const cats = (F.categorie || []).filter(c => c && c.id && !CAT_ESCLUSE.includes(c.id));
  const tutti = (F.articoli || []).filter(a => a && a.id && a.stato === 'attivo' && cats.some(c => c.id === a.cat))
    .sort((a, b) => (a.ordine || 99) - (b.ordine || 99));
  if (matCat && !cats.some(c => c.id === matCat)) matCat = '';
  const az = modoAzienda();
  const lista = matCat ? tutti.filter(a => a.cat === matCat) : tutti;
  box.innerHTML = `
    <div class="sp-sez__testa"><h2>${t2('Materiali per il laser', 'Laser materials', L)}</h2>
      <p>${t2('Quelli che usiamo in laboratorio, con il consiglio per lavorarli bene. Scrivici: ti rispondiamo con prezzo, disponibilità e tempi.', 'The ones we use in the workshop, with tips for working them well. Message us: we reply with price, availability and timing.', L)}</p></div>
    ${cats.length > 1 ? `<div class="sp-chips" role="group" aria-label="${t2('Filtra per tipo', 'Filter by type', L)}">
      <button type="button" data-action="shop-mat-cat" data-arg="" aria-pressed="${!matCat}">${t2('Tutti', 'All', L)} <span>${tutti.length}</span></button>
      ${cats.map(c => { const n = tutti.filter(a => a.cat === c.id).length; return n ? `<button type="button" data-action="shop-mat-cat" data-arg="${esc(c.id)}" aria-pressed="${matCat === c.id}">${esc(lingua(c.n, L))} <span>${n}</span></button>` : ''; }).join('')}
    </div>` : ''}
    <div class="sp-mat">${lista.map(a => {
      const nome = lingua(a.n, L);
      const wa = waTesto(az
        ? t2(`Ciao INGLY DESIGN, per la mia azienda vorrei prezzo e disponibilità per quantità di: ${nome}.`, `Hi INGLY DESIGN, for my business I'd like price and availability in quantity for: ${nome}.`, L)
        : t2(`Ciao INGLY DESIGN, vorrei prezzo e disponibilità di: ${nome}.`, `Hi INGLY DESIGN, I'd like price and availability for: ${nome}.`, L));
      const cons = lingua(a.consiglio, L);
      return `<article class="sp-mat__voce">
        <div class="sp-mat__tinta" style="--tinta:${esc(tinta(a) || 'var(--rs-bg-2)')}"><span>${esc(lingua((cats.find(c => c.id === a.cat) || {}).n, L))}</span></div>
        <div class="sp-mat__corpo">
          <h3>${esc(nome)}</h3>
          <p>${esc(lingua(a.desc, L))}</p>
          ${cons ? `<details><summary>${t2('Il consiglio INGLY', 'The INGLY tip', L)}</summary><p>${esc(cons)}</p></details>` : ''}
          <span class="sp-prezzo">${esc(lingua(((I().CONFIG || {}).prezzi || {}).testo, L) || t2('Prezzo su richiesta', 'Price on request', L))}</span>
          ${wa ? `<a class="btn btn-primary" href="${esc(wa)}" target="_blank" rel="noopener noreferrer">${az ? t2('Chiedi un’offerta per quantità', 'Ask for a volume offer', L) : t2('Chiedi prezzo e disponibilità', 'Ask for price and availability', L)}</a>` : ''}
        </div>
      </article>`;
    }).join('') || `<p class="sp-nota">${t2('La selezione è in preparazione.', 'The selection is being prepared.', L)}</p>`}</div>
    <p class="sp-nota">${t2('Accessori e ricambi originali xTool:', 'Original xTool accessories and spare parts:', L)} <a href="https://www.xtool.eu/" target="_blank" rel="noopener noreferrer">${t2('shop ufficiale xTool', 'official xTool shop', L)} ↗</a></p>`;
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
