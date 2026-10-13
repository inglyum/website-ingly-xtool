(function (w) {
  'use strict';
  const modules = [
    { id: 'portachiavi', label: 'Portachiavi & tag', icon: '⌁', category: 'Accessori', summary: 'Nome, forma, foro e dimensioni.' },
    { id: 'living-hinge', label: 'Living Hinge Lab', icon: '▦', category: 'Tecnica laser', summary: 'Griglie di taglio flessibili parametriche.' },
    { id: 'test-materiali', label: 'Material Test Grid', icon: '▤', category: 'Test e calibrazione', summary: 'Griglie per confrontare prove di potenza e velocità.' },
    { id: 'cake-topper', label: 'Cake Topper', icon: '✦', category: 'Feste ed eventi', summary: 'Targhe con picchetto e testo personalizzato.' }
  ];
  w.INGLY_GENERATORI_MODULES = modules;
  w.INGLY_GENERATORI_DEFAULTS = modules.map(function (m, index) {
    const names = {
      portachiavi: ['Portachiavi & tag', 'Keychains & tags', 'Accessori personalizzati'],
      'living-hinge': ['Living Hinge Lab', 'Living Hinge Lab', 'Tecnica laser'],
      'test-materiali': ['Griglia test materiali', 'Material Test Grid', 'Test e calibrazione'],
      'cake-topper': ['Cake Topper personalizzato', 'Custom Cake Topper', 'Feste ed eventi']
    };
    const descriptions = {
      portachiavi: ['Crea portachiavi, targhette e piccoli gadget con foro, forma e misure regolabili.', 'Create keychains and tags with adjustable shape, hole and dimensions.'],
      'living-hinge': ['Genera un reticolo di tagli con passo, margini e sfalsamento configurabili.', 'Generate a cut pattern with adjustable pitch, margins and row offset.'],
      'test-materiali': ['Prepara una tavola di provini etichettati per documentare i tuoi test.', 'Build a labelled test grid to document your material tests.'],
      'cake-topper': ['Personalizza una sagoma con picchetto integrato per feste e ricorrenze.', 'Personalize a topper silhouette with an integrated stake.']
    };
    return {
      id: m.id,
      modulo: m.id,
      nome: { it: names[m.id][0], en: names[m.id][1] },
      descrizione: { it: descriptions[m.id][0], en: descriptions[m.id][1] },
      categoria: names[m.id][2],
      icona: m.icon,
      attivo: true,
      ordine: index + 1
    };
  });
})(window);
