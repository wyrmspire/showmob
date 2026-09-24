import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { validateArtifact } from '../app/src/validation.ts';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');

test('reader navigation keeps native links and enhanced plain-click navigation', () => {
  const link = read('../app/src/components/ArtifactLink.tsx');
  const home = read('../app/src/Home.tsx');
  assert.match(link, /<a className=\{className\} href=\{artifactHref\(slug\)\}/);
  assert.match(link, /event\.metaKey/);
  assert.match(link, /event\.ctrlKey/);
  assert.match(home, /className=\{`entry-card/);
  assert.doesNotMatch(home, /<button[^>]+onClick=\{\(\) => open\(e\.slug\)/);
});

test('Home searches the full library before shelves and avoids duplicate series cards', () => {
  const home = read('../app/src/Home.tsx');
  assert.ok(home.indexOf('className="discovery"') < home.indexOf('seriesList.map'));
  assert.match(home, /g\.parts\.filter\(\(part\) => visibleSlugs\.has\(part\.slug\)\)/);
  assert.match(home, /standalone = visible\.filter\(\(entry\) => !entry\.series\)/);
  assert.match(home, /authorToolsEnabled &&/);
  assert.match(home, /b\[1\] - a\[1\]/);
});

test('Home keeps public lead reader-facing and caps the tag wall', () => {
  const home = read('../app/src/Home.tsx');
  assert.match(home, /Read a page\. Follow a series\. Present a block\./);
  assert.doesNotMatch(home, /Author as JSON/);
  assert.doesNotMatch(home, /Add or export JSON to create the next page/);
  assert.match(home, /TAG_CAP = 10/);
  assert.match(home, /More tags/);
  assert.match(home, /Fewer tags/);
  assert.match(home, /Search or filter by tag to find the next idea/);
});

test('artifact view exposes title, section, copy-link and focus-mode recovery behavior', () => {
  const source = read('../app/src/ArtifactView.tsx');
  assert.match(source, /applyArtifactShareMeta\(entry\.title, entry\.summary, entry\.slug\)/);
  assert.match(source, /aria-label="Sections on this page"/);
  assert.match(source, /Copy link/);
  assert.match(source, /event\.key === "Escape"/);
  assert.match(source, /className="zen-exit"/);
  assert.match(source, /focusHashTarget/);
  assert.match(source, /min read/);
});

test('exercise feedback accepts author voice but has neutral renderer fallbacks', () => {
  const artifact = {
    schemaVersion: 1,
    slug: 'feedback-test',
    title: 'Feedback',
    summary: 'Checks optional feedback.',
    contributor: 'Test',
    status: 'preview',
    theme: 'paper',
    blocks: [{
      id: 'check',
      type: 'exercise',
      heading: 'Check',
      prompt: 'Choose.',
      options: ['One', 'Two'],
      answer: 1,
      explanation: 'Because two.',
      correctFeedback: 'You found it.',
      wrongFeedback: 'Try the other boundary.',
    }],
  };
  assert.equal(validateArtifact(artifact).ok, true);
  const view = read('../app/src/components/BlockView.tsx');
  assert.match(view, /block\.correctFeedback \|\| "Correct"/);
  assert.match(view, /block\.wrongFeedback \|\| "Not quite"/);
});

test('Studio themes compact previews, protects replacement actions and validates export', () => {
  const source = read('../app/src/Studio.tsx');
  assert.match(source, /mini-shell artifact theme-\$\{draft\.theme\}/);
  assert.match(source, /Undo is available/);
  assert.match(source, /Export blocked/);
  assert.match(source, />Page settings</);
});

test('slideshow supports keyboard, swipe and fullscreen controls', () => {
  const source = read('../app/src/components/BlockView.tsx');
  assert.match(source, /event\.key === "ArrowLeft"/);
  assert.match(source, /event\.key === "ArrowRight"/);
  assert.match(source, /onPointerDown/);
  assert.match(source, /requestFullscreen/);
  assert.match(source, /Exit fullscreen/);
});

test('narrow slideshow controls keep dots in a wrapped scrollable row', () => {
  const css = read('../app/src/style.css');
  assert.match(css, /\.slideshow-controls\{align-items:stretch;flex-wrap:wrap\}/);
  assert.match(css, /\.slideshow-controls>div\{order:3;flex:1 1 100%;justify-content:center;overflow-x:auto/);
  assert.doesNotMatch(css, /@media\(max-width:780px\)\{[^}]*\.slideshow-controls>div\{display:none\}/);
});

test('entrance motion tokens apply on all themes, not paper/workshop only', () => {
  const css = read('../app/src/style.css');
  const view = read('../app/src/components/BlockView.tsx');
  assert.match(css, /\.artifact,\.studio-preview\{[\s\S]*?--motion-duration:420ms/);
  assert.match(css, /--motion-distance:14px/);
  assert.match(css, /prefers-reduced-motion:reduce/);
  assert.doesNotMatch(css, /\.theme-paper,\.theme-workshop\{[\s\S]*?--motion-duration:420ms/);
  assert.doesNotMatch(view, /block-enter/);
});

test('root token spine bridges --ds-* and artifact semantics', () => {
  const css = read('../app/src/style.css');
  assert.match(css, /:root\{[\s\S]*?--text:#201e1d/);
  assert.match(css, /--muted:#635d59/);
  assert.match(css, /--accent:#146a5b/);
  assert.match(css, /--ds-ink:var\(--text\)/);
  assert.match(css, /--ds-ink-2:var\(--muted\)/);
  assert.match(css, /--ds-page:var\(--page\)/);
  assert.match(css, /--ds-hairline:var\(--hairline\)/);
  assert.match(css, /\.theme-paper\{--accent:#78553c/);
  assert.doesNotMatch(css, /@media\s*\(\s*prefers-color-scheme/);
});

test('Home/Studio chrome no longer hardcodes #635d59 or #146a5b outside the root spine', () => {
  const css = read('../app/src/style.css');
  const withoutRoot = css.replace(/:root\{[\s\S]*?\}\n/, '');
  assert.doesNotMatch(withoutRoot, /#635d59/i);
  assert.doesNotMatch(withoutRoot, /#146a5b/i);
  assert.match(css, /\.mini-features b\{color:var\(--accent\)\}/);
  assert.match(css, /\.entry-card p\{color:var\(--muted\)/);
  assert.match(css, /var\(--card-accent,var\(--accent\)\)/);
});

test('hero scales to page size so short pages do not open on a full-screen title', () => {
  const view = read('../app/src/ArtifactView.tsx');
  const grading = read('../app/src/Grading.tsx');
  const studio = read('../app/src/Studio.tsx');
  const css = read('../app/src/style.css');
  assert.match(view, /heroDensityClass\(entry\.blocks\)/);
  assert.match(grading, /heroDensityClass\(artifact\.blocks\)/);
  assert.match(studio, /heroDensityClass\(draft\.blocks\)/);
  assert.match(css, /\.hero-micro \.hero h1\{font-size:clamp\(30px,6vw,52px\)/);
  assert.match(css, /\.hero-short \.hero h1\{font-size:clamp\(36px,7\.5vw,76px\)/);
  // the grand default hero is untouched for full-length pages
  assert.match(css, /\.hero\{padding-top:clamp\(48px,10vw,120px\)\}/);
  assert.match(css, /\.hero h1\{font-family:Georgia/);
});

test('hero density tiers by block count', async () => {
  const { heroDensity, heroDensityClass } = await import('../app/src/hero-density.ts');
  const blocks = (n) => Array.from({ length: n }, (_, i) => ({ id: `b${i}`, type: 'text', heading: 'h', body: 'b' }));
  assert.equal(heroDensity(blocks(2)), 'micro');
  assert.equal(heroDensity(blocks(4)), 'micro');
  assert.equal(heroDensity(blocks(5)), 'short');
  assert.equal(heroDensity(blocks(8)), 'short');
  assert.equal(heroDensity(blocks(9)), 'full');
  assert.equal(heroDensity(blocks(23)), 'full');
  assert.equal(heroDensityClass(blocks(3)), ' hero-micro');
  assert.equal(heroDensityClass(blocks(12)), '');
});
