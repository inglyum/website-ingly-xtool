/* PREZZI xTool: lo script che legge lo shop ufficiale accoppia bene le
   configurazioni del sito, segnala i cambi e non fa commit da solo. */
import { readFileSync } from 'node:fs';
import { varianti, confronta } from '../scripts/prezzi-xtool.mjs';
let ok = 0, ko = 0; const t = (n, c) => { c ? ok++ : ko++; console.log((c ? '  ✔ ' : '  ✘ ') + n); };
const shop = { title: 'X1', variants: [
  { public_title: 'Single CO2 / Other laser sources not supported / Standalone', price: 342733, compare_at_price: 372983, available: true, sku: 'A1' },
  { public_title: 'CO2 + Diode Galvo / No Add-On Laser / Standalone', price: 410000, compare_at_price: 433483, available: false, sku: 'B1' },
  { public_title: 'Versatile Bundle', price: 500000, compare_at_price: null, available: true, sku: 'X' } ] };
const v = varianti(shop);
t('centesimi → euro, barrato e disponibilità', v[0].prezzo === 3427.33 && v[0].listino === 3729.83 && v[1].disponibile === false && v[2].listino === null);
const conf = [
  { nome: 'A', nomeShop: 'Single CO2 / Other laser sources not supported / Standalone', prezzo: 3427.33, listino: 3729.83, disponibile: true },
  { nome: 'B', prezzo: 4032.33, listino: 4334.83, disponibile: true, sku: 'B1' },
  { nome: 'C', nomeShop: 'sparita' } ];
const r = confronta(conf, v);
const vere = r.modifiche.filter(m => m.applica);
t('nessun cambio dove i prezzi coincidono', !r.modifiche.some(m => m.nome === 'A'));
t('cambio di prezzo e di disponibilità rilevati (per sku)', vere.length === 2 && vere.every(m => m.nome === 'B'));
t('configurazione sparita dallo shop segnalata', r.modifiche.some(m => m.nome === 'C' && !m.applica));
t('varianti in più elencate a parte', r.nuove.length === 1 && r.nuove[0].nome === 'Versatile Bundle');
vere.forEach(m => m.applica());
t('applicando, la configurazione si aggiorna', conf[1].prezzo === 4100 && conf[1].disponibile === false);
const wf = readFileSync('.github/workflows/prezzi-xtool.yml', 'utf8');
t('workflow giornaliero, nessun commit automatico (regola 5)', /schedule:/.test(wf) && !/git (commit|push)/.test(wf) && /contents: read/.test(wf));
const ad = readFileSync('admin.html', 'utf8');
t('Admin: pulsante «Aggiorna prezzi da xTool» con le stesse regole dello script', ad.includes('id="pxGo"') && ad.includes("import('./assets/js/prezzi-xtool-core.js')") && ad.includes('core.urlShopItalia(m.shop.url)'));
const M = JSON.parse(readFileSync('data/macchine.json', 'utf8'));
const x1 = M.catalogo.find(m => m.id === 'x1');
const collegate = M.catalogo.filter(m => m.shop && /^https:\/\/www\.xtool\.eu\/products\/[\w-]+$/.test(m.shop.url));
t('10 macchine collegate allo shop ufficiale, ognuna con configurazioni abbinabili', collegate.length === 10 && collegate.every(m => {
  const conf = (m.novita && m.novita.stato && m.novita.configurazioni && m.novita.configurazioni.length) ? m.novita.configurazioni : (m.vendita && m.vendita.configurazioni) || [];
  return conf.length && conf.every(c => c.id && c.nomeShop && c.sku && c.prezzo > 0);
}));
t('scheda macchina: sezione «Prezzi ufficiali xTool»', /function bloccoPrezzi\(m, L\)/.test(readFileSync('assets/js/lab-ui.js', 'utf8')));
t('X1 collegata allo shop xtool.eu con le 5 configurazioni', x1.shop.url.startsWith('https://www.xtool.eu/products/') && x1.novita.configurazioni.length === 5 && x1.novita.configurazioni.every(c => c.nomeShop));
console.log(`\n=========== PREZZI xTOOL: ${ok} passati, ${ko} falliti ===========`);
process.exit(ko ? 1 : 0);
