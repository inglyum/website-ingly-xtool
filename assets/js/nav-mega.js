/* ============ MONTAGGIO DELLA NAVIGAZIONE ============

   Prende le cinque famiglie di nav-ia.js e le monta: barra, mega-pannelli,
   cassetto mobile, stati dell'header.

   Tre cose che non sono dettagli:

   1. Si apre al CLIC, non al passaggio del mouse. Un pannello largo
      quanto lo schermo che compare sfiorandolo è una tagliola: copre
      quello che stavi leggendo mentre andavi altrove.
   2. Tastiera e lettori di schermo prima dell'effetto: Esc chiude e
      riporta il fuoco, aria-expanded dice la verità, il fuoco che esce
      dall'header chiude il pannello.
   3. Se qualcosa qui si rompe, il sito non deve accorgersene: la vecchia
      barra resta nel markup come rete, e viene nascosta solo quando la
      nuova è montata davvero. */

import { barraHtml, pannelloHtml, cassettoHtml, FAMIGLIE } from './nav-ia.js';
import { BASE } from './navigation.js';

const $ = id => document.getElementById(id);
const base = () => BASE.replace(/\/+$/, '');

let aperto = null;      /* id della famiglia aperta */
let ultimoTrigger = null;
/* initNavIA viene richiamata a ogni cambio lingua, perché il menu va
   riscritto. Gli ascoltatori sul documento invece vanno messi una volta
   sola: alla seconda chiamata ogni clic veniva gestito due volte e il
   pannello si apriva e si richiudeva nello stesso istante. */
let legato = false;

export function initNavIA(D, L = 'it') {
  const barra = $('iaBarra');
  const host = $('iaPannelli');
  if (!barra || !host) return false;

  const opt = { L, base: base() };
  barra.innerHTML = barraHtml(D, opt);
  host.innerHTML = FAMIGLIE.map(f => pannelloHtml(f, D, opt)).join('');

  chiudi({ fuoco: false });          /* una lingua nuova chiude ciò che era aperto */
  let velo = document.querySelector('.ia-velo');
  if (!velo) {
    velo = document.createElement('div');
    velo.className = 'ia-velo';
    velo.setAttribute('aria-hidden', 'true');
    document.body.appendChild(velo);
  }

  /* La vecchia barra sparisce solo adesso: se fossimo arrivati qui con
     un errore, il sito sarebbe rimasto navigabile. */
  document.documentElement.classList.add('ia-attiva');

  montaCassetto(D, L);
  if (legato) return true;           /* markup rifatto, ascoltatori già a posto */
  legato = true;

  barra.addEventListener('click', (e) => {
    const voce = e.target.closest('.ia-voce[data-fam]');
    if (!voce) return;
    const fam = voce.dataset.fam;
    const pan = $('ia-pan-' + fam);
    if (!pan) return;                      /* famiglia senza pannello: è un link */
    e.preventDefault();
    aperto === fam ? chiudi() : apri(fam, voce);
  });

  /* Un clic fuori chiude. Dentro il pannello no: ci si sta navigando. */
  velo.addEventListener('click', chiudi);
  document.addEventListener('click', (e) => {
    if (!aperto) return;
    if (e.target.closest('.ia-pannello') || e.target.closest('.ia-barra')) return;
    chiudi();
  });
  /* Seguire un link del pannello lo chiude: la pagina sotto è cambiata. */
  host.addEventListener('click', (e) => { if (e.target.closest('a')) chiudi({ fuoco: false }); });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && aperto) chiudi();
  });
  /* Il fuoco che esce dall'header chiude: chi naviga a tabulazioni non
     deve trascinarsi dietro un pannello aperto per tutta la pagina. */
  document.addEventListener('focusin', (e) => {
    if (!aperto) return;
    if (e.target.closest('.ia-barra') || e.target.closest('.ia-pannello')) return;
    chiudi({ fuoco: false });
  });

  statiHeader();
  return true;
}

function apri(fam, trigger) {
  chiudi({ fuoco: false });
  const pan = $('ia-pan-' + fam);
  if (!pan) return;
  pan.hidden = false;
  /* Un fotogramma prima di animare: senza, il browser salta la transizione
     perché l'elemento è appena uscito da display:none. */
  requestAnimationFrame(() => pan.classList.add('aperto'));
  trigger.setAttribute('aria-expanded', 'true');
  document.querySelector('.ia-velo')?.classList.add('on');
  aperto = fam;
  ultimoTrigger = trigger;
}

export function chiudi({ fuoco = true } = {}) {
  if (!aperto) return;
  const pan = $('ia-pan-' + aperto);
  if (pan) {
    pan.classList.remove('aperto');
    const via = () => { pan.hidden = true; pan.removeEventListener('transitionend', via); };
    pan.addEventListener('transitionend', via);
    setTimeout(via, 500);            /* se la transizione non parte, nascondi comunque */
  }
  document.querySelector(`.ia-voce[data-fam="${aperto}"]`)?.setAttribute('aria-expanded', 'false');
  document.querySelector('.ia-velo')?.classList.remove('on');
  aperto = null;
  if (fuoco && ultimoTrigger) ultimoTrigger.focus();
  ultimoTrigger = null;
}

/* ---------- cassetto mobile ---------- */

function montaCassetto(D, L) {
  const mm = $('mm');
  if (!mm) return;
  const corpo = mm.querySelector('.dr-corpo');
  if (!corpo) return;
  corpo.innerHTML = cassettoHtml(D, { L, base: base() });

  /* La fisarmonica anima grid-template-rows: serve un figlio unico da
     stringere, altrimenti il padding resta visibile da chiuso. */
  corpo.querySelectorAll('.dr-sub').forEach(sub => {
    const dentro = document.createElement('div');
    dentro.className = 'dr-sub-in';
    while (sub.firstChild) dentro.appendChild(sub.firstChild);
    sub.appendChild(dentro);
  });

  corpo.addEventListener('click', (e) => {
    const b = e.target.closest('.dr-fam[data-apri]');
    if (!b) return;
    const sub = $(b.dataset.apri);
    if (!sub) return;
    const on = sub.classList.toggle('aperto');
    b.setAttribute('aria-expanded', String(on));
  });
}

/* ---------- stati dell'header ---------- */

function statiHeader() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  let giu = false;
  const leggi = () => {
    const ora = window.scrollY > 24;
    if (ora !== giu) {
      giu = ora;
      nav.classList.toggle('compatto', ora);
      /* Scorrendo, un pannello aperto resterebbe agganciato a un header
         che nel frattempo ha cambiato altezza. */
      if (ora && aperto) chiudi({ fuoco: false });
    }
  };
  addEventListener('scroll', leggi, { passive: true });
  leggi();
}
