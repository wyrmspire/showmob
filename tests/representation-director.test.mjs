import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

// The director layer (docs/representation-director.md): representation.json is
// required for every generated page, with pressure, block, why, and rejected;
// the critique fails pages that ignore a tool the sheet asked for.

// Keep in sync with the block types in app/src/schema.ts.
const BLOCKS = new Set([
  'hero', 'text', 'stat-strip', 'steps', 'comparison', 'quote', 'note-callout',
  'cta-band', 'checklist', 'choice', 'fill-in', 'reveal', 'timeline', 'code',
  'embed', 'image', 'resource-list', 'exercise', 'compact-table', 'diagram',
  'slideshow', 'divider',
]);
const PRESSURES = new Set([
  'frame', 'sequence', 'lookup', 'spatial', 'decision', 'practice', 'warning',
  'source', 'close', 'restraint',
]);
const VISUAL_CARRIERS = new Set(['image', 'diagram', 'slideshow']);
const LAYERS = new Set([
  'research', 'scope', 'sheet', 'teaching-strategy', 'representation',
  'generation', 'critique', 'missing-primitive',
]);

function find(dir, name) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...find(path, name));
    else if (entry === name) out.push(path);
  }
  return out;
}

const read = (p) => JSON.parse(readFileSync(p, 'utf8'));
const drafts = find('runs', 'draft.json');

test('at least one staged page exists', () => {
  assert.ok(drafts.length > 0, 'expected runs/**/draft.json');
});

for (const draftPath of drafts) {
  const dir = join(draftPath, '..');
  const repPath = join(dir, 'representation.json');
  const sheetPath = join(dir, 'page-sheet.json');

  test(`representation required: ${dir}`, () => {
    assert.ok(existsSync(repPath), `${dir} has a draft but no representation.json`);
    const rep = read(repPath);
    assert.equal(rep.stage, 'representation');
    assert.ok(Array.isArray(rep.sections) && rep.sections.length > 0, 'sections');
    for (const s of rep.sections) {
      assert.ok(typeof s.id === 'string' && s.id.length > 0, 'section id');
      assert.ok(PRESSURES.has(s.pressure), `${s.id}: pressure ${s.pressure}`);
      assert.ok(BLOCKS.has(s.block), `${s.id}: block ${s.block}`);
      assert.ok(typeof s.why === 'string' && s.why.length > 0, `${s.id}: why`);
    }
    assert.ok(Array.isArray(rep.rejected), 'rejected list (the reasoning made visible)');
    for (const r of rep.rejected) {
      assert.ok(BLOCKS.has(r.block), `rejected block ${r.block}`);
      assert.ok(typeof r.why === 'string' && r.why.length > 0, `rejected ${r.block}: why`);
    }
  });

  test(`sheet-requested tools are not ignored: ${dir}`, () => {
    if (!existsSync(sheetPath)) return;
    const sheet = read(sheetPath);
    const rep = read(repPath);
    const visualNeeds = sheet.visualNeeds ?? [];
    // The director rule (docs/representation-director.md): a SPATIAL visual need
    // with no image is a representation failure, not a writing failure. Needs
    // carried by comparison/table/text are out of this mechanical check's scope.
    const SPATIAL = /spatial|map|floor|plan|layout|diagram|figure|picture|draw|chart|photo|two sides|boundary/i;
    if (!visualNeeds.some((n) => SPATIAL.test(n))) return;
    const carried = rep.sections.some((s) => VISUAL_CARRIERS.has(s.block));
    const addressed = rep.rejected.some((r) => VISUAL_CARRIERS.has(r.block));
    assert.ok(
      carried || addressed,
      `visualNeeds is spatial but no visual carrier (image/diagram/slideshow) was chosen or explicitly rejected`,
    );
  });
}

for (const critiquePath of find('runs', 'critique.json')) {
  const c = read(critiquePath);
  if (c.critiqueVersion !== 2) continue;
  test(`critique v2 answers the sheet job: ${critiquePath}`, () => {
    assert.ok(c.sheetJob && typeof c.sheetJob.outcome === 'string' && c.sheetJob.outcome.length > 0, 'sheetJob.outcome');
    assert.ok(c.sheetJob && typeof c.sheetJob.coreModel === 'string' && c.sheetJob.coreModel.length > 0, 'sheetJob.coreModel');
    assert.ok(c.unusedToolCheck, 'unusedToolCheck present');
  });
}

for (const gradePath of find('runs', 'grades')) {
  // grades directories hold grade records; validate shape when they appear
}

test('grade records keep the contract, when present', () => {
  const gradeFiles = [];
  for (const seriesDir of existsSync('runs') ? readdirSync('runs') : []) {
    const gdir = join('runs', seriesDir, 'grades');
    if (existsSync(gdir) && statSync(gdir).isDirectory()) {
      for (const f of readdirSync(gdir)) if (f.endsWith('.json')) gradeFiles.push(join(gdir, f));
    }
  }
  for (const p of gradeFiles) {
    const g = read(p);
    assert.equal(g.gradeVersion, 1, `${p}: gradeVersion`);
    assert.ok(['owner', 'calibrated-grader'].includes(g.gradeSource?.kind), `${p}: trusted grade source`);
    assert.ok(LAYERS.has(g.classification), `${p}: classification ${g.classification}`);
    assert.ok(typeof g.hypothesis === 'string' && g.hypothesis.length > 0, `${p}: hypothesis`);
  }
});
