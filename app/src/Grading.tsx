import React, { useEffect, useMemo, useRef, useState } from "react";
import { allEntries } from "./catalog";
import { BlockView } from "./components/BlockView";
import { heroDensityClass } from "./hero-density";
import { setUnlistedRobots } from "./share-meta";
import type { Artifact } from "./schema";

/**
 * Grading night test center at /grading (docs/grading-night.md).
 *
 * Unlisted like /everything: no Home link, no share page, noindex, and the
 * grades are never public-facing. Subjects come from
 * public.showmob_gn_subjects and grades write through the
 * showmob_gn_record_grade service-role function — both via /api/gn, the only
 * key holder. The browser never sees a Supabase key and never touches the
 * tables directly; RLS denies everything else.
 *
 * The grader reads like a reader, so generator names and render axes stay
 * hidden here and the panel sits after the page, out of the way.
 */

type Subject = {
  id: string;
  title: string;
  bucket: number;
  density: string | null;
  interaction: string | null;
  shape: string | null;
  register: string | null;
  lifetime: string | null;
  generator: string | null;
  axis_note: string | null;
  ab_pair: number | null;
  status: string;
  artifact_slug: string | null;
};

type GradeRow = {
  id: string;
  subject_id: string;
  artifact_slug: string | null;
  scores: Record<string, unknown>;
  graded_at: string;
};

const BUCKETS: Record<number, string> = {
  1: "Mundane everyday restraint tests",
  2: "Plans & projects",
  3: "Courses & learning",
  4: "Worksheets & forms",
  5: "Day organizers & personal ops",
  6: "Time & history",
  7: "Uncertain & incomplete",
  8: "Complex worlds",
  9: "Playful & strange",
  10: "Pitch & persuade",
  11: "Living & operational",
  12: "Beautiful failures",
};

const kebab = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const bySlug = new Map(allEntries.map((entry) => [entry.slug, entry]));

/** The built page for a subject, once a generator has shipped it to the repo. */
function artifactForSubject(subject: Subject): Artifact | undefined {
  if (subject.artifact_slug) {
    const hit = bySlug.get(subject.artifact_slug);
    if (hit) return hit;
  }
  return bySlug.get(`gn-${kebab(subject.title)}`);
}

type WidgetEvent = { t: number; tag: string; block: string | null };
type BehaviorDraft = { start: number; maxDepth: number; events: WidgetEvent[] };

type Panel = {
  rating: string;
  moreLess: string;
  density: string;
  content: string;
  representation: string;
  interaction: string;
  scan: string;
  wouldSend: string;
  widgetNotes: string;
  missing: string;
  unneeded: string;
  suggestion: string;
  abChoice: string;
};

const emptyPanel = (): Panel => ({
  rating: "",
  moreLess: "",
  density: "",
  content: "",
  representation: "",
  interaction: "",
  scan: "",
  wouldSend: "",
  widgetNotes: "",
  missing: "",
  unneeded: "",
  suggestion: "",
  abChoice: "",
});

function ScoreSelect({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="gn-field">
      <span>
        {label}
        {required ? " *" : ""}
      </span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">—</option>
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  );
}

function ChoiceRow({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <fieldset className="gn-choice">
      <legend>{label}</legend>
      <div>
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            aria-pressed={value === option.value}
            onClick={() => onChange(value === option.value ? "" : option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

const PASSCODE_KEY = "showmob-grading-passcode";

function storedPasscode(): string {
  try {
    return localStorage.getItem(PASSCODE_KEY) ?? "";
  } catch {
    return "";
  }
}

function PasscodeGate({ onSubmit, error }: { onSubmit: (code: string) => void; error: string }) {
  const [value, setValue] = useState("");
  return (
    <form
      className="gn-gate"
      onSubmit={(event) => {
        event.preventDefault();
        if (value.trim()) onSubmit(value.trim());
      }}
    >
      <label>
        Grader passcode
        <input
          type="password"
          autoComplete="current-password"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoFocus
        />
      </label>
      <button type="submit">Unlock</button>
      {error && <p className="gn-error">{error}</p>}
      <p>
        <small>Asked once; this browser remembers it.</small>
      </p>
    </form>
  );
}

export function Grading({
  home,
  everything,
}: {
  home: () => void;
  everything: () => void;
}) {
  const [subjects, setSubjects] = useState<Subject[] | null>(null);
  const [grades, setGrades] = useState<GradeRow[]>([]);
  const [loadError, setLoadError] = useState("");
  const [openId, setOpenId] = useState<string | null>(null);
  const [compare, setCompare] = useState(false);
  const [panel, setPanel] = useState<Panel>(emptyPanel());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [justSaved, setJustSaved] = useState(false);
  const behaviorRef = useRef<BehaviorDraft>({ start: 0, maxDepth: 0, events: [] });
  const [passcode, setPasscode] = useState<string>(() => storedPasscode());
  const [gateError, setGateError] = useState("");

  const unlock = (code: string) => {
    try {
      localStorage.setItem(PASSCODE_KEY, code);
    } catch {
      // Private mode: keep it for this session only.
    }
    setGateError("");
    setLoadError("");
    setPasscode(code);
  };

  const lock = (message: string, keepSubjects = false) => {
    try {
      localStorage.removeItem(PASSCODE_KEY);
    } catch {
      // nothing stored
    }
    if (!keepSubjects) setSubjects(null);
    setGateError(message);
    setPasscode("");
  };

  useEffect(() => {
    document.title = "Grading · Showmob";
    setUnlistedRobots(true);
    return () => {
      document.title = "Showmob";
      setUnlistedRobots(false);
    };
  }, []);

  useEffect(() => {
    if (!passcode) return;
    (async () => {
      try {
        const res = await fetch("/api/gn", {
          cache: "no-store",
          headers: { "x-grading-passcode": passcode },
        });
        if (res.status === 401) {
          lock("That passcode didn’t work.");
          return;
        }
        if (!res.ok) throw new Error(`grading API answered ${res.status}`);
        const data = (await res.json()) as { subjects: Subject[]; grades: GradeRow[] };
        setSubjects(data.subjects);
        setGrades(data.grades);
      } catch (err) {
        setLoadError((err as Error).message);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passcode]);

  const open = subjects?.find((s) => s.id === openId);
  const openArtifact = open ? artifactForSubject(open) : undefined;
  const twin =
    open?.ab_pair != null
      ? subjects?.find((s) => s.ab_pair === open.ab_pair && s.id !== open.id)
      : undefined;
  const twinArtifact = twin ? artifactForSubject(twin) : undefined;

  // Blind A/B: the two renders swap sides at random each viewing; the
  // recorded pick is a subject id, never a side.
  const pairOrder = useMemo(() => {
    if (!open || !twin) return [];
    return Math.random() < 0.5 ? [open, twin] : [twin, open];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId, compare]);

  // Behavior capture: time on page, deepest scroll, widget touches.
  useEffect(() => {
    if (!openId) return;
    behaviorRef.current = { start: Date.now(), maxDepth: 0, events: [] };
    const onScroll = () => {
      const doc = document.documentElement;
      const depth = Math.round(
        ((window.scrollY + window.innerHeight) / Math.max(doc.scrollHeight, 1)) * 100,
      );
      const draft = behaviorRef.current;
      draft.maxDepth = Math.max(draft.maxDepth, Math.min(100, depth));
    };
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      const draft = behaviorRef.current;
      if (draft.events.length >= 200) return;
      const framed = target.closest?.(".block-frame [id], .block-frame");
      draft.events.push({
        t: Math.round((Date.now() - draft.start) / 1000),
        tag: target.tagName.toLowerCase(),
        block: framed?.id || null,
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick, true);
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick, true);
    };
  }, [openId]);

  const gradesBySubject = useMemo(() => {
    const map = new Map<string, GradeRow[]>();
    for (const grade of grades) {
      const list = map.get(grade.subject_id) ?? [];
      list.push(grade);
      map.set(grade.subject_id, list);
    }
    return map;
  }, [grades]);

  const gradedIds = useMemo(() => new Set(grades.map((g) => g.subject_id)), [grades]);

  const openSubject = (id: string) => {
    setOpenId(id);
    setCompare(false);
    setPanel(emptyPanel());
    setSaveError("");
    setJustSaved(false);
    globalThis.window?.scrollTo(0, 0);
  };

  const closeSubject = () => {
    setOpenId(null);
    setCompare(false);
  };

  const set = (key: keyof Panel) => (value: string) =>
    setPanel((p) => ({ ...p, [key]: value }));

  const nextUngraded = useMemo(() => {
    if (!subjects || !openId) return undefined;
    const built = subjects.filter((s) => artifactForSubject(s));
    const index = built.findIndex((s) => s.id === openId);
    const after = built.slice(index + 1).concat(built.slice(0, index + 1));
    return after.find((s) => !gradedIds.has(s.id));
  }, [subjects, openId, gradedIds]);

  const submit = async () => {
    if (!open || !openArtifact) return;
    const rating = Number(panel.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 10) {
      setSaveError("Pick a 1-10 rating first.");
      return;
    }
    if (!panel.suggestion.trim()) {
      setSaveError("The “what would’ve been better here” note is required — it’s half the signal.");
      return;
    }
    const scores: Record<string, unknown> = { one_to_ten: rating };
    if (panel.moreLess) scores.more_less_likely = panel.moreLess;
    if (panel.density) scores.density_judgment = panel.density;
    for (const key of ["content", "representation", "interaction"] as const) {
      if (panel[key]) scores[key] = Number(panel[key]);
    }
    if (panel.scan) scores.scan = panel.scan;
    if (panel.wouldSend) scores.would_send = panel.wouldSend === "yes";
    if (panel.widgetNotes.trim()) scores.widget_notes = panel.widgetNotes.trim();
    if (panel.missing.trim()) scores.missing = panel.missing.trim();
    if (panel.unneeded.trim()) scores.unneeded = panel.unneeded.trim();
    const draft = behaviorRef.current;
    const behavior = {
      time_on_page: Math.round((Date.now() - draft.start) / 1000),
      scroll_depth: draft.maxDepth,
      finished: draft.maxDepth >= 95,
      widget_events: draft.events,
      ab_choice: panel.abChoice || null,
    };
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/gn", {
        method: "POST",
        headers: { "content-type": "application/json", "x-grading-passcode": passcode },
        body: JSON.stringify({
          subject_id: open.id,
          artifact_slug: openArtifact.slug,
          scores,
          suggestion: panel.suggestion.trim(),
          behavior,
        }),
      });
      if (res.status === 401) {
        // Keep the open page and the panel draft; re-enter, then save again.
        lock("Passcode rejected - enter it again, then save.", true);
        return;
      }
      const data = (await res.json()) as { grade?: GradeRow; error?: string };
      if (!res.ok || !data.grade) throw new Error(data.error || `save failed (${res.status})`);
      setGrades((current) => [data.grade as GradeRow, ...current]);
      setJustSaved(true);
    } catch (err) {
      setSaveError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const renderBlocks = (artifact: Artifact) => (
    <div className={`shell${heroDensityClass(artifact.blocks)}`}>
      {artifact.blocks.map((block) => (
        <div className="block-frame" key={block.id}>
          <BlockView block={block} />
        </div>
      ))}
    </div>
  );

  const gradedCount = subjects ? gradedIds.size : 0;

  return (
    <main className="artifact theme-paper gn-center">
      <header className="toolbar">
        {open ? (
          <button onClick={closeSubject} className="plain">
            ← All subjects
          </button>
        ) : (
          <button onClick={home} className="plain">
            ← Ideas
          </button>
        )}
        <button onClick={everything} className="plain">
          Everything →
        </button>
        <div className="artifact-meta">
          <strong>Grading night</strong>
          <small>
            {subjects ? `${gradedCount} of ${subjects.length} graded` : "loading…"}
          </small>
        </div>
      </header>

      {open && !passcode && (
        <div className="shell">
          <section className="block">
            <PasscodeGate onSubmit={unlock} error={gateError} />
          </section>
        </div>
      )}

      {!open && (
        <div className="shell">
          <section className="block">
            <h1>Test center</h1>
            <p>
              Read each page like a reader, then grade it. This surface is
              unlisted and unindexed; grades go to the training table and
              never appear on the public site. Every published and preview
              page is listed on the equally unlisted{" "}
              <button onClick={everything} className="plain">
                Everything index
              </button>
              .
            </p>
            {loadError && (
              <p className="gn-error">
                Couldn’t load the subjects: {loadError}. The grading API may
                not be configured yet.
              </p>
            )}
            {!passcode && <PasscodeGate onSubmit={unlock} error={gateError} />}
            {passcode && !subjects && !loadError && <p>Loading subjects…</p>}
          </section>
          {subjects &&
            Object.entries(BUCKETS).map(([bucket, label]) => {
              const rows = subjects.filter((s) => s.bucket === Number(bucket));
              if (!rows.length) return null;
              return (
                <section className="block gn-bucket" key={bucket}>
                  <h2>
                    {bucket}. {label}
                  </h2>
                  <ul className="gn-list">
                    {rows.map((subject) => {
                      const artifact = artifactForSubject(subject);
                      const count = gradesBySubject.get(subject.id)?.length ?? 0;
                      return (
                        <li key={subject.id}>
                          <button
                            className="gn-row"
                            disabled={!artifact}
                            onClick={() => openSubject(subject.id)}
                          >
                            <b>{subject.id}</b>
                            <span>{subject.title}</span>
                            <small>
                              {subject.ab_pair != null && (
                                <em className="gn-chip">pair {subject.ab_pair}</em>
                              )}
                              {count > 0 && (
                                <em className="gn-chip gn-graded">
                                  graded ×{count}
                                </em>
                              )}
                              {!artifact ? (
                                <em className="gn-chip">not built</em>
                              ) : (
                                count === 0 && <em className="gn-chip gn-built">built</em>
                              )}
                            </small>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
        </div>
      )}

      {open && (
        <>
          <div className="shell">
            <section className="block">
              <h1>
                {open.id}: {open.title}
              </h1>
              <p>
                {BUCKETS[open.bucket] ?? `Bucket ${open.bucket}`}
                {twin ? " · blind pair — two renders of the same situation" : ""}
              </p>
              {twin && twinArtifact && openArtifact && (
                <button className="file-button" onClick={() => setCompare(!compare)}>
                  {compare ? "Back to single page" : "Compare the pair side by side"}
                </button>
              )}
            </section>
          </div>

          {compare && twinArtifact && openArtifact ? (
            <div className="gn-compare">
              {pairOrder.map((subject, i) => {
                const artifact = artifactForSubject(subject);
                return artifact ? (
                  <div className={`gn-pane artifact theme-${artifact.theme}`} key={subject.id}>
                    <div className="gn-pane-label">Option {i + 1}</div>
                    {renderBlocks(artifact)}
                  </div>
                ) : null;
              })}
            </div>
          ) : openArtifact ? (
            <div className={`artifact theme-${openArtifact.theme}`}>
              {renderBlocks(openArtifact)}
            </div>
          ) : (
            <div className="shell">
              <section className="block">
                <p>No built artifact for this subject yet.</p>
              </section>
            </div>
          )}

          {openArtifact && (
            <div className="shell">
              <section className="block gn-panel">
                <h2>Grade this page</h2>
                {(gradesBySubject.get(open.id) ?? []).length > 0 && (
                  <p className="gn-history">
                    Previous grades:{" "}
                    {(gradesBySubject.get(open.id) ?? [])
                      .map((g) => `${String(g.scores.one_to_ten ?? "?")}/10`)
                      .join(", ")}
                  </p>
                )}
                {justSaved ? (
                  <div className="gn-saved">
                    <p>Grade saved.</p>
                    {nextUngraded ? (
                      <button className="file-button" onClick={() => openSubject(nextUngraded.id)}>
                        Next ungraded: {nextUngraded.id}
                      </button>
                    ) : (
                      <button className="file-button" onClick={closeSubject}>
                        Back to the list
                      </button>
                    )}
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void submit();
                    }}
                  >
                    <div className="gn-grid">
                      <ScoreSelect label="Rating (1–10)" value={panel.rating} onChange={set("rating")} required />
                      <ScoreSelect label="Content" value={panel.content} onChange={set("content")} />
                      <ScoreSelect label="Representation" value={panel.representation} onChange={set("representation")} />
                      <ScoreSelect label="Interaction" value={panel.interaction} onChange={set("interaction")} />
                    </div>
                    <ChoiceRow
                      label="More pages like this?"
                      value={panel.moreLess}
                      onChange={set("moreLess")}
                      options={[
                        { value: "more", label: "More like this" },
                        { value: "neutral", label: "Neutral" },
                        { value: "less", label: "Fewer like this" },
                      ]}
                    />
                    <ChoiceRow
                      label="Density"
                      value={panel.density}
                      onChange={set("density")}
                      options={[
                        { value: "too thin", label: "Too thin" },
                        { value: "right", label: "Right" },
                        { value: "too dense", label: "Too dense" },
                      ]}
                    />
                    <ChoiceRow
                      label="First glance (scan)"
                      value={panel.scan}
                      onChange={set("scan")}
                      options={[
                        { value: "held_up", label: "Held up" },
                        { value: "looked_dumb", label: "Looked dumb" },
                      ]}
                    />
                    <ChoiceRow
                      label="Would you send this to someone?"
                      value={panel.wouldSend}
                      onChange={set("wouldSend")}
                      options={[
                        { value: "yes", label: "Yes" },
                        { value: "no", label: "No" },
                      ]}
                    />
                    {twin && (
                      <ChoiceRow
                        label={`Blind pair ${open.ab_pair}: which render wins?`}
                        value={panel.abChoice}
                        onChange={set("abChoice")}
                        options={[
                          { value: open.id, label: open.id },
                          { value: twin.id, label: twin.id },
                        ]}
                      />
                    )}
                    <label className="gn-field">
                      <span>Widgets: did you use them, did they earn their place?</span>
                      <input
                        value={panel.widgetNotes}
                        onChange={(e) => set("widgetNotes")(e.target.value)}
                        placeholder="optional"
                      />
                    </label>
                    <label className="gn-field">
                      <span>What should have existed that didn’t?</span>
                      <input
                        value={panel.missing}
                        onChange={(e) => set("missing")(e.target.value)}
                        placeholder="optional"
                      />
                    </label>
                    <label className="gn-field">
                      <span>What existed that shouldn’t have?</span>
                      <input
                        value={panel.unneeded}
                        onChange={(e) => set("unneeded")(e.target.value)}
                        placeholder="optional"
                      />
                    </label>
                    <label className="gn-field">
                      <span>What would’ve been better here *</span>
                      <textarea
                        rows={4}
                        value={panel.suggestion}
                        onChange={(e) => set("suggestion")(e.target.value)}
                      />
                    </label>
                    {saveError && <p className="gn-error">{saveError}</p>}
                    <button className="file-button" type="submit" disabled={saving}>
                      {saving ? "Saving…" : "Save grade"}
                    </button>
                  </form>
                )}
              </section>
            </div>
          )}
        </>
      )}
    </main>
  );
}
