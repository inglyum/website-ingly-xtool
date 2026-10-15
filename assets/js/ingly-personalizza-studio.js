/* INGLY DESIGN Personalizza Studio
   Original small parametric SVG preview inspired by standard maker workflows.
   The SVG contains EDITABLE TEXT, NOT CUT-READY CURVES. */
(() => {
  const xml=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;');
  const clamp=(v,min,max,fallback)=>{
    if(String(v).trim()==='')return fallback;
    const n=Number(v);return Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback;
  };
  const shapes={
    rounded:(w,h)=>'<rect x="0.7" y="0.7" width="'+(w-1.4)+'" height="'+(h-1.4)+'" rx="'+Math.min(10,h/4)+'"/>',
    rectangle:(w,h)=>'<rect x="0.7" y="0.7" width="'+(w-1.4)+'" height="'+(h-1.4)+'"/>',
    ellipse:(w,h)=>'<ellipse cx="'+(w/2)+'" cy="'+(h/2)+'" rx="'+(w/2-0.7)+'" ry="'+(h/2-0.7)+'"/>'
  };
  const fonts={josefin:"'Josefin Sans', sans-serif",serif:"Georgia, serif",mono:"monospace"};
  function generate({name,w,h,material,shape,font}){
    const text=String(name||'Il tuo nome').trim().slice(0,28);
    const safeFont=fonts[font]||fonts.josefin;
    const cut=shapes[shape]||shapes.rounded;
    const fill={wood:'#b88956',acrylic:'#66929a',metal:'#a4acb3'}[material]||'#b88956';
    const contrast={wood:'#50331c',acrylic:'#effdff',metal:'#242c31'}[material]||'#50331c';
    const size=Math.max(7,Math.min(h*.32,w/(Math.max(text.length,2)*.53)));
    const open='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'mm" height="'+h+'mm" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="Targa personalizzata">'+
      '<title>Targa personalizzata INGLY</title><desc>Bozza dimensionale: convertire il testo in tracciati prima del taglio.</desc>';
    const layers='<g id="INGLY_CUT" stroke="#ff3344" stroke-width="0.2" fill="none">'+cut(w,h)+'</g>'+
      '<g id="INGLY_ENGRAVE" fill="'+contrast+'">'+
      '<text x="'+w/2+'" y="'+(h/2)+'" text-anchor="middle" dominant-baseline="central" font-size="'+size.toFixed(2)+'" font-family="'+xml(safeFont)+'">'+xml(text)+'</text>'+
      '</g>';
    // Material simulation exists ONLY in the live preview, never in exported production layers.
    const previewSvg=open+'<g id="INGLY_PREVIEW_MATERIAL" fill="'+fill+'">'+cut(w,h)+'</g>'+layers+'</svg>';
    const svg=open+layers+'</svg>';
    return{svg,previewSvg,w,h,text};
  }
  function init(){
    const root=document.getElementById('inglyParametric');
    if(!root)return;
    const $=id=>document.getElementById(id);
    const inputs=['inglyGeneratorName','inglyGeneratorWidth','inglyGeneratorHeight','inglyGeneratorMaterial','inglyGeneratorShape','inglyGeneratorFont'];
    let current=null;
    const update=()=>{
      const name=$('inglyGeneratorName').value||'Il tuo nome';
      const w=clamp($('inglyGeneratorWidth').value,50,500,180);
      const h=clamp($('inglyGeneratorHeight').value,25,250,65);
      const material=$('inglyGeneratorMaterial').value;
      const shape=$('inglyGeneratorShape').value,font=$('inglyGeneratorFont').value;
      current=generate({name,w,h,material,shape,font});
      const canvas=$('inglyGeneratorCanvas');
      // Sanitized user text, not arbitrary HTML; all string-producing inputs are whitelisted or escaped.
      canvas.innerHTML=current.previewSvg;
      canvas.dataset.material=material;
      $('inglyGeneratorSize').textContent=w+' × '+h+' mm';
      $('inglyGeneratorStatus').textContent='Anteprima aggiornata · Verifica le dimensioni prima del taglio.';
    };
    for(const id of inputs)$(id).addEventListener('input',update);
    $('inglyGeneratorDownload').addEventListener('click',()=>{
      if(!current)return;
      const blob=new Blob([current.svg],{type:'image/svg+xml;charset=utf-8'});
      const url=URL.createObjectURL(blob);
      const a=document.createElement('a');
      a.href=url;a.download='ingly-targa-personalizzata-editabile.svg';
      document.body.append(a);a.click();a.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1500);
      $('inglyGeneratorStatus').textContent='SVG esportato: converti il testo in tracciati e verifica i gruppi prima di tagliare.';
    });
    update();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();