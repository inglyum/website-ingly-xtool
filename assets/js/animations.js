/* ============ MOVIMENTO (modulo) ============

   Qui c'erano, tutti insieme e tutti accesi: un canvas di particelle con
   fasci laser agganciati al cursore, DUE aloni che inseguivano il mouse,
   quattro blob di gradiente che respiravano nell'hero, i bottoni magnetici,
   il parallasse delle card dell'hero e un tilt 3D su sei tipi di scheda.

   Quattro cicli requestAnimationFrame **permanenti**: giravano a ogni
   fotogramma per sempre, anche con il mouse immobile e la pagina ferma, e
   due di essi giravano anche su telefono, dove un cursore non esiste.
   Nessuno dei due aloni si fermava mai; uno dei due non guardava nemmeno
   prefers-reduced-motion, quindi chi aveva chiesto meno movimento se lo
   trovava comunque addosso.

   Ora il movimento è quello che serve a capire la pagina:
   comparsa in dissolvenza, contatori, un alone di cursore solo su desktop
   che **si ferma quando il mouse si ferma**, lo zoom sulla foto prodotto,
   la barra di avanzamento. Nient'altro gira a vuoto.

   Non è il sito reso statico: è il movimento che smette di competere con
   il contenuto. */
import { L } from './utils.js';

const fermo = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
const conMouse = () => window.matchMedia && matchMedia('(hover:hover)').matches;

function runCounters(el){el.querySelectorAll('.count').forEach(c=>{if(c.dataset.done)return;c.dataset.done=1;const to=+c.dataset.to,t0=performance.now();
  const tick=t=>{const k=Math.min(1,(t-t0)/1800),e2=1-Math.pow(1-k,4);c.textContent=Math.round(to*e2).toLocaleString(L==='it'?'it-IT':'en-US');if(k<1)requestAnimationFrame(tick)};requestAnimationFrame(tick)})}

const io=('IntersectionObserver' in window)?new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');runCounters(e.target)}}),{threshold:.12}):null;
export function observeAll(){
  /* 3.2 — ritardo progressivo fra elementi della stessa griglia: dà ritmo all'ingresso.
     Il ritardo si azzera per chi preferisce meno movimento (gestito in CSS). */
  const seen=new Map();
  /* Selettore ampio: qualunque elemento .reveal del documento viene osservato, ovunque si trovi.
     Con la lista ristretta di prima, una sezione fuori da .page e da <footer> (es. Sponsor)
     restava a opacity:0 PER SEMPRE — visibile nel DOM ma invisibile a schermo. */
  document.querySelectorAll('.reveal, .reveal-blur, .counter, .cta-band').forEach(el=>{
    /* salta solo ciò che sta in una pagina non attiva */
    const pg=el.closest('.page');
    if(pg && !pg.classList.contains('active')) return;
    const parent=el.parentElement||document.body;
    const i=(seen.get(parent)||0); seen.set(parent,i+1);
    if(i>0&&i<10) el.style.setProperty('--rd',(i*70)+'ms');
    io?io.observe(el):(el.classList.add('in'),runCounters(el));
  });
}

/* ===== ALONE DEL CURSORE =====
   Uno solo, e solo dove un cursore esiste. Il ciclo di animazione parte al
   movimento e si spegne da sé quando l'alone ha raggiunto il puntatore:
   un lerp che continua a girare su una distanza di zero pixel è lavoro per
   niente, moltiplicato per sessanta volte al secondo. */
function initAlone(){
  const el=document.getElementById('glow');
  if(!el) return;
  if(!conMouse()||fermo()){ el.remove(); return }

  let tx=0,ty=0,cx=0,cy=0,attivo=false;

  const passo=()=>{
    const dx=tx-cx, dy=ty-cy;
    cx+=dx*.12; cy+=dy*.12;
    el.style.transform=`translate(${cx}px,${cy}px)`;
    /* arrivato: smetti di chiedere fotogrammi finché il mouse non si muove */
    if(Math.abs(dx)<.5&&Math.abs(dy)<.5){ attivo=false; return }
    requestAnimationFrame(passo);
  };

  addEventListener('mousemove',e=>{
    tx=e.clientX; ty=e.clientY;
    if(!attivo){ attivo=true; requestAnimationFrame(passo) }
  },{passive:true});
}

export function initAnimations(){
  initProductZoom();
  initAlone();

  /* Barra di avanzamento: nessun ciclo, solo lo scroll. */
  const prog=document.getElementById('progress');
  if(prog) addEventListener('scroll',()=>{
    const h=document.body.scrollHeight-innerHeight;
    prog.style.width=(h>0?scrollY/h*100:0)+'%';
  },{passive:true});

  /* Il velo di caricamento se ne va al load, e comunque entro 3,5 secondi:
     un sito che resta dietro un velo perché un'immagine non arriva è un
     sito irraggiungibile. */
  const via=()=>document.getElementById('loader')?.classList.add('off');
  addEventListener('load',()=>setTimeout(via,600));
  setTimeout(via,3500);
}

/* ============ ZOOM GALLERIA PRODOTTO ============
   Desktop: la foto segue il cursore ingrandita (effetto lente).
   Touch: un tocco ingrandisce al centro, un secondo tocco torna normale.
   L'elemento #ppArt è statico nel DOM: un solo aggancio basta per tutti i prodotti. */
function initProductZoom(){
  const box=document.getElementById('ppArt');
  if(!box) return;
  const hoverCapable = window.matchMedia && matchMedia('(hover:hover)').matches;
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;

  const getImg=()=>box.querySelector('img.pimgph');

  if(hoverCapable){
    box.addEventListener('mousemove',e=>{
      const img=getImg(); if(!img)return;
      const r=box.getBoundingClientRect();
      const x=((e.clientX-r.left)/r.width*100).toFixed(1);
      const y=((e.clientY-r.top)/r.height*100).toFixed(1);
      img.style.transformOrigin=x+'% '+y+'%';
      img.style.transform='scale(1.7)';
      box.classList.add('zooming');
    });
    box.addEventListener('mouseleave',()=>{
      const img=getImg(); if(img)img.style.transform='';
      box.classList.remove('zooming');
    });
  } else {
    box.addEventListener('click',()=>{
      const img=getImg(); if(!img)return;
      const on=box.classList.toggle('zoomed');
      img.style.transformOrigin='50% 50%';
      img.style.transform=on?'scale(1.7)':'';
    });
  }
}
