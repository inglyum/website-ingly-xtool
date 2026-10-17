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
    const m2=(window.INGLY?.MACCHINE?.catalogo||[]).find(x=>x.id==='m2'&&x.stato==='pubblicato');
    const cols=[...machines,...(m2?[{...m2,informativa:true}]:[])];
    const L=document.documentElement.lang==='en'?'en':'it',t=(it,en)=>L==='en'?en:it;
    const section=document.createElement('section');section.className='atelier-compat-section';
    section.setAttribute('aria-labelledby','inglyCompatTitle');
    const heading=document.createElement('h3');heading.id='inglyCompatTitle';
    heading.textContent=t('Macchina × materiale','Machine × material');
    const desc=document.createElement('p');desc.textContent=t(
      'Operazioni documentate, non preset pronti per il laser. Verifica sempre composizione, modulo, spessore e parametri.',
      'Documented operations, not ready-to-run presets. Always check composition, module, thickness and settings.');
    const terms={cut:t('Taglio','Cut'),engrave:t('Incisione / marcatura','Engrave / mark'),
      print:t('Stampa','Print'),transfer:t('Termotrasferimento','Heat transfer'),
      test:t('Da verificare','Test required'),none:t('Non dichiarato','Not documented')};
    const pill=op=>{const node=document.createElement('span');
      node.className='atelier-compat-pill atelier-compat-pill--'+op;node.textContent=terms[op];return node};
    const legend=document.createElement('div');legend.className='atelier-compat-legend';
    legend.setAttribute('aria-label',t('Legenda lavorazioni','Processing legend'));
    Object.keys(terms).forEach(op=>legend.append(pill(op)));
    const wrap=document.createElement('div');wrap.className='atelier-compat-scroll';wrap.tabIndex=0;
    wrap.setAttribute('role','region');
    wrap.setAttribute('aria-label',t('Tabella compatibilità scorribile','Scrollable compatibility table'));
    const table=document.createElement('table');table.className='atelier-compat-table';
    const caption=document.createElement('caption');caption.textContent=t(
      'Macchine in officina e modello M2 a scopo informativo',
      'Machines in workshop and informational M2 model');table.append(caption);
    const thead=document.createElement('thead'),header=document.createElement('tr');
    const first=document.createElement('th');first.textContent=t('Materiale','Material');first.scope='col';header.append(first);
    cols.forEach(m=>{const th=document.createElement('th');th.scope='col';th.textContent=m.n?.[L]||m.n?.it||m.id;
      const sub=document.createElement('small');sub.textContent=m.informativa?t('Informativa · non in officina','Info only · not on site'):t('In officina','In workshop');
      th.append(sub);header.append(th)});
    thead.append(header);table.append(thead);
    const tbody=document.createElement('tbody');
    const rows=[
      [t('Legno / MDF','Wood / MDF'),/legno|compensato|mdf/i],
      [t('Plexiglass','Acrylic'),/plexiglass|acrilic/i],
      [t('Metallo','Metal'),/acciaio|alluminio|ottone|metallo|oro|argento/i],
      [t('Pelle senza PVC','PVC-free leather'),/pelle/i],
      [t('Vetro','Glass'),/vetro/i],
      [t('Tessuto / canvas','Fabric / canvas'),/tessuto|capi|canvas/i],
      [t('Carta / cartoncino','Paper / card'),/carta|cartoncino|etichette/i]
    ];
    rows.forEach(([label,re])=>{
      const tr=document.createElement('tr'),th=document.createElement('th');th.scope='row';th.textContent=label;tr.append(th);
      cols.forEach(m=>{
        const matching=(m.materiali||[]).filter(x=>re.test(String(x.m||'')));
        const ops=[];
        if(matching.some(x=>x.taglio===true || typeof x.taglio==='string'&&!/da verificare|test|non/i.test(x.taglio)))ops.push('cut');
        if(matching.some(x=>x.incisione===true||x.marcatura===true))ops.push('engrave');
        if(matching.some(x=>x.stampa===true))ops.push('print');
        if(m.id==='wonderpress'&&/tessuto|fabric/i.test(label))ops.push('transfer');
        if(matching.some(x=>typeof x.taglio==='string'&&/da verificare|test/i.test(x.taglio)))ops.push('test');
        const td=document.createElement('td'),body=document.createElement('div');body.className='atelier-compat-cell';
        (ops.length?ops:['none']).forEach(op=>body.append(pill(op)));td.append(body);
        if(m.informativa && matching.length){
          const small=document.createElement('small');small.className='atelier-compat-info';
          small.textContent=[...new Set(matching.map(x=>x.modulo).filter(Boolean))].join(' · ');td.append(small);
        }
        const notes=matching.map(x=>x.note).filter(Boolean);if(notes.length)td.title=notes.join(' · ');
        tr.append(td);
      });tbody.append(tr);
    });
    table.append(tbody);wrap.append(table);
    const foot=document.createElement('p');foot.className='atelier-compat-source';
    foot.textContent=t('Fonti: dati INGLY e supporto xTool per M2. «Non dichiarato» non equivale a incompatibile.',
      'Sources: INGLY data and xTool support for M2. “Not documented” does not imply incompatibility.');
    const finderHost=document.createElement('div');
    finderHost.className='ingly-material-finder-host';
    const finder=window.INGLY_MATERIAL_FINDER;
    if(finder && typeof finder.mount==='function'){
      finder.mount(finderHost,window.INGLY.MACCHINE,L);
    }
    const advanced=document.createElement('details');
    advanced.className='ingly-finder-advanced';
    if(!finder)advanced.open=true;
    const summary=document.createElement('summary');
    summary.textContent=t('Visualizza confronto completo di tutte le macchine','View full comparison of all machines');
    advanced.append(summary,legend,wrap);
    section.append(heading,desc,finderHost,advanced,foot);
    cards.insertAdjacentElement('afterend',section);
  };
  if(machineGrid){new MutationObserver(enhanceMachines).observe(machineGrid,{childList:true,subtree:false});enhanceMachines()}

 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
