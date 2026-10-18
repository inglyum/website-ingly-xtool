/* FASE 0 — quello che il cliente vede nel primo secondo.

   Prima: l'HTML conteneva il vecchio menu a 12 voci e un titolo vuoto;
   il JavaScript li sostituiva solo a caricamento finito. Su un telefono in
   4G significava ~11 s di pagina scura con il menu sbagliato, e il titolo
   dopo 18 s.

   Ora menu e Hero sono già giusti nell'HTML. Questo test controlla che
   restino uguali a ciò che il JavaScript disegna dopo: se cambiano le
   famiglie del menu o lo slogan nell'Admin, il test lo segnala. */
import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';
import { barraHtml } from '../assets/js/nav-ia.js';

let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };

const html = readFileSync('index.html', 'utf8');
const doc = new JSDOM(html).window.document;
const css = readFileSync('assets/css/nav-ia.css', 'utf8');
const config = JSON.parse(readFileSync('data/config.json', 'utf8'));
const cats = JSON.parse(readFileSync('data/categories.json', 'utf8'));

console.log('\n=== MENU GIUSTO DAL PRIMO ISTANTE ===');
const barra = doc.getElementById('iaBarra');
check('la barra a 5 voci è scritta nell\'HTML', barra && barra.hasAttribute('data-statica') && barra.querySelectorAll('a.ia-voce').length === 5);
const voci = [...barra.querySelectorAll('a.ia-voce')].map(a => a.textContent.trim() + '→' + a.getAttribute('href'));
const atteso = new JSDOM('<nav>' + barraHtml({ CATS: cats }, { L: 'it', base: '' }) + '</nav>').window.document;
const voceAttese = [...atteso.querySelectorAll('a.ia-voce')].map(a => a.textContent.trim() + '→' + a.getAttribute('href').replace(/^\//, ''));
check('le voci statiche sono le stesse che disegna il JavaScript', JSON.stringify(voci) === JSON.stringify(voceAttese), voci.join(', ') + ' ≠ ' + voceAttese.join(', '));
check('i link statici sono relativi (funzionano sotto /website-ingly-xtool/)', voci.every(v => !/→\//.test(v)));
check('la vecchia barra a 12 voci è nascosta quando c\'è quella statica', /\.nav:has\(\.ia-barra\[data-statica\]\) \.nav-links\{display:none!important\}/.test(css));
check('la barra statica non è nascosta in attesa del JavaScript', /html:not\(\.ia-attiva\) \.ia-barra:not\(\[data-statica\]\)\{display:none\}/.test(css));

console.log('\n=== TITOLO DELLA HERO GIÀ NELL\'HTML ===');
const h1 = doc.getElementById('heroH1');
const slogan = String(config.slogan && config.slogan.it || '').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
const testoH1 = h1 ? h1.textContent.replace(/\s+/g, ' ').trim() : '';
check('il titolo non è vuoto', testoH1.length > 0);
check('il titolo è lo slogan dell\'Admin (config.slogan.it)', testoH1 === slogan, `«${testoH1}» ≠ «${slogan}»`);
const inciso = (String(config.slogan.it).match(/\*\*([^*]+)\*\*/) || [])[1];
if (inciso) check('la parola incisa ha la stessa marcatura del JavaScript', !!h1.querySelector(`.w > .engrave[data-parola="${inciso}"]`));
const ctas = doc.querySelectorAll('#page-home .hero .hero-ctas a.btn');
check('i due bottoni della Hero sono nell\'HTML', ctas.length === 2);
/* Ogni testo della Hero scritto nell'HTML deve essere quello che il
   JavaScript metterà dopo (texts.json, italiano): altrimenti la frase
   cambia sotto gli occhi di chi legge. */
const testi = JSON.parse(readFileSync('data/texts.json', 'utf8'));
const it = testi.it || testi;
const diversi = [...doc.querySelectorAll('#page-home .hero [data-i18n]')]
  .filter(el => typeof it[el.dataset.i18n] === 'string' && !/<[a-z]/i.test(it[el.dataset.i18n]))
  .filter(el => el.textContent.trim() !== it[el.dataset.i18n].trim())
  .map(el => el.dataset.i18n);
check('i testi della Hero nell\'HTML sono già quelli definitivi', diversi.length === 0, diversi.join(', '));

console.log(`\n=========== FASE 0: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
