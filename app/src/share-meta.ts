/** Tiny DOM upserts for JS-capable previewers. Crawlers use build-time HTML. */

const HOME_DESCRIPTION =
  "Showmob turns structured ideas into portable web pages.";

function siteBase(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL;
  return String(fromEnv || "https://showmob.vercel.app").replace(/\/$/, "");
}

function upsertMeta(
  attr: "name" | "property",
  key: string,
  content: string,
): void {
  const selector = `meta[${attr}="${key}"]`;
  let el = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.content = content;
}

function upsertCanonical(href: string): void {
  let link = document.head.querySelector(
    'link[rel="canonical"]',
  ) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link");
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = href;
}

export function applyArtifactShareMeta(title: string, summary: string, slug: string): void {
  const pageTitle = `${title} · Showmob`;
  const url = `${siteBase()}/a/${slug}`;
  document.title = pageTitle;
  upsertMeta("name", "description", summary);
  upsertMeta("property", "og:type", "article");
  upsertMeta("property", "og:title", pageTitle);
  upsertMeta("property", "og:description", summary);
  upsertMeta("property", "og:url", url);
  upsertMeta("property", "og:site_name", "Showmob");
  upsertMeta("name", "twitter:card", "summary");
  upsertMeta("name", "twitter:title", pageTitle);
  upsertMeta("name", "twitter:description", summary);
  upsertCanonical(url);
}

export function clearArtifactShareMeta(): void {
  document.title = "Showmob";
  upsertMeta("name", "description", HOME_DESCRIPTION);
  for (const [attr, key] of [
    ["property", "og:type"],
    ["property", "og:title"],
    ["property", "og:description"],
    ["property", "og:url"],
    ["property", "og:site_name"],
    ["name", "twitter:card"],
    ["name", "twitter:title"],
    ["name", "twitter:description"],
  ] as const) {
    document.head.querySelector(`meta[${attr}="${key}"]`)?.remove();
  }
  document.head.querySelector('link[rel="canonical"]')?.remove();
}

/** Unlisted (preview) pages ask crawlers not to index them. */
export function setUnlistedRobots(unlisted: boolean): void {
  const existing = document.head.querySelector('meta[name="robots"]');
  if (!unlisted) {
    existing?.remove();
    return;
  }
  upsertMeta("name", "robots", "noindex");
}
