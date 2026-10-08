# Mappa dei sistemi — INGLY

> `ARCHITECTURE.md` descrive il **motore di pubblicazione** dell'Admin.
> Questo file descrive **quali sistemi esistono nel sito**, cosa si riusa e
> cosa non c'è: due documenti diversi con due scopi diversi.

Stato al 2026-10-08. Questa mappa è il risultato dell'audit, non una
dichiarazione d'intenti: elenca quello che esiste e funziona, quello che
esiste a metà, e quello che non esiste affatto.

## Il flusso dei dati

```
                 ┌─────────────────────────────┐
                 │   data/*.json               │  ← UNICA fonte di verità
                 │   (13 file)                 │
                 └───────────┬─────────────────┘
                             │
         ┌───────────────────┼────────────────────┐
         │                   │                    │
   data-loader.js      scripts/build.mjs     admin.html
   (fetch + heal)      (genera data/*.js)    (Git Data API)
         │                   │                    │
         ▼                   ▼                    ▼
   window.INGLY        riserva per file://   un commit atomico
         │
         ├──→ MOTORI PURI (nessun DOM, testati da riga di comando)
         │     commerce.js    tipi, righe di carrello, totali, checkout
         │     collezioni.js  criteri sul catalogo
         │     lab.js         grafo materiali ↔ tecnologie ↔ macchine ↔ corsi
         │     prezzi.js      prezzi esposti o «su richiesta»
         │     stato-sito.js  contatori e manutenzione
         │     verticali.js   pagine di settore
         │     nav-ia.js      le cinque famiglie del menu
         │     faq/schema/seo/prerender-engine
         │
         └──→ DISEGNO (DOM)
               main.js → products.js, lab-ui.js, nav-mega.js, animations.js
```

**La regola che tiene insieme tutto:** un motore è una funzione pura che
riceve `D` (i dati) e restituisce un valore. Chi disegna non decide, e chi
decide non disegna. È la ragione per cui ci sono 1.200 controlli che girano
in mezzo secondo senza un browser.

## Sistemi che esistono e si riusano — NON duplicare

| Sistema | Dove | Note |
|---|---|---|
| **Carrello** | `commerce.js` + `products.js` | UNO. Cinque tipi di riga, un totale, un checkout. Non creare un secondo carrello. |
| **Pricing** | `prezzi.js` (esposizione) + `commerce.js` (totali) | L'interruttore «prezzo su richiesta» passa da qui. |
| **Checkout** | `commerce.js → adattatore()` | WHATSAPP / EMAIL / PAYMENT_LINK / EXTERNAL_CHECKOUT, scelto in Admin. |
| **Collezioni** | `collezioni.js` | Criteri, non elenchi. |
| **Publish** | `admin.html` (blob → tree → commit → ref) | Un commit atomico, con guardia anti-sovrascrittura. |
| **Media Library** | `admin.html` + `admin/media-destinazione.js` | Esiste. Da estendere con i ruoli, non da riscrivere. |
| **Prerender** | `prerender-engine.js` + `scripts/prerender.mjs` | Pagine statiche per i crawler che non eseguono JS. |
| **SEO / schema** | `seo-engine.js`, `schema-engine.js` | JSON-LD con `@graph` e `@id`. |
| **i18n** | `data/texts.json` + `T()` | IT/EN. |
| **Wishlist** | `wishlist.js` | Con punti fedeltà. |
| **Temi** | `content.json → THEMES` + `artwork.js` | 103 temi stagionali con sfondi generati. |
| **Lab** | `lab.js` + `lab-ui.js` | Materiali, tecnologie, macchine, corsi, demo. |
| **Manutenzione** | `stato-sito.js` + `app.js` | Decisa nel boot: il sito non parte affatto. |

## Sistemi nuovi, aggiunti in questa fase

| Sistema | File | Perché non si poteva riusare niente |
|---|---|---|
| **Commerce model** | `assets/js/commerce.js` | Esistevano tre forme di riga di carrello e la catena di `if` che le distingueva stava in quattro posti; in uno mancava un ramo e il checkout si fermava con un errore. |
| **Collection Engine** | `assets/js/collezioni.js` + `data/collezioni.json` | Le «collezioni» erano il campo `coll` scritto a mano su 9 prodotti su 97, in contrasto col campo `tag` sulla stessa riga. Due schede della home aprivano una griglia vuota. |

## Quello che NON esiste, malgrado le apparenze

Questo è il pezzo più importante dell'audit.

| Si direbbe che ci sia | La verità |
|---|---|
| **Un configuratore prodotto** | `renderConfigurator()` in `products.js` mostra una fila di pastiglie per la **taglia**, con un moltiplicatore di prezzo. Nessun canvas, nessun livello, nessun testo, nessuna immagine, nessuna anteprima. «Evolvere il configuratore esistente» vuol dire costruirlo. |
| **Una sezione «Personalizza»** | Non esiste. Il percorso del personalizzato oggi finisce su `/quote`, un modulo di preventivo. |
| **Il flag «personalizzabile» sui prodotti** | Non esiste in nessuno dei 97 record. La collezione `personalizzabili` è pronta e resta in **bozza** finché il dato non c'è: una voce di menu verso una pagina vuota è peggio di nessuna voce. |
| **Collection landing page** | Le collezioni oggi filtrano lo **shop** (`/shop?coll=<slug>`), con intestazione e via d'uscita. Una pagina `/collezioni/<slug>` con hero proprio non c'è ancora. |
| **Un Digital Store** | `content.json → DIG` ha 2 bundle con `id, nome, formati, prezzo, icona`. Nessuna categoria, nessun filtro, nessuna compatibilità, nessun changelog, nessun delivery provider. |
| **Academy** | La struttura c'è, il catalogo è **vuoto di proposito**: durata, programma e prezzo li decide chi eroga il corso. |
| **Comparatore macchine** | Non esiste. 4 macchine in officina su 13 in catalogo; delle 9 che non abbiamo, `specs` è vuoto, e riempirlo da un catalogo altrui sarebbe scrivere misure che non abbiamo preso. |
| **Material Finder** | `suggerisci()` in `lab.js` fa una ricerca guidata su materiale/effetto/testo. Non ha ancora le domande «che macchina usi / quale spessore / quale finitura». |
| **Usage tracking della Media Library** | Non c'è: non si sa quale immagine è usata dove, quindi non si sa quale si può cancellare. |

## Provider esterni necessari (non simulabili da un sito statico)

Il brief chiede di non fingere. Questi quattro punti **non si risolvono**
dentro GitHub Pages, e la risposta onesta è uno strato astratto con
provider sostituibili:

| Serve | Perché un sito statico non basta | Stato |
|---|---|---|
| **Consegna dei file digitali** | Un link protetto richiede un server che verifichi l'acquisto. Un link «segreto» in un sito statico è un link pubblico. | `DigitalDeliveryAdapter` da fare. Nessun download protetto simulato. |
| **Pagamento** | Nessun pagamento si processa nel browser. | `adattatore()` già pronto: `PAYMENT_LINK` / `EXTERNAL_CHECKOUT` verso Stripe, PayPal, SumUp. Serve un link, che l'Admin configura. |
| **Prenotazione demo e corsi** | Un calendario con disponibilità reale è uno stato condiviso. | `config.demo.bookingUrl` pronto e **vuoto**: nessun calendario finto. Funziona con Calendly o simili. |
| **Upload delle immagini del cliente** | Un file caricato dal cliente deve stare da qualche parte. | Da decidere nella fase Creator. Per un'anteprima locale basta il browser; per allegarlo a un ordine, no. |

## I numeri, misurati

- **13 file dati**, 97 prodotti (63 visibili), 13 categorie, 9 materiali,
  6 tecnologie, 13 macchine (4 in officina), 0 corsi pubblicati, 8 collezioni
  (7 pubblicate), 2 bundle digitali.
- **1.213 controlli automatici**, 0 falliti, nessuna dipendenza a runtime.
- **Cicli di animazione permanenti: da 4 a 0.** A pagina ferma il browser non
  riceve più richieste di fotogramma.

## Dove si rompe, se si rompe

| Se tocchi | Si rompe |
|---|---|
| `materiale.cat` | il legame con `prodotto.mat`, e la scheda materiale si svuota **in silenzio** |
| `coll`/`tag` a mano | niente: adesso le collezioni leggono il catalogo |
| la forma della riga di carrello | il carrello salvato dei clienti — `deserializza()` legge anche le forme vecchie, non toglierlo |
| `rif` di una riga | due configurazioni diverse si sommano e il cliente riceve il doppio di una e zero dell'altra |
| le rotte `/materiali/<id>` | gli indirizzi già nella sitemap e indicizzati. **Rinominarle in `/materials/` costa il posizionamento acquisito**: la scelta è commerciale, non tecnica |
