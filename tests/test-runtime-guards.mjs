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
const swVersion = (sw.match(/CACHE_VER\s*=\s*'ingly-v(\d+)'/)||[])[1];
assert.ok(Number(swVersion)>=14,'service worker must invalidate the old visual assets');
const root=read('index.html');
const htmlVersion = (root.match(/CACHE_WANT='ingly-v(\d+)'/)||[])[1];
assert.equal(swVersion,htmlVersion,'HTML recovery requests the same cache generation as service worker');
const nav=read('assets/js/nav-mega.js');
assert.doesNotMatch(nav,/addEventListener\('pointerenter'/,'mega menu never opens by pointer hover');
const fallback=read('assets/js/app.fallback.js');
assert.doesNotMatch(fallback,/addEventListener\("pointerenter"/,'fallback bundle also never opens by pointer hover');
const css=read('assets/css/pages.css');
/* PALETTE DEL MARCHIO — brief enterprise 2026: Titanium, Graphite, Warm
   White, Champagne; niente verde, niente blu, niente gradienti di colore.
   Le regole qui sotto hanno lo stesso scopo di quelle che sostituiscono
   (che fissavano la palette blu notte precedente): una sola base, i temi
   stagionali non possono cambiare l'identità, l'artwork generato usa la
   palette del marchio, lo sfondo è uno solo. Cambia solo dove sta: in
   tokens.css, non più scritta in linea dal JavaScript. */
const tokens=read('assets/css/tokens.css');
const products=read('assets/js/products.js');
assert.match(tokens,/--c-titanium:#111318;/,'brand palette has a single Titanium base');
assert.match(tokens,/--bg-page:var\(--c-titanium\);/,'night page background is the Titanium base');
assert.match(products,/TOKEN_IDENTITA\.forEach\(k=>root\.style\.removeProperty\(k\)\)/,'seasonal themes cannot override the core brand palette');
assert.doesNotMatch(products.replace(/\/\*[\s\S]*?\*\//g,''),/#0D2043|#4778BD/i,'no hardcoded navy/blue identity left in the theme engine');
assert.match(products,/export const ART_PALETTE = \['#111318', '#272B31', '#C5A46D'\];/,'generated artwork uses the INGLY brand palette');
assert.match(products,/window\.INGLY_ART\.css\(th\.bg,ART_PALETTE,/,'generated category artwork uses the same palette constant');
assert.match(fallback,/\["#111318","#272B31","#C5A46D"\]/,'fallback bundle carries the same brand palette');
const content=JSON.parse(readFileSync(new URL('../data/content.json',import.meta.url),'utf8'));
assert.deepEqual(content.THEMES.temi.find(x=>x.id==='default').palette,['#111318','#272B31','#C5A46D'],'the default Admin theme uses the INGLY titanium/graphite/champagne palette');
assert.match(tokens,/--c-champagne:#C5A46D;/,'brand palette uses a consistent champagne accent');
assert.match(tokens,/--brand-gold:var\(--accent\);/,'every legacy gold name resolves to the readable accent');
assert.doesNotMatch(css,/#0d2043|#0b1c3b|#10264c/i,'no navy gradient left in the page stylesheet');
assert.match(css,/background:var\(--bg-page\)/,'site background is one token, not a stack of gradients');
assert.match(css,/\.pcard,\.dcard,\.rcard,\.matcard,\.bcard:not\(\.bcard--photo\):not\(\.bcard--gen\)/,'catalog cards share the blue surface system');
assert.match(root,/id="loader"/,'loader exists in the canonical shell');
console.log('✓ Runtime guards and cache invalidation checks passed');
