import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Phase 2 scope run (docs/security-scope-pass.md): the series must follow its own
// written rules - every mapped concept placed once, dependencies taught first.

const dir = 'runs/local-security-lab';
const research = JSON.parse(readFileSync(`${dir}/research.json`, 'utf8'));
const map = JSON.parse(readFileSync(`${dir}/topic-map.json`, 'utf8'));
const series = JSON.parse(readFileSync(`${dir}/series.json`, 'utf8'));
const MODES = new Set(['tutorial', 'how-to', 'reference', 'explanation']);

test('research concepts and topic-map concepts match', () => {
  const r = research.concepts.map((c) => c.id).sort();
  const m = map.concepts.map((c) => c.id).sort();
  assert.deepEqual(m, r);
});

test('research cites only listed sources', () => {
  const known = new Set(Object.keys(research.sources));
  for (const s of Object.values(research.sources)) assert.match(s, /^https:\/\//);
  const cited = [research.perspectives, research.concepts, research.misconceptions, research.edgeCases, research.realWorldFailures]
    .flat()
    .flatMap((x) => x.sources ?? []);
  for (const s of cited) assert.ok(known.has(s), `unknown source ${s}`);
});

test('topic-map dependencies point at mapped concepts', () => {
  const ids = new Set(map.concepts.map((c) => c.id));
  for (const c of map.concepts) for (const d of c.dependsOn) assert.ok(ids.has(d), `${c.id} -> ${d}`);
});

test('scope inputs carry no page count', () => {
  assert.equal(research.input.pageCount, undefined);
  assert.equal(map.pageCount, undefined);
});

test('every concept is placed on exactly one page', () => {
  const placed = series.pages.flatMap((p) => p.concepts);
  assert.equal(new Set(placed).size, placed.length, 'no concept on two pages');
  assert.deepEqual([...placed].sort(), map.concepts.map((c) => c.id).sort());
});

test('every page has one mode and a checkable outcome', () => {
  for (const p of series.pages) {
    assert.ok(MODES.has(p.mode), `${p.pageId}: ${p.mode}`);
    assert.match(p.outcome, /^Can /, p.pageId);
  }
});

test('no page depends on a concept taught later', () => {
  const pageOf = {};
  for (const p of series.pages) for (const c of p.concepts) pageOf[c] = p.order;
  const deps = Object.fromEntries(map.concepts.map((c) => [c.id, c.dependsOn]));
  for (const p of series.pages) {
    for (const c of p.concepts) {
      for (const d of deps[c]) assert.ok(pageOf[d] <= p.order, `${p.pageId}: ${c} needs ${d} (page ${pageOf[d]})`);
    }
  }
});

test('verdict page count matches the pages listed', () => {
  assert.equal(series.verdict.pages, series.pages.length);
});
