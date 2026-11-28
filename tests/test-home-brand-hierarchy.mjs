import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync('index.html','utf8');
const home=html.slice(html.indexOf('<section class="page active" id="page-home">'),html.indexOf('<!-- SHOP -->'));
const at=s=>{const n=home.indexOf(s);assert.ok(n>=0,'Missing home section '+s);return n};
const hero=at('class="hero'),worlds=at('id="maisonWorlds"'),custom=at('id="atelierConfig"'),materials=at('ingly-material-studies'),journey=at('id="journeyTitle"'),portfolio=at('id="gal1"'),partner=at('class="ingly-photographic-lab"');
/* 2026-11-28, scelta del titolare: prima il mondo INGLY DESIGN e la personalizzazione,
   subito dopo il mondo xTool (come i siti degli host xTool Squad), poi materiali,
   percorso e portfolio. */
assert.ok(hero<worlds&&worlds<custom&&custom<partner&&partner<materials&&materials<journey&&journey<portfolio,
 'INGLY world and personalization first, then the xTool world, then materials, journey and portfolio');
assert.ok(home.indexOf('id="host"')>partner&&home.indexOf('id="host"')<home.indexOf('ingly-photographic-lab__grid'),'Host profile opens the xTool world');
assert.equal(home.match(/class="ingly-photographic-lab"/g)?.length,1,'No duplicated xTool block');
assert.match(home,/PARTNER TECNOLOGICO · xTOOL/);
assert.match(home,/TECHNOLOGY PARTNER · xTOOL/);
assert.match(home,/Foto ufficiale xTool/,'Photo provenance remains labeled');
assert.match(home,/href="macchine"/,'Lab navigation retained');
assert.match(home,/INGLY DESIGN × xTool/);
console.log('✔ Home brand hierarchy: INGLY world and personalization first, then xTool world with host profile');
