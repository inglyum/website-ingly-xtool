/* Keynote: la sezione in stile Apple della home resta onesta e sicura.
   Foto locali e reali, alt presenti, varianti srcset esistenti, testi via
   textContent, livello CSS in coda al foglio autorevole del marchio. */
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const read = f => readFileSync(f, 'utf8');
const html = read('index.html');
const css = read('assets/css/brand-system-2026.css');
const js = read('assets/js/ingly-keynote.js');

const start = html.indexOf('<section class="ingly-keynote"');
assert.ok(start > 0, 'La sezione Keynote deve esistere nella home');
const end = html.indexOf('</section>', start);
const section = html.slice(start, end);
assert.ok(start > html.indexOf('id="page-home"') && start < html.indexOf('id="page-shop"'), 'Keynote sta dentro la home');

const imgs = [...section.matchAll(/<img\b[^>]*>/g)].map(m => m[0]);
assert.ok(imgs.length >= 6, 'Le tile mostrano fotografie');
for (const tag of imgs) {
  const alt = (tag.match(/\balt="([^"]*)"/) || [])[1];
  assert.ok(alt && alt.trim().length > 8, 'Ogni immagine ha un alt descrittivo: ' + tag.slice(0, 80));
  const src = (tag.match(/\bsrc="([^"]+)"/) || [])[1];
  assert.ok(src && !/^https?:/i.test(src), 'Nessun URL esterno nelle tile: ' + src);
  assert.ok(existsSync(src), 'La foto esiste nel repository: ' + src);
  const srcset = (tag.match(/\bsrcset="([^"]+)"/) || [])[1] || '';
  for (const part of srcset.split(',').map(x => x.trim().split(/\s+/)[0]).filter(Boolean)) {
    assert.ok(existsSync(part), 'srcset solo con varianti esistenti: ' + part);
  }
  assert.match(tag, /\bwidth="\d+"/, 'width dichiarato'); assert.match(tag, /\bheight="\d+"/, 'height dichiarato');
}

for (const m of section.matchAll(/data-k-it="([^"]*)" data-k-en="([^"]*)"/g)) {
  assert.ok(m[1].trim() && m[2].trim(), 'Ogni testo ha versione italiana e inglese');
}
assert.ok(html.includes('<script defer src="assets/js/ingly-keynote.js"></script>'), 'Script caricato');
assert.ok(!/innerHTML/.test(js.replace(/\/\*[\s\S]*?\*\//g, '')), 'Lo script non usa innerHTML');
assert.match(js, /getElementById\('inglyKeynote'\)/, 'Ambito limitato alla sezione');
new Function(js);

const layer = css.indexOf('INGLY KEYNOTE');
assert.ok(layer > 0 && layer > css.length / 2, 'Il livello Keynote sta in coda al foglio del marchio');
assert.match(css, /prefers-reduced-motion:reduce\)\s*\{\s*\.ingly-keynote/, 'Rispetta reduced-motion');
assert.match(css, /\.atelier-mobile-dock:not\(#k\)\s*\{[^}]*repeat\(5,/, 'La barra mobile tiene cinque voci su una riga');
console.log('✔ Keynote: foto reali e locali, alt, srcset esistenti, testi bilingui sicuri, livello CSS in coda');
