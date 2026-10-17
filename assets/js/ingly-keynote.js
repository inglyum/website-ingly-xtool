/* INGLY Keynote — testi bilingui della sezione in stile Apple della home.
   Scoped a #inglyKeynote: non tocca nient'altro della pagina.
   I testi arrivano dagli attributi data-k-it / data-k-en e vengono scritti
   con textContent, mai con innerHTML. */
(() => {
  const init = () => {
    const host = document.getElementById('inglyKeynote');
    if (!host) return;
    const root = document.documentElement;
    const apply = () => {
      const en = root.lang === 'en';
      host.querySelectorAll('[data-k-it][data-k-en]').forEach(el => {
        el.textContent = en ? el.dataset.kEn : el.dataset.kIt;
      });
    };
    apply();
    new MutationObserver(records => {
      if (records.some(r => r.attributeName === 'lang')) apply();
    }).observe(root, { attributes: true, attributeFilter: ['lang'] });
    // Una foto mancante non deve lasciare un riquadro vuoto: la tile resta solo testo.
    host.querySelectorAll('.kn-media img').forEach(img => {
      img.addEventListener('error', () => img.closest('.kn-media')?.setAttribute('hidden', ''), { once: true });
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
