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
  saveScrollHere();
  history.pushState({ showmobScreen: screen, navId: nextNavId() }, "", url);
}

// Scroll memory. The app navigates with pushState, so the browser's automatic
// scroll restoration fires on popstate BEFORE React has swapped the screens
// back - it clamps against the page that is still mounted and the reader
// lands at the top. Positions are kept per history entry (stamped with a
// navId) and restored by App.tsx after the pop render lands.
const scrollPositions = new Map<number, number>();
let navCounter =
  typeof globalThis.window?.history.state?.navId === "number"
    ? (globalThis.window.history.state.navId as number)
    : 0;

export function currentNavId(): number {
  if (!globalThis.window?.history) return 0;
  if (typeof globalThis.window.history.state?.navId !== "number") {
    globalThis.window.history.replaceState(
      { ...globalThis.window.history.state, navId: navCounter },
      "",
    );
  }
  return globalThis.window.history.state?.navId ?? 0;
}

// Remember where the reader is on the entry they are about to leave.
export function saveScrollHere() {
  if (!globalThis.window) return;
  scrollPositions.set(currentNavId(), globalThis.window.scrollY ?? 0);
}

// Where the reader was on an earlier entry, if they ever visited it.
export function scrollForNav(navId: number): number | undefined {
  return scrollPositions.get(navId);
}

function nextNavId(): number {
  navCounter += 1;
  return navCounter;
}
