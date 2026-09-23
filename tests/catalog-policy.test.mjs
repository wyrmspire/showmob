import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import { isCatalogVisible } from '../app/src/catalog-policy.ts';
import { resolveScreen } from '../app/src/screen.ts';

const statuses = ['draft', 'preview', 'published', 'archived'];

test('production lists only published artifacts', () => {
  assert.deepEqual(statuses.filter(status => isCatalogVisible(status, false)), ['published']);
});

test('author preview lists drafts, previews and published artifacts but never archived ones', () => {
  assert.deepEqual(
    statuses.filter(status => isCatalogVisible(status, true)),
    ['draft', 'preview', 'published'],
  );
});

test('repository inventory obeys both lifecycle policies', () => {
  const dir = new URL('../app/src/content/', import.meta.url);
  const artifacts = readdirSync(dir).filter(file => file.endsWith('.json'))
    .map(file => JSON.parse(readFileSync(new URL(file, dir), 'utf8')));
  const production = artifacts.filter(value => isCatalogVisible(value.status, false));
  const preview = artifacts.filter(value => isCatalogVisible(value.status, true));
  assert.ok(production.length > 0);
  assert.ok(preview.length > production.length);
  assert.ok(production.every(value => value.status === 'published'));
  assert.ok(preview.every(value => value.status !== 'archived'));
});

test('reload classification preserves published, withheld and unknown slugs', () => {
  const known = ['published-page', 'preview-page'];
  assert.equal(resolveScreen('published-page', known), 'published-page');
  assert.equal(resolveScreen('preview-page', known), 'preview-page');
  assert.equal(resolveScreen('missing-page', known), 'missing-page');
  assert.equal(resolveScreen('../bad', known), 'home');
  assert.equal(resolveScreen('author', known), 'home');
  assert.equal(resolveScreen(null, known, 'author'), 'author');
});
