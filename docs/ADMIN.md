# INGLY DESIGN — Guida del pannello Admin

Il sito usa un CMS statico: le modifiche non vanno online quando si modificano i campi. Vanno nella **bozza locale** finché si apre **Pubblica**, si verificano i dati e si invia un **commit unico** a GitHub. L'accesso a `admin.html` non sostituisce i permessi GitHub del proprietario.

## Entrare nell'Admin

1. Apri `https://inglyum.github.io/website-ingly-xtool/admin.html`.
2. Apri **Impostazioni** e configura il repository `inglyum/website-ingly-xtool` e un token GitHub fine-grained con accesso esclusivo a questo repository.
3. Controlla nella barra in alto lo stato di sincronizzazione.
4. Modifica i contenuti. La scritta **modifiche in bozza** significa che non sono ancora visibili ai visitatori.
5. Apri **Pubblica** e leggi gli errori bloccanti prima di inviare il commit.

## Materiali: creare, modificare, archiviare

Vai in **Lab → Negozio materiali PRO**.

- **Nuovo**: aggiunge un materiale in bozza, con ID nuovo. Inserisci i nomi IT/EN, la categoria commerciale (`cat`: usata per i collegamenti con i prodotti), il riepilogo, la descrizione e le tecnologie/macchine reali. Non inventare capacità del laboratorio.
- **Modifica**: apri la freccia della scheda. Modifica i campi, descrizioni e consigli in italiano e inglese. La scheda originale resta identica finché non salvi la bozza.
- **Varianti commerciali**: usa **Aggiungi** per formato, colore, spessore, SKU, prezzo e stock. **Prezzo vuoto** vuol dire *su richiesta*, non €0. Per lo stock usa un intero reale, altrimenti lascia il campo vuoto. Non impostare vendita attiva senza dati verificati.
- **Archivia**: nasconde il materiale dal catalogo senza cancellarne l'ID. **Ripristina** recupera lo stato precedente. Per riordinare usa ↑/↓ o trascina le schede.

Non modificare `cat` nei materiali già usati dai prodotti, senza verificare tutte le relazioni; potresti far sparire i prodotti dalle schede del Lab.

## Macchine: catalogo e modelli in officina

Vai in **Lab → Catalogo macchine PRO**.

- **Nuovo**: registra il modello xTool in bozza, senza assegnargli automaticamente capacità, watt o un prezzo.
- **Modifica**: inserisci nome e ruolo IT/EN, famiglia, applicazioni, utilità e limiti reali, data e URL della fonte.
- **Specifiche tecniche**: scrivi valori numerici soltanto dopo una verifica sulla documentazione ufficiale xTool. Finché mancano, tieni **Specifiche in verifica** attivo.
- **In officina**: selezionalo solamente se quella macchina è presente fisicamente. **Demo disponibile** è un'informazione distinta da assistenza.
- **Fotografie**: ogni immagine caricata nella galleria richiede `alt` in italiano e inglese; l'upload usa la stessa coda immagini del pannello principale e viene pubblicato insieme ai dati.
- **Duplica**, **Archivia**, **Ripristina** e **riordina**: mantengono gli ID storici e non creano una nuova pubblicazione separata.

La pagina pubblica `/macchine` presenta anche i modelli **non** presenti in officina come voci informative, con filtro per famiglie tecnologiche e confronto di massimo tre modelli. Le capacità incompiute non sono una promessa commerciale.

## Digitali

Apri la tab **Digitali**. I bundle esistenti sono **bozze**: per pubblicarne uno servono contenuto effettivo, compatibilità, licenza e modalità di consegna. Senza un sistema verificato non promettere download istantanei. L'Admin controlla i dati essenziali prima di pubblicare.

## Generatori

Apri **Creative Tools → Generatori INGLY** per le voci di catalogo, titoli e link. Una voce non crea un nuovo algoritmo: i motori SVG richiedono codice, prove e test sulle dimensioni, gli incastri e il materiale. I file vanno sempre provati sul materiale prima di tagliare.

## Stato delle funzioni previste

I pannelli autonomi **Gadget**, **Accessori**, gli editor completi di ogni testo/foto, l'editor grafico di personalizzazione, la migrazione universale al dialog e gli esportatori industriali fanno parte della roadmap ma **non sono ancora disponibili** in questo aggiornamento. Consulta `docs/PIANO-ADMIN-TOTALE.md`: evitare di dare per implementata una funzione solo perché esiste un campo nello schema.

## Prima di pubblicare

1. Leggi la lista degli errori in **Pubblica**. Gli ID duplicati, i prezzi negativi e gli alt delle immagini mancanti bloccano la pubblicazione.
2. Verifica che prezzo e stock rispecchino quelli reali.
3. Non archiviare dati ancora collegati senza controllare il risultato sul sito.
4. Controlla il sito sia in modalità chiara sia scura e su smartphone.
5. Apri le GitHub Actions del repository: una QA verde deve precedere il merge di codice. Per le modifiche a `assets/js/` esegui `npm run build`, seguita da `npm test`.

**Nota tecnica:** il pannello carica i JSON e pubblica i dati, mentre gli interventi ai generatori e al sito richiedono una revisione del codice tramite pull request, non si aggiornano modificando l'Admin.
