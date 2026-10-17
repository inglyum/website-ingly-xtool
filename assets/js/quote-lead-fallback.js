/* INGLY / quote contact fallback. No network operations and no fake submissions.
 * If Formspree is unavailable, the visitor explicitly chooses whether to
 * open a prepared WhatsApp or email message. Nothing is sent automatically. */
const skip=/^(?:_.*|password|token|api.?key|captcha|g-recaptcha-response|honeypot|website)$/i;
function linesFromForm(form){
  const data=new FormData(form),lines=[];
  for(const [k,value] of data){
    if(skip.test(k)||value instanceof File)continue;
    const text=String(value||'').trim().replace(/[\r\n]+/g,' ').slice(0,350);
    if(text)lines.push(String(k).slice(0,55)+': '+text);
  }
  return lines;
}
export function quoteMessage(form,{business=false,language='it'}={}){
  const intro=language==='en'?'INGLY DESIGN – request for a quotation':'INGLY DESIGN – richiesta preventivo';
  const what=business?(language==='en'?'Business':'Azienda'):(language==='en'?'Private':'Privato');
  const details=linesFromForm(form).join('\n').slice(0,1550);
  return [intro,what,details].filter(Boolean).join('\n');
}
export function verifiedWhatsApp(url,message){
  try{
    const source=new URL(String(url||''));
    if(source.protocol!=='https:'||source.hostname!=='wa.me'||source.port||source.username||source.password)return '';
    const phone=source.pathname.replace(/^\/+/,'');
    if(!/^\d{8,15}$/.test(phone))return '';
    return 'https://wa.me/'+phone+'?text='+encodeURIComponent(message);
  }catch(_){return ''}
}
export function verifiedMailto(email,message){
  const addr=String(email||'').trim();
  if(!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(addr))return '';
  const body=encodeURIComponent(message),subject=encodeURIComponent('INGLY DESIGN – richiesta preventivo');
  return 'mailto:'+addr+'?subject='+subject+'&body='+body;
}
export function quoteFallback(form,config={},options={}){
  if(!form||!form.ownerDocument)return false;
  const L=options.language==='en'?'en':'it';
  const text=(it,en)=>L==='en'?en:it;
  const message=quoteMessage(form,options);
  const url=verifiedWhatsApp(config.whatsapp,message);
  const mail=url?'':verifiedMailto(config.email,message);
  let panel=form.querySelector('[data-ingly-quote-fallback]');
  if(!panel){
    panel=form.ownerDocument.createElement('div');
    panel.dataset.inglyQuoteFallback='';
    panel.className='ingly-quote-fallback';panel.setAttribute('role','status');
    panel.setAttribute('aria-live','polite');
    form.append(panel);
  }
  panel.replaceChildren();
  const title=form.ownerDocument.createElement('strong');
  title.textContent=text('Non abbiamo ancora ricevuto la richiesta.','Your request has not been received yet.');
  const hint=form.ownerDocument.createElement('p');
  hint.textContent=text(
    'Il modulo non è disponibile al momento. Puoi continuare con un messaggio precompilato: controlla i dati e premi Invia nell’app scelta. Non trasmettiamo automaticamente i dati.',
    'The form is currently unavailable. Continue using a pre-filled message: review its contents and press Send in the selected app. Nothing is sent automatically.');
  panel.append(title,hint);
  if(url||mail){
    const link=form.ownerDocument.createElement('a');
    link.className='btn btn-primary ingly-quote-fallback__link';
    link.href=url||mail;
    link.textContent=url?text('Continua su WhatsApp ↗','Continue on WhatsApp ↗'):text('Continua via email ↗','Continue by email ↗');
    if(url){link.target='_blank';link.rel='noopener noreferrer'}
    panel.append(link);
  }else{
    const warning=form.ownerDocument.createElement('p');
    warning.textContent=text('Nessun recapito valido configurato. Contatta INGLY dalla pagina Contatti.',
      'No valid contact destination has been configured. Please use the Contact page.');
    panel.append(warning);
  }
  panel.scrollIntoView?.({block:'nearest',behavior:'smooth'});
  return !!(url||mail);
}
