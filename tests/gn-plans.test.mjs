import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const plansPath = join(root, 'app/src/data/gn-plans.json');
const contentDir = join(root, 'app/src/content');
const HANDOFF_RE = /^(GN-\d+)\s+-\s+(gn-[a-z0-9-]+)\s+-/;
const ALLOWED_CONTRIBUTORS = new Set(['Grok', 'GPT']);
const CHAR_BUDGET = 400;

function parseHandoff(file) {
  const text = readFileSync(join(root, file), 'utf8');
  const pairs = [];
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(HANDOFF_RE);
    if (!match) continue;
    pairs.push({ id: match[1], slug: match[2] });
  }
  return pairs;
}

test('gn-plans.json is a schemaVersion-1 inferred sidecar for exactly 50 Grok+GPT subjects', () => {
  assert.ok(existsSync(plansPath), 'missing app/src/data/gn-plans.json');
  const doc = JSON.parse(readFileSync(plansPath, 'utf8'));

  assert.equal(doc.schemaVersion, 1);
  assert.equal(doc.kind, 'gn-plans');
  assert.equal(doc.updated, '2026-09-24');
  assert.equal(typeof doc.note, 'string');
  assert.ok(doc.note.length > 20, 'note should explain the retroactive inferred sidecar');
  assert.equal(typeof doc.plans, 'object');
  assert.ok(doc.plans && !Array.isArray(doc.plans));

  const grok = parseHandoff('handoff-grok.md');
  const gpt = parseHandoff('handoff-gpt.md');
  assert.equal(grok.length, 25, 'expected 25 Grok handoff subjects');
  assert.equal(gpt.length, 25, 'expected 25 GPT handoff subjects');
  const expected = new Map([
    ...grok.map((p) => [p.id, { slug: p.slug, contributor: 'Grok' }]),
    ...gpt.map((p) => [p.id, { slug: p.slug, contributor: 'GPT' }]),
  ]);
  assert.equal(expected.size, 50);

  const planIds = Object.keys(doc.plans).sort();
  assert.equal(planIds.length, 50, `expected 50 plans, got ${planIds.length}`);
  assert.deepEqual(planIds, [...expected.keys()].sort(), 'plan keys must match Grok+GPT subject ids');

  const seenSlugs = new Set();
  for (const id of planIds) {
    const plan = doc.plans[id];
    const want = expected.get(id);
    assert.equal(plan.subject_id, id);
    assert.equal(plan.artifact_slug, want.slug);
    assert.equal(plan.contributor, want.contributor);
    assert.ok(ALLOWED_CONTRIBUTORS.has(plan.contributor), `contributor must be Grok or GPT, got ${plan.contributor}`);
    assert.equal(plan.source, 'inferred');
    assert.equal(plan.timing, 'retroactive');
    assert.equal(typeof plan.goal, 'string');
    assert.equal(typeof plan.widgets_why, 'string');
    assert.equal(typeof plan.rejected, 'string');
    assert.ok(plan.goal.length > 0 && plan.widgets_why.length > 0 && plan.rejected.length > 0);

    const total = plan.goal.length + plan.widgets_why.length + plan.rejected.length;
    assert.ok(
      total <= CHAR_BUDGET,
      `${id}: goal+widgets_why+rejected is ${total} chars (budget ${CHAR_BUDGET})`,
    );

    assert.ok(!seenSlugs.has(plan.artifact_slug), `duplicate artifact_slug ${plan.artifact_slug}`);
    seenSlugs.add(plan.artifact_slug);

    const pagePath = join(contentDir, `${plan.artifact_slug}.json`);
    assert.ok(existsSync(pagePath), `${id}: missing content ${plan.artifact_slug}.json`);
    const page = JSON.parse(readFileSync(pagePath, 'utf8'));
    assert.equal(page.slug, plan.artifact_slug);
    assert.equal(page.contributor, plan.contributor, `${id}: page contributor mismatch`);
  }

  // Sidecar must not invent Instinct/Claude plans in this file.
  for (const plan of Object.values(doc.plans)) {
    assert.ok(plan.contributor !== 'Instinct' && plan.contributor !== 'Claude');
  }

  // Content pages themselves must remain untouched by this sidecar (spot-check: no plans field on pages).
  const gnFiles = readdirSync(contentDir).filter((n) => n.startsWith('gn-') && n.endsWith('.json'));
  assert.ok(gnFiles.length >= 50);
});
