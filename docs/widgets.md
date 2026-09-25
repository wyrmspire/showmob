# Showmob authoring contract and widget catalog

This is the authoring reference for `schemaVersion: 1`, checked against `app/src/schema.ts`, `app/src/validation.ts` and `BlockView` in `app/src/components/BlockView.tsx`. It describes current behavior, including limitations. Future widget ideas are not supported types.

## Canonical grammar

An artifact contains a flat `blocks` array. Every block uses **`{ id, type, ...widgetFields }`**. The earlier brainstorming form `{ widgetId, props }` is not supported. Do not wrap fields in `props`, nest arbitrary widgets, or put React, HTML, CSS or executable expressions in the JSON. Ordinary text is rendered as text; Markdown and mathematical notation are not parsed.

The complete minimal artifact is:

```json
{
  "schemaVersion": 1,
  "slug": "one-idea",
  "title": "One useful idea",
  "summary": "A concise description for discovery.",
  "contributor": "Example author",
  "status": "preview",
  "theme": "paper",
  "blocks": [
    { "id": "start", "type": "text", "heading": "Start here", "body": "Explain the idea." }
  ]
}
```

| Field | Contract |
| --- | --- |
| `schemaVersion` | Required literal number `1`. |
| `slug` | Required string: lowercase words/numbers separated by single hyphens. Stable identity in links; unique in the discovered library. `home` and `author` are reserved for app routes and rejected by validation. |
| `title`, `summary`, `contributor` | Required strings. Use useful, nonempty copy before review or publication. |
| `status` | Required: `draft`, `preview`, `published`, `archived`. Never promote another author's work without publication authority. |
| `theme` | Required: `paper`, `signal`, `workshop`, `night`, `field`. No raw styling fields. |
| `blocks` | Required nonempty array of supported blocks. Block IDs are nonempty strings without ASCII whitespace, unique within the artifact and stable across edits. |
| `tags` | Optional array of strings. |
| `updated` | Optional string; editorial convention is `YYYY-MM-DD`. The validator does not enforce a date format. |
| `series` | Optional object with string `id`, string `title`, finite numeric `order`. Use positive, distinct integer orders within a series as an editorial convention. |

Optional fields may be omitted; `null` is not a substitute. No metadata is inferred on import. Empty descriptive strings are structurally allowed to support in-progress editing. Extra fields are ignored by the renderer and preserved in exports; they do not create capabilities. Stick to the documented contract. Validation checks structure, not factual accuracy, readability, privacy or permissions.

## Views, lifecycle and interaction

Browse lays out every block vertically and is the only artifact-wide view. A `slideshow` block provides paced presentation inside that page. Keep each unit short and inspect long content at narrow widths.

The artifact theme is the initial choice. The reader can override it using the theme controls or `style` query parameter. Browse is the default reading experience; presentation is authored as a block, not selected from an artifact-wide toolbar.

Draft and preview artifacts are **visible on the current home screen** with labels. Only archived entries are removed from discovery. Status is not access control; anything committed to this public repository is public. Importing locally does not publish to GitHub. A local draft persists in this browser; exercise answers and checklist selections do not. They reset when their block unmounts or the page closes.

## Authoring and verification

1. Compose JSON using the shapes below and select `preview` for work awaiting review.
2. Keep source attribution, uncertainty and content boundaries explicit. Use `embed` source cards until citations have a dedicated contract.
3. Add the JSON under `app/src/content/`. Vite discovers every `.json` file in that directory, validates it at startup/build time, and adds it to Browse automatically. There is no per-file React import or registry.
4. Run `node --experimental-strip-types --test tests/validation.test.mjs` with Node 22.18+ (or Node 24). This needs no package install. It checks the actual content files, the legacy fixture and every valid JSON example in this catalog.
5. In the running app, inspect Browse, slideshow controls, all five themes, narrow screens and keyboard interaction. A passing validator does not replace visual review.

The validator is used for bundled content, pasted/file imports and saved-draft restoration. Invalid imports leave the current draft untouched and report paths such as `$.blocks[2].options[0]`. An unreadable saved draft displays the starter and an alert, retaining the saved value until the author edits, imports or resets. Required fields of the wrong type reject the artifact; no partial import or silent repair occurs.

To enrich an existing subject, first search `app/src/content/` for its slug, tags and `series.id`. Edit the existing artifact when the idea belongs on the same page; otherwise add another artifact with the same `series.id`, the same `series.title`, and a new `series.order`. The home shelf and previous/next navigation update automatically. Keep new work in `preview` until the contributor and publisher have reviewed it.

Studio’s Add menu covers **13 of 19** types: `text`, `slideshow`, `compact-table`, `diagram`, `note-callout`, `steps`, `checklist`, `timeline`, `comparison`, `resource-list`, `quote`, `divider`, and `cta-band`. It can also edit an existing `hero`. Still missing from Add (use Import / JSON): `hero` (add), `stat-strip`, `code`, `embed`, `image`, `exercise`. **Rich blocks = JSON tab:** unsupported Add types still render in preview when present. Templates may contain richer blocks. This catalog documents all 19 renderer types, not only Studio's Add menu.

## Widget reference

Every example is a complete valid block. All fields shown are required unless explicitly marked optional below. String-array and object-array distinctions matter. Empty arrays are accepted for display lists and render no entries; prefer a text or callout explaining missing evidence. Exercises must have an option referenced by `answer`.

### `hero`

Use for a page's main orientation. Required strings: `title`, `body`. Optional string: `eyebrow`.

```json
{ "id": "start", "type": "hero", "eyebrow": "Short lesson", "title": "Follow the signal", "body": "Learn to separate a command from the load it controls." }
```

Bad: `{"id":"start","type":"hero","props":{"title":"Hello","body":"World"}}` is missing the required top-level fields. Browse renders an `h1` and introduction. Prefer one hero per artifact and short titles. Omitting `eyebrow` leaves its container empty; there is no inferred subtitle.

### `text`

Use for one explanation. Required strings: `heading`, `body`.

```json
{ "id": "meaning", "type": "text", "heading": "Name the reference", "body": "A voltage is measured between two points." }
```

Bad: `{"id":"meaning","type":"text","heading":"Reference","body":["First","Second"]}` uses an array where a string is required. Both views render `h2` and one paragraph. Do not depend on Markdown, HTML or line breaks creating separate paragraphs. Long prose can overflow a presentation viewport; split ideas into blocks.

### `stat-strip`

Use for a small set of sourced figures. Required `items`: array of objects with string `value` and `label`. Numbers must be formatted as strings.

```json
{ "id": "figures", "type": "stat-strip", "items": [{ "value": "12 V", "label": "Hypothetical supply" }, { "value": "1 kΩ", "label": "Hypothetical resistance" }] }
```

Bad: `{"id":"figures","type":"stat-strip","items":[{"value":12,"label":"Volts"}]}` has a numeric value. Both views show labeled figure cards in a region named “Key figures.” Labels must explain units and scope without relying on color. Empty items show no figures. Keep labels distinct because the renderer uses them as keys.

### `steps`

Use for an ordered sequence. Required string `heading`; `items` is an array of strings.

```json
{ "id": "sequence", "type": "steps", "heading": "Work the question", "items": ["State the expected result.", "Compare it with the observation.", "Choose one next check."] }
```

Bad: `{"id":"sequence","type":"steps","heading":"Sequence","items":[{"label":"First"}]}` has an object instead of a string. Both views show an ordered list with visual numbering. Write steps that make sense in reading order; they are not expandable or tracked. Empty items leave only the heading. Avoid duplicate text keys.

### `comparison`

Use for alternatives or expected versus observed. Required string `heading`; `columns` contains objects with string `name` and `detail`.

```json
{ "id": "compare", "type": "comparison", "heading": "Separate the roles", "columns": [{ "name": "Control", "detail": "Requests the change." }, { "name": "Power", "detail": "Supplies the load energy." }] }
```

Bad: `{"id":"compare","type":"comparison","heading":"Roles","columns":[{"name":"Control"}]}` omits `detail`. Both views render heading-bearing cards in a responsive grid, not a semantic table. Name each card clearly; keep details comparable and names distinct. Empty columns leave only the heading.

### `quote`

Use for a short attributable quotation. Required strings: `quote`, `attribution`.

```json
{ "id": "quote", "type": "quote", "quote": "Record what you can actually support.", "attribution": "Example wording written for this catalog" }
```

Bad: `{"id":"quote","type":"quote","quote":"Someone said this","attribution":null}` lacks a string attribution. Both views use `figure`, `blockquote` and `figcaption`, with quotation marks added by the renderer. Do not add another pair of outer quotation marks or invent a source. Empty attribution is structurally valid but editorially incomplete.

### `note-callout`

Use for a limit, useful note or warning. Required strings: `title`, `body`. Optional `tone`: `note`, `positive`, `warning`; defaults to `note`.

```json
{ "id": "limit", "type": "note-callout", "title": "Paper example", "body": "These values explain a principle, not a hardware specification.", "tone": "note" }
```

Bad: `{"id":"limit","type":"note-callout","title":"Limit","body":"Read this","tone":"danger"}` uses an unsupported tone. Both views delegate to the hosted `Callout` component. State the meaning in words, not only the tone color; verify hosted contrast and screen-reader behavior in preview. Missing required strings reject the artifact.

### `cta-band`

Use for a closing action expressed as text. Required strings: `heading`, `body`.

```json
{ "id": "next", "type": "cta-band", "heading": "Explain it once", "body": "Write the distinction in your own words." }
```

Bad: `{"id":"next","type":"cta-band","heading":"Next","body":false}` has a boolean body. Both views show an accent band and heading. This is not a button or link; an extra `url` is ignored. Write an action the reader can understand without clicking. Check text contrast across themes in the hosted app.

### `checklist`

Use for a temporary self-check. Required string `heading`; `items` contains objects with required string `label` and optional string `detail`.

```json
{ "id": "review", "type": "checklist", "heading": "Review the explanation", "items": [{ "label": "Name the reference", "detail": "Say what the voltage is relative to." }, { "label": "Name one uncertainty" }] }
```

Bad: `{"id":"review","type":"checklist","heading":"Review","items":["Done"]}` uses a string instead of an object. Both views use toggle buttons with `aria-pressed`; native buttons support keyboard activation. Missing `detail` hides the secondary copy. Empty items produce no buttons. Selections are local to the mounted block, not evidence of completion. Use distinct labels.

### `timeline`

Use for chronology. Required string `heading`; `items` contains objects with string `time`, `title` and `detail`.

```json
{ "id": "history", "type": "timeline", "heading": "Observed sequence", "items": [{ "time": "Before", "title": "Normal state", "detail": "The expected condition was present." }, { "time": "After", "title": "Changed state", "detail": "Record the actual difference." }] }
```

Bad: `{"id":"history","type":"timeline","heading":"Sequence","items":[{"time":1,"title":"First","detail":"Observed"}]}` uses a number for `time`. Both views render the authored order with time labels and headings; they do not sort or parse dates. The renderer uses `time` elements without `dateTime`. Make chronology clear in the text and use distinct time labels. Empty items leave the heading.

### `code`

Use for literal code or data to read. Required strings: `heading`, `code`. Optional string `language` is retained but does not enable syntax highlighting.

```json
{ "id": "data", "type": "code", "heading": "A small value", "language": "json", "code": "{\"schemaVersion\": 1}" }
```

Bad: `{"id":"data","type":"code","heading":"Data","code":{"answer":1}}` uses an object instead of a string. Both views render escaped text in `pre`/`code`; nothing executes. Provide a plain-language explanation separately, keep lines short and inspect horizontal scrolling on mobile. Missing language changes nothing; empty code renders an empty code region.

### `embed`

Use as a source/reference card. Required strings: `heading`, `source`, `caption`. Optional string `url`, restricted to an absolute HTTP(S) URL.

```json
{ "id": "source", "type": "embed", "heading": "Manufacturer reference", "source": "Texas Instruments", "caption": "Gate-drive background; opens an external source.", "url": "https://www.ti.com/lit/slua618" }
```

Bad: `{"id":"source","type":"embed","heading":"Source","source":"Untrusted","caption":"Open","url":"javascript:alert(1)"}` is rejected. Both views show a reference card, not an iframe, video player or fetched page. With no URL there is no link. With a URL, “Open source” opens a new tab with `rel="noreferrer"`. Name the source and what it supports in adjacent text; the generic repeated link label is a current accessibility limitation. No loading or remote-error state exists because the app does not fetch the source.

### `image`

Use for an authored visual that materially improves the explanation. Required strings: `src`, `alt`, `caption`. Optional strings: `heading`, `sourceUrl`. `src` accepts a root-relative asset path such as `/images/network.svg` or an absolute HTTP(S) URL. `sourceUrl`, when present, must be absolute HTTP(S).

```json
{ "id": "topology", "type": "image", "heading": "A separated lab", "src": "/images/defensive-home-lab.svg", "alt": "A router separates trusted devices, a passive sensor, and an isolated decoy.", "caption": "A defensive lab topology." }
```

Bad: `{"id":"image","type":"image","src":"javascript:alert(1)","alt":"","caption":"Unsafe"}` uses a disallowed source. The renderer uses a responsive `img`, lazy loading, authored alternative text and a visible caption. If the image fails, it replaces the empty frame with an “Image unavailable” warning that retains the caption. Decorative images should use an empty `alt`; informative images need equivalent meaning in `alt` and surrounding content. Prefer repository assets for stable, privacy-preserving media. An approved first-party object-storage URL can use the same `src` field later; external hosts learn the reader's IP and referrer policy may vary, so review them deliberately. This block never accepts uploads or executable markup by itself.

### `resource-list`

Use for a curated set of sources or next-step links. Required string `heading`; `items` contains objects with string `label`, `detail` and absolute HTTP(S) `url`.

```json
{ "id": "references", "type": "resource-list", "heading": "Official references", "items": [{ "label": "NIST publications", "detail": "Primary cybersecurity guidance.", "url": "https://csrc.nist.gov/publications" }] }
```

Bad: `{"id":"references","type":"resource-list","heading":"Links","items":[{"label":"Run this","detail":"Unsafe scheme","url":"data:text/html,test"}]}` is rejected. Each item is one keyboard-focusable link with a descriptive label and detail; a visual arrow is hidden from assistive technology. Links open in a new tab with `rel="noreferrer"`. Empty items leave only the heading. Prefer primary sources, distinct labels and enough detail to explain why each link belongs.

### `exercise`

Use for a single-choice knowledge check. Required strings: `heading`, `prompt`, `explanation`; `options` is an array of strings. Required `answer` is a zero-based integer indexing an existing option. Prefer at least two distinct choices.

```json
{ "id": "check", "type": "exercise", "heading": "Check the model", "prompt": "What does a voltage need?", "options": ["A reference point", "A moving part"], "answer": 0, "explanation": "Voltage describes a difference between two points." }
```

Bad: `{"id":"check","type":"exercise","heading":"Check","prompt":"Choose","options":["A","B"],"answer":2,"explanation":"Why"}` points past the options array. Both views show numbered buttons with `aria-pressed` and a feedback callout after selection. The same explanation is shown for every choice. Options are buttons, not a radio group; selections reset on unmount and no score is exported. Feedback is not explicitly a live region in this renderer. Do not claim assessment persistence or proven screen-reader announcements.


### `compact-table`

Use for small comparison or reference grids. Required string `heading`; required `columns` array of strings; required `rows` array of string arrays with exactly one cell per column. Optional string `caption`.

```json
{ "id": "matrix", "type": "compact-table", "heading": "Choose a path", "columns": ["Need", "Start"], "rows": [["Read", "Open the page"], ["Build", "Open Studio"]], "caption": "A compact starting map." }
```

Bad: `{"id":"matrix","type":"compact-table","heading":"Map","columns":["A","B"],"rows":[["only one"]]}` has the wrong number of cells. The renderer uses a semantic table inside a horizontally scrollable container. When a table is wider than its container the wrapper shows a right-edge fade and a "scrolls sideways" hint until the reader reaches the end. Keep it compact; use prose for long explanations.

### `diagram`

Use for a short ordered flow. Required string `heading`; required `nodes` array with string `title` and `detail`.

```json
{ "id": "flow", "type": "diagram", "heading": "From signal to action", "nodes": [{ "title": "Observe", "detail": "Name the input." }, { "title": "Decide", "detail": "Choose the next check." }] }
```

Bad: `{"id":"flow","type":"diagram","heading":"Flow","nodes":["Start"]}` uses a string instead of a node object. The visual arrows reinforce array order; the semantic ordered list carries the same sequence without relying on the arrows.

### `slideshow`

Use when a page needs a paced presentation sequence. Required string `heading`; required `slides` array with string `title` and `body`.

```json
{ "id": "tour", "type": "slideshow", "heading": "A short tour", "slides": [{ "title": "Browse first", "body": "Open as a readable page." }, { "title": "Present in place", "body": "Use the block controls." }] }
```

Bad: `{"id":"tour","type":"slideshow","heading":"Tour","slides":[{"title":"Missing body"}]}` is incomplete. The block has previous, next, and numbered controls with a position indicator. It does not auto-advance, alter the artifact URL, or turn the whole artifact into a mode.

### `divider`

Use sparingly as a conceptual break. Optional string `label`; no other widget fields are required.

```json
{ "id": "pause", "type": "divider", "label": "Apply the idea" }
```

Bad: `{"id":"pause","type":"divider","label":42}` has a numeric label. Browse shows a visual break within the page. Omitting the label leaves an unlabeled visual divider. The renderer uses a `div`, not a heading or semantic separator; do not use it as the only structure for essential instructions.

## Links and compatibility

The current hosted app reads `?artifact=<slug>` to open a discovered page. Every artifact opens in its authored theme; the theme dots are a viewer-only preview that resets to the authored theme on navigation or reload, and no theme is read from the URL. An unknown artifact currently returns home. Keep slugs and block IDs stable; query values should be URL-encoded. There is no declared standalone `/p/<slug>` route or new production domain in this repository.

This documents the existing routing shape for current links; it does not promise a future route migration policy. A local Studio import is not registered as a shareable artifact. There is no automatic repository-to-hosted-preview deployment configured here.

`legacy-fixture.ts` and the checked-in artifacts remain version 1. Changing required fields or block names later needs an explicit compatibility or migration decision. New renderer capabilities need their own implementation and review; adding a type name to content does not create them.
