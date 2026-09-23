import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  LIST_EDITOR_TYPES,
  addListRow,
  emptyListRow,
  isListEditableType,
  listEditorConfig,
  moveListRow,
  readListRows,
  removeListRow,
  updateListRow,
} from '../app/src/studio-list-editor.ts';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');

test('list editor config covers the four structured list block types', () => {
  assert.deepEqual([...LIST_EDITOR_TYPES], [
    'checklist',
    'timeline',
    'comparison',
    'resource-list',
  ]);
  assert.equal(listEditorConfig.checklist.listKey, 'items');
  assert.deepEqual(
    listEditorConfig.checklist.fields.map(field => field.key),
    ['label', 'detail'],
  );
  assert.equal(listEditorConfig.timeline.listKey, 'items');
  assert.deepEqual(
    listEditorConfig.timeline.fields.map(field => field.key),
    ['time', 'title', 'detail'],
  );
  assert.equal(listEditorConfig.comparison.listKey, 'columns');
  assert.deepEqual(
    listEditorConfig.comparison.fields.map(field => field.key),
    ['name', 'detail'],
  );
  assert.equal(listEditorConfig['resource-list'].listKey, 'items');
  assert.deepEqual(
    listEditorConfig['resource-list'].fields.map(field => field.key),
    ['label', 'detail', 'url'],
  );
  assert.equal(isListEditableType('checklist'), true);
  assert.equal(isListEditableType('steps'), false);
  assert.equal(isListEditableType('slideshow'), false);
});

test('list row helpers update, reorder, add and protect the last row', () => {
  const rows = [
    { label: 'A', detail: 'one' },
    { label: 'B', detail: 'two' },
  ];
  assert.deepEqual(updateListRow(rows, 0, 'label', 'A2'), [
    { label: 'A2', detail: 'one' },
    { label: 'B', detail: 'two' },
  ]);
  assert.deepEqual(moveListRow(rows, 0, 1), [
    { label: 'B', detail: 'two' },
    { label: 'A', detail: 'one' },
  ]);
  assert.deepEqual(moveListRow(rows, 0, -1), rows);
  assert.deepEqual(removeListRow(rows, 1), [{ label: 'A', detail: 'one' }]);
  assert.deepEqual(removeListRow([{ label: 'Only', detail: '' }], 0), [
    { label: 'Only', detail: '' },
  ]);
  assert.deepEqual(addListRow(rows, 'checklist'), [
    ...rows,
    emptyListRow('checklist'),
  ]);
  assert.deepEqual(emptyListRow('timeline'), {
    time: '',
    title: '',
    detail: '',
  });
  assert.deepEqual(
    readListRows(
      {
        items: [
          { label: 'Keep', detail: 'ok', extra: 'ignored' },
          null,
        ],
      },
      'checklist',
    ),
    [
      { label: 'Keep', detail: 'ok' },
      { label: '', detail: '' },
    ],
  );
});

test('Studio wires the shared list editor and offers the four starters', () => {
  const studio = read('../app/src/Studio.tsx');
  const helper = read('../app/src/studio-list-editor.ts');
  assert.match(helper, /export const listEditorConfig/);
  assert.match(studio, /from "\.\/studio-list-editor"/);
  assert.match(studio, /StructuredListEditor/);
  assert.match(studio, /isListEditableBlock\(block\)/);
  assert.match(helper, /export function isListEditableBlock/);
  assert.match(studio, /type === "checklist"/);
  assert.match(studio, /type === "timeline"/);
  assert.match(studio, /type === "comparison"/);
  assert.match(studio, /type === "resource-list"/);
  assert.match(studio, /value="checklist"/);
  assert.match(studio, /value="timeline"/);
  assert.match(studio, /value="comparison"/);
  assert.match(studio, /value="resource-list"/);
  assert.match(studio, /Add row/);
  // The four list types must not be Preview-only; the callout remains for other types.
  const listBranch = studio.indexOf('isListEditableBlock(block)');
  const previewOnly = studio.indexOf('Preview-only block');
  assert.ok(listBranch > 0 && previewOnly > listBranch);
  assert.doesNotMatch(
    studio.slice(0, listBranch),
    /Preview-only block[\s\S]*isListEditableType/,
  );
});
