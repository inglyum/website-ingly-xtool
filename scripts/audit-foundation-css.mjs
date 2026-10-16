import {readFileSync,mkdirSync,writeFileSync} from 'node:fs';
const files=['index.html','admin.html'];const loads={};const sheet=new Set();
for(const file of files){const html=readFileSync(file,'utf8');loads[file]=[...html.matchAll(/href="(assets\/css\/[^"]+\.css)"/g)].map(m=>m[1]);for(const p of loads[file])sheet.add(p)}
const groups=new Map();let total=0,important=0;
for(const path of sheet){
 let css=readFileSync(path,'utf8').replace(/\/\*[\s\S]*?\*\//g,'');let re=/([^{}]+)\{([^{}]*)\}/g,m;
 while((m=re.exec(css))){
  const selector=m[1].trim(),body=m[2];
  if(!selector||selector.startsWith('@')||selector.length>200)continue;
  const props=body.split(';').map(x=>x.trim()).filter(x=>x.includes(':')).map(x=>{const p=x.indexOf(':');return [x.slice(0,p).trim(),x.slice(p+1).trim()]});
  if(!props.length)continue;
  total++;important+=(body.match(/!important/g)||[]).length;
  const row=groups.get(selector)||[];row.push({path,props});groups.set(selector,row);
 }
}
const repeated=[...groups.entries()].filter(([k,v])=>v.length>1).map(([selector,rows])=>{
 const props={};for(const row of rows)for(const [p,value] of row.props)(props[p]??=[]).push(value);
 const conflicts=Object.entries(props).filter(([p,values])=>new Set(values).size>1).map(([p])=>p);
 return {selector,count:rows.length,files:[...new Set(rows.map(x=>x.path))],conflicts};
}).sort((a,b)=>b.conflicts.length-a.conflicts.length||b.count-a.count);
const filters={header:/\.nav|\.ia-|\.mobile-menu|\.brand/,cta:/\.btn|\.cta|\.qadd/,card:/\.pcard|\.card|\.dcard/,modal:/\.modal|\.drawer|\.lightbox/,footer:/footer|\.ft-/};
const families={};for(const [name,regex] of Object.entries(filters))families[name]=repeated.filter(x=>regex.test(x.selector)).slice(0,40);
const summary={stylesheets:sheet.size,rulesApprox:total,repeated:repeated.length,withDivergentProperties:repeated.filter(x=>x.conflicts.length).length,importantDeclarations:important};
mkdirSync('artifacts/foundation-css',{recursive:true});
writeFileSync('artifacts/foundation-css/inventory.json',JSON.stringify({summary,loads,families,repeated:repeated.slice(0,120),limitations:'Approximate parser: nested media, :is and specificity require computed-style verification'},null,2));
const lines=['# INGLY Sprint 01 — Inventario CSS','','Static estimate; theme/media overrides are not necessarily errors.','','| Metric | Count |','|---|---:|',...Object.entries(summary).map(x=>'| '+x[0]+' | '+x[1]+' |'),''];
for(const [name,entries] of Object.entries(loads))lines.push('## '+name,...entries.map((v,i)=>(i+1)+'. '+v),'');
for(const [name,rows] of Object.entries(families)){lines.push('## '+name,'','| Selector | Rules | Files | Conflicting properties |','|---|---:|---|---|');for(const x of rows.slice(0,25))lines.push('| '+x.selector.replace(/\|/g,'/')+' | '+x.count+' | '+x.files.join(', ')+' | '+x.conflicts.join(', ')+' |');lines.push('')}
writeFileSync('artifacts/foundation-css/inventory.md',lines.join('\n'));
console.log('CSS INVENTORY '+JSON.stringify(summary));
