# Sprint 02 — P0 service-worker media freshness (16 ottobre 2026)

## Problema
`sw.js` dichiarava "Cache-first (30gg)" per tutti gli SVG e WebP senza
implementare una scadenza. Il master INGLY e le fotografie pubblicate
dall'Admin mantengono lo stesso URL: l'immagine vecchia restava nella cache
del dispositivo anche dopo aver aggiornato il sito.

## Correzione
- `CACHE_VER` portato a **ingly-v15**, insieme a `CACHE_WANT` e al flag
  di recovery dell'HTML.
- Percorsi `img/` e `assets/images/`: network-first con fallback alla
  cache solo se la rete non risponde. Le immagini a URL davvero immutabili
  continuano con cache-first.
- CSS/JS, HTML e JSON mantengono le strategie network-first già validate.
- L'installazione PWA, il footer e le 16 prove browser restano invariati.

## Accettazione
1. Aggiornamento online di uno SVG o di una foto reale allo stesso URL.
2. Cache attiva e visita successiva: l'asset nuovo deve comparire con rete.
3. Offline: disponibile l'ultima immagine precedentemente caricata.
4. Verificare su Android Chrome/iOS Safari reali; il test statico non sostituisce
   collaudo di installazione/upgrade Service Worker su device fisici.
