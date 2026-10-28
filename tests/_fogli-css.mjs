/* L'ordine dei fogli di stile, dopo l'unione in assets/css/ingly.css.
   index.html carica un solo file; l'ordine dei sorgenti (chi vince su chi)
   sta in assets/css/ingly.manifest.json, scritto da scripts/css-bundle.mjs.
   test-css-bundle.mjs garantisce che bundle, manifest e HTML coincidano. */
import { readFileSync } from 'fs';
const man = JSON.parse(readFileSync('assets/css/ingly.manifest.json', 'utf8'));
const html = readFileSync('index.html', 'utf8');
const pieno = f => (String(f).startsWith('assets/') ? String(f) : 'assets/css/' + f).split('?')[0];
/** i fogli caricati dalla vetrina, nell'ordine in cui si applicano */
export const FOGLI = man.ordine;
/** il bundle è davvero caricato da index.html, con la versione attuale */
export const bundleCaricato = html.includes(`href="assets/css/ingly.min.css?v=${man.v}"`);
export const caricato = f => bundleCaricato && FOGLI.includes(pieno(f));
export const posizione = f => FOGLI.indexOf(pieno(f));
export const ultimo = () => FOGLI[FOGLI.length - 1];
