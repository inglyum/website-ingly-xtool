/* MOSAICO DI FOTO NELL'HERO (richiesta del titolare, 2026-11-28).
   Dietro al titolo della home scorre piano un mosaico di lavori INGLY e di
   macchine xTool, velato perché il testo resti leggibile. Le foto si scelgono
   dal pannello: Admin → Temi e sfondi → «Mosaico foto della home», salvate in
   CONFIG.heroMosaico = { attivo: true, foto: ["img/…webp", …] }.

   - Nella pagina c'è già un mosaico pronto (primo disegno veloce, anche senza JS);
     qui lo si ridisegna solo se l'elenco del pannello è diverso.
   - Solo percorsi img/… (niente indirizzi esterni né codice).
   - Variante 400px solo se esiste davvero (mappa MV, regola 2).
   - Le immagini non hanno animazioni (regola 1): si muove il contenitore. */

export const MOSAICO_BASE = [
  'img/port-1.webp', 'img/xtool-c1-uso.webp', 'img/port-22.webp', 'img/port-10.webp',
  'img/xtool-m2.webp', 'img/port-5.webp', 'img/21.webp', 'img/cat-custom.webp',
  'img/port-14.webp', 'img/xtool-x1-prodotto.webp', 'img/2.webp', 'img/port-3.webp',
  'img/proj-1-1.webp', 'img/xtool-o1-uv.webp', 'img/6.webp', 'img/port-4.webp',
  'img/3.webp', 'img/xtool-f2.webp', 'img/8.webp', 'img/port-6.webp',
  'img/4.webp', 'img/port-13.webp', 'img/93.webp', 'img/port-18.webp',
  'img/5.webp', 'img/xtool-p3.webp', 'img/port-20.webp', 'img/14.webp',
  'img/proj-1-2.webp', 'img/xtool-wonderpress.webp', 'img/port-19.webp', 'img/7.webp'
];
export const TESSERE = 32;

const valida = s => typeof s === 'string' && /^img\/[\w\-./]+\.(webp|jpe?g|png)$/i.test(s) && !s.includes('..');

export function fotoMosaico(cfg) {
  const m = cfg && cfg.heroMosaico;
  if (m && m.attivo === false) return [];
  const lista = (m && Array.isArray(m.foto) ? m.foto : MOSAICO_BASE).filter(valida);
  return lista.length ? lista : MOSAICO_BASE;
}

export function piccola(p, mv) {
  const w = mv && mv[p];
  return Array.isArray(w) && w.includes(400) ? p.replace(/\.(\w+)$/, '-400.$1') : p;
}

export function htmlMosaico(lista, mv) {
  let h = '';
  for (let i = 0; i < TESSERE; i++) {
    const p = lista[i % lista.length];
    h += '<span class="hmosaico__t"><img src="' + piccola(p, mv) + '" alt="" width="400" height="500" decoding="async"' + (i < 16 ? '' : ' loading="lazy"') + '></span>';
  }
  return h;
}

export function applicaMosaico(cfg, doc = document) {
  const el = doc.getElementById('heroMosaico');
  if (!el) return;
  const lista = fotoMosaico(cfg);
  if (!lista.length) { el.hidden = true; return; }
  el.hidden = false;
  const firma = lista.join('|');
  if (el.dataset.firma === firma) return;
  const mv = (window.INGLY && window.INGLY.MV) || {};
  el.innerHTML = htmlMosaico(lista, mv);
  el.dataset.firma = firma;
}
