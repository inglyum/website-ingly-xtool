/* ============ APP BOOTSTRAP ============
   Carica i dati (JSON con versioning) e poi avvia il sito. */
window.__INGLY_ESM__ = true;
import { loadData } from './data-loader.js';
import { modalita, manutenzione } from './stato-sito.js';

/* AUTO-RIPARAZIONE — il sito non deve MAI restare bloccato su una schermata di errore.
   Causa storica: una cache del service worker che continuava a servire moduli JS
   vecchi. I dati arrivavano nuovi, il codice restava vecchio, il boot falliva e
   l'utente vedeva "Impossibile caricare i dati del sito" per sempre.
   Qui, al primo fallimento, svuotiamo cache + service worker e ricarichiamo una
   sola volta. Il flag in sessionStorage impedisce qualsiasi ciclo di reload. */
const RECOVER_KEY = 'ingly_recover';

async function selfHeal(){
  if(sessionStorage.getItem(RECOVER_KEY)) return false;   // già tentato: non riprovare
  sessionStorage.setItem(RECOVER_KEY,'1');
  try{
    if('serviceWorker' in navigator){
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r=>r.unregister()));
    }
    if(window.caches){
      const keys = await caches.keys();
      await Promise.all(keys.map(k=>caches.delete(k)));
    }
  }catch(e){ console.warn('[INGLY] selfHeal:',e) }
  return true;
}

loadData().then(D=>{
  /* La manutenzione si decide QUI, con i dati del sito in mano: se è
     accesa il sito non parte proprio. Prima la decideva uno script a parte
     che leggeva config.json per conto suo, e il risultato era un velo
     sopra un sito che sotto continuava a caricare il catalogo. */
  if(modalita(D)==='ferma'){
    const m=manutenzione(D, (navigator.language||'it').startsWith('it')?'it':'en');
    const ov=document.getElementById('maintenanceOverlay');
    if(ov){
      const t=document.getElementById('mntTitle'); if(t) t.textContent=m.titolo;
      const g=document.getElementById('mntMsg'); if(g) g.textContent=m.messaggio;
      const w=document.getElementById('mntWa'); if(w&&!m.whatsapp) w.style.display='none';
      ov.hidden=false; ov.style.display='flex';
    }
    const main=document.querySelector('main'); if(main) main.hidden=true;
    const ldr=document.getElementById('loader'); if(ldr) ldr.classList.add('off');
    document.body.style.overflow='hidden';
    return null;                       /* il sito non si avvia */
  }
  return import('./main.js');
}).then(()=>{
  /* boot riuscito: la prossima anomalia potrà di nuovo tentare la riparazione */
  try{ sessionStorage.removeItem(RECOVER_KEY) }catch(e){}
}).catch(async err=>{
  console.error(err);
  if(await selfHeal()){ location.reload(); return; }
  const l=document.getElementById('loader');
  if(l) l.innerHTML='<div class="lin"><span style="font-family:sans-serif;color:#9aa3c7;max-width:420px;text-align:center;line-height:1.6">⚠️ Impossibile caricare i dati del sito.<br>'+ (err&&err.message||'') +'</span></div>';
});
