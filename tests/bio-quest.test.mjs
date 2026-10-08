import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { canOffer, freshProgress, wordCount, MAX_QUEST_LENGTH } from '../app/src/bioQuest.ts';
import { validateArtifact } from '../app/src/validation.ts';
const artifact = JSON.parse(readFileSync(new URL('../app/src/content/cuff-craft.json', import.meta.url)));
test('Cuff Craft is a valid preview artifact with fictional JSON profiles', () => {
  assert.equal(validateArtifact(artifact).ok, true);
  assert.equal(artifact.status, 'preview');
  const block = artifact.blocks.find(b => b.type === 'bio-quest');
  assert.equal(block.profiles.length, 3);
  assert.equal(new Set(block.profiles.map(p => p.key)).size, 3);
});
test('participation gate handles whitespace, boundaries, and oversized text', () => {
  assert.equal(wordCount(' \n\t '), 0);
  assert.equal(wordCount('one\n two\tthree'), 3);
  assert.equal(canOffer('word '.repeat(29)), false);
  assert.equal(canOffer('word '.repeat(30)), true);
  assert.equal(canOffer('word '.repeat(MAX_QUEST_LENGTH)), false);
  assert.equal(canOffer('x'.repeat(300)), false);
});
test('profiles reject empty and duplicate/unsafe keys', () => {
  for (const profiles of [[], [{key:'x'}, {key:'x'}], [{key:'../bad'}]]) {
    const copy = structuredClone(artifact);
    const block = copy.blocks.find(b => b.type === 'bio-quest');
    block.profiles = profiles.map(p => ({...block.profiles[0], ...p}));
    assert.equal(validateArtifact(copy).ok, false);
  }
});
test('fresh state is independent and session only', () => {
  const a = freshProgress(); const b = freshProgress();
  a.messages.push('hello');
  assert.deepEqual(b, {answer:'',stage:'quest',messages:[]});
  const source = readFileSync(new URL('../app/src/components/BioQuest.tsx', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /localStorage|sessionStorage|fetch\(|supabase|dangerouslySetInnerHTML/);
});
