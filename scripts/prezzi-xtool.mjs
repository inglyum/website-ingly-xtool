#!/usr/bin/env node
/* PREZZI xTool — legge dallo shop ufficiale europeo (xtool.eu, Shopify) prezzo,
   prezzo barrato e disponibilità di ogni configurazione delle macchine che in
   data/macchine.json hanno `shop.url`.

   Uso:
     node scripts/prezzi-xtool.mjs            → solo resoconto, non scrive niente
     node scripts/prezzi-xtool.mjs --scrivi   → aggiorna data/macchine.json
     node scripts/prezzi-xtool.mjs --scopri x1 c1   → cerca gli indirizzi dei prodotti

   Gira su GitHub Actions (workflow prezzi-xtool.yml): ogni giorno controlla e,
   se qualcosa è cambiato, prepara una proposta di modifica da approvare.
   Niente commit automatici su main (regola 5): i prezzi sono un'affermazione
   commerciale, li approva una persona.

   Lo shop risponde con prezzi IVA inclusa per l'Italia sull'indirizzo /it/
   (verificato: anche senza cookie e da un server fuori Italia).
   Shopify espone per ogni prodotto l'indirizzo pubblico <url>.js con le varianti:
   price e compare_at_price in centesimi, available vero/falso. */
import { readFileSync, writeFileSync, appendFileSync } from 'node:fs';
import { varianti, confronta, norm, aggiornaMacchina, URL_SHOP, urlShopItalia } from '../assets/js/prezzi-xtool-core.js';
export { varianti, confronta };

const FILE = 'data/macchine.json';
const UA = 'Mozilla/5.0 (compatible; INGLY-DESIGN-prezzi/1.0; +https://www.inglydesign.it)';
const args = process.argv.slice(2);
const SCRIVI = args.includes('--scrivi');

async function getJson(url, paese = 'IT') {
  const r = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'application/json', Cookie: `localization=${paese}; cart_currency=EUR` } });
  if (!r.ok) throw new Error(`HTTP ${r.status} su ${url}`);
  return r.json();
}

async function scopri(parole) {
  const out = [];
  for (let page = 1; page <= 4; page++) {
    const j = await getJson(`https://www.xtool.eu/products.json?limit=250&page=${page}`);
    if (!j.products || !j.products.length) break;
    j.products.forEach(p => { if (parole.some(w => norm(p.handle + ' ' + p.title).includes(norm(w)))) out.push(p); });
  }
  for (const p of out) {
    console.log(`\n▸ ${p.title}\n  https://www.xtool.eu/products/${p.handle}`);
    p.variants.forEach(v => console.log(`   - ${v.title} · ${v.price} € ${v.compare_at_price ? '(barrato ' + v.compare_at_price + ' €)' : ''} · ${v.available === false ? 'esaurita' : 'disponibile'}`));
  }
  if (!out.length) console.log('Nessun prodotto trovato per:', parole.join(', '));
}

async function main() {
  if (args[0] === '--scopri') return scopri(args.slice(1));
  const M = JSON.parse(readFileSync(FILE, 'utf8'));
  const oggi = new Date().toISOString().slice(0, 10);
  const righe = [];
  let cambi = 0, errori = 0;
  for (const m of M.catalogo || []) {
    const url = m.shop && m.shop.url;
    if (!url || !URL_SHOP.test(url)) continue;
    const nome = (m.n && m.n.it) || m.id;
    try {
      /* stesso indirizzo /it/ usato dal pulsante dell'Admin: prezzi per l'Italia */
      const p = await getJson(urlShopItalia(url) + '.js', m.shop.paese || 'IT');
      const r = aggiornaMacchina(m, p, { scrivi: SCRIVI, oggi });
      righe.push(`\n## ${nome}\nShop: ${url}`);
      r.varianti.forEach(v => righe.push(`- ${v.nome}: ${v.prezzo} €${v.listino ? ` (barrato ${v.listino} €)` : ''} · ${v.disponibile ? 'disponibile' : 'esaurita'}`));
      r.cambi.forEach(x => righe.push(`  ⚠ ${x.nome} · ${x.campo}: ${x.prima} → ${x.dopo}`));
      r.mancanti.forEach(n => righe.push(`  ✖ ${n}: non trovata nello shop (nome o sku cambiati?)`));
      /* le varianti in più (es. pacchetti con accessori) si elencano ma non
         fanno scattare l'avviso: sul sito si mostrano solo quelle scelte */
      if (r.altre.length) righe.push(`  ℹ altre ${r.altre.length} varianti nello shop (non mostrate sul sito): ${r.altre.map(v => v.nome).join(' · ')}`);
      cambi += r.cambi.length; errori += r.mancanti.length;
    } catch (e) {
      errori++;
      righe.push(`\n## ${nome}\n✖ ${e.message}`);
    }
  }
  if (SCRIVI && cambi) M._prezziAggiornati = `${oggi}: prezzi e disponibilità letti dallo shop ufficiale xtool.eu (IVA inclusa, Italia).`;
  if (SCRIVI) writeFileSync(FILE, JSON.stringify(M, null, 2) + '\n');
  const testo = `# Prezzi xTool — ${oggi}\n${righe.join('\n')}\n\nModifiche: ${cambi} · errori: ${errori}\n`;
  console.log(testo);
  if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, testo);
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `cambi=${cambi}\nerrori=${errori}\n`);
}

const diretto = import.meta.url === `file://${process.argv[1]}`;
if (diretto) main().catch(e => { console.error('✖', e.message); process.exit(1); });
