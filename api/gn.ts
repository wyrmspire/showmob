// Grading night test center API (see docs/grading-night.md).
//
// This Vercel server function is the only component allowed to hold the
// Supabase service-role key. The browser talks to this function; this
// function talks to the service-role-only Postgres functions. RLS is on for
// both grading tables with zero policies, so every other path is denied.
//
// Environment (Vercel project settings — never VITE_*, never in the repo):
//   SHOWMOB_SUPABASE_URL               e.g. https://<project-ref>.supabase.co
//   SHOWMOB_SUPABASE_SERVICE_ROLE_KEY  service_role key from Supabase API settings
//   SHOWMOB_GRADING_PASSCODE           shared grader passcode; every GET and POST
//                                      must send it as the x-grading-passcode
//                                      header. Unset means the API refuses all
//                                      requests (fails closed).

import { createHash, timingSafeEqual } from "node:crypto";

interface RequestLike {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
}

interface ResponseLike {
  setHeader(name: string, value: string): void;
  status(code: number): ResponseLike;
  json(payload: unknown): void;
}

const SUBJECT_ID = /^GN-[0-9]{3}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const GRADE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_TEXT = 8000;
const MAX_BODY = 64_000;
const MAX_WIDGET_EVENTS = 200;

function env(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

/** Constant-time passcode check. No configured passcode means no access. */
function authorized(req: RequestLike): boolean {
  const expected = process.env.SHOWMOB_GRADING_PASSCODE;
  if (!expected) return false;
  const raw = req.headers?.["x-grading-passcode"];
  const given = Array.isArray(raw) ? raw[0] : raw;
  if (typeof given !== "string" || !given) return false;
  return timingSafeEqual(digest(given), digest(expected));
}

async function rpc(fn: string, params: Record<string, unknown>): Promise<unknown> {
  const base = env("SHOWMOB_SUPABASE_URL").replace(/\/$/, "");
  const key = env("SHOWMOB_SUPABASE_SERVICE_ROLE_KEY");
  const res = await fetch(`${base}/rest/v1/rpc/${fn}`, {
    method: "POST",
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const detail = (await res.text()).slice(0, 300);
    throw new Error(`${fn} failed (${res.status}): ${detail}`);
  }
  return res.json();
}

function text(value: unknown, max = MAX_TEXT): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

function score(value: unknown): number | undefined {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 10 ? n : undefined;
}

function pick<T extends string>(value: unknown, allowed: readonly T[]): T | undefined {
  return allowed.includes(value as T) ? (value as T) : undefined;
}

/** Only the known score keys reach the table; anything else is dropped. */
export function cleanScores(raw: unknown): Record<string, unknown> {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error("scores must be a JSON object");
  }
  const input = raw as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  const rating = score(input.one_to_ten);
  if (rating === undefined) throw new Error("scores.one_to_ten must be an integer 1-10");
  out.one_to_ten = rating;
  for (const key of ["content", "representation", "interaction"] as const) {
    const v = score(input[key]);
    if (v !== undefined) out[key] = v;
  }
  const moreLess = pick(input.more_less_likely, ["more", "less", "neutral"] as const);
  if (moreLess) out.more_less_likely = moreLess;
  const density = pick(input.density_judgment, ["too thin", "right", "too dense"] as const);
  if (density) out.density_judgment = density;
  const scan = pick(input.scan, ["held_up", "looked_dumb"] as const);
  if (scan) out.scan = scan;
  if (typeof input.would_send === "boolean") out.would_send = input.would_send;
  for (const key of ["widget_notes", "missing", "unneeded"] as const) {
    const v = text(input[key], 2000);
    if (v) out[key] = v;
  }
  const planVs = pick(input.plan_vs_execution, ["plan", "execution", "both", "neither"] as const);
  if (planVs) out.plan_vs_execution = planVs;
  const planNote = text(input.plan_vs_execution_note, 2000);
  if (planNote) out.plan_vs_execution_note = planNote;
  const gapKind = pick(input.gap_kind, ["wrong_choice", "missing_primitive", "n_a"] as const);
  if (gapKind) out.gap_kind = gapKind;
  return out;
}

/** Patch-only cleaner for plan judgment amend: merges into an existing grade's scores. */
export function cleanPlanJudgmentPatch(raw: unknown): Record<string, unknown> {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    throw new Error("scores must be a JSON object");
  }
  const input = raw as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  const planVs = pick(input.plan_vs_execution, ["plan", "execution", "both", "neither"] as const);
  if (!planVs) throw new Error("scores.plan_vs_execution is required");
  out.plan_vs_execution = planVs;
  const planNote = text(input.plan_vs_execution_note, 2000);
  if (planNote) out.plan_vs_execution_note = planNote;
  return out;
}

/** Keep the blind's answer key out of the browser response. */
export function cleanSubjects(raw: unknown): Record<string, unknown>[] {
  if (!Array.isArray(raw)) throw new Error("subjects response must be an array");
  return raw.map((subject) => {
    const row = (typeof subject === "object" && subject !== null
      ? subject
      : {}) as Record<string, unknown>;
    return {
      id: row.id,
      title: row.title,
      bucket: row.bucket,
      density: row.density,
      interaction: row.interaction,
      shape: row.shape,
      register: row.register,
      lifetime: row.lifetime,
      ab_pair: row.ab_pair,
      status: row.status,
      artifact_slug: row.artifact_slug,
    };
  });
}

function cleanBehavior(raw: unknown): Record<string, unknown> {
  if (raw === null || raw === undefined) return {};
  if (typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("behavior must be a JSON object");
  }
  const input = raw as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  const seconds = Number(input.time_on_page);
  if (Number.isFinite(seconds) && seconds >= 0) {
    out.time_on_page = Math.min(Math.round(seconds), 86_400);
  }
  const depth = Number(input.scroll_depth);
  if (Number.isFinite(depth)) out.scroll_depth = Math.max(0, Math.min(100, Math.round(depth)));
  if (typeof input.finished === "boolean") out.finished = input.finished;
  if (Array.isArray(input.widget_events)) {
    out.widget_events = input.widget_events.slice(0, MAX_WIDGET_EVENTS).map((event) => {
      const e = (typeof event === "object" && event !== null ? event : {}) as Record<string, unknown>;
      return {
        t: Math.max(0, Math.min(86_400, Math.round(Number(e.t)) || 0)),
        tag: text(e.tag, 24) ?? "unknown",
        block: text(e.block, 120) ?? null,
      };
    });
  }
  if (typeof input.ab_choice === "string" && SUBJECT_ID.test(input.ab_choice)) {
    out.ab_choice = input.ab_choice;
  }
  return out;
}

export default async function handler(req: RequestLike, res: ResponseLike) {
  res.setHeader("cache-control", "no-store");
  res.setHeader("x-robots-tag", "noindex, nofollow");
  if (!authorized(req)) {
    return res.status(401).json({ error: "passcode required" });
  }
  try {
    if (req.method === "GET") {
      const [subjects, grades] = await Promise.all([
        rpc("showmob_gn_list_subjects", {}),
        rpc("showmob_gn_list_grades", {}),
      ]);
      // Behavior and suggestion text stay server-side on list; the client
      // needs identity, scores and timing to show grading progress.
      const slim = (grades as Record<string, unknown>[]).map((g) => ({
        id: g.id,
        subject_id: g.subject_id,
        artifact_slug: g.artifact_slug,
        scores: g.scores,
        graded_at: g.graded_at,
      }));
      return res.status(200).json({ subjects: cleanSubjects(subjects), grades: slim });
    }

    if (req.method === "POST") {
      let body: unknown;
      try {
        body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body;
      } catch {
        return res.status(400).json({ error: "Malformed JSON body" });
      }
      if (typeof body !== "object" || body === null || Array.isArray(body)) {
        return res.status(400).json({ error: "JSON object body required" });
      }
      if (JSON.stringify(body).length > MAX_BODY) {
        return res.status(400).json({ error: "body too large" });
      }
      const input = body as Record<string, unknown>;

      // Amend path: merge a plan-judgment patch into an existing grade row.
      if (input.amend_grade_id !== undefined && input.amend_grade_id !== null) {
        if (typeof input.amend_grade_id !== "string" || !GRADE_ID.test(input.amend_grade_id)) {
          return res.status(400).json({ error: "amend_grade_id must be a uuid" });
        }
        let patch: Record<string, unknown>;
        try {
          patch = cleanPlanJudgmentPatch(input.scores);
        } catch (err) {
          return res.status(400).json({ error: (err as Error).message });
        }
        const rows = (await rpc("showmob_gn_amend_grade_scores", {
          p_grade_id: input.amend_grade_id,
          p_scores_patch: patch,
        })) as Record<string, unknown>[];
        if (!rows[0]) {
          return res.status(404).json({ error: "grade not found" });
        }
        return res.status(200).json({ grade: rows[0] });
      }

      const subjectId = typeof input.subject_id === "string" ? input.subject_id : "";
      if (!SUBJECT_ID.test(subjectId)) {
        return res.status(400).json({ error: "subject_id must look like GN-001" });
      }
      let artifactSlug: string | null = null;
      if (input.artifact_slug !== null && input.artifact_slug !== undefined) {
        if (typeof input.artifact_slug !== "string" || !SLUG.test(input.artifact_slug)) {
          return res.status(400).json({ error: "artifact_slug must be a slug" });
        }
        artifactSlug = input.artifact_slug;
      }
      const suggestion = text(input.suggestion);
      let scores: Record<string, unknown>;
      let behavior: Record<string, unknown>;
      try {
        scores = cleanScores(input.scores);
        behavior = cleanBehavior(input.behavior);
      } catch (err) {
        return res.status(400).json({ error: (err as Error).message });
      }
      const rows = (await rpc("showmob_gn_record_grade", {
        p_subject_id: subjectId,
        p_artifact_slug: artifactSlug,
        p_scores: scores,
        p_suggestion: suggestion ?? null,
        p_behavior: behavior,
      })) as Record<string, unknown>[];
      return res.status(200).json({ grade: rows[0] ?? null });
    }

    res.setHeader("allow", "GET, POST");
    return res.status(405).json({ error: "method not allowed" });
  } catch {
    return res.status(500).json({ error: "internal server error" });
  }
}
