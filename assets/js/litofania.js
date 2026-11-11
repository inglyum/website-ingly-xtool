/* ============ LITOFANIA — DALLA FOTO AL FILE STL ============
   Una litofania è un pannello stampato in 3D che, illuminato da dietro,
   mostra la foto: dove il pezzo è sottile passa più luce (chiaro), dove è
   spesso ne passa meno (scuro). Qui la foto diventa una griglia di spessori
   e poi un solido chiuso, pronto per qualsiasi programma di stampa 3D.

   Motore originale INGLY, scritto da zero. Puro: nessun DOM, nessuna rete.
   La foto resta sul dispositivo di chi la carica.

   Coordinate del file (mm): X larghezza, Y spessore (il retro piatto sta a
   Y = 0), Z altezza. Il pannello si stampa in piedi, come si fa di solito
   con le litofanie: così il dettaglio sta sugli strati, non sul piatto. */

export const PREDEFINITI = Object.freeze({
  larghezza: 100,     /* mm, cornice compresa */
  forma: 'piano',     /* 'piano' | 'curva' */
  curva: 120,         /* gradi di arco, solo per la forma curva */
  minimo: 0.8,        /* mm: spessore nei punti più chiari */
  massimo: 3.0,       /* mm: spessore nei punti più scuri */
  cornice: 3,         /* mm di bordo pieno tutto intorno (0 = senza) */
  risoluzione: 0.3,   /* mm fra un punto e l'altro della griglia */
  contrasto: 0,       /* -0,5 … 0,5 */
  luminosita: 0,      /* -0,3 … 0,3 */
});

export const LIMITI = Object.freeze({
  larghezza: [50, 200], curva: [60, 180], minimo: [0.6, 1.6], massimo: [2, 5],
  cornice: [0, 8], risoluzione: [0.2, 0.6], contrasto: [-0.5, 0.5], luminosita: [-0.3, 0.3],
});

export const FORME = Object.freeze({
  piano: { it: 'Pannello piano', en: 'Flat panel' },
  curva: { it: 'Pannello curvo', en: 'Curved panel' },
});

/* oltre questo il file pesa troppo per essere comodo (≈ 30 MB): la griglia si allarga da sola */
export const MAX_TRIANGOLI = 600000;
/* densità del PLA, g/cm³: serve solo per la stima del peso */
export const DENSITA_PLA = 1.24;

const limita = (v, [a, b]) => Math.min(b, Math.max(a, v));
const numero = (v, d) => { const n = Number(v); return Number.isFinite(n) ? n : d; };
const r2 = v => Math.round(v * 100) / 100;

/** Parametri ripuliti: niente valori fuori scala, il massimo sempre sopra il minimo. */
export function normalizza(o = {}) {
  const p = {};
  for (const k of Object.keys(LIMITI)) p[k] = limita(numero(o[k], PREDEFINITI[k]), LIMITI[k]);
  p.forma = Object.prototype.hasOwnProperty.call(FORME, o.forma) ? o.forma : PREDEFINITI.forma;
  if (p.massimo < p.minimo + 0.8) p.massimo = Math.min(LIMITI.massimo[1], p.minimo + 0.8);
  p.cornice = Math.min(p.cornice, p.larghezza / 4);
  return p;
}

/** Luminanza 0…1 da pixel RGBA. I pixel trasparenti contano come bianco (pezzo sottile). */
export function luminanze(rgba, w, h) {
  const L = new Float32Array(w * h);
  for (let i = 0; i < w * h; i++) {
    const a = rgba[i * 4 + 3] / 255;
    const l = (0.2126 * rgba[i * 4] + 0.7152 * rgba[i * 4 + 1] + 0.0722 * rgba[i * 4 + 2]) / 255;
    L[i] = l * a + (1 - a);
  }
  return L;
}

/** Misure del pezzo: la larghezza la sceglie chi stampa, l'altezza segue la foto. */
export function misure(iw, ih, o) {
  const p = normalizza(o);
  const fotoW = p.larghezza - 2 * p.cornice;
  const fotoH = fotoW * ih / iw;
  return { W: p.larghezza, H: r2(fotoH + 2 * p.cornice), fotoW, fotoH };
}

function campiona(L, iw, ih, u, v) {
  const x0 = Math.floor(u), y0 = Math.floor(v);
  const x1 = Math.min(iw - 1, x0 + 1), y1 = Math.min(ih - 1, y0 + 1);
  const fx = u - x0, fy = v - y0;
  const a = L[y0 * iw + x0], b = L[y0 * iw + x1], c = L[y1 * iw + x0], d = L[y1 * iw + x1];
  return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy;
}

/**
 * Griglia degli spessori. Riga 0 = bordo alto della foto.
 * Restituisce { t, nx, ny, W, H, passo, p } con t lungo (nx+1)·(ny+1).
 */
export function spessori(L, iw, ih, o) {
  const p = normalizza(o);
  const m = misure(iw, ih, p);
  let passo = p.risoluzione;
  let nx, ny;
  for (;;) {
    nx = Math.max(2, Math.round(m.W / passo)); ny = Math.max(2, Math.round(m.H / passo));
    if (stimaTriangoli(nx, ny) <= MAX_TRIANGOLI) break;
    passo *= 1.08;
  }
  const t = new Float32Array((nx + 1) * (ny + 1));
  const k = p.cornice;
  for (let j = 0; j <= ny; j++) {
    const y = j / ny * m.H;
    for (let i = 0; i <= nx; i++) {
      const x = i / nx * m.W;
      let s;
      if (k > 0 && (x < k - 1e-6 || x > m.W - k + 1e-6 || y < k - 1e-6 || y > m.H - k + 1e-6)) s = p.massimo;
      else {
        const u = limita((x - k) / m.fotoW, [0, 1]) * (iw - 1);
        const v = limita((y - k) / m.fotoH, [0, 1]) * (ih - 1);
        let l = campiona(L, iw, ih, u, v);
        l = limita((l - 0.5) * (1 + p.contrasto) + 0.5 + p.luminosita, [0, 1]);
        s = p.minimo + (1 - l) * (p.massimo - p.minimo);
      }
      t[j * (nx + 1) + i] = s;
    }
  }
  return { t, nx, ny, W: m.W, H: m.H, passo: r2(passo), p };
}

/** Triangoli totali: faccia con la foto + retro a strisce + quattro fianchi. */
export const stimaTriangoli = (nx, ny) => 2 * nx * ny + 2 * nx + 2 * ny + 4 * (nx + ny);

/**
 * Il solido: vertici (Float32Array xyz) e triangoli (Uint32Array, 3 indici).
 * Chiuso e orientato: ogni spigolo è condiviso da due triangoli in versi
 * opposti, le normali guardano fuori. Le verifiche sono nei test.
 */
export function solido(g) {
  const { t, nx, ny, W, H, p } = g;
  const cols = nx + 1, N = cols * (ny + 1);
  const pos = new Float32Array(N * 2 * 3);
  const curva = p.forma === 'curva';
  const A = (p.curva || 120) * Math.PI / 180, R = W / A;
  const metti = (idx, i, j, d) => {
    const u = i / nx * W, z = H - j / ny * H;
    let x, y;
    if (curva) { const th = (u / W - 0.5) * A, r = R + d; x = r * Math.sin(th) + W / 2; y = r * Math.cos(th) - R * Math.cos(A / 2); }
    else { x = u; y = d; }
    pos[idx * 3] = x; pos[idx * 3 + 1] = y; pos[idx * 3 + 2] = z;
  };
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
    const q = j * cols + i;
    metti(q, i, j, t[q]);       /* faccia con la foto */
    metti(N + q, i, j, 0);      /* retro */
  }
  const T = (i, j) => j * cols + i, B = (i, j) => N + j * cols + i;
  const tri = new Uint32Array(stimaTriangoli(nx, ny) * 3);
  let n = 0;
  const f = (a, b, c) => { tri[n++] = a; tri[n++] = b; tri[n++] = c; };
  /* faccia con la foto: normale verso +Y */
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const a = T(i, j), b = T(i + 1, j), c = T(i + 1, j + 1), d = T(i, j + 1);
    f(a, b, c); f(a, c, d);
  }
  /* retro: una striscia per colonna (resta piatto o segue la curva), normale verso −Y.
     Le colonne ai lati raccolgono anche i punti dei fianchi, così non restano buchi. */
  for (let i = 0; i < nx; i++) {
    if (i === 0) {
      const giro = [B(1, 0), B(1, ny), B(0, ny)];
      for (let j = ny - 1; j >= 0; j--) giro.push(B(0, j));
      for (let s = 1; s < giro.length - 1; s++) f(giro[0], giro[s + 1], giro[s]);
    } else if (i === nx - 1) {
      const a = B(nx - 1, 0);
      for (let j = 0; j < ny; j++) f(a, B(nx, j + 1), B(nx, j));
      f(a, B(nx - 1, ny), B(nx, ny));
    } else {
      const a = B(i, 0), b = B(i + 1, 0), c = B(i + 1, ny), d = B(i, ny);
      f(a, c, b); f(a, d, c);
    }
  }
  /* fianchi */
  for (let i = 0; i < nx; i++) {
    f(B(i, 0), B(i + 1, 0), T(i + 1, 0)); f(B(i, 0), T(i + 1, 0), T(i, 0));             /* alto */
    f(B(i, ny), T(i + 1, ny), B(i + 1, ny)); f(B(i, ny), T(i, ny), T(i + 1, ny));       /* basso */
  }
  for (let j = 0; j < ny; j++) {
    f(B(0, j), T(0, j + 1), B(0, j + 1)); f(B(0, j), T(0, j), T(0, j + 1));             /* sinistra */
    f(B(nx, j), B(nx, j + 1), T(nx, j + 1)); f(B(nx, j), T(nx, j + 1), T(nx, j));       /* destra */
  }
  return { pos, tri: n === tri.length ? tri : tri.slice(0, n) };
}

/** Volume in mm³ (somma dei tetraedri: positivo se le normali guardano fuori). */
export function volume({ pos, tri }) {
  let v = 0;
  for (let k = 0; k < tri.length; k += 3) {
    const a = tri[k] * 3, b = tri[k + 1] * 3, c = tri[k + 2] * 3;
    v += pos[a] * (pos[b + 1] * pos[c + 2] - pos[b + 2] * pos[c + 1])
       - pos[a + 1] * (pos[b] * pos[c + 2] - pos[b + 2] * pos[c])
       + pos[a + 2] * (pos[b] * pos[c + 1] - pos[b + 1] * pos[c]);
  }
  return v / 6;
}

/** STL binario: 80 byte di intestazione, numero di triangoli, poi 50 byte per triangolo. */
export function stl({ pos, tri }, nome = 'INGLY DESIGN litofania') {
  const nt = tri.length / 3;
  const buf = new ArrayBuffer(84 + nt * 50), dv = new DataView(buf);
  const intest = String(nome).replace(/[^\x20-\x7e]/g, ' ').slice(0, 79);
  for (let i = 0; i < intest.length; i++) dv.setUint8(i, intest.charCodeAt(i));
  dv.setUint32(80, nt, true);
  let o = 84;
  for (let k = 0; k < tri.length; k += 3) {
    const a = tri[k] * 3, b = tri[k + 1] * 3, c = tri[k + 2] * 3;
    const ux = pos[b] - pos[a], uy = pos[b + 1] - pos[a + 1], uz = pos[b + 2] - pos[a + 2];
    const vx = pos[c] - pos[a], vy = pos[c + 1] - pos[a + 1], vz = pos[c + 2] - pos[a + 2];
    let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
    const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l;
    for (const val of [nx, ny, nz, pos[a], pos[a + 1], pos[a + 2], pos[b], pos[b + 1], pos[b + 2], pos[c], pos[c + 1], pos[c + 2]]) { dv.setFloat32(o, val, true); o += 4; }
    dv.setUint16(o, 0, true); o += 2;
  }
  return buf;
}

/** Peso indicativo in grammi, pezzo pieno (infill 100%: le litofanie si stampano così). */
export const grammi = vol => Math.round(vol / 1000 * DENSITA_PLA);

/**
 * Anteprima in controluce: quanta luce passa da ogni punto.
 * RGBA (nx+1)×(ny+1). La luce calda di una lampadina dietro il pannello.
 */
export function controluce(g, k = 1.1) {
  const { t, nx, ny, p } = g, cols = nx + 1, out = new Uint8ClampedArray(cols * (ny + 1) * 4);
  const hi = Math.exp(-k * p.minimo), lo = Math.exp(-k * p.massimo);
  for (let q = 0; q < t.length; q++) {
    const b = (Math.exp(-k * t[q]) - lo) / (hi - lo);
    const e = 0.06 + 0.94 * b;
    out[q * 4] = 255 * e; out[q * 4 + 1] = 222 * e; out[q * 4 + 2] = 170 * e; out[q * 4 + 3] = 255;
  }
  return out;
}

/** Anteprima a luce spenta: il rilievo del pezzo bianco, illuminato di lato. */
export function rilievo(g) {
  const { t, nx, ny, W, H } = g, cols = nx + 1, out = new Uint8ClampedArray(cols * (ny + 1) * 4);
  const dx = W / nx, dy = H / ny;
  const lx = -0.55, ly = -0.55, lz = 0.63;
  for (let j = 0; j <= ny; j++) for (let i = 0; i <= nx; i++) {
    const q = j * cols + i;
    const gx = (t[j * cols + Math.min(nx, i + 1)] - t[j * cols + Math.max(0, i - 1)]) / (2 * dx);
    const gy = (t[Math.min(ny, j + 1) * cols + i] - t[Math.max(0, j - 1) * cols + i]) / (2 * dy);
    const l = Math.hypot(gx, gy, 1);
    const s = 0.42 + 0.58 * Math.max(0, (-gx * lx - gy * ly + lz) / l);
    out[q * 4] = 238 * s; out[q * 4 + 1] = 231 * s; out[q * 4 + 2] = 218 * s; out[q * 4 + 3] = 255;
  }
  return out;
}

/** Avvisi prima di stampare. Livello: 'attenzione' o 'info'. */
export function controlli(g) {
  const { p, W, H } = g, out = [];
  if (p.minimo < 0.8) out.push({ codice: 'sottile', livello: 'attenzione', it: 'Sotto 0,8 mm i punti più chiari sono fragili e possono bucarsi.', en: 'Below 0.8 mm the brightest areas are fragile and may break through.' });
  if (p.massimo - p.minimo < 1.6) out.push({ codice: 'piatto', livello: 'info', it: 'Poca differenza fra minimo e massimo: la foto in controluce risulterà spenta.', en: 'Little difference between minimum and maximum: the backlit photo will look flat.' });
  if (p.cornice === 0) out.push({ codice: 'cornice', livello: 'info', it: 'Senza cornice i bordi sono sottili: per una lampada conviene almeno 2 mm.', en: 'Without a frame the edges are thin: for a lamp use at least 2 mm.' });
  if (Math.max(W, H) > 180) out.push({ codice: 'grande', livello: 'info', it: 'Pezzo grande: verifica che entri in piedi nel volume della tua stampante.', en: 'Large part: check it fits upright in your printer’s build volume.' });
  return out;
}
