#!/usr/bin/env node
// Browser-based WCAG baseline, not a certification.
import {chromium} from 'playwright';
import {readFileSync} from 'node:fs';
import {mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
const root=process.env.INGLY_TEST_URL||'http://127.0.0.1:8080';
const out='artifacts/visual-audit';
const axe=readFileSync('node_modules/axe-core/axe.min.js','utf8');
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[];
try{
 for(const mode of ['dark','light']){
  for(const route of [{name:'Home',path:'/'},{name:'Shop',path:'/shop/'},{name:'Admin',path:'/admin.html'}]){
   const ctx=await browser.newContext({viewport:{width:390,height:850},reducedMotion:'reduce'});
   await ctx.addInitScript(m=>{localStorage.setItem('ingly_mode',m)},mode);
   const page=await ctx.newPage();
   try{
    await page.goto(root+route.path,{waitUntil:'domcontentloaded',timeout:25000});
    await page.waitForTimeout(650);
    await page.addScriptTag({content:axe});
    const scan=await page.evaluate(async()=>await window.axe.run(document,{
      runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']},
      resultTypes:['violations','incomplete']
    }));
    const issues=scan.violations.map(v=>({id:v.id,impact:v.impact,description:v.help,
      elements:v.nodes.slice(0,6).map(n=>({selector:n.target.join(' '),summary:n.failureSummary?.slice(0,200)})),
      count:v.nodes.length}));
    results.push({route:route.name,mode,status:'scanned',violations:issues,
      incomplete:scan.incomplete.map(x=>({id:x.id,count:x.nodes.length}))});
    console.log('AXE '+route.name+' '+mode+': '+issues.length+' types, '+issues.reduce((n,v)=>n+v.count,0)+' elements');
   }catch(e){
    results.push({route:route.name,mode,status:'error',error:String(e)});
    console.error('AXE error '+route.name+' '+mode+': '+e);
   }finally{await ctx.close()}
  }
 }
}finally{await browser.close()}
await writeFile(join(out,'axe-wcag-baseline.json'),JSON.stringify({
 generatedAt:new Date().toISOString(),note:'Automated findings need review; not WCAG certification.',results},null,2));
if(results.some(x=>x.status==='error'))process.exitCode=1;
// Baseline violations documented and triaged separately; no false claim of WCAG conformance.
