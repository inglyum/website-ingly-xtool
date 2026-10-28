/* Preventivo e newsletter arrivano per email (FormSubmit), anche con allegati. */
import { readFileSync } from 'node:fs';
const js = readFileSync('assets/js/forms.js', 'utf8'), html = readFileSync('index.html', 'utf8'), ad = readFileSync('admin.html', 'utf8');
let ok = 0, ko = 0; const t = (n, c) => { c ? ok++ : ko++; console.log((c ? '  ✔ ' : '  ✘ ') + n); };
t('invio a FormSubmit con l\'email configurata', js.includes("'https://formsubmit.co/' + encodeURIComponent(dest)"));
t('invio multipart (gli allegati viaggiano)', js.includes("form.enctype = 'multipart/form-data'"));
t('ritorno sul sito con conferma (?inviato=1 / ?iscritto=1)', js.includes("'_next'") && js.includes("'inviato'") && js.includes('function confermaRitorno'));
t('limite allegati 10 MB controllato prima dell\'invio', js.includes('10 * 1024 * 1024') && js.includes("T('qfFileTroppo')"));
t('trappola anti-spam (_honey) nel modulo e nel codice', html.includes('name="_honey"') && js.includes('[name="_honey"]'));
t('campo allegati nel modulo preventivo', /<input[^>]*name="attachment"[^>]*type="file"[^>]*multiple/.test(html));
t('Formspree resta supportato se configurato', js.includes("'https://formspree.io/f/'"));
t('Admin: email di ricezione, prova di invio, spunta di attivazione', ad.includes('data-b="CONFIG.moduli.email"') && ad.includes('id="fsProva"') && ad.includes('id="fsAttivo"'));
t('nessuna chiave segreta nel sito (regola 6)', !/api[_-]?key\s*[:=]\s*['"][A-Za-z0-9]{16,}/i.test(js));
console.log(`\n=========== MODULI EMAIL: ${ok} passati, ${ko} falliti ===========`);
process.exit(ko ? 1 : 0);
