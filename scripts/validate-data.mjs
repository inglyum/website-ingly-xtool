/* ============ VALIDAZIONE DATI (CI) ============
   Eseguito da GitHub Actions a ogni modifica in data/.
   Blocca il merge se il catalogo è incoerente — non dopo che è già online. */
import { readFileSync, existsSync } from 'fs';

let errors = [];
const warn = [];
const J = f => {
  try { return JSON.parse(readFileSync('data/' + f, 'utf8')); }
  catch (e) { errors.push(`data/${f}: JSON non valido — ${e.message}`); return null; }
};

const P = J('products.json');
const CATS = J('categories.json');
const CONFIG = J('config.json');
J('texts.json'); J('social.json'); J('content.json'); J('version.json');

if (P && Array.isArray(P)) {
  const ids = P.map(p => p.id);
  const dupIds = ids.filter((v, i) => ids.indexOf(v) !== i);
  if (dupIds.length) errors.push('ID prodotto duplicati: ' + [...new Set(dupIds)].join(', '));

  P.forEach(p => {
    if (!p.n || !String(p.n.it || '').trim()) errors.push(`Prodotto #${p.id}: nome italiano mancante`);
    if (!(p.price > 0)) errors.push(`Prodotto #${p.id}: prezzo non valido (${p.price})`);
    if (CATS && !CATS.some(c => c.id === p.cat)) errors.push(`Prodotto #${p.id}: categoria "${p.cat}" inesistente`);
    if (CATS) {
      const c = CATS.find(c => c.id === p.cat);
      if (c && c.sub && c.sub.length && (p.sub < 1 || p.sub > c.sub.length))
        errors.push(`Prodotto #${p.id}: sottocategoria ${p.sub} fuori indice per "${p.cat}" (valori validi: 1–${c.sub.length})`);
    }
    if (!p.hidden && !existsSync('img/' + p.id + '.webp') && !p.img)
      warn.push(`Prodotto #${p.id} ("${p.n && p.n.it}"): nessuna foto in img/${p.id}.webp (userà il segnaposto)`);
  });
} else if (P === null) { /* già segnalato sopra */ }
else errors.push('products.json non è un array');

if (CONFIG) {
  const hf = CONFIG.heroFeatured || [];
  const ids = new Set((P || []).map(p => p.id));
  hf.forEach(id => { if (!ids.has(+id)) errors.push('config.heroFeatured punta a un prodotto inesistente: ' + id); });
}

/* ---- FILE DIGITALI ----
   Gli stessi controlli di assets/js/digitale.js, su cui gira la pagina:
   qui servono perche' la CI veda un bundle non pubblicabile prima che
   finisca online, non dopo. Il controllo che conta e' l'ultimo: un bundle
   «pubblicato» che non dice come arriva al cliente farebbe comparire
   «Aggiungi» per un file che nessuno manda. */
let nDig = 0;
try {
  const DG = JSON.parse(readFileSync('data/digitale.json', 'utf8'));
  const B = Array.isArray(DG.bundle) ? DG.bundle : [];
  nDig = B.length;
  const vistiD = new Set();
  B.forEach(b => {
    const et = `File digitale #${b.id}`;
    const k = String(b.id);
    if (vistiD.has(k)) errors.push(`${et}: id duplicato`);
    vistiD.add(k);
    if (!b.n || !String(b.n.it || '').trim()) errors.push(`${et}: nome italiano mancante`);
    if (b.cat && !(DG.categorie || []).some(c => c.id === b.cat)) errors.push(`${et}: categoria "${b.cat}" inesistente`);
    if (b.licenza && !(DG.licenze || []).some(l => l.id === b.licenza)) errors.push(`${et}: licenza "${b.licenza}" inesistente`);
    if (!(b.f || []).length) errors.push(`${et}: nessun formato dichiarato`);
    ((b.compatibilita || {}).software || []).forEach(sw => {
      if (!(DG.software || []).some(x => x.id === sw)) errors.push(`${et}: software "${sw}" inesistente`);
    });
    if (b.stato === 'pubblicato') {
      const c = b.consegna || {};
      const ok = c.modo === 'email' || (c.modo === 'link' && /^https?:\/\//i.test(String(c.url || '')));
      if (!ok) errors.push(`${et}: pubblicato ma senza consegna dichiarata`);
      if (!(b.contenuto || []).length) errors.push(`${et}: pubblicato senza dire cosa contiene`);
      if (!(b.price >= 0)) errors.push(`${et}: pubblicato senza prezzo`);
    } else warn.push(`${et}: in bozza, non compare sul sito`);
  });
  /* La lista vecchia non deve tornare in content.json. */
  try {
    const C = JSON.parse(readFileSync('data/content.json', 'utf8'));
    if (C.DIG !== undefined) errors.push('content.json contiene ancora DIG: i file digitali stanno in data/digitale.json');
  } catch (e) {}
} catch (e) {
  warn.push('data/digitale.json non leggibile: ' + e.message);
}

console.log(`Controllati: ${(P || []).length} prodotti, ${(CATS || []).length} categorie, ${nDig} file digitali.\n`);
if (warn.length) { console.log('⚠ Avvisi (non bloccanti):'); warn.forEach(w => console.log('  - ' + w)); console.log(''); }
if (errors.length) {
  console.log('❌ Errori:'); errors.forEach(e => console.log('  - ' + e));
  process.exit(1);
}
console.log('✅ Dati validi.');
