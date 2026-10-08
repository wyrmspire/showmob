export type Quest = { prompt: string; giverRules: string; slotsTotal: number; slotsTaken: number; hint: string };
export type Profile = { id: string; name: string; ageRange: string; vibe: string; bio: string; tags: string[]; avatar: string; style: string; quest: Quest; firstReply: string; followUps: string[] };
export type Message = { author: 'guest' | 'giver'; text: string };
export type BoardQuest = { id: string; title: string; type: 'venue' | 'scavenger'; sponsor: string; steps: string[]; reward: string; status: 'coming_soon' };
export interface ProfileSource { getProfiles(): Profile[]; getProfile(id: string): Profile | undefined }
export interface AnswerGrader { grade(answer: string, quest: Quest): { pass: boolean; feedback: string[] } }
export interface ConversationSource { getThread(profileId: string): Message[]; send(message: { profileId: string; text: string; turn: number }): Message[] }
export interface QuestBoardSource { getQuests(location?: string): BoardQuest[] }
export type CurrentUser = { id: string; displayName: string; isGuest: true };
