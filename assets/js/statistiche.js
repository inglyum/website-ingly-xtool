/* ============ STATISTICHE (GoatCounter) ============
   Senza cookie e senza dati personali: non serve il banner del consenso.
   Si accende da sola quando nell'Admin (Impostazioni → Statistiche) c'è il
   codice del sito GoatCounter (config.json → analisi.goatcounter), per esempio «inglydesign», che diventa
   https://inglydesign.goatcounter.com. Codice vuoto = nessuno script caricato.

   Oltre alle pagine viste conta le azioni che portano clienti, come «eventi»
   (in GoatCounter compaiono nella sezione Events):
   - preventivo-inviato / newsletter-iscritto  (ritorno dal modulo)
   - whatsapp                                  (qualsiasi link wa.me)
   - richiesta-carrello-whatsapp / -email      (elenco di richieste)
   - anteprima-3d-usata / preventivo-da-3d     (apertura della home)
   - demo-cliccata                             (link verso la demo xTool)

   Il codice del sito non è una chiave segreta: è l'indirizzo pubblico a cui
   il browser invia il conteggio (regola 6 rispettata). */

const CODICE = /^[a-z0-9][a-z0-9-]{1,62}$/;

/* il ritorno dai moduli va letto subito: forms.js poi pulisce l'indirizzo */
const ritorno = (() => {
  try {
    const q = new URLSearchParams(location.search);
    return q.get('inviato') === '1' ? 'preventivo-inviato' : (q.get('iscritto') === '1' ? 'newsletter-iscritto' : '');
  } catch (e) { return ''; }
})();

export function codiceValido(cfg = {}) {
  const c = String((cfg && cfg.analisi && cfg.analisi.goatcounter) || '').trim().toLowerCase();
  return CODICE.test(c) ? c : '';
}

let pronto = false;
const coda = [];

export function evento(nome) {
  const n = String(nome || '').replace(/[^a-z0-9-]/gi, '').slice(0, 60);
  if (!n) return;
  if (!pronto || !window.goatcounter || typeof window.goatcounter.count !== 'function') { if (coda.length < 20) coda.push(n); return; }
  try { window.goatcounter.count({ path: n, title: n, event: true }); } catch (e) {}
}

function pagina() {
  if (!pronto || !window.goatcounter || typeof window.goatcounter.count !== 'function') return;
  try { window.goatcounter.count({ path: location.pathname + location.search }); } catch (e) {}
}

export function avvia(cfg = {}) {
  const codice = codiceValido(cfg);
  if (!codice || document.querySelector('script[data-goatcounter]')) return false;
  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.dataset.goatcounter = 'https://' + codice + '.goatcounter.com/count';
  s.addEventListener('load', () => { pronto = true; coda.splice(0).forEach(evento); });
  document.head.appendChild(s);
  if (ritorno) evento(ritorno);

  /* il sito cambia pagina senza ricaricare: ogni cambio è una pagina vista */
  let prima = location.pathname;
  addEventListener('ingly:pagina', () => { if (location.pathname !== prima) { prima = location.pathname; pagina(); } });

  /* le azioni che contano, intercettate in un punto solo */
  document.addEventListener('click', e => {
    const el = e.target && e.target.closest && e.target.closest('a,button');
    if (!el) return;
    const href = el.getAttribute('href') || '';
    if (/wa\.me\//.test(href)) evento('whatsapp');
    else if (el.dataset.action === 'checkout-wa') evento('richiesta-carrello-whatsapp');
    else if (el.dataset.action === 'checkout-email') evento('richiesta-carrello-email');
    else if (/(^|\/)demo(\/|$)/.test(href) || el.dataset.nav === 'demo' || el.dataset.arg === 'demo') evento('demo-cliccata');
  }, { capture: true, passive: true });
  const t = document.getElementById('rs3dText');
  if (t) t.addEventListener('input', () => evento('anteprima-3d-usata'), { once: true });
  const f = document.getElementById('rs3dForm');
  if (f) f.addEventListener('submit', () => evento('preventivo-da-3d'), { capture: true });
  return true;
}
