/* Le fotografie delle macchine, e il permesso di mostrarle.

   Le foto dei prodotti xTool sono materiale di xTool. Pubblicarle dal sito
   INGLY è ridistribuzione, e si fa con il permesso del produttore — non
   perché il file è raggiungibile.

   Il rischio che questi controlli coprono non è estetico: è che
   un'immagine finisca online senza quel permesso, o che una fotografia
   ritragga un modello diverso da quello della scheda. Entrambe le cose si
   notano tardi e costano. */
import * as LAB from '../assets/js/lab.js';
import { readFileSync, existsSync, readdirSync } from 'fs';

let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };

const MAN = JSON.parse(readFileSync('data/immagini-macchine.json', 'utf8'));
const MAC = JSON.parse(readFileSync('data/macchine.json', 'utf8'));
const D = { IMMAGINI_MACCHINE: MAN, MACCHINE: MAC };

console.log('\n=== IL MANIFEST ===');
check('il manifest elenca delle macchine', (MAN.macchine || []).length > 0, String((MAN.macchine || []).length));
check('ogni riga ha un id', MAN.macchine.every(r => r.id));
check('ogni riga dice che modello è', MAN.macchine.every(r => r.modello));
check('ogni riga dichiara da dove viene', MAN.macchine.every(r => r.origine || r.paginaUfficiale));
check('ogni riga dichiara dove andrebbe il file', MAN.macchine.every(r => r.destinazione));
check('ogni riga ha un testo alternativo nelle due lingue',
  MAN.macchine.every(r => r.alt && r.alt.it && r.alt.en));
/* `assetKind` del brief: un'immagine ufficiale del produttore non è un
   lavoro di INGLY, e il portfolio non deve poterla rivendicare */
check('ogni riga dichiara che tipo di materiale è',
  MAN.macchine.every(r => ['official-machine', 'illustrative-example', 'licensed-stock', 'customer-work', 'ingly-original'].includes(r.tipoAsset)));
check('sono tutte sostituibili da una foto nostra', MAN.macchine.every(r => r.sostituibile !== false));

console.log('\n=== OGNI RIGA PUNTA A UNA MACCHINA CHE ESISTE ===');
/* una foto agganciata a un id sbagliato è una foto sulla scheda sbagliata */
const idVeri = (MAC.catalogo || []).map(m => m.id);
const orfane = MAN.macchine.filter(r => !idVeri.includes(r.id));
check('nessuna riga punta a una macchina inesistente', orfane.length === 0, orfane.map(r => r.id).join());
check('nessun id ripetuto nel manifest',
  new Set(MAN.macchine.map(r => r.id)).size === MAN.macchine.length);
/* i modelli della serie F si somigliano nel nome: scambiarli è facile e
   il brief lo chiede esplicitamente */
MAN.macchine.forEach(r => {
  const m = (MAC.catalogo || []).find(x => x.id === r.id);
  if (!m) return;
  const nome = String((m.n && (m.n.it || m.n)) || '').toLowerCase().replace(/\s+/g, ' ');
  const dichiarato = String(r.modello || '').toLowerCase().replace(/\s+/g, ' ');
  check(`«${r.modello}» combacia col nome nel catalogo`, nome === dichiarato, `catalogo: «${nome}»`);
});

console.log('\n=== NESSUNA IMMAGINE ESCE SENZA PERMESSO ===');
const stati = ['da-verificare', 'consentito', 'negato'];
check('ogni riga dichiara uno stato di licenza noto',
  MAN.macchine.every(r => stati.includes((r.licenza || {}).stato)));
check('ogni riga dice di chi è l\'immagine', MAN.macchine.every(r => (r.licenza || {}).titolare));
/* il controllo che conta: senza «consentito» la foto NON esce */
const senzaPermesso = MAN.macchine.filter(r => (r.licenza || {}).stato !== 'consentito');
check('una licenza non concessa non produce nessuna foto',
  senzaPermesso.every(r => LAB.fotoMacchina(D, r.id).foto === null),
  senzaPermesso.filter(r => LAB.fotoMacchina(D, r.id).foto).map(r => r.id).join());
/* e un file sul disco non basta: il permesso viene prima */
const conFileSenzaPermesso = { IMMAGINI_MACCHINE: { macchine: [{
  id: 'x', modello: 'X', file: 'assets/images/machines/x.webp',
  licenza: { stato: 'da-verificare', titolare: 'xTool' }, alt: { it: 'x', en: 'x' } }] } };
check('un file presente NON basta: serve il permesso',
  LAB.fotoMacchina(conFileSenzaPermesso, 'x').foto === null);
/* e il permesso da solo non basta: serve anche il file */
const permessoSenzaFile = { IMMAGINI_MACCHINE: { macchine: [{
  id: 'y', modello: 'Y', file: '',
  licenza: { stato: 'consentito', titolare: 'xTool' }, alt: { it: 'y', en: 'y' } }] } };
check('il permesso da solo non basta: serve il file',
  LAB.fotoMacchina(permessoSenzaFile, 'y').foto === null);
/* con tutti e due, esce */
const tutto = { IMMAGINI_MACCHINE: { macchine: [{
  id: 'z', modello: 'Z', file: 'assets/images/machines/z.webp', tipoAsset: 'official-machine',
  paginaUfficiale: 'https://www.xtool.com/', licenza: { stato: 'consentito', titolare: 'xTool' },
  alt: { it: 'zeta', en: 'zed' } }] } };
const f = LAB.fotoMacchina(tutto, 'z');
check('con permesso E file la foto esce', f.foto === 'assets/images/machines/z.webp');
check('e porta con sé di chi è', f.credito === 'xTool');
check('e il testo alternativo nelle due lingue', f.alt.it === 'zeta' && f.alt.en === 'zed');
/* senza foto si deve poter mandare alla pagina ufficiale: linkare è sempre
   lecito, copiare no */
check('senza foto resta l\'indirizzo ufficiale',
  LAB.fotoMacchina(D, 'p3').ufficiale.includes('xtool.com'));
check('una macchina fuori dal manifest non esplode',
  LAB.fotoMacchina(D, 'macchina-che-non-esiste').foto === null);
check('nessun dato non esplode', LAB.fotoMacchina({}, 'p3').foto === null);

console.log('\n=== NESSUN FILE FINTO SUL DISCO ===');
/* un file chiamato .webp che non è un webp è il modo più facile di
   spedire un segnaposto spacciandolo per una fotografia */
const cartella = 'assets/images/machines';
if (existsSync(cartella)) {
  const file = readdirSync(cartella);
  const falsi = file.filter(f2 => {
    const b = readFileSync(cartella + '/' + f2).subarray(0, 12);
    const webp = b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP';
    const png = b[0] === 0x89 && b.subarray(1, 4).toString('ascii') === 'PNG';
    const jpeg = b[0] === 0xFF && b[1] === 0xD8;
    return !(webp || png || jpeg);
  });
  check('ogni file nella cartella è davvero un\'immagine', falsi.length === 0, falsi.join());
  check('ogni file sul disco è dichiarato nel manifest',
    file.every(f2 => MAN.macchine.some(r => (r.destinazione || '').endsWith('/' + f2))), file.join());
} else {
  check('la cartella non esiste ancora: nessun file finto', true, 'nessuna immagine scaricata');
}
const stato = LAB.statoFotoMacchine(D);
check('il conteggio delle pubblicabili è coerente',
  stato.pubblicabili === MAN.macchine.filter(r => (r.licenza || {}).stato === 'consentito' && r.file).length);

console.log('\n=== LO SCRIPT DI SCARICAMENTO ===');
const sc = readFileSync('scripts/scarica-immagini-macchine.mjs', 'utf8');
check('si ferma se la licenza non è concessa', /stato !== 'consentito'/.test(sc));
/* una barriera che si salta da riga di comando non è una barriera */
check('non si può saltare il controllo da riga di comando',
  !/--forza|--ignora|--comunque/.test(sc));
check('verifica la risposta HTTP', /resp\.ok/.test(sc));
check('verifica che il tipo dichiarato sia un\'immagine', /\^image\\\//.test(sc) || /image\\\//.test(sc));
/* un server può rispondere 200 con una pagina di errore: contano i byte */
check('verifica i primi byte, non solo l\'intestazione', /function tipoReale/.test(sc));
check('rifiuta i file troppo piccoli', /MINIMO/.test(sc));
check('avvisa che le immagini vanno guardate prima di pubblicarle',
  /GUARDALE PRIMA DI PUBBLICARE/.test(sc));

console.log('\n=== L\'AVVISO DICE IL MOTIVO VERO ===');
/* «Non abbiamo il permesso» e «il permesso c'è ma il file non c'è ancora»
   sono due cose diverse: scrivere la prima quando vale la seconda è
   raccontare male il proprio lavoro. */
const ui0 = readFileSync('assets/js/lab-ui.js', 'utf8');
check('c\'è un messaggio per «non ancora caricata»', /f\.motivo === 'non-scaricata'/.test(ui0));
check('c\'è un messaggio per «permesso negato»', /f\.motivo === 'licenza-negato'/.test(ui0));
check('c\'è un messaggio per «non in manifest»', /f\.motivo === 'non-in-manifest'/.test(ui0));
check('il motivo viaggia con la risposta', ['non-scaricata', 'licenza-da-verificare', 'non-in-manifest']
  .includes(LAB.fotoMacchina(D, 'p3').motivo) || LAB.fotoMacchina(D, 'p3').foto !== null);

console.log('\n=== LA DEMO ===');
const cfg = JSON.parse(readFileSync('data/config.json', 'utf8'));
const dm = LAB.demo({ CONFIG: cfg });
check('la demo è attiva', dm.attiva === true);
/* un bottone che non porta da nessuna parte è peggio di un bottone che non c'è */
check('ha un indirizzo di prenotazione', dm.prenotabile === true, dm.motivo || '');
check('l\'indirizzo è valido', /^https?:\/\//.test(dm.url || ''), dm.url || '');
check('si apre in una scheda nuova', dm.esterno === true);
/* svuotando il campo il sito NON deve fingere un calendario */
const vuota = LAB.demo({ CONFIG: { ...cfg, demo: { ...cfg.demo, bookingUrl: '' } } });
check('svuotando l\'indirizzo torna a proporre WhatsApp ed email', vuota.prenotabile === false);
/* un indirizzo malformato non deve diventare un bottone */
const storta = LAB.demo({ CONFIG: { ...cfg, demo: { ...cfg.demo, bookingUrl: 'support.xtool.com/demo' } } });
check('un indirizzo senza protocollo viene rifiutato', storta.prenotabile === false);

console.log('\n=== IL SITO LE USA ===');
const ui = readFileSync('assets/js/lab-ui.js', 'utf8');
check('la scheda macchina mostra la foto', /fotoMac\(m, L, true\)/.test(ui));
check('le tessere dell\'elenco pure', /fotoMac\(m, L, false\)/.test(ui));
check('la foto porta il credito di chi l\'ha fatta', /mac-credito/.test(ui));
check('senza foto si manda alla pagina ufficiale', /f\.ufficiale/.test(ui));
const css = readFileSync('assets/css/pages.css', 'utf8');
/* spazio riservato: l'immagine non deve spostare il testo quando arriva */
check('l\'immagine ha un rapporto fisso, niente salti di layout', /\.mac-foto img\{[^}]*aspect-ratio/.test(css));
check('il sito carica il manifest', /immagini-macchine/.test(readFileSync('assets/js/data-loader.js', 'utf8')));
check('la riserva legacy lo porta', /IMMAGINI_MACCHINE/.test(readFileSync('scripts/build.mjs', 'utf8')));

console.log(`\n=========== FOTO MACCHINE: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
