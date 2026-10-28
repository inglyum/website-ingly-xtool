/* ============ SERVICE WORKER — INGLY DESIGN ============
   Strategia:
   - CSS / JS → Network-first con fallback cache (il deploy deve SEMPRE arrivare)
   - JSON data → Network-first con fallback cache (dati freschi ogni volta)
   - Foto prodotto e asset grafici modificabili → Network-first con fallback offline
   - Altre immagini/font immutabili → Cache-first
   - HTML / navigazione → Network-first con fallback offline page
   Offline page: mostrata solo se non si può caricare nessuna risorsa HTML.

   ATTENZIONE — perché CSS/JS sono network-first e NON cache-first:
   il sito si pubblica dall'Admin più volte al giorno. Con cache-first i moduli
   restavano in cache per sempre: il browser continuava a eseguire il JS vecchio
   mentre i JSON (network-first) arrivavano nuovi. Quel disallineamento fra dati
   nuovi e codice vecchio rompeva il sito e rendeva ogni deploy invisibile agli
   utenti già passati sul sito. Non riportare CSS/JS a cache-first. */

/* ATTENZIONE 2 — I PERCORSI QUI SONO RELATIVI ALLO SCOPE, NON ALLA RADICE.
   Erano scritti assoluti ('/index.html', '/assets/js/app.js'). Il sito però
   è pubblicato in una sottocartella (inglyum.github.io/website-ingly-xtool/),
   quindi quei percorsi puntavano fuori dal progetto:
     - `addAll()` fallisce TUTTO al primo percorso mancante, e il catch
       silenziava l'errore: il precache era vuoto. Misurato: zero voci
       precachate, né /index.html né /website-ingly-xtool/index.html.
     - il fallback offline `cache.match('/index.html')` non poteva mai
       corrispondere, quindi al posto della pagina usciva un «Offline» nudo.
   La cache a runtime funzionava per caso, perché i suoi controlli guardano
   il suffisso del percorso (`.json`, `.css`) e non il prefisso.
   BASE si ricava dallo scope del service worker, che è la cartella in cui
   sta questo file: giusto in sottocartella e giusto nella radice. */
const BASE = new URL('./', self.location).pathname;
const via  = p => BASE + String(p).replace(/^\/+/, '');

const CACHE_VER   = 'ingly-v19';
const CACHE_ASSETS= CACHE_VER + '-assets';
const CACHE_DATA  = CACHE_VER + '-data';
const CACHE_IMG   = CACHE_VER + '-img';

/* risorse precachate all'install */
const PRECACHE = [
  via(''),
  via('index.html'),
  via('assets/css/ingly.min.css'),
  via('assets/js/app.js'),
  via('assets/js/data-loader.js'),
  via('assets/js/main.js'),
  via('assets/js/utils.js'),
  via('assets/js/products.js'),
  via('assets/js/navigation.js'),
  via('assets/js/animations.js'),
  via('assets/js/forms.js'),
  via('assets/js/seo.js'),
  via('assets/js/lazyload.js'),
  via('assets/js/wishlist.js'),
  via('assets/js/referral.js'),
  via('assets/js/artwork.js'),
  via('manifest.webmanifest'),
  via('favicon/favicon-32.png'),
];

const DATA_URLS = [
  via('data/config.json'),
  via('data/products.json'),
  via('data/categories.json'),
  via('data/content.json'),
  via('data/social.json'),
  via('data/texts.json'),
  via('data/version.json'),
];

/* ---- Install: precache assets statici ---- */
self.addEventListener('install', e => {
  /* Una voce alla volta, non `addAll`: addAll fallisce TUTTO al primo
     percorso che non risponde, e il catch rendeva la cosa invisibile. Un
     file rinominato non deve svuotare il precache degli altri trenta. */
  e.waitUntil(
    caches.open(CACHE_ASSETS)
      .then(c => Promise.all(PRECACHE.map(u =>
        fetch(u, { cache: 'reload' })
          .then(r => (r.ok ? c.put(u, r) : null))
          .catch(() => null)
      )))
      .then(() => self.skipWaiting())
  );
});

/* ---- Activate: elimina cache vecchie ---- */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => !k.startsWith(CACHE_VER)).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* ---- Fetch: strategie per tipo risorsa ---- */
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  /* Solo richieste GET dello stesso origin (+ Google Fonts) */
  if(e.request.method !== 'GET') return;

  /* Il service worker e la versione dei dati non passano mai dalla cache:
     sono i due canali con cui il sito si accorge di un nuovo deploy. */
  if(url.pathname === via('sw.js') || url.pathname.endsWith('/version.json')) return;
  const isFont = url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com';
  if(url.origin !== self.location.origin && !isFont) return;

  /* JSON data → Network-first */
  if(DATA_URLS.some(p => url.pathname.startsWith(p)) || url.pathname.endsWith('.json')){
    e.respondWith(networkFirst(e.request, CACHE_DATA, 3000));
    return;
  }

  /* Media assegnati dall'Admin e asset del brand mantengono lo stesso URL
     dopo la pubblicazione. Cache-first li rende obsoleti indefinitamente,
     persino quando il nuovo logo SVG è già online. */
  if(/\.(webp|jpg|jpeg|png|svg|gif|ico)$/i.test(url.pathname)){
    const mutableMedia=url.pathname.startsWith(via('img/')) ||
      url.pathname.startsWith(via('assets/images/'));
    e.respondWith(mutableMedia
      ? networkFirst(e.request,CACHE_IMG,4000)
      : cacheFirst(e.request,CACHE_IMG));
    return;
  }

  /* Font Google → Cache-first */
  if(isFont){
    e.respondWith(cacheFirst(e.request, CACHE_ASSETS));
    return;
  }

  /* Font locali → Cache-first (immutabili) */
  if(/\.(woff2?|ttf)$/i.test(url.pathname)){
    e.respondWith(cacheFirst(e.request, CACHE_ASSETS));
    return;
  }

  /* CSS / JS → Network-first: un deploy deve sempre raggiungere l'utente.
     La cache resta solo come rete di sicurezza offline. */
  if(/\.(css|js)$/i.test(url.pathname)){
    e.respondWith(networkFirst(e.request, CACHE_ASSETS, 4000));
    return;
  }

  /* HTML / navigazione → Network-first con offline fallback */
  e.respondWith(networkFirst(e.request, CACHE_ASSETS, 5000, via('index.html')));
});

/* Il guscio dichiara `<base href="./">`, che è giusto quando è servito dal
   suo indirizzo. Offline però lo serviamo al posto di una rotta profonda —
   per esempio /academy — e lì `./` diventa /academy/, quindi CSS e JS
   verrebbero cercati dentro /academy/ e la pagina resterebbe bianca.
   Nel fallback la base va scritta assoluta. */
async function conBaseAssoluta(res){
  try{
    const tipo = res.headers.get('Content-Type') || '';
    if(!/text\/html/i.test(tipo)) return res;
    const testo = await res.text();
    return new Response(
      testo.replace(/<base href="[^"]*">/i, '<base href="' + BASE + '">'),
      { status: res.status, statusText: res.statusText, headers: res.headers }
    );
  }catch(e){ return res }
}

/* Cache-first: prova cache, poi rete (aggiorna cache) */
async function cacheFirst(req, cacheName){
  const cache = await caches.open(cacheName);
  const cached = await cache.match(req);
  if(cached) return cached;
  try{
    const fresh = await fetch(req);
    if(fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  }catch(e){ return new Response('Offline', {status: 503}) }
}

/* Network-first: prova rete entro timeout, poi cache */
async function networkFirst(req, cacheName, timeout=4000, fallback=null){
  const cache = await caches.open(cacheName);
  try{
    const ctrl = new AbortController();
    const id = setTimeout(() => ctrl.abort(), timeout);
    const fresh = await fetch(req, {signal: ctrl.signal});
    clearTimeout(id);
    if(fresh.ok) cache.put(req, fresh.clone());
    return fresh;
  }catch(e){
    const cached = await cache.match(req);
    if(cached) return cached;
    if(fallback){
      /* ignoreSearch: la pagina salvata è `index.html`, la richiesta può
         portarsi dietro `?p=/shop` o `?v=...` e senza questo non
         corrisponderebbe mai */
      const fb = await cache.match(fallback, {ignoreSearch:true});
      if(fb) return await conBaseAssoluta(fb);
    }
    return new Response('<h1>Offline</h1>', {status: 503, headers:{'Content-Type':'text/html'}});
  }
}
