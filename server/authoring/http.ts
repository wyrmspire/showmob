import { createHash, timingSafeEqual } from 'node:crypto';
import { ApiError, object, integer, uuid, parseRun, parseStep, checkLineage, hash } from './core.ts';
import type { Store, Obj } from './core.ts';
import { protocol } from './protocol.ts';
import { validateArtifact } from '../../app/src/validation.ts';
import { createRpcStore } from './store.ts';
import catalog from './catalog.json' with { type: 'json' };

type Request = { method?: string; headers?: Record<string, string | string[] | undefined>; query?: Record<string, string | string[] | undefined>; body?: unknown };
type Response = { setHeader(name: string, value: string): void; status(code: number): Response; json(value: unknown): void };
type Principal = { id: string; workspace: string; token: string; scopes: string[] };
export type Route = 'discover' | 'runs' | 'steps' | 'validate';
const digest = (s: string) => createHash('sha256').update(s).digest();

/** Each configured key is a distinct actor with an explicit workspace and read/write scopes. */
function authenticate(req: Request): Principal {
  let entries: unknown;
  try { entries = JSON.parse(process.env.SHOWMOB_AUTHORING_KEYS || '[]'); } catch { throw new ApiError(503, 'Authoring credentials misconfigured'); }
  if (!Array.isArray(entries) || !entries.length) throw new ApiError(503, 'Authoring is not enabled');
  const given = req.headers?.authorization;
  if (typeof given !== 'string' || !given.startsWith('Bearer ') || given.length > 4096) throw new ApiError(401, 'Bearer credential required');
  const keys = entries as Principal[];
  if (keys.some(k => !k || typeof k.token !== 'string' || k.token.length < 32 || typeof k.id !== 'string' || typeof k.workspace !== 'string' || !/^[a-z0-9-]{1,80}$/.test(k.id) || !/^[a-z0-9-]{1,80}$/.test(k.workspace) || !Array.isArray(k.scopes) || k.scopes.some(s => !['read', 'write'].includes(s))) || new Set(keys.map(k => k.id)).size !== keys.length || new Set(keys.map(k => k.token)).size !== keys.length) throw new ApiError(503, 'Authoring credentials misconfigured');
  const principal = keys.find(k => timingSafeEqual(digest(given.slice(7)), digest(k.token)));
  if (!principal) throw new ApiError(401, 'Invalid credential');
  return principal;
}
function query(req: Request, name: string, fallback = ''): string {
  const value = req.query?.[name];
  if (value === undefined) return fallback;
  if (typeof value !== 'string' || value.length > 200) throw new ApiError(400, `Invalid ${name}`);
  return value;
}
function body(req: Request): Obj {
  const length = req.headers?.['content-length'];
  if (typeof length === 'string' && Number(length) > protocol.limits.maxBodyBytes) throw new ApiError(413, 'Body too large');
  let raw: string;
  try { raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body); } catch { throw new ApiError(400, 'Malformed JSON'); }
  if (!raw) throw new ApiError(400, 'JSON body required');
  if (Buffer.byteLength(raw) > protocol.limits.maxBodyBytes) throw new ApiError(413, 'Body too large');
  try { return object(JSON.parse(raw)); } catch (e) { if (e instanceof ApiError) throw e; throw new ApiError(400, 'Malformed JSON'); }
}
export const snapshot = { protocol, documents: catalog.documents };
export const protocolHash = hash(snapshot);

export function makeHandler(route: Route, store: Store = createRpcStore()) {
  return async (req: Request, res: Response) => {
    res.setHeader('cache-control', 'no-store');
    res.setHeader('x-robots-tag', 'noindex, nofollow');
    try {
      const p = authenticate(req);
      const methods = route === 'discover' ? ['GET'] : route === 'validate' ? ['POST'] : ['GET', 'POST'];
      if (!methods.includes(req.method || '')) { res.setHeader('allow', methods.join(', ')); throw new ApiError(405, 'Method not allowed'); }
      const scope = req.method === 'POST' && route !== 'validate' ? 'write' : 'read';
      if (!p.scopes.includes(scope)) throw new ApiError(403, `Credential requires ${scope} scope`);
      if (route === 'discover') {
        const contract = query(req, 'contract');
        if (contract) {
          const entry = (catalog.documents as Record<string, unknown>)[contract];
          if (!entry) throw new ApiError(404, 'Unknown contract');
          return res.status(200).json({ protocolHash, contract, document: entry });
        }
        const q = query(req, 'q').toLowerCase();
        const offset = integer(Number(query(req, 'offset', '0')), 'offset', 10000);
        const matches = catalog.artifacts.filter(a => `${a.slug} ${a.title} ${a.summary}`.toLowerCase().includes(q));
        return res.status(200).json({ ...protocol, protocolHash, contracts: Object.keys(catalog.documents), actor: p.id, workspace: p.workspace, existingContent: matches.slice(offset, offset + 20), nextOffset: matches.length > offset + 20 ? offset + 20 : null });
      }
      if (route === 'validate') {
        const document = body(req);
        const result = validateArtifact(document);
        return res.status(200).json({ valid: result.ok, issues: result.ok ? [] : result.issues, documentSha256: hash(document), checks: 'Structure only; inspect content and rendering separately.' });
      }
      if (route === 'runs') {
        if (req.method === 'POST') return res.status(200).json(await store.start(p.workspace, p.id, parseRun(body(req)), snapshot));
        const runId = query(req, 'runId');
        if (runId) {
          const run = await store.read(p.workspace, uuid(runId, 'runId'));
          if (!run) throw new ApiError(404, 'Run not found');
          return res.status(200).json(run);
        }
        const offset = integer(Number(query(req, 'offset', '0')), 'offset', 10000);
        const runs = await store.list(p.workspace, query(req, 'q'), offset);
        return res.status(200).json({ runs, nextOffset: runs.length === 20 ? offset + 20 : null });
      }
      if (req.method === 'POST') {
        const input = parseStep(body(req));
        const run = await store.read(p.workspace, input.runId);
        if (!run) throw new ApiError(404, 'Run not found');
        const steps = await store.steps(p.workspace, input.runId);
        const replay = steps.find(s => s.requestId === input.requestId);
        if (replay) {
          const { revision, actor, output_sha256, created_at, ...old } = replay;
          if (actor !== p.id || hash(old) !== hash(input)) throw new ApiError(409, 'Request ID already used for a different operation');
          return res.status(200).json(replay);
        }
        if (run.protocol_sha256 !== protocolHash) throw new ApiError(409, 'Run uses an older protocol; retrieve its saved protocol and start a new run under current instructions');
        if (run.revision !== input.expectedRevision) throw new ApiError(409, 'Stale revision; retrieve the current run');
        checkLineage(input, steps);
        return res.status(200).json(await store.append(p.workspace, p.id, input));
      }
      const runId = uuid(query(req, 'runId'), 'runId');
      if (!await store.read(p.workspace, runId)) throw new ApiError(404, 'Run not found');
      const steps = await store.steps(p.workspace, runId);
      const revision = query(req, 'revision');
      if (revision) {
        const step = steps.find(s => s.revision === integer(Number(revision), 'revision'));
        if (!step) throw new ApiError(404, 'Step not found');
        return res.status(200).json(step);
      }
      const after = integer(Number(query(req, 'after', '0')), 'after');
      const selected = steps.filter(s => s.revision > after).slice(0, 20);
      return res.status(200).json({ steps: selected.map(({ output, ...metadata }) => metadata), nextAfter: selected.length === 20 ? selected.at(-1)!.revision : null });
    } catch (e) {
      return res.status(e instanceof ApiError ? e.status : 503).json({ error: e instanceof ApiError ? e.message : 'Authoring service unavailable' });
    }
  };
}
