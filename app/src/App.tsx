import React, { useEffect, useMemo, useState } from "react";
import { allEntries, viewableEntries } from "./catalog";
import { ArtifactView } from "./ArtifactView";
import { Home } from "./Home";
import { Studio } from "./Studio";
import { Everything } from "./Everything";
import { Grading } from "./Grading";
import { screenFromLocation, writeScreen } from "./routing";
import { isReservedSlug } from "./screen";
import "./style.css";

export function App() {
  const [screen, setScreen] = useState(screenFromLocation);
  useEffect(() => {
    const onPopState = () => setScreen(screenFromLocation());
    globalThis.window?.addEventListener("popstate", onPopState);
    return () => globalThis.window?.removeEventListener("popstate", onPopState);
  }, []);
  const entry = useMemo(
    () =>
      isReservedSlug(screen)
        ? undefined
        : viewableEntries.find((e) => e.slug === screen),
    [screen],
  );
  const withheld = useMemo(() => {
    if (entry || isReservedSlug(screen)) return undefined;
    return allEntries.find((e) => e.slug === screen);
  }, [entry, screen]);
  const go = (next: string) => {
    setScreen(next);
    writeScreen(next);
  };
  const open = (s: string) => go(s);
  const home = () => go("home");
  if (entry) {
    return (
      <ArtifactView key={entry.slug} entry={entry} home={home} open={open} />
    );
  }
  if (screen === "everything") {
    return <Everything open={open} home={home} />;
  }
  if (screen === "grading") {
    return <Grading home={home} everything={() => go("everything")} />;
  }
  if (screen === "author") {
    return <Studio back={home} />;
  }
  if (withheld) {
    return (
      <main className="artifact theme-paper">
        <header className="toolbar">
          <button onClick={home} className="plain">
            ← Ideas
          </button>
        </header>
        <div className="shell">
          <section className="block">
            <h1>Not published</h1>
            <p>
              “{withheld.title}” is <strong>{withheld.status}</strong> in the
              repository and is hidden from this production catalog. The JSON
              file was not deleted.
            </p>
            <button className="file-button" onClick={home}>
              Back to ideas
            </button>
          </section>
        </div>
      </main>
    );
  }
  if (!isReservedSlug(screen)) {
    return (
      <main className="artifact theme-paper">
        <header className="toolbar">
          <button onClick={home} className="plain">
            ← Ideas
          </button>
        </header>
        <div className="shell">
          <section className="block">
            <h1>Page not found</h1>
            <p>
              No Showmob artifact uses this address. It may have been mistyped,
              moved, or never created.
            </p>
            <button className="file-button" onClick={home}>
              Back to ideas
            </button>
          </section>
        </div>
      </main>
    );
  }
  return <Home open={open} author={() => go("author")} />;
}
