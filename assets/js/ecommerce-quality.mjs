/*
 * INGLY DESIGN / E-commerce Quality Engine v1
 *
 * Repository-native, read-only audit for the static INGLY catalog.
 * Inspired by (not copied from) the uploaded Nexscope AI eCommerce-Skills
 * framework: ecommerce-branding, product-page-seo, ecommerce-landing-page,
 * conversion-rate-optimization, localization-testing, product photography,
 * checkout clarity, digital-products and visual-regression-testing.
 *
 * No network calls, fake CRO scores or fabricated industry benchmarks.
 * Findings are diagnostics, never auto-publication blockers.
 */
const str=v=>typeof v==='string'?v.trim():'';
const localized=(v,lang='it')=>str(typeof v==='object'&&v!==null?v[lang]:v);
const localAsset=value=>/^(img\/|assets\/images\/)[^?#]+$/i.test(str(value));
const externalAsset=value=>/^https?:\/\//i.test(str(value));
const published=value=>['pubblicato','published','attivo','active'].includes(str(value).toLowerCase());

export function auditStore(input={},options={}){
  const products=Array.isArray(input.products)?input.products:[];
  const categories=Array.isArray(input.categories)?input.categories:[];
  const config=input.config&&typeof input.config==='object'?input.config:{};
  const digital=input.digital&&typeof input.digital==='object'?input.digital:{};
  const materials=input.materials&&typeof input.materials==='object'?input.materials:{};
  const limit=Math.min(2000,Math.max(1,Number(options.maxFindings)||500));
  const categoryIds=new Set(categories.map(c=>String(c.id)));
  const findings=[];
  const totals={error:0,warning:0,info:0};
  const add=(severity,area,code,id,message,action)=>{
    totals[severity]++;
    if(findings.length<limit)findings.push({severity,area,code,id:String(id||''),message,action});
  };
  // Identical inventory semantics to Media Library: a filled product.img field
  // cannot prove that a real local file exists. Preserve backwards-compatible
  // field-based diagnostics only when an inventory has not been supplied.
  const images=Array.isArray(input.imageInventory)?new Set(
    input.imageInventory.map(x=>str(x).replace(/^img\//,'').split(/[?#]/)[0])):null;
  const staged=new Set((input.stagedImages||[]).map(x=>str(x).split(/[?#]/)[0]));
  const removed=new Set((input.deletedImages||[]).map(x=>str(x).split(/[?#]/)[0]));
  const mediaExists=src=>{
    const path=str(src).split(/[?#]/)[0];
    if(!path||removed.has(path))return false;
    if(staged.has(path))return true;
    if(externalAsset(path)||path.startsWith('assets/'))return null;
    if(!path.startsWith('img/'))return null;
    return images?images.has(path.slice(4)):null;
  };
  const visible=products.filter(p=>p&&!p.hidden);
  let missingPhoto=0,missingItalian=0,missingEnglish=0,missingDescription=0;
  for(const p of visible){
    const id=p.id??'';
    const titleIT=localized(p.n,'it'),titleEN=localized(p.n,'en');
    const descIT=localized(p.desc,'it'),descEN=localized(p.desc,'en');
    if(!titleIT){missingItalian++;add('error','Prodotti','missing_title_it',id,'Titolo italiano assente.','Prodotti → modifica il titolo IT.')}
    if(!titleEN){missingEnglish++;add('warning','Prodotti','missing_title_en',id,'Titolo inglese assente.','Prodotti → completa titolo EN.')}
    if(!descIT){missingDescription++;add('warning','Prodotti','missing_description_it',id,'Descrizione italiana assente.','Prodotti → aggiungi descrizione reale.')}
    if(p.desc&&typeof p.desc==='object'&&!descEN){
      add('info','Prodotti','missing_description_en',id,'Descrizione inglese assente.','Prodotti → controlla contenuti IT/EN.')
    }
    const gallery=Array.isArray(p.gallery)?p.gallery.filter(Boolean):[];
    const candidates=[str(p.img)||'img/'+id+'.webp',...gallery];
    if(images){
      const found=candidates.filter(path=>mediaExists(path)===true);
      const unknown=candidates.some(path=>mediaExists(path)===null);
      if(!found.length&&!unknown){
        missingPhoto++;add('warning','Fotografia','missing_primary_image',id,
          'Nessuna fotografia reale trovata nell’inventario per questa scheda.',
          'Media Library → carica una foto pertinente e verifica l’associazione.');
      }else if(found.length&&mediaExists(candidates[0])!==true){
        add('warning','Fotografia','missing_cover_image',id,
          'Copertina mancante: la scheda mostra una fotografia della gallery.',
          'Media Library → promuovi una fotografia autentica a copertina.');
      }else if(!found.length&&unknown){
        add('info','Fotografia','unverifiable_image',id,
          'La fonte fotografica è esterna o non verificabile dall’inventario.',
          'Apri la scheda per controllare la foto e i relativi diritti.');
      }
    }else if(!str(p.img)&&!gallery.length){
      missingPhoto++;add('warning','Fotografia','missing_primary_image',id,
        'Nessuna immagine del prodotto.','Media Library → aggiungi e associa una foto pertinente.');
    }
    if(str(p.img)&&!localAsset(p.img)&&!externalAsset(p.img)){
      add('warning','Fotografia','suspicious_image_path',id,'Percorso immagine non standard.','Media Library → verifica che il file sia raggiungibile.');
    }
    if(str(p.img)&&externalAsset(p.img)){
      add('info','Fotografia','external_image',id,'L’immagine principale usa un URL esterno.','Valuta un asset locale autorizzato e ottimizzato.');
    }
    if(!categoryIds.has(String(p.cat||''))){
      add('error','Catalogo','unknown_category',id,'Categoria prodotto non presente in categories.json.','Prodotti → assegna una categoria valida.');
    }
    if(titleIT.length>110){
      add('info','SEO','lengthy_title_it',id,'Titolo molto lungo (soglia editoriale 110 caratteri, non limite Google).','Valuta un nome breve e una descrizione separata.');
    }
  }
  for(const c of categories){
    if(!c||!c.id)continue;
    if(!localized(c.n,'it'))add('warning','Categorie','missing_category_name',c.id,'Nome categoria IT assente.','Categorie → completa il nome.');
    if(!str(c.img))add('warning','Categorie','missing_category_image',c.id,'Immagine di categoria non associata.','Media Library → assegna una copertina tematica.');
  }
  const matList=Array.isArray(materials.materiali)?materials.materiali:[];
  for(const m of matList){
    if(!m||!m.id)continue;
    if(!localized(m.n,'it'))add('warning','Materiali','missing_material_title',m.id,'Nome materiale IT assente.','Lab → Materiali → completa la scheda.');
  }
  if(!str(config.heroImage)){
    add('warning','Home','missing_hero', 'hero','La Home non ha una fotografia associata.','Home & Hero → collega una fotografia o un concept dichiarato.');
  }
  if(!localized(config.heroImageAlt,'it')){
    add('warning','Accessibilità','missing_hero_alt','hero','Manca il testo alternativo IT della Hero.','Home & Hero → descrivi ciò che si vede nella foto.');
  }
  if(str(config.heroImage)&&externalAsset(config.heroImage)){
    add('info','Fotografia','external_hero','hero','La Hero dipende da un URL esterno.','Carica un’immagine locale di cui possiedi i diritti.');
  }
  if(['illustrative-example','generated','concept'].includes(str(config.heroImageKind).toLowerCase())){
    add('info','Trasparenza','illustrative_hero','hero','La copertina è contrassegnata come illustrativa.','Non presentarla come fotografia di una realizzazione consegnata.');
  }
  const bundles=Array.isArray(digital.bundle)?digital.bundle:[];
  const publishedBundles=bundles.filter(x=>x&&published(x.stato));
  for(const b of publishedBundles){
    const mode=str(b.consegna?.modo).toLowerCase();
    if(!['email','link'].includes(mode)){
      add('error','File digitali','missing_delivery',b.id,'Bundle pubblicato senza una modalità di consegna dichiarata.','Digitali → imposta consegna email o link valido.');
    }
    if(mode==='link'&&!/^https:\/\//i.test(str(b.consegna?.url))){
      add('error','File digitali','missing_download_link',b.id,'Consegna via link senza URL HTTPS verificabile.','Digitali → inserisci il link effettivo.');
    }
    if(!str(b.licenza)){
      add('warning','File digitali','missing_license',b.id,'Licenza digitale non dichiarata.','Digitali → associa una licenza reale.');
    }
  }
  if(config.checkout&&str(config.checkout.modo).toUpperCase()==='WHATSAPP'){
    add('info','Checkout','whatsapp_mode','','Checkout attualmente configurato come ordine/richiesta tramite WhatsApp.','Non mostrare badge di pagamenti online non attivi.');
  }
  const priority={error:0,warning:1,info:2};
  findings.sort((a,b)=>priority[a.severity]-priority[b.severity]||
    a.area.localeCompare(b.area,'it')||a.id.localeCompare(b.id,'it'));
  return {
    version:1,
    method:'catalog-static-audit',
    note:'Controllo di completezza, non certificazione tecnica, SEO o performance. Verificare manualmente le foto, le licenze e le affermazioni commerciali.',
    totals,
    metrics:{
      products:products.length,visibleProducts:visible.length,
      categories:categories.length,materials:matList.length,
      digitalBundles:bundles.length,publishedDigitalBundles:publishedBundles.length,
      visibleWithoutPhoto:missingPhoto,visibleWithoutITTitle:missingItalian,
      visibleWithoutENTitle:missingEnglish,visibleWithoutITDescription:missingDescription
    },
    findings,
    truncated:findings.length<totals.error+totals.warning+totals.info
  };
}
