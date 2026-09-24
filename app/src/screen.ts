/**
 * Pure route classification, kept free of catalog imports so tests can run it
 * without the bundler.
 *
 * A requested slug is kept whenever the file exists on disk, even if the
 * production catalog hides it. App.tsx then decides between the published
 * page and the "Not published" state. Only slugs with no file at all fall
 * back to Home or Studio. Reserved route slugs never resolve as artifacts.
 *
 * Share URLs use `/a/{slug}` (optional `#{blockId}`). Legacy `?artifact=`
 * remains an alias for the same slug.
 */
/**
 * Slugs owned by UI routes. An artifact with one of these slugs would be
 * indistinguishable from the route itself (e.g. a preview page named "home"
 * would render Home instead of "Not published"), so validation rejects them.
 */
export const RESERVED_SLUGS = ["home", "author", "everything", "grading"] as const;

/** Unlisted index of published + preview pages. Not linked from Home. */
export const EVERYTHING_PATH = "/everything";

/** Grading night test center. Unlisted and noindex, like /everything. */
export const GRADING_PATH = "/grading";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isReservedSlug(slug: string): boolean {
  return (RESERVED_SLUGS as readonly string[]).includes(slug);
}

export function isArtifactSlug(slug: string): boolean {
  return SLUG_RE.test(slug) && !isReservedSlug(slug);
}

/** Parse `/a/{slug}` (ignore trailing slash). Returns null when not a share path. */
export function slugFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/a\/([a-z0-9]+(?:-[a-z0-9]+)*)\/?$/);
  if (!match) return null;
  const slug = match[1];
  return isArtifactSlug(slug) ? slug : null;
}

/**
 * Screen value for a URL path the app does not own (anything other than `/`
 * or a well-formed `/a/{slug}`). It is deliberately not a valid slug and not
 * reserved, so App.tsx falls through to its "Page not found" screen.
 */
export const NOT_FOUND_SCREEN = ":not-found";

/** Paths that render Home/Studio. Everything else must be `/a/{slug}`. */
function isRootPath(pathname: string): boolean {
  return pathname === "" || pathname === "/" || pathname === "/index.html";
}

export function artifactPath(slug: string, blockId?: string): string {
  const hash = blockId ? `#${encodeURIComponent(blockId)}` : "";
  return `/a/${encodeURIComponent(slug)}${hash}`;
}

export function resolveScreen(
  artifact: string | null,
  knownSlugs: readonly string[],
  historyScreen?: unknown,
  pathname?: string,
): string {
  // Keep a well-formed requested slug even when no artifact currently owns it.
  // App.tsx needs the original value to distinguish a withheld artifact from a
  // genuinely unknown URL. `knownSlugs` stays in the signature for callers and
  // tests that also need the current catalog inventory.
  void knownSlugs;
  const fromPath =
    typeof pathname === "string" ? slugFromPathname(pathname) : null;
  // Unknown paths (e.g. `/showmob-guide`, `/a/Bad_Slug`) are not-found, not
  // Home. Vercel rewrites every non-file path to index.html, so the app is the
  // only layer that can tell the reader the address is wrong.
  if (
    typeof pathname === "string" &&
    pathname.replace(/\/$/, "") === EVERYTHING_PATH
  ) {
    return "everything";
  }
  if (
    typeof pathname === "string" &&
    pathname.replace(/\/$/, "") === GRADING_PATH
  ) {
    return "grading";
  }
  if (typeof pathname === "string" && !fromPath && !isRootPath(pathname)) {
    return NOT_FOUND_SCREEN;
  }
  const candidate = fromPath ?? artifact;
  if (candidate && isArtifactSlug(candidate)) {
    return candidate;
  }
  return historyScreen === "author" ? "author" : "home";
}
