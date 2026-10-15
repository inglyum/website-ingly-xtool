# INGLY DESIGN — Protocollo di collaudo accessibilità reale
Versione 2026-10-16 · Stato: **da eseguire su dispositivi fisici**.

Questo documento completa (non sostituisce) l'audit Chromium automatico su 64 combinazioni responsive, 11 flussi tastiera, 20 controlli axe WCAG e il rapporto cromatico in `artifacts/`.

## Evidenze obbligatorie
Registrare per ogni prova: dispositivo/modello, sistema operativo, browser e versione, screen reader e versione, tema, lingua, URL, data, tester, comportamento atteso, risultato PASS/FAIL, video o screenshot, issue GitHub. Nessuna certificazione WCAG viene dichiarata senza test manuali, controllo semantico e verifica dei contenuti.

## Matrice minima
| Ambiente | Modalità | Pagine da controllare |
| --- | --- | --- |
| iPhone Safari + VoiceOver | Giorno/Notte, IT/EN | Home, Shop, Prodotto, Personalizza, Admin |
| Android Chrome + TalkBack | Giorno/Notte, IT/EN | Home, Shop, Prodotto, Personalizza, Admin |
| Windows Chrome + NVDA | Giorno/Notte, IT/EN | Home, Shop, Prodotto, Admin |
| Tastiera senza mouse (desktop) | Giorno/Notte | Home, Shop, Carrello, Modali, Admin |

## Checklist per percorso
### Navigazione globale
1. Il nome del sito è annunciato come “INGLY DESIGN”, non “NGLY” o lettere mancanti.
2. È possibile saltare al contenuto principale; l'intestazione di pagina segue un ordine comprensibile.
3. Il menu hamburger annuncia se è espanso, può essere aperto/chiuso con tastiera/screen reader; Esc funziona su desktop.
4. Quando si entra in una pagina dal menu il focus passa al contenuto; il menu chiuso non resta navigabile.
5. IT/EN alterna etichette, messaggi di errore e nomi accessibili; le abbreviazioni lingua sono identificabili.

### Catalogo e prodotti
1. Ogni card espone nome, disponibilità, prezzo (solo se configurato), apertura e aggiunta al carrello.
2. Il prodotto senza fotografie non mostra immagini spezzate, zoom vuoto né falso scatto fotografico.
3. Le immagini disponibili hanno descrizione alternativa utile; le miniature decorative non vengono annunciate ripetutamente.
4. Se `stock=0`, il prodotto non può entrare nel carrello; le quantità rispettano lo stock, anche tra varianti.
5. La selezione dei filtri è annunciata, raggiungibile con tastiera e non causa perdita della posizione.

### Carrello e checkout
1. All'apertura il focus è dentro il carrello e non può andare sotto l'overlay.
2. Pulsanti quantità e rimozione hanno etichette contestualizzate; i cambiamenti sono comprensibili.
3. Esc o il pulsante di chiusura restituiscono il focus al controllo iniziale.
4. Se lo stock cambia, l'utente viene informato prima di confermare l'ordine.
5. WhatsApp è descritto come richiesta/trasmissione dell'ordine; non compare una falsa conferma di pagamento.

### Media Library e Admin
1. La pagina Admin è utilizzabile a 320–390 px senza scorrimento laterale della pagina.
2. Le finestre di modifica hanno nome, ruolo dialogo e focus intrappolato; Esc e annulla funzionano.
3. Le fotografie mancanti si distinguono da quelle esistenti, con stato associato al prodotto/SKU.
4. Prima di sovrascrivere una copertina pubblicata viene chiesta conferma.
5. La pubblicazione è distinta dalla bozza; errori e risultati della pubblicazione sono annunciati.

## Contrasti e target
- Testo normale: **almeno 4,5:1**; testo grande: **almeno 3:1**, secondo WCAG AA.
- Componenti non testuali e indicatori di focus: almeno **3:1** rispetto allo sfondo pertinente.
- Controllare anche gli stati disabilitato, hover/focus, placeholder, watermark e testi su gradienti e fotografie.
- Target mobili idealmente ≥ 44 × 44 CSS px per le principali azioni, documentare eventuali eccezioni.
- Prova zoom 200% e 400%, orientamento portrait/landscape, preferenza movimento ridotto.
- Un risultato automatico “0 violazioni” non copre tutte le verifiche visive e assistive.

## Rilascio e difetti
P0: blocchi della navigazione da tastiera/screen reader, controlli irraggiungibili, testi essenziali illeggibili, checkout falsamente confermato. P1: descrizioni foto inaccurate, microcopy incompleto, controlli piccoli, focus incoerente. Associare a ogni P0/P1 una issue, uno screenshot prima/dopo e un test di regressione replicabile.

## Dipendenze dichiarate
- Le fotografie commerciali originali mancanti non possono essere generate o sostituite automaticamente fingendo prodotti reali.
- I test su dispositivi fisici e con screen reader devono essere effettuati da persone con accesso all'hardware.
- La calibrazione Print & Cut/kerf e il controllo degli output laser necessitano prove sulle macchine e sui materiali reali.
