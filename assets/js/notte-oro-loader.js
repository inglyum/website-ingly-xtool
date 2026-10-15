/* INGLY: first-visit loader. Never hides content from search engines.
 * Progress reflects only the essential logo / visible hero / ready fonts,
 * not lazily loaded images of hidden routes. 1200-3000ms; skip any time.
 */
(() => {
  const boot=()=>{
    const overlay=document.getElementById('loader');
    if(!overlay)return;
    const fill=document.getElementById('atelierLoaderFill');
    const rail=overlay.querySelector('[role="progressbar"]');
    const percent=document.getElementById('atelierLoaderPercent');
    const caption=document.getElementById('ldrTxt');
    const skip=document.getElementById('atelierLoaderSkip');
    let seen=false;
    try{seen=sessionStorage.getItem('ingly_notte_oro_loaded')==='1'}catch(_){}
    if(seen){overlay.classList.remove('atelier-loading');overlay.classList.add('off');return}
    let done=false, progress=0;
    const started=performance.now();
    const prefersReduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    const minMs=prefersReduced?120:1200,maxMs=prefersReduced?500:2900;
    const messages=['Scaldiamo la luce','Scegliamo la materia','Incidiamo la tua idea'];
    const set=v=>{
      progress=Math.max(progress,Math.min(100,Math.round(v)));
      if(fill)fill.style.width=progress+'%';
      if(percent)percent.textContent=progress+'%';
      rail?.setAttribute('aria-valuenow',String(progress));
      if(caption)caption.textContent=messages[Math.min(2,Math.floor(progress/35))];
    };
    const close=()=>{
      if(done)return;
      done=true;set(100);
      overlay.classList.remove('atelier-loading');
      overlay.classList.add('atelier-exit','off');
      try{sessionStorage.setItem('ingly_notte_oro_loaded','1')}catch(_){}
      setTimeout(()=>{overlay.hidden=true},prefersReduced?100:480);
    };
    skip?.addEventListener('click',close,{once:true});
    const critical=[...document.querySelectorAll('.atelier-loader__seal img,#heroVisual img')];
    const imageDone=img=>new Promise(resolve=>{
      if(img.complete){resolve();return}
      img.addEventListener('load',resolve,{once:true});
      img.addEventListener('error',resolve,{once:true});
    });
    const assets=Promise.all(critical.map(imageDone));
    const fonts=document.fonts?.ready||Promise.resolve();
    Promise.allSettled([assets,fonts]).then(()=>{
      set(100);
      const elapsed=performance.now()-started;
      setTimeout(close,Math.max(0,minMs-elapsed));
    });
    const pulse=setInterval(()=>{
      if(done){clearInterval(pulse);return}
      const elapsed=performance.now()-started;
      set(Math.min(92,(elapsed/maxMs)*95));
    },100);
    setTimeout(close,maxMs);
    // Loader cannot trap navigation or focus while the app boots.
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden)close();
    },{once:true});
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
