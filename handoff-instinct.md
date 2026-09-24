GRADING NIGHT - GENERATOR HANDOFF PACKET: Instinct

STATUS: Instinct's 25 are already built and merged (PRs #52-#56, https://github.com/wyrmspire/showmob/pull/52 through /pull/56). All 25 subjects are marked "built" in showmob_gn_subjects with status "preview" artifacts under app/src/content/. This packet is the record of the batch and its contract, matching the other three generators' packets; there is nothing left to build from it.

Repo: https://github.com/wyrmspire/showmob
The full spec is docs/grading-night.md on the main branch - read it first for background and grading intent. This packet carries your current operating rules; where the packet and the doc differ on process (batch size, merge policy), follow this packet.

============================================================
1. WHY
============================================================

Grading night is a one-evening study. Chris will personally read about a hundred generated pages and grade each one like a reader: rating, density verdict, and a "what would've been better here" note. Those grades teach the gradient (Showmob's model of Chris's presentation judgment) what a good page looks like, and they steer what Showmob builds next. Your 25 pages are test material, not finished product content. Every page you produce will be read and graded by Chris himself, so build each one like a real reader is waiting for it.

============================================================
2. YOUR BATCH
============================================================

You are Instinct. Set the "contributor" field in every artifact to "Instinct".
Your batch is the 25 situations below. Each line: id - suggested slug - title - axis note.

GN-004 - gn-how-long-to-boil-an-egg-for-soft-medium-and-hard - How long to boil an egg for soft, medium, and hard | A/B pair 1 (B): render as a timer you start when the water boils
GN-008 - gn-splitting-a-143-dinner-bill-four-ways-with-a-20-tip - Splitting a $143 dinner bill four ways with a 20% tip | Restraint test: a number, maybe one input
GN-012 - gn-changing-a-furnace-filter-finding-the-size-and-which-way-the-arrow-points - Changing a furnace filter: finding the size and which way the arrow points
GN-016 - gn-migrating-a-plant-line-from-relay-logic-to-a-plc-over-three-weekend-shutdowns - Migrating a plant line from relay logic to a PLC over three weekend shutdowns | Hard deadlines per shutdown; rollback plan per phase
GN-020 - gn-showmob-roadmap-the-next-three-phases-from-conversation-to-preserved-learning - Showmob roadmap: the next three phases from conversation to preserved learning | Density bar: plan-data-sufficiency
GN-024 - gn-refurbishing-a-used-benchtop-oscilloscope-test-repair-calibrate - Refurbishing a used benchtop oscilloscope: test, repair, calibrate
GN-028 - gn-smith-chart-basics-for-matching-an-antenna-to-50-ohms - Smith chart basics for matching an antenna to 50 ohms | Density above plan-data-sufficiency
GN-032 - gn-a-superheterodyne-receiver-signal-path-stage-by-stage - A superheterodyne receiver signal path, stage by stage
GN-036 - gn-modbus-rtu-framing-and-crc-byte-by-byte - Modbus RTU framing and CRC, byte by byte
GN-040 - gn-monthly-household-budget-worksheet-with-example-numbers - Monthly household budget worksheet with example numbers | Generic example household only
GN-044 - gn-portfolio-project-write-up-template-for-an-automation-build-with-a-sample-entry - Portfolio project write-up template for an automation build, with a sample entry | Sample entry is fictional
GN-048 - gn-a-morning-routine-with-a-6-15-am-hard-stop - A morning routine with a 6:15 AM hard stop
GN-052 - gn-inbox-triage-14-example-emails-sorted-into-do-delegate-defer-drop - Inbox triage: 14 example emails sorted into do, delegate, defer, drop | Fictional inbox
GN-056 - gn-48-hours-of-one-machine-breakdown-from-first-alarm-to-root-cause - 48 hours of one machine breakdown, from first alarm to root cause | Fictional incident; time and cause both matter
GN-060 - gn-a-small-repos-git-history-told-as-a-story-what-each-commit-changed-and-why - A small repo's git history told as a story: what each commit changed and why
GN-064 - gn-quoting-a-machining-job-when-the-material-price-is-unconfirmed - Quoting a machining job when the material price is unconfirmed
GN-068 - gn-holiday-sales-forecast-for-a-small-online-shop-with-only-two-years-of-data - Holiday sales forecast for a small online shop with only two years of data | Must show ranges, not a single number
GN-072 - gn-the-us-electrical-grid-from-power-plant-to-wall-outlet - The US electrical grid from power plant to wall outlet | A/B pair 6 (A): render as a causal chain, generation to outlet
GN-076 - gn-a-fantasy-novel-universe-3-kingdoms-40-characters-300-years-of-events - A fantasy novel universe: 3 kingdoms, 40 characters, 300 years of events
GN-080 - gn-choose-your-own-adventure-youre-the-plc-and-someone-just-hit-the-e-stop - Choose your own adventure: you're the PLC and someone just hit the e-stop
GN-084 - gn-learning-morse-code-as-a-mixtape-letters-by-rhythm - Learning Morse code as a mixtape: letters by rhythm
GN-088 - gn-hire-an-apprentice-machinist-or-buy-a-second-cnc-the-case - Hire an apprentice machinist or buy a second CNC: the case
GN-092 - gn-preventive-maintenance-schedule-that-updates-as-tasks-close - Preventive maintenance schedule that updates as tasks close
GN-096 - gn-andon-board-for-a-small-assembly-line-stations-alerts-response-times - Andon board for a small assembly line: stations, alerts, response times
GN-100 - gn-a-dashboard-for-a-single-houseplant - A dashboard for a single houseplant | Failure bait: dashboard for nothing

Note on the two pair rows: GN-004 and GN-072 were built and merged before the A/B slug-suffix rule landed (PR #57), so their saved slugs carry no -b / -a suffix. Their twins use the suffixed slugs (GN-003 ...-a, GN-073 ...-b), so nothing collides.
============================================================
3. YOUR AXES
============================================================

Each situation has a fixed matrix position: density / interaction demand / information shape / emotional register / artifact lifetime. These are the targets the page is graded against - a "microscopic" row wants a very small page, an "extreme" row wants book-scale structure. Match the register word too (somber stays somber, playful stays playful).
GN-004: microscopic / operate / time / playful / ephemeral
GN-008: microscopic / configure / calculation / casual / ephemeral
GN-012: light / observe / procedure / calm / canonical
GN-016: dense / explore / planning / serious / project
GN-020: dense / explore / planning / reflective / living
GN-024: medium / explore / diagnosis / focused / project
GN-028: extreme / explore / simulation / instructive / canonical
GN-032: dense / explore / causality / instructive / canonical
GN-036: extreme / explore / hierarchy / instructive / canonical
GN-040: medium / contribute / inventory / calm / living
GN-044: medium / contribute / narrative / focused / canonical
GN-048: microscopic / observe / time / calm / living
GN-052: medium / operate / decision / focused / ephemeral
GN-056: medium / explore / causality / serious / canonical
GN-060: medium / explore / time / reflective / project
GN-064: medium / configure / decision / uncertain / session
GN-068: medium / explore / simulation / uncertain / project
GN-072: extreme / observe / causality / instructive / canonical
GN-076: extreme / explore / narrative / imaginative / canonical
GN-080: medium / operate / decision / playful / session
GN-084: medium / operate / procedure / playful / session
GN-088: medium / explore / comparison / persuasive / project
GN-092: medium / operate / planning / neutral / living
GN-096: medium / operate / time / urgent / living
GN-100: light / operate / inventory / whimsical / living

A/B PAIR ROWS IN YOUR BATCH

Some of your situations are also being rendered by another generator on a different render axis. Same subject, different render - that is how the grades separate taste from topic. You will not be told who has the twin; that is intentional. For these rows, lean hard into the render instruction instead of hedging toward the middle:

- GN-004 (How long to boil an egg for soft, medium, and hard): pair 1, your side (B) - render as a timer you start when the water boils
- GN-072 (The US electrical grid from power plant to wall outlet): pair 6, your side (A) - render as a causal chain, generation to outlet

============================================================
4. THE CONTRACT
============================================================

- One JSON artifact per situation, schemaVersion 1, saved under app/src/content/ in wyrmspire/showmob.
- File name and slug: the slug is the kebab-case title prefixed gn- (example: gn-vfd-decel-trip). Use the slugs listed in section 2. A/B pair rows (the axis note marks them "A/B pair N (X)"): append the pair side to the slug, -a or -b matching the side letter (example: gn-what-to-pack-for-a-one-night-work-trip-a). The listed slugs for pair rows already include the suffix, except GN-004 and GN-072 (built before this rule; see the note in section 2).
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
