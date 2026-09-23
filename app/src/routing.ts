import { allEntries } from "./catalog";
import { isReservedSlug, resolveScreen } from "./screen";

const query = () =>
  new URLSearchParams(globalThis.window?.location?.search ?? "");
// Every file on disk, not just the listed catalog: a deep link to a
// preview/draft page must reach App.tsx's "Not published" state instead of
// silently becoming Home.
const knownSlugs = allEntries.map((entry) => entry.slug);
export function screenFromLocation() {
  return resolveScreen(
    query().get("artifact"),
    knownSlugs,
    globalThis.window?.history.state?.showmobScreen,
  );
}
export function writeScreen(screen: string) {
  if (!globalThis.window?.location) return;
  const params = query();
  params.delete("artifact");
  params.delete("style");
  params.delete("mode");
  if (!isReservedSlug(screen)) params.set("artifact", screen);
  const search = params.toString();
  const url = `${location.pathname}${search ? `?${search}` : ""}`;
  history.pushState({ showmobScreen: screen }, "", url);
}
