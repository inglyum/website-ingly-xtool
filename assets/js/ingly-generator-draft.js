/* INGLY Personalizza — explicit browser-local draft management.
 * Only dimension/text/select settings are saved, never uploads or credentials.
 * SVG preview/export stays owned by ingly-personalizza-studio.js. */
(() => {
  const KEY='ingly-personalizza-draft-v1';
  const ids={
    name:'inglyGeneratorName',w:'inglyGeneratorWidth',h:'inglyGeneratorHeight',
    material:'inglyGeneratorMaterial',shape:'inglyGeneratorShape',
    font:'inglyGeneratorFont',notes:'inglyGeneratorNotes'
  };
  const allowed={
    material:['wood','acrylic','metal'],
    shape:['rounded','ellipse','rectangle'],
    font:['josefin','serif','mono']
  };
  const defaults=Object.freeze({name:'Il tuo nome',w:180,h:65,material:'wood',shape:'rounded',font:'josefin',notes:''});
  const size=(x,min,max,fallback)=>{
    if(String(x).trim()==='')return fallback;
    const n=Number(x);
    return Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;
  };
  function validate(obj){
    if(!obj||typeof obj!=='object'||Array.isArray(obj))return null;
    const safe={...defaults};
    safe.name=String(obj.name??defaults.name).slice(0,28);
    safe.notes=String(obj.notes??'').slice(0,300).replace(/[\u0000-\u001f]/g,' ');
    safe.w=size(obj.w,50,500,180);
    safe.h=size(obj.h,25,250,65);
    for(const key of ['material','shape','font']){
      safe[key]=allowed[key].includes(obj[key])?obj[key]:defaults[key];
    }
    return safe;
  }
  window.INGLY_STUDIO_DRAFT=Object.freeze({validate,defaults,key:KEY});
  function init(){
    if(!document.getElementById('inglyParametric'))return;
    const get=k=>document.getElementById(ids[k]);
    const status=document.getElementById('inglyGeneratorStatus');
    const badge=document.getElementById('inglyGeneratorCompatibility');
    const isEnglish=()=>document.documentElement.lang==='en';
    const say=(it,en)=>{if(status)status.textContent=isEnglish()?en:it};
    const inputEvent=()=>new Event('input',{bubbles:true});
    const snapshot=()=>validate(Object.fromEntries(Object.keys(ids).map(key=>[key,get(key)?.value])));
    const use=values=>{
      for(const [k,id] of Object.entries(ids)){
        const el=document.getElementById(id);
        if(el)el.value=String(values[k]);
      }
      // Notify the already installed parametric renderer and preset UI.
      get('name')?.dispatchEvent(inputEvent());
      document.querySelectorAll('[data-ingly-preset]').forEach(button=>button.setAttribute('aria-pressed','false'));
      updateCompatibility();
    };
    function updateCompatibility(){
      if(!badge)return;
      const m=get('material')?.value;
      const en=isEnglish();
      const words={
        wood:['Legno — anteprima incisione. Controlla venature e spessore con il laboratorio.','Wood — engraving preview. Check grain and thickness with the workshop.'],
        acrylic:['Plexiglass — verifica colore, spessore e compatibilità prima del taglio.','Acrylic — confirm color, thickness and cut compatibility before production.'],
        metal:['Metallo — l’incisione dipende dalla tecnologia disponibile; chiedi fattibilità.','Metal — engraving depends on the available equipment; request feasibility review.']
      };
      badge.textContent=(words[m]||words.wood)[en?1:0];
    }
    const save=document.getElementById('inglyGeneratorSave');
    const restore=document.getElementById('inglyGeneratorRestore');
    const reset=document.getElementById('inglyGeneratorReset');
    save?.addEventListener('click',()=>{
      try{
        localStorage.setItem(KEY,JSON.stringify(snapshot()));
        say('Bozza salvata solo su questo dispositivo.','Draft saved on this device only.');
      }catch(_){
        say('Impossibile salvare la bozza nel browser.','Unable to save a draft in this browser.');
      }
    });
    restore?.addEventListener('click',()=>{
      try{
        const raw=localStorage.getItem(KEY);
        if(!raw){
          say('Nessuna bozza salvata su questo dispositivo.','No draft is saved on this device.');
          return;
        }
        const data=validate(JSON.parse(raw));
        if(!data)throw Error('Invalid draft');
        use(data);
        say('Bozza ripristinata. Controlla l’anteprima prima di esportare.','Draft restored. Review the preview before exporting.');
      }catch(_){
        say('Bozza non valida o non disponibile.','Draft is unavailable or invalid.');
      }
    });
    reset?.addEventListener('click',()=>{
      use(defaults);
      try{localStorage.removeItem(KEY)}catch(_){}
      say('Progetto azzerato e bozza locale cancellata.','Project reset and local draft cleared.');
    });
    get('material')?.addEventListener('input',updateCompatibility);
    updateCompatibility();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
