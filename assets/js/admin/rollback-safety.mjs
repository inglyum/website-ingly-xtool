/* INGLY Admin: pure atomic snapshot validation.
   Historic media binaries are not restored by this JSON-only operation. */
export const RESTORE_TYPES={
 config:'object',texts:'object',social:'array',products:'array',
 categories:'array',content:'object',materiali:'object',
 tecnologie:'object',macchine:'object',corsi:'object',
 collezioni:'object',immagini:'object','immagini-macchine':'object',digitale:'object'
};
const record=v=>!!v&&typeof v==='object'&&!Array.isArray(v);
export function checkRestoreSnapshot(files,results){
 const errors=[],data={};
 if(!Array.isArray(files)||!Array.isArray(results)||files.length!==results.length)
  return {ok:false,errors:['Elenco file e risposte incompleti'],data:null};
 const seen=new Set();
 files.forEach((file,i)=>{
  if(seen.has(file)){errors.push('File duplicato: '+file);return}
  seen.add(file);
  const expected=RESTORE_TYPES[file],result=results[i];
  if(!expected){errors.push('File non riconosciuto: '+file);return}
  if(!result||result.status!=='fulfilled'){
   errors.push('File non accessibile nel commit: '+file+'.json');return
  }
  const value=result.value;
  if(expected==='array'?!Array.isArray(value):!record(value)){
   errors.push('Formato non valido: '+file+'.json (atteso '+expected+')');return
  }
  data[file]=value;
 });
 for(const file of Object.keys(RESTORE_TYPES))
  if(!seen.has(file))errors.push('File obbligatorio mancante: '+file+'.json');
 return errors.length?{ok:false,errors,data:null}:{ok:true,errors:[],data};
}
