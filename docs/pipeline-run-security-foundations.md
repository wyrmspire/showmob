# First end-to-end pipeline run: security foundations

Status: Phase 3 trial, 2026-09-24. Written by Instinct.

The first two pages of the security series from [series.json](../runs/local-security-lab/series.json), run through every per-page stage of [LEARNING-ARCHITECTURE.md](../LEARNING-ARCHITECTURE.md): page sheet -> representation -> generate sections -> critique -> Showmob JSON. Each stage left a file, and the commits on this branch land in stage order, so the history shows representation was fixed before any prose existed.

| Page | Mode | Stage files | Page |
| --- | --- | --- | --- |
| Decide what your lab may watch, and why | tutorial | [runs/.../local-security-lab-lab-scope/](../runs/local-security-lab/pages/local-security-lab-lab-scope/) | `app/src/content/local-security-lab-lab-scope.json` |
| How your home network is wired | explanation | [runs/.../local-security-lab-network-basics/](../runs/local-security-lab/pages/local-security-lab-network-basics/) | `app/src/content/local-security-lab-network-basics.json` |

Both pages are `preview`.

## What the sheets called for

- **Scope page (tutorial).** Real task: write your own lab scope before plugging anything in. Two activating analogies (lockout/tagout, a camera pointed at your own driveway), one complete worked scope, then the reader picks one failure to catch and fills in their own scope.
- **Network page (explanation).** Start from the reader's own machine (find your address and gateway), build the model (private ranges, one subnet, a router with an inside and an outside), trace one request out and back, check, then have the reader write down their own network. One visual need: the network as a picture with two sides of the router.

## Representation, chosen before writing

The full reasoning is in each `representation.json`. The choices that matter:

- **Single-select for "pick one failure"**, because the sheet says pick one. A checklist would allow several, which is the habit the page argues against.
- **An authored figure for the network map.** The content is spatial: devices inside a subnet, a router with two sides. The `diagram` block is a linear list and can't show that. This is the annotated-figure gap again. For now the figure is an SVG under `public/images/`.
- **The `diagram` block for the request trace**, because a packet going out and back is a strict sequence, which is exactly what that block draws.
- **No note-callout on either page.** Nothing earned one.

## What the critique caught

The critique judged each draft against its sheet, then looked at the rendered page at 390px and desktop. It made 11 changes. Each draft stays in `draft.json`, and `critique.json` records every finding with its outcome and layer.

**Scope page:**

- The worked example was split in two. Devices sat in one table, the failure to catch in another, with example answers from different households. The sheet asked for one complete worked scope. *Rewritten as one house.*
- The fill-in asked where the logs live, but the page never showed anyone answering that. *Added to the worked example.*
- The check repeated a row from the worked table (the roommate's laptop), so it tested recall, not the rule. *Replaced with a case the page never showed: the sensor accidentally logs a roommate's phone.*
- The four failures to pick from had no detail, so the reader was picking blind. *Each option now says what the lab will watch for it.*
- At phone width, the first fix's extra rows hid their answers in an off-screen column. *Moved to their own two-column table.*

**Network page:**

- The figure was wrong. Connector lines made it look like the devices were wired to each other and only the Pi reached the router, which contradicts the page's main idea. *Redrawn.*
- At phone width the wide figure was unreadable. *Redrawn as a tall figure with larger text.*
- A Windows reader sees `255.255.255.0` while the page and the fill-in say `/24`, and macOS had no subnet command. The sheet requires finding the subnet on all three systems. *Added the macOS command and the mask-to-/24 line.*
- The fill-in asked for the router's outside address "from the status page" without saying how to reach that page. *Now says to open the gateway address in a browser.*
- One source was about whether NAT protects you, a topic the sheet excludes from this page. *Cut.*
- The reason the lab later gets its own network (neighbors reach each other directly) only appeared inside the figure. *Now stated in the text.*

## What this run taught about the pipeline

- **The sheet did the critique's work.** Almost every finding is a gap between the draft and a specific sheet line: demonstrate, apply, a required idea, an exclusion. Critique against the sheet found real problems. Critique against taste would have missed most of them.
- **Two findings only showed up in the rendered page.** Critique needs a look at the real page at phone width, not just the JSON.
- **Representation was right about the form but couldn't catch content inside it.** Choosing an image was correct. Drawing that image wrong is a generation error inside a representation choice. The figure needed its own check.
- **The annotated-figure gap cost the most work.** The one visual on these two pages had to be hand-drawn and redrawn twice. That supports the annotated-figure primitive in the architecture doc.

## Open for review

- **Series order.** The existing `defensive-local-security-lab` page is order 1 in this series. The new pages are orders 2 and 3, so the reader header says "part 2 of 3" and "part 3 of 3" even though these are the foundations. Reordering or retiring the existing page is a curator decision, so it's left as is.
- **Same author throughout.** The same agent wrote the sheets, drafts, and critique. A separate critic, or the owner's grade, is the real test of whether the critique found the right things.
