/* PAGINE LEGALI (lancio)

   Genera legale/<pagina>/index.html: Privacy, Cookie, Condizioni di vendita,
   Spedizioni e resi, Dati aziendali. Prima non esistevano: nel piè di pagina
   «Privacy · Termini» era solo testo.

   - I dati aziendali e di spedizione arrivano da data/config.json
     (datiLegali, spedizione) e si modificano dall'Admin. assets/js/legale.js
     li rilegge a ogni apertura, quindi un aggiornamento dall'Admin compare
     subito. Un campo vuoto mostra «in corso di attribuzione» / «da definire»:
     mai un dato inventato.
   - I testi seguono la normativa italiana (Codice del Consumo, GDPR), ma
     NON sostituiscono il parere di un professionista: vanno fatti rivedere
     dal commercialista o da un legale prima del lancio.

   Uso: node scripts/legal-pages.mjs            (genera)
        node scripts/legal-pages.mjs --verifica (controlla che siano aggiornate) */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

const cfg = JSON.parse(readFileSync('data/config.json', 'utf8'));
const man = JSON.parse(readFileSync('assets/css/ingly.manifest.json', 'utf8'));
const D = cfg.datiLegali || {};
const S = cfg.spedizione || {};

const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const vuoto = v => v === null || v === undefined || String(v).trim() === '';
/* un campo: scritto ora, ricontrollato da legale.js a ogni apertura */
const f = (chiave, seVuoto = 'in corso di attribuzione', opt = {}) => {
  const [src, k] = chiave.split('.');
  const v = (src === 'd' ? D : S)[k];
  const testo = vuoto(v) ? seVuoto : (opt.euro ? '€ ' + Number(v).toFixed(2).replace('.', ',') : String(v));
  return `<span data-legale="${chiave}" data-vuoto="${esc(seVuoto)}"${opt.euro ? ' data-euro' : ''}${vuoto(v) ? ' class="legale-vuoto"' : ''}>${esc(testo)}</span>`;
};
const titolare = () => `${f('d.ragioneSociale', 'INGLY DESIGN (ragione sociale in corso di definizione)')} — sede: ${f('d.sede', 'da definire')}${vuoto(D.indirizzo) ? '' : ', ' + f('d.indirizzo', '')} — P.IVA ${f('d.piva')} — email ${f('d.email', 'da definire')} — PEC ${f('d.pec')}`;

export const PAGINE = [
  {
    slug: 'dati-aziendali', titolo: 'Dati aziendali', breve: 'Dati aziendali',
    corpo: () => `
<p>Informazioni obbligatorie ai sensi dell'art. 35 del D.P.R. 633/1972 e dell'art. 7 del D.Lgs. 70/2003.</p>
<dl class="legale-dati">
 <dt>Nome commerciale</dt><dd>${f('d.nomeCommerciale', 'INGLY DESIGN')}</dd>
 <dt>Ragione sociale</dt><dd>${f('d.ragioneSociale', 'in corso di definizione')}</dd>
 <dt>Forma giuridica</dt><dd>${f('d.formaGiuridica', 'in corso di definizione')}</dd>
 <dt>Partita IVA</dt><dd>${f('d.piva')}</dd>
 <dt>Codice fiscale</dt><dd>${f('d.codiceFiscale')}</dd>
 <dt>Numero REA</dt><dd>${f('d.rea', 'se applicabile, in corso di attribuzione')}</dd>
 <dt>Sede</dt><dd>${f('d.sede', 'da definire')}${vuoto(D.indirizzo) ? '' : ' — ' + f('d.indirizzo', '')}</dd>
 <dt>Email</dt><dd>${f('d.email', 'da definire')}</dd>
 <dt>PEC</dt><dd>${f('d.pec')}</dd>
 <dt>Telefono / WhatsApp</dt><dd>${f('d.telefono', 'da definire')}</dd>
</dl>`
  },
  {
    slug: 'condizioni-vendita', titolo: 'Condizioni generali di vendita', breve: 'Condizioni di vendita',
    corpo: () => `
<p>Le presenti condizioni regolano la vendita a distanza dei prodotti offerti sul sito da ${titolare()} (di seguito «il Venditore»), ai sensi del D.Lgs. 206/2005 (Codice del Consumo).</p>
<h2>1. Prodotti e prezzi</h2>
<p>I prodotti sono descritti con la massima cura; le fotografie possono differire leggermente dal pezzo finito, soprattutto per i materiali naturali (venature del legno, tonalità della pelle). I prezzi sono espressi in euro e, salvo diversa indicazione, comprendono l'IVA quando dovuta. Le spese di spedizione sono indicate prima della conclusione dell'ordine.</p>
<h2>2. Come si conclude il contratto</h2>
<p>L'ordine si conclude con il pagamento con carta tramite la piattaforma sicura Stripe, oppure con l'accettazione scritta di un preventivo personalizzato inviato dal Venditore (via email o WhatsApp). Il Venditore conferma ogni ordine per email.</p>
<h2>3. Pagamento</h2>
<p>Il pagamento con carta avviene sulla pagina sicura di Stripe: il Venditore non riceve né conserva i dati della carta. Per i lavori su preventivo le modalità di pagamento sono indicate nel preventivo stesso.</p>
<h2>4. Prodotti personalizzati</h2>
<p>Molti prodotti sono realizzati su misura secondo le indicazioni del cliente (nomi, date, loghi, disegni). Prima della produzione il Venditore può inviare un'anteprima indicativa: il cliente è responsabile della correttezza dei testi e dei contenuti forniti e garantisce di averne i diritti d'uso.</p>
<h2>5. Diritto di recesso</h2>
<p>Il consumatore può recedere dal contratto senza indicarne le ragioni entro <strong>14 giorni</strong> dal ricevimento dei beni (artt. 52 e seguenti del Codice del Consumo), comunicandolo per email a ${f('d.email', 'da definire')}. Il Venditore rimborsa i pagamenti ricevuti, comprese le spese di consegna standard, entro 14 giorni dalla comunicazione; può sospendere il rimborso fino al ricevimento dei beni restituiti. Le spese dirette di restituzione sono a carico del consumatore.</p>
<p><strong>Esclusione:</strong> il diritto di recesso <strong>non si applica</strong> ai beni confezionati su misura o chiaramente personalizzati (art. 59, comma 1, lettera c, del Codice del Consumo), come gli oggetti incisi con nomi, date, loghi o disegni del cliente.</p>
<h2>6. Garanzia legale di conformità</h2>
<p>Tutti i prodotti sono coperti dalla garanzia legale di conformità di <strong>24 mesi</strong> dalla consegna (artt. 128 e seguenti del Codice del Consumo). In caso di difetto, il cliente scrive a ${f('d.email', 'da definire')} con una foto del problema: il Venditore propone riparazione, sostituzione o, se non possibile, riduzione del prezzo o rimborso.</p>
<h2>7. Spedizione</h2>
<p>Tempi, costi e modalità sono descritti nella pagina <a href="legale/spedizioni-resi/">Spedizioni e resi</a>.</p>
<h2>8. Reclami e legge applicabile</h2>
<p>Reclami e richieste: ${f('d.email', 'da definire')}. Il contratto è regolato dalla legge italiana. Per il consumatore resta competente il foro del luogo di residenza o domicilio, e resta salva la possibilità di ricorrere agli organismi di risoluzione alternativa delle controversie previsti dal Codice del Consumo.</p>`
  },
  {
    slug: 'spedizioni-resi', titolo: 'Spedizioni e resi', breve: 'Spedizioni e resi',
    corpo: () => `
<h2>Tempi</h2>
<p>Produzione: ${f('s.tempiProduzione', 'da definire — confermati per ogni ordine')}. Consegna dopo la spedizione: ${f('s.tempiConsegna', 'da definire — indicati alla conferma dell\'ordine')}. I tempi dei prodotti personalizzati vengono confermati per iscritto prima della produzione.</p>
<h2>Costi</h2>
<p>Spedizione in Italia: ${f('s.costoItalia', 'indicata prima del pagamento', { euro: true })}. Spedizione gratuita per ordini da ${f('s.sogliaGratis', 'da definire', { euro: true })}.</p>
<p>Corriere: ${f('s.corriere', 'indicato alla spedizione, con il numero di tracciamento')}.</p>
<h2>Spedizioni all'estero</h2>
<p>Su richiesta: scrivi a ${f('d.email', 'da definire')} con il paese di destinazione per ricevere costi e tempi.</p>
<h2>Pacco danneggiato</h2>
<p>Se il pacco arriva danneggiato, accettalo con riserva scritta al corriere e mandaci entro 48 ore una foto del pacco e del contenuto: provvediamo noi.</p>
<h2>Resi</h2>
<p>Per i prodotti <strong>non personalizzati</strong> puoi recedere entro 14 giorni dal ricevimento, come descritto nelle <a href="legale/condizioni-vendita/">Condizioni di vendita</a>. I prodotti <strong>personalizzati</strong> (incisi con nomi, date, loghi o disegni) non sono restituibili, salvo difetti coperti dalla garanzia legale di 24 mesi.</p>`
  },
  {
    slug: 'privacy', titolo: 'Informativa sulla privacy', breve: 'Privacy',
    corpo: () => `
<p>Informativa ai sensi degli artt. 13 e 14 del Regolamento (UE) 2016/679 (GDPR).</p>
<h2>Titolare del trattamento</h2>
<p>${titolare()}.</p>
<h2>Quali dati e perché</h2>
<ul>
 <li><strong>Richieste di preventivo e contatti</strong> (nome, email, telefono, contenuto della richiesta, file allegati): per rispondere e preparare l'offerta. Base giuridica: misure precontrattuali richieste dall'interessato (art. 6.1.b).</li>
 <li><strong>Ordini e pagamenti</strong>: per eseguire il contratto e adempiere agli obblighi fiscali (art. 6.1.b e 6.1.c). I dati della carta sono trattati da Stripe e non arrivano al Venditore.</li>
 <li><strong>Newsletter</strong>, solo se ti iscrivi: per inviarti novità. Base giuridica: consenso (art. 6.1.a), revocabile in ogni momento.</li>
 <li><strong>Dati tecnici di navigazione</strong> (indirizzo IP, browser) trattati dai fornitori di hosting per sicurezza e funzionamento del sito (art. 6.1.f).</li>
</ul>
<h2>Chi tratta i dati per nostro conto</h2>
<p>GitHub (hosting del sito), Cloudflare (rete di distribuzione e statistiche di visita <em>senza cookie</em>, se attive), Formspree (ricezione dei moduli), Stripe (pagamenti con carta), Meta/WhatsApp (se scegli di scriverci su WhatsApp), Google (caratteri tipografici del sito). Alcuni di questi fornitori hanno sede negli Stati Uniti: il trasferimento avviene sulla base dell'EU-U.S. Data Privacy Framework o delle clausole contrattuali standard della Commissione europea.</p>
<h2>Per quanto tempo</h2>
<p>Richieste senza ordine: fino a 24 mesi. Dati di ordini e fatture: 10 anni, come richiesto dalla legge. Newsletter: fino alla revoca del consenso.</p>
<h2>I tuoi diritti</h2>
<p>Puoi chiedere accesso, rettifica, cancellazione, limitazione, portabilità dei dati e opporti al trattamento (artt. 15–22 GDPR) scrivendo a ${f('d.email', 'da definire')}. Puoi anche proporre reclamo al Garante per la protezione dei dati personali (<a href="https://www.garanteprivacy.it" rel="noopener">garanteprivacy.it</a>).</p>`
  },
  {
    slug: 'cookie', titolo: 'Cookie e memoria del browser', breve: 'Cookie',
    corpo: () => `
<p>Questo sito <strong>non usa cookie di profilazione né cookie pubblicitari</strong>, e non usa statistiche che tracciano le persone.</p>
<h2>Cosa salva il sito nel tuo browser</h2>
<p>Solo memoria tecnica necessaria a farlo funzionare, che resta sul tuo dispositivo e non viene inviata a nessuno:</p>
<ul>
 <li>il <strong>carrello</strong> e i <strong>preferiti</strong>;</li>
 <li>la <strong>lingua</strong> e la modalità <strong>giorno/notte</strong> scelte;</li>
 <li>la chiusura di un avviso già letto.</li>
</ul>
<p>Per questi strumenti tecnici non serve il consenso (art. 122 del Codice privacy e Linee guida del Garante del 10 giugno 2021). Puoi cancellarli in ogni momento dalle impostazioni del browser.</p>
<h2>Statistiche di visita</h2>
<p>Se attive, usano Cloudflare Web Analytics, che conta le visite <strong>senza cookie</strong> e senza identificare chi naviga.</p>
<h2>Contenuti di terze parti</h2>
<p>I caratteri tipografici sono forniti da Google Fonts. I video di YouTube eventualmente presenti nelle schede prodotto sono caricati in modalità a privacy avanzata (youtube-nocookie.com). Se in futuro il sito userà strumenti che richiedono il consenso, comparirà un avviso per sceglierli prima che vengano attivati.</p>`
  }
];

const pagina = p => `<!DOCTYPE html>
<html lang="it" data-mode="light">
<head>
<base href="../../">
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(p.titolo)} — INGLY DESIGN</title>
<meta name="description" content="${esc(p.titolo)} di INGLY DESIGN, creazioni personalizzate e incisione laser.">
<link rel="canonical" href="https://www.inglydesign.it/legale/${p.slug}/">
<link rel="icon" href="favicon/favicon.svg" type="image/svg+xml">
<script>(function(){try{var m=localStorage.getItem("ingly_mode");if(m==="dark"||m==="light")document.documentElement.dataset.mode=m}catch(e){}})();</script>
<link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/ingly.css?v=${man.v}">
<style>
 html,body{background:var(--brand-bg);color:var(--brand-ink)}
 .legale-testa{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 16px;border-bottom:1px solid var(--brand-border)}
 .legale-testa img{height:34px;width:auto}
 .legale-wrap{max-width:780px;margin:0 auto;padding:32px 16px 80px;line-height:1.65;font-size:16px}
 .legale-wrap h1{margin:0 0 8px}
 .legale-wrap h2{font-size:clamp(1.25rem,1rem + 1vw,1.6rem)!important;margin:32px 0 8px}
 .legale-wrap a{color:inherit;text-decoration:underline;text-underline-offset:3px}
 .legale-agg{color:var(--brand-muted);font-size:14px;margin-bottom:24px}
 .legale-vuoto{background:rgba(197,164,109,.18);padding:0 4px;border-radius:4px}
 .legale-dati{display:grid;grid-template-columns:minmax(140px,max-content) 1fr;gap:8px 20px;margin:20px 0}
 .legale-dati dt{font-weight:600}.legale-dati dd{margin:0}
 .legale-nav{display:flex;flex-wrap:wrap;gap:8px 16px;margin-top:48px;padding-top:20px;border-top:1px solid var(--brand-border);font-size:14px}
 .legale-nav a[aria-current]{font-weight:700;text-decoration:none}
 .legale-nota{margin-top:24px;font-size:13px;color:var(--brand-muted)}
 @media(max-width:480px){.legale-dati{grid-template-columns:1fr;gap:2px}.legale-dati dd{margin-bottom:10px}}
</style>
</head>
<body>
<header class="legale-testa">
 <a href="./" aria-label="INGLY DESIGN — torna alla Home"><img src="assets/images/ingly-wordmark-dark.svg" alt="INGLY DESIGN" width="1597" height="602"></a>
 <a class="btn btn-ghost" href="./">Torna al sito</a>
</header>
<main class="legale-wrap page active">
 <h1>${esc(p.titolo)}</h1>
 <p class="legale-agg">Ultimo aggiornamento: ${f('d.aggiornato', 'da definire')}</p>
 ${p.corpo().trim()}
 <nav class="legale-nav" aria-label="Pagine legali">
  ${PAGINE.map(x => `<a href="legale/${x.slug}/"${x.slug === p.slug ? ' aria-current="page"' : ''}>${esc(x.breve)}</a>`).join('\n  ')}
 </nav>
</main>
<script src="assets/js/legale.js" defer></script>
</body>
</html>
`;

export function genera() { return PAGINE.map(p => ({ file: `legale/${p.slug}/index.html`, html: pagina(p) })); }

if (import.meta.url === `file://${process.argv[1]}`) {
  const verifica = process.argv.includes('--verifica');
  let diversi = 0;
  for (const { file, html } of genera()) {
    const attuale = existsSync(file) ? readFileSync(file, 'utf8') : '';
    if (attuale === html) continue;
    diversi++;
    if (verifica) { console.error('✖ da rigenerare: ' + file); continue; }
    mkdirSync(file.replace(/\/index\.html$/, ''), { recursive: true });
    writeFileSync(file, html);
  }
  if (verifica && diversi) { console.error('Esegui: npm run build'); process.exit(1); }
  console.log(`✔ pagine legali: ${PAGINE.length} (${verifica ? 'aggiornate' : diversi + ' scritte'})`);
}
