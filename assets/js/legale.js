/* PAGINE LEGALI — riempie i dati aziendali da data/config.json.

   Le pagine sono HTML statico (Google le legge così), con i dati scritti al
   momento della generazione. Questo script li rilegge a ogni apertura: se nel
   frattempo il titolare ha aggiornato P.IVA, PEC o costi di spedizione
   dall'Admin, la pagina li mostra subito, senza rigenerare nulla.

   Un campo vuoto mostra il testo di data-vuoto («in corso di attribuzione»,
   «da definire»): mai un dato inventato. Script classico, nessuna dipendenza. */
(function () {
  var base = document.querySelector('base');
  var url = new URL('data/config.json', base ? base.href : location.href);
  url.searchParams.set('v', Date.now());
  fetch(url.href).then(function (r) { return r.ok ? r.json() : null; }).then(function (c) {
    if (!c) return;
    var fonti = { d: c.datiLegali || {}, s: c.spedizione || {} };
    document.querySelectorAll('[data-legale]').forEach(function (el) {
      var parti = el.getAttribute('data-legale').split('.');
      var v = (fonti[parti[0]] || {})[parti[1]];
      var vuoto = v === null || v === undefined || String(v).trim() === '';
      if (el.hasAttribute('data-euro') && !vuoto) v = '€ ' + Number(v).toFixed(2).replace('.', ',');
      el.textContent = vuoto ? (el.getAttribute('data-vuoto') || 'da definire') : String(v);
      el.classList.toggle('legale-vuoto', vuoto);
    });
  }).catch(function () { /* restano i dati scritti nella pagina */ });
})();
