# Audit Anon ecommerce → INGLY Signature Commerce

Data: 14 ottobre 2026

## Sorgente studiata
Archivio inviato dall'utente `anon-ecommerce-website-master.zip`: 90 voci, HTML/CSS/JS statici con immagini fashion, README senza una licenza formale separata. Modello visivo: header con ricerca, navigazione mobile, categorie, sidebar, filtri, griglie prodotti, banner, overlay, accordions, schede promozionali e toast. Non contiene checkout server-side, inventario persistente, credenziali, backoffice o gestione ordini.

**Non sono stati copiati codice, immagini fashion, logo, icone del template o CSS proprietario.** Sono stati ripresi pattern e criteri d'uso ricostruiti appositamente per INGLY. Non impostare Anon come backend.

## Problemi trovati nella codebase INGLY
| Priorità | Evidenza | Soluzione |
| --- | --- | --- |
| Alta | `pages.css` contiene blu brillante hardcoded su nav, pulsanti, hero ed effetti; `premium-2026.css` ha un secondo set di colori (petrolio e titanio). | Sistema di override centralizzato nel foglio `pages.css` caricato su tutte le rotte |
| Alta | Home carica `premium-2026.css` ma pagine prerender come `business/index.html`, `shop/index.html` non lo caricano. | Le regole fondamentali ora vivono in `pages.css`. Non dipendere dal CSS esclusivo Home per componenti comuni |
| Alta | `business` esibiva una striscia con nomi aziendali non verificati e una quantità produttiva non confermata. | Rimossi i nomi e la promessa quantitativa; immagine dimostrativa e copy specifico |
| Media | La CTA secondaria Business `Richiedi catalogo` apriva lo stesso preventivo della CTA principale. | Seconda CTA conduce a Materiali |
| Media | Hero animata, anelli e card sovrapposte occupavano spazio sul prodotto. | Vetrina fotografica singola, anelli nascosti, micro-motion discreta |
| Media | Data source JSON e fallback `data/config.js`/`data/i18n.js` discordanti, con claim obsoleti nel fallback. | Rigenerazione coerente dei due fallback dai JSON aggiornati |
| Media | Vecchie schede materiali illustrate a dimensione eccessiva; griglia Home già corretta in PR precedente. | Mantenuto il layout compatto 16:9 e migliorata la resa su pagine interne |

## Pattern adottati
1. **Header ecommerce**: gerarchia del brand, voci pulite, contenuto presente a colpo d'occhio, interazioni tastiera.
2. **Design tokens**: Ivory Light (#f8f7f4) e Titanium Dark (#111318), grafite e champagne (#c5a46d), accenti coerenti.
3. **Card e griglie**: immagini con ratio definito, radius modulato, bordi sottili, ombre solo dove aiutano.
4. **Commerce CTA**: primary per azione principale, ghost per esplorazione, stati hover e focus.
5. **Filtri e input**: superfici coerenti, contrasti accessibili e outline visibile.
6. **Business merchandising**: immagine contestuale con indicazione di esempio e preventivo realmente collegato.
7. **Mobile**: layout 1 colonna nelle zone editoriali e responsività sulle griglie.
8. **Motion**: stop alle rotazioni dell'hero, respect prefers-reduced-motion.

## Vincoli
- Conservate tutte le 7 aree top-level, Shop, Personalizza, Materiali, File Digitali, Academy, xTOOL Lab e Business.
- Checkout attuale **WhatsApp/quote**, non trasformato in finto checkout.
- Media riutilizzati dal catalogo INGLY, senza appropriazione di asset di altri marchi.
- `data/*.json` rimane sorgente di verità per il CMS; script JS legacy rigenerati soltanto come fallback.
- Il catalogo e le relazioni prezzo/varianti non sono stati alterati.
- Compiti ancora aperti: fotografie originali di ogni prodotto/materiale, validazione visuale su browser reali e test end-to-end checkout/admin. La suite CI non è un test manuale cross-browser.

## Percorsi prioritari per QA
`/`, `/shop`, `/product/1`, `/personalizza`, `/materiali`, `/digital`, `/academy`, `/macchine`, `/business`, `/admin.html`.

Testare in modalità chiara/scura, italiano/inglese, viewport 390 / 768 / 1440, back/forward, navigation deep-link e ricerca senza risultati.
