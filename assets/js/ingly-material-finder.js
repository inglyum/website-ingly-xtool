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
    const L=language==='en'?'en':'it',ms=models(data),doc=target.ownerDocument;
    if(!ms.length)return null;
    target.replaceChildren();target.classList.add('ingly-material-finder','ingly-finder-v2');
    const title=doc.createElement('h4');
    title.textContent=t(L,'Scegli cosa lavorare.','Scopri cosa puoi realizzare.');
    if(L==='en')title.textContent='Find your material in seconds.';
    const lead=doc.createElement('p');
    lead.textContent=t(L,
      'Un solo controllo: scegli la macchina, indica la lavorazione e tocca il materiale. Risultato immediato.',
      'Choose your machine, operation and material. See the result immediately.');
    target.append(title,lead);
    const controls=doc.createElement('div');controls.className='ingly-finder-controls ingly-finder-controls--simple';
    const machineField=doc.createElement('label');
    const machineLabel=doc.createElement('span');machineLabel.textContent=t(L,'01 / Macchina e modulo','01 / Machine & module');
    const machine=doc.createElement('select');machine.setAttribute('aria-label',machineLabel.textContent);
    ms.forEach(m=>{const option=doc.createElement('option');option.value=m.selectorId;
      option.textContent=(m.n?.[L]||m.n?.it||m.id)+(m.informativa?t(L,' · informativa',' · information only'):'');
      machine.append(option)});
    machine.value=ms[0].selectorId;machineField.append(machineLabel,machine);controls.append(machineField);
    // Keep selects for programmatic users / regression tests; visual interaction
    // is through labelled native buttons, not a cluttered multi-select form.
    const hideSelect=(id,values,value)=>{
      const el=doc.createElement('select');el.id=id;el.className='ingly-finder-native-state';
      el.setAttribute('aria-hidden','true');el.tabIndex=-1;
      values.forEach(({id,label})=>{const op=doc.createElement('option');op.value=id;op.textContent=label;el.append(op)});
      el.value=value;controls.append(el);return el;
    };
    const material=hideSelect('ingly-finder-material-value',
      materials.map(m=>({id:m.id,label:m[L]})),'wood');
    const names={cut:t(L,'Taglio','Cut'),engrave:t(L,'Incisione','Engrave'),
      print:t(L,'Stampa','Print'),transfer:t(L,'Termopressa','Heat press')};
    const process=hideSelect('ingly-finder-operation-value',
      operations.map(id=>({id,label:names[id]})),'cut');
    target.append(controls);
    const pHeading=doc.createElement('h5');pHeading.className='ingly-finder-label';
    pHeading.textContent=t(L,'02 / Cosa vuoi fare?','02 / What would you like to do?');
    const processButtons=doc.createElement('div');processButtons.className='ingly-finder-operation-buttons';
    const pBtns=new Map();
    operations.forEach(id=>{
      const button=doc.createElement('button');button.type='button';button.className='ingly-finder-operation';
      button.dataset.operation=id;button.textContent=names[id];button.setAttribute('aria-pressed',String(id===process.value));
      button.addEventListener('click',()=>{process.value=id;update()});
      processButtons.append(button);pBtns.set(id,button);
    });
    target.append(pHeading,processButtons);
    const mHeading=doc.createElement('h5');mHeading.className='ingly-finder-label';
    mHeading.textContent=t(L,'03 / Seleziona il materiale','03 / Select your material');
    const tiles=doc.createElement('div');tiles.className='ingly-finder-tiles';
    const mBtns=new Map();
    materials.forEach(m=>{
      const btn=doc.createElement('button');btn.type='button';btn.className='ingly-finder-tile';
      btn.dataset.material=m.id;btn.setAttribute('aria-pressed',String(m.id===material.value));
      const name=doc.createElement('strong');name.textContent=m[L];
      const state=doc.createElement('small');state.className='ingly-finder-tile__state';
      btn.append(name,state);
      btn.addEventListener('click',()=>{material.value=m.id;update()});
      mBtns.set(m.id,{button:btn,state});tiles.append(btn);
    });
    target.append(mHeading,tiles);
    const result=doc.createElement('div');result.className='ingly-finder-result ingly-finder-result--simple';
    result.setAttribute('role','status');result.setAttribute('aria-live','polite');
    const more=doc.createElement('a');more.className='ingly-finder-more';
    more.href='https://support.xtool.com/article/1306';more.target='_blank';more.rel='noopener noreferrer';
    more.textContent=t(L,'Consulta materiali e impostazioni ufficiali ↗','Official materials and settings ↗');
    const disclaimer=doc.createElement('p');disclaimer.className='ingly-finder-note';
    disclaimer.textContent=t(L,
      'Questa guida non imposta la macchina. Materiali, spessori, fumi e parametri devono essere verificati prima della produzione. La M2 è informativa, non presente in officina.',
      'Not a machine preset. Check material, thickness, fumes and settings before production. M2 is informational only, not on-site.');
    target.append(result,more,disclaimer);
    const update=()=>{
      const m=ms.find(x=>x.selectorId===machine.value)||ms[0];
      for(const [id,btn] of pBtns)btn.setAttribute('aria-pressed',String(id===process.value));
      for(const [id,{button,state}] of mBtns){
        const s=status(m,id,process.value).state;
        button.setAttribute('aria-pressed',String(id===material.value));
        button.dataset.status=s;
        state.textContent=s==='yes'?t(L,'Disponibile','Available'):
          s==='test'?t(L,'Da verificare','Check required'):'—';
      }
      const ans=status(m,material.value,process.value);
      const tag=doc.createElement('strong');tag.className='ingly-finder-state ingly-finder-state--'+ans.state;
      tag.textContent=ans.state==='yes'?t(L,'Lavorazione documentata','Documented operation'):
        ans.state==='test'?t(L,'Serve una verifica','Check needed'):
        t(L,'Non documentata','Not documented');
      const machineName=doc.createElement('small');machineName.className='ingly-finder-machine';
      machineName.textContent=(m.n?.[L]||m.n?.it||m.id)+
        (m.informativa?t(L,' · non presente in officina',' · not on-site'):'');
      const description=doc.createElement('p');
      description.textContent=ans.state==='yes'?t(L,
        'La macchina supporta questa lavorazione secondo i dati disponibili. Prima di produrre effettua un test reale.',
        'Listed as supported in available data. Run a real test before production.'):
        ans.state==='test'?t(L,
        'La compatibilità dipende da tipo, colore o spessore. Verifica la scheda del materiale.',
        'Compatibility depends on type, color or thickness. Verify the material.'):
        t(L,'Non abbiamo dati sufficienti per confermare questa lavorazione.',
          'There is not enough reliable data to confirm this operation.');
      const module=doc.createElement('p');module.className='ingly-finder-module';
      module.textContent=m.modulo?t(L,'Modulo: ','Module: ')+m.modulo:'';
      const note=doc.createElement('p');note.className='ingly-finder-note';
      note.textContent=[...new Set(ans.matches.map(x=>x.note).filter(Boolean))].join(' · ');
      result.replaceChildren(machineName,tag,description,module,note);
      result.dataset.result=ans.state;result.dataset.module=m.modulo||'';
    };
    [machine,material,process].forEach(el=>el.addEventListener('change',update));update();
    return {machine,material,process,result,update,materialButtons:mBtns,operationButtons:pBtns};
  }
  root.INGLY_MATERIAL_FINDER=Object.freeze({materials,models,status,mount});
})(window);
