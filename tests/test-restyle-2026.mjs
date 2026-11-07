/* RESTYLE 2026 — «notte calda + oro» con l'incisione 3D dal vivo, scelto dal
   titolare: logo e oro restano; struttura da negozio moderno (Shopify Dawn);
   effetto principale: una targa 3D che il laser incide mentre la guardi. */
import { readFileSync, existsSync } from 'node:fs';
let ok = 0, ko = 0; const t = (n, c) => { c ? ok++ : ko++; console.log((c ? '  ✔ ' : '  ✘ ') + n); };
const css = readFileSync('assets/css/restyle-2026.css', 'utf8');
const html = readFileSync('index.html', 'utf8');
const js = readFileSync('assets/js/incisione-3d.js', 'utf8');
const main = readFileSync('assets/js/main.js', 'utf8');

console.log('\n=== BASE ===');
t('carattere Assistant servito dal sito (niente servizi esterni)', ['400', '600', '700'].every(w => existsSync(`assets/fonts/assistant/assistant-latin-${w}-normal.woff2`)) && /src:url\('\.\.\/fonts\/assistant\//.test(css));
t('notte calda di serie, chiaro avorio come variante', /var m="dark"/.test(html) && /set\(stored\(\) \|\| 'dark'\)/.test(main) && /:root\[data-mode="light"\]\{/.test(css) && /:root\[data-mode="dark"\]\{\s*--rs-bg:#13100d/.test(css));
t('oro per le azioni: pulsante principale oro', /\.btn\.btn-primary[^{]*\{\s*background:var\(--rs-gold\)/.test(css));
t('arancio brace solo come token del laser', /--rs-ember:/.test(css) && (css.match(/var\(--rs-ember\)/g) || []).length <= 2);
t('la home si riorganizza solo quando è la pagina aperta', /#page-home\.page\.active\{display:flex/.test(css) && !/#page-home\{display:flex/.test(css));
t('nessuna etichetta sopra i titoli nella home e nella chiusura', /\.ft-eyebrow\{display:none/.test(css));

console.log('\n=== INCISIONE 3D ===');
t('motore 3D scritto in casa: niente three.js né librerie esterne', !/three(\.min)?\.js|import\s|https?:\/\//i.test(js.replace(/https:\/\/wa\.me\/[^']*/g, '')) && /getContext\('webgl'/.test(js));
t('caricato una volta, in differita', (html.match(/<script defer src="assets\/js\/incisione-3d\.js"><\/script>/g) || []).length === 1);
t('targa con 4 materiali generati dal codice', /MATERIALI = \['legno', 'ardesia', 'acrilico', 'metallo'\]/.test(js) && (html.match(/name="rs3dMat"/g) || []).length === 4);
t('lavorazione vera: prima la cornice (vettoriale), poi il testo riga per riga (raster)', /Lavoro\.prototype\.avanza/.test(js) && /this\.fase < 2/.test(js) && /this\.bande/.test(js));
t('si ferma quando non è sullo schermo o la scheda è nascosta', /IntersectionObserver/.test(js) && /document\.hidden/.test(js));
t('chi chiede meno movimento vede la targa già incisa, ferma', /prefers-reduced-motion: reduce/.test(js) && /this\.lav\.completa\(\)/.test(js));
t('senza WebGL resta la foto di un lavoro vero', /class="rs3d-stage__foto" src="img\/proj-1-1\.webp"/.test(html) && existsSync('img/proj-1-1.webp') && /rs3d--foto/.test(js) && /rs3d--foto/.test(css));
t('la scena ha un nome per i lettori di schermo', /<canvas id="rs3dCanvas" role="img" aria-label="[^"]+"/.test(html));
t('sul telefono si scorre la pagina anche toccando la scena', /touch-action:pan-y/.test(css));

console.log('\n=== PREVENTIVO ===');
t('il nome e il materiale arrivano nel preventivo già compilati', /<form class="rs3d-form" id="rs3dForm" action="quote\/" method="get"/.test(html) && /name="idea" id="rs3dIdea"/.test(html) && /'\?idea=' \+ encodeURIComponent/.test(js) && /export function precompilaIdea/.test(readFileSync('assets/js/forms.js', 'utf8')));
t('il link WhatsApp porta la stessa richiesta e non viene sovrascritto', /id="rs3dWa" data-wa-keep/.test(html) && /wa\.href = WA \+ encodeURIComponent/.test(js));

console.log('\n=== PATTERN INCISI ===');
const pattern = ['nido-ape', 'guilloche', 'venature'];
t('generati dallo script e presenti', existsSync('scripts/genera-pattern.mjs') && pattern.every(p => existsSync(`assets/patterns/${p}.svg`)));
t('leggeri (sotto 50 KB ciascuno)', pattern.every(p => readFileSync(`assets/patterns/${p}.svg`).length < 50 * 1024));
t('colorati dai token con mask, non incollati come immagini', pattern.every(p => new RegExp(`mask(?:-image)?:url\\('\\.\\./patterns/${p}\\.svg'\\)`).test(css)));

console.log('\n=== TESTI ===');
const tx = JSON.parse(readFileSync('data/texts.json', 'utf8'));
const chiavi = ['heroQuoteBtn', 'heroLinkWa', 'heroImgAlt', 'rs3dLabel', 'rs3dPh', 'rs3dMatLegend', 'rs3dMat0', 'rs3dMat1', 'rs3dMat2', 'rs3dMat3', 'rs3dNote', 'rs3dReplay', 'rs3dAria', 'rs3dDefault', 'rs3dIdea', 'rs3dIdeaVuota', 'rs3dWaMsg'];
t('testi nuovi in italiano e inglese', ['it', 'en'].every(l => chiavi.every(k => String(tx[l][k] || '').trim())));
t('la richiesta composta contiene materiale e testo', ['it', 'en'].every(l => /\{m\}/.test(tx[l].rs3dIdea) && /\{t\}/.test(tx[l].rs3dIdea)));

console.log('\n=== CHIARO E SCURO SU OGNI SCHERMO ===');
t('tablet: niente fascia della barra rapida del telefono sotto l\'intestazione', /@media \(min-width:641px\) and \(max-width:1024px\)\{[^}]*\.atelier-mobile-dock\{display:none!important\}/.test(css));
t('il menu laterale chiuso non lascia ombra sul bordo della pagina', /\.drawer:not\(\.open\)\{box-shadow:none!important\}/.test(css));
t('la notifica nascosta non affiora in fondo allo schermo', /#toast\.toast:not\(\.on\)\{visibility:hidden\}/.test(css));
t('una sola barra di avanzamento, in oro e brace', /#progress\.progress\{[^}]*var\(--rs-gold\),var\(--rs-ember\)/.test(css) && !/animation-timeline:scroll\(root\)/.test(css));
t('tema chiaro: il piano del laser diventa alluminio chiaro, didascalie leggibili', /:root\[data-mode="light"\]\[data-mode="light"\] \.rs3d-stage\{/.test(css) && /:root\[data-mode="light"\]\[data-mode="light"\] \.rs3d-stage__cap button\{/.test(css));
t('modulo del preventivo nei colori della casa in entrambi i temi', /form\.quote-form\{background:var\(--rs-bg-2\)!important/.test(css));
t('pulsante «scegli file» del browser nei colori del sito', /::file-selector-button\{/.test(css));

console.log(`\n=========== RESTYLE 2026: ${ok} passati, ${ko} falliti ===========`);
process.exit(ko ? 1 : 0);
