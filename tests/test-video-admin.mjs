/* Video caricabili dall'Admin e video di sfondo dell'hero collegato alla home attuale. */
import { readFileSync, existsSync } from 'node:fs';
const ad = readFileSync('admin.html', 'utf8'), js = readFileSync('assets/js/main.js', 'utf8'), css = readFileSync('assets/css/brand-system-2026.css', 'utf8');
let ok = 0, ko = 0; const t = (n, c) => { c ? ok++ : ko++; console.log((c ? '  ✔ ' : '  ✘ ') + n); };
t('funzione di caricamento video (mp4/webm, max 40 MB, in assets/videos/)', ad.includes('function caricaVideo') && ad.includes("'assets/videos/'") && ad.includes('40*1024*1024'));
t('pulsanti «Carica video» per Home, Chi siamo e prodotto', ['heroVideoUp', 'abVideoUp', 'ep_videoUp'].every(id => ad.includes('id="' + id + '"')));
t('il video hero usa la home attuale (.signature-hero), non .coin-scene', js.includes("document.querySelector('#page-home .signature-hero')") && !js.includes("querySelector('.coin-scene')"));
t('solo file video veri; niente video con «riduci movimento» o risparmio dati', /mp4\|webm\|ogv/.test(js) && js.includes('saveData'));
t('velo di leggibilità sul video in entrambi i temi', css.includes('.hero-video-velo') && css.includes(':root[data-mode="light"] #page-home .hero-video-velo'));
t('documento dei prompt video e layout', existsSync('docs/PROMPT-VIDEO-E-LAYOUT-2026.md'));
console.log(`\n=========== VIDEO ADMIN: ${ok} passati, ${ko} falliti ===========`);
process.exit(ko ? 1 : 0);
