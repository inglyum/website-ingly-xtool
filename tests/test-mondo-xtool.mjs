/* Pagina pilastro «Mondo xTool» (2026-11-28): una pagina sola per chi cerca
   xTool in Sicilia/Calabria, con macchine, demo, corsi, assistenza e FAQ. */
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
let ok = 0, ko = 0;
const t = (n, c) => { c ? ok++ : ko++; console.log((c ? '  ✔ ' : '  ✖ ') + n); };
const J = f => JSON.parse(readFileSync(f, 'utf8'));
let aggiornata = true;
try { execFileSync(process.execPath, ['scripts/mondo-xtool.mjs', '--verifica'], { stdio: 'pipe' }); } catch (e) { aggiornata = false; }
t('generata dalla build e aggiornata', existsSync('xtool/index.html') && aggiornata);
const h = existsSync('xtool/index.html') ? readFileSync('xtool/index.html', 'utf8') : '';
const mac = J('data/macchine.json'), cor = J('data/corsi.json');
const inLab = mac.catalogo.filter(m => m.inOfficina && m.stato !== 'archiviato');
const corsi = cor.corsi.filter(c => c.stato !== 'bozza' && c.stato !== 'archiviato');

console.log('\n=== GOOGLE ===');
const titolo = (h.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
t('titolo con xTool, Sicilia, demo, corsi, assistenza e Palermo', /xTool/.test(titolo) && /Sicilia/.test(titolo) && /demo/i.test(titolo) && /corsi/i.test(titolo) && /Palermo/.test(titolo));
const desc = (h.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
t('descrizione tra 120 e 160 caratteri', desc.length >= 120 && desc.length <= 160);
t('un solo H1 con le città e le regioni', (h.match(/<h1>/g) || []).length === 1 && /<h1>[^<]*Palermo[^<]*Sicilia[^<]*Calabria/.test(h));
t('indirizzo canonico /xtool/', /<link rel="canonical" href="https:\/\/www\.inglydesign\.it\/xtool\/">/.test(h));
const ld = JSON.parse((h.match(/<script type="application\/ld\+json">([^]*?)<\/script>/) || [])[1] || '{}');
const tipi = (ld['@graph'] || []).map(x => [].concat(x['@type']).join('+'));
t('dati strutturati: attività locale, elenco macchine, FAQ, percorso', ['LocalBusiness+ProfessionalService', 'ItemList', 'FAQPage', 'BreadcrumbList'].every(x => tipi.includes(x)));
const biz = (ld['@graph'] || [])[0] || {};
t('zone servite: Palermo, Catania, Messina, Sicilia, Calabria, Italia, Europa', ['Palermo', 'Catania', 'Messina', 'Sicilia', 'Calabria', 'Italia', 'Europa'].every(n => JSON.stringify(biz.areaServed || []).includes(n)));
t('H1 e testi: anche tutta Italia ed Europa', /<h1>[^<]*Italia[^<]*Europa/.test(h) && /<dd>Italia ed Europa<\/dd>/.test(h));
t('badge Pro Hub: livello xTool Squad spiegato, non un voto a stelle', /class="xsquad"[^]*Pro Hub/.test(h) && /Pro Hub è il livello più completo/.test(h) && /Cosa vuol dire Pro Hub\?/.test(h) && !/aria-label="2 stelle"/.test(h));
t('i corsi come Course nel catalogo', (biz.hasOfferCatalog && biz.hasOfferCatalog.itemListElement || []).length === corsi.length && corsi.length > 0);
t('nella sitemap', /<loc>https:\/\/www\.inglydesign\.it\/xtool\/?<\/loc>/.test(readFileSync('sitemap.xml', 'utf8')));

console.log('\n=== CONTENUTI ===');
t('ogni macchina in laboratorio con scheda e demo', inLab.every(m => h.includes('href="macchine/' + m.id + '"')));
t('ogni corso collegato', corsi.every(c => h.includes('href="academy/' + c.id + '"')));
t('collegamento all\'assistenza e alla prenotazione demo xTool', h.includes('href="assistenza-xtool-palermo/"') && /support\.xtool\.com\/demo-room\/host-instruction\?id=2528/.test(h));
t('niente prezzi né sconti inventati', !/€\s*\d|sconto|scontat/i.test(h.replace(/<script[^]*?<\/script>/g, '')));
t('niente dati strutturati Review/AggregateRating (recensioni autoreferenziali)', !/"@type":"Review"|aggregateRating/i.test(h));

console.log('\n=== RECENSIONI VERE (profilo host xTool, 28/11/2026) ===');
const REC = J('data/recensioni-xtool.json');
const rec = REC.recensioni || [];
const escH = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
t('fonte dichiarata: profilo host ufficiale', /support\.xtool\.com\/demo-room\/host-instruction\?id=2528/.test(REC.fonte && REC.fonte.url || ''));
t('ogni recensione con nome, voto 1–5, testo e mese', rec.length > 0 && rec.every(r => r.nome && r.testo && r.voto >= 1 && r.voto <= 5 && /^\d{4}-\d{2}$/.test(r.mese)));
t('nomi ridotti: mai un cognome intero', rec.every(r => !/^[A-Za-zÀ-ÿ]+ [A-Za-zÀ-ÿ]{2,}$/.test(r.nome) || /^Cliente /.test(r.nome)));
t('tutte nella pagina Mondo xTool, testo identico', rec.every(r => h.includes(escH(r.testo))));
t('il numero e la media scritti corrispondono ai dati', h.includes(rec.length + ' recensioni') && h.includes((rec.reduce((a, r) => a + r.voto, 0) / rec.length).toFixed(1).replace('.', ',') + ' su 5'));
const home = readFileSync('index.html', 'utf8');
const citate = [...home.matchAll(/<figure class="ilab-rec">[^]*?<blockquote>([^<]*)<\/blockquote>/g)].map(m => m[1]);
t('in home solo recensioni presenti nei dati', citate.length > 0 && citate.every(q => rec.some(r => r.testo.replace(/&/g, '&amp;') === q)));
t('modelli fuori produzione esclusi', !/macchine\/(m1|m1-ultra|f1|p2)"/.test(h));

console.log('\n=== PROFILO HOST ===');
const homeH = readFileSync('index.html', 'utf8');
t('foto dell\'host presente in due misure', existsSync('img/giuseppe-inglima-host-480.webp') && existsSync('img/giuseppe-inglima-host.webp'));
t('profilo in home e nella pagina Mondo xTool', /id="host"[^]*Giuseppe Inglima/.test(homeH) && /id="host"[^]*Giuseppe Inglima/.test(h));
t('Google: la persona collegata all\'attività', /"@type":"Person"[^]*"name":"Giuseppe Inglima"[^]*"worksFor"/.test(h));
t('nel profilo il numero di recensioni corrisponde ai dati', new RegExp('id="host"[^]*?' + rec.length + ' recensioni').test(homeH));

console.log('\n=== COLLEGAMENTI INTERNI ===');
t('dalla home (blocco Lab)', /href="xtool\/"/.test(readFileSync('index.html', 'utf8')));
t('dalla pagina assistenza', /href="xtool\/"/.test(readFileSync('assistenza-xtool-palermo/index.html', 'utf8')));

console.log(`\n=========== MONDO xTOOL: ${ok} passati, ${ko} falliti ===========`);
if (ko) process.exit(1);
