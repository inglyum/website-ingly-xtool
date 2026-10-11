/* ============ MARCA I PRODOTTI PERSONALIZZABILI ============

   Quali pezzi il cliente può far suoi. Non è un giudizio mio sul catalogo:
   è quello che i prodotti **dichiarano già nel proprio nome e nella propria
   descrizione**. Un pezzo che si chiama «Targa Nascita Personalizzata» o
   «Borraccia Incisa con Logo Aziendale» sta dicendo che aspetta qualcosa
   dal cliente — un nome, una data, una foto, un logo, un testo.

   La regola è scritta qui e non a mano nei dati, per tre motivi:
     - si rilegge: chiunque può vedere perché un prodotto è stato marcato;
     - si ricorre: cambiando il catalogo basta rilanciare;
     - si corregge: la spunta nell'Admin vince sempre, prodotto per
       prodotto, e questo script non tocca chi è già stato deciso a mano.

   Uso:  node scripts/marca-personalizzabili.mjs            (anteprima)
         node scripts/marca-personalizzabili.mjs --scrivi   (applica)

   Quello che NON fa: non marca un prodotto perché «tanto un laser incide
   tutto». Se il prodotto non dice che aspetta qualcosa dal cliente, resta
   fuori, e lo si spunta dall'Admin se è il caso. */

import { readFileSync, writeFileSync } from 'fs';

const SCRIVI = process.argv.includes('--scrivi');
const FILE = 'data/products.json';

/* I segnali, raggruppati per che cosa il cliente deve fornire. Servono a
   spiegare la scelta, non solo a prenderla. */
const SEGNALI = [
  /* `\bnome\b` da solo basta: in questo catalogo un pezzo che nomina «nome»
     è una scritta, una targa o un'incisione che aspetta il nome di
     qualcuno. Verificato caso per caso su tutti i 63 visibili. */
  ['un nome o un testo', /personalizzat|personalizzabil|su misura|\bnome\b|con il tuo|a tua scelta|con scritta|con frase|dedica/i],
  ['una data o un evento', /con data|data personalizzat|anniversario|nascita|battesimo|laurea|matrimonio|nozze|comunione|compleanno/i],
  ['una foto o un ritratto', /ritratto|con foto|da foto|silhouette|litofania/i],
  ['un logo aziendale', /logo|branding|aziendal|corporate/i],
  ['un codice o un collegamento', /\bqr\b|codice qr|profilo digitale|menu digitale/i],
  ['un monogramma', /monogramm|iniziali/i],
];

const testo = p => [p.n && p.n.it, p.n && p.n.en, p.desc && p.desc.it, p.desc && p.desc.en]
  .filter(Boolean).join(' ');

/** Perché questo prodotto è personalizzabile, oppure null. */
export function perche(p) {
  const t = testo(p);
  const trovati = SEGNALI.filter(([, re]) => re.test(t)).map(([nome]) => nome);
  return trovati.length ? trovati : null;
}

const prodotti = JSON.parse(readFileSync(FILE, 'utf8'));
const visibili = prodotti.filter(p => !p.hidden);

let marcati = 0, giaDecisi = 0, fuori = [];
for (const p of prodotti) {
  /* Un prodotto già deciso a mano nell'Admin non si tocca: la persona che
     conosce il pezzo vince sulla regola che legge il titolo. */
  if (Object.prototype.hasOwnProperty.call(p, 'personalizzabile')) { giaDecisi++; continue; }
  if (p.hidden) continue;
  const motivi = perche(p);
  if (motivi) { if (SCRIVI) p.personalizzabile = true; marcati++; }
  else fuori.push(p);
}

console.log(`\n  Prodotti visibili: ${visibili.length}`);
console.log(`  Già decisi a mano nell'Admin (non toccati): ${giaDecisi}`);
console.log(`  Marcati «si personalizza»: ${marcati}`);
console.log(`  Restano fuori: ${fuori.length}`);
if (fuori.length) {
  console.log('\n  Fuori, perché non dichiarano niente che il cliente debba fornire:');
  for (const p of fuori) console.log('   · #' + p.id + ' ' + String((p.n && p.n.it) || '').slice(0, 66));
  console.log('\n  Se uno di questi si personalizza, spuntalo nell\'Admin: la spunta');
  console.log('  vince sulla regola e questo script non la tocca più.');
}

if (SCRIVI) {
  writeFileSync(FILE, JSON.stringify(prodotti, null, 2) + '\n');
  console.log('\n  ✔ data/products.json aggiornato.\n');
} else {
  console.log('\n  (anteprima — rilancia con --scrivi per applicare)\n');
}
