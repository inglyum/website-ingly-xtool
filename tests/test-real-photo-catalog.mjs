import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read=p=>JSON.parse(readFileSync(p,'utf8'));
const catalog=read('data/real-photo-sources.json');
const categories=read('data/categories.json');
const materials=read('data/materiali.json').materiali;
const actual=new Map([...categories.map(x=>['category:'+x.id,x]),...materials.map(x=>['material:'+x.id,x])]);
const photos=catalog.items;

assert.equal(photos.length,22,'13 categories + 9 materials must have authentic sources');
assert.equal(new Set(photos.map(p=>p.id)).size,22,'No duplicate photo assignments');
assert.equal(photos.filter(p=>p.entityType==='category').length,13);
assert.equal(photos.filter(p=>p.entityType==='material').length,9);

for(const p of photos) {
 const o=actual.get(p.id);
 assert.ok(o,'Unknown related catalog ID '+p.id);
 const stock=o.assetKind==='licensed-stock'&&o.isDemo===true;
 const ownerDeclared=o.assetKind==='ingly-original'&&o.isDemo===false;
 assert.ok(stock||ownerDeclared,'Asset must remain explicitly labelled as stock or owner-declared: '+p.id);
 assert.equal(o.replaceable,true,'Asset must be replaceable from Admin');
 assert.ok(o.altIT && o.altEN,'Accessible IT/EN alt text missing '+p.id);
 if(stock){
  assert.equal(o.img,p.media.src,'Licensed stock cover must match its source manifest');
  assert.equal(o.sourceUrl,p.provenance.sourceUrl);
 }else{
  assert.ok(!o.sourceUrl&&!o.photographer,'Owner upload must not retain Pexels attribution');
  assert.ok(existsSync(o.img),'Owner upload file missing: '+o.img);
 }
 assert.equal(p.provenance.license,'Pexels License');
 assert.equal(p.provenance.notInPortfolio,true);
 assert.equal(p.provenance.notOwnerProduct,true);
 assert.equal(p.media.srcset.length,3);
 for(const shot of p.media.srcset){
  assert.ok(existsSync(shot.url),'Missing real image '+shot.url);
  const header=readFileSync(shot.url);
  assert.equal(header.subarray(0,4).toString('ascii'),'RIFF','WebP header '+shot.url);
  assert.equal(header.subarray(8,12).toString('ascii'),'WEBP','WebP magic '+shot.url);
  assert.ok(header.byteLength>2000,'Corrupt/small image '+shot.url);
  assert.ok(shot.sha256?.length===64,'Missing checksum '+shot.url);
 }
}
const html=readFileSync('index.html','utf8');
const styles=html.match(/<link rel="stylesheet" href="([^"]+)"/g)||[];
assert.ok(html.includes('class="ingly-photographic-lab"'),'Official xTool editorial photo gallery missing');
assert.ok(styles[styles.length-1].includes('brand-system-2026.css'),'Last authoritive brand stylesheet must be preserved');
assert.ok(html.includes('Fotografie di repertorio a scopo illustrativo'),'Home labels genuine stock imagery');
assert.ok(html.includes('Foto ufficiale xTool'),'xTool manufacturer images should be clearly attributed');
assert.ok(existsSync('assets/css/real-photography.css'));
console.log('PASS provenance-aware category/material photos: archived sources retained, owner replacements permitted, labels and local files verified');
