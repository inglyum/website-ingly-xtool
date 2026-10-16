# INGLY DESIGN — Sprint 01: Foundation & Navigation

## Stato e baseline
La PR #60 risulta già integrata su main (commit 0aabf9a9). Lo sprint prende main come riferimento, preservando la diagnostica foto che distingue inventario non disponibile e zero foto mancanti.

## Componenti e fonte unica
assets/css/foundation-components.css definisce i token condivisi e i cinque contratti visivi. Ogni pagina lo importa prima della propria integrazione cromatica finale; non si crea una terza implementazione della navbar.

| Componente | Contratto DOM | Ruolo |
|---|---|---|
| Header | data-component=site-header / admin-topbar | Layout responsive, focus, cinque famiglie |
| CTA | data-ui=cta / primary-cta | Target minimo 44px e token dei temi |
| Card | data-component=product-card | Shop, mantenendo wishlist e aggiunta carrello |
| Dialoghi | site-dialog / admin-dialog | Semantica e focus esistenti |
| Footer | site-footer | Firma vettoriale e CTA coerente |

## CSS: inventario prima di eliminare
Il comando node scripts/audit-foundation-css.mjs genera artifacts/foundation-css/inventory.json e inventory.md, con selettori ripetuti, proprietà divergenti e raggruppamento header, CTA, card, modal, footer.
Il parser fornisce candidati statici e non risolve completamente media query e specificità; valutare computed style e screenshot prima di cancellare dichiarazioni.

Conflitti da monitorare già individuati:
- nav-ia.css assegna background scuro forzato a .ia-pannello, anche sul tema Giorno.
- nav-ia.css, atelier-foundation.css e brand-system-2026.css applicano regole concorrenti a .nav, .ia-voce e .nav-acts.
- components.css e gli strati successivi modellano più volte .pcard, .btn e .drawer.
- admin-notte-oro.css, admin-maison.css e admin-brand-system.css interagiscono su .btn, .card, .top e .modal.

## Navigation 01
La navigazione IA resta la fonte principale con cinque famiglie: Shop, Personalizza, Materiali, Business, Lab. L'elenco legacy rimane fallback. Il mega menu chiude con Esc; si evita che il timer di chiusura nasconda un pannello già riaperto. Il menu mobile usa hamburger fino a 1100px, dimensioni tappabili minime e gli attuali controlli focus/ARIA. L'header resta visibile nello scroll.

## Quattro percorsi browser
1. Home → Shop → scheda prodotto → carrello.
2. Home → Personalizza → Preventivo.
3. Home → Macchine → Demo.
4. Admin Dashboard → Media Library → Prodotti.

Il test tests/sprint-01-journeys.mjs esegue ogni percorso a 390 e 1440px in Giorno/Notte, produce screenshot e JSON, e blocca la PR in caso di errori. tests/sprint-01-compare.mjs produce dodici coppie prima/dopo (Home, Shop, Admin; due temi; due larghezze) usando main come baseline e il branch PR come nuova versione.

## Criteri di accettazione
- npm test e build passano; test foundation e test storici restano attivi.
- CI acquisisce inventario CSS, 64 screenshot responsive, 11 prove tastiera, 20 scansioni axe, misurazioni contrasti, quattro percorsi e screenshot prima/dopo.
- Qualsiasi problema reale trovato dal browser richiede correzione e nuovo QA; report visuali non equivalgono a un test su device fisico.
- Non dichiarare GitHub Pages aggiornato prima di conclusion=success sul run collegato al commit effettivamente pubblicato.

## Lavori non dichiarati conclusi
Verifiche manuali iPhone/Android e VoiceOver/TalkBack, completa certificazione WCAG, fotografie autentiche mancanti e riduzione complessiva delle skin legacy. Questi restano fuori dal perimetro tecnico con evidenza di completamento Sprint 01.

## Consolidamento Foundation 2.0 — 16 ottobre 2026
- Recuperate le modifiche **riutilizzabili** dalla PR #68 senza sovrascrivere `nav-mega.js`, `navigation.js` o le regole del mega-menu già verificate in #65/#66/#67.
- Logo completo: I in due tracciati derivati dal riferimento approvato, senza traslare NGLY, viewBox `-205 -20 1670 630`.
- Contratti CSS di base caricati **prima** dell'ultimo stylesheet di tema, con attributi `data-component` senza nuova logica JS.
- Test Foundation e percorsi navigazione reali in CI; screenshot before/after di supporto alle review.
- Nessuna modifica a stock, prezzo, clienti, fatture o catalogo.
