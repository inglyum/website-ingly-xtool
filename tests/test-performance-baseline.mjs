import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const script=readFileSync('scripts/performance-baseline.mjs','utf8');
assert.match(script,/static-assets\.json/);
assert.match(script,/statSync\(path\)\.size/);
assert.match(script,/Missing critical assets/);
assert.match(script,/not network transfer or Core Web Vitals/);
console.log('✔ Source-weight baseline scope, output and missing-reference guard');
