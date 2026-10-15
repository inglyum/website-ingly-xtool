# INGLY DESIGN — E-commerce Skills Playbook v1
**Fonte:** archivio caricato dall'utente \`eCommerce-Skills-main (1).zip\` (Nexscope AI, licenza MIT).  
**Stato:** selezione criticamente esaminata, tradotta in flussi operativi per il repository statico INGLY DESIGN. Questo documento **non** installa le skill in un modello AI né importa codice di terzi.

## Provenienza e limiti
- L'archivio contiene **162** documenti \`SKILL.md\` (conteggio effettivo dei file). Il README dichiara 157 in una sezione e 142 nei comandi: la differenza è presente nel materiale originale, non la correggiamo attribuendo un numero ufficiale arbitrario.
- Molte skill sono guide strategiche in Markdown, soprattutto checklist e prompt. Non sono plugin ecommerce completi, API di Shopify/Medusa o pacchetti UI pronti all'uso.
- I file Python inclusi in alcune cartelle sono codice di terzi **non integrato**: prima di eseguirlo serviranno revisione sicurezza, dipendenze, autorizzazioni e verifica della licenza.
- La licenza dichiarata è MIT, Copyright (c) 2026 Nexscope AI. Se in futuro importiamo codice o documentazione sostanziale, conserveremo copyright e testo della licenza.
- Gli indici, benchmark e riferimenti al mercato delle skill non sostituiscono dati Analytics dell'attività, controlli legali italiani o test su dispositivi reali.

## Skill selezionate e applicazione nel progetto

| Skill contenuta nello ZIP | Adattamento a INGLY | Primo controllo |
|---|---|---|
| \`ecommerce-branding\` | Identità Notte & Oro, tipografia e immagini coerenti, claim verificabili | Audit design visuale di Home, Shop, Business, Admin |
| \`ecommerce-landing-page\` | Hero con benefici, CTA Personalizza e Shop, mobile-first | Link corretti + elementi accessibili |
| \`conversion-rate-optimization\` | Ridurre passi per richieste di personalizzazione, preventivi, checkout WhatsApp | Percorso Home → Prodotto → Personalizza → Richiedi |
| \`shopify-conversion-optimization\` | Adattare la disciplina di ottimizzazione, NON introdurre Shopify backend | Carrello, testi spedizione, sicurezza e offerte veritiere |
| \`product-page-seo\` | Titoli e descrizioni IT/EN, categorie, alt, schema senza recensioni false | Quality Engine + QA |
| \`shopify-seo\` | Canonical/hreflang, sitemap e duplicazioni tra route prerender | Suite esistente \`seo-engine\` e sitemap |
| \`shopify-product-photography-guide\` | Asset reali dei prodotti, dettagli incisione, copertine per materiale e varianti | Foto per scheda, licenze, srcset, WebP |
| \`shopify-speed-optimization\` / \`shopify-page-speed\` | Budget foto, priorità Hero, lazy loading, riduzione CSS legacy | Lighthouse reale e test dispositivi |
| \`ecommerce-personalization\` | Anteprima del nome, materiale e font: dati e disponibilità reali | Nessuna promessa di incisione identica alla simulazione |
| \`etsy-custom-orders\` | Brief personalizzazione e chiara conferma prima della produzione | Modulo preventivo con file e note |
| \`etsy-digital-products\` | Licenza, formato, compatibilità e consegna per ogni bundle pubblicato | Non vendere bozza o file senza delivery |
| \`ecommerce-checkout-optimization\` | Chiarire costi e modalità del checkout attualmente attivo | Mai badge pagamenti inventati |
| \`localization-testing\` | IT/EN per titoli, CTA, asset alt e stati vuoti | Audit traduzioni + test visuale |
| \`visual-regression-testing\` | Screenshot desktop/mobile a confronto prima del merge | QA Playwright da implementare se runtime CI lo consente |
| \`ecommerce-ab-testing\` | Ipotesi/test misurabili solo dopo raccolta dati conforme privacy | Non fingere A/B test senza traffico tracciato |

## Motore qualità integrato (prima implementazione)
**Codice condiviso:** \`assets/js/ecommerce-quality.mjs\`  
**Admin:** Health Center → Qualità ecommerce · INGLY Skills  
**CLI:** \`node scripts/ecommerce-audit.mjs\`, \`--json\`, opzionalmente \`--strict\`  
**Test CI:** \`node tests/test-ecommerce-quality.mjs\`

Analizza **la bozza attualmente aperta nell'Admin**, non solo il catalogo pubblicato. Controlla:
1. Prodotti visibili senza foto, nome IT/EN o descrizione IT.
2. Categorie inesistenti, copertine mancanti, percorsi immagini insoliti o dipendenza da URL esterni.
3. Materiali senza nome italiano.
4. Hero priva di immagine o alt IT; distingue concept illustrativo da lavorazione reale.
5. Bundle digitali pubblicati senza modalità consegna reale, link HTTPS o licenza.
6. Modalità WhatsApp del checkout, senza assumere che un gateway online sia attivo.

Le anomalie vengono classificate **critico / avviso / informazione**, con riferimento all'ID e suggerimento di correzione. È possibile esportare il report JSON e filtrare le priorità fuori dal CMS. I controlli sono euristici: immagini presenti non sono necessariamente giuste, alt compilato non garantisce accessibilità, sintassi corretta non garantisce vendita.

**Non fatto:** nessun dato cliente, incasso, traffico o tasso di conversione è stato letto, stimato o inventato; nessuna modifica automatica a prezzi, prodotti, asset, pagamenti o ordini.

## Roadmap per rendere il sito e l'Admin di livello commerciale

### Priorità A — Baseline e affidabilità
- Una sola fonte dei token grafici; inventario CSS e sovrascritture in conflitto.
- Foto Hero prodotto reali/illustrative con provenienza documentata e autorizzazioni.
- Test visivi per Home, Shop, Prodotto, Personalizza, Materiali, Lab, Business e Admin.
- Core Web Vitals misurati su sito pubblicato, non assunti sulla base dei punteggi di un tema.
- Pubblicazione Admin con cronologia, anteprima, controllo dei collegamenti e rollback.

### Priorità B — Catalogo e configuratore
- Completa le fotografie dei prodotti più visitati; assegna asset pertinenti per ogni materiale.
- Mostra varianti visuali che corrispondono realmente a materiale/finitura/prezzo.
- Personalizzazione: preview fedele e salvabile **solo quando** geometria, font e compatibilità reali sono validati.
- Zero badge fittizi "pagamento sicuro", urgenza artificiale, recensioni simulate o tempi garantiti senza evidenza.

### Priorità C — Vendita e automazione
- Digital Store con file effettivamente consegnabili, licenze verificate e link protetti.
- Workflow richieste preventivo, caricamento logo, prova grafica e conferma cliente.
- Misurazione funnel (con consenso e corrette informative) per migliorare conversione.
- Un eventuale backend Medusa/Shopify richiederebbe scelte separate su server, API, database e pagamenti: queste skill NON installano un backend.

## Modalità di lavoro proposta per ogni modifica futura
1. **Audit dal dato reale** → Health Center + stato screenshot.
2. **Piano con invarianti** → URL, prezzi, carrello, Media Library, permessi, pubblicazione.
3. **Implementazione minima** → componenti responsive, dati CMS, zero mock spacciati per reali.
4. **Test automatici** → catalogo, schema, HTML, traduzioni, componenti; regressioni.
5. **Verifica manuale** → desktop/mobility + diversi stati del carrello/configuratore.
6. **PR e deploy** → merge solo a test superati; controllo pubblicazione GitHub Pages.

## Riferimenti nel bundle caricato
Tutte le skill indicate sopra sono riferite ai rispettivi file \`<nome-skill>/SKILL.md\` dell'archivio originale. Questo documento è una sintesi operativa originale per INGLY e non ripubblica le guide Nexscope.
