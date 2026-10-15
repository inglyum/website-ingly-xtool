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
    const section=document.createElement('section');section.className='atelier-compat-section';
    const heading=document.createElement('h3');heading.textContent='Macchina × materiale';
    const desc=document.createElement('p');desc.textContent='Compatibilità indicative dai dati INGLY. La lavorazione effettiva richiede prove sul materiale.';
    const wrap=document.createElement('div');wrap.className='atelier-compat-scroll';
    const table=document.createElement('table');table.className='atelier-compat-table';
    const thead=document.createElement('thead'),header=document.createElement('tr');
    const mh=document.createElement('th');mh.textContent='Materiale';mh.scope='col';header.append(mh);
    machines.forEach(m=>{const th=document.createElement('th');th.textContent=m.n?.it||m.id;th.scope='col';header.append(th)});
    thead.append(header);table.append(thead);
    const tbody=document.createElement('tbody');
    const types=[['Legno',/legno|compensato|mdf/i],['Plexiglass',/plexiglass|acrilic/i],
      ['Metallo',/acciaio|alluminio|ottone|metallo|oro|argento/i],
      ['Pelle vegetale',/pelle/i],['Vetro',/vetro/i],['Tessuto',/tessuto|capi/i]];
    types.forEach(([label,pattern])=>{
      const row=document.createElement('tr'),th=document.createElement('th');
      th.scope='row';th.textContent=label;row.append(th);
      machines.forEach(m=>{
        const td=document.createElement('td');
        const possible=(m.materiali||[]).some(x=>pattern.test(x.m||''))||(m.id==='wonderpress'&&label==='Tessuto');
        td.textContent=possible?'●':'—';
        td.title=possible?'Possibile: verificare finitura e parametri':'Non documentato nei dati';
        if(possible)td.classList.add('atelier-compat-yes');
        row.append(td);
      });tbody.append(row);
    });table.append(tbody);wrap.append(table);section.append(heading,desc,wrap);
    cards.insertAdjacentElement('afterend',section);
  };
  if(machineGrid){new MutationObserver(enhanceMachines).observe(machineGrid,{childList:true,subtree:false});enhanceMachines()}

 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
