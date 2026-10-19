/* HERO, CARATTERI E FLUIDITÀ.
   · Schede prodotto, etichette e badge in Playfair (caricato solo in
     corsivo): testo inclinato e diverso dal resto. Ora Josefin Sans.
   · Il metodo nell'hero: «TU + INGLY», la tua idea → il nostro progetto →
     il tuo pezzo unico.
   · «Immagine principale» nell'Admin non faceva nulla: ora può fare da
     sfondo dell'hero, con velo per la leggibilità.
   · Pagine statiche (/shop/, /product/1/…) partivano con la Home attiva e
     l'elenco per Google visibile: su telefono lento la pagina saltava
     (spostamento 0,9 su 1). Ora sotto 0,1. */
import { readFileSync } from 'fs';
import { componi } from '../assets/js/prerender-engine.js';
let pass = 0, fail = 0;
const check = (n, c) => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n) } };
const html = readFileSync('index.html', 'utf8');
const css = readFileSync('assets/css/brand-system-2026.css', 'utf8');
const main = readFileSync('assets/js/main.js', 'utf8');
const admin = readFileSync('admin.html', 'utf8');
const shop = readFileSync('shop/index.html', 'utf8');
check('variabili dei caratteri riportate a Josefin Sans', /:root\[data-mode\]\[data-mode\]\{\s*--fd:'Josefin Sans'/.test(css) && /--no-title:'Josefin Sans'/.test(css));
check('nome nelle schede prodotto non in corsivo', /\.pcard \.pbody h3\{font-family:var\(--brand-display\);font-style:normal/.test(css));
check('l\'accento in corsivo resta Playfair', /#heroH1 em,[^{]*\{font-family:'Playfair Display'/.test(css));
check('metodo «TU + INGLY» in tre passi con spiegazione', /TU \+ INGLY/.test(html) && /La tua idea/.test(html) && /Il nostro progetto/.test(html) && /Il tuo pezzo unico/.test(html) && (html.match(/ingly-hero-steps[\s\S]*?<\/aside>/)[0].match(/<small /g) || []).length === 3);
check('sfondo hero dall\'Admin, via variabile CSS (regola 11)', /hero\.style\.setProperty\('--hero-foto'/.test(main) && /var\(--hero-foto\)/.test(css) && !/style\.backgroundImage/.test(main));
check('sfondo spento finché non lo accendi', JSON.parse(readFileSync('data/config.json', 'utf8')).heroSfondo?.attivo === false);
check('Admin: interruttore e velo', admin.includes('data-b="CONFIG.heroSfondo.attivo"') && admin.includes('data-b="CONFIG.heroSfondo.velo"'));
check('/shop/ parte con lo Shop attivo, non con la Home', shop.includes('class="page active" id="page-shop"') && shop.includes('class="page" id="page-home"'));
const g = '<html><head><title></title></head><body><main><section class="page active" id="page-home"></section><section class="page" id="page-faq"></section></main></body></html>';
check('il generatore attiva la sezione giusta', componi(g, { pagina: 'faq' }).includes('class="page active" id="page-faq"') && componi(g, { pagina: 'nessuna' }).includes('class="page active" id="page-home"'));
check('testo per Google fuori vista durante l\'avvio', /html\.ingly-boot-pending #prerender\{position:absolute!important/.test(html));
check('spazio riservato a categorie e griglia dello Shop', /#page-shop #shopIntro\{min-height:72px\}/.test(css) && /html\.ingly-boot-pending #page-shop #shopGrid\{min-height:100vh\}/.test(css));
check('percorso della scheda prodotto su una riga', /#page-product \.crumb\{flex-wrap:nowrap!important/.test(css));
check('icona delle pagine legali esistente', /favicon\/favicon-32\.png/.test(readFileSync('legale/privacy/index.html', 'utf8')));
console.log(`\n=========== HERO E FLUIDITÀ: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
