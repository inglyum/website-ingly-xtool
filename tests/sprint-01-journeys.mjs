/* INGLY Sprint 01 — four customer/admin journeys. Real browser navigation.
   Fail the PR when one of the main routes breaks. */
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const origin=process.env.INGLY_TEST_URL||'http://127.0.0.1:8080';
const out='artifacts/sprint-01-journeys';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[];
async function prepare(page,path='/'){
 await page.goto(origin+path,{waitUntil:'domcontentloaded',timeout:30000});
 await page.addStyleTag({content:'#exitPopup{display:none!important;pointer-events:none!important}'});
 const skip=page.locator('#atelierLoaderSkip');
 if(await skip.count()&&await skip.isVisible())await skip.click({timeout:4000});
 await page.waitForTimeout(180);
}
async function active(page,key){
 await page.waitForFunction(v=>!!document.querySelector('#page-'+v+'.active'),key,{timeout:12000});
}
const screenshot=async(page,key)=>page.screenshot({path:out+'/'+key+'.png',animations:'disabled'});
const caseRun=async(name,mode,width,fn)=>{
 const ctx=await browser.newContext({viewport:{width,height:width<600?820:900},reducedMotion:'reduce'});
 await ctx.addInitScript(value=>{try{localStorage.setItem('ingly_mode',value)}catch{}},mode);
 const page=await ctx.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(String(e.message)));
 try{
  await fn(page);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+6),true,'No horizontal overflow');
  await screenshot(page,[name,mode,width].join('-'));
  results.push({name,mode,width,pass:true,pageErrors:errors});
  console.log('PASS journey '+name+' '+mode+' '+width);
 }catch(e){
  results.push({name,mode,width,pass:false,error:String(e),pageErrors:errors});
  console.error('FAIL journey '+name+' '+mode+' '+width+': '+e);
  try{await screenshot(page,'FAILED-'+[name,mode,width].join('-'))}catch{}
 }finally{await ctx.close()}
};
try{
 for(const mode of ['dark','light'])for(const width of [390,1440]){
  const mobile=width<1101;
  await caseRun('shop-product-cart',mode,width,async p=>{
   await prepare(p);
   if(mobile){
    await p.locator('.atelier-mobile-dock a[href="shop"]').click();
   }else{
    await p.locator('#iaBarra .ia-voce[href$="/shop"]').first().click();
   }
   await active(p,'shop');
   const product=p.locator('#page-shop.active .pcard-open:visible').first();
   await product.waitFor({state:'visible',timeout:12000});
   await product.click();
   await active(p,'product');
   const cart=p.locator('#nav [data-action="open-cart"]');
   await cart.click();
   await p.waitForSelector('#drawer.open',{timeout:4000});
   assert.equal(await p.locator('#drawer').getAttribute('aria-hidden'),'false');
   await p.keyboard.press('Escape');
   await p.waitForFunction(()=>!document.getElementById('drawer').classList.contains('open'));
  });
  await caseRun('customize-quote',mode,width,async p=>{
   await prepare(p);
   if(mobile)await p.locator('.atelier-mobile-dock a[href="personalizza"]').click();
   else await p.locator('#nav a.atelier-nav-cta').click();
   await active(p,'personalizza');
   await p.locator('footer a[href="quote"]').first().click();
   await active(p,'quote');
  });
  await caseRun('lab-demo',mode,width,async p=>{
   await prepare(p);
   if(mobile){
    await p.locator('#nav [data-action="menu-open"]').click();
    await p.locator('#mm .dr-fam[href$="/macchine"]').first().click();
   }else await p.locator('#iaBarra .ia-voce[href$="/macchine"]').first().click();
   await active(p,'macchine');
   /* Lab navigation remains an actual link. Navigate by opening the
      Lab disclosure when possible, otherwise follow the page's Demo CTA. */
   if(mobile){
    await p.locator('#nav [data-action="menu-open"]').click();
    const link=p.locator('#mm a[href$="/demo"]').first();
    if(await link.count())await link.click();
    else await p.locator('#page-macchine a[href*="demo"]').first().click();
   }else{
    const toggle=p.locator('#iaBarra .ia-freccia[data-apri="xtool"]');
    await toggle.click();
    await p.locator('#ia-pan-xtool a[href$="/demo"]').first().click();
   }
   await active(p,'demo');
  });
  await caseRun('admin-media-products',mode,width,async p=>{
   await prepare(p,'/admin.html');
   await p.waitForFunction(()=>!!document.querySelector('#v-dash.on'),undefined,{timeout:15000});
   await p.locator('#maisonManageMedia').click();
   await p.waitForFunction(()=>!!document.querySelector('#v-media.on'),undefined,{timeout:10000});
   await p.locator('#nav .nit[data-go="prod"]').click();
   await p.waitForFunction(()=>!!document.querySelector('#v-prod.on'),undefined,{timeout:10000});
  });
 }
}finally{await browser.close()}
const stats={scans:results.length,failures:results.filter(x=>!x.pass).length,results};
await writeFile(out+'/results.json',JSON.stringify(stats,null,2));
console.log('SPRINT 01 JOURNEYS: '+stats.scans+' checks, '+stats.failures+' failures');
if(stats.failures)process.exitCode=1;
