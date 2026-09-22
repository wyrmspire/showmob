import React, { useEffect, useMemo, useState } from "react";
import { entries } from "./catalog";
import { ArtifactView } from "./ArtifactView";
import { Home } from "./Home";
import { Studio } from "./Studio";
import { screenFromLocation, writeScreen } from "./routing";
import "./style.css";

export function App() {
  const [screen, setScreen] = useState(screenFromLocation);
  useEffect(() => {
    const onPopState = () => setScreen(screenFromLocation());
    globalThis.window?.addEventListener("popstate", onPopState);
    return () => globalThis.window?.removeEventListener("popstate", onPopState);
  }, []);
  const entry = useMemo(() => entries.find((e) => e.slug === screen), [screen]);
  const go = (next: string) => {
    setScreen(next);
    writeScreen(next);
  };
  const open = (s: string) => go(s);
  const home = () => go("home");
  return entry ? (
    <ArtifactView key={entry.slug} entry={entry} home={home} open={open} />
  ) : screen === "author" ? (
    <Studio back={home} />
  ) : (
    <Home open={open} author={() => go("author")} />
  );
}
