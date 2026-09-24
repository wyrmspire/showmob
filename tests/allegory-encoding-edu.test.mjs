import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { validateArtifact } from '../app/src/validation.ts';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('allegory-encoding-eight-rules is a published education page outside gn-100', () => {
  const raw = JSON.parse(read('../app/src/content/allegory-encoding-eight-rules.json'));
  assert.equal(validateArtifact(raw).ok, true);
  assert.equal(raw.slug, 'allegory-encoding-eight-rules');
  assert.equal(raw.status, 'published');
  assert.ok(raw.tags.includes('education'));
  assert.ok(raw.tags.includes('allegory'));
  assert.ok(raw.tags.includes('privacy'));
  assert.doesNotMatch(raw.slug, /^gn-/);
  assert.match(JSON.stringify(raw.blocks), /k-anonymity|Invertibility|neighbour|Neighbor|underside|lossy/i);
  assert.match(JSON.stringify(raw.blocks), /Re-identification/);
  // Not a series, not a plan entry
  assert.equal(raw.series, undefined);
});
