/* ============ STAMPA 3D — DISEGNO DELLA PAGINA ============
   Solo HTML: contenuti e logica sono in stampa3d.js. I testi arrivano dai
   nostri dati (o dall'Admin) e passano da esc, tranne i titoli che portano
   un <br> e lo <span class="hl"> scritti da noi. */
import * as S from './stampa3d.js';
import { BASE } from './navigation.js';

const esc = t => String(t == null ? '' : t)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
/* titoli: solo <br> e <span class="hl"> passano, il resto diventa testo */
const titolo = t => esc(t).replace(/&lt;br\s*\/?&gt;/gi, '<br>').replace(/&lt;span class=&quot;hl&quot;&gt;/g, '<span class="hl">').replace(/&lt;\/span&gt;/g, '</span>');
const via = p => BASE.replace(/\/+$/, '') + '/' + p.replace(/^\/+/, '');
const I = () => window.INGLY || {};

/* il vaso che cresce a strati: disegno originale, ellissi impilate */
function vaso() {
  const strati = 30, out = [];
  for (let k = 0; k < strati; k++) {
    const t = k / (strati - 1);
    const r = 46 + 30 * Math.sin(Math.PI * (0.15 + 0.8 * t)) - 18 * t * t;   /* profilo morbido, collo stretto */
    const y = 250 - k * 7;
    out.push(`<ellipse class="s3d-strato" style="--i:${k}" cx="120" cy="${y}" rx="${r.toFixed(1)}" ry="${(r * 0.22).toFixed(1)}"/>`);
  }
  return `<svg class="s3d-vaso" viewBox="0 0 240 290" aria-hidden="true" focusable="false">
    <line class="s3d-piatto" x1="30" y1="262" x2="210" y2="262"/>${out.join('')}
    <g class="s3d-ugello"><rect x="108" y="20" width="24" height="16"/><path d="M114 36h12l-6 10z"/></g></svg>`;
}

export function renderStampa3D(L = 'it', card = null) {
  const box = document.getElementById('s3dPagina');
  if (!box) return;
  const D = S.dati(I());
  const l = v => S.lingua(v, L), t2 = (it, en) => (L === 'en' ? en : it);
  const idea = encodeURIComponent(S.ideaPreventivo(L));
  const prodotti = S.prodotti3d(I().P || []);
  const prodHtml = (typeof card === 'function' ? prodotti.map(p => { try { return card(p); } catch (e) { return ''; } }).join('') : '');

  box.innerHTML = `
  <div class="wrap s3d-hero">
    <div class="s3d-hero__testo">
      <h1 class="h2">${titolo(l(D.titolo))}</h1>
      <p class="sub">${esc(l(D.intro))}</p>
      <div class="s3d-azioni">
        <a class="btn btn-primary" href="${via('quote/?idea=' + idea)}">${t2('Invia il tuo file 3D', 'Send your 3D file')}</a>
        <a class="btn btn-ghost" href="${via('litofania.html')}">${t2('Crea una litofania', 'Make a lithophane')}</a>
      </div>
      <p class="s3d-formati">${t2('Formati', 'Formats')}: ${D.formati.map(f => `<span>${esc(f)}</span>`).join('')}</p>
    </div>
    <div class="s3d-hero__arte">${vaso()}</div>
  </div>

  <div class="wrap s3d-sez">
    <h2 class="h2">${t2('Cosa stampiamo', 'What we print')}</h2>
    <ol class="s3d-servizi">${D.servizi.map(s => `<li><h3>${esc(l(s.t))}</h3><p>${esc(l(s.d))}</p></li>`).join('')}</ol>
  </div>

  <section class="s3d-combo">
    <div class="wrap s3d-sez">
      <h2 class="h2">${titolo(l(D.combinati.titolo))}</h2>
      <p class="sub">${esc(l(D.combinati.intro))}</p>
      <div class="s3d-combo__griglia">${D.combinati.voci.map(v => `<article><span class="s3d-tag">${esc(l(v.tag))}</span><h3>${esc(l(v.t))}</h3><p>${esc(l(v.d))}</p></article>`).join('')}</div>
    </div>
  </section>

  <div class="wrap s3d-sez s3d-lito">
    <div>
      <h2 class="h2">${t2('La tua foto, <span class="hl">accesa dalla luce.</span>', 'Your photo, <span class="hl">lit from within.</span>')}</h2>
      <p class="sub">${t2('Con il generatore Litofania trasformi una foto in un pannello da stampare in 3D. Il file STL è gratuito e si crea sul tuo dispositivo; se non hai una stampante, la stampiamo noi.', 'With the Lithophane generator you turn a photo into a panel to 3D print. The STL file is free and built on your device; no printer? We print it for you.')}</p>
      <a class="btn btn-primary" href="${via('litofania.html')}">${t2('Apri il generatore', 'Open the generator')}</a>
    </div>
    <figure class="s3d-lito__pannello"><img src="${via('img/port-10-400.webp')}" alt="${t2('Esempio: una foto di famiglia resa come litofania in controluce', 'Example: a family photo rendered as a backlit lithophane')}" width="400" height="500" loading="lazy" decoding="async"><figcaption>${t2('Esempio di resa in controluce', 'Backlit rendering example')}</figcaption></figure>
  </div>

  <div class="wrap s3d-sez">
    <h2 class="h2">${t2('Materiali', 'Materials')}</h2>
    <div class="s3d-tabella" role="table" aria-label="${t2('Materiali per la stampa 3D', '3D printing materials')}">
      <div class="s3d-riga s3d-riga--testa" role="row"><span role="columnheader">${t2('Materiale', 'Material')}</span><span role="columnheader">${t2('Per cosa', 'Best for')}</span><span role="columnheader">${t2('Da sapere', 'Good to know')}</span></div>
      ${D.materiali.map(m => `<div class="s3d-riga" role="row"><span role="cell"><b>${m.rif ? `<a href="${via(m.rif)}" data-nav="materiali">${esc(l(m.n))}</a>` : esc(l(m.n))}</b></span><span role="cell">${esc(l(m.uso))}</span><span role="cell">${esc(l(m.nota))}</span></div>`).join('')}
    </div>
  </div>

  <div class="wrap s3d-sez s3d-file">
    <div>
      <h2 class="h2">${t2('Dal file al pezzo', 'From file to part')}</h2>
      <ol class="s3d-passi">${D.passi.map(p => `<li><b>${esc(l(p.t))}</b><span>${esc(l(p.d))}</span></li>`).join('')}</ol>
    </div>
    <aside class="s3d-invia" aria-labelledby="s3dInvia">
      <h3 id="s3dInvia">${t2('Cosa scriverci', 'What to tell us')}</h3>
      <ul>${(D.checklist[L] || D.checklist.it).map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <a class="btn btn-primary" href="${via('quote/?idea=' + idea)}">${t2('Chiedi un preventivo', 'Ask for a quote')}</a>
      <a class="s3d-link" href="${via('tecnologie/stampa3d')}" data-nav="tecnologie">${t2('Come funziona la tecnologia', 'How the technology works')} →</a>
    </aside>
  </div>

  ${prodHtml ? `<div class="wrap s3d-sez"><h2 class="h2">${t2('Creazioni stampate in 3D', '3D-printed creations')}</h2><div class="pgrid s3d-prodotti">${prodHtml}</div></div>` : ''}

  <div class="wrap s3d-sez s3d-faq">
    <h2 class="h2">${t2('Domande frequenti', 'Frequently asked questions')}</h2>
    ${D.faq.map(f => `<details><summary>${esc(l(f.d))}</summary><p>${esc(l(f.r))}</p></details>`).join('')}
  </div>`;
}
