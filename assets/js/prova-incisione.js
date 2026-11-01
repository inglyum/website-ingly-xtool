/* PROVA LA TUA FOTO INCISA — pagina (prova-incisione.html).
   La foto resta sul dispositivo: si legge in un <canvas>, il motore
   (prova-incisione-motore.js) disegna l'anteprima. «Chiedi il preventivo»
   salva foto e anteprima in sessionStorage e apre il modulo preventivo, che
   le allega da solo (assets/js/forms.js → allegaProvaIncisione). */
import { MATERIALI, FORME, luminanza, incidi, misure } from './prova-incisione-motore.js';

const $ = id => document.getElementById(id);
const MAX_FILE = 25 * 1024 * 1024, LATO = 900, CHIAVE = 'ingly_prova_incisione';

const translations = {
  it: {
    kicker: 'PROVA LA TUA FOTO INCISA', back: '← Tutti i generatori', title: 'La tua foto.<br><span>Incisa.</span>',
    intro: "Carica una foto e guarda come viene incisa al laser sul materiale che preferisci. L'anteprima si crea sul tuo dispositivo: la foto non viene inviata a nessuno finché non scegli di chiedere il preventivo.",
    settings: 'La tua incisione', file: '1. La tua foto', fileNote: 'JPG, PNG o WebP · massimo 25 MB · meglio un soggetto ben illuminato.',
    material: '2. Materiale', shape: '3. Forma', size: '4. Misura indicativa',
    sizeNote: 'Lato più lungo. Serve per il preventivo: la misura esatta la decidiamo insieme.',
    bright: 'Luminosità', contrast: 'Contrasto', dither: 'Puntinatura laser',
    ditherNote: "Le foto si incidono a puntini, come una stampa a retino: è l'aspetto più vicino al pezzo vero.",
    toQuote: 'Chiedi il preventivo con questa foto', download: "Scarica l'anteprima",
    notice: 'Anteprima indicativa: il risultato reale dipende dalla foto, dal materiale e dalla lavorazione. Prima di incidere ti confermiamo resa, misura e prezzo.',
    previewTitle: 'Anteprima', empty: "Carica una foto per vedere l'anteprima dell'incisione.",
    ready: 'Pronto. La foto resta sul tuo dispositivo.', foot: 'Anteprima originale INGLY, creata sul tuo dispositivo.',
    forme: { rettangolo: 'Rettangolo', arrotondato: 'Angoli arrotondati', cerchio: 'Cerchio' },
    tooBig: 'Foto troppo grande (massimo 25 MB).', badFile: 'Formato non supportato: carica JPG, PNG o WebP.',
    working: 'Preparo l’anteprima…', done: 'Anteprima pronta. Prova altri materiali o chiedi il preventivo.',
    saved: 'Ti porto al preventivo con foto e anteprima allegate…',
    noSpace: "Il browser non ha spazio per passare la foto al preventivo: scarica l'anteprima e allegala tu nel modulo.",
    dims: (a, b) => `circa ${a} × ${b} cm`,
    desc: (m, f, a, b) => `Prova incisione dal sito: foto su ${m}, forma ${f}, circa ${a} × ${b} cm.`,
  },
  en: {
    kicker: 'TRY YOUR ENGRAVED PHOTO', back: '← All generators', title: 'Your photo.<br><span>Engraved.</span>',
    intro: 'Upload a photo and see how it looks laser-engraved on the material you like. The preview is made on your device: the photo is not sent anywhere until you choose to ask for a quote.',
    settings: 'Your engraving', file: '1. Your photo', fileNote: 'JPG, PNG or WebP · up to 25 MB · a well-lit subject works best.',
    material: '2. Material', shape: '3. Shape', size: '4. Approximate size',
    sizeNote: 'Longest side. It is for the quote: we decide the exact size together.',
    bright: 'Brightness', contrast: 'Contrast', dither: 'Laser dot pattern',
    ditherNote: 'Photos are engraved as dots, like a halftone print: this is the look closest to the real piece.',
    toQuote: 'Ask for a quote with this photo', download: 'Download the preview',
    notice: 'Indicative preview: the real result depends on the photo, the material and the process. Before engraving we confirm the look, size and price.',
    previewTitle: 'Preview', empty: 'Upload a photo to see the engraving preview.',
    ready: 'Ready. Your photo stays on your device.', foot: 'Original INGLY preview, made on your device.',
    forme: { rettangolo: 'Rectangle', arrotondato: 'Rounded corners', cerchio: 'Circle' },
    tooBig: 'Photo too large (25 MB maximum).', badFile: 'Unsupported format: upload JPG, PNG or WebP.',
    working: 'Preparing the preview…', done: 'Preview ready. Try other materials or ask for a quote.',
    saved: 'Taking you to the quote form with photo and preview attached…',
    noSpace: 'Your browser has no room to pass the photo to the quote form: download the preview and attach it yourself.',
    dims: (a, b) => `about ${a} × ${b} cm`,
    desc: (m, f, a, b) => `Engraving preview from the website: photo on ${m}, ${f} shape, about ${a} × ${b} cm.`,
  },
};

let lingua = 'it', foto = null, nomeFoto = 'foto', lum = null, W = 0, H = 0, tela = null, attesa = 0;
const tx = k => translations[lingua][k];
const scelta = name => (document.querySelector(`input[name="${name}"]:checked`) || {}).value;

function testi() {
  document.documentElement.lang = lingua;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = tx(el.dataset.i18n); if (typeof v !== 'string') return;
    if (el.dataset.i18n === 'title') el.innerHTML = v; else el.textContent = v; // titolo: markup statico nostro
  });
  $('langSwitch').textContent = lingua === 'it' ? 'EN' : 'IT';
  $('langSwitch').setAttribute('aria-label', lingua === 'it' ? 'Switch to English' : 'Passa in italiano');
  disegnaScelte();
  if (tela) aggiornaInfo();
}
function stato(msg, errore = false) { const el = $('status'); el.textContent = msg; el.dataset.error = String(errore); }

function disegnaScelte() {
  const m = scelta('mat') || 'legno', f = scelta('forma') || 'rettangolo';
  $('mats').innerHTML = Object.entries(MATERIALI).map(([id, x]) =>
    `<label class="mat"><input type="radio" name="mat" value="${id}"${id === m ? ' checked' : ''}><i style="background:rgb(${x.base.join(',')})"></i>${x[lingua]}</label>`).join('');
  $('shapes').innerHTML = FORME.map(id =>
    `<label><input type="radio" name="forma" value="${id}"${id === f ? ' checked' : ''}>${tx('forme')[id]}</label>`).join('');
}

function caricaFoto(file) {
  if (!file) return;
  if (file.size > MAX_FILE) return stato(tx('tooBig'), true);
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return stato(tx('badFile'), true);
  stato(tx('working'));
  nomeFoto = (file.name || 'foto').replace(/\.[^.]+$/, '').replace(/[^\w-]+/g, '-').slice(0, 40) || 'foto';
  const url = URL.createObjectURL(file), img = new Image();
  img.onload = () => { foto = img; preparaLuminanza(); URL.revokeObjectURL(url); };
  img.onerror = () => { URL.revokeObjectURL(url); stato(tx('badFile'), true); };
  img.src = url;
}

/* ritaglio: il cerchio vuole un quadrato centrato */
function preparaLuminanza() {
  if (!foto) return;
  const forma = scelta('forma') || 'rettangolo';
  let sx = 0, sy = 0, sw = foto.naturalWidth, sh = foto.naturalHeight;
  if (forma === 'cerchio') { const l = Math.min(sw, sh); sx = (sw - l) / 2; sy = (sh - l) / 2; sw = sh = l; }
  const k = Math.min(1, LATO / Math.max(sw, sh));
  W = Math.max(1, Math.round(sw * k)); H = Math.max(1, Math.round(sh * k));
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true });
  g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
  g.drawImage(foto, sx, sy, sw, sh, 0, 0, W, H);
  lum = luminanza(g.getImageData(0, 0, W, H).data, W, H);
  disegna();
}

function disegna() {
  if (!lum) return;
  const px = incidi({ lum, w: W, h: H, materiale: scelta('mat'), forma: scelta('forma'),
    luminosita: +$('bright').value, contrasto: +$('contrast').value, retino: $('dither').checked });
  if (!tela) { tela = document.createElement('canvas'); tela.setAttribute('role', 'img'); $('stage').replaceChildren(tela); }
  tela.width = W; tela.height = H;
  tela.getContext('2d').putImageData(new ImageData(px, W, H), 0, 0);
  aggiornaInfo();
  $('download').disabled = $('toQuote').disabled = false;
  stato(tx('done'));
}
function aggiornaInfo() {
  const d = misure(W, H, +$('size').value), m = MATERIALI[scelta('mat')] || MATERIALI.legno;
  $('dims').textContent = tx('dims')(d.larghezza, d.altezza);
  $('matName').textContent = m[lingua];
  tela.setAttribute('aria-label', `${lingua === 'it' ? 'Anteprima della foto incisa su' : 'Preview of the photo engraved on'} ${m[lingua]}`);
}
function pianifica() { cancelAnimationFrame(attesa); attesa = requestAnimationFrame(disegna); }

/* anteprima con sfondo pieno (le zone fuori dal cerchio diventano bianche) */
function jpeg(canvas, q = 0.86) {
  const c = document.createElement('canvas'); c.width = canvas.width; c.height = canvas.height;
  const g = c.getContext('2d'); g.fillStyle = '#ffffff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(canvas, 0, 0);
  return c.toDataURL('image/jpeg', q);
}
function fotoRidotta(max = 1600) {
  const k = Math.min(1, max / Math.max(foto.naturalWidth, foto.naturalHeight));
  const c = document.createElement('canvas'); c.width = Math.round(foto.naturalWidth * k); c.height = Math.round(foto.naturalHeight * k);
  const g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(foto, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', 0.85);
}

function scarica() {
  if (!tela) return;
  tela.toBlob(b => {
    const a = document.createElement('a'); a.href = URL.createObjectURL(b);
    a.download = `ingly-anteprima-${nomeFoto}-${scelta('mat')}.png`; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }, 'image/png');
}

function alPreventivo() {
  if (!tela || !foto) return;
  const m = MATERIALI[scelta('mat')] || MATERIALI.legno, d = misure(W, H, +$('size').value);
  const forma = translations.it.forme[scelta('forma')] || '';
  const dati = {
    t: Date.now(), materiale: m.preventivo,
    descrizione: translations[lingua].desc(m[lingua], (translations[lingua].forme[scelta('forma')] || forma).toLowerCase(), d.larghezza, d.altezza),
    file: [{ nome: `${nomeFoto}.jpg`, dati: fotoRidotta() }, { nome: `anteprima-${nomeFoto}-${scelta('mat')}.jpg`, dati: jpeg(tela) }],
  };
  try { sessionStorage.setItem(CHIAVE, JSON.stringify(dati)); }
  catch (e) { stato(tx('noSpace'), true); return; }
  stato(tx('saved'));
  location.assign('quote/?da=prova-incisione');
}

function avvia() {
  try { lingua = localStorage.getItem('ingly_lang') === 'en' ? 'en' : 'it'; } catch (_) {}
  testi();
  $('langSwitch').addEventListener('click', () => { lingua = lingua === 'it' ? 'en' : 'it'; try { localStorage.setItem('ingly_lang', lingua); } catch (_) {} testi(); });
  $('modeSwitch').addEventListener('click', () => {
    const r = document.documentElement, v = r.dataset.mode === 'light' ? 'dark' : 'light';
    r.dataset.mode = v; try { localStorage.setItem('ingly_mode', v); } catch (_) {}
  });
  $('photo').addEventListener('change', e => caricaFoto(e.target.files && e.target.files[0]));
  $('mats').addEventListener('change', pianifica);
  $('shapes').addEventListener('change', preparaLuminanza);
  for (const id of ['bright', 'contrast']) $(id).addEventListener('input', () => { $(id + 'Out').textContent = $(id).value; pianifica(); });
  $('dither').addEventListener('change', pianifica);
  $('size').addEventListener('change', () => tela && aggiornaInfo());
  $('download').addEventListener('click', scarica);
  $('toQuote').addEventListener('click', alPreventivo);
}
avvia();
