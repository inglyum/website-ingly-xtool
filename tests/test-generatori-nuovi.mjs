/* Generator Studio: cinque motori nuovi scritti da INGLY (puzzle, sottobicchieri,
   segnalibri, orecchini, rosetta guilloché) e Studio nello stile del sito.
   Richiesta del titolare: i generatori più usati dai maker, «identico stile
   INGLY». Nessun codice o disegno copiato da Cuttle o da altri servizi. */
import { readFileSync } from 'node:fs';
import { JSDOM, VirtualConsole } from 'jsdom';
let ok = 0, ko = 0; const t = (n, c, x = '') => { c ? ok++ : ko++; console.log((c ? '  ✔ ' : '  ✘ ') + n + (c || !x ? '' : ' → ' + x)); };
const src = readFileSync('assets/js/generatori-nuovi.js', 'utf8');
new Function(src).call(globalThis);
const G = globalThis.INGLY_GEN_NUOVI;
const IDS = ['puzzle', 'sottobicchiere', 'segnalibro', 'orecchini', 'rosetta'];

console.log('\n=== MOTORI ===');
t('cinque motori con stato, campi, limiti e disegno', IDS.every(k => G.motori[k] && G.motori[k].stato && typeof G.motori[k].campi === 'function' && typeof G.motori[k].limita === 'function' && typeof G.motori[k].disegna === 'function'));
const finito = o => Number.isFinite(o.w) && Number.isFinite(o.h) && o.w > 0 && o.h > 0 && !/NaN|undefined|Infinity/.test(o.cut + o.engrave);
t('i valori di partenza danno un disegno valido', IDS.every(k => finito(G.motori[k].disegna({ ...G.motori[k].stato }))), IDS.filter(k => !finito(G.motori[k].disegna({ ...G.motori[k].stato }))).join());
const assurdi = { w: -5, h: 'abc', cols: 999, rows: 0, d: 1e9, quanti: 7, forma: '<x>', punta: 'boh', interno: 'zz', coppie: 9, anelli: 50, onde: -1, linee: 'x', foro: 99, tab: 0, seme: NaN, raggio: -3, testo: '<b>"x"</b>' };
t('valori assurdi riportati nei limiti, nessun NaN', IDS.every(k => finito(G.motori[k].disegna({ ...G.motori[k].stato, ...assurdi }))));
t('il testo è sempre messo in sicurezza (niente HTML nel file)', IDS.every(k => !/<b>/.test(JSON.stringify(G.motori[k].disegna({ ...G.motori[k].stato, testo: '<b>x</b>' })))));
const pz = s => G.motori.puzzle.disegna({ ...G.motori.puzzle.stato, ...s });
t('puzzle: stessa variante = stesso taglio, variante diversa = taglio diverso', pz({ seme: 3 }).cut === pz({ seme: 3 }).cut && pz({ seme: 3 }).cut !== pz({ seme: 4 }).cut);
t('puzzle: un tracciato per ogni lato interno più la cornice', pz({ cols: 5, rows: 4 }).count === 1 + 5 * 3 + 4 * 4);
t('puzzle: misura esterna = misura chiesta + 2 mm di margine per lato', pz({ w: 200, h: 150 }).w === 204 && pz({ w: 200, h: 150 }).h === 154);
const sb = G.motori.sottobicchiere.disegna({ ...G.motori.sottobicchiere.stato, quanti: 4, bordo: false, testo: '' });
t('sottobicchieri: quanti ne chiedi, tanti tagli', (sb.cut.match(/<circle/g) || []).length === 4);
const seg = G.motori.segnalibro.disegna({ ...G.motori.segnalibro.stato, quanti: 3 });
t('segnalibri: testo in verticale e foro per la nappina', /rotate\(-90/.test(seg.engrave) && (seg.cut.match(/<circle/g) || []).length === 3);
const or = G.motori.orecchini.disegna({ ...G.motori.orecchini.stato, coppie: 2, interno: 'contorno' });
t('orecchini: si fanno a paia, con foro e traforo', (or.cut.match(/<circle/g) || []).length >= 4 && or.count >= 4 * 3);
const ro = G.motori.rosetta.disegna({ ...G.motori.rosetta.stato, anelli: 2, linee: 6 });
t('rosetta: tutta incisa, anelli × linee', (ro.engrave.match(/<path/g) || []).length === 12 && ro.w === 94);
const roMax = G.motori.rosetta.disegna({ d: 300, anelli: 5, onde: 30, linee: 24, taglio: true, foro: 0 });
t('rosetta: file leggero anche al massimo dei parametri (sotto 200 KB)', (roMax.cut + roMax.engrave).length < 200 * 1024, Math.round((roMax.cut + roMax.engrave).length / 1024) + ' KB');
t('ogni motore ha la voce di catalogo con nome e descrizione in IT/EN', IDS.every(k => { const c = G.catalogo.find(x => x.id === k); return c && c.nome.it && c.nome.en && c.descrizione.it && c.descrizione.en && c.categoria && c.icona; }));
t('nessun riferimento a codice di terzi', !/cuttle\.xyz|makorix|require\(|import\s/.test(src.replace(/\/\*[\s\S]*?\*\//g, '')));

console.log('\n=== STUDIO ===');
const html = readFileSync('generatori.html', 'utf8');
const content = JSON.parse(readFileSync('data/content.json', 'utf8'));
t('i motori sono caricati prima dello Studio', html.indexOf('assets/js/generatori-nuovi.js') > 0 && html.indexOf('assets/js/generatori-nuovi.js') < html.indexOf("const G_TRANSLATIONS"));
t('catalogo pubblicato: i cinque generatori sono attivi', IDS.every(k => content.GENERATORI.some(g => g.id === k && g.modulo === k && g.attivo !== false)));
const adm = readFileSync('assets/js/generatori-catalog.js', 'utf8');
t('l\'Admin conosce i motori nuovi', IDS.every(k => new RegExp(`id: '${k}'`).test(adm)));

const vc = new VirtualConsole(); const errori = []; vc.on('jsdomError', e => errori.push(String(e)));
const dom = new JSDOM(html, { url: 'https://inglyum.github.io/website-ingly-xtool/generatori.html', runScripts: 'outside-only', virtualConsole: vc });
const w = dom.window; w.fetch = async () => ({ ok: true, json: async () => content });
w.eval(src);
for (const s of [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(x => x[1])) w.eval(s);
await new Promise(r => setTimeout(r, 60));
const d = w.document;
t('tema scuro di serie, come il sito', d.documentElement.dataset.generatorMode === 'dark');
const voci = [...d.querySelectorAll('#toolList [data-tool]')].map(b => b.dataset.tool);
t('i nuovi generatori compaiono nella libreria', IDS.every(k => voci.includes(k)), voci.join());
let tuttiOk = true;
for (const k of IDS) {
  d.querySelector(`[data-tool="${k}"]`).click();
  const svg = d.querySelector('#canvas svg');
  if (!svg || !d.querySelector('#fields input,#fields select') || !/^\d/.test(d.getElementById('statW').textContent)) { tuttiOk = false; console.log('     ', k); }
}
t('ogni generatore mostra controlli, anteprima e misure', tuttiOk);
d.querySelector('[data-tool="puzzle"]').click();
const cols = d.getElementById('f_cols'); cols.value = '6'; cols.dispatchEvent(new w.Event('input'));
t('cambiare un campo aggiorna subito l\'anteprima', d.getElementById('statPaths').textContent === String(1 + 6 * 3 + 5 * 4));
d.querySelector('[data-tool="rosetta"]').click();
const on = d.getElementById('f_onde'); on.value = '20'; on.dispatchEvent(new w.Event('input'));
t('i cursori mostrano il valore scelto', d.getElementById('out_onde').textContent === '20');
d.getElementById('reset').click();
t('«Ripristina» torna ai valori di partenza del motore nuovo', d.getElementById('f_onde').value === '14');
t('nessun errore nella pagina', errori.length === 0, errori.join(' | '));
w.close();

console.log('\n=== STILE INGLY ===');
const css = readFileSync('assets/css/generatori-ingly.css', 'utf8');
t('foglio di stile INGLY caricato dopo il tema precedente', html.indexOf('generatori-ingly.css') > html.indexOf('ingly-generator-theme.css'));
t('carattere Assistant del sito, niente Google Fonts', /src:url\('\.\.\/fonts\/assistant\//.test(css) && !/fonts\.googleapis/.test(html));
t('stessi colori del sito: notte calda + oro, chiaro avorio', /--rs-bg:#13100d/.test(css) && /--rs-bg:#f7f2ea/.test(css) && /--rs-gold:#d6ae6c/.test(css));
t('angoli vivi e nessun titolo sfumato', /--radius:0px/.test(css) && /\.hero h1 span\{background:none!important/.test(css) && /\.hero \.eyebrow\{display:none/.test(css));
t('anteprima sul piano laser a nido d\'ape, colorato con mask', /\.canvas::before\{[^}]*mask:url\('\.\.\/patterns\/nido-ape\.svg'\)/.test(css));
t('il tema si sceglie prima del disegno (niente lampo bianco)', /<script>\(function\(\)\{var m='dark';try\{var v=localStorage\.getItem\('ingly_mode'\)/.test(html));

console.log(`\n=========== GENERATORI NUOVI: ${ok} passati, ${ko} falliti ===========`);
process.exit(ko ? 1 : 0);
