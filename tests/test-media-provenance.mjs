import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
import {summarizeMediaProvenance,recordOwnerUpload} from '../assets/js/admin/media-provenance.mjs';
const cats=JSON.parse(readFileSync('data/categories.json','utf8'));
const mats=JSON.parse(readFileSync('data/materiali.json','utf8')).materiali;
const result=summarizeMediaProvenance(cats,mats);
const assigned=[...cats,...mats].filter(x=>!!x.img);
assert.equal(result.totals.total,assigned.length,'Audit follows future category/material edits');
assert.equal(result.totals.repertorio,
  assigned.filter(x=>x.assetKind==='licensed-stock'&&x.isDemo===true&&x.sourceUrl?.startsWith('https://')).length);
assert.equal(result.totals.originaleDichiarato,
  assigned.filter(x=>x.assetKind==='ingly-original'&&x.isDemo===false).length);
assert.equal(result.totals.total,result.totals.repertorio+
  result.totals.originaleDichiarato+result.totals.daVerificare);
assert.ok(result.rows.filter(x=>x.state==='repertorio').every(x=>x.sourceUrl.startsWith('https://')));
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

// Owner replacement must clear ALL obsolete Pexels metadata, not just change img.
const demo={...cats[0],imageMeta:{width:1200,height:800},photographer:'Pexels artist'};
const replacement=recordOwnerUpload(demo,'img/cat-casa.webp',{type:'Categoria'});
assert.equal(replacement.assetKind,'ingly-original');
assert.equal(replacement.isDemo,false);
assert.ok(!('sourceUrl' in replacement)&&!('photographer' in replacement));
assert.ok(!('imageMeta' in replacement));
assert.match(replacement.licenseStatus,/verificare/);
assert.match(replacement.altIT,/caricata tramite INGLY/);
assert.equal(summarizeMediaProvenance([replacement],[]).totals.originaleDichiarato,1);
assert.throws(()=>recordOwnerUpload({...demo},'https://example.invalid/evil.svg'),/locale/);
const adminHTML=readFileSync('admin.html','utf8');
assert.match(adminHTML,/recordOwnerUpload\(cat,path,\{type:'Categoria'\}\)/);
assert.match(adminHTML,/recordOwnerUpload\(mat,path,\{type:'Materiale'\}\)/);
