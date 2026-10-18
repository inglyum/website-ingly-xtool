import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
const r=spawnSync(process.execPath,['scripts/launch-readiness-audit.mjs','--json'],{encoding:'utf8'});
assert.equal(r.status,0,r.stderr);
const report=JSON.parse(r.stdout.trim().split('\n').at(-1));
assert.equal(report.gates.length,4);
assert.ok(report.visibleProducts>=report.visibleWithLocalCover);
assert.ok(report.visibleNeedingLocalCover>=0);
assert.equal(report.source,'read-only repository data; not end-to-end acceptance');
for(const gate of report.gates){assert.equal(typeof gate.ok,'boolean');assert.ok(gate.evidence);}
assert.ok(report.manualGates.some(x=>x.includes('admin upload')));
assert.ok(report.manualGates.some(x=>x.includes('inbox receipt')));
console.log('✔ Commercial launch checklist reports configuration honestly without a live-delivery claim');
