/* ============ PAGINE STATICHE: UNICO GENERATORE ============
   Usato da scripts/prerender.mjs (build) e dall'Admin (pubblicazione).
   Prima erano due copie: quella dell'Admin si era fermata indietro (niente
   domande frequenti, niente pagine del Lab e dei settori), e ogni
   pubblicazione dall'Admin impoveriva le schede prodotto. Una sola funzione
   pura: dati + guscio → { percorso: html }.

   I dati NON vengono modificati: categorie nascoste e catalogo in
   aggiornamento si applicano su una copia. */
import * as P from './prerender-engine.js';
import * as SCH from './schema-engine.js';
import * as FAQ from './faq-engine.js';
import * as FORN from './forniture.js';
import * as S3D from './stampa3d.js';
import * as VERT from './verticali.js';
import * as PR from './prezzi.js';
import * as LAB from './lab.js';
import { applicaCatalogo } from './catalogo-stato.js';
import * as CL from './collezioni.js';

const copia = x => JSON.parse(JSON.stringify(x == null ? null : x));

export function generaSito(dati, guscio){
  const cfg = copia(dati.cfg) || {};
  const prodotti = copia(dati.prodotti) || [];
  const categorie = copia(dati.categorie) || [];
  const contenuti = dati.contenuti || {};
  applicaCatalogo({ CONFIG: cfg, CATS: categorie, P: prodotti, MV: contenuti.MV });
  const testi = dati.testi || {};
  const DLAB = { MATERIALI: dati.materiali || {}, TECNOLOGIE: dati.tecnologie || {}, MACCHINE: dati.macchine || {}, CORSI: dati.corsi || {}, CONFIG: cfg, PRODUCTS: prodotti };

  const S = cfg.seo || {};
  const base = String(S.dominio || 'https://www.inglydesign.it').replace(/\/+$/, '');
  const azienda = S.azienda || 'INGLY DESIGN';
  const L = 'it';
  const T = k => (testi[L] && testi[L][k]) || '';

  const MATN = contenuti.MATN || {};
  const nomeMateriale = m => (MATN[m] && MATN[m][L]) || m || '';
  const nomeCategoria = id => {
    const c = categorie.find(x => x.id === id);
    return (c && c.n && c.n[L]) || '';
  };

  /* le entità comuni a ogni pagina: azienda, sito, lavorazioni */
  const entitaBase = [
    SCH.organizzazione(cfg, { base, social: Object.values(cfg.social || {}) }),
    SCH.sitoWeb(cfg, { base }),
    SCH.servizi(contenuti.TECH || [], { base, azienda }),
  ];

  const TITOLI = {
    shop:'Catalogo', digital:'Prodotti digitali', business:'B2B · Aziende',
    portfolio:'Portfolio', about:'Chi siamo', faq:'Domande frequenti', quote:'Richiedi un preventivo',
    forniture:'Forniture per il laser', 'stampa-3d':'Stampa 3D su misura',
  };

  function paginaProdotto(p){
    const canonico = P.indirizzo('product', { base, id: p.id });
    const titolo = (p.n && p.n[L]) + ' — ' + azienda;
    const desc = P.soloTesto((p.desc && p.desc[L]) || S.descrizione || '').slice(0, 300);
    const ctx = { L, azienda, categoria: nomeCategoria(p.cat), materiale: nomeMateriale(p.mat) };
    /* Le domande sono la parte che i motori AI citano più volentieri: vanno
       nell'HTML statico, non solo nei dati strutturati. */
    const faqs = FAQ.perProdotto(p, contenuti.FAQS || [], ctx);
    const contenuto = P.corpoProdotto(p, ctx) + '\n' + FAQ.html(faqs);
    const jsonld = SCH.grafo([
      ...entitaBase,
      FAQ.schema(faqs, { url: canonico }),
      SCH.compatta({
        '@type':'Product',
        name:(p.n && p.n[L]) || '', sku:p.sku || ('INGLY-' + p.id),
        description:desc,
        image:SCH.immagini(p, { base, cartella:cfg.cartellaImmagini || 'img/', L }),
        category:nomeCategoria(p.cat) || undefined,
        material:p.mat || undefined,
        brand:{ '@type':'Brand', name:azienda },
        /* con i prezzi spenti nell'Admin non si dichiara una cifra che la
           pagina non mostra: Google segnala i prezzi che non corrispondono */
        offers:PR.offertaSchema(p, cfg, { url:canonico, venditore:{ '@id': base + SCH.ID.org } }),
      }),
    ]);
    return P.componi(guscio, { pagina: 'product', titolo, descrizione:desc, canonico, contenuto, jsonld });
  }

  function paginaSito(pg){
    const canonico = P.indirizzo(pg, { base });
    const titolo = pg === 'home' ? (S.titolo || azienda) : (TITOLI[pg] || pg) + ' — ' + azienda;
    const desc = S.descrizione || '';
    const contenuto = P.corpoPagina(pg, {
      L, base, titolo: pg === 'home' ? azienda : (TITOLI[pg] || pg), descrizione: desc,
      prodotti: pg === 'shop' ? prodotti.filter(x => !x.hidden) : [],
      categorie: pg === 'shop' ? categorie : [],
    });
    /* il catalogo statico porta anche le raccolte: è da qui che un crawler
       scopre le pagine per occasione e per oggetto */
    const raccolte = pg === 'shop' ? CL.pubblicate(DCOLL).filter(c => c.gruppo === 'occasione' || c.gruppo === 'oggetto') : [];
    const contenutoPiu = raccolte.length ? contenuto + '\n<h2>Scegli per occasione o per oggetto</h2><ul>' +
      raccolte.map(c => `<li><a href="${base}/collezioni/${CL.rifDi(c)}">${esc(CL.lingua(c.n, L))}</a></li>`).join('') + '</ul>' : contenuto;
    /* le forniture: schede con il consiglio INGLY, link al negozio e avviso di affiliazione */
    if (pg === 'forniture' && !FORN.visibile(contenuti)) {
      /* spenta dall'Admin: la pagina esiste (nessun 404) ma non va su Google */
      return P.componi(guscio, { pagina: pg, titolo, descrizione: desc, canonico,
        contenuto: contenuto + '\n<p>Questa sezione al momento non è disponibile.</p>', jsonld: SCH.grafo([...entitaBase]) })
        .replace(/<meta name="robots" content="[^"]*">/, '<meta name="robots" content="noindex, follow">');
    }
    if (pg === 'stampa-3d') {
      const D3 = S3D.dati(contenuti);
      return P.componi(guscio, { pagina: pg, titolo: 'Stampa 3D su misura: prototipi, ricambi, lampade e litofanie — ' + azienda,
        descrizione: S3D.lingua(D3.intro, L), canonico,
        contenuto: S3D.corpoStatico(D3, { L, base, esc, prodotti: S3D.prodotti3d(prodotti) }),
        jsonld: SCH.grafo([...entitaBase, ...S3D.schema(D3, { L, base, idAzienda: SCH.ID.org })]) });
    }
    if (pg === 'forniture') {
      const DF = FORN.dati(contenuti);
      const sez = FORN.categorieVive(DF).map(c => '<h2>' + esc(FORN.lingua(c.n, L)) + '</h2>' +
        FORN.articoli(DF, { cat: c.id }).map(a => FORN.scheda(a, DF, { L, esc })).join('\n')).join('\n');
      const av = FORN.avviso(DF, L);
      return P.componi(guscio, { pagina: pg, titolo, descrizione: FORN.lingua(DF.intro, L) || desc, canonico,
        contenuto: contenuto + '\n<p>' + esc(FORN.lingua(DF.intro, L)) + '</p>\n' + sez + (av ? '\n<p>' + esc(av) + '</p>' : ''),
        jsonld: SCH.grafo([...entitaBase]) });
    }
    const extra = pg === 'shop'
      ? [SCH.paginaCollezione(prodotti.filter(x => !x.hidden), { base, L, titolo: azienda + ' — Catalogo', url: canonico })]
      : [];
    return P.componi(guscio, { pagina: pg, titolo, descrizione:desc, canonico, contenuto: contenutoPiu, jsonld: SCH.grafo([...entitaBase, ...extra]) });
  }

  /* Pagina di settore: /business/ristoranti e simili.
     Stesso guscio delle altre, contenuto e dati strutturati propri. È la pagina
     che intercetta «menu qr personalizzato ristorante» — una ricerca che il
     catalogo generico non può soddisfare, perché non parla quella lingua. */
  function paginaVerticale(v){
    const canonico = VERT.indirizzo(v, base);
    const { titolo, descrizione } = VERT.meta(v, { L, azienda, citta: S.citta || '' });
    const contenuto = VERT.corpo(v, { L, base, prodotti, prezzo: P.prezzo });
    const jsonld = SCH.grafo([
      ...entitaBase,
      ...VERT.schema(v, { L, base, azienda, idAzienda: SCH.ID.org }),
      VERT.briciole(v, { L, base }),
    ]);
    return P.componi(guscio, { pagina: 'business', titolo, descrizione, canonico, contenuto, jsonld });
  }

  /* Pagina di raccolta: /collezioni/matrimonio e simili.
     È la pagina che intercetta «segnaposto matrimonio personalizzati» o
     «targhe personalizzate Palermo»: una domanda per occasione o per oggetto,
     che il catalogo intero non sa a chi rispondere. Solo le raccolte con
     almeno un prodotto visibile: una pagina vuota è un vicolo cieco. */
  const DCOLL = { P: prodotti, COLLEZIONI: dati.collezioni || { collezioni: [] } };
  const esc = t => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const GRUPPI = { occasione: 'Per occasione', oggetto: 'Per tipo di oggetto', 'per-chi': 'Per la casa e per le aziende', vetrina: 'In evidenza' };
  function paginaCollezione(c){
    const slug = CL.rifDi(c);
    const canonico = base + '/collezioni/' + slug;
    const nome = CL.lingua(c.n, L);
    const seoT = c.seo && CL.lingua(c.seo.titolo, L);
    const seoD = c.seo && CL.lingua(c.seo.descrizione, L);
    const titolo = (seoT || nome) + ' | ' + azienda;
    const desc = seoD || CL.lingua(c.s, L) || S.descrizione || '';
    const items = CL.prodottiDi(c, DCOLL);
    const sorelle = CL.pubblicate(DCOLL).filter(x => x.id !== c.id && (x.gruppo || 'vetrina') === (c.gruppo || 'vetrina'));
    const contenuto = [
      `<nav aria-label="Percorso"><a href="${base}/">Home</a> › <a href="${base}/shop">Catalogo</a> › ${esc(nome)}</nav>`,
      `<h1>${esc(nome)}</h1>`,
      `<p>${esc(CL.lingua(c.intro, L) || CL.lingua(c.s, L))}</p>`,
      `<h2>${items.length === 1 ? '1 creazione' : items.length + ' creazioni'}</h2>`,
      '<ul>' + items.map(p => `<li><a href="${base}/product/${p.id}/">${esc(p.n && p.n[L])}</a>${nomeCategoria(p.cat) ? ' — ' + esc(nomeCategoria(p.cat)) : ''}</li>`).join('') + '</ul>',
      `<p>Non trovi quello che cerchi? Lo realizziamo su misura: <a href="${base}/quote">chiedi un preventivo</a>.</p>`,
      sorelle.length ? `<h2>${esc(GRUPPI[c.gruppo] || 'Altre raccolte')}</h2><ul>` + sorelle.map(x => `<li><a href="${base}/collezioni/${CL.rifDi(x)}">${esc(CL.lingua(x.n, L))}</a></li>`).join('') + '</ul>' : '',
    ].join('\n');
    const briciole = { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: base + '/' },
      { '@type': 'ListItem', position: 2, name: 'Catalogo', item: base + '/shop' },
      { '@type': 'ListItem', position: 3, name: nome, item: canonico } ] };
    const jsonld = SCH.grafo([...entitaBase, CL.schema(c, DCOLL, { L, base }), briciole].filter(Boolean));
    return P.componi(guscio, { pagina: 'shop', titolo, descrizione: desc, canonico, contenuto, jsonld });
  }

  /* ===== LAB: materiali, tecnologie, macchine =====
     Una scheda materiale è la pagina che intercetta «si può incidere il
     plexiglass» o «quale legno per un'incisione fine»: ricerche che il
     catalogo non può soddisfare, perché non parla quella lingua. */
  const TITOLI_LAB = {
    materiali: { t: 'Materiali', d: 'Nove materiali in lavorazione corrente, ognuno con le sue tecnologie, i suoi spessori e i suoi limiti dichiarati.' },
    tecnologie: { t: 'Tecnologie', d: 'Laser CO₂, fibra, MOPA, stampa UV, DTF e stampa 3D: cosa fa ognuna e quando conviene.' },
    macchine: { t: 'Macchine laser xTool a Palermo: demo, consigli e assistenza', d: 'Le macchine xTool che conosciamo come host xTool Squad a Palermo: demo, consigli sulla scelta, formazione, manutenzione e riparazione per la Sicilia e il Sud Italia.' },
    academy: { t: 'INGLY Academy', d: 'Imparare a usare le macchine da chi ci produce tutti i giorni, in officina a Palermo o collegati.' },
    demo: { t: 'Demo gratuita', d: 'Un\'ora in officina con la macchina accesa: la provi davvero prima di sceglierla.' }
  };

  function paginaLabSezione(sezione){
    const canonico = base + '/' + sezione;
    const info = TITOLI_LAB[sezione];
    const titolo = info.t + ' — ' + azienda;
    const contenuto = sezione === 'demo'
      ? LAB.corpoDemo(DLAB, { L, base })
      : LAB.corpoSezione(DLAB, sezione, { L, base, titolo: info.t, descrizione: info.d });
    const jsonld = SCH.grafo([...entitaBase, LAB.briciole(sezione, null, { L, base })]);
    return P.componi(guscio, { pagina: sezione, titolo, descrizione: info.d, canonico, contenuto, jsonld });
  }

  function paginaLabScheda(sezione, id){
    const e = sezione === 'materiali' ? LAB.materiale(DLAB, id)
            : sezione === 'tecnologie' ? LAB.tecnologia(DLAB, id)
            : sezione === 'macchine' ? LAB.modello(DLAB, id)
            : LAB.corso(DLAB, id);
    const canonico = base + '/' + sezione + '/' + id;
    const nome = LAB.lingua(e && e.n, L);
    const meta = sezione === 'materiali' ? LAB.metaMateriale(e, { L, azienda })
      : sezione === 'tecnologie' ? LAB.metaTecnologia(e, { L, azienda })
      : sezione === 'macchine'
        ? { titolo: `${nome} — ${e.inOfficina ? 'demo e assistenza a Palermo' : 'assistenza e riparazione a Palermo'} | ${azienda}`,
            descrizione: LAB.lingua(e.ruolo, L) }
        : { titolo: `${nome} | ${azienda}`, descrizione: LAB.lingua(e.sommario, L) };
    const contenuto = sezione === 'materiali' ? LAB.corpoMateriale(DLAB, e, { L, base, prezzo: P.prezzo })
      : sezione === 'tecnologie' ? LAB.corpoTecnologia(DLAB, e, { L, base, prezzo: P.prezzo })
      : sezione === 'macchine' ? LAB.corpoMacchina(DLAB, e, { L, base })
      : LAB.corpoCorso(DLAB, e, { L, base });
    const schema = sezione === 'materiali' ? LAB.schemaMateriale(DLAB, e, { L, base, azienda, idAzienda: SCH.ID.org })
      : sezione === 'tecnologie' ? LAB.schemaTecnologia(DLAB, e, { L, base, idAzienda: SCH.ID.org })
      : sezione === 'macchine' ? LAB.schemaMacchina(DLAB, e, { L, base, idAzienda: SCH.ID.org })
      : LAB.schemaCorso(DLAB, e, { L, base, azienda, idAzienda: SCH.ID.org });
    const jsonld = SCH.grafo([...entitaBase, ...schema, LAB.briciole(sezione, e, { L, base })]);
    return P.componi(guscio, { pagina: sezione, titolo: meta.titolo, descrizione: meta.descrizione, canonico, contenuto, jsonld });
  }

    const verticali = contenuti.VERTICALI || [];
    const lista = [...P.elenco({ prodotti, verticali }),
    ...CL.pubblicate(DCOLL).filter(c => /^[a-z0-9-]+$/.test(CL.rifDi(c))).map(c => ({ file: 'collezioni/' + CL.rifDi(c) + '/index.html', pagina: 'collezione', rif: c.id })),
    ...LAB.elencoPagine(DLAB).map(v => ({ file: v.file, pagina: 'lab', sezione: v.sezione, id: v.id }))];

  const pagine = {}, problemi = [];
  for(const voce of lista){
    if(voce.file === 'index.html') continue;      /* la home resta il guscio originale */
    const p = (voce.pagina !== 'lab' && voce.id != null) ? prodotti.find(x => x.id === voce.id) : null;
    const html = voce.pagina === 'product' ? paginaProdotto(p)
               : voce.pagina === 'verticale' ? paginaVerticale(VERT.perId(verticali, voce.id))
               : voce.pagina === 'collezione' ? paginaCollezione(CL.trova(voce.rif, DCOLL))
               : voce.pagina === 'lab' ? (voce.id ? paginaLabScheda(voce.sezione, voce.id) : paginaLabSezione(voce.sezione))
               : paginaSito(voce.pagina);
    if(!/<h1>/.test(html)) problemi.push(voce.file + ': manca il titolo principale');
    if(html.includes('<title></title>')) problemi.push(voce.file + ': titolo vuoto');
    pagine[voce.file] = html;
  }
  return { pagine, problemi, prodotti, verticali };
}

/* Cartelle interamente generate: una pagina che qui non viene più prodotta
   (prodotto eliminato o nascosto, materiale tolto) va rimossa. */
export const CARTELLE_GENERATE = ['product/', 'materiali/', 'tecnologie/', 'macchine/', 'academy/', 'demo/', 'business/', 'collezioni/'];
