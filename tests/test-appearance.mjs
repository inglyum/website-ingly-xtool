import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as A from '../assets/js/appearance.js';

let pass=0,fail=0;
const check=(name,condition)=>{if(condition){pass++;console.log('  ✔ '+name)}else{fail++;console.log('  ✖ '+name)}};
const base='https://inglyum.github.io/website-ingly-xtool/admin.html';

console.log('\n=== URL AMMESSI ===');
check('percorso repository img/ risolto nella sottocartella GitHub Pages',
  A.risolviImmagine('img/sfondo-lab.webp',base)==='https://inglyum.github.io/website-ingly-xtool/img/sfondo-lab.webp');
check('percorso relativo assets/images ammesso',
  A.risolviImmagine('./assets/images/hero.avif',base)==='https://inglyum.github.io/website-ingly-xtool/assets/images/hero.avif');
check('URL HTTPS ammesso',A.risolviImmagine('https://cdn.example.com/hero.webp',base)==='https://cdn.example.com/hero.webp');
check('HTTP in chiaro rifiutato',A.risolviImmagine('http://example.com/hero.webp',base)==='');
check('javascript: rifiutato',A.risolviImmagine('javascript:alert(1)',base)==='');
check('data URL rifiutato',A.risolviImmagine('data:image/svg+xml,abc',base)==='');
check('percorso fuori dalle cartelle immagini rifiutato',A.risolviImmagine('../admin.html',base)==='');
check('path traversal rifiutato',A.risolviImmagine('img/../assets/images/hero.webp',base)==='');

console.log('\n=== NORMALIZZAZIONE ===');
const n=A.normalizza({visualBackground:{enabled:true,url:'img/bg.webp',position:'invalid',overlayDark:999,overlayLight:-5}});
check('posizione non supportata ripiega al centro',n.position==='center center');
check('opacità scura limitata a 85%',n.overlayDark===85);
check('opacità chiara limitata a 0%',n.overlayLight===0);
check('impostazioni assenti disattivano la foto',A.normalizza({}).enabled===false);

console.log('\n=== APPLICAZIONE AL SITO ===');
const values=new Map(),attrs=new Map();
const fakeDoc={baseURI:base,documentElement:{
  style:{setProperty:(k,v)=>values.set(k,v),removeProperty:k=>values.delete(k)},
  setAttribute:(k,v)=>attrs.set(k,v),removeAttribute:k=>attrs.delete(k)
}};
const applied=A.applica({visualBackground:{enabled:true,url:'img/bg.webp',position:'center top',overlayDark:50,overlayLight:60}},fakeDoc);
check('attiva data-bg-photo solo con URL valido',applied.enabled&&attrs.get('data-bg-photo')==='true');
check('imposta URL CSS già risolto',values.get('--ingly-photo-url')==='url("https://inglyum.github.io/website-ingly-xtool/img/bg.webp")');
check('posizione e veli propagati come variabili CSS',values.get('--ingly-photo-position')==='center top'&&values.get('--ingly-photo-dark-overlay')==='0.5'&&values.get('--ingly-photo-light-overlay')==='0.6');
A.applica({visualBackground:{enabled:true,url:'http://example.com/bg.webp'}},fakeDoc);
check('una URL non valida rimuove lo stato fotografico',!attrs.has('data-bg-photo')&&!values.has('--ingly-photo-url'));

console.log('\n=== CSS E ACCESSIBILITÀ ===');
const css=readFileSync('assets/css/pages.css','utf8');
check('tema scuro e chiaro hanno regole per lo sfondo fotografico',css.includes('html[data-bg-photo="true"] body')&&css.includes('html[data-mode="light"][data-bg-photo="true"] body'));
check('lo sfondo resta decorativo e non intercetta clic',css.includes('body::before')&&css.includes('pointer-events:none'));
check('la preferenza reduced-motion resta presente',css.includes('prefers-reduced-motion:reduce'));

console.log('\n=========== APPEARANCE: '+pass+' passati, '+fail+' falliti ===========');
process.exit(fail?1:0);
