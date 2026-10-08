import rules from './effortRules.json' with { type: 'json' };
import type { AnswerGrader } from './contracts.ts';
export { rules };
const words = (text: string): string[] => text.toLowerCase().match(/[\p{L}\p{N}]+(?:['’][\p{L}]+)?/gu) ?? [];
export const wordCount = (text: string): number => words(text).length;
export const localAnswerGrader: AnswerGrader = {
  grade(answer, quest) {
    const tokens = words(answer);
    const normalized = tokens.join(' ').replaceAll('’', "'");
    const promptWords = new Set(words(quest.prompt).filter(w => w.length > 3));
    const meaningful = tokens.filter(w => w.length > 3);
    const feedback: string[] = [];
    if (tokens.length < rules.minWords) feedback.push(rules.feedback.short);
    if (answer.length > rules.maxLength) feedback.push(rules.feedback.long);
    if (rules.fillerPhrases.some(phrase => (` ${normalized} `).includes(` ${phrase} `))) feedback.push(rules.feedback.filler);
    const overlap = meaningful.length ? meaningful.filter(w => promptWords.has(w)).length / meaningful.length : 1;
    if (overlap >= rules.maxPromptOverlap || (tokens.length > 0 && new Set(tokens).size / tokens.length < rules.minUniqueRatio)) feedback.push(rules.feedback.repetition);
    const signals = [
      tokens.some(w => rules.concreteWords.includes(w)),
      tokens.some(w => /\d/.test(w)),
      tokens.some(w => rules.sequenceWords.includes(w)),
      tokens.includes('i') && tokens.some(w => rules.actionWords.includes(w)),
    ].filter(Boolean).length;
    if (signals < rules.minSignalGroups) feedback.push(`${rules.feedback.specificity} ${quest.hint}`);
    return { pass: feedback.length === 0, feedback: feedback.length ? feedback : [rules.feedback.success] };
  },
};
