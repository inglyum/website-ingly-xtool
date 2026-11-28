/* Hero della home (2026-11-28): tema chiaro predefinito con gli effetti,
   mosaico di foto modificabile dal pannello, firma del marchio con foto
   dell'host, porte verso Mondo xTool e assistenza. */
import { readFileSync, existsSync } from 'node:fs';
import { MOSAICO_BASE, TESSERE, fotoMosaico, htmlMosaico, piccola } from '../assets/js/hero-mosaico.js';
let ok = 0, ko = 0;
const t = (n, c) => { c ? ok++ : ko++; console.log((c ? '  ✔ ' : '  ✖ ') + n); };
const J = f => JSON.parse(readFileSync(f, 'utf8'));
const home = readFileSync('index.html', 'utf8');
const css = readFileSync('assets/css/restyle-2026.css', 'utf8');
const cfg = J('data/config.json'), MV = J('data/content.json').MV || {};

console.log('\n=== TEMA CHIARO PREDEFINITO ===');
t('la pagina parte in chiaro senza preferenza salvata', home.includes('var m="light"'));
t('il pulsante Tema parte dal chiaro', readFileSync('assets/js/main.js', 'utf8').includes("set(stored() || 'light')"));
const giorno = css.slice(css.indexOf('GIORNO — il tema chiaro'));
t('in chiaro: luci di stagione, vetro, riflesso dei pulsanti, luce del puntatore', /:root\[data-mode="light"\]\[data-mode\]\{background:/.test(giorno) && /--au-edge/.test(giorno) && /background-position:0 0/.test(giorno) && /var\(--mx,50%\)/.test(giorno));
t('ogni atmosfera ha le sue luci anche in chiaro', ['natale', 'inverno', 'sanvalentino', 'primavera', 'estate', 'autunno'].every(a => giorno.includes(':root[data-mode="light"][data-atmosfera="' + a + '"]')));
t('in chiaro i testi restano quelli del tema (contrasto): nessun --rs-ink ridefinito', !/--rs-ink:/.test(giorno.slice(0, giorno.indexOf('HERO —'))));

console.log('\n=== MOSAICO DI FOTO ===');
const lista = fotoMosaico(cfg);
t('elenco nel pannello (CONFIG.heroMosaico) con almeno 8 foto', cfg.heroMosaico && cfg.heroMosaico.foto.length >= 8 && lista.length >= 8);
t('ogni foto del mosaico esiste nel repository', lista.every(p => existsSync(p)) && MOSAICO_BASE.every(p => existsSync(p)));
t('niente personaggi o marchi di altri nella selezione consigliata', !MOSAICO_BASE.some(p => /port-(8|9|16|17|21)\.webp|\/(9[789]|10[0-7]|20)\.webp/.test(p)));
t('variante 400px solo se esiste davvero (regola 2)', lista.every(p => { const s = piccola(p, MV); return existsSync(s); }));
t('percorsi non validi scartati (solo img/…)', fotoMosaico({ heroMosaico: { foto: ['https://x.it/a.webp', 'img/../x.webp', 'javascript:1', 'img/port-1.webp'] } }).join() === 'img/port-1.webp');
t('spento dal pannello = nessun mosaico', fotoMosaico({ heroMosaico: { attivo: false, foto: ['img/port-1.webp'] } }).length === 0);
const m = home.match(/<div class="hmosaico" id="heroMosaico" aria-hidden="true" data-firma="([^"]*)">([^]*?)<\/div><div class="hmosaico-velo"/);
t('la pagina contiene già il mosaico aggiornato (primo disegno veloce)', !!m && m[1] === lista.join('|') && m[2] === htmlMosaico(lista, MV));
t(`${TESSERE} tessere, foto decorative (alt vuoto)`, !!m && (m[2].match(/hmosaico__t/g) || []).length === TESSERE && !/alt="[^"]/.test(m[2]));
t('regola 1: nessuna animazione sulle foto, si muove il contenitore', /\.hmosaico\{[^}]*animation:hm-scorri/.test(css) && !/\.hmosaico__t img\{[^}]*animation/.test(css) && /prefers-reduced-motion:reduce\)\{\.hmosaico\{animation:none\}/.test(css));
t('velo sopra il mosaico in chiaro e in scuro (testo leggibile)', /\.hmosaico-velo\{/.test(css) && /:root\[data-mode="dark"\] \.hmosaico-velo\{/.test(css));
t('ridisegnato dai dati pubblicati dal pannello', /applicaMosaico\(CONFIG\)/.test(readFileSync('assets/js/products.js', 'utf8')));
const adm = readFileSync('admin.html', 'utf8');
t('Admin: card «Mosaico foto della home» con aggiungi, togli, ordina, ripristina', /id="mosaicoCard"/.test(adm) && /function renderMosaico/.test(adm) && /data-mos-del/.test(adm) && /data-mos-mv/.test(adm) && /mosReset/.test(adm) && /renderAtmosfera\(\);bindAll\(\);renderMosaico\(\);/.test(adm));

t('Admin: card «Immagini del menu» (CONFIG.menuImmagini)', /id="menuImgCard"/.test(adm) && /async function renderMenuImg/.test(adm) && /data-menu-img/.test(adm) && /renderMosaico\(\);renderMenuImg\(\);/.test(adm));

console.log('\n=== FIRMA E PORTE xTOOL ===');
const hero = home.slice(home.indexOf('id="rs3d"'), home.indexOf('class="signature-benefits"'));
t('logo INGLY, badge xTool Authorized Service Centre e foto dell\'host nell\'hero', /hero-firma__logo" src="assets\/images\/ingly-logo\.svg"/.test(hero) && /xtool-asc-trasparente/.test(hero) && /giuseppe-inglima-host-480\.webp/.test(hero) && /href="#host"/.test(hero));
t('porte verso Mondo xTool e Assistenza xTool (tutta Italia ed Europa)', /href="xtool\/"/.test(hero) && /href="assistenza-xtool-palermo\/"[^]*in tutta Italia e in Europa/.test(hero));
t('titolo dell\'home: «Ispiriamo la creazione.» (Admin → slogan) e copia nella pagina', cfg.slogan.it === 'Ispiriamo la **creazione.**' && cfg.slogan.en === 'We inspire **creation.**' && /data-parola="creazione\."/.test(hero));
t('badge Pro Hub come livello xTool Squad, non come voto', /class="xsquad xsquad--mini"[^]*Pro Hub[^]*fill="none"/.test(hero) && !/Pro Hub <i aria-hidden="true">★★/.test(home));
const card = home.slice(home.indexOf('id="host"'), home.indexOf('</article>', home.indexOf('id="host"')));
t('profilo: badge Pro Hub collegato al profilo ufficiale, spiegazione del livello, zone Italia ed Europa', /<a class="xsquad" href="https:\/\/support\.xtool\.com\/demo-room\/host-instruction\?id=2528/.test(card) && /ihost__livello">Pro Hub è il livello più completo della rete ufficiale xTool Squad/.test(card) && /<dd>Italia ed Europa<\/dd>/.test(card) && !/aria-label="2 stelle"/.test(card));
t('titolo modificabile dal pannello invariato (#heroH1)', (hero.match(/id="heroH1"/g) || []).length === 1);
t('firma e porte nella griglia dell\'hero, prima del modulo', /grid-template-areas:"\. s" "b s" "t s" "p s" "x s" "f s" "\. s"/.test(css) && /grid-template-areas:"b" "t" "p" "x" "s" "f"/.test(css));
const diz = readFileSync('assets/js/lingua-statica.js', 'utf8');
t('testi nuovi tradotti in inglese', ['Host ufficiale xTool Squad', 'macchine, demo gratuite e corsi', 'in tutta Italia e in Europa', 'Italia ed Europa', 'Pro Hub è il livello più completo della rete ufficiale xTool Squad: demo, manutenzione, installazione, soluzioni per aziende ed eventi.'].every(k => diz.includes("'" + k + "'")));

console.log('\n=== RIFINITURE, GENERATORI PRO, STAMPA 3D ===');
const fxjs = readFileSync('assets/js/effetti-pro.js', 'utf8');
t('barra di lettura e mosaico che segue il puntatore, solo variabili CSS e mai con «riduci movimento»', /function avviaRifiniture\(\) \{\n  if \(riduci\(\)\) return;/.test(fxjs) && /setProperty\('--fx-p'/.test(fxjs) && /setProperty\('--hm-x'/.test(fxjs) && /#fxProgresso\{/.test(css) && /prefers-reduced-motion:reduce\)\{#fxProgresso\{display:none\}/.test(css));
t('nastro dei servizi: copia per il ciclo nascosta ai lettori di schermo, fermo con «riduci movimento»', /class="inastro"[^]*class="inastro__lista" aria-hidden="true"/.test(home) && /prefers-reduced-motion:reduce\)\{\.inastro__binario\{animation:none;width:auto\}/.test(css) && /\.inastro\{position:relative;overflow:hidden;overflow:clip;/.test(css));
const gen = readFileSync('generatori.html', 'utf8');
const pro = ['boxes.hackerspace-bamberg.de', 'makercase.com', 'templatemaker.nl', 'makerworld.com/en/makerlab/parametricModelMaker', 'gridfinity.perplexinglabs.com', 'openscad.org', 'printables.com', 'xtool.com/pages/software'];
t('generatori professionali del web nel Generator Studio (laser e stampa 3D)', pro.every(u => gen.includes(u)) && /'Pro esterni · Stampa 3D':'Pro external · 3D printing'/.test(gen));
t('elenco del pannello unito ai nuovi strumenti, non sostituito', /defaults\.forEach\(d=>\{if\(!catalogue\.some\(x=>x\.id===d\.id\)\)catalogue\.push\(d\)\}\)/.test(gen) && J('data/content.json').GENERATORI.some(g => g.id === 'pro-boxes-py'));
const s3d = readFileSync('assets/js/stampa3d-ui.js', 'utf8');
t('Stampa 3D: strumenti professionali con link esterni sicuri', /STRUMENTI_3D/.test(s3d) && /target="_blank" rel="noopener noreferrer"/.test(s3d) && /litofania\.html/.test(s3d));

console.log(`\n=========== HERO E MOSAICO: ${ok} passati, ${ko} falliti ===========`);
if (ko) process.exit(1);
