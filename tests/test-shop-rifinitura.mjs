/* Shop: rifinitura (novembre 2026). Senza la divisione in porte (in pausa,
   bozza #149): prodotti più in alto, un solo vocabolario di forme, filtri
   utili, titoli brevi, gerarchia dei titoli, icone disegnate. */
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
let ok = 0, ko = 0; const t = (n, c, x = '') => { c ? ok++ : ko++; console.log((c ? '  ✔ ' : '  ✘ ') + n + (c || !x ? '' : ' → ' + x)); };
const html = readFileSync('index.html', 'utf8');
const prod = readFileSync('assets/js/products.js', 'utf8');
const css = readFileSync('assets/css/restyle-2026.css', 'utf8');
const texts = JSON.parse(readFileSync('data/texts.json', 'utf8'));
const shop = new JSDOM(html).window.document.getElementById('page-shop');
const pos = id => [...shop.querySelectorAll('[id]')].findIndex(e => e.id === id);

console.log('\n=== STRUTTURA ===');
t('nessuna divisione in porte in questa versione', !html.includes('data-porta-pannello') && !/shop-porte\.js/.test(readFileSync('assets/js/main.js', 'utf8')));
t('i prodotti vengono prima delle occasioni', pos('shopGrid') > -1 && pos('shopGrid') < pos('shopOcc'));
t('le occasioni stanno fuori dalla colonna dei prodotti, a tutta larghezza', shop.querySelector('#shopOcc')?.classList.contains('wrap') && !shop.querySelector('.shop-layout #shopOcc'));
t('le collezioni sono un filtro nella colonna laterale', !!shop.querySelector('aside.filters .fgroup--coll #shopColls'));
t('titoli «Esplora per…» tradotti', texts.it.occH === 'Esplora per occasione' && texts.en.occH === 'Explore by occasion' && texts.it.fCollH && texts.en.fCollH);

console.log('\n=== PRECISIONE ===');
t('i materiali senza risultati non compaiono fra i filtri', /MATKEYS\.filter\(m=>F\.mat\.has\(m\)\|\|countFor\('mat',m\)>0\)/.test(prod));
const titoloBreve = new Function('t', /export function titoloBreve\(t\)\{([\s\S]*?)\n\}/.exec(prod)[1]);
t('titoli brevi nelle schede', titoloBreve('Lampada Quadro Luna 3D | Riproduzione Topografica') === 'Lampada Quadro Luna 3D' && titoloBreve('Set Regalo Neonato Personalizzato in Legno - Body, Copertina e Accessori') === 'Set Regalo Neonato Personalizzato in Legno' && titoloBreve('Cake Topper Matrimonio') === 'Cake Topper Matrimonio');
t('il titolo completo resta al passaggio del mouse', /<h3 title="\$\{esc\(x\.n\[L\]\)\}">\$\{titoloBreve\(x\.n\[L\]\)\}<\/h3>/.test(prod));
t('icona disegnata al posto del simbolo ✦', !/✦/.test(prod) && /scp-ic" aria-hidden="true"><svg/.test(prod));
t('stesse forme per ricerca, ordinamento, filtri e categorie', /#page-shop :is\(\.shop-cerca,\.sortsel,\.chip,\.scoll,\.scp/.test(css));
t('titoli «Esplora per…» sotto il titolo della pagina', /#page-shop:is\(#page-shop\) #shopOcc :is\(\.occ,\.ogg\) > h2\{[^}]*font-size:clamp\(1\.35rem/.test(css));
t('schede: titolo su massimo due righe', /#page-shop \.pcard h3\{display:-webkit-box;-webkit-line-clamp:2/.test(css));
console.log(`\n=========== SHOP RIFINITURA: ${ok} passati, ${ko} falliti ===========`);
process.exit(ko ? 1 : 0);
