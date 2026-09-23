import assert from 'node:assert/strict';
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  artifactShareUrl,
  escapeHtml,
  generateSharePages,
  injectShareMeta,
  siteBaseUrl,
} from '../scripts/generate-share-pages.mjs';
import {
  artifactPath,
  resolveScreen,
  slugFromPathname,
} from '../app/src/screen.ts';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const root = fileURLToPath(new URL('..', import.meta.url));

test('artifactHref / artifactPath share URLs use /a/{slug}', () => {
  const link = read('../app/src/components/ArtifactLink.tsx');
  assert.match(link, /artifactPath\(slug, blockId\)/);
  assert.equal(artifactPath('field-notes'), '/a/field-notes');
  assert.equal(artifactPath('field-notes', 'look'), '/a/field-notes#look');
  assert.doesNotMatch(link, /\?artifact=/);
});

test('slugFromPathname and resolveScreen prefer /a/{slug} over query', () => {
  assert.equal(slugFromPathname('/a/field-notes'), 'field-notes');
  assert.equal(slugFromPathname('/a/field-notes/'), 'field-notes');
  assert.equal(slugFromPathname('/'), null);
  assert.equal(slugFromPathname('/a/home'), null);
  assert.equal(slugFromPathname('/a/../x'), null);
  assert.equal(
    resolveScreen('legacy-slug', ['legacy-slug'], undefined, '/a/path-slug'),
    'path-slug',
  );
  assert.equal(
    resolveScreen('legacy-slug', ['legacy-slug'], undefined, '/'),
    'legacy-slug',
  );
  assert.equal(resolveScreen(null, [], 'author', '/'), 'author');
});

test('escapeHtml and injectShareMeta emit escaped OG tags', () => {
  assert.equal(escapeHtml('A & B <C> "q"'), 'A &amp; B &lt;C&gt; &quot;q&quot;');
  const html = injectShareMeta(
    '<!doctype html><html><head><meta name="description" content="home" /><title>Showmob</title>\n</head><body></body></html>',
    {
      title: 'Title & Co',
      summary: 'Sum <em>x</em>',
      url: 'https://showmob.vercel.app/a/title-co',
    },
  );
  assert.match(html, /<title>Title &amp; Co · Showmob<\/title>/);
  assert.match(html, /property="og:title" content="Title &amp; Co · Showmob"/);
  assert.match(html, /name="twitter:card" content="summary"/);
  assert.match(html, /rel="canonical" href="https:\/\/showmob\.vercel\.app\/a\/title-co"/);
  assert.match(html, /og:description" content="Sum &lt;em&gt;x&lt;\/em&gt;"/);
  assert.doesNotMatch(html, /content="home"/);
});

test('generateSharePages writes published-only share HTML into a temp dist', () => {
  const dir = mkdtempSync(join(tmpdir(), 'showmob-share-'));
  try {
    const contentDir = join(dir, 'content');
    const distDir = join(dir, 'dist');
    mkdirSync(contentDir);
    mkdirSync(distDir);
    writeFileSync(
      join(distDir, 'index.html'),
      '<!doctype html><html><head><title>Showmob</title><script src="/assets/x.js"></script></head><body><div id="root"></div></body></html>',
    );
    writeFileSync(
      join(contentDir, 'pub.json'),
      JSON.stringify({
        schemaVersion: 1,
        slug: 'tiny-proof',
        title: 'Build one tiny proof',
        summary: 'A published summary.',
        contributor: 'Test',
        status: 'published',
        theme: 'paper',
        blocks: [],
      }),
    );
    writeFileSync(
      join(contentDir, 'draft.json'),
      JSON.stringify({
        schemaVersion: 1,
        slug: 'still-draft',
        title: 'Draft',
        summary: 'Hidden.',
        contributor: 'Test',
        status: 'draft',
        theme: 'paper',
        blocks: [],
      }),
    );
    const { written, base } = generateSharePages({
      distDir,
      contentDir,
      env: { SHOWMOB_SITE_URL: 'https://example.test' },
    });
    assert.deepEqual(written, ['tiny-proof']);
    assert.equal(base, 'https://example.test');
    assert.equal(siteBaseUrl({}), 'https://showmob.vercel.app');
    assert.equal(
      artifactShareUrl('https://example.test/', 'tiny-proof'),
      'https://example.test/a/tiny-proof',
    );
    const page = readFileSync(join(distDir, 'a/tiny-proof/index.html'), 'utf8');
    const flat = readFileSync(join(distDir, 'a/tiny-proof.html'), 'utf8');
    assert.match(page, /og:title" content="Build one tiny proof · Showmob"/);
    assert.match(flat, /og:title" content="Build one tiny proof · Showmob"/);
    assert.match(page, /src="\/assets\/x\.js"/);
    assert.equal(existsSync(join(distDir, 'a/still-draft/index.html')), false);
    assert.equal(existsSync(join(distDir, 'a/still-draft.html')), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('generator script and client share-meta helper are wired', () => {
  const script = readFileSync(join(root, 'scripts/generate-share-pages.mjs'), 'utf8');
  const pkg = readFileSync(join(root, 'package.json'), 'utf8');
  const view = read('../app/src/ArtifactView.tsx');
  const routing = read('../app/src/routing.ts');
  assert.match(script, /injectShareMeta/);
  assert.match(pkg, /generate-share-pages\.mjs/);
  assert.match(view, /applyArtifactShareMeta/);
  assert.match(routing, /artifactPath/);
  assert.match(routing, /replaceState/);
  assert.match(routing, /slugFromPathname/);
});
