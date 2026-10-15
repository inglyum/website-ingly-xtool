/* INGLY Admin Theme Control
   Shared local browser preference with storefront: never modifies catalog/price/publish.
   The two visual mode tiles keep their original editor-navigation handlers. */
(function(){
 'use strict';
 const root=document.documentElement;
 const button=document.getElementById('adminThemeSwitch');
 const dark=document.getElementById('maisonThemeDark');
 const light=document.getElementById('maisonThemeLight');
 function getSaved(){try{const v=localStorage.getItem('ingly_mode');return v==='light'||v==='dark'?v:null}catch(_){return null}}
 function set(mode,persist){
  const value=mode==='light'?'light':'dark';
  root.dataset.mode=value;
  root.style.colorScheme=value;
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta)meta.setAttribute('content',value==='light'?'#ffffff':'#080d15');
  if(persist){try{localStorage.setItem('ingly_mode',value)}catch(_){}}
  if(button){
   button.textContent=value==='light'?'☾ Scuro':'☀ Chiaro';
   button.setAttribute('aria-label',value==='light'?'Attiva la modalità scura':'Attiva la modalità chiara');
   button.setAttribute('aria-pressed',value==='light'?'true':'false');
   button.title=button.getAttribute('aria-label');
  }
  if(dark)dark.setAttribute('aria-pressed',value==='dark'?'true':'false');
  if(light)light.setAttribute('aria-pressed',value==='light'?'true':'false');
  return value;
 }
 const media=window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)');
 set(getSaved()||(media&&media.matches?'light':'dark'),false);
 button?.addEventListener('click',()=>set(root.dataset.mode==='light'?'dark':'light',true));
 dark?.addEventListener('click',()=>set('dark',true));
 light?.addEventListener('click',()=>set('light',true));
 try{media?.addEventListener('change',e=>{if(!getSaved())set(e.matches?'light':'dark',false)})}catch(_){}
 window.addEventListener('storage',e=>{if(e.key==='ingly_mode')set(getSaved()||(media&&media.matches?'light':'dark'),false)});
 window.INGLY_ADMIN_THEME=Object.freeze({set,get:()=>root.dataset.mode});
})();
