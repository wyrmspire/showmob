import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

// Every theme must keep callout ink readable on its own fill. This guards the
// Night regression where note callouts drew hardcoded dark ink (#17362f) on the
// dark --accent-soft fill (#263e3a), a 1.1:1 contrast ratio.
const css = readFileSync(new URL('../app/src/style.css', import.meta.url), 'utf8');
const THEMES = ['paper', 'signal', 'workshop', 'night', 'field'];

const vars = body => Object.fromEntries(
  [...body.matchAll(/--([\w-]+):\s*([^;}]+)/g)].map(([, k, v]) => [k, v.trim()]),
);
const root = vars(css.match(/:root\{([\s\S]*?)\}/)[1]);
const themeVars = id => ({ ...root, ...vars(css.match(new RegExp(`\\.theme-${id}\\{([^}]*)\\}`))[1]) });

const resolve = (value, scope) => {
  const m = value.match(/^var\(--([\w-]+)(?:,(.*))?\)$/);
  if (!m) return value;
  return m[1] in scope ? resolve(scope[m[1]], scope) : resolve(m[2].trim(), scope);
};
const rgb = hex => {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map(c => c + c).join('') : h;
  return [0, 2, 4].map(i => parseInt(full.slice(i, i + 2), 16));
};
const lum = hex => {
  const [r, g, b] = rgb(hex).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

const rule = sel => css.match(new RegExp(`${sel.replace('.', '\\.')}\\{([^}]*)\\}`))[1];
const prop = (body, name) => body.match(new RegExp(`(?:^|;)${name}:([^;]+)`))[1].trim();

test('callout ink never hardcodes a color', () => {
  const base = rule('.file-callout');
  assert.match(prop(base, 'color'), /^var\(/);
  assert.match(prop(base, 'background'), /^var\(/);
  assert.doesNotMatch(css, /#17362f/i);
});

for (const tone of ['note', 'positive', 'warning']) {
  test(`${tone} callouts stay readable (>= 4.5:1) in every theme`, () => {
    const body = tone === 'note' ? rule('.file-callout') : rule(`.file-callout-${tone}`);
    for (const id of THEMES) {
      const scope = themeVars(id);
      const fg = resolve(prop(body, 'color'), scope);
      const bg = resolve(prop(body, 'background'), scope);
      const r = ratio(fg, bg);
      assert.ok(r >= 4.5, `${tone} callout in ${id}: ${fg} on ${bg} = ${r.toFixed(2)}:1`);
    }
  });
}

test('core reading pairs stay readable in every theme', () => {
  for (const id of THEMES) {
    const s = themeVars(id);
    const v = k => resolve(`var(--${k})`, s);
    for (const [fg, bg] of [['text', 'canvas'], ['text', 'surface'], ['muted', 'canvas'], ['muted', 'surface'], ['text', 'accent-soft']]) {
      const r = ratio(v(fg), v(bg));
      assert.ok(r >= 4.5, `${id}: --${fg} ${v(fg)} on --${bg} ${v(bg)} = ${r.toFixed(2)}:1`);
    }
  }
});
