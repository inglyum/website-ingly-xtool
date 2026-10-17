import assert from 'node:assert/strict';
import {webcrypto,createHash} from 'node:crypto';
import {verifyHistoricBlob,stageHistoricMedia} from '../assets/js/admin/historic-media-binary-restore.mjs';
import {planHistoricMediaRecovery} from '../assets/js/admin/historic-media-recovery-plan.mjs';

const source=Buffer.from('genuine-test-photo-data','utf8');
const hash=createHash('sha1').update('blob '+source.length+'\0').update(source).digest('hex');
const blob={sha:hash,size:source.length,encoding:'base64',content:source.toString('base64')};
const result=await verifyHistoricBlob(blob,hash,{subtle:webcrypto.subtle});
assert.equal(result.size,source.length);
assert.equal(result.b64,blob.content);
await assert.rejects(()=>verifyHistoricBlob({...blob,content:'YQ=='},hash,{subtle:webcrypto.subtle}),/Dimensione blob/);
await assert.rejects(()=>verifyHistoricBlob({...blob,size:99999},hash,{subtle:webcrypto.subtle}),/Dimensione blob differente/);
await assert.rejects(()=>verifyHistoricBlob({...blob,sha:'f'.repeat(40)},hash,{subtle:webcrypto.subtle}),/non valida/);
await assert.rejects(()=>verifyHistoricBlob(blob,'0'.repeat(40),{subtle:webcrypto.subtle}),/non valida/);

const plan=planHistoricMediaRecovery({file:['photo.webp']},[{name:'photo.webp',type:'file',sha:hash}],[]);
assert.equal(plan.ok,true);
const staged=await stageHistoricMedia(plan,async sha=>{assert.equal(sha,hash);return blob},{subtle:webcrypto.subtle});
assert.equal(staged.ok,true);
assert.deepEqual(staged.media.map(x=>x.path),['img/photo.webp']);
assert.equal(staged.totalBytes,source.length);
const failed=await stageHistoricMedia(plan,async()=>({...blob,content:'!!!'}),{subtle:webcrypto.subtle});
assert.equal(failed.ok,false);
assert.deepEqual(failed.media,[],'Invalid media never enters draft');
assert.equal((await stageHistoricMedia(plan,async()=>blob,{subtle:webcrypto.subtle,maxFiles:0})).ok,false);
assert.equal((await stageHistoricMedia(plan,async()=>blob,{subtle:webcrypto.subtle,maxTotalBytes:2})).ok,false);
console.log('✔ Historic media: complete blob SHA verification, bounded memory and fail-closed staging');
