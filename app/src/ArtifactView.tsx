import React, { useEffect, useMemo, useState } from "react";
import { authorToolsEnabled, seriesList, themes } from "./catalog";
import { BlockView } from "./components/BlockView";
import { type Artifact, type ThemeId } from "./schema";
import { ArtifactLink, artifactHref } from "./components/ArtifactLink";
import { applyArtifactShareMeta, clearArtifactShareMeta } from "./share-meta";

function blockLabel(block: Artifact["blocks"][number]): string {
  if ("heading" in block && block.heading) return block.heading;
  if ("title" in block && block.title) return block.title;
  if (block.type === "quote") return block.quote;
  if (block.type === "divider") return block.label || "Divider";
  return block.type.replaceAll("-", " ");
}

function focusHashTarget() {
  const id = decodeURIComponent(globalThis.location?.hash.slice(1) || "");
  if (!id) return false;
  const target = document.getElementById(id);
  if (!target) return false;
  target.scrollIntoView({ block: "start" });
  target.setAttribute("tabindex", "-1");
  target.focus({ preventScroll: true });
  return true;
}

export function ArtifactView({
  entry,
  home,
  open,
}: {
  entry: Artifact;
  home: () => void;
  open: (s: string) => void;
}) {
  const [theme, setTheme] = useState<ThemeId>(entry.theme);
  const activeTheme = authorToolsEnabled ? theme : entry.theme;
  const [zen, setZen] = useState(false);
  const [copied, setCopied] = useState("");
  const series = entry.series
    ? seriesList.find((g) => g.id === entry.series?.id)
    : undefined;
  const seriesIndex = series
    ? series.parts.findIndex((p) => p.slug === entry.slug)
    : -1;
  const prevPart =
    series && seriesIndex > 0 ? series.parts[seriesIndex - 1] : undefined;
  const nextPart =
    series && seriesIndex >= 0 && seriesIndex < series.parts.length - 1
      ? series.parts[seriesIndex + 1]
      : undefined;
  const sections = useMemo(
    () => entry.blocks.filter((block) => block.type !== "divider"),
    [entry.blocks],
  );
  const readingMinutes = Math.max(
    1,
    Math.ceil(JSON.stringify(entry.blocks).split(/\s+/).length / 220),
  );
  useEffect(() => {
    applyArtifactShareMeta(entry.title, entry.summary, entry.slug);
    const focus = () => requestAnimationFrame(() => {
      if (!focusHashTarget()) document.querySelector(".artifact")?.scrollIntoView({ block: "start" });
    });
    focus();
    globalThis.window?.addEventListener("hashchange", focus);
    return () => {
      globalThis.window?.removeEventListener("hashchange", focus);
      clearArtifactShareMeta();
    };
  }, [entry.slug, entry.title, entry.summary]);
  useEffect(() => {
    if (!zen) return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZen(false);
    };
    globalThis.window?.addEventListener("keydown", escape);
    return () => globalThis.window?.removeEventListener("keydown", escape);
  }, [zen]);
  const copySection = async (blockId: string) => {
    const url = new URL(artifactHref(entry.slug, blockId), location.href);
    try {
      await navigator.clipboard.writeText(url.href);
      setCopied(blockId);
      globalThis.setTimeout(() => setCopied(""), 1800);
    } catch {
      location.hash = blockId;
    }
  };
  return (
    <main className={`artifact theme-${activeTheme} ${zen ? "is-zen" : ""}`}>
      <a className="skip" href="#artifact-content">
        Skip to content
      </a>
      <header className="toolbar">
        <button onClick={home} className="plain">
          ← Ideas
        </button>
        <div className="artifact-meta">
          <strong>{entry.title}</strong>
          <small>
            {readingMinutes} min read
            {series
              ? ` · part ${seriesIndex + 1} of ${series.parts.length}`
              : ""}
          </small>
        </div>
        <details className="section-menu">
          <summary>Sections</summary>
          <nav aria-label="Sections on this page">
            {sections.map((block) => (
              <a key={block.id} href={artifactHref(entry.slug, block.id)}>
                {blockLabel(block)}
              </a>
            ))}
          </nav>
        </details>
        <button className="zen" aria-pressed={zen} onClick={() => setZen(!zen)}>
          {zen ? "Show controls" : "Focus"}
        </button>
        {authorToolsEnabled && (
          <div className="choices themes">
            {themes.map((t) => (
              <button
                key={t.id}
                title={t.label}
                aria-label={`Preview ${t.label} theme`}
                aria-pressed={theme === t.id}
                onClick={() => setTheme(t.id)}
              >
                <span className={`swatch swatch-${t.id}`} />
              </button>
            ))}
          </div>
        )}
      </header>
      {zen && (
        <button className="zen-exit" onClick={() => setZen(false)}>
          Show controls <span aria-hidden>·</span> Esc
        </button>
      )}
      <div id="artifact-content" className="shell" tabIndex={-1}>
        {entry.blocks.map((b) => (
          <div className="block-frame" key={b.id}>
            <BlockView block={b} />
            {b.type !== "divider" && (
              <button
                className="copy-section"
                onClick={() => copySection(b.id)}
                aria-label={`Copy link to ${blockLabel(b)}`}
              >
                {copied === b.id ? "Copied" : "Copy link"}
              </button>
            )}
          </div>
        ))}
      </div>
      {series && (
        <nav className="series-nav" aria-label={`Series: ${series.title}`}>
          {prevPart ? (
            <ArtifactLink slug={prevPart.slug} open={open}>
              <small>Previous part</small>
              {prevPart.title}
            </ArtifactLink>
          ) : (
            <span />
          )}
          <span className="series-pos">
            <b>
              {seriesIndex + 1} / {series.parts.length}
            </b>
            {series.title}
          </span>
          {nextPart ? (
            <ArtifactLink className="next" slug={nextPart.slug} open={open}>
              <small>Next part</small>
              {nextPart.title}
            </ArtifactLink>
          ) : (
            <span />
          )}
        </nav>
      )}
    </main>
  );
}
