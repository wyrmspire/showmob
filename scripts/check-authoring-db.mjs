// Run only against an empty disposable Postgres database. CI supplies one.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { makeHandler } from '../server/authoring/http.ts';
import { createRpcStore } from '../server/authoring/store.ts';

if (!process.env.TEST_AUTHORING_DATABASE_URL) throw new Error('Set TEST_AUTHORING_DATABASE_URL to a disposable database');
const env = { ...process.env, PGDATABASE: process.env.TEST_AUTHORING_DATABASE_URL };
function sql(command) { return execFileSync('psql', ['-X', '-q', '-A', '-t', '-v', 'ON_ERROR_STOP=1'], { env, input: command, encoding: 'utf8', stdio: ['pipe','pipe','pipe'] }).trim(); }
const literal = v => v === null ? 'NULL' : typeof v === 'number' ? String(v) : "'" + (typeof v === 'string' ? v : JSON.stringify(v)).replaceAll("'", "''") + "'";
// Refuse to test in a database with existing Showmob tables.
assert.equal(sql("select count(*) from pg_tables where schemaname='public' and tablename like 'showmob_%';"),'0','Use an empty disposable database');
sql('create role anon; create role authenticated; create role service_role bypassrls; grant usage on schema public to service_role;');
sql(readFileSync('supabase/authoring-workspace.sql','utf8'));

const nativeFetch = globalThis.fetch;
process.env.SHOWMOB_SUPABASE_URL = 'https://authoring-test.invalid';
process.env.SHOWMOB_SUPABASE_SERVICE_ROLE_KEY = 'test-service-role';
const token = 'disposable-database-test-credential-012345';
process.env.SHOWMOB_AUTHORING_KEYS = JSON.stringify([{id:'ci-agent',workspace:'ci',token,scopes:['read','write']}]);
globalThis.fetch = async (url, options) => {
  assert.ok(String(url).startsWith('https://authoring-test.invalid/rest/v1/rpc/showmob_authoring_'));
  const fn = String(url).split('/').at(-1);
  assert.match(fn,/^showmob_authoring_[a-z]+$/);
  const args = JSON.parse(options.body);
  const parameters = Object.entries(args).map(([k,v]) => { assert.match(k,/^p_[a-z_]+$/); return `${k} => ${literal(v)}`; }).join(',');
  const query = `set role service_role; select public.${fn}(${parameters});`;
  try { return new Response(sql(query) || 'null', {status:200}); }
  catch(e) {
    const detail = String(e.stderr);
    const code = /Stale|Request|Superseded|Missing dependency/.test(detail) ? 'P0409' : /Run not found/.test(detail) ? 'P0404' : 'XX000';
    return Response.json({code},{status:400});
  }
};
const store=createRpcStore();
async function call(route,method,body,query={}) {
  let status; let data;
  await makeHandler(route,store)({method,body,query,headers:{authorization:`Bearer ${token}`}}, {setHeader(){},status(n){status=n;return this;},json(x){data=x;}});
  return {status,data};
}
try {
  const brief={subject:'Disposable SQL test',purpose:'Verify the API storage contract',readerContext:'Test fixture',artifactKind:'reference',passGoal:'One validated page',assumptions:[],preserve:[],delivery:'page'};
  const requestId=randomUUID();
  const a=await call('runs','POST',{requestId,brief}); assert.equal(a.status,200,JSON.stringify(a));
  const runId=a.data.id;
  assert.equal((await call('runs','POST',{requestId,brief})).data.id,runId);
  assert.equal((await call('runs','POST',{requestId,brief:{...brief,purpose:'different'}})).status,409);
  const doc={schemaVersion:1,slug:'sql-smoke',title:'SQL test',summary:'A synthetic fixture',contributor:'CI',status:'preview',theme:'paper',blocks:[{id:'one',type:'text',heading:'One',body:'Two'}]};
  const save=(stage,expectedRevision,inputs,output,key=stage)=>({requestId:randomUUID(),runId,expectedRevision,stage,key,inputs,output,summary:'Synthetic test decision'});
  const research=save('research',0,[],{sources:['test fixture']});
  const r1=await call('steps','POST',research); assert.equal(r1.status,200,JSON.stringify(r1));
  assert.equal((await call('steps','POST',research)).data.revision,1);
  assert.equal((await call('steps','POST',{...research,requestId:randomUUID()})).status,409);
  assert.equal((await call('steps','POST',save('outline',1,[1],{sections:['one']}))).status,200);
  assert.equal((await call('steps','POST',save('draft',2,[2],doc))).status,200);
  const review={draftRevision:3,verdict:'accept',findings:[],checks:{purpose:'test',facts:'synthetic',gaps:'test',representation:'text',render:'inspected',renderEvidence:'Simulated review for SQL test only'}};
  assert.equal((await call('steps','POST',save('review',3,[3],review))).status,200);
  assert.equal((await call('steps','POST',save('artifact',4,[4],doc))).status,200);
  assert.deepEqual((await call('steps','GET',undefined,{runId,revision:'5'})).data.output,doc);
  assert.equal((await call('runs','GET',undefined,{q:'Disposable'})).data.runs.length,1);
  assert.equal((await store.read('other',runId)),null);
  assert.deepEqual(await store.steps('other',runId),[]);
  // Same expected revision: the first SQL writer wins; second cannot overwrite it.
  const left=save('research',5,[],{pass:'left'},'left');
  const right=save('research',5,[],{pass:'right'},'right');
  await store.append('ci','ci-agent',left);
  await assert.rejects(store.append('ci','ci-agent',right),e=>e.status===409);
  // Bypass HTTP prechecks to verify the database itself rejects stale ancestry.
  await store.append('ci','ci-agent',save('outline',6,[1],{sections:['revised']}));
  await assert.rejects(store.append('ci','ci-agent',save('section',7,[3],{})),e=>e.status===409);
  assert.equal(sql("select has_table_privilege('anon','public.showmob_authoring_steps','select');"),'f');
  assert.equal(sql("select has_function_privilege('authenticated','public.showmob_authoring_read(text,uuid)','execute');"),'f');
  assert.throws(()=>sql(`update public.showmob_authoring_steps set step_key='tampered' where run_id=${literal(runId)};`));
  assert.throws(()=>sql(`delete from public.showmob_authoring_steps where run_id=${literal(runId)};`));
  console.log('Authoring SQL integration passed: full HTTP-handler/RPC flow, retries, conflicts, lineage, workspace isolation, ACLs and immutability.');
} finally { globalThis.fetch=nativeFetch; }
