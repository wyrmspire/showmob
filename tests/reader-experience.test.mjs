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
