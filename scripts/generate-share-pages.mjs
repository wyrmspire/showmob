/**
 * Post-vite: copy dist/index.html → dist/a/{slug}.html (and
 * dist/a/{slug}/index.html) for each published artifact, injecting
 * crawler-visible title/description/OG/Twitter.
 *
 * Flat `.html` makes `/a/{slug}` resolve under Vite preview and Vercel
 * cleanUrls without requiring a trailing slash. Directory index covers
 * `/a/{slug}/`. Theme-colored OG images are deferred.
 */
import {
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

export function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export function siteBaseUrl(
  env = process.env,
  fallback = "https://showmob.vercel.app",
) {
  const raw =
    env.SHOWMOB_SITE_URL || env.VITE_SITE_URL || fallback;
  return String(raw).replace(/\/$/, "");
}

export function artifactShareUrl(base, slug) {
  return `${base.replace(/\/$/, "")}/a/${slug}`;
}

export function buildShareHeadTags({
  title,
  summary,
  url,
  siteName = "Showmob",
  type = "article",
}) {
  const pageTitle = escapeHtml(`${title} · ${siteName}`);
  const description = escapeHtml(summary);
  const absolute = escapeHtml(url);
  const site = escapeHtml(siteName);
  return [
    `<title>${pageTitle}</title>`,
    `<meta name="description" content="${description}" />`,
    `<link rel="canonical" href="${absolute}" />`,
    `<meta property="og:type" content="${escapeHtml(type)}" />`,
    `<meta property="og:title" content="${pageTitle}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${absolute}" />`,
    `<meta property="og:site_name" content="${site}" />`,
    `<meta name="twitter:card" content="summary" />`,
    `<meta name="twitter:title" content="${pageTitle}" />`,
    `<meta name="twitter:description" content="${description}" />`,
  ].join("\n    ");
}

export function injectShareMeta(html, meta) {
  let out = html;
  out = out.replace(/<title>[^<]*<\/title>\s*/i, "");
  out = out.replace(/<meta\s+name=["']description["'][^>]*>\s*/i, "");
  out = out.replace(
    /\n?\s*<!-- showmob-share-meta -->[\s\S]*?<!-- \/showmob-share-meta -->\s*/i,
    "\n",
  );
  const block = [
    "<!-- showmob-share-meta -->",
    `    ${buildShareHeadTags(meta)}`,
    "    <!-- /showmob-share-meta -->",
  ].join("\n");
  if (!/<\/head>/i.test(out)) {
    throw new Error("generate-share-pages: built index.html has no </head>");
  }
  return out.replace(/<\/head>/i, `    ${block}\n  </head>`);
}

export function loadPublishedArtifacts(contentDir) {
  return readdirSync(contentDir)
    .filter((name) => name.endsWith(".json"))
    .map((name) =>
      JSON.parse(readFileSync(join(contentDir, name), "utf8")),
    )
    .filter((artifact) => artifact.status === "published")
    .sort((a, b) => String(a.slug).localeCompare(String(b.slug)));
}

export function generateSharePages({
  distDir = join(root, "dist"),
  contentDir = join(root, "app/src/content"),
  env = process.env,
} = {}) {
  const indexPath = join(distDir, "index.html");
  const template = readFileSync(indexPath, "utf8");
  const base = siteBaseUrl(env);
  const published = loadPublishedArtifacts(contentDir);
  const written = [];
  for (const artifact of published) {
    const slug = artifact.slug;
    const html = injectShareMeta(template, {
      title: artifact.title,
      summary: artifact.summary,
      url: artifactShareUrl(base, slug),
    });
    const dirPath = join(distDir, "a", slug, "index.html");
    const flatPath = join(distDir, "a", `${slug}.html`);
    mkdirSync(dirname(dirPath), { recursive: true });
    writeFileSync(dirPath, html);
    writeFileSync(flatPath, html);
    written.push(slug);
  }
  return { base, written };
}

const isMain =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  const { base, written } = generateSharePages();
  console.log(
    `generate-share-pages: ${written.length} published pages under ${base}/a/{slug}/`,
  );
}
