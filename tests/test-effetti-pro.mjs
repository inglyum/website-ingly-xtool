/* Effetti pro (2026-11-27): sfondo vivo WebGL e titoli incisi dal laser.
   Controlla che restino sicuri: niente sezioni invisibili, niente animazioni
   sulle immagini, rispetto di «riduci movimento», GSAP locale e con licenza. */
import { readFileSync, existsSync } from 'node:fs';
let ok = 0, ko = 0;
const t = (n, c) => { c ? ok++ : ko++; console.log((c ? '  ✔ ' : '  ✖ ') + n); };
const js = readFileSync('assets/js/effetti-pro.js', 'utf8');
const css = readFileSync('assets/css/restyle-2026.css', 'utf8');
const fx = css.slice(css.indexOf('EFFETTI PRO'));

console.log('\n=== SFONDO VIVO ===');
t('solo in modalità scura e mai con «riduci movimento»', /if \(SF \|\| riduci\(\) \|\| !scuro\(\)\) return;/.test(js));
t('mezza risoluzione e al massimo 30 fotogrammi al secondo', /\.5/.test(js) && /1000 \/ \(tocco \? 20 : 30\)/.test(js));
t('fermo quando la scheda non è visibile', /document\.hidden/.test(js));
t('senza WebGL non succede niente (resta lo sfondo CSS)', /if \(!gl\) return;/.test(js));
t('i colori arrivano dall\'atmosfera di stagione', /--au-g1/.test(js) && /data-atmosfera/.test(js));
t('canvas dietro ai contenuti e non cliccabile', /#fxSfondo\{[^}]*z-index:-1;pointer-events:none/.test(fx));

console.log('\n=== TITOLI INCISI ===');
t('si nascondono solo titoli fuori schermo', /r\.top < alt \* \.9\) \{ el\.classList\.add\('lz-fatto'\); return; \}/.test(js));
t('se GSAP non arriva il titolo torna visibile', /\.catch\(\(\) => mostra\(el\)\)/.test(js));
t('paracadute: titoli passati vengono mostrati', /setTimeout\(\(\) => document\.querySelectorAll\('h2\.lz-pronto'\)/.test(js));
t('si osserva il contenitore (il titolo ritagliato ha area zero)', /CONT\.set\(c, el\); IO\.observe\(c\)/.test(js));
t('con «riduci movimento» nessun ritaglio né raggio', /prefers-reduced-motion:reduce\)\{:root\[data-mode\] h2\.lz-pronto\{clip-path:none/.test(fx));
t('GSAP caricato solo quando serve, dal sito stesso', /assets\/vendor\/gsap\/gsap\.min\.js/.test(js) && existsSync('assets/vendor/gsap/gsap.min.js'));
t('licenza GSAP annotata', existsSync('assets/vendor/gsap/LICENZA.txt') && /standard-license/.test(readFileSync('assets/vendor/gsap/LICENZA.txt', 'utf8')));

console.log('\n=== REGOLE DEL SITO ===');
t('regola 1: nessuna animazione sulle immagini prodotto/galleria/categoria', !/img\.(pimgph|gimg|bimg)/.test(fx) && !/pimgph|gimg|bimg/.test(js));
t('regola 11: lo script scrive solo variabili CSS, niente sfondi inline', !/style\.background/.test(js));
t('collegato all\'avvio del sito', /initEffettiPro/.test(readFileSync('assets/js/main.js', 'utf8')));

console.log(`\n=========== EFFETTI PRO: ${ok} passati, ${ko} falliti ===========`);
if (ko) process.exit(1);
