import React, { useState } from "react";
import {
  Closing,
  FileCard,
  Group,
  Header,
  Paragraph,
} from "./components/file-kit";
import { authorToolsEnabled, entries, seriesList, seriesMeta } from "./catalog";
import { ArtifactLink } from "./components/ArtifactLink";

const TAG_CAP = 10;

export function Home({
  open,
  author,
}: {
  open: (s: string) => void;
  author: () => void;
}) {
  const [term, setTerm] = useState("");
  const [tag, setTag] = useState("all");
  const [showAllTags, setShowAllTags] = useState(false);
  const tagCounts = entries
    .flatMap((entry) => entry.tags ?? [])
    .reduce((counts, value) => counts.set(value, (counts.get(value) ?? 0) + 1), new Map<string, number>());
  const tags = [...tagCounts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const primaryTags = tags.slice(0, TAG_CAP);
  const overflowCount = Math.max(0, tags.length - TAG_CAP);
  const selectedOverflow = tag !== "all" ? tags.find(([name], index) => name === tag && index >= TAG_CAP) : undefined;
  const shownTags = showAllTags
    ? tags
    : selectedOverflow
      ? [...primaryTags, selectedOverflow]
      : primaryTags;
  const visible = entries.filter(
    (e) =>
      (tag === "all" || e.tags?.includes(tag)) &&
      `${e.title} ${e.summary} ${e.contributor} ${(e.tags ?? []).join(" ")}`
        .toLowerCase()
        .includes(term.toLowerCase()),
  );
  const visibleSlugs = new Set(visible.map((entry) => entry.slug));
  const standalone = visible.filter((entry) => !entry.series);
  return (
    <FileCard>
      <Header
        title="Showmob"
        fact="Idea pages as links"
        intro="Showmob turns a structured idea into one shareable web page. Browse the library, follow a connected series, or search for the subject you need."
      />
      <section className="home-lead">
        <div>
          <span className="eyebrow">How this site works</span>
          <h2>Read a page. Follow a series. Present a block.</h2>
        </div>
        <div className="mini-features">
          <span>
            <b>01</b> Open a published page and scroll
          </span>
          <span>
            <b>02</b> Step through a slideshow when the page has one
          </span>
          <span>
            <b>03</b> Search or filter by tag to find the next idea
          </span>
        </div>
      </section>
      <div className="discovery">
        <label>
          Find an idea
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            aria-label="Search pages"
            placeholder="Search title, summary, contributor or tag"
          />
        </label>
        <div className="tagbar" aria-label="Filter by tag">
          <button aria-pressed={tag === "all"} onClick={() => setTag("all")}>
            All
          </button>
          {shownTags.map(([name, count]) => (
            <button aria-pressed={tag === name} onClick={() => setTag(name)} key={name}>
              {name} <small>{count}</small>
            </button>
          ))}
          {overflowCount > 0 && (
            <button
              type="button"
              aria-expanded={showAllTags}
              onClick={() => setShowAllTags((openTags) => !openTags)}
            >
              {showAllTags ? "Fewer tags" : `More tags · ${overflowCount}`}
            </button>
          )}
        </div>
        <p className="result-count" aria-live="polite">
          {visible.length} of {entries.length} pages
        </p>
      </div>
      {seriesList.map((g) => {
        const meta = seriesMeta[g.id];
        const parts = g.parts.filter((part) => visibleSlugs.has(part.slug));
        if (!parts.length) return null;
        return (
          <section className="series-shelf" key={g.id}>
            <div className="series-head">
              <span className="eyebrow">{meta?.kicker ?? "Series"}</span>
              <h2>{g.title}</h2>
              <p>
                {meta?.blurb ??
                  `${parts.length} connected ${parts.length === 1 ? "page" : "pages"}.`}
              </p>
            </div>
            <div className="series-parts">
              {parts.map((p) => (
                <ArtifactLink
                  key={p.slug}
                  slug={p.slug}
                  open={open}
                  className={`series-part accent-${p.theme}`}
                >
                  <b>{String(p.series?.order ?? 0).padStart(2, "0")}</b>
                  <div>
                    <h3>
                      {p.title}
                      {p.status !== "published" && (
                        <span className={`status-chip status-${p.status}`}>
                          {p.status}
                        </span>
                      )}
                    </h3>
                    <p>{p.summary}</p>
                  </div>
                  <span className="card-action">
                    Open <span aria-hidden>→</span>
                  </span>
                </ArtifactLink>
              ))}
            </div>
          </section>
        );
      })}
      <div className="entry-grid">
        {standalone.map((e) => (
          <ArtifactLink
            key={e.slug}
            slug={e.slug}
            open={open}
            className={`entry-card accent-${e.theme}`}
          >
            <div>
              <span className="eyebrow">{e.contributor}</span>
              {e.status !== "published" && (
                <span className={`status-chip status-${e.status}`}>
                  {e.status}
                </span>
              )}
              <h3>{e.title}</h3>
              <p>{e.summary}</p>
            </div>
            <div className="entry-tags">
              {e.tags?.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
            <span className="card-action">
              Open page <span aria-hidden>→</span>
            </span>
          </ArtifactLink>
        ))}
      </div>
      {!visible.length && (
        <div className="empty">
          <h3>No match yet</h3>
          <p>Clear the search or try a different tag.</p>
          <button
            className="file-button"
            data-variant="secondary"
            onClick={() => {
              setTerm("");
              setTag("all");
            }}
          >
            Reset discovery
          </button>
        </div>
      )}
      {authorToolsEnabled && (
        <>
          <div className="author-card">
            <div>
              <span className="eyebrow">Local studio</span>
              <h2>Assemble a whole page</h2>
              <p>
                Start from a pattern, add and reorder blocks, preview the full
                entry, and export clean JSON.
              </p>
            </div>
            <button className="file-button" onClick={author}>
              Open studio
            </button>
          </div>
          <Group label="Builder notes">
            <Paragraph>
              Showmob pages share one portable content contract. Studio drafts
              remain in this browser until exported.
            </Paragraph>
          </Group>
          <Closing>Builder tools are available in local author preview.</Closing>
        </>
      )}
    </FileCard>
  );
}
