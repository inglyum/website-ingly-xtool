import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('index.html'),adm=read('admin.html');
const css=read('assets/css/maison-reference.css'),acss=read('assets/css/admin-maison.css');
const data=JSON.parse(read('data/products.json'));
const cats=JSON.parse(read('data/categories.json'));
const dom=new JSDOM(html,{url:'https://inglyum.github.io/website-ingly-xtool/'});
const doc=dom.window.document;
const home=doc.getElementById('page-home');
const paths=[
  ['legno','img/3.webp','shop'],
  ['acrilico','img/5.webp','shop'],
  ['metallo','img/17.webp','shop'],
  ['uv','img/cat-tecnologie.webp','tecnologie'],
  ['3d','img/2.webp','shop'],
  ['regali','img/cat-eventi.webp','shop']
];
const grid=home.querySelector('#maisonWorlds .maison-worlds__grid');
assert(grid,'Category section must exist in real DOM');
assert.equal(grid.querySelectorAll('.maison-world').length,6);
for(const [id,src,route] of paths){
 assert(html.includes('src="'+src+'"'),'Missing local visual for '+id);
 assert(grid.querySelector('a[href="'+route+'"]'),'Actual route missing '+id);
}
for(const id of [2,3,5,17])assert(data.some(p=>p.id===id&&!p.hidden),'Featured imagery not from active catalog product '+id);
for(const src of ['img/cat-tecnologie.webp','img/cat-eventi.webp'])
 assert(cats.some(c=>c.img===src),'Image not listed in category catalog '+src);
assert(home.querySelector('#heroH1'),'Hero title must stay editable in existing CMS');
assert(home.querySelector('#heroVisual img'),'Hero remains a real image element');
assert(home.querySelector('#atelierConfig'),'Configurator must remain functional');
assert(css.includes(':root[data-mode="dark"]')&&css.includes(':root[data-mode="light"]'),'Both modes need complete tokens');
assert(css.includes('.xtool-lab-feature')&&css.includes('.xtool-lab-copy h2'),'Lab contrast fix missing');
assert(css.includes('.signature-hero-media__shade'),'Theme aware hero overlay missing');
assert(css.includes('@media(max-width:540px)'),'Missing responsive catalog cards');
assert(css.includes('prefers-reduced-motion:reduce'),'Motion accessibility missing');
assert(html.includes('assets/css/maison-reference.css')&&html.includes('assets/js/maison-reference.js'),'New storefront files not loaded');
assert(html.indexOf('assets/css/maison-reference.css')>html.indexOf('assets/css/signature-showcase.css'),'Ma(i)son CSS must be last');
assert(adm.includes('assets/css/admin-maison.css'),'Admin stylesheet not loaded');
assert(adm.includes('id="maisonAdminDashboard"')&&adm.includes('function renderMaisonAdminDashboard()'),'Admin live dashboard missing');
assert(adm.includes('renderMaisonAdminDashboard();'),'Admin live dashboard not invoked');
for(const id of ['maisonAdminNewProd','maisonEditHero','maisonEditBackground','maisonThemeDark','maisonThemeLight','maisonManageMedia','maisonManageProducts']){
 assert(adm.includes('id="'+id+'"'),'Missing working dashboard navigation: '+id);
}
assert(adm.includes("go('prod')")&&adm.includes("go('media')")&&adm.includes("go('bg')"),'Admin must use current editor routes');
assert(adm.includes('S.P||[]')&&adm.includes('S.CONFIG||{}'),'Admin must use current catalog draft, not fake data');
assert(!adm.includes('Marco Rossi'),'Never invent Admin user names');
assert(!acss.includes('12.4K'),'Never hardcode visits or conversion metrics');
const adminDOM=new JSDOM(adm);
const scripts=[...adminDOM.window.document.querySelectorAll('script:not([src]):not([type="module"])')]
  .filter(x=>x.textContent.includes('function renderHero()'));
assert.equal(scripts.length,1,'Admin app must remain one script');
new Function(scripts[0].textContent);
new Function(read('assets/js/maison-reference.js'));
console.log('MAISON LIVE PASS: both modes, real catalog assets, storefront and Admin controls compile.');
