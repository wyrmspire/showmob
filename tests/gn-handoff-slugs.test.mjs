import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const HANDOFF_RE = /^(GN-\d+)\s+-\s+(gn-[a-z0-9-]+)\s+-/;
const LINE_RE = /GN-\d+\s+-\s+gn-[a-z0-9-]+\s+-/;

test('handoff files list exactly 100 unique GN id↔slug pairs aligned with content JSON', () => {
  const handoffs = readdirSync(root)
    .filter((name) => /^handoff-.*\.md$/.test(name))
    .sort();
  assert.equal(handoffs.length, 4, `expected four handoff-*.md files, got ${handoffs.join(', ')}`);

  const pairs = [];
  const byId = new Map();
  const bySlug = new Map();

  for (const file of handoffs) {
    const text = readFileSync(join(root, file), 'utf8');
    for (const line of text.split(/\r?\n/)) {
      if (!LINE_RE.test(line)) continue;
      const match = line.match(HANDOFF_RE);
      assert.ok(match, `handoff line did not parse: ${file}: ${line}`);
      const [, id, slug] = match;
      pairs.push({ id, slug, file });
      if (byId.has(id) && byId.get(id) !== slug) {
        assert.fail(`GN id ${id} maps to both ${byId.get(id)} and ${slug}`);
      }
      byId.set(id, slug);
      if (bySlug.has(slug) && bySlug.get(slug) !== id) {
        assert.fail(`slug ${slug} claimed by both ${bySlug.get(slug)} and ${id}`);
      }
      bySlug.set(slug, id);
    }
  }

  assert.equal(pairs.length, 100, `expected 100 handoff subject lines, got ${pairs.length}`);
  assert.equal(byId.size, 100, `expected 100 unique GN ids, got ${byId.size}`);
  assert.equal(bySlug.size, 100, `expected 100 unique slugs, got ${bySlug.size}`);

  const contentDir = join(root, 'app/src/content');
  for (const [id, slug] of byId) {
    const path = join(contentDir, `${slug}.json`);
    assert.ok(existsSync(path), `${id}: missing content file ${slug}.json`);
    const json = JSON.parse(readFileSync(path, 'utf8'));
    assert.equal(json.slug, slug, `${id}: content slug field mismatch`);
    assert.equal(json.status, 'preview', `${id}: expected status preview, got ${json.status}`);
  }
});
