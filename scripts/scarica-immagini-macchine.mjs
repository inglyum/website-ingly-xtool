/* ============ SCARICA LE FOTOGRAFIE UFFICIALI DELLE MACCHINE ============

   Legge data/immagini-macchine.json, scarica le immagini dichiarate,
   verifica che siano immagini vere e le mette in assets/images/machines/.

   PERCHÉ ESISTE QUESTO SCRIPT E NON L'HO GIÀ FATTO IO. La sessione in cui
   lavoro ha la rete limitata a una lista di indirizzi: cdn.shopify.com e
   www.xtool.com rispondono «403» al tentativo di connessione, quindi da
   qui le immagini non si scaricano. Lanciandolo sul tuo computer funziona.

   PERCHÉ NON SCARICA NIENTE FINCHÉ NON DICI CHE SI PUÒ. Le fotografie dei
   prodotti xTool sono materiale di xTool. Metterle su inglydesign.it è
   ridistribuzione: si fa con il permesso del produttore, non perché il
   file è raggiungibile. Lo script si ferma finché `licenza.stato` nel
   manifest non dice «consentito», e non c'è nessun modo di saltare quel
   controllo da riga di comando: va scritto nel file, dove resta e si vede.

   COSA VERIFICA, per ogni immagine:
     · la risposta è 200;
     · il tipo dichiarato è un'immagine;
     · i primi byte sono davvero quelli di un'immagine (WebP, PNG, JPEG) —
       un server che risponde con una pagina di errore «200 OK» non passa;
     · il file non è sospettosamente piccolo (sotto i 5 KB di solito è un
       segnaposto o un errore).

   Uso:
     node scripts/scarica-immagini-macchine.mjs            anteprima
     node scripts/scarica-immagini-macchine.mjs --scrivi   scarica davvero
*/

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'fs';
import { dirname } from 'path';

const SCRIVI = process.argv.includes('--scrivi');
const MANIFEST = 'data/immagini-macchine.json';
const MINIMO = 5 * 1024;

const man = JSON.parse(readFileSync(MANIFEST, 'utf8'));
const righe = Array.isArray(man.macchine) ? man.macchine : [];

/* I primi byte dicono che cos'è davvero il file, qualunque cosa dica il
   server nell'intestazione. */
function tipoReale(buf) {
  const b = Buffer.from(buf.slice(0, 16));
  if (b.slice(0, 4).toString('ascii') === 'RIFF' && b.slice(8, 12).toString('ascii') === 'WEBP') return 'webp';
  if (b[0] === 0x89 && b.slice(1, 4).toString('ascii') === 'PNG') return 'png';
  if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return 'jpeg';
  if (b.slice(4, 12).toString('ascii') === 'ftypavif') return 'avif';
  return null;
}

const bloccate = righe.filter(r => (r.licenza || {}).stato !== 'consentito');
if (bloccate.length) {
  console.log('\n  FERMO: ' + bloccate.length + ' immagini su ' + righe.length + ' non hanno il permesso registrato.\n');
  for (const r of bloccate) {
    console.log('   · ' + r.modello.padEnd(22) + ' licenza: ' + ((r.licenza || {}).stato || 'non dichiarata'));
  }
  console.log('\n  Queste fotografie sono di xTool. Prima di pubblicarle dal sito INGLY');
  console.log('  serve il permesso del produttore: di solito è compreso nell\'accordo da');
  console.log('  rivenditore o partner, altrimenti va chiesto per iscritto.');
  console.log('\n  Quando ce l\'hai, in ' + MANIFEST + ' per ogni modello scrivi:');
  console.log('      "licenza": { "stato": "consentito", "titolare": "xTool", "prova": "<dove sta il permesso>" }');
  console.log('\n  Se il permesso NON c\'è, metti "stato": "negato": la scheda mostrerà il');
  console.log('  segnaposto e un collegamento alla pagina ufficiale, che è sempre lecito.\n');
  process.exit(1);
}

if (!righe.length) { console.log('\n  Il manifest non contiene macchine.\n'); process.exit(1); }

let ok = 0, ko = 0;
const problemi = [];

for (const r of righe) {
  const etichetta = r.modello.padEnd(22);
  if (!r.origine) { console.log('  — ' + etichetta + 'nessun indirizzo: salto'); continue; }

  if (!SCRIVI) { console.log('  · ' + etichetta + '→ ' + r.destinazione); continue; }

  try {
    const resp = await fetch(r.origine, { redirect: 'follow' });
    if (!resp.ok) throw new Error('risposta ' + resp.status);

    const tipoDichiarato = resp.headers.get('content-type') || '';
    if (!/^image\//i.test(tipoDichiarato)) throw new Error('non è un\'immagine: ' + tipoDichiarato);

    const buf = Buffer.from(await resp.arrayBuffer());
    const vero = tipoReale(buf);
    if (!vero) throw new Error('i primi byte non sono di un\'immagine (forse una pagina di errore servita con 200)');
    if (buf.length < MINIMO) throw new Error('solo ' + buf.length + ' byte: troppo piccola per essere la foto del prodotto');

    mkdirSync(dirname(r.destinazione), { recursive: true });
    writeFileSync(r.destinazione, buf);
    r.file = r.destinazione;
    r.presaIl = new Date().toISOString().slice(0, 10);
    r.formatoReale = vero;
    r.byte = buf.length;

    console.log('  ✔ ' + etichetta + (buf.length / 1024).toFixed(0).padStart(5) + ' KB  ' + vero + '  → ' + r.destinazione);
    ok++;
  } catch (e) {
    /* «fetch failed» non dice niente a chi legge. Le due cause sono molto
       diverse: o la rete non lascia uscire (succede in ambienti con una
       lista di indirizzi consentiti), o l'indirizzo non va più bene. */
    const m = String(e.message);
    const spiegato = /fetch failed|ENOTFOUND|ECONNREFUSED|EAI_AGAIN|403/.test(m)
      ? m + '  ← la rete non raggiunge l\'indirizzo: riprova da una connessione senza restrizioni'
      : m;
    console.log('  ✖ ' + etichetta + spiegato);
    problemi.push(r.modello + ': ' + m);
    ko++;
  }
}

if (SCRIVI) {
  writeFileSync(MANIFEST, JSON.stringify(man, null, 2) + '\n');
  console.log('\n  Scaricate: ' + ok + '   Non riuscite: ' + ko);
  if (ko) {
    console.log('\n  Quelle non riuscite restano senza file: la scheda mostra il segnaposto,');
    console.log('  che è meglio di un\'immagine sbagliata. Se un indirizzo è cambiato,');
    console.log('  riprendilo dalla pagina ufficiale e aggiorna `origine` nel manifest.');
  }
  console.log('\n  GUARDALE PRIMA DI PUBBLICARE: lo script verifica che siano immagini vere,');
  console.log('  non che ritraggano il modello giusto. Un indirizzo può essere stato');
  console.log('  riusato per un altro prodotto, e una foto della macchina sbagliata su');
  console.log('  una scheda è peggio di nessuna foto.\n');
  console.log('  Poi: npm run build && node scripts/prerender.mjs\n');
} else {
  console.log('\n  (anteprima: ' + righe.length + ' immagini da scaricare — rilancia con --scrivi)\n');
}
