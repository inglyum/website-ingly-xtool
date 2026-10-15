/* INGLY Signature Showcase 2026
 * True HTML/CSS storefront, never a flattened mockup.
 * CMS source: CONFIG.heroImage / CONFIG.slogan / CONFIG.showcaseBenefits.
 * All UI text is inserted with textContent, never untrusted innerHTML.
 */
(() => {
  const ICONS=['diamond','spark','shield','truck','gift'];
  const ALLOWED=new Set(['shop','personalizza','materiali','business','macchine','tecnologie','academy','demo','digital','faq','quote','about']);
  const init=()=>{
    const hero=document.querySelector('#page-home .signature-hero');
    if(!hero)return;
    const root=document.documentElement;
    const strip=hero.querySelector('.signature-benefits__inner');
    const defaults=strip?[...strip.querySelectorAll('.signature-benefit')]:[];
    const images={};
    for(let i=0;i<defaults.length;i++){
      const svg=defaults[i].querySelector('.signature-benefit__icon svg');
      if(svg)images[ICONS[i]]=svg.cloneNode(true);
    }
    const localized=()=>[...hero.querySelectorAll('[data-sig-it][data-sig-en]')];
    let configured=[];
    const sync=()=>{
      const en=root.lang==='en';
      for(const element of localized()){
        element.textContent=en?element.dataset.sigEn:element.dataset.sigIt;
      }
      if(strip&&configured.length){
        const count=configured.filter(x=>x&&typeof x==='object').length;
        strip.dataset.count=String(count);
      }
    };
    const textValue=(obj,lang,fallback)=>{
      if(typeof obj==='string')return obj.slice(0,125);
      return String(obj?.[lang]||obj?.it||fallback||'').slice(0,125);
    };
    const render=(items)=>{
      if(!strip||!Array.isArray(items))return;
      configured=items.slice(0,6).filter(item=>item&&typeof item==='object');
      const fragment=document.createDocumentFragment();
      for(let i=0;i<configured.length;i++){
        const item=configured[i];
        const route=String(item.url||'shop').replace(/^\/+|\/+$/g,'');
        const href=ALLOWED.has(route)?route:'shop';
        const a=document.createElement('a');
        a.className='signature-benefit';
        a.setAttribute('href',href);
        a.dataset.nav=href;
        const icon=document.createElement('span');icon.className='signature-benefit__icon';
        icon.append((images[item.icon]||images[ICONS[i%ICONS.length]]||document.createElement('span')).cloneNode(true));
        const words=document.createElement('span');words.className='signature-benefit__words';
        const title=document.createElement('strong');
        title.dataset.sigIt=textValue(item.title,'it','Personalizzazioni');
        title.dataset.sigEn=textValue(item.title,'en','Customization');
        const subtitle=document.createElement('small');
        subtitle.dataset.sigIt=textValue(item.subtitle,'it','');
        subtitle.dataset.sigEn=textValue(item.subtitle,'en','');
        words.append(title,subtitle);a.append(icon,words);fragment.append(a);
      }
      strip.replaceChildren(fragment);
      sync();
    };
    sync();
    if(window.INGLY?.CONFIG?.showcaseBenefits)render(window.INGLY.CONFIG.showcaseBenefits);
    window.addEventListener('ingly:site-data-ready',event=>{
      if(event.detail?.CONFIG?.showcaseBenefits)render(event.detail.CONFIG.showcaseBenefits);
    });
    new MutationObserver(changes=>{
      if(changes.some(change=>change.attributeName==='lang'))sync();
    }).observe(root,{attributes:true,attributeFilter:['lang']});
    if(window.matchMedia('(pointer:fine) and (prefers-reduced-motion:no-preference)').matches){
      let lastEvent=null,raf=0;
      hero.addEventListener('pointermove',event=>{
        lastEvent=event;
        if(raf)return;
        raf=requestAnimationFrame(()=>{
          raf=0;
          if(!lastEvent)return;
          const rect=hero.getBoundingClientRect();
          const x=Math.round((lastEvent.clientX-rect.left)/rect.width*100);
          const y=Math.round((lastEvent.clientY-rect.top)/rect.height*100);
          hero.style.setProperty('--signature-pointer-x',Math.max(0,Math.min(100,x))+'%');
          hero.style.setProperty('--signature-pointer-y',Math.max(0,Math.min(100,y))+'%');
        });
      },{passive:true});
    }
    const image=hero.querySelector('#heroVisual img');
    if(image)image.addEventListener('error',()=>{
      hero.classList.add('signature-hero--image-unavailable');
    },{once:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
