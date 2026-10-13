/* INGLY Admin — controlli dello sfondo fotografico.
   Script classico intenzionalmente separato dal monolite admin.html. */
(function(){
  'use strict';
  const DEFAULTS={enabled:false,url:'',position:'center center',overlayDark:48,overlayLight:64};
  const byId=id=>document.getElementById(id);
  let wired=false;

  function config(){
    if(typeof S==='undefined'||!S.CONFIG)return null;
    const old=S.CONFIG.visualBackground&&typeof S.CONFIG.visualBackground==='object'
      ?S.CONFIG.visualBackground:{};
    S.CONFIG.visualBackground=Object.assign({},DEFAULTS,old);
    return S.CONFIG.visualBackground;
  }
  function imageUrl(value){
    const raw=String(value||'').trim();
    if(!raw||/[\s"'\\()<>\u0000-\u001f]/.test(raw))return '';
    const local=/^(?:\.\/)?(?:img|assets\/images)\/[A-Za-z0-9][A-Za-z0-9/_\-.]*\.(?:webp|png|jpe?g|avif)$/i.test(raw)
      &&!raw.replace(/^\.\//,'').split('/').includes('..');
    const remote=/^https:\/\//i.test(raw);
    if(!local&&!remote)return '';
    try{
      const u=new URL(local?raw.replace(/^\.\//,''):raw,document.baseURI);
      return u.protocol==='https:'?u.href:'';
    }catch(e){return ''}
  }
  function num(id,fallback,max){
    const n=Number(byId(id).value);
    return Math.max(0,Math.min(max,Number.isFinite(n)?n:fallback));
  }
  function draw(value){
    const c=value||config();if(!c)return;
    const url=imageUrl(c.url);
    const dark=Math.max(0,Math.min(85,Number(c.overlayDark)||0))/100;
    const light=Math.max(0,Math.min(90,Number(c.overlayLight)||0))/100;
    const position=['center center','center top','center bottom','left center','right center'].includes(c.position)?c.position:'center center';
    const d=byId('bgPhotoPreviewDark'),l=byId('bgPhotoPreviewLight');
    if(d){
      d.style.backgroundColor='#0a0d18';
      d.style.backgroundPosition='center, '+position;
      d.style.backgroundSize='cover, cover';
      d.style.backgroundImage=url
        ?'linear-gradient(rgba(8,12,26,'+dark+'),rgba(8,12,26,'+dark+')),url("'+url+'")'
        :'radial-gradient(ellipse at 70% 0%,#23345f,#0a0d18)';
    }
    if(l){
      l.style.backgroundColor='#f4f6fb';
      l.style.backgroundPosition='center, '+position;
      l.style.backgroundSize='cover, cover';
      l.style.backgroundImage=url
        ?'linear-gradient(rgba(248,250,255,'+light+'),rgba(248,250,255,'+light+')),url("'+url+'")'
        :'radial-gradient(ellipse at 70% 0%,#ffffff,#e9edf5)';
    }
    const status=byId('bgPhotoStatus');
    if(status){
      if(c.enabled&&!url)status.textContent='Percorso non valido. Usa img/nome-file.webp, assets/images/nome-file.webp oppure un URL HTTPS.';
      else if(c.enabled)status.textContent='Sfondo fotografico attivo in bozza. Premi «Pubblica tutto» per applicarlo al sito.';
      else status.textContent='Sfondo fotografico disattivato: resta attiva l’ambientazione scelta sopra.';
    }
  }
  function sync(){
    const c=config();if(!c)return false;
    if(!wired){
      wired=true;
      const changed=()=>{
        const next=config();if(!next)return;
        next.enabled=byId('bgPhotoEnabled').checked;
        next.url=byId('bgPhotoUrl').value.trim();
        next.position=byId('bgPhotoPosition').value;
        next.overlayDark=num('bgPhotoDark',48,85);
        next.overlayLight=num('bgPhotoLight',64,90);
        if(typeof markDirty==='function')markDirty();
        draw(next);
      };
      ['bgPhotoEnabled','bgPhotoUrl','bgPhotoPosition','bgPhotoDark','bgPhotoLight'].forEach(id=>{
        const el=byId(id);if(!el)return;
        el.addEventListener(el.type==='checkbox'||el.tagName==='SELECT'?'change':'input',changed);
        if(el.type==='number')el.addEventListener('change',changed);
      });
      byId('bgPhotoLibrary')?.addEventListener('click',()=>{if(typeof go==='function')go('media')});
      byId('bgPhotoReset')?.addEventListener('click',()=>{
        const next=config();if(!next)return;
        next.enabled=false;
        byId('bgPhotoEnabled').checked=false;
        if(typeof markDirty==='function')markDirty();
        draw(next);
      });
    }
    byId('bgPhotoEnabled').checked=c.enabled===true;
    byId('bgPhotoUrl').value=c.url||'';
    byId('bgPhotoPosition').value=c.position||DEFAULTS.position;
    byId('bgPhotoDark').value=Number.isFinite(Number(c.overlayDark))?c.overlayDark:DEFAULTS.overlayDark;
    byId('bgPhotoLight').value=Number.isFinite(Number(c.overlayLight))?c.overlayLight:DEFAULTS.overlayLight;
    draw(c);
    return true;
  }
  document.addEventListener('click',event=>{
    if(event.target.closest('.nit[data-go="bg"],[data-vs-shortcut="bg"]'))setTimeout(sync,0);
  });
  /* Espone un punto di ingresso utile anche per futuri pulsanti dell'Admin. */
  window.INGLY_APPEARANCE_ADMIN={sync};
})();
