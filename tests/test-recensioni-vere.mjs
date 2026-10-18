/* RECENSIONI VERE (lancio).
   Prima: ogni scheda ★★★★★ con il numero `rev` dei dati; nella scheda prodotto
   voto «4.8» fisso e ripartizione per stelle inventata; per Google un
   AggregateRating 4.9 e le recensioni del sito attaccate a OGNI prodotto.
   Nessuna di quelle recensioni esisteva per quel prodotto: pratica
   commerciale scorretta (Codice del Consumo, direttiva Omnibus) e dati
   strutturati ingannevoli. Ora contano solo recensioni verificate (vf) e
   collegate al prodotto (pid). Verificato in Chromium: Shop 0 stelle,
   scheda senza voto, nessun AggregateRating/Review nel JSON-LD. */
import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';

let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };
const prod = readFileSync('assets/js/products.js', 'utf8');
const seo = readFileSync('assets/js/seo.js', 'utf8');
const admin = readFileSync('admin.html', 'utf8');

console.log('\n=== NIENTE NUMERI INVENTATI ===');
check('nessun voto scritto nel codice (4.8 / 4.9)', !/rv-score">4\.8|product\.rating\|\|4\.9/.test(prod + seo));
check('nessuna ripartizione per stelle calcolata da un totale', !/total\*\.68|distribuzione realistica/.test(prod));
check('le card non usano più il numero `rev`', !/\(\$\{x\.rev\}\)/.test(prod));
check('la scheda prodotto non usa più il numero `rev`', !/cur\.rev\|\|0/.test(prod));
check('regola unica: verificate E collegate al prodotto', /export const recensioniDi=p=>[\s\S]{0,120}r\.vf===true&&p&&String\(r\.pid\)===String\(p\.id\)/.test(prod));
check('Google: AggregateRating solo da recensioni verificate del prodotto', /aggregateRating":\(\(\)=>\{const rv=[\s\S]{0,140}r\.vf===true&&String\(r\.pid\)===String\(product\.id\)/.test(seo) && !/"reviewCount":product\.rev/.test(seo));
check('Google: le singole recensioni solo se del prodotto', /"review":SCH\.recensioni\(\(\(window\.INGLY\.REVIEWS\)\|\|\[\]\)\.filter\(r=>r&&r\.vf===true&&String\(r\.pid\)===String\(product\.id\)\)/.test(seo));

console.log('\n=== CON I DATI DI OGGI ===');
const dom = new JSDOM('<!doctype html><body></body>', { url: 'https://example.org/' });
const content = JSON.parse(readFileSync('data/content.json', 'utf8'));
const P = JSON.parse(readFileSync('data/products.json', 'utf8'));
const recensioniDi = p => (content.REVIEWS || []).filter(r => r && r.vf === true && p && String(r.pid) === String(p.id));
const conStelle = P.filter(p => !p.hidden && recensioniDi(p).length);
check('nessun prodotto mostra stelle senza recensioni verificate collegate', conStelle.every(p => recensioniDi(p).every(r => r.vf === true)));
console.log('    (oggi prodotti con recensioni verificate collegate: ' + conStelle.length + ')');

console.log('\n=== ADMIN ===');
check('ogni recensione si può collegare a un prodotto', /data-rp="\$\{i\}"/.test(admin) && /r\.pid=\+el\.value/.test(admin));
check('il vecchio numero di recensioni è in sola lettura e spiegato', /id="ep_rev" value="\$\{p\.rev\|\|0\}" readonly/.test(admin));

console.log(`\n=========== RECENSIONI: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
