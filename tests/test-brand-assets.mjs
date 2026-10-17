import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const html=readFileSync('index.html','utf8');
const css=readFileSync('assets/css/pages.css','utf8');
const logo='assets/images/ingly-logo.svg';
const badge='assets/images/xtool-authorized-service-centre-premium.svg';
for(const p of [logo,badge,'assets/images/ingly-wordmark-light.svg','assets/images/ingly-wordmark-dark.svg']) assert.ok(existsSync(p),'Asset assente: '+p);
assert.ok(html.includes('<div class="watermark ingly-footer-signature"'),'Firma finale INGLY presente');
assert.match(html,/<div class="watermark ingly-footer-signature"[\s\S]*?<img class="brand-wordmark" src="assets\/images\/ingly-wordmark-light\.svg(?:\?v=20261017n2)?"/,'Wordmark originale nel footer');
assert.match(html,/<header class="nav[\s\S]*?<a href="\.\/" class="brand brand--identity"[^>]*><img class="brand-symbol" src="assets\/images\/ingly-logo\.svg"/,'Emblema INGLY in header');
assert.match(html,/id="inglyLoaderBadge"[\s\S]*?src="assets\/images\/ingly-logo\.svg"/,'Loader collegato allo stesso asset');
assert.match(html,/class="ingly-service-centre__media ingly-service-centre__badge"[\s\S]*?src="assets\/images\/xtool-authorized-service-centre-premium\.svg"/,'Badge xTool collegato al Lab');
assert.ok(css.includes('.ingly-service-centre__badge img'),'Layout service badge responsive');
assert.ok(!html.includes('class="watermark" aria-hidden="true">INGLY</div>'),'Vecchia firma esclusa');
console.log('✔ Brand: header, loader, footer e xTool Lab usano asset già nel repository.');

assert.ok(html.includes('href="assets/css/brand-system-2026.css"'),'Design system unificato non caricato');
assert.ok(html.includes('class="brand-lockup"'),'Wordmark e sottotitolo in header');
