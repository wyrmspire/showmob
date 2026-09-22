import React, { useEffect, useState } from "react";
import { Callout } from "./file-kit";
import { type Block } from "../schema";

export function BlockView({ block }: { block: Block }) {
  const [id, setId] = useState<number | null>(null);
  const [checked, setChecked] = useState<number[]>([]);
  if (block.type === "hero")
    return (
      <section className="hero block block-enter" id={block.id}>
        <div className="eyebrow">{block.eyebrow}</div>
        <h1>{block.title}</h1>
        <p>{block.body}</p>
      </section>
    );
  if (block.type === "text")
    return (
      <section className="block block-enter" id={block.id}>
        <h2>{block.heading}</h2>
        <p>{block.body}</p>
      </section>
    );
  if (block.type === "stat-strip")
    return (
      <section className="stats block" id={block.id} aria-label="Key figures">
        {block.items.map((x) => (
          <div key={x.label}>
            <strong>{x.value}</strong>
            <span>{x.label}</span>
          </div>
        ))}
      </section>
    );
  if (block.type === "steps")
    return (
      <section className="block" id={block.id}>
        <h2>{block.heading}</h2>
        <ol className="steps">
          {block.items.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ol>
      </section>
    );
  if (block.type === "comparison")
    return (
      <section className="block" id={block.id}>
        <h2>{block.heading}</h2>
        <div className="compare">
          {block.columns.map((x) => (
            <article key={x.name}>
              <h3>{x.name}</h3>
              <p>{x.detail}</p>
            </article>
          ))}
        </div>
      </section>
    );
  if (block.type === "quote")
    return (
      <figure className="quote block" id={block.id}>
        <blockquote>“{block.quote}”</blockquote>
        <figcaption>{block.attribution}</figcaption>
      </figure>
    );
  if (block.type === "note-callout")
    return (
      <section className="block" id={block.id}>
        <Callout title={block.title} tone={block.tone ?? "note"}>
          {block.body}
        </Callout>
      </section>
    );
  if (block.type === "checklist")
    return (
      <section className="block" id={block.id}>
        <h2>{block.heading}</h2>
        <div className="checklist">
          {block.items.map((x, i) => (
            <button
              className={checked.includes(i) ? "done" : ""}
              aria-pressed={checked.includes(i)}
              onClick={() =>
                setChecked((c) =>
                  c.includes(i) ? c.filter((n) => n !== i) : [...c, i],
                )
              }
              key={x.label}
            >
              <span>{checked.includes(i) ? "✓" : "○"}</span>
              <span>
                <strong>{x.label}</strong>
                {x.detail && <small>{x.detail}</small>}
              </span>
            </button>
          ))}
        </div>
        <p className="session-note">
          This checklist resets when the page closes.
        </p>
      </section>
    );
  if (block.type === "timeline")
    return (
      <section className="block" id={block.id}>
        <h2>{block.heading}</h2>
        <div className="timeline">
          {block.items.map((x) => (
            <article key={x.time}>
              <time>{x.time}</time>
              <div>
                <h3>{x.title}</h3>
                <p>{x.detail}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  if (block.type === "code")
    return (
      <section className="block" id={block.id}>
        <h2>{block.heading}</h2>
        <pre>
          <code>{block.code}</code>
        </pre>
      </section>
    );
  if (block.type === "embed")
    return (
      <section className="block embed" id={block.id}>
        <h2>{block.heading}</h2>
        <div className="embed-frame">
          <span>↗</span>
          <strong>{block.source}</strong>
          <p>{block.caption}</p>
          {block.url && (
            <a href={block.url} target="_blank" rel="noreferrer">
              Open source
            </a>
          )}
        </div>
      </section>
    );
  if (block.type === "image") return <ImageBlock block={block} />;
  if (block.type === "resource-list")
    return (
      <section className="block" id={block.id}>
        <h2>{block.heading}</h2>
        <ul className="resource-list">
          {block.items.map((x, i) => (
            <li key={`${x.url}-${i}`}>
              <a href={x.url} target="_blank" rel="noreferrer">
                <strong>{x.label}</strong>
                <span>{x.detail}</span>
                <span aria-hidden>↗</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    );
  if (block.type === "exercise")
    return (
      <section className="block exercise" id={block.id}>
        <h2>{block.heading}</h2>
        <p>{block.prompt}</p>
        <div>
          {block.options.map((x, i) => (
            <button
              className={id === i ? "picked" : ""}
              aria-pressed={id === i}
              onClick={() => setId(i)}
              key={x}
            >
              {i + 1}. {x}
            </button>
          ))}
        </div>
        {id !== null && (
          <Callout
            title={
              id === block.answer ? "Good read" : "Look one boundary earlier"
            }
            tone={id === block.answer ? "positive" : "warning"}
          >
            {block.explanation}
          </Callout>
        )}
      </section>
    );
  if (block.type === "compact-table")
    return (
      <section className="block" id={block.id}>
        <h2>{block.heading}</h2>
        <div
          className="table-wrap"
          tabIndex={0}
          aria-label={`${block.heading} table`}
        >
          <table>
            {block.caption && <caption>{block.caption}</caption>}
            <thead>
              <tr>
                {block.columns.map((x) => (
                  <th key={x} scope="col">
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  if (block.type === "diagram")
    return (
      <section className="block" id={block.id}>
        <h2>{block.heading}</h2>
        <ol className="diagram">
          {block.nodes.map((x, i) => (
            <li key={`${x.title}-${i}`}>
              <b>{x.title}</b>
              <span>{x.detail}</span>
            </li>
          ))}
        </ol>
      </section>
    );
  if (block.type === "slideshow") return <Slideshow block={block} />;
  if (block.type === "divider")
    return (
      <div className="divider" id={block.id}>
        {block.label && <span>{block.label}</span>}
      </div>
    );
  return (
    <section className="cta block" id={block.id}>
      <h2>{block.heading}</h2>
      <p>{block.body}</p>
    </section>
  );
}
function ImageBlock({ block }: { block: Extract<Block, { type: "image" }> }) {
  const [failed, setFailed] = useState(false);
  return (
    <section className="block image-block" id={block.id}>
      {block.heading && <h2>{block.heading}</h2>}
      {failed ? (
        <Callout title="Image unavailable" tone="warning">
          {block.caption}
        </Callout>
      ) : (
        <figure>
          <img
            src={block.src}
            alt={block.alt}
            loading="lazy"
            decoding="async"
            onError={() => setFailed(true)}
          />
          <figcaption>
            {block.caption}
            {block.sourceUrl && (
              <>
                {" "}
                ·{" "}
                <a href={block.sourceUrl} target="_blank" rel="noreferrer">
                  View source
                </a>
              </>
            )}
          </figcaption>
        </figure>
      )}
    </section>
  );
}
function Slideshow({
  block,
}: {
  block: Extract<Block, { type: "slideshow" }>;
}) {
  const [index, setIndex] = useState(0);
  useEffect(
    () => setIndex((i) => Math.min(i, block.slides.length - 1)),
    [block.slides.length],
  );
  return (
    <section
      className="block slideshow"
      id={block.id}
      aria-label={block.heading}
    >
      <div className="slideshow-head">
        <h2>{block.heading}</h2>
        <span>
          {index + 1} / {block.slides.length}
        </span>
      </div>
      <article aria-live="polite" aria-atomic="true">
        <h3>{block.slides[index].title}</h3>
        <p>{block.slides[index].body}</p>
      </article>
      <div className="slideshow-controls">
        <button disabled={index === 0} onClick={() => setIndex((i) => i - 1)}>
          ← Previous
        </button>
        <div role="group" aria-label="Choose slide">
          {block.slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button
          disabled={index === block.slides.length - 1}
          onClick={() => setIndex((i) => i + 1)}
        >
          Next →
        </button>
      </div>
    </section>
  );
}
