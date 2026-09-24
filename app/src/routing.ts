import { allEntries } from "./catalog";
import {
  EVERYTHING_PATH,
  GRADING_PATH,
  artifactPath,
  isArtifactSlug,
  isReservedSlug,
  resolveScreen,
  slugFromPathname,
} from "./screen";

const query = () =>
  new URLSearchParams(globalThis.window?.location?.search ?? "");
// Every file on disk, not just the listed catalog: a deep link to a
// preview/draft page must reach App.tsx's "Not published" state instead of
// silently becoming Home.
const knownSlugs = allEntries.map((entry) => entry.slug);

function cleanSearchParams() {
  const params = query();
  params.delete("artifact");
  params.delete("style");
  params.delete("mode");
  return params;
}

export function screenFromLocation() {
  const pathname = globalThis.window?.location?.pathname ?? "/";
  const artifactParam = query().get("artifact");
  const screen = resolveScreen(
    artifactParam,
    knownSlugs,
    globalThis.window?.history.state?.showmobScreen,
    pathname,
  );

  // Legacy `/?artifact=slug` → `/a/slug` once so copied address bars get OG URLs.
  if (
    globalThis.window?.location &&
    artifactParam &&
    isArtifactSlug(artifactParam) &&
    screen === artifactParam &&
    !slugFromPathname(pathname)
  ) {
    const params = cleanSearchParams();
    const search = params.toString();
    const hash = location.hash;
    const next = `${artifactPath(artifactParam)}${search ? `?${search}` : ""}${hash}`;
    history.replaceState({ showmobScreen: screen }, "", next);
  }

  return screen;
}

export function writeScreen(screen: string) {
  if (!globalThis.window?.location) return;
  const params = cleanSearchParams();
  const search = params.toString();
  // Artifacts use `/a/{slug}`; home and Studio (author) stay on `/`.
  const path =
    screen === "everything"
      ? EVERYTHING_PATH
      : screen === "grading"
        ? GRADING_PATH
        : !isReservedSlug(screen) && isArtifactSlug(screen)
          ? artifactPath(screen)
          : "/";
  const url = `${path}${search ? `?${search}` : ""}`;
  history.pushState({ showmobScreen: screen }, "", url);
}
