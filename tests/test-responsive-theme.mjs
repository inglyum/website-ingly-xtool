import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import { FOGLI, caricato, posizione, ultimo, bundleCaricato } from './_fogli-css.mjs';
const html=readFileSync('index.html','utf8');
const css=readFileSync('assets/css/ingly-responsive-theme.css','utf8');
const main=readFileSync('assets/js/main.js','utf8');
assert.ok(html.includes('id="modeBtn"'),'Controllo tema mancante');
assert.ok(html.includes('id="mobileModeBtn"'),'Controllo tema mobile mancante');
assert.ok(main.includes("mobile?.addEventListener('click',toggle)"),'Toggle mobile non indipendente');
// Restyle 2026 «notte calda + oro»: il titolare ha scelto la notte come base per tutti;
// il chiaro resta a un tocco (pulsante Tema) e la scelta viene ricordata.
assert.ok(main.includes("set(stored() || 'dark')"),'Notte calda non è il tema di partenza');
assert.ok(main.includes("localStorage.setItem('ingly_mode',v)"),'La scelta del tema non viene ricordata');
assert.ok(main.includes("if(persist){try{localStorage.setItem('ingly_mode',v)}"),'Preferenza salvata solo dopo scelta');
assert.ok(main.includes("localStorage.setItem('ingly_mode',v)"),'Tema non persistito');
assert.ok(caricato('ingly-responsive-theme.css'),'CSS responsive mancante');
assert.ok(posizione('ingly-responsive-theme.css')>posizione('ingly-josefin-studio.css'),'Il tema finale deve prevalere');
assert.ok(css.includes(':root[data-mode="light"]') && css.includes(':root[data-mode="dark"]'),'Token per entrambi i temi');
for(const token of ['--ux-text','--ux-bg','--ux-border','--ux-grad','--ux-card']) assert.ok(css.includes(token),'Token mancante '+token);
for(const width of ['820px','560px'])assert.ok(css.includes('max-width:'+width),'Breakpoint mancante '+width);
assert.ok(css.includes('prefers-reduced-motion:reduce'),'Accessibilità animazioni');
assert.ok(css.includes('.mode-btn:focus-visible'),'Focus visibile');
assert.ok(css.includes('grid-template-columns:minmax(0,1fr)'),'Griglia smartphone non adattata');
console.log('✔ UI: due temi, sfumature, toggle persistente, mobile e accessibilità.');

assert.ok(css.includes('env(safe-area-inset-bottom,0px)'),'Dock smartphone deve rispettare area sicura');
assert.ok(css.includes('--ux-header'),'Superfici della barra di navigazione non tematizzate');
assert.ok(css.includes('--ux-hero-grad'),'Sfumature hero non tematizzate');
assert.ok(css.includes('.xtool-lab-feature,.ingly-service-centre'),'Layout Lab mobile incompleto');
