/* I file digitali, e la promessa che la pagina può permettersi di fare.

   Il rischio che questi controlli coprono non è grafico. Un file digitale
   si vende su tre promesse — cosa c'è dentro, su che macchina funziona,
   cosa puoi farne — e prima la pagina le faceva tutte e tre senza avere i
   dati per nessuna: scriveva «Download istantaneo, licenza commerciale
   inclusa» mentre il download non esisteva e il testo della licenza non
   stava da nessuna parte. Il cliente lo scopre dopo aver pagato, e allora
   non è più un problema di copy.

   Perciò due condizioni qui dentro sono tecniche e non estetiche:
   un bundle non compare se non è pubblicato, e non mostra «Aggiungi» se
   non dichiara come arriva al cliente. */
import * as DG from '../assets/js/digitale.js';
import { readFileSync } from 'fs';

let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };

const FILE = JSON.parse(readFileSync('data/digitale.json', 'utf8'));
const MAC = JSON.parse(readFileSync('data/macchine.json', 'utf8'));
const D = { DIGITALE: FILE, MACCHINE: MAC };

console.log('\n=== IL FILE ===');
check('il file è attivo', DG.attiva(D) === true);
check('ci sono dei bundle', DG.tutti(D).length > 0, String(DG.tutti(D).length));
check('ogni bundle ha un id', DG.tutti(D).every(b => b.id != null));
check('nessun id ripetuto', new Set(DG.tutti(D).map(b => String(b.id))).size === DG.tutti(D).length);
check('ogni bundle ha un nome italiano', DG.tutti(D).every(b => DG.lingua(b.n, 'it')));
check('ogni bundle dichiara almeno un formato', DG.tutti(D).every(b => (b.f || []).length));
check('ogni bundle ha uno stato noto', DG.tutti(D).every(b => ['bozza', 'pubblicato'].includes(b.stato)));
check('ci sono delle categorie', DG.categorie(D).length > 0);
check('ci sono delle licenze', DG.licenze(D).length > 0);
check('ci sono dei software', DG.programmi(D).length > 0);
check('ci sono delle domande', DG.faq(D).length > 0, String(DG.faq(D).length));

console.log('\n=== UN BUNDLE IN BOZZA NON ESCE ===');
/* la valvola che permette a un bundle incompleto di stare nei dati senza
   finire sul sito */
const bozze = DG.tutti(D).filter(b => b.stato !== 'pubblicato');
check('le bozze non sono fra i pubblicati',
  bozze.every(b => !DG.bundle(D).some(x => x.id === b.id)));
check('ma si trovano comunque per id', bozze.every(b => DG.trova(D, b.id) !== null));
/* il carrello cerca per id numerico o stringa: deve trovarle in entrambi i modi */
check('si trovano anche con l\'id come stringa',
  bozze.every(b => DG.trova(D, String(b.id)) !== null));
check('un id che non esiste non esplode', DG.trova(D, 99999) === null);
check('nessun id non esplode', DG.trova(D, null) === null && DG.trova(D, '') === null);
check('nessun dato non esplode', DG.tutti({}).length === 0 && DG.bundle({}).length === 0);

console.log('\n=== NESSUN BOTTONE SENZA UNA CONSEGNA ===');
const senza = { consegna: { modo: 'nessuna', url: '' } };
check('consegna «nessuna» → non acquistabile', DG.acquistabile(senza) === false);
check('e dice perché', DG.consegna(senza).motivo === 'consegna-non-dichiarata');
/* «link» senza indirizzo è la stessa promessa vuota scritta in un campo
   diverso: non deve passare */
const linkVuoto = { consegna: { modo: 'link', url: '' } };
check('consegna «link» senza indirizzo → non acquistabile', DG.acquistabile(linkVuoto) === false);
check('e dice che manca il link', DG.consegna(linkVuoto).motivo === 'link-mancante');
const linkStorto = { consegna: { modo: 'link', url: 'files.inglydesign.it/x.zip' } };
check('un indirizzo senza protocollo viene rifiutato', DG.acquistabile(linkStorto) === false);
const linkOk = { consegna: { modo: 'link', url: 'https://files.inglydesign.it/x.zip' } };
check('consegna «link» con indirizzo valido → acquistabile', DG.acquistabile(linkOk) === true);
check('e porta l\'indirizzo con sé', DG.consegna(linkOk).url === 'https://files.inglydesign.it/x.zip');
check('consegna «email» → acquistabile', DG.acquistabile({ consegna: { modo: 'email' } }) === true);
check('«email» non si inventa un indirizzo', DG.consegna({ consegna: { modo: 'email' } }).url === '');
/* un modo scritto a mano e sbagliato non deve diventare un bottone */
check('un modo di consegna sconosciuto non vende',
  DG.acquistabile({ consegna: { modo: 'piccione' } }) === false);
check('nessuna consegna dichiarata non vende', DG.acquistabile({}) === false);
check('un bundle nullo non esplode', DG.acquistabile(null) === false);
check('fra i pubblicati, in vendita ci sono solo i consegnabili',
  DG.invendita(D).every(DG.acquistabile));
check('un pubblicato non consegnabile NON è in vendita',
  DG.invendita(D).length === DG.bundle(D).filter(DG.acquistabile).length);

console.log('\n=== COMPATIBILITÀ: MACCHINE E SOFTWARE VERI ===');
/* un id di macchina rimasto nei dati dopo che il modello è uscito di
   catalogo diventerebbe una riga vuota sulla scheda */
const finto = { compatibilita: { macchine: ['p3', 'macchina-che-non-esiste'], software: ['xcs', 'photoshop'] } };
check('solo le macchine che esistono in catalogo', DG.macchineDi(D, finto).length === 1);
check('ed è quella giusta', DG.macchineDi(D, finto)[0].id === 'p3');
check('solo i software definiti nel file', DG.programmiDi(D, finto).length === 1);
check('nessuna compatibilità non esplode', DG.macchineDi(D, {}).length === 0 && DG.programmiDi(D, {}).length === 0);
/* il caso onesto più frequente: il file si apre, i parametri no */
const cop = DG.formatiCoperti(D, { f: ['SVG', 'LBRN'], compatibilita: { software: ['xcs'] } });
check('dice quali formati il software apre davvero', cop.coperti.join() === 'SVG');
check('e quali no', cop.scoperti.join() === 'LBRN');
check('i formati si confrontano senza badare alle maiuscole',
  DG.formatiCoperti(D, { f: ['svg'], compatibilita: { software: ['xcs'] } }).coperti.join() === 'SVG');
check('ogni macchina dichiarata nel file esiste in catalogo',
  DG.tutti(D).every(b => DG.macchineDi(D, b).length === ((b.compatibilita || {}).macchine || []).length));
check('ogni software dichiarato nel file esiste',
  DG.tutti(D).every(b => DG.programmiDi(D, b).length === ((b.compatibilita || {}).software || []).length));

console.log('\n=== LE LICENZE DICONO COSA PUOI E COSA NON PUOI ===');
/* la licenza è il motivo per cui si compra un file invece di disegnarlo:
   «Licenza commerciale inclusa» come etichetta non è una licenza */
DG.licenze(D).forEach(l => {
  check(`«${l.id}» ha un nome nelle due lingue`, !!(l.n && l.n.it && l.n.en));
  check(`«${l.id}» dice in una riga cosa concede`, !!DG.lingua(l.s, 'it'));
  check(`«${l.id}» elenca cosa puoi fare`, DG.listaLingua(l.puoi, 'it').length > 0);
  check(`«${l.id}» elenca cosa NON puoi fare`, DG.listaLingua(l.nonPuoi, 'it').length > 0);
  check(`«${l.id}» è tradotta`, DG.listaLingua(l.puoi, 'en').length > 0);
});
/* le due licenze devono differire sulla domanda che conta: posso vendere? */
const pers = DG.licenza(D, 'personale'), comm = DG.licenza(D, 'commerciale');
check('esiste una licenza per uso personale', !!pers);
check('esiste una licenza commerciale', !!comm);
check('la personale vieta di vendere i pezzi',
  DG.listaLingua(pers.nonPuoi, 'it').some(x => /vender/i.test(x)));
check('la commerciale permette di vendere i pezzi',
  DG.listaLingua(comm.puoi, 'it').some(x => /vender/i.test(x)));
check('ma nessuna delle due permette di rivendere il file',
  DG.listaLingua(comm.nonPuoi, 'it').some(x => /rivender|ridistribu/i.test(x)));
check('ogni bundle punta a una licenza che esiste',
  DG.tutti(D).every(b => !b.licenza || DG.licenza(D, b.licenza) !== null));
check('una licenza inesistente non esplode', DG.licenza(D, 'inventata') === null);

console.log('\n=== I FILTRI ===');
const prova = {
  DIGITALE: {
    attiva: true,
    categorie: [{ id: 'casa', n: { it: 'Casa' } }, { id: 'eventi', n: { it: 'Eventi' } }],
    licenze: [{ id: 'commerciale', n: { it: 'C' } }, { id: 'personale', n: { it: 'P' } }],
    software: [{ id: 'xcs', n: 'XCS', formati: ['SVG'] }, { id: 'lightburn', n: 'LB', formati: ['SVG', 'LBRN'] }],
    bundle: [
      { id: 1, n: { it: 'A' }, cat: 'casa', f: ['SVG'], price: 10, licenza: 'commerciale', stato: 'pubblicato', consegna: { modo: 'email' }, compatibilita: { macchine: ['p3'], software: ['xcs'] }, inEvidenza: true, aggiornatoIl: '2026-01-01' },
      { id: 2, n: { it: 'B' }, cat: 'eventi', f: ['DXF'], price: 30, licenza: 'personale', stato: 'pubblicato', consegna: { modo: 'email' }, compatibilita: { macchine: [], software: ['lightburn'] }, aggiornatoIl: '2026-06-01' },
      { id: 3, n: { it: 'C' }, cat: 'casa', f: ['SVG', 'DXF'], price: null, stato: 'pubblicato', consegna: { modo: 'nessuna' }, compatibilita: {}, aggiornatoIl: '2026-03-01' },
      { id: 4, n: { it: 'D' }, cat: 'casa', f: ['SVG'], price: 5, stato: 'bozza', consegna: { modo: 'email' }, compatibilita: {} },
    ],
  },
  MACCHINE: MAC,
};
check('senza filtri escono i pubblicati, non le bozze', DG.filtra(prova, {}).length === 3);
check('filtro per categoria', DG.filtra(prova, { cat: 'casa' }).map(b => b.id).join() === '1,3');
check('filtro per formato', DG.filtra(prova, { formato: 'DXF' }).map(b => b.id).sort().join() === '2,3');
check('il formato si filtra senza badare alle maiuscole', DG.filtra(prova, { formato: 'dxf' }).length === 2);
check('filtro per macchina', DG.filtra(prova, { macchina: 'p3' }).map(b => b.id).join() === '1');
check('filtro per software', DG.filtra(prova, { software: 'lightburn' }).map(b => b.id).join() === '2');
check('filtro per licenza', DG.filtra(prova, { licenza: 'personale' }).map(b => b.id).join() === '2');
check('filtro «solo acquistabili» esclude chi non ha consegna',
  DG.filtra(prova, { soloAcquistabili: true }).map(b => b.id).sort().join() === '1,2');
check('due filtri si sommano', DG.filtra(prova, { cat: 'casa', formato: 'SVG' }).map(b => b.id).sort().join() === '1,3');
check('un filtro senza risultati dà una lista vuota', DG.filtra(prova, { cat: 'eventi', macchina: 'p3' }).length === 0);
check('ricerca per testo nel nome', DG.filtra(prova, { testo: 'b' }).map(b => b.id).join() === '2');
check('ricerca per formato scritto nella casella', DG.filtra(prova, { testo: 'dxf' }).length === 2);
check('una ricerca di soli spazi non filtra niente', DG.filtra(prova, { testo: '   ' }).length === 3);

console.log('\n=== IL PREZZO MANCANTE NON È ZERO ===');
/* `Number(null)` fa zero e un bundle senza prezzo finirebbe fra i più
   economici: lo stesso errore che le collezioni avevano, e che qui si
   verifica invece di sperare */
check('prezzo massimo non pesca chi non ha prezzo',
  DG.filtra(prova, { prezzoMax: 20 }).map(b => b.id).join() === '1');
const su = DG.filtra(prova, { ordine: 'prezzo-su' }).map(b => b.id);
check('in ordine di prezzo crescente, chi non ha prezzo sta in fondo', su.join() === '1,2,3', su.join());
const giu = DG.filtra(prova, { ordine: 'prezzo-giu' }).map(b => b.id);
check('e anche in ordine decrescente sta in fondo', giu.join() === '2,1,3', giu.join());
check('ordine per novità', DG.filtra(prova, { ordine: 'novita' }).map(b => b.id).join() === '2,3,1');
check('l\'ordine consigliato mette per primo chi è in evidenza',
  DG.filtra(prova, { ordine: 'consigliato' })[0].id === 1);
check('un prezzoMax non numerico non filtra niente', DG.filtra(prova, { prezzoMax: 'tanto' }).length === 3);
check('prezzoMax vuoto non filtra niente', DG.filtra(prova, { prezzoMax: '' }).length === 3);
check('in evidenza', DG.inEvidenza(prova).map(b => b.id).join() === '1');

console.log('\n=== I CONTEGGI ===');
const c = DG.conteggi(prova);
check('totali', c.totali === 4);
check('pubblicati', c.pubblicati === 3);
check('acquistabili', c.acquistabili === 2);
check('bozze', c.bozze === 1);
/* a pari frequenza l'ordine è alfabetico, così l'elenco dei filtri non
   cambia posto da un caricamento all'altro */
check('i formati sono contati sul catalogo pubblicato',
  DG.formati(prova).map(x => x.id + ':' + x.n).join() === 'DXF:2,SVG:2', DG.formati(prova).map(x => x.id).join());
check('e le bozze non entrano nel conteggio', DG.formati(prova).every(x => x.n === 2));
check('i conteggi su dati vuoti non esplodono', DG.conteggi({}).totali === 0);

console.log('\n=== GLI INDIRIZZI ===');
check('la pagina sta sotto /digital', DG.via('') === '/digital');
check('e rispetta la sottocartella', DG.via('/website-ingly-xtool') === '/website-ingly-xtool/digital');
check('una barra finale non si raddoppia', DG.via('/base/') === '/base/digital');
check('la scheda di un bundle', DG.viaBundle({ id: 101 }, '/base') === '/base/digital/101');
check('un bundle senza id non produce un indirizzo rotto', DG.viaBundle(null, '/base') === '/base/digital/');

console.log('\n=== SEO ===');
/* nel markup finisce solo ciò che si può comprare: dichiarare «InStock»
   per un file che non sai consegnare è una cosa che Google legge e il
   cliente scopre */
const sch = DG.schema(prova, { base: 'https://x.it', L: 'it' });
check('lo schema esiste quando c\'è qualcosa in vendita', !!sch);
check('è un ItemList', sch['@type'] === 'ItemList');
check('conta solo i bundle in vendita', sch.numberOfItems === 2);
check('nessuna bozza nel markup', !JSON.stringify(sch).includes('"D"'));
check('nessun non-consegnabile nel markup', !JSON.stringify(sch).includes('"C"'));
check('ogni voce porta il prezzo', sch.itemListElement.every(x => x.item.offers.price > 0));
check('in euro', sch.itemListElement.every(x => x.item.offers.priceCurrency === 'EUR'));
check('gli indirizzi sono assoluti', sch.itemListElement.every(x => x.item.url.startsWith('https://x.it/')));
check('senza niente in vendita non si inventa uno schema', DG.schema(D, { base: 'https://x.it' }) === null);
check('schema su dati vuoti non esplode', DG.schema({}, {}) === null);

console.log('\n=== DIAGNOSTICA ===');
const pr = DG.problemi(prova);
check('un pubblicato senza consegna è un errore grave',
  pr.gravi.some(x => /#3.*non consegnabile/.test(x)), pr.gravi.join(' | '));
check('un pubblicato senza prezzo è un errore grave', pr.gravi.some(x => /#3.*senza prezzo/.test(x)));
check('un pubblicato che non dice cosa contiene è un errore grave',
  pr.gravi.some(x => /#3.*cosa c/.test(x)));
check('una bozza incompleta NON è un errore grave', !pr.gravi.some(x => /#4/.test(x)));
const rotto = DG.problemi({ DIGITALE: { bundle: [
  { id: 7, n: { it: 'X' }, cat: 'inventata', licenza: 'inventata', f: [], stato: 'bozza', compatibilita: { software: ['inventato'], macchine: ['inventata'] } },
  { id: 7, n: { it: 'Y' }, f: ['SVG'], stato: 'bozza' },
] }, MACCHINE: MAC });
check('un id duplicato è grave', rotto.gravi.some(x => /id ripetuto/.test(x)));
check('una categoria inesistente è grave', rotto.gravi.some(x => /categoria/.test(x)));
check('una licenza inesistente è grave', rotto.gravi.some(x => /licenza/.test(x)));
check('nessun formato è grave', rotto.gravi.some(x => /formato/.test(x)));
check('un software inesistente è grave', rotto.gravi.some(x => /software/.test(x)));
check('una macchina fuori catalogo è grave', rotto.gravi.some(x => /non è in catalogo/.test(x)));
check('senza niente di grave, ok è vero', DG.problemi({ DIGITALE: { bundle: [] } }).ok === true);
check('gli avvisi non bloccano', DG.problemi(prova).avvisi.length > 0);
check('diagnostica su dati vuoti non esplode', DG.problemi({}).ok === true);
/* il file vero deve essere pulito: nessun errore grave nel repository */
const vero = DG.problemi(D);
check('data/digitale.json non ha errori gravi', vero.ok, vero.gravi.join(' | '));

console.log('\n=== IL CATALOGO NON PROMETTE CIÒ CHE NON HA ===');
/* questi sei bundle hanno nome, formati e prezzo e nient'altro: finché
   nessuno sa cosa c'è dentro restano in bozza, perché l'alternativa è
   inventare un elenco di file che non corrisponde all'archivio */
check('nessun bundle è pubblicato senza sapere cosa contiene',
  DG.bundle(D).every(b => (b.contenuto || []).length));
check('i bundle incompleti dicono cosa manca',
  DG.tutti(D).filter(b => !(b.contenuto || []).length).every(b => (b._daCompletare || []).length));
check('nessun bundle dichiara una consegna che non ha',
  DG.tutti(D).every(b => DG.consegna(b).modo === 'nessuna' || DG.acquistabile(b)));

console.log('\n=== LA PAGINA USA IL MOTORE, NON UNA SECONDA LISTA ===');
const ui = readFileSync('assets/js/digitale-ui.js', 'utf8');
check('la pagina importa il motore', /from '\.\/digitale\.js'/.test(ui));
check('la tessera mostra il bottone solo se consegnabile', /c\.acquistabile/.test(ui));
check('e altrimenti scrive «in preparazione»', /In preparazione/.test(ui));
check('mostra le macchine di prova', /macchineDi/.test(ui));
check('e dice quando non ci sono', /dig-manca/.test(ui));
check('mostra i software', /programmiDi/.test(ui));
check('la licenza è raggiungibile dalla tessera', /dig-lic/.test(ui));
check('e scritta per esteso sulla pagina', /renderLicenze/.test(ui));
check('il catalogo vuoto porta a una pagina utile, non vuota', /dig-vuoto/.test(ui));
check('aggiungere ricontrolla la consegna', /DG\.acquistabile\(b\)/.test(ui));
check('tutto ciò che viene dai dati passa da esc()', /const esc =/.test(ui));
/* REGOLA 12: una sezione .reveal mai raggiunta da observeAll() resta
   invisibile per sempre. Licenze e domande nascono dopo la griglia, quindi
   il giro va fatto a pagina completa. Oggi ci pensa anche renderAll(), ma
   chi chiamasse solo renderTutto() non avrebbe quella rete. */
check('le sezioni nate dopo la griglia vengono comunque rivelate',
  /renderFaq\(L\);\s*(\/\*[\s\S]*?\*\/\s*)?observeAll\(\);/.test(ui));

const prod = readFileSync('assets/js/products.js', 'utf8');
check('anche il carrello rifiuta un bundle non consegnabile',
  /consegna non dichiarata, non aggiunto/.test(prod));
check('il ramo stripeLinks morto è stato rimosso', !/CONFIG\.stripeLinks\|\|/.test(prod));
check('renderDigital non disegna più due pagine diverse', !/export function renderDigital/.test(prod));

console.log('\n=== UNA CASA SOLA ===');
/* due liste da tenere allineate a mano divergono: e' solo questione di
   quando */
const cont = JSON.parse(readFileSync('data/content.json', 'utf8'));
check('content.json non contiene più DIG', cont.DIG === undefined);
check('e dice dove sono andati', /digitale\.json/.test(String(cont._DIG || '')));
const dl = readFileSync('assets/js/data-loader.js', 'utf8');
check('il sito carica digitale.json', /'digitale'/.test(dl));
check('DIG è ricavato da digitale.json', /e\.DIG=e\.DIGITALE\.bundle/.test(dl));
const bld = readFileSync('scripts/build.mjs', 'utf8');
check('la riserva legacy porta DIGITALE', /DIGITALE:\$\{JSON\.stringify\(DIGITALE\)\}/.test(bld));
check('e ne ricava DIG nello stesso modo', /DIG=Array\.isArray\(DIGITALE\.bundle\)/.test(bld));
const adm = readFileSync('admin.html', 'utf8');
check('l\'Admin carica e pubblica digitale.json', /digitale:'DIGI'/.test(adm));
check('l\'editor dell\'Admin lavora su quel file', /function digList\(\)/.test(adm));
check('l\'Admin non rimette DIG in content.json',
  !/'MAT_ART','MATN','DIG'/.test(adm));
check('e blocca la pubblicazione se DIG ricompare',
  /content\.json contiene ancora DIG/.test(adm));
check('l\'Admin blocca un pubblicato senza consegna',
  /pubblicato ma non dice come arriva al cliente/.test(adm));
check('l\'Admin fa scegliere il modo di consegna', /ed_cons/.test(adm));
check('e avvisa prima di pubblicare, non dopo', /function edAvvisi/.test(adm));
const val = readFileSync('scripts/validate-data.mjs', 'utf8');
check('la CI controlla i file digitali', /pubblicato ma senza consegna dichiarata/.test(val));
check('e che DIG non sia tornato in content.json', /contiene ancora DIG/.test(val));

console.log('\n=== LA PROMESSA NEL TITOLO ===');
const txt = JSON.parse(readFileSync('data/texts.json', 'utf8'));
/* «Download istantaneo» era scritto sotto il titolo mentre il carrello
   finiva su WhatsApp: la frase e' stata togliata, non riscritta meglio */
check('il sommario non promette più un download istantaneo',
  !/[Dd]ownload istantaneo/.test(txt.it.digSub) && !/[Ii]nstant download/.test(txt.en.digSub));
check('né una licenza inclusa come slogan',
  !/licenza commerciale inclusa/i.test(txt.it.digSub));
const idx = readFileSync('index.html', 'utf8');
check('il riquadro «Bundle −30%» è stato rimosso', !/digCta/.test(idx));
check('le sue chiavi sono uscite anche dalle traduzioni',
  txt.it.digCta === undefined && txt.en.digCtaBtn === undefined);
check('la pagina ha il posto per i filtri', /id="digFiltri"/.test(idx));
check('per le licenze', /id="digLicenze"/.test(idx));
check('per le domande', /id="digFaq"/.test(idx));
check('la riga sulla consegna parte nascosta', /id="digConsegna" hidden/.test(idx));

console.log(`\n=========== DIGITALE: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
