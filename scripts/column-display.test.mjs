import assert from 'node:assert/strict';
import test from 'node:test';
import {readFileSync,readdirSync} from 'node:fs';
import ts from 'typescript';
async function load(file) {
 const {outputText}=ts.transpileModule(readFileSync(file,'utf8'),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.ES2022}});
 return import('data:text/javascript;base64,'+Buffer.from(outputText).toString('base64'));
}
const {columnLabels,getDisplayColumnName:name,getDisplayColumnNames:names}=await load('lib/column-display.ts');
const {buildKumoDataset}=await load('lib/kumo-api.ts');
const {savePlaygroundLanguageState:save,readPlaygroundLanguageState:read,clearPlaygroundLanguageState:clear}=await load('lib/playground-language-state.ts');
const exceptions={'46938':['month'],'46979':['b']};
for(const file of readdirSync('content/datasets').filter(f=>/^\d+\.json$/.test(f))){
 const d=JSON.parse(readFileSync('content/datasets/'+file,'utf8'));
 test('dataset '+d.id+': coverage, English/raw fallback, unchanged input',()=>{
  const raw=JSON.stringify(d);
  const csv={headers:d.headers,rows:d.rows,rowLineNumbers:d.sourceRecords,fileName:'test.csv',size:1};
  const before=buildKumoDataset(csv,d.headers.indexOf(d.target));
  const translated=names(d.headers,'zh',d.id);
  assert.equal(new Set(translated).size,d.headers.length);
  d.headers.forEach((h,i)=>{assert.equal(translated[i],name(h,'zh',d.id));assert.match(translated[i],exceptions[d.id]?.includes(h)?new RegExp('^'+h+'$'):/\p{Script=Han}/u);});
  assert.deepEqual(names(d.headers,'en',d.id),d.headers);
  assert.deepEqual(names(d.headers,'zh'),d.headers);
  assert.deepEqual(buildKumoDataset(csv,d.headers.indexOf(d.target)),before);
  assert.equal(JSON.stringify(d),raw);
  assert(Object.keys(columnLabels[d.id]).every(h=>d.headers.includes(h)));
 });
}
test('blood exact translations, unknown names, scoped meanings and collisions',()=>{
 assert.deepEqual(names(['MonthsSinceLastDonation','NumberOfDonations','TotalBloodDonated','MonthsSinceFirstDonation','DonatedBloodInMarch2007'],'zh','46913'),['距上次献血月数','累计献血次数','累计献血量','距首次献血月数','2007年3月是否献血']);
 assert.equal(name('MonthsSinceLastDonation','zh','46919'),'MonthsSinceLastDonation');
 assert.equal(name('__proto__','zh','46913'),'__proto__');
 assert.equal(name('Age','zh','unknown'),'Age');
 assert.deepEqual(names(['Age','年龄'],'zh','46941'),['年龄（Age）','年龄（年龄）']);
});
test('language handoff is destination-scoped, retains data/results, expires and clears',()=>{
 const state={source:{csv:{headers:['Age','target'],rows:[['1','yes']]},labelIndex:1,exampleId:null},runState:{status:'success',result:{predictions:[{label:'yes'}]}}};
 save('/en/playground/?dataset=46913',state);
 assert.equal(read('/en/playground/'),null);
 assert.deepEqual(read('/en/playground/?dataset=46913'),state);
 // Reading is idempotent for React StrictMode initialization.
 assert.deepEqual(read('/en/playground/?dataset=46913'),state);
 clear('/en/playground/?dataset=46913');assert.equal(read('/en/playground/?dataset=46913'),null);
 save('/en/playground/',state);const now=Date.now;Date.now=()=>now()+31000;
 try{assert.equal(read('/en/playground/'),null);}finally{Date.now=now;}
});
