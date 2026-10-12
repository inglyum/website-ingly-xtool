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

import { barraHtml, pannelloHtml, cassettoHtml, famiglieVive, FAMIGLIE } from './nav-ia.js';
import { BASE } from './navigation.js';

const $ = id => document.getElementById(id);

/* Quale famiglia copre la pagina che si sta guardando. Una famiglia può
   coprire più rotte — xTOOL Lab vale per /macchine e /demo — quindi non
   basta confrontare il percorso con la rotta della voce. */
const COPERTE = { xtool: ['macchine', 'demo'], materiali: ['materiali', 'tecnologie'], shop: ['shop', 'product'] };
function famigliaCorrente() {
  const p = location.pathname.replace(BASE, '').replace(/^\/+/, '').split('/')[0] || '';
  if (!p) return '';
  for (const f of FAMIGLIE) {
    if (f.rotta === p) return f.id;
    if ((COPERTE[f.id] || []).includes(p)) return f.id;
  }
  return '';
}
const base = () => BASE.replace(/\/+$/, '');

let aperto = null;      /* id della famiglia aperta */
let ultimoTrigger = null;
/* initNavIA viene richiamata a ogni cambio lingua, perché il menu va
   riscritto. Gli ascoltatori sul documento invece vanno messi una volta
   sola: alla seconda chiamata ogni clic veniva gestito due volte e il
   pannello si apriva e si richiudeva nello stesso istante. */
let legato = false;
/* L'apertura al passaggio del mouse è ritardata; il clic sul nome deve
   poterla annullare, altrimenti si naviga e il pannello si apre lo stesso
   sopra la pagina appena aperta. */
let attesa = null;

export function initNavIA(D, L = 'it') {
  const barra = $('iaBarra');
  const host = $('iaPannelli');
  if (!barra || !host) return false;

  /* La sezione in cui ci si trova va detta, non lasciata indovinare: la
     voce prende `aria-current="page"` e il segno visivo. */
  const opt = { L, base: base(), attiva: famigliaCorrente() };
  barra.innerHTML = barraHtml(D, opt);
  host.innerHTML = famiglieVive(D).map(f => pannelloHtml(f, D, opt)).join('');

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

  /* LA FRECCIA apre il pannello. Il LINK accanto non viene toccato: un
     clic sul nome porta alla pagina, sempre, con un solo clic.
     Prima questo gestore faceva preventDefault() sul link per aprire la
     tendina: chi voleva lo Shop doveva prima scegliere una sottosezione. */
  barra.addEventListener('click', (e) => {
    const freccia = e.target.closest('.ia-freccia[data-apri]');
    if (!freccia) return;
    e.preventDefault();
    const fam = freccia.dataset.apri;
    if (!$('ia-pan-' + fam)) return;
    aperto === fam ? chiudi() : apri(fam, freccia);
  });

  /* Su schermo largo il pannello si apre anche sfiorando il gruppo: è il
     gesto che la gente si aspetta da un mega menu. Resta un di più — chi
     usa tastiera o tocco ha la freccia, che è un vero pulsante. */
  if (window.matchMedia && matchMedia('(hover:hover) and (min-width:821px)').matches) {
    barra.addEventListener('pointerenter', (e) => {
      const g = e.target.closest ? e.target.closest('.ia-gruppo') : null;
      if (!g) return;
      const fam = g.querySelector('.ia-voce')?.dataset.fam;
      if (!fam || !$('ia-pan-' + fam)) return;
      clearTimeout(attesa);
      /* un filo di attesa: passare sopra la barra per andare altrove non
         deve far comparire tre pannelli uno dopo l'altro */
      attesa = setTimeout(() => apri(fam, g.querySelector('.ia-freccia') || g), 120);
    }, true);
    barra.addEventListener('pointerleave', () => clearTimeout(attesa), true);
  }

  /* Un clic fuori chiude. Dentro il pannello no: ci si sta navigando. */
  velo.addEventListener('click', chiudi);
  document.addEventListener('click', (e) => {
    if (!aperto) return;
    if (e.target.closest('.ia-pannello') || e.target.closest('.ia-barra')) return;
    chiudi();
  });
  /* Seguire un link del pannello lo chiude: la pagina sotto è cambiata. */
  host.addEventListener('click', (e) => { if (e.target.closest('a')) chiudi({ fuoco: false }); });
  /* E lo chiude anche un clic sul nome della famiglia: prima si navigava
     ALLA pagina e il pannello restava aperto sopra, coprendola. */
  barra.addEventListener('click', (e) => {
    if (!e.target.closest('.ia-voce')) return;
    clearTimeout(attesa);          /* annulla l'apertura al passaggio del mouse */
    chiudi({ fuoco: false });
  });
  /* Qualunque cambio di pagina chiude: vale anche per indietro/avanti. */
  addEventListener('popstate', () => chiudi({ fuoco: false }));

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
  /* Il segno «sei qui» si aggiorna a ogni cambio di pagina, non solo al
     primo disegno: altrimenti resta acceso sulla sezione di partenza. */
  addEventListener('ingly:pagina', segnaAttiva);
  segnaAttiva();
  return true;
}

/* Accende la voce della sezione corrente. Tocca solo classe e aria: non
   ridisegna il menu, che a ogni navigazione sarebbe uno spreco. */
export function segnaAttiva() {
  const fam = famigliaCorrente();
  document.querySelectorAll('.ia-gruppo').forEach(g => {
    const v = g.querySelector('.ia-voce');
    const qui = !!v && v.dataset.fam === fam;
    g.classList.toggle('qui', qui);
    if (v) { qui ? v.setAttribute('aria-current', 'page') : v.removeAttribute('aria-current'); }
  });
}

function apri(fam, trigger) {
  chiudi({ fuoco: false });
  const pan = $('ia-pan-' + fam);
  if (!pan) return;
  pan.hidden = false;
  /* Un fotogramma prima di animare: senza, il browser salta la transizione
     perché l'elemento è appena uscito da display:none. */
  requestAnimationFrame(() => pan.classList.add('aperto'));
  (trigger.closest('.ia-gruppo')?.querySelector('.ia-freccia') || trigger).setAttribute('aria-expanded', 'true');
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
  document.querySelector(`.ia-freccia[data-apri="${aperto}"]`)?.setAttribute('aria-expanded', 'false');
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
    const b = e.target.closest('.dr-freccia[data-apri]');
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
