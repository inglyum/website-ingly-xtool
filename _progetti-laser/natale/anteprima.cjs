/* Anteprima "come viene sul legno" di tutti gli SVG di esempi/ → anteprima.png */
const fs = require('fs'); const path = require('path');
const { chromium } = require('playwright');
const dir = path.join(__dirname, 'esempi');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.svg'));
const card = f => {
  let s = fs.readFileSync(path.join(dir, f), 'utf8').replace(/<\?xml[^>]*>/, '')
    .replace(/width="[\d.]+mm" height="[\d.]+mm"/, '');
  // nell'anteprima il legno va sotto: prima le sagome, poi i fori, poi incisioni e linee
  const prendi = re => (s.match(re) || []).join('');
  const sagome = prendi(/<path class="taglio sagoma"[^>]*\/>/g), fori = prendi(/<path class="taglio foro"[^>]*\/>/g);
  const inc = prendi(/<path class="incisione"[^>]*\/>/g), lin = prendi(/<path class="linea"[^>]*\/>/g);
  s = s.replace(/<g id="1-INCISIONE"[\s\S]*<\/svg>/, sagome + fori + inc + lin + '</svg>');
  return `<figure><div class="pz">${s}</div><figcaption>${f.replace('.svg', '')}</figcaption></figure>`;
};
const html = `<!doctype html><meta charset="utf-8"><style>
body{margin:0;padding:24px;background:#f3eee6;font:600 15px system-ui;color:#3b2a1c}
main{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
figure{margin:0;background:#fff;border-radius:10px;padding:14px;box-shadow:0 1px 3px #0002}
figure.largo{grid-column:span 2}
.pz svg{width:100%;height:240px}
figcaption{text-align:center;margin-top:8px}
.sagoma{fill:#dcb88a;stroke:#9a6e42;stroke-width:.35}
.foro{fill:#fff;stroke:#9a6e42;stroke-width:.35}
.incisione{fill:#4b2e19}
.linea{stroke:#6b4428;stroke-width:.4}
</style><main>${files.map(card).join('').replace(/<figure>(<div class="pz">(?:(?!<\/figure>).)*?(albero-3d|segnaposto-x12))/gs, '<figure class="largo">$1')}</main>`;
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: Number(process.argv[2] || 1) });
  await p.setContent(html); await p.screenshot({ path: path.join(__dirname, process.argv[3] || 'anteprima.png'), fullPage: true }); await b.close();
})();
