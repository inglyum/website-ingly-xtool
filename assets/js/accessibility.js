/* INGLY accessibility — focus lifecycle for temporary overlays.
   Never move focus to off-screen controls or leave keyboard users behind a modal.
   Lightweight module, no data or checkout dependencies. */
const stack=[];
const focusable='a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
const visible=el=>{
  const c=getComputedStyle(el);
  const r=el.getClientRects();
  return !!r.length&&c.visibility!=='hidden'&&c.display!=='none'&&!el.closest('[inert]');
};
function items(el){return [...el.querySelectorAll(focusable)].filter(visible)}
function onKey(e){
  const top=stack[stack.length-1];if(!top)return;
  if(e.key==='Escape'){
    e.preventDefault();e.stopPropagation();
    top.onEscape?.();
    return;
  }
  if(e.key!=='Tab')return;
  const els=items(top.el);
  if(!els.length){e.preventDefault();top.el.focus();return}
  const first=els[0],last=els[els.length-1],active=document.activeElement;
  if(e.shiftKey&&(active===first||!top.el.contains(active))){
    e.preventDefault();last.focus();
  }else if(!e.shiftKey&&(active===last||!top.el.contains(active))){
    e.preventDefault();first.focus();
  }
}
export function openFocusLayer(el,{trigger,initialFocus,onEscape}={}){
  if(!el)return;
  closeFocusLayer(el,{restore:false});
  const fallback=document.activeElement;
  stack.push({el,trigger:trigger||fallback,onEscape});
  if(stack.length===1)document.addEventListener('keydown',onKey,true);
  const first=initialFocus||items(el)[0]||el;
  if(first===el&&!el.hasAttribute('tabindex'))el.setAttribute('tabindex','-1');
  first.focus({preventScroll:true});
}
export function closeFocusLayer(el,{restore=true}={}){
  const i=stack.findIndex(x=>x.el===el);if(i<0)return;
  const [entry]=stack.splice(i,1);
  if(!stack.length)document.removeEventListener('keydown',onKey,true);
  if(restore&&entry.trigger?.isConnected&&typeof entry.trigger.focus==='function')
    entry.trigger.focus({preventScroll:true});
}
