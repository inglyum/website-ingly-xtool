# INGLY ATELIER — Fase 1, design system e componenti

**Branch:** feature/atelier-light-phase-1-2026  
**Stato:** proposta da mostrare e approvare prima di cambiare header e Home.

## Obiettivo
Metafora: **la luce che dà forma alla materia**. Linguaggio premium per la manifattura personalizzata senza imitare la comunicazione o copiare il codice di Shopify, Medusa o Anon.

## Token implementati
| Concetto | Dark (predefinito) | Light |
| --- | --- | --- |
| Sfondo | #14121c | #f4efe7 |
| Superficie | #211f2e | #fffdf9 |
| Titoli | #f6f0e8 | #261f2a |
| Testo secondario | #d2c9c6 | #655b61 |
| Raggio / CTA | #ff7a2f | #bf4710 |
| Cyan tech | #39d0ff | #006e92 |

I nomi storici `--blue`, `--laser`, `--signature-gold` sono temporaneamente mappati ai nuovi token: i vecchi componenti continuano a funzionare senza mescolare i colori. Nelle fasi successive saranno gradualmente sostituiti dai token `--at-*`.

## Tipografia
- **Fraunces** con fallback Playfair/Georgia per titoli.
- **Inter** per testi e bottoni.
- **JetBrains Mono** per eyebrow e metadati tecnici.
- Scala tipografica fluida con `clamp`; spaziatura modulare di 8px.

## Componenti adattati nella prima fase
- Pulsanti primari, secondari, blu-legacy; stati focus e hover.
- Chip di filtri e configuratore.
- Card prodotto, materiale, B2B e percorso; bordi e shadow leggeri.
- Campi ricerca e preventivo.
- Bande, hero surfaces, footer e card xTOOL.
- Sfondo generale, dark/light toggle e colori coerenti anche sulle pagine statiche.
- Rispetto di `prefers-reduced-motion`.

## Contrasti
Test automatico per testo e CTA con rapporto minimo WCAG AA 4,5:1 sui colori base.

## Conservato senza modifiche
URL, route, navigazione corrente, cart, checkout WhatsApp, prodotti, prezzi, Media Library, Admin, backend di pubblicazione e dati commerciali.

## Fasi successive dopo approvazione
F2 Header/footer, mobile menu, icone SVG;
F3 Home narrativa / primo configuratore non simulato;
F4 Shop / prodotto;
F5 configuratore vero e media;
F6 Lab / Business;
F7 animazioni e performance.

### Vincoli di comunicazione
Non dichiarare preventivo in 24h, sconto newsletter del 10%, vere foto prodotto, pagamenti attivi o assistenza ufficiale più ampia di quanto documentato. Le nuove foto dovranno essere fornite o correttamente licenziate. Nessuna promozione di contenuti mock come testimonianze reali.

### Test
`node tests/test-atelier-foundation.mjs`, `npm test`, preview reale con Playwright/Chromium e verifica responsive sulle 10 route richieste nelle fasi pertinenti.

## Raffinamento approvato: trasparenze, effetti e navigazione (15 ottobre)
- Superfici semitrasparenti dark/light e ombre morbide su card e sezioni, senza illuminazioni neon permanenti.
- Navbar traslucida con blur 22px e pannelli mega-menu vetrati con fallback opaco.
- Hero con due aureole statiche calde, trama laser molto discreta e riflesso sulla fotografia solo al passaggio del mouse.
- Sheen breve sui pulsanti ambra, card con sollevamento di 4px solo con mouse e preferenze di movimento standard.
- Tipografia dei titoli più caratteristica, enfatizzazioni corsive e ritmo/ampiezza più uniformi.
- Header: CTA diretta “Crea il tuo pezzo” per desktop; mobile: dock Shop / Personalizza / WhatsApp / Carrello che riutilizza azioni esistenti.
- Footer: colonne fluide, migliore separazione visiva e gerarchia tipografica.
- Ottimizzazione: niente backdrop-filter sulle decine di schede prodotto, solo su header e pannelli rilevanti.
- IT/EN per la nuova CTA nell'origine JSON e nel fallback JS; controlli automatici aggiornati.

Nessun cambio ai prezzi, alla logica dei pagamenti, al configuratore o alle rotte; il caricamento degli asset è invariato.
