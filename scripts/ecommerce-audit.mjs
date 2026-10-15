#!/usr/bin/env node
/* CI / CLI counterpart to Admin Health Center — read-only and deterministic.
   Usage: node scripts/ecommerce-audit.mjs [--json] [--strict]
   --strict fails only on structural critical findings, never on aesthetic
   suggestions or estimates. CI defaults to informational reporting. */
import {readFileSync} from 'node:fs';
import {auditStore} from '../assets/js/ecommerce-quality.mjs';
const rd=p=>JSON.parse(readFileSync(new URL('../data/'+p+'.json',import.meta.url),'utf8'));
const report=auditStore({products:rd('products'),categories:rd('categories'),
  config:rd('config'),digital:rd('digitale'),materials:rd('materiali')});
if(process.argv.includes('--json')){
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
}else{
  console.log('\nINGLY DESIGN — E-commerce Quality Agent (fonte: data/*.json)');
  console.log('Prodotti attivi:',report.metrics.visibleProducts,'di',report.metrics.products);
  console.log('Senza foto:',report.metrics.visibleWithoutPhoto,
    '· Categorie:',report.metrics.categories,
    '· Materiali:',report.metrics.materials);
  console.log('Critici:',report.totals.error,'· Avvisi:',report.totals.warning,
    '· Informativi:',report.totals.info);
  for(const item of report.findings.slice(0,12)){
    console.log('['+item.severity.toUpperCase()+']',item.area,
      item.id?'#'+item.id:'',item.message);
  }
  console.log('Report dettagliato: node scripts/ecommerce-audit.mjs --json');
}
if(process.argv.includes('--strict')&&report.totals.error>0)process.exitCode=1;
