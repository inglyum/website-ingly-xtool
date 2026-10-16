# INGLY PWA — scoped cache recovery (Sprint 02)

## Errore
L'inizializzazione in `index.html` usava `caches.keys()` e cancellava
**tutte le cache** della origin. Su `inglyum.github.io`, eventuali altre
applicazioni condividono la origin. Anche `getRegistrations()` restituiva
registrazioni non necessariamente appartenenti a INGLY.

## Correzione
- Solo cache `ingly-v<numero>-(assets|data|img)` con versione diversa
  dalla `CACHE_WANT` vengono eliminate.
- Solo la registrazione con `scope` corrispondente alla base di INGLY
  viene disregistrata, se presente.
- Conservati il recupero in caso di cache vecchia e il limite di un
  tentativo per sessione.
- Test Node `test-pwa-safe-recovery.mjs` simula cache e Service Worker
  di una PWA esterna che **non devono essere toccati**.

## Verifiche residue
Collegamento reale PWA, upgrade da v14 a v15 e test offline su dispositivi
reali, senza cancellare manualmente la memoria di altri siti.
