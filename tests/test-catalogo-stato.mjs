/* Catalogo: categorie nascoste e modalità «in aggiornamento» (config.catalogo). */
import { readFileSync } from 'node:fs';
import { applicaCatalogo, statoCatalogo } from '../assets/js/catalogo-stato.js';
let ok = 0, ko = 0;
const t = (nome, cond) => { cond ? ok++ : ko++; console.log((cond ? '  ✔ ' : '  ✘ ') + nome); };
const dati = (catalogo) => ({
  CONFIG: { catalogo },
  CATS: [{ id: 'a', sub: [{}] }, { id: 'b', sub: [{}] }, { id: 'c', sub: [{}] }],
  P: [{ id: 1, cat: 'a' }, { id: 2, cat: 'b' }, { id: 3, cat: 'c', hidden: true }],
});
let D = applicaCatalogo(dati(undefined));
t('senza impostazioni non cambia nulla', D.CATS.length === 3 && !D.P[0].hidden && !D.P[1].hidden && !D.CATALOGO.aggiornamento);
const cats = dati({ categorieNascoste: ['b'] }); const rif = cats.CATS;
D = applicaCatalogo(cats);
t('categoria nascosta tolta (stesso array)', D.CATS === rif && D.CATS.map(c => c.id).join() === 'a,c');
t('i suoi prodotti diventano hidden', D.P[1].hidden === true && !D.P[0].hidden);
t('un prodotto già nascosto resta nascosto', D.P[2].hidden === true);
D = applicaCatalogo(dati({ categorieNascoste: ['a', 'b', 'c'] }));
t('nascondere TUTTE le categorie viene ignorato', D.CATS.length === 3 && !D.P[0].hidden);
D = applicaCatalogo(dati({ categorieNascoste: ['inesistente'] }));
t('id sconosciuti ignorati', D.CATS.length === 3);
D = applicaCatalogo(dati({ stato: 'aggiornamento' }));
t('in aggiornamento: tutti i prodotti nascosti', D.P.every(p => p.hidden) && D.CATALOGO.aggiornamento);
t('testi predefiniti IT/EN', statoCatalogo({}, 'it').titolo === 'Catalogo in aggiornamento' && /catalogue/.test(statoCatalogo({}, 'en').titolo));
t('testi personalizzati', statoCatalogo({ catalogo: { titolo: { it: 'Chiuso', en: 'Closed' } } }, 'en').titolo === 'Closed');
t('dati rotti non lanciano', !!applicaCatalogo({ CONFIG: null, CATS: null, P: null }));
const dl = readFileSync('assets/js/data-loader.js', 'utf8');
t('data-loader applica il catalogo dopo healData', /healData\(I\);\s*applicaCatalogo\(I\)/.test(dl) && /function healData/.test(dl));
const pr = readFileSync('assets/js/products.js', 'utf8');
t('prodotto nascosto non si apre', /if\(!p\|\|p\.hidden\) return false/.test(pr));
t('shop disegna il pannello', /renderCatalogoAgg\(\)\) return/.test(pr));
const ad = readFileSync('admin.html', 'utf8');
t('Admin: sezione Catalogo con categorie e stato', ad.includes('id="catVisList"') && ad.includes('name="catStato"') && ad.includes('categorieNascoste'));
const tx = JSON.parse(readFileSync('data/texts.json', 'utf8'));
t('testi i18n IT/EN', ['catAggWa', 'catAggQuote', 'catAggStato'].every(k => tx.it[k] && tx.en[k]));
console.log(`\n=========== CATALOGO STATO: ${ok} passati, ${ko} falliti ===========`);
process.exit(ko ? 1 : 0);
