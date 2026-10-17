# INGLY DESIGN · Design System 2026
## Specifica UI/UX approvata per lo storefront e il controllo Admin
Versione: 1.0 · 15 ottobre 2026 · Ref: branch \`feat/brand-system-20261015\`

### 1. Direzione
**Luxury Maker / Precision Craft.** Il marchio deve essere riconoscibile, accessibile su telefono, applicabile senza duplicare logiche e originale. Voce: concreta, essenziale, italiana/inglese. Evitare i gradienti blu-verde-teal-arancio sovrapposti che erano arrivati da fogli CSS storici.

- Dominante: grafite/navy profondo (modalità Notte), bianco autentico (Giorno).
- Accenti: oro satinato non aggressivo per la gerarchia, blu appena percettibile nei riflessi.
- Unità spaziali: 4/8/12/16/24/32/48px; base border radius 12/16/20.
- Tipografia: Josefin Sans (copy/CTA/heading), fallback system UI. Wordmark non viene più disegnato con un font.
- No watermark di testo: la firma grafica di fondo usa il wordmark originale fornito dal titolare.

### 2. Asset e uso corretto
| Risorsa | File | Impiego |
| --- | --- | --- |
| Wordmark chiaro, vettorializzazione dell'immagine caricata | \`assets/images/ingly-wordmark-light.svg\` | Header e footer Notte, solo logo aziendale |
| Wordmark scuro | \`assets/images/ingly-wordmark-dark.svg\` | Header e footer Giorno, watermark Giorno |
| Emblema tecnico circolare | \`assets/images/ingly-logo.svg\` | Emblema piccolo in header e loader; disco interno bianco su fondo scuro |
| Badge originale xTool/INGLY | \`assets/images/xtool-authorized-service-centre.svg\` | Solo Lab/assistenza, non watermark/brand primaria |
| Foto reali | \`img/*.webp\` | Catalogo prodotti, materiale e portfolio con abbinamento verificato |

**Non usare** badge tecnico come il gigantesco logo INGLY di chiusura. Non usare immagini di repertorio per rappresentare manufatti mai realizzati. L'audit in \`docs/CATALOGO-FOTO-DA-CARICARE.md\` distingue i riferimenti locali rotti dalle immagini già registrate.

### 3. Palette di produzione
| Token | Notte | Giorno | Uso |
| --- | --- | --- | --- |
| \`--brand-bg\` | \`#080d15\` | \`#ffffff\` | canvas |
| \`--brand-deep\` | \`#06090f\` | \`#f6f8fb\` | band e profondità |
| \`--brand-surface\` | \`#101823\` | \`#ffffff\` | card |
| \`--brand-elevated\` | \`#152030\` | \`#f3f6fa\` | secondary surfaces |
| \`--brand-ink\` | \`#f8f9fc\` | \`#111b2d\` | main text |
| \`--brand-muted\` | \`#bdc7d5\` | \`#45546a\` | secondary text |
| \`--brand-gold\` | \`#deb878\` | \`#895b22\` | interactive accent |
| \`--brand-gold-hi\` | \`#f4daa6\` | \`#825116\` | hover/eyebrow |

Token compatibili: \`--ux-*\`, \`--ma-*\`, \`--ss-*\`, \`--at-*\`, \`--no-*\`. I valori restano centrali nei due nuovi fogli, anche quando un componente usa un alias storico.

### 4. Componenti
**Header:** emblema compatto (34-44px), wordmark vettoriale (110-172px) e sottotitolo DESIGN · ITALY. Sempre un elemento cliccabile con nome accessibile. Nessun testo grande che finga il logo originale.
**Hero:** foto reali, headline singola, CTA primaria satinata, CTA secondaria a bordo, gradienti di profondità appena percepibili. Pattern uguale in tutte le sezioni.
**Ticker tecnologie/materiali:** chip di dimensioni costanti, bordo/radius/altezza unici; su telefono una sola striscia per ridurre rumore, duplicati usati solo per il loop desktop. Chi lo preferisce può disattivare le animazioni.
**Schede Shop/Materiali/Digitale/Macchine:** card gradientate in modo discreto dal medesimo surface token; placeholder onesto quando manca la fotografia; immagine sempre \`object-fit\` appropriato; dati inventariali non alterati.
**CTA e input:** target min 44px su touch, focus di colore oro e contrasto leggibile, form sempre visibili in Notte e Giorno.
**Footer:** descrizione e quattro colonne testuali, wordmark INGLY gigante come elemento decorativo al 7-10% di opacità, senza emoji o badges in competizione; collassa in colonna su telefono.
**Loader:** conserva il simbolo originale e l'animazione accessibile; la parte interna del simbolo è ora bianca senza quadrato di sfondo.
**Lab xTool:** badge Authorized Service Centre soltanto nella sezione di competenza; nessuna variazione dei diritti/claim oltre alla grafica fornita.

### 5. Breakpoint mobile
- **Desktop** > 900px: struttura multi-colonna esistente, card e footer a griglia.
- **Tablet** <= 900px: griglie elastiche, menu compatto, due colonne footer.
- **Mobile** <= 620px: header/logo ridotti con area tattile sufficiente, una sola striscia ticker, card a colonna quando necessario, footer verticale, opacità ridotta del pattern, barra azioni con rispetto della safe-area.
- **Tiny phone** ~ 320-400px: evitare titoli che escono dalla viewport e menu che si sovrappongono; prioritizzare azioni essenziali.

### 6. Modalità
- In storefront e Admin il valore della preferenza personale è \`localStorage.ingly_mode\`.
- Il default segue \`prefers-color-scheme\` quando non è stata effettuata una scelta esplicita.
- I pulsanti theme-switch sono realmente attivi e comunicano stato con \`aria-pressed\`.
- L'Admin consente la selezione Notte/Giorno anche cliccando le due anteprime; il click di anteprima mantiene inoltre la funzione storica di navigazione all'editor degli sfondi.
- L'Admin **non cambia automaticamente il tema di tutti i clienti**: questa è una preferenza locale. Per impostare un default pubblico da CMS servirebbe una modifica esplicita a \`data/config.json\` con procedura di pubblicazione: non introdurre una falsa sincronizzazione.

### 7. Pagine incluse
Header e footer del sito, Home, Shop, Materiali, Tecnologie, Macchine, Digitale, Personalizza, FAQ e altre rotte SPA condividono \`assets/css/brand-system-2026.css\`. Il pannello usa \`assets/css/admin-brand-system.css\` e \`assets/js/admin/brand-theme-switch.js\`. Il Generator Studio autonomo possiede già la sua UI bilingue e tema condiviso.

### 8. QA obbligatoria e vincoli di pubblicazione
- Build: \`npm run build\`, prerender, sitemap, \`npm test\`.
- Test visuale: 320/375/390/430/768/1024/1440px e due modalità, verifica reale con Playwright prima di qualificare una sezione "perfetta".
- WCAG: leggibilità di testi su fondo, focus, hover non esclusivo, rispetto di \`prefers-reduced-motion\`.
- Localizzazione: controllare menu IT/EN, stati di errore/successo, label e alt, incluso il pannello.
- Catalogo: verificare foto reali e media inventory; non inventare prodotti/fotografie, stock, autorizzazioni, servizi erogabili, tariffe o tempi.

### 9. Lavoro ancora esterno a questa PR
La uniformazione visiva **non** rappresenta completamento di un checkout con pagamento reale, spedizioni, cronologia ordini verificata o restauro di 77 foto prodotto assenti. Questi richiedono materiale reale o integrazioni di backend e test transazionali dedicati; l'Admin storico non va trasformato in una dashboard di metriche fittizie.

### 10. Test di accettazione
\`tests/test-brand-system.mjs\` controlla la presenza del wordmark originale, la separazione dei due temi, il fondo bianco nel logo circolare, lo stato tema Admin, il layout mobile e le preferenze condivise. Le altre suite di repository verificano l'assenza di regressioni funzionali.


### 11. Livello Keynote — linguaggio Apple, identità INGLY (17 ottobre 2026)
La vetrina adotta il ritmo di apple.com senza perdere il marchio. Il livello vive **in coda** a `assets/css/brand-system-2026.css` (che resta l'ultimo foglio caricato) e sostituisce, dove in conflitto, i punti 1, 3 e 4 sopra.

| Aspetto | Prima | Ora |
| --- | --- | --- |
| Testo | Josefin Sans ovunque, più Manrope/Inter/Fraunces/Playfair/DM Serif a seconda del foglio | Font di sistema (`-apple-system`, SF Pro, poi Inter): token `--k-font-text` |
| Titoli | Mix serif corsivi e sans | Solo Josefin Sans 600, mai corsivo, interlinea stretta: token `--k-font-display` |
| Tela Notte | Navy `#080d15` con aloni radiali | Grafite neutra: `#000` / `#0b0d11` / `#141518`, nessun alone |
| Tela Giorno | Bianco con aloni | `#fff` e `#f5f5f7` |
| Accento | Oro satinato | Invariato: `#deb878` su scuro, `#8a5c22` su chiaro. Unico colore d'accento |
| Pulsanti | Rettangoli con gradiente | Pillola (`border-radius:980px`), pieno oro o contorno |
| Card | Raggi 12/16/20, ombre e bagliori | Raggio unico 18px, superfici piatte |
| Header | 84px, opaco | 52-56px, vetro `saturate(180%) blur(20px)`, sticky |
| Footer | Testo medio, colonne in riquadri | 12px grigio, colonne libere, wordmark al 7% |

**Sezione Keynote della home** (`#inglyKeynote`, subito dopo l'hero): due tile a tutta larghezza (una chiara, una scura) e una griglia 2×3 di tile alternate, ognuna con titolo centrato, sottotitolo, azioni e fotografia sotto. Regole:
- solo fotografie reali del portfolio INGLY (`img/port-*`) o copertine di categoria già dichiarate illustrative; nessun mockup, nessun URL esterno;
- ogni `<img>` ha `alt`, `width`/`height`, `srcset` solo con varianti presenti su disco;
- testi bilingui in `data-k-it`/`data-k-en`, applicati da `assets/js/ingly-keynote.js` con `textContent`, con ambito limitato alla sezione;
- una foto che non carica nasconde il proprio riquadro: la tile resta leggibile come solo testo;
- i colori delle tile sono fissi (chiara `#f5f5f7`, scura `#000`/`#101215`) in entrambe le modalità, come le tile di apple.com; i contrasti di testo e pulsanti sono ≥ 4.5:1.

**Hero:** tile scura in entrambe le modalità, testo centrato in alto, fotografia a tutta pagina sotto un velo verticale.

**Telefono:** tile senza margini né raggi sotto 480px; barra azioni a cinque voci su una sola riga (prima la quinta andava a capo).

Test: `tests/test-keynote.mjs`.
