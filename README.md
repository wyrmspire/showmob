# Showmob

Showmob turns structured ideas into portable web pages that can be read as a normal document or presented one section at a time.

## Repository layout

- `app/src/` - the current Showmob v3 hosted-app source
- `app/src/content/` - schema-versioned JSON artifacts, including the seven-part public product brief
- `Brainstorming/idea-site-template-plan.md` - the earlier planning artifact preserved from the repository history

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

The repository version intentionally omits links to private planning documents, personal decision logs, and internal process notes.

## Documentation

- [Architecture](docs/architecture.md)
- [High-level blueprint](docs/blueprint.md)
- [Roadmap](docs/roadmap.md)
- [Agent contribution guide](AGENTS.md)
- [Authoring contract and all 17 widgets](docs/widgets.md)
- [First solid-state lesson and vocabulary findings](docs/solid-state-course-review.md)

## Validate content

With Node 22.18+ or Node 24, run:

```sh
node --experimental-strip-types --test tests/validation.test.mjs
```

This checks JSON content, the legacy fixture, catalog examples and runtime validation failure cases. Run `npm run build` as the separate type-check and production-build gate. Pasted/file imports, saved drafts and the bundled content library use the same validator in `app/src/validation.ts`.
