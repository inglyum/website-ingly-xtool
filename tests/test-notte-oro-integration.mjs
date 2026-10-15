import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const rd=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=rd('assets/css/notte-oro.css'),html=rd('index.html'),config=JSON.parse(rd('data/config.json'));
const loader=rd('assets/js/notte-oro-loader.js'),ui=rd('assets/js/notte-oro-ui.js');
const mat=JSON.parse(rd('data/materiali.json')),mac=JSON.parse(rd('data/macchine.json'));
assert.equal(mat.materiali.length,9,'Existing material catalog count must be preserved');
assert.ok(mac.macchine.length>=4,'Existing workshop roster must remain');
for(const id of ['loader','atelierLoaderSkip','atelierLoaderFill','atelierLoaderPercent','heroH1','atelierConfig','atelierName','atelierMaterial','atelierFont','atelierNamePreview','atelierPreviewMaterial','page-macchine','page-shop','drawer']){
 assert(html.includes('id="'+id+'"'),'Missing DOM anchor '+id);
}
for(const file of ['notte-oro.css','notte-oro-loader.js','notte-oro-ui.js']){
 assert(html.includes('assets/'+(file.endsWith('.css')?'css/':'js/')+file),'Missing source '+file);
}
assert(css.indexOf('PHASE 8')>0 && css.indexOf('PHASE 7')>0 && css.indexOf('PHASE 6')>0,'Phased components missing');
assert(loader.includes('sessionStorage.getItem') && loader.includes('sessionStorage.setItem'),'Only first session may show loader');
assert(loader.includes('maxMs=clamp(options.maxMs,minMs,5500)'),'Loader maximum must be bounded and Admin-editable');
assert(loader.includes('waitImage')&&loader.includes('document.fonts?.ready'),'Loader measures critical assets and font readiness');
assert(loader.includes("atelierLoaderSkip"),'Skip button must work');
assert(ui.includes('preview.textContent'),'Never inject untrusted names as innerHTML');
assert(ui.includes('window.INGLY?.MACCHINE?.macchine'),'Capabilities must come from the actual catalog');
assert(!ui.includes('innerHTML = name.value'),'Prevent HTML injection in preview');
assert(html.includes('href="personalizza" data-nav="personalizza"'),'Actual personalization link');
assert(config.slogan.it.includes('idee'),'Hero copy must remain catalog-backed');
assert(!html.includes('<div class="socials" id="soc1">'),'Socials must not crowd the announcement bar');
assert(!html.includes('class="hero-image-note"'),'No large demo caption below hero image');
console.log('Notte & Oro phases 1–8 structural integration: PASS');