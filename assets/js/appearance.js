/* INGLY DESIGN — sfondo fotografico configurabile.
   Nessuna dipendenza esterna: accetta soltanto percorsi immagine locali noti o HTTPS.
   Le impostazioni arrivano da data/config.json e restano disattivate per default. */
const POSIZIONI = new Set(['center center','center top','center bottom','left center','right center']);
const DEFAULTS = Object.freeze({ enabled:false, url:'', position:'center center', overlayDark:48, overlayLight:64 });

function limite(value, fallback, min, max){
  const n = Number(value);
  return Math.max(min, Math.min(max, Number.isFinite(n) ? n : fallback));
}

export function risolviImmagine(value, baseURI){
  const raw = String(value || '').trim();
  if(!raw || /[\s"'\\()<>\u0000-\u001f]/.test(raw)) return '';
  const local = /^(?:\.\/)?(?:img|assets\/images)\/[A-Za-z0-9][A-Za-z0-9/_\-.]*\.(?:webp|png|jpe?g|avif)$/i.test(raw)
    && !raw.replace(/^\.\//,'').split('/').includes('..');
  const remote = /^https:\/\//i.test(raw);
  if(!local && !remote) return '';
  try{
    const url = new URL(local ? raw.replace(/^\.\//,'') : raw,
      baseURI || (typeof document !== 'undefined' ? document.baseURI : 'https://example.invalid/'));
    return url.protocol === 'https:' ? url.href : '';
  }catch(e){ return '' }
}

export function normalizza(config = {}){
  const raw = config && config.visualBackground && typeof config.visualBackground === 'object'
    && !Array.isArray(config.visualBackground) ? config.visualBackground : {};
  return {
    enabled: raw.enabled === true,
    url: String(raw.url || '').trim(),
    position: POSIZIONI.has(raw.position) ? raw.position : DEFAULTS.position,
    overlayDark: limite(raw.overlayDark, DEFAULTS.overlayDark, 0, 85),
    overlayLight: limite(raw.overlayLight, DEFAULTS.overlayLight, 0, 90)
  };
}

const PROPRIETA = [
  '--ingly-photo-url',
  '--ingly-photo-position',
  '--ingly-photo-dark-overlay',
  '--ingly-photo-light-overlay'
];

export function applica(config = {}, doc = (typeof document !== 'undefined' ? document : null)){
  if(!doc || !doc.documentElement) return { enabled:false, reason:'document-unavailable' };
  const root = doc.documentElement;
  const value = normalizza(config);
  const url = value.enabled ? risolviImmagine(value.url, doc.baseURI) : '';
  if(!url){
    root.removeAttribute('data-bg-photo');
    PROPRIETA.forEach(key => root.style.removeProperty(key));
    return { enabled:false, reason:value.enabled ? 'invalid-image-url' : 'disabled' };
  }
  root.setAttribute('data-bg-photo','true');
  root.style.setProperty('--ingly-photo-url', 'url("' + url + '")');
  root.style.setProperty('--ingly-photo-position', value.position);
  root.style.setProperty('--ingly-photo-dark-overlay', String(value.overlayDark / 100));
  root.style.setProperty('--ingly-photo-light-overlay', String(value.overlayLight / 100));
  return { enabled:true, url, position:value.position, overlayDark:value.overlayDark, overlayLight:value.overlayLight };
}
