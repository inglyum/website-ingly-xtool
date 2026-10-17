import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync('index.html','utf8');
const home=html.slice(html.indexOf('<section class="page active" id="page-home">'),html.indexOf('<!-- SHOP -->'));
const at=s=>{const n=home.indexOf(s);assert.ok(n>=0,'Missing home section '+s);return n};
const hero=at('class="hero'),worlds=at('id="maisonWorlds"'),custom=at('id="atelierConfig"'),materials=at('ingly-material-studies'),journey=at('id="journeyTitle"'),portfolio=at('id="gal1"'),partner=at('class="ingly-photographic-lab"');
assert.ok(hero<worlds&&worlds<custom&&custom<materials&&materials<journey&&journey<portfolio&&portfolio<partner,
 'INGLY own creations, customization, materials and portfolio must precede xTool partnership');
assert.equal(home.match(/class="ingly-photographic-lab"/g)?.length,1,'No duplicated xTool block');
assert.match(home,/PARTNER TECNOLOGICO · xTOOL/);
assert.match(home,/TECHNOLOGY PARTNER · xTOOL/);
assert.match(home,/Foto ufficiale xTool/,'Photo provenance remains labeled');
assert.match(home,/href="macchine"/,'Lab navigation retained');
assert.match(home,/INGLY DESIGN × xTool/);
console.log('✔ Home brand hierarchy: INGLY creations, personalization and portfolio before xTool collaboration');
