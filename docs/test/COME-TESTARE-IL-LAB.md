# Come testare questo sito

Questo è il repository di **evoluzione**: `inglyum/website-ingly-xtool`.
Il sito in produzione non è stato toccato.

Due modi. Il **modo 1** se vuoi solo guardarlo, il **modo 2** se vuoi anche
cambiare qualcosa e vedere l'effetto.

---

## Modo 1 — online, senza installare niente

Su `github.com/inglyum/website-ingly-xtool`:

> **Settings** → **Pages** → Source: **Deploy from a branch** → Branch:
> **`main`** → cartella **`/ (root)`** → **Save**

Dopo due minuti: **`https://inglyum.github.io/website-ingly-xtool/`**

> **Non è indicizzabile, di proposito.** `robots.txt` è `Disallow: /` finché
> non decidi di promuoverlo: ha contenuti simili al sito online e gli farebbe
> concorrenza nei risultati di ricerca. Quando sarà il momento si tolgono due
> righe. Per lo stesso motivo il `CNAME` non c'è: `inglydesign.it` appartiene
> al repository in produzione, e due repository che dichiarano lo stesso
> dominio se lo contendono.

> **Il sito sta in una sottocartella** (`/website-ingly-xtool/`). È il caso più
> scomodo e l'ho verificato apposta: navigazione a clic, link diretti e
> "apri in una nuova scheda" funzionano identici alla radice. Se però **digiti**
> un indirizzo a mano, il prefisso ci vuole:
> `…github.io/website-ingly-xtool/materiali/legno/`.

---

## Modo 2 — in locale

Serve Node 18 o superiore.

```bash
git clone https://github.com/inglyum/website-ingly-xtool.git
cd website-ingly-xtool
npm install
npx serve .
```

Poi **http://localhost:3000**.

> Non aprire `index.html` con un doppio clic: da `file://` il browser blocca
> i moduli. (Esiste una riserva che fa partire comunque il sito, ma non è il
> modo in cui va provato.)

---

## Modo 3 — i controlli automatici

```bash
npm test
```

**886 controlli, 16 suite.** Devono essere tutti verdi. Fra questi, 42 nuovi
in `tests/test-lab.mjs` che verificano il grafo materiali ↔ tecnologie ↔
macchine ↔ prodotti sui dati veri del repository.

Se tocchi i dati, rigenera prima:

```bash
npm run build                      # riserva + bundle di fallback
node scripts/prerender.mjs         # le 92 pagine statiche
node scripts/generate-sitemap.mjs  # i 93 indirizzi
```

---

# Cosa guardare, in ordine

## 1. Material Lab — `/materiali`

Dieci pastiglie, una per materiale, con il conteggio delle creazioni vere.

**Apri Plexiglass.** È la scheda più completa e mostra tutto quello che il
Lab sa fare:

- **Come lo lavoriamo** → le tecnologie, cliccabili
- **Lavorazioni · Usi · Consigli · Da sapere prima** → quattro colonne
- **Spessori · Finiture · Su quali macchine**
- **Creazioni in questo materiale** → prodotti veri dal catalogo unico
- **Domande frequenti**

> La prova che conta: le creazioni **non** sono una lista scritta a mano.
> Arrivano dal catalogo tramite `materiale.cat ↔ prodotto.mat`. Cambia il
> materiale di un prodotto nell'Admin e sparisce da una scheda e compare
> nell'altra, senza che nessuno aggiorni niente.

## 2. La ricerca guidata — in fondo a `/materiali`

Due tendine: *su cosa* e *cosa vuoi fare*. Prova queste tre:

| Scegli | Cosa deve rispondere |
|---|---|
| Metallo | Fibra, MOPA, UV — le tre che lo lavorano davvero |
| Legno + Stampare a colori | **solo** Stampa UV |
| **Metallo + Tagliare una forma** | **«Questa combinazione non la lavoriamo»** |

Il terzo caso è il punto. Il metallo qui si marca, non si taglia: la guida
dice che non si fa invece di proporre una tecnologia che non lo esegue.
**Una risposta sbagliata costa più del silenzio.**

## 3. Technology Hub — `/tecnologie`

Sei tecnologie. **Apri Stampa UV diretta**: processo numerato passo per
passo, materiali che lavora (cliccabili, si torna al Lab), applicazioni,
macchine, creazioni, FAQ.

Nota il giro completo: **Plexiglass → Stampa UV → Plexiglass**. Il grafo si
attraversa nei due versi.

## 4. Machine Lab — `/macchine`

Le quattro macchine con le specifiche reali, cosa si sblocca combinandole,
e in fondo **«Quello che non lavoriamo, e perché»** — PVC, policarbonato,
ABS, Teflon, fibra di carbonio, pelle conciata al cromo, ognuno con la sua
ragione. Chi cerca *«si può incidere il PVC»* ora trova una risposta.

## 5. Che niente si sia rotto

`/` · `/shop` · una scheda prodotto · `/business/ristoranti` · `/digital` ·
`/portfolio` · `/quote` · `/faq`. Cambio lingua IT/EN, tema chiaro/scuro,
filtri del catalogo, wishlist, carrello.

## 6. Quello che i motori AI vedono

È il motivo per cui il prerender esiste. Senza eseguire JavaScript:

```bash
curl -s https://inglyum.github.io/website-ingly-xtool/materiali/plexiglass/ \
  | sed -n 's/.*<div id="prerender"[^>]*>\(.*\)/\1/p' | head -c 600
```

Deve uscire testo vero — titolo, descrizione, tecnologie, prodotti — non una
pagina vuota. Lo stesso contenuto che vedi nel browser, da una sola fonte.

## 7. Telefono

Restringi sotto i 600 px o aprilo dal telefono. Verificato a 390 px: niente
esce dai bordi su nessuna delle pagine nuove.

---

## Quello che NON c'è ancora

Lo dico prima, così non lo cerchi:

- **Academy / corsi** — il brief chiedeva corsi con durata, livello,
  prerequisiti e programma. Inventare trenta corsi che non eroghi,
  presentandoli come offerta reale, è un'altra cosa dallo scrivere che il
  legno brucia. Il modello dati è pronto: **mandami i corsi che fai davvero**
  e li monto.
- **Project Lab** — stesso motivo: servono i progetti veri.
- Scheda prodotto estesa, filtri combinabili, gestione del Lab dall'Admin.

## Se qualcosa non torna

| Sintomo | Cosa guardare |
|---|---|
| Pagina bianca aprendo un file | Stai usando `file://`: serve `npx serve .` |
| Una sezione del Lab è vuota | Console del browser: `[INGLY] Lab non disegnato` dice cosa manca |
| Un link porta a un 404 | Stai digitando l'indirizzo senza `/website-ingly-xtool/` |
| `npm test` lamenta la sitemap | `node scripts/generate-sitemap.mjs` |
