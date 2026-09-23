import type { Status } from "./schema";

/** Pure lifecycle policy shared by the Vite catalog and dependency-free tests. */
export function isCatalogVisible(
  status: Status,
  showUnpublished: boolean,
): boolean {
  if (status === "archived") return false;
  return showUnpublished || status === "published";
}

/**
 * Whether a direct `/a/{slug}` link renders the page.
 * published = listed + viewable; preview = unlisted but viewable by link;
 * draft = hidden ("Not published"); archived = never.
 */
export function isLinkViewable(
  status: Status,
  showUnpublished: boolean,
): boolean {
  if (status === "archived") return false;
  return showUnpublished || status === "published" || status === "preview";
}
