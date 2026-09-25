import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { GRADING_PATH, RESERVED_SLUGS, resolveScreen } from '../app/src/screen.ts';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');

test('grading screen resolves from /grading and is a reserved slug', () => {
  assert.equal(GRADING_PATH, '/grading');
  assert.equal(resolveScreen(null, [], undefined, '/grading'), 'grading');
  assert.equal(resolveScreen(null, [], undefined, '/grading/'), 'grading');
  assert.ok(RESERVED_SLUGS.includes('grading'));
  assert.equal(resolveScreen(null, [], undefined, '/grading-cheatsheet'), ':not-found');
});

test('App routes the grading screen and writeScreen maps it to /grading', () => {
  const app = read('../app/src/App.tsx');
  assert.match(app, /<Grading home=\{home\} everything=\{\(\) => go\("everything"\)\} \/>/);
  const routing = read('../app/src/routing.ts');
  assert.match(routing, /screen === "grading"/);
  assert.match(routing, /GRADING_PATH/);
});

test('grading surface stays unlisted: noindex and no link from Home', () => {
  const grading = read('../app/src/Grading.tsx');
  assert.match(grading, /setUnlistedRobots\(true\)/);
  const home = read('../app/src/Home.tsx');
  assert.doesNotMatch(home, /grading/i);
});

test('the browser never holds a Supabase key or a table name', () => {
  const grading = read('../app/src/Grading.tsx');
  assert.doesNotMatch(grading, /import\.meta\.env/);
  assert.doesNotMatch(grading, /SERVICE_ROLE_KEY/);
  assert.doesNotMatch(grading, /supabase\.co/);
  assert.match(grading, /fetch\("\/api\/gn"/);
});

test('grades write only through the record-grade RPC with a server-held key', () => {
  const api = read('../api/gn.ts');
  assert.match(api, /showmob_gn_record_grade/);
  assert.match(api, /showmob_gn_amend_grade_scores/);
  assert.match(api, /showmob_gn_list_subjects/);
  assert.match(api, /showmob_gn_list_grades/);
  assert.match(api, /SHOWMOB_SUPABASE_URL/);
  assert.match(api, /SHOWMOB_SUPABASE_SERVICE_ROLE_KEY/);
  assert.doesNotMatch(api, /import\.meta\.env/);
  assert.doesNotMatch(api, /VITE_[A-Z]/);
  assert.doesNotMatch(api, /insert into/i);
  // One grade at a time, validated: subject id shape and a required 1-10.
  assert.match(api, /\^GN-\[0-9\]\{3\}\$/);
  assert.match(api, /one_to_ten/);
});

test('the grading API is gated by a server-held passcode on every method', () => {
  const api = read('../api/gn.ts');
  assert.match(api, /SHOWMOB_GRADING_PASSCODE/);
  assert.match(api, /x-grading-passcode/);
  assert.match(api, /timingSafeEqual/);
  // The check runs before any method branch, so GET and POST both need it.
  assert.ok(api.indexOf('authorized(req)') < api.indexOf('req.method === "GET"'));
  assert.match(api, /status\(401\)/);
  // Fails closed when the env var is missing.
  assert.match(api, /if \(!expected\) return false/);
});

test('the grading page sends the passcode and never ships one', () => {
  const grading = read('../app/src/Grading.tsx');
  const gate = read('../app/src/gate.tsx');
  assert.match(grading, /PasscodeGate/);
  assert.match(gate, /x-grading-passcode/);
  assert.match(gate, /localStorage/);
  assert.doesNotMatch(grading, /SHOWMOB_GRADING_PASSCODE/);
  assert.doesNotMatch(gate, /SHOWMOB_GRADING_PASSCODE/);
});

test('grading surface links to the passcode-gated /everything index; Home links it too', () => {
  const grading = read('../app/src/Grading.tsx');
  assert.match(grading, /everything: \(\) => void/);
  assert.match(grading, /onClick=\{everything\}/);
  const home = read('../app/src/Home.tsx');
  assert.match(home, /everything/);
  assert.match(home, /Passcode required/);
});

test('grader panel drafts persist in sessionStorage under a per-subject key', () => {
  const grading = read('../app/src/Grading.tsx');
  assert.match(grading, /sessionStorage/);
  assert.match(grading, /showmob-gn-draft-/);
});

test('grading deep-links subjects via location.hash and hashchange', () => {
  const grading = read('../app/src/Grading.tsx');
  assert.match(grading, /location\.hash|hashchange/);
});

test('blind subject responses omit generator and render-axis answer keys', async () => {
  const { cleanSubjects } = await import('../api/gn.ts');
  const [subject] = cleanSubjects([{
    id: 'GN-001',
    title: 'Example',
    bucket: 1,
    density: 'light',
    interaction: 'observe',
    shape: 'decision',
    register: 'calm',
    lifetime: 'session',
    generator: 'Answer key',
    axis_note: 'Also an answer key',
    ab_pair: null,
    status: 'built',
    artifact_slug: 'gn-example',
  }]);
  assert.equal(subject.generator, undefined);
  assert.equal(subject.axis_note, undefined);
  assert.equal(subject.id, 'GN-001');
  assert.equal(subject.artifact_slug, 'gn-example');
});

test('behavior capture measures the artifact and ignores grading-form clicks', () => {
  const grading = read('../app/src/Grading.tsx');
  assert.match(grading, /readingSurfaceRef/);
  assert.match(grading, /surface\?\.contains\(interaction\)/);
  assert.match(grading, /viewportBottom - surfaceTop/);
  assert.doesNotMatch(grading, /Math\.max\(doc\.scrollHeight/);
});

test('blind pair choices save subject ids behind visible Option labels', () => {
  const grading = read('../app/src/Grading.tsx');
  assert.match(grading, /value: subject\.id/);
  assert.match(grading, /label: `Option \$\{index \+ 1\}`/);
  assert.doesNotMatch(grading, /\{ value: open\.id, label: open\.id \}/);
});
