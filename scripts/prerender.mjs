#!/usr/bin/env node
/* ============ GENERA LE PAGINE STATICHE ============
   Legge data/*.json e index.html, scrive una pagina vera per ogni prodotto e
   per ogni sezione del sito.

   Uso:  node scripts/prerender.mjs            (genera)
         node scripts/prerender.mjs --check    (verifica soltanto, non scrive)

   Le pagine generate sono file normali: GitHub Pages le serve così come sono,
   quindi un crawler che non esegue JavaScript legge testo, prezzi e misure.
   Chi apre il sito con un browser non nota nulla: appena l'applicazione parte,
   il blocco statico viene rimosso e prende il posto il sito di sempre. */
import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { generaSito } from '../assets/js/prerender-sito.js';

const ROOT = resolve(new URL('..', import.meta.url).pathname);
const SOLO_VERIFICA = process.argv.includes('--check') || process.argv.includes('--verifica');
const leggi = async f => JSON.parse(await readFile(join(ROOT, f), 'utf8'));

const dati = {
  cfg: await leggi('data/config.json'),
  prodotti: await leggi('data/products.json'),
  categorie: await leggi('data/categories.json'),
  contenuti: await leggi('data/content.json'),
  testi: await leggi('data/texts.json'),
  materiali: await leggi('data/materiali.json'),
  tecnologie: await leggi('data/tecnologie.json'),
  macchine: await leggi('data/macchine.json'),
  corsi: await leggi('data/corsi.json'),
};
const guscio = await readFile(join(ROOT, 'index.html'), 'utf8');
const { pagine, problemi, prodotti, verticali } = generaSito(dati, guscio);
let scritti = 0;

/* la cartella si rigenera da zero: pagine di prodotti eliminati non devono
   sopravvivere e restare indicizzate */
if(!SOLO_VERIFICA && existsSync(join(ROOT, 'product'))) await rm(join(ROOT, 'product'), { recursive: true, force: true });
/* stesso motivo per i settori: uno spento o rinominato non deve sopravvivere
   sul disco e restare indicizzato */
/* stesso motivo per il Lab: un materiale tolto dai dati non deve lasciare
   la sua pagina sul disco, indicizzata e irraggiungibile dal sito */
if(!SOLO_VERIFICA){
  for(const sez of ['materiali','tecnologie','macchine','academy','demo']){
    const dir = join(ROOT, sez);
    if(existsSync(dir)) await rm(dir, { recursive: true, force: true });
  }
}
if(!SOLO_VERIFICA){
  for(const v of verticali){
    const dir = join(ROOT, 'business', String(v && v.id || ''));
    if(v && v.id && existsSync(dir)) await rm(dir, { recursive: true, force: true });
  }
}

for(const [file, html] of Object.entries(pagine)){
  if(!SOLO_VERIFICA){
    const dest = join(ROOT, file);
    await mkdir(dirname(dest), { recursive: true });
    await writeFile(dest, html, 'utf8');
  }
  scritti++;
}
console.log(`\n  Pagine ${SOLO_VERIFICA ? 'verificate' : 'generate'}: ${scritti}`);
console.log(`  Prodotti: ${prodotti.filter(x => !x.hidden).length} visibili su ${prodotti.length}`);
if(problemi.length){
  console.log('\n  Problemi:');
  problemi.forEach(x => console.log('   ✖ ' + x));
  process.exit(1);
}
console.log('  Nessun problema.\n');
