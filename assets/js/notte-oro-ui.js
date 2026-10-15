/* INGLY LIVE PREVIEW — illustrative only; no checkout or order mutation */
(() => {
 const boot=()=>{
  const name=document.getElementById('atelierName');
  const material=document.getElementById('atelierMaterial');
  const font=document.getElementById('atelierFont');
  const preview=document.getElementById('atelierNamePreview');
  const stage=document.querySelector('.atelier-configurator__preview');
  const meta=document.getElementById('atelierPreviewMaterial');
  if(name&&material&&font&&preview&&stage&&meta){
   const titles={wood:'LEGNO NATURALE',acrylic:'PLEXIGLASS',metal:'METALLO'};
   const redraw=()=>{
    preview.textContent=(name.value||'La tua idea').slice(0,26);
    stage.dataset.material=material.value;
    preview.dataset.font=font.value;
    meta.textContent=titles[material.value]||titles.wood;
   };
   for(const input of [name,material,font])input.addEventListener(input===name?'input':'change',redraw);
   redraw();
  }
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!reduced && 'IntersectionObserver' in window){
   const io=new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
     if(!entry.isIntersecting)return;
     if(entry.target.classList.contains('atelier-signature-rule'))entry.target.classList.add('in');
     else entry.target.classList.add('atelier-reveal-enter');
     io.unobserve(entry.target);
    })
   },{threshold:.12});
   document.querySelectorAll('.atelier-signature-rule, .ingly-material-grid img').forEach(el=>io.observe(el));
  } else document.querySelectorAll('.atelier-signature-rule').forEach(el=>el.classList.add('in'));
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
