import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const manifest = JSON.parse(readFileSync(new URL('docs/grading-night-manifest.json', root), 'utf8'));
const content = new URL('app/src/content/', root);
const artifacts = new Map(readdirSync(content).filter(name => name.startsWith('gn-') && name.endsWith('.json')).map(name => {
  const artifact = JSON.parse(readFileSync(new URL(name, content), 'utf8'));
  return [artifact.slug, artifact];
}));

test('all 100 grading subjects have exactly one preview, with original generator attribution', () => {
  assert.equal(manifest.length, 100);
  assert.deepEqual(manifest.map(row => row.subject_id), Array.from({ length: 100 }, (_, i) => `GN-${String(i + 1).padStart(3, '0')}`));
  assert.equal(new Set(manifest.map(row => row.artifact_slug)).size, 100);
  assert.deepEqual(new Set(manifest.map(row => row.artifact_slug)), new Set(artifacts.keys()));
  for (const row of manifest) {
    const artifact = artifacts.get(row.artifact_slug);
    assert.ok(artifact, row.subject_id);
    assert.equal(artifact.title, row.title, row.subject_id);
    assert.equal(artifact.contributor, row.generator, row.subject_id);
    assert.equal(artifact.status, 'preview', row.subject_id);
  }
  for (const generator of ['Grok', 'GPT', 'Claude', 'Instinct']) {
    assert.equal(manifest.filter(row => row.generator === generator).length, 25);
  }
});

test('the six blind pairs resolve to distinct files and all authored image assets exist', () => {
  for (let pair = 1; pair <= 6; pair++) {
    const sides = manifest.filter(row => row.ab_pair === pair);
    assert.equal(sides.length, 2, `pair ${pair}`);
    assert.notEqual(sides[0].artifact_slug, sides[1].artifact_slug);
    assert.equal(sides[0].title, sides[1].title);
  }
  for (const artifact of artifacts.values()) {
    for (const block of artifact.blocks) {
      if (block.type === 'image' && block.src.startsWith('/')) {
        assert.ok(existsSync(fileURLToPath(new URL(`public${block.src}`, root))), `${artifact.slug}: ${block.src}`);
        assert.ok(block.alt.trim(), `${artifact.slug}: informative image needs alternative text`);
      }
    }
  }
});

test('explicit content quantities are delivered: 20 program lines, 40 people and 10 resistor questions', () => {
  const forSubject = id => artifacts.get(manifest.find(row => row.subject_id === id).artifact_slug);
  assert.equal(forSubject('GN-029').blocks.find(block => block.id === 'program').code.split('\n').length, 20);
  const castIds = new Set(['notables', 'cast-crown', 'cast-compact', 'cast-coast']);
  const people = forSubject('GN-076').blocks.filter(block => castIds.has(block.id)).flatMap(block => block.rows.map(row => row[0]));
  assert.equal(people.length, 40);
  assert.equal(new Set(people).size, 40);
  assert.equal(forSubject('GN-038').blocks.filter(block => block.type === 'exercise').length, 10);
});

test('OEE examples reproduce the displayed machine and cell values from their raw counts', () => {
  const artifact = artifacts.get(manifest.find(row => row.subject_id === 'GN-091').artifact_slug);
  const rows = artifact.blocks.find(block => block.id === 'machines').rows;
  let goodTotal = 0;
  for (const row of rows) {
    const run = Number(row[1]);
    const [total, good] = row[2].split('/').map(Number);
    assert.ok(good <= total && total <= run && run <= 180);
    const expected = (run / 180) * (total / run) * (good / total) * 100;
    assert.equal(row[4], `${expected.toFixed(1)}%`);
    goodTotal += good;
  }
  assert.equal(artifact.blocks.find(block => block.id === 'cell-oee').items[0].value, `${(goodTotal / (rows.length * 180) * 100).toFixed(1)}%`);
});
