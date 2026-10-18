# Pagamento con carta (Stripe) — come attivarlo

**Stato:** predisposto e **spento** (`data/config.json → checkout.stripe.attivo: false`).
Decisione di ottobre 2026: il negozio principale passa a Shopify (opzione C); sul sito
resta pronta la struttura Stripe (opzione A), da accendere solo se serve.

## Come funziona

Il sito è statico (GitHub Pages): non può creare pagamenti da solo. Per questo usa
**Stripe Payment Links**: un link per prodotto, creato nella dashboard Stripe.
Il cliente clicca «Paga con carta», paga sulla pagina sicura di Stripe e torna al sito.

- **Nessuna chiave Stripe va mai nel sito né nell'Admin.** Servono solo i link
  `https://buy.stripe.com/…`, che sono pubblici come un link WhatsApp.
  Admin e CI bloccano la pubblicazione se trovano una chiave (`sk_live_…`, `rk_live_…`).
- Il bottone compare **solo** se: interruttore acceso **e** quel prodotto ha il suo link
  **e** il prodotto è visibile con un prezzo. Tutti gli altri restano a preventivo
  WhatsApp/email, come oggi.
- Un link che non inizia con `https://buy.stripe.com/` non diventa mai un bottone.

## Attivazione, passo per passo

1. **Stripe** → Prodotti → crea il prodotto con lo **stesso prezzo** del sito.
2. Crea un **Payment Link** per quel prodotto. Consigliato:
   - «Consenti ai clienti di modificare la quantità»;
   - un **campo personalizzato** «Testo da incidere» (per i prodotti personalizzabili);
   - raccolta dell'indirizzo di spedizione (solo Italia, se è il caso);
   - pagina di conferma con un messaggio sui tempi (confermati da te, non promessi).
3. **Admin → Prodotti → modifica** → incolla il link in «Stripe Payment Link».
4. **Admin → Contatti & Social → Pagamento con carta (Stripe)** → «Acceso».
5. **Pubblica tutto.** `validaBozza()` controlla i link prima di pubblicare.

## Da sapere

- **Il prezzo lo decide Stripe**, non il sito: se cambi un prezzo nell'Admin, cambialo
  anche in Stripe (altrimenti il cliente vede un prezzo e ne paga un altro).
- Il carrello con più prodotti resta a preventivo: i Payment Links pagano un prodotto
  alla volta. Un carrello pagabile con più prodotti richiede un piccolo servizio esterno
  (es. Cloudflare Worker con Stripe Checkout) — da valutare solo se serve davvero.
- Per spegnere tutto in un istante: Admin → «Spento» → Pubblica.

## Dove sta il codice

| Cosa | Dove |
|---|---|
| Regola «quando mostrare il bottone» | `assets/js/commerce.js` → `stripeProdotto()` |
| Bottone nella scheda prodotto | `index.html` → `#productContactStripe`, disegnato da `products.js` |
| Interruttore e link | `data/config.json` → `checkout.stripe.attivo`, `stripeLinks` |
| Controlli | `admin.html` → `validaBozza()`, `scripts/validate-data.mjs` |
| Test | `tests/test-stripe-predisposto.mjs` |
