/* ============ NEUTRALIZZA I COLORI SCRITTI A MANO ============

   Il brief vieta un'identità verde/petrolio e chiede una palette di neutri
   (Titanium, Graphite, Warm White) con un solo accento, lo Champagne.

   Nei fogli di stile c'erano ~560 colori verdi e blu scritti a mano, molti
   con !important: nessun file di token, caricato dopo, li può battere
   senza aggiungere altri !important — cioè senza peggiorare la guerra di
   override che li ha prodotti. Per questo la correzione sta alla fonte.

   COME CONVERTE, e perché così:
   ogni colore saturo nelle tonalità verde, petrolio e blu diventa un neutro
   con la STESSA LUMINANZA RELATIVA e la stessa trasparenza. La luminanza è
   ciò che decide il contrasto WCAG: conservandola, ogni coppia testo/sfondo
   progettata prima resta leggibile esattamente come prima, cambia solo la
   tinta. I neutri scuri prendono la tinta fredda del Titanium (#111318), i
   chiari quella calda del Warm White (#F8F7F4): così non nasce un grigio
   «da ufficio», ma la stessa famiglia della palette.

   RESTANO INTATTI: il verde di WhatsApp (è il loro marchio) e i colori di
   stato — successo, errore, avviso — che il brief chiede accessibili.

   Uso:
     node scripts/neutralizza-colori.mjs            anteprima, non scrive
     node scripts/neutralizza-colori.mjs --scrivi   applica
*/
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { pathToFileURL } from 'url';

const SCRIVI = process.argv.includes('--scrivi');
const DIR = 'assets/css';

/* Colori che hanno un significato proprio e non vanno toccati. */
const INTOCCABILI = new Set([
  '#25d366', '#128c7e', '#075e54', // WhatsApp
  '#16a34a', '#2ecc71', '#22c55e', // successo
]);
const INTOCCABILI_RGB = new Set(['37,211,102']);

const lin = c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const luminanza = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);

function hls(r, g, b) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  if (max === min) return [0, l, 0];
  const d = max - min, s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, l, s];
}

/* Va convertito? Solo i colori che hanno davvero una tinta nelle tonalità
   vietate.

   La misura è la CROMA — la distanza fra il canale più alto e il più
   basso — e non la saturazione HLS. Al buio la saturazione HLS si gonfia:
   #15181f, un neutro con appena 10/255 fra i canali, risulta «saturo al
   19%», e con quella misura anche il Titanium del brief (#111318) sarebbe
   stato sul confine. La prima versione di questo script usava HLS, e alla
   seconda passata segnalava come «blu» i suoi stessi neutri.
   Per riferimento: Titanium ha croma 7, il petrolio #071c22 ne ha 27, il
   blu #3b7de0 ne ha 165. La soglia sta a 16. */
const CROMA_MIN = 16 / 255;
function daConvertire(r, g, b) {
  const croma = Math.max(r, g, b) - Math.min(r, g, b);
  if (croma < CROMA_MIN) return false;
  const [h] = hls(r, g, b);
  return h >= 70 && h < 265; // verde · petrolio · teal · blu
}

/* Le due tinte della palette, ridotte a una direzione (somma zero): si
   aggiunge al grigio una frazione di questa direzione, senza spostarne
   la luminanza in modo apprezzabile. */
const FREDDA = [0x11 - 0x14, 0x13 - 0x14, 0x18 - 0x14];     // dal Titanium #111318
const CALDA = [0xf8 - 0xf6, 0xf7 - 0xf6, 0xf4 - 0xf6];      // dal Warm White #F8F7F4

/* Il grigio con la stessa luminanza, cercato per bisezione: la funzione
   di luminanza non si inverte a mano in modo esatto, e qui l'esattezza è
   il punto — è quella che tiene fermo il contrasto. */
function neutro(r, g, b) {
  const Y = luminanza(r, g, b);
  let lo = 0, hi = 1;
  for (let i = 0; i < 40; i++) {
    const m = (lo + hi) / 2;
    if (luminanza(m, m, m) < Y) lo = m; else hi = m;
  }
  const v = Math.round(((lo + hi) / 2) * 255);
  const t = v < 128 ? FREDDA : CALDA;
  const k = v < 128 ? 1.4 : 1.0; // la tinta fredda del Titanium è appena più marcata
  return [0, 1, 2].map(i => Math.max(0, Math.min(255, Math.round(v + t[i] * k))));
}

const hex = n => n.toString(16).padStart(2, '0');

function converti(css) {
  let n = 0;
  const out = css
    .replace(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g, (tutto, h) => {
      const full = (h.length === 3 ? h.split('').map(x => x + x).join('') : h).toLowerCase();
      if (INTOCCABILI.has('#' + full)) return tutto;
      const [r, g, b] = [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16) / 255);
      if (!daConvertire(r, g, b)) return tutto;
      n++;
      return '#' + neutro(r, g, b).map(hex).join('');
    })
    .replace(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*(?:var\([^()]*\)|[\d.]+%?)\s*)?\)/g, (tutto, R, G, B, a) => {
      /* l'opacità può essere un numero o un token: rgba(8,12,26,var(--velo,.48)).
         La prima versione accettava solo numeri e lasciava tinti i veli sopra
         la foto di sfondo; il test del design system se n'è accorto. */
      if (INTOCCABILI_RGB.has(`${R},${G},${B}`)) return tutto;
      const [r, g, b] = [R, G, B].map(x => +x / 255);
      if (!daConvertire(r, g, b)) return tutto;
      n++;
      const [x, y, z] = neutro(r, g, b);
      return a ? `rgba(${x},${y},${z}${a.replace(/\s+/g, '')})` : `rgb(${x},${y},${z})`;
    });
  return { out, n };
}

/* Gira solo se lanciato da riga di comando: il test importa le funzioni
   e non deve scrivere niente. */
if (import.meta.url === pathToFileURL(process.argv[1] || '').href) {
let totale = 0;
for (const f of readdirSync(DIR).filter(x => x.endsWith('.css')).sort()) {
  const p = `${DIR}/${f}`;
  const { out, n } = converti(readFileSync(p, 'utf8'));
  if (!n) continue;
  totale += n;
  console.log(`  ${f.padEnd(22)} ${String(n).padStart(4)} colori`);
  if (SCRIVI) writeFileSync(p, out);
}
console.log(`\n  ${totale} colori ${SCRIVI ? 'convertiti' : 'da convertire (anteprima: rilancia con --scrivi)'}`);
}

export { converti, neutro, luminanza, daConvertire };
