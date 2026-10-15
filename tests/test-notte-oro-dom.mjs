import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const html=read('index.html');
const dom=new JSDOM(html,{url:'https://inglydesign.it/',runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window,d=w.document;
w.matchMedia=()=>({matches:true,addListener(){},removeListener(){}});
w.INGLY={MACCHINE:JSON.parse(read('data/macchine.json'))};
Object.defineProperty(d,'fonts',{configurable:true,value:{ready:Promise.resolve()}});
w.eval(read('assets/js/notte-oro-ui.js'));
w.eval(read('assets/js/notte-oro-loader.js'));
d.dispatchEvent(new w.Event('DOMContentLoaded'));

const name=d.getElementById('atelierName'),material=d.getElementById('atelierMaterial');
assert.ok(name&&material);
name.value='<svg/onload=alert(1)>';
name.dispatchEvent(new w.Event('input',{bubbles:true}));
const out=d.getElementById('atelierNamePreview');
assert.equal(out.textContent,'<svg/onload=alert(1)>');
assert.ok(!out.querySelector('svg'),'Name preview must be escaped');
material.value='metal';
material.dispatchEvent(new w.Event('change',{bubbles:true}));
assert.equal(d.querySelector('.atelier-configurator__preview').dataset.material,'metal');

const grid=d.getElementById('labMacGrid');
const cards=d.createElement('div');cards.className='b2b-cards';
for(const machine of w.INGLY.MACCHINE.macchine){
 const card=d.createElement('div');card.className='rcard';
 const photo=d.createElement('figure');photo.className='mac-foto';
 const h=d.createElement('h3');h.textContent=machine.n.it;
 card.append(photo,h);cards.append(card);
}
grid.append(cards);
await new Promise(res=>setTimeout(res,25));
assert.ok(cards.classList.contains('atelier-machine-list'),'Machine cards must be enhanced');
assert.equal(cards.querySelectorAll('.atelier-machine__body').length,w.INGLY.MACCHINE.macchine.length);
assert.ok(grid.querySelector('.atelier-compat-table tbody tr'),'Capability matrix missing');
const loader=d.getElementById('loader');
d.getElementById('atelierLoaderSkip').click();
assert.ok(loader.classList.contains('ingly-loader-finished'),'Skip must initiate curtain exit');
assert.equal(w.sessionStorage.getItem('ingly_loader_seen_v3'),'1');
w.close();
console.log('Notte & Oro DOM smoke PASS: safe personalization, machine matrix, loader skip');