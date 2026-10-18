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

  // Phase 6: enhance catalog-backed machines, never write specs into markup.
  const machineGrid=document.getElementById('labMacGrid');
  const enhanceMachines=()=>{
    if(!machineGrid)return;
    const cards=machineGrid.querySelector(':scope > .b2b-cards');
    if(!cards || cards.dataset.atelierEnhanced==='1')return;
    cards.dataset.atelierEnhanced='1';
    cards.classList.add('atelier-machine-list');
    [...cards.children].forEach((card,index)=>{
      card.classList.add('atelier-machine');
      const photo=card.querySelector('figure.mac-foto');
      const body=document.createElement('div');body.className='atelier-machine__body';
      const media=document.createElement('div');media.className='atelier-machine__photo';
      if(photo)media.append(photo);
      while(card.firstChild)body.append(card.firstChild);
      card.append(media,body);card.dataset.machineNumber=String(index+1).padStart(2,'0');
    });
    const machines=window.INGLY?.MACCHINE?.macchine||[];
    if(!machines.length || machineGrid.querySelector('.atelier-compat-section'))return;
    const L=document.documentElement.lang==='en'?'en':'it';
    const t=(it,en)=>L==='en'?en:it;
    const section=document.createElement('section');
    section.className='atelier-compat-section ingly-compat-modern';
    section.setAttribute('aria-labelledby','inglyCompatTitle');
    const heading=document.createElement('h3');heading.id='inglyCompatTitle';
    heading.textContent=t('Macchina × materiale','Machine × material');
    const lead=document.createElement('p');lead.className='ingly-compat-intro';
    lead.textContent=t('Niente tabelle complicate: seleziona la macchina e poi il materiale. Vedrai subito cosa è possibile fare.',
      'No complex tables: choose your machine, then material, and see what it can do.');
    const host=document.createElement('div');host.className='ingly-material-finder-host';
    const finder=window.INGLY_MATERIAL_FINDER;
    const mounted=finder?.mount?.(host,window.INGLY.MACCHINE,L);
    if(!mounted){
      const fallback=document.createElement('p');
      fallback.className='ingly-finder-fallback';
      fallback.textContent=t('Guida materiali temporaneamente non disponibile. Consulta le schede delle macchine.',
        'Material guide temporarily unavailable. See machine information.');
      host.append(fallback);
    }
    section.append(heading,lead,host);
    cards.insertAdjacentElement('afterend',section);
  };
  if(machineGrid){new MutationObserver(enhanceMachines).observe(machineGrid,{childList:true,subtree:false});enhanceMachines()}

 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
