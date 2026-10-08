import profileData from './profiles.json' with { type: 'json' };
import boardData from './questBoard.json' with { type: 'json' };
import type { Profile, ProfileSource, ConversationSource, QuestBoardSource, BoardQuest, CurrentUser } from './contracts.ts';
import { localAnswerGrader } from './grader.ts';
const profiles: Profile[] = profileData;
const board: BoardQuest[] = boardData as BoardQuest[];
export const profileSource: ProfileSource = {
  getProfiles: () => profiles,
  getProfile: id => profiles.find(p => p.id === id),
};
export const answerGrader = localAnswerGrader;
export const conversationSource: ConversationSource = {
  getThread(profileId) {
    const profile = profileSource.getProfile(profileId);
    return profile ? [{author:'giver',text:profile.firstReply}] : [];
  },
  send({profileId,text,turn}) {
    const followUp = profileSource.getProfile(profileId)?.followUps[turn];
    return [{author:'guest',text}, ...(followUp ? [{author:'giver' as const,text:followUp}] : [])];
  },
};
export const questBoardSource: QuestBoardSource = { getQuests: () => board };
// The only identity boundary used by this module. No live auth dependency.
export function useCurrentUser(): CurrentUser { return {id:'local-guest',displayName:'You',isGuest:true}; }
