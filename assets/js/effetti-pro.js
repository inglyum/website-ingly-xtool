/* EFFETTI PRO — «laboratorio laser di notte» (richiesta del titolare, 2026-11-27).
   Due cose sole, fatte bene (skill frontend-design: una sola idea memorabile):

   1. SFONDO VIVO (chiaro e scuro): un piccolo shader WebGL disegna luci
      che scorrono piano nei colori dell'atmosfera di stagione, più una luce
      calda che segue il mouse come una lampada sul banco. Mezza risoluzione,
      massimo 30 fotogrammi al secondo, fermo quando la scheda non è visibile.
      Senza WebGL o con «riduci movimento» resta lo sfondo CSS fisso.

   2. TITOLI INCISI DAL LASER: quando un titolo di sezione entra nello schermo,
      un raggio ambra lo attraversa e il testo compare dietro, con un bagliore
      che si raffredda. GSAP (assets/vendor/gsap) caricato solo quando serve.
      Si nascondono soltanto titoli ancora fuori schermo, e se qualcosa va
      storto il titolo torna subito visibile (regola 12: mai sezioni invisibili).

   Regola 1: nessuna animazione sulle immagini. Regola 11: solo variabili CSS. */

const riduci = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const scuro = () => document.documentElement.dataset.mode === 'dark';

/* ---------------- 1. sfondo vivo ---------------- */
const VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const FRAG = `precision mediump float;
uniform vec2 r;uniform float t;uniform vec2 m;uniform vec3 c0,c1,c2,c3,ca;uniform float lm;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
 return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int k=0;k<5;k++){v+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
 vec2 uv=gl_FragCoord.xy/r;vec2 q=uv;q.x*=r.x/r.y;
 float tt=t*.035;
 vec2 w=vec2(fbm(q*1.3+vec2(tt,-tt*.7)),fbm(q*1.3+vec2(-tt*.6,tt)+4.1));
 float a=fbm(q*1.6+w*1.8+vec2(0.,tt*.8));
 float b=fbm(q*2.2-w*1.2+vec2(tt*.5,0.)+8.3);
 /* nastri di luce in alto, bagliore caldo a destra, mare in basso */
 float band=smoothstep(.35,.95,a)*smoothstep(.05,.75,uv.y);
 float warm=smoothstep(.45,1.,b)*smoothstep(.2,1.,uv.x)*.85;
 float deep=smoothstep(.55,1.,1.-uv.y)*fbm(q*.9+tt)*.9;
 vec2 mm=m;mm.x*=r.x/r.y;float d=distance(q,mm);
 float v=smoothstep(1.25,.25,distance(uv,vec2(.5,.55)));
 vec3 col=c0;
 if(lm>.5){
  /* giorno: velature leggere sul fondo avorio, lampada appena dorata */
  col=mix(col,c1,band*.17);
  col=mix(col,c3,deep*.13);
  col=mix(col,c2,warm*.14);
  col=mix(col,ca,.10*exp(-d*d*7.));
  col*=mix(.965,1.,v);
 }else{
  col=mix(col,c1,band*.55);
  col=mix(col,c3,deep*.45);
  col+=c2*warm*.22;
  /* lampada: luce calda che segue il mouse */
  col+=ca*.16*exp(-d*d*7.);
  /* vignetta */
  col*=mix(.72,1.,v);
 }
 gl_FragColor=vec4(col,1.);
}`;

const rgb = s => {
  s = String(s || '').trim();
  if (/^#[0-9a-f]{6}$/i.test(s)) return [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16) / 255);
  const m = s.match(/(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  return m ? [m[1] / 255, m[2] / 255, m[3] / 255] : [0, 0, 0];
};

let SF = null; // stato dello sfondo

function colori() {
  const cs = getComputedStyle(document.documentElement);
  const v = k => cs.getPropertyValue(k);
  return { c0: rgb(v('--rs-bg')), c1: rgb(v('--au-g1')), c2: rgb(v('--au-g2')), c3: rgb(v('--au-g3')), ca: rgb(v('--rs-gold')) };
}

function avviaSfondo() {
  if (SF || riduci()) return;
  const cv = document.createElement('canvas');
  cv.id = 'fxSfondo'; cv.setAttribute('aria-hidden', 'true');
  const gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
  if (!gl) return;
  const sh = (tipo, src) => { const s = gl.createShader(tipo); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
  const vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
  if (!vs || !fs) return;
  const pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const U = {}; ['r', 't', 'm', 'c0', 'c1', 'c2', 'c3', 'ca', 'lm'].forEach(k => { U[k] = gl.getUniformLocation(pr, k); });
  const tocco = matchMedia('(pointer:coarse)').matches;
  const scala = tocco ? .32 : .5, passo = 1000 / (tocco ? 20 : 30);
  const st = { cv, gl, U, raf: 0, ultimo: 0, t0: performance.now(), mx: .72, my: .7, tx: .72, ty: .7, col: colori() };
  const misura = () => { const w = Math.max(2, Math.round(innerWidth * scala)), h = Math.max(2, Math.round(innerHeight * scala)); if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); } };
  const disegna = ora => {
    st.raf = requestAnimationFrame(disegna);
    if (document.hidden || ora - st.ultimo < passo) return;
    st.ultimo = ora; misura();
    st.mx += (st.tx - st.mx) * .06; st.my += (st.ty - st.my) * .06;
    const c = st.col;
    gl.uniform2f(U.r, cv.width, cv.height); gl.uniform1f(U.t, (ora - st.t0) / 1000); gl.uniform2f(U.m, st.mx, st.my);
    gl.uniform3fv(U.c0, c.c0); gl.uniform3fv(U.c1, c.c1); gl.uniform3fv(U.c2, c.c2); gl.uniform3fv(U.c3, c.c3); gl.uniform3fv(U.ca, c.ca); gl.uniform1f(U.lm, scuro() ? 0 : 1);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  st.muovi = e => { st.tx = e.clientX / innerWidth; st.ty = 1 - e.clientY / innerHeight; };
  if (!tocco) addEventListener('pointermove', st.muovi, { passive: true });
  cv.addEventListener('webglcontextlost', e => { e.preventDefault(); fermaSfondo(); }, false);
  document.body.prepend(cv);
  document.documentElement.classList.add('fx-sfondo');
  st.raf = requestAnimationFrame(disegna);
  SF = st;
}

function fermaSfondo() {
  if (!SF) return;
  cancelAnimationFrame(SF.raf);
  removeEventListener('pointermove', SF.muovi);
  SF.cv.remove();
  document.documentElement.classList.remove('fx-sfondo');
  SF = null;
}

/* modalità o atmosfera cambiate: riaccendi, spegni o ricolora */
function aggiornaSfondo() {
  if (riduci()) { fermaSfondo(); return; }
  if (!SF) avviaSfondo(); else SF.col = colori();
}

/* ---------------- 2. titoli incisi dal laser ---------------- */
const TITOLI = '.page.active :is(.sec,section) h2:not(.lz-fatto):not([data-no-laser])';
let GS = null, IO = null;
const CONT = new Map(); // contenitore osservato → titolo

function caricaGsap() {
  if (window.gsap) return Promise.resolve(window.gsap);
  if (GS) return GS;
  GS = new Promise((ok, ko) => {
    const s = document.createElement('script');
    s.src = 'assets/vendor/gsap/gsap.min.js'; s.async = true;
    s.onload = () => window.gsap ? ok(window.gsap) : ko(new Error('gsap assente'));
    s.onerror = () => ko(new Error('gsap non caricato'));
    document.head.appendChild(s);
  });
  return GS;
}

function mostra(el) { el.classList.remove('lz-pronto'); el.classList.add('lz-fatto'); el.style.removeProperty('--lz'); el.style.removeProperty('--lzg'); }

function incidi(el) {
  caricaGsap().then(gsap => {
    const raggio = document.createElement('span');
    raggio.className = 'lz-raggio'; raggio.setAttribute('aria-hidden', 'true');
    el.appendChild(raggio);
    gsap.timeline({ onComplete: () => { raggio.remove(); mostra(el); } })
      .fromTo(el, { '--lz': 0, '--lzg': 1 }, { '--lz': 1, duration: 1.05, ease: 'power2.inOut' })
      .to(el, { '--lzg': 0, duration: 1.1, ease: 'power1.out' }, '-=0.35');
  }).catch(() => mostra(el));
}

function preparaTitoli() {
  if (riduci() || !('IntersectionObserver' in window)) return;
  /* si osserva il contenitore del titolo, non il titolo: ritagliato, il titolo
     ha area visibile zero e alcuni browser non lo segnalano mai */
  if (!IO) IO = new IntersectionObserver(voci => voci.forEach(v => {
    if (!v.isIntersecting) return;
    const el = CONT.get(v.target); IO.unobserve(v.target); CONT.delete(v.target);
    if (el && el.classList.contains('lz-pronto')) incidi(el);
  }), { rootMargin: '0px 0px -12% 0px', threshold: 0 }); // soglia 0: il titolo ritagliato ha area visibile zero
  const alt = innerHeight;
  document.querySelectorAll(TITOLI).forEach(el => {
    if (el.classList.contains('lz-pronto')) return;
    const r = el.getBoundingClientRect();
    if (!r.height || r.top < alt * .9) { el.classList.add('lz-fatto'); return; } // già visibile: niente lampi
    el.classList.add('lz-pronto');
    const c = el.parentElement || el; CONT.set(c, el); IO.observe(c);
  });
  /* paracadute: se dopo 8 s un titolo pronto è già sopra lo schermo e non è stato inciso, mostralo */
  clearTimeout(preparaTitoli.t);
  preparaTitoli.t = setTimeout(() => document.querySelectorAll('h2.lz-pronto').forEach(el => {
    if (el.getBoundingClientRect().bottom < 0) mostra(el);
  }), 8000);
}

/* ---------------- 3. barra di lettura e mosaico che respira ----------------
   2026-11-28: una linea dorata in cima che segue lo scorrimento della pagina e
   il mosaico dell'hero che si sposta appena col puntatore (proprietà CSS
   `translate`, indipendente dall'animazione del contenitore). Solo variabili
   CSS (regola 11); niente sulle immagini (regola 1); fermi con «riduci movimento». */
function avviaRifiniture() {
  if (riduci()) return;
  let barra = document.getElementById('fxProgresso');
  if (!barra) {
    barra = document.createElement('div');
    barra.id = 'fxProgresso'; barra.setAttribute('aria-hidden', 'true');
    document.body.appendChild(barra);
  }
  let rafP = 0;
  const progresso = () => {
    rafP = 0;
    const h = document.documentElement.scrollHeight - innerHeight;
    barra.style.setProperty('--fx-p', h > 0 ? Math.min(1, Math.max(0, scrollY / h)).toFixed(4) : '0');
  };
  addEventListener('scroll', () => { if (!rafP) rafP = requestAnimationFrame(progresso); }, { passive: true });
  progresso();
  if (matchMedia('(pointer:coarse)').matches) return;
  let rafM = 0, ev = null;
  addEventListener('pointermove', e => {
    ev = e;
    if (rafM) return;
    rafM = requestAnimationFrame(() => {
      rafM = 0;
      const m = document.getElementById('heroMosaico');
      if (!m || !ev) return;
      const r = m.parentElement.getBoundingClientRect();
      if (ev.clientY > r.bottom || ev.clientY < r.top) return;
      m.style.setProperty('--hm-x', ((ev.clientX / innerWidth) - .5).toFixed(3));
      m.style.setProperty('--hm-y', (((ev.clientY - r.top) / Math.max(1, r.height)) - .5).toFixed(3));
    });
  }, { passive: true });
}

/* ---------------- avvio ---------------- */
let avviato = false;
export function initEffettiPro() {
  if (avviato) { aggiornaSfondo(); return; }
  avviato = true;
  const parti = () => { aggiornaSfondo(); preparaTitoli(); avviaRifiniture(); };
  ('requestIdleCallback' in window) ? requestIdleCallback(parti, { timeout: 1500 }) : setTimeout(parti, 300);
  new MutationObserver(() => aggiornaSfondo()).observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode', 'data-atmosfera'] });
  document.addEventListener('ingly:pagina', () => setTimeout(preparaTitoli, 120));
  try { matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', () => { aggiornaSfondo(); document.querySelectorAll('h2.lz-pronto').forEach(mostra); }); } catch (e) { /* browser vecchi */ }
}
