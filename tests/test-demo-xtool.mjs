/* Demo xTool gratuita a Palermo: le macchine che si possono provare, con la
   foto in un riquadro. Richiesta del titolare (2026-11-15): «inserire la
   xTool M2 10W e 20W e la cutter C1», immagini nei riquadri e pagina
   trovabile per «demo xTool gratuita», «xTool Palermo», «xTool Sicilia». */
import { readFileSync, existsSync } from 'node:fs';
import * as LAB from '../assets/js/lab.js';
let ok = 0, ko = 0; const t = (n, c, x = '') => { c ? ok++ : ko++; console.log((c ? '  ✔ ' : '  ✘ ') + n + (c || !x ? '' : ' → ' + x)); };
const leggi = p => JSON.parse(readFileSync(p, 'utf8'));
const D = { MACCHINE: leggi('data/macchine.json'), IMMAGINI_MACCHINE: leggi('data/immagini-macchine.json'), CONFIG: leggi('data/config.json') };

console.log('\n=== MACCHINE DA PROVARE ===');
const prova = LAB.macchineDaProvare(D), ids = prova.map(m => m.id);
t('M2, C1 e X1 tra le macchine provabili, in testa', ids[0] === 'm2' && ids[1] === 'c1' && ids[2] === 'x1', ids.join());
t('restano P3, F2, O1 UV e WonderPress', ['p3', 'f2', 'o1-uv', 'wonderpress'].every(id => ids.includes(id)));
const m2 = prova.find(m => m.id === 'm2');
t('M2 in tre versioni: 10 W, 20 W e 40 W (40 W dal 2026-11-20)', m2.demo.varianti.map(id => m2.variantiLaser.find(v => v.id === id).potenza).join() === '10 W,20 W,40 W');
t('ogni macchina ha una foto da mettere nel riquadro', prova.every(m => LAB.fotoMacchina(D, m.id).foto), prova.filter(m => !LAB.fotoMacchina(D, m.id).foto).map(m => m.id).join());
t('ogni macchina ha la riga che dice cosa fa, in italiano e inglese', prova.every(m => m.demo.tag.it && m.demo.tag.en && m.ruolo.it && m.ruolo.en));
t('solo macchine in laboratorio', prova.every(m => m.inOfficina && m.demoDisponibile));
t('foto originali nel sito per ogni macchina (non dipendono dal sito xTool)', prova.every(m => /^img\/xtool-[\w-]+\.webp$/.test(LAB.fotoMacchina(D, m.id).foto) && existsSync(LAB.fotoMacchina(D, m.id).foto)));
t('C1 e X1: la foto della macchina prima di tutto', LAB.fotoMacchina(D, 'c1').foto === 'img/xtool-c1-prodotto.webp' && LAB.fotoMacchina(D, 'x1').foto === 'img/xtool-x1-prodotto.webp');
t('più foto da far scorrere, senza doppioni', prova.every(m => { const f = LAB.fotoDemo(D, m).map(x => x.src); return f.length >= 2 && new Set(f).size === f.length; }));
t('le foto in più esistono nel sito o arrivano dal sito xTool', prova.every(m => LAB.fotoDemo(D, m).every(x => /^https:\/\/cdn\.shopify\.com\//.test(x.src) || existsSync(x.src))));

console.log('\n=== PAGINA (SPA) ===');
const ui = readFileSync('assets/js/lab-ui.js', 'utf8');
t('riquadri con foto, versioni e prenotazione', /function cartaDemo/.test(ui) && /demo-mac__foto/.test(ui) && /demo-mac__versioni/.test(ui) && /cartaDemo\(m, dm, L\)/.test(ui));
t('WhatsApp già intestato alla macchina', /vorrei prenotare una demo gratuita della \$\{nome\} a Palermo/.test(ui));
t('domande frequenti e collegamento all\'assistenza', /faqHtml\(LAB\.FAQ_DEMO, L\)/.test(ui) && /assistenza-xtool-palermo/.test(ui));
t('C1: dalla pagina di lancio alla demo', /Provala gratis a Palermo/.test(ui));
t('scorrimento: frecce e punti dalla delega centrale, si ferma con movimento ridotto', /'demo-slide':\(el,e\)=>\{e\.preventDefault\(\);LABUI\.scorriDemo\(el\)\}/.test(readFileSync('assets/js/main.js', 'utf8')) && /data-action="demo-slide" data-dir="1"/.test(ui) && /prefers-reduced-motion: reduce\)'\)\.matches;\s*if \(timerDemo \|\| ridotto\) return/.test(ui));
const css = readFileSync('assets/css/restyle-2026.css', 'utf8');
t('riquadro foto a proporzione fissa, foto intera, fondo bianco come le foto', /\.demo-mac__foto\{[^}]*aspect-ratio:4\/3[^}]*background:var\(--rs-foto-bg\)/.test(css) && /\.demo-mac__foto img\{[^}]*object-fit:contain/.test(css) && /scroll-snap-type:x mandatory/.test(css));
const html = readFileSync('index.html', 'utf8');
t('titolo con Palermo e le macchine', /Prova le xTool a Palermo/.test(html) && /M2 10, 20 e 40 W, C1 Color Cutter/.test(html));
t('titolo tradotto in inglese', /'Prova le xTool a Palermo,': 'Try xTool machines in Palermo,'/.test(readFileSync('assets/js/lingua-statica.js', 'utf8')));

console.log('\n=== GOOGLE ===');
t('domande in italiano e inglese', LAB.FAQ_DEMO.length >= 5 && LAB.FAQ_DEMO.every(f => f.d.it && f.d.en && f.r.it && f.r.en));
const s = readFileSync('demo/index.html', 'utf8');
t('pagina statica: titolo con Palermo e Sicilia', /<title>Demo xTool gratuita a Palermo, Sicilia/.test(s));
t('pagina statica: M2 10 W / 20 W / 40 W e C1 con immagine', /xTool M2 10 W \/ 20 W \/ 40 W/.test(s) && /alt="xTool C1 Color Cutter: demo gratuita a Palermo"/.test(s));
t('dati strutturati: servizio gratuito a Palermo e domande', /"@type":"Service"/.test(s) && /"price":0/.test(s) && /"name":"Palermo"/.test(s) && /"@type":"FAQPage"/.test(s));
t('link alla Demo Room xTool', /support\.xtool\.com\/demo-room/.test(s));
t('scheda M2 statica: «demo gratuita» nel titolo', /<title>xTool M2 — demo gratuita e assistenza a Palermo, Sicilia/.test(readFileSync('macchine/m2/index.html', 'utf8')));
const ax = readFileSync('assistenza-xtool-palermo/index.html', 'utf8');
t('pagina assistenza: elenco demo e link', /Demo xTool gratuita a Palermo<\/h2>/.test(ax) && /xTool M2 10W, 20W e 40W/.test(ax) && /href="demo"/.test(ax));
t('nessuna promessa di vendita', !/Ordinala|Compra da noi|acquistala da noi/i.test(s));

console.log(`\n=========== DEMO xTOOL: ${ok} passati, ${ko} falliti ===========`);
process.exit(ko ? 1 : 0);
