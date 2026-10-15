import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {JSDOM} from 'jsdom';
const src=readFileSync('assets/js/ingly-personalizza-studio.js','utf8');
const html=readFileSync('index.html','utf8');
const main=readFileSync('assets/js/main.js','utf8');
assert.doesNotThrow(()=>new Function(src),'Creator JS syntax');
const dom=new JSDOM('<html><body></body></html>',{
 url:'https://inglyum.github.io/website-ingly-xtool/',
 runScripts:'outside-only'
});
dom.window.eval(src);
const api=dom.window.INGLY_PARAMETRIC_QUOTE;
assert.ok(api&&typeof api.quoteText==='function'&&typeof api.whatsappQuote==='function');
const d={name:'La mia targa',w:185,h:65,material:'acrylic',shape:'ellipse',font:'josefin',notes:'uso interno'};
const it=api.quoteText(d,'it'),en=api.quoteText(d,'en');
assert.match(it,/Richiesta preventivo/);
assert.match(it,/185 × 65 mm/);
assert.match(it,/Plexiglass/);
assert.match(it,/uso interno/);
assert.doesNotMatch(it,/€\s*\d+/,'Prezzi mai inventati');
assert.match(en,/Custom project quotation/);
assert.match(en,/Acrylic/);
const target=api.whatsappQuote('https://wa.me/393296904627',it);
assert.ok(target.startsWith('https://wa.me/393296904627?text='));
assert.equal(new URL(target).searchParams.get('text'),it);
for(const v of ['javascript:alert(1)','http://wa.me/123','https://evil.example/q','data:text/html,hello']){
 assert.equal(api.whatsappQuote(v,it),'','Protocollo o host pericoloso '+v);
}
assert.ok(html.includes('id="inglyGeneratorQuote"')&&html.includes('id="inglyGeneratorNotes"'));
for(const key of ['genQuote','genIntro','genWarning','genProjectNotes','genWood','genPresetName']){
 assert.ok(html.includes('data-inline-i18n="'+key+'"'),'Control not localized: '+key);
 assert.ok(main.includes(key+':{it:'),'Missing translation '+key);
}
assert.match(src,/config\.whatsapp/,'Contatto da config CMS');
assert.match(src,/config\.email/,'Email fallback da config CMS');
console.log('✔ Creator: preventivo multilingue, URL WhatsApp sicura, prezzi non inventati.');
