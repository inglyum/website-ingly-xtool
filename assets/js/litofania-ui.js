/* ============ LITOFANIA — PAGINA ============
   Collega i comandi della pagina al motore (litofania.js). La foto non
   lascia il dispositivo: solo se chi la carica sceglie «Stampala tu, INGLY»
   passa al modulo preventivo, come allegato, nella stessa scheda. */
import * as LT from './litofania.js';

const $ = id => document.getElementById(id);
const CHIAVE = 'ingly_prova_incisione';   /* stessa consegna al preventivo di «Prova la tua foto incisa» */
const MAX_LATO = 900;                     /* px: oltre non aggiunge dettaglio stampabile */

const T = {
  it: {
    kicker: 'LITOFANIA · STAMPA 3D', back3d: 'Stampa 3D', back: 'Tutti i generatori',
    title: 'La tua foto,<br><span>accesa dalla luce.</span>',
    intro: 'Una litofania è un pannello stampato in 3D: spento sembra un rilievo bianco, con una luce dietro diventa la tua foto. Carica l’immagine, regola gli spessori e scarica il file STL, oppure chiedi a noi di stamparla. La foto resta sul tuo dispositivo.',
    settings: 'Imposta il pannello', file: '1. La tua foto', pick: 'Scegli una foto', noPhoto: 'Nessuna foto scelta', fileNote: 'JPG, PNG o WebP fino a 25 MB. Meglio un volto o un soggetto ben illuminato, senza sfondi confusi.',
    shape: '2. Forma', flat: 'Piana', curved: 'Curva', shapeNote: 'La curva sta in piedi da sola ed è perfetta con una lucina LED dietro.',
    width: 'Larghezza', frame: 'Cornice', min: 'Spessore minimo', max: 'Spessore massimo', contrast: 'Contrasto', bright: 'Luminosità',
    detail: 'Dettaglio', detailNote: 'Passo della griglia. Più fine = più dettaglio e file più pesante. 0,3 mm va bene con un ugello da 0,4.',
    download: 'Scarica il file STL', quote: 'Stampala tu, INGLY',
    notice: 'Stampa in piedi, riempimento 100%, filamento bianco (PLA). L’anteprima è indicativa: la resa dipende da stampante, filamento e luce.',
    preview: 'Anteprima', lit: 'Con la luce dietro', off: 'Luce spenta', empty: 'Carica una foto per vedere la tua litofania.',
    dSize: 'Misure', dWeight: 'PLA indicativo', dFile: 'File STL', ready: 'Pronto. La foto resta sul tuo dispositivo.',
    howTitle: 'Come si stampa una litofania',
    s1t: 'Filamento bianco', s1d: 'PLA bianco o naturale: i colori scuri non lasciano passare la luce.',
    s2t: 'In piedi, pieno al 100%', s2d: 'Il pannello si stampa verticale con riempimento pieno: così ogni spessore è quello calcolato.',
    s3t: 'Strati sottili', s3d: '0,12–0,16 mm di altezza strato danno sfumature morbide; più alti mostrano gradini.',
    s4t: 'Una luce calda dietro', s4d: 'Una lucina LED o una candela elettrica a qualche centimetro: la foto compare.',
    foot: 'Generatore originale INGLY: il file è tuo, anche per uso personale e regalo.', footLink: 'Scopri la stampa 3D INGLY',
    docTitle: 'Litofania dalla tua foto — file STL per stampa 3D | INGLY DESIGN',
    light: 'Chiaro', dark: 'Scuro', toLight: 'Passa alla modalità chiara', toDark: 'Passa alla modalità scura', lang: 'Switch to English',
    loading: 'Leggo la foto…', loaded: n => `Foto caricata: ${n}. Regola gli spessori e guarda l’anteprima.`,
    badFile: 'Questo file non è una foto JPG, PNG o WebP.', tooBig: 'La foto supera 25 MB: prova con una versione più leggera.',
    building: 'Preparo il file STL…', built: (kb, n) => `File pronto: ${kb} · ${n} triangoli.`,
    saved: 'Ti porto al preventivo con la foto già allegata…', noSpace: 'Il browser non ha spazio per passare la foto: allegala tu nel modulo.',
    desc: (forma, w, h, mi, ma, k) => `Litofania stampata in 3D, pannello ${forma}, ${w} × ${h} mm, spessore da ${mi} a ${ma} mm, cornice ${k} mm. Foto e anteprima allegate.`,
    forme: { piano: 'piano', curva: 'curvo' },
  },
  en: {
    kicker: 'LITHOPHANE · 3D PRINTING', back3d: '3D printing', back: 'All generators',
    title: 'Your photo,<br><span>lit from within.</span>',
    intro: 'A lithophane is a 3D-printed panel: unlit it looks like a white relief, with a light behind it becomes your photo. Upload the image, set the thickness and download the STL file, or ask us to print it. The photo stays on your device.',
    settings: 'Set up the panel', file: '1. Your photo', pick: 'Choose a photo', noPhoto: 'No photo chosen', fileNote: 'JPG, PNG or WebP up to 25 MB. A face or a well-lit subject without a busy background works best.',
    shape: '2. Shape', flat: 'Flat', curved: 'Curved', shapeNote: 'The curved panel stands on its own and looks great with a small LED behind it.',
    width: 'Width', frame: 'Frame', min: 'Minimum thickness', max: 'Maximum thickness', contrast: 'Contrast', bright: 'Brightness',
    detail: 'Detail', detailNote: 'Grid spacing. Finer = more detail and a heavier file. 0.3 mm suits a 0.4 nozzle.',
    download: 'Download the STL file', quote: 'Have INGLY print it',
    notice: 'Print upright, 100% infill, white filament (PLA). The preview is indicative: results depend on printer, filament and light.',
    preview: 'Preview', lit: 'Backlit', off: 'Light off', empty: 'Upload a photo to see your lithophane.',
    dSize: 'Size', dWeight: 'Approx. PLA', dFile: 'STL file', ready: 'Ready. The photo stays on your device.',
    howTitle: 'How to print a lithophane',
    s1t: 'White filament', s1d: 'White or natural PLA: dark colours block the light.',
    s2t: 'Upright, 100% infill', s2d: 'Print the panel standing with solid infill, so every thickness is exactly as calculated.',
    s3t: 'Thin layers', s3d: '0.12–0.16 mm layer height gives smooth shading; thicker layers show steps.',
    s4t: 'A warm light behind', s4d: 'A small LED or an electric candle a few centimetres away: the photo appears.',
    foot: 'Original INGLY generator: the file is yours, for personal use and gifts too.', footLink: 'Discover INGLY 3D printing',
    docTitle: 'Lithophane from your photo — STL file for 3D printing | INGLY DESIGN',
    light: 'Light', dark: 'Dark', toLight: 'Switch to light mode', toDark: 'Switch to dark mode', lang: 'Passa in italiano',
    loading: 'Reading the photo…', loaded: n => `Photo loaded: ${n}. Adjust the thickness and check the preview.`,
    badFile: 'This file is not a JPG, PNG or WebP photo.', tooBig: 'The photo is over 25 MB: try a lighter version.',
    building: 'Building the STL file…', built: (kb, n) => `File ready: ${kb} · ${n} triangles.`,
    saved: 'Taking you to the quote with the photo attached…', noSpace: 'The browser has no room to pass the photo: please attach it in the form.',
    desc: (forma, w, h, mi, ma, k) => `3D-printed lithophane, ${forma} panel, ${w} × ${h} mm, thickness ${mi} to ${ma} mm, ${k} mm frame. Photo and preview attached.`,
    forme: { piano: 'flat', curva: 'curved' },
  },
};

let lingua = 'it', lum = null, iw = 0, ih = 0, griglia = null, nomeFoto = 'foto', fotoUrl = '', attesa = 0;
const tx = k => T[lingua][k];
const mm = v => (lingua === 'en' ? String(v) : String(v).replace('.', ','));
const uno = v => Math.round(v * 10) / 10;
const scelta = n => (document.querySelector(`input[name="${n}"]:checked`) || {}).value;
const CAMPI = ['larghezza', 'cornice', 'minimo', 'massimo', 'contrasto', 'luminosita', 'risoluzione'];
const UNITA = { larghezza: ' mm', cornice: ' mm', minimo: ' mm', massimo: ' mm', risoluzione: ' mm', contrasto: '', luminosita: '' };

function parametri() {
  const o = { forma: scelta('forma') };
  for (const k of CAMPI) o[k] = Number($(k).value);
  return LT.normalizza(o);
}

function stato(msg, errore = false) { const s = $('status'); s.textContent = msg; s.dataset.error = String(errore); }

function testi() {
  document.documentElement.lang = lingua;
  document.title = tx('docTitle');
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = tx(el.dataset.i18n); if (typeof v !== 'string') return;
    if (el.dataset.i18n === 'title') el.innerHTML = v; else el.textContent = v;   /* titolo: markup statico nostro */
  });
  $('langSwitch').textContent = lingua === 'it' ? 'EN' : 'IT';
  $('langSwitch').setAttribute('aria-label', tx('lang'));
  tema();
  uscite();
  if (griglia) dati();
}

function tema() {
  const chiaro = document.documentElement.dataset.mode === 'light';
  const b = $('modeSwitch');
  b.textContent = chiaro ? tx('dark') : tx('light');
  b.setAttribute('aria-label', chiaro ? tx('toDark') : tx('toLight'));
  document.querySelector('meta[name="theme-color"]').setAttribute('content', chiaro ? '#f7f2ea' : '#13100d');
}

function uscite() {
  const p = parametri();
  for (const k of CAMPI) {
    const v = k === 'contrasto' || k === 'luminosita' ? Math.round(p[k] * 100) : (k === 'minimo' || k === 'massimo' ? p[k].toFixed(1) : p[k]);
    $(k + 'Out').textContent = mm(v) + UNITA[k];
  }
}

function disegna() {
  if (!griglia) return;
  const { nx, ny } = griglia, w = nx + 1, h = ny + 1;
  const px = scelta('vista') === 'spenta' ? LT.rilievo(griglia) : LT.controluce(griglia);
  let c = $('stage').querySelector('canvas');
  if (!c) { $('stage').innerHTML = ''; c = document.createElement('canvas'); c.setAttribute('role', 'img'); $('stage').appendChild(c); }
  c.width = w; c.height = h;
  c.getContext('2d').putImageData(new ImageData(px, w, h), 0, 0);
  c.setAttribute('aria-label', lingua === 'en' ? 'Lithophane preview' : 'Anteprima della litofania');
}

function dati() {
  const { W, H, nx, ny } = griglia;
  const ntri = LT.stimaTriangoli(nx, ny);
  /* volume senza costruire il solido: area della cella × spessore medio */
  let somma = 0; for (const s of griglia.t) somma += s;
  const vol = somma / griglia.t.length * W * H;
  $('dMisure').textContent = `${mm(uno(W))} × ${mm(uno(H))} mm`;
  $('dPeso').textContent = `≈ ${LT.grammi(vol)} g`;
  const mb = (84 + ntri * 50) / 1048576;
  $('dFile').textContent = `≈ ${mm(mb >= 10 ? Math.round(mb) : mb.toFixed(1))} MB`;
  $('avvisi').innerHTML = LT.controlli(griglia).map(a => `<li data-livello="${a.livello}">${a[lingua].replace(/&/g, '&amp;').replace(/</g, '&lt;')}</li>`).join('');
}

function aggiorna() {
  uscite();
  if (!lum) return;
  cancelAnimationFrame(attesa);
  attesa = requestAnimationFrame(() => {
    griglia = LT.spessori(lum, iw, ih, parametri());
    disegna(); dati();
  });
}

function carica(file) {
  if (!file) return;
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { stato(tx('badFile'), true); return; }
  if (file.size > 25 * 1024 * 1024) { stato(tx('tooBig'), true); return; }
  stato(tx('loading'));
  $('photoName').textContent = file.name; $('photoName').dataset.i18n = '';
  nomeFoto = file.name.replace(/\.[^.]+$/, '').replace(/[^\w-]+/g, '-').slice(0, 40) || 'foto';
  const url = URL.createObjectURL(file), img = new Image();
  img.onload = () => {
    const s = Math.min(1, MAX_LATO / Math.max(img.naturalWidth, img.naturalHeight));
    iw = Math.max(2, Math.round(img.naturalWidth * s)); ih = Math.max(2, Math.round(img.naturalHeight * s));
    const c = document.createElement('canvas'); c.width = iw; c.height = ih;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0, iw, ih);
    lum = LT.luminanze(g.getImageData(0, 0, iw, ih).data, iw, ih);
    fotoUrl = c.toDataURL('image/jpeg', 0.82);
    URL.revokeObjectURL(url);
    $('scarica').disabled = $('preventivo').disabled = false;
    stato(tx('loaded')(file.name));
    aggiorna();
  };
  img.onerror = () => { URL.revokeObjectURL(url); stato(tx('badFile'), true); };
  img.src = url;
}

function scarica() {
  if (!griglia) return;
  stato(tx('building'));
  setTimeout(() => {
    const solido = LT.solido(griglia), buf = LT.stl(solido, 'INGLY DESIGN litofania ' + nomeFoto);
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([buf], { type: 'model/stl' }));
    a.download = `ingly-litofania-${nomeFoto}-${griglia.W}mm.stl`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    const mb = buf.byteLength / 1048576;
    stato(tx('built')(mm(mb.toFixed(1)) + ' MB', (solido.tri.length / 3).toLocaleString(lingua === 'en' ? 'en-GB' : 'it-IT')));
  }, 30);
}

function preventivo() {
  if (!griglia || !fotoUrl) return;
  const c = $('stage').querySelector('canvas');
  const p = griglia.p;
  const dati = {
    t: Date.now(), materiale: 'PLA/PETG (3D)',
    descrizione: tx('desc')(tx('forme')[p.forma], mm(uno(griglia.W)), mm(uno(griglia.H)), mm(p.minimo.toFixed(1)), mm(p.massimo.toFixed(1)), mm(p.cornice)),
    file: [{ nome: `${nomeFoto}.jpg`, dati: fotoUrl }, c ? { nome: `anteprima-litofania-${nomeFoto}.jpg`, dati: c.toDataURL('image/jpeg', 0.85) } : null].filter(Boolean),
  };
  try { sessionStorage.setItem(CHIAVE, JSON.stringify(dati)); } catch (e) { stato(tx('noSpace'), true); return; }
  stato(tx('saved'));
  location.assign('quote/?da=litofania');
}

function avvia() {
  try { lingua = localStorage.getItem('ingly_lang') === 'en' ? 'en' : 'it'; } catch (_) {}
  testi();
  $('langSwitch').addEventListener('click', () => { lingua = lingua === 'it' ? 'en' : 'it'; try { localStorage.setItem('ingly_lang', lingua); } catch (_) {} testi(); });
  $('modeSwitch').addEventListener('click', () => {
    const r = document.documentElement, v = r.dataset.mode === 'light' ? 'dark' : 'light';
    r.dataset.mode = v; try { localStorage.setItem('ingly_mode', v); } catch (_) {}
    tema();
  });
  $('photo').addEventListener('change', e => carica(e.target.files && e.target.files[0]));
  for (const k of CAMPI) $(k).addEventListener('input', aggiorna);
  document.querySelectorAll('input[name="forma"]').forEach(r => r.addEventListener('change', aggiorna));
  document.querySelectorAll('input[name="vista"]').forEach(r => r.addEventListener('change', disegna));
  $('scarica').addEventListener('click', scarica);
  $('preventivo').addEventListener('click', preventivo);
}
avvia();
