import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const rd=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=rd('index.html'),css=rd('assets/css/ingly-studio-refinement.css');
const admin=rd('admin.html'),config=JSON.parse(rd('data/config.json'));
const dom=new JSDOM(html,{runScripts:'outside-only'});
const d=dom.window.document;
for(const id of ['exitPopup','exitPopInner','exitPopProd','exitPopCode','exitWaBtn','exitPopTitle','exitPopMsg','exitClose']){
 assert(d.getElementById(id),'Offer functional identifier lost: '+id);
}
assert(d.querySelector('#exitPopup.ingly-offer-overlay'),'Real popup redesign not installed');
assert(d.querySelector('#exitPopInner.ingly-offer-panel'),'Popup theme panel missing');
assert(css.includes(':root[data-mode="light"] .ingly-offer-overlay'),'Missing day mode');
assert(css.includes('.ingly-offer-code')&&css.includes('.ingly-offer-cta'),'Offer actions missing styling');
assert(html.includes('Josefin+Sans'),'Josefin Sans must be loaded');
assert(css.includes('Josefin Sans'),'Josefin typography must be applied');
assert(config.exitPopup && config.exitPopup.codice,'Existing configurable discount must remain');
assert(admin.includes('sPopSave')&&admin.includes('sPopActive'),'Offer Admin controls remain');
assert(html.includes("fetch('data/config.json'+V)"),'Popup must read CMS configuration');
assert(html.includes("data-wa-keep"),'WhatsApp offer message must survive');
assert(d.querySelector('#page-personalizza #inglyParametric'),'Personalization generator must remain');
assert(d.querySelector('#page-personalizza #inglyGeneratorDownload'),'SVG download workflow must remain');
assert.equal(d.querySelectorAll('#inglyGeneratorPresets button[data-ingly-preset]').length,4,'Four generator presets should exist');
assert(html.includes('assets/js/ingly-generator-presets.js'),'Preset controller not loaded');
new Function(rd('assets/js/ingly-generator-presets.js'));

const facts=d.querySelectorAll('#page-macchine .ingly-lab-fact');
assert.equal(facts.length,4);
const full=[...facts].map(x=>x.textContent).join(' ');
for(const expected of ['914 × 457 mm','115 × 115 mm','330 × 420 mm','380 × 380 mm','non laser','[DA CONFERMARE]']){
 assert(full.includes(expected),'Source-backed specifications missing: '+expected);
}
for(const c of facts){
 const a=c.querySelector('a[href^="https://"]');
 assert(a&&a.getAttribute('rel')?.includes('noopener'),'Official citation missing');
}
const inlineScripts=[...d.querySelectorAll('script:not([src])')].filter(x=>x.textContent.includes('Carica config e inizializza il popup'));
assert.equal(inlineScripts.length,1);
new Function(inlineScripts[0].textContent);
console.log('JOSEFIN + POPUP + XTOOL SOURCED LAB PASS');
