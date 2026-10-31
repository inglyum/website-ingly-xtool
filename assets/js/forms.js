/* ============ FORMS (modulo) ============
   Preventivo e newsletter: invio REALE all'email di INGLY.
   - Formspree, se nell'Admin è configurato un ID (resta supportato);
   - altrimenti FormSubmit (formsubmit.co): gratuito, senza account, accetta
     allegati (~10 MB) e manda la richiesta all'email indicata in Admin →
     Contatti → Moduli (di serie l'email del sito). La prima richiesta fa
     arrivare a quell'email un messaggio di attivazione da confermare una volta.
   L'invio FormSubmit è un normale invio di modulo (multipart, così viaggiano
   anche i file); il servizio riporta il visitatore sul sito con ?inviato=1,
   dove compare la conferma. Nessuna chiave segreta nel sito: l'indirizzo è
   pubblico, e si può sostituire con il codice anonimo che FormSubmit fornisce. */
import { $, T, toast, L } from './utils.js';
import { quoteFallback } from './quote-lead-fallback.js';
const { D, CONFIG } = window.INGLY;

export function renderUrg(){
  $('urgRow').innerHTML=D[L].urg.map((u,i)=>`<button type="button" class="pill ${i===0?'on':''}" data-action="pill">${u}</button>`).join('');
}

const endpoint = k => {
  const id=((CONFIG.moduli||{})[k]||'').trim();
  if(!id) return null;
  return id.startsWith('http') ? id : 'https://formspree.io/f/'+id;
};

/* destinatario FormSubmit. Ordine: codice segreto (Admin → Contatti →
   Moduli, lo dà FormSubmit dopo l'attivazione e nasconde l'indirizzo),
   poi email dei moduli, poi email del sito. */
const MAX_ALLEGATI = 10 * 1024 * 1024;
const RE_EMAIL = /^[^\s@<>"']+@[^\s@<>"']+\.[a-z]{2,}$/i;
const RE_CODICE = /^[A-Za-z0-9]{16,64}$/;
export function destinatarioFormSubmit(cfg = CONFIG){
  const m = (cfg && cfg.moduli) || {};
  const codice = String(m.codice || '').trim();
  if(RE_CODICE.test(codice)) return codice;
  const d = String(m.email || (cfg && cfg.email) || '').trim();
  if(RE_EMAIL.test(d) || RE_CODICE.test(d)) return d;
  return '';
}

/* Risposta automatica al cliente (campo _autoresponse di FormSubmit).
   FormSubmit la manda solo se la verifica «non sono un robot» resta attiva:
   con la risposta accesa non si invia _captcha=false. Testo dall'Admin
   (moduli.rispostaAuto), altrimenti quello di serie in texts.json. */
export function rispostaAutomatica(cfg = CONFIG, tipo = 'preventivo', lingua = L, testoDiSerie = ''){
  const r = ((cfg && cfg.moduli) || {}).rispostaAuto || {};
  if(r.attiva === false || r.attiva === 'false') return '';
  const t = r[tipo];
  const scelto = (t && typeof t === 'object') ? (t[lingua] || t.it || '') : (t || '');
  return String(scelto || testoDiSerie || '').trim().slice(0, 1500);
}

/* Dopo l'invio: un pulsante per mandare la stessa richiesta su WhatsApp.
   Il riepilogo (solo testo, mai i file) resta 30 minuti in sessionStorage,
   perché FormSubmit riporta il visitatore sul sito con una pagina nuova. */
const CHIAVE_RIEPILOGO = 'ingly_ultima_richiesta';
export function numeroWhatsApp(cfg = CONFIG){
  return String((cfg && cfg.whatsappFab && cfg.whatsappFab.numero) || (cfg && cfg.whatsapp) || '').replace(/\D/g, '');
}
export function testoWhatsApp(r = {}, t = T){
  const righe = [t('qWaIntro')];
  const add = (k, v) => { const x = String(v || '').trim(); if(x) righe.push(t(k) + ': ' + x); };
  add('qWaNome', r.nome); add('qWaRichiesta', String(r.descrizione || '').slice(0, 600));
  add('qWaMateriale', r.materiale); add('qWaQuantita', r.quantita);
  return righe.join('\n');
}
function salvaRiepilogo(form){
  try{
    const v = n => { const el = form.querySelector('[name="'+n+'"]'); return el && !el.disabled ? el.value : ''; };
    sessionStorage.setItem(CHIAVE_RIEPILOGO, JSON.stringify({ nome:v('nome'), descrizione:v('descrizione'), materiale:v('materiale'), quantita:v('quantita'), t:Date.now() }));
  }catch(e){}
}
function leggiRiepilogo(){
  try{
    const r = JSON.parse(sessionStorage.getItem(CHIAVE_RIEPILOGO) || 'null');
    sessionStorage.removeItem(CHIAVE_RIEPILOGO);
    return r && Date.now() - r.t < 30 * 60 * 1000 ? r : null;
  }catch(e){ return null; }
}
function mostraConferma(form, quale, riepilogo){
  if(!form || form.parentElement.querySelector('.q-inviato')) return;
  const box = document.createElement('div');
  box.className = 'q-inviato'; box.setAttribute('role','status');
  const p = document.createElement('p'); p.textContent = '✔ ' + T(quale); box.appendChild(p);
  const num = numeroWhatsApp();
  if(riepilogo && num){
    const a = document.createElement('a');
    a.className = 'btn q-inviato__wa';
    a.href = 'https://wa.me/' + num + '?text=' + encodeURIComponent(testoWhatsApp(riepilogo));
    a.target = '_blank'; a.rel = 'noopener';
    a.textContent = T('qWaBtn');
    box.appendChild(a);
  }
  form.parentElement.insertBefore(box, form);
}

function campoNascosto(form, nome, valore){
  let el = form.querySelector('input[type="hidden"][name="'+nome+'"]');
  if(!el){ el = document.createElement('input'); el.type = 'hidden'; el.name = nome; form.appendChild(el); }
  el.value = valore;
}
function pesoAllegati(form){
  let tot = 0;
  form.querySelectorAll('input[type="file"]').forEach(i => [...(i.files || [])].forEach(f => { tot += f.size; }));
  return tot;
}

async function send(form, key, okMsg, oggetto, options={}){
  /* trappola anti-spam: un campo invisibile che solo i robot compilano */
  const honey = form.querySelector('[name="_honey"]');
  if(honey && honey.value){ toast(okMsg); form.reset(); return; }
  if(pesoAllegati(form) > MAX_ALLEGATI){ toast(T('qfFileTroppo')); return; }

  const url=endpoint(key);
  if(!url){
    const dest = destinatarioFormSubmit();
    if(dest){
      /* FormSubmit: invio classico, con ritorno sul sito e conferma */
      const btn=form.querySelector('button[type="submit"],button:not([type])');
      if(btn){ btn.disabled=true; btn.textContent=T('formsInvio'); }
      const ritorno = new URL(location.href);
      ritorno.searchParams.set(options.quote ? 'inviato' : 'iscritto', '1');
      ritorno.hash = '';
      campoNascosto(form, '_subject', oggetto || (options.quote ? 'INGLY — nuova richiesta di preventivo' : 'INGLY — nuova iscrizione alla newsletter'));
      campoNascosto(form, '_template', 'table');
      const risposta = rispostaAutomatica(CONFIG, options.quote ? 'preventivo' : 'newsletter', L, T(options.quote ? 'qAutoRisposta' : 'nlAutoRisposta'));
      form.querySelectorAll('input[type="hidden"][name="_captcha"],input[type="hidden"][name="_autoresponse"]').forEach(el => el.remove());
      if(risposta) campoNascosto(form, '_autoresponse', risposta);
      else campoNascosto(form, '_captcha', 'false');
      if(options.quote) salvaRiepilogo(form);
      campoNascosto(form, '_next', ritorno.href);
      campoNascosto(form, '_url', location.href);
      form.method = 'POST';
      form.enctype = 'multipart/form-data';
      form.action = 'https://formsubmit.co/' + encodeURIComponent(dest);
      HTMLFormElement.prototype.submit.call(form);
      return;
    }
    if(options.quote){quoteFallback(form,CONFIG,{business:!!options.business,language:L});return}
    toast(T('formsOff'));return;
  }
  const btn=form.querySelector('button[type="submit"],button:not([type])');
  const label=btn?btn.textContent:'';
  if(btn){ btn.disabled=true; btn.textContent='…' }
  try{
    const data=new FormData(form);
    data.delete('_honey');
    data.append('_subject', oggetto || 'INGLY — nuova richiesta dal sito');
    const r=await fetch(url,{method:'POST',body:data,headers:{Accept:'application/json'}});
    if(!r.ok) throw 0;
    form.querySelector('[data-ingly-quote-fallback]')?.remove();
    toast(okMsg);
    if(options.quote){ salvaRiepilogo(form); mostraConferma(form, 'qOk', leggiRiepilogo()); }
    form.reset();
  }catch(e){
    if(options.quote)quoteFallback(form,CONFIG,{business:!!options.business,language:L});
    else toast(T('formsErr'));
  }
  if(btn){ btn.disabled=false; btn.textContent=label }
}

/* Ritorno da FormSubmit: conferma visibile e indirizzo ripulito */
function confermaRitorno(){
  const q = new URLSearchParams(location.search);
  const quale = q.get('inviato') === '1' ? 'qOkInviato' : (q.get('iscritto') === '1' ? 'nlOkInviato' : '');
  if(!quale) return;
  toast(T(quale));
  if(quale === 'qOkInviato') mostraConferma(document.querySelector('form.quote-form'), quale, leggiRiepilogo());
  q.delete('inviato'); q.delete('iscritto');
  const pulito = location.pathname + (q.toString() ? '?' + q : '') + location.hash;
  try{ history.replaceState(history.state, '', pulito); }catch(e){}
}

/* BREVO: tolto dal sito pubblico. Usava CONFIG.brevo.apiKey, cioè una chiave
   letta da data/config.json, un file che chiunque può scaricare: una chiave
   Brevo dà accesso completo all'account. Nessuna chiave è mai stata
   pubblicata (verificato su tutta la storia), ma bastava compilare il campo
   nell'Admin e premere «Pubblica». Per collegare Brevo senza chiavi: un suo
   modulo d'iscrizione pubblico, oppure Formspree → Brevo. */

/* ===== PREVENTIVO: privato o azienda =====
   Un ristorante che chiede 200 menu QR e un privato che vuole una targa non
   compilano lo stesso modulo. Qui si cambia la faccia del form senza cambiare
   pagina, e — punto importante — i campi nascosti vengono DISATTIVATI:
   un campo con display:none resta comunque nel FormData e arriva vuoto nella
   mail, e resta raggiungibile con il tasto Tab da chi naviga da tastiera.
   Disattivandolo sparisce da entrambi. */
export function initModoPreventivo(form){
  const bottoni=document.querySelectorAll('[data-qmode]');
  if(!bottoni.length) return;

  const applica=modo=>{
    form.dataset.modo=modo;
    const tipo=form.querySelector('#qTipo');
    if(tipo) tipo.value = modo==='azienda' ? 'Azienda' : 'Privato';

    bottoni.forEach(b=>{
      const attivo=b.dataset.qmode===modo;
      b.classList.toggle('on',attivo);
      b.setAttribute('aria-selected',String(attivo));
    });
    /* campi fuori scena: né inviati né raggiungibili */
    form.querySelectorAll('.q-az, .q-priv').forEach(box=>{
      const suo = box.classList.contains(modo==='azienda' ? 'q-az' : 'q-priv');
      box.querySelectorAll('input,select,textarea').forEach(el=>{ el.disabled=!suo });
    });
    /* la ragione sociale è obbligatoria solo per le aziende */
    const rag=form.querySelector('#cri');
    if(rag) rag.required = modo==='azienda';
    try{ localStorage.setItem('ingly_qmodo',modo) }catch(e){}
  };

  bottoni.forEach(b=>b.addEventListener('click',()=>applica(b.dataset.qmode)));

  /* Chi arriva dai pulsanti della pagina Business è un'azienda. Il router usa
     pushState, che non emette popstate: intercettare il clic è più diretto —
     e più solido — che spiare l'indirizzo dopo il cambio pagina. */
  document.addEventListener('click',e=>{
    const el=e.target.closest && e.target.closest('[data-search]');
    if(el && /tipo=azienda/.test(el.dataset.search||'')) applica('azienda');
  });

  /* chi è già venuto come azienda lo ritrova come l'aveva lasciato */
  let iniziale='privato';
  try{ if(localStorage.getItem('ingly_qmodo')==='azienda') iniziale='azienda' }catch(e){}
  /* arrivando dalla pagina Business la richiesta è quasi certamente aziendale */
  if(/[?&]tipo=azienda\b/.test(location.search)) iniziale='azienda';
  applica(iniziale);
}

export function initForms(){
  confermaRitorno();
  document.querySelectorAll('form.nform').forEach(f=>f.addEventListener('submit',async e=>{
    e.preventDefault();
    const email=(f.querySelector('[type=email]')||{}).value||'';
    /* legge segmento dal data attribute del form (es. data-segment="b2b") */
    const segment=f.dataset.segment||'prospect';
    send(f,'formspreeNewsletter',T('nlOk'));
  }));
  const q=document.querySelector('form.quote-form');
  if(q){
    initModoPreventivo(q);
    q.addEventListener('submit',e=>{
      e.preventDefault();
      const urg=document.querySelector('#urgRow .pill.on');
      if(urg && !q.querySelector('[name="urgenza"]')){
        const h=document.createElement('input'); h.type='hidden'; h.name='urgenza'; h.value=urg.textContent; q.appendChild(h);
      }
      /* Le richieste delle aziende vanno in una casella loro: hanno tempi,
         linguaggio e priorità diversi, e mescolarle a quelle dei privati
         significa perderle in mezzo. Se la casella dedicata non è ancora
         configurata si usa quella generale — meglio una richiesta nel posto
         sbagliato che una richiesta persa. */
      const azienda = q.dataset.modo === 'azienda';
      const chiave = azienda && endpoint('formspreePreventivoB2B')
        ? 'formspreePreventivoB2B' : 'formspreePreventivo';
      send(q, chiave, T('qOk'), azienda ? 'INGLY — richiesta AZIENDA dal sito' : null,{quote:true,business:azienda});
    });
  }
}
