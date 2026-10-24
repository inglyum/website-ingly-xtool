/* Admin: controllo collegamento in 3 passi e niente falso allarme «Pages non attivo». */
import { readFileSync } from 'node:fs';
const s = readFileSync('admin.html', 'utf8');
let ok = 0, ko = 0; const t = (n, c) => { c ? ok++ : ko++; console.log((c ? '  ✔ ' : '  ✘ ') + n); };
t('pulsante «Controlla ora»', s.includes('id="ckGo"') && s.includes('id="ckList"'));
t('passo 1: token', /Token mancante/.test(s) && /Token non valido o scaduto/.test(s));
t('passo 2: permesso di scrittura', /permissions\.push/.test(s) && /Read and write/.test(s));
t('passo 3: sito online', /3\. Sito online raggiungibile/.test(s));
t('link per creare il token', s.includes('github.com/settings/personal-access-tokens/new'));
t('Pages: se il sito risponde non segnala «non attivo»', /attivo \(il sito risponde\)/.test(s) && !s.includes("GitHub Pages non risulta attivo su questo repository"));
console.log(`\n=========== ADMIN COLLEGAMENTO: ${ok} passati, ${ko} falliti ===========`);
process.exit(ko ? 1 : 0);
