# Showmob

Showmob turns structured ideas into portable web pages that can be read as a normal document or presented one section at a time.

## Repository layout

- `app/src/` - the current Showmob v3 hosted-app source
- `app/src/content/` - schema-versioned JSON artifacts, including the seven-part public product brief
- `Brainstorming/idea-site-template-plan.md` - the earlier planning artifact preserved from the repository history

## Current toolchain boundary

This snapshot targets the pinned `@instinct/files` hosted-app toolchain. It imports React and `@instinct/files`, but this repository does not yet include a package manifest, lockfile, build configuration, or standalone deployment setup. It is therefore a source baseline, not an independently runnable npm project.

Do not infer or install dependencies from the imports. A future standalone build should add an explicit manifest and configuration in a separate, reviewable change.

## Content model

Pages use a typed `schemaVersion: 1` JSON contract. Content, renderer-owned blocks, and theme tokens remain separate so a new page can be added without copying widget code or creating page-specific CSS.

The repository version intentionally omits links to private planning documents, personal decision logs, and internal process notes.

## Documentation

- [Architecture](docs/architecture.md)
- [High-level blueprint](docs/blueprint.md)
- [Roadmap](docs/roadmap.md)
- [Agent contribution guide](AGENTS.md)
- [Authoring contract and all 14 widgets](docs/widgets.md)
- [First solid-state lesson and vocabulary findings](docs/solid-state-course-review.md)

## Validate content without the hosted toolchain

With Node 22.18+ or Node 24, run:

```sh
node --experimental-strip-types --test tests/validation.test.mjs
```

No dependency installation is needed. This checks JSON content, the legacy fixture, catalog examples and runtime validation failure cases. It does not build or visually preview the hosted application. Pasted/file imports, saved drafts and the bundled content library use the same validator in `app/src/validation.ts`.
