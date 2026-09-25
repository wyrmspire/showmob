import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

// Page setup sheets (docs/page-setup-sheet.md): shape check, and the rule that
// a sheet stays silent on visual form.

const RUNS = 'runs';
const MODES = new Set(['tutorial', 'how-to', 'reference', 'explanation', 'answer']);
const USE_SHAPES = new Set(['once', 'returns', 'alongside']);
const KINDS = new Set(['planned', 'as-built']);
const FORM_KEYS = new Set(['blocks', 'block', 'blockType', 'layout', 'widget', 'widgets', 'theme']);

function findSheets(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...findSheets(path));
    else if (name === 'page-sheet.json') out.push(path);
  }
  return out;
}

function keysDeep(value, acc = []) {
  if (Array.isArray(value)) value.forEach((v) => keysDeep(v, acc));
  else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) {
      acc.push(k);
      keysDeep(v, acc);
    }
  }
  return acc;
}

const sheets = findSheets(RUNS);

test('at least one page setup sheet exists', () => {
  assert.ok(sheets.length > 0, 'expected runs/**/page-sheet.json');
});

for (const path of sheets) {
  test(`page sheet shape: ${path}`, () => {
    const s = JSON.parse(readFileSync(path, 'utf8'));
    assert.equal(s.sheetVersion, 1);
    assert.ok(KINDS.has(s.sheetKind), 'sheetKind');
    assert.equal(typeof s.pageId, 'string');
    assert.ok(path.includes(`/pages/${s.pageId}/`), 'folder matches pageId');
    assert.ok(s.seriesId === null || typeof s.seriesId === 'string', 'seriesId');
    assert.ok(MODES.has(s.mode), `mode: ${s.mode}`);
    assert.ok(USE_SHAPES.has(s.useShape), `useShape: ${s.useShape}`);
    assert.ok(typeof s.readerMoment === 'string' && s.readerMoment.length > 0, 'readerMoment');
    assert.match(s.outcome, /^Can /, 'outcome is a checkable "Can ..." line');
    if (s.mode === 'answer') {
      assert.equal(s.coreModel, null, 'answer pages have no coreModel');
      assert.equal(s.teachingShape, null, 'answer pages do not claim a teaching progression');
    } else {
      assert.equal(typeof s.coreModel, 'string', 'teaching pages need a coreModel');
      assert.match(s.coreModel, /^[^\n.!?]+[.!?]$/, 'coreModel is one sentence to check, not a list');
    }
    assert.ok(Array.isArray(s.prerequisites), 'prerequisites');
    for (const p of s.prerequisites) {
      assert.equal(typeof p.idea, 'string');
      assert.ok('taughtBy' in p && (p.taughtBy === null || typeof p.taughtBy === 'string'), 'taughtBy');
    }
    if (s.teachingShape === null) {
      assert.ok(typeof s.teachingShapeWhy === 'string' && s.teachingShapeWhy.length > 0, 'null teachingShape needs teachingShapeWhy');
    } else {
      assert.equal(typeof s.teachingShape, 'object');
    }
    for (const k of ['requiredIdeas', 'candidateAnalogies', 'visualNeeds', 'deliberatelyExcluded']) {
      assert.ok(Array.isArray(s[k]), k);
    }
    for (const x of s.deliberatelyExcluded) {
      assert.ok(x.what && x.why, 'each exclusion has what and why');
    }
    assert.ok(s.nextPagePressure === null || typeof s.nextPagePressure === 'string', 'nextPagePressure');
  });

  test(`page sheet is silent on form: ${path}`, () => {
    const s = JSON.parse(readFileSync(path, 'utf8'));
    const bad = keysDeep(s).filter((k) => FORM_KEYS.has(k));
    assert.deepEqual(bad, [], 'form belongs to the representation stage, not the sheet');
  });

  test(`as-built sheet points at a real page: ${path}`, () => {
    const s = JSON.parse(readFileSync(path, 'utf8'));
    if (s.sheetKind !== 'as-built') return;
    assert.ok(existsSync(join('app/src/content', `${s.pageId}.json`)), `${s.pageId}.json exists`);
    for (const p of s.prerequisites) {
      if (p.taughtBy) assert.ok(existsSync(join('app/src/content', `${p.taughtBy}.json`)), `taughtBy ${p.taughtBy} exists`);
    }
  });
}
