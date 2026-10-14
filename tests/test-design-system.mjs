/* Il design system: una palette, una fonte, leggibile in entrambe le modalità.

   Prima di questa versione tre fogli di stile e una funzione JavaScript si
   contendevano la palette, e vinceva il verde petrolio. Questi controlli
   impediscono che la situazione si ricrei un pezzo alla volta: un colore
   verde scritto a mano, un foglio caricato dopo tokens.css, un token oro
   usato come testo dove non si legge, un'identità scritta in linea dal JS.

   Il contrasto è calcolato qui, dai valori scritti in tokens.css: se
   qualcuno cambia un colore e una coppia testo/fondo scende sotto 4,5:1,
   il test lo dice prima che lo veda un visitatore. */
import { readFileSync, readdirSync } from 'fs';
import { daConvertire } from '../scripts/neutralizza-colori.mjs';

let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };

const TOK = readFileSync('assets/css/tokens.css', 'utf8');
const IDX = readFileSync('index.html', 'utf8');

console.log('\n=== UNA SOLA FONTE, CARICATA PER ULTIMA ===');
const fogli = [...IDX.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)].map(m => m[1]).filter(u => !/^https?:/.test(u));
check('index.html carica tokens.css', fogli.includes('assets/css/tokens.css'));
check('ed è l\'ultimo foglio di stile', fogli[fogli.length - 1] === 'assets/css/tokens.css', fogli.slice(-2).join(' , '));
const sw = readFileSync('sw.js', 'utf8');
for (const f of ['tokens.css', 'nav-ia.css', 'premium-2026.css']) {
  check(`il service worker tiene ${f} anche offline`, sw.includes(`assets/css/${f}`));
}

console.log('\n=== LA PALETTE DEL BRIEF ===');
const PRIMITIVI = {
  '--c-titanium': '#111318', '--c-graphite': '#272B31', '--c-warm': '#F8F7F4',
  '--c-white': '#FFFFFF', '--c-champagne': '#C5A46D', '--c-muted': '#777B83', '--c-hairline': '#DDDCD8',
};
for (const [k, v] of Object.entries(PRIMITIVI)) {
  check(`${k} = ${v}`, new RegExp(`${k}:${v};`, 'i').test(TOK));
}

console.log('\n=== NIENTE VERDE, NIENTE BLU ===');
/* Le stesse regole dello script che li ha tolti: se uno torna, lo si
   vede qui e non sulla pagina. Restano ammessi WhatsApp e i colori di
   stato, che hanno un significato proprio. */
const AMMESSI = new Set(['#25d366', '#128c7e', '#075e54', '#16a34a', '#2ecc71', '#22c55e', 'rgb(37,211,102)']);
const tinti = [];
for (const f of readdirSync('assets/css').filter(x => x.endsWith('.css'))) {
  const s = readFileSync('assets/css/' + f, 'utf8');
  for (const m of s.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b|rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g)) {
    let r, g, b, k;
    if (m[1]) {
      const h = (m[1].length === 3 ? m[1].split('').map(x => x + x).join('') : m[1]).toLowerCase();
      k = '#' + h; [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
    } else { k = `rgb(${m[2]},${m[3]},${m[4]})`; [r, g, b] = [m[2], m[3], m[4]].map(x => +x / 255) }
    if (AMMESSI.has(k)) continue;
    if (daConvertire(r, g, b)) tinti.push(`${f}: ${m[0]}`);
  }
}
check('nessun colore verde, petrolio o blu scritto a mano nei CSS', tinti.length === 0, tinti.slice(0, 6).join(' · '));

console.log('\n=== IL JAVASCRIPT NON DECIDE L\'IDENTITÀ ===');
const PRD = readFileSync('assets/js/products.js', 'utf8');
const codice = PRD.replace(/\/\*[\s\S]*?\*\//g, '');
check('nessuna palette blu notte scritta nel codice', !/#0D2043|#4778BD/i.test(codice));
check('applyThemeAccent toglie i colori d\'identità in linea', /TOKEN_IDENTITA\.forEach\(k=>root\.style\.removeProperty\(k\)\)/.test(PRD));
check('e non ne scrive più', !/root\.style\.setProperty\(\s*['"]--(?:blue|laser|theme-accent|theme-primary)/.test(codice));
check('una sola palette per l\'artwork generato', (PRD.match(/ART_PALETTE\s*=/g) || []).length === 1);
const cont = JSON.parse(readFileSync('data/content.json', 'utf8'));
const def = cont.THEMES.temi.find(t => t.id === 'default');
check('il tema «default» dell\'Admin usa la palette del brief',
  JSON.stringify(def.palette) === JSON.stringify(['#111318', '#272B31', '#C5A46D']), JSON.stringify(def.palette));

console.log('\n=== CONTRASTO WCAG 2.2 AA, CALCOLATO DAI TOKEN ===');
/* Risolve i token di tokens.css nei due blocchi di modalità, seguendo le
   catene var(--x), e misura le coppie che finiscono davvero sullo schermo. */
const blocco = sel => {
  const i = TOK.indexOf(sel + '{');
  if (i < 0) return {};
  const corpo = TOK.slice(i + sel.length + 1, TOK.indexOf('}', i));
  return Object.fromEntries([...corpo.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map(m => [m[1], m[2].trim()]));
};
const PRIM = blocco(':root');
const NOTTE = { ...PRIM, ...blocco(':root,\n:root[data-mode="dark"]') };
const GIORNO = { ...NOTTE, ...blocco(':root[data-mode="light"]') };
const risolvi = (T, v, n = 0) => {
  const m = String(v).match(/^var\((--[a-z0-9-]+)\)$/);
  return m && n < 10 ? risolvi(T, T[m[1]], n + 1) : v;
};
const lum = hex => {
  const h = hex.replace('#', '');
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
    .reduce((a, c, i) => a + c * [0.2126, 0.7152, 0.0722][i], 0);
};
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) };
const COPPIE = [
  ['--text', '--bg-page'], ['--text', '--bg-surface'], ['--text', '--bg-raised'],
  ['--text-soft', '--bg-page'], ['--text-soft', '--bg-surface'], ['--text-soft', '--bg-raised'],
  ['--accent', '--bg-page'], ['--accent', '--bg-surface'], ['--accent', '--bg-raised'],
  ['--accent-text', '--bg-page'], ['--accent-text', '--bg-surface'],
  ['--on-accent', '--accent'], ['--btn-fg', '--btn-bg'], ['--btn-fg', '--btn-bg-hover'],
];
for (const [nome, T] of [['notte', NOTTE], ['giorno', GIORNO]]) {
  for (const [f, b] of COPPIE) {
    const F = risolvi(T, T[f]), B = risolvi(T, T[b]);
    if (!/^#[0-9a-f]{6}$/i.test(F) || !/^#[0-9a-f]{6}$/i.test(B)) { check(`${nome}: ${f} su ${b} si risolve`, false, `${F} / ${B}`); continue }
    const r = cr(F, B);
    check(`${nome}: ${f} su ${b} — ${r.toFixed(2)}:1`, r >= 4.5, `${F} su ${B}`);
  }
}
/* I tre punti in cui il brief contraddice la sua stessa richiesta di AA:
   il test conferma che il problema esiste, così la correzione resta motivata */
check('il Muted del brief come testo non passerebbe (motivo di --text-soft)', cr('#777B83', '#F8F7F4') < 4.5);
check('lo Champagne come testo di giorno non passerebbe (motivo di --accent)', cr('#C5A46D', '#F8F7F4') < 4.5);

console.log('\n=== OGNI NOME «ORO» È LEGGIBILE COME TESTO ===');
/* questi nomi sono usati sia per testo sia per filetti: il Champagne puro
   come testo di giorno fa 2,2:1. Solo --accent-fill può esserlo. */
const MAPPA = blocco(':root,\n:root[data-mode]');
for (const n of ['--brand-champagne', '--brand-gold', '--ingly-gold', '--premium-gold', '--theme-accent', '--ingly-metal', '--laser']) {
  check(`${n} → oro leggibile`, /^var\(--accent(?:-text)?\)$/.test(MAPPA[n] || ''), MAPPA[n]);
}

console.log('\n=== IMPAGINAZIONE ===');
check('nessuno stile in linea sul menu (top:36px lasciava un buco)', !/id="nav"\s+style=/.test(IDX));
const PAG = readFileSync('assets/css/pages.css', 'utf8');
check('il menu resta in vista scorrendo', /\.nav\{position:sticky;top:0/.test(PAG));
check('body non è un contenitore di scorrimento (romperebbe sticky)', /overflow-x:clip/.test(readFileSync('assets/css/reset.css', 'utf8')));
check('lo sfondo decorativo dell\'hero non allarga la pagina', /\.hero-bg\{overflow:hidden\}/.test(TOK));
check('le card fotografiche hanno un fondo scuro sotto la foto', /\.bcard--photo,\s*\n?\s*:root\[data-mode\] \.scat--photo\{background-color:var\(--c-titanium\)\}/.test(TOK));
check('i link del footer non ricolorano i bottoni', !/footer a\{/.test(PAG) && /footer a:not\(\.btn\)/.test(PAG));

console.log(`\n=========== DESIGN SYSTEM: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
