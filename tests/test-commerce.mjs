/* Il modello unico del commercio.

   Due cose qui valgono più delle altre e hanno il doppio dei controlli:

   1. I 97 prodotti già pubblicati devono continuare a comportarsi
      esattamente come prima. Il tipo si deduce, non si pretende.
   2. Un carrello salvato nella forma vecchia deve tornare su intero.
      Perdere un carrello è perdere un ordine, e l'utente non ha modo di
      accorgersi che c'era qualcosa. */
import * as C from '../assets/js/commerce.js';
import { readFileSync } from 'fs';

let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };

const PROD = { id: 1, n: { it: 'Targa', en: 'Sign' }, price: 10, icon: '🪵', sku: 'ING-001', mat: 'Legno' };
const DIGI = { id: 101, n: { it: 'Bundle SVG', en: 'SVG bundle' }, f: ['SVG', 'PDF'], price: 19, icon: '🏠' };
const D = { P: [PROD], DIG: [DIGI] };

console.log('\n=== IL TIPO SI DEDUCE, I DATI VECCHI NON SI TOCCANO ===');
check('un record senza tipo è un oggetto fisico', C.tipo(PROD) === 'physical');
check('nessun argomento non esplode', C.tipo() === 'physical');
check('un record vuoto è fisico', C.tipo({}) === 'physical');
check('un tipo dichiarato vale', C.tipo({ tipo: 'course' }) === 'course');
check('vale anche scritto in maiuscolo', C.tipo({ tipo: 'DIGITAL' }) === 'digital');
check('un tipo inventato ricade su fisico', C.tipo({ tipo: 'abbonamento' }) === 'physical');
check('i formati tradiscono un file', C.tipo(DIGI) === 'digital');
check('le varianti tradiscono un materiale', C.tipo({ varianti: [] }) === 'material');
check('il blocco vendita tradisce un materiale', C.tipo({ vendita: {} }) === 'material');
check('durata e programma tradiscono un corso', C.tipo({ durata: '4h', programma: [] }) === 'course');
check('il flag creator rende su misura', C.tipo({ creator: true }) === 'custom');
check('normalizza non perde i campi', C.normalizza(PROD).sku === 'ING-001');
check('normalizza aggiunge il tipo', C.normalizza(PROD).tipo === 'physical');
check('normalizza è idempotente', C.normalizza(C.normalizza({ tipo: 'course' })).tipo === 'course');
check('normalizzaTutti su non-array non esplode', C.normalizzaTutti(null).length === 0);
check('i cinque tipi sono cinque', C.TIPI.length === 5);

console.log('\n=== LA RIGA CANONICA ===');
const r1 = C.daProdotto(PROD, { q: 2, mat: 'Legno', txt: 'Mario' });
check('il nome resta localizzabile', C.nomeIn(r1.nome, 'en') === 'Sign');
check('nomeIn accetta anche una stringa', C.nomeIn('Plexiglass') === 'Plexiglass');
check('nomeIn su nulla dà vuoto', C.nomeIn(null) === '');
check('nomeIn ripiega sull\'italiano', C.nomeIn({ it: 'Targa' }, 'en') === 'Targa');
check('il prezzo unitario viene dal prodotto', r1.unitario === 10);
check('la quantità è quella chiesta', r1.q === 2);
check('la meta racconta la configurazione', /Legno/.test(r1.meta) && /Mario/.test(r1.meta));
check('lo sku viaggia con la riga', r1.sku === 'ING-001');
check('un prodotto si può sommare', r1.qFissa === false);
check('un prezzo passato a mano vince', C.daProdotto(PROD, { unitario: 12.5 }).unitario === 12.5);
check('quantità zero diventa uno', C.daProdotto(PROD, { q: 0 }).q === 1);
check('quantità negativa diventa uno', C.daProdotto(PROD, { q: -3 }).q === 1);
check('quantità con la virgola si arrotonda', C.daProdotto(PROD, { q: 2.4 }).q === 2);
check('un prezzo illeggibile diventa zero, non NaN', C.riga({ unitario: 'tanto' }).unitario === 0);
check('un tipo inventato nella riga ricade su fisico', C.riga({ tipo: 'x' }).tipo === 'physical');
check('senza icona ne mette una', C.riga({}).icon === '▪');

const rd = C.daDigitale(DIGI);
check('il file dichiara i formati nella meta', rd.meta === 'SVG · PDF');
check('un file non si compra in due copie', rd.qFissa === true);
check('il file costa quel che dice il catalogo', rd.unitario === 19);

const rl = C.daLab({ tipo: 'materiale', rif: 'mat:plexi-3', nome: 'Plexiglass 3 mm', meta: '300×200', prezzo: 8 });
check('una variante di materiale è material', rl.tipo === 'material');
check('un corso del Lab è course', C.daLab({ tipo: 'corso', nome: 'Laser base' }).tipo === 'course');
check('la riga del Lab tiene il suo rif', rl.rif === 'mat:plexi-3');
check('senza rif se ne costruisce uno stabile', C.daLab({ tipo: 'corso', nome: 'Laser base' }).rif === 'course:Laser base');

console.log('\n=== DUE CONFIGURAZIONI DIVERSE SONO DUE RIGHE ===');
const a = C.daProdotto(PROD, { q: 1, mat: 'Legno', txt: 'Anna' });
const b = C.daProdotto(PROD, { q: 1, mat: 'Legno', txt: 'Luca' });
check('lo stesso prodotto con incisioni diverse ha rif diversi', a.rif !== b.rif);
check('la stessa configurazione ha lo stesso rif', a.rif === C.daProdotto(PROD, { q: 5, mat: 'Legno', txt: 'Anna' }).rif);
/* se la firma dimenticasse la conf, due pezzi su misura diversi si sommerebbero */
check('due configurazioni custom diverse non collidono',
  C.daProdotto(PROD, { conf: { colore: 'rosso' } }).rif !== C.daProdotto(PROD, { conf: { colore: 'blu' } }).rif);
check('la firma non dipende dall\'ordine delle chiavi',
  C.daProdotto(PROD, { conf: { a: 1, b: 2 } }).rif === C.daProdotto(PROD, { conf: { b: 2, a: 1 } }).rif);

let cart = C.aggiungi([], a);
cart = C.aggiungi(cart, C.daProdotto(PROD, { q: 2, mat: 'Legno', txt: 'Anna' }));
check('la stessa configurazione si somma', cart.length === 1 && cart[0].q === 3);
cart = C.aggiungi(cart, b);
check('una configurazione diversa è una riga in più', cart.length === 2);
cart = C.aggiungi(cart, rd);
cart = C.aggiungi(cart, C.daDigitale(DIGI));
check('un file aggiunto due volte resta a uno', cart.filter(r => r.tipo === 'digital')[0].q === 1);
check('aggiungi non muta il carrello passato', C.aggiungi([a], b).length === 2 && [a].length === 1);
check('aggiungere nulla non rompe il carrello', C.aggiungi(cart, null).length === cart.length);

console.log('\n=== UN CARRELLO SALVATO TORNA SU, ANCHE SE VECCHIO ===');
const VECCHIO = JSON.stringify([
  { id: 1, q: 2, mat: 'Legno', txt: 'Anna', u: 10 },
  { dig: 101, q: 1, u: 19 },
  { lab: { tipo: 'materiale', rif: 'mat:plexi-3', nome: 'Plexiglass 3 mm', meta: '300×200' }, q: 4, u: 8 },
]);
const riletto = C.deserializza(VECCHIO, D);
check('le tre forme vecchie tornano tutte e tre', riletto.length === 3);
check('il prodotto vecchio ritrova il nome', C.nomeIn(riletto[0].nome) === 'Targa');
check('il file vecchio ritrova i formati', riletto[1].meta === 'SVG · PDF');
check('la riga Lab vecchia tiene la quantità', riletto[2].q === 4 && riletto[2].unitario === 8);
check('ogni riga riletta ha un tipo dei cinque', riletto.every(r => C.TIPI.includes(r.tipo)));

const nuovo = C.serializza(riletto);
check('il salvataggio dichiara il tipo', nuovo.every(r => C.TIPI.includes(r.t)));
const giro = C.deserializza(JSON.stringify(nuovo), D);
check('andata e ritorno non perde righe', giro.length === 3);
check('andata e ritorno non perde quantità', giro[2].q === 4);
check('andata e ritorno non perde i rif', giro.map(r => r.rif).join() === riletto.map(r => r.rif).join());

console.log('\n=== QUEL CHE NON SI PUÒ RICOSTRUIRE NON SI FINGE ===');
check('un prodotto ritirato non torna nel carrello',
  C.deserializza(JSON.stringify([{ id: 999, q: 1, u: 5 }]), D).length === 0);
check('un file ritirato non torna nel carrello',
  C.deserializza(JSON.stringify([{ dig: 999, q: 1, u: 5 }]), D).length === 0);
check('una riga senza nome non si disegna, quindi non entra',
  C.deserializza(JSON.stringify([{ t: 'material', rif: 'x', q: 1, u: 3 }]), D).length === 0);
/* Il prezzo salvato NON si sostituisce con quello di catalogo: su un
   prodotto con le taglie, `u` è il prezzo base per il moltiplicatore della
   taglia scelta, e riportarlo al prezzo base farebbe pagare una A0 come una
   A4. Il prezzo di catalogo torna solo quando non ce n'è uno salvato. */
check('il prezzo configurato sopravvive al salvataggio',
  C.deserializza(JSON.stringify([{ id: 1, q: 1, u: 14 }]), D)[0].unitario === 14);
check('senza prezzo salvato vale quello di catalogo',
  C.deserializza(JSON.stringify([{ id: 1, q: 1 }]), D)[0].unitario === 10);
check('localStorage corrotto dà un carrello vuoto, non un errore', C.deserializza('{non json', D).length === 0);
check('un oggetto al posto di un elenco dà vuoto', C.deserializza('{"a":1}', D).length === 0);
check('null dà vuoto', C.deserializza(null, D).length === 0);
check('voci nulle nell\'elenco vengono saltate', C.deserializza(JSON.stringify([null, { dig: 101, q: 1 }]), D).length === 1);
check('senza dati di catalogo non esplode', C.deserializza(VECCHIO).length === 1);

console.log('\n=== I TOTALI SI CALCOLANO IN UN POSTO SOLO ===');
const T1 = C.totali(riletto);
check('i pezzi si contano su tutte le righe', T1.pezzi === 7);
check('il subtotale somma le tre righe', T1.subtotale === 10 * 2 + 19 + 8 * 4);
check('le righe sono tre', T1.righe === 3);
check('sotto soglia la spedizione non è gratis', C.totali([C.riga({ unitario: 10, q: 1 })]).spedizioneGratis === false);
check('esattamente a soglia la spedizione è gratis', C.totali([C.riga({ unitario: 79, q: 1 })]).spedizioneGratis === true);
check('71 euro non bastano per la soglia di 79', T1.spedizioneGratis === false);
check('quanto manca alla soglia', C.totali([C.riga({ unitario: 19, q: 1 })]).mancanti === 60);
check('mai un «mancano −20€»', C.totali([C.riga({ unitario: 200, q: 1 })]).mancanti === 0);
check('la barra non supera il cento per cento', C.totali([C.riga({ unitario: 500, q: 1 })]).percorso === 100);
check('carrello vuoto: tutto a zero', C.totali([]).subtotale === 0 && C.totali([]).pezzi === 0);
check('carrello non-array: tutto a zero', C.totali(null).totale === 0);
/* 41.37 e non 41.370000000000005: il virgola mobile non deve arrivare a schermo */
check('niente code decimali dal virgola mobile',
  C.totali([C.riga({ unitario: 13.79, q: 3 })]).subtotale === 41.37);
const Tc = C.totali(riletto, { coupon: { pct: 0.10 } });
check('il coupon sconta il subtotale', Tc.sconto === Math.round(T1.subtotale * 0.1 * 100) / 100);
check('il totale è subtotale meno sconto', Tc.totale === Math.round((T1.subtotale - Tc.sconto) * 100) / 100);
check('senza coupon lo sconto è zero', T1.sconto === 0);
check('un coupon storto non sconta niente', C.totali(riletto, { coupon: { pct: 'dieci' } }).sconto === 0);
check('una soglia personalizzata vale', C.totali([C.riga({ unitario: 50, q: 1 })], { soglia: 40 }).spedizioneGratis === true);
check('prezzoRiga è unitario per quantità', C.prezzoRiga({ unitario: 2.5, q: 4 }) === 10);
check('prezzoRiga su riga vuota dà zero', C.prezzoRiga() === 0);

console.log('\n=== IL CHECKOUT STA DIETRO UN ADATTATORE ===');
check('i quattro modi sono dichiarati', C.ADATTATORI.length === 4);
check('con un numero WhatsApp si usa WhatsApp', C.adattatore({ whatsapp: '+39 329 690 4627' }).modo === 'WHATSAPP');
check('il numero viene ripulito', C.adattatore({ whatsapp: '+39 329 690 4627' }).numero === '393296904627');
check('senza numero si ricade sull\'email', C.adattatore({}).modo === 'EMAIL');
check('nessuna configurazione non esplode', C.adattatore().modo === 'EMAIL');
check('il modo scelto in Admin vale', C.adattatore({ whatsapp: '393', checkout: { modo: 'EMAIL' } }).modo === 'EMAIL');
check('minuscolo o maiuscolo è lo stesso', C.adattatore({ whatsapp: '393', checkout: { modo: 'email' } }).modo === 'EMAIL');
/* un bottone «Paga ora» senza link è peggio di un bottone che non c'è */
check('un link di pagamento senza URL non si usa',
  C.adattatore({ whatsapp: '393', checkout: { modo: 'PAYMENT_LINK' } }).modo === 'WHATSAPP');
check('e la ricaduta viene dichiarata',
  C.adattatore({ whatsapp: '393', checkout: { modo: 'PAYMENT_LINK' } }).ricaduta === true);
check('un URL valido abilita il link di pagamento',
  C.adattatore({ checkout: { modo: 'PAYMENT_LINK', url: 'https://buy.stripe.com/x' } }).modo === 'PAYMENT_LINK');
check('un URL malformato non abilita niente',
  C.adattatore({ checkout: { modo: 'EXTERNAL_CHECKOUT', url: 'buy.stripe.com/x' } }).modo === 'EMAIL');
check('il modo che funziona non è una ricaduta',
  C.adattatore({ whatsapp: '393', checkout: { modo: 'WHATSAPP' } }).ricaduta === false);
check('l\'email è sempre fra i disponibili', C.adattatore({}).disponibili.includes('EMAIL'));

console.log('\n=== IL CARRELLO IN PAROLE: NESSUN TIPO RESTA FUORI ===');
/* Era il difetto: il messaggio WhatsApp leggeva `i.p.n` su una riga del Lab,
   che non ha `p`, e il checkout si fermava con un errore. */
const testo = C.descriviCarrello(riletto, { L: 'it' });
check('il prodotto è nel messaggio', /Targa/.test(testo));
check('il file è nel messaggio', /Bundle SVG/.test(testo));
check('la riga del Lab è nel messaggio', /Plexiglass 3 mm/.test(testo));
check('ogni riga è una riga', testo.split('\n').length === 3);
check('i prezzi si possono togliere', !/€/.test(C.descriviCarrello(riletto, { prezzi: false })));
check('lo sku compare quando c\'è', /ING-001/.test(testo));
check('un carrello vuoto è una stringa vuota', C.descriviCarrello([]) === '');
check('un carrello non-array non esplode', C.descriviCarrello(null) === '');
check('la quantità precede il nome', /^• 2× Targa/.test(testo));
check('il messaggio si traduce', /Sign/.test(C.descriviCarrello([riletto[0]], { L: 'en' })));

console.log('\n=== IL CATALOGO PUBBLICATO PASSA DAL MODELLO ===');
const pubblicati = JSON.parse(readFileSync('data/products.json', 'utf8'));
const lista = Array.isArray(pubblicati) ? pubblicati : (pubblicati.products || pubblicati.P || []);
check('i prodotti pubblicati si leggono', lista.length > 0, String(lista.length));
/* il controllo che conta: nessuno dei 97 record cambia comportamento */
check('tutti i prodotti pubblicati sono oggetti fisici',
  lista.every(p => C.tipo(p) === 'physical'),
  lista.filter(p => C.tipo(p) !== 'physical').map(p => p.id).join());
check('ogni prodotto pubblicato diventa una riga valida',
  lista.every(p => { const r = C.daProdotto(p, { q: 1 }); return r.rif && C.nomeIn(r.nome) && r.unitario >= 0; }));
check('nessun rif duplicato fra prodotti diversi',
  new Set(lista.map(p => C.daProdotto(p, { q: 1 }).rif)).size === lista.length);
const cont = JSON.parse(readFileSync('data/content.json', 'utf8'));
check('i file digitali pubblicati sono di tipo digital',
  (cont.DIG || []).every(d => C.tipo(d) === 'digital'), String((cont.DIG || []).length));

console.log('\n=== IL SITO USA IL MODELLO, NON LE FORME VECCHIE ===');
const prod = readFileSync('assets/js/products.js', 'utf8');
check('products.js importa il modello', /from '\.\/commerce\.js'/.test(prod));
/* la catena di ternari era il difetto, non lo stile: se ritorna, ritorna il difetto */
check('non resta la catena i.dig?…:i.p', !/i\.dig\?[^\n]*i\.p\.n/.test(prod));
check('il checkout descrive il carrello da un posto solo', /descriviCarrello/.test(prod));
check('i totali vengono dal motore', /CM\.totali\(/.test(prod));

console.log('\n=== IL CANALE DI CHECKOUT SI SCEGLIE DALL\'ADMIN ===');
const admin = readFileSync('admin.html', 'utf8');
/* §45: potenziare il pannello che c'è, non creare un secondo CMS */
check('il controllo sta nel pannello prezzi, non in uno nuovo',
  admin.indexOf('ckModo') > admin.indexOf('id="v-prezzi"') &&
  admin.indexOf('ckModo') < admin.indexOf('id="v-port"'));
check('i quattro modi sono offerti', C.ADATTATORI.every(m => admin.includes('value="' + m + '"')));
check('il pannello viene disegnato', /renderCheckout\(\)/.test(admin));
check('l\'admin carica il modello', /window\.COMMERCE_MOD/.test(admin));
/* il valore si perde se non entra nella bozza: markDirty è quel che lo salva */
check('la scelta entra nella bozza', /ck\.modo=sel\.value; markDirty\(\)/.test(admin));
check('l\'indirizzo entra nella bozza', /ck\.url=url\.value\.trim\(\); markDirty\(\)/.test(admin));
check('l\'admin dichiara la ricaduta invece di nasconderla', /a\.ricaduta/.test(admin));
const cfgPub = JSON.parse(readFileSync('data/config.json', 'utf8'));
check('config.json dichiara la sezione checkout', !!cfgPub.checkout);
check('il modo pubblicato è uno dei quattro', C.ADATTATORI.includes(cfgPub.checkout.modo));
check('il canale pubblicato funziona con i contatti pubblicati',
  C.adattatore(cfgPub).ricaduta === false, C.adattatore(cfgPub).modo);
/* il fallback legacy deve portarsi dietro il nuovo campo, o il sito
   servito senza ES modules userebbe un checkout diverso */
check('il wrapper legacy porta il checkout', /checkout/.test(readFileSync('data/config.js', 'utf8')));

console.log(`\n=========== COMMERCE: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
