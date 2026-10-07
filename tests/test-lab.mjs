/* Il grafo MATERIALE → TECNOLOGIA → LAVORAZIONE → PRODOTTI.

   È la parte del sito che non si può controllare guardando una pagina: se un
   materiale dichiara una tecnologia che non esiste più, la scheda promette
   una lavorazione che nessuno può eseguire, e nessuno se ne accorge finché
   non arriva la richiesta. Qui si verifica sui dati veri del repository. */
import * as LAB from '../assets/js/lab.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const leggi = f => JSON.parse(readFileSync(join(ROOT, f), 'utf8'));

let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };

/* ---- dati finti, per le regole ---- */

const F = {
  MATERIALI: { materiali: [
    { id: 'legno', cat: 'Legno', n: { it: 'Legno', en: 'Wood' }, tech: ['co2', 'uv'], macchine: ['p3'],
      lavorazioni: { it: ['Taglio', 'Incisione'], en: ['Cutting'] } },
    { id: 'metallo', cat: 'Metallo', n: { it: 'Metallo' }, tech: ['fiber'], macchine: ['f2'] },
    { id: 'rotto', cat: 'Boh', n: { it: 'Rotto' }, tech: ['inesistente'], macchine: [] },
    { id: 'con spazi', cat: 'X', n: { it: 'Non valido' }, tech: ['co2'] }
  ] },
  TECNOLOGIE: { tecnologie: [
    { id: 'co2', n: { it: 'Laser CO₂' }, materiali: ['legno'], macchine: ['p3'],
      applicazioni: { it: ['Targhe', 'Portamenù'] }, lavorazioni: ['taglio', 'incisione'] },
    { id: 'uv', n: { it: 'Stampa UV' }, materiali: [], macchine: ['uv'], applicazioni: { it: ['Insegne'] } },
    { id: 'fiber', n: { it: 'Fibra' }, materiali: ['metallo'], macchine: ['f2'], applicazioni: { it: ['Targhette'] } },
    { id: 'stampa3d', n: { it: 'Stampa 3D' }, materiali: [], macchine: [], applicazioni: { it: ['Prototipi'] } }
  ] },
  MACCHINE: { macchine: [{ id: 'p3', n: { it: 'xTool P3' } }, { id: 'f2', n: { it: 'xTool F2' } }, { id: 'uv', n: { it: 'O1 UV' } }] },
  PRODUCTS: [
    { id: 1, mat: 'Legno', n: { it: 'Tagliere' } },
    { id: 2, mat: 'Legno', n: { it: 'Portamenù' } },
    { id: 3, mat: 'Legno', n: { it: 'Nascosto' }, hidden: true },
    { id: 4, mat: 'Metallo', n: { it: 'Targhetta' } }
  ]
};

console.log('\n=== LINGUA ===');
check('una coppia it/en torna una stringa', LAB.lingua({ it: 'Legno', en: 'Wood' }, 'en') === 'Wood');
check('una stringa resta una stringa', LAB.lingua('Legno') === 'Legno');
/* mai l'oggetto nudo: finirebbe stampato come [object Object] */
check('senza la lingua chiesta ripiega sull\'italiano', LAB.lingua({ it: 'Legno' }, 'en') === 'Legno');
check('niente non diventa [object Object]', LAB.lingua(null) === '' && LAB.lingua(undefined) === '');
check('una lista localizzata torna un array', LAB.listaLingua({ it: ['a', 'b'] }, 'it').length === 2);
check('una lista già array viene accettata', LAB.listaLingua(['a']).length === 1);

console.log('\n=== QUALI ENTITÀ SONO PUBBLICATE ===');
/* l'id finisce in un indirizzo: con uno spazio o un ../ romperebbe il percorso */
check('un id non valido viene scartato', !LAB.materiali(F).some(m => m.id === 'con spazi'));
check('i materiali validi restano', LAB.materiali(F).length === 3);
check('si trova per id', LAB.materiale(F, 'legno').cat === 'Legno');
check('un id inesistente non restituisce niente', LAB.materiale(F, 'boh') === null);

console.log('\n=== IL GRAFO ===');
check('un materiale elenca le sue tecnologie', LAB.tecnologieDi(F, LAB.materiale(F, 'legno')).length === 2);
/* una tecnologia cancellata non deve far comparire "undefined" nella pagina */
check('una tecnologia inesistente viene ignorata, non stampata',
  LAB.tecnologieDi(F, LAB.materiale(F, 'rotto')).length === 0);
check('un materiale elenca le sue macchine', LAB.macchineDi(F, LAB.materiale(F, 'legno'))[0].id === 'p3');

/* La relazione si dichiara in due file. Leggerne uno solo significa perdere
   metà dei collegamenti ogni volta che se ne aggiorna uno dei due. */
check('i materiali di una tecnologia si leggono nei due versi',
  LAB.materialiDi(F, LAB.tecnologia(F, 'uv')).some(m => m.id === 'legno'),
  'uv non dichiara legno, ma legno dichiara uv');
check('nessun doppione quando entrambi i versi concordano',
  LAB.materialiDi(F, LAB.tecnologia(F, 'co2')).filter(m => m.id === 'legno').length === 1);

console.log('\n=== DAL MATERIALE ALLE CREAZIONI ===');
check('le creazioni di un materiale arrivano dal catalogo unico',
  LAB.prodottiDi(F, LAB.materiale(F, 'legno'), { max: 0 }).length === 2);
check('i prodotti nascosti non compaiono',
  !LAB.prodottiDi(F, LAB.materiale(F, 'legno'), { max: 0 }).some(p => p.hidden));
check('il limite viene rispettato', LAB.prodottiDi(F, LAB.materiale(F, 'legno'), { max: 1 }).length === 1);
check('un materiale senza creazioni non rompe niente',
  LAB.prodottiDi(F, LAB.materiale(F, 'rotto'), { max: 0 }).length === 0);
check('le creazioni di una tecnologia sono l\'unione dei suoi materiali',
  LAB.prodottiDiTecnologia(F, LAB.tecnologia(F, 'co2'), { max: 0 }).length === 2);
check('nessun doppione fra materiali diversi',
  new Set(LAB.prodottiDiTecnologia(F, LAB.tecnologia(F, 'co2'), { max: 0 }).map(p => p.id)).size === 2);

console.log('\n=== INDIRIZZI ===');
check('la scheda materiale sta sotto /materiali',
  LAB.viaMateriale({ id: 'legno' }) === '/materiali/legno');
check('la base di un sito in sottocartella viene rispettata',
  LAB.viaMateriale({ id: 'legno' }, '/Il-sito-AI/') === '/Il-sito-AI/materiali/legno');
check('la scheda tecnologia sta sotto /tecnologie',
  LAB.viaTecnologia({ id: 'co2' }) === '/tecnologie/co2');

console.log('\n=== LA CATENA ===');
const cat = LAB.catena(F, LAB.materiale(F, 'legno'));
check('una riga per ogni tecnologia che lavora il materiale', cat.length === 2);
check('ogni riga porta materiale, tecnologia e lavorazioni',
  cat[0].materiale === 'Legno' && cat[0].tecnologia === 'Laser CO₂' && cat[0].lavorazioni.length === 2);
check('ogni riga porta creazioni vere', cat[0].prodotti.length === 2);

console.log('\n=== RICERCA GUIDATA ===');
/* Il punto della guida: chi arriva non conosce i nomi delle tecnologie.
   Se sceglie un materiale, una tecnologia che non lo lavora è SBAGLIATA,
   non meno rilevante: non deve comparire affatto. */
const sMat = LAB.suggerisci(F, { materiale: 'metallo' });
check('con un materiale escono solo le tecnologie che lo lavorano',
  sMat.length === 1 && sMat[0].tecnologia.id === 'fiber');
check('il suggerimento dice perché', sMat[0].perche.length > 0);
const sEff = LAB.suggerisci(F, { effetto: 'colore' });
check('un effetto filtra le tecnologie', sEff.every(s => ['uv', 'mopa', 'dtf'].includes(s.tecnologia.id)));
const sIncom = LAB.suggerisci(F, { materiale: 'metallo', effetto: 'taglio' });
check('una combinazione impossibile non suggerisce niente', sIncom.length === 0,
  'il metallo qui non si taglia: meglio nessuna risposta di una sbagliata');
const sTesto = LAB.suggerisci(F, { testo: 'voglio un logo a colori sul grembiule' });
check('il testo libero porta a una tecnologia', sTesto.length > 0 && sTesto[0].punti > 0);
check('i risultati sono ordinati per punteggio',
  sTesto.every((s, i) => i === 0 || sTesto[i - 1].punti >= s.punti));
check('senza nessun criterio non si inventa niente', LAB.suggerisci(F, {}).length === 0);

console.log('\n=== INTEGRITÀ (dati finti) ===');
const prob = LAB.problemi(F);
check('un riferimento rotto viene segnalato', prob.some(p => p.includes('inesistente')));

/* ---- i dati veri del repository ---- */

console.log('\n=== INTEGRITÀ (dati veri) ===');
const D = {
  MATERIALI: leggi('data/materiali.json'),
  TECNOLOGIE: leggi('data/tecnologie.json'),
  MACCHINE: leggi('data/macchine.json'),
  PRODUCTS: leggi('data/products.json')
};
const veri = LAB.problemi(D).filter(p => !p.startsWith('avviso'));
check('nessun riferimento rotto fra materiali, tecnologie e macchine',
  veri.length === 0, veri.join(' · '));

check('ogni materiale è collegato ad almeno una tecnologia',
  LAB.materiali(D).every(m => LAB.tecnologieDi(D, m).length > 0));
check('ogni tecnologia è collegata ad almeno un materiale',
  LAB.tecnologie(D).every(t => LAB.materialiDi(D, t).length > 0),
  LAB.tecnologie(D).filter(t => !LAB.materialiDi(D, t).length).map(t => t.id).join(','));

/* Una scheda materiale senza creazioni è una pagina che non porta da nessuna
   parte. Non tutte devono averne — un materiale può essere nuovo — ma la
   maggior parte sì, altrimenti il Lab è un glossario, non un ingresso. */
const conProdotti = LAB.materiali(D).filter(m => LAB.prodottiDi(D, m, { max: 0 }).length > 0);
check('la maggior parte dei materiali porta a creazioni reali',
  conProdotti.length >= Math.ceil(LAB.materiali(D).length / 2),
  `${conProdotti.length} su ${LAB.materiali(D).length}`);

/* Il filo fra il Lab e il catalogo è materiale.cat ↔ prodotto.mat. Se
   qualcuno rinomina un materiale senza toccare i prodotti, le schede si
   svuotano in silenzio: nessun errore, solo pagine vuote. */
const matProdotti = new Set((D.PRODUCTS || []).filter(p => !p.hidden).map(p => p.mat));
const scoperti = [...matProdotti].filter(c => !LAB.materiali(D).some(m => m.cat === c));
check('ogni materiale usato dalle creazioni ha la sua scheda',
  scoperti.length === 0, scoperti.join(', '));

check('ogni materiale dichiara i campi che la pagina mostra',
  LAB.materiali(D).every(m => m.sommario && m.descrizione && m.usi && m.faq && m.faq.length));
check('ogni tecnologia dichiara i campi che la pagina mostra',
  LAB.tecnologie(D).every(t => t.sommario && t.descrizione && t.processo && t.processo.length && t.faq));

console.log(`\n=========== LAB: ${pass} passati, ${fail} falliti ===========\n`);
process.exit(fail ? 1 : 0);
