export type GameType = 'LOBBY' | 'CHAMELEON' | 'WAVELENGTH' | 'FAKIN_IT' | 'HOT_TAKES' | 'RECEIPT';

export type RoomPhase = 'LOBBY' | 'DEAL' | 'ACTION' | 'DISCUSSION' | 'VOTING' | 'REVEAL' | 'SCOREBOARD';

export interface PlayerStats {
  bluffsWon: number;
  correctVotes: number;
  timesFooled: number;
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  color: string;
  isHost: boolean;
  isConnected: boolean;
  isAFK: boolean; // Skipped during role dealing & vote checks so away players never block the room
  score: number;  // Arcade Tickets won
  stats: PlayerStats;
}

export interface ChameleonGameState {
  category: string;
  words: string[];
  targetWord: string;
  chameleonId: string;
  speakerOrder: string[];
  currentSpeakerIndex: number;
  votes: Record<string, string>; // voterId -> suspectPlayerId
  chameleonCaught?: boolean;
  chameleonGuess?: string | null;
  chameleonGuessSuccess?: boolean | null;
  escapeWon?: boolean;
  roundScores?: Record<string, number>;
}

export interface WavelengthGameState {
  spectrum: [string, string];
  psychicId: string;
  targetValue: number; // 10 - 90
  clue: string;
  guesses: Record<string, number>; // playerId -> 0-100
  lockedGuesses: Record<string, boolean>; // playerId -> true
  roundScores?: Record<string, number>;
}

export interface FakinItGameState {
  fakerId: string;
  taskType: 'FINGERS' | 'POINT' | 'FACE';
  realPrompt: string;
  countdownTriggered: boolean;
  countdownEndAt: number | null;
  votes: Record<string, string>; // voterId -> suspectPlayerId
  fakerCaught?: boolean;
  roundScores?: Record<string, number>;
}

export interface ReactionBadge {
  id: string;
  senderId: string;
  senderName: string;
  badge: 'SUS' | 'SPICY' | 'CAP';
  emoji: string;
  x: number; // percentage 10 - 90
  timestamp: number;
}

export interface HotTakesGameState {
  speakerId: string;
  statement: string;
  directive: 'TRUTH' | 'DEVIL';
  reactions: ReactionBadge[];
  votes: Record<string, 'TRUTH' | 'BLUFF'>;
  speakerPoints?: number;
  roundScores?: Record<string, number>;
}

export interface RoomState {
  roomCode: string;
  players: Player[];
  activeGame: GameType;
  phase: RoomPhase;
  roundNumber: number;
  timerEndAt: number | null;
  customNouns: string[]; // Inside jokes submitted by players in the Lobby
  gameState: ChameleonGameState | WavelengthGameState | FakinItGameState | HotTakesGameState | any;
}

export interface PlayerIntentPayload {
  playerId: string;
  action: 
    | 'SUBMIT_VOTE' 
    | 'LOCK_DIAL' 
    | 'ADD_CUSTOM_NOUN' 
    | 'TOGGLE_AFK' 
    | 'CHAMELEON_END_SPEAKER_TURN'
    | 'CHAMELEON_GUESS_WORD'
    | 'WAVELENGTH_SUBMIT_CLUE'
    | 'WAVELENGTH_TUNE_VALUE'
    | 'FAKIN_IT_TRIGGER_COUNTDOWN'
    | 'HOT_TAKES_SEND_REACTION'
    | 'HOST_ADVANCE_PHASE'
    | 'HOST_SET_GAME'
    | 'HOST_EXTEND_TIMER';
  data?: any;
}
