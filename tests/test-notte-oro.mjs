import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const rd=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const css=rd('assets/css/notte-oro.css'),html=rd('index.html');
const dark=css.split(':root,:root[data-mode="dark"]{')[1].split('\n}')[0];
const light=css.split(':root[data-mode="light"]{')[1].split('\n}')[0];
const get=(s,key)=>{const re=new RegExp(key+':(#[0-9a-f]{6})','i');const m=s.match(re);assert(m,key+' missing');return m[1]};
const lum=s=>{const rgb=[1,3,5].map(x=>parseInt(s.slice(x,x+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2]};
const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
for(const [name,s] of [['notte',dark],['giorno',light]]){
 for(const [label,a,b] of [['testo','--no-paper','--no-ink'],['secondario','--no-muted','--no-ink'],['pulsante','--no-on-gold','--no-gold']]){
  assert(ratio(get(s,a),get(s,b))>=4.5,name+' '+label+' WCAG AA insufficient');
 }
}
assert(html.includes('assets/css/notte-oro.css'));
assert(html.indexOf('assets/css/notte-oro.css')>html.indexOf('assets/css/atelier-foundation.css'),'last CSS must win');
assert(dark.includes('--no-gold:#e0b06a'),'gold brand token');
assert(dark.includes('--no-laser:#ff8a3d'),'laser only accent');
assert(css.includes('prefers-reduced-motion:reduce'));
console.log('PHASE 1 PASS: Notte/Oro light+dark WCAG contrast and CSS loading');
