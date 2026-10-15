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
