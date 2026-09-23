# Showmob — phased development and completion roadmap

Updated: 2026-09-23. Status: proposed execution plan; no phase is complete merely because it is described here.

## Start here

Finish a dependable idea-page publishing tool first. Then, if the saved-work milestone is approved, add runtime memory without changing the content language. Shared presentation rooms are a later extension, not a prerequisite for finishing the useful core.

The normal workflow remains: conversation → agent composes or enriches JSON → validation and review → publish → return a working link. The eventual feedback loop adds: interaction → saved results → reviewed improvements.

This root document is the execution checklist and phase-order reference requested for the project. [Architecture](docs/architecture.md) defines boundaries, [widgets](docs/widgets.md) defines the authoring contract, [shipped vs plan](docs/shipped-vs-plan.md) preserves product decisions, and the earlier [roadmap](docs/roadmap.md) and [blueprint](docs/blueprint.md) retain rationale. Their future ideas are not automatically release requirements. Reconcile stale statements in Phase 0; do not delete historical decisions or content to make the documents agree.

### What “finished” means

| Release gate | Finished experience | Required phases |
| --- | --- | --- |
| Core publishing | An agent can create or enrich a useful page using existing widgets; a reviewer can preview, publish, share, and roll back it; a reader can use it on phone or desktop. No database required. | 0–2 |
| Saved-work extension | Authorized people and agents can save revisions, recover work, attach media, record responses, and propose reviewed updates without a repository deployment for every content change. | 3–5, then Phase 7 for that scope |
| Shared-session extension | A host presents an existing artifact to participants; questions and decisions survive; a reviewed recap becomes another artifact. | 6, then Phase 7 for the expanded scope |

These are scope labels, not changes to the existing package or “v3/v4” product naming. Core publishing is a valid finish line. Do not silently turn the optional extensions into an obligation to build a general CMS, social network, or autonomous agent platform.

## 1. Evidence baseline

Reviewed against GitHub `main` at [`db664923e228b886d4de5236bdc2bf45c7da09a1`](https://github.com/wyrmspire/showmob/commit/db664923e228b886d4de5236bdc2bf45c7da09a1), plus the two supplied code-dump parts. The dump header says it was generated on 2026-09-22; the filenames carry 2026-09-23. Current GitHub code takes precedence for implementation status.

- The dump and GitHub share 50 unchanged files; 14 shared files differ. `printcode.sh` is dump-only; `docs/shipped-vs-plan.md` and the lockfile are present in the current repository snapshot but absent from the dump's source sections. Do not copy an older dump over current source.
- There are **33 artifact JSON files: 13 published, 17 preview, 3 draft**. Counts are inventory, not proof of editorial or browser acceptance.
- There are **19 block types and five themes**. The original target of roughly 10–20 widgets is already met; finish quality and composition before expanding the vocabulary.
- Vite/React/TypeScript, pinned dependencies, a lockfile, and a production-build script exist. The source is already separated into `App`, `Home`, `ArtifactView`, `Studio`, `catalog`, `routing`, and `components/BlockView`. Do not schedule that split again.
- Automatic JSON discovery, shared validation, series navigation, search/tags, images, resource lists, and browser-local Studio import/export exist.
- Production catalog filtering and author-only theme audition exist in code. They require regression coverage, not a rewrite.
- The dependency-free validation suite was run for this review: **17/17 pass under Node 24.19.0**. This does not certify the production deployment, accessibility, or all interactive flows. No fresh production build or browser acceptance is claimed by this documentation change.
- Milestone one exists as a development proof (2026-09-23): one Supabase migration with append-only artifact revisions, a storage adapter outside the renderer, offline tests and a live round-trip check. See [supabase/README.md](supabase/README.md). No runtime authentication, upload backend, Showmob API, durable interaction store, live-session implementation, or production read/write path exists. The site still reads repository JSON.

### Concrete gaps to close, not generic feature wishes

| Finding | Evidence | Planned work |
| --- | --- | --- |
| Unpublished deep links fall back to Home | `routing.ts` only returns slugs found in filtered `entries`; therefore `App.tsx`'s “Not published” branch is bypassed on direct load. A source-level routing probe reproduced the fallback. | P0.2 |
| Hash navigation and focus are incomplete | `writeScreen` drops the hash; `ArtifactView` scrolls to the page top without moving focus. No section copy-link controls exist. | P1.1 |
| Lifecycle is not privacy | `catalog.ts` eagerly imports all JSON before filtering; the repository itself is public. A hidden draft is not confidential. | P0.3; private data only after P4 |
| Share previews are global | `index.html` is shared; no per-artifact metadata generation appears in the tree. | P1.2 |
| Studio supports only part of the vocabulary through forms | Nine Add-menu types; rich blocks use JSON import. A single local draft is replaced by a template/reset. | P1.3 |
| Interactions disappear | Exercise/checklist state is component-local; there is no saved result or cross-device resume. | P4.3 |
| Rendering limits need acceptance tests | Stats use three desktop columns; slideshow has buttons but no explicit arrow-key/swipe handling; `embed` is a link card, not a video player. | P1.4; optional media later |
| Documentation and test coverage lag implementation | Widget docs still describe public theme overrides and visible previews; course reviews describe missing build tooling and global Present; tests mostly validate structure. No checked-in CI/browser suite exists in the reviewed tree. | P0.1, P0.4, P2.2 |

## 2. Boundaries to keep throughout

1. Keep `schemaVersion: 1` JSON portable; preserve stable slugs, block IDs, and `?artifact=` links. Version any incompatible change deliberately.
2. Browse is the page view; paced presentation is a `slideshow` block. Do not revive a global Present shell without a new product decision.
3. Keep content, themes, and trusted renderer capabilities separate. JSON is not executable code. A new page must not need a React registry edit or page-specific CSS.
4. Enrich existing subjects: search before creating, revise when the idea belongs on the same page, or add an ordered artifact to the same series. Avoid duplicates and speculative taxonomy.
5. Keep draft/preview files and history. Publication authority is distinct from authorship; permission to write does not imply permission to publish.
6. Keep the public repository free of private user data. Future private content must stay out of public bundles, static exports, logs, and public search results.
7. Introduce new widgets only when real content exposes a gap. Include schema, validation, editor path, renderer, accessibility, examples, and tests in each approved capability change.
8. Do not rebuild already-shipped modules or change frameworks to implement this roadmap. A small adapter and bounded server operations should suffice for the first persistence experiment.

## 3. Phase ledger and dependencies

All phase gates below are **open**. Existing source is credited in the baseline; completion requires evidence at the target commit.

| Phase | Outcome | Depends on | Completion signal |
| --- | --- | --- | --- |
| 0 | Reliable baseline and honest public behavior | Current main | Reproducible checks, routing fix, reconciled docs |
| 1 | Dependable authoring and share links | 0 | Create/edit/export/share flows work on keyboard and phone |
| 2 | Core publishing release | 1 | Five to ten representative real pages accepted; publish and rollback demonstrated |
| 3 | One immutable revision round trip | 2 + approval of extension | Same validated JSON survives save/read/export/import; static app unaffected |
| 4 | Secure personal memory, media, and responses | 3 + access-model decision | Two-user isolation and cross-device recovery demonstrated |
| 5 | Reviewed agent enrichment and versioned API | 4 | Scoped agent proposal → review → publish → rollback without code edits |
| 6 | Shared sessions and recap artifact | 5 + approval of room scope | Multi-client room, reconnect, durable notes, reviewed recap |
| 7 | Operable extension release | 5 or 6, according to chosen scope | Restore drill, security checks, limits, release evidence |

Phase 3 is the first backend milestone, matching the earlier roadmap. Phases 0–2 qualify the existing frontend before switching any production content source. No wider backend feature should bypass the one-artifact round-trip gate.

## Phase 0 — qualify the current baseline

Goal: know which behavior is shipped, tested, or merely planned.

- [ ] **P0.1 — Reconcile current guidance.** Link this file from README, AGENTS, and `docs/roadmap.md`; update stale runtime descriptions in widgets/blueprint/course reviews while retaining their dated historical findings. State that the current source is modular, builds standalone, filters published content, and uses embedded slideshows.
- [ ] **P0.2 — Fix route classification.** Preserve the requested slug until the app can distinguish published, withheld, and unknown artifacts. Give unpublished and unknown URLs an intentional state, including reload and Back/Forward behavior. Do not leak private titles when private runtime artifacts arrive later.
- [ ] **P0.3 — Document publication versus privacy.** Production must not expose author controls by accidental configuration. Test default production and author-preview builds separately. Explain that `VITE_SHOW_UNPUBLISHED` is a build/dev setting, not authentication; public Git files remain public.
- [ ] **P0.4 — Establish repeatable checks.** Add CI for locked install, content tests, type-check/build, and a small browser smoke suite. Validate published-only home, series, deep links, and authored themes in the production build. Keep the dependency-free validation command available.

Exit gate: a clean checkout has reproducible checks; a preview/draft URL no longer silently becomes Home; existing artifacts and all five themes remain intact. Record command output and commit SHA. Do not mark deployment verified based only on local tests.

## Phase 1 — finish the authoring and sharing loop

Goal: an artifact can be created, changed, and shared without surprise data loss or broken navigation.

- [ ] **P1.1 — Section links and focus.** Support `?artifact=<slug>#<block-id>` on first load, navigation, and Back/Forward. Add copy-link and a compact table of contents for long artifacts. Define missing-anchor fallback. Move keyboard focus meaningfully without fighting the reader's scroll.
- [ ] **P1.2 — Share metadata.** Generate per-published-artifact title, summary, canonical link, and social metadata that a non-JavaScript crawler can read. First choose a static-compatible delivery approach and document how it resolves the existing query URLs; client-side title changes alone are insufficient. Preserve old links if clean paths are introduced. Generated OG artwork is optional polish.
- [ ] **P1.3 — Safe Studio workflow.** Make slug/contributor/series metadata editable through a clear form or validated JSON path. Make unsupported form fields visibly JSON-only. Validate before export; keep invalid edits recoverable. Add confirmation or undo for template/reset/import replacement, reliable save/error notices, and tests for unavailable storage and corrupted drafts. Multiple browser-local drafts are optional unless real use needs them before P4.
- [ ] **P1.4 — Interaction and layout hardening.** Fix variable-length stats/comparisons and long slideshow controls. Add focused arrow-key navigation and deliberate swipe handling without intercepting text inputs or normal page scrolling. Check semantic headings, focus indicators, announced exercise feedback, reduced motion, image failure recovery after a source edit, and readable overflow for tables/code.
- [ ] **P1.5 — Honest vocabulary.** Label `embed` as a reference card and `diagram` as an ordered flow. Use existing images for complex diagrams. Prioritize citations, a reveal/accordion, or richer media only if an acceptance artifact cannot be expressed clearly otherwise; do not add them just to reach a widget count.

Exit gate: create a real draft, change content, reorder/duplicate blocks, export, reload, import, and recover from an invalid import without losing the last valid work. Share a specific block and open it in another browser. Verify keyboard-only use and narrow-screen layout across representative themes. No new backend is required.

## Phase 2 — prove real content and finish core publishing

Goal: make five to ten useful pages the acceptance suite, not create more demo inventory for its own sake.

- [ ] **P2.1 — Choose the acceptance set from existing work.** Use the Showmob guide, mechanics explanation, defensive local-security lab, portfolio guide, and selected solid-state lessons/quiz/resources. Include a multi-page series, a long page, an image/source page, an exercise/checklist, and a slideshow. Preview status is preserved until editorial approval.
- [ ] **P2.2 — Verify the vocabulary through those pages.** Cover all 19 widget types in regression fixtures, all five themes in author preview, phone/tablet/desktop layouts, keyboard use, links, image failures, empty states, long text, and browser history. Fix demonstrated gaps; do not invent personal outcomes or unsafe technical claims to fill content.
- [ ] **P2.3 — Complete the contribution runbook.** Document find-existing → compose/update → validate → preview → review → publish → inspect production → return URL. Demonstrate adding a series part and editing an existing page without application changes. Include archive/unpublish and rollback while retaining files and stable identity.
- [ ] **P2.4 — Ship the core.** Record release SHA, accepted page URLs, build/test results, screenshots or review notes, known limitations, and a rollback rehearsal. Make the home/guide explain what works now and what is planned, without exposing private process notes.

Exit gate: a fresh contributor can ship an approved artifact by following repository guidance; a reader can open, navigate, and interact with the accepted pages; a bad content release can be recovered. No unresolved blocker involving lost drafts, broken primary navigation, inaccessible essential controls, or unintended publication.

**Stop here if the goal is the original personal publishing surface.** It is complete without accounts, a database, recording, or an API. Proceed only when a concrete workflow needs runtime memory.

## Phase 3 — prove one artifact can be saved independently of Git

Goal: prove persistence without migrating the whole app or exposing user data.

- [x] **P3.1 — Approve a development environment.** Choose the project/account, region, cost cap, and isolated test data before provisioning. Keep production unchanged and do not add secrets to the repository. Confirm current Supabase docs/changelog before implementation. *Done 2026-09-23: `showmob-dev`, Free plan ($0), ca-central-1, isolated test data only; see [supabase/README.md](supabase/README.md).*
- [x] **P3.2 — Add the smallest storage boundary.** Define an artifact identity and immutable revisions holding the full validated JSON document. Add a small repository/runtime adapter outside rendering components. Use a restricted server-side development path for this spike; no public browser writes or real private content yet. Enable RLS and deliberate grants for any exposed tables from the start. *Done 2026-09-23 as a direct-database development path (no Data API grants to browser roles).*
- [x] **P3.3 — Prove the round trip.** Save one existing artifact; read, validate, render, export, and re-import it. Compare parsed document meaning rather than whitespace/key order. Add a second revision; preserve the first. Rollback creates an auditable selection or new revision, never edits historical revision contents. *Done 2026-09-23 except the render step: stored and re-imported documents are proven equal as parsed JSON; renderer equivalence follows from that but has no separate test yet.*
- [ ] **P3.4 — Define integrity and recovery.** Validate on the trusted write boundary, atomically insert revisions and move pointers, reject stale expected-revision writes, and make retried requests idempotent. Test invalid input, interrupted writes, simultaneous edits, service unavailability, and a simple backup/restore. Missing backend configuration must leave repository reading usable. *Partly done 2026-09-23: atomic insert + pointer move, stale-write rejection and idempotent retries are proven live. Interrupted writes, service outage, and backup/restore are still open.*

Exit gate: one artifact survives the full round trip and revision recovery; renderer output is equivalent; conflicts do not silently overwrite work; no production source-of-truth switch has occurred. This is a proof, not a public collaboration release.

## Phase 4 — add secure people, assets, and useful memory

Goal: save things the current file workflow cannot: cross-device drafts and individual activity.

- [ ] **P4.1 — Identity and access.** Start invite-only, owner-first; add a small membership model only for sharing. Implement sign-in/out, session expiry/recovery, private drafts, and explicit publication. Enforce viewer/editor/publisher boundaries server-side and with ownership/membership RLS. Never authorize using user-editable metadata or possession of a slug. Test unauthenticated access, two unrelated users, a member, a removed member, and role escalation attempts.
- [ ] **P4.2 — Image uploads first.** Use private draft storage, asset ownership/provenance, upload progress/failure/retry, file-type/content/size checks, quotas, and orphan cleanup. Keep stable asset identity separate from temporary signed delivery URLs; resolve short-lived URLs at the persistence boundary, not into immutable portable JSON. Define export behavior for media and a publication/unpublish policy. Publicly downloaded media cannot be made secret retroactively. Defer audio/video processing and recordings.
- [ ] **P4.3 — Save selected interactions.** Begin with bookmarks/resume, checklist state, exercise attempts, and one clarification/reflection field. Associate results with user, artifact revision, block ID, and time. Decide whether changed content invalidates or preserves an old answer. Keep personal responses separate from the shared document. A checkmark is not evidence of competence.
- [ ] **P4.4 — Cross-device and privacy UX.** Show pending/saved/failed/conflict states; allow export and recovery on network failure. Offer deletion/export and clear retention defaults. Define member-visible versus private responses and what an agent may read. Do not turn every click into analytics by default.

Exit gate: User A saves and resumes on a second browser; User B cannot read/write A's drafts, assets, or responses through UI or direct APIs. Revocation, failed upload, expired media URL, and deletion paths work. Backups cover database records and object files, not just one of them.

## Phase 5 — enable reviewed agent enrichment and the Showmob API

Goal: authorized agents can improve a subject without changing application code or receiving unrestricted database access.

- [ ] **P5.1 — Define a small versioned contract.** Candidate operations: find/get artifact, create draft, propose revision, review proposal, publish, archive, read permitted feedback, and export. Define schemas, pagination, errors, expected-revision preconditions, idempotency, quotas, and revocable scopes. Freeze only the operations demonstrated by real workflows, not a speculative universal API.
- [ ] **P5.2 — Make proposals inspectable.** Store proposer identity, base revision, proposed document/diff, supporting sources, validation results, review decision, and publication outcome. Review may accept, reject, or request changes. Revalidate permission and base revision at acceptance; a stale proposal must not erase a newer edit.
- [ ] **P5.3 — Enrich without duplication.** Agents search existing slugs/series before creating. Demonstrate revise-one-block, add-sources, and add-next-series-part. Record parent/source relationships only where needed. Treat external text and submitted JSON as untrusted content, not instructions or permission to execute tools.
- [ ] **P5.4 — Move runtime reads deliberately.** Select one pilot collection, record whether Git or runtime is canonical, migrate with a manifest, verify counts/content/links, and switch only after parity tests. Do not maintain two writable authorities for the same artifact. Preserve repository fixtures and JSON exports. Rollback must preserve/export runtime changes before reverting routing to avoid losing new work.
- [ ] **P5.5 — Close the feedback loop.** A scoped agent reads permitted clarification responses, proposes a targeted improvement, and returns a preview link. Publication remains a separate capability. Revoked credentials and repeated requests fail safely. Webhooks, if needed, require signatures, retry deduplication, and explicit destinations.

Exit gate: scoped external caller → proposal → human review → published revision → working URL → rollback is demonstrated without a frontend code change. Invalid payloads, cross-user reads, publish-with-author-only credentials, stale revisions, and retries are covered by tests. Normal agent traffic never receives service-role credentials.

**Saved-work release candidate:** Phase 7 can close this scope now. Shared rooms are not required to make the persistence investment useful.

## Phase 6 — shared presentation sessions that leave useful artifacts

Goal: the existing presentation content can be used together, with useful memory afterward.

- [ ] **P6.1 — One small room model.** Begin with host and invited viewers; add moderator/guest roles only when needed. Pin the artifact revision, active block and slideshow position. Define room access, participant limits, expiry, host disconnect/rejoin, and explicit end-session behavior. A room controls existing Browse/slideshow content; it does not restore a global Present shell by accident.
- [ ] **P6.2 — Follow and rejoin.** Synchronize presenter position, show presence, and let a viewer browse independently and rejoin. Reconnect from authoritative stored room state; ignore duplicate or older updates. Use Realtime for coordination, durable records for facts that must survive disconnects. Presence is not an attendance archive.
- [ ] **P6.3 — Capture the minimum useful session record.** Start with questions, answers, notes, and decisions; add a simple poll if a real session needs it. Show what is being retained and who can read it. Keep private annotations distinct from room-shared contributions. Guests must not gain arbitrary content or participant access.
- [ ] **P6.4 — Turn the session into an artifact.** After the session, a scoped agent proposes a recap with decisions, unresolved questions, and linked follow-ups. Preserve source revision and session provenance; mark generated summaries as drafts and require review. Generation failure must leave original notes intact and permit a safe retry.

Exit gate: a host plus two independent viewer clients can join, follow, browse/rejoin, reconnect, ask questions, end the room, and retrieve saved notes. An unauthorized client is denied. An approved recap joins the right series without duplicating it. Audio/video recording, streaming infrastructure, transcription, and synchronized playback are outside this gate.

## Phase 7 — release and operate the chosen extension

Goal: runtime features are recoverable and understandable, not only functional in a demo.

- [ ] **P7.1 — Security review.** Test the authorization matrix through direct endpoints, storage, and realtime channels as applicable; check secrets exposure, log redaction, scoped agents, publication authority, and permission changes. RLS and API checks must agree. Review privileged functions/views explicitly.
- [ ] **P7.2 — Restore and rollback drill.** Restore revisions, media, memberships, and applicable session records in an isolated environment. Test code rollback separately from database migration recovery. Decide retention, deletion propagation, backup expiry, and recovery targets before inviting broader use.
- [ ] **P7.3 — Limits and operations.** Establish modest usage targets and test against them; set upload, room, API, and generation limits. Add useful error/latency reporting and cost alerts without logging private content. Fail gracefully when the database, auth, storage, realtime, or model provider is unavailable. Test backend migrations and credential rotation in development first.
- [ ] **P7.4 — Handoff.** Update public guide, architecture, API examples, deployment/configuration notes, incident/restore runbook, release notes, and this ledger. Attach verification evidence and live links for changed experiences. Record known limitations and an explicit owner for deferred defects.

Exit gate: every enabled feature has an acceptance record; the restore drill works; no unresolved release-blocking security or data-loss defect remains; private-data retention and support/recovery expectations are clear. Declare which release scope is finished, rather than claiming the whole wishlist is implemented.

## 4. First development work packets

Start with these small, reviewable changes; recheck current main before each one because other work may have landed.

| Packet | Files/area | Required proof |
| --- | --- | --- |
| A — Baseline and lifecycle routing | `routing.ts`, `App.tsx`, catalog tests, CI, targeted docs | Published/unpublished/unknown reload and history tests; production/preview catalog checks |
| B — Shareable sections | `ArtifactView.tsx`, `routing.ts`, block chrome/CSS | Copy/open section link in a fresh browser; keyboard focus and history |
| C — Authoring reliability | `Studio.tsx`, validation/tests | No-loss replacement/recovery; editable metadata; valid export/import |
| D — Sharing and acceptance | Metadata/build delivery, widget fixes, accepted content, release notes | Crawler-visible metadata, mobile/keyboard evidence, production link and rollback |
| E — One-revision spike, only after core gate | New persistence boundary and development migrations/tests | One- and two-revision parity, conflict/retry/failure/restore evidence |

Do not estimate completion from lines of code or number of widgets. Estimate remaining work after Packet A establishes reproducible build/browser checks; revise estimates using completed acceptance flows. Avoid fixed calendar promises before backend access and actual defects are known.

## 5. Execution rules and evidence

- One bounded packet per branch/PR. Before starting, reread `AGENTS.md`, current main, and this ledger; preserve unrelated edits and existing content.
- Keep each task status as `not started`, `in progress`, `blocked`, or `verified`. A checked box means verified, with evidence—not merely code written or a green build.
- Record task ID, scope, commit/PR, tests, preview/production URL when relevant, known limits, and rollback in a phase review under `docs/`. This file remains the index; do not create a competing board.
- Update this roadmap and the public “what works now” guide when behavior changes. Documentation-only work does not need an invented UI deployment claim.
- Minimum core checks: `npm ci`, `node --experimental-strip-types --test tests/validation.test.mjs`, `npm run build`, production-preview browser checks, and manual keyboard/mobile review. Add commands to this section when browser/backend suites actually exist; do not claim future commands already work.
- Content authority does not grant schema/capability authority. New widgets require their own reviewed contract. Backend provisioning, paid services, public signup, data migration, and recording each need an explicit scope decision.

## 6. Deferred options, with triggers

| Option | Reconsider when |
| --- | --- |
| Accordion/reveal, citation anchors, richer diagrams | Accepted content is genuinely awkward with current blocks/images; proposal includes accessible behavior and examples |
| Video player, audio, narration, replay/transcript | There is a concrete viewing workflow and a storage/delivery, consent, captions, retention, and cost plan; current `embed` does not play media |
| Courses/cohorts/assignments and adaptive follow-ups | Saved responses prove useful; define what completion measures and let users control personalization |
| Comments, shared editing, forks/remixes | Sequential proposals are insufficient; establish lineage and conflict semantics before simultaneous editing/CRDTs |
| Subject subscriptions and notifications | Users need updates to real subjects; define opt-in, frequency, and revocation |
| Semantic search and recommendations | Metadata/keyword search demonstrably fails on a sufficiently useful library; permission filtering must apply to retrieval too |
| Broader API integrations and webhooks | A named consumer needs a specific operation; no generic automation engine required |
| Tool widgets, simulators, code execution | A real lesson needs an approved capability; separate execution, security, resource limits, and review from content authoring |
| Billing, marketplaces, social feeds, extensive analytics | A separately approved product/business need exists; none are completion requirements here |

## 7. Provider references for later implementation

Planning references checked on 2026-09-23; recheck current documentation before coding. No provider infrastructure was created by this roadmap.

- [Supabase changelog](https://supabase.com/changelog) — check applicable breaking changes.
- [Data API security](https://supabase.com/docs/guides/api/securing-your-api) — grants and row policies are separate controls; exposure must be deliberate.
- [Storage access control](https://supabase.com/docs/guides/storage/security/access-control) — object permissions must match artifact access.
- [Realtime](https://supabase.com/docs/guides/realtime) — coordination and presence are not a durable session record by themselves.

**Immediate next action: Packet A. Finish and qualify the existing publishing path before expanding the runtime.**
