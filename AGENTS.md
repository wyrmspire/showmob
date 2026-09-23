# Agent contribution guide

This repository treats Showmob as a content language with a renderer, not as a collection of one-off websites.

## Start here

Read these before making a structural change:

- [`docs/architecture.md`](docs/architecture.md)
- [`docs/product-brief.md`](docs/product-brief.md) — product direction (gallery + story)
- [`docs/blueprint.md`](docs/blueprint.md)
- [`docs/roadmap.md`](docs/roadmap.md)
- [`README.md`](README.md)
- [`docs/widgets.md`](docs/widgets.md)

Inspect `app/src/schema.ts`, `app/src/App.tsx`, and representative files in `app/src/content/` before editing. The repository includes a standalone Vite package, lockfile, and build configuration. Install from the lockfile and keep dependency changes explicit.

## Contribution boundary

Agents compose artifacts from the existing JSON contract. Agents do not normally invent widget code.

- Put artifact content in `app/src/content/` as plain, reviewable JSON.
- Do not add a per-page import or registry entry. The Vite content glob discovers every `.json` artifact in that directory and validates it during startup/build.
- Use `schemaVersion: 1` and the types defined in `app/src/schema.ts`.
- The canonical block shape is `{ id, type, ...widgetFields }`; use `docs/widgets.md` for exact examples and current behavior.
- Reuse renderer-owned blocks before proposing a new block type.
- Keep content independent from React components and raw CSS values.
- Choose one of the semantic theme identifiers defined by the schema.
- Keep Browse as the artifact-wide reading view; use slideshow blocks for paced presentation. Global Present mode is superseded — see [docs/shipped-vs-plan.md](docs/shipped-vs-plan.md); do not rebuild it from leftover CSS without an explicit decision.
- Preserve explicit lifecycle state: `draft`, `preview`, `published`, or `archived`. Never delete content files to hide them from production; filter the production catalog to **published** only.
- On public/production artifact pages, the authored theme wins. Theme audition belongs behind author/preview tooling, not on every share link.
- Prefer section deep links (`#block-id`) and copy-link when adding navigation chrome; do not strip `?artifact=` routing.
- Keep IDs and slugs stable when updating an existing artifact.
- Search existing slugs, tags and `series.id` values before creating a page. Edit the existing artifact when the idea belongs there; otherwise reuse its series identity with a distinct next order so the subject grows as one collection.

A new page should not require copied widget code, page-specific React, or page-specific CSS.

## Permission layers

Treat these as different levels of authority:

1. **Content author** - create or modify artifact JSON.
2. **Publisher** - change an artifact from preview to published.
3. **Curator** - change collections, tags, ordering, or relationships.
4. **Tool developer** - add or modify executable widgets and integrations.
5. **Application developer** - change the renderer, schema, persistence boundary, or application behavior.

Permission for a content task is not permission to change widget code, the schema, or the application. Permission to edit an artifact is not permission to publish it unless the task says so.

## Artifact checklist

Before committing artifact content:

- Confirm the JSON matches `app/src/schema.ts`.
- Run `node --experimental-strip-types --test tests/validation.test.mjs` with Node 22.18+ or Node 24; no package install is required.
- Use only block types the renderer supports.
- Keep claims accurate and label uncertainty, sources, and limits where relevant.
- Check titles, summaries, tags, lifecycle state, theme, block IDs, and series order.
- Verify Browse and any slideshow blocks when a runnable preview is available.
- Check narrow-screen behavior and keyboard navigation for interactive content.
- Keep content useful without relying on private context that is absent from the artifact.
- Do not add secrets, private URLs, private planning references, or personal data.

## Proposing a widget

Add a widget only when a real artifact cannot be expressed cleanly with the current vocabulary.

A widget proposal should state:

- the real content need
- why existing blocks are insufficient
- the JSON shape
- renderer behavior
- empty, error, and loading states
- accessibility and keyboard behavior
- theme-token behavior
- security implications
- migration or compatibility impact

Executable widgets, code runners, external connectors, and API-backed tools belong to the capability layer and require deliberate review.

## Repository rules

- Preserve existing files and history unless a task explicitly requires removal.
- Keep documentation in `docs/`, not in `app/src/`.
- Keep product documentation free of private process notes and internal-only links.
- Make focused commits with plain descriptions.
- Avoid drive-by dependency, formatting, schema, or toolchain changes.
- Keep package and deployment changes explicit and reviewable.
- Do not rewrite the current kernel when a smaller compatible change will do.
- Keep the schema explicit, versioned, and boring.

## Current development priority

Prove the language with one real artifact through the full existing pipeline. Let that artifact expose the next smallest improvement. Do not replace the architecture with a speculative redesign. Near-term product framing lives in [`docs/product-brief.md`](docs/product-brief.md): gallery as vocabulary plus recipes, and story as world pages versus telling.


## Live deployment and chat handoff

- Production: https://showmob.vercel.app/
- Vercel project: `maddyup/showmob`; pushes to `main` publish the production site after the Vercel build passes.
- When work starts from a chat and ships or changes a page or artifact, post the live page link back into that originating chat after deployment is verified. Chris should never need to type the URL or dig up a bookmark.
- Do not treat a green build as delivery. Open the production URL and verify the changed page or artifact renders before posting its link.
