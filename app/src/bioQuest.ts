import type { Message } from './modules/bio-quest/contracts.ts';
export type QuestProgress = { answer: string; stage: 'quest' | 'review' | 'conversation'; messages: Message[]; turns: number };
export const freshProgress = (): QuestProgress => ({answer:'',stage:'quest',messages:[],turns:0});
