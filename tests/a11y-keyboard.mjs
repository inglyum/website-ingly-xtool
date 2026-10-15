#!/usr/bin/env node
/* Keyboard end-to-end smoke test: menus, product cards, cart and modal focus.
   Browser outcomes are assertions, not WCAG certification. */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const url=process.env.INGLY_TEST_URL||'http://127.0.0.1:8080';
const browser=await chromium.launch({headless:true});
const failures=[];
let checks=0;
async function run(name,fn){
 try{await fn(); checks++; console.log('PASS a11y '+name)}
 catch(e){failures.push({name,error:String(e)});console.error('FAIL a11y '+name,e.message)}
}
try{
 for(const mode of ['dark','light']){
  const ctx=await browser.newContext({viewport:{width:390,height:820},reducedMotion:'reduce'});
  await ctx.addInitScript(x=>localStorage.setItem('ingly_mode',x),mode);
  const p=await ctx.newPage();
  try{
   await p.goto(url+'/shop/',{waitUntil:'domcontentloaded'});
   await p.waitForSelector('#page-shop.active .pcard-open:visible',{timeout:18000});
   await run(mode+' skip link',async()=>{
    const skip=p.locator('.ingly-skip-link');
    assert.equal(await skip.count(),1);
    await skip.focus();
    assert.equal(await skip.evaluate(el=>document.activeElement===el),true);
    assert.equal(await skip.getAttribute('href'),'#mainContent');
   });
   await run(mode+' mobile menu focus and Escape',async()=>{
    const open=p.locator('#nav [data-action="menu-open"]');
    await open.click();
    await p.waitForSelector('#mm.open',{timeout:3000});
    assert.equal(await open.getAttribute('aria-expanded'),'true');
    assert.equal(await p.locator('#mm').getAttribute('aria-hidden'),'false');
    assert.equal(await p.locator('#mm [data-action="menu-close"]').evaluate(el=>document.activeElement===el),true);
    await p.keyboard.press('Escape');
    await p.waitForSelector('#mm:not(.open)');
    assert.equal(await open.getAttribute('aria-expanded'),'false');
    assert.equal(await p.locator('#mm').getAttribute('inert'),'');
    assert.equal(await open.evaluate(el=>document.activeElement===el),true);
   });
   await run(mode+' product card via Enter',async()=>{
    const card=p.locator('#page-shop.active .pcard-open').first();
    await card.focus();
    await p.keyboard.press('Enter');
    await p.waitForSelector('#page-product.active',{timeout:7000});
    assert.match(p.url(),/product/);
   });
   await run(mode+' product lightbox via keyboard and Escape',async()=>{
    // The first Shop card may intentionally have no photo: use a known photographed SKU.
    await p.goto(url+'/product/1/',{waitUntil:'domcontentloaded'});
    await p.waitForSelector('#page-product.active',{timeout:12000});
    const photo=p.locator('#ppArt[role="button"][aria-disabled="false"]');
    await photo.waitFor({state:'visible'});
    await photo.focus();
    await p.keyboard.press('Enter');
    await p.waitForSelector('#lightbox:not([hidden])',{timeout:3000});
    assert.equal(await p.locator('#lbxClose').evaluate(el=>document.activeElement===el),true);
    await p.keyboard.press('Tab');
    assert.equal(await p.locator('#lightbox').evaluate(el=>el.contains(document.activeElement)),true);
    await p.keyboard.press('Escape');
    await p.waitForSelector('#lightbox[hidden]');
    assert.equal(await photo.evaluate(el=>document.activeElement===el),true);
   });
   await run(mode+' cart returns focus to opener',async()=>{
    const open=p.locator('.atelier-mobile-dock [data-action="open-cart"]');
    await open.click();
    await p.waitForSelector('#drawer.open');
    assert.equal(await p.locator('#drawer [data-action="close-cart"]').first().evaluate(el=>document.activeElement===el),true);
    await p.keyboard.press('Escape');
    await p.waitForSelector('#drawer:not(.open)');
    assert.equal(await p.locator('#drawer').getAttribute('inert'),'');
    assert.equal(await open.evaluate(el=>document.activeElement===el),true);
   });
  }finally{await ctx.close()}
 }
 const ctx=await browser.newContext({viewport:{width:390,height:820},reducedMotion:'reduce'});
 const p=await ctx.newPage();
 try{
  await p.goto(url+'/admin.html',{waitUntil:'domcontentloaded'});
  await run('Admin dialog Escape restores focus',async()=>{
   await p.evaluate(()=>{
    const trigger=document.createElement('button');
    trigger.id='testModalOpener';trigger.textContent='Open accessibility test';document.body.append(trigger);
    trigger.focus();
    modal('<h3>Prova finestra</h3><input id="testModalInput"><button type="button" id="testModalEnd" onclick="closeModal()">Chiudi</button>');
   });
   assert.equal(await p.locator('#modal').getAttribute('role'),'dialog');
   assert.equal(await p.locator('#testModalInput').evaluate(el=>el===document.activeElement),true);
   await p.locator('#testModalEnd').focus();
   await p.keyboard.press('Tab');
   assert.equal(await p.locator('#testModalInput').evaluate(el=>el===document.activeElement),true);
   await p.keyboard.press('Escape');
   assert.equal(await p.locator('#ovl').evaluate(el=>el.classList.contains('on')),false);
   assert.equal(await p.locator('#testModalOpener').evaluate(el=>el===document.activeElement),true);
  });
 }finally{await ctx.close()}
}finally{await browser.close()}
console.log('Keyboard checks '+checks+' passed; '+failures.length+' failed');
if(failures.length)process.exitCode=1;
