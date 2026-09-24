import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

// The CI copy of showmob_gn_subjects must stay slim: no generator, no axis_note,
// no grades. Those are the blind's answer key and don't belong in the repo twice.
const path = fileURLToPath(new URL('../supabase/snapshots/gn-subjects.json', import.meta.url));
const ALLOWED = ['id', 'title', 'status', 'artifact_slug', 'ab_pair'];
const STATUSES = new Set(['pending', 'assigned', 'built', 'graded']);

test('gn subjects snapshot carries only the slim fields', () => {
  const snapshot = JSON.parse(readFileSync(path, 'utf8'));
  assert.deepEqual(snapshot.fields, ALLOWED);
  assert.ok(Array.isArray(snapshot.subjects) && snapshot.subjects.length > 0, 'snapshot has no subjects');

  const ids = new Set();
  for (const s of snapshot.subjects) {
    assert.deepEqual(Object.keys(s).sort(), [...ALLOWED].sort(), `${s.id}: unexpected fields ${Object.keys(s).join(', ')}`);
    assert.match(s.id, /^GN-\d{3}$/);
    assert.ok(!ids.has(s.id), `duplicate subject ${s.id}`);
    ids.add(s.id);
    assert.equal(typeof s.title, 'string');
    assert.ok(STATUSES.has(s.status), `${s.id}: bad status ${s.status}`);
    assert.ok(s.artifact_slug === null || /^gn-[a-z0-9-]+$/.test(s.artifact_slug), `${s.id}: bad artifact_slug`);
    assert.ok(s.ab_pair === null || (Number.isInteger(s.ab_pair) && s.ab_pair > 0), `${s.id}: bad ab_pair`);
  }
});
