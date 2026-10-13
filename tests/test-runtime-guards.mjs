import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const main=read('assets/js/main.js');
const utils=read('assets/js/utils.js');
const app=read('assets/js/app.js');
const sw=read('sw.js');

assert.match(main,/function safeRun\(label, task\)/,'startup has a component-level error boundary');
assert.match(main,/window\.__INGLY_RUNTIME_ERRORS\.push\(item\)/,'render failures remain diagnosable instead of being swallowed');
assert.match(main,/jobs\.forEach\(\(\[label,task\]\)=>safeRun\('render\/'\+label,task\)\)/,'one failed renderer cannot stop all remaining site sections');
assert.match(main,/safeRun\('render iniziale',renderAll\)/,'initial render is guarded');
assert.match(main,/safeRun\('configurazione contatti',applyConfig\)/,'config boot is guarded');
assert.match(utils,/if\(message\) message\.textContent/,'toast message setter tolerates absent optional markup');
assert.ok(app.includes("panel.append('⚠️ Impossibile caricare i dati del sito. '"),'boot error is rendered as text, not raw HTML');
assert.match(sw,/CACHE_VER\s*=\s*'ingly-v10'/,'old service-worker caches are invalidated on deploy');
const root=read('index.html');
assert.match(root,/id="loader"/,'loader exists in the canonical shell');
console.log('✓ Runtime guards and cache invalidation checks passed');
