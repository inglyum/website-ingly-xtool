/* INGLY scroll sculpture: CSS-based 3D, no WebGL, no external requests.
   Existing editorial photo remains visible if initialization fails. */
(() => {
  const init=()=>{
    const hero=document.querySelector('#page-home .hero.signature-hero');
    const object=document.getElementById('inglyHeroSculptureStage');
    if(!hero||!object)return;
    const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches||false;
    const mobile=window.matchMedia?.('(max-width: 650px)').matches||false;
    if(!window.CSS?.supports?.('transform-style','preserve-3d'))return;
    hero.classList.add('ingly-hero-3d-ready');
    if(reduced||mobile)return; // accessible and low-cost static hero fallback
    let raf=0;
    const update=()=>{
      raf=0;
      const bounds=hero.getBoundingClientRect();
      if(bounds.bottom<0||bounds.top>window.innerHeight)return;
      const distance=Math.max(1,bounds.height);
      // Only the visible portion of the hero drives movement; no perpetual animation.
      const p=Math.min(1,Math.max(0,-bounds.top/distance));
      object.style.setProperty('--ingly-hero-turn',(p*68).toFixed(2)+'deg');
      object.style.setProperty('--ingly-hero-tilt',(p*17).toFixed(2)+'deg');
    };
    const queue=()=>{
      if(!raf)raf=window.requestAnimationFrame(update);
    };
    window.addEventListener('scroll',queue,{passive:true});
    window.addEventListener('resize',queue,{passive:true});
    document.addEventListener('visibilitychange',()=>{if(!document.hidden)queue()});
    queue();
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
