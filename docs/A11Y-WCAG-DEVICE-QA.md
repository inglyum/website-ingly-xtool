# INGLY DESIGN — WCAG 2.2 e dispositivi reali

**Stato:** protocollo operativo, non certificazione. Il QA Chromium verifica responsive 320/390/768/1440px; i test di tastiera verificano 11 azioni e la suite contrasto controlla le coppie semantiche. Il report axe evidenzia problemi da risolvere, senza nasconderli.

| Ambiente | Check prioritario | Stato |
|---|---|---|
| iPhone Safari / VoiceOver | Header INGLY, swipe link, menu, switch tema, carrello | Da provare sul dispositivo |
| Android Chrome / TalkBack | Heading, filtri Shop, Wishlist, galleria | Da provare sul dispositivo |
| Windows Chrome / NVDA | Tab, Esc, ricerca, checkout e dialog Admin | Da provare |
| macOS Safari / VoiceOver | Zoom 200%/400%, ordine del focus, chiaro/scuro | Da provare |

## Criteri WCAG
- 1.4.3: testo piccolo 4.5:1, testo grande 3:1.
- 1.4.11: focus e controlli essenziali 3:1.
- 2.1.1/2.1.2: keyboard complete e niente focus trap.
- 2.4.3/2.4.7/2.4.11: focus in ordine, visibile e non nascosto da overlay.
- 2.5.8: touch target minimo 24×24px; INGLY mira a 44px.
- 3.3.2/4.1.2: etichette, ruoli e stati comunicati.

## Release acceptance
1. Test Node e screenshot Chromium verdi.
2. Issue critiche/serie rilevate da axe risolte o tracciate con giustificazione.
3. Prova reale con VoiceOver/TalkBack/NVDA documentata e allegata prima di dichiarare WCAG AA.
4. Verifica leggibilità della **I** del logo a 320px nel footer, nell'header e nell'Admin.
5. Gli asset mancanti del catalogo richiedono fotografie del prodotto reale.
