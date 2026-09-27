import { createHash } from 'node:crypto';
import { canonicalJson } from '../../app/src/persistence/revisions.ts';
import { assertArtifact } from '../../app/src/validation.ts';
import { protocol } from './protocol.ts';

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
export const hash = (value: unknown) => createHash('sha256').update(canonicalJson(value)).digest('hex');
export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export type Obj = Record<string, unknown>;
export function object(value: unknown, label = 'body'): Obj {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ApiError(400, `${label} must be an object`);
  return value as Obj;
}
export function string(value: unknown, label: string, max = 2000): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max) throw new ApiError(400, `${label} must be nonempty text, at most ${max} characters`);
  return value;
}
export function uuid(value: unknown, label: string): string {
  if (typeof value !== 'string' || !UUID.test(value)) throw new ApiError(400, `${label} must be a UUID`);
  return value.toLowerCase();
}
export function integer(value: unknown, label: string, max = 100): number {
  if (!Number.isInteger(value) || Number(value) < 0 || Number(value) > max) throw new ApiError(400, `${label} must be an integer from 0 to ${max}`);
  return Number(value);
}
function strings(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || value.length > 30) throw new ApiError(400, `${label} must be an array with at most 30 entries`);
  return value.map(v => string(v, label));
}
function exact(input: Obj, keys: string[]) {
  if (Object.keys(input).some(k => !keys.includes(k))) throw new ApiError(400, 'Unknown fields; caller identity, workspace and hashes are server-owned');
}
export function parseRun(raw: unknown) {
  const b = object(raw);
  exact(b, ['requestId', 'brief']);
  const brief = object(b.brief, 'brief');
  exact(brief, ['subject', 'purpose', 'readerContext', 'artifactKind', 'passGoal', 'assumptions', 'preserve', 'delivery']);
  if (!['page', 'working'].includes(String(brief.delivery))) throw new ApiError(400, 'delivery must be page or working');
  return {
    requestId: uuid(b.requestId, 'requestId'),
    brief: {
      subject: string(brief.subject, 'subject', 200),
      purpose: string(brief.purpose, 'purpose'),
      readerContext: string(brief.readerContext, 'readerContext'),
      artifactKind: string(brief.artifactKind, 'artifactKind', 120),
      passGoal: string(brief.passGoal, 'passGoal'),
      assumptions: strings(brief.assumptions, 'assumptions'),
      preserve: strings(brief.preserve, 'preserve'),
      delivery: brief.delivery,
    },
  };
}
export function parseStep(raw: unknown) {
  const b = object(raw);
  exact(b, ['requestId', 'runId', 'expectedRevision', 'stage', 'key', 'inputs', 'summary', 'output']);
  if (!(protocol.stages as readonly unknown[]).includes(b.stage)) throw new ApiError(400, 'Unknown stage');
  const key = string(b.key, 'key', 100);
  if (!/^[a-z0-9]+(?:[-/][a-z0-9]+)*$/.test(key)) throw new ApiError(400, 'key must use lowercase words separated by - or /');
  if (!Array.isArray(b.inputs) || b.inputs.length > protocol.limits.maxInputs) throw new ApiError(400, 'inputs must contain at most 30 revisions');
  const inputs = b.inputs.map(v => integer(v, 'input revision'));
  if (inputs.some(v => v < 1) || new Set(inputs).size !== inputs.length) throw new ApiError(400, 'inputs must be unique positive revisions');
  const output = object(b.output, 'output');
  const stage = b.stage as typeof protocol.stages[number];
  if (stage !== 'research' && !inputs.length) throw new ApiError(400, 'This stage must cite saved input revisions');
  if (stage === 'draft' || stage === 'artifact') {
    try { assertArtifact(output); } catch (e) { throw new ApiError(422, e instanceof Error ? e.message : 'Invalid artifact'); }
    if (!['draft', 'preview'].includes(String(output.status))) throw new ApiError(422, 'Authoring can only save draft or preview artifacts');
  }
  if (stage === 'review') {
    integer(output.draftRevision, 'draftRevision');
    if (!['accept', 'revise'].includes(String(output.verdict))) throw new ApiError(400, 'review verdict must be accept or revise');
    strings(output.findings, 'review findings');
    const checks = object(output.checks, 'review checks');
    for (const key of ['purpose', 'facts', 'gaps', 'representation']) string(checks[key], `checks.${key}`);
    if (!['inspected', 'not-inspected'].includes(String(checks.render))) throw new ApiError(400, 'checks.render must be inspected or not-inspected');
    if (checks.render === 'inspected') string(checks.renderEvidence, 'renderEvidence');
  }
  return { requestId: uuid(b.requestId, 'requestId'), runId: uuid(b.runId, 'runId'), expectedRevision: integer(b.expectedRevision, 'expectedRevision'), stage, key, inputs, summary: string(b.summary, 'summary', 1000), output };
}
export type StepInput = ReturnType<typeof parseStep>;
export type Step = StepInput & { revision: number; actor: string; output_sha256: string; created_at: string };
export type Run = { id: string; revision: number; protocol_sha256: string; brief: Obj; actor: string; created_at: string };
export interface Store {
  start(workspace: string, actor: string, body: ReturnType<typeof parseRun>, snapshot: unknown): Promise<Run>;
  list(workspace: string, query: string, offset: number): Promise<Run[]>;
  read(workspace: string, runId: string): Promise<Run | null>;
  steps(workspace: string, runId: string): Promise<Step[]>;
  append(workspace: string, actor: string, body: StepInput): Promise<Step>;
}

/** Lineage checks operate on saved records, not an agent's claims about them. */
export function checkLineage(body: StepInput, steps: Step[]) {
  const byRevision = new Map(steps.map(s => [s.revision, s]));
  const current = new Map(steps.map(s => [`${s.stage}:${s.key}`, s.revision]));
  const visited = new Set<number>();
  const visit = (n: number) => {
    if (visited.has(n)) return;
    visited.add(n);
    const step = byRevision.get(n);
    if (!step) throw new ApiError(409, `Missing input revision ${n}`);
    if (step.stage === body.stage && step.key === body.key) throw new ApiError(409, 'A replacement cannot depend on the record it supersedes; cite its source inputs instead');
    if (current.get(`${step.stage}:${step.key}`) !== n) throw new ApiError(409, `Input revision ${n} has been superseded; rebuild from current inputs`);
    step.inputs.forEach(visit);
  };
  body.inputs.forEach(visit);
  if (body.stage === 'review') {
    const n = Number(body.output.draftRevision);
    if (!body.inputs.includes(n) || byRevision.get(n)?.stage !== 'draft') throw new ApiError(422, 'Review must reference its exact saved draft');
  }
  if (body.stage === 'artifact') {
    const review = body.inputs.map(n => byRevision.get(n)!).find(s => s.stage === 'review' && s.output.verdict === 'accept');
    if (!review) throw new ApiError(422, 'Artifact requires an accepted saved review');
    const draft = byRevision.get(Number(review.output.draftRevision));
    if (!draft || hash(body.output) !== hash(draft.output)) throw new ApiError(422, 'Artifact must equal the reviewed draft exactly');
    if (object(review.output.checks).render !== 'inspected') throw new ApiError(422, 'Final artifact requires recorded external render inspection');
  }
}
