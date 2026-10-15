import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const read=path=>readFileSync(path,'utf8');
const html=read('index.html'),admin=read('admin.html');
const css=read('assets/css/brand-system-2026.css');
const adminCss=read('assets/css/admin-brand-system.css');
const dom=new JSDOM(html);
const d=dom.window.document;
for(const [selector,label] of [
 ['#nav .brand-lockup','header'],
 ['footer .ft-col--brand .brand-lockup','footer piccolo'],
 ['footer .ingly-footer-signature','footer gigante']
]){
 const root=d.querySelector(selector);
 assert.ok(root,'Missing '+label);
 assert.equal(root.querySelectorAll('img').length,1,'Two overlapping wordmarks in '+label);
 const img=root.querySelector('img');
 assert.match(img.getAttribute('src'),/ingly-wordmark-light\.svg/);
}
const ad=new JSDOM(admin).window.document;
assert.equal(ad.querySelectorAll('.brand-admin-lockup img').length,1,'Admin duplicated brand');
for(const svg of ['assets/images/ingly-wordmark-light.svg','assets/images/ingly-wordmark-dark.svg']){
 const s=read(svg);
 assert.ok(s.includes('viewBox="-20 125 1470 420"') && s.includes('M1,147 118,147 118,507 1,507Z'),'Logo must have visible leading I and safe clearspace '+svg);
 assert.ok(s.includes('<path fill="currentColor"'),'Logo remains vector');
}
const hero=d.querySelector('#page-macchine > .wrap.phero');
assert.ok(hero?.querySelector('h1.h2')?.textContent.includes('Il parco macchine'));
assert.match(css,/#page-macchine > \.phero > h1\.h2/,'Page-specific max width and wrap');
assert.match(css,/font:650 clamp\(2rem,4\.6vw,4\.1rem\)/,'Desktop heading capped');
assert.match(css,/font-size:clamp\(2rem,8vw,3rem\)/,'Mobile heading capped');
assert.match(css,/#nav\.nav \.brand--identity \.brand-lockup img\.brand-wordmark/,'Specific selector overrides legacy .brand img');
assert.match(css,/border-radius:0!important/,'Wordmark must not be circular');
assert.match(css,/#nav\.nav \.nav-acts \.burger/,'Hamburger available when desktop nav hides');
assert.match(css,/@media\(max-width:1100px\)/,'Tablet menu breakpoint');
assert.match(css,/@media\(max-width:620px\)/,'Mobile branding breakpoint');
assert.match(css,/@media\(max-width:380px\)/,'Tiny phone branding breakpoint');
assert.match(css,/footer \.ingly-footer-signature img\.brand-wordmark/,'Footer watermark must remain single logo');
assert.match(css,/\[data-mode="light"\] #nav\.nav .*img\.brand-wordmark/,'White theme must recolor logo');
assert.match(adminCss,/\[data-mode="light"\] \.brand--admin .*img\.brand-wordmark/,'Admin white theme must recolor logo');
console.log('✔ Header/nav/Macchine: single vector wordmark, mobile menu, controlled title, footer and Admin.');

const navRule=css.match(/#nav\.nav \.nav-in\{([^}]+)\}/)?.[1]||'';
assert.ok(navRule.includes('max-height:84px!important'),'Navbar capped by height');
assert.ok(!navRule.includes('max-width:84px'),'Navbar MUST NOT be capped at 84px width');
