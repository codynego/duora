export type ExperienceTemplate =
  // Talk Templates
  | 'open_talk'
  | 'guided_journey'
  | 'debate'
  | 'quick_takes'
  // Play Templates
  | 'most_likely_to'
  | 'truth_or_dare'
  | 'guess_my_answer'
  | 'word_battle'
  | 'build_a_story'
  // Together Templates (2 People / Invite-Only)
  | 'plan_together'
  | 'shared_challenges'
  | 'date_night';

export type ReactionKind = 'heart' | 'support' | 'laugh' | 'cheer';

export interface RoomParticipant {
  id: string;
  name: string;
  /** Stable account label for resolving older display-name-based game state. */
  accountName?: string;
  initial: string;
  color: string;
  isHost?: boolean;
  isYou?: boolean;
  isSpeaking?: boolean;
  statusLabel?: string;
  hasResponded?: boolean;
  currentStance?: 'agree' | 'disagree' | 'depends' | null;
  score?: number;
}

export interface ChatMessage {
  id: string;
  author: string;
  body: string;
  timestamp?: number;
}

export interface RoomEvent {
  event: string;
  payload?: Record<string, unknown>;
  user_id?: number;
}

export interface BaseStageProps {
  roomId?: string;
  gameState?: Record<string, unknown>;
  onGameStateChange?: (state: Record<string, unknown>) => void;
  roomName: string;
  audience?: 'adults' | 'all';
  isHost: boolean;
  participants: RoomParticipant[];
  onSendMessage: (text: string) => void;
  onSendReaction: (kind: ReactionKind) => void;
  onPromptChat?: (promptText: string) => void;
  onAdvanceActivity?: (action: string, payload?: unknown) => void;
}

export function currentPlayerId(participants: RoomParticipant[]) {
  return participants.find((person) => person.isYou)?.id ?? 'you';
}
