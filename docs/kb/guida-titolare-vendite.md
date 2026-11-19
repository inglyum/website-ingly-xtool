# Guida del titolare — vendite e contatti

Aggiornata il 19 novembre 2026. Tre cose da fare una volta sola, poi i
messaggi WhatsApp pronti da copiare.

## 1. Statistiche (GoatCounter) — 1 minuto

Il sito è già collegato al tuo GoatCounter **ingly**
(<https://ingly.goatcounter.com>): appena la nuova versione è pubblicata,
le visite iniziano a contare.

1. Apri l'email «Welcome to GoatCounter!» del 19 novembre e clicca il link
   di verifica.
2. Cambia la password di GoatCounter: quella attuale è stata scritta in
   chiaro in una chat.

Cosa vedi nel pannello, oltre alle pagine visitate (sezione **Events**):

| Evento | Cosa significa |
|---|---|
| `whatsapp` | qualcuno ha toccato un link WhatsApp |
| `preventivo-inviato` | è arrivato un preventivo dal modulo |
| `newsletter-iscritto` | nuova iscrizione |
| `richiesta-carrello-whatsapp` / `-email` | richiesta dall'elenco dei preferiti/carrello |
| `demo-cliccata` | clic verso la demo xTool |

Le statistiche sono senza cookie: non serve il banner del consenso.

## 2. Moduli di preventivo e newsletter (FormSubmit) — 3 minuti

Il sito manda già le richieste a **inglydesign@gmail.com** tramite
FormSubmit (gratis, senza account, accetta le foto allegate). Va solo
attivato una volta: finora nella casella non è arrivata nessuna email di
FormSubmit, quindi non è mai stato attivato.

1. Admin → **Contatti & Social** → «Preventivi e iscrizioni via email (FormSubmit)».
2. Premi **«Invia richiesta di prova»**.
3. Nella casella Gmail arriva «Action required: Activate FormSubmit…»
   (controlla anche Spam e Promozioni): clicca **Activate Form**.
4. Rimanda una prova: deve arrivare la richiesta vera.
5. Spunta «Ho confermato l'attivazione e la prova mi è arrivata» e pubblica.

Facoltativo: FormSubmit dopo l'attivazione dà un codice segreto; incollalo
nel campo «Codice segreto», così l'email non compare nel codice del sito.

## 3. Recensioni Google

Sul sito ci sono solo 2 recensioni. Le recensioni vere sono la cosa che
convince di più chi non ti conosce.

1. Prendi il link «Chiedi recensioni» dal tuo Profilo dell'attività su
   Google (Google Maps → la tua attività → Condividi modulo recensione).
2. Usalo nel messaggio qui sotto, dopo ogni consegna.
3. Ogni tanto mandami le recensioni nuove: le mettiamo sul sito, solo
   quelle vere, con nome e data.

## Messaggi WhatsApp pronti

**Dopo la consegna — richiesta di recensione**

> Ciao {nome}! Spero che {prodotto} ti sia piaciuto 😊 Se hai un minuto,
> una tua recensione ci aiuta tantissimo: {link recensione Google}.
> Grazie da tutto il laboratorio INGLY DESIGN!

**Risposta a una richiesta per Natale**

> Ciao {nome}, grazie! Per {prodotto} ci servono 7 giorni lavorativi di
> produzione più la spedizione: se approvi la bozza entro mercoledì 9
> dicembre, arriva prima di Natale. Ti mando la bozza appena mi dai
> testo/foto.

La stessa scadenza (9 dicembre) è scritta nella barra in alto del sito e
nell'introduzione della raccolta Natale. La barra torna da sola al testo
normale dal 10 dicembre; l'introduzione della raccolta va aggiornata a
mano dopo quella data (è in `data/collezioni.json`, raccolta `natale`).

**Preventivo inviato, nessuna risposta dopo 3 giorni**

> Ciao {nome}, ti scrivo per il preventivo di {prodotto}: hai bisogno di
> qualche modifica o di un'altra idea? Per Natale i posti in laboratorio si
> stanno riempiendo, così ti tengo il tuo.

Il messaggio che il cliente ti manda dalla scheda prodotto contiene già
prodotto, materiale, quantità, testo da incidere, link e la riga
«Mi serve entro:».

## Cosa manca ancora (da te)

- **Foto**: 44 prodotti su 56 sono scritti ma senza foto, quindi non si
  vedono. Da quali partire, categoria per categoria:
  `docs/kb/priorita-prodotti-foto.md` (le prime 12 entro fine novembre,
  per Natale). Elenco completo dei file in `docs/CATALOGO-FOTO-DA-CARICARE.md`.
- **Costo di spedizione** per l'Italia (Admin → Contatti & Social →
  Spedizioni). I tempi di produzione sono già impostati a 7 giorni
  lavorativi.
- **«Supereroi Ghibi» (ID 20)**: la foto mostra un personaggio Marvel.
  Vendere personaggi con licenza senza autorizzazione è rischioso: decidi
  se tenerlo, cambiarlo o nasconderlo.
