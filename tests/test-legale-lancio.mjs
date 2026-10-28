/* PAGINE LEGALI e PRONTO AL LANCIO.
   Prima: nessuna pagina legale (nel piè di pagina «Privacy · Termini» era
   solo testo), nessuna P.IVA sul sito, nessun elenco di cosa mancava. */
import { readFileSync, existsSync } from 'fs';
import { JSDOM } from 'jsdom';
import { PAGINE, genera } from '../scripts/legal-pages.mjs';

let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };
const cfg = JSON.parse(readFileSync('data/config.json', 'utf8'));
const html = readFileSync('index.html', 'utf8');
const admin = readFileSync('admin.html', 'utf8');

console.log('\n=== LE CINQUE PAGINE ===');
const attese = ['dati-aziendali', 'condizioni-vendita', 'spedizioni-resi', 'privacy', 'cookie'];
check('ci sono tutte', attese.every(s => PAGINE.some(p => p.slug === s)));
const gen = genera();
check('sono generate e aggiornate (altrimenti: npm run build)', gen.every(g => existsSync(g.file) && readFileSync(g.file, 'utf8') === g.html), gen.filter(g => !existsSync(g.file) || readFileSync(g.file, 'utf8') !== g.html).map(g => g.file).join(', '));
const testo = s => { const g = gen.find(x => x.file === `legale/${s}/index.html`); return g ? new JSDOM(g.html).window.document.body.textContent.replace(/\s+/g, ' ') : ''; };
check('condizioni: recesso di 14 giorni', /recedere dal contratto[^.]*14 giorni/.test(testo('condizioni-vendita')));
check('condizioni: esclusione per i prodotti personalizzati (art. 59 lett. c)', /non si applica[^.]*personalizzati \(art\. 59, comma 1, lettera c/.test(testo('condizioni-vendita')));
check('condizioni: garanzia legale di 24 mesi', /garanzia legale di conformità di 24 mesi/.test(testo('condizioni-vendita')));
check('nessun link alla piattaforma ODR (chiusa a luglio 2025)', !/ec\.europa\.eu\/consumers\/odr/.test(gen.map(g => g.html).join('')));
check('privacy: titolare, diritti, Garante', /Titolare del trattamento/.test(testo('privacy')) && /artt\. 15–22 GDPR/.test(testo('privacy')) && /garanteprivacy\.it/.test(gen.find(g => g.file.includes('privacy')).html));
check('cookie: nessun cookie di profilazione dichiarato', /non usa cookie di profilazione/.test(testo('cookie')));
check('dati aziendali: P.IVA presente come campo', /Partita IVA/.test(testo('dati-aziendali')));

console.log('\n=== MAI DATI INVENTATI ===');
const d = cfg.datiLegali || {};
check('config.json ha i dati aziendali', !!cfg.datiLegali && !!cfg.spedizione);
check('sede: Palermo', /Palermo/.test(d.sede || ''));
check('P.IVA vuota → «in corso di attribuzione» (finché non c\'è)', d.piva ? true : /Partita IVA\s*in corso di attribuzione/.test(testo('dati-aziendali')));
check('ogni dato è rinnovato all\'apertura da data/config.json (legale.js)', gen.every(g => g.html.includes('<script src="assets/js/legale.js" defer></script>')) && /data\/config\.json/.test(readFileSync('assets/js/legale.js', 'utf8')));
check('le pagine usano il foglio del sito con la versione attuale', gen.every(g => g.html.includes(`assets/css/ingly.min.css?v=${JSON.parse(readFileSync('assets/css/ingly.manifest.json', 'utf8')).v}`)));

console.log('\n=== PIÈ DI PAGINA ===');
const doc = new JSDOM(html).window.document;
const link = [...doc.querySelectorAll('footer .ft-legale a')].map(a => a.getAttribute('href'));
check('link veri alle 5 pagine (non più solo testo)', attese.every(s => link.includes(`legale/${s}/`)), link.join(', '));
check('riga con nome, sede e P.IVA', /P\.IVA/.test(doc.getElementById('ftPiva')?.textContent || ''));
check('main.js aggiorna la riga dai dati legali', /CONFIG\.datiLegali/.test(readFileSync('assets/js/main.js', 'utf8')));
check('YouTube in modalità privacy avanzata, come dichiarato', !/youtube\.com\/embed/.test(readFileSync('assets/js/products.js', 'utf8')) && /youtube-nocookie\.com\/embed/.test(readFileSync('assets/js/products.js', 'utf8')));
check('soglia di spedizione gratuita dall\'Admin', /CONFIG\.spedizione/.test(readFileSync('assets/js/products.js', 'utf8')));

console.log('\n=== ADMIN ===');
check('campi dei dati aziendali', ['ragioneSociale', 'piva', 'pec', 'sede', 'indirizzo'].every(k => admin.includes(`data-b="CONFIG.datiLegali.${k}"`)));
check('campi delle spedizioni', ['costoItalia', 'tempiProduzione', 'tempiConsegna', 'sogliaGratis'].every(k => admin.includes(`data-b="CONFIG.spedizione.${k}"`)));
check('pagina «Pronto al lancio» nel menu', /\['lancio','✅','Pronto al lancio'\]/.test(admin) && /lancio:renderLancio/.test(admin));

/* la funzione dei controlli, eseguita davvero sui dati di oggi */
const corpo = admin.match(/function controlliLancio\(st\)\{[\s\S]*?\n\}/)[0];
const controlliLancio = new Function(corpo + '; return controlliLancio;')();
const P = JSON.parse(readFileSync('data/products.json', 'utf8'));
const content = JSON.parse(readFileSync('data/content.json', 'utf8'));
const oggi = controlliLancio({ CONFIG: cfg, P, C: content });
check('con i dati di oggi il lancio è bloccato (P.IVA, Formspree, spedizioni mancanti)', oggi.some(x => x.livello === 'rosso'));
check('la P.IVA mancante è rossa', oggi.find(x => /Partita IVA/.test(x.voce)).livello === 'rosso');
const completo = JSON.parse(JSON.stringify(cfg));
Object.assign(completo.datiLegali, { ragioneSociale: 'Prova', piva: '12345678901', indirizzo: 'Via Prova 1', pec: 'a@pec.it' });
Object.assign(completo.spedizione, { costoItalia: 6.9, tempiProduzione: '3 giorni', tempiConsegna: '48 ore' });
completo.moduli = { formspreePreventivo: 'abcdefgh' };
check('con i dati completi non resta nessun rosso', controlliLancio({ CONFIG: completo, P, C: content }).every(x => x.livello !== 'rosso'), controlliLancio({ CONFIG: completo, P, C: content }).filter(x => x.livello === 'rosso').map(x => x.voce).join(', '));

console.log(`\n=========== LEGALE E LANCIO: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
