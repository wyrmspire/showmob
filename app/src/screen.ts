/**
 * Pure route classification, kept free of catalog imports so tests can run it
 * without the bundler.
 *
 * A requested slug is kept whenever the file exists on disk, even if the
 * production catalog hides it. App.tsx then decides between the published
 * page and the "Not published" state. Only slugs with no file at all fall
 * back to Home or Studio.
 */
export function resolveScreen(
  artifact: string | null,
  knownSlugs: readonly string[],
  historyScreen?: unknown,
): string {
  if (artifact && knownSlugs.includes(artifact)) return artifact;
  return historyScreen === "author" ? "author" : "home";
}
