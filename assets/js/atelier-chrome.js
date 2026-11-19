/* INGLY ATELIER / compact, accessible announcement bar
   Zero impact on cart, navigation router or admin state. */
(() => {
  function init() {
    const bar = document.querySelector('.topbar');
    const message = document.getElementById('atelierAnnouncement');
    const close = document.getElementById('atelierAnnouncementClose');
    const nav = document.getElementById('nav');
    if (!bar || !message || !close || !nav) return;

    const captions = {
      it: [
        'Spedizione gratuita in Italia sopra €79',
        'Prova grafica inclusa nei progetti personalizzati',
        'Personalizzazioni per privati e aziende'
      ],
      en: [
        'Free shipping in Italy over €79',
        'Artwork preview included with custom projects',
        'Personalization for people and businesses'
      ]
    };
    /* Stagione: dal 15 novembre al 24 dicembre il primo avviso porta ai
       regali di Natale; poi sparisce da solo, senza toccare il codice. */
    const oggi = new Date();
    const mese = oggi.getMonth(), giorno = oggi.getDate();
    if ((mese === 10 && giorno >= 15) || (mese === 11 && giorno <= 24)) {
      /* 7 giorni lavorativi + spedizione: fino al 9 dicembre si arriva prima di Natale */
      const inTempo = mese === 10 || giorno <= 9;
      captions.it.unshift({ testo: inTempo ? 'Regali di Natale personalizzati: ordina entro il 9 dicembre →' : 'Regali di Natale personalizzati: scopri le idee →', href: 'collezioni/natale/' });
      captions.en.unshift({ testo: inTempo ? 'Personalised Christmas gifts: order by 9 December →' : 'Personalised Christmas gifts: see the ideas →', href: 'collezioni/natale/' });
    }
    let position = 0;
    let timer = null;
    function language() {
      return document.getElementById('langEN')?.classList.contains('on') ? 'en' : 'it';
    }
    function update() {
      const voce = captions[language()][position];
      if (voce && typeof voce === 'object') {
        const link = document.createElement('a');
        link.href = voce.href;
        link.textContent = voce.testo;
        link.className = 'atelier-announcement__link';
        message.replaceChildren(link);
      } else {
        message.textContent = voce;
      }
      close.setAttribute('aria-label', language() === 'en' ? 'Dismiss announcements' : 'Chiudi gli avvisi');
    }
    /* Lo spostamento serve solo a un header «fixed», che non occupa spazio
       nella pagina. Da quando header e barra annunci stanno nel flusso
       (relative/sticky) lo spostamento si sommava alla loro posizione: una
       fascia vuota sopra l'header e, su mobile, l'header sopra il titolo. */
    function alignHeader() {
      const fisso = getComputedStyle(nav).position === 'fixed';
      nav.style.top = fisso ? (bar.hidden ? 0 : bar.getBoundingClientRect().height) + 'px' : '';
    }
    try {
      if (sessionStorage.getItem('ingly_atelier_announcement_hidden') === '1') bar.hidden = true;
    } catch (_) {}

    update();
    alignHeader();
    if (!bar.hidden) {
      timer = window.setInterval(() => {
        position = (position + 1) % captions.it.length;
        update();
      }, 6500);
    }
    close.addEventListener('click', () => {
      bar.hidden = true;
      alignHeader();
      if (timer) window.clearInterval(timer);
      try { sessionStorage.setItem('ingly_atelier_announcement_hidden', '1'); } catch (_) {}
    });
    document.getElementById('langIT')?.addEventListener('click', () => queueMicrotask(update));
    document.getElementById('langEN')?.addEventListener('click', () => queueMicrotask(update));
    window.addEventListener('ingly:language-change', update);
    window.addEventListener('resize', alignHeader, { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
