import React, { useEffect, useRef, useState } from "react";
import { type Artifact, type Block, type ThemeId } from "./schema";
import { formatIssues, parseArtifact, restoreDraft } from "./validation";
import { BlockView } from "./components/BlockView";
import { Callout } from "./components/file-kit";
import { themes } from "./catalog";

const uid = () => `block-${Math.random().toString(36).slice(2, 8)}`;
const starter = (type: string): Block => {
  const id = uid();
  if (type === "slideshow")
    return {
      id,
      type,
      heading: "A short presentation",
      slides: [
        { title: "Start here", body: "Orient the room." },
        { title: "Make the point", body: "Keep one idea per slide." },
      ],
    };
  if (type === "compact-table")
    return {
      id,
      type,
      heading: "A compact comparison",
      columns: ["Item", "Detail"],
      rows: [["Example", "Useful fact"]],
    };
  if (type === "diagram")
    return {
      id,
      type,
      heading: "How it flows",
      nodes: [
        { title: "Start", detail: "Name the input." },
        { title: "Next", detail: "Show the result." },
      ],
    };
  if (type === "note-callout")
    return {
      id,
      type,
      title: "A useful note",
      body: "Explain the constraint, insight or exception.",
    };
  if (type === "steps")
    return {
      id,
      type,
      heading: "A simple sequence",
      items: [
        "Name the expected result.",
        "Test one boundary.",
        "Leave evidence behind.",
      ],
    };
  if (type === "quote")
    return {
      id,
      type,
      quote: "Put the memorable line here.",
      attribution: "Source or contributor",
    };
  if (type === "divider") return { id, type, label: "Next idea" };
  if (type === "cta-band")
    return {
      id,
      type,
      heading: "Try this next",
      body: "Name one clear, useful action.",
    };
  return {
    id,
    type: "text",
    heading: "A clear heading",
    body: "Write one idea in plain language.",
  };
};
const templates: { name: string; detail: string; blocks: Block[] }[] = [
  {
    name: "Field guide",
    detail: "A safe sequence from context to action.",
    blocks: [
      {
        id: "start",
        type: "hero",
        eyebrow: "Field guide",
        title: "Read the situation first",
        body: "Give the reader a calm, useful orientation.",
      },
      {
        id: "sequence",
        type: "steps",
        heading: "The working sequence",
        items: [
          "Start at the boundary.",
          "Observe what changed.",
          "Choose the smallest safe check.",
        ],
      },
      {
        id: "note",
        type: "note-callout",
        title: "Keep the boundary visible",
        body: "State what should not be touched or assumed.",
      },
      {
        id: "close",
        type: "cta-band",
        heading: "Leave a trail",
        body: "Record what you saw and the next safe check.",
      },
    ],
  },
  {
    name: "Short lesson",
    detail: "Teach one idea, then let the reader use it.",
    blocks: [
      {
        id: "start",
        type: "hero",
        eyebrow: "Short lesson",
        title: "Teach one useful idea",
        body: "Name the idea and why it matters.",
      },
      {
        id: "explain",
        type: "text",
        heading: "Make it concrete",
        body: "Use a real situation and plain words.",
      },
      {
        id: "practice",
        type: "exercise",
        heading: "Check the read",
        prompt: "Which option best applies the idea?",
        options: [
          "A tempting shortcut",
          "The evidence-led choice",
          "An unrelated change",
        ],
        answer: 1,
        explanation: "The evidence-led choice keeps the next move readable.",
      },
      {
        id: "close",
        type: "cta-band",
        heading: "Use it once",
        body: "Try the idea in one small real situation.",
      },
    ],
  },
  {
    name: "Case note",
    detail: "Capture a problem, evidence and handoff.",
    blocks: [
      {
        id: "start",
        type: "hero",
        eyebrow: "Case note",
        title: "What happened and what we learned",
        body: "Summarize the situation without inflating the claim.",
      },
      {
        id: "facts",
        type: "comparison",
        heading: "Expected and observed",
        columns: [
          { name: "Expected", detail: "Describe the normal state." },
          { name: "Observed", detail: "Describe what was actually true." },
        ],
      },
      {
        id: "timeline",
        type: "timeline",
        heading: "Evidence trail",
        items: [
          {
            time: "First",
            title: "Initial signal",
            detail: "Record the first dependable fact.",
          },
          {
            time: "Then",
            title: "Small test",
            detail: "Record the boundary tested and result.",
          },
        ],
      },
      {
        id: "close",
        type: "cta-band",
        heading: "Handoff",
        body: "Name what is known, unknown and worth checking next.",
      },
    ],
  },
];
const defaultDraft: Artifact = {
  schemaVersion: 1,
  slug: "local-draft",
  title: "A useful working page",
  summary: "A browser-local draft built with the Showmob content contract.",
  contributor: "Local author",
  status: "draft",
  theme: "signal",
  tags: ["draft"],
  updated: "",
  blocks: templates[0].blocks,
};
function loadDraft() {
  try {
    return restoreDraft(localStorage.getItem("showmob-v2-draft"), defaultDraft);
  } catch {
    return {
      draft: defaultDraft,
      issue:
        "Browser storage is unavailable here. Export JSON to keep this draft.",
    };
  }
}
export function Studio({ back }: { back: () => void }) {
  const [initial] = useState(loadDraft);
  const [draft, setDraft] = useState<Artifact>(initial.draft);
  const [validationError, setValidationError] = useState(initial.issue);
  const [selected, setSelected] = useState(0);
  const [tab, setTab] = useState<"build" | "preview" | "json">("build");
  const [io, setIo] = useState("");
  const [notice, setNotice] = useState("Draft is saved only in this browser.");
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (initial.issue && draft === initial.draft) return;
    setValidationError("");
    try {
      localStorage.setItem("showmob-v2-draft", JSON.stringify(draft));
      setNotice("Saved in this browser.");
    } catch {
      setNotice(
        "Browser storage is unavailable here. Export JSON to keep this draft.",
      );
    }
  }, [draft]);
  const patch = (i: number, value: Block) =>
    setDraft((d) => ({
      ...d,
      blocks: d.blocks.map((b, n) => (n === i ? value : b)),
    }));
  const move = (i: number, by: number) => {
    const n = i + by;
    if (n < 0 || n >= draft.blocks.length) return;
    const blocks = [...draft.blocks];
    [blocks[i], blocks[n]] = [blocks[n], blocks[i]];
    setDraft({ ...draft, blocks });
    setSelected(n);
  };
  const remove = (i: number) => {
    if (draft.blocks.length === 1) return;
    setDraft({ ...draft, blocks: draft.blocks.filter((_, n) => n !== i) });
    setSelected(Math.max(0, i - 1));
  };
  const add = (type: string) => {
    const blocks = [...draft.blocks, starter(type)];
    setDraft({ ...draft, blocks });
    setSelected(blocks.length - 1);
  };
  const duplicate = (i: number) => {
    const copy = { ...draft.blocks[i], id: uid() } as Block;
    const blocks = [...draft.blocks];
    blocks.splice(i + 1, 0, copy);
    setDraft({ ...draft, blocks });
    setSelected(i + 1);
  };
  const applyTemplate = (n: number) => {
    setDraft({
      ...defaultDraft,
      title: templates[n].name,
      summary: templates[n].detail,
      blocks: structuredClone(templates[n].blocks),
    });
    setSelected(0);
    setNotice(
      `${templates[n].name} loaded. Your prior local draft was replaced.`,
    );
  };
  const reset = () => {
    try {
      localStorage.removeItem("showmob-v2-draft");
    } catch {}
    setValidationError("");
    setDraft(defaultDraft);
    setSelected(0);
    setNotice("Local draft reset to the starter.");
  };
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(draft, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${draft.slug || "showmob-draft"}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    setNotice("JSON export downloaded.");
  };
  const importValue = (text: string) => {
    const result = parseArtifact(text);
    if (!result.ok) {
      setValidationError(
        `Import failed. ${formatIssues(result.issues)} Your current draft was kept.`,
      );
      return;
    }
    setValidationError("");
    setDraft(result.artifact);
    setSelected(0);
    setNotice(`Imported “${result.artifact.title}” into this browser.`);
  };
  const importFile = (f?: File) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => importValue(String(r.result));
    r.onerror = () =>
      setValidationError(
        "The file could not be read. Your current draft was kept.",
      );
    r.readAsText(f);
  };
  const b = draft.blocks[selected];
  return (
    <main className="author">
      <header className="toolbar author-toolbar">
        <button className="plain" onClick={back}>
          ← Ideas
        </button>
        <strong>Showmob studio</strong>
        <span className="draft-pill">Local draft</span>
        <span className="save-state" aria-live="polite">
          {notice}
        </span>
        <button className="tool-button" onClick={exportJson}>
          Export JSON
        </button>
      </header>
      <section className="studio-truth" aria-label="How publishing works">
        <strong>Studio is local today.</strong> Your draft stays in this
        browser. Export JSON, then add it to a reviewable pull request to
        publish it. Supabase persistence is on the roadmap, not connected here.
      </section>
      {validationError && (
        <p className="validation-error" role="alert">
          {validationError}
        </p>
      )}
      <nav className="studio-tabs" aria-label="Studio view">
        {(["build", "preview", "json"] as const).map((x) => (
          <button key={x} aria-pressed={tab === x} onClick={() => setTab(x)}>
            {x === "build"
              ? "Build"
              : x === "preview"
                ? "Full preview"
                : "Import / JSON"}
          </button>
        ))}
      </nav>
      {tab === "build" && (
        <div className="studio">
          <aside className="outline">
            <span className="eyebrow">Page outline</span>
            <label>
              Page pattern
              <select
                onChange={(e) => applyTemplate(Number(e.target.value))}
                defaultValue=""
              >
                <option value="" disabled>
                  Choose a starting pattern
                </option>
                {templates.map((t, i) => (
                  <option value={i} key={t.name}>
                    {t.name} - {t.detail}
                  </option>
                ))}
              </select>
            </label>
            <div className="block-list">
              {draft.blocks.map((x, i) => (
                <button
                  key={x.id}
                  aria-pressed={selected === i}
                  onClick={() => setSelected(i)}
                >
                  <b>{String(i + 1).padStart(2, "0")}</b>
                  <span>
                    {x.type}
                    <small>{blockName(x)}</small>
                  </span>
                </button>
              ))}
            </div>
            <label>
              Add a block
              <select
                defaultValue=""
                onChange={(e) => {
                  add(e.target.value);
                  e.target.value = "";
                }}
              >
                <option value="" disabled>
                  Choose a block
                </option>
                <option value="text">Text</option>
                <option value="slideshow">Slideshow</option>
                <option value="compact-table">Compact table</option>
                <option value="diagram">Diagram / flow</option>
                <option value="note-callout">Note callout</option>
                <option value="steps">Steps</option>
                <option value="quote">Quote</option>
                <option value="divider">Divider</option>
                <option value="cta-band">Closing action</option>
              </select>
            </label>
          </aside>
          <section className="editor">
            <div className="editor-heading">
              <div>
                <span className="eyebrow">
                  Block {selected + 1} of {draft.blocks.length}
                </span>
                <h2>{b.type}</h2>
              </div>
              <div className="editor-actions">
                <button
                  onClick={() => move(selected, -1)}
                  disabled={selected === 0}
                >
                  ↑ Move
                </button>
                <button
                  onClick={() => move(selected, 1)}
                  disabled={selected === draft.blocks.length - 1}
                >
                  ↓ Move
                </button>
                <button onClick={() => duplicate(selected)}>Duplicate</button>
                <button
                  className="danger"
                  onClick={() => remove(selected)}
                  disabled={draft.blocks.length === 1}
                >
                  Remove
                </button>
              </div>
            </div>
            <BlockEditor block={b} onChange={(v) => patch(selected, v)} />
          </section>
          <section className="live">
            <span className="eyebrow">Block preview</span>
            <div className="mini-shell">
              <BlockView block={b} />
            </div>
          </section>
        </div>
      )}
      {tab === "preview" && (
        <div className={`studio-preview theme-${draft.theme}`}>
          <div className="page-fields">
            <label>
              Page title
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              />
            </label>
            <label>
              Summary
              <input
                value={draft.summary}
                onChange={(e) =>
                  setDraft({ ...draft, summary: e.target.value })
                }
              />
            </label>
            <label>
              Theme
              <select
                value={draft.theme}
                onChange={(e) =>
                  setDraft({ ...draft, theme: e.target.value as ThemeId })
                }
              >
                {themes.map((t) => (
                  <option value={t.id} key={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="shell draft-shell">
            {draft.blocks.map((x) => (
              <BlockView block={x} key={x.id} />
            ))}
          </div>
        </div>
      )}
      {tab === "json" && (
        <div className="json-workspace">
          <section>
            <span className="eyebrow">Portable artifact</span>
            <h2>Copy, inspect or download</h2>
            <p>
              The export is plain schemaVersion 1 JSON. It contains the page
              content, theme and status, with no editor code or browser data.
            </p>
            <pre>{JSON.stringify(draft, null, 2)}</pre>
            <button className="file-button" onClick={exportJson}>
              Download JSON
            </button>
          </section>
          <section>
            <span className="eyebrow">Import safely</span>
            <h2>Bring a draft back</h2>
            <p>
              Import replaces the current browser-local draft after validating
              every block. An invalid import leaves your current draft intact.
              Export first if you want a backup.
            </p>
            <textarea
              rows={14}
              value={io}
              onChange={(e) => setIo(e.target.value)}
              placeholder="Paste a Showmob artifact here"
            />
            <div className="import-actions">
              <button className="file-button" onClick={() => importValue(io)}>
                Import pasted JSON
              </button>
              <button
                className="file-button"
                data-variant="secondary"
                onClick={() => fileRef.current?.click()}
              >
                Choose .json file
              </button>
              <input
                hidden
                ref={fileRef}
                type="file"
                accept="application/json,.json"
                onChange={(e) => importFile(e.target.files?.[0])}
              />
            </div>
            <hr />
            <button className="reset-button" onClick={reset}>
              Reset browser-local draft
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
function blockName(b: Block) {
  if ("heading" in b) return b.heading;
  if ("title" in b) return b.title;
  if (b.type === "quote") return b.quote;
  if (b.type === "divider") return b.label || "Divider";
  return b.type;
}
function BlockEditor({
  block,
  onChange,
}: {
  block: Block;
  onChange: (b: Block) => void;
}) {
  const field = (key: string, label: string, long = false) => {
    const value = String(
      (block as unknown as Record<string, unknown>)[key] ?? "",
    );
    return (
      <label>
        {label}
        {long ? (
          <textarea
            rows={5}
            value={value}
            onChange={(e) =>
              onChange({ ...block, [key]: e.target.value } as Block)
            }
          />
        ) : (
          <input
            value={value}
            onChange={(e) =>
              onChange({ ...block, [key]: e.target.value } as Block)
            }
          />
        )}
      </label>
    );
  };
  if (block.type === "hero")
    return (
      <>
        {field("eyebrow", "Eyebrow")}
        {field("title", "Title")}
        {field("body", "Body", true)}
      </>
    );
  if (block.type === "text" || block.type === "cta-band")
    return (
      <>
        {field("heading", "Heading")}
        {field("body", "Body", true)}
      </>
    );
  if (block.type === "note-callout")
    return (
      <>
        {field("title", "Title")}
        {field("body", "Body", true)}
      </>
    );
  if (block.type === "quote")
    return (
      <>
        {field("quote", "Quote", true)}
        {field("attribution", "Attribution")}
      </>
    );
  if (block.type === "divider") return field("label", "Divider label");
  if (block.type === "steps")
    return (
      <>
        <label>
          Heading
          <input
            value={block.heading}
            onChange={(e) => onChange({ ...block, heading: e.target.value })}
          />
        </label>
        <label>
          Steps, one per line
          <textarea
            rows={7}
            value={block.items.join("\n")}
            onChange={(e) =>
              onChange({ ...block, items: e.target.value.split("\n") })
            }
          />
        </label>
      </>
    );
  return (
    <Callout title="Preview-only block" tone="note">
      This richer block keeps its structured JSON. Duplicate, move or remove it
      here; use Import / JSON for precise edits.
    </Callout>
  );
}
