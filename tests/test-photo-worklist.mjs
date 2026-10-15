import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {photoStatus,buildPhotoQueue,photoSummary,exportPhotoCSV} from '../assets/js/admin/photo-worklist.js';

const products=[
 {id:1,sku:'INGLY-001',n:{it:'Cover originale'},cat:'casa',img:'img/1.webp',hidden:false},
 {id:2,sku:'INGLY-002',n:{it:'Solo gallery'},cat:'casa',img:'img/2.webp',gallery:['img/2-g1.webp'],hidden:false},
 {id:3,sku:'INGLY-003',n:{it:'Nessuna foto'},cat:'b2b',img:'img/3.webp',hidden:false},
 {id:4,sku:'INGLY-004',n:{it:'Nascosto'},cat:'b2b',img:'img/4.webp',hidden:true}
];
const inventory=['1.webp','2-g1.webp'];
assert.equal(photoStatus(products[0],inventory).state,'ready');
assert.equal(photoStatus(products[1],inventory).state,'gallery');
assert.equal(photoStatus(products[2],inventory).state,'missing');
assert.equal(photoStatus(products[2],inventory,['img/3.webp']).state,'ready','Staged photo may cover missing SKU');
assert.equal(photoStatus(products[0],inventory,[],['img/1.webp']).state,'missing','Deletion pending removes image');
assert.equal(photoStatus(products[0],null).state,'unknown','Never guess if inventory unavailable');
assert.equal(photoStatus({id:5,img:'https://external.example/photo.jpg'},inventory).state,'unknown','No unverifiable remote promise');
assert.deepEqual(buildPhotoQueue(products,inventory).map(x=>x.id),[3,2,4],'Missing public first, then gallery, then hidden');
const stats=photoSummary(products,inventory);
assert.equal(stats.total,4);assert.equal(stats.visible,3);
assert.equal(stats.visibleMissingAll,1);assert.equal(stats.visibleNeedsCover,2);
assert.equal(stats.galleryOnly,1);
const csv=exportPhotoCSV(buildPhotoQueue(products,inventory));
assert.ok(csv.startsWith('\uFEFF'),'Excel UTF-8 BOM');
assert.match(csv,/INGLY-003/);
assert.match(csv,/Nessuna fotografia/);
const evil=exportPhotoCSV(buildPhotoQueue([{id:9,sku:'=HYPERLINK("x")',n:{it:'-formula'},hidden:false}],[]));
assert.ok(evil.includes("'=HYPERLINK"),'CSV formula values neutralized');
assert.ok(evil.includes("'-formula"),'CSV negative-like formula values neutralized');

const html=readFileSync('admin.html','utf8');
const css=readFileSync('assets/css/admin-brand-system.css','utf8');
assert.match(html,/id="mPhotoQueue"/,'Worklist container present');
assert.match(html,/data-photo-upload/,'Per-SKU upload buttons wired');
assert.match(html,/pickImage\('img\/'\+p\.id/,'Upload takes existing crop pipeline');
assert.match(html,/window\.PHOTO_QUEUE = PQ/,'ES module loaded in Admin');
assert.match(html,/function mediaInventory\(\)/,'Manifest used to verify images');
assert.match(html,/data-mrtake/,'Probable matches require explicit adoption');
assert.match(html,/overwrites\.length\|\|matches\.length/,'Overwrites and auto-matches require confirmation');
assert.match(css,/\.photo-queue-row/,'Responsive backlog styles loaded');
console.log('✔ Media Library: real photo inventory, priority queue, CSV, explicit approval and responsive layout');
