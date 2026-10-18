# Sprint 21 — INGLY Premium Laser / Loader / N: verifiche per il lancio

## Implementato in questo sprint
- Evidenziazione oro: tracciato singolo CSS `ingly-gold-trace` limitato al titolo; riduzione movimento supportata; niente animazioni perpetue.
- Loader: glass/smoked panels, glow beam e progress bar più contenuti; anteprima opt-in tramite `?loaderPreview`, normale visita senza loader; durata massima preview cap 1.9 s.
- Nessun cambiamento a catalogo, Admin o logica di vendita.

## Checklist obbligatoria per risolvere realmente la N
1. Confrontare la foto di riferimento approvata con `assets/images/ingly-wordmark-master.svg` ad alto zoom. I tre SVG attuali condividono la STESSA geometria `ingly-original-ngly`: un cache bust da solo NON corregge una geometria errata.
2. Richiedere approvazione del profilo esatto della N: triangoli terminali, diagonale, altezza e distanze I-N. **Non asserire che la sagoma sia stata corretta senza approvazione visiva.**
3. Correggere il master vettoriale una sola volta, quindi derivare `ingly-wordmark-light.svg` e `ingly-wordmark-dark.svg` modificando solo tinta; test identità `d` dei path SVG.
4. Verificare che header, footer watermark, footer piccolo e Admin utilizzino lo stesso asset master/derivato e nessuna scritta alternativa o clip involontaria.
5. A geometria approvata, cambiare query `?v=` per gli asset sia in `index.html` sia in `admin.html`; aggiornare le aspettative dei test.
6. Se serve svuotamento PWA, allineare **insieme** `CACHE_VER` in `sw.js` e `CACHE_WANT` + `FLAG` in `index.html` e aggiornare i test; evitare delete di cache non-INGLY o ripetuti reload.
7. QA su browser pulito e con service worker precedente, mobile chiaro/scuro, ritorno da back-forward cache; prendere screenshot a larghezza e altezza uguali di header/footer e confrontarli.
8. Merge solo dopo QA verde, visual audit verde, e conferma Pages sul commit effettivamente servito.

## Gate di qualità
- Verificare l'evidenziazione reale sul testo in entrambe le lingue: l'HTML di titolo è aggiornato dinamicamente; l'effetto non deve coprire lettere e pulsanti.
- Nel loader preview il focus Salta funziona; sui normali caricamenti non appare overlay, non c'è blocco scorrimento e non parte il canvas.
- Preferenze reduced motion rispettate, mobile senza dropped frame e senza layout shift misurabile.
