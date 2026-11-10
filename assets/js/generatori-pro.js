/* ============================================================
   INGLY Generator Studio — strumenti professionali, scritti da zero.

   Quello che distingue un generatore «da laboratorio» da uno giocattolo:
   - KERF: il laser toglie un filo di materiale (0,1–0,2 mm). Senza
     compensazione i pezzi escono più piccoli e i fori più grandi. Qui i
     contorni esterni si allargano di kerf/2 e i fori si stringono di kerf/2.
   - DXF: il formato che leggono LightBurn, i CAD e i software di taglio.
     R12 (POLYLINE), il più compatibile, con i livelli CUT ed ENGRAVE.
   - RIPETIZIONE: più copie sul piano della macchina, per la produzione.
   - CONTROLLI: pezzo più grande del piano, dettagli sotto 1 mm, testo
     troppo piccolo, testo da convertire in tracciati.
   - LINK: il progetto in un indirizzo da salvare o mandare.

   Funzioni pure, niente DOM: tests/test-generatori-pro.mjs.
   Le forme lette sono quelle che producono i motori INGLY: rect, circle,
   ellipse, line, polyline, polygon, path (M L H V C S Q T A Z, assoluti e
   relativi). I testi non diventano tracciati: si segnalano.
   ============================================================ */
(function (root) {
  'use strict';
  const r3 = n => Math.round(n * 1000) / 1000;
  const num = (v, d) => { const n = parseFloat(v); return Number.isFinite(n) ? n : d; };

  /* ---------- lettura delle forme ---------- */
  function attrs(s) {
    const o = {}; const re = /([a-zA-Z:-]+)\s*=\s*"([^"]*)"/g; let m;
    while ((m = re.exec(s))) o[m[1]] = m[2];
    return o;
  }

  /* segmenti per una curva: abbastanza da stare entro ~0,05 mm */
  const passi = len => Math.max(6, Math.min(96, Math.ceil(len / 0.6)));

  function arco(cx, cy, rx, ry, a0, da, out) {
    const n = passi(Math.abs(da) * Math.max(rx, ry));
    for (let i = 1; i <= n; i++) { const a = a0 + da * i / n; out.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]); }
  }

  /* arco SVG (punto iniziale/finale) → centro e angoli (specifica SVG, F.6.5) */
  function arcoSvg(x1, y1, rx, ry, phi, fa, fs, x2, y2, out) {
    rx = Math.abs(rx); ry = Math.abs(ry);
    if (!rx || !ry) { out.push([x2, y2]); return; }
    const c = Math.cos(phi), s = Math.sin(phi);
    const dx = (x1 - x2) / 2, dy = (y1 - y2) / 2;
    const xp = c * dx + s * dy, yp = -s * dx + c * dy;
    const lam = xp * xp / (rx * rx) + yp * yp / (ry * ry);
    if (lam > 1) { rx *= Math.sqrt(lam); ry *= Math.sqrt(lam); }
    let co = Math.sqrt(Math.max(0, (rx * rx * ry * ry - rx * rx * yp * yp - ry * ry * xp * xp) / (rx * rx * yp * yp + ry * ry * xp * xp)));
    if (fa === fs) co = -co;
    const cxp = co * rx * yp / ry, cyp = -co * ry * xp / rx;
    const cx = c * cxp - s * cyp + (x1 + x2) / 2, cy = s * cxp + c * cyp + (y1 + y2) / 2;
    const ang = (ux, uy, vx, vy) => { const d = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy); return d; };
    const t1 = ang(1, 0, (xp - cxp) / rx, (yp - cyp) / ry);
    let dt = ang((xp - cxp) / rx, (yp - cyp) / ry, (-xp - cxp) / rx, (-yp - cyp) / ry);
    if (!fs && dt > 0) dt -= 2 * Math.PI; else if (fs && dt < 0) dt += 2 * Math.PI;
    const n = passi(Math.abs(dt) * Math.max(rx, ry));
    for (let i = 1; i <= n; i++) {
      const t = t1 + dt * i / n, ex = rx * Math.cos(t), ey = ry * Math.sin(t);
      out.push([c * ex - s * ey + cx, s * ex + c * ey + cy]);
    }
  }

  function percorso(d) {
    const linee = []; let cur = null, x = 0, y = 0, sx = 0, sy = 0, lc = null, lq = null, cmd = '';
    const tok = String(d).match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) || [];
    let i = 0;
    const n = () => parseFloat(tok[i++]);
    const nuova = () => { if (cur && cur.pts.length > 1) linee.push(cur); cur = { pts: [[x, y]], closed: false }; };
    while (i < tok.length) {
      if (/[a-zA-Z]/.test(tok[i])) cmd = tok[i++];
      const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
      const ox = rel ? x : 0, oy = rel ? y : 0;
      if (C === 'Z') { if (cur) { cur.closed = true; x = sx; y = sy; linee.push(cur); cur = null; } lc = lq = null; continue; }
      if (i >= tok.length || /[a-zA-Z]/.test(tok[i])) continue; /* comando senza numeri: si passa al prossimo */
      if (C === 'M') { x = ox + n(); y = oy + n(); sx = x; sy = y; nuova(); cmd = rel ? 'l' : 'L'; lc = lq = null; continue; }
      if (!cur) nuova();
      if (C === 'L') { x = ox + n(); y = oy + n(); cur.pts.push([x, y]); lc = lq = null; }
      else if (C === 'H') { x = ox + n(); cur.pts.push([x, y]); lc = lq = null; }
      else if (C === 'V') { y = oy + n(); cur.pts.push([x, y]); lc = lq = null; }
      else if (C === 'C' || C === 'S') {
        let x1, y1;
        if (C === 'C') { x1 = ox + n(); y1 = oy + n(); } else { x1 = lc ? 2 * x - lc[0] : x; y1 = lc ? 2 * y - lc[1] : y; }
        const x2 = ox + n(), y2 = oy + n(), ex = ox + n(), ey = oy + n();
        const k = passi(Math.hypot(x1 - x, y1 - y) + Math.hypot(x2 - x1, y2 - y1) + Math.hypot(ex - x2, ey - y2));
        for (let j = 1; j <= k; j++) { const t = j / k, u = 1 - t;
          cur.pts.push([u * u * u * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * ex, u * u * u * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * ey]); }
        lc = [x2, y2]; lq = null; x = ex; y = ey;
      } else if (C === 'Q' || C === 'T') {
        let x1, y1;
        if (C === 'Q') { x1 = ox + n(); y1 = oy + n(); } else { x1 = lq ? 2 * x - lq[0] : x; y1 = lq ? 2 * y - lq[1] : y; }
        const ex = ox + n(), ey = oy + n();
        const k = passi(Math.hypot(x1 - x, y1 - y) + Math.hypot(ex - x1, ey - y1));
        for (let j = 1; j <= k; j++) { const t = j / k, u = 1 - t;
          cur.pts.push([u * u * x + 2 * u * t * x1 + t * t * ex, u * u * y + 2 * u * t * y1 + t * t * ey]); }
        lq = [x1, y1]; lc = null; x = ex; y = ey;
      } else if (C === 'A') {
        const rx = n(), ry = n(), rot = n() * Math.PI / 180, fa = n(), fs = n(), ex = ox + n(), ey = oy + n();
        arcoSvg(x, y, rx, ry, rot, !!fa, !!fs, ex, ey, cur.pts); x = ex; y = ey; lc = lq = null;
      } else { i++; }
    }
    if (cur && cur.pts.length > 1) linee.push(cur);
    return linee;
  }

  /** Le forme di un frammento SVG → polilinee {pts, closed}. */
  function polilinee(frammento) {
    const out = [];
    const re = /<(rect|circle|ellipse|line|polyline|polygon|path)\b([^>]*)\/?>/g; let m;
    while ((m = re.exec(String(frammento || '')))) {
      const t = m[1], a = attrs(m[2]);
      if (t === 'rect') {
        const x = num(a.x, 0), y = num(a.y, 0), w = num(a.width, 0), h = num(a.height, 0);
        let rx = Math.min(num(a.rx, num(a.ry, 0)), w / 2, h / 2);
        if (!(w > 0 && h > 0)) continue;
        const pts = [];
        if (rx > 0) {
          pts.push([x + rx, y]); pts.push([x + w - rx, y]); arco(x + w - rx, y + rx, rx, rx, -Math.PI / 2, Math.PI / 2, pts);
          pts.push([x + w, y + h - rx]); arco(x + w - rx, y + h - rx, rx, rx, 0, Math.PI / 2, pts);
          pts.push([x + rx, y + h]); arco(x + rx, y + h - rx, rx, rx, Math.PI / 2, Math.PI / 2, pts);
          pts.push([x, y + rx]); arco(x + rx, y + rx, rx, rx, Math.PI, Math.PI / 2, pts);
          pts.pop();
        } else pts.push([x, y], [x + w, y], [x + w, y + h], [x, y + h]);
        out.push({ pts, closed: true });
      } else if (t === 'circle' || t === 'ellipse') {
        const cx = num(a.cx, 0), cy = num(a.cy, 0), rx = t === 'circle' ? num(a.r, 0) : num(a.rx, 0), ry = t === 'circle' ? rx : num(a.ry, 0);
        if (!(rx > 0 && ry > 0)) continue;
        const pts = [[cx + rx, cy]]; arco(cx, cy, rx, ry, 0, 2 * Math.PI, pts); pts.pop();
        out.push({ pts, closed: true });
      } else if (t === 'line') {
        out.push({ pts: [[num(a.x1, 0), num(a.y1, 0)], [num(a.x2, 0), num(a.y2, 0)]], closed: false });
      } else if (t === 'polyline' || t === 'polygon') {
        const v = String(a.points || '').trim().split(/[\s,]+/).map(Number), pts = [];
        for (let k = 0; k + 1 < v.length; k += 2) if (Number.isFinite(v[k]) && Number.isFinite(v[k + 1])) pts.push([v[k], v[k + 1]]);
        if (pts.length > 1) out.push({ pts, closed: t === 'polygon' });
      } else if (t === 'path') {
        out.push(...percorso(a.d || ''));
      }
    }
    return out.map(p => ({ pts: pulisci(p.pts, p.closed), closed: p.closed })).filter(p => p.pts.length > 1);
  }

  function pulisci(pts, chiuso) {
    const o = [];
    for (const p of pts) { const q = o[o.length - 1]; if (!q || Math.hypot(p[0] - q[0], p[1] - q[1]) > 1e-6) o.push(p); }
    if (chiuso && o.length > 2) { const a = o[0], b = o[o.length - 1]; if (Math.hypot(a[0] - b[0], a[1] - b[1]) < 1e-6) o.pop(); }
    return o;
  }

  /* ---------- geometria ---------- */
  const area = pts => { let s = 0; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; s += a[0] * b[1] - b[0] * a[1]; } return s / 2; };
  function dentro(p, pts) {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const a = pts[i], b = pts[j];
      if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c;
    }
    return c;
  }
  function riquadro(linee) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const l of linee) for (const p of l.pts) { if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0]; if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
    return Number.isFinite(x0) ? { x: x0, y: y0, w: x1 - x0, h: y1 - y0 } : { x: 0, y: 0, w: 0, h: 0 };
  }

  /** Sposta un contorno chiuso di d (positivo = verso l'esterno). Spigoli a punta con limite: oltre, smussati. */
  function sposta(pts, d) {
    const A = area(pts), sgn = A >= 0 ? 1 : -1, n = pts.length, out = [];
    const norm = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [sgn * dy / l, -sgn * dx / l]; };
    for (let i = 0; i < n; i++) {
      const p = pts[i], a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
      const n1 = norm(a, p), n2 = norm(p, b);
      let mx = n1[0] + n2[0], my = n1[1] + n2[1]; const ml = Math.hypot(mx, my);
      if (ml < 1e-9) { out.push([p[0] + n1[0] * d, p[1] + n1[1] * d]); continue; }
      mx /= ml; my /= ml;
      const cosm = mx * n1[0] + my * n1[1], len = d / Math.max(cosm, 1e-9);
      if (Math.abs(len) > 4 * Math.abs(d)) { out.push([p[0] + n1[0] * d, p[1] + n1[1] * d], [p[0] + n2[0] * d, p[1] + n2[1] * d]); }
      else out.push([p[0] + mx * len, p[1] + my * len]);
    }
    return out;
  }

  /**
   * Compensazione kerf: i contorni esterni crescono di k/2, i fori calano di k/2.
   * Un contorno è un foro se sta dentro a un numero dispari di altri contorni.
   * Le linee aperte (tagli interni di puzzle e living hinge) restano come sono.
   */
  function kerf(linee, k) {
    k = Math.max(0, Math.min(1, num(k, 0)));
    if (!k) return linee.map(l => ({ pts: l.pts.map(p => p.slice()), closed: l.closed }));
    const chiuse = linee.filter(l => l.closed && l.pts.length > 2);
    return linee.map(l => {
      if (!l.closed || l.pts.length < 3) return { pts: l.pts.map(p => p.slice()), closed: l.closed };
      const prova = l.pts[0];
      let liv = 0; for (const o of chiuse) if (o !== l && dentro(prova, o.pts) && Math.abs(area(o.pts)) > Math.abs(area(l.pts))) liv++;
      const foro = liv % 2 === 1;
      return { pts: sposta(l.pts, foro ? -k / 2 : k / 2), closed: true, foro };
    });
  }

  const comePath = linee => linee.map(l => '<path d="M ' + l.pts.map(p => r3(p[0]) + ' ' + r3(p[1])).join(' L ') + (l.closed ? ' Z' : '') + '"/>').join('');

  /* ---------- ripetizione sul piano ---------- */
  function ripeti(corpo, w, h, opt = {}) {
    const col = Math.max(1, Math.min(30, Math.round(num(opt.colonne, 1)))), rig = Math.max(1, Math.min(30, Math.round(num(opt.righe, 1))));
    const gap = Math.max(0, Math.min(50, num(opt.spazio, 3)));
    if (col === 1 && rig === 1) return { corpo, w, h, copie: 1 };
    const g = s => { let o = ''; for (let r = 0; r < rig; r++) for (let c = 0; c < col; c++) o += '<g transform="translate(' + r3(c * (w + gap)) + ' ' + r3(r * (h + gap)) + ')">' + s + '</g>'; return o; };
    return { corpo: { cut: g(corpo.cut || ''), engrave: g(corpo.engrave || ''), text: g(corpo.text || '') }, w: r3(col * w + (col - 1) * gap), h: r3(rig * h + (rig - 1) * gap), copie: col * rig };
  }
  /** Quante copie entrano nel piano (si prova anche a ruotare il conteggio, non il pezzo). */
  function riempi(w, h, piano, gap) {
    gap = Math.max(0, num(gap, 3));
    if (!piano || !(piano.w > 0 && piano.h > 0) || !(w > 0 && h > 0)) return { colonne: 1, righe: 1 };
    return { colonne: Math.max(1, Math.floor((piano.w + gap) / (w + gap))), righe: Math.max(1, Math.floor((piano.h + gap) / (h + gap))) };
  }

  /* ---------- DXF R12 ---------- */
  function dxf(livelli, H) {
    const L = [];
    const p = (c, v) => { L.push(String(c)); L.push(String(v)); };
    p(0, 'SECTION'); p(2, 'HEADER'); p(9, '$ACADVER'); p(1, 'AC1009'); p(9, '$INSBASE'); p(10, 0); p(20, 0); p(30, 0); p(0, 'ENDSEC');
    p(0, 'SECTION'); p(2, 'TABLES'); p(0, 'TABLE'); p(2, 'LAYER'); p(70, livelli.length);
    for (const lv of livelli) { p(0, 'LAYER'); p(2, lv.nome); p(70, 0); p(62, lv.colore); p(6, 'CONTINUOUS'); }
    p(0, 'ENDTAB'); p(0, 'ENDSEC');
    p(0, 'SECTION'); p(2, 'ENTITIES');
    for (const lv of livelli) for (const l of lv.linee) {
      p(0, 'POLYLINE'); p(8, lv.nome); p(66, 1); p(70, l.closed ? 1 : 0); p(10, 0); p(20, 0); p(30, 0);
      for (const q of l.pts) { p(0, 'VERTEX'); p(8, lv.nome); p(10, r3(q[0])); p(20, r3(H - q[1])); p(30, 0); }
      p(0, 'SEQEND'); p(8, lv.nome);
    }
    p(0, 'ENDSEC'); p(0, 'EOF');
    return L.join('\r\n') + '\r\n';
  }

  /** Le forme dentro i gruppo <g transform="translate(x y)"> della ripetizione, già spostate. */
  function polilineeConCopie(frammento) {
    const s = String(frammento || ''), out = [];
    const re = /<g transform="translate\(([-\d.]+) ([-\d.]+)\)">([\s\S]*?)<\/g>/g; let m, trovato = false;
    while ((m = re.exec(s))) { trovato = true; const dx = +m[1], dy = +m[2]; for (const l of polilinee(m[3])) out.push({ pts: l.pts.map(p => [p[0] + dx, p[1] + dy]), closed: l.closed }); }
    return trovato ? out : polilinee(s);
  }

  /* ---------- controlli di qualità ---------- */
  function controlli({ w, h, cut = '', engrave = '', text = '', piano = null, kerf: k = 0 }) {
    const avvisi = [];
    if (piano && piano.w > 0 && piano.h > 0) {
      if (w > piano.w + 1e-6 || h > piano.h + 1e-6) {
        const ruota = h <= piano.w && w <= piano.h;
        avvisi.push({ livello: 'errore', codice: 'piano', testo: 'Il progetto (' + r3(w) + ' × ' + r3(h) + ' mm) non entra nel piano di ' + (piano.nome || 'lavoro') + ' (' + piano.w + ' × ' + piano.h + ' mm)' + (ruota ? ': ruotalo di 90° nel software della macchina.' : '.') });
      }
    }
    const piccoli = polilinee(cut).filter(l => l.closed).filter(l => { const b = riquadro([l]); return Math.min(b.w, b.h) < 1 && Math.max(b.w, b.h) > 0; }).length;
    if (piccoli) avvisi.push({ livello: 'attenzione', codice: 'dettagli', testo: piccoli + ' dettagli di taglio sotto 1 mm: rischiano di bruciare o staccarsi.' });
    const fonti = [...String(engrave + text).matchAll(/<text\b[^>]*font-size="([\d.]+)"/g)].map(m => +m[1]);
    if (fonti.some(f => f < 2)) avvisi.push({ livello: 'attenzione', codice: 'testo-piccolo', testo: 'Testo sotto 2 mm di altezza: difficile da leggere dopo l’incisione.' });
    if (fonti.length) avvisi.push({ livello: 'info', codice: 'testo-tracciati', testo: 'Il file contiene testo: nel software della macchina convertilo in tracciati (xTool Creative Space: «Converti in tracciato»). Nel DXF il testo non c’è.' });
    if (k > 0.5) avvisi.push({ livello: 'attenzione', codice: 'kerf', testo: 'Kerf di ' + k + ' mm: insolitamente alto, misuralo con un pettine di prova.' });
    return avvisi;
  }

  /* ---------- link condivisibile ---------- */
  const b64 = s => (typeof btoa === 'function' ? btoa(unescape(encodeURIComponent(s))) : Buffer.from(s, 'utf8').toString('base64')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const de64 = s => { s = String(s).replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; return typeof atob === 'function' ? decodeURIComponent(escape(atob(s))) : Buffer.from(s, 'base64').toString('utf8'); };
  function codifica(o) { return b64(JSON.stringify(o)); }
  function decodifica(s) {
    try {
      const o = JSON.parse(de64(s));
      if (!o || typeof o !== 'object' || typeof o.g !== 'string' || !/^[a-z0-9-]{1,40}$/.test(o.g)) return null;
      const pulito = v => (typeof v === 'number' && Number.isFinite(v)) || typeof v === 'boolean' || (typeof v === 'string' && v.length <= 80);
      const st = {}; for (const [k, v] of Object.entries(o.s || {})) if (/^[a-zA-Z]{1,24}$/.test(k) && pulito(v)) st[k] = v;
      const pr = {}; for (const [k, v] of Object.entries(o.p || {})) if (/^[a-zA-Z]{1,24}$/.test(k) && pulito(v)) pr[k] = v;
      return { g: o.g, s: st, p: pr };
    } catch (e) { return null; }
  }

  /* piani di lavoro dichiarati da xTool, come riportati nelle schede del sito */
  const PIANI = [
    { id: 'p3', nome: 'xTool P3', w: 914, h: 457 },
    { id: 'x1', nome: 'xTool X1', w: 615, h: 320 },
    { id: 'o1', nome: 'xTool O1', w: 330, h: 420 },
    { id: 'f2', nome: 'xTool F2', w: 115, h: 115 }
  ];

  root.INGLY_GEN_PRO = { polilinee, polilineeConCopie, kerf, comePath, ripeti, riempi, dxf, controlli, codifica, decodifica, riquadro, area, PIANI };
})(typeof window !== 'undefined' ? window : globalThis);
