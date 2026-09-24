import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const plansPath = join(root, 'app/src/content-plans/gn-plans.json');
const contentDir = join(root, 'app/src/content');
const HANDOFF_RE = /^(GN-\d+)\s+-\s+(gn-[a-z0-9-]+)\s+-/;
const FIELDS = ['id', 'slug', 'contributor', 'provenance', 'goal', 'why_widgets', 'rejected'];
const CHAR_BUDGET = 400;
const GENERATOR_NAMES = /\b(grok|gpt|claude|instinct|generator)\b/i;

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

test('content-plans/gn-plans.json holds 50 inferred plans for Grok+GPT handoff subjects (Instinct schema)', () => {
  assert.ok(existsSync(plansPath), 'missing app/src/content-plans/gn-plans.json');
  assert.ok(!existsSync(join(root, 'app/src/data/gn-plans.json')), 'legacy app/src/data/gn-plans.json must be removed');

  const doc = JSON.parse(readFileSync(plansPath, 'utf8'));
  assert.equal(typeof doc.note, 'string');
  assert.ok(Array.isArray(doc.fields));
  assert.deepEqual(doc.fields, FIELDS);
  assert.ok(Array.isArray(doc.plans));

  const byId = new Map();
  for (const plan of doc.plans) {
    assert.deepEqual(Object.keys(plan), FIELDS, `unexpected fields on ${plan.id}`);
    assert.ok(!byId.has(plan.id), `duplicate plan id ${plan.id}`);
    byId.set(plan.id, plan);
  }

  const expected = [
    ...parseHandoff('handoff-grok.md').map((entry) => ({ ...entry, contributor: 'Grok' })),
    ...parseHandoff('handoff-gpt.md').map((entry) => ({ ...entry, contributor: 'GPT' })),
  ];
  assert.equal(expected.length, 50);
  assert.equal(expected.filter(({ contributor }) => contributor === 'Grok').length, 25);
  assert.equal(expected.filter(({ contributor }) => contributor === 'GPT').length, 25);

  const inferred = expected.map(({ id, slug, contributor }) => {
    const plan = byId.get(id);
    assert.ok(plan, `missing plan for ${id}`);
    assert.equal(plan.slug, slug);
    assert.equal(plan.provenance, 'inferred');
    assert.equal(plan.contributor, contributor, `${id}: inferred plan author should be ${contributor}`);
    assert.ok(plan.goal && plan.why_widgets && plan.rejected);

    const total = plan.goal.length + plan.why_widgets.length + plan.rejected.length;
    assert.ok(total <= CHAR_BUDGET, `${id}: text fields are ${total} chars (budget ${CHAR_BUDGET})`);

    const blob = `${plan.goal}\n${plan.why_widgets}\n${plan.rejected}`;
    assert.ok(!GENERATOR_NAMES.test(blob), `${id}: plan text must not name generators (blind)`);

    const pagePath = join(contentDir, `${plan.slug}.json`);
    assert.ok(existsSync(pagePath), `${id}: missing content ${plan.slug}.json`);
    const page = JSON.parse(readFileSync(pagePath, 'utf8'));
    assert.equal(page.slug, plan.slug);
    return plan;
  });

  assert.equal(inferred.length, 50);

  const inferredIds = new Set(inferred.map((p) => p.slug));
  assert.equal(inferredIds.size, 50, 'inferred artifact slugs must be unique');
});
