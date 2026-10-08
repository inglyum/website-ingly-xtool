#!/usr/bin/env node
/* ============ GENERA LE PAGINE STATICHE ============
   Legge data/*.json e index.html, scrive una pagina vera per ogni prodotto e
   per ogni sezione del sito.

   Uso:  node scripts/prerender.mjs            (genera)
         node scripts/prerender.mjs --check    (verifica soltanto, non scrive)

   Le pagine generate sono file normali: GitHub Pages le serve così come sono,
   quindi un crawler che non esegue JavaScript legge testo, prezzi e misure.
   Chi apre il sito con un browser non nota nulla: appena l'applicazione parte,
   il blocco statico viene rimosso e prende il posto il sito di sempre. */
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import * as P from '../assets/js/prerender-engine.js';
import * as SCH from '../assets/js/schema-engine.js';
import * as FAQ from '../assets/js/faq-engine.js';
import * as VERT from '../assets/js/verticali.js';
import * as PR from '../assets/js/prezzi.js';
import * as LAB from '../assets/js/lab.js';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const SOLO_VERIFICA = process.argv.includes('--check');
const leggi = async f => JSON.parse(await readFile(join(ROOT, f), 'utf8'));

const cfg      = await leggi('data/config.json');
const prodotti = await leggi('data/products.json');
const categorie= await leggi('data/categories.json');
const contenuti= await leggi('data/content.json');
const testi    = await leggi('data/texts.json');
const materiali = await leggi('data/materiali.json');
const tecnologie= await leggi('data/tecnologie.json');
const macchine  = await leggi('data/macchine.json');
const corsiJson = await leggi('data/corsi.json');
const guscio   = await readFile(join(ROOT, 'index.html'), 'utf8');

/* La stessa forma che il browser si trova in window.INGLY: lab.js non sa
   se gira in Node o nel browser, e non deve saperlo. */
const DLAB = { MATERIALI: materiali, TECNOLOGIE: tecnologie, MACCHINE: macchine, CORSI: corsiJson, CONFIG: cfg, PRODUCTS: prodotti };

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
  return P.componi(guscio, { titolo, descrizione:desc, canonico, contenuto, jsonld });
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
  const extra = pg === 'shop'
    ? [SCH.paginaCollezione(prodotti.filter(x => !x.hidden), { base, L, titolo: azienda + ' — Catalogo', url: canonico })]
    : [];
  return P.componi(guscio, { titolo, descrizione:desc, canonico, contenuto, jsonld: SCH.grafo([...entitaBase, ...extra]) });
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
  return P.componi(guscio, { titolo, descrizione, canonico, contenuto, jsonld });
}

/* ===== LAB: materiali, tecnologie, macchine =====
   Una scheda materiale è la pagina che intercetta «si può incidere il
   plexiglass» o «quale legno per un'incisione fine»: ricerche che il
   catalogo non può soddisfare, perché non parla quella lingua. */
const TITOLI_LAB = {
  materiali: { t: 'Materiali', d: 'Dieci materiali in lavorazione corrente, ognuno con le sue tecnologie, i suoi spessori e i suoi limiti dichiarati.' },
  tecnologie: { t: 'Tecnologie', d: 'Laser CO₂, fibra, MOPA, stampa UV, DTF e stampa 3D: cosa fa ognuna e quando conviene.' },
  macchine: { t: 'Macchine', d: 'Il parco macchine, cosa si sblocca mettendole insieme, e cosa non lavoriamo.' },
  academy: { t: 'INGLY Academy', d: 'Imparare a usare le macchine da chi ci produce tutti i giorni, in officina a Cesena o collegati.' },
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
  return P.componi(guscio, { titolo, descrizione: info.d, canonico, contenuto, jsonld });
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
      ? { titolo: `${nome} — ${e.inOfficina ? 'in officina, assistenza e demo' : 'assistenza, riparazione e ricambi'} | ${azienda}`,
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
  return P.componi(guscio, { titolo: meta.titolo, descrizione: meta.descrizione, canonico, contenuto, jsonld });
}

const verticali = contenuti.VERTICALI || [];
const lista = [...P.elenco({ prodotti, verticali }),
  ...LAB.elencoPagine(DLAB).map(v => ({ file: v.file, pagina: 'lab', sezione: v.sezione, id: v.id }))];
let scritti = 0, problemi = [];

/* la cartella si rigenera da zero: pagine di prodotti eliminati non devono
   sopravvivere e restare indicizzate */
if(!SOLO_VERIFICA && existsSync(join(ROOT, 'product'))) await rm(join(ROOT, 'product'), { recursive: true, force: true });
/* stesso motivo per i settori: uno spento o rinominato non deve sopravvivere
   sul disco e restare indicizzato */
/* stesso motivo per il Lab: un materiale tolto dai dati non deve lasciare
   la sua pagina sul disco, indicizzata e irraggiungibile dal sito */
if(!SOLO_VERIFICA){
  for(const sez of ['materiali','tecnologie','macchine','academy','demo']){
    const dir = join(ROOT, sez);
    if(existsSync(dir)) await rm(dir, { recursive: true, force: true });
  }
}
if(!SOLO_VERIFICA){
  for(const v of verticali){
    const dir = join(ROOT, 'business', String(v && v.id || ''));
    if(v && v.id && existsSync(dir)) await rm(dir, { recursive: true, force: true });
  }
}

for(const voce of lista){
  if(voce.file === 'index.html') continue;      /* la home resta il guscio originale */
  const p = (voce.pagina !== 'lab' && voce.id != null) ? prodotti.find(x => x.id === voce.id) : null;
  const html = voce.pagina === 'product' ? paginaProdotto(p)
             : voce.pagina === 'verticale' ? paginaVerticale(VERT.perId(verticali, voce.id))
             : voce.pagina === 'lab' ? (voce.id ? paginaLabScheda(voce.sezione, voce.id) : paginaLabSezione(voce.sezione))
             : paginaSito(voce.pagina);

  if(!/<h1>/.test(html)) problemi.push(voce.file + ': manca il titolo principale');
  if(html.includes('<title></title>')) problemi.push(voce.file + ': titolo vuoto');

  if(!SOLO_VERIFICA){
    const dest = join(ROOT, voce.file);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, html, 'utf8');
  }
  scritti++;
}

console.log(`\n  Pagine ${SOLO_VERIFICA ? 'verificate' : 'generate'}: ${scritti}`);
console.log(`  Prodotti: ${prodotti.filter(x => !x.hidden).length} visibili su ${prodotti.length}`);
if(problemi.length){
  console.log('\n  Problemi:');
  problemi.forEach(x => console.log('   ✖ ' + x));
  process.exit(1);
}
console.log('  Nessun problema.\n');
