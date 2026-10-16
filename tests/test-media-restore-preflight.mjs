import assert from 'node:assert/strict';
import {auditRestoreMedia} from '../assets/js/admin/media-restore-preflight.mjs';
const old={file:['one.webp','two.svg']},now={file:['one.webp','new.webp']};
const history=['img/one.webp','img/two.svg'],live=['img/one.webp','img/new.webp'];
let result=auditRestoreMedia(old,now,history,live);
assert.equal(result.ok,false,'Historic binary not in current tree requires explicit restoration');
assert.equal(result.requiresBinaryRestore,true);
assert.deepEqual(result.available,['img/two.svg']);
assert.deepEqual(result.extraLive,['img/new.webp']);
result=auditRestoreMedia(old,now,history,[...live,'img/two.svg']);
assert.equal(result.ok,true,'All historic files present allows subsequent validation');
result=auditRestoreMedia(old,now,['img/one.webp'],live);
assert.deepEqual(result.missing,['img/two.svg'],'Missing from both commits must block publish');
assert.equal(result.ok,false);
for(const bad of ['../private.svg','foo/other.webp','x\\\\bad.jpg','file.html','','..webp']){
 assert.equal(auditRestoreMedia({file:[bad]},now,history,live).ok,false,'Reject unsafe manifest name '+bad);
}
assert.equal(auditRestoreMedia({file:['one.webp','one.webp']},now,history,live).ok,false);
assert.equal(auditRestoreMedia({file:'bad'},now,history,live).ok,false);
assert.equal(auditRestoreMedia(old,now,null,live).ok,false);
console.log('✔ Restore media preflight: missing binaries, historic recovery candidates, unsafe paths and manifests');
