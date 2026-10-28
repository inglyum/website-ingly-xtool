# Collegare il dominio inglydesign.it — guida passo passo

Obiettivo: il sito si apre su **https://www.inglydesign.it**, e chi scrive **inglydesign.it**
(senza «www») viene portato lì da solo. Tutto il sito (canonical, sitemap, dati per Google)
dichiara già `https://www.inglydesign.it`, quindi si usa la versione **con www**.

Tempo: 15 minuti di lavoro, più l'attesa della propagazione (da pochi minuti a 24 ore).
Costo: zero, a parte il dominio che hai già.

---

## Prima di iniziare: tieni aperte due schede
1. **Il pannello del tuo registrar**, cioè dove hai comprato il dominio (Aruba, Register.it,
   GoDaddy, Namecheap, OVH…). Cerca la sezione «DNS», «Gestione DNS» o «Zona DNS».
2. **GitHub**: https://github.com/inglyum/website-ingly-xtool/settings/pages

> Se il sito smette di aprirsi durante i passi, niente panico: torna al passo 2 e premi
> **Remove** sul dominio personalizzato. Il sito torna subito su
> https://inglyum.github.io/website-ingly-xtool/

---

## Passo 1 — Registrar: imposta 5 record DNS
Cancella eventuali record **A** o **CNAME** già presenti per `@` e per `www` (spesso puntano
a una pagina di parcheggio del registrar). **Non toccare** i record MX: servono alla posta.

| Tipo  | Nome / Host | Valore                 | TTL        |
|-------|-------------|------------------------|------------|
| A     | @           | 185.199.108.153        | automatico |
| A     | @           | 185.199.109.153        | automatico |
| A     | @           | 185.199.110.153        | automatico |
| A     | @           | 185.199.111.153        | automatico |
| CNAME | www         | inglyum.github.io      | automatico |

- `@` vuol dire «il dominio nudo». Su alcuni pannelli il campo si lascia vuoto o si scrive
  `inglydesign.it.`
- Su Aruba: Pannello → Gestione Domini → DNS e servizi → Gestisci DNS.
- Il valore del CNAME è `inglyum.github.io`, **senza** `/website-ingly-xtool`.

Salva.

## Passo 2 — GitHub: indica il dominio
1. Apri https://github.com/inglyum/website-ingly-xtool/settings/pages
2. In **Custom domain** scrivi `www.inglydesign.it` e premi **Save**.
   Se oggi c'è scritto `inglydesign.it` (senza www), sostituiscilo.
3. GitHub controlla i DNS. Attendi il messaggio verde **«DNS check successful»**.
   Se compare un errore, è normale nei primi minuti: ricarica la pagina ogni 10–15 minuti.

## Passo 3 — HTTPS (il lucchetto)
Quando il controllo DNS è verde, metti la spunta su **Enforce HTTPS**.
Se la casella è grigia, GitHub sta ancora preparando il certificato: riprova più tardi.
Possono servire fino a 24 ore.

## Passo 4 — Verifica
- Apri **https://www.inglydesign.it**: deve aprirsi il sito con il lucchetto.
- Apri **inglydesign.it** (senza www): deve portarti su https://www.inglydesign.it
- Apri l'Admin da **https://www.inglydesign.it/admin.html** → Pubblica → **▶ Controlla ora**:
  i 3 punti devono essere verdi.
- Il vecchio indirizzo `inglyum.github.io/website-ingly-xtool/` continua a funzionare e porta
  al dominio nuovo.

## Passo 5 — Google
1. Google Search Console: aggiungi la proprietà `https://www.inglydesign.it` (verifica con un
   record DNS TXT, dal registrar).
2. Invia la sitemap: `https://www.inglydesign.it/sitemap.xml`
3. Google Business Profile: imposta come sito `https://www.inglydesign.it`

---

## Problemi frequenti
| Cosa vedi | Cosa fare |
|---|---|
| «DNS check unsuccessful» dopo diverse ore | Controlla che i 4 record A e il CNAME siano scritti esattamente come in tabella e che non esistano altri record A o AAAA per `@` |
| Il sito si apre ma senza lucchetto | Aspetta il certificato, poi spunta «Enforce HTTPS» |
| «Il sito non è raggiungibile» subito dopo il passo 2 | I DNS non sono ancora propagati: aspetta, oppure premi **Remove** per tornare all'indirizzo github.io |
| La posta non funziona più | Hai cancellato i record MX: ripristinali dal registrar (di solito c'è «ripristina predefiniti posta») |

Se vuoi, mandami uno screenshot della tabella DNS del registrar prima di salvare: te la
controllo io.
