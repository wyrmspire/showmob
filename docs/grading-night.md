# Grading night

Status: **direction doc** (2026-09-23). Nothing here is built yet. Steward: Chris (intent) / Instinct (doc).

## Why

The gradient ([`GRADIENT.md`](../GRADIENT.md)) needs to know what a good Chris page looks like. Guessing at that is slow. So we brute-force it: put about a hundred real pages in front of Chris, have him grade them like a reader, and let the grades teach the gradient.

A hundred real judgments beat a hundred guesses. The sink grows as we go: when a new kind of content shows up, the gradient gets a new cluster and puts new feelers out.

## Step 0: the genre conversation

Before anything generates, Chris and Instinct talk for 20-30 minutes about what the ~100 candidates should be.

Genres floated so far:

- plans
- pitch decks
- day organizers ("understanding your day better")
- course material
- shop notes
- organizational stuff
- guided worksheets / forms: structured columns and prompts as an artifact. This one tests whether the block language can carry interactive worksheet-style content, not just reading pages. Template content only: generic example rows, never personal data.

"It could be anything really." The list comes out of the conversation, not out of this doc.

**Nothing generates before this conversation happens.** The output of the conversation is the subjects list, and that list is what the generators pull from.

## The rapid test center

One grading page. It lists the ~100 candidates as links. Click one, read it, grade it, come back, click the next.

Candidates vary on purpose. Axes to test across them:

- dense vs denser
- go deeper on the subject
- more technical vs more ethereal
- more feedback-ish
- better graphics
- better widgets

Render the same subject more than one way. That's how the signal separates taste from topic: if Chris likes the denser version of a subject he didn't care about, that says something about density, not the subject.

Generation doesn't have to come from one place. Pages get farmed out to different agents with a handoff packet (below); they all write the same JSON contract.

## Generator handoff packet

The hundred pages don't all get built by one agent. Four generators split them: **Grok, GPT, Claude, and Instinct**, roughly 25 subjects each. Every agent pulls its batch from the `subjects` table, so no two agents take the same subject on the same axis, and we always know which agent produced which artifact (the table records the assignment; the artifact's `contributor` field names the agent). That provenance matters when grading: it lets us see whether a pattern in the grades is about the page or about the generator.

Each generator gets the same six-part handoff. Fill in the brackets and paste it:

```text
1. WHY
This batch is for grading night. Chris is going to read about a hundred
pages and grade each one (1-10, more/less likely, density, a "what would've
been better here" note), and we record how he actually reads them. The
grades teach Showmob's gradient what a good Chris page looks like. Your
pages are test material, not finished content.

2. BATCH
You are: [Grok | GPT | Claude | Instinct]. Set "contributor" to that name.
Subjects: [your ~25 subject IDs/titles, assigned to you in the subjects table]
Genre: [plans | pitch decks | day organizers | course material | shop notes |
       guided worksheets | ...]
(Worksheets: generic example rows only, never personal data.)

3. VARIATION AXIS
Your axis: [dense | denser | deeper | more technical | more ethereal |
feedback-ish | better graphics | better widgets]
Other agents are rendering the same subjects on other axes. Same subject,
different render is how the grades separate taste from topic, so lean
into your axis instead of hedging toward the middle.

4. ARTIFACT CONTRACT
- schemaVersion: 1 JSON, one file per page, under app/src/content/.
- Block types and fields per app/src/schema.ts and docs/widgets.md.
- Must pass: node --experimental-strip-types --test tests/validation.test.mjs
- Density reference: app/src/content/plan-data-sufficiency.json
  (https://showmob.vercel.app/a/plan-data-sufficiency). Density follows
  signal; match it where the subject earns it, not by padding.

5. RULES
- status: "preview" on every page. Always. Never "published".
- One PR per batch.
- CI green before you ask for review.

6. DON'TS
- Don't publish anything.
- Don't edit existing artifacts.
- Don't add new block types or widget code without sign-off.
```

## Grading, per page

Every page gets a grade panel with:

- **Rating:** 1-10.
- **More likely / less likely:** would he want more pages like this one?
- **Density:** too thin / right / too dense.
- **Widgets:** did he use them, did they work, did they add anything.
- **"What would've been better here":** free text, on every grade.

The free-text field matters as much as the numbers. The numbers say how much; the suggestion says why.

Chris plans to spend a couple of hours reading like a reader, not reviewing like an editor. The panel should stay out of the way of that.

## Behavior capture

Stated grades are half the picture. The page also records what Chris actually did, the way a user study would:

- **Time on page.**
- **Scroll depth:** how far down he got.
- **Finished vs abandoned:** did he reach the end or bail.
- **Widget interactions:** which widgets he touched, and how much.
- **Blind A/B pairs:** the same subject rendered two ways, shown side by side with no labels. He picks one.
- **"Would you send this to someone?"** yes/no, per page.

The payoff is the gap between behavior and the stated grade. That gap is the real training signal:

- Rated high but bailed early: style without substance.
- Rated low but finished: substance worth studying.

When the two agree, fine. When they disagree, that's where the gradient learns the most.

## Database for the plumbing, repo for the content

Content does **not** move into Supabase. It stays as repo JSON, because it feeds three things:

1. The pages render it.
2. Other agents read it.
3. The code dumps (`printcode.sh`, `gitrdif.sh`) carry it. Table content wouldn't be in a dump.

The tables are for machinery only:

- **`subjects`**: the ~100 candidates from the genre conversation, each with its genre, variation axis, and assigned generator. Generators pull their batch from here.
- **`grades`**: one row per grade.

Rough shape of `grades`:

| column | what |
| --- | --- |
| `page_slug` | the artifact graded |
| `genre` / `cluster` | where it sits in the sink |
| `scores` | jsonb: rating (1-10), more/less likely, density, widget notes, would-send yes/no |
| `behavior` | jsonb: time on page, scroll depth, finished/abandoned, widget interactions |
| `ab_pair` | for blind pairs: the other slug and which one he picked |
| `suggestion` | the "what would've been better here" text |
| `graded_at` | timestamp |

Wiring:

- Both tables live in the existing `showmob-dev` project (see [`supabase.md`](supabase.md)). The `feat/supabase-foundation` branch already started Supabase CLI work; check it before adding migrations.
- One small Vercel server function holds the service key server-side. The grade panel posts to it.
- The browser never gets the key. No `VITE_*` variable, nothing in the repo.
- No full migration. The existing revision tables stay as they are.

### Why this shape

The subjects table is also the first rehearsal for running content from a database. A row in `subjects` triggers generation, and the result lands back in the repo as JSON. That exercises the database-triggered-content pattern at small scale, with a hundred pages, before any real persistence migration.

Email-per-grade was floated and dropped. The table **is** the dataset; an inbox full of grades is something we'd have to turn back into a table later.

## The loop

Grades → clusters → the gradient learns what "a Chris page" is.

Reference for a page that earned its density: [`plan-data-sufficiency`](https://showmob.vercel.app/a/plan-data-sufficiency) (22 blocks, ~2,200 words). Density follows signal. It is not a blanket rule that every page gets that long; the grades tell us where it pays.

## Not yet

- Building the full gradient.
- Retrofitting existing content.
- Publishing anything from the test center.

This doc is direction only. The first real step is the genre conversation.

_Written by Instinct from Chris's direction, 2026-09-23._
