# Idea Site Template — locked v0 brainstorming plan

**Status:** brainstorm / proposal only  
**Steward:** Grok  
**Location:** `Brainstorming/`  
**Implementation pointer:** use the latest scope lock and the locked v0 coding notes below. Earlier A/B names, TV options, viewer theme switching, and larger widget lists are superseded proposals.

## Direction from Chris — 2026-09-21

- This stays in **Brainstorming** for now.
- The project is an active-development side project: content is non-sensitive, breakage is acceptable, and rollback can rely on git history plus the last good Vercel deployment.
- The early invariant is the **content contract**:
  - one schema
  - JSON content files with a typed schema
  - entries assembled from copy-pasted JSON blocks that reference widgets by id
  - never copy widget code into entries
- Keep safeguards minimal in v0:
  - private repo
  - no secrets
  - PR/preview deploys before `main`
  - one fixture proving old entries still render
- Astra addendum sections 4–7 are **deferred reference**, not v0 gates.
- v0 storage remains **repo-native JSON files**. The renderer should only know the content contract so the same objects can later come from Supabase or linked Drive/Docs sources without frontend changes.
- Entry lifecycle:
  - `draft`
  - `preview` (shareable preview URL an agent can point to)
  - `published`
- Agents create drafts and previews; Chris promotes to published.

## Goal

Present ideas as dynamic websites instead of slide decks: links, motion, gradients, light interactivity, and one URL to share, deployable to Vercel via GitHub.

## Locked v0 scope

- **Two runtime modes only:** `Present` and `Read`
- **Author-chosen theme**
- **Small widget bin**
- **Static deploy to Vercel**
- **Shareable URL**
- **No account required to view**
- **No live/reactive/database-backed features in v0**
- Ignore prior TV/autoplay/chrome-off product notes unless Chris reopens them.

## Content contract (load-bearing invariant)

- Use **one semantic content tree** in both modes.
- Content files are **JSON with a typed schema**, not executable code modules.
- Each entry is a list of blocks:
  - `{ widgetId, props }`
- Widgets are referenced by id only; widget code is never copied into content.
- Stable section ids are required so refresh, back, deep links, and mode switches remain predictable.

### Suggested manifest fields

- `schemaVersion`
- `contentVersion`
- `title`
- `summary`
- `kind`
- `themeId`
- `templateVersion`
- `supportedModes`
- `defaultMode`
- `deviceTargets`
- `publicationState`
- `sections`

Courses can add `objective` and `exercise` when needed.

## Modes

### Present

- One section per screen
- Big type
- Arrow keys + swipe
- Small `3 / 8` counter
- On phone: vertical swipe-card layout of the same mode, not a separate mode

### Read

- Normal scrolling page
- Sticky mini table of contents
- Every section heading gets a copy-link control

### Mode continuity

- Switching modes keeps the same section, for example:
  - `/p/slug?mode=read#pricing`
- Default share URLs open in **Read**
- The mode toggle lives in the same corner in every theme

## Themes

Themes are token packs, not separate apps. Content uses semantic tokens only (`bg`, `accent`, `muted`, `card`).

Ship all five presets from day one:

1. **Shop floor** — dark charcoal + safety orange; grotesque sans; sparse
2. **Glass brief** — frosted panels, soft blur, cool neutrals
3. **Poster** — huge type, 2–3 colors, full-bleed sections
4. **Editorial** — long-read rhythm, quiet motion
5. **Neon lab** — high-contrast gradients, playful motion

Rules:

- Theme is chosen by the author, not the viewer.
- Theme auditioning is preview-only.
- Every theme must respect `prefers-reduced-motion`.
- Make **Shop floor** and **Editorial** excellent first.

## Widget bin

Keep the v0 widget set small:

- `hero`
- `text/note`
- `steps`
- `two-up-compare`
- `stat-strip`
- `media-frame`
- `link-card`
- `cta-band`
- `interactive-toggle` (already sketched)

Park for later until a real deck needs them:

- `timeline`
- `faq`
- `logo-row`
- `quiz`

Motion is for entrances only:

- `fade-up`
- `stagger`

Never hide information behind animation, and never animate on scroll in `Present`.

## Architecture seams

Keep three layers distinct:

1. **Content** — sections, copy, links, data
2. **Widgets** — reviewed, reusable building blocks
3. **Themes** — tokens only: color, type, radius, spacing, motion intensity

Rule: **themes change skin; widgets change bones; content changes words.**

## Proposed folder structure

```text
idea-site-template/
content/presentations/     # one file per idea (data only)
styles/presets/            # five theme packs
src/app/                   # hub + /p/[slug]
src/components/shell/      # PresentShell, ReadShell
src/components/blocks/     # hero, cards, interactive, cta
src/lib/presentation.ts
.env.example
SECURITY.md
README.md
```

Ground-level seams if implementation starts:

```text
content/presentations/     # decks only
src/widgets/               # one folder per widgetId
styles/presets/            # themes — tokens only
src/shells/                # Present and Read
src/app/p/[slug]/          # one dynamic route
```

## Adding a new presentation

1. Add `content/presentations/<slug>.json`
2. Register it in the presentation index/build manifest flow
3. Open `/p/<slug>`
4. Optionally override with `?mode=` or preview-only theme auditioning

No new route files. No per-deck CSS files.

## Security and deployment notes

- No public write surface in v0
- No secrets in the repo or client
- Use `.env.local` and Vercel environment variables only
- Never put secrets in `NEXT_PUBLIC_*`
- Prefer a private repo until there is an intentional open-source decision
- `main` goes to production; PRs get previews

## Phased build (when implementation begins)

1. Content schema + one sample + hub
2. Two mode shells on the same content
3. Five presets (tokens first; polish later)
4. Deploy docs + `SECURITY.md`

## Deferred reference (not v0 gates)

The Astra addendum sections on contributor workflow, account/plan checks, background execution, and failure anticipation remain reference material for later. Revisit them when a second contributor or a real runner actually appears.

## Open questions

1. Inspect the existing local scaffold before implementation; whether to reuse it or restart clean is explicitly out of scope for this locked v0 plan
2. Which first real lesson or explanation should serve as the acceptance case
3. Repository/Vercel ownership, contributor model, and budget once implementation begins
