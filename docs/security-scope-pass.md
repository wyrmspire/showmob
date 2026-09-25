# Security scope pass: pipeline vs the one-page artifact

Status: Phase 2 trial, 2026-09-24. Written by Instinct.

Phase 2 of [LEARNING-ARCHITECTURE.md](../LEARNING-ARCHITECTURE.md): run research, topic map, and scope on a deep subject without a page count, and see whether the pipeline finds the depth by itself. The subject is the one behind the existing `defensive-local-security-lab` page.

## The run

Each stage wrote a readable file under `runs/local-security-lab/`:

| Stage | File | Input | Output |
| --- | --- | --- | --- |
| Research | [research.json](../runs/local-security-lab/research.json) | The subject line and an entry reader | 5 perspectives, 28 concepts, 7 misconceptions, 6 edge cases, 4 real-world failures, 26 public sources |
| Topic map | [topic-map.json](../runs/local-security-lab/topic-map.json) | research.json only | 28 concepts with `dependsOn`, tiers, 10 natural boundaries |
| Scope | [series.json](../runs/local-security-lab/series.json) | research.json and topic-map.json | The series, with page boundaries, modes, and order |

No page count, outline, or existing page content went into any stage. The scope stage used five written rules (in `series.json`): start from the map's natural boundaries, split a candidate that needs more than one Diataxis job, merge small neighbors that share one job, order pages so every dependency is taught first, and list exclusions with reasons. `tests/security-scope-run.test.mjs` checks that the output follows those rules: every concept is placed exactly once, and no page depends on a later page.

## What the scope pass found

**Verdict: this is a multi-page series, not one page.** The scope pass reached that through its own evidence:

- **Dependency depth.** The longest chain is eight concepts: addresses -> ports -> firewall rules -> segmentation -> verified isolation -> decoy containment -> running a decoy -> reviewing it. The decoy the one-page artifact ends on sits at the bottom of that chain.
- **Mixed jobs.** The subject needs all four Diataxis modes: tutorials for scope, listeners, the lab boundary, and the decoy; how-tos for inventory, exposure, and each sensor; explanations for networking, firewalls, what a sensor can see, and decoys; a reference for sensors and records. Three boundaries split because their concepts needed two jobs.
- **Foundations nobody teaches.** Eight of the 28 concepts are foundations (addressing, routing, NAT, ports, packets vs metadata, admin commands, consent, threat model). Every later page depends on some of them.

The scope pass laid out 13 pages in dependency order, with four exclusions (internet exposure, other people's devices, inline blocking, offensive tooling). The page count came out of the rules. It was never a target.

## The existing page against the map

The one-page artifact touches most of the map, but most concepts appear as a name or a line, not as something taught:

| On the existing page | Concepts |
| --- | --- |
| Taught (explained and practiced) | consent-scope, listener-inventory, honeypot-containment |
| Named or mentioned in a line | lab-boundary, segmentation, verify-isolation, firewall-testing, upnp-exposure ("no inbound port forwards"), asset-inventory, baseline, traffic-capture, packets-vs-metadata, zeek, suricata, sensor-choice, log-retention, decoy-deploy, cli-admin |
| Absent | threat-model, ip-subnets, router-role, nat-not-firewall, ports-processes, firewall-rules, iot-risk, alert-triage, honeypot-concept, decoy-review |

This matches the Phase 1 trial from a different direction. The trial found six prerequisites with no page behind them. The map puts those same ideas (addressing, routing, ports, firewall rules, segmentation, packets vs metadata, admin commands) in the foundation and core tiers, and the scope pass gives each one a page before anything depends on it.

What the existing page does well carries forward: the topology picture becomes the visual for the lab-boundary tutorial, the listener commands anchor the host-listeners tutorial, and the honeypot safety gates become the core of the decoy explanation.

## What this does not prove

- **It was not fully blind.** One agent ran all three stages, and that agent had already written the Phase 1 trial and knew the page was thought to be compressed. No count went into the inputs, and the scope rules are written down and checked, but the judgment inside research and mapping could still lean toward the known answer. A clean test is the same subject run by a model or agent that has not seen the trial or the existing page, then compared against this run.
- **Concept granularity drives page count.** A coarser research pass would produce fewer concepts and fewer pages. The verdict (series, not page) held up under the rules; the exact count is soft.
- **Nothing is generated.** No page sheets or pages were written for the series. That is Phase 3.
