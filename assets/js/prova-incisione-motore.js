/* PROVA LA TUA FOTO INCISA — motore dell'anteprima.
   Funzioni pure su array di pixel: nessun DOM, nessuna rete. La pagina
   (assets/js/prova-incisione.js) le usa con un <canvas>; i test le usano in Node.

   Come si simula l'incisione:
   1. la foto diventa luminanza 0..1, con luminosità e contrasto;
   2. «quanto incidere» dipende dal materiale: sui materiali chiari il laser
      scurisce (si incidono le zone scure della foto), su vetro e plexiglass
      nero il segno è chiaro (si incidono le zone chiare);
   3. puntinatura (Floyd–Steinberg) come nei lavori fotografici reali;
   4. il segno si fonde con una texture procedurale del materiale;
   5. fuori dalla forma (cerchio, angoli arrotondati) il pixel è trasparente. */

export const MATERIALI = {
  legno:      { it: 'Legno chiaro', en: 'Light wood', base: [224, 192, 148], segnoRGB: [70, 40, 20], segno: 'scuro', texture: 'legno', forza: 0.92, preventivo: 'Legno' },
  bambu:      { it: 'Bambù', en: 'Bamboo', base: [216, 184, 122], segnoRGB: [86, 54, 24], segno: 'scuro', texture: 'bambu', forza: 0.9, preventivo: 'Bamboo' },
  mdf:        { it: 'MDF', en: 'MDF', base: [184, 146, 104], segnoRGB: [58, 34, 18], segno: 'scuro', texture: 'fine', forza: 0.9, preventivo: 'MDF' },
  pelle:      { it: 'Pelle', en: 'Leather', base: [156, 100, 60], segnoRGB: [52, 28, 14], segno: 'scuro', texture: 'pelle', forza: 0.85, preventivo: 'Pelle' },
  metallo:    { it: 'Acciaio inox', en: 'Stainless steel', base: [198, 202, 206], segnoRGB: [30, 32, 36], segno: 'scuro', texture: 'spazzolato', forza: 0.95, preventivo: 'Metallo' },
  vetro:      { it: 'Vetro', en: 'Glass', base: [46, 64, 70], segnoRGB: [232, 240, 242], segno: 'chiaro', texture: 'vetro', forza: 0.85, preventivo: 'Vetro' },
  plexiglass: { it: 'Plexiglass nero', en: 'Black acrylic', base: [22, 22, 26], segnoRGB: [232, 232, 232], segno: 'chiaro', texture: 'liscio', forza: 0.9, preventivo: 'Plexiglass' },
};
export const FORME = ['rettangolo', 'arrotondato', 'cerchio'];

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
    case 'legno': { const t = y / h * 9 + fbm(x / w * 3, y / h * 14) * 3.2; return 0.9 + 0.1 * Math.sin(t * Math.PI * 2) * (0.6 + 0.4 * rumore(x / 9, y / 2)); }
    case 'bambu': { const t = x / w * 26 + fbm(x / w * 2, y / h * 30) * 0.8; return 0.93 + 0.07 * Math.sin(t * Math.PI) + (Math.abs((y / h * 3) % 1 - 0.5) < 0.006 ? -0.08 : 0); }
    case 'fine': return 0.95 + 0.05 * rumore(x / 1.6, y / 1.6);
    case 'pelle': return 0.9 + 0.1 * fbm(x / 5, y / 5) - 0.04 * rumore(x / 1.3, y / 1.3);
    case 'spazzolato': return 0.92 + 0.06 * rumore(x / 140, y / 0.9) + 0.03 * rumore(x / 3, y / 3);
    case 'vetro': return 0.9 + 0.12 * (1 - Math.hypot(x / w - 0.35, y / h - 0.3));
    default: return 0.96 + 0.06 * (1 - y / h);
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

/* dentro la forma? (coordinate pixel) */
export function dentro(forma, x, y, w, h) {
  if (forma === 'cerchio') { const r = Math.min(w, h) / 2; return Math.hypot(x + 0.5 - w / 2, y + 0.5 - h / 2) <= r; }
  if (forma === 'arrotondato') {
    const r = Math.min(w, h) * 0.12, cx = Math.min(Math.max(x + 0.5, r), w - r), cy = Math.min(Math.max(y + 0.5, r), h - r);
    return Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r;
  }
  return true;
}

/* Floyd–Steinberg su una griglia ridotta (passo px): puntini come il laser */
export function puntina(val, w, h, passo = 2) {
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

/* Rendering completo → RGBA */
export function incidi({ lum, w, h, materiale = 'legno', luminosita = 0, contrasto = 0, retino = true, forma = 'rettangolo' }) {
  const M = MATERIALI[materiale] || MATERIALI.legno;
  const b = luminosita / 100, c = 1 + contrasto / 50;
  const quanto = new Float32Array(w * h);
  for (let i = 0; i < quanto.length; i++) {
    const v = Math.min(1, Math.max(0, (lum[i] - 0.5) * c + 0.5 + b));
    quanto[i] = M.segno === 'chiaro' ? v : 1 - v;
  }
  const segno = retino ? puntina(quanto, w, h, Math.max(1, Math.round(Math.min(w, h) / 320))) : quanto;
  const out = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x, p = i * 4;
    if (!dentro(forma, x, y, w, h)) { out[p + 3] = 0; continue; }
    const t = texture(M.texture, x, y, w, h);
    const a = Math.min(1, segno[i] * M.forza * (retino ? 0.92 : 1));
    for (let k = 0; k < 3; k++) {
      const base = M.base[k] * t;
      out[p + k] = base * (1 - a) + M.segnoRGB[k] * (0.9 + 0.1 * t) * a;
    }
    out[p + 3] = 255;
  }
  return out;
}

/* dimensioni indicative in cm (lato lungo = misura scelta) */
export function misure(w, h, latoLungoCm) {
  const k = latoLungoCm / Math.max(w, h);
  return { larghezza: Math.round(w * k * 10) / 10, altezza: Math.round(h * k * 10) / 10 };
}
