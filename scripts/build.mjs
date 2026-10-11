/* Build: (a) rigenera i data/*.js legacy DAI JSON (fonte di verità unica);
   (b) bundle di fallback per file://; (c) dist/ minificata. */
import { build } from 'esbuild';
import { cpSync, mkdirSync, rmSync, readdirSync, existsSync, readFileSync, writeFileSync } from 'fs';

const J = f => JSON.parse(readFileSync('data/'+f+'.json','utf8'));
const cfg=J('config'), D=J('texts'), SOC=J('social'), P=J('products'), CATS=J('categories'), C=J('content');
/* Il Lab viaggia con la riserva: senza, su file:// o quando i JSON non si
   caricano le sezioni Materiali/Tecnologie/Macchine sparirebbero in silenzio
   e il menu porterebbe a pagine vuote. */
const MATERIALI=J('materiali'), TECNOLOGIE=J('tecnologie'), MACCHINE=J('macchine'), CORSI=J('corsi');
/* Le collezioni sono criteri sul catalogo: senza di loro il mega menu e la
   home perderebbero le vetrine, quindi viaggiano nella riserva come il Lab. */
const COLLEZIONI=J('collezioni');
writeFileSync('data/config.js',`/* GENERATO dai JSON — non modificare a mano */\nwindow.INGLY=window.INGLY||{};\nwindow.INGLY.CONFIG=${JSON.stringify(cfg)};\n`);
writeFileSync('data/i18n.js',`/* GENERATO dai JSON */\nwindow.INGLY=window.INGLY||{};\nwindow.INGLY.D=${JSON.stringify(D)};\n`);
writeFileSync('data/socials.js',`/* GENERATO dai JSON */\nwindow.INGLY=window.INGLY||{};\nwindow.INGLY.SOCIALS=${JSON.stringify(SOC)};\n`);
writeFileSync('data/catalog.js',`/* GENERATO dai JSON */\nwindow.INGLY=window.INGLY||{};\nObject.assign(window.INGLY,${JSON.stringify({P,CATS,...C})},{P:${JSON.stringify(P)},CATS:${JSON.stringify(CATS)},MATERIALI:${JSON.stringify(MATERIALI)},TECNOLOGIE:${JSON.stringify(TECNOLOGIE)},MACCHINE:${JSON.stringify(MACCHINE)},CORSI:${JSON.stringify(CORSI)},COLLEZIONI:${JSON.stringify(COLLEZIONI)},IMMAGINI:${JSON.stringify(JSON.parse(readFileSync('data/immagini.json','utf8')))}});\n`);

/* ---- L'ELENCO DELLE FOTO CHE ESISTONO DAVVERO ----
   90 prodotti su 97 dichiarano una foto; di quelle, solo 13 esistono su
   disco. Il sito le chiedeva comunque, e per ciascuna faceva DUE richieste
   fallite: `9.webp` → 404, poi il tentativo `9.jpg` → 404, poi l'elemento
   veniva rimosso e restava il segnaposto. Misurato sulla pagina catalogo:
   43 richieste fallite per un risultato visivo identico.
   Con questo elenco il sito non chiede un file che sa non esserci. È un
   elenco di ciò che C'È, non di ciò che manca: una foto caricata domani
   compare, una tolta sparisce, e in assenza dell'elenco il sito si comporta
   come prima (chiede e ripiega) — mai il contrario. */
{
  const dir = 'img';
  const file = existsSync(dir)
    ? readdirSync(dir).filter(f => /\.(webp|jpg|jpeg|png|avif|gif|svg)$/i.test(f)).sort()
    : [];
  writeFileSync('data/immagini.json', JSON.stringify({
    _nota: 'GENERATO da scripts/build.mjs e dall\'Admin alla pubblicazione: i file presenti in img/. Il sito non chiede una foto che non è in questo elenco. Non modificare a mano.',
    file
  }) + '\n');
  console.log('  foto in catalogo: ' + file.length);
}

/* ---- 404.html riceve l'elenco delle rotte, non lo ricopia ----
   La pagina di fallback di GitHub Pages deve sapere quali primi segmenti
   appartengono al sito, per distinguerli dal nome della cartella in cui il
   sito è installato. Quell'elenco era una seconda copia scritta a mano e si
   era fermata indietro di cinque rotte. Ora lo scrive il build. */
const { ID: ROTTE_ID } = await import('../assets/js/rotte.js');
{
  const f = '404.html';
  const prima = readFileSync(f, 'utf8');
  const dopo = prima.replace(/\/\*ROTTE\*\/[\s\S]*?\/\*FINE-ROTTE\*\//,
    '/*ROTTE*/' + JSON.stringify(ROTTE_ID) + '/*FINE-ROTTE*/');
  if (dopo !== prima) writeFileSync(f, dopo);
  if (!/\/\*ROTTE\*\//.test(dopo)) throw new Error('404.html: manca il segnaposto /*ROTTE*/ — le rotte non verrebbero aggiornate');
}

/* ---- la versione dei dati ----
   Il sito rilegge i JSON con ?v=<versione> presa da version.json. Pubblicando
   dall'Admin la versione si alza; pubblicando da git NO, e chi era già
   passato sul sito continuava a ricevere i dati vecchi da cache con la
   stessa query. La versione ora si alza a ogni build che cambia i dati. */
{
  const chiave = JSON.stringify([cfg, P, CATS, C, MATERIALI, TECNOLOGIE, MACCHINE, CORSI, COLLEZIONI]);
  let somma = 0;
  for (let i = 0; i < chiave.length; i++) somma = (somma * 31 + chiave.charCodeAt(i)) % 2147483647;
  const vecchia = JSON.parse(readFileSync('data/version.json', 'utf8'));
  if (vecchia.impronta !== somma) {
    writeFileSync('data/version.json', JSON.stringify({
      v: Date.now(), updated: new Date().toISOString(), impronta: somma
    }) + '\n');
    console.log('  versione dati aggiornata (i dati sono cambiati)');
  }
}

await build({ entryPoints:['assets/js/app.js'], bundle:true, minify:true, format:'iife',
  target:'es2018', outfile:'assets/js/app.fallback.js',
  banner:{ js:'if(!window.__INGLY_ESM__&&!document.documentElement.dataset.inglyBooted){document.documentElement.dataset.inglyBooted="1";' },
  footer:{ js:'}' } });

rmSync('dist',{recursive:true,force:true}); mkdirSync('dist',{recursive:true});
for (const f of ['index.html','admin.html','robots.txt','sitemap.xml','manifest.webmanifest','favicon','assets/images','data','README.md','img'].filter(f=>existsSync(f)))
  cpSync(f,'dist/'+f,{recursive:true});
await build({ entryPoints:['assets/js/app.js'], bundle:true, minify:true, format:'esm', target:'es2018', outfile:'dist/assets/js/app.js' });
cpSync('assets/js/app.fallback.js','dist/assets/js/app.fallback.js');
const css = readdirSync('assets/css').filter(f=>f.endsWith('.css'));
await build({ entryPoints: css.map(f=>'assets/css/'+f), minify:true, outdir:'dist/assets/css' });
console.log('✔ legacy js rigenerati dai JSON + fallback + dist/');
