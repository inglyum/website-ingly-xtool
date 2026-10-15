import {chromium} from 'playwright';
import {writeFile,mkdir} from 'node:fs/promises';
const base=process.env.INGLY_TEST_URL||'http://127.0.0.1:8080';
const out='artifacts/contrast-audit';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const selectors=['#nav .brand-lockup small','#nav .ia-barra .ia-voce','#page-home h1','#page-shop h1','footer .ft-col--brand small','.pcard .pbody h3','.pcard .mat','#v-dash h1','#v-dash h2'];
const entries=[];
try{
 for(const mode of ['dark','light']){
  const ctx=await browser.newContext({viewport:{width:1440,height:900},colorScheme:mode==='dark'?'dark':'light'});
  await ctx.addInitScript(value=>{try{localStorage.setItem('ingly_mode',value)}catch{}},mode);
  for(const path of ['/','/shop/','/admin.html']){
   const page=await ctx.newPage();
   try{
    await page.goto(base+path,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(650);
    const samples=await page.evaluate(sels=>{
      const parseColor=str=>{
        const m=String(str).match(/rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s\/]+([\d.]+))?/i);
        return m?[+m[1],+m[2],+m[3],m[4]===undefined?1:+m[4]]:null
      };
      const luminance=v=>{
       const z=v.slice(0,3).map(x=>{x/=255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});
       return z[0]*.2126+z[1]*.7152+z[2]*.0722;
      };
      const blend=(fg,bg)=>fg.slice(0,3).map((v,i)=>v*fg[3]+bg[i]*(1-fg[3]));
      const background=el=>{
        let rgb=[255,255,255];
        const layers=[];
        let complex=false;
        for(let n=el;n;n=n.parentElement){
          const css=getComputedStyle(n);
          if(css.backgroundImage!=='none')complex=true;
          const color=parseColor(css.backgroundColor);
          if(color&&color[3]>0)layers.unshift(color);
        }
        for(const layer of layers)rgb=blend(layer,rgb);
        return {rgb,complex};
      };
      return sels.flatMap(selector=>[...document.querySelectorAll(selector)].slice(0,2).map(el=>{
        const rect=el.getBoundingClientRect(),css=getComputedStyle(el);
        const fg=parseColor(css.color),backgroundInfo=background(el);
        if(css.display==='none'||css.visibility==='hidden'||!rect.width||!rect.height||!fg||!backgroundInfo)return null;
        const bg=backgroundInfo.rgb;
        const front=blend(fg,bg),a=luminance(front),b=luminance(bg);
        const ratio=+( (Math.max(a,b)+.05)/(Math.min(a,b)+.05) ).toFixed(2);
        const size=parseFloat(css.fontSize),bold=/bold|[6-9]00/.test(css.fontWeight);
        const large=size>=24||(size>=18.66&&bold);
        return {selector,text:el.textContent.trim().slice(0,65),ratio,threshold:large?3:4.5,
                fg:css.color,bg:bg.map(Math.round),fontSize:size,
                complexBackground:backgroundInfo.complex,
                passes:ratio>=(large?3:4.5)};
       }).filter(Boolean));
    },selectors);
    for(const sample of samples)entries.push({page:path,mode,...sample});
   }finally{await page.close()}
  }
  await ctx.close();
 }
}finally{await browser.close()}
const fails=entries.filter(e=>!e.passes&&!e.complexBackground);
const manual=entries.filter(e=>e.complexBackground);
const report={generatedAt:new Date().toISOString(),method:'Computed foreground color composited over flat ancestors; excludes image backgrounds',samples:entries.length,belowThreshold:fails.length,requiresVisualReview:manual.length,failures:fails,manualReview:manual,entries};
await writeFile(out+'/report.json',JSON.stringify(report,null,2));
console.log('INGLY contrast audit: '+entries.length+' computed text samples; '+fails.length+' solid-background WCAG AA candidates below threshold, '+manual.length+' complex backgrounds requiring visual pixel inspection.');
if(!entries.length){console.error('Contrast audit unexpectedly sampled zero visible text items.');process.exitCode=1}
for(const f of fails.slice(0,20))console.log('REVIEW '+f.mode+' '+f.page+' '+f.selector+' '+f.ratio+':1 target '+f.threshold+':1');
console.log('Gradient/image cases are explicitly marked MANUAL REVIEW: ratios there are approximations, not compliance evidence. Not a WCAG certification.');
