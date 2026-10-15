/* INGLY Signature Showcase — supports the real HTML/CSS hero.
 * No image generation, no flattened screenshot and no product/order mutations.
 * Keeps trust-strip copy aligned with the existing IT/EN language controls.
 */
(() => {
  const init=()=>{
    const hero=document.querySelector('#page-home .signature-hero');
    if(!hero) return;
    const root=document.documentElement;
    const localized=[...hero.querySelectorAll('[data-sig-it][data-sig-en]')];
    const sync=()=>{
      const lang=root.lang==='en'?'en':'it';
      for(const element of localized){
        element.textContent=lang==='en'?element.dataset.sigEn:element.dataset.sigIt;
      }
    };
    sync();
    const observer=new MutationObserver(records=>{
      if(records.some(m=>m.attributeName==='lang'))sync();
    });
    observer.observe(root,{attributes:true,attributeFilter:['lang']});
    // Subtle laser illumination follows pointer without changing page layout.
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
    // Broken CMS image fallback: keep the page accessible without blanking text.
    const image=hero.querySelector('#heroVisual img');
    if(image){
      image.addEventListener('error',()=>{
        hero.classList.add('signature-hero--image-unavailable');
      },{once:true});
    }
  };
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
