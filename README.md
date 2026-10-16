# INGLY DESIGN — E-commerce e Admin CMS

Sito ufficiale INGLY DESIGN: creazioni personalizzate, lavorazioni laser e tecnologie di fabbricazione. Il progetto pubblicato è **statico su GitHub Pages** e usa un **CMS Git-based** per gestire e pubblicare i dati del catalogo. Questa guida descrive l'architettura attuale, non le precedenti demo.

## Link operativi (riferimenti da conservare)

| Risorsa | Collegamento | Utilizzo |
| --- | --- | --- |
| Repository e codice sorgente | [inglyum/website-ingly-xtool](https://github.com/inglyum/website-ingly-xtool) | Branch principale `main`, codice e pull request |
| Sito online | [INGLY DESIGN](https://inglyum.github.io/website-ingly-xtool/) | Ultima versione pubblicata su GitHub Pages |
| Admin Panel | [INGLY Admin](https://inglyum.github.io/website-ingly-xtool/admin.html) | Catalogo, categorie, immagini, contenuti e bozze |
| GitHub Actions | [Build, QA e deploy](https://github.com/inglyum/website-ingly-xtool/actions) | Test automatici, browser audit, WCAG e pubblicazione |

Pagine correlate: [Generator Studio](https://inglyum.github.io/website-ingly-xtool/personalizza), [Machine Lab](https://inglyum.github.io/website-ingly-xtool/macchine), [Shop](https://inglyum.github.io/website-ingly-xtool/shop/).

## Architettura attuale

- `index.html`: shell del negozio pubblico, navigazione e sezioni.
- `admin.html`: editor del CMS con stato in bozza, Media Library e pubblicazione controllata tramite GitHub.
- `data/products.json`, `data/categories.json`, `data/config.json`: dati e configurazione del catalogo.
- `data/immagini.json`: inventario generato dei file presenti in `img/`; **non** va riempito con percorsi inventati.
- `assets/js/products.js`, `assets/js/commerce.js`, `assets/js/stock-guards.js`: logica Shop, carrello e disponibilità.
- `assets/js/admin/`: gestione fotografica, associazione SKU, foto mancanti e destinazioni.
- `assets/css/brand-system-2026.css`, `assets/css/admin-brand-system.css`: design system pubblico/Admin, temi Giorno e Notte.
- `generatori.html`, `print-cut.html`, `assets/js/print-cut-kernel.js`: strumenti di progettazione e SVG Print & Cut.

La pubblicazione dall'Admin usa il repository GitHub come sorgente dei dati. Evitare database o backend paralleli non autorizzati e non modificare prezzi, stock, prodotti o immagini senza verifiche.

## Sviluppo e test

Usare Node.js e i comandi previsti dal progetto:

```bash
npm ci
npm run build
npm test
```

Per il server locale: `npm run serve`. Prima di integrare una modifica: verificare build, test, workflow della PR e assenza di regressioni. La pubblicazione del sito è completata **solo** quando GitHub Pages conferma un deploy riuscito.

Le verifiche automatizzate comprendono controlli dati, geometria responsive Chromium, navigazione da tastiera, contrasto e scansioni axe-core. **Non costituiscono certificazione WCAG 2.2 AA**: sono ancora necessari test manuali su Safari/iPhone, Android/Chrome, VoiceOver, TalkBack, NVDA e zoom.

## Limitazioni commerciali e fotografie

- Il checkout attuale prevede richiesta/ordine via **WhatsApp**; non è una piattaforma di pagamento online transazionale.
- Audit inventario del **16 ottobre 2026**: **97 schede prodotto**, **77 copertine non presenti nel manifest**, di cui **43 riferite a schede pubbliche**. Sono dati di censimento, da ricalcolare dopo nuovi upload e pubblicazioni.
- La disponibilità di un percorso o di un file non dimostra automaticamente che la foto ritragga l'articolo venduto. Non sostituire fotografie reali con contenuti sintetici presentati come prodotti fabbricati.
- L'output del Generator Studio / Print & Cut richiede controlli di scala, kerf, tolleranze e prove fisiche sulla macchina prima della produzione.

## Documentazione tecnica

- [Roadmap corrente](docs/ROADMAP-INGLY-2026.md)
- [Architettura](docs/ARCHITECTURE.md)
- [Design system](docs/INGLY-DESIGN-SYSTEM.md)
- [CMS e pubblicazione](docs/ADMIN.md)
- [Commerce](docs/COMMERCE.md)
- [Protocollo di accessibilità reale](docs/ACCESSIBILITY-MANUAL-QA.md)
- [Catalogo foto mancanti](docs/CATALOGO-FOTO-DA-CARICARE.md)
- [Ripristino e recovery](docs/RIPRISTINO.md)

Per ogni sviluppo rilevante: partire dall'ultimo `main`, creare un branch, aprire una PR, verificare QA e deploy, aggiornare la roadmap. Il brand deve rimanere **INGLY DESIGN** con la **I** iniziale completa e il logo originale.
