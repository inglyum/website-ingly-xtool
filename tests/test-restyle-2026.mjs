/* RESTYLE 2026 — «negozio moderno pulito» (riferimento Shopify Dawn), scelto
   dal titolare: logo e oro restano, il resto si rifà. */
import { readFileSync, existsSync } from 'node:fs';
let ok = 0, ko = 0; const t = (n, c) => { c ? ok++ : ko++; console.log((c ? '  ✔ ' : '  ✘ ') + n); };
const css = readFileSync('assets/css/restyle-2026.css', 'utf8');
const html = readFileSync('index.html', 'utf8');
t('carattere Assistant servito dal sito (niente servizi esterni)', ['400', '600', '700'].every(w => existsSync(`assets/fonts/assistant/assistant-latin-${w}-normal.woff2`)) && /src:url\('\.\.\/fonts\/assistant\//.test(css));
t('tema chiaro di serie, scuro come variante', /var m="light"/.test(html) && /:root\[data-mode="light"\]\{/.test(css) && /:root\[data-mode="dark"\]\{/.test(css));
t('oro solo per le azioni: pulsante principale oro', /\.btn\.btn-primary[^{]*\{\s*background:var\(--rs-gold\)/.test(css));
t('home: foto vera di un lavoro come apertura', /class="rs-hero-media"><img src="img\/proj-1-1\.webp"/.test(html) && existsSync('img/proj-1-1.webp'));
t('home: «Cosa vuoi realizzare?» apre il preventivo compilato', /<form class="rs-quote" action="quote\/" method="get"/.test(html) && /name="idea"/.test(html) && /export function precompilaIdea/.test(readFileSync('assets/js/forms.js', 'utf8')));
t('la home si riorganizza solo quando è la pagina aperta', /#page-home\.page\.active\{display:flex/.test(css) && !/#page-home\{display:flex/.test(css));
t('nessuna etichetta sopra i titoli nella home e nella chiusura', /\.ft-eyebrow\{display:none/.test(css));
const tx = JSON.parse(readFileSync('data/texts.json', 'utf8'));
const lingue = Object.values(tx).filter(o => o && typeof o === 'object' && 'heroQuoteBtn' in o);
t('testi nuovi in italiano e inglese', lingue.length >= 2 && lingue.every(o => ['heroQuoteLabel', 'heroQuotePh', 'heroQuoteBtn', 'heroLinkWa', 'heroImgAlt'].every(k => String(o[k] || '').trim())));
console.log(`\n=========== RESTYLE 2026: ${ok} passati, ${ko} falliti ===========`);
process.exit(ko ? 1 : 0);
