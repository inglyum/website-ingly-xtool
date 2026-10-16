/* Screenshot comparison: main baseline (8081) vs PR preview (8080).
   A visual review aid, never a false claim of pixel-perfect correctness. */
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const before=process.env.INGLY_BASELINE_URL||'http://127.0.0.1:8081';
const after=process.env.INGLY_TEST_URL||'http://127.0.0.1:8080';
const out='artifacts/sprint-01-comparisons';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[];
try{
 for(const mode of ['dark','light'])for(const width of [390,1440])for(const item of [
  {name:'home',path:'/'},{name:'shop',path:'/shop/'},{name:'admin',path:'/admin.html'}
 ]){
  const paths=[];
  for(const stage of [{name:'before-main',url:before},{name:'after-pr',url:after}]){
   const ctx=await browser.newContext({viewport:{width,height:width<600?820:900},reducedMotion:'reduce'});
   await ctx.addInitScript(value=>{try{localStorage.setItem('ingly_mode',value)}catch{}},mode);
   const page=await ctx.newPage();
   try{
    const response=await page.goto(stage.url+item.path,{waitUntil:'domcontentloaded',timeout:30000});
    const skip=page.locator('#atelierLoaderSkip');
    if(await skip.count()&&await skip.isVisible())await skip.click({timeout:4000});
    await page.addStyleTag({content:'#exitPopup{display:none!important;pointer-events:none!important}'});
    await page.waitForTimeout(220);
    const filename=[item.name,mode,width,stage.name].join('-')+'.png';
    await page.screenshot({path:out+'/'+filename,animations:'disabled'});
    const metrics=await page.evaluate(()=>{
      const nav=document.querySelector('#nav .nav-in');
      return {viewport:innerWidth,documentWidth:document.documentElement.scrollWidth,
       headerWidth:Math.round(nav?.getBoundingClientRect().width||0),
       background:getComputedStyle(document.body).backgroundColor,
       theme:document.documentElement.getAttribute('data-mode')};
    });
    paths.push({stage:stage.name,file:filename,status:response?.status(),metrics});
   }finally{await ctx.close()}
  }
  results.push({page:item.name,mode,width,paths});
  console.log('COMPARED '+item.name+' '+mode+' '+width);
 }
}finally{await browser.close()}
await writeFile(out+'/report.json',JSON.stringify({baseline:before,preview:after,sets:results.length,results},null,2));
const esc=v=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const cards=results.map(item=>'<section><h2>'+item.page+' · '+item.mode+' · '+item.width+'px</h2><div class="pair">'+
 item.paths.map(p=>'<figure><figcaption>'+p.stage+' · HTTP '+p.status+'</figcaption><img loading="lazy" src="'+esc(p.file)+'" alt="'+esc(item.page+' '+p.stage)+'"></figure>').join('')+'</div></section>').join('\n');
const html='<!doctype html><html lang="it"><meta charset="utf-8"><title>INGLY Sprint 01 — screenshot prima/dopo</title><style>body{font:15px system-ui;background:#121820;color:#f6f7fb;margin:24px}section{margin-bottom:40px;padding-bottom:20px;border-bottom:1px solid #576071}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}figure{margin:0;min-width:0}img{width:100%;max-height:900px;object-fit:contain;object-position:top;background:#fff}@media(max-width:700px){.pair{grid-template-columns:1fr}}</style><h1>INGLY Sprint 01 · confronto main / PR</h1><p>Visivamente confrontare logo, barra, CTA, schede, contrasto, overflow e area Admin. Non è un test su dispositivi fisici.</p>'+cards+'</html>';
await writeFile(out+'/index.html',html);
console.log('SPRINT 01 screenshot pairs: '+results.length+' (24 screenshots).');
