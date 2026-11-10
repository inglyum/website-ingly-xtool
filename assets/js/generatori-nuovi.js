/* ============================================================
   INGLY Generator Studio — cinque motori nuovi, scritti da zero.
   Sono le famiglie di strumenti più usate dai maker (puzzle, sottobicchieri,
   segnalibri, orecchini) più una che è solo nostra: la rosetta guilloché,
   lo stesso disegno inciso che firma il sito.
   Nessun codice né disegno copiato da servizi terzi (Cuttle e simili):
   geometrie e parametri sono originali INGLY.

   Ogni motore espone:
     stato      i valori di partenza
     campi(s,h) l'HTML dei controlli (h.field, h.selectField del Studio)
     limita(s,c) riporta i valori nei limiti sicuri (c = clamp)
     disegna(s,h) → { w, h, cut, engrave, count } in millimetri
   Funzioni pure: verificate in tests/test-generatori-nuovi.mjs.
   ============================================================ */
(function (root) {
  'use strict';
  const f = n => (Math.round(n * 1000) / 1000).toString();
  const clampN = (v, a, b, d) => { v = Number(v); return Number.isFinite(v) ? Math.max(a, Math.min(b, v)) : d; };

  /* generatore pseudo-casuale con seme: lo stesso seme dà sempre lo stesso puzzle */
  function rng(seed) {
    let t = (Number(seed) || 1) >>> 0;
    return () => { t += 0x6D2B79F5; let r = Math.imul(t ^ t >>> 15, 1 | t); r ^= r + Math.imul(r ^ r >>> 7, 61 | r); return ((r ^ r >>> 14) >>> 0) / 4294967296; };
  }

  /* lato di un pezzo: da A a B, con l'incastro che sporge da una parte o dall'altra.
     Il profilo (collo stretto, testa tonda) è disegnato in coordinate del lato:
     a = lungo il lato (0..1), b = verso la normale (in unità di «sporgenza»). */
  function latoPuzzle(ax, ay, bx, by, verso, sporg, sposta, collo) {
    const L = Math.hypot(bx - ax, by - ay) || 1;
    const ux = (bx - ax) / L, uy = (by - ay) / L, nx = -uy * verso, ny = ux * verso;
    const c = 0.5 + sposta, k = collo;
    const P = (a, b) => f(ax + ux * a * L + nx * b * sporg * L) + ' ' + f(ay + uy * a * L + ny * b * sporg * L);
    return 'M ' + P(0, 0) + ' L ' + P(c - 0.14, 0) +
      ' C ' + P(c - 0.10, 0) + ', ' + P(c - 0.06 + k, 0.32) + ', ' + P(c - 0.10, 0.55) +
      ' C ' + P(c - 0.16, 0.92) + ', ' + P(c - 0.08, 1.12) + ', ' + P(c, 1.12) +
      ' C ' + P(c + 0.08, 1.12) + ', ' + P(c + 0.16, 0.92) + ', ' + P(c + 0.10, 0.55) +
      ' C ' + P(c + 0.06 - k, 0.32) + ', ' + P(c + 0.10, 0) + ', ' + P(c + 0.14, 0) +
      ' L ' + P(1, 0);
  }

  const forma = {
    cerchio: (cx, cy, r) => `<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(r)}"/>`,
    poligono: (cx, cy, r, n, rot) => {
      const p = [];
      for (let i = 0; i < n; i++) { const a = rot + i * 2 * Math.PI / n; p.push(f(cx + r * Math.cos(a)) + ',' + f(cy + r * Math.sin(a))); }
      return `<polygon points="${p.join(' ')}"/>`;
    },
    rettangolo: (x, y, w, h, r) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${f(r)}"/>`
  };

  const M = {};

  /* ---------- 1. PUZZLE ---------- */
  M.puzzle = {
    stato: { w: 200, h: 150, cols: 5, rows: 4, tab: 22, seme: 7, raggio: 4, testo: '' },
    campi: (s, h) =>
      '<div class="field"><label>Dimensioni (mm)</label><div class="pair"><input id="f_w" aria-label="Larghezza" type="number" min="60" max="600" value="' + s.w + '"><input id="f_h" aria-label="Altezza" type="number" min="60" max="400" value="' + s.h + '"></div></div>' +
      '<div class="field"><label>Pezzi (colonne × righe)</label><div class="pair"><input id="f_cols" aria-label="Colonne" type="number" min="2" max="20" value="' + s.cols + '"><input id="f_rows" aria-label="Righe" type="number" min="2" max="20" value="' + s.rows + '"></div></div>' +
      h.field('tab', 'Grandezza incastri · %', 'range', s.tab, 'min="14" max="30" step="1"') +
      h.field('seme', 'Variante del taglio', 'number', s.seme, 'min="1" max="9999" step="1"') +
      h.field('raggio', 'Raggio angoli esterni · mm', 'number', s.raggio, 'min="0" max="20" step=".5"') +
      h.field('testo', 'Testo inciso sul retro (facoltativo)', 'text', s.testo, 'maxlength="40"') +
      '<div class="notice">Ogni «variante» cambia la forma degli incastri: tienila uguale per rifare lo stesso puzzle. Prova prima un pezzo: il kerf decide quanto stringono gli incastri.</div>',
    limita: (s) => {
      s.w = clampN(s.w, 60, 600, 200); s.h = clampN(s.h, 60, 400, 150);
      s.cols = Math.round(clampN(s.cols, 2, 20, 5)); s.rows = Math.round(clampN(s.rows, 2, 20, 4));
      s.tab = clampN(s.tab, 14, 30, 22); s.seme = Math.round(clampN(s.seme, 1, 9999, 7)); s.raggio = clampN(s.raggio, 0, 20, 4);
    },
    disegna: (s) => {
      M.puzzle.limita(s);
      const m = 2, W = s.w, H = s.h, cw = W / s.cols, rh = H / s.rows, sp = s.tab / 100, r = rng(s.seme);
      let cut = forma.rettangolo(m, m, W, H, Math.min(s.raggio, cw / 3, rh / 3)), n = 1;
      for (let j = 1; j < s.rows; j++) for (let i = 0; i < s.cols; i++) {
        const y = m + j * rh, verso = r() < 0.5 ? 1 : -1;
        cut += '<path d="' + latoPuzzle(m + i * cw, y, m + (i + 1) * cw, y, verso, sp * Math.min(1, rh / cw), (r() - 0.5) * 0.08, (r() - 0.5) * 0.04) + '"/>'; n++;
      }
      for (let i = 1; i < s.cols; i++) for (let j = 0; j < s.rows; j++) {
        const x = m + i * cw, verso = r() < 0.5 ? 1 : -1;
        cut += '<path d="' + latoPuzzle(x, m + j * rh, x, m + (j + 1) * rh, verso, sp * Math.min(1, cw / rh), (r() - 0.5) * 0.08, (r() - 0.5) * 0.04) + '"/>'; n++;
      }
      const t = String(s.testo || '').trim();
      const engrave = t ? `<text x="${f(m + W / 2)}" y="${f(m + H / 2)}" fill="#68d5ff" stroke="none" font-family="Arial,sans-serif" font-size="${f(Math.min(H / 6, W / Math.max(6, t.length) * 1.5))}" text-anchor="middle" dominant-baseline="middle">${esc(t)}</text>` : '';
      return { w: W + 2 * m, h: H + 2 * m, cut, engrave, count: n + (t ? 1 : 0) };
    }
  };

  /* ---------- 2. SOTTOBICCHIERI ---------- */
  M.sottobicchiere = {
    stato: { forma: 'cerchio', d: 95, raggio: 8, testo: 'Casa Rossi', bordo: true, quanti: 4 },
    campi: (s, h) =>
      h.selectField('forma', 'Forma', s.forma, [['cerchio', 'Cerchio'], ['quadrato', 'Quadrato arrotondato'], ['esagono', 'Esagono'], ['ottagono', 'Ottagono']]) +
      h.field('d', 'Misura · mm', 'number', s.d, 'min="60" max="140"') +
      h.field('raggio', 'Raggio angoli · mm', 'number', s.raggio, 'min="0" max="30" step=".5"') +
      h.field('testo', 'Testo da incidere', 'text', s.testo, 'maxlength="24"') +
      '<label class="checkrow"><input id="f_bordo" type="checkbox" ' + (s.bordo ? 'checked' : '') + '> Cornice incisa a 5 mm dal bordo</label>' +
      h.selectField('quanti', 'Quanti nel foglio', String(s.quanti), [['1', '1'], ['2', '2'], ['4', '4'], ['6', '6']]),
    limita: (s) => {
      if (!['cerchio', 'quadrato', 'esagono', 'ottagono'].includes(s.forma)) s.forma = 'cerchio';
      s.d = clampN(s.d, 60, 140, 95); s.raggio = clampN(s.raggio, 0, 30, 8); s.quanti = [1, 2, 4, 6].includes(Number(s.quanti)) ? Number(s.quanti) : 4;
    },
    disegna: (s) => {
      M.sottobicchiere.limita(s);
      const d = s.d, gap = 4, m = 2, n = s.quanti, cols = n <= 2 ? n : (n === 4 ? 2 : 3), rows = Math.ceil(n / cols);
      let cut = '', engrave = '', c = 0;
      const sagoma = (cx, cy, r) => s.forma === 'cerchio' ? forma.cerchio(cx, cy, r)
        : s.forma === 'quadrato' ? forma.rettangolo(cx - r, cy - r, 2 * r, 2 * r, Math.min(s.raggio, r * 0.6))
        : forma.poligono(cx, cy, r / Math.cos(Math.PI / (s.forma === 'esagono' ? 6 : 8)), s.forma === 'esagono' ? 6 : 8, s.forma === 'esagono' ? Math.PI / 6 : Math.PI / 8);
      const t = String(s.testo || '').trim();
      for (let i = 0; i < n; i++) {
        const cx = m + d / 2 + (i % cols) * (d + gap), cy = m + d / 2 + Math.floor(i / cols) * (d + gap);
        cut += sagoma(cx, cy, d / 2); c++;
        if (s.bordo) { engrave += sagoma(cx, cy, d / 2 - 5); c++; }
        if (t) { engrave += `<text x="${f(cx)}" y="${f(cy)}" fill="#68d5ff" stroke="none" font-family="Arial,sans-serif" font-size="${f(Math.min(d / 7, (d - 20) / Math.max(4, t.length) * 1.6))}" text-anchor="middle" dominant-baseline="middle">${esc(t)}</text>`; c++; }
      }
      return { w: 2 * m + cols * d + (cols - 1) * gap, h: 2 * m + rows * d + (rows - 1) * gap, cut, engrave, count: c };
    }
  };

  /* ---------- 3. SEGNALIBRI ---------- */
  M.segnalibro = {
    stato: { w: 40, h: 160, testo: 'Buona lettura', punta: 'tonda', foro: 4, cornice: true, quanti: 3 },
    campi: (s, h) =>
      '<div class="field"><label>Dimensioni (mm)</label><div class="pair"><input id="f_w" aria-label="Larghezza" type="number" min="25" max="70" value="' + s.w + '"><input id="f_h" aria-label="Altezza" type="number" min="100" max="220" value="' + s.h + '"></div></div>' +
      h.selectField('punta', 'Forma della punta', s.punta, [['tonda', 'Arco'], ['dritta', 'Dritta'], ['coda', 'Coda di rondine']]) +
      h.field('testo', 'Testo in verticale', 'text', s.testo, 'maxlength="30"') +
      h.field('foro', 'Foro per la nappina · mm', 'number', s.foro, 'min="0" max="8" step=".5"') +
      '<label class="checkrow"><input id="f_cornice" type="checkbox" ' + (s.cornice ? 'checked' : '') + '> Cornice incisa</label>' +
      h.selectField('quanti', 'Quanti nel foglio', String(s.quanti), [['1', '1'], ['3', '3'], ['5', '5']]),
    limita: (s) => {
      s.w = clampN(s.w, 25, 70, 40); s.h = clampN(s.h, 100, 220, 160); s.foro = clampN(s.foro, 0, 8, 4);
      if (!['tonda', 'dritta', 'coda'].includes(s.punta)) s.punta = 'tonda';
      s.quanti = [1, 3, 5].includes(Number(s.quanti)) ? Number(s.quanti) : 3;
    },
    disegna: (s) => {
      M.segnalibro.limita(s);
      const W = s.w, H = s.h, m = 2, gap = 5, r = Math.min(4, W / 8);
      let cut = '', engrave = '', c = 0;
      const t = String(s.testo || '').trim();
      for (let i = 0; i < s.quanti; i++) {
        const x = m + i * (W + gap), y = m;
        const top = s.punta === 'tonda'
          ? `M ${f(x)} ${f(y + W / 2)} A ${f(W / 2)} ${f(W / 2)} 0 0 1 ${f(x + W)} ${f(y + W / 2)}`
          : `M ${f(x)} ${f(y + r)} Q ${f(x)} ${f(y)} ${f(x + r)} ${f(y)} L ${f(x + W - r)} ${f(y)} Q ${f(x + W)} ${f(y)} ${f(x + W)} ${f(y + r)}`;
        const fondo = s.punta === 'coda'
          ? ` L ${f(x + W)} ${f(y + H)} L ${f(x + W / 2)} ${f(y + H - W * 0.45)} L ${f(x)} ${f(y + H)} Z`
          : ` L ${f(x + W)} ${f(y + H - r)} Q ${f(x + W)} ${f(y + H)} ${f(x + W - r)} ${f(y + H)} L ${f(x + r)} ${f(y + H)} Q ${f(x)} ${f(y + H)} ${f(x)} ${f(y + H - r)} Z`;
        cut += `<path d="${top}${fondo}"/>`; c++;
        if (s.foro > 0) { cut += forma.cerchio(x + W / 2, y + Math.max(s.foro + 3, W * 0.28), s.foro / 2); c++; }
        if (s.cornice) { engrave += forma.rettangolo(x + 4, y + W * 0.55, W - 8, H - W * 0.55 - (s.punta === 'coda' ? W * 0.6 : 6), 2); c++; }
        if (t) {
          const cx = x + W / 2, cy = y + H * 0.55, fs = Math.min(W * 0.34, (H * 0.55) / Math.max(4, t.length) * 1.6);
          engrave += `<text x="${f(cx)}" y="${f(cy)}" transform="rotate(-90 ${f(cx)} ${f(cy)})" fill="#68d5ff" stroke="none" font-family="Arial,sans-serif" font-size="${f(fs)}" text-anchor="middle" dominant-baseline="middle">${esc(t)}</text>`; c++;
        }
      }
      return { w: 2 * m + s.quanti * W + (s.quanti - 1) * gap, h: H + 2 * m, cut, engrave, count: c };
    }
  };

  /* ---------- 4. ORECCHINI ---------- */
  M.orecchini = {
    stato: { forma: 'goccia', h: 45, foro: 1.6, interno: 'contorno', spessoreBordo: 3, coppie: 1 },
    campi: (s, h) =>
      h.selectField('forma', 'Forma', s.forma, [['goccia', 'Goccia'], ['cerchio', 'Cerchio'], ['esagono', 'Esagono'], ['foglia', 'Foglia'], ['arco', 'Arco']]) +
      h.field('h', 'Altezza · mm', 'number', s.h, 'min="18" max="80"') +
      h.selectField('interno', 'Interno', s.interno, [['pieno', 'Pieno'], ['contorno', 'Traforato (solo bordo)'], ['righe', 'Righe incise']]) +
      h.field('spessoreBordo', 'Bordo del traforo · mm', 'number', s.spessoreBordo, 'min="2" max="8" step=".5"') +
      h.field('foro', 'Foro per il gancio · mm', 'number', s.foro, 'min="1" max="3" step=".1"') +
      h.selectField('coppie', 'Paia nel foglio', String(s.coppie), [['1', '1 paio'], ['2', '2 paia'], ['3', '3 paia']]) +
      '<div class="notice">Il traforo lascia un bordo continuo: sotto i 2,5 mm il legno diventa fragile. Il foro va 2 mm dentro il bordo.</div>',
    limita: (s) => {
      if (!['goccia', 'cerchio', 'esagono', 'foglia', 'arco'].includes(s.forma)) s.forma = 'goccia';
      if (!['pieno', 'contorno', 'righe'].includes(s.interno)) s.interno = 'contorno';
      s.h = clampN(s.h, 18, 80, 45); s.foro = clampN(s.foro, 1, 3, 1.6); s.spessoreBordo = clampN(s.spessoreBordo, 2, 8, 3);
      s.coppie = [1, 2, 3].includes(Number(s.coppie)) ? Number(s.coppie) : 1;
    },
    /* contorno della forma in un riquadro (x,y,w,h), ridotto di «dentro» mm */
    sagoma: (fm, x, y, w, h, dentro) => {
      const X = x + dentro, Y = y + dentro, W = w - 2 * dentro, H = h - 2 * dentro, cx = X + W / 2;
      if (W <= 2 || H <= 2) return '';
      if (fm === 'cerchio') return forma.cerchio(cx, Y + H / 2, Math.min(W, H) / 2);
      if (fm === 'esagono') return forma.poligono(cx, Y + H / 2, Math.min(W / 1.732 * 1.0, H / 2), 6, -Math.PI / 2);
      if (fm === 'foglia') return `<path d="M ${f(cx)} ${f(Y)} C ${f(X + W * 1.05)} ${f(Y + H * 0.25)}, ${f(X + W * 0.95)} ${f(Y + H * 0.8)}, ${f(cx)} ${f(Y + H)} C ${f(X + W * 0.05)} ${f(Y + H * 0.8)}, ${f(X - W * 0.05)} ${f(Y + H * 0.25)}, ${f(cx)} ${f(Y)} Z"/>`;
      if (fm === 'arco') return `<path d="M ${f(X)} ${f(Y + H)} L ${f(X)} ${f(Y + W / 2)} A ${f(W / 2)} ${f(W / 2)} 0 0 1 ${f(X + W)} ${f(Y + W / 2)} L ${f(X + W)} ${f(Y + H)} Z"/>`;
      /* goccia */
      return `<path d="M ${f(cx)} ${f(Y)} C ${f(X + W * 0.62)} ${f(Y + H * 0.28)}, ${f(X + W)} ${f(Y + H * 0.5)}, ${f(X + W)} ${f(Y + H * 0.7)} A ${f(W / 2)} ${f(W / 2)} 0 0 1 ${f(X)} ${f(Y + H * 0.7)} C ${f(X)} ${f(Y + H * 0.5)}, ${f(X + W * 0.38)} ${f(Y + H * 0.28)}, ${f(cx)} ${f(Y)} Z"/>`;
    },
    disegna: (s) => {
      M.orecchini.limita(s);
      const H = s.h, W = s.forma === 'cerchio' ? H : s.forma === 'esagono' ? H * 0.87 : s.forma === 'foglia' ? H * 0.55 : H * 0.62;
      const top = s.foro + 4, m = 2, gap = 5, pezzi = s.coppie * 2;
      let cut = '', engrave = '', c = 0;
      for (let i = 0; i < pezzi; i++) {
        const x = m + i * (W + gap), y = m + top;
        cut += M.orecchini.sagoma(s.forma, x, y, W, H, 0); c++;
        cut += forma.cerchio(x + W / 2, m + s.foro / 2 + 1.2, s.foro / 2);
        /* ponticello che collega il foro alla forma */
        cut += forma.rettangolo(x + W / 2 - 1.2, m + s.foro + 0.6, 2.4, top - s.foro + 1.5, 1.2); c += 2;
        if (s.interno === 'contorno') { const in2 = M.orecchini.sagoma(s.forma, x, y, W, H, s.spessoreBordo); if (in2) { cut += in2; c++; } }
        if (s.interno === 'righe') {
          for (let k = 1; k < 6; k++) { const yy = y + H * k / 6; engrave += `<path d="M ${f(x + W * 0.18)} ${f(yy)} L ${f(x + W * 0.82)} ${f(yy)}"/>`; c++; }
        }
      }
      return { w: 2 * m + pezzi * W + (pezzi - 1) * gap, h: 2 * m + top + H, cut, engrave, count: c };
    }
  };

  /* ---------- 5. ROSETTA GUILLOCHÉ (solo INGLY) ---------- */
  M.rosetta = {
    stato: { d: 90, anelli: 3, onde: 14, linee: 12, taglio: true, foro: 0 },
    campi: (s, h) =>
      h.field('d', 'Diametro · mm', 'number', s.d, 'min="30" max="300"') +
      h.field('anelli', 'Anelli intrecciati', 'range', s.anelli, 'min="1" max="5" step="1"') +
      h.field('onde', 'Onde per giro', 'range', s.onde, 'min="6" max="30" step="1"') +
      h.field('linee', 'Linee per anello', 'range', s.linee, 'min="4" max="16" step="1"') +
      '<label class="checkrow"><input id="f_taglio" type="checkbox" ' + (s.taglio ? 'checked' : '') + '> Taglia il disco intorno (medaglione o sottobicchiere)</label>' +
      h.field('foro', 'Foro per appenderlo · mm (0 = nessuno)', 'number', s.foro, 'min="0" max="10" step=".5"') +
      '<div class="notice">La rosetta è incisa: tante linee sottili, come nelle incisioni delle banconote. Su legno chiaro e metallo anodizzato rende al massimo.</div>',
    limita: (s) => {
      s.d = clampN(s.d, 30, 300, 90); s.anelli = Math.round(clampN(s.anelli, 1, 5, 3)); s.onde = Math.round(clampN(s.onde, 6, 30, 14));
      s.linee = Math.round(clampN(s.linee, 4, 16, 12)); s.foro = clampN(s.foro, 0, 10, 0);
    },
    disegna: (s) => {
      M.rosetta.limita(s);
      const m = 2, R = s.d / 2, cx = m + R, cy = m + R;
      let cut = '', engrave = '', c = 0;
      if (s.taglio) { cut += forma.cerchio(cx, cy, R); c++; }
      if (s.foro > 0) { cut += forma.cerchio(cx, cy - R + s.foro / 2 + 3, s.foro / 2); c++; }
      const utile = R - 4 - (s.foro > 0 ? s.foro + 4 : 0) * 0.5;
      for (let a = 0; a < s.anelli; a++) {
        const r0 = utile * (1 - (a + 0.5) / (s.anelli + 0.4)), amp = utile / (s.anelli + 1) * 0.42;
        const onde = Math.max(4, s.onde - a * 2), N = Math.min(onde * 8, 160);
        /* 0,01 mm basta al laser e tiene il file leggero */
        const g = n => (Math.round(n * 100) / 100).toString();
        for (let l = 0; l < s.linee; l++) {
          const fase = l / s.linee * Math.PI * 2, p = [];
          for (let k = 0; k <= N; k++) {
            const t = k / N * Math.PI * 2, rr = r0 + amp * Math.sin(onde * t + fase);
            p.push(g(cx + rr * Math.cos(t)) + ' ' + g(cy + rr * Math.sin(t)));
          }
          engrave += '<path d="M ' + p.join(' L ') + ' Z"/>'; c++;
        }
      }
      engrave += forma.cerchio(cx, cy, utile + 1); c++;
      return { w: 2 * m + s.d, h: 2 * m + s.d, cut, engrave, count: c };
    }
  };

  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])); }

  /* voci di catalogo (nome, descrizione, categoria, icona) per il Studio e l'Admin */
  const CATALOGO = [
    { id: 'puzzle', nome: { it: 'Puzzle personalizzato', en: 'Custom jigsaw puzzle' }, descrizione: { it: 'Puzzle a incastri classici: misure, numero di pezzi e variante del taglio.', en: 'Classic jigsaw: size, number of pieces and cut variant.' }, categoria: 'Giochi e regali', icona: '◫' },
    { id: 'sottobicchiere', nome: { it: 'Sottobicchieri', en: 'Coasters' }, descrizione: { it: 'Set di sottobicchieri con forma, testo e cornice incisa.', en: 'Coaster sets with shape, text and engraved frame.' }, categoria: 'Casa e tavola', icona: '◎' },
    { id: 'segnalibro', nome: { it: 'Segnalibri', en: 'Bookmarks' }, descrizione: { it: 'Segnalibri con punta, foro per la nappina e testo in verticale.', en: 'Bookmarks with shaped tip, tassel hole and vertical text.' }, categoria: 'Giochi e regali', icona: '▯' },
    { id: 'orecchini', nome: { it: 'Orecchini', en: 'Earrings' }, descrizione: { it: 'Paia di orecchini in cinque forme, pieni, traforati o incisi.', en: 'Earring pairs in five shapes: solid, cut-out or engraved.' }, categoria: 'Accessori', icona: '◇' },
    { id: 'rosetta', nome: { it: 'Rosetta guilloché', en: 'Guilloché rosette' }, descrizione: { it: 'Il disegno inciso firma di INGLY: anelli di linee intrecciate, da medaglione o sottobicchiere.', en: 'INGLY’s signature engraving: interwoven line rings for medallions or coasters.' }, categoria: 'Incisioni decorative', icona: '✺' }
  ];

  const EN = {
    'Giochi e regali': 'Games and gifts', 'Casa e tavola': 'Home and table', 'Incisioni decorative': 'Decorative engraving',
    'Pezzi (colonne × righe)': 'Pieces (columns × rows)', 'Grandezza incastri · %': 'Tab size · %', 'Variante del taglio': 'Cut variant',
    'Raggio angoli esterni · mm': 'Outer corner radius · mm', 'Testo inciso sul retro (facoltativo)': 'Engraved text (optional)',
    'Misura · mm': 'Size · mm', 'Quadrato arrotondato': 'Rounded square', 'Ottagono': 'Octagon', 'Quanti nel foglio': 'How many per sheet',
    'Forma della punta': 'Tip shape', 'Dritta': 'Straight', 'Coda di rondine': 'Swallowtail', 'Testo in verticale': 'Vertical text',
    'Foro per la nappina · mm': 'Tassel hole · mm', 'Goccia': 'Drop', 'Foglia': 'Leaf', 'Altezza · mm': 'Height · mm', 'Interno': 'Inside',
    'Pieno': 'Solid', 'Traforato (solo bordo)': 'Cut-out (border only)', 'Righe incise': 'Engraved lines', 'Bordo del traforo · mm': 'Cut-out border · mm',
    'Foro per il gancio · mm': 'Hook hole · mm', 'Paia nel foglio': 'Pairs per sheet', '1 paio': '1 pair', '2 paia': '2 pairs', '3 paia': '3 pairs',
    'Diametro · mm': 'Diameter · mm', 'Anelli intrecciati': 'Interwoven rings', 'Onde per giro': 'Waves per turn', 'Linee per anello': 'Lines per ring',
    'Foro per appenderlo · mm (0 = nessuno)': 'Hanging hole · mm (0 = none)',
    'Cornice incisa a 5 mm dal bordo': 'Engraved frame 5 mm from the edge', 'Cornice incisa': 'Engraved frame',
    'Taglia il disco intorno (medaglione o sottobicchiere)': 'Cut the disc around it (medallion or coaster)',
    'Ogni «variante» cambia la forma degli incastri: tienila uguale per rifare lo stesso puzzle. Prova prima un pezzo: il kerf decide quanto stringono gli incastri.': 'Each “variant” changes the tab shapes: keep it the same to recut the same puzzle. Test one piece first: the kerf decides how tight the tabs are.',
    'Il traforo lascia un bordo continuo: sotto i 2,5 mm il legno diventa fragile. Il foro va 2 mm dentro il bordo.': 'The cut-out keeps a continuous border: below 2.5 mm wood becomes fragile. The hole sits 2 mm inside the edge.',
    'La rosetta è incisa: tante linee sottili, come nelle incisioni delle banconote. Su legno chiaro e metallo anodizzato rende al massimo.': 'The rosette is engraved: many fine lines, like banknote engraving. It looks best on light wood and anodised metal.'
  };

  root.INGLY_GEN_NUOVI = { motori: M, catalogo: CATALOGO, en: EN, ids: Object.keys(M) };
})(typeof window !== 'undefined' ? window : globalThis);
