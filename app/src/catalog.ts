import { type Artifact, type ThemeId } from "./schema";
import { assertArtifact } from "./validation";

const contentModules = import.meta.glob("./content/*.json", {
  eager: true,
  import: "default",
}) as Record<string, unknown>;

/** Every validated artifact on disk — never delete content to hide it. */
export const allEntries: Artifact[] = Object.entries(contentModules)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([, value]) => assertArtifact(value));

/**
 * Local `vite` / `vite preview` with VITE_SHOW_UNPUBLISHED=true can show
 * draft/preview. Production builds default to published-only.
 */
export const showUnpublished =
  import.meta.env.DEV || import.meta.env.VITE_SHOW_UNPUBLISHED === "true";

/** Theme audition and similar author chrome — same gate as unpublished listing. */
export const authorToolsEnabled = showUnpublished;

function isListed(entry: Artifact): boolean {
  if (entry.status === "archived") return false;
  if (showUnpublished) return true;
  return entry.status === "published";
}

/** Catalog used by hub, series, and public routing. */
export const entries: Artifact[] = allEntries.filter(isListed);

export const themes: { id: ThemeId; label: string }[] = [
  { id: "paper", label: "Paper" },
  { id: "signal", label: "Signal" },
  { id: "workshop", label: "Workshop" },
  { id: "night", label: "Night" },
  { id: "field", label: "Field" },
];

export const seriesMeta: Record<string, { kicker: string; blurb: string }> = {
  "showmob-plan": {
    kicker: "Evolving product brief",
    blurb:
      "Seven connected pages that make the public product brief usable as sample content inside the product it describes.",
  },
  "field-work": {
    kicker: "Real work, honestly labeled",
    blurb:
      "Starter slots for evidence-backed pages from actual jobs. Nothing here is written yet, and nothing invented will ever fill them.",
  },
  "solid-state-circuitry": {
    kicker: "Practical electronics course",
    blurb:
      "Eight preview lessons for reading semiconductor behavior, datasheets and switching paths without turning examples into unreviewed machine designs.",
  },
  "showmob-mechanics": {
    kicker: "Learn the actual software line",
    blurb:
      "Eight preview lessons that trace a Showmob artifact from JSON through rendering, build, review, deployment and the planned persistence boundary.",
  },
  "local-security-lab": {
    kicker: "Defensive home lab",
    blurb:
      "Safe, consent-based pages for isolating owned devices, observing local services and learning from decoys without exposing anyone else.",
  },
};

export const seriesList = (() => {
  const map = new Map<
    string,
    { id: string; title: string; parts: Artifact[] }
  >();
  entries.forEach((entry) => {
    if (!entry.series) return;
    const group = map.get(entry.series.id) || {
      id: entry.series.id,
      title: entry.series.title,
      parts: [],
    };
    group.parts.push(entry);
    map.set(entry.series.id, group);
  });
  return [...map.values()].map((group) => ({
    ...group,
    parts: group.parts.sort(
      (a, b) => (a.series?.order ?? 0) - (b.series?.order ?? 0),
    ),
  }));
})();
