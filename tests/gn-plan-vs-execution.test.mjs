import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { cleanScores } from '../api/gn.ts';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('cleanScores accepts plan_vs_execution and optional note', () => {
  const out = cleanScores({
    one_to_ten: 7,
    plan_vs_execution: 'execution',
    plan_vs_execution_note: '  Widgets matched the plan; density missed.  ',
  });
  assert.equal(out.one_to_ten, 7);
  assert.equal(out.plan_vs_execution, 'execution');
  assert.equal(out.plan_vs_execution_note, 'Widgets matched the plan; density missed.');
});

test('cleanScores keeps only allowed plan_vs_execution values', () => {
  for (const value of ['plan', 'execution', 'both', 'neither']) {
    assert.equal(cleanScores({ one_to_ten: 5, plan_vs_execution: value }).plan_vs_execution, value);
  }
  const dropped = cleanScores({ one_to_ten: 5, plan_vs_execution: 'maybe', plan_vs_execution_note: '' });
  assert.equal(dropped.plan_vs_execution, undefined);
  assert.equal(dropped.plan_vs_execution_note, undefined);
});

test('grading UI shows plan_vs_execution after the plan reveal', () => {
  const grading = read('../app/src/Grading.tsx');
  assert.match(grading, /plan_vs_execution/);
  assert.match(grading, /plan_vs_execution_note/);
  assert.match(grading, /PlanJudgment/);
  assert.match(grading, /Save plan judgment/);
  assert.match(grading, /Plan was the problem/);
  assert.match(grading, /Execution was the problem/);
  // Still optional on first save — judgment sits after PlanReveal, not in the cold form.
  assert.match(grading, /justSaved \|\| gradedIds\.has\(open\.id\)/);
  assert.ok(grading.indexOf('PlanReveal') < grading.indexOf('PlanJudgment'));
});

test('API cleanScores source lists the new keys', () => {
  const api = read('../api/gn.ts');
  assert.match(api, /plan_vs_execution/);
  assert.match(api, /\["plan", "execution", "both", "neither"\]/);
  assert.match(api, /plan_vs_execution_note/);
});
