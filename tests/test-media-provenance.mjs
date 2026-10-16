import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {summarizeMediaProvenance} from '../assets/js/admin/media-provenance.mjs';
const cats=JSON.parse(readFileSync('data/categories.json','utf8'));
const mats=JSON.parse(readFileSync('data/materiali.json','utf8')).materiali;
const result=summarizeMediaProvenance(cats,mats);
assert.equal(result.totals.total,22,'Current inventory: 13 categories and 9 materials');
assert.equal(result.totals.repertorio,22,'Sources are licensed demo imagery, not owner-made products');
assert.equal(result.totals.originaleDichiarato,0);
assert.equal(result.totals.daVerificare,0);
assert.ok(result.rows.every(x=>x.sourceUrl.startsWith('https://')));
const fixture=summarizeMediaProvenance([
 {id:'1',img:'img/a.webp',assetKind:'licensed-stock',isDemo:true,sourceUrl:'javascript:alert(1)'},
 {id:'2',img:'img/b.webp',assetKind:'ingly-original',isDemo:false},
 {id:'3',img:'img/c.webp'},
 {id:'4',img:'img/d.webp',assetKind:'licensed-stock',isDemo:true,sourceUrl:'https://pexels.com/photo/1/'}
],[]);
assert.deepEqual(fixture.totals,{total:4,repertorio:1,originaleDichiarato:1,daVerificare:2});
const html=readFileSync('admin.html','utf8');
const parsed=new JSDOM(html).window.document;
assert.equal(parsed.querySelectorAll('#mOriginStats').length,1);
assert.equal(parsed.querySelectorAll('#mOriginList').length,1);
assert.match(html,/renderMediaProvenance\(\)/,'Media view updates provenance on render');
assert.match(html,/!\['http:','https:'\]\.includes\(url\.protocol\)/,'Unsafe source URLs not opened');
assert.match(html,/id='dashQuickActions'/,'Dashboard reuses existing quick action container');
assert.doesNotMatch(html,/Recensioni totali/,'No unverified review KPI claimed');
console.log('✔ Media provenance: 22 demo-stock sources, unknowns flagged and dashboard unique actions');
