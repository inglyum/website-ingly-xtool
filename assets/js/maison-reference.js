/* INGLY MAISON: actual HTML catalogue paths, bilingual rendering.
   Nonintrusive: existing product, language, navigation, Admin logic remains. */
(() => {
  const init=()=>{
    const host=document.getElementById('maisonWorlds');
    if(!host)return;
    const root=document.documentElement;
    const applyLanguage=()=>{
      const lang=root.lang==='en'?'en':'it';
      host.querySelectorAll('[data-maison-it][data-maison-en]').forEach(el=>{
        el.textContent=lang==='en'?el.dataset.maisonEn:el.dataset.maisonIt;
      });
    };
    applyLanguage();
    new MutationObserver(records=>{
      if(records.some(rec=>rec.attributeName==='lang'))applyLanguage();
    }).observe(root,{attributes:true,attributeFilter:['lang']});
    host.querySelectorAll('.maison-world img').forEach(img=>{
      img.addEventListener('error',()=>{img.closest('.maison-world')?.classList.add('maison-world--missing')},{once:true});
    });
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();