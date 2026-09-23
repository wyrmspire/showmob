import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { validateArtifact } from '../app/src/validation.ts';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');

const declaredTypes = [...read('../app/src/schema.ts').matchAll(/type:'([^']+)'/g)].map(match => match[1]).sort();

test('block gallery artifact is published, validates, and covers every schema block type at least once', () => {
  const gallery = JSON.parse(read('../app/src/content/showmob-block-gallery.json'));
  assert.equal(gallery.slug, 'showmob-block-gallery');
  assert.equal(gallery.status, 'published');
  assert.equal(validateArtifact(gallery).ok, true, 'gallery must validate');

  const present = [...new Set(gallery.blocks.map(block => block.type))].sort();
  assert.deepEqual(
    present,
    declaredTypes,
    `gallery must include every Block type exactly once in coverage terms; missing or extra: ${JSON.stringify({ present, declaredTypes })}`,
  );

  for (const type of declaredTypes) {
    assert.ok(
      gallery.blocks.some(block => block.type === type),
      `gallery missing block type: ${type}`,
    );
  }
});
