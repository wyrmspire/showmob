import React, { useEffect, useState } from "react";
import { Callout, FileCard, Header, Row, Rows } from "./components/file-kit";
import { authorToolsEnabled, seriesList, themes } from "./catalog";
import { BlockView } from "./components/BlockView";
import { type Artifact, type ThemeId } from "./schema";

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
  useEffect(() => {
    document.querySelector(".artifact")?.scrollIntoView({ block: "start" });
  }, [entry.slug]);
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
            {entry.blocks.length} sections · {entry.status}
            {series
              ? ` · part ${seriesIndex + 1} of ${series.parts.length}`
              : ""}
          </small>
        </div>
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
      <div id="artifact-content" className="shell" tabIndex={-1}>
        {entry.blocks.map((b) => (
          <BlockView block={b} key={b.id} />
        ))}
      </div>
      {series && (
        <nav className="series-nav" aria-label={`Series: ${series.title}`}>
          {prevPart ? (
            <button onClick={() => open(prevPart.slug)}>
              <small>Previous part</small>
              {prevPart.title}
            </button>
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
            <button className="next" onClick={() => open(nextPart.slug)}>
              <small>Next part</small>
              {nextPart.title}
            </button>
          ) : (
            <span />
          )}
        </nav>
      )}
    </main>
  );
}
