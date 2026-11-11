/* ============ LINGUA DEI TESTI FISSI ============
   Il sito ha due sistemi di traduzione: texts.json (data-i18n) per le chiavi
   e i dati bilingui ({it,en}) per prodotti, raccolte, Lab. Restavano però
   centinaia di testi scritti direttamente nell'HTML e negli script: in
   inglese la pagina usciva metà italiana (audit del 10 novembre 2026: 461
   frasi). Questo dizionario li traduce tutti in un punto solo.

   Come funziona:
   - in inglese ogni testo visibile, alt, aria-label, placeholder e title che
     coincide (spazi a parte) con una voce del dizionario viene sostituito;
   - l'italiano originale resta in memoria e torna quando si ripassa a IT;
   - un MutationObserver traduce anche ciò che compare dopo (menu, cassetti,
     schede disegnate dagli script);
   - le chiavi sono le frasi italiane intere: nessuna traduzione «a pezzi».

   Aggiungere una frase = aggiungere una riga qui. tests/test-lingua.mjs
   controlla che le pagine in inglese non abbiano più testi italiani. */

export const DIZIONARIO = {
  /* --- struttura comune: barra annunci, menu, piè di pagina --- */
  'Spedizione gratuita in Italia sopra €79': 'Free shipping in Italy over €79',
  'Chiudi gli avvisi': 'Close announcements',
  'Chiudi': 'Close',
  'Su misura': 'Made to order',
  'dal tuo disegno.': 'from your drawing.',
  'Materiali': 'Materials',
  'Macchine': 'Machines',
  'Tecnologie': 'Technologies',
  'Personalizza': 'Customise',
  'Demo gratuita': 'Free demo',
  'Assistenza xTool Palermo': 'xTool service in Palermo',
  'Made in Italy · Consulenza e personalizzazioni': 'Made in Italy · Advice and personalisation',
  'Spedizioni e resi': 'Shipping and returns',
  'Dati aziendali': 'Company details',
  'Condizioni di vendita': 'Terms of sale',
  'Informazioni legali': 'Legal information',
  'Informazioni INGLY DESIGN': 'About INGLY DESIGN',
  'Risorse principali': 'Main resources',
  'Navigazione principale': 'Main navigation',
  'Menu di navigazione': 'Navigation menu',
  'Apri il menu': 'Open the menu',
  'Chiudi il menu': 'Close the menu',
  'Apri il carrello': 'Open the cart',
  'Carrello': 'Cart',
  'Azioni rapide': 'Quick actions',
  'Vai allo Shop per cercare prodotti': 'Go to the Shop to search products',
  'Vai allo Shop': 'Go to the Shop',
  'Cerca nello Shop': 'Search the Shop',
  'Cosa stai cercando?': 'What are you looking for?',
  'Passa alla modalità chiara': 'Switch to light mode',
  'Passa alla modalità scura': 'Switch to dark mode',
  'Tema: Passa alla modalità chiara': 'Theme: switch to light mode',
  'Tema: Passa alla modalità scura': 'Theme: switch to dark mode',
  'Tema: passa alla modalità chiara o scura': 'Theme: switch between light and dark mode',
  'Modalità chiara attiva': 'Light mode on',
  'Modalità scura attiva': 'Dark mode on',
  'Lingua del sito': 'Site language',
  'Salta al contenuto principale': 'Skip to main content',
  'Salta l\'animazione introduttiva': 'Skip the intro animation',
  'Salta': 'Skip',
  'INGLY DESIGN — caricamento': 'INGLY DESIGN — loading',
  'INGLY DESIGN — wordmark originale': 'INGLY DESIGN — original wordmark',
  'Scrivici su WhatsApp': 'Message us on WhatsApp',
  'Percorso': 'Breadcrumb',
  'Precedente': 'Previous',
  'Successiva': 'Next',
  'Immagine precedente': 'Previous image',
  'Immagine successiva': 'Next image',
  'Ingrandisci': 'Zoom in',
  'Zoom foto': 'Zoom photo',
  'Condividi': 'Share',
  '🔗 Condividi': '🔗 Share',
  'Condividi prodotto': 'Share product',
  '⧉ copia': '⧉ copy',
  'Copia il codice': 'Copy the code',
  'Applica': 'Apply',
  'Azzera': 'Reset',
  'Ripristina': 'Reset',
  'Salva bozza': 'Save draft',
  'Esporta SVG': 'Export SVG',
  'Filtri': 'Filters',
  'Filtri del catalogo': 'Catalogue filters',
  'Chiudi i filtri': 'Close filters',
  'Ordina': 'Sort',
  'Categorie': 'Categories',
  'Vedi': 'See',
  'Visita': 'Visit',
  'Segui': 'Follow',
  'Seguici →': 'Follow us →',
  'Apri su Instagram': 'Open on Instagram',
  'su Instagram per le ultime creazioni!': 'on Instagram for our latest creations!',
  'Le ultime': 'Latest',
  'creazioni': 'creations',
  'Ispirazione': 'Inspiration',
  'Editoriale': 'Editorial',
  'Preventivi': 'Quotes',
  'Richiedi un preventivo': 'Request a quote',
  'Chiedi un preventivo': 'Ask for a quote',
  'Per ordini urgenti scrivici su WhatsApp.': 'For urgent orders, message us on WhatsApp.',
  'Paga con carta': 'Pay by card',
  'Installa': 'Install',
  'Installazione app INGLY DESIGN': 'Install the INGLY DESIGN app',
  'Chiudi proposta di installazione': 'Dismiss the install prompt',
  '📲 Aggiungi INGLY alla schermata home': '📲 Add INGLY to your home screen',
  '🛒 Aggiungi tutto al carrello': '🛒 Add everything to the cart',
  'Scheda progetto': 'Project details',
  'Vedi il progetto →': 'See the project →',
  'Esplora tutti i materiali ↗': 'Explore all materials ↗',
  'Esplora xTOOL Lab ↗': 'Explore the xTOOL Lab ↗',
  'Personalizza un prodotto': 'Personalise a product',
  'Personalizza il tuo progetto': 'Personalise your project',
  'Generatori specializzati': 'Specialised generators',
  'I nostri servizi': 'Our services',
  'Il metodo INGLY: la tua idea, il nostro lavoro': 'The INGLY method: your idea, our craft',
  'Stiamo aggiornando il catalogo. Torniamo presto!': 'We are updating the catalogue. Back soon!',
  'Esperienze dei clienti, pubblicate dopo verifica.': 'Customer experiences, published after verification.',
  'Cliente verificato': 'Verified customer',
  'Forniture per il laser': 'Laser supplies',
  'I materiali e gli accessori che consigliamo per incidere e tagliare.': 'The materials and accessories we recommend for engraving and cutting.',
  'Centro assistenza autorizzato xTool': 'xTool authorised service centre',
  'Tipo di richiesta': 'Request type',
  'Email': 'Email',

  /* --- popup e offerte --- */
  'Aspetta! Un regalo per te': 'Wait! A gift for you',
  'Ottieni il 10% di sconto': 'Get 10% off',
  '10% di sconto': '10% off',
  'Sconto': 'Discount',
  'Offerta per nuovi clienti · Scade tra 48h': 'New customer offer · Expires in 48h',
  'Scrivici su WhatsApp e ricevi': 'Message us on WhatsApp and get',
  'sul tuo primo ordine personalizzato. Valido 48h.': 'on your first personalised order. Valid for 48h.',
  'Codice sconto': 'Discount code',

  /* --- moduli: segnaposto --- */
  'Anna Bianchi': 'Jane Smith',
  'Trattoria da Mario S.r.l.': 'Mario\'s Trattoria Ltd',
  'tua@email.it': 'you@email.com',
  'Scrivi il tuo nome': 'Write your name',
  'https://drive.google.com/… (Drive, WeTransfer, Dropbox)': 'https://drive.google.com/… (Drive, WeTransfer, Dropbox)',

  /* --- home --- */
  'Tecnologia al servizio delle tue idee. Dopo le creazioni INGLY, scopri la nostra collaborazione tecnologica con xTool per approfondire macchine, applicazioni e demo.': 'Technology at the service of your ideas. After the INGLY creations, discover our technology partnership with xTool to explore machines, applications and demos.',
  'Foto ufficiale xTool': 'Official xTool photo',
  'Taglio e incisione CO₂': 'CO₂ cutting and engraving',
  'Incisione e dettagli di precisione': 'Engraving and precision detail',
  'Personalizzazione e stampa UV': 'Personalisation and UV printing',
  'Termopressa e trasferimenti': 'Heat press and transfers',
  'Fotografie ufficiali xTool. Il modello raffigurato non garantisce uno slot demo: ogni disponibilità va confermata.': 'Official xTool photographs. The model shown does not guarantee a demo slot: availability must be confirmed.',
  'Fotografia ufficiale xTool P3, macchina laser CO2 professionale': 'Official photo of the xTool P3, professional CO2 laser machine',
  'Fotografia ufficiale xTool F2 con cover arancione': 'Official photo of the xTool F2 with orange cover',
  'Fotografia ufficiale della stampante UV xTool O1 Omni': 'Official photo of the xTool O1 Omni UV printer',
  'Fotografia ufficiale della pressa a caldo xTool WonderPress': 'Official photo of the xTool WonderPress heat press',
  'Foto ufficiale della macchina xTool P3 — fonte xTool': 'Official photo of the xTool P3 machine — source: xTool',
  'Vere tavole in legno di quercia: fotografia di repertorio, non un prodotto INGLY': 'Real oak boards: stock photograph, not an INGLY product',
  'Applicazione con lastre in acrilico: fotografia di repertorio, non un prodotto INGLY': 'Acrylic sheet application: stock photograph, not an INGLY product',
  'Superficie metallica: fotografia di repertorio, non una lavorazione INGLY': 'Metal surface: stock photograph, not INGLY work',
  'Laser in lavorazione: fotografia di repertorio, non una realizzazione INGLY': 'Laser at work: stock photograph, not INGLY work',
  'Bobine reali di filamento PLA per stampa 3D, fotografia di repertorio': 'Real PLA filament spools for 3D printing, stock photograph',
  'Segnaposto reale per eventi: fotografia di repertorio, non una realizzazione INGLY': 'Real event place card: stock photograph, not INGLY work',
  'Immagine editoriale della categoria aziendale': 'Editorial image for the business category',
  'Immagine editoriale della categoria accessori': 'Editorial image for the accessories category',
  'Soluzioni aziendali · immagine dimostrativa': 'Business solutions · illustrative image',
  'Esempio illustrativo di personalizzazioni per aziende: prodotti e branding realizzabili su richiesta': 'Illustrative example of business personalisation: products and branding made on request',
  'Esempi dimostrativi di oggetti per casa e arredamento': 'Illustrative examples of home and décor items',
  'Esempi dimostrativi per produzioni e gadget aziendali': 'Illustrative examples for corporate production and gifts',
  'Esempi visivi dimostrativi di famiglie di materiali': 'Illustrative visuals of material families',
  'Esempio dimostrativo di personalizzazione su misura': 'Illustrative example of made-to-order personalisation',
  'Copertina dimostrativa del catalogo file digitali': 'Illustrative cover of the digital file catalogue',
  'Illustrazione dimostrativa del laboratorio laser INGLY DESIGN': 'Illustration of the INGLY DESIGN laser workshop',
  'Immagine dimostrativa per percorsi formativi e tecniche': 'Illustrative image for training and techniques',
  'Ispiriamo la creazione.': 'We inspire creation.',
  'La materia dà forma alle idee.': 'Material gives shape to ideas.',
  'Scopri materiali, superfici, finiture e possibilità creative. La scelta giusta comincia da ciò che vuoi raccontare.': 'Discover materials, surfaces, finishes and creative possibilities. The right choice starts with what you want to say.',
  'Parti da poche lettere, scegli il materiale e immagina come diventerà il tuo prossimo oggetto unico.': 'Start with a few letters, choose the material and picture your next one-of-a-kind piece.',
  'Unico come te': 'As unique as you',
  'Il tuo nome.': 'Your name.',
  'La tua impronta.': 'Your mark.',
  'Hai un\'idea?': 'Have an idea?',
  'Firma elegante': 'Elegant signature',
  'Testo da incidere': 'Text to engrave',
  'ANTEPRIMA TESTO': 'TEXT PREVIEW',
  'Anteprima creativa del testo: finiture e resa dell\'incisione dipendono dal materiale reale.': 'Creative text preview: finish and engraving result depend on the real material.',
  'Anteprima dal vivo della personalizzazione': 'Live personalisation preview',
  'Accendo il laser': 'Firing up the laser',
  'Si parte': 'We start',
  'Scroll': 'Scroll',
  'PARTNER TECNOLOGICO · xTOOL': 'TECHNOLOGY PARTNER · xTOOL',
  'Tessera INGLY DESIGN e xTool Squad': 'INGLY DESIGN and xTool Squad card',
  'Host della Demo Room xTool: Giuseppe Inglima': 'xTool Demo Room host: Giuseppe Inglima',
  'Host Demo Room xTool · INGLY DESIGN': 'xTool Demo Room host · INGLY DESIGN',

  /* --- personalizza --- */
  'Tu scegli il pezzo.': 'You choose the piece.',
  'Il resto lo scrivi tu.': 'You write the rest.',
  'Un nome, una data, un logo: su questi pezzi la personalizzazione è prevista dal progetto, non aggiunta dopo.': 'A name, a date, a logo: on these pieces personalisation is part of the design, not added afterwards.',
  'Come funziona': 'How it works',
  'Modelli rapidi di personalizzazione': 'Quick personalisation templates',
  'Percorso di personalizzazione': 'Personalisation steps',
  'Anteprima parametrica della targa personalizzata': 'Parametric preview of the personalised plaque',
  'Targa personalizzata': 'Personalised plaque',
  '01 · Progetto': '01 · Design',
  '02 · Materiale': '02 · Material',
  '03 · Anteprima': '03 · Preview',
  '04 · Richiesta': '04 · Request',
  '(traccia blu, facoltativa · non per metallo)': '(blue line, optional · not for metal)',
  'Aggiungi linea SCORE interna': 'Add an inner SCORE line',
  'CUT — rosso': 'CUT — red',
  'SCORE — blu': 'SCORE — blue',
  'ENGRAVE — riempimento': 'ENGRAVE — fill',
  'Legenda colori laser': 'Laser colour legend',
  'Legno — anteprima incisione. Controlla venature e spessore con il laboratorio.': 'Wood — engraving preview. Check grain and thickness with the workshop.',
  'Legno naturale': 'Natural wood',
  'LEGNO NATURALE': 'NATURAL WOOD',
  'Pelle senza PVC': 'PVC-free leather',
  'Stile': 'Style',
  'Tecnico': 'Technical',
  'Larghezza': 'Width',
  'Altezza': 'Height',
  'Profondità': 'Depth',
  'Spessore': 'Thickness',
  'Diametro': 'Diameter',
  'Materiale': 'Material',
  'Naturale': 'Natural',
  'Nero': 'Black',
  'Bianco': 'White',
  'Argento': 'Silver',
  'Trasparente': 'Clear',
  'Specchiato': 'Mirror',
  'Grezzo': 'Raw',
  'Testa di moro': 'Dark brown',
  'Versioni': 'Versions',
  'Estensione opzionale': 'Optional extension',

  /* --- materiali --- */
  'Material Lab': 'Material Lab',
  'Ogni materiale': 'Every material',
  'si comporta': 'behaves',
  'a modo suo.': 'in its own way.',
  'Nove materiali in lavorazione corrente, ognuno con le sue tecnologie, i suoi spessori e i suoi limiti dichiarati. Perché scegliere il materiale è la prima decisione di progetto, non l\'ultima.': 'Nine materials in everyday production, each with its own technologies, thicknesses and stated limits. Because choosing the material is the first design decision, not the last.',
  'Legno': 'Wood',
  'Plexiglass': 'Acrylic',
  'Metallo': 'Metal',
  'Pelle': 'Leather',
  'Vetro': 'Glass',
  'Bambù': 'Bamboo',
  'Bamboo': 'Bamboo',
  'MDF e compensato': 'MDF and plywood',
  'PLA e PETG': 'PLA and PETG',
  'Tessuto': 'Fabric',
  'Ogni tessuto': 'Every fabric',
  'Esplora il materiale Legno': 'Explore wood',
  'Esplora il materiale Plexiglass': 'Explore acrylic',
  'Esplora il materiale Metallo': 'Explore metal',
  'Esplora il materiale Pelle': 'Explore leather',
  'Esplora il materiale Vetro': 'Explore glass',
  'Esplora il materiale Bambù': 'Explore bamboo',
  'Esplora il materiale MDF e compensato': 'Explore MDF and plywood',
  'Esplora il materiale PLA e PETG': 'Explore PLA and PETG',
  'Esplora il materiale Tessuto': 'Explore fabric',
  'Esempio fotografico dimostrativo per Legno; non un campione certificato': 'Illustrative photo for wood; not a certified sample',
  'Esempio fotografico dimostrativo per Plexiglass; non un campione certificato': 'Illustrative photo for acrylic; not a certified sample',
  'Esempio fotografico dimostrativo per Metallo; non un campione certificato': 'Illustrative photo for metal; not a certified sample',
  'Esempio fotografico dimostrativo per Pelle; non un campione certificato': 'Illustrative photo for leather; not a certified sample',
  'Esempio fotografico dimostrativo per Vetro; non un campione certificato': 'Illustrative photo for glass; not a certified sample',
  'Esempio fotografico dimostrativo per Bambù; non un campione certificato': 'Illustrative photo for bamboo; not a certified sample',
  'Esempio fotografico dimostrativo per MDF e compensato; non un campione certificato': 'Illustrative photo for MDF and plywood; not a certified sample',
  'Esempio fotografico dimostrativo per PLA e PETG; non un campione certificato': 'Illustrative photo for PLA and PETG; not a certified sample',
  'Esempio fotografico dimostrativo per Tessuto; non un campione certificato': 'Illustrative photo for fabric; not a certified sample',
  'Acciaio': 'Steel',
  'Acciaio inox': 'Stainless steel',
  'Acciaio, alluminio, ottone': 'Steel, aluminium, brass',
  'Alluminio': 'Aluminium',
  'Alluminio anodizzato': 'Anodised aluminium',
  'Alluminio anodizzato nero': 'Black anodised aluminium',
  'Ottone': 'Brass',
  'Titanio': 'Titanium',
  'Titanio colorato': 'Coloured titanium',
  'Ceramica': 'Ceramic',
  'Cotone': 'Cotton',
  'Cotone e poliestere': 'Cotton and polyester',
  'Poliestere': 'Polyester',
  'Felpa': 'Sweatshirt',
  'Plastica': 'Plastic',
  'Resina': 'Resin',
  'Nylon': 'Nylon',
  'TPU flessibile': 'Flexible TPU',
  'PVC e vinile': 'PVC and vinyl',
  'Policarbonato (Lexan)': 'Polycarbonate (Lexan)',
  'PTFE (Teflon)': 'PTFE (Teflon)',
  'Pelle conciata al cromo': 'Chrome-tanned leather',
  'Pelle e similpelle': 'Leather and faux leather',
  'Pelle sintetica': 'Synthetic leather',
  'Fibra di carbonio e vetroresina': 'Carbon fibre and fibreglass',
  'Fibra naturale e calore': 'Natural fibre and heat',
  'Rovere, noce, betulla': 'Oak, walnut, birch',
  'Trasparente, colato, specchiato': 'Clear, cast, mirror',
  'Bicchieri, bottiglie, lastre': 'Glasses, bottles, panes',
  'Pannelli e prototipi': 'Panels and prototypes',
  'Oggetti e stampa 3D': 'Objects and 3D printing',
  'capi e tessuti': 'garments and fabrics',
  'Medagliette, targhette tecniche, biglietti da visita, gioielleria': 'Tags, technical plates, business cards, jewellery',
  'Real licensed stock photograph of legno, not an INGLY DESIGN customer project.': 'Real licensed stock photograph of wood, not an INGLY DESIGN customer project.',
  '— Fonde invece di vaporizzare e produce fumi nocivi.': '— Melts instead of vaporising and gives off harmful fumes.',
  '— Il taglio libera cloro gassoso: tossico per chi lavora e corrosivo per ottica e guide.': '— Cutting releases chlorine gas: toxic for the operator and corrosive for optics and rails.',
  '— Libera composti fluorurati pericolosi.': '— Releases hazardous fluorinated compounds.',
  '— Libera cromo esavalente. Usare solo pelle conciata al vegetale.': '— Releases hexavalent chromium. Use vegetable-tanned leather only.',
  '— Non taglia pulito, brucia e ingiallisce sul bordo.': '— Does not cut cleanly; it burns and yellows at the edge.',
  '— Polveri e resine dannose, taglio comunque scadente.': '— Harmful dust and resins, and the cut is poor anyway.',

  /* --- tecnologie --- */
  'Technology Hub': 'Technology Hub',
  'Sei tecnologie,': 'Six technologies,',
  'un solo': 'one',
  'laboratorio.': 'workshop.',
  'Laser CO₂, fibra, MOPA, stampa UV, DTF e stampa 3D. Ognuna fa una cosa che le altre non sanno fare: qui c\'è scritto quale, e quando conviene.': 'CO₂ laser, fibre, MOPA, UV printing, DTF and 3D printing. Each does something the others can\'t: here is what, and when it is worth it.',
  'Laser CO₂': 'CO₂ laser',
  'Laser IR': 'IR laser',
  'Laser MOPA': 'MOPA laser',
  'Laser blu': 'Blue laser',
  'Laser di Classe 1': 'Class 1 laser',
  'Fibra': 'Fibre',
  'Stampa 3D su misura': 'Custom 3D printing',
  'Prototipi, ricambi, oggetti personalizzati e lampade dalla tua foto, insieme al laser e alla stampa UV dello stesso laboratorio.': 'Prototypes, spare parts, personalised objects and lamps from your photo, together with the laser and UV printing of the same workshop.',
  'Incisione profonda': 'Deep engraving',
  'Tracciabilità': 'Traceability',
  'Marcatura a colori': 'Colour marking',
  'Strato 0,05 mm': '0.05 mm layer',
  'FIBRA': 'FIBRE',
  'DIODO': 'DIODE',
  'LAMA': 'BLADE',
  'STAMPA': 'PRINT',
  'MULTIFUNZIONE': 'MULTIFUNCTION',
  'Stampa 3D': '3D printing',
  'Stampa DTF': 'DTF printing',
  'Stampa UV': 'UV printing',
  'Stampa UV LED, doppia testa': 'LED UV printing, dual head',
  'Stampa UV · doppia testa': 'UV printing · dual head',
  'Stampante UV inkjet, non laser': 'Inkjet UV printer, not a laser',
  'Trasferimento termico / sublimazione': 'Heat transfer / sublimation',
  'Piastra termica': 'Heat plate',
  'Temperatura': 'Temperature',
  'Pressione': 'Pressure',
  'Tecnologia': 'Technology',
  'incisione': 'engraving',
  'taglio': 'cutting',
  'marcatura': 'marking',
  'marcatura metalli': 'metal marking',
  'rilievo 3D': '3D relief',
  'stampa diretta': 'direct printing',
  'stampa su cilindri (rotativo)': 'cylinder printing (rotary)',
  'stampa su tessuto': 'fabric printing',
  'sublimazione 3D': '3D sublimation',
  'produzione trasferimenti UV DTF': 'UV DTF transfer production',
  'taglio materiali sottili (diodo)': 'thin material cutting (diode)',
  'strato 0,12 mm': '0.12 mm layer',
  'strato 0,20 mm': '0.20 mm layer',
  'strato 0,28 mm': '0.28 mm layer',
  'Diodo blu 445 nm': 'Blue diode 445 nm',
  'IR 5 W (1064 nm) + diodo 15 W (455 nm)': 'IR 5 W (1064 nm) + diode 15 W (455 nm)',
  'CO₂ 55 W · diodo 20 W · UV 5 W · MOPA 60 W · fibra 30 W': 'CO₂ 55 W · diode 20 W · UV 5 W · MOPA 60 W · fibre 30 W',
  'Laser CO₂, 80 W': 'CO₂ laser, 80 W',
  'Area operativa': 'Work area',
  'Area piano standard': 'Standard bed area',
  'Area standard': 'Standard area',
  'Altezza massima': 'Maximum height',
  'Velocità max dichiarata': 'Stated max speed',
  'Risoluzione dichiarata': 'Stated resolution',
  'AutoLift, regolazione automatica': 'AutoLift, automatic adjustment',
  '3: riconoscimento materiale, allineamento, misura altezza': '3: material recognition, alignment, height measurement',
  'fino a 299 cm con AutoPassthrough': 'up to 299 cm with AutoPassthrough',

  /* --- macchine --- */
  'Machine Lab': 'Machine Lab',
  'Il parco macchine,': 'The machine park,',
  'senza': 'no',
  'giri di parole.': 'beating about the bush.',
  'Cosa c\'è in officina, cosa fa ciascuna, cosa si sblocca mettendole insieme, e l\'elenco onesto di quello che non lavoriamo e perché.': 'What is in the workshop, what each one does, what you unlock by combining them, and the honest list of what we don\'t work with and why.',
  'Entra nel mondo del laser.': 'Step into the world of lasers.',
  'Dagli forma.': 'Give it shape.',
  'Se sei interessato e vuoi spingerti nel mondo laser e nella creatività xTool, partiamo dalla tua idea. Con Giuseppe Inglima puoi richiedere una demo gratuita e capire quale macchina, materiale o percorso può aiutarti a realizzarla.': 'If you want to dive into lasers and xTool creativity, we start from your idea. With Giuseppe Inglima you can request a free demo and find out which machine, material or path can help you make it real.',
  'Richiedi una demo gratuita': 'Request a free demo',
  'Scopri INGLY Academy': 'Discover INGLY Academy',
  'Porta un progetto, una domanda o anche solo la curiosità. La prima cosa è capire cosa vuoi creare.': 'Bring a project, a question or just your curiosity. The first thing is understanding what you want to create.',
  'FOTO UFFICIALE xTOOL P3 · MODELLO DEL LAB': 'OFFICIAL xTOOL P3 PHOTO · LAB MODEL',
  'La macchina giusta.': 'The right machine.',
  'Per il risultato giusto.': 'For the right result.',
  'Specifiche dai manuali e dalle pagine xTool ufficiali. Ogni tecnologia ha possibilità e limiti diversi: ti aiutiamo a scegliere quella adatta al progetto.': 'Specifications from the official xTool manuals and pages. Each technology has different possibilities and limits: we help you choose the right one for the project.',
  'Taglio di legno, acrilico e materiali compatibili; incisioni e lavorazioni di grande formato.': 'Cutting wood, acrylic and compatible materials; large-format engraving and processing.',
  'Fonte ufficiale xTool ↗': 'Official xTool source ↗',
  'L\'incisione diretta del metallo richiede un modulo/accessorio idoneo: CO₂ 80 W non equivale a fibra.': 'Engraving metal directly requires a suitable module/accessory: an 80 W CO₂ is not a fibre laser.',
  'Incisione e marcatura di oggetti piccoli, accessori, targhette e metalli compatibili con sorgente IR.': 'Engraving and marking small objects, accessories, tags and IR-compatible metals.',
  'Le lavorazioni variano per finitura, materiale e accessorio; non è una sorgente MOPA.': 'Results vary by finish, material and accessory; it is not a MOPA source.',
  'Personalizzazione a colori di legno, acrilico, vetro e articoli compatibili. Fluo e stampa tessile dipendono dalla versione.': 'Full-colour personalisation of wood, acrylic, glass and compatible items. Fluo and textile printing depend on the version.',
  'È una stampante UV a getto d\'inchiostro, non un laser UV: la versione disponibile in laboratorio te la confermiamo prima del lavoro.': 'It is a UV inkjet printer, not a UV laser: we confirm the version available in the workshop before the job.',
  'Trasferimenti DTF e termoadesivi, sublimazione e, con moduli dedicati, formatura o cottura creativa.': 'DTF and heat-transfer vinyl, sublimation and, with dedicated modules, forming or creative baking.',
  'La disponibilità dei moduli Craft Oven e 3D Form te la confermiamo prima del lavoro.': 'We confirm availability of the Craft Oven and 3D Form modules before the job.',
  'La prima macchina di tanti: incide e taglia, e taglia anche con la lama.': 'The first machine for many: it engraves and cuts, and cuts with a blade too.',
  'Quattro mestieri in una: incisione, taglio, stampa e penna da disegno.': 'Four trades in one: engraving, cutting, printing and a drawing pen.',
  'Portatile. Marca il metallo e incide il legno senza occupare un banco.': 'Portable. It marks metal and engraves wood without taking over a bench.',
  'Il passo avanti della F1: fibra per il metallo, diodo per il resto.': 'The step up from the F1: fibre for metal, diode for the rest.',
  'Il colore sul metallo e la potenza per i materiali difficili.': 'Colour on metal and power for difficult materials.',
  'Sorgente UV: incide a freddo dove il calore rovinerebbe il pezzo.': 'UV source: cold engraving where heat would ruin the piece.',
  'CO₂ da banco con telecamere: formato grande, ingombro contenuto.': 'Desktop CO₂ with cameras: large format, compact footprint.',
  'CO₂ di punta: grande formato, taglio spesso, produzione in serie.': 'Flagship CO₂: large format, thick cutting, batch production.',
  'Diodo chiuso: sicuro, silenzioso, pensato per stare in casa.': 'Enclosed diode: safe, quiet, designed for the home.',
  'Doppia sorgente su un piano piccolo: il metallo lo marca, non lo taglia.': 'Dual source on a small bed: it marks metal, it doesn\'t cut it.',
  'Pressa a caldo: chiude il ciclo del DTF sui capi.': 'Heat press: completes the DTF process on garments.',
  'P3 taglia la sagoma, UV stampa il colore': 'P3 cuts the shape, UV prints the colour',
  'Cartellonistica normata, portamenu con logo, tableau, targhe nascita, taglieri': 'Regulated signage, branded menu holders, seating charts, birth plaques, cutting boards',
  'UV stampa il trasferimento DTF, il forno lo cura, la pressa lo applica': 'UV prints the DTF transfer, the oven cures it, the press applies it',
  'Grembiuli e divise HORECA, capi aziendali, tote bag — colore pieno senza minimi': 'Hospitality aprons and uniforms, corporate wear, tote bags — full colour, no minimums',
  'Si comprano i pezzi metallici già tagliati e si personalizzano': 'Pre-cut metal blanks are bought in and personalised',
  'P3 la base, F2 la targhetta metallica, UV il logo a colori': 'P3 for the base, F2 for the metal tag, UV for the colour logo',
  'Premi e trofei: la famiglia col margine più alto': 'Awards and trophies: the highest-margin family',
  'Modulo sottovuoto per la sublimazione 3D': 'Vacuum module for 3D sublimation',
  'Tazze, borracce, cover telefono con stampa avvolgente': 'Mugs, bottles and phone cases with wrap-around print',
  'INGLY Machine Lab': 'INGLY Machine Lab',
  'Vedila lavorare,': 'See it work,',
  'poi': 'then',
  'decidi.': 'decide.',
  'comprarle.': 'buy them.',
  'risultati': 'results',
  'Un\'ora in officina con la macchina accesa: porti un\'idea o un pezzo, si prova davvero, e alla fine sai se fa al caso tuo. Non si vende niente in quell\'ora.': 'An hour in the workshop with the machine running: bring an idea or a piece, we really try it, and at the end you know whether it suits you. Nothing is sold in that hour.',
  'Le stesse macchine con cui produciamo tutti i giorni, insegnate da chi ci lavora. Percorsi in presenza o online da concordare, dalla prima configurazione fino al workflow completo.': 'The same machines we produce with every day, taught by the people who use them. In-person or online paths by arrangement, from first setup to production workflow.',

  /* --- business e pagine interne --- */
  'Ingly Business': 'Ingly Business',
  'INGLY DESIGN / DESIGN STUDIO': 'INGLY DESIGN / DESIGN STUDIO',
  'INGLY DESIGN / MATERIAL LIBRARY': 'INGLY DESIGN / MATERIAL LIBRARY',
  'INGLY DESIGN / PERSONALIZZA': 'INGLY DESIGN / CUSTOMISE',
  'INGLY DESIGN / TECNOLOGIE': 'INGLY DESIGN / TECHNOLOGIES',
  'INGLY DESIGN · Palermo, Italia · P.IVA in corso di attribuzione': 'INGLY DESIGN · Palermo, Italy · VAT number being assigned',
  '1 idea': '1 idea',
  'Sostituzione prodotto (6)': 'Product replacement (6)',

  /* --- generatori, prova incisione (pagine autonome) --- */
  'Cerca generatori': 'Search generators',
  'INGLY DESIGN Generator Studio — File parametrici per laser': 'INGLY DESIGN Generator Studio — Parametric laser files',
  'Prova la tua foto incisa — INGLY DESIGN': 'Try your engraved photo — INGLY DESIGN',

  /* --- titoli della scheda del browser --- */
  'INGLY DESIGN — Incisione laser a Palermo e centro assistenza xTool in Sicilia': 'INGLY DESIGN — Laser engraving in Palermo and xTool service centre in Sicily',
  'INGLY Academy — INGLY DESIGN': 'INGLY Academy — INGLY DESIGN'
};

const norm = s => String(s).replace(/\s+/g, ' ').trim();
const MAPPA = new Map(Object.entries(DIZIONARIO).map(([k, v]) => [norm(k), v]));
const ATTR = ['alt', 'aria-label', 'placeholder', 'title'];
const SALTA = /^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|TEXTAREA|CODE|PRE)$/;
const testiTradotti = new Map();   /* nodo di testo → originale */
const attrTradotti = new Map();    /* elemento → {attr: originale} */
let lingua = 'it', osservatore = null;

export const traduzione = testo => MAPPA.get(norm(testo));

function testo(n) {
  const v = n.nodeValue; if (!v || v.length < 2) return;
  const p = n.parentElement; if (!p || SALTA.test(p.tagName) || p.closest('[translate="no"],[data-no-traduzione]')) return;
  if (lingua === 'en') {
    const m = /^(\s*)([\s\S]*?)(\s*)$/.exec(v), en = MAPPA.get(norm(m[2]));
    if (en !== undefined && en !== m[2]) { testiTradotti.set(n, v); n.nodeValue = m[1] + en + m[3]; }
  }
}
function attributi(el) {
  if (!el.getAttribute || el.closest('[translate="no"],[data-no-traduzione]')) return;
  for (const a of ATTR) {
    const v = el.getAttribute(a); if (!v) continue;
    const en = MAPPA.get(norm(v));
    if (lingua === 'en' && en !== undefined && en !== v) {
      const o = attrTradotti.get(el) || {}; o[a] = v; attrTradotti.set(el, o); el.setAttribute(a, en);
    }
  }
}
function scorri(radice) {
  if (!radice) return;
  if (radice.nodeType === 3) { testo(radice); return; }
  if (radice.nodeType !== 1) return;
  attributi(radice);
  const tw = document.createTreeWalker(radice, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);
  let n; while ((n = tw.nextNode())) { if (n.nodeType === 3) testo(n); else attributi(n); }
}
function ripristina() {
  for (const [n, v] of testiTradotti) if (n.isConnected) n.nodeValue = v;
  testiTradotti.clear();
  for (const [el, o] of attrTradotti) if (el.isConnected) for (const [a, v] of Object.entries(o)) el.setAttribute(a, v);
  attrTradotti.clear();
}

/** Applica la lingua ai testi fissi. In italiano rimette gli originali. */
export function applica(L) {
  lingua = L === 'en' ? 'en' : 'it';
  if (typeof document === 'undefined') return;
  if (lingua === 'it') { ripristina(); return; }
  scorri(document.body);
  const t = MAPPA.get(norm(document.title)); if (t && t !== document.title) document.title = t;
  if (!osservatore && typeof MutationObserver === 'function') {
    osservatore = new MutationObserver(lista => {
      if (lingua !== 'en') return;
      for (const m of lista) {
        if (m.type === 'childList') m.addedNodes.forEach(scorri);
        else if (m.type === 'characterData') testo(m.target);
        else if (m.type === 'attributes') attributi(m.target);
      }
    });
    osservatore.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTR });
    const head = document.querySelector('head > title');
    if (head) new MutationObserver(() => { if (lingua === 'en') { const x = MAPPA.get(norm(document.title)); if (x && x !== document.title) document.title = x; } }).observe(head, { childList: true, characterData: true, subtree: true });
  }
}
