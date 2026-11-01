/* PREZZI xTool — regole condivise tra lo script giornaliero
   (scripts/prezzi-xtool.mjs) e l'Admin («Aggiorna prezzi da xTool»).
   Funzioni pure: nessun accesso a rete o file. Shopify espone per ogni
   prodotto l'indirizzo pubblico <url>.js con le varianti: price e
   compare_at_price in centesimi, available vero/falso. */
export const daCentesimi = c => (c == null ? null : Math.round(Number(c)) / 100);
export const norm = s => String(s || '').toLowerCase().replace(/co₂/g, 'co2').replace(/[^a-z0-9]+/g, ' ').trim();

/* Varianti di un prodotto Shopify → configurazioni */
export function varianti(prodotto) {
  return (prodotto.variants || []).map(v => ({
    nome: String(v.public_title || v.title || '').trim() || String(prodotto.title || '').trim(),
    prezzo: daCentesimi(v.price),
    listino: v.compare_at_price && v.compare_at_price > v.price ? daCentesimi(v.compare_at_price) : null,
    disponibile: v.available !== false,
    sku: v.sku || '',
  }));
}

/* Accoppia le configurazioni del sito con le varianti dello shop: prima per
   nome (normalizzato), poi per sku. Ritorna le modifiche da fare. */
export function confronta(confSito, varShop) {
  const modifiche = [], nuove = [], usate = new Set();
  const trova = c => varShop.findIndex((v, i) => !usate.has(i) && ((c.sku && v.sku && c.sku === v.sku) || norm(v.nome) === norm(c.nomeShop || c.nome)));
  confSito.forEach(c => {
    const i = trova(c);
    if (i < 0) { modifiche.push({ nome: c.nome, campo: 'non trovata nello shop', prima: '', dopo: '' }); return; }
    usate.add(i);
    const v = varShop[i];
    for (const k of ['prezzo', 'listino', 'disponibile']) {
      const prima = c[k] ?? null, dopo = v[k] ?? null;
      if (prima !== dopo) modifiche.push({ nome: c.nome, campo: k, prima, dopo, applica: () => { if (dopo == null) delete c[k]; else c[k] = dopo; } });
    }
    if (!c.sku && v.sku) c.sku = v.sku;
  });
  varShop.forEach((v, i) => { if (!usate.has(i)) nuove.push(v); });
  return { modifiche, nuove };
}


/* Dove stanno le configurazioni con prezzo: nella pagina di lancio delle
   novità (novita.configurazioni) oppure nella scheda normale (vendita). */
export function configurazioniDi(m) {
  const nv = m && m.novita;
  if (nv && nv.stato && Array.isArray(nv.configurazioni) && nv.configurazioni.length) return nv.configurazioni;
  const v = m.vendita || (m.vendita = {});
  return Array.isArray(v.configurazioni) ? v.configurazioni : (v.configurazioni = []);
}

/* Applica allo shop le configurazioni di una macchina del catalogo.
   Ritorna { righe, cambi, errori, altre } per il resoconto. */
export function aggiornaMacchina(m, prodotto, { scrivi = false, oggi = '' } = {}) {
  const vs = varianti(prodotto);
  const conf = configurazioniDi(m);
  const { modifiche, nuove } = confronta(conf, vs);
  const vere = modifiche.filter(x => x.applica);
  const mancanti = modifiche.filter(x => !x.applica);
  if (scrivi) { vere.forEach(x => x.applica()); if (m.shop && oggi) m.shop.verificatoIl = oggi; }
  return { varianti: vs, cambi: vere.map(({ nome, campo, prima, dopo }) => ({ nome, campo, prima, dopo })), mancanti: mancanti.map(x => x.nome), altre: nuove };
}

export const URL_SHOP = /^https:\/\/www\.xtool\.eu\/products\/[\w-]+$/;

/* Prezzi per l'Italia (IVA 22 %). Lo script li chiede con il cookie
   localization=IT; il browser dell'Admin non può mandare cookie a un altro
   sito, quindi usa l'indirizzo con /it/. */
export const urlShopItalia = url => String(url).replace('https://www.xtool.eu/products/', 'https://www.xtool.eu/it/products/');
