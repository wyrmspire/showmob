import { entries } from "./catalog";

const query = () =>
  new URLSearchParams(globalThis.window?.location?.search ?? "");
export function screenFromLocation() {
  const artifact = query().get("artifact");
  if (artifact && entries.some((entry) => entry.slug === artifact))
    return artifact;
  return globalThis.window?.history.state?.showmobScreen === "author"
    ? "author"
    : "home";
}
export function writeScreen(screen: string) {
  if (!globalThis.window?.location) return;
  const params = query();
  params.delete("artifact");
  params.delete("style");
  params.delete("mode");
  if (screen !== "home" && screen !== "author") params.set("artifact", screen);
  const search = params.toString();
  const url = `${location.pathname}${search ? `?${search}` : ""}`;
  history.pushState({ showmobScreen: screen }, "", url);
}
