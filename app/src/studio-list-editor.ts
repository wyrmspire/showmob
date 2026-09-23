import type { Block } from "./schema";

/** Shared config + pure helpers for Studio structured list blocks. */

export const LIST_EDITOR_TYPES = [
  "checklist",
  "timeline",
  "comparison",
  "resource-list",
] as const;

export type ListEditableType = (typeof LIST_EDITOR_TYPES)[number];

export type ListEditorField = {
  key: string;
  label: string;
  long?: boolean;
};

export type ListEditorConfig = {
  listKey: "items" | "columns";
  fields: readonly ListEditorField[];
};

export const listEditorConfig: Record<ListEditableType, ListEditorConfig> = {
  checklist: {
    listKey: "items",
    fields: [
      { key: "label", label: "Label" },
      { key: "detail", label: "Detail", long: true },
    ],
  },
  timeline: {
    listKey: "items",
    fields: [
      { key: "time", label: "Time" },
      { key: "title", label: "Title" },
      { key: "detail", label: "Detail", long: true },
    ],
  },
  comparison: {
    listKey: "columns",
    fields: [
      { key: "name", label: "Name" },
      { key: "detail", label: "Detail", long: true },
    ],
  },
  "resource-list": {
    listKey: "items",
    fields: [
      { key: "label", label: "Label" },
      { key: "detail", label: "Detail", long: true },
      { key: "url", label: "URL" },
    ],
  },
};

export function isListEditableType(type: string): type is ListEditableType {
  return (LIST_EDITOR_TYPES as readonly string[]).includes(type);
}

/** Narrow a Block to one of the four structured list types. */
export function isListEditableBlock(
  block: Block,
): block is Extract<Block, { type: ListEditableType }> {
  return isListEditableType(block.type);
}

export type ListRow = Record<string, string>;

export function emptyListRow(type: ListEditableType): ListRow {
  const row: ListRow = {};
  for (const field of listEditorConfig[type].fields) {
    row[field.key] = "";
  }
  return row;
}

export function updateListRow(
  rows: readonly ListRow[],
  index: number,
  key: string,
  value: string,
): ListRow[] {
  return rows.map((row, i) => (i === index ? { ...row, [key]: value } : row));
}

export function moveListRow(
  rows: readonly ListRow[],
  index: number,
  by: number,
): ListRow[] {
  const next = index + by;
  if (next < 0 || next >= rows.length) return [...rows];
  const copy = [...rows];
  [copy[index], copy[next]] = [copy[next], copy[index]];
  return copy;
}

export function removeListRow(
  rows: readonly ListRow[],
  index: number,
): ListRow[] {
  if (rows.length <= 1) return [...rows];
  return rows.filter((_, i) => i !== index);
}

export function addListRow(
  rows: readonly ListRow[],
  type: ListEditableType,
): ListRow[] {
  return [...rows, emptyListRow(type)];
}

export function readListRows(
  block: Record<string, unknown>,
  type: ListEditableType,
): ListRow[] {
  const key = listEditorConfig[type].listKey;
  const raw = block[key];
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    if (typeof item !== "object" || item === null || Array.isArray(item)) {
      return emptyListRow(type);
    }
    const source = item as Record<string, unknown>;
    const row: ListRow = {};
    for (const field of listEditorConfig[type].fields) {
      const value = source[field.key];
      row[field.key] = typeof value === "string" ? value : "";
    }
    return row;
  });
}
