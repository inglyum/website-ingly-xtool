/* PAGINA PILASTRO «MONDO xTOOL» — inglydesign.it/xtool/
   (richiesta del titolare, 2026-11-28: una parte xTool completa e ben
   posizionata, come quella dei colleghi host xTool Squad).

   Una pagina sola che risponde a chi cerca «xTool Palermo», «xTool Sicilia»,
   «demo xTool», «corso xTool», «assistenza xTool Catania/Messina/Calabria»,
   «xTool Studio»: macchine in laboratorio, demo gratuita, corsi, assistenza,
   acquisto assistito, zone servite, gamma attuale, domande frequenti, e
   collegamenti verso tutte le pagine di dettaglio (macchine, demo, corsi,
   assistenza). Dati strutturati: attività locale con servizi e corsi,
   elenco macchine, FAQ, percorso.

   Tutto arriva dai dati (Admin): macchine.json, corsi.json, config.json.
   Niente prezzi, sconti, tempi o recensioni inventati: le recensioni stanno
   sul profilo host ufficiale xTool, a cui si rimanda.

   Uso: node scripts/mondo-xtool.mjs            (genera)
        node scripts/mondo-xtool.mjs --verifica (controlla che sia aggiornata) */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';

export const FILE = 'xtool/index.html';
const J = f => JSON.parse(readFileSync(f, 'utf8'));
const cfg = J('data/config.json'), mac = J('data/macchine.json'), cor = J('data/corsi.json');
const man = J('assets/css/ingly.manifest.json');
const esc = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const it = v => (v && typeof v === 'object') ? (v.it || v.en || '') : (v || '');
const dom = String((cfg.seo && cfg.seo.dominio) || 'https://www.inglydesign.it').replace(/\/+$/, '');
const url = dom + '/xtool/';
const tel = String((cfg.datiLegali && cfg.datiLegali.telefono) || '+39 329 690 4627');
const email = String(cfg.email || 'inglydesign@gmail.com');
const wa = String(cfg.whatsapp || 'https://wa.me/393296904627').split('?')[0];
const waDemo = wa + '?text=' + encodeURIComponent('Ciao INGLY DESIGN, vorrei prenotare una demo gratuita xTool. Macchina: … Cosa vorrei realizzare: …');
const prenota = String((cfg.demo && cfg.demo.bookingUrl) || 'https://support.xtool.com/demo-room/host-instruction?id=2528');
const SQUAD = 'https://support.xtool.com/xtool-squad';
const SHOP = 'https://www.xtool.eu/';

const valido = m => m && /^[a-z0-9-]+$/.test(m.id) && m.stato !== 'bozza' && m.stato !== 'archiviato';
const modelli = (mac.catalogo || []).filter(valido);
const inLab = modelli.filter(m => m.inOfficina).sort((a, b) => ((a.demo && a.demo.ordine) || 99) - ((b.demo && b.demo.ordine) || 99));
const gamma = modelli.filter(m => !m.inOfficina);
const corsi = (cor.corsi || []).filter(c => c && /^[a-z0-9-]+$/.test(c.id) && c.stato !== 'bozza' && c.stato !== 'archiviato');
const corsoDi = id => corsi.find(c => c.macchina === id);
const foto = m => {
  const g = (m.galleria || []).find(x => x && x.src && !/^https?:/.test(x.src) && existsSync(x.src));
  if (g) return g.src;
  const f = 'img/xtool-' + m.id + '.webp';
  return existsSync(f) ? f : 'assets/images/xtool-lab-default.svg';
};
const tag = m => it(m.demo && m.demo.tag) || it(m.ruolo);

const SICILIA = ['Palermo', 'Catania', 'Messina', 'Trapani', 'Agrigento', 'Siracusa', 'Ragusa', 'Caltanissetta', 'Enna'];
const CALABRIA = ['Reggio Calabria', 'Cosenza', 'Catanzaro', 'Crotone', 'Vibo Valentia'];

const SERVIZI = [
  ['Demo gratuita', 'Vedi la macchina lavorare su un tuo pezzo, in laboratorio a Palermo oppure online, prima di scegliere. Si prenota dalla Demo Room di xTool Support.'],
  ['Corsi pratici', 'Su ogni macchina che abbiamo in laboratorio: installazione, xTool Studio, materiali e parametri, fino al primo pezzo da vendere.'],
  ['Test sui materiali', 'Proviamo i tuoi materiali sulla macchina giusta e ti diamo le impostazioni adatte.'],
  ['Installazione e messa in servizio', 'Montaggio, collegamento, aspirazione e primo avvio della macchina nuova, hardware e software.'],
  ['Manutenzione e riparazione', 'Diagnosi, manutenzione e sostituzione dei pezzi con ricambi originali xTool.'],
  ['Acquisto assistito', 'Ti aiutiamo a scegliere modello, moduli e accessori giusti per il tuo lavoro. L’acquisto si fa sullo shop ufficiale xTool.'],
];

const FAQ = [
  ['Dove posso provare una macchina xTool in Sicilia?', 'Nel laboratorio INGLY DESIGN a Palermo, con una demo gratuita: la prenoti dalla Demo Room di xTool Support o ci scrivi su WhatsApp. In laboratorio ci sono ' + inLab.map(m => it(m.n)).join(', ') + '.'],
  ['Fate corsi sulle macchine xTool?', 'Sì: un corso pratico per ogni macchina che abbiamo in laboratorio, in officina a Palermo oppure online. Durata e calendario si concordano in base a quello che ti serve.'],
  ['Seguite anche Catania, Messina e la Calabria?', 'Sì. Il laboratorio è a Palermo e seguiamo clienti a Catania, Messina, in tutta la Sicilia e in Calabria: demo e corsi anche online, assistenza con ritiro o spedizione della macchina.'],
  ['Vendete le macchine xTool?', 'No: le macchine si acquistano sullo shop ufficiale xTool. Noi ti aiutiamo a scegliere il modello giusto, con una demo, un test sui tuoi materiali o un consiglio, e poi ti seguiamo con corsi e assistenza.'],
  ['Cos’è xTool Squad?', 'È il programma ufficiale di xTool con cui gli host locali offrono demo, test sui materiali, formazione, installazione e assistenza. INGLY DESIGN è host xTool Squad a Palermo.'],
  ['Quale xTool scegliere per iniziare?', 'Dipende da cosa vuoi realizzare e su quali materiali. Il modo più semplice per deciderlo è una demo gratuita: porti un’idea o un pezzo e lo provi sulle macchine che abbiamo in laboratorio.'],
  ['Cos’è xTool Studio e lo insegnate?', 'È il software di xTool con cui si preparano e si avviano i lavori. Lo usiamo ogni giorno e lo spieghiamo in tutti i corsi, dal primo file al pezzo finito.'],
  ['Dove leggo le recensioni?', 'Sul nostro profilo di host nel sito di assistenza ufficiale xTool, dove i clienti lasciano la recensione dopo la demo o il servizio.'],
];

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['LocalBusiness', 'ProfessionalService'], '@id': url + '#xtool-lab',
      name: 'INGLY DESIGN — xTool Lab Palermo, host xTool Squad', url,
      description: 'Demo gratuite, corsi, test sui materiali, installazione, manutenzione e riparazione delle macchine xTool a Palermo, in Sicilia e in Calabria.',
      telephone: tel.replace(/\s+/g, ''), email,
      image: dom + '/assets/images/xtool-authorized-service-centre-premium.svg',
      address: { '@type': 'PostalAddress', addressLocality: 'Palermo', addressRegion: 'Sicilia', addressCountry: 'IT' },
      areaServed: [...['Palermo', 'Catania', 'Messina', 'Reggio Calabria'].map(n => ({ '@type': 'City', name: n })),
        { '@type': 'AdministrativeArea', name: 'Sicilia' }, { '@type': 'AdministrativeArea', name: 'Calabria' }, { '@type': 'Country', name: 'Italia' }],
      brand: { '@type': 'Brand', name: 'xTool' },
      knowsAbout: ['xTool', 'xTool Studio', 'incisione laser', 'taglio laser', 'laser CO2', 'laser a diodo', 'stampa UV', 'Print & Cut'],
      makesOffer: SERVIZI.map(([n, d]) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: n + ' xTool', description: d, areaServed: ['Sicilia', 'Calabria'] } })),
      hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Corsi xTool', itemListElement: corsi.map(c => ({ '@type': 'Offer', itemOffered: { '@type': 'Course', name: it(c.n), description: it(c.sommario), url: dom + '/academy/' + c.id, provider: { '@type': 'Organization', name: 'INGLY DESIGN', sameAs: dom } } })) },
      sameAs: [prenota, ...Object.values(cfg.social || {}).filter(u => /^https:\/\//.test(u) && !/wa\.me/.test(u))]
    },
    { '@type': 'ItemList', name: 'Macchine xTool nel laboratorio INGLY DESIGN', itemListElement: inLab.map((m, i) => ({ '@type': 'ListItem', position: i + 1, name: it(m.n), url: dom + '/macchine/' + m.id })) },
    { '@type': 'FAQPage', mainEntity: FAQ.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) },
    { '@type': 'BreadcrumbList', itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: dom + '/' },
      { '@type': 'ListItem', position: 2, name: 'Mondo xTool', item: url }] }
  ]
};

const carta = m => {
  const c = corsoDi(m.id);
  return `<li class="mx-mac">
   <img src="${esc(foto(m))}" alt="${esc(it(m.n))} nel laboratorio INGLY DESIGN a Palermo" width="320" height="240" loading="lazy" decoding="async">
   <div><h3>${esc(it(m.n))}</h3><p>${esc(tag(m))}</p>
   <p class="mx-link"><a href="macchine/${esc(m.id)}">Scheda</a> · <a href="demo">Demo gratuita</a>${c ? ` · <a href="academy/${esc(c.id)}">Corso</a>` : ''} · <a href="assistenza-xtool-palermo/">Assistenza</a></p></div>
  </li>`;
};

export function genera() {
  return `<!DOCTYPE html>
<html lang="it" data-mode="dark">
<head>
<base href="../">
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>xTool in Sicilia: demo gratis, corsi e assistenza a Palermo | INGLY DESIGN</title>
<meta name="description" content="Mondo xTool di INGLY DESIGN, host xTool Squad a Palermo: demo gratuite, corsi su ogni macchina, test materiali e assistenza in Sicilia e Calabria.">
<link rel="canonical" href="${esc(url)}">
<meta property="og:type" content="website"><meta property="og:url" content="${esc(url)}">
<meta property="og:title" content="Mondo xTool a Palermo: demo, corsi e assistenza — INGLY DESIGN">
<meta property="og:description" content="Prova le xTool gratis, impara a usarle e falle assistere da un host xTool Squad: Palermo, Catania, Messina, Sicilia e Calabria.">
<meta property="og:image" content="${esc(dom)}/assets/images/og-image.jpg">
<link rel="icon" type="image/png" sizes="32x32" href="favicon/favicon-32.png">
<script>(function(){try{var m=localStorage.getItem("ingly_mode");if(m==="dark"||m==="light")document.documentElement.dataset.mode=m;var a=localStorage.getItem("ingly_atmo");if(a&&/^[a-z]+$/.test(a)&&a!=="aurora")document.documentElement.setAttribute("data-atmosfera",a)}catch(e){}})();</script>
<link rel="stylesheet" href="assets/css/ingly.min.css?v=${man.v}">
<script type="application/ld+json">${JSON.stringify(schema)}</script>
<style>
 html,body{color:var(--rs-ink)}
 .mx-testa{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 16px;border-bottom:1px solid var(--rs-line)}
 .mx-testa img{height:34px;width:auto}
 .mx-wrap{max-width:1120px;margin:0 auto;padding:28px 16px 80px;line-height:1.65;font-size:16.5px}
 .mx-wrap h1{margin:8px 0 14px;font-size:clamp(2.1rem,1.4rem + 3vw,3.6rem)!important;line-height:1.08}
 .mx-wrap h2{font-size:clamp(1.4rem,1rem + 1.3vw,2rem)!important;margin:56px 0 14px}
 .mx-wrap h3{margin:0 0 4px;font-size:1.1rem}
 .mx-wrap a{color:inherit;text-underline-offset:3px}
 .mx-lead{font-size:18px;color:var(--rs-muted);max-width:66ch}
 .mx-cta{display:flex;flex-wrap:wrap;gap:12px;margin:24px 0 8px}
 .mx-griglia{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:14px}
 .mx-griglia>li,.mx-box{padding:18px 18px 20px;border:1px solid var(--rs-line);border-radius:18px}
 .mx-griglia b{display:block;margin-bottom:4px}
 .mx-griglia span{color:var(--rs-muted);font-size:.95rem}
 .mx-macchine{list-style:none;padding:0;margin:0;display:grid;gap:12px}
 .mx-mac{display:grid;grid-template-columns:150px minmax(0,1fr);gap:18px;align-items:center;padding:12px;border:1px solid var(--rs-line);border-radius:18px}
 .mx-mac img{width:150px;height:112px;object-fit:contain;background:#fff;border-radius:12px;padding:6px}
 .mx-mac p{margin:0;color:var(--rs-muted)}
 .mx-mac .mx-link{margin-top:6px;font-size:.95rem;color:var(--rs-ink)}
 .mx-zone{display:flex;flex-wrap:wrap;gap:8px;list-style:none;padding:0;margin:8px 0 14px}
 .mx-zone li{padding:6px 12px;border:1px solid var(--rs-line);border-radius:999px;font-size:14.5px}
 .mx-passi{counter-reset:p;list-style:none;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:12px}
 .mx-passi li{counter-increment:p;padding:16px 16px 16px 58px;position:relative;border:1px solid var(--rs-line);border-radius:16px}
 .mx-passi li::before{content:counter(p);position:absolute;left:16px;top:16px;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:var(--rs-gold);color:var(--rs-on-gold);font-weight:700;font-size:14px}
 .mx-faq details{border-bottom:1px solid var(--rs-line);padding:14px 0}
 .mx-faq summary{cursor:pointer;font-weight:600}
 .mx-faq p{color:var(--rs-muted);margin:8px 0 0}
 .mx-piede{margin-top:56px;padding-top:20px;border-top:1px solid var(--rs-line);font-size:14px;color:var(--rs-muted)}
 :root[data-mode="dark"] :is(.mx-griglia>li,.mx-box,.mx-mac,.mx-passi li){border:1px solid transparent;background:linear-gradient(180deg,rgba(255,255,255,.06),rgba(255,255,255,.02)) padding-box,var(--au-edge,linear-gradient(#ffffff22,#ffffff22)) border-box;-webkit-backdrop-filter:blur(12px);backdrop-filter:blur(12px)}
 @media(max-width:640px){.mx-mac{grid-template-columns:96px minmax(0,1fr)}.mx-mac img{width:96px;height:72px}}
</style>
</head>
<body>
<header class="mx-testa">
 <a href="./" aria-label="INGLY DESIGN — torna alla Home"><img src="assets/images/ingly-wordmark-light.svg" alt="INGLY DESIGN" width="1597" height="602"></a>
 <a class="btn btn-ghost" href="./#lab">Torna al sito</a>
</header>
<main class="mx-wrap page active">
 <nav aria-label="Percorso" style="font-size:14px;margin-bottom:14px"><a href="./">Home</a> / Mondo xTool</nav>
 <h1>xTool a Palermo, in Sicilia e in Calabria: demo gratuite, corsi e assistenza</h1>
 <p class="mx-lead">INGLY DESIGN è host di <a href="${SQUAD}" target="_blank" rel="noopener noreferrer">xTool Squad</a>, il programma ufficiale di xTool. Nel nostro laboratorio di Palermo lavoriamo ogni giorno con ${inLab.length} macchine xTool: puoi provarle gratis, imparare a usarle con un corso pratico e avere un’assistenza vicina prima e dopo l’acquisto.</p>
 <div class="mx-cta">
  <a class="btn btn-primary" href="${esc(prenota)}" target="_blank" rel="noopener noreferrer">Prenota una demo gratuita</a>
  <a class="btn btn-ghost" href="${esc(waDemo)}" target="_blank" rel="noopener noreferrer">Scrivici su WhatsApp</a>
  <a class="btn btn-ghost" href="academy">Vedi i corsi</a>
 </div>

 <h2>Le macchine xTool nel nostro laboratorio</h2>
 <p>Le stesse che usiamo per produrre: per ognuna trovi la scheda, la demo gratuita, il corso e l’assistenza.</p>
 <ul class="mx-macchine">
  ${inLab.map(carta).join('\n  ')}
 </ul>

 <h2>Cosa facciamo come host xTool Squad</h2>
 <ul class="mx-griglia">
  ${SERVIZI.map(([n, d]) => `<li><b>${esc(n)}</b><span>${esc(d)}</span></li>`).join('\n  ')}
 </ul>

 <h2>Come funziona</h2>
 <ol class="mx-passi">
  <li><b>Raccontaci il progetto</b><br><span>Cosa vuoi realizzare, su quali materiali, per hobby o per lavoro.</span></li>
  <li><b>Provala dal vivo</b><br><span>Demo gratuita in laboratorio o online, su un tuo pezzo.</span></li>
  <li><b>Scegli con calma</b><br><span>Ti aiutiamo a scegliere modello e accessori; l’acquisto è sullo shop ufficiale xTool.</span></li>
  <li><b>Impara e produci</b><br><span>Corso pratico, installazione e assistenza quando ti serve.</span></li>
 </ol>

 <h2>Corsi xTool</h2>
 <p>Un corso pratico per ogni macchina in laboratorio, con xTool Studio, i materiali e i parametri giusti, fino al primo pezzo da vendere. In officina a Palermo oppure online.</p>
 <ul class="mx-griglia">
  ${corsi.map(c => `<li><b><a href="academy/${esc(c.id)}">${esc(it(c.n))}</a></b><span>${esc(it(c.sommario))}</span></li>`).join('\n  ')}
 </ul>

 <h2>xTool Studio</h2>
 <div class="mx-box"><p style="margin:0">xTool Studio è il software di xTool con cui si preparano e si avviano i lavori. Lo usiamo ogni giorno su tutte le macchine del laboratorio e lo spieghiamo in ogni corso: importare un file, scegliere il materiale, posizionare con la telecamera, fare i test e salvare impostazioni che danno risultati costanti.</p></div>

 <h2>Dove arriviamo</h2>
 <p>Laboratorio a Palermo; demo e corsi anche online; assistenza con ritiro o spedizione della macchina.</p>
 <p><b>Sicilia</b></p><ul class="mx-zone">${SICILIA.map(z => `<li>${esc(z)}</li>`).join('')}</ul>
 <p><b>Calabria</b></p><ul class="mx-zone">${CALABRIA.map(z => `<li>${esc(z)}</li>`).join('')}</ul>

 <h2>Il resto della gamma xTool</h2>
 <p>Modelli in vendita oggi sul sito ufficiale xTool che non abbiamo in laboratorio: ti aiutiamo comunque a capire se fanno per te e li seguiamo in assistenza.</p>
 <ul class="mx-zone">${gamma.map(m => `<li><a href="macchine/${esc(m.id)}">${esc(it(m.n))}</a></li>`).join('')}</ul>

 <h2>Recensioni</h2>
 <div class="mx-box"><p style="margin:0 0 12px">Le recensioni dei clienti sono pubblicate sul nostro profilo di host nel sito di assistenza ufficiale xTool, dove si prenotano anche le demo.</p>
 <a class="btn btn-ghost" href="${esc(prenota)}" target="_blank" rel="noopener noreferrer">Profilo e recensioni su xTool Support</a></div>

 <h2>Domande frequenti</h2>
 <div class="mx-faq">
  ${FAQ.map(([q, a]) => `<details><summary>${esc(q)}</summary><p>${esc(a)}</p></details>`).join('\n  ')}
 </div>

 <p class="mx-piede">INGLY DESIGN · host xTool Squad · Palermo, Sicilia · <a href="tel:${esc(tel.replace(/\s+/g, ''))}">${esc(tel)}</a> · <a href="mailto:${esc(email)}">${esc(email)}</a> · <a href="macchine">Macchine</a> · <a href="demo">Demo gratuita</a> · <a href="academy">Corsi</a> · <a href="assistenza-xtool-palermo/">Assistenza</a> · <a href="${SHOP}" target="_blank" rel="noopener noreferrer">Shop ufficiale xTool</a></p>
</main>
</body>
</html>
`;
}

const html = genera();
if (process.argv.includes('--verifica')) {
  if (!existsSync(FILE) || readFileSync(FILE, 'utf8') !== html) { console.error('✖ ' + FILE + ' non aggiornata: node scripts/mondo-xtool.mjs'); process.exit(1); }
  console.log('✔ ' + FILE + ' aggiornata');
} else {
  mkdirSync('xtool', { recursive: true });
  writeFileSync(FILE, html);
  console.log('✔ ' + FILE);
}
