/* INGLY Studio: curated presets for the existing SVG generator.
 * Produces only visual parametric previews, never claims tested cut paths.
 * Uses existing controls, refresh events and download implementation.
 */
(()=>{
 const presets={
  name:{text:'Il tuo nome',width:180,height:65,material:'wood',shape:'rounded',font:'josefin'},
  desk:{text:'STUDIO DESIGN',width:240,height:85,material:'acrylic',shape:'rectangle',font:'josefin'},
  oval:{text:'Grazie!',width:100,height:60,material:'wood',shape:'ellipse',font:'serif'},
  keyring:{text:'INGLY',width:65,height:40,material:'acrylic',shape:'rounded',font:'josefin'}
 };
 const setup=()=>{
  const host=document.getElementById('inglyGeneratorPresets');
  if(!host)return;
  const controls={text:'inglyGeneratorName',width:'inglyGeneratorWidth',height:'inglyGeneratorHeight',material:'inglyGeneratorMaterial',shape:'inglyGeneratorShape',font:'inglyGeneratorFont'};
  let buttons=[...host.querySelectorAll('[data-ingly-preset]')];
  const updateSelected=active=>{
   for(const button of buttons)button.setAttribute('aria-pressed',String(button.dataset.inglyPreset===active));
  };
  for(const button of buttons)button.addEventListener('click',()=>{
   const preset=presets[button.dataset.inglyPreset];
   if(!preset)return;
   for(const [key,id] of Object.entries(controls)){
    const input=document.getElementById(id);
    if(!input)continue;
    input.value=preset[key];
    input.dispatchEvent(new Event('input',{bubbles:true}));
    input.dispatchEvent(new Event('change',{bubbles:true}));
   }
   updateSelected(button.dataset.inglyPreset);
   const status=document.getElementById('inglyGeneratorStatus');
   if(status)status.textContent='Modello iniziale selezionato. Verifica dimensioni, tolleranze e conversione dei font in tracciati prima del taglio.';
  });
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});
 else setup();
})();