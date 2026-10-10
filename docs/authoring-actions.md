# Agent authoring actions — first implementation

Status: implementation for review; migration `20260927214900_authoring_workspace` is applied to showmob-dev. This implementation is a bounded slice of ROADMAP P5.1/P5.3, shipped as a private experiment; the HTTP actions remain dark until dedicated credentials and `SHOWMOB_AUTHORING_ENABLED=true` are configured. Production content still comes from repository JSON. The API does not call a model, publish, or automatically learn from grades.

## What the system does

An authorized agent discovers the rules and vocabulary, creates a working run, saves several development passes, and returns a validated artifact. Research, alternatives, outlines and critiques remain in a server-side workspace. They do not become pages merely because they exist. A working-only run can stop before assembly.

The agent does the reasoning. The endpoints provide state, contracts, validation, traceability and concurrency control. Store concise conclusions, selected/rejected options and supporting evidence; never request or store private chain-of-thought. Do not copy whole conversations or unrelated personal history into a run.

## Actions

All requests use `Authorization: Bearer <agent credential>`. Each credential maps to a configured actor, workspace and read/write scopes; these cannot be supplied or changed in request bodies.

| Method/path | Purpose |
| --- | --- |
| GET `/api/authoring/discover` | Protocol, capabilities, limits, contract names, caller identity and searchable repository artifact metadata (`q`, `offset`). |
| GET `/api/authoring/discover?contract=widgets` | Full widget instructions and content hash. Other contracts: `schema`, `learning`, `sheet`, `representation`, `tutorial`. |
| POST `/api/authoring/runs` | Start an idempotent run with the user purpose, reader context, artifact kind, this pass goal, assumptions, preservation instructions and delivery kind. |
| GET `/api/authoring/runs?q=subject` | Find earlier work in this workspace. Lists return 20 results and `nextOffset`. |
| GET `/api/authoring/runs?runId=UUID` | Recover run identity, revision, brief and the exact protocol/document snapshot it started with. |
| POST `/api/authoring/steps` | Append one immutable pass: research, outline, representation, section, draft, review or artifact. |
| GET `/api/authoring/steps?runId=UUID&after=0` | Paginated step metadata, input references and output hashes; follow `nextAfter`. |
| GET `/api/authoring/steps?runId=UUID&revision=5` | Retrieve an exact saved output. |
| POST `/api/authoring/validate` | Validate a full artifact using the existing renderer contract; return structured issues and a canonical JSON hash. |

The action schema is [`docs/docs/authoring-openapi.json`](docs/authoring-openapi.json). It is kept outside the public static directory until activation. Its server URL is the intended production host, not a claim that the endpoints are deployed.

## Agent instructions

1. Discover; fetch the contracts needed for the task. Search both repository artifacts and existing working runs.
2. Start a run with a brief grounded in the conversation. `artifactKind` is descriptive (outline, lesson, world reference, working document, etc.), distinct from the teaching mode. `delivery` is `working` or `page`.
3. Save research and then an outline. The outline may include alternatives, topic map, scope, prerequisites and page sheets. Use the existing learning pipeline when the task is teaching; do not force every artifact into a tutorial.
4. Select representation before writing sections. Fetch real widget contracts; record choices, rejected alternatives and capability gaps in the output.
5. Develop sections under stable keys, citing exact saved input revisions. Assemble full Showmob JSON as a `draft` step after validation.
6. Inspect the actual draft through existing renderer/Studio or a repository preview. The API has no screenshot or rendering capability. Save a review of that exact draft with purpose, facts, gaps, representation and render findings. A failed review leads to new passes.
7. Save `artifact` only after an accepted review with external render evidence. Its JSON must equal the reviewed draft exactly. Export it through GET steps and use the existing reviewed repository publication path. Return a live link only after that separate path is verified.

Example start body (generate the request UUID in the caller):

```json
{
  "requestId": "a9176879-3c13-4cc4-8bf8-e4a4eab9a37d",
  "brief": {
    "subject": "Workshop process guide",
    "purpose": "Make a repeatable setup procedure",
    "readerContext": "Experienced operator, new to this process",
    "artifactKind": "working guide",
    "passGoal": "One usable first procedure",
    "assumptions": [],
    "preserve": ["Established terminology"],
    "delivery": "page"
  }
}
```

Each step has `requestId`, `runId`, `expectedRevision`, `stage`, `key`, `inputs`, `summary`, `output`. `inputs` lists run-local integer revisions, not titles or mutable slugs. The run brief and pinned protocol are implicit inputs to every pass. Research can have no saved inputs; other stages require at least one. Stage output shapes other than draft/review/artifact remain flexible so existing experiment JSON can be stored without inventing a competing schema. This deliberately does not enforce every research or outline field; semantic review remains the agent's responsibility.

A review output is:

```json
{
  "draftRevision": 5,
  "verdict": "accept",
  "findings": [],
  "checks": {
    "purpose": "What was checked against the brief",
    "facts": "Which evidence was checked and remaining uncertainty",
    "gaps": "What is missing, awkward or intentionally deferred",
    "representation": "Whether the chosen tools carry the content",
    "render": "inspected",
    "renderEvidence": "Actual preview or screenshot reference, viewport, and findings"
  }
}
```

Do not manufacture render evidence. The API verifies the presence and linkage of a review, not the truth of a model's judgment. `not-inspected` reviews can be saved but cannot finalize an artifact. Structural validity does not prove teaching effectiveness or correctness.

## Controls and provenance

- Actor and workspace come from credentials. The supplied model name is not trusted identity; separate credentials distinguish callers.
- Protocol version plus the exact instruction/document snapshot is pinned on each run. Hashes ignore JSON object key order. A changed instruction snapshot requires a new run; old runs remain readable. Ordinary content catalog additions do not change the protocol hash.
- Every write includes the expected run revision. SQL locks the run, checks the revision and appends atomically. Concurrent writers cannot silently overwrite one another.
- A request UUID can be retried unchanged. Reusing it with different input fails. Keep the same UUID when a response is lost; generate a new one for a changed request.
- Reusing a stage/key supersedes it without deleting history. New outputs cannot cite superseded inputs, including indirect ancestors. A replacement cites the prior record's sources, not the record it supersedes; this avoids making itself stale.
- Reviews cite an exact draft. Final output must match that draft, and every ancestor must still be current. Changing an outline requires rebuilding affected descendants.
- Stored `output_sha256` uses Postgres `sha256` over UTF-8 `jsonb::text`; the validate action's `documentSha256` uses sorted-key compact canonical JSON. These are distinct serialization hashes; do not compare them across algorithms.
- Limits: 100 KB request body, 100 steps per run, 30 inputs per step, 20 metadata records per list page. There is no distributed rate limiter in this first slice; restrict credential distribution and add deployment rate limits before broader access.
- DB tables have RLS and no anon/authenticated grants. Only the server service role can reach these functions. Functions use invoker privileges; no secret is bundled into the client. Workspace authorization happens in the server API, so the service-role credential must never be shared with agents.
- There is no arbitrary SQL, network fetch, code execution, publication, deletion or credential-management action. The caller's surrounding tool environment controls research and rendering.

## Custom GPT and other agents

For a private Custom GPT, import the OpenAPI schema in Actions and configure API-key/Bearer authentication with a dedicated authoring key. Keep that key out of instructions and schemas. Configure the production URL only after activation, or change the schema's server to an authorized test deployment.

A coding agent can call the same HTTPS endpoints through an authorized HTTP client; an MCP wrapper can expose those same operations later. No separate generation engine is needed. An agent cannot call an arbitrary endpoint through a connector that does not support it, and this chat's network restrictions may prevent direct HTTP access until a supported connector is configured.

A shared API key grants its workspace to everyone using that GPT: keep this pilot private. It is not per-user authentication. Multi-user rollout needs user-bound authorization/OAuth; do not share a private-workspace GPT publicly.

Official references checked 2026-09-26: [GPT Actions authentication](https://developers.openai.com/api/docs/actions/authentication), [Vercel Node functions](https://vercel.com/docs/functions/runtimes/node-js), [Supabase security](https://supabase.com/docs/guides/database/postgres/row-level-security).

## Activation and verification

1. Review the PR and run CI, including the isolated Postgres job. All authoring routes return 404 unless `SHOWMOB_AUTHORING_ENABLED=true` is set server-side; leave it unset for the private merge. The OpenAPI schema stays in `docs/` rather than the public static directory until activation.
2. Migration `20260927214900_authoring_workspace` is applied to showmob-dev and mirrored in `supabase/migrations/20260927214900_authoring_workspace.sql`. The live database had no recorded migration history, so this starts managed history without claiming the four earlier repository migrations were registered.
3. Configure `SHOWMOB_SUPABASE_URL` and `SHOWMOB_SUPABASE_SERVICE_ROLE_KEY` server-side as for the existing grading API. Add `SHOWMOB_AUTHORING_KEYS` as a JSON array of `{id, workspace, token, scopes}`. Use cryptographically random tokens at least 32 characters long and distinct actor IDs; scopes are `read` and/or `write`. These are separate from the grader passcode. Do not use a `VITE_` prefix.
4. Set `SHOWMOB_AUTHORING_ENABLED=true` only after the migration and dedicated credentials are ready, then deploy the API. Missing credentials fail closed with 503. No browser UI imports the server modules or the working records.
5. Prove discovery → start → research → outline → representation → sections → draft → external render review → artifact → retrieve. Repeat a write, try a stale revision and verify a second workspace cannot retrieve the run. Verify `/api/authoring/discover` resolves as JSON rather than the SPA fallback on the actual Vercel deployment.
6. Configure the private GPT Action/client and perform the same smoke flow. Only then call the actions live.

Local validation: `npm test`. Database integration: an empty disposable Postgres 17 database plus `TEST_AUTHORING_DATABASE_URL=... node --experimental-strip-types scripts/check-authoring-db.mjs`. This test refuses a database containing Showmob tables. It creates test roles and data; never point it at the live project. CI provisions a disposable service automatically.

Still outside this slice: in-app chat, automatic model orchestration, server rendering/screenshot review, runtime publication, cross-run typed references, per-user OAuth, automatic feedback learning, and migration of the existing experiment files into the private workspace. Existing experiments remain source fixtures and can inform the saved passes immediately.
