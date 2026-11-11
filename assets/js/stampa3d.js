/* ============ STAMPA 3D — CONTENUTI E LOGICA ============
   La pagina /stampa-3d: cosa stampiamo, come si combina con il laser e la
   stampa UV (il punto di forza di INGLY: un laboratorio che ha tutte e tre),
   materiali, invio del file, domande frequenti.

   I testi stanno qui come base; content.json → STAMPA3D può sovrascriverli
   sezione per sezione dall'Admin senza toccare il codice. Puro: nessun DOM,
   lo usano sia la pagina (stampa3d-ui.js) sia il prerender. */

export const BASE_DATI = Object.freeze({
  titolo: { it: 'Il pezzo che non esiste,<br>lo <span class="hl">stampiamo a strati.</span>', en: 'Parts that don’t exist,<br><span class="hl">printed layer by layer.</span>' },
  titoloPiano: { it: 'Stampa 3D su misura', en: 'Custom 3D printing' },
  intro: {
    it: 'Prototipi, ricambi, oggetti personalizzati e lampade dalla tua foto. E quando serve, la stampa 3D lavora insieme al laser e alla stampa UV dello stesso laboratorio: un solo progetto, un solo interlocutore.',
    en: 'Prototypes, spare parts, personalised objects and lamps from your photo. When it helps, 3D printing works together with the laser and UV printing of the same workshop: one project, one point of contact.',
  },
  servizi: [
    { t: { it: 'Prototipi e verifiche', en: 'Prototypes and fit checks' }, d: { it: 'Il pezzo da tenere in mano prima di impegnare una serie: forme, ingombri, incastri.', en: 'The part to hold before committing to a run: shapes, sizes, fits.' } },
    { t: { it: 'Ricambi e componenti', en: 'Spares and components' }, d: { it: 'Il gancio rotto, il supporto fuori produzione, la manopola che non si trova più. Da un modello o dalle misure.', en: 'The broken clip, the discontinued bracket, the knob you can’t find any more. From a model or from measurements.' } },
    { t: { it: 'Lampade e litofanie', en: 'Lamps and lithophanes' }, d: { it: 'Pannelli che con la luce dietro mostrano la tua foto, lampade in rilievo come la Luna.', en: 'Panels that reveal your photo when backlit, relief lamps like our Moon lamp.' } },
    { t: { it: 'Nomi e lettere 3D', en: 'Names and 3D letters' }, d: { it: 'Lettere in rilievo per camerette, vetrine, eventi: colori a scelta, da appoggio o da parete.', en: 'Raised letters for bedrooms, shop windows and events: your colours, freestanding or wall-mounted.' } },
    { t: { it: 'Gadget e oggetti aziendali', en: 'Corporate items' }, d: { it: 'Portachiavi, espositori, porta biglietti e piccoli oggetti con il logo, anche in piccole serie.', en: 'Keyrings, displays, card holders and small branded items, small runs included.' } },
    { t: { it: 'Decorazioni per eventi', en: 'Event decorations' }, d: { it: 'Cake topper, segnaposto e centrotavola in volume, coordinati con il resto dell’allestimento.', en: 'Cake toppers, place cards and centrepieces in 3D, matched to the rest of the styling.' } },
  ],
  combinati: {
    titolo: { it: 'Stampa 3D + laser + UV: <span class="hl">il nostro punto di forza.</span>', en: '3D printing + laser + UV: <span class="hl">our strong suit.</span>' },
    intro: { it: 'Pochi laboratori hanno tutte e tre le tecnologie sotto lo stesso tetto. Così un oggetto può avere il volume della stampa 3D, la precisione del taglio laser e il colore della stampa UV.', en: 'Few workshops have all three technologies under one roof. So one object can have the volume of 3D printing, the precision of laser cutting and the colour of UV printing.' },
    voci: [
      { tag: '3D + Laser', t: { it: 'Lettere 3D su base incisa', en: '3D letters on an engraved base' }, d: { it: 'Il nome stampato in rilievo, la base in legno tagliata e incisa al laser con data e dedica.', en: 'The name printed in relief, the wooden base laser-cut and engraved with a date and message.' } },
      { tag: { it: '3D + Legno', en: '3D + Wood' }, t: { it: 'Lampade con cornice in legno', en: 'Lamps with a wooden frame' }, d: { it: 'Il rilievo stampato in 3D, la cornice e il coperchio tagliati al laser: come la nostra lampada Luna.', en: 'The relief 3D-printed, the frame and back laser-cut: like our Moon lamp.' } },
      { tag: '3D + UV', t: { it: 'Espositori con grafica a colori', en: 'Displays with colour graphics' }, d: { it: 'Corpo stampato in 3D, frontale in plexiglass stampato UV con logo e colori del marchio.', en: '3D-printed body, acrylic front UV-printed with the logo and brand colours.' } },
      { tag: '3D + Laser', t: { it: 'Litofanie in cornice', en: 'Framed lithophanes' }, d: { it: 'La foto in controluce stampata in 3D dentro una cornice di legno con il nome inciso e la luce LED.', en: 'The backlit photo 3D-printed inside a wooden frame with an engraved name and LED light.' } },
    ],
  },
  materiali: [
    { n: 'PLA', uso: { it: 'Oggetti decorativi, prototipi, lampade e litofanie', en: 'Decorative objects, prototypes, lamps and lithophanes' }, nota: { it: 'Preciso e facile da rifinire. Non ama il sole e il calore: è da interno.', en: 'Precise and easy to finish. Dislikes sun and heat: it’s for indoors.' }, rif: 'materiali/pla' },
    { n: 'PETG', uso: { it: 'Pezzi che lavorano: supporti, ganci, parti esposte all’umidità', en: 'Working parts: brackets, clips, parts exposed to moisture' }, nota: { it: 'Più tenace del PLA e regge meglio il calore; superficie un po’ meno nitida.', en: 'Tougher than PLA and handles heat better; slightly less crisp surface.' } },
    { n: 'TPU', uso: { it: 'Parti flessibili: guarnizioni, piedini, cover', en: 'Flexible parts: gaskets, feet, covers' }, nota: { it: 'Su richiesta: ti diciamo prima se la forma si presta.', en: 'On request: we tell you first whether the shape suits it.' } },
    { n: 'ABS', uso: { it: 'Componenti tecnici che scaldano', en: 'Technical parts that get warm' }, nota: { it: 'Su richiesta, dopo aver visto il pezzo e l’uso.', en: 'On request, after seeing the part and its use.' } },
    { n: { it: 'Resina', en: 'Resin' }, uso: { it: 'Dettagli minuti e superfici lisce', en: 'Fine details and smooth surfaces' }, nota: { it: 'Su richiesta per pezzi piccoli: fragile agli urti.', en: 'On request for small parts: brittle on impact.' } },
  ],
  passi: [
    { t: { it: 'Mandaci il file o le misure', en: 'Send the file or the measurements' }, d: { it: 'STL, 3MF, OBJ o STEP. Niente file? Bastano foto del pezzo con un righello accanto e le misure principali.', en: 'STL, 3MF, OBJ or STEP. No file? Photos of the part next to a ruler and the main measurements are enough.' } },
    { t: { it: 'Controllo e preventivo', en: 'Check and quote' }, d: { it: 'Verifichiamo spessori, orientamento e materiale giusto per l’uso. Ti diciamo prima cosa si può fare e cosa no.', en: 'We check wall thickness, orientation and the right material for the job. We tell you upfront what works and what doesn’t.' } },
    { t: { it: 'Stampa', en: 'Printing' }, d: { it: 'Il pezzo cresce strato dopo strato. Per i pezzi tecnici, se serve, stampiamo prima un campione.', en: 'The part grows layer by layer. For technical parts we print a sample first if needed.' } },
    { t: { it: 'Rifinitura e consegna', en: 'Finishing and delivery' }, d: { it: 'Supporti tolti a mano, superfici di appoggio rifinite. Ritiro in laboratorio o spedizione.', en: 'Supports removed by hand, contact faces cleaned up. Pick-up at the workshop or shipping.' } },
  ],
  formati: ['STL', '3MF', 'OBJ', 'STEP'],
  checklist: {
    it: ['Misure d’ingombro e quantità', 'Dove va usato: interno, esterno, a contatto con calore o acqua', 'Colore e finitura preferiti', 'Se deve incastrare con altro: le misure di quel pezzo'],
    en: ['Overall size and quantity', 'Where it will be used: indoors, outdoors, near heat or water', 'Preferred colour and finish', 'If it must fit something else: that part’s measurements'],
  },
  faq: [
    { d: { it: 'Posso mandare solo una foto del pezzo rotto?', en: 'Can I send just a photo of the broken part?' }, r: { it: 'La foto aiuta, ma per un pezzo che deve incastrare servono le misure: diametri, spessori, distanze dei fori. Se puoi, portacelo in laboratorio e lo misuriamo noi.', en: 'A photo helps, but a part that must fit needs measurements: diameters, thicknesses, hole spacing. If you can, bring it to the workshop and we measure it.' } },
    { d: { it: 'Quanto è resistente un pezzo stampato?', en: 'How strong is a printed part?' }, r: { it: 'Dipende da materiale, riempimento e orientamento: gli strati sono il punto debole. Per i pezzi che lavorano scegliamo PETG e un orientamento che tenga la forza nella direzione giusta.', en: 'It depends on material, infill and orientation: the layers are the weak point. For working parts we choose PETG and an orientation that keeps the load in the right direction.' } },
    { d: { it: 'Fate anche un pezzo solo?', en: 'Do you print one-offs?' }, r: { it: 'Sì, è proprio il caso in cui la stampa 3D conviene: nessuno stampo, nessun minimo. Per grandi serie ti consigliamo noi se conviene un’altra tecnologia.', en: 'Yes, that’s exactly when 3D printing pays off: no mould, no minimum. For large runs we’ll tell you if another technology makes more sense.' } },
    { d: { it: 'Il file STL della litofania è gratuito?', en: 'Is the lithophane STL file free?' }, r: { it: 'Sì: il generatore crea il file sul tuo dispositivo e puoi stamparlo tu. Se non hai una stampante, la stampiamo noi con la foto già allegata al preventivo.', en: 'Yes: the generator builds the file on your device and you can print it yourself. No printer? We print it, with the photo already attached to the quote.' } },
    { d: { it: 'Stampate modelli di personaggi famosi?', en: 'Do you print famous characters?' }, r: { it: 'No: niente personaggi o marchi protetti senza licenza. Stampiamo progetti tuoi, modelli con licenza che ne permette l’uso e creazioni originali INGLY.', en: 'No: no protected characters or brands without a licence. We print your own designs, models whose licence allows it and original INGLY creations.' } },
  ],
});

const ogg = x => x && typeof x === 'object' && !Array.isArray(x);

/** I dati della pagina: la base, con le sezioni sovrascritte da content.json → STAMPA3D. */
export function dati(contenuti = {}) {
  const s = contenuti && contenuti.STAMPA3D;
  if (!ogg(s)) return BASE_DATI;
  const out = { ...BASE_DATI };
  for (const k of Object.keys(BASE_DATI)) {
    if (s[k] == null) continue;
    if (Array.isArray(BASE_DATI[k]) && Array.isArray(s[k]) && s[k].length) out[k] = s[k];
    else if (ogg(BASE_DATI[k]) && ogg(s[k])) out[k] = { ...BASE_DATI[k], ...s[k] };
  }
  return out;
}

export const lingua = (v, L = 'it') => (v == null ? '' : typeof v === 'string' ? v : String(v[L] || v.it || v.en || ''));
const soloTesto = s => String(s).replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

/** I prodotti del catalogo nati dalla stampa 3D (materiale PLA/PETG o «3D» nel materiale). */
export const prodotti3d = (P = []) => (P || []).filter(p => p && !p.hidden && /PLA|PETG|3D/i.test(String(p.mat || '')));

/** Testo del preventivo precompilato: da qui la richiesta arriva già incanalata. */
export const ideaPreventivo = L => (L === 'en' ? '3D printing: ' : 'Stampa 3D: ');

/** Corpo HTML statico per chi legge senza JavaScript (crawler, anteprime). */
export function corpoStatico(D, { L = 'it', base = '', esc, prodotti = [] } = {}) {
  const e = esc || (t => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'));
  const r = [];
  r.push('<h1>' + e(lingua(D.titoloPiano, L)) + '</h1>');
  r.push('<p>' + e(lingua(D.intro, L)) + '</p>');
  r.push('<h2>Cosa stampiamo</h2><ul>' + D.servizi.map(s => '<li><strong>' + e(lingua(s.t, L)) + '</strong> — ' + e(lingua(s.d, L)) + '</li>').join('') + '</ul>');
  r.push('<h2>' + e(soloTesto(lingua(D.combinati.titolo, L))) + '</h2><p>' + e(lingua(D.combinati.intro, L)) + '</p><ul>' +
    D.combinati.voci.map(v => '<li><strong>' + e(lingua(v.t, L)) + '</strong> (' + e(lingua(v.tag, L)) + ') — ' + e(lingua(v.d, L)) + '</li>').join('') + '</ul>');
  r.push('<h2>Materiali</h2><ul>' + D.materiali.map(m => '<li><strong>' + e(lingua(m.n, L)) + '</strong>: ' + e(lingua(m.uso, L)) + '. ' + e(lingua(m.nota, L)) + '</li>').join('') + '</ul>');
  r.push('<h2>Dal file al pezzo</h2><ol>' + D.passi.map(p => '<li><strong>' + e(lingua(p.t, L)) + '</strong> — ' + e(lingua(p.d, L)) + '</li>').join('') + '</ol>');
  r.push('<p>Formati accettati: ' + D.formati.map(e).join(', ') + '. <a href="' + base + '/quote">Chiedi un preventivo</a> · <a href="' + base + '/litofania.html">Crea una litofania dalla tua foto</a> · <a href="' + base + '/tecnologie/stampa3d">La tecnologia</a></p>');
  if (prodotti.length) r.push('<h2>Creazioni stampate in 3D</h2><ul>' + prodotti.map(p => '<li><a href="' + base + '/product/' + p.id + '/">' + e(lingua(p.n, L)) + '</a></li>').join('') + '</ul>');
  r.push('<h2>Domande frequenti</h2>' + D.faq.map(f => '<h3>' + e(lingua(f.d, L)) + '</h3><p>' + e(lingua(f.r, L)) + '</p>').join(''));
  return r.join('\n');
}

/** Dati strutturati: il servizio e le domande frequenti. */
export function schema(D, { L = 'it', base = '', idAzienda = '' } = {}) {
  return [
    { '@type': 'Service', '@id': base + '/stampa-3d#servizio', name: lingua(D.titoloPiano, L), serviceType: '3D printing',
      description: lingua(D.intro, L), provider: idAzienda ? { '@id': base + idAzienda } : undefined, areaServed: 'IT', url: base + '/stampa-3d' },
    { '@type': 'FAQPage', '@id': base + '/stampa-3d#faq', mainEntity: D.faq.map(f => ({ '@type': 'Question', name: lingua(f.d, L), acceptedAnswer: { '@type': 'Answer', text: lingua(f.r, L) } })) },
  ];
}
