/**
 * Pure route classification, kept free of catalog imports so tests can run it
 * without the bundler.
 *
 * A requested slug is kept whenever the file exists on disk, even if the
 * production catalog hides it. App.tsx then decides between the published
 * page and the "Not published" state. Only slugs with no file at all fall
 * back to Home or Studio. Reserved route slugs never resolve as artifacts.
 */
/**
 * Slugs owned by UI routes. An artifact with one of these slugs would be
 * indistinguishable from the route itself (e.g. a preview page named "home"
 * would render Home instead of "Not published"), so validation rejects them.
 */
export const RESERVED_SLUGS = ["home", "author"] as const;

export function isReservedSlug(slug: string): boolean {
  return (RESERVED_SLUGS as readonly string[]).includes(slug);
}

export function resolveScreen(
  artifact: string | null,
  knownSlugs: readonly string[],
  historyScreen?: unknown,
): string {
  if (artifact && !isReservedSlug(artifact) && knownSlugs.includes(artifact)) {
    return artifact;
  }
  return historyScreen === "author" ? "author" : "home";
}
