/* UN SOLO FOGLIO DI STILE (Fase 1.1)

   Il sito caricava 22 fogli di stile, uno dopo l'altro: 22 richieste prima
   di poter disegnare la pagina. Qui li uniamo in assets/css/ingly.css,
   NELLO STESSO ORDINE: la cascata (chi vince su chi) resta identica.

   - I 22 file restano i sorgenti: si modificano quelli, mai ingly.css.
   - Nessuna minificazione: la regola 14 vuole i data-URI tra apici singoli
     e un minificatore li riscrive. GitHub Pages comprime già con gzip.
   - ORDINE è la fonte di verità: index.html, i test e il service worker
     lo leggono da assets/css/ingly.manifest.json.

   Uso: node scripts/css-bundle.mjs (lo lancia anche npm run build). */
import { readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';

/* L'ordine conta: l'ultimo vince. brand-system-2026.css è l'autorità del
   marchio e deve restare ultimo. */
export const ORDINE = [
  'reset.css', 'variables.css', 'animations.css', 'layout.css', 'components.css',
  'nav-ia.css', 'pages.css', 'responsive.css', 'premium-2026.css',
  'atelier-foundation.css', 'notte-oro.css', 'ingly-user-loader.css',
  'signature-showcase.css', 'maison-reference.css', 'ingly-studio-refinement.css',
  'ingly-josefin-studio.css', 'ingly-responsive-theme.css', 'foundation-components.css',
  'real-photography.css', 'ingly-immersive-2026.css', 'ux-fluidity-sprint16.css',
  'brand-system-2026.css'
];

/* le pagine che caricano il bundle (la vetrina e la pagina del design system) */
export const PAGINE = ['index.html', 'design-system.html'];

export function componi(leggi = f => readFileSync('assets/css/' + f, 'utf8')) {
  const parti = ORDINE.map(f => `/* ==== ${f} ==== */\n` + leggi(f).replace(/\s+$/, '') + '\n');
  return '/* GENERATO da scripts/css-bundle.mjs — non modificare: si modificano i file sorgente. */\n' + parti.join('\n');
}

export const impronta = testo => createHash('sha256').update(testo).digest('hex').slice(0, 10);

if (import.meta.url === `file://${process.argv[1]}`) {
  const css = componi();
  const v = impronta(css);
  writeFileSync('assets/css/ingly.css', css);
  /* Versione compressa servita ai visitatori (ingly.css resta leggibile: è
     quella che i test e le persone leggono). Stesso contenuto, stessa
     cascata: esbuild toglie solo commenti, spazi e doppioni identici. */
  const min = (await import('esbuild')).transformSync(css, { loader: 'css', minify: true }).code;
  writeFileSync('assets/css/ingly.min.css', min);
  writeFileSync('assets/css/ingly.manifest.json', JSON.stringify({ ordine: ORDINE.map(f => 'assets/css/' + f), v }, null, 2) + '\n');
  /* index.html punta sempre all'ultima versione: ?v= cambia quando cambia il CSS */
  for (const pagina of PAGINE) {
    const html = readFileSync(pagina, 'utf8');
    const nuovo = html.replace(/<link rel="stylesheet" href="assets\/css\/ingly(?:\.min)?\.css(?:\?v=[a-f0-9]+)?">/, `<link rel="stylesheet" href="assets/css/ingly.min.css?v=${v}">`);
    if (nuovo !== html) writeFileSync(pagina, nuovo);
  }
  console.log(`✔ assets/css/ingly.css: ${ORDINE.length} fogli in ordine, ${Math.round(css.length / 1024)} kB → ingly.min.css ${Math.round(min.length / 1024)} kB, v=${v}`);
}
