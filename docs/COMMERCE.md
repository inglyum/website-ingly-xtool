# Commerce OS — il modello unico

## Il problema che risolve

Il sito vende cose diverse: oggetti del catalogo, materiali del Lab, file da
scaricare, corsi, pezzi su misura. Ogni tipo si era aggiunto portandosi dietro
la propria forma di riga nel carrello, e ogni punto che toccava il carrello
aveva imparato a distinguerle:

```js
i.dig ? i.dig.n[L] : i.lab ? i.lab.nome : i.p.n[L]
```

Quella catena stava scritta — con piccole differenze — in **quattro** posti:
il disegno delle righe, il salvataggio, il ricaricamento e il messaggio di
checkout. In uno dei quattro il ramo del Lab non c'era: un carrello con una
variante di materiale leggeva `i.p.n` su una riga senza `p`, e **il bottone
WhatsApp si fermava con un errore**. Il carrello sembrava giusto, il pulsante
non funzionava, e niente lo diceva — né all'utente né a noi.

Aggiungere corsi e pezzi su misura avrebbe voluto dire sei rami in quattro
posti, con la stessa probabilità di dimenticarne uno.

## Come funziona adesso

```
catalogo / Lab / file / corso / Creator
            │
            ▼            una sola forma di riga
   commerce.js  ──→  { tipo, rif, nome, meta, icon, bg, unitario, q, conf }
            │
            ├──→ disegno del carrello
            ├──→ localStorage (serializza / deserializza)
            ├──→ totali  (un solo motore)
            └──→ checkout (un solo testo, un adattatore)
```

Da quel momento nessuno chiede più «che tipo sei»: chiede il nome, il prezzo
unitario, la quantità.

### I cinque tipi

| Tipo | Che cos'è | Da dove arriva |
|---|---|---|
| `physical` | un oggetto del catalogo | `data/products.json` |
| `material` | una variante di materiale venduta dal Lab | `data/materiali.json → vendita.varianti` |
| `digital` | un file da scaricare | `content.json → DIG` |
| `course` | un posto a un corso | `data/corsi.json` |
| `custom` | un pezzo configurato dal cliente | Creator (da fare) |

**I 97 prodotti già pubblicati non hanno un campo `tipo` e non lo prendono.**
Il tipo si deduce: un record senza tipo è un oggetto fisico, che è quello che è
sempre stato. Scrivere il campo in 97 record corretti sarebbe stato 97 modifiche
per nessun guadagno, e un giorno un record nuovo senza campo si sarebbe
comportato diversamente dai suoi fratelli. C'è un test che pretende che tutti e
97 restino `physical`.

### `rif` — che cosa si somma e che cosa non si somma

`rif` identifica la **configurazione**, non l'articolo.

- la stessa taglia aggiunta due volte → una riga, quantità due
- due incisioni diverse dello stesso prodotto → due righe
- due configurazioni Creator diverse → due righe

Se `rif` dimenticasse un pezzo della configurazione, due cose diverse si
sommerebbero in silenzio e il cliente riceverebbe il doppio di una e zero
dell'altra. La firma della configurazione è ordinata per chiave, così lo stesso
oggetto scritto in ordine diverso dà lo stesso `rif`.

Un file digitale ha `qFissa`: comprarne due copie non vuol dire niente, e il
carrello non mostra nemmeno i pulsanti `+` / `−`.

### I carrelli salvati prima dell'aggiornamento

`deserializza()` legge la forma nuova **e le tre vecchie**. Perdere un carrello
è perdere un ordine, e l'utente non ha modo di sapere che c'era qualcosa. Le
forme vecchie restano leggibili in un posto solo, non sparse nel codice.

Due regole, verificate:

- un prodotto o un file **ritirato dal catalogo non torna nel carrello**: una
  riga che non si può ricostruire non si finge;
- il **prezzo salvato sopravvive**. Su un prodotto con le taglie, `u` è il
  prezzo della taglia scelta: riportarlo al prezzo base farebbe pagare una A0
  come una A4. Il prezzo di catalogo torna solo quando non ce n'è uno salvato.

### I totali

`totali()` è il solo posto che somma. Prima lo facevano tre `reduce` separati —
badge, barra della spedizione, messaggio di checkout — ognuno col proprio
arrotondamento: tre posti che devono dire lo stesso numero sono tre occasioni
di dirne due diversi. L'arrotondamento è ai centesimi su ogni riga e poi sul
totale, così i `€41,370000000000005` non arrivano a schermo.

### Il checkout

`adattatore(config)` decide il canale e dice se è davvero usabile.

| Modo | Serve |
|---|---|
| `WHATSAPP` | il numero in Contatti |
| `EMAIL` | niente: il preventivo è sempre possibile |
| `PAYMENT_LINK` | un indirizzo `https://` |
| `EXTERNAL_CHECKOUT` | un indirizzo `https://` |

Si sceglie in **Admin → Prezzi in vetrina → Dove finisce il carrello** (nello
stesso pannello, non in uno nuovo). Se il modo scelto è configurato a metà il
sito ricade sul canale che funziona, e **lo dice all'Admin, non all'utente**:
chi compra non vede un pulsante rotto, chi pubblica vede l'avviso.

---

## Quel che non c'è ancora

Questa è la base: modello, righe, totali, adattatore. Restano da fare, nello
ordine del brief:

- **Creator** — il configuratore visivo (canvas, livelli, testo, immagini,
  maschere, area di sicurezza, anteprima mockup, export). È il pezzo grosso, e
  poggia su `tipo: 'custom'` e sul campo `conf` della riga, che esistono già.
- **Digital Lab** — la consegna dei file. Dentro un sito statico non si
  costruisce una consegna protetta, e **non la si simula**: serve uno strato
  astratto con provider sostituibili.
- **Academy** — il catalogo corsi è ancora vuoto di proposito: durata,
  programma e prezzo li decide chi eroga.
- **Collection Engine** e **eventi di analytics**.
