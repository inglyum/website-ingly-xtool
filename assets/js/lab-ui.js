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
  return `<a class="vert-card lab-card reveal" href="/materiali/${esc(m.id)}">
    <span class="lab-swatch" style="--a:${esc(g[0] || '#333')};--b:${esc(g[1] || g[0] || '#111')}" aria-hidden="true"></span>
    <b>${esc(LAB.lingua(m.n, L))}</b>
    <span class="vert-sub">${esc(LAB.lingua(m.sommario, L))}</span>
    <span class="vert-go">${n ? n + ' ' + t2('creazioni', 'creations', L) : t2('Scopri', 'Explore', L)} <i class="arr">→</i></span>
  </a>`;
}

function tesseraTecnologia(t, L) {
  return `<a class="vert-card lab-card reveal" href="/tecnologie/${esc(t.id)}">
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
  const lista = LAB.materiali(d);
  const n = LAB.conteggi(d);
  box.innerHTML = lista.length
    ? '<div class="vert-grid">' + lista.map(m => tesseraMateriale(m, L, n[m.id])).join('') + '</div>'
    : '';
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
    <nav class="vert-back"><a href="/materiali" data-nav="materiali">← ${t2('Tutti i materiali', 'All materials', L)}</a></nav>
    <span class="lab-swatch lab-swatch--lg" style="--a:${esc(g[0] || '#333')};--b:${esc(g[1] || g[0] || '#111')}" aria-hidden="true"></span>
    <span class="eyebrow">${t2('Material Lab', 'Material Lab', L)}</span>
    <h1 class="h2" style="font-size:clamp(2.2rem,5vw,3.6rem)">${esc(LAB.lingua(m.n, L))}</h1>
    <p class="sub">${esc(LAB.lingua(m.sommario, L))}</p>
    <p class="vert-intro">${esc(LAB.lingua(m.descrizione, L))}</p>

    ${tecs.length ? `<h3 class="vert-tit">${t2('Come lo lavoriamo', 'How we work it', L)}</h3>
      <div class="b2b-cards">${tecs.map((t, i) => `
        <a class="rcard reveal lab-rel" href="/tecnologie/${esc(t.id)}" style="transition-delay:${i * .06}s">
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

    ${faqHtml(m.faq, L)}

    <div class="hero-ctas lab-ctas">
      <button class="btn btn-primary magnetic" data-action="go" data-arg="quote">
        ${t2('Richiedi un progetto in ' + LAB.lingua(m.n, 'it'), 'Request a project', L)} <span class="arr">→</span></button>
      <a class="btn btn-ghost magnetic" href="/shop">${t2('Vedi il catalogo', 'Browse the catalogue', L)}</a>
    </div>`;

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
    <nav class="vert-back"><a href="/tecnologie" data-nav="tecnologie">← ${t2('Tutte le tecnologie', 'All technologies', L)}</a></nav>
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
      <a class="vert-card lab-card reveal" href="/tecnologie/${esc(s.tecnologia.id)}">
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
