import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const html=readFileSync('admin.html','utf8');
const a=html.indexOf('function usageOf(path,ref){');
const b=html.indexOf('function mediaItems(){',a);
assert.ok(a>=0&&b>a,'Usage search must exist');
const fn=html.slice(a,b);
const S={
 P:[{id:10,img:'img/product.webp',gallery:['img/gallery.webp']}],
 CATS:[{id:'casa',n:{it:'Casa'},img:'img/category.webp'}],
 C:{PORT:[],THEMES:{temi:[]},REVIEWS:[],SPONSORS:{lista:[]}},
 CONFIG:{aboutMedia:null,heroImage:'img/hero-main.webp'},
 MAT:{materiali:[{id:'legno',img:'img/material-legno.webp',n:{it:'Legno'}}]},
 IMGMAC:{macchine:[{id:'p3',file:'img/machine-p3.webp',modello:'xTool P3'}]},
 DIGI:{bundle:[{id:101,img:'img/digital.webp',anteprime:['img/preview.webp'],n:{it:'File'}}]},
 COR:{corsi:[{id:'intro',img:'img/course.webp',n:{it:'Fondamenti'}}]}
};
const used=path=>Array.from(vm.runInNewContext(fn+'\nusageOf(target)',{S,target:path}));
for(const [path,contains] of [
 ['img/product.webp','foto principale #10'],
 ['img/gallery.webp','gallery #10'],
 ['img/category.webp','categoria Casa'],
 ['img/material-legno.webp','materiale Legno'],
 ['img/machine-p3.webp','macchina xTool P3'],
 ['img/digital.webp','file digitale File'],
 ['img/preview.webp','anteprima digitale 101'],
 ['img/course.webp','corso Fondamenti'],
 ['img/hero-main.webp','immagine principale Home']
])assert.ok(used(path).some(x=>x.includes(contains)),path+' is referenced');
assert.deepEqual(used('img/safely-unused.webp'),[],'Unused file may still be deleted');
assert.match(html,/for\(const path of DELETES\)\{\s*const used=usageOf\(path\)/,
 'Publication validation checks every staged deletion');
assert.match(html,/if\(used\.length\)err\.push/,'Referenced files are blocking errors, not just prompts');
assert.match(html,/const v=validaBozza\(\)/,'Publication continues using existing blocking validator');
console.log('✔ Prevent publishing deletion of still-referenced media across catalog, digital, Academy and Lab');
