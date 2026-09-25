import React, { useEffect, useState } from "react";
import { readerSeriesList, seriesMeta, viewableEntries } from "./catalog";
import { ArtifactLink } from "./components/ArtifactLink";
import { setUnlistedRobots } from "./share-meta";
import {
  PasscodeGate,
  clearPasscode,
  loadPasscode,
  savePasscode,
  verifyPasscode,
} from "./gate";
import type { Artifact } from "./schema";

/**
 * Passcode-gated index at /everything: every published and preview page,
 * series kept together. Linked from Home as a real section, but it asks for
 * the same grader passcode as /grading before it opens. Still no share page
 * and noindex. Drafts and archived pages never appear here, even in local
 * author builds.
 */
const shown = (entry: Artifact) =>
  entry.status === "published" || entry.status === "preview";

function StatusChip({ entry }: { entry: Artifact }) {
  if (entry.status === "published") return null;
  return (
    <span className={`status-chip status-${entry.status}`}>{entry.status}</span>
  );
}

export function Everything({
  open,
  home,
}: {
  open: (s: string) => void;
  home: () => void;
}) {
  useEffect(() => {
    document.title = "Everything · Showmob";
    setUnlistedRobots(true);
    return () => {
      document.title = "Showmob";
      setUnlistedRobots(false);
    };
  }, []);
  const [passcode, setPasscode] = useState<string | null>(() => {
    const saved = loadPasscode();
    return saved ? saved : null;
  });
  const [verified, setVerified] = useState(false);
  const [gateError, setGateError] = useState("");

  useEffect(() => {
    if (!passcode || verified) return;
    let cancelled = false;
    verifyPasscode(passcode).then((result) => {
      if (cancelled) return;
      if (result === "ok") {
        savePasscode(passcode);
        setVerified(true);
        setGateError("");
      } else if (result === "bad") {
        clearPasscode();
        setPasscode(null);
        setGateError("That passcode didn’t work.");
      } else {
        setGateError("Couldn’t reach the grading API. Try again.");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [passcode, verified]);

  const unlock = (code: string) => {
    setGateError("");
    setVerified(false);
    setPasscode(code);
  };

  if (!verified) {
    return (
      <main className="artifact theme-paper">
        <header className="toolbar">
          <button onClick={home} className="plain">
            ← Ideas
          </button>
        </header>
        <div className="shell">
          <section className="block">
            <h1>Everything</h1>
            <p>
              The full index — every published page plus unlisted previews —
              asks for the same grader passcode as the grading test center.
            </p>
            <PasscodeGate onSubmit={unlock} error={gateError} />
          </section>
        </div>
      </main>
    );
  }
  const series = readerSeriesList
    .map((group) => ({ ...group, parts: group.parts.filter(shown) }))
    .filter((group) => group.parts.length > 0);
  const standalone = viewableEntries
    .filter((entry) => shown(entry) && !entry.series)
    .sort((a, b) => a.title.localeCompare(b.title));
  const total = viewableEntries.filter(shown).length;
  const previews = viewableEntries.filter((e) => e.status === "preview").length;
  return (
    <main className="artifact theme-paper">
      <header className="toolbar">
        <button onClick={home} className="plain">
          ← Ideas
        </button>
      </header>
      <div className="shell">
        <section className="block">
          <h1>Everything</h1>
          <p>
            {total} pages: published plus {previews} unlisted previews. This
            index is linked from the home page but isn't indexed by search
            engines. Drafts don't appear.
          </p>
        </section>
        {series.map((group) => (
          <section className="block everything-group" key={group.id}>
            <span className="eyebrow">
              {seriesMeta[group.id]?.kicker ?? "Series"}
            </span>
            <h2>{group.title}</h2>
            <ol>
              {group.parts.map((part) => (
                <li key={part.slug}>
                  <ArtifactLink slug={part.slug} open={open}>
                    {part.title}
                  </ArtifactLink>{" "}
                  <StatusChip entry={part} />
                </li>
              ))}
            </ol>
          </section>
        ))}
        {standalone.length > 0 && (
          <section className="block everything-group">
            <span className="eyebrow">Standalone</span>
            <h2>Single pages</h2>
            <ul>
              {standalone.map((entry) => (
                <li key={entry.slug}>
                  <ArtifactLink slug={entry.slug} open={open}>
                    {entry.title}
                  </ArtifactLink>{" "}
                  <StatusChip entry={entry} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
