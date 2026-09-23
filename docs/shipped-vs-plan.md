# Shipped product vs earlier plan (reconcile without loss)

Status: decision record. Steward: Grok. Date: 2026-09-22.

This document locks what the **running app** does today, and preserves earlier Present/Read language as **superseded intent**, not deleted history. Do not erase draft/preview artifacts, series content, or the slideshow block while closing gaps.

## What shipped (authoritative for code)

- **Browse** is the only artifact-wide view (scrolling page). Product language may still say “Read.”
- **Paced presentation** lives in the **`slideshow` block**, not a global Present mode / shell.
- Themes: `paper`, `signal`, `workshop`, `night`, `field`.
- Lifecycle values remain: `draft` | `preview` | `published` | `archived`.
- Content stays as `schemaVersion: 1` JSON under `app/src/content/`. Do not delete files to “fix” publication.

## What the earlier Drive / idea-site lock said (preserved)

Earlier scope lock (Idea Site Template plan) named **Present + Read**, mode continuity via URL, author-owned theme with preview-only switcher, and shared links defaulting to Read with section anchors / copy-link.

Those ideas are **not discarded**. They are marked **superseded for v3 shipped UX** where they conflict, and parked as optional follow-ons:

| Earlier idea | Status | Notes |
|--------------|--------|--------|
| Global Present shell | Superseded by slideshow block | Dead CSS (`.shell-present`, `.present-nav`) must be removed or revived on purpose — do not rebuild Present by accident. |
| Read as mode name | Alias of Browse | Keep “Read” in product copy if useful; code says browse. |
| Author-owned theme | Still intended | Code currently lets every viewer audition themes — fix by gating, not by deleting themes. |
| Section deep links / copy-link / TOC | Still intended | Not built yet; do not drop the requirement. |
| Draft / preview / published | Still intended | Content files stay; **production listing** should filter to published (and maybe preview on preview deploys). |

## Counts (as of 2026-09-22)

- ~33 content JSON files (not ~45).
- 19 block types in `schema.ts`.
- Status mix includes published, preview, and draft — all kept in the repo.

## Prioritized issue list (hand to an agent)

Do these without deleting content or collapsing lifecycle states.

### P0

**P0 status: shipped** (published-only catalog, gated theme swatches, dead Present CSS removed). Draft/preview JSON stays in the repo.
 — stops wrong public behavior

1. **Production catalog = published only.** Home / discovery / series shelves filter `status === "published"` in production builds. Keep draft and preview JSON in the repo. Preview/dev builds may still show preview/draft with badges. Deep links to non-published slugs should 404 or show a clear “not published” state in production — do not strip files.
2. **Author-owned theme on public pages.** Theme swatches only when author tools are enabled (trusted build/env flag). Public share URLs use the authored `theme`. Do not remove the five theme token sets.
3. **Reconcile docs.** Point AGENTS / architecture / roadmap at Browse + slideshow; leave Present/Read named here as superseded. Remove or quarantine dead Present CSS so agents do not rebuild it.

### P1 — “ship a link” quality

4. **Section deep links.** Stable `#block-id` (or `#section-id`) in the URL; restore scroll (and focus) on load; copy-link control on headings / block chrome. Page selector is `/a/{slug}` (legacy `?artifact=` still resolves and replaceStates to the path form).
5. **Per-artifact link previews.** Title + summary per slug via build-time `dist/a/{slug}/index.html` OG/Twitter meta — shipped. Theme-colored OG image still open as follow-up. Do not leave every share preview as the global `index.html` blurb.
6. **Focus on navigation.** When changing artifact or restoring a hash, move focus into `#artifact-content` (already `tabIndex={-1}`), not only `scrollIntoView`.

### P2 — render / a11y polish

7. **Stat-strip layout** uses `auto-fit` (or count-aware columns), not hardcoded 3. Comparison already has a later `auto-fit` rule — keep that; clean conflicting older 2-column rule.
8. **Slideshow keyboard** (arrows when focused) and touch swipe; overflow-safe controls on phone (collapse dots past N slides).
9. **Entrance motion** already limited to Paper/Workshop hero/text — keep reduced-motion; do not expand until P0/P1 land.

### Explicit non-goals for this pass

- Do not delete draft/preview/archived JSON to clean the hub.
- Do not revive a global Present mode unless Chris reopens it; if reopened, treat as a new shell with a decision note.
- Do not add a database requirement to fix publication filtering.

## Acceptance

- Public Vercel production hub lists only published artifacts; preview/draft files still exist in git.
- Public artifact pages do not expose a theme switcher; authored theme still applies.
- Docs no longer instruct agents to implement Present/Read as two global modes.
- At least one shared link can open a specific block via hash after P1.
