# INGLY DESIGN — Sprint 01: CSS cascade baseline

Verifica: 16 ottobre 2026, branch `main` 4c7c2b32a1b6.

## Metodo
Esame dei 18 fogli CSS collegati dall'HTML principale (non di tutti i CSS del
repository). I conteggi seguenti sono **occorrenze testuali indicative**,
non un inventario AST di selettori identici o un conteggio di bug.

| Indicatore | Baseline |
| --- | ---: |
| CSS collegati dalla Home | 18 |
| Dimensione CSS sorgente cumulativa | 442.803 caratteri |
| Occorrenze di `!important` | 1.791 |
| Fogli contenenti `.ia-pannello` | 6 |
| Fogli contenenti `.ia-voce` | 9 |
| Fogli contenenti `.nav` | 14 |
| Fogli contenenti `.btn-primary` | 9 |

## Collisione riprodotta / ownership

La navigazione è definita in `nav-ia.css`, ma riceve override da
`pages.css`, `atelier-foundation.css`, `notte-oro.css`,
`signature-showcase.css` e `maison-reference.css`. Alcuni usano colori
esadecimali fissi e `!important`, ad esempio su `.ia-lista a`.
Questo aumenta il rischio di mismatch Giorno/Notte.

**Soluzione isolata:** usare i token ufficiali di `brand-system-2026.css`
nel menu aperto, nei link e nella colonna editoriale. Il CSS brand è caricato
per ultimo. Gli alias legacy `--ingly-*` diventano riferimenti dinamici ai
`--brand-*`. Non si eliminano al buio i CSS delle altre pagine.

## Gate

- Test statico `tests/test-navigation-theme.mjs` in `npm test`.
- Browser Chromium: screenshot menu aperto 1440px Giorno/Notte,
  confronto dello sfondo e foreground effettivi con i token CSS attivi.
- Audit responsive e accessibilità generale obbligatorio.
- Verifica manuale iOS Safari, Android Chrome, VoiceOver, TalkBack, NVDA
  ancora richiesta. Un audit automatico verde non è una certificazione WCAG.

## Dopo Sprint 01

1. Identificare dichiarazioni effettivamente inutilizzate con trace delle
   regole vincenti in browser, non con sole corrispondenze di testo.
2. Estrarre componenti UI riutilizzabili; modifiche additive e testate.
3. Diminuire progressivamente il numero di override `!important` senza
   togliere layout e interazioni legacy.
