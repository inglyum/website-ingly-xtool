/* ============================================================
   INGLY · Incisione 3D dal vivo
   Una targa vera in 3D (WebGL puro, nessuna libreria esterna):
   - 4 materiali generati dal codice: legno, ardesia, acrilico, metallo;
   - il laser prima traccia la cornice (vettoriale), poi incide il testo
     riga per riga (raster), come fanno le macchine in laboratorio;
   - scintille, fumo e bagliore della lavorazione;
   - si ruota trascinando; si ferma quando non è sullo schermo.
   Se WebGL manca o fallisce resta la foto di un lavoro vero.
   Il modulo del preventivo funziona anche senza 3D.
   ============================================================ */
(function () {
  'use strict';

  /* ---------- misure della targa (unità scena) ---------- */
  var W = 2.0, H = 1.1, T = 0.09, R = 0.085, BV = 0.016, SEG = 10;
  /* la maschera dell'incisione è 1024×512 (potenza di due: si possono usare i mipmap,
     così i bordi restano puliti anche quando la targa è piccola). Si disegna in
     coordinate «logiche» con le proporzioni vere della targa (LH) e si comprime in verticale. */
  var MW = 1024, MH = 512, LH = Math.round(MW * H / W), SY = MH / LH;

  var MATERIALI = ['legno', 'ardesia', 'acrilico', 'metallo'];
  /* quanta materia «vola via» durante l'incisione, per materiale */
  var FX = {
    legno:    { scintille: 260, fumo: 26, fumoCol: [0.55, 0.50, 0.44], scCol: 1 },
    ardesia:  { scintille: 90,  fumo: 18, fumoCol: [0.62, 0.62, 0.62], scCol: 0 },
    acrilico: { scintille: 70,  fumo: 22, fumoCol: [0.80, 0.80, 0.82], scCol: 1 },
    metallo:  { scintille: 200, fumo: 6,  fumoCol: [0.70, 0.70, 0.72], scCol: 2 }
  };

  /* ---------- matematica minima ---------- */
  function m4() { var m = new Float32Array(16); m[0] = m[5] = m[10] = m[15] = 1; return m; }
  function mul(a, b) {
    var o = new Float32Array(16);
    for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
    return o;
  }
  function rotX(t) { var m = m4(), c = Math.cos(t), s = Math.sin(t); m[5] = c; m[6] = s; m[9] = -s; m[10] = c; return m; }
  function rotY(t) { var m = m4(), c = Math.cos(t), s = Math.sin(t); m[0] = c; m[2] = -s; m[8] = s; m[10] = c; return m; }
  function persp(fy, asp, n, f) {
    var m = new Float32Array(16), t = 1 / Math.tan(fy / 2);
    m[0] = t / asp; m[5] = t; m[10] = (f + n) / (n - f); m[11] = -1; m[14] = 2 * f * n / (n - f); return m;
  }
  function lookAt(e, c, u) {
    var z = norm([e[0] - c[0], e[1] - c[1], e[2] - c[2]]), x = norm(cross(u, z)), y = cross(z, x), m = m4();
    m[0] = x[0]; m[4] = x[1]; m[8] = x[2];
    m[1] = y[0]; m[5] = y[1]; m[9] = y[2];
    m[2] = z[0]; m[6] = z[1]; m[10] = z[2];
    m[12] = -dot(x, e); m[13] = -dot(y, e); m[14] = -dot(z, e); return m;
  }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function tp(m, p) { return [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]]; }
  function tv(m, v) { return [m[0] * v[0] + m[4] * v[1] + m[8] * v[2], m[1] * v[0] + m[5] * v[1] + m[9] * v[2], m[2] * v[0] + m[6] * v[1] + m[10] * v[2]]; }
  function nm3(m) { return new Float32Array([m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10]]); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------- geometria: targa con smusso e bordo ---------- */
  function contorno(rr, inset) {
    var w = W / 2 - R, h = H / 2 - R, cs = [[w, h, 0], [-w, h, 90], [-w, -h, 180], [w, -h, 270]], pts = [];
    cs.forEach(function (c) {
      for (var i = 0; i <= SEG; i++) {
        var a = (c[2] + 90 * i / SEG) * Math.PI / 180, ca = Math.cos(a), sa = Math.sin(a);
        pts.push({ x: c[0] + (rr - inset) * ca, y: c[1] + (rr - inset) * sa, nx: ca, ny: sa });
      }
    });
    return pts;
  }
  function geometria() {
    var v = [], zf = T / 2, zb = -T / 2;
    function put(x, y, z, n, u, vv, k) { v.push(x, y, z, n[0], n[1], n[2], u, vv, k); }
    function fuv(x, y) { return [x / W + 0.5, y / H + 0.5]; }
    var inn = contorno(R, BV), out = contorno(R, 0), n = inn.length, i, j;
    /* faccia incisa */
    for (i = 0; i < n; i++) {
      j = (i + 1) % n;
      var a = inn[i], b = inn[j];
      put(0, 0, zf, [0, 0, 1], 0.5, 0.5, 0);
      var ua = fuv(a.x, a.y), ub = fuv(b.x, b.y);
      put(a.x, a.y, zf, [0, 0, 1], ua[0], ua[1], 0);
      put(b.x, b.y, zf, [0, 0, 1], ub[0], ub[1], 0);
    }
    /* smusso */
    for (i = 0; i < n; i++) {
      j = (i + 1) % n;
      var A0 = inn[i], A1 = inn[j], B0 = out[i], B1 = out[j];
      var nA0 = norm([A0.nx * 0.55, A0.ny * 0.55, 0.85]), nA1 = norm([A1.nx * 0.55, A1.ny * 0.55, 0.85]);
      var nB0 = norm([B0.nx, B0.ny, 0.25]), nB1 = norm([B1.nx, B1.ny, 0.25]);
      var q = [[A0, nA0, zf], [B0, nB0, zf - BV], [B1, nB1, zf - BV], [A0, nA0, zf], [B1, nB1, zf - BV], [A1, nA1, zf]];
      q.forEach(function (p) { var uv = fuv(p[0].x, p[0].y); put(p[0].x, p[0].y, p[2], p[1], uv[0], uv[1], 0); });
    }
    /* bordo (taglio laser) */
    var per = 0, s = [0];
    for (i = 0; i < n; i++) { j = (i + 1) % n; per += Math.hypot(out[j].x - out[i].x, out[j].y - out[i].y); s.push(per); }
    for (i = 0; i < n; i++) {
      j = (i + 1) % n;
      var P0 = out[i], P1 = out[j], u0 = s[i] / per * 6, u1 = s[i + 1] / per * 6;
      var e = [[P0, zf - BV, u0], [P0, zb, u0], [P1, zb, u1], [P0, zf - BV, u0], [P1, zb, u1], [P1, zf - BV, u1]];
      e.forEach(function (p) { put(p[0].x, p[0].y, p[1], [p[0].nx, p[0].ny, 0], p[2], p[1], 1); });
    }
    /* retro */
    for (i = 0; i < n; i++) {
      j = (i + 1) % n;
      put(0, 0, zb, [0, 0, -1], 0, 0, 1);
      put(out[j].x, out[j].y, zb, [0, 0, -1], 0, 0, 1);
      put(out[i].x, out[i].y, zb, [0, 0, -1], 0, 0, 1);
    }
    return new Float32Array(v);
  }

  /* ---------- shader ---------- */
  var VS_TARGA = [
    'attribute vec3 aPos;attribute vec3 aNor;attribute vec2 aUv;attribute float aKind;',
    'uniform mat4 uModel;uniform mat4 uVP;uniform mat3 uNM;',
    'varying vec3 vW;varying vec3 vN;varying vec2 vUv;varying float vKind;varying float vZ;',
    'void main(){vec4 w=uModel*vec4(aPos,1.0);vW=w.xyz;vN=uNM*aNor;vUv=aUv;vKind=aKind;vZ=aPos.z;gl_Position=uVP*w;}'
  ].join('\n');

  var FS_TARGA = [
    'precision highp float;',
    'varying vec3 vW;varying vec3 vN;varying vec2 vUv;varying float vKind;varying float vZ;',
    'uniform sampler2D uMask;uniform vec2 uTexel;uniform float uMat;uniform vec3 uLaser;uniform vec2 uScan;',
    'uniform vec3 uCam;uniform vec3 uTx;uniform vec3 uTy;uniform float uAsp;uniform float uMode;',
    'float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
    'float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);',
    ' return mix(mix(hash(i),hash(i+vec2(1.0,0.0)),f.x),mix(hash(i+vec2(0.0,1.0)),hash(i+vec2(1.0,1.0)),f.x),f.y);}',
    'float fbm(vec2 p){float s=0.0,a=0.5;for(int i=0;i<5;i++){s+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=0.5;}return s;}',
    'vec3 env(vec3 r,float ro){',
    ' float top=smoothstep(-0.2,0.9,r.y);',
    ' vec3 c=mix(vec3(0.02,0.016,0.012),vec3(0.13,0.10,0.075),top);',
    ' float box=smoothstep(mix(0.9,0.74,ro),mix(0.93,0.95,ro),dot(r,normalize(vec3(-0.45,0.72,0.55))));',
    ' c+=vec3(1.0,0.90,0.76)*box*1.8;',
    ' float rim=smoothstep(0.86,0.97,dot(r,normalize(vec3(0.75,0.25,-0.1))));',
    ' c+=vec3(0.95,0.62,0.32)*rim*0.7;return c;}',
    'void main(){',
    ' float face=1.0-step(0.5,vKind);vec2 uv=vUv;',
    ' float h=0.0,hx=0.0,hy=0.0,wide=0.0;',
    ' if(face>0.5){',
    '  h=texture2D(uMask,uv).r;vec2 e=uTexel*2.0;',
    '  hx=texture2D(uMask,uv+vec2(e.x,0.0)).r-texture2D(uMask,uv-vec2(e.x,0.0)).r;',
    '  hy=texture2D(uMask,uv+vec2(0.0,e.y)).r-texture2D(uMask,uv-vec2(0.0,e.y)).r;',
    '  vec2 w=uTexel*vec2(6.0,4.0);',
    '  wide=(texture2D(uMask,uv+w).r+texture2D(uMask,uv-w).r+texture2D(uMask,uv+vec2(-w.x,w.y)).r+texture2D(uMask,uv+vec2(w.x,-w.y)).r)*0.25;',
    ' }',
    ' vec3 N=normalize(vN);',
    ' if(face>0.5){vec3 nt=normalize(vec3(-hx*2.6,-hy*2.6,1.0));N=normalize(uTx*nt.x+uTy*nt.y+N*nt.z);}',
    ' vec2 p=vec2(uv.x*uAsp,uv.y);',
    ' vec3 base;vec3 eng;float rough;float metal=0.0;float spec;float halo=0.0;',
    ' if(uMat<0.5){',
    '  float g=fbm(vec2(p.x*0.45,p.y*9.0));',
    '  float w=fbm(p*vec2(0.5,1.2));',
    '  float rings=fract(p.y*15.0+w*1.6+g*0.9);',
    '  float ln=smoothstep(0.0,0.04,rings)*smoothstep(0.22,0.05,rings)*0.75;',
    '  float fib=noise(vec2(p.x*90.0,p.y*260.0))*0.6+noise(vec2(p.x*3.0,p.y*120.0))*0.4;',
    '  base=mix(vec3(0.86,0.70,0.50),vec3(0.70,0.50,0.31),ln*0.42+g*0.28)*(0.92+fib*0.12);',
    '  eng=mix(vec3(0.40,0.23,0.10),vec3(0.11,0.06,0.03),smoothstep(0.15,0.85,h));',
    '  rough=0.72;spec=0.12;halo=0.5;',
    '  if(face<0.5){float l=0.5+0.5*sin(vZ*210.0);base=mix(vec3(0.20,0.12,0.06),vec3(0.36,0.22,0.12),l*0.55+noise(vec2(uv.x*300.0,vZ*60.0))*0.3);}',
    ' }else if(uMat<1.5){',
    '  float n=fbm(p*vec2(2.6,8.0));float sp=noise(p*300.0);',
    '  base=vec3(0.16,0.17,0.18)+(n-0.5)*0.08+sp*0.03;',
    '  eng=mix(vec3(0.50,0.51,0.51),vec3(0.82,0.82,0.80),h)*(0.92+noise(p*180.0)*0.14);',
    '  rough=0.86;spec=0.06;',
    '  if(face<0.5)base=vec3(0.11,0.115,0.12)+(noise(vec2(uv.x*160.0,vZ*90.0))-0.5)*0.07;',
    ' }else if(uMat<2.5){',
    '  base=vec3(0.014,0.014,0.016);',
    '  eng=vec3(0.88,0.88,0.86)*(0.88+noise(p*160.0)*0.16);',
    '  rough=0.06;spec=1.0;',
    ' }else{',
    '  float br=noise(vec2(p.x*2.5,p.y*420.0));',
    '  base=vec3(0.085,0.08,0.078)+br*0.025;',
    '  eng=vec3(0.86,0.86,0.88)*(0.9+br*0.12);',
    '  rough=0.3;metal=1.0;spec=0.85;',
    '  if(face<0.5)base=vec3(0.55,0.55,0.57)*(0.85+noise(vec2(uv.x*900.0,vZ*20.0))*0.2);',
    ' }',
    ' float e=smoothstep(0.08,0.55,h);',
    ' base*=1.0-halo*clamp(wide-h*0.6,0.0,1.0)*0.55;',
    ' vec3 alb=mix(base,eng,e);alb*=alb;',
    ' float r=mix(rough,0.85,e);',
    ' float specAmt=spec*(1.0-e*0.85);',
    ' vec3 V=normalize(uCam-vW);vec3 L=normalize(vec3(-0.45,0.75,0.55));',
    ' float ndl=max(dot(N,L),0.0);vec3 Hh=normalize(L+V);',
    ' float slope=clamp(length(vec2(hx,hy))*6.0,0.0,1.0);',
    ' float sh=mix(mix(10.0,600.0,1.0-r),16.0,slope);',
    ' float sp=pow(max(dot(N,Hh),0.0),sh)*(sh+8.0)/40.0*(1.0-slope)*(1.0-slope);',
    ' float ao=1.0-e*0.4;',
    ' vec3 lit=vec3(1.0,0.90,0.78)*ndl*1.15+vec3(0.10,0.085,0.07);',
    ' vec3 col=alb*lit*ao*(1.0-metal*0.75*(1.0-e));',
    ' vec3 Rf=reflect(-V,N);float fr=pow(1.0-max(dot(N,V),0.0),5.0);',
    ' vec3 tint=mix(vec3(1.0),alb*2.2+0.06,metal*(1.0-e));',
    ' col+=tint*(sp*vec3(1.0,0.9,0.78)*0.5+env(Rf,max(r,slope))*(mix(0.04,0.8,metal)+fr*0.9)*mix(1.0,0.2,max(r,slope)))*specAmt;',
    ' vec2 q=(uv-uLaser.xy)*vec2(uAsp,1.0);float d2=dot(q,q);',
    ' float glow=uLaser.z*face*(exp(-d2*12000.0)*3.0+exp(-d2*500.0)*0.3);',
    ' float tr=0.0;',
    ' if(face>0.5&&uScan.y>0.0){float dy=abs(uv.y-uLaser.y);float bh=(uLaser.x-uv.x)*uScan.x;',
    '  tr=uLaser.z*step(dy,uScan.y)*step(0.0,bh)*smoothstep(0.10,0.0,bh)*e;}',
    ' col+=vec3(1.0,0.42,0.10)*glow+vec3(1.0,0.32,0.06)*tr*0.9;',
    ' col=max(col-0.0025,0.0);col=col/(1.0+col*0.55)*1.25;',
    ' gl_FragColor=vec4(sqrt(max(col,0.0)),1.0);}'
  ].join('\n');

  var VS_OMBRA = [
    'attribute vec2 aP;uniform mat4 uModel;uniform mat4 uVP;varying vec2 vP;',
    'void main(){vP=aP;gl_Position=uVP*uModel*vec4(aP+vec2(0.05,-0.07),-0.05,1.0);}'
  ].join('\n');
  var FS_OMBRA = [
    'precision mediump float;varying vec2 vP;uniform vec3 uHalf;',
    'void main(){vec2 d=abs(vP)-uHalf.xy+uHalf.z;float s=length(max(d,0.0))+min(max(d.x,d.y),0.0)-uHalf.z;',
    'float a=(1.0-smoothstep(-0.05,0.22,s))*0.6;gl_FragColor=vec4(0.0,0.0,0.0,a);}'
  ].join('\n');

  var VS_RAGGIO = 'attribute vec3 aPos;attribute vec2 aQ;uniform mat4 uVP;varying vec2 vQ;void main(){vQ=aQ;gl_Position=uVP*vec4(aPos,1.0);}';
  var FS_RAGGIO = [
    'precision mediump float;varying vec2 vQ;uniform float uI;',
    'void main(){float c=exp(-vQ.x*vQ.x*40.0);float g=exp(-vQ.x*vQ.x*3.0)*0.32;float f=pow(1.0-vQ.y,2.2);',
    'vec3 col=(vec3(1.0,0.93,0.82)*c+vec3(1.0,0.42,0.12)*g)*f*uI;gl_FragColor=vec4(col,0.0);}'
  ].join('\n');

  var VS_PUNTI = [
    'attribute vec3 aPos;attribute vec4 aCol;attribute float aSize;uniform mat4 uVP;uniform float uPx;varying vec4 vC;',
    'void main(){vC=aCol;gl_Position=uVP*vec4(aPos,1.0);gl_PointSize=max(1.0,aSize*uPx/gl_Position.w);}'
  ].join('\n');
  var FS_PUNTI = [
    'precision mediump float;varying vec4 vC;uniform float uSoft;',
    'void main(){vec2 c=gl_PointCoord*2.0-1.0;float r=dot(c,c);if(r>1.0)discard;',
    'float a=mix(pow(1.0-r,2.0),exp(-r*3.0)*(1.0-r),uSoft)*vC.a;gl_FragColor=vec4(vC.rgb*a,a);}'
  ].join('\n');

  function compila(gl, vs, fs) {
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
    var p = gl.createProgram();
    gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    var u = {}, a = {}, i, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (i = 0; i < n; i++) { var info = gl.getActiveUniform(p, i); u[info.name] = gl.getUniformLocation(p, info.name); }
    n = gl.getProgramParameter(p, gl.ACTIVE_ATTRIBUTES);
    for (i = 0; i < n; i++) { var at = gl.getActiveAttrib(p, i); a[at.name] = gl.getAttribLocation(p, at.name); }
    return { p: p, u: u, a: a };
  }

  /* ---------- la lavorazione: cornice vettoriale + testo raster ---------- */
  function Lavoro(font) {
    this.font = font;
    this.rivela = document.createElement('canvas'); this.rivela.width = MW; this.rivela.height = MH;
    this.rc = this.rivela.getContext('2d');
    this.testoC = document.createElement('canvas'); this.testoC.width = MW; this.testoC.height = MH;
    this.blurOk = typeof this.rc.filter === 'string';
  }
  Lavoro.prototype.percorsi = function () {
    function rr(ins, rad) {
      var x0 = ins, y0 = ins, x1 = MW - ins, y1 = LH - ins, pts = [], k, a, cs = [[x1 - rad, y0 + rad, -90], [x1 - rad, y1 - rad, 0], [x0 + rad, y1 - rad, 90], [x0 + rad, y0 + rad, 180]];
      cs.forEach(function (c) { for (k = 0; k <= 8; k++) { a = (c[2] + 90 * k / 8) * Math.PI / 180; pts.push([c[0] + rad * Math.cos(a), c[1] + rad * Math.sin(a)]); } });
      pts.push(pts[0]);
      var len = [0];
      for (k = 1; k < pts.length; k++) len.push(len[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
      return { pts: pts, len: len, tot: len[len.length - 1] };
    }
    return [{ p: rr(34, 30), lw: 7 }, { p: rr(54, 16), lw: 2.6 }];
  };
  Lavoro.prototype.prepara = function (testo) {
    var c = this.testoC.getContext('2d'), righe = dividi(testo);
    c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#000'; c.fillRect(0, 0, MW, MH);
    c.setTransform(1, 0, 0, SY, 0, 0);
    if (this.blurOk) c.filter = 'blur(1.3px)';
    c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle';
    var maxW = MW * 0.74, size = righe.length > 1 ? LH * 0.21 : LH * 0.29, i;
    c.font = '700 ' + size + 'px ' + this.font;
    var larg = Math.max.apply(null, righe.map(function (r) { return c.measureText(r).width; }));
    if (larg > maxW) { size *= maxW / larg; c.font = '700 ' + size + 'px ' + this.font; }
    var lh = size * 1.12, y0 = LH / 2 - (righe.length - 1) * lh / 2 + size * 0.04;
    for (i = 0; i < righe.length; i++) c.fillText(righe[i], MW / 2, y0 + i * lh);
    c.filter = 'none'; c.setTransform(1, 0, 0, 1, 0, 0);
    this.dati = c.getImageData(0, 0, MW, MH).data;
    /* bande della scansione: solo dove c'è qualcosa da incidere */
    var passo = 3, bande = [], y, x, mn, mx, d = this.dati;
    for (y = 0; y < MH; y += passo) {
      mn = -1; mx = -1;
      var ym = Math.min(MH - 1, y + 1);
      for (x = 0; x < MW; x += 2) if (d[(ym * MW + x) * 4] > 24) { if (mn < 0) mn = x; mx = x; }
      if (mn >= 0) bande.push({ y: y, h: passo, a: Math.max(0, mn - 6), b: Math.min(MW, mx + 8) });
    }
    this.bande = bande;
    this.cornici = this.percorsi();
    this.rc.setTransform(1, 0, 0, 1, 0, 0); this.rc.fillStyle = '#000'; this.rc.fillRect(0, 0, MW, MH);
    this.fase = 0; this.t = 0; this.fatte = 0;
    this.tCornice = [0.85, 0.6];
    this.tBanda = bande.length ? Math.min(0.06, 3.0 / bande.length) : 0;
  };
  /* avanza la lavorazione di dt secondi; ritorna lo stato del laser */
  Lavoro.prototype.avanza = function (dt) {
    var rc = this.rc;
    rc.globalCompositeOperation = 'lighten';
    var out = { acceso: false, x: 0, y: 0, dir: 0, riga: 0, finito: false };
    if (this.fase < 2) {
      var cf = this.cornici[this.fase], dur = this.tCornice[this.fase];
      this.t += dt;
      var f = clamp(this.t / dur, 0, 1), L = cf.p.tot * f;
      rc.strokeStyle = '#fff'; rc.lineWidth = cf.lw; rc.lineJoin = 'round'; rc.lineCap = 'round';
      if (this.blurOk) rc.filter = 'blur(1.2px)';
      rc.setTransform(1, 0, 0, SY, 0, 0);
      rc.setLineDash([L + 0.01, cf.p.tot + 10]);
      rc.beginPath(); cf.p.pts.forEach(function (p, i) { if (i) rc.lineTo(p[0], p[1]); else rc.moveTo(p[0], p[1]); }); rc.stroke();
      rc.setLineDash([]); rc.filter = 'none'; rc.setTransform(1, 0, 0, 1, 0, 0);
      var pos = puntoA(cf.p, L);
      out.acceso = true; out.x = pos[0]; out.y = pos[1] * SY;
      if (f >= 1) { this.fase++; this.t = 0; }
    } else if (this.fase === 2) {
      this.t += dt;
      var k = Math.floor(this.t / this.tBanda), i;
      if (k >= this.bande.length) { rc.drawImage(this.testoC, 0, 0); this.fase = 3; out.finito = true; rc.globalCompositeOperation = 'source-over'; return out; }
      for (i = this.fatte || 0; i < k; i++) { var bd = this.bande[i]; rc.drawImage(this.testoC, 0, bd.y, MW, bd.h, 0, bd.y, MW, bd.h); }
      this.fatte = k;
      var b = this.bande[k], fr = (this.t - k * this.tBanda) / this.tBanda, dir = k % 2 ? -1 : 1;
      var x = dir > 0 ? b.a + (b.b - b.a) * fr : b.b - (b.b - b.a) * fr;
      if (dir > 0) rc.drawImage(this.testoC, b.a, b.y, Math.max(1, x - b.a), b.h, b.a, b.y, Math.max(1, x - b.a), b.h);
      else rc.drawImage(this.testoC, x, b.y, Math.max(1, b.b - x), b.h, x, b.y, Math.max(1, b.b - x), b.h);
      var xi = clamp(Math.round(x), 0, MW - 1), yi = Math.min(MH - 1, b.y + 1);
      out.acceso = this.dati[(yi * MW + xi) * 4] > 60;
      out.x = x; out.y = b.y + 1; out.dir = dir; out.riga = 1;
    } else { out.finito = true; }
    rc.globalCompositeOperation = 'source-over';
    return out;
  };
  Lavoro.prototype.completa = function () {
    this.prepara(this.ultimo || '');
    var rc = this.rc, self = this;
    rc.globalCompositeOperation = 'lighten';
    this.cornici.forEach(function (cf) {
      rc.strokeStyle = '#fff'; rc.lineWidth = cf.lw; rc.lineJoin = 'round';
      if (self.blurOk) rc.filter = 'blur(1.2px)';
      rc.setTransform(1, 0, 0, SY, 0, 0);
      rc.beginPath(); cf.p.pts.forEach(function (p, i) { if (i) rc.lineTo(p[0], p[1]); else rc.moveTo(p[0], p[1]); }); rc.stroke();
      rc.filter = 'none'; rc.setTransform(1, 0, 0, 1, 0, 0);
    });
    rc.drawImage(this.testoC, 0, 0);
    rc.globalCompositeOperation = 'source-over';
    this.fase = 3;
  };
  function puntoA(p, L) {
    for (var k = 1; k < p.len.length; k++) if (p.len[k] >= L) {
      var t = (L - p.len[k - 1]) / ((p.len[k] - p.len[k - 1]) || 1), a = p.pts[k - 1], b = p.pts[k];
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    }
    return p.pts[p.pts.length - 1];
  }
  function dividi(t) {
    t = (t || '').replace(/\s+/g, ' ').trim();
    if (t.length <= 14 || t.indexOf(' ') < 0) return [t];
    var meta = t.length / 2, best = -1, i;
    for (i = 0; i < t.length; i++) if (t[i] === ' ' && (best < 0 || Math.abs(i - meta) < Math.abs(best - meta))) best = i;
    return [t.slice(0, best), t.slice(best + 1)];
  }

  /* ---------- la scena ---------- */
  function Scena(canvas, opz) {
    var gl = canvas.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'high-performance' }) ||
             canvas.getContext('experimental-webgl', { antialias: true, alpha: true });
    if (!gl) throw new Error('webgl');
    this.gl = gl; this.cv = canvas; this.opz = opz;
    this.fermo = !!opz.fermo;
    this.mobile = !!opz.mobile;
    this.pT = compila(gl, VS_TARGA, FS_TARGA);
    this.pO = compila(gl, VS_OMBRA, FS_OMBRA);
    this.pR = compila(gl, VS_RAGGIO, FS_RAGGIO);
    this.pP = compila(gl, VS_PUNTI, FS_PUNTI);
    var geo = geometria();
    this.nV = geo.length / 9;
    this.bT = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.bT); gl.bufferData(gl.ARRAY_BUFFER, geo, gl.STATIC_DRAW);
    var hw = W / 2 + 0.25, hh = H / 2 + 0.25;
    this.bO = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, this.bO);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-hw, -hh, hw, -hh, hw, hh, -hw, -hh, hw, hh, -hw, hh]), gl.STATIC_DRAW);
    this.bR = gl.createBuffer(); this.bP = gl.createBuffer(); this.bF = gl.createBuffer();
    this.tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    this.lav = new Lavoro(opz.font);
    this.mat = 0; this.fxNome = 'legno';
    this.rot = { x: 0, y: 0, tx: 0, ty: 0, hx: 0, hy: 0 };
    this.scint = []; this.fumo = [];
    this.laser = { x: 0.5, y: 0.5, i: 0, dir: 0, riga: 0 };
    this.lavora = false; this.tempo = 0; this.ultimaAttivita = 0;
    this.carica();
  }
  Scena.prototype.carica = function () {
    var gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.lav.rivela);
    gl.generateMipmap(gl.TEXTURE_2D);
  };
  Scena.prototype.incidi = function (testo) {
    this.lav.ultimo = testo;
    this.lav.prepara(testo);
    if (this.fermo) { this.lav.completa(); this.lavora = false; }
    else { this.lavora = true; }
    this.carica(); this.sveglia();
  };
  Scena.prototype.materiale = function (nome) {
    var i = MATERIALI.indexOf(nome); if (i < 0) i = 0;
    this.mat = i; this.fxNome = MATERIALI[i]; this.sveglia();
  };
  Scena.prototype.sveglia = function () { this.ultimaAttivita = this.tempo; if (this.onSveglia) this.onSveglia(); };
  Scena.prototype.dimensiona = function () {
    var r = this.cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, this.mobile ? 1.6 : 2);
    var w = Math.max(2, Math.round(r.width * dpr)), h = Math.max(2, Math.round(r.height * dpr));
    if (this.cv.width !== w || this.cv.height !== h) { this.cv.width = w; this.cv.height = h; }
    this.asp = r.width / Math.max(1, r.height);
  };
  Scena.prototype.matrici = function () {
    var fy = 30 * Math.PI / 180, th = Math.tan(fy / 2);
    var d = Math.max(1.22 / (th * this.asp), 0.86 / th, 2.7);
    this.cam = [0, 0.12 * d / 3.4, d];
    this.P = persp(fy, this.asp, 0.1, 30);
    this.V = lookAt(this.cam, [0, 0, 0], [0, 1, 0]);
    this.VP = mul(this.P, this.V);
    var sway = this.fermo ? 0 : Math.sin(this.tempo * 0.45) * 0.05;
    var ry = -0.22 + this.rot.y + this.rot.hy + sway, rx = -0.34 + this.rot.x + this.rot.hx;
    this.M = mul(rotY(ry), rotX(rx));
    this.NM = nm3(this.M);
    this.tx = tv(this.M, [1, 0, 0]); this.ty = tv(this.M, [0, 1, 0]); this.tz = tv(this.M, [0, 0, 1]);
  };
  Scena.prototype.puntoMondo = function (u, v, z) { return tp(this.M, [(u - 0.5) * W, (v - 0.5) * H, z]); };

  Scena.prototype.passo = function (dt) {
    this.tempo += dt;
    var r = this.rot, k = 1 - Math.pow(0.0015, dt);
    r.x += (r.tx - r.x) * k; r.y += (r.ty - r.y) * k;
    if (this.lavora) {
      var st = this.lav.avanza(dt);
      this.carica();
      this.laser.x = st.x / MW; this.laser.y = 1 - st.y / MH; this.laser.dir = st.dir; this.laser.riga = st.riga;
      var target = st.acceso ? 1 : 0.18;
      this.laser.i += (target - this.laser.i) * Math.min(1, dt * 30);
      if (st.finito) { this.lavora = false; if (this.onFine) this.onFine(); }
      this.ultimaAttivita = this.tempo;
      this.matrici();
      if (st.acceso) this.emetti(dt);
    } else {
      this.laser.i = Math.max(0, this.laser.i - dt * 3);
      this.matrici();
    }
    this.particelle(dt);
  };
  Scena.prototype.emetti = function (dt) {
    var fx = FX[this.fxNome], p = this.puntoMondo(this.laser.x, this.laser.y, T / 2 + 0.002), n = this.tz, i;
    var molt = this.mobile ? 0.5 : 1;
    var ns = conta(fx.scintille * dt * molt), nf = conta(fx.fumo * dt * molt);
    for (i = 0; i < ns; i++) {
      if (this.scint.length > 500) break;
      var a = Math.random() * Math.PI * 2, s = 0.25 + Math.random() * 0.9, up = 0.4 + Math.random() * 1.3;
      this.scint.push({ p: p.slice(), v: [n[0] * up + (this.tx[0] * Math.cos(a) + this.ty[0] * Math.sin(a)) * s, n[1] * up + (this.tx[1] * Math.cos(a) + this.ty[1] * Math.sin(a)) * s, n[2] * up + (this.tx[2] * Math.cos(a) + this.ty[2] * Math.sin(a)) * s], t: 0, vita: 0.18 + Math.random() * 0.5, s: 0.010 + Math.random() * 0.014, c: fx.scCol });
    }
    for (i = 0; i < nf; i++) {
      if (this.fumo.length > 120) break;
      this.fumo.push({ p: p.slice(), v: [n[0] * 0.18 + (Math.random() - 0.5) * 0.06, n[1] * 0.18 + 0.12, n[2] * 0.18 + (Math.random() - 0.5) * 0.06], t: 0, vita: 1.2 + Math.random() * 1.2, s: 0.05 + Math.random() * 0.05, c: fx.fumoCol });
    }
  };
  /* 3,4 al secondo diventa 3 oppure 4, in media giusto */
  function conta(x) { var n = Math.floor(x); return Math.min(40, n + (Math.random() < x - n ? 1 : 0)); }
  Scena.prototype.particelle = function (dt) {
    var i, s;
    for (i = this.scint.length - 1; i >= 0; i--) {
      s = this.scint[i]; s.t += dt;
      if (s.t > s.vita) { this.scint.splice(i, 1); continue; }
      s.v[1] -= 3.4 * dt; s.v[0] *= 0.985; s.v[2] *= 0.985;
      s.p[0] += s.v[0] * dt; s.p[1] += s.v[1] * dt; s.p[2] += s.v[2] * dt;
    }
    for (i = this.fumo.length - 1; i >= 0; i--) {
      s = this.fumo[i]; s.t += dt;
      if (s.t > s.vita) { this.fumo.splice(i, 1); continue; }
      s.v[0] += (Math.random() - 0.5) * 0.08 * dt; s.v[1] += 0.05 * dt;
      s.p[0] += s.v[0] * dt; s.p[1] += s.v[1] * dt; s.p[2] += s.v[2] * dt; s.s += dt * 0.09;
    }
  };
  Scena.prototype.vivo = function () {
    return this.lavora || this.scint.length || this.fumo.length || this.laser.i > 0.01 ||
      Math.abs(this.rot.tx - this.rot.x) > 1e-3 || Math.abs(this.rot.ty - this.rot.y) > 1e-3 || (this.tempo - this.ultimaAttivita) < 6;
  };

  Scena.prototype.disegna = function () {
    var gl = this.gl, c = this.cv;
    gl.viewport(0, 0, c.width, c.height);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /* ombra morbida dietro la targa */
    gl.disable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    var o = this.pO; gl.useProgram(o.p);
    gl.uniformMatrix4fv(o.u.uModel, false, this.M); gl.uniformMatrix4fv(o.u.uVP, false, this.VP);
    gl.uniform3f(o.u.uHalf, W / 2, H / 2, R);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bO); gl.enableVertexAttribArray(o.a.aP); gl.vertexAttribPointer(o.a.aP, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6); gl.disableVertexAttribArray(o.a.aP);

    /* targa */
    gl.disable(gl.BLEND); gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);
    var p = this.pT; gl.useProgram(p.p);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bT);
    var st = 36;
    [['aPos', 3, 0], ['aNor', 3, 12], ['aUv', 2, 24], ['aKind', 1, 32]].forEach(function (a) {
      if (p.a[a[0]] === undefined || p.a[a[0]] < 0) return;
      gl.enableVertexAttribArray(p.a[a[0]]); gl.vertexAttribPointer(p.a[a[0]], a[1], gl.FLOAT, false, st, a[2]);
    });
    gl.uniformMatrix4fv(p.u.uModel, false, this.M); gl.uniformMatrix4fv(p.u.uVP, false, this.VP);
    gl.uniformMatrix3fv(p.u.uNM, false, this.NM);
    gl.uniform2f(p.u.uTexel, 1 / MW, 1 / MH); gl.uniform1f(p.u.uMat, this.mat);
    gl.uniform3f(p.u.uLaser, this.laser.x, this.laser.y, this.laser.i);
    gl.uniform2f(p.u.uScan, this.laser.dir, this.laser.riga ? 2.2 / MH : 0);
    gl.uniform3fv(p.u.uCam, this.cam); gl.uniform3fv(p.u.uTx, this.tx); gl.uniform3fv(p.u.uTy, this.ty);
    gl.uniform1f(p.u.uAsp, W / H);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, this.tex); gl.uniform1i(p.u.uMask, 0);
    gl.drawArrays(gl.TRIANGLES, 0, this.nV);
    ['aPos', 'aNor', 'aUv', 'aKind'].forEach(function (n) { if (p.a[n] >= 0 && p.a[n] !== undefined) gl.disableVertexAttribArray(p.a[n]); });
    gl.disable(gl.CULL_FACE);

    /* raggio, bagliore e scintille: luce che si somma */
    gl.enable(gl.BLEND); gl.depthMask(false);
    if (this.laser.i > 0.01) {
      var a = this.puntoMondo(this.laser.x, this.laser.y, T / 2), b = [a[0] + this.tz[0] * 1.5, a[1] + this.tz[1] * 1.5, a[2] + this.tz[2] * 1.5];
      var ax = norm([b[0] - a[0], b[1] - a[1], b[2] - a[2]]), vw = norm([this.cam[0] - a[0], this.cam[1] - a[1], this.cam[2] - a[2]]);
      var sd = norm(cross(ax, vw)), wd = 0.03;
      var q = [];
      function v(P, s, t) { q.push(P[0] + sd[0] * s * wd, P[1] + sd[1] * s * wd, P[2] + sd[2] * s * wd, s, t); }
      v(a, -1, 0); v(a, 1, 0); v(b, 1, 1); v(a, -1, 0); v(b, 1, 1); v(b, -1, 1);
      var r = this.pR; gl.useProgram(r.p); gl.blendFunc(gl.ONE, gl.ONE);
      gl.bindBuffer(gl.ARRAY_BUFFER, this.bR); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(q), gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(r.a.aPos); gl.vertexAttribPointer(r.a.aPos, 3, gl.FLOAT, false, 20, 0);
      gl.enableVertexAttribArray(r.a.aQ); gl.vertexAttribPointer(r.a.aQ, 2, gl.FLOAT, false, 20, 12);
      gl.uniformMatrix4fv(r.u.uVP, false, this.VP); gl.uniform1f(r.u.uI, this.laser.i * 0.9);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.disableVertexAttribArray(r.a.aPos); gl.disableVertexAttribArray(r.a.aQ);
    }
    var px = c.height * 0.5 * this.P[5];
    /* fumo (si mescola, non si somma) */
    if (this.fumo.length) {
      var f = [], self = this;
      this.fumo.forEach(function (s) { var k = s.t / s.vita, al = Math.sin(Math.PI * k) * 0.10; f.push(s.p[0], s.p[1], s.p[2], s.c[0], s.c[1], s.c[2], al, s.s); });
      this.punti(f, px, 1, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    }
    /* scintille + bagliore */
    var sc = [];
    this.scint.forEach(function (s) {
      var k = s.t / s.vita, col;
      if (s.c === 2) col = [1, 1 - k * 0.3, 0.85 - k * 0.5];
      else col = k < 0.3 ? [1, 0.92, 0.65] : k < 0.65 ? [1, 0.55, 0.16] : [0.75, 0.18, 0.04];
      sc.push(s.p[0], s.p[1], s.p[2], col[0], col[1], col[2], 1 - k * k, s.s * (1 - k * 0.5));
    });
    if (this.laser.i > 0.01) {
      var g = this.puntoMondo(this.laser.x, this.laser.y, T / 2 + 0.01);
      sc.push(g[0], g[1], g[2], 1, 0.5, 0.16, 0.55 * this.laser.i, 0.22);
      sc.push(g[0], g[1], g[2], 1, 0.95, 0.85, 0.9 * this.laser.i, 0.045);
    }
    if (sc.length) this.punti(sc, px, 0.35, gl.ONE, gl.ONE);
    gl.depthMask(true); gl.disable(gl.BLEND);
  };
  Scena.prototype.punti = function (arr, px, soft, s, d) {
    var gl = this.gl, p = this.pP;
    gl.useProgram(p.p); gl.blendFunc(s, d);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.bP); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(p.a.aPos); gl.vertexAttribPointer(p.a.aPos, 3, gl.FLOAT, false, 32, 0);
    gl.enableVertexAttribArray(p.a.aCol); gl.vertexAttribPointer(p.a.aCol, 4, gl.FLOAT, false, 32, 12);
    gl.enableVertexAttribArray(p.a.aSize); gl.vertexAttribPointer(p.a.aSize, 1, gl.FLOAT, false, 32, 28);
    gl.uniformMatrix4fv(p.u.uVP, false, this.VP); gl.uniform1f(p.u.uPx, px); gl.uniform1f(p.u.uSoft, soft);
    gl.drawArrays(gl.POINTS, 0, arr.length / 8);
    gl.disableVertexAttribArray(p.a.aPos); gl.disableVertexAttribArray(p.a.aCol); gl.disableVertexAttribArray(p.a.aSize);
  };

  /* ---------- collegamento alla pagina ---------- */
  function lingua() { return /^en/i.test(document.documentElement.lang || '') ? 'en' : 'it'; }
  function testo(k, it, en) {
    var D = window.INGLY && window.INGLY.D, l = lingua();
    return (D && D[l] && D[l][k]) || (l === 'en' ? en : it);
  }
  var WA = 'https://wa.me/393296904627?text=';

  function avvia() {
    var root = document.getElementById('rs3d');
    if (!root || root.dataset.pronto) return;
    root.dataset.pronto = '1';
    var form = document.getElementById('rs3dForm'), inp = document.getElementById('rs3dText'),
        idea = document.getElementById('rs3dIdea'), wa = document.getElementById('rs3dWa'),
        stage = document.getElementById('rs3dStage'), cv = document.getElementById('rs3dCanvas'),
        rif = document.getElementById('rs3dReplay');
    if (!form || !inp || !stage || !cv) return;

    function scritta() { return inp.value.replace(/[\u0000-\u001f]/g, '').trim() || testo('rs3dDefault', 'Il tuo nome', 'Your name'); }
    function matScelto() { var r = form.querySelector('input[name="rs3dMat"]:checked'); return r ? r : null; }
    function componi() {
      var r = matScelto(), nomeMat = r ? (r.closest('label').textContent || '').trim().toLowerCase() : '';
      var t = inp.value.trim();
      var base = testo('rs3dIdea', 'Targa in {m} con incisione «{t}»', '{m} plaque engraved with "{t}"');
      if (!t) base = testo('rs3dIdeaVuota', 'Targa in {m} incisa al laser', 'Laser-engraved {m} plaque');
      return base.replace('{m}', nomeMat).replace('{t}', t);
    }
    function aggiornaLink() {
      var i = componi();
      if (idea) idea.value = i;
      if (wa) wa.href = WA + encodeURIComponent(testo('rs3dWaMsg', 'Ciao INGLY, vorrei un preventivo: ', 'Hi INGLY, I would like a quote: ') + i);
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      aggiornaLink();
      var url = (form.getAttribute('action') || 'quote/') + '?idea=' + encodeURIComponent(idea ? idea.value : componi());
      window.location.assign(url);
    });
    aggiornaLink();

    var scena = null;
    var ridotto = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var mobile = window.matchMedia && window.matchMedia('(max-width: 820px)').matches;
    function fallisci(err) {
      stage.classList.add('rs3d--foto'); stage.classList.remove('rs3d--vivo');
      if (err && window.console) console.warn('[INGLY 3D]', err.message || err);
      scena = null;
    }

    var visibile = false, raf = 0, ultimo = 0, partito = false;
    function ciclo(t) {
      raf = 0;
      if (!scena || !visibile || document.hidden) return;
      var dt = ultimo ? Math.min(0.05, (t - ultimo) / 1000) : 0.016; ultimo = t;
      scena.dimensiona(); scena.passo(dt); scena.disegna();
      if (scena.vivo() || !ridotto) raf = requestAnimationFrame(ciclo);
      else ultimo = 0;
    }
    function vai() { if (!raf && scena && visibile && !document.hidden) { ultimo = 0; raf = requestAnimationFrame(ciclo); } }

    function crea() {
      if (scena || stage.classList.contains('rs3d--foto')) return;
      try {
        scena = new Scena(cv, { font: "'Assistant', system-ui, sans-serif", fermo: ridotto, mobile: mobile });
      } catch (e) { fallisci(e); return; }
      scena.onSveglia = vai;
      scena.onFine = function () { stage.classList.add('rs3d--finito'); };
      cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); fallisci(new Error('contesto perso')); });
      var m = matScelto(); scena.materiale(m ? m.value : 'legno');
      var pronto = document.fonts && document.fonts.load ? document.fonts.load("700 80px 'Assistant'") : Promise.resolve();
      pronto.catch(function () {}).then(function () {
        if (!scena) return;
        scena.dimensiona(); scena.matrici();
        stage.classList.add('rs3d--vivo');
        setTimeout(function () { if (scena) { partito = true; scena.incidi(scritta()); vai(); } }, ridotto ? 0 : 350);
      });
    }

    /* scrivere un nome lo incide di nuovo (dopo una breve pausa) */
    var attesa = 0;
    inp.addEventListener('input', function () {
      aggiornaLink();
      clearTimeout(attesa);
      attesa = setTimeout(function () { if (scena && partito) { stage.classList.remove('rs3d--finito'); scena.incidi(scritta()); } }, 650);
    });
    form.addEventListener('change', function (e) {
      if (e.target && e.target.name === 'rs3dMat') { aggiornaLink(); if (scena) scena.materiale(e.target.value); }
    });
    if (rif) rif.addEventListener('click', function () { if (scena) { stage.classList.remove('rs3d--finito'); scena.incidi(scritta()); } });

    /* trascina per ruotare; col mouse la targa segue appena il puntatore */
    var drag = null;
    cv.addEventListener('pointerdown', function (e) {
      if (!scena) return;
      drag = { x: e.clientX, y: e.clientY, rx: scena.rot.tx, ry: scena.rot.ty, id: e.pointerId };
      try { cv.setPointerCapture(e.pointerId); } catch (_) {}
      stage.classList.add('rs3d--presa');
    });
    cv.addEventListener('pointermove', function (e) {
      if (!scena) return;
      if (drag && drag.id === e.pointerId) {
        scena.rot.ty = clamp(drag.ry + (e.clientX - drag.x) * 0.008, -0.75, 0.75);
        scena.rot.tx = clamp(drag.rx + (e.clientY - drag.y) * 0.006, -0.45, 0.5);
        scena.sveglia();
      } else if (e.pointerType === 'mouse' && !ridotto) {
        var r = cv.getBoundingClientRect();
        scena.rot.hy = ((e.clientX - r.left) / r.width - 0.5) * 0.16;
        scena.rot.hx = ((e.clientY - r.top) / r.height - 0.5) * 0.10;
        scena.sveglia();
      }
    });
    function lascia() { drag = null; stage.classList.remove('rs3d--presa'); }
    cv.addEventListener('pointerup', lascia); cv.addEventListener('pointercancel', lascia);
    cv.addEventListener('pointerleave', function () { if (scena && !drag) { scena.rot.hx = 0; scena.rot.hy = 0; scena.sveglia(); } });

    /* parte solo quando l'apertura è sullo schermo; si ferma quando esce */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (ents) {
        visibile = ents[0].isIntersecting;
        if (visibile) { crea(); vai(); }
      }, { rootMargin: '120px' }).observe(stage);
    } else { visibile = true; crea(); vai(); }
    document.addEventListener('visibilitychange', vai);
    window.addEventListener('resize', function () { if (scena) scena.sveglia(); }, { passive: true });
  }

  window.INGLY_3D = { Scena: Scena, dividi: dividi, MATERIALI: MATERIALI };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avvia, { once: true });
  else avvia();
})();
