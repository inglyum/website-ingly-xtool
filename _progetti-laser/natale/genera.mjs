#!/usr/bin/env node
/* INGLY DESIGN — file laser di Natale (modelli originali).
 *
 * Crea SVG in millimetri pronti per xTool Creative Space / LightBurn:
 *   rosso  #FF0000, linea 0,1 mm  → TAGLIO
 *   nero   #000000, pieno         → INCISIONE (riempimento)
 *   blu    #0000FF, linea 0,2 mm  → LINEE incise (score)
 * Le scritte sono già convertite in tracciati e unite (niente buchi dove le
 * lettere corsive si toccano), quindi non serve avere i font installati.
 *
 * Uso:
 *   node genera.mjs pallina --nome "Giulia" [--anno 2026] [--out pallina-giulia.svg]
 *   node genera.mjs primo-natale --nome "Leonardo"
 *   node genera.mjs famiglia --cognome "Rossi" --nomi "Marco,Giulia,Leo,Sofia"
 *   node genera.mjs gatto --nome "Luna"
 *   node genera.mjs osso --nome "Rocky"
 *   node genera.mjs albero-3d [--spessore 3]
 *   node genera.mjs segnaposto --nome "Nonna Rosa"
 *   node genera.mjs segnaposto-12 --nomi "Giulia,Marco,..."
 *   node genera.mjs esempi            → rigenera la cartella esempi/
 *
 * Font (licenza SIL Open Font License): Great Vibes, Playfair Display, Montserrat.
 */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const opentype = require('opentype.js');
const ClipperLib = require('clipper-lib');
const QUI = path.dirname(fileURLToPath(import.meta.url));

/* ---------- font ---------- */
const carica = rel => {
  const b = fs.readFileSync(path.join(QUI, 'node_modules/@fontsource', rel));
  return opentype.parse(b.buffer.slice(b.byteOffset, b.byteOffset + b.length));
};
const FONT = {
  corsivo: carica('great-vibes/files/great-vibes-latin-400-normal.woff'),
  serif: carica('playfair-display/files/playfair-display-latin-400-normal.woff'),
  sans: carica('montserrat/files/montserrat-latin-600-normal.woff'),
};

/* ---------- geometria del testo ---------- */
const SC = 1000; // Clipper lavora con interi: 1 mm = 1000 unità
const f2 = n => (Math.round(n * 100) / 100).toString();

function comandiInPoligoni(cmds) {
  const polys = []; let cur = []; let x = 0, y = 0, sx = 0, sy = 0;
  const punto = (px, py) => cur.push([px, py]);
  for (const c of cmds) {
    if (c.type === 'M') { if (cur.length > 2) polys.push(cur); cur = []; x = sx = c.x; y = sy = c.y; punto(x, y); }
    else if (c.type === 'L') { x = c.x; y = c.y; punto(x, y); }
    else if (c.type === 'Q') {
      for (let i = 1; i <= 10; i++) { const t = i / 10, u = 1 - t;
        punto(u*u*x + 2*u*t*c.x1 + t*t*c.x, u*u*y + 2*u*t*c.y1 + t*t*c.y); }
      x = c.x; y = c.y;
    } else if (c.type === 'C') {
      for (let i = 1; i <= 14; i++) { const t = i / 14, u = 1 - t;
        punto(u*u*u*x + 3*u*u*t*c.x1 + 3*u*t*t*c.x2 + t*t*t*c.x, u*u*u*y + 3*u*u*t*c.y1 + 3*u*t*t*c.y2 + t*t*t*c.y); }
      x = c.x; y = c.y;
    } else if (c.type === 'Z') { if (cur.length > 2) polys.push(cur); cur = []; x = sx; y = sy; }
  }
  if (cur.length > 2) polys.push(cur);
  return polys;
}

/* Testo a dimensione 10, poi scalato e messo al centro del riquadro richiesto. */
function testo(str, { font = 'corsivo', cx, cy, maxW, maxH, spaziatura = 0 }) {
  const F = FONT[font]; const base = 10; let cmds = [];
  if (spaziatura) {
    let xx = 0;
    for (const ch of str) { cmds = cmds.concat(F.getPath(ch, xx, 0, base).commands); xx += F.getAdvanceWidth(ch, base) + spaziatura * base; }
  } else cmds = F.getPath(str, 0, 0, base).commands;
  const polys = comandiInPoligoni(cmds);
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of polys) for (const [px, py] of p) { x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); }
  const s = Math.min(maxW / (x1 - x0), maxH / (y1 - y0));
  const mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  const scal = polys.map(p => p.map(([px, py]) => ({ X: Math.round((cx + (px - mx) * s) * SC), Y: Math.round((cy + (py - my) * s) * SC) })));
  return unisci(scal);
}

function unisci(paths) {
  const c = new ClipperLib.Clipper(); const sol = new ClipperLib.Paths();
  c.AddPaths(paths, ClipperLib.PolyType.ptSubject, true);
  c.Execute(ClipperLib.ClipType.ctUnion, sol, ClipperLib.PolyFillType.pftNonZero, ClipperLib.PolyFillType.pftNonZero);
  const pulite = ClipperLib.Clipper.CleanPolygons(sol, 0.015 * SC);
  return pulite.filter(p => p.length > 2)
    .map(p => 'M' + p.map(q => f2(q.X / SC) + ' ' + f2(q.Y / SC)).join('L') + 'Z').join('');
}

/* ---------- forme ---------- */
const P = (cx, cy, r, gradi) => [cx + r * Math.cos(gradi * Math.PI / 180), cy + r * Math.sin(gradi * Math.PI / 180)];
const pt = ([x, y]) => f2(x) + ' ' + f2(y);
const cerchio = (cx, cy, r) => `M${f2(cx - r)} ${f2(cy)}A${r} ${r} 0 1 0 ${f2(cx + r)} ${f2(cy)}A${r} ${r} 0 1 0 ${f2(cx - r)} ${f2(cy)}Z`;
const poligono = punti => 'M' + punti.map(pt).join('L') + 'Z';

function stella(cx, cy, R, r = R * 0.45, n = 5) {
  const p = []; for (let i = 0; i < n * 2; i++) p.push(P(cx, cy, i % 2 ? r : R, -90 + i * 180 / n));
  return poligono(p);
}
function fiocco(cx, cy, r) {
  let d = '';
  for (let k = 0; k < 6; k++) {
    const a = -90 + k * 60;
    d += `M${pt([cx, cy])}L${pt(P(cx, cy, r, a))}`;
    for (const [t, l] of [[0.45, 0.32], [0.72, 0.22]]) {
      const b = P(cx, cy, r * t, a);
      d += `M${pt(P(b[0], b[1], r * l, a - 42))}L${pt(b)}L${pt(P(b[0], b[1], r * l, a + 42))}`;
    }
  }
  return d;
}
function zampa(cx, cy, s) {
  const ell = (x, y, rx, ry, rot = 0) => {
    const p = []; for (let i = 0; i < 36; i++) { const t = i * 10 * Math.PI / 180;
      const ex = rx * Math.cos(t), ey = ry * Math.sin(t), c = Math.cos(rot), si = Math.sin(rot);
      p.push([x + ex * c - ey * si, y + ex * si + ey * c]); }
    return poligono(p);
  };
  return ell(cx, cy + s * 0.35, s * 0.55, s * 0.45) +
    ell(cx - s * 0.62, cy - s * 0.18, s * 0.2, s * 0.27, -0.35) + ell(cx - s * 0.22, cy - s * 0.52, s * 0.2, s * 0.28, -0.1) +
    ell(cx + s * 0.22, cy - s * 0.52, s * 0.2, s * 0.28, 0.1) + ell(cx + s * 0.62, cy - s * 0.18, s * 0.2, s * 0.27, 0.35);
}
function alberello(cx, top, h) {
  const w = h * 0.75; let d = '';
  for (const [a, b, k] of [[0, 0.42, 0.55], [0.25, 0.7, 0.8], [0.5, 0.92, 1]])
    d += poligono([[cx, top + h * a], [cx + w / 2 * k, top + h * b], [cx - w / 2 * k, top + h * b]]);
  return d + poligono([[cx - h * 0.07, top + h * 0.9], [cx + h * 0.07, top + h * 0.9], [cx + h * 0.07, top + h], [cx - h * 0.07, top + h]]);
}
function cuore(cx, cy, s) {
  const p = []; for (let i = 0; i < 60; i++) { const t = i / 60 * 2 * Math.PI;
    p.push([cx + s * 16 * Math.sin(t) ** 3 / 17, cy - s * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 17]); }
  return poligono(p);
}
/* Pallina: cerchio + gancio con foro. */
function pallina(cx, cy, r, capW = 16, capTop = cy - r - 10) {
  const xi = capW / 2, yi = cy - Math.sqrt(r * r - xi * xi);
  return `M${f2(cx + xi)} ${f2(yi)}A${r} ${r} 0 1 1 ${f2(cx - xi)} ${f2(yi)}` +
    `L${f2(cx - xi)} ${f2(capTop + 2)}Q${f2(cx - xi)} ${f2(capTop)} ${f2(cx - xi + 2)} ${f2(capTop)}` +
    `L${f2(cx + xi - 2)} ${f2(capTop)}Q${f2(cx + xi)} ${f2(capTop)} ${f2(cx + xi)} ${f2(capTop + 2)}Z`;
}
function rettangoloTondo(x, y, w, h, r) {
  return `M${f2(x + r)} ${f2(y)}L${f2(x + w - r)} ${f2(y)}Q${f2(x + w)} ${f2(y)} ${f2(x + w)} ${f2(y + r)}L${f2(x + w)} ${f2(y + h - r)}` +
    `Q${f2(x + w)} ${f2(y + h)} ${f2(x + w - r)} ${f2(y + h)}L${f2(x + r)} ${f2(y + h)}Q${f2(x)} ${f2(y + h)} ${f2(x)} ${f2(y + h - r)}` +
    `L${f2(x)} ${f2(y + r)}Q${f2(x)} ${f2(y)} ${f2(x + r)} ${f2(y)}Z`;
}

/* ---------- modelli ---------- */
const FORO = 2.5; // raggio del foro per il nastro (Ø 5 mm)

const MODELLI = {
  pallina({ nome = 'Giulia', anno = '2026' }) {
    const cx = 41, cy = 53, r = 38;
    return { w: 82, h: 93, titolo: `Pallina con nome — ${nome}`,
      taglio: [{ d: cerchio(cx, cy - r - 4.5, FORO), foro: true }, { d: pallina(cx, cy, r, 16, cy - r - 11) }],
      incisione: [
        testo(nome, { cx, cy: cy + 2, maxW: 58, maxH: 19 }),
        testo(`NATALE ${anno}`, { font: 'sans', cx, cy: cy + 17, maxW: 30, maxH: 3.2, spaziatura: 0.18 }),
        stella(cx, cy + 26, 2.2),
      ],
      linee: [cerchio(cx, cy, r - 3.5), fiocco(cx, cy - 20, 6), fiocco(cx - 14, cy - 17, 3.4), fiocco(cx + 14, cy - 17, 3.4)],
    };
  },

  'primo-natale'({ nome = 'Leonardo', anno = '2026' }) {
    const cx = 41, cy = 53, r = 38;
    return { w: 82, h: 93, titolo: `Il mio primo Natale — ${nome}`,
      taglio: [{ d: cerchio(cx, cy - r - 4.5, FORO), foro: true }, { d: pallina(cx, cy, r, 16, cy - r - 11) }],
      incisione: [
        stella(cx, cy - 26, 3.2),
        testo('IL MIO PRIMO', { font: 'sans', cx, cy: cy - 17, maxW: 34, maxH: 3.2, spaziatura: 0.2 }),
        testo('Natale', { font: 'serif', cx, cy: cy - 7, maxW: 44, maxH: 11 }),
        testo(nome, { cx, cy: cy + 9, maxW: 56, maxH: 15 }),
        testo(anno, { font: 'sans', cx, cy: cy + 22, maxW: 14, maxH: 3.4, spaziatura: 0.2 }),
      ],
      linee: [cerchio(cx, cy, r - 3.5), fiocco(cx - 16, cy - 25, 3.2), fiocco(cx + 16, cy - 25, 3.2)],
    };
  },

  famiglia({ cognome = 'Rossi', nomi = 'Marco,Giulia,Leo,Sofia', anno = '2026' }) {
    const lista = String(nomi).split(',').map(s => s.trim()).filter(Boolean).slice(0, 6);
    const righe = lista.length <= 3 ? [lista] : [lista.slice(0, Math.ceil(lista.length / 2)), lista.slice(Math.ceil(lista.length / 2))];
    const k = 0.8095; // pendenza del tetto
    const d = `M42 4L60 ${f2(4 + 18 * k)}L60 10L68 10L68 ${f2(4 + 26 * k)}L84 38L76 38L76 88Q76 92 72 92L12 92Q8 92 8 88L8 38L0 38Z`;
    const inc = [
      testo('Famiglia', { cx: 42, cy: 30, maxW: 40, maxH: 10 }),
      testo(cognome.toUpperCase(), { font: 'serif', cx: 42, cy: 47, maxW: 56, maxH: 8.5 }),
      cuore(42, 56, 2.6),
    ];
    righe.forEach((r, i) => inc.push(testo(r.join(' · '), { font: 'sans', cx: 42, cy: 65 + i * 7, maxW: 58, maxH: 3.3 })));
    inc.push(testo(`NATALE ${anno}`, { font: 'sans', cx: 42, cy: righe.length > 1 ? 84 : 78, maxW: 26, maxH: 2.8, spaziatura: 0.18 }));
    return { w: 84, h: 94, titolo: `Casa della famiglia ${cognome}`,
      taglio: [{ d: cerchio(42, 17, FORO), foro: true }, { d }],
      incisione: inc,
      linee: [`M24 56L36 56M48 56L60 56`, `M12 41L12 88L72 88L72 41`],
    };
  },

  gatto({ nome = 'Luna', anno = '2026' }) {
    const cx = 40, cy = 52, r = 34, R = 50;
    const d = `M${pt(P(cx, cy, r, 328))}A${r} ${r} 0 1 1 ${pt(P(cx, cy, r, 212))}L${pt(P(cx, cy, R, 226))}L${pt(P(cx, cy, r, 248))}` +
      `A${r} ${r} 0 0 1 ${pt(P(cx, cy, r, 292))}L${pt(P(cx, cy, R, 314))}L${pt(P(cx, cy, r, 328))}Z`;
    const orecchio = (a, b, t) => {
      const v = [P(cx, cy, r, a), P(cx, cy, R, t), P(cx, cy, r, b)];
      const g = [(v[0][0] + v[1][0] + v[2][0]) / 3, (v[0][1] + v[1][1] + v[2][1]) / 3];
      return poligono(v.map(([x, y]) => [g[0] + (x - g[0]) * 0.5, g[1] + (y - g[1]) * 0.5]));
    };
    return { w: 80, h: 88, titolo: `Gattino con nome — ${nome}`,
      taglio: [{ d: cerchio(cx, cy - r + 8, FORO), foro: true }, { d }],
      incisione: [
        zampa(cx, cy - 13, 4),
        testo(nome, { cx, cy: cy + 4, maxW: 50, maxH: 16 }),
        testo(`NATALE ${anno}`, { font: 'sans', cx, cy: cy + 18, maxW: 28, maxH: 3, spaziatura: 0.18 }),
      ],
      linee: [orecchio(212, 248, 226), orecchio(292, 328, 314), cerchio(cx, cy, r - 3.5)],
    };
  },

  osso({ nome = 'Rocky', anno = '2026' }) {
    const ox = 52, oy = 27; const X = x => f2(ox + x), Y = y => f2(oy + y);
    const d = `M${X(-20.13)} ${Y(-12)}L${X(20.13)} ${Y(-12)}A15 15 0 1 1 ${X(46.18)} ${Y(0)}A15 15 0 1 1 ${X(20.13)} ${Y(12)}` +
      `L${X(-20.13)} ${Y(12)}A15 15 0 1 1 ${X(-46.18)} ${Y(0)}A15 15 0 1 1 ${X(-20.13)} ${Y(-12)}Z`;
    return { w: 104, h: 54, titolo: `Osso per il cane — ${nome}`,
      taglio: [{ d: cerchio(ox - 38, oy, FORO), foro: true }, { d }],
      incisione: [
        testo(nome, { cx: ox, cy: oy - 1.5, maxW: 54, maxH: 14 }),
        testo(`NATALE ${anno}`, { font: 'sans', cx: ox, cy: oy + 9.2, maxW: 22, maxH: 2.4, spaziatura: 0.18 }),
        zampa(ox + 36, oy, 3.4),
      ],
      linee: [],
    };
  },

  'albero-3d'({ spessore = 3 }) {
    const t = Number(spessore) || 3, h = t / 2;
    // sagoma a metà (lato destro), dall'alto verso il basso
    const dx = [[14, 22], [8, 22], [24, 46], [16, 46], [33, 71], [24, 71], [40, 96], [6, 96], [6, 108]];
    const sagoma = (ox, tipo) => {
      const destra = dx.map(([x, y]) => [ox + x, y + 2]);
      const sinistra = dx.slice().reverse().map(([x, y]) => [ox - x, y + 2]);
      let punti;
      if (tipo === 'A') // fessura dal basso, nel tronco
        punti = [[ox, 2], ...destra, [ox + h, 110], [ox + h, 57], [ox - h, 57], [ox - h, 110], ...sinistra];
      else { const yt = 2 + 22 * h / 14; // fessura dall'alto
        punti = [[ox + h, yt], ...destra, ...sinistra, [ox - h, yt], [ox - h, 57], [ox + h, 57]]; }
      return poligono(punti);
    };
    const palline = ox => [[-6, 34], [8, 40], [-14, 60], [12, 64], [-22, 86], [20, 88], [-9, 80], [9, 76]]
      .map(([x, y]) => cerchio(ox + x, y, 1.3)).join('');
    return { w: 172, h: 112, titolo: `Albero di Natale 3D a incastro — spessore ${t} mm`,
      taglio: [{ d: sagoma(43, 'A') }, { d: sagoma(129, 'B') }],
      incisione: [palline(43), palline(129)],
      linee: [],
      nota: `Fessure larghe ${t} mm: misura il tuo compensato e rigenera con --spessore se serve.`,
    };
  },

  segnaposto({ nome = 'Nonna Rosa' }) {
    return { w: 74, h: 36, titolo: `Segnaposto / chiudipacco — ${nome}`,
      taglio: [{ d: cerchio(9, 18, 2.2), foro: true }, { d: rettangoloTondo(2, 2, 70, 32, 5) }],
      incisione: [alberello(19.5, 9, 18), testo(nome, { cx: 47.5, cy: 18, maxW: 40, maxH: 13 })],
      linee: [],
    };
  },

  'segnaposto-12'({ nomi = 'Giulia,Marco,Sofia,Leonardo,Aurora,Francesco,Ginevra,Alessandro,Beatrice,Tommaso,Nonna Rosa,Zio Pino' }) {
    const lista = String(nomi).split(',').map(s => s.trim()).filter(Boolean).slice(0, 12);
    const taglio = [], incisione = [];
    lista.forEach((n, i) => {
      const x = 4 + (i % 3) * 74, y = 4 + Math.floor(i / 3) * 36;
      taglio.push({ d: cerchio(x + 7, y + 16, 2.2), foro: true }, { d: rettangoloTondo(x, y, 70, 32, 5) });
      incisione.push(alberello(x + 17.5, y + 7, 18), testo(n, { cx: x + 45.5, cy: y + 16, maxW: 40, maxH: 13 }));
    });
    return { w: 226, h: 4 + Math.ceil(lista.length / 3) * 36, titolo: `Segnaposto ×${lista.length}`, taglio, incisione, linee: [] };
  },
};

/* ---------- SVG ---------- */
function svg(m) {
  const g = (id, cont) => cont ? `<g id="${id}" inkscape:label="${id}" inkscape:groupmode="layer">${cont}</g>\n` : '';
  const inc = m.incisione.filter(Boolean).map(d => `<path class="incisione" fill="#000000" fill-rule="evenodd" stroke="none" d="${d}"/>`).join('');
  const lin = m.linee.filter(Boolean).map(d => `<path class="linea" fill="none" stroke="#0000FF" stroke-width="0.2" stroke-linecap="round" stroke-linejoin="round" d="${d}"/>`).join('');
  const tag = m.taglio.map(t => `<path class="taglio${t.foro ? ' foro' : ' sagoma'}" fill="none" stroke="#FF0000" stroke-width="0.1" d="${t.d}"/>`).join('');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" width="${m.w}mm" height="${m.h}mm" viewBox="0 0 ${m.w} ${m.h}">
<title>${m.titolo} — INGLY DESIGN</title>
<desc>Rosso = taglio, nero = incisione piena, blu = linea incisa. Ordine: incisione, linee, poi taglio (prima i fori, poi la sagoma).${m.nota ? ' ' + m.nota : ''}</desc>
${g('1-INCISIONE', inc)}${g('2-LINEE', lin)}${g('3-TAGLIO', tag)}</svg>
`;
}

/* ---------- riga di comando ---------- */
const args = process.argv.slice(2);
const cmd = args[0];
const opz = {};
for (let i = 1; i < args.length; i += 2) opz[args[i].replace(/^--/, '')] = args[i + 1];

if (cmd === 'esempi') {
  const dir = path.join(QUI, 'esempi'); fs.mkdirSync(dir, { recursive: true });
  const es = [
    ['pallina', { nome: 'Giulia' }, 'pallina-con-nome'],
    ['primo-natale', { nome: 'Leonardo' }, 'primo-natale'],
    ['famiglia', { cognome: 'Rossi', nomi: 'Marco,Giulia,Leo,Sofia' }, 'casa-famiglia'],
    ['gatto', { nome: 'Luna' }, 'gattino-con-nome'],
    ['osso', { nome: 'Rocky' }, 'osso-cane-con-nome'],
    ['albero-3d', { spessore: 3 }, 'albero-3d-incastro-3mm'],
    ['segnaposto', { nome: 'Nonna Rosa' }, 'segnaposto'],
    ['segnaposto-12', {}, 'segnaposto-x12'],
  ];
  for (const [mod, o, file] of es) fs.writeFileSync(path.join(dir, file + '.svg'), svg(MODELLI[mod](o)));
  console.log('esempi creati in', dir);
} else if (MODELLI[cmd]) {
  const out = opz.out || `${cmd}${opz.nome ? '-' + opz.nome.toLowerCase().replace(/[^a-z0-9]+/g, '-') : ''}.svg`;
  fs.writeFileSync(out, svg(MODELLI[cmd](opz)));
  console.log('creato', out);
} else {
  console.log('Modelli: ' + Object.keys(MODELLI).join(', ') + ', esempi');
  process.exit(cmd ? 1 : 0);
}

export { MODELLI, svg };
