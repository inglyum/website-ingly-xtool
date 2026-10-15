/* L'architettura dell'informazione.

   Il rischio di raggruppare tredici voci in cinque famiglie è perderne una
   per strada: una pagina che esiste, è indicizzata, e dal menu non si
   raggiunge più. Qui si verifica che ogni destinazione del sito sia ancora
   a portata di clic, e che il menu non prometta pagine inesistenti. */
import * as IA from '../assets/js/nav-ia.js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const leggi = f => JSON.parse(readFileSync(join(ROOT, f), 'utf8'));

let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };

const D = {
  CATS: leggi('data/categories.json'),
  MATERIALI: leggi('data/materiali.json'),
  TECNOLOGIE: leggi('data/tecnologie.json'),
  MACCHINE: leggi('data/macchine.json'),
  CORSI: leggi('data/corsi.json'),
  VERTICALI: leggi('data/content.json').VERTICALI || []
};

console.log('\n=== LE CINQUE FAMIGLIE, PER OBIETTIVO ===');
/* Prima erano cinque e mettevano sullo stesso piano cose di natura
   diversa: «Lab» conteneva materiali, tecnologie E macchine — tre mondi
   commerciali in una tendina — mentre i file digitali, che si vendono, non
   avevano voce propria. «Studio» occupava una delle cinque posizioni per
   contenuti che nessuno cerca prima di aver deciso di comprare. */
check('la barra ha cinque voci principali', IA.FAMIGLIE.length === 5, String(IA.FAMIGLIE.length));
check('ogni famiglia porta a una pagina sua', IA.FAMIGLIE.every(f => f.rotta && /^[a-z-]+$/.test(f.rotta)));
/* Un gruppo che si apre soltanto è una trappola per chi usa la tastiera. */
check('nessuna famiglia è un contenitore vuoto',
  IA.FAMIGLIE.every(f => IA.pannello(f.id, D).colonne.length > 0 || f.rotta));
check('i file digitali sono raggiungibili dal menu Shop', IA.pannello('shop', D).colonne.some(c => c.voci.some(v => v.href.endsWith('/digital'))));
check('le macchine hanno una voce propria', IA.FAMIGLIE.some(f => f.id === 'xtool'));
check('lo studio è uscito dalla barra', !IA.FAMIGLIE.some(f => f.id === 'studio'));
check('ed è finito fra le secondarie', IA.SECONDARIE.map(v => v.id).includes('about'));
check('le secondarie sono le quattro attese',
  IA.SECONDARIE.map(v => v.id).join() === 'portfolio,about,faq,quote');

console.log('\n=== PERSONALIZZA COMPARE SOLO SE C\'È QUALCOSA ===');
/* Una voce di menu verso una pagina vuota è peggio di una voce che non
   c'è. Nessuno dei 97 prodotti pubblicati dichiara di essere
   personalizzabile, quindi oggi la voce non si vede. */
check('senza prodotti marcati la voce non c\'è',
  IA.famiglieVive({ ...D, P: [] }).some(f => f.id === 'personalizza'));
check('con un prodotto marcato compare',
  IA.famiglieVive({ ...D, P: [{ id: 1, personalizzabile: true }] }).some(f => f.id === 'personalizza'));
check('la voce rimane visibile anche con prodotto nascosto',
  IA.famiglieVive({ ...D, P: [{ id: 1, personalizzabile: true, hidden: true }] }).some(f => f.id === 'personalizza'));
check('rimangono cinque landing principali', IA.famiglieVive({ ...D, P: [] }).length === 5);
check('la barra contiene Personalizza anche senza prodotti',
  /data-fam="personalizza"/.test(IA.barraHtml({ ...D, P: [] }, { L: 'it', base: '' })));
check('e la contiene quando c\'è', 
  /data-fam="personalizza"/.test(IA.barraHtml({ ...D, P: [{ id: 1, personalizzabile: true }] }, { L: 'it', base: '' })));
/* I dati veri: i prodotti che dichiarano nel proprio testo di aspettare
   qualcosa dal cliente — un nome, una data, una foto, un logo — sono
   marcati, quindi oggi la voce C'È. La regola sta in
   scripts/marca-personalizzabili.mjs e la spunta nell'Admin la vince. */
const PV = leggi('data/products.json');
check('sui dati pubblicati la voce compare',
  IA.famiglieVive({ ...D, P: PV }).some(f => f.id === 'personalizza'));
check('e ha dietro dei prodotti veri',
  PV.filter(p => p.personalizzabile === true && !p.hidden).length > 0,
  String(PV.filter(p => p.personalizzabile === true && !p.hidden).length));
/* togliendo le spunte deve tornare a sparire: la voce segue il dato, non
   è stata semplicemente accesa */
check('la landing resta visibile se vengono rimossi i prodotti',
  IA.famiglieVive({ ...D, P: PV.map(p => ({ ...p, personalizzabile: false })) }).some(f => f.id === 'personalizza'));

console.log('\n=== I PANNELLI NASCONO DAI DATI ===');
const lab = IA.pannello('materiali', D);
check('Materiali mostra due colonne', lab.colonne.length === 2);
check('i materiali del menu sono quelli veri',
  lab.colonne[0].voci.some(v => /Plexiglass/i.test(v.n)));
check('le tecnologie del menu sono quelle vere',
  lab.colonne[1].voci.length === D.TECNOLOGIE.tecnologie.length);
const xt = IA.pannello('xtool', D);
/* Le macchine che abbiamo vengono prima e in una colonna loro: sono le
   uniche che si possono venire a vedere. */
check('xTOOL Lab mantiene in officina, altre macchine e percorsi', xt.colonne.length === 3);
/* una macchina tagliata dalla fetta sarebbe una pagina che esiste e dal
   menu non si raggiunge */
check('nessuna macchina resta fuori dal menu',
  xt.colonne[0].voci.length + xt.colonne[1].voci.length === D.MACCHINE.catalogo.length);
check('la prima colonna sono solo quelle in officina',
  xt.colonne[0].voci.length === D.MACCHINE.catalogo.filter(m => m.inOfficina).length);
check('e lo dichiara su ogni voce', xt.colonne[0].voci.every(v => v.nota));
check('la seconda colonna è il resto della gamma',
  xt.colonne[1].voci.length === D.MACCHINE.catalogo.filter(m => !m.inOfficina).length);
check('porta alla demo', /demo/.test(xt.evidenza.cta.href));
check('Academy e Tecnologie sono nel Lab', ['academy','tecnologie'].every(route=>xt.colonne[2].voci.some(v=>v.href.endsWith('/'+route))));
check('Service Centre nel Lab', xt.colonne[2].voci.some(v=>v.href.includes('inglyServiceTitle')));
const dg = IA.pannello('digital', { ...D, DIG: leggi('data/content.json').DIG || [] });
check('i file digitali hanno il loro pannello e gli strumenti creativi', dg.colonne.length === 3);
/* i formati arrivano dai file che esistono: un elenco a mano prometterebbe
   tipi che nessun file fornisce */
check('i formati arrivano dai file veri',
  dg.colonne[1].voci.every(v => (leggi('data/content.json').DIG || []).some(d => (d.f || []).includes(v.n))));
check('il Generator Studio è raggiungibile dal pannello digitali',
  dg.colonne[2].voci.some(v => v.href.endsWith('generatori.html')));

const shop = IA.pannello('shop', D);
check('lo Shop elenca le categorie vere', shop.colonne[0].voci.length > 3);
check('un materiale nuovo entrerebbe nel menu da solo',
  IA.pannello('materiali', { ...D, MATERIALI: { materiali: [{ id: 'x', n: { it: 'Nuovo' } }] } })
    .colonne[0].voci[0].n === 'Nuovo');

console.log('\n=== ACADEMY VUOTA ===');
const ac = IA.pannello('academy', D);
check('senza corsi la colonna resta vuota', ac.colonne[0].voci.length === 0);
/* Un menu che mostra «Corsi» e non porta a niente è peggio di un menu che
   dice che il calendario non è aperto. */
check('ma il pannello lo dice, invece di tacere', !!ac.evidenza);
const conCorsi = { ...D, CORSI: { corsi: [{ id: 'p3', n: { it: 'Corso P3' }, stato: 'pubblicato' },
  { id: 'b', n: { it: 'Bozza' }, stato: 'bozza' }] } };
check('un corso pubblicato entra nel menu', IA.pannello('academy', conCorsi).colonne[0].voci.length === 1);
check('una bozza no', !IA.pannello('academy', conCorsi).colonne[0].voci.some(v => v.n === 'Bozza'));

console.log('\n=== NESSUNA DESTINAZIONE PERSA ===');
const dest = IA.destinazioni(D).map(h => h.split('?')[0]);
/* Le pagine che esistevano prima della riorganizzazione devono restare
   raggiungibili: una pagina indicizzata e non più linkata è peggio di una
   pagina cancellata, perché nessuno se ne accorge. */
for (const r of ['/shop', '/digital', '/business', '/portfolio', '/about', '/faq', '/quote',
                 '/materiali', '/tecnologie', '/macchine', '/academy', '/demo']) {
  check('dal menu si raggiunge ancora ' + r, dest.includes(r), dest.join(' '));
}

console.log('\n=== IL MENU NON PROMETTE PAGINE CHE NON ESISTONO ===');
const rotte = new Set(['', 'personalizza', 'shop', 'digital', 'business', 'portfolio', 'about', 'faq', 'quote',
  'materiali', 'tecnologie', 'macchine', 'academy', 'demo', 'product', 'generatori.html']);
const idsMat = new Set(D.MATERIALI.materiali.map(m => m.id));
const idsTec = new Set(D.TECNOLOGIE.tecnologie.map(t => t.id));
const idsMac = new Set(D.MACCHINE.catalogo.map(m => m.id));
const idsVert = new Set(D.VERTICALI.map(v => v.id));
const rotti = [];
for (const h of IA.destinazioni(D)) {
  const seg = h.split('?')[0].replace(/^\/+/, '').split('/');
  if (!rotte.has(seg[0])) { rotti.push(h); continue; }
  if (seg[1]) {
    const ok = seg[0] === 'materiali' ? idsMat.has(seg[1])
      : seg[0] === 'tecnologie' ? idsTec.has(seg[1])
      : seg[0] === 'macchine' ? idsMac.has(seg[1])
      : seg[0] === 'business' ? idsVert.has(seg[1])
      : seg[0] === 'academy';
    if (!ok) rotti.push(h);
  }
}
check('nessun link del menu porta a una pagina inesistente', rotti.length === 0, rotti.join(' '));

console.log('\n=== MARKUP ===');
const barra = IA.barraHtml(D, { base: '' });
/* `aria-haspopup` sta sul PULSANTE che apre il pannello, non sul link
   che naviga: è il pulsante ad aprire un popup, il link va a una pagina. */
check('ogni voce apribile dichiara il suo pannello', (barra.match(/aria-haspopup/g) || []).length >= 4);
check('il link che naviga NON dichiara un popup',
  !/<a class="ia-voce"[^>]*aria-haspopup/.test(barra));
check('e parte da chiusa', !/aria-expanded="true"/.test(barra));
check('gli indirizzi rispettano la base del sito',
  IA.barraHtml(D, { base: '/anteprima' }).includes('href="/anteprima/shop"'));
/* I nomi arrivano dai dati, che li scrive una persona nell'Admin. */
const velenoso = { ...D, CATS: [{ id: 'x', n: { it: '<img src=x onerror=alert(1)>' } }] };
check('un nome con dentro del codice non diventa codice',
  !IA.pannelloHtml({ id: 'shop' }, velenoso, {}).includes('<img src=x'));
check('il cassetto mobile ha le stesse famiglie della barra',
  (IA.cassettoHtml(D, { base: '' }).match(/class="dr-fam"/g) || []).length === IA.famiglieVive(D).length);
/* le secondarie sono uscite dalla barra, non dal sito: nel cassetto
   restano, in un gruppo a parte in fondo */
check('il cassetto chiude con le voci secondarie',
  /class="dr-sec"/.test(IA.cassettoHtml(D, { base: '' })));
check('e le contiene tutte e quattro',
  IA.SECONDARIE.every(v => IA.cassettoHtml(D, { base: '' }).includes('data-nav="' + v.rotta + '"')));

console.log('\n=== IL NOME PORTA ALLA PAGINA, LA FRECCIA APRE IL MENU ===');
/* La regola: un clic sul nome deve aprire la landing, subito. Prima il
   gestore faceva preventDefault() sul link per aprire la tendina — chi
   voleva lo Shop doveva prima scegliere una sottosezione — e sul telefono
   il nome era un BOTTONE che espandeva soltanto: dal cassetto alla pagina
   Shop non ci si arrivava affatto. */
const barraHtm = IA.barraHtml(D, { L: 'it', base: '' });
check('ogni voce della barraHtm è un link', (barraHtm.match(/<a class="ia-voce"/g) || []).length === IA.famiglieVive(D).length);
check('ogni link porta alla sua rotta', IA.famiglieVive(D).every(f => barraHtm.includes('href="/' + f.rotta + '"')));
check('la freccia è un pulsante separato', /<button type="button" class="ia-freccia"/.test(barraHtm));
/* un bottone dentro un link non è markup valido e i lettori di schermo lo
   annunciano a caso */
check('la freccia NON sta dentro il link',
  !/<a class="ia-voce"[^>]*>[^<]*<button/.test(barraHtm) &&
  barraHtm.indexOf('<button') > barraHtm.indexOf('</a>'));
check('la freccia dice cosa apre', /aria-controls="ia-pan-/.test(barraHtm) && /aria-label="/.test(barraHtm));
check('la freccia dichiara se è aperta', /aria-expanded="false"/.test(barraHtm));
/* una famiglia senza pannello è solo un link: niente freccia che non apre nulla */
const senzaPannello = IA.famiglieVive(D).filter(f => IA.pannello(f.id, D).colonne.length === 0);
check('una famiglia senza pannello non ha la freccia',
  (barraHtm.match(/class="ia-freccia"/g) || []).length === IA.famiglieVive(D).length - senzaPannello.length);

const megaJs = readFileSync('assets/js/nav-mega.js', 'utf8');
/* il difetto nominato dal brief, in una riga */
check('nessun preventDefault sul link della barraHtm',
  !/\.ia-voce\[data-fam\][\s\S]{0,200}preventDefault/.test(megaJs));
check('il pannello lo apre la freccia', /\.ia-freccia\[data-apri\]/.test(megaJs));
check('il pannello si chiude quando si naviga', /closest\('\.ia-voce'\)/.test(megaJs));
check('e anche con indietro/avanti', /popstate'?, *\(\) => chiudi|popstate', *\(\) *=> *chiudi/.test(megaJs.replace(/\s+/g, ' ')));

console.log('\n=== IL CASSETTO DEL TELEFONO ===');
const cassHtm = IA.cassettoHtml(D, { base: '' });
check('il nome è un link, non un pulsante', /<a class="dr-fam"/.test(cassHtm));
check('non è più un pulsante che apre soltanto', !/<button[^>]*class="dr-fam"/.test(cassHtm));
check('la freccia è un pulsante a parte', /<button type="button" class="dr-freccia"/.test(cassHtm));
check('la freccia dice cosa fa', /class="dr-freccia"[^>]*aria-label="/.test(cassHtm));
check('la freccia è collegata al pannello che apre', /class="dr-freccia"[^>]*aria-controls="dr-/.test(cassHtm));
check('ogni nome porta alla sua rotta',
  IA.famiglieVive(D).every(f => cassHtm.includes('href="/' + f.rotta + '"')));
check('il pannello non perde il listener al cambio lingua', /let mobileLegato = false/.test(megaJs)
  && /if \(mobileLegato\) return/.test(megaJs));

console.log('\n=== LA SEZIONE CORRENTE SI VEDE ===');
check('la barra sa segnare dove ci si trova', /aria-current="page"/.test(IA.barraHtml(D, { L: 'it', base: '', attiva: 'shop' })));
check('e solo su una voce',
  (IA.barraHtml(D, { L: 'it', base: '', attiva: 'shop' }).match(/aria-current/g) || []).length === 1);
check('senza sezione attiva nessuna voce è segnata', !/aria-current/.test(barraHtm));
/* una famiglia copre più rotte: xTOOL Lab vale per /macchine e per /demo */
check('il segno si aggiorna a ogni cambio pagina', /ingly:pagina/.test(megaJs));
check('una famiglia può coprire più rotte', /COPERTE/.test(megaJs));
const navjs = readFileSync('assets/js/navigation.js', 'utf8');
check('il router annuncia il cambio di pagina', /ingly:pagina/.test(navjs));

console.log(`\n=========== NAV IA: ${pass} passati, ${fail} falliti ===========\n`);
process.exit(fail ? 1 : 0);
