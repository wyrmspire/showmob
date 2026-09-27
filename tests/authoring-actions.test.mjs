import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { makeHandler, snapshot, protocolHash } from '../server/authoring/http.ts';
import { ApiError, hash, checkLineage } from '../server/authoring/core.ts';

const token = 'authoring-test-credential-0123456789';
const otherToken = 'other-workspace-credential-0123456789';
const readToken = 'read-only-credential-012345678901234';
let old;
beforeEach(() => {
  old = process.env.SHOWMOB_AUTHORING_KEYS;
  process.env.SHOWMOB_AUTHORING_ENABLED = 'true';
  process.env.SHOWMOB_AUTHORING_KEYS = JSON.stringify([
    { id: 'writer', workspace: 'a', token, scopes: ['read', 'write'] },
    { id: 'other', workspace: 'b', token: otherToken, scopes: ['read', 'write'] },
    { id: 'reader', workspace: 'a', token: readToken, scopes: ['read'] },
  ]);
});
afterEach(() => { delete process.env.SHOWMOB_AUTHORING_ENABLED; if (old === undefined) delete process.env.SHOWMOB_AUTHORING_KEYS; else process.env.SHOWMOB_AUTHORING_KEYS = old; });

function memoryStore() {
  const runs = new Map(); const records = new Map(); const requests = new Map();
  return {
    runs, records,
    async start(workspace, actor, body, protocol) {
      const key = `${workspace}:${actor}:${body.requestId}`;
      if (requests.has(key)) {
        const r = runs.get(requests.get(key));
        if (hash(r.brief) !== hash(body.brief) || r.protocol_sha256 !== hash(protocol)) throw new ApiError(409, 'Request conflict');
        return structuredClone(r);
      }
      const r = { id: randomUUID(), workspace, actor, brief: body.brief, protocol, protocol_sha256: hash(protocol), revision: 0, created_at: new Date().toISOString() };
      runs.set(r.id, r); records.set(r.id, []); requests.set(key, r.id);
      return structuredClone(r);
    },
    async list(workspace, query, offset) { return [...runs.values()].filter(r => r.workspace === workspace && r.brief.subject.includes(query)).slice(offset, offset + 20).map(r => structuredClone(r)); },
    async read(workspace, id) { const r = runs.get(id); return r?.workspace === workspace ? structuredClone(r) : null; },
    async steps(workspace, id) { return runs.get(id)?.workspace === workspace ? structuredClone(records.get(id)) : []; },
    async append(workspace, actor, b) {
      const r = runs.get(b.runId);
      if (!r || r.workspace !== workspace) throw new ApiError(404, 'Run not found');
      const steps = records.get(r.id);
      const replay = steps.find(s => s.requestId === b.requestId);
      if (replay) return structuredClone(replay);
      if (r.revision !== b.expectedRevision || r.revision >= 100) throw new ApiError(409, 'Stale revision');
      checkLineage(b, steps);
      const s = { ...structuredClone(b), revision: ++r.revision, actor, output_sha256: hash(b.output), created_at: new Date().toISOString() };
      steps.push(s); return structuredClone(s);
    },
  };
}
function client(store) {
  return async (route, method, body, query = {}, key = token) => {
    const result = { status: 0, headers: {}, data: null };
    await makeHandler(route, store)({ method, body, query, headers: { authorization: `Bearer ${key}` } }, {
      setHeader(k,v) { result.headers[k] = v; }, status(n) { result.status = n; return this; }, json(x) { result.data = x; },
    });
    return result;
  };
}
const brief = { subject: 'Workshop process guide', purpose: 'Make one repeatable setup', readerContext: 'Experienced operator, new to this process', artifactKind: 'working guide', passGoal: 'One usable first procedure', assumptions: [], preserve: ['Existing terminology'], delivery: 'page' };
const artifact = { schemaVersion: 1, slug: 'authoring-smoke-guide', title: 'A setup guide', summary: 'One repeatable setup', contributor: 'Test', status: 'preview', theme: 'workshop', blocks: [{ id: 'procedure', type: 'steps', heading: 'Set up', items: ['Inspect the fixture', 'Record the setup'] }] };
async function start(call) { const r = await call('runs','POST',{requestId:randomUUID(),brief}); assert.equal(r.status,200); return r.data.id; }
function step(runId, expectedRevision, stage, inputs, output, key = stage) { return { requestId: randomUUID(), runId, expectedRevision, stage, key, inputs, summary: `Completed ${stage}`, output }; }
const review = n => ({ draftRevision: n, verdict: 'accept', findings: [], checks: { purpose: 'Matches task', facts: 'Checked', gaps: 'None for this pass', representation: 'Steps fit order', render: 'inspected', renderEvidence: 'Test fixture: renderer inspection is simulated in this unit test' } });

test('complete discover → run → passes → review → artifact, with exact provenance and reload', async () => {
  const store = memoryStore(); const call = client(store);
  const discovery = await call('discover','GET');
  assert.equal(discovery.data.protocolHash, protocolHash);
  assert.equal(discovery.data.capabilities.publishing, false);
  const widgets = await call('discover','GET',undefined,{contract:'widgets'});
  assert.match(widgets.data.document.content, /fill-in/);
  const id = await start(call);
  const outputs = [
    ['research',[],{ sources: ['Fixture evidence'], concepts:['repeatable setup'] }],
    ['outline',[1],{ sections:['procedure'], alternatives:[], selected:'procedure' }],
    ['representation',[2],{ sections:[{id:'procedure',block:'steps',why:'Ordered actions'}] }],
    ['section',[2,3],{id:'procedure',body:'Inspect; record'}],
    ['draft',[4],artifact],
    ['review',[5],review(5)],
    ['artifact',[6],artifact],
  ];
  for (let i=0;i<outputs.length;i++) {
    const [stage, inputs, output] = outputs[i];
    const r = await call('steps','POST',step(id,i,stage,inputs,output));
    assert.equal(r.status,200,JSON.stringify(r.data)); assert.equal(r.data.revision,i+1); assert.equal(r.data.actor,'writer');
  }
  const fetched = await client(store)('steps','GET',undefined,{runId:id,revision:'7'});
  assert.deepEqual(fetched.data.output,artifact);
  const list = await call('steps','GET',undefined,{runId:id});
  assert.equal(list.data.steps.length,7); assert.equal('output' in list.data.steps[0],false);
  const run = await call('runs','GET',undefined,{runId:id});
  assert.deepEqual(run.data.protocol,snapshot);
});

test('run creation and writes are retryable, conflicting request reuse and stale writes fail', async () => {
  const store=memoryStore(); const call=client(store); const b={requestId:randomUUID(),brief};
  const first=await call('runs','POST',b); const again=await call('runs','POST',b);
  assert.equal(first.data.id,again.data.id);
  assert.equal((await call('runs','POST',{...b,brief:{...brief,purpose:'Different'}})).status,409);
  const s=step(first.data.id,0,'research',[],{sources:[]});
  const a=await call('steps','POST',s); const retry=await call('steps','POST',s);
  assert.deepEqual(a.data,retry.data);
  assert.equal((await call('steps','POST',{...s,output:{changed:true}})).status,409);
  assert.equal((await call('steps','POST',{...s,requestId:randomUUID()})).status,409);
});

test('superseding an outline invalidates downstream drafts and reviews transitively', async () => {
  const call=client(memoryStore()); const id=await start(call);
  await call('steps','POST',step(id,0,'research',[],{}));
  await call('steps','POST',step(id,1,'outline',[1],{sections:['first']}));
  await call('steps','POST',step(id,2,'draft',[2],artifact));
  await call('steps','POST',step(id,3,'review',[3],review(3)));
  await call('steps','POST',step(id,4,'outline',[1],{sections:['revised']}));
  assert.equal((await call('steps','POST',step(id,5,'artifact',[4],artifact))).status,409);
  assert.equal((await call('steps','POST',step(id,5,'section',[99],{}))).status,409);
});

test('final artifact needs an accepted exact-draft review and external render evidence', async () => {
  const call=client(memoryStore()); const id=await start(call);
  await call('steps','POST',step(id,0,'research',[],{}));
  await call('steps','POST',step(id,1,'draft',[1],artifact));
  assert.equal((await call('steps','POST',step(id,2,'artifact',[2],artifact))).status,422);
  const r=review(2); r.checks.render='not-inspected';
  await call('steps','POST',step(id,2,'review',[2],r));
  assert.equal((await call('steps','POST',step(id,3,'artifact',[3],artifact))).status,422);
  await call('steps','POST',step(id,3,'review',[2],review(2)));
  assert.equal((await call('steps','POST',step(id,4,'artifact',[4],{...artifact,title:'Changed'}))).status,422);
  assert.equal((await call('steps','POST',step(id,4,'artifact',[4],artifact))).status,200);
});

test('credentials fail closed; read scope, workspace isolation and server-owned identity enforced', async () => {
  const call=client(memoryStore()); const id=await start(call);
  assert.equal((await call('runs','GET',undefined,{runId:id},otherToken)).status,404);
  assert.equal((await call('steps','GET',undefined,{runId:id},otherToken)).status,404);
  assert.equal((await call('runs','POST',{requestId:randomUUID(),brief},{},readToken)).status,403);
  assert.equal((await call('runs','POST',{requestId:randomUUID(),brief,workspace:'b'})).status,400);
  assert.equal((await call('discover','GET',undefined,{},'bad')).status,401);
  delete process.env.SHOWMOB_AUTHORING_KEYS;
  assert.equal((await call('discover','GET')).status,503);
});

test('artifact validation, publication boundary, malformed and oversized bodies', async () => {
  const call=client(memoryStore()); const id=await start(call);
  assert.equal((await call('validate','POST',artifact)).data.valid,true);
  assert.equal((await call('validate','POST',{...artifact,blocks:[{type:'invented'}]})).data.valid,false);
  assert.equal((await call('steps','POST',step(id,0,'draft',[1],{...artifact,status:'published'}))).status,422);
  assert.equal((await call('runs','POST','{')).status,400);
  assert.equal((await call('runs','POST',{huge:'x'.repeat(100001)})).status,413);
  assert.equal((await call('runs','DELETE')).status,405);
});

test('all authoring routes are dark until explicitly enabled', async () => {
  const call = client(memoryStore());
  delete process.env.SHOWMOB_AUTHORING_ENABLED;
  for (const [route, method] of [['discover', 'GET'], ['runs', 'GET'], ['steps', 'GET'], ['validate', 'POST']]) {
    const response = await call(route, method, {}, { runId: randomUUID() });
    assert.equal(response.status, 404);
    assert.deepEqual(response.data, { error: 'Not found' });
  }
});
