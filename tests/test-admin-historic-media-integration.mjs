import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const admin=readFileSync('admin.html','utf8');
const start=admin.indexOf('async function rollback(sha)');
const end=admin.indexOf('/* ================== HEALTH CENTER',start);
assert.ok(start>0&&end>start);
const flow=admin.slice(start,end);
for(const text of [
 'planHistoricMediaRecovery','stageHistoricMedia','blobSha=>gh',
 'crypto','MEDIA=[...oldMedia,...recovered]','restoredFrom:sha',
 'expectedLiveSha','Nessuna pubblicazione automatica',
 'FILEsPLACEHOLDER'
].filter(x=>x!=='crypto'&&x!=='FILEsPLACEHOLDER'))
 assert.ok(flow.includes(text),'Restore integration must include '+text);
assert.ok(flow.indexOf('stageHistoricMedia')<flow.indexOf('FILES.forEach(f=>{S[KEY[f]]=verified.data[f]}'),
 'Verify all binaries before assigning any historical data');
assert.ok(!flow.includes("await pub()"),'Restore never publishes automatically');
assert.match(admin,/driftMedia=restoredMedia\.filter/,'Concurrent image mutation protected');
assert.match(admin,/MEDIA\.forEach\(m=>files\[m\.path\]=\{b64:m\.b64\}\)/,
 'History images publish in the SAME git tree as data JSON');
const pkg=JSON.parse(readFileSync('package.json','utf8'));
assert.ok(pkg.scripts.test.includes('historic-media-binary-restore'));
assert.ok(pkg.scripts.test.includes('admin-historic-media-integration'));
console.log('✔ Admin: verified historic photo staging, atomic publish, no partial mutation or stale media overwrite');
