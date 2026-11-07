#!/usr/bin/env node
/* Genera i pattern incisi del restyle in assets/patterns/*.svg.
   Sono maschere (tratto bianco su trasparente): il colore lo danno i token
   CSS con mask-image, così vanno bene sia col tema scuro sia col chiaro.
   - nido-ape.svg : il piano a nido d'ape delle macchine laser (sotto la targa 3D)
   - guilloche.svg: rosetta a linee intrecciate, come le incisioni di pregio
   - venature.svg : linee del legno che girano attorno ai nodi
   Uso: node scripts/genera-pattern.mjs  (deterministico: stesso output ogni volta) */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const RADICE = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(RADICE, 'assets', 'patterns');
mkdirSync(OUT, { recursive: true });

const f = n => (Math.round(n * 10) / 10).toString();
const percorso = pts => 'M' + pts.map(p => f(p[0]) + ' ' + f(p[1])).join('L');
const svg = (w, h, corpo) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" fill="none" stroke="#fff">${corpo}</svg>\n`;

/* 1. nido d'ape: una cella che si ripete (<pattern>), pochi byte per qualsiasi misura */
function nidoApe() {
  const r = 14, w = Math.sqrt(3) * r, h = 3 * r, W = 840, H = 560;
  const esa = (cx, cy) => {
    const v = [];
    for (let k = 0; k < 6; k++) { const a = Math.PI / 180 * (60 * k - 90); v.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); }
    return 'M' + v.map(p => f(p[0]) + ' ' + f(p[1])).join('L') + 'Z';
  };
  const d = [[0, 0], [w, 0], [w / 2, 1.5 * r], [0, h], [w, h]].map(c => esa(c[0], c[1])).join('');
  return svg(W, H, `<defs><pattern id="n" width="${f(w)}" height="${h}" patternUnits="userSpaceOnUse"><path stroke-width="1.1" d="${d}"/></pattern></defs><rect width="${W}" height="${H}" fill="url(#n)" stroke="none"/>`);
}

/* 2. guilloché: anelli di linee ondulate sfasate, come nelle incisioni delle banconote */
function guilloche() {
  const S = 1000, c = S / 2, out = [];
  const anello = (R0, amp, onde, linee, mod) => {
    for (let i = 0; i < linee; i++) {
      const fase = i / linee * Math.PI * 2, pts = [], N = onde * 8;
      for (let k = 0; k <= N; k++) {
        const t = k / N * Math.PI * 2;
        const r = R0 + amp * Math.sin(onde * t + fase) + mod * Math.sin(3 * t);
        pts.push([c + r * Math.cos(t), c + r * Math.sin(t)]);
      }
      out.push(`<path stroke-width="0.8" d="${percorso(pts)}Z"/>`);
    }
  };
  anello(410, 34, 18, 14, 0);
  anello(300, 26, 12, 12, 0);
  anello(190, 20, 8, 10, 0);
  for (const r of [452, 360, 248, 130]) out.push(`<circle cx="${c}" cy="${c}" r="${r}" stroke-width="0.8"/>`);
  return svg(S, S, out.join(''));
}

/* 3. venature: linee quasi parallele deviate da due nodi del legno */
function venature() {
  const W = 1400, H = 520, nodi = [[380, 250, 70], [1010, 300, 55]], out = [];
  for (let i = -4; i < 44; i++) {
    const base = i * 13, pts = [];
    for (let x = -20; x <= W + 20; x += 22) {
      let y = base + Math.sin(x * 0.006 + i * 0.37) * 9 + Math.sin(x * 0.0023 + i * 0.11) * 16;
      for (const [nx, ny, nr] of nodi) {
        const dx = x - nx, dy = y - ny, d = Math.hypot(dx, dy);
        const spinta = nr * 1.9 * Math.exp(-(d * d) / (2 * nr * nr * 2.2));
        y += (dy >= 0 ? 1 : -1) * spinta;
      }
      pts.push([x, y]);
    }
    out.push(`<path stroke-width="1" d="${percorso(pts)}"/>`);
  }
  for (const [nx, ny, nr] of nodi) {
    for (let k = 1; k <= 4; k++) out.push(`<ellipse cx="${nx}" cy="${ny}" rx="${f(nr * 0.22 * k)}" ry="${f(nr * 0.13 * k)}" stroke-width="1"/>`);
  }
  return svg(W, H, out.join(''));
}

const file = { 'nido-ape.svg': nidoApe(), 'guilloche.svg': guilloche(), 'venature.svg': venature() };
for (const [nome, dati] of Object.entries(file)) {
  writeFileSync(join(OUT, nome), dati);
  console.log(nome.padEnd(14), (dati.length / 1024).toFixed(1) + ' KB');
}
