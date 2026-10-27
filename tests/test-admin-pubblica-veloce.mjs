/* Pubblicazione veloce e precisa: solo file cambiati, testi in un'unica
   richiesta, stesso generatore di pagine del build, stato in 3 passi. */
import { readFileSync } from 'node:fs';
import { generaSito, CARTELLE_GENERATE } from '../assets/js/prerender-sito.js';
const s = readFileSync('admin.html', 'utf8');
let ok = 0, ko = 0; const t = (n, c) => { c ? ok++ : ko++; console.log((c ? '  ✔ ' : '  ✘ ') + n); };
t('legge una volta l\'elenco dei file su GitHub', s.includes('?recursive=1'));
t('impronta git calcolata nel browser (SHA-1 "blob <n>\\0")', s.includes("crypto.subtle.digest('SHA-1'") && s.includes("'blob '+bytes.length"));
t('i file identici si saltano', /remoti\.get\(p\)===sha\)\{saltati\+\+;continue\}/.test(s));
t('i testi viaggiano dentro l\'albero (niente invio separato)', s.includes("type:'blob',content:f.text"));
t('le immagini si inviano 4 alla volta', s.includes('Math.min(4,daInviare.length)'));
t('pagine orfane rimosse', s.includes('CARTELLE_GENERATE.some'));
t('Admin usa lo stesso generatore del build', s.includes("import('./assets/js/prerender-sito.js')") && !s.includes('P.corpoProdotto(pr,'));
t('stato semplice in 3 passi', s.includes('function statoPub') && s.includes('id="pubStato"'));
t('niente più «tentativo N»', !s.includes("' — tentativo '"));
t('nota del commit automatica', s.includes("const auto='Aggiornamento '"));
t('anteprima nel pannello Pubblica', s.includes('id="pubPrev"'));
t('dettagli tecnici chiusi di default', /<details class="card" id="pubTec">/.test(s));
/* il generatore non modifica i dati che riceve */
const L = f => JSON.parse(readFileSync(f, 'utf8'));
const dati = { cfg: L('data/config.json'), prodotti: L('data/products.json'), categorie: L('data/categories.json'), contenuti: L('data/content.json'), testi: L('data/texts.json'), materiali: L('data/materiali.json'), tecnologie: L('data/tecnologie.json'), macchine: L('data/macchine.json'), corsi: L('data/corsi.json') };
const prima = JSON.stringify(dati);
dati.cfg.catalogo = { categorieNascoste: [dati.categorie[0].id] };
const r = generaSito(dati, readFileSync('index.html', 'utf8'));
t('genera pagine senza problemi', Object.keys(r.pagine).length > 50 && !r.problemi.length);
t('non modifica i dati ricevuti', dati.categorie.length === JSON.parse(prima).categorie.length && !dati.prodotti.some(p => p.hidden && !JSON.parse(prima).prodotti.find(q => q.id === p.id).hidden));
t('categoria nascosta: niente pagine per i suoi prodotti', !dati.prodotti.filter(p => p.cat === dati.categorie[0].id).some(p => r.pagine['product/' + p.id + '/index.html']));
t('la scheda prodotto contiene le domande frequenti', Object.entries(r.pagine).some(([k, v]) => k.startsWith('product/') && v.includes('Domande frequenti')));
t('cartelle generate dichiarate', CARTELLE_GENERATE.includes('product/'));
console.log(`\n=========== PUBBLICAZIONE VELOCE: ${ok} passati, ${ko} falliti ===========`);
process.exit(ko ? 1 : 0);
