# INGLY DESIGN — Roadmap operativa dopo la correzione del brand

## Sprint 06 — Sicurezza eliminazione Media Library (16 ottobre 2026)
- Prima della pubblicazione l'Admin verifica ogni file selezionato per eliminazione: se è ancora referenziato, produce un **errore bloccante**, non un semplice avviso di conferma.
- Copertura estesa a prodotti, gallery, categorie, materiali, macchine xTool, anteprime digitali, corsi Academy e immagine principale Home, oltre ai riferimenti già supportati.
- La correzione non cancella immagini e non modifica i dati commerciali. Riassegna prima un'immagine o annulla l'eliminazione, poi ripubblica.
- Test con riferimenti simulati nelle varie sezioni e verifica del blocco durante la pubblicazione. Rimane QA manuale di caricamento/rollback immagine e revisione delle fonti reali.



## Sprint 05 — Cronologia Admin: ripristino atomico dei dati (16 ottobre 2026)
- La precedente funzione ignorava file non disponibili e poteva mescolare dati di commit diversi: ora richiede tutti i 14 JSON, validati prima di modificare la bozza.
- Commit storico incompleto: nessuna modifica; un errore descrive i file non recuperabili. Upload/eliminazioni media in staging bloccano il ripristino.
- Modifiche dati in bozza: conferma aggiuntiva. La cronologia ripristina solo una nuova bozza, mai la versione online automaticamente.
- I file binari non vengono ripristinati; serve ancora collaudo E2E con repository di prova, immagini vere e checksum.
- Test automatico rollback-safety inserito nella suite CI.



## Sprint 04 — Sostituzione delle foto demo senza metadati falsi (16 ottobre 2026)
- Upload categoria/materiale: chi sostituisce una foto stock dalla Media Library non eredita fotografo, fonte Pexels, licenza o dimensioni della foto precedente.
- L’immagine è marcata come **originale dichiarato dal titolare**, non come prova di autenticità verificata da terzi.
- Copertura test modificata: gli originali inseriti dall'Admin sono consentiti al posto delle 22 foto demo iniziali, purché il percorso locale esista e gli alt IT/EN siano presenti.
- La lista delle fonti storiche Pexels resta disponibile per attribuzioni di immagini ancora demo; nessun prodotto, prezzo o stock modificato.
- È ancora necessario un collaudo reale del caricamento singolo, della scelta da Library, del commit e del rollback.



## Sprint 03 — Asset xTool premium con logo autentico
- Tessera xTool Service Centre con sfondo tecnico verde/blu e tracciati INGLY originali, I inclusa.
- Asset e CSS confinati alla sezione Macchine, con percorso nuovo e controllo regressioni vettoriali.
- Nessun dato commerciale o Admin alterato. Servizi e autorizzazioni da verificare separatamente.


## Sprint 03 — Dashboard affidabile e Media Provenance · 16 ottobre 2026

- Dashboard Admin: la card **Azioni rapide** ora si aggiorna senza duplicarsi a ogni ritorno sulla Home del pannello.
- Rimossa la metrica non verificata **Recensioni totali** ricavata dai valori demo `rev` del catalogo; sostituita con **Visual di repertorio**, basata sulle proprietà `assetKind` e `isDemo` effettivamente dichiarate.
- Media Library: pannello di provenienza immagini con foto di repertorio, originali dichiarati e asset da verificare, con collegamenti alle fonti HTTPS quando presenti.
- Test di regressione Node e JSDOM; nessuna fotografia riclassificata automaticamente, nessuna modifica a prezzi, stock, account o token.
- **Rimane da fare**: revisione legale/commerciale delle foto e verifica diretta dei prodotti, upload e pubblicazione reale con rollback, collaudo su dispositivi fisici.


## Stato aggiornato — Sprint 01 concluso; Sprint 02 Media Readiness (16 ottobre 2026)

- **PR #69**: master SVG INGLY con iniziale I bicomponente; footer, header, Admin e asset Service Centre / font tecnico Lab (merge e test browser riusciti).
- **PR #70**: libreria `foundation-components.css`, 16 test di percorsi responsive e inventario CSS (merge e deploy riusciti).
- **PR #71**: risolta sovrapposizione della barra PWA al footer con `[hidden]`, card compatta e test desktop/mobile (merge riuscito; verificare deploy finale).
- **Fase 02**: `scripts/photo-readiness-report.mjs` produce ad ogni QA coda SKU/CSV e sintesi categoria, dalle sole foto realmente presenti nel manifest. Non sostituisce foto, non cambia catalogo, non inventa KPI.
- **Blocco commerciale residuo**: fotografie autentiche delle schede pubbliche mancanti, collaudo su smartphone reali/screen reader e workflow di ordini/pagamenti autorizzato.


Data audit: 15 ottobre 2026
Base: branch main + hotfix \`fix/brand-header-machine-20261015\`.
Obiettivo: un e-commerce premium credibile, realmente usabile su smartphone e amministrabile senza confondere immagini decorative, prodotti fisici, download e servizi.

## Sprint 01 — Foundation & Navigation (16 ottobre 2026)
Stato iniziale verificato: `main` `4c7c2b32a1b6`. La PR #60 è già integrata, così come #61 e #62; non riaprire questa attività.

### Workstream P0: routing e comportamento del browser
- Link con Ctrl/Cmd/Shift/Alt, tab separata, download, anchor e destinazione esterna: mantenere comportamento nativo.
- Home: non creare percorsi /home non pubblicati; puntare alla radice di GitHub Pages.
- Schede prodotto /product/ID/: mantenere ID, query e cronologia.
- Test di regressione eseguiti dalla suite CI `test-navigation-policy.mjs`.
- Collaudo browser mobile, screenshot e test assistivi reali necessari prima dell'approvazione finale.

## Stato verificato 16 ottobre 2026 — INGLY DESIGN

> Questa roadmap separa **completato**, **strumentato ma ancora da bonificare** e **dipendente da input reali**. Un test automatico verde non è una certificazione WCAG né la prova di un checkout con pagamenti online.

| Intervento | Fase | Evidenza / limite |
| --- | --- | --- |
| Wordmark autentico **INGLY** con I visibile, header/footer/Admin e watermark nei temi | **Integrato** — PR #54 | Asset SVG corretti; QA e GitHub Pages conclusi con successo |
| Audit cromatico dark/light | **Strumentato** — PR #54 | 30 campioni computati; tutti con sfondi complessi da verificare visivamente; nessuna certificazione WCAG |
| Menu, carrello, zoom, tastiera | **Integrato** — PR #51 | 64 scan responsive + 11 test tastiera; restano screen reader e dispositivi fisici |
| Controllo stock nelle aggiunte/checkout e sostituzioni media controllate | **Integrato** — PR #57 | Test automatici di integrazione; lo stock in tempo reale e il checkout online richiedono backend esterni |
| Audit WCAG A/AA automatizzato | **In revisione** — PR #58 | 20 scan axe-core nei due temi e alle due larghezze; report triage prima di bloccare release |
| Fotografie originali dei prodotti pubblici | **Dipende dagli originali** | Ultimo censimento: 43 copertine pubbliche mancanti; la Media Library offre coda per SKU e CSV, non inventa il prodotto |
| Gallerie, crop, preview, associazione e sicurezza Media Library | **Parziale** | Upload/crop, coda, manifest, associazione confermata; da fare test reali di upload e pubblicazione |
| Shop, catalogo, Admin | **In consolidamento** | CRUD, varianti, prezzi, categoria, traduzioni e flussi ordine richiedono collaudo E2E con dati di produzione |

### Intervento integrato — 16 ottobre 2026
- **PR #53 integrata**: Health Center e audit CLI controllano l'inventario file reale, non presumono che un percorso `img` sia una fotografia effettivamente presente. Stato bozza e rimozioni programmate inclusi; non modifica il catalogo.
- **Censimento ripetuto** sullo stato corrente dopo PR #53: 97 prodotti, 77 copertine non presenti nel manifest, 43 relative a schede pubbliche. Nessuna gallery alternativa valida per quei 43 prodotti. La disponibilità di un file nel manifest non certifica che rappresenti il prodotto.
- **QA manuale aperta**: test su iOS/Android, screen reader e caricamento immagini autentiche. I dati commerciali non sono stati alterati.

### Criteri di uscita prima della release commerciale completa
- Confrontare homepage/Shop/Admin su iPhone Safari e Android Chrome **reali**, in dark/light, includendo zoom 200% e testi lunghi IT/EN
- Provare VoiceOver e TalkBack per ordine focus, dialog, prodotto, checkout, filtri e modali; registrare difetti e fix
- Revisionare singolarmente le segnalazioni contrasto su fotografie, gradienti e superfici traslucide; adottare soglie 4.5:1 testo normale, 3:1 testo grande e controlli UI dove pertinente
- Ottenere foto originali delle schede pubbliche prive di media, verificarne SKU e diritti di utilizzo, poi caricarle e confermarle dall'Admin
- Eseguire una pubblicazione di prova completa con 1 prodotto/1 variante/1 galleria e rollback verificato; non pubblicare foto non corrispondenti ai prodotti
- Configurare il canale di pagamento, la consegna e la gestione ordini **solo quando i servizi reali sono autorizzati e testabili**; non confondere il checkout WhatsApp con una transazione online

## Stato consolidato — 16 ottobre 2026

| Ambito | Stato verificato | Passo di accettazione mancante |
| --- | --- | --- |
| Marchio INGLY | **Integrato e pubblicato** con PR #54: `I` iniziale corretta nei master SVG Giorno/Notte e lockup coerenti | Confronto percettivo del logo su schermi reali |
| Responsive e tastiera | **64/64** controlli geometrici e **11/11** test tastiera Chromium nell'ultima PR verificata | Safari iOS, TalkBack Android, NVDA/VoiceOver reali |
| Accessibilità WCAG | **20 scenari axe** IT/base e temi Giorno/Notte, report in `artifacts/axe-audit/`; violazioni da triagiare | Azzeramento difetti critici/seri, contrasto visuale su gradienti e verifica assistiva |
| Shop / stock | **Integrato e pubblicato** con PR #57: blocco zero stock, cap varianti e carrello riconciliato prima della richiesta ordine | Collaudo ordini reali e sistemi esterni di inventario |
| Media Library | **Integrata e pubblicata** con PR #57: selezione da manifest, conferma per sovrascrittura di copertine | Caricamento di fotografie autentiche con corrispondenza SKU |
| Fotografie prodotti | Inventario storico: **43 schede pubbliche senza immagini principali** | Foto reali, verifiche licenza e prodotto/variante |
| Pagamenti | **Non integrati:** checkout configurato come WhatsApp | Provider, credenziali, API server sicure, gestione spedizioni/ordini |
| Generator Studio / Print & Cut | Output dimostrativi e moduli browser esistenti | Prove kerf, registration, spessori e taglio su xTool reali |

Protocollo ripetibile manuale: [ACCESSIBILITY-MANUAL-QA.md](ACCESSIBILITY-MANUAL-QA.md). Nessuna delle attività hardware o fotografica è dichiarata completata dai soli test automatici.

## Aggiornamento operativo — 15 ottobre 2026 (PR #47–#49)

- **PR #47, integrata:** corretto l'errore `max-width:84px` che restringeva la navbar; test di regressione aggiunto.
- **PR #48, integrata:** audit Chromium di Home, Shop, Personalizza, Macchine e Admin a 320/390/768/1440 px, temi Giorno e Notte. Dopo la correzione della dashboard Admin: 40 controlli geometrici senza warning e deploy GitHub Pages riuscito.
- **PR #49, integrata:** selezione centralizzata delle foto realmente presenti, possibilità di usare una gallery valida se manca la cover, niente zoom/slideshow vuoti, fallback onesto per la scheda prodotto.
- **Fase 1, non ancora certificata:** aggiungere audit WCAG con contrasto effettivo, focus/keyboard, navigazione e interazioni, screenshot comparativi esaminati e test su dispositivi fisici.
- **Fase 2, non ancora conclusa:** rimangono da fornire le 43 fotografie mancanti dei prodotti pubblici (77 contando anche le bozze/nascosti, secondo audit 15/10/2026). Ogni foto deve essere pertinente e verificata, non una rappresentazione sintetica scambiata per un oggetto prodotto.

### Condizioni di uscita dalla Fase 2
1. Dall'Admin si vedono chiaramente le schede pubbliche senza fotografie; se una gallery autentica è già disponibile, può fungere da copertina.
2. Nessuna immagine con percorso locale non presente nell'inventario è caricata nello Shop, nel dettaglio o nel lightbox.
3. Foto di copertina e foto gallery hanno corrispondenza confermata articolo/SKU e alt IT/EN; file ottimizzati e resa controllata su smartphone.
4. Prima del rilascio catalogo completo: foto caricate e validate per le 43 schede pubbliche, o schede nascoste/indicate in modo esplicito (scelta commerciale da approvare).

## Stato immediato — Hotfix P0
**Motivo:** screenshot reale del proprietario mostra emblema circolare + due wordmark trasformati in piccoli cerchi, header gigantesco, titolo Machine Lab tagliato.
**Causa confermata nel codice:** header/footer contenevano entrambe le immagini \`ingly-wordmark-light.svg\` e \`ingly-wordmark-dark.svg\`. Le regole storiche \`.nav .brand img\` con width/height forzati e border-radius circolare sovrascrivevano le immagini. Anche \`.brand-wordmark\` aveva \`display:block!important\`, quindi le regole generiche di occultamento del tema perdevano nella cascata. \`#page-macchine\` aveva titolo lungo e font/area non vincolati in tutte le varianti responsive.
**Soluzione:** un unico wordmark per lockup (bianco con filtro per Giorno), SVG crop al disegno effettivo, stile specifico più forte per header/footer/admin, min/max h della navbar, bottone burger disponibile già sotto 1100px, font/width/line wrap Machine Lab.
**Accettazione:** pagina Macchine e homepage su smartphone 320/360/390/430/768px e desktop 1100/1280/1440px: niente logo doppio, niente testi tagliati, niente scroll orizzontale, menu navigabile, Giorno e Notte reali.
**Stato:** patch nel branch e test automatici; verificare screenshot reali prima di dichiarare completa la QA visiva.

## 8 macrofasi rimaste dopo l'hotfix
| # | Fase | Priorità | Stato verificato | Risultato richiesto / criteri di accettazione |
| --- | --- | --- | --- | --- |
| 1 | Audit UI end-to-end desktop/mobile, design token & accessibilità | P0 | Tema condiviso implementato; screenshot segnala regressioni non rilevate dalla QA automatica | Screenshot diffs su HOME, Shop, Digital, Personalizza, Materiali, Macchine, Lab e Admin a 320–1440px; zero scroll orizzontale, stati focus, contrasto WCAG AA, menu e overlay utilizzabili |
| 2 | Asset fotografici reali, gallery e branding di categoria | P0/P1 | Audit \`docs/CATALOGO-FOTO-DA-CARICARE.md\`: 77 riferimenti locali immagine assenti, 43 relativi a schede pubbliche; Admin sa filtrarli | Caricamento e assoc. reali, immagini ottimizzate e conformi al prodotto, thumbnail/mobile \`srcset\`, alt IT/EN; placeholder onesto dove non c'è foto |
| 3 | Catalogo Shop, gadget/accessori, prezzi/stock e prodotti configurabili | P1 | Link e categorie Gadget/Accessori già esistenti, ma inventario specifico e workflow commerciale richiedono verifica | Tassonomia coerente, varianti, SKU e disponibilità effettive; prezzo solo quando confermato; preventivo e pubblicazione distinguibili; test B2C/B2B |
| 4 | Checkout e ordini realmente gestiti | P1 | \`data/config.json.checkout.modo\` è \`WHATSAPP\`; presente motore \`assets/js/commerce.js\`, non backend pagamenti completo | Flusso WhatsApp trasparente e testato; se si desiderano pagamenti online, backend gateway, idempotenza, conferma ordine e stato transazionale; spedizioni, tasse e documentazione conformi |
| 5 | Admin: gestione completa e sicurezza operativa | P1 | CMS statico a bozza+GitHub commit; editor Materiali/Macchine e Media esistono; manca ancora audit UX end-to-end | CRUD completo per categorie e prodotti, galleria, ordine, moduli Home, temi/sfondi, permessi token minimizzati, log pubblicazione/recovery, niente KPI simulati |
| 6 | Generatori e configuratore pronti per produzione | P1 | Print & Cut browser e personalizzatore SVG già esistono; nessuna certificazione/calibrazione macchina | Offset/kerf e registrazione print/cut verificati su xTool reali, caratteri convertiti in path, aree di sicurezza, resa finale esportabile, test su materiale |
| 7 | xTool Lab, Academy, asset ufficiali e fonti | P2 | Catalogo macchine e schede con fonti esistono, alcuni \`specs\` sono intenzionalmente vuoti; area servizio ha badge comunicato dal titolare | Schede tecniche aggiornate con link fonti, disponibilità e limiti, percorsi demo/corsi effettivamente attivi, nessuna specifica o certificazione inventata |
| 8 | Completezza IT/EN, SEO, performance e release QA | P1/P2 | Switch globale implementato, ma copie storiche non necessariamente tutte tradotte; Build/Lighthouse esistono | Copertura testo/alt/aria/errori IT/EN, pagine SEO e structured data valide, PWA/cache senza versioni stale, performance mobile, test regression e check post-deploy |

### Percorso di consegna suggerito
- **Sprint A (P0)**: hotfix logo/header/Macchine, test mobile visuale e automazione anti-overflow su tutte le rotte.
- **Sprint B (P0/P1)**: completamento reale Media Library e foto pubbliche mancanti; schede prodotto credibili e collezioni.
- **Sprint C (P1)**: catalogo e configurazione commerciale, funnel preventivi/checkout WhatsApp senza promettere una piattaforma pagamenti non integrata.
- **Sprint D (P1)**: UX e sicurezza Admin, organizzazione prodotti, categorie, immagini e pubblicazione recuperabile.
- **Sprint E (P1)**: generatori produzione con prove fisiche, gestione asset e print-cut.
- **Sprint F (P2)**: Lab/Academy verificati, IT/EN completo e ottimizzazione SEO/performance.
- **Go-live finale**: QA dispositivi reali e release checklist su \`main\`, senza interrompere le route funzionanti.

### Dati e permessi necessari all'esecuzione completa
- Foto reali degli articoli effettivamente prodotti e relative autorizzazioni all'uso; il motore non può sostituirle con prodotti fittizi.
- Modelli xTool effettivamente posseduti, profili materiali, misurazioni kerf/campionature per validazione di output produzione.
- Se richiesti pagamenti diretti, scelta provider e accessi tecnici; il sito attuale è configurato come ordine/preventivo via WhatsApp.
- Browser/device screenshot verificabili per controlli visuali. Test DOM, unitari e Lighthouse da soli non equivalgono a collaudo visuale su ogni smartphone.

### Rischi principali
1. **CSS storico con molti livelli**: regressioni di specificità; nuova componente sempre isolata e verificata visivamente.
2. **Fotografie assenti**: nascondere mancanti o placeholder onesto, mai utilizzare una foto non pertinente.
3. **Ordini e KPI**: non indicare acquisti finalizzati, spedizioni effettuate o percentuali analytics senza dati reali.
4. **Generatori**: un SVG vettoriale in millimetri NON garantisce automaticamente registrazione camera o kerf della macchina.
5. **Admin**: GitHub Pages è una piattaforma statica; autorizzazioni e token vanno gestiti con permessi minimali.

## Sprint 07 — Media rollback preflight (16 ottobre 2026)

- Aggiunto controllo **read-only** `assets/js/admin/media-restore-preflight.mjs` e test `tests/test-media-restore-preflight.mjs`, integrato in `npm test`.
- Confronta inventario storico (`immagini.file`) con inventario del commit live e gli alberi Git: distingue immagini già presenti, binari recuperabili soltanto dal commit storico e file realmente mancanti; rifiuta path traversal, duplicati, formati non sicuri e inventari incompleti.
- **Non ancora collegato al pulsante di restore e non esegue il recupero dei binari**: `ok` del preflight non certifica contenuto o hash dei file. Prima di ripubblicare uno snapshot storico serviranno integrazione UI, download/staging dei blob, verifica SHA/contenuto e commit coerente in sandbox. Nessuna modifica alle fotografie o allo stock live.
- Resta aperto il collaudo E2E Admin con repository isolato, upload singolo/batch e restore immagini binarie; non dichiarare Sprint 07 completato.


- **Integrazione successiva PR #83:** il pulsante Cronologia ora esegue prima del cambio bozza il confronto degli SHA GitHub dei file `img/` dello snapshot storico con i file presenti sul branch live. Impedisce il restore JSON in caso di immagini eliminate o binari differenti; i test sono inclusi nella suite. Questa è una barriera fail-closed, **non** un motore di recupero file binari: per snapshot con foto cambiate serve un flusso separato di staging/restore e verifica sandbox. La CI di questo commit va verificata prima del merge.
