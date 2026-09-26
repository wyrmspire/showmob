import React, { useEffect, useMemo, useState } from "react";
import { allEntries, viewableEntries } from "./catalog";
import { ArtifactView } from "./ArtifactView";
import { Home } from "./Home";
import { Studio } from "./Studio";
import { Everything } from "./Everything";
import { Grading } from "./Grading";
import {
  notePop,
  screenFromLocation,
  scrollForNav,
  writeScreen,
} from "./routing";
import { isReservedSlug } from "./screen";
import "./style.css";

export function App() {
  const [screen, setScreen] = useState(screenFromLocation);
  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const targetId =
        typeof event.state?.navId === "number" ? event.state.navId : -1;
      // Leaving this entry: keep its scroll so a later return lands right.
      // (history.state already points at the target here, so the leaving
      // entry is the one the app tracked by hand.)
      notePop(targetId);
      setScreen(screenFromLocation());
      // Restore after React has committed the previous screen and the
      // document has its real height again.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          const y = scrollForNav(targetId);
          globalThis.window?.scrollTo(0, y ?? 0);
        }),
      );
    };
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
    // A fresh push starts at the top, like a real page load; pops restore.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => globalThis.window?.scrollTo(0, 0)),
    );
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
