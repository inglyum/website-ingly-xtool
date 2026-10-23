# INGLY DESIGN — Roadmap verso la qualità di un e-commerce Shopify

**Data:** 18 ottobre 2026 · **Base misurata:** `main` @ `22e64f8`
**Metodo:** misure in Chromium (desktop 1440/1920, mobile 390, rete 4G lenta + CPU ×4 come un telefono medio),
lettura del codice, linee guida della skill *ui-ux-pro-max* (accessibilità, tocco, prestazioni, navigazione).
Ogni voce ha un **criterio di «fatto»** misurabile: niente si dichiara finito senza la misura.

---

## Dove siamo oggi (misurato)

| Area | Oggi | Riferimento Shopify | Distanza |
|---|---|---|---|
| Titolo della Home visibile su telefono (4G) | **18,0 s** | < 2,5 s | 🔴 |
| LCP su telefono (4G) | **18,3 s** | < 2,5 s | 🔴 |
| Pagina vuota e scura durante il caricamento | **~11,5 s** su telefono | 0 s | 🔴 |
| Menu durante il caricamento | **vecchio, 12 voci**, poi sostituito da quello a 5 | stabile dal primo istante | 🔴 |
| Fogli di stile caricati | **22 file · 10.104 righe · 2.518 `!important`** | 1–2 file | 🔴 |
| JavaScript | **50 file · 820 kB** (1,07–1,28 MB trasferiti) | < 200 kB critici | 🔴 |
| Richieste per aprire la Home | **107** | 30–50 | 🟠 |
| Altezza dell'header | **173 px** | 64–88 px | 🟠 |
| Prodotti visibili con foto propria | **20 su 63** | 63 su 63 | 🔴 |
| Prodotti con galleria (più foto) | **10 su 63** | tutti, 4–8 foto | 🔴 |
| Logo: la N | **non è quella originale** (diagonale accorciata) | logo fedele | 🔴 |
| Pagamento online | **no** (preventivo WhatsApp) | checkout completo | 🔴 *decisione* |
| Contrasto testi WCAG AA, giorno e notte | **0 errori** (PR #21) | 0 | 🟢 |
| Aree di tocco ≥ 44 px su mobile | **ok** (PR #21) | ok | 🟢 |
| Giorno / notte | **funziona** (entrambi gli interruttori) | ok | 🟢 |

**La causa principale della sensazione «non fluido, sempre uguale»** non è un singolo difetto di grafica: è che il
sito si costruisce *dopo* aver scaricato 1 MB di JavaScript e 22 fogli di stile che si sovrascrivono a vicenda
(2.518 `!important`). Finché resta così, ogni miglioramento grafico si vede tardi, a scatti, e può essere annullato
dal foglio successivo.

---

## FASE 0 — Prima impressione (1 settimana) · *la priorità assoluta*

| # | Cosa | Perché | Fatto quando |
|---|---|---|---|
| 0.1 | **Logo originale vettorializzato** (N con la diagonale lunga, I separata) | Oggi la N è «normalizzata». Pronto un SVG tracciato dal file originale: serve solo la conferma, perché un test del progetto vieta proprio quella diagonale (fu tolta su richiesta in passato) | header, footer, Admin e favicon usano lo stesso SVG; confronto visivo con l'originale |
| 0.2 | **Menu definitivo scritto nell'HTML** (5 voci), non il vecchio a 12 | È quello che si vede nei primi secondi | senza JavaScript il menu è già quello giusto |
| 0.3 | **Titolo, testo e bottoni dell'Hero scritti nell'HTML** | Oggi li scrive il JavaScript dopo aver caricato tutto: 18 s su telefono | titolo visibile < 1,5 s su 4G |
| 0.4 | **Uno scheletro al posto del vuoto** per le sezioni che dipendono dai dati | Mai una pagina nera vuota | nessun fotogramma «vuoto» nella registrazione del caricamento |
| 0.5 | **Caricare prima solo ciò che serve sopra la piega** (CSS critico in linea, resto differito; JS non critico `defer`) | 107 richieste per la Home | LCP < 2,5 s su 4G, CLS < 0,1 |

## FASE 1 — Fondamenta del design (2 settimane)

| # | Cosa | Fatto quando |
|---|---|---|
| 1.1 | **Un solo foglio di stile** generato da sorgenti ordinate (token → base → componenti → pagine), al posto dei 22 file | 1–2 file CSS, `!important` < 50, confronto dello stile calcolato prima/dopo senza differenze non volute |
| 1.2 | **Design system unico**: palette (Titanium, Graphite, Warm White, Champagne), scala tipografica, spaziature, raggi, ombre, durate (150–300 ms) | una pagina interna «catalogo componenti» con bottoni, card, input, badge, in giorno e notte |
| 1.3 | **Una famiglia per i titoli, una per i testi** (oggi convivono Josefin, Exo 2 e altre) | 2 font, caricati con `font-display:swap` e preload |
| 1.4 | **Header compatto** 64–88 px, che si riduce scorrendo | misura in Chromium |
| 1.5 | **JavaScript in un pacchetto per pagina**, il resto su richiesta | < 200 kB per aprire la Home |

## FASE 2 — Navigazione come uno shop (2 settimane)

| # | Cosa | Fatto quando |
|---|---|---|
| 2.1 | **Ricerca predittiva**: si scrive «targa» e compaiono prodotti, categorie e materiali con foto | risultati < 100 ms, tastiera e lettore di schermo ok |
| 2.2 | **Mega menu con immagini** per Shop (categorie + collezioni in evidenza) | ogni voce porta direttamente alla pagina |
| 2.3 | **Briciole di pane** (Home › Categoria › Prodotto) su tutte le pagine profonde | presenti e in JSON-LD |
| 2.4 | **Barra inferiore mobile** con 4–5 azioni (Shop, Cerca, Personalizza, Carrello, Menu) | tocco ≥ 44 px, non copre i contenuti |
| 2.5 | **Indietro del browser sempre prevedibile**, filtri e pagina conservati | test automatici di navigazione |

## FASE 3 — Catalogo e collezioni (2 settimane)

| # | Cosa | Fatto quando |
|---|---|---|
| 3.1 | **Pagine collezione con filtri a faccette**: categoria, materiale, prezzo, occasione, personalizzabile — con il numero di risultati accanto | filtri combinabili, indirizzo condivisibile |
| 3.2 | **Ordinamento** (novità, prezzo, più richiesti *solo con dati reali*) | — |
| 3.3 | **Card prodotto uniformi**: stesso formato foto, nome su 2 righe, prezzo, badge «personalizzabile», seconda foto al passaggio | griglia 2 colonne su mobile, 4 su desktop |
| 3.4 | **Anteprima rapida** dalla griglia | apre senza cambiare pagina |

## FASE 4 — Scheda prodotto da e-commerce (3 settimane)

| # | Cosa | Fatto quando |
|---|---|---|
| 4.1 | **Galleria**: 4–8 foto vere, zoom, scorrimento col dito, video facoltativo | 63/63 prodotti con galleria |
| 4.2 | **Scelta varianti** (materiale, misura) con prezzo che si aggiorna | prezzo coerente nel carrello e nel messaggio d'ordine |
| 4.3 | **Anteprima della personalizzazione** (testo/nome sul prodotto) | prima dell'ordine il cliente vede il risultato indicativo |
| 4.4 | **Bottone «Aggiungi» fisso in basso su mobile** | sempre raggiungibile |
| 4.5 | **Tempi e spedizione verificati** dal titolare, resi e garanzie | nessuna promessa non confermata |
| 4.6 | **Prodotti correlati** e «completa il regalo» | — |

## FASE 5 — Carrello e acquisto (2–3 settimane) · *richiede una decisione*

Oggi l'ordine passa da un **preventivo WhatsApp**. Un e-commerce «come Shopify» vuol dire **pagare online**.
Tre strade, in ordine di consiglio:

| Opzione | Cosa vuol dire | Pro | Contro |
|---|---|---|---|
| **A. Stripe Payment Links / Checkout** sul sito attuale | il sito resta su GitHub Pages; il pagamento lo gestisce Stripe | costi solo a transazione, nessun canone, si integra con quello che esiste | i prodotti personalizzati vanno gestiti con note/campi dell'ordine |
| **B. Shopify Buy Button** sul sito attuale | carrello e checkout di Shopify dentro le nostre pagine | checkout Shopify vero, gestione ordini Shopify | canone Shopify, catalogo da tenere sincronizzato |
| **C. Migrare il negozio su Shopify** | il negozio diventa Shopify, il sito INGLY resta per contenuti/Lab | tutto Shopify (tema, app, pagamenti) | canone, migrazione, si perde parte del sistema attuale |

**Consiglio: A** per partire (veloce, senza canone, nessuna riscrittura), con **carrello a cassetto** laterale,
riepilogo, spedizione gratuita sopra €79 calcolata davvero e checkout Stripe. Il preventivo WhatsApp resta per
B2B e lavori su misura.

## FASE 6 — Contenuti e fiducia (continua, in parallelo)

| # | Cosa | Chi |
|---|---|---|
| 6.1 | **Foto vere** per i 43 prodotti senza foto propria; set coerente (sfondo, luce, 3–4 angolazioni) | **titolare** (scatti) + sito (pubblicazione dall'Admin) |
| 6.2 | **Recensioni reali** (Google Business / clienti) — oggi la sezione è nascosta in attesa di verifica | titolare |
| 6.3 | Pagine **Spedizioni, Resi, Garanzia, Contatti, Chi siamo** con dati veri; P.IVA, privacy e cookie | titolare + sito |
| 6.4 | Moduli **Formspree** collegati (oggi preventivo e newsletter non arrivano a nessuno) | titolare (3 indirizzi) |
| 6.5 | Decidere la categoria **«Supereroi e Anime»** (marchi DC/Marvel) | titolare |

## FASE 7 — Qualità continua (sempre)

| # | Cosa | Fatto quando |
|---|---|---|
| 7.1 | **Budget di prestazioni in CI**: la PR fallisce se LCP mobile > 2,5 s o il JS supera la soglia | controllo automatico attivo |
| 7.2 | **Prove su telefoni veri** (iPhone + Android medio) a ogni rilascio grafico | registro delle prove |
| 7.3 | **Statistiche** (visite, aggiunte al carrello, conversione) rispettose della privacy | dati per decidere, non supposizioni |
| 7.4 | Contrasto, tocco, tastiera, movimento ridotto: **i test aggiunti nella PR #21 restano obbligatori** | 0 errori |

---

## Una condizione per riuscirci: un solo direttore lavori

Sul repository lavorano in parallelo **due assistenti** (gli «Sprint 16–22» e queste PR). Il risultato si vede nei
numeri: 22 fogli di stile, ognuno scritto per correggere il precedente, 2.518 `!important`, un test che vieta la N
originale mentre ora la si chiede. Con due mani sugli stessi file ogni miglioramento rischia di essere annullato.

**Proposta:** un solo assistente responsabile di grafica e struttura (Fasi 0–4); l'altro, se serve, su compiti
separati (dati, Admin, generatori). Le Fasi 0 e 1 vanno fatte **prima** di qualunque nuovo ritocco estetico,
altrimenti si continua a dipingere sopra le crepe.

---

## Ordine consigliato

1. **Fase 0** (logo, menu e Hero nell'HTML, caricamento) — è ciò che il cliente vede per primo.
2. **Fase 1** (un solo CSS, un design system) — senza questa ogni miglioramento resta fragile.
3. **Fase 5, decisione** sul pagamento — determina come si costruiscono carrello e scheda prodotto.
4. **Fasi 2 → 3 → 4** — navigazione, catalogo, scheda prodotto.
5. **Fase 6** in parallelo per tutto il tempo — senza foto vere nessun tema sembra Shopify.
