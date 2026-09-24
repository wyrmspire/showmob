GRADING NIGHT - GENERATOR HANDOFF PACKET: GPT

Repo: https://github.com/wyrmspire/showmob
The full spec is docs/grading-night.md on the main branch - read it first for background and grading intent. This packet carries your current operating rules; where the packet and the doc differ on process (batch size, merge policy), follow this packet.

============================================================
1. WHY
============================================================

Grading night is a one-evening study. Chris will personally read about a hundred generated pages and grade each one like a reader: rating, density verdict, and a "what would've been better here" note. Those grades teach the gradient (Showmob's model of Chris's presentation judgment) what a good page looks like, and they steer what Showmob builds next. Your 25 pages are test material, not finished product content. Every page you produce will be read and graded by Chris himself, so build each one like a real reader is waiting for it.

============================================================
2. YOUR BATCH
============================================================

You are GPT. Set the "contributor" field in every artifact to "GPT".
Your batch is the 25 situations below. Each line: id - suggested slug - title - axis note.

GN-002 - gn-should-i-bring-an-umbrella-today-with-a-40-chance-of-rain - Should I bring an umbrella today with a 40% chance of rain | Restraint test: one sentence answer should win
GN-006 - gn-which-of-two-phone-plans-is-cheaper-over-a-year - Which of two phone plans is cheaper over a year | Plan A $45/mo flat vs Plan B $30/mo + $8 per GB overage, example usage
GN-010 - gn-how-to-reset-a-tripped-gfci-outlet - How to reset a tripped GFCI outlet
GN-014 - gn-converting-a-one-car-garage-into-a-small-machine-shop-power-layout-budget - Converting a one-car garage into a small machine shop: power, layout, budget | A/B pair 2 (B): render floorplan-first (where machines and circuits go)
GN-018 - gn-six-week-plan-to-learn-ladder-logic-well-enough-for-a-controls-tech-interview - Six-week plan to learn ladder logic well enough for a controls tech interview
GN-022 - gn-a-30-person-backyard-birthday-party-on-a-400-budget - A 30-person backyard birthday party on a $400 budget
GN-026 - gn-how-a-mosfet-switches-gate-charge-rds-on-and-thermal-limits - How a MOSFET switches: gate charge, Rds(on), and thermal limits | A/B pair 3 (B): render as an explorer with gate-voltage and load sliders
GN-030 - gn-speeds-and-feeds-for-6061-aluminum-vs-4140-steel-on-a-manual-lathe - Speeds and feeds for 6061 aluminum vs 4140 steel on a manual lathe
GN-034 - gn-gd-t-for-machinists-the-14-symbols-and-when-each-one-matters - GD&T for machinists: the 14 symbols and when each one matters
GN-038 - gn-resistor-color-code-practice-worksheet-with-10-blanks - Resistor color code practice worksheet with 10 blanks
GN-042 - gn-tool-crib-checkout-log - Tool crib checkout log
GN-046 - gn-tomorrow-three-meetings-a-dentist-appointment-and-a-4-hour-focus-block - Tomorrow: three meetings, a dentist appointment, and a 4-hour focus block | A/B pair 4 (B): render as draggable time blocks
GN-050 - gn-maintenance-shift-handoff-note-what-s-running-what-s-down-what-s-pending - Maintenance shift handoff note: what's running, what's down, what's pending
GN-054 - gn-the-history-of-the-transistor-from-1947-to-the-first-microprocessor - The history of the transistor, from 1947 to the first microprocessor | A/B pair 5 (B): render as a map of people, labs, and inventions
GN-058 - gn-a-year-of-a-household-s-electric-bills-and-what-changed - A year of a household's electric bills and what changed | Example data
GN-062 - gn-take-a-job-offer-before-the-benefits-details-arrive - Take a job offer before the benefits details arrive?
GN-066 - gn-early-idea-a-shop-floor-app-for-logging-tool-wear-not-validated-yet - Early idea: a shop-floor app for logging tool wear, not validated yet | Semantic mass test: weak idea earns little UI
GN-070 - gn-the-full-radio-spectrum-from-elf-to-gamma-who-uses-each-band-and-why - The full radio spectrum from ELF to gamma: who uses each band and why
GN-074 - gn-a-semiconductor-fab-sand-to-packaged-chip-400-steps-grouped - A semiconductor fab: sand to packaged chip, 400+ steps grouped
GN-078 - gn-a-day-in-the-life-of-a-torque-wrench-told-by-the-torque-wrench - A day in the life of a torque wrench, told by the torque wrench
GN-082 - gn-a-tarot-deck-of-machining-sins-chatter-crashed-tool-forgotten-work-offset - A tarot deck of machining sins: chatter, crashed tool, forgotten work offset
GN-086 - gn-one-page-pitch-why-a-community-makerspace-needs-a-cnc-router - One-page pitch: why a community makerspace needs a CNC router
GN-090 - gn-grant-proposal-summary-for-a-high-school-ham-radio-club - Grant proposal summary for a high school ham radio club
GN-094 - gn-ham-radio-contest-log-with-running-score-and-band-activity - Ham radio contest log with running score and band activity
GN-098 - gn-predict-next-year-s-copper-price-to-the-dollar - Predict next year's copper price to the dollar | Failure bait: fake certainty

============================================================
3. YOUR AXES
============================================================

Each situation has a fixed matrix position: density / interaction demand / information shape / emotional register / artifact lifetime. These are the targets the page is graded against - a "microscopic" row wants a very small page, an "extreme" row wants book-scale structure. Match the register word too (somber stays somber, playful stays playful).

GN-002: microscopic / observe / decision / calm / ephemeral
GN-006: light / explore / comparison / neutral / ephemeral
GN-010: microscopic / observe / procedure / calm / canonical
GN-014: dense / explore / spatial / focused / project
GN-018: medium / configure / planning / encouraging / project
GN-022: medium / configure / planning / celebratory / project
GN-026: dense / explore / simulation / instructive / canonical
GN-030: dense / configure / comparison / instructive / canonical
GN-034: dense / explore / inventory / instructive / canonical
GN-038: light / contribute / quiz / playful / session
GN-042: light / contribute / inventory / neutral / living
GN-046: light / configure / time / calm / ephemeral
GN-050: medium / contribute / inventory / focused / session
GN-054: dense / explore / hierarchy / reflective / canonical
GN-058: light / explore / time / neutral / project
GN-062: light / explore / decision / uncertain / ephemeral
GN-066: light / observe / planning / tentative / session
GN-070: extreme / explore / hierarchy / curious / canonical
GN-074: extreme / explore / procedure / awe / canonical
GN-078: light / observe / narrative / whimsical / ephemeral
GN-082: medium / explore / inventory / wry / canonical
GN-086: medium / observe / evidence / persuasive / project
GN-090: medium / observe / narrative / earnest / project
GN-094: medium / operate / time / energetic / living
GN-098: medium / explore / simulation / uncertain / ephemeral

A/B PAIR ROWS IN YOUR BATCH

Some of your situations are also being rendered by another generator on a different render axis. Same subject, different render - that is how the grades separate taste from topic. You will not be told who has the twin; that is intentional. For these rows, lean hard into the render instruction instead of hedging toward the middle:

- GN-014 (Converting a one-car garage into a small machine shop: power, layout, budget): pair 2, your side (B) - render floorplan-first (where machines and circuits go)
- GN-026 (How a MOSFET switches: gate charge, Rds(on), and thermal limits): pair 3, your side (B) - render as an explorer with gate-voltage and load sliders
- GN-046 (Tomorrow: three meetings, a dentist appointment, and a 4-hour focus block): pair 4, your side (B) - render as draggable time blocks
- GN-054 (The history of the transistor, from 1947 to the first microprocessor): pair 5, your side (B) - render as a map of people, labs, and inventions

============================================================
4. THE CONTRACT
============================================================

- One JSON artifact per situation, schemaVersion 1, saved under app/src/content/ in wyrmspire/showmob.
- File name and slug: the slug is the kebab-case title prefixed gn- (example: gn-vfd-decel-trip). Use the slugs listed in section 2.
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
