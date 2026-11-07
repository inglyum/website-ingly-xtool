/* Catalogo in vetrina (prodotti visibili, nessun ordine online) e statistiche
   GoatCounter senza cookie. Scelte del titolare, novembre 2026: in fiera non
   vuole ordini online ma vuole che Google trovi i prodotti. */
import { readFileSync } from 'node:fs';
import { statoCatalogo, applicaCatalogo } from '../assets/js/catalogo-stato.js';
import { mostraPrezzi } from '../assets/js/prezzi.js';
let ok = 0, ko = 0; const t = (n, c) => { c ? ok++ : ko++; console.log((c ? '  ✔ ' : '  ✘ ') + n); };

console.log('\n=== VETRINA: LOGICA ===');
const cfg = { catalogo: { stato: 'vetrina', avviso: { it: 'Siamo in fiera', en: 'At a fair' } }, prezzi: { mostra: true } };
const s = statoCatalogo(cfg, 'it');
t('lo stato «vetrina» è riconosciuto e non è «aggiornamento»', s.vetrina === true && s.aggiornamento === false);
t('l\'avviso arriva nella lingua giusta', s.avviso === 'Siamo in fiera' && statoCatalogo(cfg, 'en').avviso === 'At a fair');
t('in vetrina i prezzi sono sempre su richiesta, anche se l\'Admin li ha accesi', mostraPrezzi(cfg) === false && mostraPrezzi({ prezzi: { mostra: true } }) === true);
const P = () => [{ id: 1, cat: 'casa', img: 'img/1.webp' }, { id: 2, cat: 'casa', img: 'img/2.webp' }, { id: 3, cat: 'casa', img: '' }];
let D = applicaCatalogo({ CONFIG: cfg, CATS: [{ id: 'casa' }], P: P(), MV: { 'img/1.webp': [400, 800] } });
t('si vedono solo i prodotti con la foto vera', D.P.map(p => !!p.hidden).join() === 'false,true,true' && D.CATALOGO.senzaFoto === 2);
D = applicaCatalogo({ CONFIG: cfg, CATS: [{ id: 'casa' }], P: P(), MV: {} });
t('se la mappa delle foto è vuota non sparisce tutto il catalogo', D.P.filter(p => p.hidden).length === 0);
D = applicaCatalogo({ CONFIG: { catalogo: { stato: 'online' } }, CATS: [{ id: 'casa' }], P: P(), MV: { 'img/1.webp': [400] } });
t('catalogo online: la regola delle foto non si applica', D.P.filter(p => p.hidden).length === 0);
D = applicaCatalogo({ CONFIG: { catalogo: { stato: 'aggiornamento' } }, CATS: [{ id: 'casa' }], P: P() });
t('«in aggiornamento» resta com\'era: tutto nascosto', D.P.every(p => p.hidden));

console.log('\n=== VETRINA: SITO E ADMIN ===');
const prod = readFileSync('assets/js/products.js', 'utf8');
const admin = readFileSync('admin.html', 'utf8');
const conf = JSON.parse(readFileSync('data/config.json', 'utf8'));
t('lo shop mostra l\'avviso della vetrina con WhatsApp e preventivo', /function renderAvvisoVetrina\(\)/.test(prod) && /renderAvvisoVetrina\(\);/.test(prod));
t('l\'Admin offre la terza scelta «Vetrina senza ordini» con l\'avviso', /value="vetrina"/.test(admin) && /id="catVetAvvIT"/.test(admin) && /avviso:bi\('catVetAvvIT','catVetAvvEN'\)/.test(admin));
t('la sitemap dell\'Admin usa la stessa regola delle foto', /P:VISIBILI_SITEMAP,MV:\(S\.C&&S\.C\.MV\)\|\|null/.test(admin));
t('pagine generate e sitemap usano la stessa regola', /MV: contenuti\.MV/.test(readFileSync('assets/js/prerender-sito.js', 'utf8')) && /\.MV \}\);/.test(readFileSync('scripts/generate-sitemap.mjs', 'utf8')));
t('il catalogo pubblicato è in vetrina', conf.catalogo && conf.catalogo.stato === 'vetrina');

console.log('\n=== PRODOTTI CON MARCHI ALTRUI ===');
const prodotti = JSON.parse(readFileSync('data/products.json', 'utf8'));
const marchi = /batman|hulk|spider-?man|\bflash\b|huntrix|porsche|harley|\binter\b/i;
const esposti = prodotti.filter(p => !p.hidden && marchi.test(JSON.stringify(p.n)));
t('nessun prodotto visibile con personaggi o marchi altrui nel nome', esposti.length === 0, esposti.map(p => p.id).join());
const content = JSON.parse(readFileSync('data/content.json', 'utf8'));
t('nessuna opera della galleria con marchi altrui', !(content.PORT || []).some(e => marchi.test(JSON.stringify(e))));
t('le opere tolte restano conservate (PORT_NASCOSTI)', (content.PORT_NASCOSTI || []).length >= 3);

console.log('\n=== STATISTICHE (GoatCounter) ===');
const st = readFileSync('assets/js/statistiche.js', 'utf8');
const html = readFileSync('index.html', 'utf8');
t('nessuno script segnaposto (TUOCODICE, G-XXXX) nella pagina', !/TUOCODICE|G-XXXXXXXXXX|googletagmanager/.test(html));
t('lo script parte solo con un codice valido', /CODICE = \/\^\[a-z0-9\]/.test(st) && /if \(!codice/.test(st));
t('nessun cookie né servizio esterno oltre GoatCounter', /https:\/\/gc\.zgo\.at\/count\.js/.test(st) && !/document\.cookie|localStorage/.test(st));
t('conta preventivi, WhatsApp, anteprima 3D e demo', ['preventivo-inviato', 'whatsapp', 'anteprima-3d-usata', 'preventivo-da-3d', 'demo-cliccata'].every(e => st.includes(e)));
t('avviato all\'apertura del sito', /STAT\.avvia\(CONFIG\)/.test(readFileSync('assets/js/main.js', 'utf8')));
t('il codice si imposta dall\'Admin', /id="statGc"/.test(admin) && /S\.CONFIG\.analisi=/.test(admin));
t('codice predefinito vuoto: statistiche spente finché non lo scrivi', conf.analisi && conf.analisi.goatcounter === '');

console.log(`\n=========== VETRINA E STATISTICHE: ${ok} passati, ${ko} falliti ===========`);
process.exit(ko ? 1 : 0);
