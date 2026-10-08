# ROADMAP INGLY — sito, Admin e stile

> La mappa dei sistemi (cosa esiste, cosa si riusa, cosa **non** esiste) è in
> `docs/MAPPA-SISTEMI.md`. Qui c'è l'ordine dei lavori.

---

# Creative Commerce Platform — stato dei lavori

Aggiornato il 2026-10-08. Una voce è **fatta** solo se funziona da un capo
all'altro: un visitatore la usa, i dati la alimentano, l'Admin la governa e
un test la difende. Non basta che la pagina esista.

## ✅ Fatto

### Commerce OS — il modello unico
`assets/js/commerce.js` · 129 controlli

Cinque tipi (`physical`, `material`, `digital`, `course`, `custom`) dedotti
dai dati: i 97 prodotti pubblicati non prendono campi nuovi. Una sola forma
di riga di carrello, un solo motore di totali, un adattatore di checkout
(WhatsApp / preventivo / link di pagamento / checkout esterno) scelto
nell'Admin. I carrelli salvati nelle tre forme vecchie tornano su interi.

Difetto chiuso: il messaggio di checkout non gestiva le righe del Lab — una
variante di materiale nel carrello **fermava il bottone WhatsApp** con un
errore, senza dirlo a nessuno.

### Collection Engine
`assets/js/collezioni.js` + `data/collezioni.json` · 90 controlli

Una collezione è un criterio sul catalogo, non un secondo elenco. Sette
collezioni pubblicate — best seller, novità, edizioni limitate, stagionale,
sotto €20, matrimonio, casa — tutte garantite non vuote, perché una
collezione senza prodotti **non si pubblica**.

Difetti chiusi:
- due delle quattro schede della home («Edizioni Limitate», «Stagionale»)
  aprivano una **griglia vuota**: nessun prodotto portava quei valori;
- il campo `coll` diceva 7 best e 2 novità mentre `tag`, sulla stessa riga,
  diceva 10 e 3: due verità mantenute a mano;
- due voci del **menu principale** (`?coll=regalo`, `?coll=limited`)
  puntavano a valori inesistenti che lo shop non leggeva affatto.

Riusa `categories.json` senza inventare categorie: `/shop?coll=matrimonio`
è la sottocategoria **Nozze di Eventi**, non una categoria nuova. «Turismo»
non è stata creata, perché nei dati non esiste.

### Movimento e tipografia
`assets/js/animations.js`, CSS

Quattro cicli `requestAnimationFrame` **permanenti** → zero. Erano: il
canvas di particelle con i fasci laser agganciati al cursore, **due** aloni
di cursore sovrapposti (uno dei due ignorava `prefers-reduced-motion`), e i
blob di gradiente dell'hero. Due di essi giravano anche su telefono, dove un
cursore non esiste.

Rimossi anche: bottoni magnetici, parallasse dell'hero, tilt 3D su sei tipi
di scheda, il raggio laser che attraversava ogni pagina ogni 11 secondi, e
lo «skeleton» che scorreva **all'infinito su ogni scheda prodotto** anche
dopo che la foto era arrivata. Tolto `will-change:transform` +
`transform-style:preserve-3d` da tutte le schede: tenevano un livello di
composizione per ognuna, per sempre, e servivano al tilt che non c'è più.

Tipografia: titoli e bottoni non sono più tutti in corsivo. Il corsivo resta
negli occhielli, nelle didascalie e nelle note, dove significa qualcosa.

Verificato a 1440 / 1200 / 1024 / 768 / 480 / 390 / 360: nessun overflow, un
solo `h1` visibile per pagina, zero errori JS.

## Da fare, in ordine

### 1. Il flag «personalizzabile» e la sezione Personalizza
Il più piccolo e il più bloccante: **nessuno dei 97 prodotti dichiara se si
può personalizzare.** Serve il campo sul prodotto, la casella nell'Admin e
la destinazione `/personalizza`. La collezione `personalizzabili` è già
scritta e aspetta solo il dato: oggi è in bozza e si accende da sé.

### 2. INGLY Creator — il pezzo grosso
Non c'è nulla da «evolvere»: l'attuale configuratore è una fila di pastiglie
per la taglia. Da costruire: canvas, livelli, testo (font, dimensione,
colore, posizione, rotazione), immagine (upload, crop, zoom, trascinamento),
area di sicurezza, mockup sul prodotto, annulla/ripeti, prezzo che cambia
mentre si configura, e la configurazione completa che entra nel carrello con
la sua anteprima.

Le fondamenta ci sono: `tipo: 'custom'`, il campo `conf` della riga, il
`rif` che distingue due configurazioni diverse, il motore dei prezzi unico.

Da decidere prima di cominciare: **dove finisce l'immagine caricata dal
cliente.** Per l'anteprima basta il browser; per allegarla a un ordine serve
un posto dove metterla, e un sito statico non ce l'ha.

### 3. Pagine collezione proprie
Oggi una collezione filtra lo shop con la sua intestazione. Manca
`/collezioni/<slug>` con hero, descrizione lunga, dati strutturati
`CollectionPage` (lo schema è già scritto in `collezioni.js`), voce in
sitemap e pagina statica per i crawler.

### 4. Shop landing
«Cosa stai cercando?» in cima, poi le vetrine, poi il catalogo. Filtri
professionali su desktop, cassetto su mobile. Card con hover image e
«Personalizza» quando disponibile — che dipende dal punto 1.

### 5. Material Commerce completo
Le varianti ci sono, **27 prezzi sono `null`**: finché restano così la
scheda dice «su richiesta», ed è l'unica cosa onesta da dire. Mancano
«Compatibile con», «Testato da INGLY», «Puoi realizzare», e il Material
Finder con le domande (macchina, obiettivo, finitura, spessore).

### 6. Digital Store
`DIG` ha 2 bundle con cinque campi. Serve il modello completo (categorie,
compatibilità, licenza, versione, changelog, bundle), i filtri e il
`DigitalDeliveryAdapter`. **Nessun download protetto verrà simulato**: in un
sito statico un link «segreto» è un link pubblico.

### 7. Academy
Il motore è pronto, il catalogo è vuoto perché durata, programma e prezzo
non sono dati nostri. Serve il contenuto, poi il Course Manager a form.

### 8. xTOOL LAB e comparatore macchine
Delle 13 macchine, 9 non le abbiamo e hanno `specs` vuoto. Il comparatore
confronterà quello che sappiamo; per il resto la pagina dichiara che non è
verificato da noi, invece di copiare numeri da un catalogo altrui.

### 9. Home riprogettata
La nuova gerarchia (hero → «cosa vuoi fare?» → categorie → Personalizza →
best seller → Material Lab → Digital → Academy → xTool → Business →
portfolio → prove → newsletter) ha senso **dopo** che Personalizza e Creator
esistono: una sezione «Personalizza» in home che porta a un modulo di
preventivo è una promessa non mantenuta.

### 10. Admin Visual Commerce Control
Riordinare le 26 viste esistenti in COMMERCE / LAB / WEBSITE / MARKETING /
SYSTEM — riordino, non riscrittura. Poi: merchandising della home
(aggiungi/sposta/spegni sezione, con anteprima desktop-tablet-telefono),
ruoli e usage tracking nella Media Library, Material/Course/Digital manager
a form, Customizer Builder.

## Aspettano una decisione, non un commit

| Cosa | Perché blocca |
|---|---|
| **27 prezzi delle varianti di materiale** | senza, i materiali non si vendono: la scheda può solo dire «su richiesta» |
| **Contenuto dei corsi** | il catalogo Academy resta vuoto |
| **`bookingUrl` della demo** | senza, il bottone propone WhatsApp ed email invece di un calendario |
| **3 endpoint Formspree** | preventivo e newsletter non recapitano |
| **Quale repository tiene `inglydesign.it`** | `config.site.url` dichiara ancora il dominio dell'altro |
| **`/materiali/` oppure `/materials/`** | gli indirizzi italiani sono già in sitemap: rinominarli costa il posizionamento acquisito. È una scelta commerciale, non tecnica |
| **46 foto prodotto mancanti** | le schede mostrano il segnaposto del materiale |

---

# Storico precedente


## ✅ v2.7 (oggi) — Temi pronti all'uso, con sfondo incluso

**Artwork Engine**: 15 stili di sfondo **generati vettorialmente** dalla palette di ogni tema.
Nessuna immagine da generare o caricare: ~2,6 KB l'uno (un'immagine AI ne pesa ~100), nitidi a
qualsiasi dimensione, coerenti col brand perché costruiti sui colori del tema stesso.
Tutti i **103 temi** hanno già il loro stile assegnato: scegli il tema, un click, cambia tutto il sito.
Se per una categoria carichi una foto, quella ha sempre la precedenza sullo sfondo generato.

Stili: Aurora · Raggio laser · Griglia tecnica · Luci sfocate · Onde · Curve di livello · Raggi ·
Particelle · Marmo · Circuito · Neve · Coriandoli · Sfumatura morbida · Archi · Fasci di luce.

---

## ✅ v2.8 — Fase 1.1 e 1.2 completate + due bug critici risolti

**Bug 1 — «Impossibile caricare i dati del sito».** Un materiale non presente in `MAT_ART`
interrompeva il render e il catch globale mostrava solo quel messaggio: il sito restava bianco.
Risolto su quattro livelli: auto-guarigione dei dati al caricamento, lettura del materiale sempre
protetta, **tendina** al posto del testo libero nell'Admin, e blocco in CI.

**Bug 2 — importazione backup.** Un backup esportato prima dei temi li cancellava insieme a icone,
varianti e punti focali. Ora l'import fa **merge**: ciò che manca nel file resta dalla versione
attuale, e l'Admin ti dice quali sezioni ha mantenuto.

**1.1 Icone vettoriali** — sostituite le ultime emoji in evidenza (Tecnologie, Stagionale, Edizioni
Limitate, materiali). Il menu usava già icone vettoriali.

**1.2 Punto focale** — nella Media Library, clic sull'anteprima ingrandita per fissare il punto che
deve restare sempre inquadrato: vale su ogni schermo, anche dove il ritaglio CSS taglia l'immagine.

---

## Fase 1 — Cosa resta

**1.4 Anteprima affiancata nell'Admin** · 1 giorno
Oggi l'anteprima apre una scheda nuova. Un riquadro affiancato che si aggiorna mentre scrivi
renderebbe molto più rapido il lavoro sui testi.

---

## ✅ v2.9 — Fasi 2.1 e 2.2 completate

**2.1 Pagina prodotto** — zoom a tutto schermo con frecce, Esc e conteggio; **video** del prodotto con
poster; **tabella misure**; **correlati scelti a mano** che compaiono prima di quelli automatici;
descrizione IT/EN. Tutti i campi si compilano dalla scheda prodotto nell'Admin.

**2.2 Ricerca e filtri** — suggerimenti mentre scrivi (prodotti, categorie, materiali) con frecce ed
Invio; ordinamento **«Novità»**; **filtri salvati nell'URL**: la ricerca filtrata diventa un link
condivisibile su WhatsApp e viene ripristinata all'apertura.

## ✅ v3.0 — Fasi 1.3, 2.4, 3.2 e 3.3 completate

**1.3** Lo sfondo del tema non è più solo sulle 12 card: colora anche la hero e la fascia CTA, così
cambiando tema cambia l'atmosfera dell'intera pagina.
**2.4** Fascia promozionale programmata: testo, pulsante, link, colori e finestra di date, con anteprima
dal vivo nell'Admin. Black Friday e saldi si accendono e si spengono da soli.
**3.2** Ingresso scaglionato: le card della stessa griglia entrano con 70 ms di scarto l'una dall'altra.
**3.3** Scala tipografica esplicita (rapporto 1.25) come fonte unica delle dimensioni del testo.

## Fase 2 — Cosa resta

**2.3 Preventivi tracciati** · 2 giorni
Numerazione delle richieste, allegati multipli, pagina «stato della richiesta» per il cliente.
Oggi il modulo parte e finisce lì: nessuno sa a che punto è.

---

## Fase 3 — Stile INGLY, il salto di qualità

**3.1 Fotografia coerente** · *vale più di qualsiasi codice*
Fondo scuro, una sola luce laterale, sempre la stessa inquadratura e lo stesso rapporto per tutti i
prodotti. Un set fotografico costante fa sembrare il sito il doppio più costoso senza modificare una
riga. Le linee guida sono già in `docs/kb/prompt-library.md`.

**3.4 Modalità chiara** · 2 giorni
Il tema scuro è l'identità, ma una versione chiara per la stampa dei preventivi e per chi arriva da
mobile in pieno sole aumenterebbe la leggibilità. Da valutare, non urgente.

---

## Fase 4 — Quando servirà un backend
Pagamenti Stripe, area clienti con storico ordini, magazzino, utenti e permessi reali, analytics
proprie. Richiede il passaggio da GitHub Pages a Cloudflare Pages o Vercel. I JSON attuali sono già
nel formato giusto per essere importati: questa architettura è un ponte, non un vicolo cieco.

---

## ✅ v3.1 — Portfolio, Recensioni, Sponsor

**Portfolio indipendente dal catalogo** — «Carica più foto» crea una tessera per ogni immagine in un colpo
solo; restano disponibili «Dalla libreria» e «Dal catalogo» come alternative.
**Recensioni complete** — testo IT/EN, nome, sottotitolo, stelle da 1 a 5, data, spunta «cliente verificato»
e **foto del lavoro** che si aprono ingrandite. (L'editor precedente scriveva su campi che il sito non
leggeva: le modifiche non comparivano mai. Corretto.)
**Sponsor & Partner** — sezione in fondo alla pagina con livelli Gold/Silver/Bronze, loghi a colori
(o bianco e nero con colore al passaggio), link, descrizione, scadenza dell'accordo e invito finale.

## ✅ v3.2 — Due bug prioritari risolti

**Sponsor invisibili — causa trovata.** La sezione era corretta nel DOM ma restava a `opacity:0`:
`.reveal` diventa visibile solo quando l'osservatore aggiunge `.in`, e il selettore copriva soltanto
`.page.active .reveal`, `footer .reveal` e `.cta-band`. La sezione Sponsor, che sta fuori da tutti e tre,
non veniva mai osservata. Ora l'osservatore copre ogni `.reveal` del documento e una **rete di sicurezza**
dopo 3 secondi rende comunque leggibile qualsiasi sezione rimasta indietro.

**Sincronizzazione Admin → sito.** Il caricamento dei dati era già anti-cache (`version.json` con
`no-store` e JSON con `?v=`). Mancava invece il controllo *prima* del commit: ora `validaBozza()`
**blocca** la pubblicazione su errori gravi (materiale inesistente, categoria mancante, ID duplicati,
link sponsor malformati) e avvisa su quelli minori. Il pannello «Pubblica» mostra l'esito in tempo reale,
verde o rosso, prima ancora di premere il pulsante.

Vedi `docs/PIANO-PREMIUM.md` per il piano completo verso il livello Awwwards.

## ✅ v3.3 — Portfolio, tema chiaro

**Striscia portfolio più calma** — un giro completo passa da 44 a 96 secondi, ed è regolabile dall'Admin.
**Clic sulla foto = zoom**, non più semplice pausa: si apre a tutto schermo e si scorrono tutte le foto
del portfolio con frecce e tastiera. Il link Instagram è diventato una freccia dedicata in alto a destra,
così il clic sulla foto e il clic sul social non si contendono più lo stesso spazio.

**Modalità chiara** — interruttore accanto al selettore lingua. La scelta si ricorda; se non hai mai
scelto, il sito segue le preferenze del sistema. Applicata prima del primo disegno: nessun lampo bianco.

**Le foto in «Dal laboratorio»** non erano un limite del codice: la striscia mostra `<img>` da sempre e
usa le stesse tessere del portfolio. Bastava caricarle — ora si fa in blocco con «📷 Carica più foto».

## ✅ v3.4 — SEO strutturata, integrità dati, pulizia

Analisi completa del progetto in `docs/ANALISI-PROGETTO.md`. In sintesi: architettura sana, nessun codice
duplicato, tre file HTML morti rimossi. Aggiunti: **dati strutturati** completi (Product con gallery,
Breadcrumb, FAQ — sono le stelle e le info ricche nei risultati Google), **controllo integrità** in CI
(nessun riferimento rotto, nessun ID duplicato), campi **SKU** e **rating** per prodotto.

## ✅ v4.1 — Portfolio come progetto completo (piano premium #1)

La tessera portfolio non è più solo foto + link: può diventare la **storia di un lavoro** — cliente, data,
materiali, macchina usata, il racconto, le foto delle fasi, il prima/dopo, i prodotti collegati. Cliccandola
sul sito si apre una scheda a schermo. È la cosa che distingue uno studio premium da un catalogo.
Più tre correzioni: tabella misure ora visibile, zoom della miniatura giusta, tema chiaro senza riquadri scuri.

## Cosa resta davvero
- **3.1 Fotografia coerente** — dipende da te, ed è la voce con il ritorno più alto in assoluto.
- **2.3 Preventivi tracciati** — numerazione, allegati multipli, pagina «stato richiesta».
- **1.4 Anteprima affiancata nell'Admin** — comodità di lavoro.
- **Fase 4** — solo quando serviranno pagamenti e area clienti veri.

## Regola d'oro
Mai modificare JSON a mano. Mai caricare immagini a mano. Tutto dall'Admin, in un unico commit.
Prima di ogni consegna: `npm test` tutto verde.
