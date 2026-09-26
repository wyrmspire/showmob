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
      // Director question 3: every section names at least one tempting-but-wrong
      // nearby block. Without this the rejection reasoning decays within pages.
      assert.ok(Array.isArray(s.rejected) && s.rejected.length > 0, `${s.id}: per-section rejected`);
      for (const r of s.rejected) {
        assert.ok(BLOCKS.has(r.block), `${s.id}: rejected block ${r.block}`);
        assert.ok(typeof r.why === 'string' && r.why.length > 0, `${s.id}: rejected ${r.block}: why`);
      }
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

// --- Conformance: the shipped page is the representation, or the difference ---
// is explained (docs/representation-director.md). A shipped block the
// representation never planned must appear in the representation's top-level
// `drift` list with a why; drift declared but not shipped also fails.
// Comparison is by block-type counts (presence), not sequence.

const contentPath = (pageId) => join('app/src/content', `${pageId}.json`);
const counts = (list) => {
  const m = new Map();
  for (const b of list) m.set(b, (m.get(b) ?? 0) + 1);
  return m;
};

const stagedPages = find('runs', 'representation.json')
  .map((p) => ({ repPath: p, dir: join(p, '..') }))
  .filter(({ repPath }) => read(repPath).formatVersion === 2);

for (const { repPath, dir } of stagedPages) {
  const rep = read(repPath);
  const cPath = contentPath(rep.pageId);
  if (!existsSync(cPath)) continue;
  test(`shipped blocks match representation or drift: ${rep.pageId}`, () => {
    const planned = counts(rep.sections.map((s) => s.block));
    const shipped = counts(read(cPath).blocks.map((b) => b.type));
    const drift = rep.drift ?? [];
    for (const d of drift) {
      assert.ok(BLOCKS.has(d.block), `${dir}: drift block ${d.block}`);
      assert.ok(typeof d.why === 'string' && d.why.length > 0, `${dir}: drift ${d.block}: why`);
    }
    const driftCounts = counts(drift.map((d) => d.block));
    for (const [block, n] of shipped) {
      const missing = n - (planned.get(block) ?? 0);
      if (missing > 0) {
        assert.equal(
          driftCounts.get(block) ?? 0, missing,
          `${dir}: shipped ${missing} unplanned ${block} block(s) without a drift explanation`,
        );
      }
    }
    for (const [block, n] of planned) {
      assert.ok(
        (shipped.get(block) ?? 0) >= n,
        `${dir}: representation plans ${n} ${block} but the page ships ${shipped.get(block) ?? 0}`,
      );
    }
    for (const [block, n] of driftCounts) {
      const missing = (shipped.get(block) ?? 0) - (planned.get(block) ?? 0);
      assert.equal(n, Math.max(missing, 0), `${dir}: drift declares ${n} ${block} but the unexplained difference is ${Math.max(missing, 0)}`);
    }
  });
}

// --- Series-level shape check (docs/representation-director.md) -------------
// The per-page critique cannot see the template the series falls into. Two
// rules: no two pages in a series ship the identical block sequence, and when
// every page opens (or closes) with the same block, each opening (or closing)
// must be re-earned with a page-specific why - distinct strings, not copied.

const seriesPages = new Map();
for (const { repPath } of stagedPages) {
  const rep = read(repPath);
  const cPath = contentPath(rep.pageId);
  if (!existsSync(cPath)) continue;
  const content = read(cPath);
  const seriesId = content.series?.id;
  if (!seriesId) continue;
  if (!seriesPages.has(seriesId)) seriesPages.set(seriesId, []);
  seriesPages.get(seriesId).push({ rep, content });
}

for (const [seriesId, pages] of seriesPages) {
  if (pages.length < 2) continue;
  test(`series shape comes from pressure, not the previous page: ${seriesId}`, () => {
    const sequences = pages.map((p) => p.content.blocks.map((b) => b.type).join('>'));
    assert.equal(
      new Set(sequences).size, sequences.length,
      `two pages in ${seriesId} ship the identical block sequence - a copied shape`,
    );
    const firsts = new Set(pages.map((p) => p.content.blocks[0].type));
    if (firsts.size === 1) {
      const whys = pages.map((p) => p.rep.sections[0].why);
      assert.equal(
        new Set(whys).size, whys.length,
        `every ${seriesId} page opens with ${[...firsts][0]} but two opening whys are identical - the habit block was not re-earned per page`,
      );
    }
    const lasts = new Set(pages.map((p) => p.content.blocks.at(-1).type));
    if (lasts.size === 1) {
      const lastBlock = [...lasts][0];
      const whys = pages.map((p) => {
        const lastSection = p.rep.sections.at(-1);
        if (lastSection.block === lastBlock) return lastSection.why;
        const d = (p.rep.drift ?? []).find((x) => x.block === lastBlock);
        assert.ok(d, `${p.rep.pageId}: closing ${lastBlock} has no section or drift why`);
        return d.why;
      });
      assert.equal(
        new Set(whys).size, whys.length,
        `every ${seriesId} page closes with ${lastBlock} but two closing whys are identical - the habit block was not re-earned per page`,
      );
    }
  });
}
