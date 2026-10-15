/* ============ APP (entry module) ============
   Bootstrap: configurazione, lingua, render, delega eventi, avvio router. */
const { CONFIG, D, SOCIALS, TECH, MATERIALS, STEPS, REVIEWS, BIZ, FAQS, PORT } = window.INGLY;
import { $, T, L, setL, toast } from './utils.js';
import * as u from './utils.js';
import { initNav, show, go, goShop, toggleMenu, currentPage, currentSearch, currentVerticale, currentScheda, BASE } from './navigation.js';
import { ensureAccessibilityShell } from './accessibility.js';
import { initAnimations, observeAll } from './animations.js';
import * as prod from './products.js';
import { renderUrg, initForms } from './forms.js';
import { initLazy } from './lazyload.js';
import { initSeo, updateSeo } from './seo.js';
import * as wish from './wishlist.js';
import { initReferral, shareRef } from './referral.js';
import { initShare, initFomo, openWhatsApp, renderInstagramFeed } from './social.js';
import * as VERT from './verticali.js';
import * as LABUI from './lab-ui.js';
import * as DIGUI from './digitale-ui.js';
import { initNavIA } from './nav-mega.js';
import * as STATO from './stato-sito.js';
import * as SFONDI from './sfondi.js';
import * as APPEARANCE from './appearance.js';
import * as PREZZI from './prezzi.js';

/* ---- config → DOM ---- */
function initHeroVideo(){
  const url=(CONFIG.heroVideo||'').trim();
  const scene=document.querySelector('.coin-scene');
  if(!url || !scene) return;
  /* Il pannello Admin può contenere un permalink Instagram o YouTube.
     Una pagina HTML non è un media <video>: in quel caso manteniamo il logo. */
  const diretto=/\.(?:mp4|webm|ogv)(?:[?#]|$)/i.test(url)
    || /^(?:blob:|data:video\/)/i.test(url);
  if(!diretto) return;
  const reduce=window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;
  const v=document.createElement('video');
  v.className='hero-video'; v.muted=true; v.playsInline=true; v.loop=true; v.preload='metadata';
  v.setAttribute('aria-hidden','true');
  v.addEventListener('loadeddata',()=>{
    scene.classList.add('hero-video-ready');
    scene.style.display='none';
  },{once:true});
  v.addEventListener('error',()=>v.remove(),{once:true});
  v.src=url;
  scene.parentNode.insertBefore(v, scene);
  try{ const p=v.play&&v.play(); if(p&&p.catch) p.catch(()=>{}); }catch(e){}
}

function applyConfig(){
  /* Sfondo scelto nell'Admin, uno per tema. Sono due attributi e non uno
     perché l'interruttore chiaro/scuro cambia tema senza ricaricare: devono
     essere già pronti tutti e due. */
  try{
    const att=SFONDI.attributi(CONFIG);
    Object.keys(att).forEach(k=>document.documentElement.setAttribute(k,att[k]));
    APPEARANCE.applica(CONFIG);
  }catch(e){ console.warn('[INGLY] sfondo:',e) }
  /* Prezzi esposti oppure «contattaci»: è una decisione dell'Admin e va presa
     prima del primo disegno, altrimenti il prezzo lampeggia e poi sparisce. */
  document.documentElement.classList.toggle('senza-prezzi', !PREZZI.mostraPrezzi(CONFIG));
  document.title = CONFIG.titolo;
  const md=document.querySelector('meta[name="description"]'); if(md) md.content=CONFIG.descrizione;
  /* Hero image from the existing Admin and media upload flow. Keep the
     local, documented sample as the fallback until INGLY adds original photos. */
  const heroImg=document.querySelector('#heroVisual .coin img');
  const candidate=String(CONFIG.heroImage||'').trim();
  if(heroImg&&/^(?:img\/|assets\/images\/|https:\/\/)/i.test(candidate)){
    heroImg.src=candidate;
    heroImg.removeAttribute('srcset');
    const alt=CONFIG.heroImageAlt;
    heroImg.alt=typeof alt==='object'?(alt[L]||alt.it||'Immagine esemplificativa INGLY DESIGN')
      : (alt||'Immagine esemplificativa INGLY DESIGN');
  }
  const s=CONFIG.social, map=[s.instagram,s.facebook,s.tiktok,s.pinterest,s.whatsapp,s.etsy];
  map.forEach((u,i)=>{ if(u&&SOCIALS[i]) SOCIALS[i][1]=u });
  document.querySelectorAll('a[href^="https://instagram.com"]').forEach(a=>a.href=s.instagram);
  /* [data-wa-keep] = link che porta con sé un messaggio già scritto (il popup
     offerta include nome del prodotto, sconto e codice). Sovrascriverlo con il
     numero nudo cancellava proprio la parte utile. */
  document.querySelectorAll('a[href^="https://wa.me"]:not([data-wa-keep])').forEach(a=>a.href=CONFIG.whatsapp);
  document.querySelectorAll('a[href^="mailto:"]').forEach(a=>{a.href='mailto:'+CONFIG.email;a.textContent=CONFIG.email});
  $('ftCopy').textContent=CONFIG.copyright;
  $('ftLegal').textContent=CONFIG.legale;
  const st=CONFIG.statistiche, hb=document.querySelectorAll('.hero-meta .hm b');
  if(hb.length===3){hb[0].textContent=st.pezzi.toLocaleString('it-IT')+'+';hb[1].textContent=st.materiali;hb[2].textContent=st.rating}
  document.querySelectorAll('#page-about .count').forEach((c,i)=>{const v=[st.pezzi,st.clienti,st.materiali,st.puntualita][i];if(v!=null)c.dataset.to=v});
}
function renderSocials(){['soc1','soc2','soc3'].forEach(id=>{const el=$(id);if(el)el.innerHTML=SOCIALS.map(s=>`<a href="${s[1]}" target="_blank" rel="noopener" aria-label="${s[0]}" title="${s[0]}">${s[2]}</a>`).join('')})}

/* Traduzione immediata dei componenti storici non ancora inclusi in data/texts.json.
   Nessun servizio esterno, nessun testo inserito tramite HTML. */
const STATIC_UI_TRANSLATIONS={
  shop:{it:'Shop',en:'Shop'},
  materials:{it:'Materiali',en:'Materials'},
  technologies:{it:'Tecnologie',en:'Technologies'},
  machines:{it:'Macchine',en:'Machines'},
  academy:{it:'Academy',en:'Academy'},
  portfolio:{it:'Portfolio',en:'Portfolio'},
  theme:{it:'Tema',en:'Theme'},
  serviceIntro:{
    it:'Un punto di riferimento per il mondo xTool: supporto, orientamento tecnico e assistenza sui percorsi di utilizzo delle macchine. Raccontaci il modello e di cosa hai bisogno.',
    en:'A point of reference for the xTool world: support, technical guidance and assistance with machine workflows. Tell us which model you have and what you need.'
  },
  serviceScope:{
    it:'Per richieste di assistenza o riparazione, la disponibilità e la tipologia di intervento vengono confermate caso per caso.',
    en:'For service or repair requests, availability and the type of assistance are confirmed individually.'
  },
  serviceContact:{it:'Contatta il Service Centre',en:'Contact the Service Centre'},
  bookDemo:{it:'Prenota una demo xTool',en:'Book an xTool demo'},
  shopPathsEyebrow:{it:'SCOPRI IL MONDO INGLY',en:'EXPLORE INGLY'},
  shopPathsTitle:{it:'Gadget e accessori, fatti per distinguersi.',en:'Gadgets and accessories that stand out.'},
  shopPathsIntro:{it:'Esplora due percorsi del catalogo esistente. Ogni prodotto si personalizza partendo dalla sua scheda.',en:'Explore two existing catalogue collections. Customize each product starting from its own page.'},
  shopGadgetsTitle:{it:'Gadget aziendali',en:'Business gadgets'},
  shopGadgetsDesc:{it:'Idee personalizzate per brand, eventi e attività.',en:'Custom ideas for brands, events and businesses.'},
  shopAccessoriesTitle:{it:'Accessori personalizzati',en:'Personalized accessories'},
  shopAccessoriesDesc:{it:'Portachiavi, cover e dettagli che parlano di te.',en:'Keychains, phone cases and details that tell your story.'},
  shopExplore:{it:'Esplora la categoria',en:'Explore category'},
  shopGadgetsAria:{it:'Esplora i gadget aziendali',en:'Explore business gadgets'},
  shopAccessoriesAria:{it:'Esplora gli accessori personalizzati',en:'Explore personalized accessories'},
  genTitleLead:{it:'La tua idea,',en:'Your idea,'},
  genTitleAccent:{it:'prende forma.',en:'takes shape.'},
  genIntro:{it:"Prova un'insegna con il tuo nome, scegli dimensioni e materiale, guarda l'anteprima in tempo reale. Il file SVG resta modificabile: prima del taglio occorre verificare misure, spessori, font e tracciati nel software laser.",en:'Try your own name sign, choose dimensions and material, and see a live preview. The SVG is editable: check sizes, thickness, fonts and paths in your laser software before cutting.'},
  genText:{it:'Testo personalizzato',en:'Custom text'},
  genWidth:{it:'Larghezza (mm)',en:'Width (mm)'},
  genHeight:{it:'Altezza (mm)',en:'Height (mm)'},
  genMaterial:{it:'Aspetto materiale',en:'Material appearance'},
  genShape:{it:'Forma',en:'Shape'},
  genFont:{it:'Stile lettering',en:'Lettering style'},
  genWood:{it:'Legno naturale',en:'Natural wood'},
  genAcrylic:{it:'Plexiglass',en:'Acrylic'},
  genMetal:{it:'Metallo',en:'Metal'},
  genRounded:{it:'Rettangolo stondato',en:'Rounded rectangle'},
  genOval:{it:'Ovale',en:'Oval'},
  genRectangle:{it:'Rettangolo',en:'Rectangle'},
  genSerif:{it:'Serif classico',en:'Classic serif'},
  genMono:{it:'Mono tecnico',en:'Technical mono'},
  genPresets:{it:'PARTI DA UN MODELLO',en:'START FROM A PRESET'},
  genPresetName:{it:'Targa nome',en:'Name plaque'},
  genPresetDesk:{it:'Targa ufficio',en:'Office sign'},
  genPresetOval:{it:'Bomboniera ovale',en:'Oval favour'},
  genPresetKey:{it:'Portachiavi',en:'Keychain'},
  genWarning:{it:'Anteprima creativa, non file di taglio collaudato. Il testo SVG non viene convertito in curve: usa la funzione “Converti in tracciato” nel tuo software laser prima della produzione.',en:'Creative preview, not a validated cutting file. SVG text has not been converted to outlines: convert text to paths in your laser software before production.'},
  genPreview:{it:'ANTEPRIMA LIVE',en:'LIVE PREVIEW'},
  genProjectNotes:{it:'Note per il progetto (facoltative)',en:'Project notes (optional)'},
  genQuote:{it:'Richiedi preventivo',en:'Request a quote'},
  genStudio:{it:'Generator Studio completo',en:'Full Generator Studio'},
  genNotesPlaceholder:{it:'Materiale, uso previsto, consegna o dettagli da valutare',en:'Material, intended use, delivery or details to discuss'}
};
function translateInline(){
  document.querySelectorAll('[data-inline-i18n]').forEach(el=>{
    const v=STATIC_UI_TRANSLATIONS[el.dataset.inlineI18n];
    if(v)el.textContent=v[L]||v.it;
  });
  document.querySelectorAll('[data-inline-aria]').forEach(el=>{
    const v=STATIC_UI_TRANSLATIONS[el.dataset.inlineAria];
    if(v)el.setAttribute('aria-label',v[L]||v.it);
  });
  document.querySelectorAll('[data-inline-placeholder]').forEach(el=>{
    const v=STATIC_UI_TRANSLATIONS[el.dataset.inlinePlaceholder];
    if(v)el.setAttribute('placeholder',v[L]||v.it);
  });
  const defaultName=document.getElementById('inglyGeneratorName');
  if(defaultName&&['Il tuo nome','Your name'].includes(defaultName.value)){
    defaultName.value=L==='en'?'Your name':'Il tuo nome';
    defaultName.dispatchEvent(new Event('input',{bubbles:true}));
  }
}
/* ---- i18n ---- */
function applyI18n(){
  document.documentElement.lang=L;
  document.querySelectorAll('[data-i18n]').forEach(el=>{const v=D[L][el.dataset.i18n];if(v!==undefined)el.innerHTML=v});
  document.querySelectorAll('[data-ph]').forEach(el=>{const v=D[L][el.dataset.ph];if(v!==undefined)el.placeholder=v});
  renderTitoloHero();
  translateInline();
  $('langIT').classList.toggle('on',L==='it');
  $('langEN').classList.toggle('on',L==='en');
  prod.fillSort();
  // The owner-supplied loader controls its own message cycle; translation must not overwrite it.
  const l=$('ldrTxt');if(l&&!document.querySelector('#loader.ingly-custom-loader'))l.textContent=T('ldr');
  const sb=$('sbBtn');if(sb)sb.firstChild.textContent=T('ppAdd')+' ';
}
/* ===== TITOLO DELLA HERO =====
   Il titolo grande è la prima cosa che si legge del sito, e finora viveva
   dentro texts.json già scritto in HTML: per cambiarlo bisognava comporre a
   mano <span class="w">, i ritardi di animazione e il doppio strato
   dell'incisione. Adesso si scrive in chiaro nell'Admin:

     Segnati dalla **luce.**
     Fatti per durare.

   — le parole fra ** ** sono quelle che il laser incide;
   — l'a capo nel campo diventa un a capo nel titolo;
   — ogni parola sale con un ritardo crescente, come prima.

   Il testo arriva dall'Admin, quindi entra nel DOM come TESTO: gli elementi
   li costruiamo noi, mai innerHTML sul contenuto scritto dall'utente.
   Campo vuoto = si usa il titolo di texts.json, com'era prima: nessuna
   regressione per chi non tocca niente. */
function titoloHero(){
  const s=(CONFIG.slogan&&(CONFIG.slogan[L]||CONFIG.slogan.it))||'';
  return String(s).trim();
}
function renderTitoloHero(){
  const h1=$('heroH1'); if(!h1) return;
  const testo=titoloHero();
  if(!testo){ h1.innerHTML=T('heroH1'); return }   /* comportamento precedente */

  h1.textContent='';
  let i=0;                                          /* conta le parole per il ritardo */
  testo.split(/\r?\n/).forEach((riga,nr)=>{
    if(nr) h1.appendChild(document.createElement('br'));
    /* divido tenendo i marcatori: «Segnati dalla **luce.**» → [Segnati dalla ][**luce.**] */
    riga.split(/(\*\*[^*]+\*\*)/).forEach(pezzo=>{
      if(!pezzo) return;
      const inciso=/^\*\*[^*]+\*\*$/.test(pezzo);
      const testoPezzo=inciso?pezzo.slice(2,-2):pezzo;
      testoPezzo.split(/\s+/).filter(Boolean).forEach(parola=>{
        const w=document.createElement('span'); w.className='w';
        const inner=document.createElement('span');
        /* Static lettering: avoid clipped or incomplete text in the hero. */
        i++;
        if(inciso){
          /* Lo strato colorato che il raggio «incide» era un secondo <span>
             con dentro la stessa parola. Sovrapposto perfettamente, quindi
             invisibile all'occhio — ma nel testo la parola c'era due volte:
             il titolo che Google leggeva diceva «Segnati dalla luce.luce.».
             Ora la copia la disegna il CSS con content:attr(data-parola):
             il contenuto generato non fa parte del testo della pagina. */
          inner.classList.add('engrave');
          inner.dataset.parola=parola;
          inner.textContent=parola;
        } else {
          inner.textContent=parola;
        }
        w.appendChild(inner);
        h1.appendChild(w);
        h1.appendChild(document.createTextNode(' '));
      });
    });
  });
}

function setLang(l){
 const next=l==='en'?'en':'it';
 setL(next);
 try{localStorage.setItem('ingly_lang',next)}catch(e){}
 applyI18n();renderAll();
 for(const id of ['langIT','langEN']) document.getElementById(id)?.setAttribute('aria-pressed',String(id==='lang'+next.toUpperCase()));
 const pg=currentPage();updateSeo(pg,L,T,pg==='product'?prod.currentProduct():null);
 window.dispatchEvent(new CustomEvent('ingly:language-change',{detail:{language:next}}));
}

/* ---- contenuti statici ---- */
function inglyTechGlyph(t){
 const n=String((t?.n||'')+' '+(t?.t||'')).toLowerCase();
 const icons={
  beam:'<path d="M4 12h16M12 4v5M12 15v5M6 6l3 3m6 6 3 3m0-12-3 3m-6 6-3 3"/><circle cx="12" cy="12" r="2.4"/>',
  print:'<rect x="5" y="3" width="14" height="5" rx="1.2"/><rect x="4" y="9" width="16" height="9" rx="2"/><path d="M7 15h10v6H7zm9-3h.1"/>',
  uv:'<circle cx="12" cy="12" r="9"/><path d="m12 5 2 5 5 2-5 2-2 5-2-5-5-2 5-2z"/>',
  cube:'<path d="m12 3 9 5-9 5-9-5 9-5Zm-9 5v9l9 5 9-5V8M12 13v9"/>',
  fiber:'<path d="m3 18 8-12 4 8 3-5 3 9M2 20h20M10 3h4"/>',
  roller:'<path d="M4 9h16M4 15h16M8 6v12m8-12v12M3 5h18v14H3z"/>'
 };
 const kind=/3d|resina|fdm/.test(n)?'cube':/dtf|stampa tess|press/.test(n)?'print':/uv/.test(n)?'uv':/fibra|fiber|mopa|ir/.test(n)?'fiber':/co2|co₂|laser|diodo/.test(n)?'beam':'roller';
 return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round">'+icons[kind]+'</svg>';
}
function inglyMaterialGlyph(v){
 const n=String(v||'').toLowerCase();
 const shapes={
  wood:'<path d="M4 4h16v16H4zM8 8c2-2 6-2 8 0s2 6 0 8-6 2-8 0-2-6 0-8Z"/>',
  clear:'<path d="M4 8 12 3l8 5-8 5-8-5Zm0 0v9l8 5 8-5V8M12 13v9"/>',
  metal:'<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M7 9h10m-10 4h10"/>',
  thread:'<path d="M4 5c8-4 8 6 16 2M4 12c8-4 8 6 16 2M4 19c8-4 8 6 16 2"/>'
 };
 const kind=/plex|vetro|glass|pla|petg|acril/.test(n)?'clear':/metal|accia|allumin/.test(n)?'metal':/tessut|fabric|pelle|leather/.test(n)?'thread':'wood';
 return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round">'+shapes[kind]+'</svg>';
}
function renderTicker(){
  const el=$('techTicker'); if(!el) return;
  const cards=TECH.map(t=>`<div class="ttcard"><span class="tc-emoji">${inglyTechGlyph(t)}</span><div class="tc-body"><span class="tc-name">${t.n}</span><span class="tc-sub">${t.t}</span></div>${t.badge?`<span class="tc-badge">${t.badge}</span>`:''}</div>`).join('');
  const row1=cards+cards; /* duplicato per loop infinito */
  const mats=(window.INGLY.MATERIALS||[]).map(m=>`<div class="ttcard"><span class="tc-emoji">${inglyMaterialGlyph(Array.isArray(m)?m[0]:m)}</span><div class="tc-body"><span class="tc-name">${Array.isArray(m)?m[0]:m}</span><span class="tc-sub">${Array.isArray(m)&&m[1]?m[1]:'Materiale premium'}</span></div></div>`).join('');
  const row2=(mats||cards)+( mats||cards);
  el.innerHTML=`<div class="tt-row"><div class="tt-track">${row1}</div></div><div class="tt-row tt-row--rev"><div class="tt-track">${row2}</div></div>`;
}
function renderTech(){
  $('techGrid').innerHTML=TECH.map(t=>`
    <div class="mcard ${t.lg?'m-lg':''} reveal-blur stagger-${TECH.indexOf(t)+1}">
      <div class="mcard-sweep"></div>
      <span class="mcard-emoji">${inglyTechGlyph(t)}</span>
      <span class="mtype">${t.t}</span>
      <h3>${t.n}</h3>
      <p>${t.d[L]}</p>
      ${t.badge?`<span class="mcard-badge">${t.badge}</span>`:''}
      ${t.mats&&t.mats.length?`<div class="mats-list">${t.mats.map(m=>`<span>${m}</span>`).join('')}</div>`:''}
      <div class="spec">${t.s.map(s=>`<i>${s}</i>`).join('')}</div>
    </div>`).join('');
  const g2=$('techGrid2'); if(g2) g2.innerHTML=$('techGrid').innerHTML;
}
function renderSocialHub(){
  const hub=$('socialHub'); if(!hub) return;
  const SH=(window.INGLY&&window.INGLY.SOCIAL_HUB)||null;
  if(!SH||SH.attivo===false){ hub.style.display='none'; return }
  hub.style.display='';
  const cards=(SH.cards||[]).filter(c=>c.attivo!==false);
  if(!cards.length){ hub.innerHTML=''; return }
  hub.innerHTML=cards.map((c,i)=>{
    const [ca,cb]=(c.colore||'#3b7de0,#1a4fc4').split(',');
    const cta=c.url?`<span class="shcard-cta">Visita <span class="arr">→</span></span>`:'';
    const tag=c.url?'a':'div';
    const attrs=c.url?`href="${c.url}" target="_blank" rel="noopener"`:'';
    return `<${tag} class="shcard reveal-blur stagger-${(i%6)+1}" ${attrs} style="--sh-a:${ca}22;--sh-b:${cb}11">
      <div class="shcard-top">
        <div class="shcard-icon" style="background:linear-gradient(140deg,${ca}33,${cb}22)">${c.emoji||'🔗'}</div>
        <div><div class="shcard-name">${c.titolo[L]||c.titolo.it}</div><div class="shcard-badge">${c.badge||''}</div></div>
      </div>
      <p class="shcard-desc">${c.desc[L]||c.desc.it}</p>
      ${cta}
    </${tag}>`;
  }).join('');
}
function renderSteps(){$('stepsGrid').innerHTML=STEPS.map((s,i)=>`<div class="step reveal"><span class="n">0${i+1}</span><h3>${s[L][0]}</h3><p>${s[L][1]}</p></div>`).join('')}
function renderReviews(){
  $('revGrid').innerHTML=REVIEWS.map(r=>{
    const n=Math.max(1,Math.min(5,+r.st||5));
    const stelle='★'.repeat(n)+'<span class="off">'+'★'.repeat(5-n)+'</span>';
    const foto=(r.ph||[]).filter(Boolean);
    return `<div class="rcard reveal">
      <div class="stars" aria-label="${n} su 5">${stelle}</div>
      <p class="q">${r.q[L]}</p>
      ${foto.length?`<div class="rphotos">${foto.map(f=>
        `<button class="rph" data-action="rev-photo" data-arg="${f}" aria-label="Ingrandisci">
          <img src="${u.imgV(f)}" alt="" loading="lazy" onerror="this.parentElement.remove()"></button>`).join('')}</div>`:''}
      <div class="who">
        <div class="av" style="background:${r.c}">${r.i}</div>
        <div><b>${r.w}${r.vf?` <span class="vfd" title="Cliente verificato">✔</span>`:''}</b>
        <span>${r.s[L]}${r.dt?` · ${r.dt}`:''}</span></div>
      </div></div>`}).join('')}
/* eventi della lightbox (zoom foto prodotto) */
/* 2.2 — suggerimenti di ricerca con tastiera */
function bindSuggest(){
  const q=document.getElementById('q'), box=document.getElementById('sugg');
  if(!q||!box) return;
  let items=[], cur=-1;
  const close=()=>{box.hidden=true;q.setAttribute('aria-expanded','false');cur=-1};
  const paint=()=>{
    if(!items.length) return close();
    box.innerHTML='<b>'+(u.T('suggT')||'Suggerimenti')+'</b>'+items.map((s,i)=>
      `<button role="option" data-i="${i}" class="${i===cur?'on':''}"><span>${s.label}</span><span class="k">${s.kind}</span></button>`).join('');
    box.hidden=false;q.setAttribute('aria-expanded','true');
    box.querySelectorAll('button').forEach(b=>b.addEventListener('mousedown',e=>{e.preventDefault();choose(+b.dataset.i)}));
  };
  const choose=i=>{
    const s=items[i]; if(!s) return;
    close();
    if(s.action==='open-product'){ go('product','id='+s.arg); }
    else if(s.action==='go-shop'){ q.value=''; prod.togCat(s.arg); go('shop'); }
    else if(s.action==='sugg-mat'){ q.value=''; prod.togMat(s.arg); go('shop'); }
  };
  q.addEventListener('input',()=>{ items=prod.searchSuggest(q.value); cur=-1; paint() });
  q.addEventListener('keydown',e=>{
    if(box.hidden) return;
    if(e.key==='ArrowDown'){e.preventDefault();cur=Math.min(cur+1,items.length-1);paint()}
    else if(e.key==='ArrowUp'){e.preventDefault();cur=Math.max(cur-1,-1);paint()}
    else if(e.key==='Enter'&&cur>=0){e.preventDefault();choose(cur)}
    else if(e.key==='Escape'){close()}
  });
  q.addEventListener('blur',()=>setTimeout(close,120));
}
/* ===== Modalità chiara / scura ===== */
function bindMode(){
  const btn=document.getElementById('modeBtn');
  const mobile=document.getElementById('mobileModeBtn');
  if(!btn && !mobile) return;
  const root=document.documentElement;
  const sys=window.matchMedia && window.matchMedia('(prefers-color-scheme: light)');
  const stored=()=>{try{const v=localStorage.getItem('ingly_mode');return v==='light'||v==='dark'?v:null}catch(e){return null}};
  const labels=v=>v==='light'
    ? {next:'Passa alla modalità scura',current:'Modalità chiara attiva'}
    : {next:'Passa alla modalità chiara',current:'Modalità scura attiva'};
  const set=(value,persist=false)=>{
    const v=value==='light'?'light':'dark';
    root.setAttribute('data-mode',v);
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',v==='light'?'#f4f8fc':'#0b1221');
    if(persist){try{localStorage.setItem('ingly_mode',v)}catch(e){}}
    for(const el of [btn,mobile]){
      if(!el)continue;
      el.setAttribute('aria-pressed',v==='light'?'true':'false');
      el.setAttribute('aria-label',labels(v).next);
      el.title=labels(v).next;
    }
  };
  set(stored() || (sys&&sys.matches?'light':'dark'));
  const toggle=()=>{
    root.classList.add('theme-anim');
    set(root.getAttribute('data-mode')==='light'?'dark':'light',true);
    window.setTimeout(()=>root.classList.remove('theme-anim'),450);
  };
  btn?.addEventListener('click',toggle);
  mobile?.addEventListener('click',toggle);
  try{sys?.addEventListener('change',e=>{if(!stored())set(e.matches?'light':'dark')})}catch(e){}
}

function bindLightbox(){
  const box=document.getElementById('lightbox'); if(!box) return;
  const main=document.getElementById('ppMain');
  if(main) main.addEventListener('click', e=>{
    if(e.target.closest('button,[data-action]')) return;
    const img=document.querySelector('#ppArt img');
    if(img)prod.openLightbox(img.getAttribute('src'));
  });
  /* clic su una miniatura → apre QUELLA foto nello zoom (non riparte dalla principale) */
  const thumbs=document.getElementById('ppThumbs');
  if(thumbs) thumbs.addEventListener('click', e=>{
    const th=e.target.closest('[data-action="pp-thumb"]');
    if(!th) return;
    e.stopPropagation();
    prod.ppThumb(th);               /* aggiorna la foto principale */
    prod.openLightbox(th.dataset.src);  /* e apre lo zoom proprio su quella */
  });
  document.addEventListener('click', e=>{
    const t=e.target.closest('[data-action="rev-photo"]');
    if(t) prod.openPhoto(t.dataset.arg);
    /* portfolio: se la tessera ha una scheda progetto la apre, altrimenti zoom */
    const g=e.target.closest('.gtile');
    if(g && !e.target.closest('.gtile-go')){
      const idx=+g.dataset.pi;
      if(!isNaN(idx) && prod.openProject(idx)) return;
      const img=g.querySelector('img');
      if(img){
        const all=(window.INGLY.PORT||[]).map(p=>p[3]).filter(Boolean);
        prod.openSeries(all.length?all:[img.getAttribute('src')], img.getAttribute('src'));
      }
    }
    /* foto dentro la scheda progetto → zoom */
    const pp=e.target.closest('[data-action="proj-photo"]');
    if(pp) prod.openPhoto(pp.dataset.arg);
    if(e.target.closest('[data-action="close-proj"]')) prod.closeProject();
  });
  const pjClose=document.getElementById('projClose');
  if(pjClose) pjClose.addEventListener('click', prod.closeProject);
  const pjBox=document.getElementById('projModal');
  if(pjBox) pjBox.addEventListener('click', e=>{ if(e.target===pjBox) prod.closeProject() });
  document.getElementById('lbxClose').addEventListener('click', prod.closeLightbox);
  document.getElementById('lbxPrev').addEventListener('click', e=>{e.stopPropagation();prod.lbxMove(-1)});
  document.getElementById('lbxNext').addEventListener('click', e=>{e.stopPropagation();prod.lbxMove(1)});
  box.addEventListener('click', e=>{ if(e.target===box) prod.closeLightbox() });
  document.addEventListener('keydown', e=>{
    if(!box.hidden){
      if(e.key==='ArrowLeft'){e.preventDefault();prod.lbxMove(-1)}
      if(e.key==='ArrowRight'){e.preventDefault();prod.lbxMove(1)}
    }
    if(e.key==='Escape'&&!document.getElementById('projModal')?.hidden)prod.closeProject();
  });
}
/* 2.4 — fascia promozionale con finestra di date (stessa logica del calendario dei temi) */
function promoAttiva(){
  const p=(window.INGLY&&window.INGLY.PROMO)||null;
  if(!p||p.attivo===false||!(p.testo&&(p.testo.it||p.testo.en))) return null;
  if(p.dal&&p.al){
    const d=new Date();
    const md=String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    const dentro = p.dal<=p.al ? (md>=p.dal&&md<=p.al) : (md>=p.dal||md<=p.al);
    if(!dentro) return null;
  }
  return p;
}
function renderPromo(){
  const bar=document.getElementById('promoBar'); if(!bar) return;
  const p=promoAttiva();
  if(!p||sessionStorage.getItem('ingly_promo_x')===(p.id||p.testo[L]||'1')){ bar.innerHTML=''; return }
  const cta=(p.cta&&p.cta[L])||'';
  bar.innerHTML=`<div class="promo" style="${p.colori?`--promo-a:${p.colori.split(',')[0]};--promo-b:${p.colori.split(',')[1]||p.colori.split(',')[0]}`:''}">
    <span>${p.testo[L]||p.testo.it}</span>
    ${cta&&p.link?`<a href="${p.link}">${cta}</a>`:''}
    <button class="promo-x" aria-label="Chiudi">✕</button></div>`;
  bar.querySelector('.promo-x').addEventListener('click',()=>{
    try{sessionStorage.setItem('ingly_promo_x',p.id||p.testo[L]||'1')}catch(e){}
    bar.innerHTML='';
  });
}
/* ===== Sponsor & Partner ===== */
const SP_ORDER={gold:0,silver:1,bronze:2,'':3};
function renderSponsors(){
  const sec=document.getElementById('sponsorSec'); if(!sec) return;
  const S=(window.INGLY&&window.INGLY.SPONSORS)||{};
  const list=(S.lista||[]).filter(x=>x&&x.nome&&x.attivo!==false);
  if(S.attivo===false||!list.length){ sec.hidden=true; return }
  sec.hidden=false;
  sec.classList.toggle('color', S.grigio!==true);   /* a colori salvo scelta contraria */
  document.getElementById('spTitle').textContent=(S.titolo&&S.titolo[L])||'';
  document.getElementById('spSub').textContent=(S.sottotitolo&&S.sottotitolo[L])||'';
  const ordered=[...list].sort((a,b)=>(SP_ORDER[a.livello||'']??3)-(SP_ORDER[b.livello||'']??3));
  document.getElementById('spGrid').innerHTML=ordered.map(s=>{
    const tier=s.livello||'';
    const inner=`${s.logo
        ? `<img class="sp-logo" src="${u.imgV(s.logo)}" alt="${(s.nome||'').replace(/"/g,'')}" loading="lazy" onerror="this.remove()">`
        : ''}
      <span class="sp-name">${s.nome}</span>
      ${s.desc&&s.desc[L]?`<span class="sp-desc">${s.desc[L]}</span>`:''}
      ${tier?`<span class="sp-tier ${tier}">${tier}</span>`:''}`;
    return s.link
      ? `<a class="sp-it ${tier}" href="${s.link}" target="_blank" rel="noopener sponsored">${inner}</a>`
      : `<div class="sp-it ${tier}">${inner}</div>`;
  }).join('');
  const cta=document.getElementById('spCta');
  cta.innerHTML=(S.cta&&S.cta[L])
    ? (S.ctaLink?`<a href="${S.ctaLink}">${S.cta[L]}</a>`:S.cta[L]) : '';
}
function renderWaFab(){
  const w=CONFIG.whatsappFab||{};
  const el=document.getElementById('waFab');if(!el)return;
  const num=String(w.numero||'').replace(/[^0-9]/g,'');
  const url=num?('https://wa.me/'+num+(w.messaggio?'?text='+encodeURIComponent(w.messaggio):'')):(CONFIG.whatsapp||'');
  if(w.attivo===false||!url){el.style.display='none';return}
  el.href=url;el.style.display='';
  const lbl=el.querySelector('.wa-lbl');if(lbl)lbl.textContent=(w.etichetta&&w.etichetta[L])||(L==='it'?'Scrivici su WhatsApp':'Chat on WhatsApp');
}
function renderAboutArt(){
  const box=document.querySelector('.about-art');if(!box)return;
  const am=CONFIG.aboutMedia||{};
  const v=(window.INGLY&&window.INGLY.__v)||0;
  if(am.tipo==='immagine'&&am.src){
    box.innerHTML=`<div class="about-media"><img src="${am.src}${am.src.includes('?')?'':'?v='+v}" alt="INGLY" loading="lazy"></div>`;
  }else if(am.tipo==='video'&&am.src){
    box.innerHTML=`<div class="about-media"><video src="${am.src}" autoplay muted loop playsinline aria-hidden="true"></video></div>`;
  } /* tipo 'logo' o vuoto: resta il logo animato già nel markup */
}
const BIZ_ASSET_IDS=['targhe-professionali','gadget-aziendali','qr-menu-branding','produzione-conto-terzi','incisioni-industriali','prototipazione-laser'];
const BUSINESS_SECTOR_ASSETS={ristoranti:'ristoranti','uffici-studi':'uffici-studi',hotel:'hotel','eventi-aziendali':'eventi-aziendali'};
function editorialBizImage(id,label){
  if(!/^[a-z0-9-]+$/.test(id))return '';
  return '<figure class="ingly-biz-cover"><img loading="lazy" decoding="async" width="1200" height="800" src="'+BASE.replace(/\/+$/,'')+'/assets/images/business-editorial/'+id+'.svg" alt="'+escHtml(label)+' — concept illustrativo"><figcaption>'+(L==='it'?'Concept illustrativo':'Illustrative concept')+'</figcaption></figure>';
}
function renderBiz(){$('bizCards').innerHTML=BIZ.map((b,i)=>`<div class="rcard reveal ingly-biz-service" style="transition-delay:${i*.06}s">${editorialBizImage(BIZ_ASSET_IDS[i],b[1][L])}<h3 style="margin:14px 0 8px;font-size:20px">${escHtml(b[1][L])}</h3><p style="font-size:14.5px;color:var(--ink-soft)">${escHtml(b[2][L])}</p></div>`).join('')}
/* ===== PAGINE DI SETTORE (B2B) =====
   Una pagina per tipo di cliente aziendale. Il contenuto è lo stesso che il
   prerender scrive nel file statico: chi arriva da Google legge subito, chi
   naviga nel sito vede la versione viva. Una sola fonte, due modi di servirla. */
const VERTICALI = () => VERT.attive((window.INGLY && window.INGLY.VERTICALI) || []);

/* I testi dei settori li scrive una persona nell'Admin: vanno trattati come
   testo, non come markup, o un apice storto diventa codice. */
const escHtml = t => String(t == null ? '' : t)
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;').replace(/'/g,'&#39;');

/* ===== LAB: materiali, tecnologie, macchine =====
   Le sezioni si disegnano una volta sola al caricamento; la scheda aperta
   la decide l'indirizzo, come per i settori Business. */
/* ===== CONTATORI =====
   Il valore a riposo è già quello giusto: l'animazione lo riporta a zero e
   lo risale soltanto se l'elemento entra davvero nello schermo. Prima
   partiva da uno zero scritto nel markup, e chi non vedeva l'animazione —
   sezione già a schermo, scroll veloce, pagina statica senza JavaScript —
   leggeva zero prodotti su un catalogo pieno. */
const escTxt = t => String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
function renderContatori(){
  const box=$('counters'); if(!box) return;
  const voci=STATO.contatori(window.INGLY||{},L);
  if(!voci.length){ box.innerHTML=''; return }
  box.innerHTML=voci.map(v=>`<div class="counter"><b><span class="count" data-to="${v.n}">${
    v.n.toLocaleString(L==='it'?'it-IT':'en-US')}</span>${v.suffisso?`<i>${v.suffisso}</i>`:''}</b><span>${
    escTxt(v.etichetta)}</span></div>`).join('');
}

/* ===== MANUTENZIONE =====
   Se è accesa il sito NON si avvia: un catalogo che continua a caricare
   sotto un velo non è un sito in manutenzione, è un sito funzionante con
   un cartello davanti. */
export function fermaPerManutenzione(D,L2){
  const m=STATO.manutenzione(D,L2||'it');
  if(!m.attiva) return false;
  const ov=document.getElementById('maintenanceOverlay');
  if(ov){
    const t=document.getElementById('mntTitle'); if(t) t.textContent=m.titolo;
    const g=document.getElementById('mntMsg'); if(g) g.textContent=m.messaggio;
    const w=document.getElementById('mntWa'); if(w&&!m.whatsapp) w.style.display='none';
    ov.hidden=false; ov.style.display='flex';
  }
  document.body.style.overflow='hidden';
  /* Il contenuto non resta sotto a caricare: si toglie di mezzo. */
  const main=document.querySelector('main'); if(main) main.hidden=true;
  const ldr=document.getElementById('loader'); if(ldr) ldr.classList.add('off');
  return true;
}

/* La navigazione a famiglie: se fallisce, resta quella piatta. */
function renderNavIA(){
  try{ initNavIA(window.INGLY||{},L) }
  catch(err){ console.warn('[INGLY] navigazione a famiglie non montata:',err) }
}

function renderLab(){
  try{
    LABUI.renderFiltriMateriali(L);
    LABUI.renderMateriali(L);
    LABUI.renderTecnologie(L);
    LABUI.renderMacchine(L);
    LABUI.renderCorsi(L);
    LABUI.renderDemo(L);
    LABUI.renderMateriale(currentScheda('materiali'),L,p=>prod.card(p));
    LABUI.renderTecnologia(currentScheda('tecnologie'),L,p=>prod.card(p));
    LABUI.renderMacchina(currentScheda('macchine'),L,p=>prod.card(p));
    LABUI.renderCorso(currentScheda('academy'),L);
  }catch(err){
    /* Il Lab è una sezione in più: se i suoi dati mancano o sono malformati
       non deve portarsi dietro il resto del sito. */
    console.warn('[INGLY] Lab non disegnato:',err);
  }
}

function renderVertStrip(){
  const box=$('vertStrip'); if(!box) return;
  const lista=VERTICALI();
  if(!lista.length){ box.innerHTML=''; return }
  box.innerHTML='<h3 class="vert-tit">'+(L==='it'?'Soluzioni per il tuo settore':'Solutions for your sector')+'</h3>'
    +'<div class="vert-grid">'+lista.map(v=>{
      const m=VERT.meta(v,{L});
      return `<a class="vert-card reveal" href="${BASE.replace(/\/+$/,'')}/business/${v.id}" data-vert="${v.id}">
        ${BUSINESS_SECTOR_ASSETS[v.id]?editorialBizImage(BUSINESS_SECTOR_ASSETS[v.id],VERT.lingua(v.n,L)):`<span class="vert-ic" aria-hidden="true">${v.icona||'▸'}</span>`}
        <b>${escHtml(VERT.lingua(v.n,L))}</b>
        <span class="vert-sub">${VERT.lingua(v.sottotitolo,L).slice(0,95)}</span>
        <span class="vert-go">${L==='it'?'Scopri':'Explore'} <i class="arr">→</i></span></a>`;
    }).join('')+'</div>';
}

/* Disegna il settore aperto, oppure rimette la pagina Business generica. */
function renderVerticale(id){
  const pagina=$('vertPage'), hero=document.querySelector('#page-business .phero');
  if(!pagina) return;
  const v=id?VERT.perId(VERTICALI(),id):null;
  if(!v){ pagina.hidden=true; pagina.innerHTML=''; if(hero) hero.hidden=false; return }

  if(hero) hero.hidden=true;          /* il settore sostituisce la pagina generica */
  pagina.hidden=false;
  const P=(window.INGLY.P)||[];
  const lista=VERT.prodottiDi(v,P,{L});
  const e=escHtml;

  pagina.innerHTML=`
    <nav class="vert-back"><a href="${BASE.replace(/\/+$/,'')}/business" data-nav="business">← ${L==='it'?'Tutti i settori':'All sectors'}</a></nav>
    ${BUSINESS_SECTOR_ASSETS[v.id]?editorialBizImage(BUSINESS_SECTOR_ASSETS[v.id],VERT.lingua(v.n,L)):''}
    <span class="eyebrow">${v.icona||''} ${e(VERT.lingua(v.n,L))}</span>
    <h1 class="h2" style="font-size:clamp(2.2rem,5vw,3.6rem)">${e(VERT.lingua(v.titolo,L))}</h1>
    <p class="sub">${e(VERT.lingua(v.sottotitolo,L))}</p>
    ${VERT.lingua(v.intro,L)?`<p class="vert-intro">${e(VERT.lingua(v.intro,L))}</p>`:''}
    <div class="hero-ctas">
      <button class="btn btn-primary magnetic" data-action="go" data-arg="quote" data-search="tipo=azienda">
        ${L==='it'?'Richiedi preventivo':'Request a quote'} <span class="arr">→</span></button>
    </div>
    ${(v.servizi||[]).length?`<div class="b2b-cards">${(v.servizi||[]).map((sv,i)=>
      `<div class="rcard reveal" style="transition-delay:${i*.06}s">
        <h3 style="margin:0 0 8px;font-size:19px">${e(VERT.lingua(sv.t,L))}</h3>
        <p style="font-size:14.5px;color:var(--ink-soft)">${e(VERT.lingua(sv.d,L))}</p></div>`).join('')}</div>`:''}
    ${lista.length?`<h3 class="vert-tit">${L==='it'?'Prodotti per questo settore':'Products for this sector'}</h3>
      <div class="pgrid" id="vertProdotti">${lista.map(p=>prod.card(p)).join('')}</div>`:''}
    ${(v.faq||[]).length?`<h3 class="vert-tit">${L==='it'?'Domande frequenti':'FAQ'}</h3>
      ${(v.faq||[]).map(f=>`<details class="fitem reveal"><summary>${e(VERT.lingua(f[0],L))}<span class="pl" aria-hidden="true">+</span></summary>
        <div class="fbody"><p>${e(VERT.lingua(f[1],L))}</p></div></details>`).join('')}`:''}
  `;
  observeAll();
}

function renderFaq(){$('faqList').innerHTML=FAQS.map(f=>`<details class="fitem reveal"><summary>${f[0][L]}<span class="pl" aria-hidden="true">+</span></summary><div class="fbody"><p>${f[1][L]}</p></div></details>`).join('')}
const MAT_ICON={Legno:'legno',Bamboo:'legno',MDF:'legno',Metallo:'metallo',Alluminio:'metallo',
  Plexiglass:'materiali',Acrilico:'materiali',Vetro:'materiali',Pelle:'materiali',PLA:'3d',Carta:'materiali',Tessuto:'dtf'};
function renderMat(){const g=$('matGrid');if(!g)return;g.innerHTML=MATERIALS.map(m=>`<div class="matcard reveal"><div class="sw2" style="background:linear-gradient(140deg,${m[2]})">${u.icon(MAT_ICON[m[0]]||'materiali','')}</div><b>${L==='it'?m[0]:m[1]}</b><span>${m[3][L]}</span></div>`).join('')}
/* Tessera portfolio: usa la FOTO se presente (g[3] = percorso immagine),
   altrimenti resta il segnaposto grafico. Gestibile dal pannello. */
const tile=(g)=>{
  const img=g[3], link=g[4];
  const idx=(window.INGLY.PORT||[]).indexOf(g);
  const hasProj=g[5]&&typeof g[5]==='object'&&Object.keys(g[5]).length>0;
  const inner=`<figure class="gtile${img?' gtile--photo':''}${hasProj?' gtile--proj':''}" data-pi="${idx}" style="background:linear-gradient(140deg,${g[2]})">`
    +(img?`<img src="${img+(img.includes("?")?"":"?v="+((window.INGLY&&window.INGLY.__v)||0))}" alt="${(g[1][L]||'').replace(/"/g,'')}" loading="lazy" class="gimg"${(window.INGLY.FOCAL&&window.INGLY.FOCAL[img])?` style="object-position:${window.INGLY.FOCAL[img]}"`:""}>`
        :`<div class="ph-badge" aria-hidden="true">${g[0]}</div>`)
    +`<figcaption class="lbl">${g[1][L]}${hasProj?' <span class="proj-hint">Vedi il progetto →</span>':''}</figcaption></figure>`;
  /* con link: la foto apre lo zoom, la freccia ↗ porta a Instagram (due azioni distinte) */
  return link
    ? `<div class="gtile-w">${inner}<a class="gtile-go" href="${link}" target="_blank" rel="noopener" aria-label="Apri su Instagram">↗</a></div>`
    : inner;
};
function renderPort(){
  /* velocità della striscia decisa dall'Admin (secondi per giro completo) */
  const sp=+(window.INGLY.GALSPEED)||96;
  document.documentElement.style.setProperty('--gal-speed',sp+'s');
  const conFoto=PORT.filter(p=>p[3]).length;
  $('gal1').innerHTML=[...PORT.slice(0,8),...PORT.slice(0,8)].map(tile).join('');
  $('gal2').innerHTML=[...PORT.slice(4),...PORT.slice(4)].map(tile).join('');
  /* se nessuna tessera ha foto, la striscia mostra i segnaposto: nascondi la seconda riga
     per non raddoppiare l'effetto "vuoto" */
  const g2=$('gal2'); if(g2) g2.style.display=conFoto?'':'none';
  $('portGrid').innerHTML=PORT.map(tile).join('')}

/* Un componente non deve poter spegnere l'intera applicazione.
   Le pagine SEO prerenderizzate possono avere il guscio DOM di una versione
   precedente: registriamo il nome del componente che fallisce e continuiamo
   a disegnare le sezioni disponibili. L'errore resta visibile nella console. */
function safeRun(label, task){
  try { return task(); }
  catch(error){
    const item={label:String(label),message:String(error&&error.message||error),stack:String(error&&error.stack||'')};
    window.__INGLY_RUNTIME_ERRORS=Array.isArray(window.__INGLY_RUNTIME_ERRORS)?window.__INGLY_RUNTIME_ERRORS:[];
    window.__INGLY_RUNTIME_ERRORS.push(item);
    if(window.__INGLY_RUNTIME_ERRORS.length>25)window.__INGLY_RUNTIME_ERRORS.shift();
    console.error('[INGLY] componente isolato durante l’avvio: '+item.label,error);
    return undefined;
  }
}
function renderAll(){
  const jobs=[
    ['accento tema',()=>prod.applyThemeAccent()],
    ['promo',renderPromo],['sponsor',renderSponsors],['WhatsApp flottante',renderWaFab],
    ['media Chi siamo',renderAboutArt],['hero',()=>prod.renderHero()],['categorie',()=>prod.renderCats()],
    ['collezioni',()=>prod.renderColl()],['personalizzazione',()=>prod.renderPersonalizza()],
    ['chip catalogo',()=>prod.renderChips()],['catalogo',()=>prod.renderShop()],['scheda prodotto',()=>prod.renderPP()],
    ['catalogo digitale',()=>DIGUI.renderTutto(L)],['ticker',renderTicker],['tecnologie home',renderTech],
    ['passaggi',renderSteps],['recensioni',renderReviews],['Business',renderBiz],['settori',renderVertStrip],
    ['pagina settore',()=>renderVerticale(currentVerticale())],['Lab',renderLab],['navigazione IA',renderNavIA],
    ['contatori',renderContatori],['FAQ',renderFaq],['materiali home',renderMat],['portfolio',renderPort],
    ['social hub',renderSocialHub],['urgenza',renderUrg],['carrello',()=>prod.renderCart()],['animazioni',observeAll]
  ];
  jobs.forEach(([label,task])=>safeRun('render/'+label,task));
}

/* ---- delega eventi (niente handler inline) ---- */
const actions={
  /* data-search porta con sé una query: «go quote» + «tipo=azienda» apre il
     preventivo già nella forma aziendale, senza una seconda pagina da mantenere */
  'go':el=>go(el.dataset.arg, el.dataset.search||null),
  'go-shop':el=>goShop(el.dataset.arg),
  'open-product':el=>prod.openProduct(+el.dataset.id),
  'wish':(el,e)=>{e.stopPropagation();wish.toggleWishItem(+el.dataset.id,el)},
  'open-wish':()=>wish.openWish(),
  'close-wish':()=>wish.closeWish(),
  'wish-share':()=>wish.shareWish(),
  'wish-to-cart':()=>wish.wishToCart(),
  'wish-add-cart':(el,e)=>{e.stopPropagation();prod.addToCart(el.dataset.id);toast(T('ppAdd'));wish.closeWish()},
  'wish-rm':(el,e)=>{e.stopPropagation();wish.toggleWishItem(+el.dataset.id,el)},
  'close-promo-pop':()=>wish.closePromoPopup(), /* fallback per eventuali btn dinamici */
  'ref-share':()=>shareRef(),
  'quick-add':(el,e)=>{e.stopPropagation();prod.addToCart(el.dataset.id)},
  'open-cart':()=>prod.openCart(),
  'close-cart':()=>prod.closeCart(),
  'menu-open':()=>toggleMenu(true),
  'menu-close':()=>toggleMenu(false),
  'lang':el=>setLang(el.dataset.l),
  'tog-cat':el=>prod.togCat(el.dataset.v),
  'tog-mat':el=>prod.togMat(el.dataset.v),
  'tog-sub':el=>prod.togSub(el.dataset.v),
  'reset-filters':()=>prod.resetFilters(),
  'pp-thumb':el=>prod.ppThumb(el),
  'pp-qty':el=>prod.qty(el.dataset.d),
  'pp-add':()=>prod.addFromPP(),
  'pp-gal-prev':()=>prod.galPrev(),
  'pp-gal-next':()=>prod.galNext(),
  'pp-tab':el=>prod.ppTabShow(el.dataset.tab),
  /* Passa da digitale-ui, che prima di aggiungere controlla che il bundle
     sappia come arrivare al cliente. */
  'dig-add':el=>DIGUI.aggiungi(el.dataset.id),
  'dig-filtro':el=>DIGUI.impostaFiltro(el.dataset.k,el.dataset.v),
  'dig-lic':el=>DIGUI.vaiAllaLicenza(el.dataset.id),
  'cart-qty':el=>prod.cQty(el.dataset.i,el.dataset.d),
  'cart-rm':el=>prod.rmCart(el.dataset.i),
  'coll':el=>prod.setColl(el.dataset.coll),
  'open-coll':el=>prod.openColl(el.dataset.coll),
  'per-cat':el=>prod.setPerCat(el.dataset.arg),
  'filtri-apri':()=>prod.apriFiltri(),
  'filtri-chiudi':()=>prod.chiudiFiltri(),
  'coll-clear':()=>prod.clearColl(),
  'pill':el=>{el.parentNode.querySelectorAll('.pill').forEach(x=>x.classList.remove('on'));el.classList.add('on')},
  'fake-upload':el=>{el.classList.toggle('done');el.textContent=el.classList.contains('done')?('✓ '+(el.dataset.done||'file')):el.dataset.t},
  'toast-soon':()=>toast(T('soon')),
  'checkout-wa':()=>prod.checkoutWhatsApp(),
  'checkout-email':()=>prod.checkoutEmail(),
  'apply-coupon':()=>prod.applyCoupon(),
  'search':()=>{go('shop');setTimeout(()=>$('q').focus(),400)},
  'quote-scroll':()=>{const q=document.querySelector('.quote-form');if(q)q.scrollIntoView({behavior:'smooth'})}
};
function initDelegation(){
  document.addEventListener('click',e=>{
    const el=e.target.closest('[data-action]');if(!el)return;
    const fn=actions[el.dataset.action];if(fn){if(el.tagName==='A'&&el.getAttribute('href')==='#')e.preventDefault();fn(el,e)}
  });
  document.addEventListener('keydown',e=>{
    if(!['Enter',' '].includes(e.key))return;
    const card=e.target.closest('.pcard[data-action="open-product"]');
    if(card&&e.target===card){
      e.preventDefault();prod.openProduct(+card.dataset.id);return;
    }
    const preview=e.target.closest('#ppArt[role="button"]');
    if(preview&&e.target===preview&&preview.getAttribute('aria-disabled')!=='true'){
      e.preventDefault();
      const img=preview.querySelector('img');
      if(img)prod.openLightbox(img.getAttribute('src'));
    }
  });
}

/* ===== BACKGROUND PICKER ===== */
function initBgPicker(){
  const ART=window.INGLY_ART; if(!ART) return;
  const panel=document.getElementById('bgPicker'); if(!panel) return;
  const btn=document.getElementById('bgPickerBtn'); if(!btn) return;
  const grid=document.getElementById('bgPickerGrid'); if(!grid) return;

  /* carica / salva preferenza sfondo */
  let saved; try{ saved=JSON.parse(localStorage.getItem('ingly_bg')||'null') }catch(e){}
  const THEME=()=>(window.INGLY&&window.INGLY.THEMES&&window.INGLY.THEMES.temi||[]);

  function bgPalette(){
    const th=prod.activeTheme();
    if(th&&th.palette) return th.palette;
    return ['#0a0d18','#1E3A8A','#FACC15'];
  }

  function applyBg(key,persist){
    const pal=bgPalette();
    const uri=ART.css(key,pal,key);
    document.documentElement.style.setProperty('--site-bg',uri);
    document.querySelectorAll('.hero-section,.hero-bg-art').forEach(el=>{
      el.style.setProperty('--art-bg',uri);
    });
    if(persist) try{ localStorage.setItem('ingly_bg',JSON.stringify(key)) }catch(e){}
    /* mark attivo */
    grid.querySelectorAll('.bp-thumb').forEach(t=>t.classList.toggle('active',t.dataset.bg===key));
  }

  function clearBg(){
    document.documentElement.style.removeProperty('--site-bg');
    document.querySelectorAll('.hero-section,.hero-bg-art').forEach(el=>el.style.removeProperty('--art-bg'));
    try{ localStorage.removeItem('ingly_bg') }catch(e){}
    grid.querySelectorAll('.bp-thumb').forEach(t=>t.classList.remove('active'));
  }

  /* costruisce la griglia di anteprime */
  const pal=bgPalette();
  const keys=ART.patterns;
  const labels={aurora:'Aurora',laser:'Laser',grid:'Griglia',bokeh:'Bokeh',waves:'Onde',topo:'Topo',rays:'Raggi',
    particles:'Part.',marble:'Marmo',circuit:'Circuit',snow:'Neve',confetti:'Party',mesh:'Mesh',
    arcs:'Archi',beams:'Fasci',neon:'Neon',diamond:'Diamanti',holo:'Holo',laserBurst:'Burst',aurora2:'Aurora+'};
  grid.innerHTML=`<button class="bp-thumb bp-none" data-bg="" title="Predefinito">
    <span class="bp-icon">✕</span><span class="bp-lbl">Default</span>
  </button>`+keys.map(k=>{
    const uri=ART.dataUri(k,pal,k);
    return `<button class="bp-thumb" data-bg="${k}" title="${labels[k]||k}" style="background-image:url('${uri}')">
      <span class="bp-lbl">${labels[k]||k}</span>
    </button>`;
  }).join('');

  /* eventi */
  grid.addEventListener('click',e=>{
    const th=e.target.closest('.bp-thumb'); if(!th) return;
    if(th.dataset.bg==='') clearBg();
    else applyBg(th.dataset.bg,true);
    panel.classList.remove('open');
  });
  btn.addEventListener('click',e=>{
    e.stopPropagation();
    panel.classList.toggle('open');
  });
  document.addEventListener('click',e=>{
    if(!panel.contains(e.target)&&e.target!==btn) panel.classList.remove('open');
  });

  /* ripristina sfondo salvato */
  if(saved) applyBg(saved,false);
}

/* ---- avvio ---- */
safeRun('accessibilità navigazione',ensureAccessibilityShell);
const _mq=$('mq');if(_mq)_mq.innerHTML+=_mq.innerHTML;
safeRun('configurazione contatti',applyConfig);
safeRun('link social',renderSocials);
safeRun('video hero',initHeroVideo);
safeRun('SEO iniziale',initSeo);
safeRun('navigazione',initNav);
safeRun('animazioni',initAnimations);
safeRun('lazy loading',initLazy);
safeRun('moduli contatto',initForms);
safeRun('filtri catalogo',()=>prod.initShopControls());
safeRun('delega eventi',initDelegation);
safeRun('condivisione',initShare);
safeRun('FOMO',initFomo);
safeRun('feed Instagram',()=>renderInstagramFeed('igFeedSection'));
safeRun('lingua memorizzata',()=>{
 try{const saved=localStorage.getItem('ingly_lang');if(saved==='en'||saved==='it')setL(saved)}catch(e){}
});
safeRun('traduzioni',applyI18n);
safeRun('filtri URL',()=>prod.readFiltersFromURL());
safeRun('render iniziale',renderAll);
safeRun('galleria e lightbox',bindLightbox);
safeRun('ricerca suggerita',bindSuggest);
safeRun('tema chiaro/scuro',bindMode);
safeRun('selettore sfondo',initBgPicker);
window._wish = wish;
safeRun('wishlist',()=>wish.initWish());
safeRun('popup promozionale',()=>wish.initPromoPopup());
safeRun('referral',initReferral);
/* rete di sicurezza: nessuna sezione può restare invisibile per un errore di animazione */
setTimeout(()=>{
  const stuck=[...document.querySelectorAll('.reveal')].filter(el=>{
    const pg=el.closest('.page'); if(pg&&!pg.classList.contains('active')) return false;
    const r=el.getBoundingClientRect();
    return !el.classList.contains('in') && r.top < innerHeight && r.bottom > 0;
  });
  if(stuck.length){ document.documentElement.classList.add('reveal-failsafe');
    console.warn('[INGLY] '+stuck.length+' sezioni non rivelate: attivata la rete di sicurezza'); }
},3000);
/* Deep link prodotto: chi arriva da Google, da una condivisione o dalla sitemap
   su /product?id=5 deve trovarsi davanti il prodotto 5, non il primo del catalogo. */
safeRun('deep link prodotto',()=>{
  if(currentPage()==='product'){
    const pid=+currentSearch();
    if(pid && !prod.selectProduct(pid)) go('shop');   /* id inesistente → catalogo */
  }
});
/* la pagina di settore si ridisegna a ogni cambio pagina: dipende
   dall'indirizzo, non dai dati */
document.addEventListener('ingly:pagina',e=>{
  if(e.detail && e.detail.pagina==='business') renderVerticale(currentVerticale());
  /* Le schede del Lab si aprono e si chiudono come i settori Business:
     l'indirizzo decide, non un bottone. */
  if(e.detail && e.detail.pagina==='materiali') LABUI.renderMateriale(currentScheda('materiali'),L,p=>prod.card(p));
  if(e.detail && e.detail.pagina==='tecnologie') LABUI.renderTecnologia(currentScheda('tecnologie'),L,p=>prod.card(p));
  if(e.detail && e.detail.pagina==='macchine') LABUI.renderMacchina(currentScheda('macchine'),L,p=>prod.card(p));
  if(e.detail && e.detail.pagina==='academy') LABUI.renderCorso(currentScheda('academy'),L);
});

/* Il blocco pre-scritto ha fatto il suo lavoro (farsi leggere dai crawler):
   ora l'applicazione disegna la pagina vera e quel duplicato va tolto. */
document.getElementById('prerender')?.remove();
safeRun('mostra pagina iniziale',()=>show(currentPage()));

/* Bandierina di avvenuto avvio: la usa la rete di sicurezza in index.html per
   decidere se serve il bundle di riserva. Va messa in fondo, quando tutto il
   resto è andato a buon fine — prima non direbbe niente di utile. */
window.__INGLY_PRONTO = true;
