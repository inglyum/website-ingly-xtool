/* SCHEDA PRODOTTO — PERSONALIZZAZIONE.
   I prodotti «Si personalizza» non avevano dove scrivere il testo: il
   cliente doveva spiegarlo a parte su WhatsApp. Ora c'è il campo, con
   anteprima indicativa sulla foto, e il testo arriva nel carrello e nei
   messaggi. Verificato in Chromium (1440 giorno/notte, 390). */
import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';
let pass = 0, fail = 0;
const check = (n, c) => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n) } };
const doc = new JSDOM(readFileSync('index.html', 'utf8')).window.document;
const prod = readFileSync('assets/js/products.js', 'utf8');
const admin = readFileSync('admin.html', 'utf8');
const testi = JSON.parse(readFileSync('data/texts.json', 'utf8'));
check('campo nascosto di partenza, con etichetta collegata', doc.getElementById('ppPers')?.hasAttribute('hidden') && doc.querySelector('label[for="ppPersTxt"]'));
check('anteprima sopra la foto, ignorata dai lettori di schermo', doc.querySelector('#ppMain #ppPersPrev[aria-hidden="true"]'));
check('compare solo se il prodotto è personalizzabile', /box\.hidden=!on/.test(prod) && /const on=cur\.personalizzabile===true/.test(prod));
check('il testo va nel carrello', /addToCart\(cur\.id,sel\.qty,matLabel,pers,unit\(\)\)/.test(prod));
check('il testo va nel messaggio WhatsApp/email', /persRiga/.test(prod) && /url\+persRiga/.test(prod));
check('testo obbligatorio: blocca e spiega', /persObbligatorio===true&&!pers/.test(prod) && /toast\(T\('persReq'\)\)/.test(prod));
check('il testo si azzera cambiando prodotto', /sel=\{qty:1,pers:''\}/.test(prod));
check('testi in IT e EN', ['persLabel', 'persPh', 'persNote', 'persReq', 'persMsg'].every(k => testi.it[k] && testi.en[k]));
check('Admin: etichetta, lunghezza, obbligo', ['ep_persEt', 'ep_persMax', 'ep_persObb'].every(id => admin.includes(`id="${id}"`)));
check('Admin: niente più «valutazione per Google» (non usata dal sito)', !admin.includes('id="ep_rating"'));
check('tempi di consegna dalle Spedizioni dell\'Admin', /CONFIG\.spedizione\|\|\{\},v=sp\.tempiConsegna/.test(prod) && doc.getElementById('ppShip'));
console.log(`\n=========== PERSONALIZZAZIONE: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
