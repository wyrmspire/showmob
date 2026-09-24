import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');

test('Grading imports plans and reveals after grade via planForSubject', () => {
  const grading = read('../app/src/Grading.tsx');
  const module = read('../app/src/gn-plans.ts');

  assert.match(module, /content-plans\/gn-plans\.json/);
  assert.match(module, /export function planForSubject/);
  assert.match(module, /why_widgets/);
  assert.match(grading, /from "\.\/gn-plans"/);
  assert.match(grading, /planForSubject/);
  assert.match(grading, /why_widgets/);
  assert.match(grading, /justSaved \|\| gradedIds\.has\(open\.id\)/);
  assert.match(grading, /PlanReveal/);
  assert.match(module, /Author plan/);
  assert.match(module, /Inferred \(read cold\)/);
});

test('plan reveal UI never renders the contributor field', () => {
  const grading = read('../app/src/Grading.tsx');
  const module = read('../app/src/gn-plans.ts');

  // PlanReveal must not interpolate plan.contributor into JSX.
  assert.doesNotMatch(grading, /plan\.contributor/);
  assert.doesNotMatch(grading, /\{[^}]*contributor[^}]*\}/);
  // Human labels only — contributor stays in the JSON/module type, not the UI.
  assert.match(module, /planProvenanceLabel/);
  assert.doesNotMatch(module, /return plan\.contributor/);
});

test('content pages still never import or reference plans', () => {
  const catalog = read('../app/src/catalog.ts');
  assert.doesNotMatch(catalog, /content-plans/);
  assert.doesNotMatch(catalog, /gn-plans/);
  const readme = read('../app/src/content-plans/README.md');
  assert.match(readme, /reveal a plan after a grade/i);
});
