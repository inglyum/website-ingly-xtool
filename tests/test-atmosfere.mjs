/* Atmosfere stagionali della modalità scura (richiesta del titolare, 2026-11-26):
   ogni atmosfera ha i suoi colori in restyle-2026.css con contrasti leggibili,
   il calendario sceglie quella giusta, l'Admin la gestisce. */
import { readFileSync } from 'node:fs';
import { ATMOSFERE, BASE, CALENDARIO_BASE, atmosferaDi } from '../assets/js/atmosfere.js';

let ok = 0, ko = 0;
const t = (n, c, x = '') => { c ? ok++ : ko++; console.log((c ? '  ✔ ' : '  ✖ ') + n + (c || !x ? '' : ' → ' + x)); };
const css = readFileSync('assets/css/restyle-2026.css', 'utf8');

const lum = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
const contrasto = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const blocco = id => {
  const sel = id === BASE ? /:root\[data-mode="dark"\]\{([^}]*--au-acc2[^}]*)\}/ : new RegExp(':root\\[data-mode="dark"\\]\\[data-atmosfera="' + id + '"\\]\\{([^}]*)\\}');
  const m = css.match(sel); return m ? m[1] : '';
};
const val = (b, k) => { const m = b.match(new RegExp('--' + k + ':(#[0-9a-f]{6})')); return m ? m[1] : null; };

console.log('\n=== COLORI E CONTRASTI ===');
for (const a of ATMOSFERE) {
  const b = blocco(a.id);
  const [bg, bg2, ink, muted, acc, acc2, on] = ['rs-bg', 'rs-bg-2', 'rs-ink', 'rs-muted', 'rs-gold', 'au-acc2', 'rs-on-gold'].map(k => val(b, k));
  const tutti = [bg, bg2, ink, muted, acc, acc2, on].every(Boolean);
  t(a.id + ': colori definiti nel CSS', tutti);
  if (!tutti) continue;
  const r = { testo: contrasto(ink, bg), grigio: contrasto(muted, bg), grigio2: contrasto(muted, bg2), accento: contrasto(acc, bg), pulsante: contrasto(on, acc), pulsante2: contrasto(on, acc2) };
  t(a.id + ': tutti i contrasti ≥ 4,5:1', Object.values(r).every(x => x >= 4.5), JSON.stringify(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, +v.toFixed(1)]))));
  t(a.id + ': luci dello sfondo definite', /--au-g1:\d+,\d+,\d+/.test(b) && /--au-g2:\d+,\d+,\d+/.test(b));
}

console.log('\n=== CALENDARIO ===');
const d = s => new Date('2026-' + s + 'T12:00:00');
t('senza configurazione vale il calendario consigliato', atmosferaDi({}, d('12-15')) === 'natale');
t('Natale a cavallo d\'anno (3 gennaio)', atmosferaDi({}, new Date('2027-01-03T12:00:00')) === 'natale');
t('fuori dai periodi vale Aurora (26 novembre)', atmosferaDi({}, d('11-26')) === BASE);
t('estate a luglio', atmosferaDi({}, d('07-10')) === 'estate');
t('modo fisso', atmosferaDi({ atmosfera: { modo: 'fissa', fissa: 'autunno' } }, d('07-10')) === 'autunno');
t('id sconosciuto → Aurora, mai un errore', atmosferaDi({ atmosfera: { modo: 'fissa', fissa: 'boh' } }) === BASE);
t('date sbagliate ignorate', atmosferaDi({ atmosfera: { modo: 'auto', calendario: [{ id: 'natale', dal: '13-40', al: 'x' }] } }, d('12-15')) === BASE);
t('calendario consigliato con atmosfere esistenti', CALENDARIO_BASE.every(v => ATMOSFERE.some(a => a.id === v.id)));
const cfg = JSON.parse(readFileSync('data/config.json', 'utf8'));
t('config.json: atmosfera valida', cfg.atmosfera && ['auto', 'fissa'].includes(cfg.atmosfera.modo) && Array.isArray(cfg.atmosfera.calendario));

console.log('\n=== SITO E ADMIN ===');
const idx = readFileSync('index.html', 'utf8');
t('atmosfera applicata subito nella testa della pagina (niente lampo)', /ingly_atmo/.test(idx.slice(0, 3000)));
t('motore dei temi applica l\'atmosfera', /applicaAtmosfera\(CONFIG, root\)/.test(readFileSync('assets/js/products.js', 'utf8')));
const adm = readFileSync('admin.html', 'utf8');
t('Admin: riquadro «Atmosfera del sito» nei Temi', /id="atmoCard"/.test(adm) && /async function renderAtmosfera/.test(adm) && /renderAtmosfera\(\);bindAll\(\)/.test(adm));
t('Admin: anteprima con ?atmosfera=', /\?atmosfera=/.test(adm));
const blocchi = css.slice(css.indexOf('AURORA MEDITERRANEA + ATMOSFERE'));
t('regola 1: nessuna animazione sulle immagini prodotto/galleria/categoria', !/img\.(pimgph|gimg|bimg)[^{]*\{[^}]*animation/.test(blocchi));
t('movimento fermo con «riduci movimento»', /prefers-reduced-motion:reduce\)\{[^]*body::after\{animation:none/.test(blocchi));
t('luce che segue il puntatore: un solo ascoltatore, solo puntatore fine', /pointermove/.test(readFileSync('assets/js/main.js', 'utf8')) && /pointer:fine/.test(readFileSync('assets/js/main.js', 'utf8')));

console.log(`\n=========== ATMOSFERE: ${ok} passati, ${ko} falliti ===========`);
if (ko) process.exit(1);
