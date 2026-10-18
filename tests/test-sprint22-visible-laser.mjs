import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import { FOGLI, caricato, posizione, ultimo, bundleCaricato } from './_fogli-css.mjs';
const css=readFileSync('assets/css/brand-system-2026.css','utf8');
const html=readFileSync('index.html','utf8');
assert.match(css,/#heroH1 \.w:has\(> \.engrave\)/);
assert.match(css,/#heroH1 \.w > \.engrave\{[\s\S]*?display:inline-block!important/);
assert.match(css,/#heroH1 \.w > \.engrave::after\{/);
assert.match(css,/prefers-reduced-motion:reduce/);
/* la cache si rinnova con la versione del bundle (impronta del contenuto), non più a mano */
assert.ok(bundleCaricato&&caricato('brand-system-2026.css'),'CSS del marchio caricato con versione aggiornata');
console.log('✔ Engraved hero words have visible, finite laser width and versioned CSS');
