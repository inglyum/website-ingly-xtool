/* INGLY Machine Lab / material finder.
 * Familiar xTool Studio selection workflow (machine -> material -> operation);
 * independent implementation, no official xTool presets copied.
 * No power/speed proposals: composition, module and thickness require testing. */
(function(root){
  'use strict';
  const materials=[
    {id:'wood',it:'Legno / MDF',en:'Wood / MDF',re:/legno|compensato|mdf/i},
    {id:'acrylic',it:'Plexiglass',en:'Acrylic',re:/plexiglass|acrilic/i},
    {id:'metal',it:'Metallo',en:'Metal',re:/acciaio|alluminio|ottone|metallo|oro|argento/i},
    {id:'leather',it:'Pelle senza PVC',en:'PVC-free leather',re:/pelle/i},
    {id:'glass',it:'Vetro',en:'Glass',re:/vetro/i},
    {id:'fabric',it:'Tessuto / canvas',en:'Fabric / canvas',re:/tessuto|capi|canvas/i},
    {id:'paper',it:'Carta / cartoncino',en:'Paper / cardstock',re:/carta|cartoncino|etichette/i}
  ];
  const operations=['cut','engrave','print','transfer'];
  const t=(L,it,en)=>L==='en'?en:it;
  function models(data){
    const owned=(data.macchine||[]).map(m=>({...m,selectorId:m.id,informativa:false}));
    const m2=(data.catalogo||[]).find(m=>m.id==='m2');
    if(!m2)return owned;
    const choices=[
      {id:'m2-10w',it:'xTool M2 · Laser 10 W',en:'xTool M2 · 10W laser',module:'Diodo 10/20W'},
      {id:'m2-20w',it:'xTool M2 · Laser 20 W',en:'xTool M2 · 20W laser',module:'Diodo 10/20W'},
      {id:'m2-ir',it:'xTool M2 · IR 3 W',en:'xTool M2 · 3W IR',module:'IR 3W'},
      {id:'m2-cmyk',it:'xTool M2 · CMYK',en:'xTool M2 · CMYK',module:'CMYK inkjet'}
    ];
    return owned.concat(choices.map(c=>({
      ...m2,selectorId:c.id,n:{it:c.it,en:c.en},modulo:c.module,
      materiali:(m2.materiali||[]).filter(x=>x.modulo===c.module),
      informativa:true
    })));
  }
  function status(model,materialId,operation){
    const material=materials.find(x=>x.id===materialId);
    if(!model||!material||!operations.includes(operation))return {state:'none',matches:[]};
    const matches=(model.materiali||[]).filter(m=>material.re.test(String(m.m||'')));
    // transfer uses a different physical process; do not suggest laser settings.
    if(operation==='transfer'){
      return {state:model.id==='wonderpress'&&materialId==='fabric'?'yes':'none',matches};
    }
    const key=operation==='cut'?'taglio':operation==='print'?'stampa':'incisione';
    const trueMatch=matches.some(m=>m[key]===true||(operation==='engrave'&&m.marcatura===true));
    const conditional=matches.some(m=>typeof m[key]==='string'&&/da verificare|test/i.test(m[key]));
    const knownCut=operation==='cut'&&matches.some(m=>typeof m.taglio==='string'&&!/test|da verificare|non/i.test(m.taglio));
    const state=trueMatch||knownCut?'yes':conditional?'test':'none';
    // Neither a diode nor IR module may cut metal, even if a record is malformed.
    if(materialId==='metal'&&operation==='cut'&&/m2-(?:10w|20w|ir)|^f2$/.test(model.selectorId||''))
      return {state:'none',matches};
    return {state,matches};
  }
  function mount(target,data,language='it'){
    if(!target)return null;
    const L=language==='en'?'en':'it';
    const ms=models(data),doc=target.ownerDocument;
    if(!ms.length)return null;
    target.replaceChildren();
    target.classList.add('ingly-material-finder');
    const h=doc.createElement('h4');h.textContent=t(L,'Trova la lavorazione giusta','Find the right process');
    const lead=doc.createElement('p');lead.textContent=t(L,
      'Come in un catalogo materiali: scegli macchina, materiale e lavorazione. Risposta immediata, senza parametri inventati.',
      'Choose a machine, material and operation for an instant guidance result. No fabricated power or speed settings.');
    target.append(h,lead);
    const controls=doc.createElement('div');controls.className='ingly-finder-controls';
    const makeSelect=(labelText,values,selected)=>{const field=doc.createElement('label');
      const label=doc.createElement('span');label.textContent=labelText;const select=doc.createElement('select');
      values.forEach(v=>{const option=doc.createElement('option');option.value=v.id;
        option.textContent=v.label;select.append(option)});
      if(selected)select.value=selected;field.append(label,select);controls.append(field);return select};
    const machine=makeSelect(t(L,'1 · Macchina / modulo','1 · Machine / module'),
      ms.map(m=>({id:m.selectorId,label:(m.n?.[L]||m.n?.it||m.id)+(m.informativa?t(L,' · informativa',' · information only'):'')})),
      ms[0].selectorId);
    const material=makeSelect(t(L,'2 · Materiale','2 · Material'),
      materials.map(m=>({id:m.id,label:m[L]})),'wood');
    const process=makeSelect(t(L,'3 · Lavorazione','3 · Process'),[
      {id:'cut',label:t(L,'Taglio','Cut')},
      {id:'engrave',label:t(L,'Incisione / marcatura','Engrave / mark')},
      {id:'print',label:t(L,'Stampa','Print')},
      {id:'transfer',label:t(L,'Termotrasferimento','Heat transfer')}
    ],'cut');
    const result=doc.createElement('div');result.className='ingly-finder-result';result.setAttribute('role','status');result.setAttribute('aria-live','polite');
    const more=doc.createElement('a');more.className='ingly-finder-more';
    more.href='https://support.xtool.com/article/1306';more.target='_blank';more.rel='noopener noreferrer';
    more.textContent=t(L,'Impostazioni materiali ufficiali xTool ↗','Official xTool material settings ↗');
    const help=doc.createElement('p');help.className='ingly-finder-note';
    help.textContent=t(L,'Guida indicativa: per la produzione verificare sempre composizione, sicurezza, modulo, spessore e test su campione. «Non documentato» non è una promessa di compatibilità.',
      'Guidance only: check composition, safety, module, thickness and a sample test. “Not documented” is not a claim of compatibility.');
    target.append(controls,result,more,help);
    const update=()=>{
      const m=ms.find(x=>x.selectorId===machine.value)||ms[0];
      const ans=status(m,material.value,process.value);
      const badge=doc.createElement('strong');badge.className='ingly-finder-state ingly-finder-state--'+ans.state;
      badge.textContent=ans.state==='yes'?t(L,'Operazione documentata','Documented operation'):
        ans.state==='test'?t(L,'Verifica materiale necessaria','Material check required'):
          t(L,'Non documentata','Not documented');
      const explanation=doc.createElement('p');explanation.textContent=ans.state==='yes'?
        t(L,'Il catalogo indica questa lavorazione. Prima dell’uso verifica i parametri sul materiale reale.',
          'This operation is listed in the catalog. Verify parameters on actual material before use.'):
        ans.state==='test'?t(L,'Compatibilità condizionata a tipologia e spessore: esegui prove e controlla le fonti ufficiali.',
          'Compatibility depends on material and thickness: test first and check official sources.'):
        t(L,'Non risultano dati affidabili per questa combinazione. Non avviare la lavorazione senza verifica.',
          'No verified information for this combination. Do not proceed without checking.');
      const name=doc.createElement('small');name.className='ingly-finder-machine';
      name.textContent=(m.n?.[L]||m.n?.it||m.id)+(m.informativa?t(L,
        ' · solo scheda informativa, non presente in officina',' · information only, not on-site'):'');
      const mod=doc.createElement('p');mod.className='ingly-finder-module';
      mod.textContent=m.modulo?t(L,'Modulo: ','Module: ')+m.modulo:'';
      const notes=[...new Set(ans.matches.map(x=>x.note).filter(Boolean))];
      const note=doc.createElement('p');note.className='ingly-finder-note';note.textContent=notes.join(' · ');
      result.replaceChildren(name,badge,explanation,mod,note);
      result.dataset.result=ans.state;
      result.dataset.module=m.modulo||'';
    };
    [machine,material,process].forEach(x=>x.addEventListener('change',update));update();
    return {machine,material,process,result,update};
  }
  root.INGLY_MATERIAL_FINDER=Object.freeze({materials,models,status,mount});
})(window);
