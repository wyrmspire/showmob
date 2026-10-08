import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { freshProgress } from '../app/src/bioQuest.ts';
import { localAnswerGrader, rules, wordCount } from '../app/src/modules/bio-quest/grader.ts';
import { profileSource, conversationSource, questBoardSource, useCurrentUser } from '../app/src/modules/bio-quest/sources.ts';
import { validateArtifact } from '../app/src/validation.ts';
const artifact = JSON.parse(readFileSync(new URL('../app/src/content/cuff-craft.json', import.meta.url)));
const profiles = profileSource.getProfiles();
test('Cuff Craft is a valid preview with typed fictional mocks', () => {
 assert.equal(validateArtifact(artifact).ok,true);assert.equal(artifact.status,'preview');
 assert.equal(profiles.length,3);assert.equal(new Set(profiles.map(p=>p.id)).size,3);
 for(const p of profiles) {assert.ok(p.quest.slotsTotal>p.quest.slotsTaken);assert.equal(p.followUps.length,2);assert.ok(p.quest.giverRules);}
 assert.equal(useCurrentUser().isGuest,true);
});
const passes = [
 'I would take us to the little museum by the river, then buy two hot chocolates and find the weirdest postcard in the gift shop. I love small places with big stories, and would ask you which object you would take home.',
 'I tried baking bread last winter. First I forgot to measure the water, and the dough stuck to every surface in the kitchen. Then I wrote the amounts on a card and tested a smaller loaf. After 3 attempts I finally made something my neighbor wanted to eat.',
 'I chose a ticket, a bent key, and a cup for my museum. The ticket is from my first solo trip, the key belongs to the bike shed I helped repair, and the cup reminds me of slow mornings with my grandmother. Together they tell a story about leaving and returning.'
];
const failures = ['hey', "you're cute lol "+passes[0], profiles[0].quest.prompt.repeat(5), 'bike then I would '.repeat(20), 'Something that is nice and interesting and wonderful is always such a very important way for people to have meaningful experiences in their lives without needing anything in particular to happen in any way that matters for anyone at all.'];
passes.forEach((sample,i)=>test(`grader accepts specific example ${i+1}`,()=>assert.equal(localAnswerGrader.grade(sample,profiles[i].quest).pass,true)));
failures.forEach((sample,i)=>test(`grader rejects low-effort example ${i+1} with feedback`,()=> {const r=localAnswerGrader.grade(sample,profiles[0].quest);assert.equal(r.pass,false);assert.ok(r.feedback.length);}));
test('grader handles empty input and character limit',()=> {assert.equal(wordCount(' \n '),0);assert.equal(localAnswerGrader.grade('x'.repeat(rules.maxLength+1),profiles[0].quest).pass,false);});
test('profile set is required and unknown sets are rejected',()=> {const copy=structuredClone(artifact);copy.blocks.find(b=>b.type==='bio-quest').profileSet='unknown';assert.equal(validateArtifact(copy).ok,false);});
test('conversation adapter supplies two follow-ups, never contacts a real user',()=> {
 assert.equal(conversationSource.getThread('rowan')[0].text,profiles[0].firstReply);
 assert.equal(conversationSource.send({profileId:'rowan',text:'hello',turn:0}).length,2);
 assert.equal(conversationSource.send({profileId:'rowan',text:'hello',turn:1}).length,2);
 assert.equal(conversationSource.send({profileId:'rowan',text:'hello',turn:2}).length,1);
 assert.ok(questBoardSource.getQuests().every(q=>q.status==='coming_soon'));
});
test('state is independent and uses memory only',()=> {
 const a=freshProgress(),b=freshProgress();a.messages.push({author:'guest',text:'hello'});assert.equal(b.messages.length,0);
 const source=readFileSync(new URL('../app/src/components/BioQuest.tsx',import.meta.url),'utf8');assert.doesNotMatch(source,/localStorage|sessionStorage|fetch\(|supabase|dangerouslySetInnerHTML/);
});
