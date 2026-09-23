import type { Status } from "./schema";

/** Pure lifecycle policy shared by the Vite catalog and dependency-free tests. */
export function isCatalogVisible(
  status: Status,
  showUnpublished: boolean,
): boolean {
  if (status === "archived") return false;
  return showUnpublished || status === "published";
}
