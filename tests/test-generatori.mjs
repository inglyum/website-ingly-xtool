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

const required = ['portachiavi', 'living-hinge', 'test-materiali', 'cake-topper', 'scatola-incastri'];
assert.ok(Array.isArray(data.GENERATORI), 'data/content.json must define GENERATORI');
for (const id of required) {
  assert.ok(data.GENERATORI.some(g => g.id === id && g.modulo === id), 'missing generator catalog entry: ' + id);
  assert.ok(html.includes("'" + id + "'"), 'missing implemented generator engine: ' + id);
}
assert.ok(html.includes('function panelPath('), 'box finger-joint geometry must be implemented');
assert.ok(html.includes('function downloadSvg('), 'SVG export must be implemented');
assert.ok(html.includes('function saveDraft('), 'local draft save must be implemented');
assert.ok(admin.includes('id="v-generators"'), 'Admin view must exist');
assert.ok(admin.includes('function renderGenerators()'), 'Admin catalog editor must exist');
assert.ok(admin.includes('generators:renderGenerators'), 'Admin router must expose the editor');
assert.ok(admin.includes('function editGenerator('), 'Admin must support create/edit operations');
assert.ok(sitemap.includes('https://www.inglydesign.it/generatori.html'), 'Generator Studio must be in sitemap');

console.log('✔ Generator Studio catalog, SVG engine, Admin integration and sitemap');
