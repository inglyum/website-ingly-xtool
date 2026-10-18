# INGLY DESIGN — Lancio commerciale: gate verificabili
Data audit: 2026-10-18. Stato confermato su main al commit `90f5dd781d35da9ef7955b774d1afc3adcbc2bbc`.

## Stato confermato
- Sprint 17 PR #105 merged. GitHub Pages, QA e visual browser audit sul commit 90f5dd78: SUCCESS.
- Catalogo dati `data/products.json`: 97 record. `data/immagini.json`: 288 nomi file, NON 288 cover SKU garantite.
- Manifest M2 contiene URL remoto ufficiale xTool e nota di provenienza; il caricamento reale e i diritti commerciali vanno ricontrollati.
- Il sito resta un percorso di richiesta preventivo/WhatsApp: **checkout e pagamenti non risultano certificati**.
- Non equiparare test CI/jsdom/Chromium a un ordine reale o una prova su macchina fisica.

## Gate P0: impediscono dichiarazione di lancio commerciale completo
| Gate | Criterio di accettazione | Evidenza richiesta | Stato |
| --- | --- | --- | --- |
| Admin publish | Su ambiente di test protetto: modificare prodotto e media, verificare anteprima, pubblicare e controllare hash/URL, poi ripristinare | screenshot privati, SHA commit e checksum media | OPEN |
| Ripristino foto storiche | Modifica + restore di immagini realmente binarie senza perdere dati, nessuna cancellazione non autorizzata | confronto checksum e nuova pubblicazione test | OPEN |
| Catalogo media | Ogni SKU effettivamente pubblicato ha cover autentica, alt e diritti documentati | report SKU-cover + revisione proprietario | OPEN |
| Ricezione preventivi | Invio prova privato/B2B su endpoint configurato e conferma ricezione esterna | ID richiesta, recapito, privacy, stato | OPEN |
| Navigazione mobile | Home/Shop/Prodotto/Personalizza/Admin senza overlay, sovrapposizioni o tap errati su iPhone e Android reali | checklist per device | OPEN |
| Legal/privacy | Cookie, privacy, condizioni, contatti e diritti media rivisti rispetto al flusso attivato | approvazione titolare/consulente | OPEN |

## Gate P1: qualità, non introdurre blocchi gratuiti
1. Misurare LCP p75 <= 2.5s, INP p75 <= 200ms, CLS p75 <= 0.1 su dispositivi reali, su rete reale. Distinguere lab Lighthouse da Core Web Vitals sul campo.
2. Cercare CSS e JS duplicati con report Sprint 17 prima di rimuovere; misurare sempre baseline/diff post-intervento. Preferire route-level lazy loading solo dove dimostrato sicuro.
3. Ricerca Shop: test zero risultati, 2+ parole, typo, categorie, tasti freccia, Escape, Enter, schermo mobile.
4. Foto xTool M2: test network/csp/onerror e fallback reale. M2 informativa, non in officina.
5. Generatori: export mm 1:1, bounding box, font-to-path, kerf, CUT/SCORE/ENGRAVE, prova fisica con materiale noto e tolleranze documentate.
6. Accessibility: tastiera completa, focus, lettore schermo, light/dark contrasto WCAG AA, reduced motion.

## Principi di rilascio
- Un intervento per PR, test unit + E2E + QA + browser + Pages; annotare SHA.
- Non cambiare prezzi, SKU, stock, pubblicazione, token o binari reali senza test e autorizzazione.
- CSS brand-system resta ultima autorità; logo master originale immutato.
- Effetti solo CSS compositor-friendly, senza rAF continuo o video autoplay; font fallback locale, CSS ridotto, immagine LCP prioritaria e lazy solo sotto la piega.
- Rollback immediato al precedente SHA in caso di regressioni.
- Percentuali di completamento sono indicative e non equivalgono al superamento dei gate.

## Prossimo sprint raccomandato
**Sprint 19 P0 commerciale:** inventario SKU pubblicati vs cover e URL veri; miglioramento UX Media Library senza mutare catalogo. In parallelo predisporre collaudo Admin con credenziali solo nell'interfaccia autorizzata, mai nei file o in chat.
