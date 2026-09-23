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
  // Keep a well-formed requested slug even when no artifact currently owns it.
  // App.tsx needs the original value to distinguish a withheld artifact from a
  // genuinely unknown URL. `knownSlugs` stays in the signature for callers and
  // tests that also need the current catalog inventory.
  void knownSlugs;
  if (
    artifact &&
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(artifact) &&
    !isReservedSlug(artifact)
  ) {
    return artifact;
  }
  return historyScreen === "author" ? "author" : "home";
}
