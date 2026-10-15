/* INGLY DESIGN Generator Studio: catalog wiring and inline script syntax. */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync('generatori.html', 'utf8');
const admin = readFileSync('admin.html', 'utf8');
const data = JSON.parse(readFileSync('data/content.json', 'utf8'));
const sitemap = readFileSync('sitemap.xml', 'utf8');

const scriptMatch = html.match(/<script>([\s\S]*?)<\/script>/i);
assert.ok(scriptMatch, 'Generator Studio must include its runtime');
assert.doesNotThrow(() => new Function(scriptMatch[1]), 'Generator Studio JavaScript must parse');

const required = ['portachiavi', 'living-hinge', 'test-materiali', 'cake-topper', 'scatola-incastri', 'ornamento', 'ingranaggio'];
assert.ok(Array.isArray(data.GENERATORI), 'data/content.json must define GENERATORI');
for (const id of required) {
  assert.ok(data.GENERATORI.some(g => g.id === id && g.modulo === id), 'missing generator catalog entry: ' + id);
  assert.ok(html.includes("'" + id + "'"), 'missing implemented generator engine: ' + id);
}
assert.ok(html.includes('function panelPath('), 'box finger-joint geometry must be implemented');
assert.ok(html.includes("active==='ingranaggio'"), 'parametric gear generator must be implemented');
assert.ok(html.includes('function downloadSvg('), 'SVG export must be implemented');
assert.ok(html.includes('function saveDraft('), 'local draft save must be implemented');
assert.ok(html.includes("if(data&&Array.isArray(data.GENERATORI))"), 'an intentionally empty catalog must not repopulate deleted defaults');
assert.ok(admin.includes('id="v-generators"'), 'Admin Generator Studio view must exist');
assert.ok(admin.includes("['generators','✳','Generatori INGLY']"), 'Admin sidebar must expose Generator Studio');
assert.ok(admin.includes('function renderGenerators()'), 'Admin catalog editor must exist');
assert.ok(admin.includes('generators:renderGenerators'), 'Admin router must expose the editor');
assert.ok(admin.includes('function editGenerator('), 'Admin must support create/edit operations');
assert.ok(admin.includes('data-gen-toggle'), 'Admin must support activation and deactivation');
assert.ok(admin.includes('data-gen-up'), 'Admin must support generator ordering');
assert.ok(admin.includes('data-gen-del'), 'Admin must support generator removal');
assert.equal((admin.match(/id="genNew"/g)||[]).length, 1, 'Admin must have a single Add Generator control');
assert.equal((admin.match(/id="v-generators"/g)||[]).length, 1, 'Admin must not duplicate Generator Studio views');
assert.ok(sitemap.includes('https://www.inglydesign.it/generatori.html'), 'Generator Studio must be in sitemap');
assert.ok(data.GENERATORI.some(g => g.id === 'cuttle-templates' && g.modulo === 'link-esterno'), 'Cuttle must remain a clearly external link');
assert.ok(data.GENERATORI.some(g => g.id === 'makorix-reference' && g.modulo === 'link-esterno'), 'Makorix must be labelled as an external reference');
assert.ok(html.includes('https://cuttle.xyz/templates'), 'Cuttle catalog link must point to the official site');
assert.ok(html.includes('https://makorix.com/'), 'Makorix reference must point to the supplied official site');
assert.ok(html.includes('id="INGLY_CUT"') && html.includes('id="INGLY_ENGRAVE"'), 'SVG export must keep separate machine-operation groups');
assert.ok(html.includes('const faceH=s.shape===\'circle\'?Math.min(w-1,requestedH-1):requestedH'), 'cake topper uses a dimensioned face joined to its stake');
assert.ok(html.includes("{top:'plain',right:'female',bottom:'female',left:'female'}"), 'front and back panels have complementary finger-joint edges');
assert.ok(html.includes("{top:'plain',right:'male',bottom:'female',left:'male'}"), 'side panels have complementary finger-joint edges');
assert.ok(html.includes('assets/images/ingly-logo.svg') || html.includes('assets/images/ingly-maison-mark.svg'), 'Generator Studio must use an existing INGLY DESIGN brand asset');
assert.ok(admin.includes('assets/images/ingly-logo.svg') || admin.includes('assets/images/ingly-maison-mark.svg'), 'Admin must render a valid INGLY DESIGN brand mark');
assert.ok(readFileSync('index.html', 'utf8').includes('assets/images/ingly-logo.svg'), 'main site uses the supplied INGLY DESIGN logo');
const engineCatalog = readFileSync('assets/js/generatori-catalog.js', 'utf8');
assert.ok(engineCatalog.includes("id: 'ornamento'"), 'Admin catalog registry must include the seasonal ornament engine');
assert.ok(engineCatalog.includes("id: 'makorix-reference'"), 'first-run defaults must include Makorix as external reference');
assert.ok(html.includes('id="INGLY_TEXT"'), 'SVG must preserve a separate engraving/text layer');
assert.ok(html.includes('id="INGLY_CUT"') && html.includes('id="INGLY_ENGRAVE"'), 'SVG must keep separate machine-operation layers');

console.log('✔ Generator Studio catalog, SVG engine, Admin integration and sitemap');
