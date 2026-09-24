/**
 * Grading-night page plans. Loaded only so /grading can reveal the plan
 * after a grade is recorded — never on the cold first view, and never on
 * the public pages themselves.
 */
import doc from "./content-plans/gn-plans.json";

export type Plan = {
  id: string;
  slug: string;
  contributor: string;
  provenance: string;
  goal: string;
  why_widgets: string;
  rejected: string;
};

const byId = new Map<string, Plan>(
  (doc.plans as Plan[]).map((plan) => [plan.id, plan]),
);

export function planForSubject(id: string): Plan | undefined {
  return byId.get(id);
}

/** Human provenance label — never surface the contributor field (blind). */
export function planProvenanceLabel(provenance: string): string {
  if (provenance === "first-hand") return "Author plan";
  if (provenance === "inferred") return "Inferred (read cold)";
  return provenance;
}
