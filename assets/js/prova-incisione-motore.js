/* PROVA LA TUA FOTO INCISA — motore dell'anteprima.
   Funzioni pure su array di pixel: nessun DOM, nessuna rete. La pagina
   (assets/js/prova-incisione.js) le usa con un <canvas>; i test le usano in Node.

   Come si simula un'incisione fotografica nitida (CO₂, diodo, IR/fibra):
   1. la foto diventa luminanza 0..1, con luminosità e contrasto;
   2. nitidezza (maschera di contrasto): il laser lavora a 0,1 mm, i bordi
      restano netti;
   3. «quanto incidere» dipende dal materiale: legno, pelle e acciaio si
      scuriscono (si incidono le zone scure della foto); vetro e plexiglass
      nero diventano chiari e satinati (si incidono le zone chiare);
   4. il colore della bruciatura cambia con la profondità (dorato → bruno →
      quasi nero sul legno), la venatura resta visibile sotto il segno;
   5. il CO₂ incide più in profondità del diodo: leggero rilievo con luce
      radente; l'IR marca l'acciaio senza scavare;
   6. bordo di taglio bruciato sui materiali organici;
   7. retino fine facoltativo, a passo 1 px e ammorbidito (mai puntini grossi). */

export const LASER = {
  co2: { it: 'CO₂', en: 'CO₂' },
  diodo: { it: 'Diodo', en: 'Diode' },
  ir: { it: 'IR / fibra', en: 'IR / fibre' },
};

/* toni: colore del segno leggero (chiaro) e profondo (scuro), curva, profondità */
export const MATERIALI = {
  legno: { it: 'Legno chiaro', en: 'Light wood', base: [226, 196, 152], texture: 'legno', segno: 'scuro', bordo: true, preventivo: 'Legno',
    toni: { co2: { chiaro: [198, 146, 92], scuro: [44, 24, 12], gamma: 0.9, profondita: 1 },
            diodo: { chiaro: [176, 120, 72], scuro: [34, 20, 12], gamma: 1.05, profondita: 0.35 } } },
  bambu: { it: 'Bambù', en: 'Bamboo', base: [218, 186, 124], texture: 'bambu', segno: 'scuro', bordo: true, preventivo: 'Bamboo',
    toni: { co2: { chiaro: [186, 132, 70], scuro: [58, 32, 14], gamma: 0.9, profondita: 0.9 },
            diodo: { chiaro: [168, 114, 60], scuro: [48, 28, 14], gamma: 1.05, profondita: 0.3 } } },
  mdf: { it: 'MDF', en: 'MDF', base: [186, 148, 106], texture: 'fine', segno: 'scuro', bordo: true, preventivo: 'MDF',
    toni: { co2: { chiaro: [146, 102, 64], scuro: [38, 22, 12], gamma: 0.95, profondita: 0.8 },
            diodo: { chiaro: [132, 90, 56], scuro: [30, 18, 10], gamma: 1.05, profondita: 0.3 } } },
  pelle: { it: 'Pelle', en: 'Leather', base: [160, 104, 62], texture: 'pelle', segno: 'scuro', bordo: true, preventivo: 'Pelle',
    toni: { co2: { chiaro: [122, 72, 40], scuro: [34, 18, 10], gamma: 0.95, profondita: 0.7 },
            diodo: { chiaro: [112, 64, 36], scuro: [28, 15, 8], gamma: 1.05, profondita: 0.25 } } },
  metallo: { it: 'Acciaio inox', en: 'Stainless steel', base: [200, 204, 208], texture: 'spazzolato', segno: 'scuro', bordo: false, preventivo: 'Metallo',
    toni: { ir: { chiaro: [150, 154, 162], scuro: [22, 24, 30], gamma: 1.1, profondita: 0 } } },
  vetro: { it: 'Vetro', en: 'Glass', base: [40, 58, 64], texture: 'vetro', segno: 'chiaro', bordo: false, preventivo: 'Vetro',
    toni: { co2: { chiaro: [128, 146, 150], scuro: [236, 242, 244], gamma: 0.9, profondita: 0.25, satinato: true } } },
  plexiglass: { it: 'Plexiglass nero', en: 'Black acrylic', base: [22, 22, 26], texture: 'liscio', segno: 'chiaro', bordo: false, preventivo: 'Plexiglass',
    toni: { co2: { chiaro: [96, 96, 100], scuro: [226, 226, 228], gamma: 0.9, profondita: 0.4, satinato: true } } },
};
export const FORME = ['rettangolo', 'arrotondato', 'cerchio'];
export const laserDi = materiale => Object.keys((MATERIALI[materiale] || MATERIALI.legno).toni);

/* rumore deterministico (stesso risultato a ogni rendering) */
function hash(x, y) { let h = (x * 374761393 + y * 668265263) | 0; h = (h ^ (h >>> 13)) * 1274126177 | 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967295; }
function rumore(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const s = t => t * t * (3 - 2 * t), u = s(xf), v = s(yf);
  const a = hash(xi, yi), b = hash(xi + 1, yi), c = hash(xi, yi + 1), d = hash(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function fbm(x, y) { return rumore(x, y) * 0.5 + rumore(x * 2.1, y * 2.1) * 0.3 + rumore(x * 4.3, y * 4.3) * 0.2; }

/* fattore di texture del materiale nel punto (x, y): ~1 = colore base */
export function texture(tipo, x, y, w, h) {
  switch (tipo) {
    case 'legno': { const t = y / h * 9 + fbm(x / w * 3, y / h * 14) * 3.2; return 0.92 + 0.08 * Math.sin(t * Math.PI * 2) * (0.6 + 0.4 * rumore(x / 9, y / 2)); }
    case 'bambu': { const t = x / w * 26 + fbm(x / w * 2, y / h * 30) * 0.8; return 0.94 + 0.06 * Math.sin(t * Math.PI) + (Math.abs((y / h * 3) % 1 - 0.5) < 0.005 ? -0.07 : 0); }
    case 'fine': return 0.96 + 0.04 * rumore(x / 1.6, y / 1.6);
    case 'pelle': return 0.92 + 0.08 * fbm(x / 5, y / 5) - 0.03 * rumore(x / 1.3, y / 1.3);
    case 'spazzolato': return 0.93 + 0.05 * rumore(x / 140, y / 0.9) + 0.02 * rumore(x / 3, y / 3);
    case 'vetro': return 0.9 + 0.12 * (1 - Math.hypot(x / w - 0.35, y / h - 0.3));
    default: return 0.97 + 0.05 * (1 - y / h);
  }
}

/* luminanza 0..1 da RGBA */
export function luminanza(rgba, w, h) {
  const out = new Float32Array(w * h);
  for (let i = 0, p = 0; i < out.length; i++, p += 4) {
    const a = rgba[p + 3] / 255;
    out[i] = ((0.2126 * rgba[p] + 0.7152 * rgba[p + 1] + 0.0722 * rgba[p + 2]) / 255) * a + (1 - a);
  }
  return out;
}

/* sfocatura a box separabile (raggio r), due passate ≈ gaussiana */
export function sfoca(src, w, h, r = 1, passate = 2) {
  let a = Float32Array.from(src), b = new Float32Array(src.length);
  const n = 2 * r + 1;
  for (let p = 0; p < passate; p++) {
    for (let y = 0; y < h; y++) {
      let s = 0; const o = y * w;
      for (let x = -r; x <= r; x++) s += a[o + Math.min(w - 1, Math.max(0, x))];
      for (let x = 0; x < w; x++) {
        b[o + x] = s / n;
        s += a[o + Math.min(w - 1, x + r + 1)] - a[o + Math.max(0, x - r)];
      }
    }
    for (let x = 0; x < w; x++) {
      let s = 0;
      for (let y = -r; y <= r; y++) s += b[Math.min(h - 1, Math.max(0, y)) * w + x];
      for (let y = 0; y < h; y++) {
        a[y * w + x] = s / n;
        s += b[Math.min(h - 1, y + r + 1) * w + x] - b[Math.max(0, y - r) * w + x];
      }
    }
  }
  return a;
}

/* distanza (in px) dal bordo della forma; Infinity se fuori */
export function distanzaBordo(forma, x, y, w, h) {
  const px = x + 0.5, py = y + 0.5;
  if (forma === 'cerchio') { const r = Math.min(w, h) / 2, d = r - Math.hypot(px - w / 2, py - h / 2); return d >= 0 ? d : -1; }
  if (forma === 'arrotondato') {
    const r = Math.min(w, h) * 0.12, cx = Math.min(Math.max(px, r), w - r), cy = Math.min(Math.max(py, r), h - r);
    const inAngolo = (cx !== px || cy !== py);
    if (inAngolo) { const d = r - Math.hypot(px - cx, py - cy); return d >= 0 ? d : -1; }
  }
  return Math.min(px, py, w - px, h - py);
}
export const dentro = (forma, x, y, w, h) => distanzaBordo(forma, x, y, w, h) >= 0;

/* Floyd–Steinberg (passo px): usato per il retino fine, a passo 1 */
export function puntina(val, w, h, passo = 1) {
  const gw = Math.ceil(w / passo), gh = Math.ceil(h / passo), g = new Float32Array(gw * gh);
  for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
    let s = 0, n = 0;
    for (let y = gy * passo; y < Math.min(h, gy * passo + passo); y++) for (let x = gx * passo; x < Math.min(w, gx * passo + passo); x++) { s += val[y * w + x]; n++; }
    g[gy * gw + gx] = s / n;
  }
  for (let y = 0; y < gh; y++) for (let x = 0; x < gw; x++) {
    const i = y * gw + x, o = g[i], n = o >= 0.5 ? 1 : 0, e = o - n; g[i] = n;
    if (x + 1 < gw) g[i + 1] += e * 7 / 16;
    if (y + 1 < gh) { if (x > 0) g[i + gw - 1] += e * 3 / 16; g[i + gw] += e * 5 / 16; if (x + 1 < gw) g[i + gw + 1] += e / 16; }
  }
  const out = new Float32Array(w * h);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) out[y * w + x] = g[Math.floor(y / passo) * gw + Math.floor(x / passo)];
  return out;
}

const mix = (a, b, t) => a + (b - a) * t;
const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;

/* Rendering completo → RGBA */
export function incidi({ lum, w, h, materiale = 'legno', laser, luminosita = 0, contrasto = 0, nitidezza = 50, retino = false, forma = 'rettangolo' }) {
  const M = MATERIALI[materiale] || MATERIALI.legno;
  const T = M.toni[laser] || M.toni[Object.keys(M.toni)[0]];
  const b = luminosita / 100, c = 1 + contrasto / 50, n = w * h;

  /* 1-2. tono e nitidezza */
  let v = new Float32Array(n);
  for (let i = 0; i < n; i++) v[i] = clamp01((lum[i] - 0.5) * c + 0.5 + b);
  const k = Math.max(0, nitidezza) / 40;
  if (k > 0) { const s = sfoca(v, w, h, 1, 2); for (let i = 0; i < n; i++) v[i] = clamp01(v[i] + k * (v[i] - s[i])); }

  /* 3. quanto incidere */
  let q = new Float32Array(n);
  for (let i = 0; i < n; i++) q[i] = Math.pow(M.segno === 'chiaro' ? v[i] : 1 - v[i], T.gamma);
  if (retino) q = sfoca(puntina(q, w, h, 1), w, h, 1, 1);

  /* 5. rilievo: gradiente della profondità, luce radente da in alto a sinistra */
  const prof = T.profondita > 0 ? sfoca(q, w, h, 1, 1) : null;

  const out = new Uint8ClampedArray(n * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, p = i * 4;
    const d = distanzaBordo(forma, x, y, w, h);
    if (d < 0) { out[p + 3] = 0; continue; }
    const tex = texture(M.texture, x, y, w, h);
    const a = q[i];
    let luce = 1;
    if (prof) {
      const gx = prof[y * w + Math.min(w - 1, x + 1)] - prof[y * w + Math.max(0, x - 1)];
      const gy = prof[Math.min(h - 1, y + 1) * w + x] - prof[Math.max(0, y - 1) * w + x];
      luce = 1 + (gx + gy) * 0.55 * T.profondita;   // il lato in ombra dello scavo si scurisce
    }
    const satin = T.satinato ? 0.9 + 0.1 * hash(x, y) : 1;
    const copertura = M.segno === 'chiaro' ? a : clamp01(a * 1.6);
    for (let ch = 0; ch < 3; ch++) {
      const base = M.base[ch] * tex;
      const segno = mix(T.chiaro[ch], T.scuro[ch], a) * (M.segno === 'chiaro' ? satin : (0.88 + 0.12 * tex));
      out[p + ch] = mix(base, segno, copertura) * luce;
    }
    /* 6. bordo di taglio bruciato (1,5 px) sui materiali organici */
    if (M.bordo && d < 1.6) { const s = 0.45 + 0.35 * (d / 1.6); out[p] *= s; out[p + 1] *= s; out[p + 2] *= s; }
    out[p + 3] = 255;
  }
  return out;
}

/* dimensioni indicative in cm (lato lungo = misura scelta) */
export function misure(w, h, latoLungoCm) {
  const k = latoLungoCm / Math.max(w, h);
  return { larghezza: Math.round(w * k * 10) / 10, altezza: Math.round(h * k * 10) / 10 };
}
