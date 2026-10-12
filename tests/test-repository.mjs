/* IL REPOSITORY DI QUESTO PROGETTO È UNO SOLO.

       https://github.com/inglyum/website-ingly-xtool

   Indicazione del proprietario, 2026-10-11 e ribadita il 2026-10-12:
   «repository deve essere questo sempre e per sempre di questo progetto
   del sito». Qui si sviluppa, qui si pubblica, qui vive l'Admin.

   Perché esiste questo file. Nei documenti del repository erano rimasti
   scritti TRE nomi diversi, residui di spostamenti passati:
   `Ingly-standalone-html` (nel CLAUDE.md, cioè nel primo documento che
   chiunque legge, e nella scheda dell'agente security), `Il-sito-AI` e
   `Sito-ingly`. Nessuno di quei nomi ha mai ricevuto una riga di codice —
   i commit sono sempre andati nel posto giusto — ma un documento che dice
   il nome sbagliato è una trappola: prima o poi qualcuno lo legge e ci
   crede.

   Una promessa non si può verificare, un controllo sì. Da qui in avanti
   `npm test` si ferma se un nome sbagliato rientra. */
import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };

const GIUSTO = 'inglyum/website-ingly-xtool';
/* I nomi che hanno ospitato questo progetto in passato e che NON devono
   più comparire come destinazione. */
const SBAGLIATI = ['inglyum/Ingly-standalone-html', 'inglyum/Il-sito-AI', 'inglyum/Sito-ingly'];

const SALTA = new Set(['node_modules', '.git', 'dist', 'img', 'favicon', 'assets']);
const TESTO = /\.(md|json|mjs|js|html|txt|yml|yaml)$/i;

function file(dir, out = []) {
  for (const v of readdirSync(dir)) {
    if (SALTA.has(v)) continue;
    const p = join(dir, v);
    if (statSync(p).isDirectory()) file(p, out);
    else if (TESTO.test(v)) out.push(p);
  }
  return out;
}

console.log('\n=== UN SOLO REPOSITORY, SCRITTO IN UN SOLO MODO ===');
const tutti = file('.');
check('ci sono file da controllare', tutti.length > 20, String(tutti.length));

for (const sbagliato of SBAGLIATI) {
  const colpevoli = tutti.filter(f => {
    const s = readFileSync(f, 'utf8');
    /* Il CLAUDE.md e questo test possono NOMINARE i vecchi nomi per
       spiegare che non vanno usati: quello che non deve esistere è una
       riga che li indichi come destinazione. */
    if (/che era il repository precedente|NON devono|non deve più comparire|hanno ospitato questo progetto/.test(s)) {
      return new RegExp(sbagliato.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![\\s\\S]{0,120}(precedente|non va|NON devono))').test(s)
        && !f.includes('test-repository') && !f.includes('CLAUDE.md');
    }
    return s.includes(sbagliato);
  });
  check(`nessun file indica ${sbagliato}`, colpevoli.length === 0, colpevoli.join(' '));
}

console.log('\n=== I DOCUMENTI DICONO QUELLO GIUSTO ===');
const kb = readFileSync('.claude/CLAUDE.md', 'utf8');
check('il CLAUDE.md dichiara il repository giusto', kb.includes('website-ingly-xtool'));
/* È il primo documento che chiunque legge: deve dirlo in modo che non si
   possa fraintendere, non in una riga di tabella fra le altre. */
check('e lo dichiara in modo inequivocabile',
  /REPOSITORY DI QUESTO SITO È UNO SOLO E NON CAMBIA/.test(kb));
check('con l\'indirizzo per esteso', kb.includes('https://github.com/inglyum/website-ingly-xtool'));

console.log('\n=== IL REMOTE DI GIT PUNTA LÌ ===');
/* Se la cartella di lavoro ha un remote, dev'essere quello: un checkout
   agganciato altrove è il modo più diretto di sbagliare senza accorgersene. */
let remote = '';
try {
  const cfg = readFileSync('.git/config', 'utf8');
  remote = (cfg.match(/url\s*=\s*(\S+)/) || [])[1] || '';
} catch (e) { remote = '(nessun .git/config leggibile)'; }
check('il remote è il repository giusto',
  !remote || remote.includes('website-ingly-xtool'), remote);
check('il remote non è uno dei vecchi',
  !SBAGLIATI.some(s => remote.includes(s.split('/')[1])), remote);

console.log(`\n=========== REPOSITORY: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
