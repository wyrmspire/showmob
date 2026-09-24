import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { validateArtifact } from '../app/src/validation.ts';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const contentDir = new URL('../app/src/content/', import.meta.url);

test('allegory-encoding is a published multi-page education series outside gn-100', () => {
  const files = readdirSync(contentDir)
    .filter((f) => f.startsWith('allegory-encoding') && f.endsWith('.json'))
    .sort();
  assert.ok(files.length >= 9, `expected ≥9 allegory pages, got ${files.length}`);

  const byOrder = [];
  for (const file of files) {
    const raw = JSON.parse(readFileSync(new URL(file, contentDir), 'utf8'));
    assert.equal(validateArtifact(raw).ok, true, file);
    assert.equal(raw.status, 'published', file);
    assert.equal(raw.series?.id, 'allegory-encoding', file);
    assert.equal(raw.series?.title, 'Allegory that stays private', file);
    assert.ok(Number.isInteger(raw.series?.order), file);
    assert.doesNotMatch(raw.slug, /^gn-/);
    assert.ok(raw.tags.includes('education'));
    assert.ok(raw.tags.includes('allegory'));
    assert.ok(raw.tags.includes('privacy'));
    byOrder.push(raw);
  }

  byOrder.sort((a, b) => a.series.order - b.series.order);
  assert.equal(byOrder[0].slug, 'allegory-encoding-eight-rules');
  const orders = byOrder.map((p) => p.series.order);
  assert.deepEqual(orders, [...new Set(orders)].sort((a, b) => a - b), 'unique orders');

  const blob = byOrder.map((p) => JSON.stringify(p.blocks)).join('\n');
  assert.match(blob, /Invertibility|lossy vocabulary|k-anonymity|quasi-identifier/i);
  assert.match(blob, /Re-identification|Neighbour test|neighbor test/i);
  assert.match(blob, /underside|encoding is not permission/i);
  assert.match(blob, /Execution playbook|workflow/i);
  assert.match(blob, /Society|norms for|cipher/i);
  assert.match(blob, /Metaphor domains|artful/i);

  const catalog = read('../app/src/catalog.ts');
  assert.match(catalog, /"allegory-encoding"/);
  assert.match(catalog, /Privacy craft for teaching stories/);
});
