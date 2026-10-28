import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import { FOGLI, caricato, posizione, ultimo, bundleCaricato } from './_fogli-css.mjs';
const get=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const cfg=JSON.parse(get('data/config.json'));
const page=get('index.html'),admin=get('admin.html');
const css=get('assets/css/ingly-user-loader.css');
const adminCss=get('assets/css/admin-notte-oro.css');
const js=get('assets/js/notte-oro-loader.js');
assert.equal(cfg.loader.enabled,true);
assert.equal(cfg.loader.theme,'auto');
assert.equal(cfg.loader.oncePerSession,true);
assert.ok(cfg.loader.minMs<=cfg.loader.maxMs);
for(const id of ['inglyLoaderBadge','inglyLoaderLive','inglyLoaderSparks','inglyLoaderBeam',
 'atelierLoaderFill','atelierLoaderPercent','atelierLoaderSkip','inglyLoaderHeadline']){
 assert(page.includes('id="'+id+'"'),id+' missing on storefront');
}
assert(caricato('ingly-user-loader.css'),'owner CSS not loaded');
assert(page.includes('assets/js/notte-oro-loader.js'),'owner script not loaded');
for(const key of ['enabled','theme','oncePerSession','minMs','maxMs','headline.it','headline.en',
 'messages.it','messages.en']){
 assert(admin.includes('data-b="CONFIG.loader.'+key+'"'),'Admin binder missing '+key);
}
for(const id of ['adminLoaderTest','adminLoaderAdd','adminLoaderRemove','adminLoaderReset']){
 assert(admin.includes('id="'+id+'"'),id+' action missing');
}
assert(admin.includes("loaderPreview=1"),'Admin cannot force test intro with draft');
assert(admin.includes('__INGLY_PREVIEW__'),'Existing Admin draft preview was lost');
assert(admin.includes('markDirty();sync(lang)'),'Add/remove messages must persist as draft');
assert(admin.includes('assets/css/admin-notte-oro.css'),'Admin visual tokens missing');
assert(css.includes('ingly-loader-top')&&css.includes('ingly-loader-bottom'),'Split curtain missing');
assert(css.includes('prefers-reduced-motion:reduce'),'Accessible motion fallback missing');
assert(js.includes("e?.detail?.CONFIG"),'Loader not connected to Admin-published CONFIG');
assert(js.includes("window.__INGLY_PRONTO"),'Loader must observe app ready');
assert(js.includes('appReady ? .32 : 0'),'App ready included in progress');
assert(js.includes('setTimeout(()=>finish(),1500)'),'Loader hard timeout missing');
assert(js.includes("sessionStorage.setItem"),'First session not persisted');
const siteDOM=new JSDOM(page);
assert.equal(siteDOM.window.document.querySelectorAll('#loader').length,1,'Never duplicate loaders');
const adminDOM=new JSDOM(admin);
assert.ok(adminDOM.window.document.querySelector('#v-hero #adminLoaderStudio'),'Loader settings not in Home/Hero Admin');
const adminScripts=[...adminDOM.window.document.querySelectorAll('script:not([src]):not([type="module"])')]
 .filter(n=>n.textContent.includes('function renderHero()'));
assert.equal(adminScripts.length,1,'Expected one Admin application script');
new Function(adminScripts[0].textContent);
new Function(js);
console.log('Owner loader + Admin editor + publishing compatibility: PASS');
