/* INGLY DESIGN — editor universale di collezioni.
   Niente API GitHub: l'Admin conserva le bozze in S e pubblica in un solo commit. */
(function (host) {
  'use strict';
  const esc = x => String(x == null ? '' : x).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const copy = x => JSON.parse(JSON.stringify(x));
  const parts = path => String(path).split('.').filter(Boolean);
  function read(obj, path) {
    return parts(path).reduce((value, key) => value == null ? undefined : value[key], obj);
  }
  function write(obj, path, value) {
    const list = parts(path);
    let node = obj;
    list.slice(0, -1).forEach(key => {
      const next = list[list.indexOf(key) + 1];
      if (!node[key] || typeof node[key] !== 'object') node[key] = /^\d+$/.test(next) ? [] : {};
      node = node[key];
    });
    node[list[list.length - 1]] = value;
  }
  function nextId(items, base) {
    const ids = new Set(items.map(x => String(x && x.id)));
    const clean = String(base || 'nuovo').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .toLowerCase().replace(/[^a-z0-9-]+/g,'-').replace(/^-+|-+$/g,'') || 'nuovo';
    let i = 1, id = clean;
    while (ids.has(id)) id = clean + '-' + (++i);
    return id;
  }
  function validate(items, schema) {
    const errors = [], ids = new Set();
    (items || []).forEach((obj, i) => {
      const name = obj && (obj.id || '#' + (i + 1));
      if (!obj || !String(obj.id || '').trim()) errors.push('Identificativo mancante in ' + name);
      else if (ids.has(String(obj.id))) errors.push('ID duplicato: ' + obj.id);
      else ids.add(String(obj.id));
      for (const f of schema) {
        const val = read(obj, f.key);
        const label = f.label || f.key;
        if (f.required && (val == null || val === '' || (Array.isArray(val) && !val.length)))
          errors.push(name + ': campo obbligatorio ' + label);
        if ((f.type === 'numero|null' || f.type === 'prezzo|null') && val != null &&
          (!Number.isFinite(Number(val)) || Number(val) < (f.min == null ? 0 : f.min)))
          errors.push(name + ': numero non valido in ' + label);
        if (f.type === 'immagine' && val && val.src && (!val.alt || !String(val.alt.it || '').trim() || !String(val.alt.en || '').trim()))
          errors.push(name + ': alt IT ed EN obbligatori per ' + label);
        if (f.type === 'galleria' && Array.isArray(val)) val.forEach((img, j) => {
          if (img.src && (!img.alt || !String(img.alt.it || '').trim() || !String(img.alt.en || '').trim()))
            errors.push(name + ': alt IT/EN mancanti in ' + label + ' #' + (j+1));
        });
        if (f.type === 'ripetitore' && Array.isArray(val))
          validate(val, f.schema || []).forEach(e => errors.push(name + ' / ' + label + ': ' + e));
      }
    });
    return errors;
  }
  function valueInput(kind, value, addr, label, opt) {
    const v = value == null ? '' : value;
    const key = esc(addr), info = opt && opt.help ? '<small class="hint">' + esc(opt.help) + '</small>' : '';
    let input = '';
    if (kind === 'booleano') input = '<input type="checkbox" data-ed-field="' + key + '" data-ed-type="booleano"' + (value ? ' checked' : '') + '>';
    else if (kind === 'area') input = '<textarea data-ed-field="' + key + '" data-ed-type="testo" rows="3">' + esc(v) + '</textarea>';
    else if (kind === 'scelta') input = '<select data-ed-field="' + key + '" data-ed-type="testo">' +
      (opt.options || []).map(o => {
        const k = typeof o === 'string' ? o : o.value, t = typeof o === 'string' ? o : o.label;
        return '<option value="' + esc(k) + '"' + (String(v) === String(k) ? ' selected' : '') + '>' + esc(t) + '</option>';
      }).join('') + '</select>';
    else if (kind === 'chips') input = '<div class="row c3">' + (opt.options || []).map(o => {
      const k = typeof o === 'string' ? o : o.value, t = typeof o === 'string' ? o : o.label;
      return '<label><input type="checkbox" data-ed-chip="' + key + '" value="' + esc(k) + '"' +
        (Array.isArray(value) && value.includes(k) ? ' checked' : '') + '> ' + esc(t) + '</label>';
    }).join('') + '</div>';
    else {
      const isNumber = kind === 'numero|null' || kind === 'prezzo|null';
      const type = isNumber ? 'number' : kind === 'url' ? 'url' : 'text';
      const number = isNumber ? ' min="' + esc(opt.min == null ? 0 : opt.min) + '" step="' + (kind === 'prezzo|null' ? '0.01' : 'any') + '"' : '';
      input = '<input type="' + type + '" data-ed-field="' + key + '" data-ed-type="' + esc(kind) + '" value="' + esc(v) + '"' + number + '>';
    }
    return '<label>' + esc(label) + (opt.required ? ' *' : '') + input + info + '</label>';
  }
  function field(f, obj, path) {
    const at = path + '.' + f.key, v = read(obj, f.key), label = f.label || f.key;
    if (f.type === 'testo-it-en' || f.type === 'area-it-en' || f.type === 'elenco-it-en') {
      const k = f.type === 'testo-it-en' ? 'testo' : 'area';
      const it = f.type === 'elenco-it-en' && Array.isArray(v && v.it) ? v.it.join('\n') : v && v.it;
      const en = f.type === 'elenco-it-en' && Array.isArray(v && v.en) ? v.en.join('\n') : v && v.en;
      const kind = f.type === 'elenco-it-en' ? 'righe' : k;
      return '<div class="row c2">' +
        valueInput(k, it, at + '.it', label + ' IT', f).replace('data-ed-type="'+ k + '"', 'data-ed-type="' + kind + '"') +
        valueInput(k, en, at + '.en', label + ' EN', f).replace('data-ed-type="'+ k + '"', 'data-ed-type="' + kind + '"') + '</div>';
    }
    if (f.type === 'immagine') {
      const im = v && typeof v === 'object' ? v : {src:'',alt:{it:'',en:''}};
      return '<fieldset><legend>' + esc(label) + '</legend>' +
        valueInput('testo', im.src || '', at + '.src', 'Percorso immagine', {}) +
        '<div class="row c2">' + valueInput('testo', im.alt && im.alt.it, at + '.alt.it', 'Alt IT', {}) +
        valueInput('testo', im.alt && im.alt.en, at + '.alt.en', 'Alt EN', {}) + '</div>' +
        '<label>Carica immagine<input type="file" accept="image/*" data-ed-upload="' + esc(at) + '"></label>' +
        (im.src ? '<small class="hint">' + esc(im.src) + '</small>' : '') + '</fieldset>';
    }
    if (f.type === 'galleria' || f.type === 'ripetitore') {
      const imgs = Array.isArray(v) ? v : [];
      const imageSchema = [{key:'src',label:'Percorso',type:'testo'},{key:'alt',label:'Descrizione',type:'testo-it-en'}];
      const schema = f.type === 'galleria' ? imageSchema : (f.schema || []);
      return '<fieldset><legend>' + esc(label) + '</legend>' +
        '<button type="button" class="btn sm" data-ed-add="' + esc(at) + '">+ Aggiungi</button>' +
        imgs.map((im, j) => '<div class="card"><div class="searchrow"><b>#' + (j+1) + '</b>' +
          ['up','down','archive'].map(action => '<button type="button" class="btn sm" data-ed-nested="' + esc(at) +
            '" data-ed-pos="' + j + '" data-ed-task="' + action + '">' +
            ({up:'↑',down:'↓',archive:'Archivia'}[action]) + '</button>').join('') + '</div>' +
          schema.map(child => field(child, im, at + '.' + j)).join('') +
          (f.type === 'galleria' ? '<label>Carica file<input type="file" accept="image/*" data-ed-upload="' +
            esc(at + '.' + j) + '"></label>' : '') + '</div>').join('') + '</fieldset>';
    }
    return valueInput(f.type === 'testo' ? 'testo' : f.type, v, at, label, f);
  }
  function mount({root, items, schema, onChange, create, upload, area, title, file, percorso}) {
    if (!root || !Array.isArray(items)) throw Error('Editor: root e items[] obbligatori');
    let opened = items[0] ? String(items[0].id) : null, dragFrom = null;
    const changed = () => { if (onChange) onChange(); showErrors(); };
    const locate = addr => read({items}, 'items.' + addr);
    const replace = (addr, val) => write({items}, 'items.' + addr, val);
    function showErrors() {
      const spot = root.querySelector('[data-ed-errors]');
      if (!spot) return;
      const errors = validate(items, schema);
      spot.textContent = errors.length ? errors.slice(0, 4).join(' · ') : 'Dati validi: le modifiche restano in bozza fino a Pubblica.';
      spot.setAttribute('role', errors.length ? 'alert' : 'status');
    }
    function render() {
      root.innerHTML = '<div class="card"><div class="searchrow"><div><h3>' + esc(title || 'Collezione') +
        '</h3><p class="hint">' + esc(file || '') + (percorso ? ' → ' + esc(percorso) : '') +
        ' · non elimina dati, archivia e ripristina</p></div><button type="button" class="btn pri" data-ed-main="new">+ Nuovo</button></div>' +
        '<p class="hint" data-ed-errors></p></div>' +
        items.map((obj, i) => {
          const isArchived = obj.stato === 'archiviato';
          const n = (obj.n && (obj.n.it || obj.n.en)) || obj.nome || obj.id;
          return '<div class="card" data-ed-card="' + i + '" draggable="true"><div class="searchrow">' +
            '<button type="button" class="btn sm" data-ed-main="toggle" data-ed-i="' + i +
            '" aria-expanded="' + (opened === String(obj.id)) + '">' + (opened === String(obj.id) ? '▾' : '▸') + '</button>' +
            '<b data-ed-label="' + i + '">' + esc(n) + '</b><span class="chip">' + esc(obj.id) + '</span>' +
            (isArchived ? '<span class="chip">archiviato</span>' : '') +
            '<span class="sp"></span>' + ['up','down','duplicate',isArchived?'restore':'archive'].map(task => {
              const labels = {up:'↑',down:'↓',duplicate:'Duplica',archive:'Archivia',restore:'Ripristina'};
              return '<button type="button" class="btn sm" data-ed-main="' + task + '" data-ed-i="' + i + '">' +
                labels[task] + '</button>';
            }).join('') + '</div>' +
            (opened === String(obj.id) ? '<div><div class="row c2">' +
              valueInput('testo', obj.id, i + '.id', 'Identificativo stabile (non modificare)', {help:'Usato nelle relazioni. Non riutilizzare gli ID archiviati.'}).replace('data-ed-field=', 'readonly data-ed-static=') +
              valueInput('scelta', obj.stato || 'pubblicato', i + '.stato', 'Stato', {options:['bozza','pubblicato','archiviato','esaurito','attivo']}) + '</div>' +
              schema.filter(f=>f.key!=='id' && f.key!=='stato').map(f => field(f, obj, String(i))).join('') + '</div>' : '') +
            '</div>';
        }).join('');
      showErrors();
    }
    function mutate(action, idx) {
      const obj = items[idx], old = opened;
      if (action === 'new' || action === 'duplicate') {
        const fresh = action === 'new' ? (create ? create() : {n:{it:'Nuovo elemento',en:''},stato:'bozza'}) : copy(obj);
        fresh.id = nextId(items, action === 'duplicate' ? String(obj.id) + '-copia' : fresh.id || 'nuovo');
        fresh.stato = 'bozza';
        items.push(fresh); opened = String(fresh.id);
      } else if (action === 'toggle') opened = old === String(obj.id) ? null : String(obj.id);
      else if (action === 'archive') {
        obj._statoPrimaArchivio = obj.stato || 'pubblicato'; obj.stato = 'archiviato';
      } else if (action === 'restore') {
        obj.stato = obj._statoPrimaArchivio && obj._statoPrimaArchivio !== 'archiviato' ? obj._statoPrimaArchivio : 'bozza';
        delete obj._statoPrimaArchivio;
      } else if (action === 'up' || action === 'down') {
        const other = idx + (action === 'up' ? -1 : 1);
        if (other < 0 || other >= items.length) return;
        [items[idx], items[other]] = [items[other], items[idx]];
      }
      if (action !== 'toggle') changed();
      render();
    }
    root.addEventListener('click', e => {
      const b = e.target.closest('[data-ed-main], [data-ed-add], [data-ed-nested]');
      if (!b || !root.contains(b)) return;
      e.preventDefault();
      if (b.hasAttribute('data-ed-main')) return mutate(b.dataset.edMain, Number(b.dataset.edI));
      if (b.hasAttribute('data-ed-add')) {
        const path = b.dataset.edAdd, fName = path.split('.').pop();
        const group = locate(path) || [], id = nextId(group,'nuovo-' + fName);
        group.push(fName === 'galleria' ? {src:'',alt:{it:'',en:''}} :
          fName === 'varianti' ? {id,formato:'',spessore:'',colore:'',prezzo:null,compareAt:null,stock:null,sku:'',img:'',stato:'bozza'} :
          {id,stato:'bozza'});
        replace(path,group);changed();render();return;
      }
      const path = b.dataset.edNested, group = locate(path) || [], j = Number(b.dataset.edPos), a = b.dataset.edTask;
      if (a === 'archive') { group[j]._statoPrimaArchivio = group[j].stato || 'attivo';group[j].stato = 'archiviato'; }
      else { const k = j + (a === 'up' ? -1 : 1); if (k>=0 && k<group.length) [group[k],group[j]]=[group[j],group[k]]; }
      changed();render();
    });
    root.addEventListener('input', e => {
      const el = e.target, addr = el.dataset.edField;
      if (!addr || el.hasAttribute('readonly')) return;
      const type = el.dataset.edType;
      let val = type === 'booleano' ? el.checked : el.value;
      if (type === 'numero|null' || type === 'prezzo|null')
        val = el.value.trim() === '' ? null : Number(el.value);
      if (type === 'righe') val = el.value.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
      replace(addr, val);
      const i = Number(addr.split('.')[0]), titleEl = root.querySelector('[data-ed-label="' + i + '"]');
      if (titleEl && /^(\d+)\.n\.(it|en)$/.test(addr)) titleEl.textContent = (items[i].n || {}).it || items[i].id;
      changed();
    });
    root.addEventListener('change', async e => {
      const el = e.target;
      if (el.dataset.edChip) {
        const addr = el.dataset.edChip, list = Array.isArray(locate(addr)) ? [...locate(addr)] : [];
        const next = el.checked ? [...new Set([...list,el.value])] : list.filter(x => x !== el.value);
        replace(addr, next);changed();
      }
      if (el.dataset.edUpload && el.files && el.files[0] && upload) {
        try {
          const addr = el.dataset.edUpload, id = items[Number(addr.split('.')[0])].id;
          const safeArea = String(area || 'collezioni').replace(/[^a-z0-9-]/gi,'');
          const dest = await upload(el.files[0], 'assets/images/' + safeArea + '/' + id);
          const item = locate(addr);
          if (item && typeof item === 'object') item.src = dest;
          else replace(addr + '.src', dest);
          changed();render();
        } catch (error) {
          const spot = root.querySelector('[data-ed-errors]');
          if (spot) {spot.setAttribute('role','alert');spot.textContent = 'Upload non riuscito: ' + error.message;}
        }
      }
    });
    root.addEventListener('dragstart', e => {
      const card = e.target.closest('[data-ed-card]');
      if (!card) return;
      dragFrom = Number(card.dataset.edCard);
      if (e.dataTransfer) e.dataTransfer.setData('text/plain', String(dragFrom));
    });
    root.addEventListener('dragover', e => { if (e.target.closest('[data-ed-card]')) e.preventDefault(); });
    root.addEventListener('drop', e => {
      const card = e.target.closest('[data-ed-card]');
      if (!card || dragFrom == null) return;
      e.preventDefault();
      const dest = Number(card.dataset.edCard);
      if (dest !== dragFrom) { items.splice(dest,0,items.splice(dragFrom,1)[0]);changed();render(); }
      dragFrom = null;
    });
    render();
    return {refresh:render, validate:()=>validate(items,schema)};
  }
  host.INGLY_COLLECTION_EDITOR = Object.freeze({mount,validate,nextId,read,write});
})(window);
