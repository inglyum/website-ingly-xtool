/* PAGINA «CENTRO ASSISTENZA xTOOL A PALERMO»

   Chi cerca «assistenza xTool Palermo», «riparazione laser xTool Sicilia» o
   «ricambi xTool» deve trovare una pagina fatta per quella domanda. Prima
   non c'era: l'assistenza era una riga dentro le schede macchina.

   - Telefono, email e sede arrivano da data/config.json (Admin).
   - L'elenco delle macchine arriva da data/macchine.json (Admin → Lab).
   - Niente tempi, prezzi o garanzie che non sono stati decisi: si chiede
     il modello e il problema e si risponde con un preventivo.

   Uso: node scripts/assistenza-xtool.mjs            (genera)
        node scripts/assistenza-xtool.mjs --verifica (controlla che sia aggiornata) */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

export const FILE = 'assistenza-xtool-palermo/index.html';
const cfg = JSON.parse(readFileSync('data/config.json', 'utf8'));
const mac = JSON.parse(readFileSync('data/macchine.json', 'utf8'));
const man = JSON.parse(readFileSync('assets/css/ingly.manifest.json', 'utf8'));
const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dom = String((cfg.seo && cfg.seo.dominio) || 'https://www.inglydesign.it').replace(/\/+$/, '');
const url = dom + '/assistenza-xtool-palermo/';
const tel = String((cfg.datiLegali && cfg.datiLegali.telefono) || '+39 329 690 4627');
const email = String(cfg.email || 'inglydesign@gmail.com');
const wa = String(cfg.whatsapp || 'https://wa.me/393296904627').split('?')[0];
const waTesto = wa + '?text=' + encodeURIComponent('Ciao INGLY DESIGN, ho bisogno di assistenza per la mia xTool. Modello: … Problema: …');
const modelli = (mac.catalogo || []).filter(m => m && /^[a-z0-9-]+$/.test(m.id) && m.stato !== 'bozza' && m.stato !== 'archiviato');
const nome = m => (m.n && (m.n.it || m.n.en)) || m.id;

const SICILIA = ['Palermo e provincia', 'Trapani', 'Agrigento', 'Caltanissetta', 'Enna', 'Catania', 'Messina', 'Siracusa', 'Ragusa'];
const SUD = ['Calabria', 'Campania', 'Puglia', 'Basilicata'];

const FAQ = [
  ['Siete un centro assistenza xTool?', 'Sì: INGLY DESIGN segue le macchine xTool a Palermo e in Sicilia, dalla diagnosi alla riparazione, con i ricambi e la messa a punto. Lavoriamo ogni giorno con le stesse macchine nel nostro laboratorio.'],
  ['Arrivo da fuori Palermo: come faccio?', 'Puoi portarci la macchina in laboratorio a Palermo oppure spedirla. Seguiamo clienti in tutta la Sicilia e nel Sud Italia: scrivici il modello e il problema e ti diciamo come procedere.'],
  ['Quali modelli seguite?', 'Tutta la gamma xTool: laser a diodo, CO₂, fibra, MOPA e UV, stampanti UV, presse e le novità come X1 e C1. L\'elenco completo è più sotto, con il link alla scheda di ogni macchina.'],
  ['Quanto costa una riparazione?', 'Dipende dal modello e dal guasto. Prima facciamo la diagnosi e ti mandiamo un preventivo: si procede solo se lo approvi.'],
  ['Posso provare una macchina prima di comprarla?', 'Sì, per le macchine che abbiamo in laboratorio organizziamo una demo: la vedi lavorare su un tuo pezzo prima di scegliere.']
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['LocalBusiness', 'ProfessionalService'],
      '@id': url + '#assistenza',
      name: 'INGLY DESIGN — Centro assistenza xTool Palermo',
      url, telephone: tel.replace(/\s+/g, ''), email,
      image: dom + '/assets/images/xtool-authorized-service-centre-premium.svg',
      address: { '@type': 'PostalAddress', addressLocality: 'Palermo', addressRegion: 'Sicilia', addressCountry: 'IT' },
      areaServed: [
        { '@type': 'City', name: 'Palermo' },
        { '@type': 'AdministrativeArea', name: 'Sicilia' },
        ...SUD.map(r => ({ '@type': 'AdministrativeArea', name: r })),
        { '@type': 'Country', name: 'Italia' }
      ],
      brand: { '@type': 'Brand', name: 'xTool' },
      knowsAbout: ['xTool', 'incisione laser', 'taglio laser', 'laser CO2', 'laser a fibra', 'laser MOPA', 'stampa UV'],
      makesOffer: ['Diagnosi e riparazione di macchine laser xTool', 'Ricambi e sostituzione componenti xTool', 'Calibrazione e messa a punto', 'Configurazione software e firmware', 'Demo e formazione', 'Vendita e pre-ordine macchine xTool']
        .map(s => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: s, areaServed: 'Sicilia' } })),
      sameAs: Object.values(cfg.social || {}).filter(u => /^https:\/\//.test(u) && !/wa\.me/.test(u))
    },
    { '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: dom + '/' },
      { '@type': 'ListItem', position: 2, name: 'Macchine', item: dom + '/macchine' },
      { '@type': 'ListItem', position: 3, name: 'Assistenza xTool Palermo', item: url }
    ] }
  ]
};

export function genera() {
  return `<!DOCTYPE html>
<html lang="it" data-mode="light">
<head>
<base href="../">
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Centro assistenza xTool a Palermo e in Sicilia: riparazioni, ricambi, demo | INGLY DESIGN</title>
<meta name="description" content="Assistenza xTool a Palermo per tutta la Sicilia e il Sud Italia: diagnosi, riparazione, ricambi, messa a punto, demo e vendita delle macchine laser xTool. Scrivici modello e problema.">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="website"><meta property="og:url" content="${esc(url)}">
<meta property="og:title" content="Centro assistenza xTool a Palermo e in Sicilia — INGLY DESIGN">
<meta property="og:description" content="Riparazioni, ricambi, demo e vendita delle macchine xTool a Palermo, in Sicilia e nel Sud Italia.">
<meta property="og:image" content="${esc(dom)}/assets/images/og-image.jpg">
<link rel="icon" type="image/png" sizes="32x32" href="favicon/favicon-32.png">
<script>(function(){try{var m=localStorage.getItem("ingly_mode");if(m==="dark"||m==="light")document.documentElement.dataset.mode=m}catch(e){}})();</script>
<link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/css/ingly.min.css?v=${man.v}">
<script type="application/ld+json">${JSON.stringify(schema)}</script>
<style>
 html,body{background:var(--brand-bg);color:var(--brand-ink)}
 .ax-testa{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 16px;border-bottom:1px solid var(--brand-border)}
 .ax-testa img{height:34px;width:auto}
 .ax-wrap{max-width:900px;margin:0 auto;padding:32px 16px 80px;line-height:1.65;font-size:16.5px}
 .ax-wrap h1{margin:0 0 12px;font-size:clamp(2rem,1.4rem + 2.6vw,3.2rem)!important;line-height:1.1}
 .ax-wrap h2{font-size:clamp(1.3rem,1rem + 1vw,1.7rem)!important;margin:40px 0 10px}
 .ax-wrap a{color:inherit;text-underline-offset:3px}
 .ax-lead{font-size:18px;color:var(--brand-muted);max-width:62ch}
 .ax-cta{display:flex;flex-wrap:wrap;gap:12px;margin:24px 0 8px}
 .ax-wrap ul:not(.ax-zone),.ax-wrap ol:not(.ax-passi){padding-left:22px}
 .ax-lista{columns:2 240px;padding-left:22px}
 .ax-zone{display:flex;flex-wrap:wrap;gap:8px;list-style:none;padding:0}
 .ax-zone li{padding:6px 12px;border:1px solid var(--brand-border);border-radius:999px;font-size:14.5px}
 .ax-passi{counter-reset:p;list-style:none;padding:0;display:grid;gap:12px}
 .ax-passi li{counter-increment:p;padding-left:44px;position:relative}
 .ax-passi li::before{content:counter(p);position:absolute;left:0;top:0;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:var(--brand-gold);color:var(--brand-action-ink);font-weight:700;font-size:14px}
 .ax-faq details{border-bottom:1px solid var(--brand-border);padding:12px 0}
 .ax-faq summary{cursor:pointer;font-weight:600}
 .ax-piede{margin-top:48px;padding-top:20px;border-top:1px solid var(--brand-border);font-size:14px;color:var(--brand-muted)}
</style>
</head>
<body>
<header class="ax-testa">
 <a href="./" aria-label="INGLY DESIGN — torna alla Home"><img src="assets/images/ingly-wordmark-dark.svg" alt="INGLY DESIGN" width="1597" height="602"></a>
 <a class="btn btn-ghost" href="macchine">Tutte le macchine</a>
</header>
<main class="ax-wrap page active">
 <nav aria-label="Percorso" style="font-size:14px;margin-bottom:18px"><a href="./">Home</a> / <a href="macchine">Macchine</a> / Assistenza xTool Palermo</nav>
 <h1>Centro assistenza xTool a Palermo e in Sicilia</h1>
 <p class="ax-lead">INGLY DESIGN è il laboratorio di Palermo che segue le macchine xTool: diagnosi, riparazione, ricambi, messa a punto, demo e vendita. Lavoriamo con clienti di tutta la Sicilia e del Sud Italia.</p>
 <div class="ax-cta">
  <a class="btn btn-primary" href="${esc(waTesto)}" target="_blank" rel="noopener noreferrer">Chiedi assistenza su WhatsApp <span class="arr">→</span></a>
  <a class="btn btn-ghost" href="mailto:${esc(email)}?subject=${encodeURIComponent('Assistenza xTool')}">Scrivi una email</a>
  <a class="btn btn-ghost" href="tel:${esc(tel.replace(/\s+/g, ''))}">${esc(tel)}</a>
 </div>

 <h2>Cosa facciamo sulle macchine xTool</h2>
 <ul>
  <li>Diagnosi e riparazione dei guasti.</li>
  <li>Ricambi e sostituzione dei componenti.</li>
  <li>Calibrazione e messa a punto: allineamento, fuoco, telecamere, parametri dei materiali.</li>
  <li>Configurazione di xTool Creative Space (XCS) e aggiornamenti firmware.</li>
  <li>Demo e formazione, in laboratorio o collegati.</li>
  <li>Vendita e pre-ordine delle macchine xTool, comprese le novità X1 e C1.</li>
 </ul>

 <h2>Come funziona</h2>
 <ol class="ax-passi">
  <li>Scrivici su WhatsApp o via email il modello della macchina e cosa succede, meglio con una foto o un breve video.</li>
  <li>Ti diciamo se si risolve a distanza o se serve vederla, e ti mandiamo un preventivo.</li>
  <li>Porti la macchina in laboratorio a Palermo, oppure ce la spedisci da qualunque parte della Sicilia o del Sud Italia.</li>
  <li>La ripariamo, la proviamo su un lavoro vero e te la riconsegniamo.</li>
 </ol>

 <h2>Le macchine xTool che seguiamo</h2>
 <ul class="ax-lista">
  ${modelli.map(m => `<li><a href="macchine/${esc(m.id)}">${esc(nome(m))}</a></li>`).join('\n  ')}
 </ul>

 <h2>Dove arriviamo</h2>
 <p>In laboratorio a Palermo e, con ritiro o spedizione, in tutta la Sicilia:</p>
 <ul class="ax-zone">${SICILIA.map(z => `<li>${esc(z)}</li>`).join('')}</ul>
 <p>Seguiamo anche clienti nel Sud Italia:</p>
 <ul class="ax-zone">${SUD.map(z => `<li>${esc(z)}</li>`).join('')}</ul>

 <h2>Domande frequenti</h2>
 <div class="ax-faq">
  ${FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n  ')}
 </div>

 <p class="ax-piede">INGLY DESIGN · Palermo, Sicilia · <a href="tel:${esc(tel.replace(/\s+/g, ''))}">${esc(tel)}</a> · <a href="mailto:${esc(email)}">${esc(email)}</a> · <a href="demo">Demo gratuita</a> · <a href="academy">Academy</a></p>
</main>
</body>
</html>
`;
}

const html = genera();
if (process.argv.includes('--verifica')) {
  if (!existsSync(FILE) || readFileSync(FILE, 'utf8') !== html) { console.error('✖ ' + FILE + ' non aggiornata: node scripts/assistenza-xtool.mjs'); process.exit(1); }
  console.log('✔ ' + FILE + ' aggiornata');
} else {
  mkdirSync('assistenza-xtool-palermo', { recursive: true });
  writeFileSync(FILE, html);
  console.log('✔ ' + FILE);
}
