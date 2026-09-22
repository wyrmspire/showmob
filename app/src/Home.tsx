import React, { useState } from "react";
import {
  Closing,
  FileCard,
  Group,
  Header,
  Paragraph,
} from "./components/file-kit";
import { entries, seriesList, seriesMeta } from "./catalog";

export function Home({
  open,
  author,
}: {
  open: (s: string) => void;
  author: () => void;
}) {
  const [term, setTerm] = useState("");
  const [tag, setTag] = useState("all");
  const tags = [...new Set(entries.flatMap((e) => e.tags ?? []))];
  const visible = entries.filter(
    (e) =>
      (tag === "all" || e.tags?.includes(tag)) &&
      `${e.title} ${e.summary} ${e.contributor} ${(e.tags ?? []).join(" ")}`
        .toLowerCase()
        .includes(term.toLowerCase()),
  );
  return (
    <FileCard>
      <Header
        title="Showmob"
        fact="Idea pages as links"
        intro="Showmob turns a structured idea into one shareable web page. Browse the published library below, open a page to read it, and use a slideshow block only when you want paced slides. New pages are JSON files the build discovers automatically."
      />
      <section className="home-lead">
        <div>
          <span className="eyebrow">How this site works</span>
          <h2>Read a page. Present a block. Author as JSON.</h2>
        </div>
        <div className="mini-features">
          <span>
            <b>01</b> Open a published page and scroll
          </span>
          <span>
            <b>02</b> Step through a slideshow when the page has one
          </span>
          <span>
            <b>03</b> Add or export JSON to create the next page
          </span>
        </div>
      </section>
      {seriesList.map((g) => {
        const meta = seriesMeta[g.id];
        const parts = g.parts;
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
                <article
                  key={p.slug}
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
                  <button
                    className="file-button"
                    data-variant="secondary"
                    onClick={() => open(p.slug)}
                  >
                    Open <span aria-hidden>→</span>
                  </button>
                </article>
              ))}
            </div>
          </section>
        );
      })}
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
          {tags.map((t) => (
            <button aria-pressed={tag === t} onClick={() => setTag(t)} key={t}>
              {t}
            </button>
          ))}
        </div>
        <p className="result-count" aria-live="polite">
          {visible.length} of{" "}
          {entries.length} pages
        </p>
      </div>
      <div className="entry-grid">
        {visible.map((e) => (
          <article key={e.slug} className={`entry-card accent-${e.theme}`}>
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
            <button className="file-button" onClick={() => open(e.slug)}>
              Open page <span aria-hidden>→</span>
            </button>
          </article>
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
      <div className="author-card">
        <div>
          <span className="eyebrow">Local studio</span>
          <h2>Assemble a whole page</h2>
          <p>
            Start from a pattern, add and reorder blocks, preview the full
            entry, and export clean JSON. Your draft stays in this browser until
            you reset it.
          </p>
        </div>
        <button className="file-button" onClick={author}>
          Open studio
        </button>
      </div>
      <Group label="One content contract">
        <Paragraph>
          Nineteen renderer-owned blocks cover narrative, evidence, sequences,
          comparisons, media, grouped sources, code and practice. Templates are
          JSON starting points, not separate page systems.
        </Paragraph>
      </Group>
      <Closing>
        Local drafts and interactions stay in this browser until exported.
      </Closing>
    </FileCard>
  );
}
