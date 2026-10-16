import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {readFileSync} from 'node:fs';
import {validateStaticSvg} from '../assets/js/admin/svg-upload-safety.js';
const Parser=new JSDOM('').window.DOMParser;
const check=markup=>validateStaticSvg(markup,Parser);
const root='xmlns="http://www.w3.org/2000/svg"';
const safe='<svg '+root+' viewBox="0 0 100 100"><defs><linearGradient id="g"><stop offset="0%" stop-color="#fff"/></linearGradient></defs><path d="M0 0L100 0L100 100Z" fill="url(#g)" stroke="black"/><text x="5" y="8">INGLY</text></svg>';
assert.equal(check(safe),true,'Valid vector logo and internal gradient accepted');
assert.equal(check('<svg '+root+'><g style="fill:#fff;stroke:#111"><rect x="0" y="0" width="4" height="4"/></g></svg>'),true,'Safe inline style accepted');
const unsafe=[
 ['script','<svg '+root+'><script>alert(1)</script></svg>'],
 ['foreignObject','<svg '+root+'><foreignObject><div xmlns="http://www.w3.org/1999/xhtml">x</div></foreignObject></svg>'],
 ['event','<svg '+root+' onload="alert(1)"><rect width="3"/></svg>'],
 ['external','<svg '+root+'><use href="https://evil.invalid/x.svg#y"/></svg>'],
 ['protocol','<svg '+root+'><use href="javascript:alert(1)"/></svg>'],
 ['style css url','<svg '+root+'><rect style="fill:url(https://evil.invalid/img)"/></svg>'],
 ['style expression','<svg '+root+'><rect style="color:expression(alert(1))"/></svg>'],
 ['foreign-image','<svg '+root+'><image href="https://evil.invalid/pixel.png"/></svg>'],
 ['doctype','<!DOCTYPE svg [<!ENTITY e SYSTEM "file:///etc/passwd">]><svg '+root+'/>'],
 ['xml pi','<?xml-stylesheet href="https://evil.invalid/x.css"?><svg '+root+'/>'],
 ['invalid','<svg '+root+'><broken></svg>']
];
for(const [why,input] of unsafe)assert.throws(()=>check(input),Error,'Rejected: '+why);
const admin=readFileSync('admin.html','utf8');
assert.match(admin,/validateStaticSvg\(new TextDecoder/,'Media pipeline validates before staging');
assert.match(admin,/SVG non accettato/,'Single SVG upload errors visible');
assert.match(admin,/File non accettato/,'Batch SVG upload errors visible');
console.log('✔ Admin media: static vector accepted, 11 potentially executable SVG patterns rejected');
