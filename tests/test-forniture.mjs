/* Forniture: materiali e accessori consigliati, venduti dai negozi con link
   di affiliazione (Amazon.it, xTool). Richiesta del titolare, novembre 2026:
   «rivenderli come affiliato senza spedirli noi». Le regole verificate qui
   tengono l'account affiliato in regola e i clienti informati. */
import { readFileSync, existsSync } from 'node:fs';
import * as F from '../assets/js/forniture.js';
let ok = 0, ko = 0; const t = (n, c, x = '') => { c ? ok++ : ko++; console.log((c ? '  ✔ ' : '  ✘ ') + n + (c || !x ? '' : ' → ' + x)); };
const content = JSON.parse(readFileSync('data/content.json', 'utf8'));
const D0 = F.dati(content);
/* le prove sulla selezione la guardano accesa; l'interruttore ha la sua sezione */
const D = { ...D0, attivo: true };

console.log('\n=== LINK SICURI ===');
const neg = [{ id: 'amazon', nome: 'Amazon.it', domini: ['amazon.it'], parametro: 'tag', codice: 'inglydesign-21', ricerca: 'https://www.amazon.it/s?k={q}' },
  { id: 'xtool', nome: 'xTool', domini: ['xtool.com'], parametro: '', ricerca: '', affiliato: true }];
const X = { attivo: true, negozi: neg, categorie: [{ id: 'c' }], articoli: [] };
t('dalla ricerca nasce il link al negozio con il codice affiliato', F.link({ negozio: 'amazon', ricerca: 'compensato 3mm' }, X) === 'https://www.amazon.it/s?k=compensato+3mm&tag=inglydesign-21');
t('il link diretto riceve il codice', F.link({ negozio: 'amazon', url: 'https://www.amazon.it/dp/B0TEST' }, X) === 'https://www.amazon.it/dp/B0TEST?tag=inglydesign-21');
t('un codice già presente nel link non viene sovrascritto', /tag=altro-21$/.test(F.link({ negozio: 'amazon', url: 'https://www.amazon.it/dp/B0?tag=altro-21' }, X)));
t('i link verso domini estranei non escono', F.link({ negozio: 'amazon', url: 'https://amazon.it.truffa.com/dp/1' }, X) === '' && F.link({ negozio: 'amazon', url: 'https://www.amazon.com.evil.io/' }, X) === '');
t('solo https, niente javascript: né credenziali nel link', F.link({ negozio: 'amazon', url: 'http://www.amazon.it/dp/1' }, X) === '' && F.link({ negozio: 'amazon', url: 'javascript:alert(1)' }, X) === '' && F.link({ negozio: 'amazon', url: 'https://u:p@www.amazon.it/' }, X) === '');
t('un codice affiliato con caratteri strani viene ignorato', F.link({ negozio: 'amazon', ricerca: 'x' }, { ...X, negozi: [{ ...neg[0], codice: 'a"><script>' }] }) === 'https://www.amazon.it/s?k=x');
t('un negozio spento non produce link', F.link({ negozio: 'amazon', ricerca: 'x' }, { ...X, negozi: [{ ...neg[0], attivo: false }] }) === '');
t('evento statistico pulito', F.evento({ negozio: 'amazon', id: 'Compensato 3mm!' }) === 'fornitura-amazon-compensato3mm');

console.log('\n=== AVVISO DI AFFILIAZIONE ===');
const A = { ...X, articoli: [{ id: 'a', n: { it: 'A' }, cat: 'c', negozio: 'amazon', ricerca: 'x', stato: 'attivo' }] };
t('con il codice Amazon c\'è la frase richiesta dall\'accordo', /In qualità di Affiliato Amazon/.test(F.avviso(A, 'it')) && /As an Amazon Associate/.test(F.avviso(A, 'en')));
const senza = { ...A, negozi: [{ ...neg[0], codice: '' }] };
t('senza codice non si dichiara un\'affiliazione che non c\'è', !/Affiliato|commissione/.test(F.avviso(senza, 'it')) && /venduti e spediti dal negozio/.test(F.avviso(senza, 'it')));
t('nessun articolo, nessun avviso', F.avviso(X, 'it') === '');
const sch = F.scheda(A.articoli[0], A, { L: 'it' });
t('ogni scheda dice dove si compra, in una nuova scheda, come link sponsorizzato', /Vedi su Amazon\.it/.test(sch) && /rel="sponsored nofollow noopener"/.test(sch) && /target="_blank"/.test(sch));
t('«Lo usiamo in laboratorio» solo se spuntato', !/Lo usiamo/.test(sch) && /Lo usiamo in laboratorio/.test(F.scheda({ ...A.articoli[0], provato: true }, A, { L: 'it' })));
t('i testi dei dati sono messi in sicurezza', !/<b>x/.test(F.scheda({ ...A.articoli[0], n: { it: '<b>x</b>' } }, A, { L: 'it' })));

console.log('\n=== SELEZIONE PUBBLICATA ===');
t('almeno 15 articoli visibili in almeno 4 categorie', F.articoli(D).length >= 15 && F.categorieVive(D).length >= 4, F.articoli(D).length + '/' + F.categorieVive(D).length);
t('nessun problema grave nei dati', !F.problemi(D).some(p => p.grave), F.problemi(D).filter(p => p.grave).map(p => p.testo).join(' | '));
t('ogni articolo ha nome, descrizione e consiglio in IT e EN', D.articoli.every(a => a.n.it && a.n.en && a.desc.it && a.desc.en && a.consiglio.it && a.consiglio.en));
t('nessun «Lo usiamo» deciso al posto del titolare', D.articoli.every(a => a.provato === false));

console.log('\n=== INTERRUTTORE DELL\'ADMIN ===');
t('di serie la sezione è spenta (l\'affiliazione arriva dopo)', content.FORNITURE.attivo === false && !F.visibile(content));
t('spenta: nessun articolo, nessun avviso, nessun link', F.articoli(D0).length === 0 && F.avviso(D0, 'it') === '' && F.articoli(D0, { generatore: 'orecchini' }).length === 0);
t('accesa: tutto torna', F.visibile({ FORNITURE: { attivo: true } }) && F.articoli(D).length >= 15);
const navIA = await import('../assets/js/nav-ia.js');
t('voce di menu solo con la sezione accesa', !navIA.secondarieVive(content).some(v => v.id === 'forniture') && navIA.secondarieVive({ FORNITURE: { attivo: true } }).some(v => v.id === 'forniture'));
t('spenta: fuori dalla sitemap, pagina statica non indicizzata', !/\/forniture<\/loc>/.test(readFileSync('sitemap.xml', 'utf8')) && /<meta name="robots" content="noindex, follow">/.test(readFileSync('forniture/index.html', 'utf8')));
t('nel sito spenta resta un messaggio e il link al catalogo, non una pagina vuota', /Questa sezione al momento non è disponibile/.test(readFileSync('assets/js/forniture-ui.js', 'utf8')) && /\[data-forn-link\]/.test(readFileSync('assets/js/forniture-ui.js', 'utf8')));
t('il piè di pagina ha la voce, nascosta finché la sezione è spenta', /<a href="forniture" data-nav="forniture" data-forn-link hidden>/.test(readFileSync('index.html', 'utf8')));
t('Google non indicizza la pagina spenta neanche nel sito', /page==='forniture'\)\{const F=\(window\.INGLY\|\|\{\}\)\.FORNITURE;if\(!\(F&&F\.attivo===true\)\)set\('meta\[name="robots"\]','content','noindex, follow'\)/.test(readFileSync('assets/js/seo.js', 'utf8')));
t('le due sitemap (script e Admin) seguono l\'interruttore', /FORNITURE\.attivo === true\)\)/.test(readFileSync('scripts/generate-sitemap.mjs', 'utf8')) && /forniture\/index\.html'\|\|\(S\.C&&S\.C\.FORNITURE&&S\.C\.FORNITURE\.attivo===true\)/.test(readFileSync('admin.html', 'utf8')));
t('nessun prezzo scritto a mano (cambia ogni giorno sui negozi)', D.articoli.every(a => a.price === undefined && a.prezzo === undefined));
const matLab = JSON.parse(readFileSync('data/materiali.json', 'utf8')).materiali.map(m => m.id);
t('i materiali citati esistono nel Lab', D.articoli.every(a => (a.materiali || []).every(m => matLab.includes(m))));
const gens = content.GENERATORI.map(g => g.id);
t('i generatori citati esistono nello Studio', D.articoli.every(a => (a.generatori || []).every(g => gens.includes(g))));
t('ogni generatore del laboratorio ha almeno un materiale consigliato', ['puzzle', 'sottobicchiere', 'segnalibro', 'orecchini', 'rosetta', 'portachiavi', 'cake-topper', 'scatola-incastri'].every(g => F.articoli(D, { generatore: g }).length));
t('sicurezza: pelle solo conciata al vegetale, acrilico trasparente solo CO2', /conciata al cromo/.test(JSON.stringify(D.articoli)) && /solo con laser CO2/.test(JSON.stringify(D.articoli)));

console.log('\n=== SITO ===');
const html = readFileSync('index.html', 'utf8');
t('la pagina /forniture esiste nel sito', /id="page-forniture"/.test(html) && /id="fornGrid"/.test(html) && /id="fornAvviso"/.test(html));
t('è una rotta vera e sta nel menu secondario', /id: 'forniture',\s+percorso: 'forniture',\s+menu: 'secondaria'/.test(readFileSync('assets/js/rotte.js', 'utf8')) && /id: 'forniture', rotta: 'forniture'/.test(readFileSync('assets/js/nav-ia.js', 'utf8')));
t('la pagina statica esiste sempre (nessun 404 quando si riaccende)', existsSync('forniture/index.html'));
const css2 = readFileSync('assets/css/restyle-2026.css', 'utf8');
t('effetti come il catalogo: comparsa a scorrimento e riga laser al passaggio (rispetta «meno movimento»)', /reveal: true/.test(readFileSync('assets/js/forniture-ui.js', 'utf8')) && /prefers-reduced-motion:no-preference\)\{\s*:root\[data-mode\]\[data-mode\] \.forn-tinta::after/.test(css2));
t('struttura: tre passi, conteggio per gruppo, chiusura con preventivo', /id="fornPassi"/.test(readFileSync('index.html', 'utf8')) && /id="fornChiusura"/.test(readFileSync('index.html', 'utf8')) && /\.forn-chiudi\{/.test(css2) && /forn-conta/.test(readFileSync('assets/js/forniture-ui.js', 'utf8')));
const main = readFileSync('assets/js/main.js', 'utf8');
t('disegnata all\'avvio e nelle schede dei materiali («Dove comprarlo»)', /\['forniture',\(\)=>FORNUI\.renderForniture\(L\)\]/.test(main) && (main.match(/FORNUI\.renderPerMateriale/g) || []).length === 2);
t('i clic verso i negozi si contano nelle statistiche', /el\.dataset\.forn\) evento\(el\.dataset\.forn\)/.test(readFileSync('assets/js/statistiche.js', 'utf8')));
t('il Generator Studio consiglia i materiali del generatore aperto', /import\('\.\/assets\/js\/forniture\.js'\)/.test(readFileSync('generatori.html', 'utf8')) && /id="genForn"/.test(readFileSync('generatori.html', 'utf8')));
const css = readFileSync('assets/css/restyle-2026.css', 'utf8');
t('schede nello stile del sito, con le venature incise via mask', /\.forn-card\{/.test(css) && /\.forn-tinta::before\{[^}]*mask:url\('\.\.\/patterns\/venature\.svg'\)/.test(css));

console.log('\n=== ADMIN ===');
const admin = readFileSync('admin.html', 'utf8');
t('voce «Forniture (affiliati)» nel menu', /\['forn','🧺','Forniture \(affiliati\)'\]/.test(admin) && /forn:renderForn/.test(admin));
t('codice affiliato e articoli modificabili', /data-forn-cod=/.test(admin) && /function editForn\(/.test(admin) && /id="fa_prova"/.test(admin));
t('un link sbagliato blocca la pubblicazione', /FORN_MOD\.problemi\(FORN_MOD\.dati\(\{FORNITURE:S\.C\.FORNITURE\}\)\)\.forEach\(x=>\(x\.grave\?err:warn\)/.test(admin));
t('se il sito pubblicato non ha forniture si parte dalla selezione di serie', /FORN_SEME/.test(admin));
t('interruttore «Mostra la sezione Forniture sul sito»', /id="fornAttivo"/.test(admin) && /F\.attivo=sw\.checked/.test(admin));

console.log(`\n=========== FORNITURE: ${ok} passati, ${ko} falliti ===========`);
process.exit(ko ? 1 : 0);
