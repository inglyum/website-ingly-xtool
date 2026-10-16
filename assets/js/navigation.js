/* ============ NAVIGATION (modulo) ============
   Router History API (pushState): URL puliti senza #.
   Compatibilità GitHub Pages: 404.html decodifica /shop → /?/shop → qui ripristinato. */
import { observeAll } from './animations.js';
import { F, renderRV, renderChips, renderShop, currentProduct } from './products.js';
import { updateSeo } from './seo.js';
import { L, T } from './utils.js';
import { openFocusLayer, closeFocusLayer } from './accessibility.js';
import { routeClickTarget } from './navigation-link-policy.js';

/* L'elenco delle rotte non vive più qui: vive in rotte.js, e `404.html` lo
   riceve dal build. Erano due copie, e la seconda era rimasta indietro di
   cinque rotte. */
import { ID as PAGES_ID } from './rotte.js';
export const PAGES = PAGES_ID;

/* ===== PERCORSO BASE =====
   In produzione il sito sta nella radice del dominio ("/"), ma su GitHub Pages
   un repository di sviluppo viene servito in una sottocartella
   ("/Il-sito-AI/"). Senza questo, "/Il-sito-AI/shop" veniva letto come pagina
   "Il-sito-AI" — sconosciuta — e mostrava sempre la home: il sito risultava
   non navigabile ovunque non fosse la radice.
   La base si ricava da dove è stato caricato QUESTO modulo
   (…/assets/js/navigation.js), quindi funziona ovunque senza configurazione. */
export const BASE = (() => {
  try{
    const u = new URL('../../', import.meta.url).pathname;   // → "/" oppure "/Il-sito-AI/"
    return u.endsWith('/') ? u : u + '/';
  }catch(e){
    /* Nel bundle IIFE import.meta.url non esiste. Recuperiamo la base
       dallo script fallback, anziché assumere '/' e rompere Pages sotto /repo/. */
    try{
      const script=document.currentScript && document.currentScript.src
        || document.querySelector('script[nomodule][src*="app.fallback.js"]')?.src
        || document.querySelector('script[src*="app.fallback.js"]')?.src;
      if(script){
        const base=new URL('../../',script).pathname;
        return base.endsWith('/')?base:base+'/';
      }
    }catch(ignore){}
    return '/';
  }
})();

/* percorso della pagina corrente, tolta la base */
function relPath(){
  const p = location.pathname;
  const rel = (BASE !== '/' && p.startsWith(BASE)) ? p.slice(BASE.length) : p.replace(/^\/+/,'');
  return rel.replace(/^\/+/,'');
}

export function currentPage(){
  const p=relPath().split('?')[0].split('/')[0]||'home';
  return PAGES.includes(p)?p:'home';
}

/* Settore aziendale nell'indirizzo: /business/ristoranti → 'ristoranti'.
   Sta sotto /business perché è un approfondimento di quella pagina: il router
   mostra la pagina Business, che poi si riempie con il settore giusto. */
export function currentVerticale(){
  const seg=relPath().split('?')[0].split('/').filter(Boolean);
  return (seg[0]==='business' && seg[1] && /^[a-z0-9-]+$/.test(seg[1])) ? seg[1] : null;
}

/* Scheda del Lab nell'indirizzo: /materiali/legno → 'legno'.
   Stessa forma di currentVerticale(): la scheda è un approfondimento della
   sezione, non un ramo separato, così l'autorità della pagina resta una. */
export function currentScheda(sezione){
  const seg=relPath().split('?')[0].split('/').filter(Boolean);
  return (seg[0]===sezione && seg[1] && /^[a-z0-9-]+$/.test(seg[1])) ? seg[1] : null;
}

/* Estrai ?id=xxx dal pathname o dalla query string */
export function currentSearch(){
  /* Indirizzo a percorso: /product/7/ — è un file vero su disco, quindi
     GitHub Pages lo serve già scritto e i crawler che non eseguono
     JavaScript leggono il contenuto. Resta valido anche /product?id=7,
     perché è la forma finora condivisa e i link non devono morire. */
  const seg=relPath().split('?')[0].split('/').filter(Boolean);
  if(seg[0]==='product' && seg[1] && /^\d+$/.test(seg[1])) return seg[1];
  const params=new URLSearchParams(location.search||'');
  return params.get('id')||null;
}

let _leaveTimer=null;
const reduceMotion=()=>window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;

export function show(page){
  /* La barra deve dire dove ci si trova. `show()` è il solo punto da cui
     passa ogni cambio di pagina — clic, indirizzo diretto, indietro — ed è
     quindi l'unico posto in cui aggiornarlo una volta per tutte. */
  try{ dispatchEvent(new CustomEvent('ingly:pagina', { detail: { page } })) }catch(e){}

  const next=document.getElementById('page-'+page);
  if(!next) return;
  const cur=document.querySelector('.page.active');
  if(_leaveTimer){clearTimeout(_leaveTimer);_leaveTimer=null;
    document.querySelectorAll('.page.leaving').forEach(x=>x.classList.remove('leaving'));}

  const finish=()=>{
    document.querySelectorAll('.page').forEach(x=>x.classList.remove('active','leaving'));
    next.classList.add('active');
    document.querySelectorAll('.nav-links [data-nav]').forEach(a=>a.classList.toggle('active',a.dataset.nav===page));
    const fromMobileMenu=document.getElementById('mm')?.classList.contains('open');
    toggleMenu(false,{restoreFocus:false});
    document.body.classList.toggle('on-product',page==='product');
    /* Chi sceglie una pagina dal menu non deve restare con il focus
       su un link che è diventato inert dopo la navigazione. */
    if(fromMobileMenu){
      const heading=next.querySelector('h1,h2,[role="heading"]')||next;
      if(!heading.hasAttribute('tabindex'))heading.setAttribute('tabindex','-1');
      heading.focus({preventScroll:true});
    }
    window.scrollTo({top:0,behavior:'instant'});
    if(page==='shop')renderRV();
    updateSeo(page,L,T,page==='product'?currentProduct():null);
    /* Avviso, non chiamata diretta: main.js importa questo modulo, quindi
       importarlo di ritorno creerebbe un anello. */
    document.dispatchEvent(new CustomEvent('ingly:pagina',{detail:{pagina:page}}));
    observeAll();
  };

  if(cur&&cur!==next&&!reduceMotion()){
    cur.classList.add('leaving');
    _leaveTimer=setTimeout(()=>{_leaveTimer=null;finish();},180);
  } else {
    finish();
  }
}

export function go(page,search){
  /* gli indirizzi nascono sempre sotto la base: in produzione "/shop",
     in un'anteprima su GitHub Pages "/Il-sito-AI/shop" */
  const mId=page==='product'&&/^id=(\d+)$/.exec(search||'');
  const url=mId ? BASE+'product/'+mId[1]+'/' : BASE+(page==='home'?'':page)+(search?'?'+search:'');
  if(relPath().split('?')[0]===page&&!search){show(page);return;}
  history.pushState({page,search:search||null},'',(url));
  show(page);
}

export function goShop(cat){F.cat.clear();F.sub.clear();F.mat.clear();if(cat)F.cat.add(cat);renderChips();renderShop();go('shop')}
export function toggleMenu(open,{restoreFocus=true}={}){
  const menu=document.getElementById('mm');
  const trigger=document.querySelector('[data-action="menu-open"]');
  if(!menu)return;
  const wasOpen=menu.classList.contains('open');
  if(open) menu.removeAttribute('inert');
  menu.classList.toggle('open',!!open);
  menu.setAttribute('aria-hidden',String(!open));
  if(!open) menu.setAttribute('inert','');
  trigger?.setAttribute('aria-expanded',String(!!open));
  if(open&&!wasOpen){
    openFocusLayer(menu,{
      trigger,initialFocus:menu.querySelector('[data-action="menu-close"]'),
      onEscape:()=>toggleMenu(false)
    });
  }else if(!open&&wasOpen)closeFocusLayer(menu,{restore:restoreFocus});
}

export function initNav(){
  /* Cronologia, inclusa la navigazione su schede profonde. */
  addEventListener('popstate',()=>show(currentPage()));

  document.addEventListener('click',e=>{
    const a=e.target.closest('a[href]');
    const target=routeClickTarget(e,a,{
      base:BASE,baseURI:document.baseURI,origin:location.origin
    });
    if(!target)return;
    const seg=target.segments;
    const page=seg[0]||'home';

    /* I prodotti prerenderizzati hanno URL /product/7/ — non perdere l'ID
       convertendoli in /product senza query. */
    if(page==='product'&&seg[1]&&/^\d+$/.test(seg[1])&&seg.length===2){
      e.preventDefault();
      go('product','id='+seg[1]);
      return;
    }

    /* Sottopagine materiali, macchine e settori B2B: mantenere la route
       originale per cronologia, condivisione e aggiornamento del contenuto. */
    const scheda=['materiali','tecnologie','macchine','academy'].includes(page)||
      page==='business';
    if(scheda&&seg.length===2&&/^[a-z0-9-]+$/.test(seg[1])){
      e.preventDefault();
      const dest=target.path+(target.query?'?'+target.query:'');
      if(location.pathname+location.search!==dest)
        history.pushState({page},'',dest);
      show(page);
      return;
    }

    /* Nessun routing per path non riconosciuti: la navigazione resta nativa. */
    if(seg.length>1||!PAGES.includes(page))return;
    e.preventDefault();
    go(page,target.query||null);
  },true);
}
