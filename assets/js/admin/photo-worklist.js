/* INGLY Admin — stato reale delle fotografie del catalogo.
   Funzioni pure: l'elenco file è la fonte di verità. Nessuna fotografia
   inventata e nessuna attribuzione automatica senza conferma. */
const asPath = value => String(value || '').trim().split(/[?#]/)[0];
const external = path => /^(?:https?:)?\/\//i.test(path);
const realInventory = paths => Array.isArray(paths) ? new Set(paths.map(p => asPath(p).replace(/^img\//,''))) : null;

/** Stato: ready, gallery, missing, unknown. "gallery" richiede una nuova copertina. */
export function photoStatus(p, inventory, staged = [], deleted = []) {
  const known = realInventory(inventory);
  const queued = new Set(staged.map(asPath));
  const removed = new Set(deleted.map(asPath));
  const main = asPath(p.img || ('img/' + p.id + '.webp'));
  const gallery = [...new Set((Array.isArray(p.gallery) ? p.gallery : []).map(asPath).filter(Boolean))];
  const exists = path => {
    if (!path || removed.has(path)) return false;
    if (queued.has(path)) return true;
    if (external(path) || path.startsWith('assets/')) return null; // non verificato localmente
    if (!path.startsWith('img/')) return null;
    return known ? known.has(path.slice(4)) : null;
  };
  const mainExists = exists(main);
  const galleryFound = gallery.filter(path => exists(path) === true);
  const externalMedia = [main,...gallery].some(path => exists(path) === null);
  const state = mainExists === true ? 'ready'
    : galleryFound.length ? 'gallery'
    : externalMedia ? 'unknown' : 'missing';
  return { id:p.id, state, main, mainExists, galleryFound,
    usable: state === 'ready' || state === 'gallery',
    visible: p.hidden !== true };
}

/** Priorità: schede pubbliche senza alcuna foto, poi con sola gallery,
    infine le bozze / schede nascoste. */
export function buildPhotoQueue(products = [], inventory, staged = [], deleted = []) {
  return products.map(p => ({ product:p, ...photoStatus(p, inventory, staged, deleted) }))
    .filter(x => x.state === 'missing' || x.state === 'gallery')
    .sort((a,b) => {
      const priority = x => (x.visible ? 0 : 2) + (x.state === 'gallery' ? 1 : 0);
      return priority(a) - priority(b) || Number(a.id)-Number(b.id);
    });
}
export function photoSummary(products = [], inventory, staged = [], deleted = []) {
  const states = products.map(p => photoStatus(p, inventory, staged, deleted));
  return {
    total: states.length,
    visible: states.filter(x=>x.visible).length,
    ready: states.filter(x=>x.state==='ready').length,
    galleryOnly: states.filter(x=>x.state==='gallery').length,
    missingAll: states.filter(x=>x.state==='missing').length,
    visibleMissingAll: states.filter(x=>x.visible && x.state==='missing').length,
    visibleNeedsCover: states.filter(x=>x.visible && (x.state==='gallery'||x.state==='missing')).length,
    unknown: states.filter(x=>x.state==='unknown').length,
  };
}
const csvCell = value => {
  let s = String(value == null ? '' : value);
  if (/^[\s]*[=+@-]/.test(s)) s = "'" + s; // evita formule in Excel
  return '"' + s.replace(/"/g,'""') + '"';
};
export function exportPhotoCSV(queue = []) {
  const rows = [['ID','SKU','Prodotto','Categoria','Pubblico','Stato fotografia','File previsto']];
  for(const x of queue) rows.push([
    x.id, x.product.sku || '', x.product.n?.it || x.product.n?.en || '',
    x.product.cat || '', x.visible?'si':'no',
    x.state === 'gallery' ? 'Manca cover; gallery presente' : 'Nessuna fotografia',
    x.main
  ]);
  return '\uFEFF' + rows.map(row => row.map(csvCell).join(';')).join('\r\n') + '\r\n';
}
