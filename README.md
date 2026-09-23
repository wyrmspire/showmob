# Showmob

Showmob turns structured ideas into portable web pages that can be read as a normal document or presented one section at a time.


## How it works

Showmob is a **small idea-page site**, not a platform rebuild.

1. **Write** a `schemaVersion: 1` JSON artifact under `app/src/content/` (or export one from Studio).
2. **Render** — each block `type` maps to a trusted widget. The whole page is Browse (scroll). A slideshow is just a block when you need paced slides.
3. **Theme** — the artifact picks `paper`, `signal`, `workshop`, `night`, or `field`. Public share links keep that theme.
4. **Publish** — status is `draft` → `preview` → `published`. Production lists **published** only; files are never deleted to hide them.
5. **Ship** — merge to `main`; Vercel deploys static assets.

**Why it exists in the sprint:** one shareable URL for an idea, instead of another one-off deck. Keep it thin versus Mira/Edgerite. Details and open issues: [`docs/shipped-vs-plan.md`](docs/shipped-vs-plan.md). Human-facing orientation lives on the published guide page (`showmob-guide`).


## Repository layout

- `app/src/` - the current Showmob v3 hosted-app source
- `app/src/content/` - schema-versioned JSON artifacts, including the seven-part public product brief
- `docs/archive/idea-site-template-plan.md` - the archived pre-Showmob planning artifact; do not build against it

## Development

This repository is a standalone Vite application. Use Node.js 22.18+ (or Node.js 24):

```sh
npm install
npm run dev      # start the local development server
npm run build    # type-check and build production assets into dist/
npm run preview  # serve the production build locally
```

Run the content and validation tests with:

```sh
node --experimental-strip-types --test tests/validation.test.mjs
```

## Content model

Pages use a typed `schemaVersion: 1` JSON contract. Content, renderer-owned blocks, and theme tokens remain separate so a new page can be added without copying widget code or creating page-specific CSS.

Add a valid `.json` file to `app/src/content/` and the Vite build discovers it automatically. Reuse an existing `series.id` and choose the next `series.order` to enrich that subject with an ordered page. Images may use reviewed files under `public/` or absolute HTTP(S) URLs; the same field can point to first-party object storage later.

The repository version intentionally omits links to private planning documents, personal decision logs, and internal process notes.

## Documentation

- [Shipped vs plan + issue list](docs/shipped-vs-plan.md)
- [Architecture](docs/architecture.md)
- [High-level blueprint](docs/blueprint.md)
- [Roadmap](docs/roadmap.md)
- [Agent contribution guide](AGENTS.md)
- [Authoring contract and all 19 widgets](docs/widgets.md)
- [First solid-state lesson and vocabulary findings](docs/solid-state-course-review.md)

## Validate content

With Node 22.18+ or Node 24, run:

```sh
node --experimental-strip-types --test tests/validation.test.mjs
```

This checks JSON content, the legacy fixture, catalog examples and runtime validation failure cases. Run `npm run build` as the separate type-check and production-build gate. Pasted/file imports, saved drafts and the bundled content library use the same validator in `app/src/validation.ts`.


## Persistence foundation (optional, development only)

Showmob’s production content source remains **repository JSON**. A Supabase foundation lives on the `feat/supabase-foundation` line of work and in `supabase/`:

- Migrations and CLI `config.toml` for artifact identity, immutable revisions, denormalized lifecycle status, and an ownership column placeholder.
- Typed adapter in `app/src/persistence/` that production rendering does **not** import.
- Offline tests for export/import parity and migration/layout contracts.
- [`.env.example`](.env.example) with placeholder public URL / anon key only — no secrets, no service-role key.

Cloud Auth is not wired into the Vite app. Public signup stays disabled in local CLI config. Artifact `preview` lifecycle filtering (`VITE_SHOW_UNPUBLISHED`) is independent of Supabase. See [`supabase/README.md`](supabase/README.md) and the root [`ROADMAP.md`](ROADMAP.md) Phase 3 notes.

What is actually live in the `showmob-dev` project today, and what to do before the first `supabase db push`: [`docs/supabase.md`](docs/supabase.md).

## Local unpublished catalog

Production builds list **published** artifacts only (draft/preview JSON stays in the repo).

To see draft/preview locally:

```sh
VITE_SHOW_UNPUBLISHED=true npm run dev
```

That flag also enables the public theme audition swatches (author tools).

