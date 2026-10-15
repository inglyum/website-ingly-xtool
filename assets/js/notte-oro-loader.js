/* INGLY — user-supplied loader, adapted from ingly-loader (3).html.
 * Original behavior: dual opening curtains, diagonal engraving mask,
 * real logo, laser beam / bounded sparks, character reveal, progress, Skip.
 * Config comes from the same data/config.json that the Admin publishes.
 * The website and the CMS always share a single source of truth.
 */
(function () {
  'use strict';
  const SESSION_KEY='ingly_loader_seen_v3';
  const DEFAULT={
    enabled:true,theme:'auto',minMs:2000,maxMs:3600,oncePerSession:true,
    headline:{it:'Ispiriamo la creazione.',en:'We inspire creation.'},
    messages:{
      it:'Accendo il laser\nScelgo il materiale\nIncido la tua idea',
      en:'Igniting the laser\nChoosing the material\nEngraving your idea'
    }
  };
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,Number(v)||a));
  const language=()=>document.documentElement.lang==='en'?'en':'it';
  const forcePreview=()=>{
    try{return new URLSearchParams(location.search).has('loaderPreview')}catch(_){return false}
  };
  const hasSeen=()=>{
    try{return sessionStorage.getItem(SESSION_KEY)==='1'}catch(_){return false}
  };
  const remember=()=>{
    try{sessionStorage.setItem(SESSION_KEY,'1')}catch(_){}
  };
  const onReady=()=>{
    const overlay=document.getElementById('loader');
    if(!overlay||!overlay.classList.contains('ingly-custom-loader'))return;
    const root=document.documentElement;
    const badge=document.getElementById('inglyLoaderBadge');
    const beam=document.getElementById('inglyLoaderBeam');
    const cv=document.getElementById('inglyLoaderSparks');
    const cx=cv&&cv.getContext&&cv.getContext('2d');
    const fill=document.getElementById('atelierLoaderFill');
    const rail=document.getElementById('inglyLoaderTrack');
    const pct=document.getElementById('atelierLoaderPercent');
    const msg=document.getElementById('ldrTxt');
    const heading=document.getElementById('inglyLoaderHeadline');
    const skip=document.getElementById('atelierLoaderSkip');
    if(!badge||!fill||!rail||!pct||!msg||!heading||!skip)return;
    const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
    const override=forcePreview();
    let options={...DEFAULT},disposed=false,finished=false,progress=0,appReady=!!window.__INGLY_PRONTO;
    let minMs=DEFAULT.minMs,maxMs=DEFAULT.maxMs,chars=[];
    let start=performance.now(),frameId=0,frameTimer=0,msgTimer=0,finalTimer=0;
    const dpr=Math.min(2,window.devicePixelRatio||1);
    const th=61.4*Math.PI/180,dx=Math.sin(th),dy=-Math.cos(th);
    const particles=[];
    const markTheme=()=>{
      let theme=options.theme;
      if(theme!=='dark'&&theme!=='light')
        theme=root.getAttribute('data-mode')==='light'?'light':'dark';
      overlay.dataset.theme=theme;
    };
    const splitMsgs=()=>{
      const x=options.messages;
      const raw=typeof x==='string'?x:(x&&typeof x==='object'?(x[language()]||x.it):'');
      return String(raw||DEFAULT.messages[language()]).split(/\r?\n/)
        .map(s=>s.trim()).filter(Boolean).slice(0,10);
    };
    let messages=splitMsgs(),msgIndex=0;
    const displayMessages=()=>{
      messages=splitMsgs();msgIndex=0;
      msg.textContent=messages[0]||'Accendo il laser';
    };
    const buildHeading=()=>{
      const x=options.headline;
      const str=(typeof x==='string'?x:(x&&typeof x==='object'?(x[language()]||x.it):''))||DEFAULT.headline[language()];
      const text=String(str).slice(0,100);
      heading.textContent='';
      heading.setAttribute('aria-label',text);
      chars=[];
      for(const c of Array.from(text)){
        const letter=document.createElement('span');
        letter.textContent=c===' '?'\u00a0':c;
        heading.appendChild(letter);chars.push(letter);
      }
    };
    const stop=()=>{
      if(frameId)cancelAnimationFrame(frameId);
      if(frameTimer)clearTimeout(frameTimer);
      if(msgTimer)clearInterval(msgTimer);
      if(finalTimer)clearTimeout(finalTimer);
      window.removeEventListener('resize',resize);
      window.removeEventListener('ingly:site-data-ready',onData);
      window.removeEventListener('ingly:loader-maintenance',onMaintenance);
      document.removeEventListener('visibilitychange',onHidden);
      disposed=true;
    };
    const immediate=()=>{
      if(disposed)return;
      stop();
      overlay.classList.add('ingly-loader-finished','off','gone');
      overlay.hidden=true;
      root.classList.remove('ingly-loader-lock');
    };
    const finish=(rememberSession=true)=>{
      if(disposed||finished)return;
      finished=true;
      if(rememberSession&&options.oncePerSession!==false&&!override)remember();
      progress=1;
      fill.style.width='100%';pct.textContent='100%';
      rail.setAttribute('aria-valuenow','100');
      badge.style.setProperty('--p','101%');
      chars.forEach(s=>s.classList.add('on'));
      if(beam)beam.style.opacity='0';
      stop();
      overlay.classList.add('ingly-loader-finished');
      root.classList.remove('ingly-loader-lock');
      const delay=reduce?0:240;
      setTimeout(()=>{
        overlay.classList.add('out');
        setTimeout(()=>{
          overlay.classList.add('gone','off');
          overlay.hidden=true;
          document.dispatchEvent(new Event('ingly:ready'));
        },reduce?280:1000);
      },delay);
    };
    const onMaintenance=()=>immediate();
    const onHidden=()=>{if(document.hidden)finish()};
    const onData=e=>{
      const config=e?.detail?.CONFIG||window.INGLY?.CONFIG||{};
      options={...DEFAULT,...(config.loader||{})};
      minMs=clamp(options.minMs,500,4500);
      maxMs=clamp(options.maxMs,minMs,5500);
      if(options.enabled===false&&!override){immediate();return}
      markTheme();displayMessages();buildHeading();
      if(!override&&options.oncePerSession!==false&&hasSeen()){immediate();return}
    };
    function resize(){
      if(!cx||!cv)return;
      const w=cv.clientWidth,h=cv.clientHeight;
      cv.width=Math.max(1,Math.round(w*dpr));
      cv.height=Math.max(1,Math.round(h*dpr));
      cx.setTransform(dpr,0,0,dpr,0,0);
    }
    const spawn=(x,y)=>{
      if(!cx)return;
      for(let i=0;i<2;i++){
        const a=Math.random()*Math.PI*2,v=.6+Math.random()*1.6;
        particles.push({x,y,vx:Math.cos(a)*v+dx*.8,
          vy:Math.sin(a)*v+dy*.8-.2,l:1,d:.025+Math.random()*.03,
          r:.6+Math.random()*1.2,k:Math.random()<.25});
      }
      if(particles.length>90)particles.splice(0,particles.length-90);
    };
    const draw=()=>{
      if(!cx||!cv)return;
      cx.clearRect(0,0,cv.clientWidth,cv.clientHeight);
      for(let i=particles.length-1;i>=0;i--){
        const p=particles[i];
        p.x+=p.vx;p.y+=p.vy;p.vy+=.03;p.l-=p.d;
        if(p.l<=0){particles.splice(i,1);continue}
        cx.globalAlpha=p.l;
        cx.fillStyle=p.k?'#211f2e':p.l>.5?'#f0cf93':'#e0b06a';
        cx.shadowColor='#e0b06a';cx.shadowBlur=p.k?0:6;
        cx.beginPath();cx.arc(p.x,p.y,p.r,0,Math.PI*2);cx.fill();
      }
      cx.globalAlpha=1;cx.shadowBlur=0;
    };
    let complete=0;
    const assets=[...document.querySelectorAll('.ingly-loader-logo,#heroVisual img')];
    const imgs=assets.filter((img,i,a)=>a.indexOf(img)===i);
    const waitImage=img=>new Promise(resolve=>{
      if(img.complete){resolve();return}
      img.addEventListener('load',resolve,{once:true});
      img.addEventListener('error',resolve,{once:true});
    });
    for(const item of imgs)waitImage(item).then(()=>complete++);
    Promise.resolve(document.fonts?.ready).then(()=>complete++);
    const total=Math.max(1,imgs.length+1);
    const step=now=>{
      if(disposed||finished)return;
      const elapsed=now-start;
      if(window.__INGLY_PRONTO)appReady=true;
      const assetPart=Math.min(1,complete/total);
      const readiness=assetPart*.68+(appReady?.32:0);
      const softTarget=appReady&&assetPart>.99?1:Math.min(.94,Math.max(readiness,elapsed/maxMs*.85));
      const pace=Math.min(1,elapsed/minMs);
      const target=Math.min(softTarget,pace);
      progress+=Math.max(0,target-progress)*.115;
      if(appReady&&elapsed>=minMs&&progress>=.98)progress=1;
      const p=Math.min(1,progress);
      fill.style.width=(p*100)+'%';
      pct.textContent=String(Math.round(p*100)).padStart(3,'0')+'%';
      rail.setAttribute('aria-valuenow',String(Math.round(p*100)));
      const shown=Math.floor(Math.max(0,Math.min(1,(p-.25)/.62))*chars.length);
      chars.forEach((letter,i)=>letter.classList.toggle('on',i<shown));
      badge.style.setProperty('--glow',Math.min(1,p*2.2));
      if(!reduce){
        const S=badge.clientWidth,len=S*(Math.abs(dx)+Math.abs(dy));
        const t=(p-.5)*len;
        badge.style.setProperty('--p',(p*100)+'%');
        const ex=S/2+t*dx,ey=S/2+t*dy;
        if(beam){
          beam.style.transform='translate('+ex+'px,'+ey+'px) translate(-50%,-50%) rotate(151.4deg)';
          const inside=Math.abs(t)<S*.46&&p>.01&&p<.985;
          beam.style.opacity=inside?'1':'0';
          if(inside){
            const off=S*.15,half=Math.sqrt(Math.max(0,(S*.46)**2-t*t));
            const u=(Math.random()*2-1)*half;
            spawn(off+ex+u*(-dy),off+ey+u*dx);
          }
        }
        draw();
      }else badge.style.setProperty('--p','101%');
      if((appReady&&assetPart>.99&&elapsed>=minMs&&p>=.985)||elapsed>=maxMs){
        finish();return;
      }
      frameId=requestAnimationFrame(step);
    };
    if(!override&&hasSeen()){immediate();return}
    if(window.INGLY?.CONFIG)onData({detail:{CONFIG:window.INGLY.CONFIG}});
    else{markTheme();buildHeading();displayMessages()}
    if(disposed)return;
    overlay.hidden=false;
    root.classList.add('ingly-loader-lock');
    resize();
    msgTimer=setInterval(()=>{
      if(!disposed&&messages.length){
        msgIndex=(msgIndex+1)%messages.length;
        msg.textContent=messages[msgIndex];
      }
    },1000);
    window.addEventListener('resize',resize,{passive:true});
    window.addEventListener('ingly:site-data-ready',onData);
    window.addEventListener('ingly:loader-maintenance',onMaintenance);
    document.addEventListener('visibilitychange',onHidden);
    skip.addEventListener('click',()=>finish(),{once:true});
    frameId=requestAnimationFrame(step);
    // Guaranteed exit even if the document never finishes loading.
    frameTimer=setTimeout(()=>finish(),5600);
  };
  if(document.readyState==='loading')
    document.addEventListener('DOMContentLoaded',onReady,{once:true});
  else onReady();
})();
