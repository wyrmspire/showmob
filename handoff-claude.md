GRADING NIGHT - GENERATOR HANDOFF PACKET: Claude

Repo: https://github.com/wyrmspire/showmob
The full spec is docs/grading-night.md on the main branch - read it first for background and grading intent. This packet carries your current operating rules; where the packet and the doc differ on process (batch size, merge policy), follow this packet.

============================================================
1. WHY
============================================================

Grading night is a one-evening study. Chris will personally read about a hundred generated pages and grade each one like a reader: rating, density verdict, and a "what would've been better here" note. Those grades teach the gradient (Showmob's model of Chris's presentation judgment) what a good page looks like, and they steer what Showmob builds next. Your 25 pages are test material, not finished product content. Every page you produce will be read and graded by Chris himself, so build each one like a real reader is waiting for it.

============================================================
2. YOUR BATCH
============================================================

You are Claude. Set the "contributor" field in every artifact to "Claude".
Your batch is the 25 situations below. Each line: id - suggested slug - title - axis note.

GN-003 - gn-how-long-to-boil-an-egg-for-soft-medium-and-hard-a - How long to boil an egg for soft, medium, and hard | A/B pair 1 (A): render as a plain comparison table
GN-007 - gn-steps-to-jump-start-a-car-with-cables - Steps to jump-start a car with cables | Read in a parking lot on a phone: scan quality matters
GN-011 - gn-what-time-to-leave-for-a-2-pm-appointment-25-minutes-away - What time to leave for a 2 PM appointment 25 minutes away | Restraint test: answer is a time
GN-015 - gn-retrofitting-a-manual-bridgeport-mill-with-a-3-axis-dro-parts-sequence-budget - Retrofitting a manual Bridgeport mill with a 3-axis DRO: parts, sequence, budget
GN-019 - gn-moving-apartments-in-10-days-what-happens-each-day - Moving apartments in 10 days: what happens each day
GN-023 - gn-redesigning-a-kitting-cart-to-cut-changeover-time-on-a-cnc-cell - Redesigning a kitting cart to cut changeover time on a CNC cell | Before/after changeover minutes with example numbers
GN-027 - gn-pid-loop-tuning-for-a-temperature-controller-from-p-only-to-full-pid - PID loop tuning for a temperature controller, from P-only to full PID
GN-031 - gn-the-plc-scan-cycle-and-why-timers-and-one-shots-misbehave - The PLC scan cycle and why timers and one-shots misbehave
GN-035 - gn-lockout-tagout-the-full-procedure-and-why-each-step-exists - Lockout/tagout: the full procedure and why each step exists | Safety content: no ambiguity allowed
GN-039 - gn-near-miss-incident-report-form-for-a-small-shop - Near-miss incident report form for a small shop | Template, fictional example entry
GN-043 - gn-ohm-s-law-practice-problems-with-worked-answers-revealed-on-request - Ohm's law practice problems with worked answers revealed on request
GN-047 - gn-saturday-errand-route-hardware-store-pharmacy-post-office-gym - Saturday errand route: hardware store, pharmacy, post office, gym
GN-051 - gn-travel-day-flight-rental-car-hotel-check-in-dinner-reservation - Travel day: flight, rental car, hotel check-in, dinner reservation | Fictional itinerary
GN-055 - gn-how-cnc-evolved-from-punched-tape-nc-machines - How CNC evolved from punched-tape NC machines
GN-059 - gn-the-1911-triangle-shirtwaist-fire-and-how-it-shaped-workplace-safety-law - The 1911 Triangle Shirtwaist fire and how it shaped workplace safety law | Register test: no cute graphics
GN-063 - gn-half-finished-notes-from-a-vendor-call-about-a-new-servo-drive-gaps-marked - Half-finished notes from a vendor call about a new servo drive, gaps marked | Gaps should look like gaps
GN-067 - gn-conflicting-advice-on-whether-it-s-safe-to-discharge-a-capacitor-with-a-screwdriver - Conflicting advice on whether it's safe to discharge a capacitor with a screwdriver
GN-071 - gn-a-fictional-space-colony-s-power-grid-politics-and-supply-chain - A fictional space colony's power grid, politics, and supply chain
GN-075 - gn-the-global-supply-chain-of-one-smartphone - The global supply chain of one smartphone
GN-079 - gn-every-screwdriver-type-ranked-by-how-easy-it-is-to-strip - Every screwdriver type ranked by how easy it is to strip
GN-083 - gn-the-weather-report-but-for-a-factory-floor-s-mood - The weather report, but for a factory floor's mood
GN-087 - gn-pitch-showmob-to-a-skeptical-developer-in-90-seconds - Pitch Showmob to a skeptical developer in 90 seconds
GN-091 - gn-live-oee-dashboard-for-a-3-machine-cnc-cell-example-data - Live OEE dashboard for a 3-machine CNC cell (example data)
GN-095 - gn-showmob-artifact-status-board-draft-in-pr-published - Showmob artifact status board: draft, in PR, published
GN-099 - gn-an-infographic-of-my-favorite-color - An infographic of my favorite color | Failure bait: meaningless graphics

============================================================
3. YOUR AXES
============================================================

Each situation has a fixed matrix position: density / interaction demand / information shape / emotional register / artifact lifetime. These are the targets the page is graded against - a "microscopic" row wants a very small page, an "extreme" row wants book-scale structure. Match the register word too (somber stays somber, playful stays playful).

GN-003: microscopic / observe / comparison / calm / canonical
GN-007: light / observe / procedure / urgent / canonical
GN-011: microscopic / observe / time / calm / ephemeral
GN-015: medium / explore / procedure / focused / project
GN-019: medium / contribute / time / anxious / project
GN-023: medium / explore / decision / serious / project
GN-027: dense / configure / simulation / instructive / canonical
GN-031: dense / explore / causality / instructive / canonical
GN-035: medium / observe / procedure / serious / canonical
GN-039: medium / contribute / evidence / serious / canonical
GN-043: light / contribute / quiz / instructive / session
GN-047: light / explore / spatial / casual / ephemeral
GN-051: medium / observe / time / anxious / ephemeral
GN-055: medium / explore / time / reflective / canonical
GN-059: medium / observe / narrative / somber / canonical
GN-063: light / observe / evidence / uncertain / session
GN-067: medium / explore / evidence / cautious / canonical
GN-071: extreme / explore / simulation / imaginative / canonical
GN-075: extreme / explore / hierarchy / curious / canonical
GN-079: light / explore / comparison / wry / ephemeral
GN-083: light / observe / time / whimsical / ephemeral
GN-087: light / observe / comparison / persuasive / project
GN-091: dense / operate / time / focused / living
GN-095: light / operate / inventory / neutral / living
GN-099: microscopic / observe / comparison / playful / ephemeral

A/B PAIR ROWS IN YOUR BATCH

Some of your situations are also being rendered by another generator on a different render axis. Same subject, different render - that is how the grades separate taste from topic. You will not be told who has the twin; that is intentional. For these rows, lean hard into the render instruction instead of hedging toward the middle:

- GN-003 (How long to boil an egg for soft, medium, and hard): pair 1, your side (A) - render as a plain comparison table

============================================================
4. THE CONTRACT
============================================================

- One JSON artifact per situation, schemaVersion 1, saved under app/src/content/ in wyrmspire/showmob.
- File name and slug: the slug is the kebab-case title prefixed gn- (example: gn-vfd-decel-trip). Use the slugs listed in section 2. A/B pair rows (the axis note marks them "A/B pair N (X)"): append the pair side to the slug, -a or -b matching the side letter (example: gn-what-to-pack-for-a-one-night-work-trip-a). The listed slugs for pair rows already include the suffix.
- status: "preview" on every artifact. Always. Never "published".
- Every artifact must pass repo validation: npm test must be green.
- Density reference: for rows marked "dense" or "extreme", the bar is app/src/content/plan-data-sufficiency.json (https://showmob.vercel.app/a/plan-data-sufficiency). Density follows signal - match that bar where the subject earns it, never pad to reach it. Microscopic and light rows should be genuinely small.
- Blocks vocabulary: use only the block types defined in app/src/schema.ts, demonstrated on the block gallery page (https://showmob.vercel.app/a/showmob-block-gallery). The current block types are: hero, text, stat-strip, steps, comparison, quote, note-callout, cta-band, checklist, timeline, code, embed, image, resource-list, exercise, compact-table, diagram, slideshow, divider.

============================================================
5. RULES
============================================================

- One PR per batch of about 5 artifacts. Not 25 tiny PRs, not one giant one.
- CI green before merge.
- Merge your own PRs once green; no review wait on grading-night batches.
- Do not touch existing artifacts. Do not add new block types. Do not change the schema. Do not change docs.

============================================================
6. DON'TS
============================================================

- No publishing. Everything stays "preview".
- No personal data. This is a public repo. Worksheet, form, itinerary, budget, and log rows use generic or fictional example data only.
- Do not invent Chris-specific biographical content. Your lanes touch machining, PLC, electronics, RF, and safety, but use generic examples and fictional people, shops, and incidents.
- Do not edit another generator's work, including the twins of your A/B pair rows.

Questions or conflicts: bring them back to the coordinator before building around them.
