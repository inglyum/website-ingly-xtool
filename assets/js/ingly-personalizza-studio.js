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
  const labels={
    material:{wood:{it:'Legno naturale',en:'Natural wood'},acrylic:{it:'Plexiglass',en:'Acrylic'},metal:{it:'Metallo',en:'Metal'}},
    shape:{rounded:{it:'Rettangolo stondato',en:'Rounded rectangle'},rectangle:{it:'Rettangolo',en:'Rectangle'},ellipse:{it:'Ovale',en:'Oval'}},
    font:{josefin:'Josefin Sans',serif:'Serif',mono:'Monospace'}
  };
  function quoteText(options,lang='it'){
    const l=lang==='en'?'en':'it';
    const name=String(options.name||'').trim().slice(0,28);
    const w=clamp(options.w,50,500,180),h=clamp(options.h,25,250,65);
    const material=(labels.material[options.material]||labels.material.wood)[l];
    const shape=(labels.shape[options.shape]||labels.shape.rounded)[l];
    const font=labels.font[options.font]||labels.font.josefin;
    const notes=String(options.notes||'').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,300);
    return l==='en'
      ?'INGLY DESIGN — Custom project quotation\nText: '+name+'\nSize: '+w+' × '+h+' mm\nMaterial: '+material+'\nShape: '+shape+'\nLettering: '+font+
        (notes?'\nNotes: '+notes:'')+'\nPlease confirm feasibility, materials, price and delivery. I can attach the editable SVG separately.'
      :'INGLY DESIGN — Richiesta preventivo personalizzato\nTesto: '+name+'\nMisure: '+w+' × '+h+' mm\nMateriale: '+material+'\nForma: '+shape+'\nLettering: '+font+
        (notes?'\nNote: '+notes:'')+'\nVorrei confermare fattibilità, materiali, prezzo e consegna. Posso allegare separatamente il file SVG modificabile.';
  }
  function whatsappQuote(raw,message){
    try{
      const url=new URL(String(raw||''));
      if(url.protocol!=='https:'||!['wa.me','api.whatsapp.com','web.whatsapp.com'].includes(url.hostname))return '';
      url.searchParams.set('text',message);
      return url.href;
    }catch(_){return ''}
  }
  window.INGLY_PARAMETRIC_QUOTE=Object.freeze({quoteText,whatsappQuote});
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
      $('inglyGeneratorStatus').textContent=document.documentElement.lang==='en'
        ?'Preview updated · Check dimensions before cutting.'
        :'Anteprima aggiornata · Verifica le dimensioni prima del taglio.';
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
      $('inglyGeneratorStatus').textContent=document.documentElement.lang==='en'
        ?'SVG exported: convert text to paths and inspect all groups before cutting.'
        :'SVG esportato: converti il testo in tracciati e verifica i gruppi prima di tagliare.';
    });
    const quote=$('inglyGeneratorQuote');
    if(quote)quote.addEventListener('click',()=>{
      if(!current)return;
      const lang=document.documentElement.lang==='en'?'en':'it';
      const msg=quoteText({
        name:current.text,w:current.w,h:current.h,
        material:$('inglyGeneratorMaterial').value,
        shape:$('inglyGeneratorShape').value,
        font:$('inglyGeneratorFont').value,
        notes:($('inglyGeneratorNotes')||{}).value||''
      },lang);
      const config=(window.INGLY&&window.INGLY.CONFIG)||{};
      const target=whatsappQuote(config.whatsapp,msg);
      if(target){
        const a=document.createElement('a');
        a.href=target;a.target='_blank';a.rel='noopener noreferrer';
        document.body.appendChild(a);a.click();a.remove();
        $('inglyGeneratorStatus').textContent=lang==='en'
          ?'Quotation request prepared. You can attach your exported SVG in WhatsApp.'
          :'Richiesta di preventivo preparata. Puoi allegare il file SVG esportato su WhatsApp.';
      }else{
        const email=String(config.email||'');
        if(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
          const link='mailto:'+email+'?subject='+encodeURIComponent('INGLY DESIGN — '+(lang==='en'?'Custom quote':'Preventivo personalizzato'))+
            '&body='+encodeURIComponent(msg);
          window.location.href=link;
        }else $('inglyGeneratorStatus').textContent=lang==='en'
          ?'Contact is not configured. Please use the main contact page.'
          :'Contatto non configurato. Utilizza la pagina Contatti del sito.';
      }
    });
    update();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();