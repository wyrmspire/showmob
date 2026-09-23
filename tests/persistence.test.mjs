// Milestone one, offline: the storage boundary rules, proved against the in-memory store.
// The same rules run against Supabase in scripts/milestone-one-check.mjs.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  StaleRevisionError, canonicalJson, createMemoryStore, exportArtifact, importArtifact,
  restoreRevision, sameArtifact, saveArtifact,
} from '../app/src/persistence/revisions.ts';

const artifact = JSON.parse(readFileSync(new URL('../app/src/content/showmob-guide.json', import.meta.url), 'utf8'));
const slug = artifact.slug;

test('canonical JSON ignores key order and whitespace but not meaning', () => {
  assert.equal(canonicalJson({ b: 1, a: [2, { d: 3, c: 4 }] }), '{"a":[2,{"c":4,"d":3}],"b":1}');
  assert.ok(sameArtifact(JSON.parse(JSON.stringify(artifact, null, 4)), artifact));
  const reordered = Object.fromEntries(Object.entries(artifact).reverse());
  assert.ok(sameArtifact(reordered, artifact));
  assert.ok(!sameArtifact({ ...artifact, blocks: [...artifact.blocks].reverse() }, artifact));
});

test('export then import of a stored revision yields the same artifact', async () => {
  const store = createMemoryStore();
  const saved = await saveArtifact(store, { slug, document: artifact, expectedRevision: null, requestId: 'r1' });
  assert.equal(saved.revision, 1);
  const stored = await store.read(slug, 1);
  assert.ok(sameArtifact(stored.document, artifact), 'stored document equals the repository file');
  const exported = exportArtifact(stored);
  const imported = importArtifact(exported);
  assert.ok(sameArtifact(imported, artifact), 'imported document equals the repository file');
  const again = await saveArtifact(store, { slug, document: imported, expectedRevision: 1, requestId: 'r2' });
  assert.equal(again.documentSha256, saved.documentSha256, 're-imported artifact hashes identically');
});

test('revisions never change after they are written', async () => {
  const store = createMemoryStore();
  await saveArtifact(store, { slug, document: artifact, expectedRevision: null, requestId: 'r1' });
  const first = await store.read(slug, 1);
  first.document.title = 'changed by a reader';
  assert.equal((await store.read(slug, 1)).document.title, artifact.title, 'readers get a copy');
  const edited = { ...structuredClone(artifact), title: `${artifact.title} (edited)` };
  await saveArtifact(store, { slug, document: edited, expectedRevision: 1, requestId: 'r2' });
  assert.ok(sameArtifact((await store.read(slug, 1)).document, artifact), 'revision 1 kept after revision 2');
  assert.equal((await store.read(slug)).document.title, edited.title);
  assert.throws(() => { store.revisions.get(slug)[0].document.title = 'x'; }, TypeError);
});

test('stale writes are rejected and retries are replayed, not duplicated', async () => {
  const store = createMemoryStore();
  await saveArtifact(store, { slug, document: artifact, expectedRevision: null, requestId: 'r1' });
  await assert.rejects(saveArtifact(store, { slug, document: artifact, expectedRevision: null, requestId: 'r2' }), StaleRevisionError);
  const retry = await saveArtifact(store, { slug, document: artifact, expectedRevision: null, requestId: 'r1' });
  assert.equal(retry.replayed, true);
  assert.equal(await store.head(slug), 1);
});

test('invalid documents never reach the store', async () => {
  const store = createMemoryStore();
  await assert.rejects(saveArtifact(store, { slug, document: { ...artifact, blocks: [] }, expectedRevision: null, requestId: 'r1' }), /Invalid Showmob artifact/);
  await assert.rejects(saveArtifact(store, { slug: 'other-slug', document: artifact, expectedRevision: null, requestId: 'r1' }), /does not match/);
  assert.throws(() => importArtifact('{"title": "bad",}'), /Import rejected/);
  assert.equal(await store.head(slug), null);
});

test('restore creates a new revision instead of editing history', async () => {
  const store = createMemoryStore();
  await saveArtifact(store, { slug, document: artifact, expectedRevision: null, requestId: 'r1' });
  await saveArtifact(store, { slug, document: { ...structuredClone(artifact), title: 'Second' }, expectedRevision: 1, requestId: 'r2' });
  const restored = await restoreRevision(store, slug, 1, 'r3');
  assert.equal(restored.revision, 3);
  assert.ok(sameArtifact((await store.read(slug)).document, artifact));
  assert.equal((await store.read(slug, 2)).document.title, 'Second');
});
