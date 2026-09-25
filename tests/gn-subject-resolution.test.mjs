import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');

// Regression: GN-072 and GN-073 are an A/B pair sharing one title, so the
// kebab(title) guess for GN-073 lands on GN-072's page. A grade saved from
// that view stored the twin's slug. The resolver must never substitute a
// guess for an assigned slug, and must try the planned slug before kebab.
test('an assigned artifact_slug is authoritative - no silent fallback', () => {
  const grading = read('../app/src/Grading.tsx');
  assert.match(grading, /if \(subject\.artifact_slug\) \{\s*return bySlug\.get\(subject\.artifact_slug\);\s*\}/);
});

test('resolver consults the planned slug before the kebab guess', () => {
  const grading = read('../app/src/Grading.tsx');
  const plan = grading.indexOf('planForSubject(subject.id)');
  const kebab = grading.indexOf('bySlug.get(`gn-${kebab(subject.title)}`)');
  assert.ok(plan > -1 && kebab > -1 && plan < kebab, 'plan lookup must precede the kebab fallback');
});

test('the offline slug check mirrors the resolver', () => {
  const script = read('../scripts/check-gn-slugs.mjs');
  assert.match(script, /gn-plans\.json/);
  assert.match(script, /via = "plan"/);
  assert.match(script, /never fall through to a guess/i);
});

test('the snapshot resolves the GN-072/GN-073 pair to distinct pages', () => {
  const snapshot = JSON.parse(read('../supabase/snapshots/gn-subjects.json'));
  const rows = Array.isArray(snapshot) ? snapshot : snapshot.subjects;
  const a = rows.find(row => row.id === 'GN-072');
  const b = rows.find(row => row.id === 'GN-073');
  assert.ok(a?.artifact_slug && b?.artifact_slug, 'both pair members carry an assigned slug');
  assert.notEqual(a.artifact_slug, b.artifact_slug);
  assert.equal(a.title, b.title, 'this pair is the shared-title hazard the resolver guards');
});
