# INGLY DESIGN — Audit foto prodotto (2026-10-15)

**Origine:** `data/products.json` confrontato con l'inventario effettivo `data/immagini.json.file` generato dal repository. Nessuna foto sintetica o sostitutiva: ogni immagine deve corrispondere al prodotto.

- Schede nel catalogo: **97**
- Schede con foto di riferimento assente dall'inventario: **77**
- Di queste, attualmente visibili (`hidden !== true`): **43**
- Con percorso scritto ma file mancante: **77**

> L'audit segnala riferimenti locali `img/...` mancanti: non prova che una foto esterna sia valida o che la fotografia effettiva rappresenti fedelmente il prodotto. Dopo ogni upload, riaprire la Media Library, assegnare la foto alla scheda, controllare taglio/focus e pubblicare l'inventario generato nello stesso commit.

| ID | Categoria | Nome prodotto | Foto attesa | Stato |
|---|---|---|---|---|
| 9 | eventi | Guestbook Nozze Inciso su Legno | `img/9.webp` | pubblico |
| 10 | eventi | Bomboniere Personalizzate ×10 | `img/10.webp` | pubblico |
| 11 | b2b | QR Menu Plexiglass per Locale | `img/11.webp` | pubblico |
| 12 | eventi | Targa Laurea Personalizzata | `img/12.webp` | pubblico |
| 13 | eventi | Penna Incisa Laurea | `img/13.webp` | pubblico |
| 15 | eventi | Ricordo Battesimo in Legno | `img/15.webp` | pubblico |
| 16 | eventi | Set Gender Reveal Party | `img/16.webp` | pubblico |
| 18 | animali | QR Pet Tag — Profilo Digitale | `img/18.webp` | pubblico |
| 19 | animali | Ritratto Pet su Legno | `img/19.webp` | pubblico |
| 24 | accessori | Collana con Charm Inciso | `img/24.webp` | pubblico |
| 25 | accessori | Bracciale in Pelle Inciso | `img/25.webp` | pubblico |
| 26 | b2b | Targa Professionale per Ufficio | `img/26.webp` | pubblico |
| 27 | b2b | Kit Gadget Aziendali Personalizzati | `img/27.webp` | pubblico |
| 28 | b2b | Borraccia Incisa con Logo Aziendale | `img/28.webp` | pubblico |
| 29 | b2b | Set Penne Incise Aziendali ×10 | `img/29.webp` | pubblico |
| 30 | b2b | Set QR Menu Ristorante ×10 | `img/30.webp` | pubblico |
| 31 | bambini | Targa Nascita Personalizzata | `img/31.webp` | pubblico |
| 32 | bambini | Lettere 3D Nome Cameretta | `img/32.webp` | pubblico |
| 33 | bambini | Misuratore di Crescita in Legno | `img/33.webp` | pubblico |
| 34 | bambini | Lampada Plexiglass Baby Personalizzata | `img/34.webp` | pubblico |
| 35 | stagionale | Set Decorazioni Natale ×6 | `img/35.webp` | pubblico |
| 36 | stagionale | Cuore San Valentino in Plexiglass | `img/36.webp` | pubblico |
| 37 | stagionale | Coniglietto Pasqua in Legno | `img/37.webp` | pubblico |
| 38 | stagionale | Zucca Halloween Decorativa | `img/38.webp` | pubblico |
| 39 | stagionale | Travel Tag Estate Personalizzato | `img/39.webp` | pubblico |
| 40 | limited | Serie Speciale Oro — Collezione Esclusiva | `img/40.webp` | pubblico |
| 41 | limited | Collab Artista — Skyline Palermo | `img/41.webp` | pubblico |
| 42 | limited | Collezione Alpi — Skyline Montagne | `img/42.webp` | pubblico |
| 43 | casa | Orologio da Parete in Legno Personalizzato | `img/43.webp` | pubblico |
| 44 | casa | Tagliere in Legno Inciso Personalizzato | `img/44.webp` | pubblico |
| 45 | casa | Cornice Portafoto Personalizzata | `img/45.webp` | pubblico |
| 46 | casa | Set Sottobicchieri Personalizzati ×4 | `img/46.webp` | pubblico |
| 47 | casa | Scritta Decorativa Famiglia in Legno | `img/47.webp` | pubblico |
| 48 | casa | Targa Benvenuto Porta d'Ingresso | `img/48.webp` | pubblico |
| 49 | accessori | Portagioie in Legno Personalizzato | `img/49.webp` | pubblico |
| 50 | accessori | Segnalibro in Legno Personalizzato | `img/50.webp` | pubblico |
| 51 | accessori | Cover Smartphone Personalizzata | `img/51.webp` | pubblico |
| 52 | eventi | Tableau Matrimonio in Legno Massello | `img/52.webp` | pubblico |
| 53 | eventi | Copertina Libretto Messa Incisa | `img/53.webp` | pubblico |
| 54 | bambini | Box Ricordi Prima Infanzia | `img/54.webp` | pubblico |
| 55 | bambini | Cubi Nome in Legno per Neonato | `img/55.webp` | pubblico |
| 56 | animali | Targa Cuccia Cane/Gatto Personalizzata | `img/56.webp` | pubblico |
| 57 | animali | Urna Commemorativa Animale Domestico | `img/57.webp` | pubblico |
| 23 | accessori | Etichetta Bagaglio in Pelle | `img/23.webp` | nascosto |
| 58 | stagionale | Pallina di Natale in Legno Personalizzata | `img/58.webp` | nascosto |
| 59 | stagionale | Segnaposto Natalizi ×12 | `img/59.webp` | nascosto |
| 60 | eventi | Kit Battesimo Completo in Legno | `img/60.webp` | nascosto |
| 61 | casa | Targa Numero Civico Personalizzata | `img/61.webp` | nascosto |
| 62 | b2b | Stand QR Code Tavolo per Business | `img/62.webp` | nascosto |
| 63 | b2b | Kit Onboarding Benvenuto Dipendenti | `img/63.webp` | nascosto |
| 64 | eventi | Cornice Prima Comunione Personalizzata | `img/64.webp` | nascosto |
| 65 | eventi | Cornice Festa della Mamma o del Papà | `img/65.webp` | nascosto |
| 66 | b2b | Timbro in Gomma Personalizzato | `img/66.webp` | nascosto |
| 67 | casa | Poster Skyline Palermo su Legno | `img/67.webp` | nascosto |
| 68 | eventi | Targhetta Vino Bottiglia Personalizzata | `img/68.webp` | nascosto |
| 69 | bambini | Puzzle Personalizzato in Legno | `img/69.webp` | nascosto |
| 70 | bambini | Set Gancini Cameretta ×5 | `img/70.webp` | nascosto |
| 71 | eventi | Box Regalo Compleanno in Legno | `img/71.webp` | nascosto |
| 72 | bambini | Salvadanaio Personalizzato in Legno | `img/72.webp` | nascosto |
| 73 | casa | Calendario Perpetuo in Legno | `img/73.webp` | nascosto |
| 74 | digitale | Bundle SVG Natale — 30 File Laser | `img/74.webp` | nascosto |
| 75 | digitale | Pack DXF Portachiavi — 20 Design | `img/75.webp` | nascosto |
| 76 | digitale | Template Tableau Matrimonio — File Vettoriale | `img/76.webp` | nascosto |
| 77 | digitale | File STL Lampada Luna — Stampa 3D | `img/77.webp` | nascosto |
| 78 | digitale | Pack Laser Completo — 200+ File SVG/DXF | `img/78.webp` | nascosto |
| 79 | bambini | Cornice Primo Giorno di Scuola | `img/79.webp` | nascosto |
| 80 | stagionale | Set Decorazioni Pasqua ×5 | `img/80.webp` | nascosto |
| 81 | stagionale | Set Back to School Cancelleria Personalizzata | `img/81.webp` | nascosto |
| 82 | b2b | Targa Studio Professionale Medico/Avvocato | `img/82.webp` | nascosto |
| 83 | accessori | Spilla in Metallo Personalizzata | `img/83.webp` | nascosto |
| 84 | stagionale | Slitta Natale Decorativa in Legno | `img/84.webp` | nascosto |
| 85 | eventi | Portabustine Confetti Nozze ×10 | `img/85.webp` | nascosto |
| 86 | eventi | Album Foto Nozze Copertina Legno | `img/86.webp` | nascosto |
| 87 | limited | Skyline Sicilia — Taormina ed Etna | `img/87.webp` | nascosto |
| 88 | accessori | Set Portachiavi Famiglia Personalizzato | `img/88.webp` | nascosto |
| 89 | eventi | Cornice Diploma/Attestato Professionale | `img/89.webp` | nascosto |
| 90 | casa | Set Chef — Cucina Personalizzata | `img/90.webp` | nascosto |

## Sequenza di bonifica

1. Fotografare il prodotto realmente realizzato su sfondo uniforme e un dettaglio della finitura; recuperare i file originali se già disponibili.
2. Aprire **Admin → Prodotti** e usare il filtro **Senza foto** (ora controlla l'esistenza del file, non la presenza del testo del percorso).
3. Caricare l'immagine tramite Media Library / editor prodotto, conservando il rapporto di proporzione senza deformare o ritagliare parti importanti.
4. Aggiornare il riferimento `img` e le eventuali `gallery`; pubblicare con il flusso bozza → commit unico.
5. Eseguire `npm run build && npm test`, verificare sia smartphone sia desktop e correggere riferimenti vecchi.

**Non promuovere un'illustrazione concettuale a fotografia di prodotto.** Per gli articoli che non hanno ancora una foto reale, mantenere un placeholder onesto.
