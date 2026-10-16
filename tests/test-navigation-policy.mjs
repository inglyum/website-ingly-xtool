/* Sprint 01: links must obey browser-native navigation and GitHub Pages base. */
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {readFileSync} from 'node:fs';
import {routeClickTarget} from '../assets/js/navigation-link-policy.js';

const dom=new JSDOM('<!doctype html><html><head><base href="../"></head><body></body></html>',{
  url:'https://inglyum.github.io/website-ingly-xtool/shop/'
});
const {document,MouseEvent}=dom.window;
const ctx={base:'/website-ingly-xtool/',baseURI:document.baseURI,origin:dom.window.location.origin};
const click=(href,{ctrl=false,meta=false,shift=false,alt=false,button=0,target='',download=false,noSpa=false,prevented=false}={})=>{
  const a=document.createElement('a');a.setAttribute('href',href);
  if(target)a.setAttribute('target',target);
  if(download)a.setAttribute('download','example.svg');
  if(noSpa)a.setAttribute('data-no-spa','');
  const e=new MouseEvent('click',{button,ctrlKey:ctrl,metaKey:meta,shiftKey:shift,altKey:alt,cancelable:true});
  if(prevented)e.preventDefault();
  return routeClickTarget(e,a,ctx);
};
assert.deepEqual(click('shop').segments,['shop']);
assert.deepEqual(click('./').segments,[],'Home must resolve at Pages repository root');
assert.deepEqual(click('product/7/').segments,['product','7']);
assert.deepEqual(click('business/ristoranti?tipo=azienda').query,'tipo=azienda');
assert.deepEqual(click('#/shop').segments,['shop'],'Preserve legacy hash route shortcuts');
for(const opts of [{ctrl:true},{meta:true},{shift:true},{alt:true},{button:1},{target:'_blank'},{download:true},{noSpa:true},{prevented:true}])
  assert.equal(click('shop',opts),null,'Native link behavior must be preserved: '+JSON.stringify(opts));
for(const href of ['#','', '#contenuto','mailto:info@example.com','tel:+39000000',
                     'https://example.org/shop','//example.org/shop','?q=wood',
                     'https://inglyum.github.io/shop','shop#results','generatori.html#start'])
  assert.equal(click(href),null,'Do not hijack '+href);
const navigation=readFileSync('assets/js/navigation.js','utf8');
assert.match(navigation,/routeClickTarget\(e,a,/,'Router must apply link policy');
assert.match(navigation,/page==='home'\?'':page/,'Home must map to site root, not /home');
assert.match(navigation,/page==='product'&&seg\[1\]/,'Prerendered product ID must be preserved');
dom.window.close();
console.log('✔ Browser link policy: base path, native browser clicks, anchors, product IDs and home.');
