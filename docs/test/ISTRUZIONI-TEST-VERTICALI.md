# Testare i quattro verticali

Repository: `inglyum/website-ingly-xtool` · commit `ff74502`
Il sito in produzione non è stato toccato.

## Accenderlo

**Settings → Pages → Deploy from a branch → `main` → `/ (root)` → Save**
→ `https://inglyum.github.io/website-ingly-xtool/`

Oppure in locale: `npm install && npx serve .` → `localhost:3000`
Controlli automatici: `npm test` → **937 verdi**

---

## 1. Materiali — `/materiali`

**I filtri** (§8). Prova le ricerche del brief, una per una:

| Scrivi | Deve trovare |
|---|---|
| `plexiglass trasparente` | Plexiglass |
| `legno 3 mm` | Legno, Bambù |
| `materiale per co2` | i 6 materiali che il CO₂ lavora |
| `metallo per incisione` | Metallo |
| `acciaio inox` | Metallo |

Le parole si cercano **una per una**, non come frase. «per» e «materiale» si
ignorano. E `co2` trova `CO₂` — col pedice, nessuno la cerca così.

**Apri Plexiglass → in fondo, «Acquista il materiale».** Tre tendine: formato,
spessore, colore. Oggi il prezzo dice **«su richiesta»** e il bottone è
*Richiedi disponibilità e prezzo*.

> Non è un pezzo mancante: `prezzo: null` è l'unica risposta onesta finché non
> lo decidi tu. Metti i prezzi in `data/materiali.json` e `"attivo": true`, e
> lo stesso blocco diventa un acquisto vero. Servono **entrambe le cose**: così
> si pubblica quando si è pronti, non al primo numero inserito.

Ho verificato che funziona: con i prezzi inseriti, la variante entra nel
**carrello del sito** — accanto a prodotti e file digitali, stesso totale,
stessa soglia di spedizione, stesso checkout. Nessun secondo carrello.

## 2. Academy — `/academy`

**È vuota, e lo dice.** Trovi l'invito a scrivere, non un catalogo finto.

Un corso ha durata, programma e prezzo che decidi tu: inventarne trenta
sarebbe pubblicare un'offerta che non esiste. Lo schema pronto da copiare è in
`data/corsi.json → _modello`.

Appena ne aggiungi uno con `"stato": "pubblicato"`, compaiono da soli: scheda,
link dalla sua macchina e dalla sua tecnologia, pagina statica, voce in
sitemap.

## 3. Machine Lab — `/macchine`

13 modelli xTool. La distinzione che conta:

- **`/macchine/p3`** → «In officina da noi». Specifiche vere, e in fondo il
  blocco **Provala**.
- **`/macchine/f2-ultra`** → «Assistenza e riparazione». Nessuna specifica, e
  la pagina scrive perché: *«non sono ancora state verificate da noi,
  preferiamo non riportare numeri che non abbiamo misurato»*.

Siete centro ufficiale su tutta la gamma; provare si può solo su ciò che avete.

## 4. Demo — `/demo`

Oggi i bottoni sono **WhatsApp** ed **email**, e sotto c'è scritto che il
calendario non è ancora collegato.

Per accenderlo, in `data/config.json`:

```json
"demo": { "bookingUrl": "https://calendly.com/…" }
```

Va bene anche Google Calendar, una pagina di prenotazione o un link
`https://wa.me/…`. Tutti i bottoni della demo diventano quel link, in tutto il
sito.

> Un indirizzo scritto male (`prenota-qui`) viene **rifiutato** e si torna a
> WhatsApp: un bottone che non porta da nessuna parte è peggio di un bottone
> che non c'è.

---

## Che niente si sia rotto

`/` · `/shop` · una scheda prodotto · `/business/ristoranti` · `/digital` ·
`/portfolio` · `/quote` · carrello · wishlist · IT/EN · chiaro/scuro · telefono.

## Le tre cose da decidere tu

1. **I prezzi dei materiali** — 27 varianti pronte, aspettano i numeri.
2. **I corsi** — mandameli e li monto.
3. **Il link della demo** — una riga in `config.json`.
