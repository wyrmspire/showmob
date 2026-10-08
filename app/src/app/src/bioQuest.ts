// A mechanical participation check, not a quality, identity, or AI detector.
export const MIN_QUEST_WORDS = 30;
export const MAX_QUEST_LENGTH = 2400;
export function wordCount(text: string): number {
  return text.trim().split(/\s+/u).filter(Boolean).length;
}
export function canOffer(text: string): boolean {
  return text.length <= MAX_QUEST_LENGTH && wordCount(text) >= MIN_QUEST_WORDS;
}
export type QuestProgress = {
  answer: string;
  stage: 'quest' | 'review' | 'conversation';
  messages: string[];
};
export const freshProgress = (): QuestProgress => ({ answer: '', stage: 'quest', messages: [] });
