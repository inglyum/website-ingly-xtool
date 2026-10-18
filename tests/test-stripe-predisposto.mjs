/* PAGAMENTO CON CARTA (STRIPE) — PREDISPOSTO, SPENTO.

   Decisione del titolare (ottobre 2026): per ora il negozio va su Shopify
   (opzione C); sul sito resta pronta la struttura Stripe (opzione A), non
   attiva. Questo test garantisce tre cose:
   1. oggi, con i dati pubblicati, nessun bottone «Paga» può comparire;
   2. acceso, il bottone compare SOLO con un vero Payment Link buy.stripe.com
      per quel prodotto, visibile e con prezzo;
   3. nessuna chiave Stripe (sk_/rk_) può finire nei file pubblici. */
import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';
import * as C from '../assets/js/commerce.js';

let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };

const config = JSON.parse(readFileSync('data/config.json', 'utf8'));
const P = JSON.parse(readFileSync('data/products.json', 'utf8'));
const html = readFileSync('index.html', 'utf8');
const prodJs = readFileSync('assets/js/products.js', 'utf8');
const admin = readFileSync('admin.html', 'utf8');
const val = readFileSync('scripts/validate-data.mjs', 'utf8');
const sic = readFileSync('tests/test-sicurezza.mjs', 'utf8');

console.log('\n=== OGGI È SPENTO ===');
check('config.json: checkout.stripe.attivo è false', config.checkout && config.checkout.stripe && config.checkout.stripe.attivo === false);
check('nessun prodotto mostra «Paga» con i dati pubblicati', P.every(p => C.stripeProdotto(config, p) === ''));
const btn = new JSDOM(html).window.document.getElementById('productContactStripe');
check('il bottone esiste nella scheda prodotto ed è nascosto in partenza', btn && btn.hasAttribute('hidden'));
check('la scheda prodotto lo mostra solo tramite stripeProdotto()', /CM\.stripeProdotto\(CONFIG,cur\)/.test(prodJs) && /st\.hidden=!link/.test(prodJs));

console.log('\n=== ACCESO: SOLO LINK VERI ===');
const p = P.find(x => !x.hidden && Number(x.price) > 0);
const on = links => ({ checkout: { stripe: { attivo: true } }, stripeLinks: links });
const buono = 'https://buy.stripe.com/test_abc123XYZ';
check('acceso + link valido → bottone', C.stripeProdotto(on({ [p.id]: buono }), p) === buono);
check('spento + link valido → niente', C.stripeProdotto({ checkout: { stripe: { attivo: false } }, stripeLinks: { [p.id]: buono } }, p) === '');
check('«attivo»: "true" (stringa) non accende', C.stripeProdotto({ checkout: { stripe: { attivo: 'true' } }, stripeLinks: { [p.id]: buono } }, p) === '');
for (const falso of ['http://buy.stripe.com/abc', 'https://buy.stripe.com.evil.it/abc', 'https://evil.it/?buy.stripe.com/abc', 'javascript:alert(1)', 'https://checkout.stripe.com/c/pay/abc', 'buy.stripe.com/abc'])
  check('link non valido rifiutato: ' + falso, C.stripeProdotto(on({ [p.id]: falso }), p) === '');
check('prodotto nascosto → niente', C.stripeProdotto(on({ [p.id]: buono }), { ...p, hidden: true }) === '');
check('prodotto senza prezzo → niente', C.stripeProdotto(on({ [p.id]: buono }), { ...p, price: null }) === '');
check('link di un altro prodotto → niente', C.stripeProdotto(on({ 999999: buono }), p) === '');

console.log('\n=== ADMIN E CI ===');
check('l\'Admin ha l\'interruttore, spento per primo', /data-b="CONFIG\.checkout\.stripe\.attivo"><option value="false">Spento<\/option>/.test(admin));
check('validaBozza blocca link non buy.stripe.com', /Stripe: il link del prodotto/.test(admin));
check('la CI blocca link non validi o per prodotti inesistenti', /stripeLinks\.\$\{id\}: non è un Stripe Payment Link/.test(val) && /il prodotto \$\{id\} non esiste/.test(val));

console.log('\n=== NESSUNA CHIAVE STRIPE NEI FILE PUBBLICI ===');
const finta = 'sk_live_' + 'a'.repeat(24);
for (const [nome, src] of [['Admin', admin], ['CI', val], ['test sicurezza', sic]]) {
  const re = new RegExp((src.match(/FORMATI_CHIAVE\s*=\s*\/(.+?)\/;/) || src.match(/const segreti = \/(.+?)\/;/) || [])[1] || '$^');
  check(nome + ' riconosce una chiave segreta Stripe', re.test(finta) && re.test('rk_test_' + 'b'.repeat(20)));
}
check('nessun file di dati contiene una chiave Stripe', !/\b[sr]k_(?:live|test)_[A-Za-z0-9]{16,}/.test(readFileSync('data/config.json', 'utf8')));

console.log(`\n=========== STRIPE: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
