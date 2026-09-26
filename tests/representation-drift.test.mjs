import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// The director stage (runs/*/pages/*/representation.json) is a contract, not
// a suggestion. The shipped page must match it, or the difference must be
// explained in the file itself. Every section must also name the content
// pressure behind its block choice and at least one rejected option:
// Question 5 gets asked for every section, including the series-convention
// ones, so a new template habit can't form unnoticed.

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function findRepresentations(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...findRepresentations(path));
    else if (name === 'representation.json') out.push(path);
  }
  return out;
}

// "code (three short OS-specific blocks)" -> "code"
function normType(t) {
  return String(t).toLowerCase().split(/[\s(]/)[0];
}

const reps = findRepresentations(join(ROOT, 'runs'));

test('at least one representation exists', () => {
  assert.ok(reps.length > 0, 'expected runs/**/representation.json');
});

for (const repPath of reps) {
  const rep = JSON.parse(readFileSync(repPath, 'utf8'));
  const pageId = rep.pageId;

  test(`representation names pressure and a rejected option per section: ${pageId}`, () => {
    assert.ok(Array.isArray(rep.sections) && rep.sections.length > 0, 'sections is a non-empty array');
    for (const s of rep.sections) {
      assert.equal(typeof s.id, 'string', 'section id is a string');
      assert.ok(typeof s.pressure === 'string' && s.pressure.trim().length > 0,
        `section "${s.id}": pressure names the content/layout pressure behind the block choice`);
      assert.ok(Array.isArray(s.rejected) && s.rejected.length > 0,
        `section "${s.id}": at least one rejected option (Question 5 is asked for every section)`);
      for (const r of s.rejected) {
        assert.ok(typeof r === 'string' && r.trim().length > 0,
          `section "${s.id}": rejected entries are non-empty strings`);
      }
    }
  });

  const contentPath = join(ROOT, 'app', 'src', 'content', `${pageId}.json`);
  if (!existsSync(contentPath)) continue;

  test(`shipped blocks match the representation or are explained: ${pageId}`, () => {
    const page = JSON.parse(readFileSync(contentPath, 'utf8'));
    assert.ok(Array.isArray(page.blocks), 'shipped page has a blocks array');

    const drift = rep.drift ?? {};
    for (const key of ['added', 'cut', 'renamed']) {
      if (drift[key] !== undefined) assert.ok(Array.isArray(drift[key]), `drift.${key} is an array`);
    }
    const added = new Map((drift.added ?? []).map((a) => {
      assert.equal(typeof a.id, 'string', 'drift.added[].id is a string');
      assert.equal(typeof a.type, 'string', 'drift.added[].type is a string');
      assert.equal(typeof a.why, 'string', 'drift.added[].why is a string');
      return [a.id, a];
    }));
    const renamed = new Map((drift.renamed ?? []).map((r) => {
      assert.equal(typeof r.from, 'string', 'drift.renamed[].from is a string');
      assert.equal(typeof r.to, 'string', 'drift.renamed[].to is a string');
      assert.equal(typeof r.why, 'string', 'drift.renamed[].why is a string');
      return [r.to, r];
    }));
    const cut = new Map((drift.cut ?? []).map((c) => {
      assert.equal(typeof c.id, 'string', 'drift.cut[].id is a string');
      assert.equal(typeof c.why, 'string', 'drift.cut[].why is a string');
      return [c.id, c];
    }));

    // Planned block id -> expected type. A section may ship as several blocks
    // via shipsAs (e.g. one planned "commands" section -> per-OS code blocks).
    const planned = new Map();
    for (const s of rep.sections) {
      const ids = Array.isArray(s.shipsAs) && s.shipsAs.length > 0 ? s.shipsAs : [s.id];
      for (const id of ids) {
        assert.equal(typeof id, 'string', 'planned block id is a string');
        assert.ok(!planned.has(id), `duplicate planned block id "${id}"`);
        planned.set(id, normType(s.block));
      }
    }
    for (const r of renamed.values()) {
      assert.ok(planned.has(r.from), `drift.renamed from "${r.from}" is a planned section`);
      assert.ok(!planned.has(r.to), `drift.renamed to "${r.to}" collides with a planned id`);
    }

    const shippedIds = new Set();
    for (const b of page.blocks) {
      assert.equal(typeof b.id, 'string', 'shipped block has a string id');
      shippedIds.add(b.id);
      const t = normType(b.type);
      if (renamed.has(b.id)) {
        const r = renamed.get(b.id);
        assert.equal(t, planned.get(r.from),
          `block "${b.id}": shipped as ${t}, representation planned ${planned.get(r.from)} for "${r.from}"`);
      } else if (planned.has(b.id)) {
        assert.equal(t, planned.get(b.id),
          `block "${b.id}": shipped as ${t}, representation planned ${planned.get(b.id)}`);
      } else if (added.has(b.id)) {
        assert.equal(t, normType(added.get(b.id).type),
          `block "${b.id}": shipped as ${t}, drift.added declares ${added.get(b.id).type}`);
      } else {
        assert.fail(`shipped block "${b.id}" (${t}) is not in representation.json and not explained in drift.added / drift.renamed`);
      }
    }

    for (const [id] of planned) {
      if (cut.has(id)) continue;
      const rename = [...renamed.values()].find((r) => r.from === id);
      const shippedAs = rename ? rename.to : id;
      assert.ok(shippedIds.has(shippedAs),
        `planned section "${id}" (shipped as "${shippedAs}") is missing from the page and not explained in drift.cut`);
    }
  });
}
