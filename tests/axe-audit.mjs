/* INGLY accessibility audit — axe-core automation is evidence, not certification.
   Manual VoiceOver/TalkBack and physical device tests remain mandatory. */
import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const root=process.env.INGLY_TEST_URL||'http://127.0.0.1:8080';
const routes=['/','/shop/','/personalizza/','/macchine/','/admin.html'];
const modes=['dark','light'];
const widths=[390,1440];
const out='artifacts/axe-audit';
const all=[];
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
try{
 for(const mode of modes)for(const width of widths){
  const ctx=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});
  await ctx.addInitScript(v=>{try{localStorage.setItem('ingly_mode',v)}catch{}},mode);
  for(const route of routes){
   const page=await ctx.newPage();
   try{
    const res=await page.goto(root+route,{waitUntil:'domcontentloaded',timeout:30000});
    await page.waitForTimeout(650);
    await page.addScriptTag({path:'node_modules/axe-core/axe.min.js'});
    const result=await page.evaluate(async()=>await window.axe.run(document,{
      runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']},
      rules:{'color-contrast':{enabled:true}}
    }));
    const issues=result.violations.map(v=>({
      id:v.id,impact:v.impact,description:v.help,helpUrl:v.helpUrl,
      nodes:v.nodes.slice(0,15).map(n=>({target:n.target,summary:n.failureSummary?.slice(0,400)})),
      affectedNodes:v.nodes.length
    }));
    all.push({route,mode,width,status:res?.status()||null,
      violations:issues.length,critical:issues.filter(i=>i.impact==='critical').length,
      serious:issues.filter(i=>i.impact==='serious').length,issues,
      incomplete:result.incomplete.map(v=>({id:v.id,affectedNodes:v.nodes.length}))
    });
    console.log('AXE '+mode+' '+width+' '+route+': '+issues.length+' violations, '+result.incomplete.length+' inconclusive rules');
   }catch(error){
    all.push({route,mode,width,error:String(error)});
    console.error('AXE ERROR '+mode+' '+width+' '+route+': '+error);
   }finally{await page.close()}
  }
  await ctx.close();
 }
}finally{await browser.close()}
const summary={generatedAt:new Date().toISOString(),scans:all.length,
  errors:all.filter(x=>x.error).length,violations:all.reduce((sum,x)=>sum+(x.violations||0),0),
  requiresManualReview:true,
  notes:'Automated axe-core WCAG 2.0/2.1 A/AA smoke audit. Incomplete checks, images and actual screen-reader operation require human testing.',all};
await writeFile(out+'/report.json',JSON.stringify(summary,null,2));
console.log('AXE SUMMARY: '+summary.scans+' scans, '+summary.violations+' reported rule violations, '+summary.errors+' scan errors.');
if(summary.errors)process.exitCode=1;
/* Existing violations are reported, not ignored. Once triaged, add blocking
   thresholds for critical/serious categories only after verifying exclusions. */
