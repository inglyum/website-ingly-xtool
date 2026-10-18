/* REGOLA 6 — nessuna chiave nel sito pubblico.

   Il sito è statico: tutto ciò che sta in data/*.json o in un file .js è
   scaricabile da chiunque. L'Admin pubblica proprio lì. Quindi un campo
   dell'Admin legato a CONFIG non può mai contenere un segreto.

   Era successo, in potenza: un campo «API Key Brevo» scriveva in
   CONFIG.brevo.apiKey, e forms.js la usava dal browser. Il campo era vuoto,
   nessuna chiave è mai stata pubblicata (verificato su tutta la storia del
   repository), ma bastava compilarlo e premere «Pubblica». */
import { readFileSync, readdirSync } from 'fs';

let pass = 0, fail = 0;
const check = (n, c, x = '') => { if (c) { pass++; console.log('  ✔ ' + n) } else { fail++; console.log('  ✖ ' + n + (x ? ' → ' + x : '')) } };

const ADM = readFileSync('admin.html', 'utf8');
const VAL = readFileSync('scripts/validate-data.mjs', 'utf8');
const FRM = readFileSync('assets/js/forms.js', 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

console.log('\n=== L\'ADMIN NON PUÒ PUBBLICARE UN SEGRETO ===');
const legati = [...ADM.matchAll(/data-b="(CONFIG\.[a-zA-Z0-9_.]+)"/g)].map(m => m[1]);
const sospetti = legati.filter(x => /key|token|secret|password|\bpass\b/i.test(x.split('.').pop()) && !/keywords$/i.test(x));
check('nessun campo dell\'Admin scrive una chiave nella configurazione pubblica', sospetti.length === 0, sospetti.join(', '));
check('nessun campo password è legato a CONFIG',
  ![...ADM.matchAll(/<input[^>]*type="password"[^>]*>/g)].some(m => /data-b="CONFIG\./.test(m[0])));
/* le chiavi vere (GitHub, Claude, Gemini) restano nel browser di chi le usa */
check('il token GitHub resta in sessionStorage/localStorage', /sessionStorage\.setItem\('ingly2_tok'/.test(ADM) || /function setToken/.test(ADM));
check('validaBozza blocca un formato di chiave riconoscibile', /FORMATI_CHIAVE=/.test(ADM) && /Le chiavi non vanno MAI pubblicate/.test(ADM));
check('validaBozza blocca un campo segreto compilato', /NOME_SEGRETO=/.test(ADM));

console.log('\n=== LA CI FA LO STESSO CONTROLLO ===');
check('validate-data.mjs cerca le chiavi in tutti i data/*.json', /FORMATI_CHIAVE/.test(VAL) && /readdirSync\('data'\)/.test(VAL));

console.log('\n=== IL SITO NON USA CHIAVI ===');
check('forms.js non legge nessuna chiave dalla configurazione', !/apiKey|api-key/i.test(FRM));
const segreti = /xkeysib-[A-Za-z0-9-]{10,}|sk-ant-[A-Za-z0-9_-]{10,}|\bsk-[A-Za-z0-9]{20,}|AIza[0-9A-Za-z_-]{30,}|github_pat_[A-Za-z0-9_]{20,}|\bgh[pousr]_[A-Za-z0-9]{30,}/;
const conChiave = [];
for (const d of ['data', 'assets/js']) {
  for (const f of readdirSync(d).filter(x => /\.(json|js)$/.test(x))) {
    if (segreti.test(readFileSync(`${d}/${f}`, 'utf8'))) conChiave.push(`${d}/${f}`);
  }
}
check('nessun file pubblicato contiene qualcosa che sembra una chiave', conChiave.length === 0, conChiave.join(', '));

console.log(`\n=========== SICUREZZA: ${pass} passati, ${fail} falliti ===========`);
process.exit(fail ? 1 : 0);
