# Showmob architecture

## Purpose

Showmob is a visual language that an AI can speak. It is not primarily a website builder.

When a conversation produces something worth understanding, remembering, teaching, comparing, presenting, or working through, an agent should be able to turn it into a Showmob artifact instead of writing a new application. The artifact can be opened as a readable page, presented one section at a time, and preserved for later use.

The defining loop is:

```text
Conversation -> agent -> Showmob content -> renderer -> human interaction
             <- results and feedback <-------------------------------
```

Today, the content path is:

```text
agent -> GitHub JSON -> Showmob
```

A later persistence layer may replace GitHub at runtime:

```text
agent -> Showmob API/database -> Showmob
```

The renderer should not need to know where the content came from.

## Core contract

JSON is Showmob's authoring language. An artifact describes an experience without containing application code.

For version 1, the canonical block grammar is `{ id, type, ...widgetFields }` in a flat `blocks` array. The older `{ widgetId, props }` brainstorming form is not supported. [The widget catalog](./widgets.md) documents exact shapes and current behavior for all 19 types. `app/src/validation.ts` validates bundled content, Studio imports and saved drafts against the runtime contract.

```text
Artifact
|- identity and metadata
|- lifecycle
|- theme
|- modes
|- navigation
|- pages or sections
|  |- widget
|  |- widget
|  `- widget
|- interactions
`- optional result or feedback behavior
```

The main boundary is simple:

> Agents compose artifacts from trusted widgets. They do not normally invent widget code.

That boundary lets many experiences share one renderer instead of becoming many small React applications.

### Current implementation

The current source already establishes a useful kernel:

- `app/src/schema.ts` defines `schemaVersion: 1`, lifecycle states, five themes, and 19 renderer-owned block types.
- `app/src/content/` contains JSON artifacts that conform to the contract. `import.meta.glob` discovers every JSON file in this directory, so adding a valid artifact does not require a React registry edit.
- `app/src/App.tsx` loads the content library, renders the block vocabulary, provides Browse pages and slideshow blocks, supports search and tags, and includes a browser-local studio with JSON import and export.
- `app/src/legacy-fixture.ts` keeps an earlier artifact compiling against the current renderer.

The repository includes a standalone Vite package, lockfile, TypeScript configuration, and production build.

## Widgets are the vocabulary

Widgets are the renderer-owned vocabulary from which agents compose artifacts. A focused library of excellent widgets can express a wide range of work.

Useful families include:

- **Narrative:** hero, text, callout, quote, divider, CTA
- **Structured information:** steps, cards, comparison, stats, tables
- **Temporal information:** timeline, chronology, process
- **Evidence:** source cards, citations, code, data
- **Media:** image, video, embed, gallery
- **Learning:** flashcard, quiz, exercise, reveal, knowledge check
- **Reasoning:** decision tree, pros/cons, ranking worksheet
- **Interactive:** toggle, calculator, parameter playground
- **Visualization:** diagram, flowchart, architecture map
- **Feedback:** reaction, rating, comment, reflection
- **Tools:** trusted capabilities such as a calculator, simulator, market chart, or code runner

Tool widgets make Showmob more than a document renderer. The artifact supplies configuration and data; the application supplies reviewed functionality.

Content should be cheap to create. Capabilities should be deliberate to create. New executable widgets, data connectors, external integrations, and code runners belong to a different trust boundary from ordinary artifacts.

## Themes are a separate language

Content names a semantic theme, such as `workshop`; it does not specify raw colors, font sizes, or margins.

Themes control shared tokens such as:

- background and surface
- text and muted text
- accent and warning
- radius
- type scale
- spacing
- motion

Every widget interprets the same semantic tokens. One artifact can therefore appear as a technical manual, presentation, demonstration, essay, or field guide without rewriting its content.

The current theme vocabulary is `paper`, `signal`, `workshop`, `night`, and `field`.

## Composition patterns

Showmob should use composition patterns rather than separate rendering engines for every kind of experience. A quick explanation, course, field guide, troubleshooting guide, technical reference, research brief, case study, decision worksheet, presentation, project memory, or interactive lab can all be recipes over the same widget vocabulary.

For example, a course might combine:

1. Hero
2. Objectives
3. Explanation
4. Diagram
5. Example
6. Exercise
7. Knowledge check
8. Summary
9. Next lesson

A troubleshooting guide might combine:

1. Situation
2. Safety boundary
3. Observed versus expected
4. Decision tree
5. Measurements
6. Likely causes
7. Next test
8. Result capture

Patterns are starting points, not new application types.

## Artifacts and collections

An artifact can be a single page. A collection is an ordered experience made from multiple artifacts, such as a course with lessons and resources.

The current schema already has an optional `series` field, and `App.tsx` groups ordered artifacts into series. That is the first form of the collection model and the current subject-enrichment loop: an agent finds the existing subject, edits the artifact when the idea belongs on that page, or adds a new discovered artifact with the same series identity and a new order. The contract can grow from there without forcing one subject into one very long page.

Repository-hosted images live under `public/` and are referenced by root-relative paths. The image contract also accepts reviewed HTTP(S) URLs, which keeps it compatible with a future first-party object-storage bucket. Upload, provenance, moderation, signed URLs and deletion remain persistence-layer responsibilities; the renderer does not pretend they exist yet.

## Browse and slideshow blocks

Browse is the artifact-wide reading view. Slideshow blocks add paced presentation inside the same content tree.

- **Browse** is document-like scrolling for opening a link, studying, searching, revisiting, and mobile use.
- **Slideshow blocks** show one authored slide at a time with local navigation and a position indicator.

The artifact is authored once. The renderer changes the view. Future Study, Print, Instructor, Workshop, or Kiosk views should follow the same rule.

The current application calls the document-like view `browse`; the product concept often refers to it as Read.

Earlier Present/Read global-mode language (Drive idea-site lock) is **superseded** for the shipped v3 UX by Browse + `slideshow` blocks. Keep that history in [shipped-vs-plan.md](./shipped-vs-plan.md); do not delete the intent or rebuild Present from leftover CSS without an explicit decision.

## Persistence boundary

GitHub is the first content database. It gives the project plain JSON files, readable history, reviewable changes, rollback, and a clear repository boundary while the language is still taking shape.

When the content system is understood well enough, runtime persistence can move to a database with records for artifacts, collections, blocks, users, agents, interactions, responses, feedback, comments, sessions, and revisions. The JSON contract should remain portable across that change.

GitHub can continue to hold application code, schemas, canonical widgets, themes, and exportable artifacts even after it is no longer the runtime database.

### Planned Supabase boundary

Supabase is the planned first runtime persistence layer, not a replacement for the portable artifact contract. Postgres will hold artifact identity, lifecycle, collection membership, permissions and immutable revision records. Each revision keeps the complete `schemaVersion: 1` artifact document in JSONB so import, export and rendering stay independent from the database layout. Supabase Storage will hold reviewed media objects while Postgres records ownership, provenance, content type, size and publication state.

The browser may eventually use a publishable key for narrowly scoped owner actions protected by explicit grants and Row Level Security. It must never receive a secret or service-role key. Publication, agent submissions, schema validation, revision creation and other multi-record changes belong behind a Showmob-owned API implemented by a server runtime such as a Vercel Function or Supabase Edge Function. That API is the durable product boundary; Supabase's Data API is an implementation surface, not the public Showmob contract.

Every exposed table must have RLS and least-privilege grants. Policies should authorize against ownership or membership rows, not merely the `authenticated` role and never user-editable metadata. New tables must be deliberately exposed because current Supabase projects may not grant Data API access automatically. Storage starts private for drafts; publishing creates or promotes reviewed, addressable media without exposing another user's files.

The first persistence milestone should run beside repository artifacts: read the same JSON through the runtime validator, write an immutable revision, read it back, compare it with the input, and leave GitHub rendering unchanged until the round trip is dependable. Only then should hosted reads or writes move behind the API. The mechanics course walks learners through this plan in plainer language (`showmob-mechanics-persistence`); this section remains the decision record.

What exists now (2026-09-23): that first milestone, as a development proof. `supabase/migrations/` defines `showmob_artifacts` and append-only `showmob_artifact_revisions` (JSONB documents, a trigger that rejects UPDATE/DELETE, RLS on, no browser grants) and three `service_role`-only functions for save, read and history. `app/src/persistence/revisions.ts` is the adapter; the renderer does not import it. See `supabase/README.md`.

## Schema principles

The schema should remain boring, explicit, and inspectable.

```json
{
  "schemaVersion": 1,
  "slug": "mosfet-basics",
  "title": "MOSFET Basics",
  "summary": "How a MOSFET controls current.",
  "theme": "workshop",
  "status": "published",
  "blocks": [
    {
      "id": "intro",
      "type": "hero",
      "title": "A voltage-controlled switch",
      "body": "A short orientation to the idea."
    }
  ]
}
```

The intelligence belongs in the agent that creates the artifact and the renderer that interprets it. The schema should not hide another AI language inside itself.

## Architectural rules

1. Keep content, themes, and renderer code separate.
2. Let agents compose trusted widgets rather than generate application code.
3. Treat new capabilities as a higher-trust change than new content.
4. Keep artifacts portable across GitHub and future persistence layers.
5. Render multiple views from one content tree.
6. Prefer explicit, versioned JSON over clever implicit behavior.
7. Extend the current kernel through real use before considering a rewrite.
