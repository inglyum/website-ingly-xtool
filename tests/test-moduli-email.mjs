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
t('codice segreto FormSubmit: ha la precedenza sull\'email', js.includes('m.codice') && js.includes('RE_CODICE.test(codice)) return codice') && ad.includes('data-b="CONFIG.moduli.codice"'));
t('risposta automatica: _autoresponse e verifica robot lasciata attiva', js.includes("campoNascosto(form, '_autoresponse', risposta)") && /if\(risposta\)[^\n]*\n\s*else campoNascosto\(form, '_captcha', 'false'\)/.test(js));
t('risposta automatica spegnibile e modificabile dall\'Admin', ad.includes('id="fsAuto"') && ad.includes('CONFIG.moduli.rispostaAuto.preventivo.it') && ad.includes('CONFIG.moduli.rispostaAuto.newsletter.en'));
t('dopo l\'invio: pulsante WhatsApp con la richiesta già scritta', js.includes("'https://wa.me/' + num + '?text='") && js.includes("T('qWaBtn')") && js.includes('sessionStorage'));
{ const tx = JSON.parse(readFileSync('data/texts.json', 'utf8'));
  const k = ['qAutoRisposta','nlAutoRisposta','qWaBtn','qWaIntro','qWaNome','qWaRichiesta','qWaMateriale','qWaQuantita'];
  const lingue = Object.values(tx).filter(o => o && typeof o === 'object' && 'qOkInviato' in o);
  t('testi nuovi in italiano e inglese', lingue.length >= 2 && lingue.every(o => k.every(x => String(o[x] || '').trim()))); }
t('nessuna chiave segreta nel sito (regola 6)', !/api[_-]?key\s*[:=]\s*['"][A-Za-z0-9]{16,}/i.test(js));
console.log(`\n=========== MODULI EMAIL: ${ok} passati, ${ko} falliti ===========`);
process.exit(ko ? 1 : 0);
