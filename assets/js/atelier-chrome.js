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
    let position = 0;
    let timer = null;
    function language() {
      return document.getElementById('langEN')?.classList.contains('on') ? 'en' : 'it';
    }
    function update() {
      message.textContent = captions[language()][position];
      close.setAttribute('aria-label', language() === 'en' ? 'Dismiss announcements' : 'Chiudi gli avvisi');
    }
    /* Lo scostamento serve solo a un header fisso o sticky, che altrimenti
       finirebbe sotto la barra avvisi. Con l'header in flusso (pages.css lo
       rende `relative`) la barra lo spinge già da sola: aggiungere `top`
       lo faceva scendere sopra il contenuto — 76px su telefono, sopra il
       percorso di navigazione e il titolo del prodotto. */
    function alignHeader() {
      const pos = getComputedStyle(nav).position;
      const off = (pos === 'fixed' || pos === 'sticky') && !bar.hidden ? bar.getBoundingClientRect().height : 0;
      nav.style.top = off + 'px';
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
    window.addEventListener('resize', alignHeader, { passive: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true });
  else init();
})();
