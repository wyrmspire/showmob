import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { stripTypeScriptTypes } from 'node:module';
import test from 'node:test';
import { assertArtifact, formatIssues, parseArtifact, restoreDraft, validateArtifact } from '../app/src/validation.ts';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const example = {
  schemaVersion: 1, slug: 'test-artifact', title: 'Example', summary: 'A test artifact.',
  contributor: 'Test', status: 'preview', theme: 'paper',
  blocks: [{ id: 'start', type: 'text', heading: 'Hello', body: 'A useful idea.' }],
};
const catalog = [...read('../docs/widgets.md').matchAll(/```json\n([\s\S]*?)\n```/g)]
  .map(match => JSON.parse(match[1]));
const blocks = catalog.filter(value => value.type);
const artifactWith = block => ({ ...structuredClone(example), blocks: [block] });

function rejects(value, path) {
  const result = validateArtifact(value);
  assert.equal(result.ok, false, `Expected an invalid artifact at ${path}`);
  assert.ok(result.issues.some(issue => issue.path === path), JSON.stringify(result.issues));
}

test('every catalog example validates and the catalog covers the entire schema vocabulary', () => {
  const declared = [...read('../app/src/schema.ts').matchAll(/type:'([^']+)'/g)].map(match => match[1]).sort();
  assert.deepEqual(blocks.map(block => block.type).sort(), declared);
  for (const value of catalog) assert.equal(validateArtifact(value.type ? artifactWith(value) : value).ok, true, value.type);
});

test('all repository artifacts validate, have unique slugs and are registered in the app', () => {
  const dir = new URL('../app/src/content/', import.meta.url);
  const app = read('../app/src/App.tsx');
  const slugs = new Set();
  const entries = app.match(/const entries:Artifact\[\]=\[([^\]]+)\]/)?.[1].split(',');
  assert.ok(entries, 'Find the explicit entry registry');
  for (const file of readdirSync(dir).filter(file => file.endsWith('.json'))) {
    const value = JSON.parse(readFileSync(new URL(file, dir), 'utf8'));
    assert.equal(validateArtifact(value).ok, true, file);
    assert.equal(slugs.has(value.slug), false, `Duplicate slug: ${value.slug}`);
    slugs.add(value.slug);
    const imported = [...app.matchAll(/import\s+(\w+)\s+from\s*'\.\/content\/([^']+)'/g)].find(match => match[2] === file);
    assert.ok(imported, `Missing import: ${file}`);
    assert.ok(entries.includes(imported[1]), `Missing registry entry: ${file}`);
  }
});

test('the unchanged legacy fixture still passes runtime validation', async () => {
  // Resolve the original extensionless hosted import without changing its source.
  const source = stripTypeScriptTypes(read('../app/src/legacy-fixture.ts'))
    .replace("'./schema'", JSON.stringify(new URL('../app/src/schema.ts', import.meta.url).href));
  const { legacyFixture } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  assert.equal(validateArtifact(legacyFixture).ok, true);
});

test('valid input is returned unchanged, including optional metadata and harmless extra fields', () => {
  const value = { ...structuredClone(example), updated: '', tags: [], series: { id: 'series', title: 'Series', order: 1 }, extra: 'kept' };
  const result = validateArtifact(value);
  assert.equal(result.ok, true);
  assert.equal(result.artifact, value);
  assert.equal(assertArtifact(value), value);
  assert.deepEqual(parseArtifact(JSON.stringify(value)).artifact, value);
});

test('nonobjects, invalid JSON and incomplete envelopes fail without throwing in imports', () => {
  for (const value of [null, [], false, 7, 'hello']) rejects(value, '$');
  for (const text of ['', '{', '{"title": "bad",}', 'undefined']) {
    const result = parseArtifact(text);
    assert.equal(result.ok, false);
    assert.match(result.issues[0].message, /Invalid JSON/);
  }
  for (const key of ['schemaVersion', 'slug', 'title', 'summary', 'contributor', 'theme', 'status', 'blocks']) {
    const value = structuredClone(example); delete value[key]; rejects(value, `$.${key}`);
  }
});

test('metadata enums, nested metadata and shareable identities are validated', () => {
  for (const [key, bad] of [['schemaVersion', 2], ['slug', '../bad'], ['slug', ''], ['theme', 'other'], ['status', 'live'], ['tags', null], ['series', []], ['updated', null]]) {
    rejects({ ...example, [key]: bad }, `$.${key}`);
  }
  rejects({ ...example, tags: ['valid', 3] }, '$.tags[1]');
  rejects({ ...example, series: { id: 'x', title: 'Series', order: Infinity } }, '$.series.order');
  rejects({ ...example, series: { id: 4, title: 'Series', order: 1 } }, '$.series.id');
});

test('empty, duplicate, malformed and unknown blocks cannot reach the renderer', () => {
  rejects({ ...example, blocks: [] }, '$.blocks');
  for (const value of [null, [], 'text']) rejects(artifactWith(value), '$.blocks[0]');
  for (const type of ['widget', 'constructor', '__proto__', 'toString']) rejects(artifactWith({ id: 'x', type }), '$.blocks[0].type');
  for (const id of ['', ' ', ' step', 'step ', 'step 1', 'step\t1', 'step\n1', 'step\r1', 'step\f1']) {
    rejects(artifactWith({ ...example.blocks[0], id }), '$.blocks[0].id');
  }
  rejects({ ...example, blocks: [example.blocks[0], { ...example.blocks[0] }] }, '$.blocks[1].id');
});

test('each block rejects missing fields the renderer reads', () => {
  const fields = {
    hero: 'body', text: 'heading', 'stat-strip': 'items', steps: 'items', comparison: 'columns',
    quote: 'attribution', 'note-callout': 'title', 'cta-band': 'body', checklist: 'items',
    timeline: 'items', code: 'code', embed: 'caption', exercise: 'explanation', 'compact-table': 'columns', diagram: 'nodes', slideshow: 'slides', divider: 'id',
  };
  for (const block of blocks) {
    const value = structuredClone(block); delete value[fields[block.type]];
    rejects(artifactWith(value), `$.blocks[0].${fields[block.type]}`);
  }
});

test('nested list values have precise failure paths', () => {
  const invalid = [
    [{ id: 'x', type: 'steps', heading: 'Steps', items: [{}] }, 'items[0]'],
    [{ id: 'x', type: 'stat-strip', items: [{ value: 12, label: 'Voltage' }] }, 'items[0].value'],
    [{ id: 'x', type: 'comparison', heading: 'Compare', columns: [null] }, 'columns[0]'],
    [{ id: 'x', type: 'checklist', heading: 'Check', items: [{ label: 'Step', detail: [] }] }, 'items[0].detail'],
    [{ id: 'x', type: 'timeline', heading: 'Time', items: [{ time: 'Now', title: 'Event' }] }, 'items[0].detail'],
    [{ id: 'x', type: 'diagram', heading: 'Flow', nodes: [{ title: 'Start' }] }, 'nodes[0].detail'],
    [{ id: 'x', type: 'slideshow', heading: 'Tour', slides: [{ title: 'Start' }] }, 'slides[0].body'],
    [{ id: 'x', type: 'compact-table', heading: 'Grid', columns: ['A'], rows: [[false]] }, 'rows[0][0]'],
  ];
  for (const [block, path] of invalid) rejects(artifactWith(block), `$.blocks[0].${path}`);
});

test('optional fields may be omitted but cannot use unsupported types or values', () => {
  for (const [type, key, bad] of [['hero', 'eyebrow', 3], ['code', 'language', null], ['divider', 'label', {}], ['note-callout', 'tone', 'danger'], ['compact-table', 'caption', null]]) {
    const value = structuredClone(blocks.find(block => block.type === type));
    delete value[key]; assert.equal(validateArtifact(artifactWith(value)).ok, true);
    value[key] = bad; rejects(artifactWith(value), `$.blocks[0].${key}`);
  }
});

test('exercises require an integer answer pointing to an existing string option', () => {
  const exercise = blocks.find(block => block.type === 'exercise');
  for (const answer of [-1, 0.5, 2, '0', NaN]) rejects(artifactWith({ ...exercise, answer }), '$.blocks[0].answer');
  rejects(artifactWith({ ...exercise, options: [], answer: 0 }), '$.blocks[0].answer');
  rejects(artifactWith({ ...exercise, options: [false], answer: 0 }), '$.blocks[0].options[0]');
});

test('compact tables require string columns and aligned string rows', () => {
  const table = blocks.find(block => block.type === 'compact-table');
  rejects(artifactWith({ ...table, columns: ['A', 2] }), '$.blocks[0].columns[1]');
  rejects(artifactWith({ ...table, rows: [['one cell']] }), '$.blocks[0].rows[0]');
  rejects(artifactWith({ ...table, rows: ['not a row'] }), '$.blocks[0].rows[0]');
});

test('source links accept HTTP(S) and reject executable, local and malformed URLs', () => {
  const embed = blocks.find(block => block.type === 'embed');
  for (const url of ['https://example.com/reference#part', 'http://example.com']) assert.equal(validateArtifact(artifactWith({ ...embed, url })).ok, true);
  for (const url of ['javascript:alert(1)', 'data:text/html,test', 'file:///etc/passwd', '//example.com', '/relative', '', 'https://', 'java\nscript:alert(1)']) {
    rejects(artifactWith({ ...embed, url }), '$.blocks[0].url');
  }
});

test('invalid input is not mutated and bundled-content assertions give usable diagnostics', () => {
  const value = artifactWith({ id: 'x', type: 'steps', heading: 'Steps', items: 'wrong' });
  const before = JSON.stringify(value);
  assert.throws(() => assertArtifact(value), /\$\.blocks\[0\]\.items/);
  assert.equal(JSON.stringify(value), before);
  const result = validateArtifact({});
  assert.match(formatIssues(result.issues), /more issues/);
});

test('saved drafts restore only after validation, with an intact fallback and recovery message', () => {
  assert.deepEqual(restoreDraft(null, example), { draft: example, issue: '' });
  assert.deepEqual(restoreDraft(JSON.stringify(example), example), { draft: example, issue: '' });
  for (const text of ['broken JSON', 'null', JSON.stringify({ ...example, blocks: [] })]) {
    const restored = restoreDraft(text, example);
    assert.equal(restored.draft, example);
    assert.match(restored.issue, /Saved draft could not be loaded/);
    assert.match(restored.issue, /kept until you edit, import or reset/);
  }
  assert.deepEqual(example.blocks, [{ id: 'start', type: 'text', heading: 'Hello', body: 'A useful idea.' }]);
});
