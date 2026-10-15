import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as DG from '../assets/js/digitale.js';
const admin=readFileSync('admin.html','utf8');
const products=readFileSync('assets/js/products.js','utf8');
const ui=readFileSync('assets/js/digitale-ui.js','utf8');
assert.match(admin,/d\.stato=d\.stato==='archiviato'\?'bozza':'archiviato'/,'Archiviazione non distruttiva');
assert.doesNotMatch(admin,/digList\(\)\.splice\(\+b\.dataset\.dd,1\)/,'Cancellazione irreversibile rimossa');
assert.match(admin,/price:null,compareAt:null/,'Nuovo bundle senza prezzo arbitrario');
assert.match(products,/d\.stato!=='pubblicato'/,'Protezione diretta carrello digitale');
assert.match(ui,/b\.stato !== 'pubblicato'/,'Protezione dalla UI');
const D={DIGITALE:{attiva:true,bundle:[
{id:101,stato:'bozza',price:8,consegna:{modo:'email'}},
{id:102,stato:'archiviato',price:8,consegna:{modo:'email'}},
{id:103,stato:'pubblicato',price:8,consegna:{modo:'email'}},
]}};
assert.deepEqual(DG.bundle(D).map(x=>x.id),[103],'Bozze e archiviati esclusi dalla vetrina');
assert.equal(DG.trova(D,102).stato,'archiviato','Identificativo archivio conservato');
assert.ok(!DG.bundle(D).some(b=>b.id===102));
console.log('✔ Digital commerce: archiviazione senza perdite, stati e blocco acquisti.');
