# INGLY DESIGN — Piano Admin Totale (15 ottobre 2026)

> Stato: progetto incrementale. Il piano non equivale a funzionalità già consegnate. Sorgente osservata: main `134f06e8`.

## Vincoli verificati nel repository

- `admin.html` mantiene in memoria `S`, le snapshot `SNAP` e pubblica con Git Data API in un solo commit. Il nuovo editor DEVE mutare `S` e invocare `markDirty()`; vietato il salvataggio autonomo.
- `data/*.json` sono la verità; `scripts/build.mjs` ricostruisce i fallback JS. Nuove chiavi top-level richiedono modifiche coordinate a loader, build, publish, validate-data e test.
- `data/macchine.json` contiene `macchine` (4 modelli operativi) e `catalogo` (13 modelli), con `specs: {}` per i non verificati. `data/immagini-macchine.json` contiene i metadati e URI di immagini dei produttori.
- `data/materiali.json` contiene 9 materiali e 27 varianti; prezzo e stock sconosciuti restano `null`.
- `data/digitale.json` contiene 6 bundle non pubblicati, anteprime non validate e catalogo filtrato da `digitale.js`.
- I generatori sono definiti in `generatori.html`, indicizzati in `content.json.GENERATORI`. Una voce di catalogo non implica l'esistenza del motore.

## Migrazione dei dati, senza perdita

| Area | Stato attuale | Migrazione additiva | Nuovi controlli |
|---|---|---|---|
| Materiali | `materiali[]`, `vendita.varianti[]`, `cat` usato dal catalogo prodotti | Preservare `cat`; aggiungere `stato`, `sku`, `img` e `stato` a varianti solo dove mancano; mai inventare prezzi/stock | unicità ID anche archiviati, immagini con alt IT/EN, prezzo e stock non negativi |
| Gadget | nessuna collezione dedicata | `data/gadget.json` con schemi `_modello`, esempi in bozza; aggiungere a tutti i sistemi di caricamento prima di esporre sul sito | SKU, catalogo materiale reale, stock, personalizzabilità |
| Macchine | `macchine[]` e `catalogo[]` separati; foto in file terzo | il catalogo diventa canonico; i record in officina non vanno rimossi finché i renderer legacy li usano; aggiunta campi `utilizzo`, `utilePer`, `nonUtilePer`, `fonte`, `galleria` | fonte verificabile per numeri pubblicati; `null` quando non confermati |
| Accessori | assenti | collezione `accessori[]` con riferimenti ID del catalogo, prezzi `null` | compatibilità senza ID inesistenti, fonte, alt |
| Digitali | `bundle[]` in bozza, `categorie[]` | conservare bozza finché consegna/licenza/contenuto non sono verificati; aggiungere anteprime e ordinamento non distruttivamente | dimensioni anteprime, IT/EN, licenza e consegna |
| Generatori | 7 motori interni, 2 link esterni | aggiungere algoritmi originali con test geometrici e file di produzione misurati in mm | kerf, sicurezza, unicità ID e preset |
| Popup e Aspetto | componenti differenti e font esterno | mantenere compatibilità mentre si unifica dialog; ospitare font OFL locale solo con file/licenza | focus, escape, reduced motion |
| Configuratore | rotta condizionata e preset SVG | prodotto, aree di lavoro, rendering, export produzione e ordine in fasi separate | limiti area e uso di prezzi reali |

## Protocollo di lavoro

1. Creare il motore `assets/js/admin/editor-collezione.js` che opera sull'oggetto `S` tramite callback del pannello. No API GitHub o localStorage nel modulo.
2. Introdurre le schede di editing avanzato in Lab, senza perdere l'editor esistente. Supportare creazione, duplica, archivia/ripristina, riordino, modifica ed escape.
3. Aggiornare i renderer affinché rispettino `stato: archiviato`, filtrino i numeri senza fonte, distinguano "in officina" da "assistenza".
4. Migrare l'inventario e i nuovi prodotti solo dopo aver esteso loader/validatore/build.
5. Ampliare i generatori e il configuratore con test di geometria, esportazione e sicurezza.
6. Consolidare design system, popup, fotografia, accessibilità e documentazione admin.
7. Eseguire per ogni fase `npm run build && npm test` in CI prima del merge.

## Regressioni da prevenire

- Un materiale archiviato deve sparire dall'indice pubblico, senza cancellare i dati o rompere i riferimenti storici.
- Un prezzo nullo non deve diventare €0,00; uno stock nullo non deve diventare quantità disponibile.
- Gli ID degli elementi archiviati devono restare occupati.
- L'Admin deve continuare a contare i file cambiati e pubblicarli con il flusso bozza → singolo commit.
- Le quattro macchine realmente in officina devono rimanere distinguibili da quelle del catalogo.
- `daCompletare: true` non deve produrre specifiche ipotetiche.
- Un campo IT/EN o URL inserito nell'Admin non deve iniettare HTML/script.

## Stato di consegna

Il completamento di una fase viene dichiarato solo dopo test automatici verdi e verifica del commit. Le sezioni non ancora implementate rimangono attività aperte: nessuna specifica, licenza, recensione o prezzo va pubblicata per deduzione.
