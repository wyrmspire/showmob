// Milestone one storage boundary: one artifact, immutable revisions, JSON export/import.
// Nothing in the renderer imports this file. Repository JSON stays the live content source.
import type { Artifact } from '../schema.ts';
import { assertArtifact, formatIssues, parseArtifact } from '../validation.ts';

export type RevisionRecord = {
  slug: string;
  revision: number;
  document: Artifact;
  documentSha256: string;
  createdAt: string;
};

export type SaveResult = { slug: string; revision: number; documentSha256: string; replayed: boolean };

export type SaveRequest = {
  slug: string;
  document: Artifact;
  expectedRevision: number | null;
  requestId: string;
  note?: string;
};

/** What a backend must do. The Supabase store and the in-memory store both implement it. */
export interface RevisionStore {
  save(request: SaveRequest): Promise<SaveResult>;
  read(slug: string, revision?: number): Promise<RevisionRecord | null>;
  head(slug: string): Promise<number | null>;
}

export class StaleRevisionError extends Error {
  constructor(message: string) { super(message); this.name = 'StaleRevisionError'; }
}

/** Stable JSON: object keys sorted, arrays kept in order, no whitespace. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, v]) => v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

/** Same artifact means same parsed meaning, ignoring whitespace and key order. */
export function sameArtifact(a: unknown, b: unknown): boolean {
  return canonicalJson(a) === canonicalJson(b);
}

/** Export exactly what is stored, as the same pretty JSON Studio and the repo use. */
export function exportArtifact(record: RevisionRecord): string {
  return `${JSON.stringify(record.document, null, 2)}\n`;
}

/** Import goes through the same runtime validator as repository content. */
export function importArtifact(text: string): Artifact {
  const result = parseArtifact(text);
  if (!result.ok) throw new Error(`Import rejected: ${formatIssues(result.issues)}`);
  return result.artifact;
}

/** Validate before anything reaches the store; the store never sees invalid documents. */
export async function saveArtifact(store: RevisionStore, request: SaveRequest): Promise<SaveResult> {
  const document = assertArtifact(request.document);
  if (document.slug !== request.slug) throw new Error(`Document slug "${document.slug}" does not match "${request.slug}".`);
  return store.save({ ...request, document });
}

/** Rollback never edits history: it saves the old document again as the next revision. */
export async function restoreRevision(store: RevisionStore, slug: string, revision: number, requestId: string): Promise<SaveResult> {
  const old = await store.read(slug, revision);
  if (!old) throw new Error(`No revision ${revision} for ${slug}.`);
  return saveArtifact(store, {
    slug, document: old.document, expectedRevision: await store.head(slug), requestId, note: `restore of revision ${revision}`,
  });
}

async function sha256Hex(text: string): Promise<string> {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/** In-memory store with the same rules as the database: append-only, stale writes rejected, retries replayed. */
export function createMemoryStore(): RevisionStore & { revisions: ReadonlyMap<string, readonly RevisionRecord[]> } {
  const revisions = new Map<string, RevisionRecord[]>();
  const requests = new Map<string, { slug: string; revision: number; canonical: string }>();
  const deepFreeze = <T>(value: T): T => {
    if (value && typeof value === 'object') { Object.values(value).forEach(deepFreeze); Object.freeze(value); }
    return value;
  };
  return {
    revisions,
    async head(slug) { return revisions.get(slug)?.length || null; },
    async read(slug, revision) {
      const list = revisions.get(slug) ?? [];
      const record = list[(revision ?? list.length) - 1];
      return record ? { ...record, document: structuredClone(record.document) } : null;
    },
    async save({ slug, document, expectedRevision, requestId }) {
      const canonical = canonicalJson(document);
      const prior = requests.get(requestId);
      if (prior) {
        if (prior.slug !== slug || prior.canonical !== canonical) throw new Error('request id was already used for a different save');
        const record = revisions.get(slug)![prior.revision - 1];
        return { slug, revision: record.revision, documentSha256: record.documentSha256, replayed: true };
      }
      const list = revisions.get(slug) ?? [];
      const head = list.length || null;
      if (head !== expectedRevision) throw new StaleRevisionError(`stale revision: head is ${head ?? 'none'}, expected ${expectedRevision ?? 'none'}`);
      const record = deepFreeze({
        slug, revision: list.length + 1, document: structuredClone(document),
        documentSha256: await sha256Hex(canonical), createdAt: new Date().toISOString(),
      });
      revisions.set(slug, [...list, record]);
      requests.set(requestId, { slug, revision: record.revision, canonical });
      return { slug, revision: record.revision, documentSha256: record.documentSha256, replayed: false };
    },
  };
}

/** One call to a SQL function from supabase/migrations. Transports: psql (scripts/milestone-one-check.mjs) today, a server API later. */
export type RevisionRpc = (fn: 'showmob_save_revision' | 'showmob_get_revision', args: Record<string, unknown>) => Promise<Record<string, unknown>[]>;

/** Stale-revision failures from the database carry SQLSTATE P0409. */
export function isStaleRevisionMessage(message: string): boolean {
  return /stale revision/.test(message);
}

/**
 * Store backed by the Postgres functions. Server-side only: the transport holds a
 * privileged credential and must never be bundled into the browser.
 */
export function createRpcStore(rpc: RevisionRpc): RevisionStore {
  type Row = { slug: string; revision: number; current_revision: number; document: Artifact; document_sha256: string; stored_sha256_matches: boolean; created_at: string };
  const read = async (slug: string, revision?: number) => {
    const row = (await rpc('showmob_get_revision', { p_slug: slug, p_revision: revision ?? null }))[0] as Row | undefined;
    if (!row) return null;
    if (!row.stored_sha256_matches) throw new Error(`Revision ${row.revision} of ${slug} no longer matches its stored hash.`);
    return { slug: row.slug, revision: row.revision, document: row.document, documentSha256: row.document_sha256, createdAt: row.created_at, currentRevision: row.current_revision };
  };
  return {
    read,
    async head(slug) { return (await read(slug))?.currentRevision ?? null; },
    async save({ slug, document, expectedRevision, requestId, note }) {
      try {
        const row = (await rpc('showmob_save_revision', {
          p_slug: slug, p_document: document, p_expected_revision: expectedRevision, p_request_id: requestId, p_note: note ?? null,
        }))[0] as { slug: string; revision: number; document_sha256: string; replayed: boolean };
        return { slug: row.slug, revision: row.revision, documentSha256: row.document_sha256, replayed: row.replayed };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (isStaleRevisionMessage(message)) throw new StaleRevisionError(message);
        throw error;
      }
    },
  };
}
