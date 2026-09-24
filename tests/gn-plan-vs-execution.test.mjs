import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { cleanPlanJudgmentPatch, cleanScores } from '../api/gn.ts';

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

test('cleanScores accepts gap_kind values', () => {
  for (const value of ['wrong_choice', 'missing_primitive', 'n_a']) {
    assert.equal(cleanScores({ one_to_ten: 5, gap_kind: value }).gap_kind, value);
  }
  const dropped = cleanScores({ one_to_ten: 5, gap_kind: 'maybe' });
  assert.equal(dropped.gap_kind, undefined);
});

test('cleanPlanJudgmentPatch requires plan_vs_execution and omits one_to_ten', () => {
  const out = cleanPlanJudgmentPatch({
    plan_vs_execution: 'both',
    plan_vs_execution_note: '  Density only.  ',
    one_to_ten: 9,
    suggestion: 'ignored',
  });
  assert.deepEqual(out, {
    plan_vs_execution: 'both',
    plan_vs_execution_note: 'Density only.',
  });
  assert.throws(
    () => cleanPlanJudgmentPatch({ plan_vs_execution_note: 'no choice' }),
    /plan_vs_execution is required/,
  );
});

test('grading UI amends plan judgment on Author plans only', () => {
  const grading = read('../app/src/Grading.tsx');
  assert.match(grading, /plan_vs_execution/);
  assert.match(grading, /plan_vs_execution_note/);
  assert.match(grading, /PlanJudgment/);
  assert.match(grading, /Save plan judgment/);
  assert.match(grading, /Plan was the problem/);
  assert.match(grading, /Execution was the problem/);
  assert.match(grading, /amend_grade_id/);
  assert.doesNotMatch(grading, /\(plan judgment\)/);
  // Judgment is gated on first-hand (Author) plans; PlanReveal still shows for inferred.
  assert.match(grading, /planForSubject\(open\.id\)\?\.provenance === "first-hand"/);
  assert.match(grading, /justSaved \|\| gradedIds\.has\(open\.id\)/);
  assert.ok(grading.indexOf('PlanReveal') < grading.indexOf('PlanJudgment'));
  // Cold-form gap_kind (not post-plan).
  assert.match(grading, /gap_kind/);
  assert.match(grading, /Wrong widget choice/);
  assert.match(grading, /Missing primitive/);
  assert.match(grading, /N\/A \(neither\)/);
  assert.match(grading, /widget build list/);
});

test('API exposes amend RPC and plan-judgment patch cleaner', () => {
  const api = read('../api/gn.ts');
  assert.match(api, /plan_vs_execution/);
  assert.match(api, /\["plan", "execution", "both", "neither"\]/);
  assert.match(api, /plan_vs_execution_note/);
  assert.match(api, /cleanPlanJudgmentPatch/);
  assert.match(api, /showmob_gn_amend_grade_scores/);
  assert.match(api, /amend_grade_id/);
  assert.match(api, /gap_kind/);
  assert.match(api, /\["wrong_choice", "missing_primitive", "n_a"\]/);
});

test('migration defines showmob_gn_amend_grade_scores without touching graded_at', () => {
  const sql = read('../supabase/migrations/20260924143000_gn_amend_plan_judgment.sql');
  assert.match(sql, /showmob_gn_amend_grade_scores/);
  assert.match(sql, /scores \|\| p_scores_patch/);
  assert.doesNotMatch(sql, /graded_at\s*=/);
  assert.doesNotMatch(sql, /suggestion\s*=/);
  assert.doesNotMatch(sql, /behavior\s*=/);
  assert.match(sql, /grant execute.*service_role/s);
});
