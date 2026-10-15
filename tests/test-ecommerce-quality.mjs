import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {auditStore} from '../assets/js/ecommerce-quality.mjs';

const rd=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const sample=auditStore({
  products:[
    {id:1,hidden:false,n:{it:'',en:''},desc:{it:'',en:''},cat:'wrong',img:''},
    {id:2,hidden:true,n:{it:'Hidden'},cat:'valid',img:''},
    {id:3,hidden:false,n:{it:'Prodotto vero',en:'Real product'},desc:'Un prodotto',cat:'valid',img:'img/3.webp'}
  ],
  categories:[{id:'valid',n:{it:'Prodotti',en:'Products'},img:''}],
  config:{heroImage:'',heroImageAlt:{it:''},heroImageKind:'illustrative-example',checkout:{modo:'WHATSAPP'}},
  digital:{bundle:[
    {id:'d1',stato:'pubblicato',consegna:{modo:'nessuna'},licenza:''},
    {id:'d2',stato:'bozza',consegna:{modo:'nessuna'},licenza:''}
  ]},
  materials:{materiali:[{id:'legno',n:{it:'Legno',en:'Wood'}}]}
});
const has=(type,id)=>sample.findings.some(f=>f.code===type&&f.id===String(id));
assert(has('missing_title_it',1));
assert(has('missing_title_en',1));
assert(has('missing_description_it',1));
assert(has('missing_primary_image',1));
assert(has('unknown_category',1));
assert(!has('missing_primary_image',2),'Hidden products must not be audited as visible');
assert(has('missing_category_image','valid'));
assert(has('missing_delivery','d1'));
assert(!has('missing_delivery','d2'),'Draft digital files must not be falsely marked purchasable');
assert(has('missing_hero','hero'));
assert(has('missing_hero_alt','hero'));
assert(has('whatsapp_mode',''));
assert.deepEqual(sample.metrics,{products:3,visibleProducts:2,categories:1,materials:1,
 digitalBundles:2,publishedDigitalBundles:1,
 visibleWithoutPhoto:1,visibleWithoutITTitle:1,visibleWithoutENTitle:1,
 visibleWithoutITDescription:1});
const maxOne=auditStore({products:sample.findings.length?[
 {id:11,n:{it:''},img:'',cat:'bad'},
 {id:12,n:{it:''},img:'',cat:'bad'}
]:[]},{maxFindings:1});
assert.equal(maxOne.findings.length,1);
assert(maxOne.truncated);
assert.equal(typeof maxOne.totals.error,'number');
assert(!JSON.stringify(sample).includes('conversion rate 90'),'Never invent business KPIs');
const actual=auditStore({
 products:JSON.parse(rd('data/products.json')),
 categories:JSON.parse(rd('data/categories.json')),
 config:JSON.parse(rd('data/config.json')),
 digital:JSON.parse(rd('data/digitale.json')),
 materials:JSON.parse(rd('data/materiali.json'))
});
assert(actual.metrics.products>0);
assert(actual.metrics.categories>=1);
assert(actual.metrics.materials>=1);
assert(actual.totals.error>=0);
for(const f of actual.findings){
 assert(['error','warning','info'].includes(f.severity));
 assert(typeof f.message==='string'&&typeof f.action==='string');
}
const admin=rd('admin.html');
assert(admin.includes('id="inglyEcomQuality"'),'Health Center ecommerce dashboard missing');
assert(admin.includes('id="inglyEcomRun"'),'Run audit control missing');
assert(admin.includes('id="inglyEcomExport"'),'Export button missing');
assert(admin.includes("health:renderEcommerceQuality"),'Navigation must open quality engine');
assert(admin.includes("import('./assets/js/ecommerce-quality.mjs')"),'Admin must use exactly the tested engine');
assert(admin.includes('S.P||[]')&&admin.includes('S.DIGI||{}'),'Admin must use current draft state');
assert(admin.includes('report.findings.slice(0,80)'),'Admin must cap visible findings');
assert(admin.includes("document.createElement('a')"),'Export must create a real download');
const dom=new JSDOM(admin);
const scripts=[...dom.window.document.querySelectorAll('script:not([src]):not([type="module"])')]
  .filter(x=>x.textContent.includes('function renderHero()'));
assert.equal(scripts.length,1);
new Function(scripts[0].textContent);
console.log('eCommerce-Skills quality engine PASS: fixtures, live catalog, Admin integration and safety');
