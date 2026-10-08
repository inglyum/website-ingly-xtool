# Il Lab — materiali, tecnologie, macchine

Il grafo che tiene insieme il sito:

```
MATERIALE ──→ TECNOLOGIA ──→ LAVORAZIONE ──→ PRODOTTI
     └────────→ MACCHINA ───────┘
```

Un visitatore non arriva sapendo che gli serve «stampa UV diretta». Arriva
sapendo che ha un grembiule e vuole il suo logo a colori. Il Lab esiste per
coprire quella distanza.

## I file

| File | Cosa contiene |
|---|---|
| `data/materiali.json` | 9 materiali: descrizione, spessori, finiture, usi, consigli, limiti, FAQ |
| `data/tecnologie.json` | 6 tecnologie: processo passo per passo, applicazioni, FAQ |
| `data/macchine.json` | il parco macchine reale, le combinazioni, i materiali vietati |
| `assets/js/lab.js` | il motore: funzioni pure, nessun DOM |
| `assets/js/lab-ui.js` | il disegno delle pagine |
| `tests/test-lab.mjs` | 42 controlli, sui dati finti e su quelli veri |

## Le relazioni si dichiarano, non si ripetono

`materiali.json` dichiara `tech` e `macchine`; `tecnologie.json` dichiara
`materiali` e `macchine`; i prodotti dichiarano `mat`.

Il collegamento fra una scheda materiale e le creazioni è
**`materiale.cat` ↔ `prodotto.mat`**: rinominare un materiale senza toccare i
prodotti svuoterebbe la scheda in silenzio, senza alcun errore. C'è un test
apposta per questo.

`materialiDi()` legge la relazione **nei due versi** e ne tiene l'unione:
chi aggiunge un materiale dichiara la tecnologia, non viceversa, e fidarsi di
un solo verso significherebbe perdere metà dei collegamenti ogni volta che
qualcuno aggiorna un solo file.

## Aggiungere un materiale

Una voce in `data/materiali.json`. Niente altro:

```json
{
  "id": "sughero",
  "cat": "Sughero",
  "n": { "it": "Sughero", "en": "Cork" },
  "sommario": { "it": "…", "en": "…" },
  "descrizione": { "it": "…", "en": "…" },
  "grad": "#d9c7a3,#a88a5c",
  "tech": ["co2"],
  "macchine": ["p3"],
  "lavorazioni": { "it": ["Taglio", "Incisione"], "en": [] },
  "spessori": ["2 mm", "4 mm"],
  "finiture": { "it": ["Naturale"], "en": ["Natural"] },
  "usi": { "it": ["Sottobicchieri"], "en": ["Coasters"] },
  "consigli": { "it": [] }, "limiti": { "it": [] },
  "faq": [{ "d": { "it": "…" }, "r": { "it": "…" } }]
}
```

Poi `npm run build && node scripts/prerender.mjs && node scripts/generate-sitemap.mjs`.
Compaiono da soli: la pastiglia nell'indice, la scheda `/materiali/sughero`,
il collegamento dalla tecnologia, la voce nella sitemap, la pagina statica per
i crawler e il materiale nella ricerca guidata.

`npm test` blocca un riferimento a una tecnologia o a una macchina che non
esistono: una scheda non deve promettere una lavorazione che nessuno esegue.

## La ricerca guidata

`suggerisci(D, { materiale, effetto, testo })` in `lab.js`.

Il criterio è volutamente semplice e leggibile — nessun modello, nessuna
libreria: un criterio che non si capisce non si può correggere.

La regola che conta: **se è stato scelto un materiale, una tecnologia che non
lo lavora non è un suggerimento debole, è sbagliato, e non compare affatto.**
Metallo + taglio non dà una risposta mediocre: dice che quella combinazione
non si fa e invita a scrivere. Una risposta sbagliata costa più del silenzio.

## Due pagine e come sono servite

Ogni sezione e ogni scheda esistono due volte, da una sola fonte:

- `lab-ui.js` le disegna per chi ha un browser;
- `corpoMateriale()` / `corpoTecnologia()` / `corpoSezione()` le scrivono dentro
  al file statico, per i crawler dei motori AI — GPTBot, PerplexityBot,
  ClaudeBot — che non eseguono JavaScript e oggi troverebbero una pagina vuota.

## Dati strutturati

Niente schema falso. Un materiale **non** è un `Product`, e dichiararlo tale
per guadagnare un rich result è il modo più veloce di perdere fiducia.

| Pagina | Tipi dichiarati |
|---|---|
| Scheda materiale | `Article` + `ItemList` (le creazioni) + `FAQPage` + `BreadcrumbList` |
| Scheda tecnologia | `Service` + `HowTo` (solo con almeno due passi) + `FAQPage` + `BreadcrumbList` |
| Indici | `BreadcrumbList` |

---

# I quattro verticali commerciali

## 1. Materiali in vendita

Ogni materiale ha un blocco `vendita`:

```json
"vendita": {
  "attivo": false,
  "unita": "lastra",
  "varianti": [
    { "id": "plexiglass-1", "formato": "300×200 mm", "spessore": "3 mm",
      "colore": "Trasparente", "prezzo": null, "compareAt": null, "stock": null }
  ]
}
```

**27 varianti, nessun prezzo.** `prezzo: null` non è un errore: è l'unica
risposta onesta finché una persona non lo decide. Finché resta così la scheda
dice «su richiesta» e il bottone diventa *Richiedi disponibilità e prezzo*.

Per aprire la vendita servono **due cose insieme**: i prezzi, e `attivo: true`.
`inVendita()` pretende entrambe, così si pubblica quando si è pronti e non
quando si è inserito il primo numero.

Il carrello è **quello del sito**. La riga del Lab entra accanto ai prodotti
fisici e ai file digitali, con lo stesso totale, la stessa soglia di
spedizione gratuita e lo stesso checkout. Nessun secondo carrello.

## 2. INGLY Academy

`data/corsi.json` ha la struttura e il catalogo **vuoto**. Un corso ha una
durata, un programma e un prezzo che decide chi lo eroga: inventarli
significherebbe pubblicare un'offerta che non esiste. Lo schema di un corso è
in `_modello`, pronto da copiare.

Un corso con `stato: "pubblicato"` fa comparire da sé la scheda, il link dalla
sua macchina e dalla sua tecnologia, la pagina statica e la voce in sitemap.

## 3. Machine Lab

`data/macchine.json → catalogo`: 13 modelli xTool.

| Campo | Significato |
|---|---|
| `inOfficina` | **ce l'abbiamo davvero** — solo queste si possono provare |
| `assistenza` | centro ufficiale: vale su tutta la gamma |
| `daCompletare` | specifiche non verificate da noi: la pagina lo dichiara |

Le 9 macchine che non abbiamo hanno `specs: {}` **vuoto**. Riempirlo con
numeri presi da un catalogo sarebbe scrivere dati che non abbiamo misurato.

## 4. Demo gratuita

`config.json → demo`. Il campo che conta è `bookingUrl`, **vuoto di
proposito**:

| Stato | Cosa fa il sito |
|---|---|
| `bookingUrl` vuoto | niente calendario finto: propone WhatsApp ed email |
| URL valido (http, mailto, tel) | il bottone apre quel link |
| `attiva: false` | la sezione demo sparisce |

Funziona con Calendly, Google Calendar, una pagina di prenotazione o un link
WhatsApp. Un indirizzo malformato viene rifiutato: **un bottone che non porta
da nessuna parte è peggio di un bottone che non c'è.**

Ogni macchina con `inOfficina` e `demoDisponibile` mostra da sé il blocco
«Provala».
