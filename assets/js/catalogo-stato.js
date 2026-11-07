/* ============ STATO DEL CATALOGO ============
   Due scelte dal pannello Admin (config.json → catalogo):

   - categorieNascoste: ["id", …] → quelle categorie spariscono dal sito
     (menu, home, shop, ricerca) e i loro prodotti diventano `hidden`.
     Si salva l'elenco delle NASCOSTE, non delle visibili: una categoria
     nuova nasce visibile, nessuno deve ricordarsi di accenderla.
   - stato: "aggiornamento" → nessun prodotto in vendita, lo shop mostra
     un pannello «Catalogo in aggiornamento» con i contatti.
   - stato: "vetrina" → i prodotti si vedono (e Google li trova), ma non si
     ordina niente online: prezzi «su richiesta» e ogni azione diventa una
     richiesta di preventivo. In cima allo shop un avviso (es. «siamo in
     fiera, rispondiamo al rientro»), scritto dall'Admin. Si vedono solo i
     prodotti con una foto vera (se la mappa MV delle immagini è disponibile).

   Lavora sugli stessi array (splice, non riassegna): chi ne tiene già un
   riferimento vede il risultato. Funzione pura sui dati, verificata in
   tests/test-catalogo-stato.mjs. Gira DOPO healData, non lo sostituisce. */

const loc = (v, L) => (v && typeof v === 'object') ? (v[L] || v.it || '') : (v || '');

export function statoCatalogo(cfg = {}, L = 'it') {
  const c = (cfg && cfg.catalogo) || {};
  const agg = c.stato === 'aggiornamento';
  return {
    aggiornamento: agg,
    vetrina: !agg && c.stato === 'vetrina',
    avviso: loc(c.avviso, L),
    nascoste: Array.isArray(c.categorieNascoste) ? c.categorieNascoste.map(String) : [],
    titolo: loc(c.titolo, L) || (L === 'en' ? 'Our catalogue is being updated' : 'Catalogo in aggiornamento'),
    messaggio: loc(c.messaggio, L) || (L === 'en'
      ? 'We are photographing and pricing the new pieces. Custom orders, quotes and the xTool Lab stay open: write to us and we reply the same day.'
      : 'Stiamo fotografando e prezzando i nuovi pezzi. Lavori su misura, preventivi e Lab xTool restano aperti: scrivici e ti rispondiamo in giornata.'),
    rientro: loc(c.rientro, L),
  };
}

export function applicaCatalogo(D = {}) {
  try {
    const s = statoCatalogo(D.CONFIG);
    const cats = Array.isArray(D.CATS) ? D.CATS : [];
    const prod = Array.isArray(D.P) ? D.P : [];
    /* mai nascondere TUTTE le categorie per sbaglio: per spegnere tutto
       c'è lo stato «aggiornamento», che mostra un pannello e non un vuoto */
    const nasc = new Set(s.nascoste.filter(id => cats.some(c => c && c.id === id)));
    if (nasc.size && nasc.size >= cats.length) nasc.clear();
    if (nasc.size) {
      for (let i = cats.length - 1; i >= 0; i--) if (cats[i] && nasc.has(cats[i].id)) cats.splice(i, 1);
      prod.forEach(p => { if (p && nasc.has(p.cat)) p.hidden = true; });
    }
    if (s.aggiornamento) prod.forEach(p => { if (p) p.hidden = true; });
    /* in vetrina si mostra solo ciò che si può guardare: un prodotto senza
       foto reale (non presente nella mappa MV delle immagini del sito)
       resterebbe un riquadro vuoto, inutile al cliente e a Google.
       Appena la foto viene caricata dall'Admin, il prodotto ricompare. */
    let senzaFoto = 0;
    /* mappa vuota o assente = non sappiamo quali foto esistono: meglio non
       nascondere niente che nascondere tutto */
    const mv = D.MV && typeof D.MV === 'object' && !Array.isArray(D.MV) && Object.keys(D.MV).length ? D.MV : null;
    if (s.vetrina && mv) prod.forEach(p => {
      if (!p || p.hidden) return;
      const im = String(p.img || '');
      if (!im || (!/^https:\/\//i.test(im) && !mv[im])) { p.hidden = true; senzaFoto++; }
    });
    D.CATALOGO = { aggiornamento: s.aggiornamento, vetrina: s.vetrina, senzaFoto, nascoste: [...nasc] };
  } catch (e) { console.warn('[INGLY] applicaCatalogo:', e); }
  return D;
}
