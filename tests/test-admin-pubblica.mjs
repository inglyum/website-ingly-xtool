/* PUBBLICAZIONE DALL'ADMIN SENZA SORPRESE.
   19/10: una pubblicazione partita da un Admin aperto prima di un
   aggiornamento ha riscritto config.json con la copia vecchia: l'impostazione
   dello sfondo della Home è sparita. Poi un workflow faceva da solo un
   secondo commit su main dopo ogni pubblicazione (regola 5) e il ramo
   avanzato faceva fallire la pubblicazione successiva. */
import { readFileSync, existsSync } from 'fs';
let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };
const admin = readFileSync('admin.html', 'utf8');
const corpo = admin.match(/function _piatto\(v\)[\s\S]*?\n function unisci3[\s\S]*?conf\.push\(via\|\|'\(intero file\)'\);return mio\}/) || admin.match(/function _piatto[\s\S]*?return mio\}\n/);
const unisci3 = new Function(corpo[0] + '; return unisci3;')();
const base = { a: 1, hero: { img: 'x', on: false }, lista: [1, 2] };
let c = [];
let r = unisci3(base, { a: 1, hero: { img: 'nuova', on: false }, lista: [1, 2] }, { a: 1, hero: { img: 'x', on: false }, lista: [1, 2], heroSfondo: { attivo: true } }, '', c);
check('le novità arrivate da GitHub restano (il caso dello sfondo perso)', r.heroSfondo?.attivo === true && r.hero.img === 'nuova' && !c.length);
c = [];
r = unisci3(base, { a: 2, hero: base.hero, lista: [1, 2] }, { a: 1, hero: { img: 'x', on: true }, lista: [1, 2] }, '', c);
check('modifiche a campi diversi si sommano', r.a === 2 && r.hero.on === true && !c.length);
c = [];
r = unisci3(base, { ...base, a: 5 }, { ...base, a: 9 }, '', c);
check('stesso campo cambiato da entrambi: conflitto segnalato, vince la tua', r.a === 5 && c.join() === 'a');
c = [];
r = unisci3(base, { a: 1, lista: [1, 2] }, base, '', c);
check('un campo che hai tolto resta tolto', !('hero' in r) && !c.length);
check('l\'unione avviene prima di preparare i file', admin.indexOf('const unione=await unisciRemoto(pre') > 0 && admin.indexOf('const unione=await unisciRemoto(pre') < admin.indexOf("const ch=changedFiles();const files={};"));
check('il ramo avanzato non fa fallire: nuovo tentativo automatico', /for\(let tentativo=1;tentativo<=4;tentativo\+\+\)/.test(admin) && /\/compare\/\$\{base\}\.\.\.\$\{nuovo\}/.test(admin));
check('…ma si ferma se l\'altro commit ha toccato i tuoi stessi dati', /if\(toccati\.length\)return fail\('ref'/.test(admin));
check('nessun workflow che fa commit da solo su main (regola 5)', !existsSync('.github/workflows/sync-prerender.yml'));
check('le pagine generate dall\'Admin partono dalla sezione giusta', admin.includes("import('./assets/js/prerender-sito.js')") && /pagina: 'product'/.test(readFileSync('assets/js/prerender-sito.js','utf8')));
check('caricare la foto dell\'hero accende lo sfondo', (admin.match(/S\.CONFIG\.heroSfondo=Object\.assign\(\{velo:'0\.6'\},S\.CONFIG\.heroSfondo,\{attivo:true\}\);/g) || []).length === 3);
console.log(`\n=========== PUBBLICAZIONE ADMIN: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
