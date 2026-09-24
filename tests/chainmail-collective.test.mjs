import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import test from 'node:test';
import { validateArtifact } from '../app/src/validation.ts';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const contentDir = new URL('../app/src/content/', import.meta.url);

test('chainmail-collective is a published 9-page idea series outside gn-100', () => {
  const files = readdirSync(contentDir)
    .filter((f) => f.startsWith('chainmail-collective') && f.endsWith('.json'))
    .sort();
  assert.equal(files.length, 9, `expected 9 chainmail pages, got ${files.length}`);

  const byOrder = [];
  for (const file of files) {
    const raw = JSON.parse(readFileSync(new URL(file, contentDir), 'utf8'));
    assert.equal(validateArtifact(raw).ok, true, file);
    assert.equal(raw.status, 'published', file);
    assert.equal(raw.contributor, 'Grok', file);
    assert.equal(raw.theme, 'workshop', file);
    assert.equal(raw.updated, '2026-09-24', file);
    assert.equal(raw.series?.id, 'chainmail-collective', file);
    assert.equal(raw.series?.title, 'Chainmail Collective', file);
    assert.ok(Number.isInteger(raw.series?.order), file);
    assert.doesNotMatch(raw.slug, /^gn-/);
    assert.ok(raw.tags.includes('chainmail'), file);
    assert.ok(raw.tags.includes('business'), file);
    assert.ok(raw.tags.includes('idea'), file);
    assert.ok(raw.tags.includes('education'), file);
    byOrder.push(raw);
  }

  byOrder.sort((a, b) => a.series.order - b.series.order);
  assert.equal(byOrder[0].slug, 'chainmail-collective');
  const orders = byOrder.map((p) => p.series.order);
  assert.deepEqual(orders, [1, 2, 3, 4, 5, 6, 7, 8, 9], 'series orders 1–9');
  assert.deepEqual(orders, [...new Set(orders)].sort((a, b) => a - b), 'unique orders');

  const slugs = byOrder.map((p) => p.slug);
  assert.deepEqual(slugs, [
    'chainmail-collective',
    'chainmail-collective-products',
    'chainmail-collective-lanes',
    'chainmail-collective-content',
    'chainmail-collective-make-ship',
    'chainmail-collective-community',
    'chainmail-collective-money',
    'chainmail-collective-rollout',
    'chainmail-collective-risks',
  ]);

  const blob = byOrder.map((p) => JSON.stringify(p.blocks)).join('\n');
  assert.match(blob, /Chainmail Collective · [1-9] of 9/);
  assert.match(blob, /anti-pyramid|No buy-in|no recruiting/i);
  assert.match(blob, /Buyer|Paid assembler|Affiliate/);
  assert.match(blob, /Design.*Build|Photos|clips/i);
  assert.match(blob, /Tier 1|home assemblers|QC/i);
  assert.match(blob, /gallery|challenges|badges/i);
  assert.match(blob, /Phase 1|Prove it|stranger/i);
  assert.match(blob, /trademark|copycat|Who owns what/i);

  const catalog = read('../app/src/catalog.ts');
  assert.match(catalog, /"chainmail-collective"/);
  assert.match(catalog, /Maker business outline/);
});
