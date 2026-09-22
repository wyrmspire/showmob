import type { Artifact, Block } from './schema';

export type ValidationIssue = { path: string; message: string };
export type ValidationResult =
  | { ok: true; artifact: Artifact }
  | { ok: false; issues: ValidationIssue[] };

type Fields = Record<string, unknown>;
type BlockRule = {
  strings: readonly string[];
  optional?: readonly string[];
  list?: { key: string; strings?: readonly string[]; optional?: readonly string[] };
};

// Keep every renderer-owned block explicit; the type catches missing vocabulary.
const blockRules = {
  hero: { strings: ['title', 'body'], optional: ['eyebrow'] },
  text: { strings: ['heading', 'body'] },
  'stat-strip': { strings: [], list: { key: 'items', strings: ['value', 'label'] } },
  steps: { strings: ['heading'], list: { key: 'items' } },
  comparison: { strings: ['heading'], list: { key: 'columns', strings: ['name', 'detail'] } },
  quote: { strings: ['quote', 'attribution'] },
  'note-callout': { strings: ['title', 'body'] },
  'cta-band': { strings: ['heading', 'body'] },
  checklist: { strings: ['heading'], list: { key: 'items', strings: ['label'], optional: ['detail'] } },
  timeline: { strings: ['heading'], list: { key: 'items', strings: ['time', 'title', 'detail'] } },
  code: { strings: ['heading', 'code'], optional: ['language'] },
  embed: { strings: ['heading', 'source', 'caption'], optional: ['url'] },
  exercise: { strings: ['heading', 'prompt', 'explanation'], list: { key: 'options' } },
  'compact-table': { strings: ['heading'], optional: ['caption'], list: { key: 'rows' } },
  diagram: { strings: ['heading'], list: { key: 'nodes', strings: ['title', 'detail'] } },
  slideshow: { strings: ['heading'], list: { key: 'slides', strings: ['title', 'body'] } },
  divider: { strings: [], optional: ['label'] },
} satisfies Record<Block['type'], BlockRule>;

function isRecord(value: unknown): value is Fields {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateArtifact(value: unknown): ValidationResult {
  const issues: ValidationIssue[] = [];
  const issue = (path: string, message: string) => issues.push({ path, message });
  const strings = (object: Fields, keys: readonly string[], path: string, optional = false) => {
    for (const key of keys) {
      if (optional && object[key] === undefined) continue;
      if (typeof object[key] !== 'string') issue(`${path}.${key}`, 'Expected a string.');
    }
  };
  const oneOf = (field: unknown, options: readonly string[], path: string) => {
    if (typeof field !== 'string' || !options.includes(field)) {
      issue(path, `Expected one of: ${options.join(', ')}.`);
    }
  };

  if (!isRecord(value)) return { ok: false, issues: [{ path: '$', message: 'Expected an artifact object.' }] };
  if (value.schemaVersion !== 1) issue('$.schemaVersion', 'Expected schemaVersion 1.');
  strings(value, ['slug', 'title', 'summary', 'contributor'], '$');
  strings(value, ['updated'], '$', true);
  if (typeof value.slug === 'string' && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug)) {
    issue('$.slug', 'Use lowercase words or numbers separated by single hyphens.');
  }
  oneOf(value.status, ['draft', 'preview', 'published', 'archived'], '$.status');
  oneOf(value.theme, ['paper', 'signal', 'workshop', 'night', 'field'], '$.theme');
  if (value.tags !== undefined) {
    if (!Array.isArray(value.tags)) issue('$.tags', 'Expected an array of strings.');
    else value.tags.forEach((tag, i) => {
      if (typeof tag !== 'string') issue(`$.tags[${i}]`, 'Expected a string.');
    });
  }
  if (value.series !== undefined) {
    if (!isRecord(value.series)) issue('$.series', 'Expected a series object.');
    else {
      strings(value.series, ['id', 'title'], '$.series');
      if (typeof value.series.order !== 'number' || !Number.isFinite(value.series.order)) {
        issue('$.series.order', 'Expected a finite number.');
      }
    }
  }

  if (!Array.isArray(value.blocks) || value.blocks.length === 0) {
    issue('$.blocks', 'Expected at least one block.');
  } else {
    const ids = new Set<string>();
    value.blocks.forEach((block: unknown, index: number) => {
      const path = `$.blocks[${index}]`;
      if (!isRecord(block)) { issue(path, 'Expected a block object.'); return; }
      if (typeof block.id !== 'string' || !block.id.trim() || /[\t\n\f\r ]/.test(block.id)) {
        issue(`${path}.id`, 'Expected a nonempty, stable block ID without ASCII whitespace.');
      } else if (ids.has(block.id)) issue(`${path}.id`, 'Block IDs must be unique within an artifact.');
      else ids.add(block.id);
      if (typeof block.type !== 'string' || !Object.prototype.hasOwnProperty.call(blockRules, block.type)) {
        issue(`${path}.type`, 'Unknown block type. See docs/widgets.md for the supported vocabulary.');
        return;
      }
      const rule: BlockRule = blockRules[block.type as Block['type']];
      strings(block, rule.strings, path);
      if (rule.optional) strings(block, rule.optional, path, true);
      if (rule.list) {
        const { key, strings: fields, optional } = rule.list;
        const items = block[key];
        if (!Array.isArray(items)) issue(`${path}.${key}`, 'Expected an array.');
        else items.forEach((item: unknown, i: number) => {
          const itemPath = `${path}.${key}[${i}]`;
          if (!fields) {
            if (block.type !== 'compact-table' && typeof item !== 'string') issue(itemPath, 'Expected a string.');
          } else if (!isRecord(item)) issue(itemPath, 'Expected an object.');
          else {
            strings(item, fields, itemPath);
            if (optional) strings(item, optional, itemPath, true);
          }
        });
      }
      if (block.type === 'slideshow' && Array.isArray(block.slides) && block.slides.length === 0) issue(`${path}.slides`, 'Expected at least one slide.');
      if (block.type === 'compact-table') {
        if (!Array.isArray(block.columns)) issue(`${path}.columns`, 'Expected an array.');
        else block.columns.forEach((column, i) => { if (typeof column !== 'string') issue(`${path}.columns[${i}]`, 'Expected a string.'); });
        if (Array.isArray(block.rows)) block.rows.forEach((row, i) => {
          if (!Array.isArray(row)) issue(`${path}.rows[${i}]`, 'Expected an array.');
          else {
            row.forEach((cell, j) => { if (typeof cell !== 'string') issue(`${path}.rows[${i}][${j}]`, 'Expected a string.'); });
            if (Array.isArray(block.columns) && row.length !== block.columns.length) issue(`${path}.rows[${i}]`, 'Expected one cell per column.');
          }
        });
      }
      if (block.type === 'note-callout' && block.tone !== undefined) {
        oneOf(block.tone, ['note', 'positive', 'warning'], `${path}.tone`);
      }
      if (block.type === 'exercise') {
        if (typeof block.answer !== 'number' || !Number.isInteger(block.answer) || block.answer < 0 ||
            !Array.isArray(block.options) || block.answer >= block.options.length) {
          issue(`${path}.answer`, 'Expected a zero-based index of an existing option.');
        }
      }
      if (block.type === 'embed' && typeof block.url === 'string') {
        try {
          const url = new URL(block.url);
          if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error();
        } catch { issue(`${path}.url`, 'Expected an absolute http:// or https:// source URL.'); }
      }
    });
  }
  return issues.length ? { ok: false, issues } : { ok: true, artifact: value as unknown as Artifact };
}

export function parseArtifact(text: string): ValidationResult {
  let value: unknown;
  try { value = JSON.parse(text); }
  catch { return { ok: false, issues: [{ path: '$', message: 'Invalid JSON. Check quotes, commas and brackets.' }] }; }
  return validateArtifact(value);
}

export function formatIssues(issues: ValidationIssue[]): string {
  const first = issues.slice(0, 3).map(issue => `${issue.path}: ${issue.message}`).join(' ');
  return issues.length > 3 ? `${first} (${issues.length - 3} more issues.)` : first;
}

export function assertArtifact(value: unknown): Artifact {
  const result = validateArtifact(value);
  if (!result.ok) throw new Error(`Invalid Showmob artifact: ${formatIssues(result.issues)}`);
  return result.artifact;
}

// Preserve an unreadable saved value until the author explicitly edits or resets.
export function restoreDraft(text: string | null, fallback: Artifact): { draft: Artifact; issue: string } {
  if (text === null) return { draft: fallback, issue: '' };
  const result = parseArtifact(text);
  return result.ok
    ? { draft: result.artifact, issue: '' }
    : { draft: fallback, issue: `Saved draft could not be loaded. ${formatIssues(result.issues)} The starter is shown; the saved value is kept until you edit, import or reset.` };
}

