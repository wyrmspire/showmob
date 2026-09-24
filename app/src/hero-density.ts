import type { Block } from "./schema.ts";

export type HeroDensity = "micro" | "short" | "full";

// The hero scales to the page it opens. A 3-block answer card should not
// open with the same full-screen title slide as a 20-block course part:
// on a phone the grand hero alone filled the first screen, so short pages
// read as title, whitespace, scroll. Density is measured in blocks, the
// same unit an author composes with, and the grand default is untouched.
export function heroDensity(blocks: Block[]): HeroDensity {
  if (blocks.length <= 4) return "micro";
  if (blocks.length <= 8) return "short";
  return "full";
}

export function heroDensityClass(blocks: Block[]): string {
  const density = heroDensity(blocks);
  return density === "full" ? "" : ` hero-${density}`;
}
