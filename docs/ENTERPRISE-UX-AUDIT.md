# INGLY DESIGN — Enterprise UX Audit

**Data:** 2026-10-14 · **Base:** `ff353ed` (main) · **Metodo:** ispezione del repository, 24 rilevazioni Playwright
(Home / Business / Shop × 390 / 768 / 1440 / 1920 px × giorno / notte), sito servito in sottocartella come su
GitHub Pages. Screenshot «prima» conservati fuori dal repository (scratchpad di sessione).

Questo documento elenca **solo ciò che è stato misurato o letto nel codice**. Dove un fatto non è verificabile
da qui è scritto, non supposto.

---

## 0. Stato di partenza

| Voce | Valore misurato |
|---|---|
| Test automatici | **1624 controlli, 0 falliti** (24 suite) |
| Errori JavaScript | **0** su tutte le 24 combinazioni |
| Prodotti | 97 totali · **63 visibili** · 34 nascosti |
| Categorie | 13 (+ 1 con id generato automaticamente, vedi §4) |
| Visibili senza prezzo | 0 |
| Visibili senza foto | 0 |
| Personalizzabili | 53 su 63 |
| Contatori statistici | tutti `null` → non mostrati (corretto: nessun numero inventato) |
| File SVG nel repository | 31 |
| Fogli di stile | 9 file, **4.440 righe** |

Tra la mia sessione precedente (`ec19133`) e questa base ci sono **94 commit** del titolare. Questo audit
parte dallo stato attuale, non dalla memoria di quello precedente.

---

## 1. Difetti misurati

### A1 · CRITICO — L'identità cromatica è petrolio/verde, e la decidono tre file in conflitto
- **Misura:** `--paper` in modalità notte = `#071c22` (petrolio). 190 valori verdi/petrolio scritti a mano
  nei CSS: **180 in `pages.css`**, 12 in `premium-2026.css`.
- **Causa:** tre file dichiarano di possedere la palette.
  1. `variables.css` definisce i token (blu/oro).
  2. `pages.css:1213-1711` — blocco *«PETROLIO PROFONDO / TITANIO / CHAMPAGNE»* (commit `6cb87ee`) — **ridefinisce
     gli stessi token `:root`** in fondo a un foglio *di pagina*, e contiene a sua volta **due** set di token
     concorrenti (`--brand-petrol-*` a riga 1218, `--ingly-*`/`--bg`/`--surface` a riga 1528) più ~400 righe di
     override di componente con colori scritti a mano e `!important`.
  3. `premium-2026.css` si sovrappone a entrambi.
- **Impatto:** il brief vieta il verde come tema dominante; ogni ritocco futuro rischia di vincere o perdere
  la cascata a seconda dell'ordine di caricamento.
- **Correzione (Fase 1):** un solo file di token, caricato per ultimo, che ridefinisce *ogni* nome di token in
  uso sulla palette del brief; i valori verdi scritti a mano riportati ai ruoli neutri; un test che impedisce
  al verde di tornare.

### A2 · ALTO — Scorrimento orizzontale sulla Home a 768, 1440 e 1920 px
- **Misura:** documento più largo della finestra di **106 px** (768) e **198 px** (1440), in entrambe le modalità.
- **Causa:** `pages.css:1483` — `.hero{overflow:visible!important}` annulla l'`overflow:hidden` dichiarato in
  `layout.css:63` e `premium-2026.css:79`. Il livello decorativo `.hero-bg` (assoluto, `inset:0`) contiene un
  blob a x=1520 sfocato di 75 px che esce dalla pagina. Verificato per esclusione: nascondendo `.hero-bg`
  l'eccedenza va a **0**.
- **Correzione (Fase 1):** il livello decorativo ritaglia le proprie decorazioni (`.hero-bg{overflow:hidden}`).
  Uno sfondo non deve mai influire sull'impaginazione.

### A3 · ALTO — Cinque immagini SVG non valide → immagini rotte ✅ CORRETTO
- **Misura:** su Business a 1440/1920 la card *Hotel e B&B* mostrava un'immagine rotta.
- **Causa:** `&` non codificata nel testo XML. `hotel.svg` (`aria-label="…Hotel e B&B"`) e, con lo stesso
  difetto, **tutte e quattro le copertine dei File digitali** `cover-101…104.svg` («Decor & laser cut»,
  «Form & Volume»…): il browser rifiuta di decodificarle.
- **Correzione:** `&` → `&amp;` solo dove non è già un'entità. 31/31 SVG ora validi. Aggiunto test che
  verifica la validità XML di ogni SVG del repository.

### A4 · ALTO — Nomi di aziende presentati come clienti, non verificati
- **Dove:** `index.html:689`, Business: *«TRENTO SPA · VELLUTO · FORNARI GROUP · ADRIATICA · NOVA TECH · CASA MIA»*.
- **Impatto:** il brief chiede «solo partnership verificate». Non esiste nei dati alcuna prova che queste
  aziende siano clienti; un'affermazione commerciale non verificabile su una pagina B2B è un rischio di fiducia
  e potenzialmente legale.
- **Correzione (Fase 3):** striscia rimossa dalla pagina finché i nomi non sono confermati dal titolare.
  Se sono clienti reali basta rimetterli dall'Admin.

### A5 · MEDIO — Una fascia vuota di ~40 px fra topbar e menu
- **Misura:** visibile su Business a 1920 px, sotto la barra superiore.
- **Correzione:** verificata e ridotta in Fase 1 insieme alla consolidazione dei token di layout.

---

## 2. Decisioni del titolare necessarie (non le prendo io)

| # | Tema | Perché non lo decido |
|---|---|---|
| D1 | **Categoria «Supereroi e Anime»**: 5 figure di Batman, Hulk, Spider-Man, Flash | Personaggi DC/Marvel, marchi registrati. Il brief stesso dice «solo contenuti adeguatamente licenziati». Non posso verificare una licenza: **rischio legale segnalato, prodotti non toccati.** |
| D2 | Id categoria `nuova-ms3k34dc` | Generato in automatico. Rinominarlo romperebbe i link esistenti (`/shop?cat=…`). Va fatto con un reindirizzamento, solo se lo vuoi. |
| D3 | Striscia clienti Business (A4) | Se le aziende sono clienti veri, servono conferma e preferibilmente il loro consenso all'uso del nome. |

---

## 3. Risorse del brief non disponibili in questa sessione

I tre archivi citati al §3 del brief — `medusa-develop(3).zip`, `Bundle-2023-v1.0.0(2).zip`,
`INGLY-Asset-Fotografici-Specifici.zip` — **non sono presenti**: il container è stato ricreato e i file non
sono stati caricati qui. Conseguenze:

- Lo studio Medusa si basa sul **modello dati pubblico** di Medusa (Product, ProductVariant, ProductCategory,
  ProductCollection, ProductImage, SalesChannel, PriceList, Cart, Region). **Nessuna riga di codice copiata.**
- Nessun tema Shopify commerciale è stato copiato; si usano solo pattern di interazione generali.
- Le foto specifiche dell'archivio asset non sono utilizzabili finché non vengono caricate.

---

## 4. Architettura esistente da preservare

| Sistema | File | Nota |
|---|---|---|
| Rotte | `assets/js/rotte.js` | unica mappa, genera anche `404.html` e prerender |
| Carrello / prezzi | `assets/js/commerce.js` | un solo modello di riga per 5 tipi |
| Collezioni | `assets/js/collezioni.js` | criteri, non liste |
| File digitali | `data/digitale.json` + `digitale.js` | consegna come condizione tecnica |
| Navigazione | `nav-ia.js`, `nav-mega.js` | nome = link, freccia = bottone separato |
| CMS | `admin.html` | pubblicazione atomica Git Data API, `validaBozza()` |
| Auto-riparazione | `healData()` in `data-loader.js` | REGOLA 8, mai indebolire |

Architettura di backend: **resta statica su GitHub Pages.** Un server Medusa non gira su Pages; un'eventuale
migrazione richiede hosting, database e pagamenti reali e va decisa separatamente (vedi `docs/` alla Fase 6).

---

## 5. Avanzamento

| Fase | Stato |
|---|---|
| 0 · Audit | ✅ questo documento · A3 corretto · 107 pagine d'ingresso rigenerate |
| 1 · Design system | ✅ vedi §6 |
| 2 · Home | ✅ vedi §7 |
| 3 · Business | da fare |
| 4 · Commerce | da fare |
| 5 · CMS | da fare |
| 6 · SEO / QA / rilascio | da fare |

---

## 6. Fase 1 — Design system: risultato misurato

| Misura (24 combinazioni pagina × viewport × modalità) | Prima | Dopo |
|---|---|---|
| Fondo notte (`--paper`) | `#071c22` petrolio | `#111318` Titanium |
| Fondo giorno | `#faf9f6` | `#F8F7F4` Warm White |
| Pagine con scorrimento orizzontale | 6 | **0** |
| Immagini rotte | 4 | **0** |
| Errori JavaScript | 0 | 0 |
| Testi sotto WCAG AA (casi distinti, 7 pagine × 2 modalità) | 57 sul sito pubblicato | **1** (la striscia clienti A4, rimossa in Fase 3) |
| Colori verdi/blu scritti a mano nei CSS | 618 | **0** |
| Fonti della palette | 3 fogli + 1 funzione JS | **1** (`assets/css/tokens.css`) |

**Come.** `tokens.css` è l'unica fonte e si carica per ultimo; tutti i 78 nomi di token storici restano
definiti ma puntano ai ruoli nuovi. I 618 colori scritti a mano sono stati convertiti alla stessa luminanza
(quindi lo stesso contrasto) senza la tinta (`scripts/neutralizza-colori.mjs`). 209 dichiarazioni di token
morte e 8 blocchi vuoti tolti da `pages.css` (1.893 → ~1.700 righe), **verificato con un confronto dello stile
calcolato di 72.380 elementi: 0 differenze**. I 33 sfondi a gradiente sovrapposti e 7 definizioni duplicate del
bottone principale ridotti a un valore ciascuno.

**Due correzioni rispetto alla palette del brief**, perché il brief chiede anche WCAG AA: il testo secondario
non usa `#777B83` (3,96:1) ma `#5F636B` di giorno e `#A3A7AE` di notte; l'oro come testo di giorno non usa
`#C5A46D` (2,20:1) ma `#836538` (≥ 4,64:1 su ogni superficie chiara).

**Difetti trovati lungo la strada**
- **P0 sul sito pubblicato:** dalla Home, cliccando un prodotto la scheda non si apriva (`TypeError`).
  `applyConfig()` riscriveva il testo di ogni link `mailto:`, compreso il bottone «Richiedi via email», e la
  scheda successiva cercava uno `<span>` che non c'era più. Corretto alla radice + test di regressione.
- Il menu non restava in vista e lasciava un buco di 36 px: uno `style="top:36px"` scritto nell'HTML e un
  `position:relative` aggiunto per lo z-index. Ora `position:sticky`.
- Il tema «default» scriveva in linea blu notte e blu su `<html>`: nessun foglio di stile poteva cambiarli.
- Card fotografiche con testo bianco su card bianca finché la foto pigra non arriva (1,00:1).
- `--accent` era usato in ~18 punti ma non era mai stato definito.

---

## 7. Fase 2 — Home

Ordine del brief: **hero · categorie · in evidenza · personalizza · materiali · soluzioni (Business, xTOOL Lab,
Academy) · metodo in 5 passi · lavori recenti · dal laboratorio · newsletter.**

- Hero: «Le idee prendono forma.» — titolo modificabile dall'Admin («Titolo»), frase del marchio sopra.
  Bottoni «Scopri le creazioni» / «Crea il tuo progetto».
- Nuovo percorso di personalizzazione in 5 passi. Il passo 2 dice **«inviaci la grafica»**, non «carica»: il sito
  non ha un posto dove salvare i file dei clienti.
- Nuovo blocco Soluzioni con le card esistenti di Business, xTOOL Lab, Academy.
- Metodo in 5 passi dai dati (Admin): tolta la promessa «la maggior parte parte entro 3 giorni», non verificata.
- Tolte dalla Home: striscia scorrevole delle tecnologie e blocco «Sei tecnologie» (restano su /tecnologie).
- Tolte promesse non mantenibili: «−10% sulla tua prima incisione» (newsletter senza endpoint) e «le più scelte»
  (nessun dato di vendita che lo dimostri — lo ha segnalato un test esistente).
- Corretti: griglia materiali alta 2.458 px (un `height="800"` nell'HTML batteva l'`aspect-ratio`), passi del
  metodo che andavano a capo 4+1.
- Misure: 0 errori JS, 0 scorrimento orizzontale a 390/768/1440, contrasto invariato.
