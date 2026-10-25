import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  GameType, 
  Player, 
  PlayerIntentPayload, 
  RoomPhase, 
  RoomState,
  ChameleonGameState,
  WavelengthGameState,
  FakinItGameState,
  HotTakesGameState,
  ReactionBadge
} from '../types/game';
import promptsData from '../data/prompts.json';
import { soundFX } from '../utils/audio';
import { networkManager } from '../utils/network';

export type AppScreen = 'HOME' | 'GAME_DETAIL' | 'SETUP' | 'LOBBY' | 'PLAYING';

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

interface GameStore {
  // Navigation
  appScreen: AppScreen;
  selectedGameType: GameType | null;
  setupMode: 'CREATE' | 'JOIN';
  navigateTo: (screen: AppScreen) => void;
  selectGameForDetail: (game: GameType) => void;
  setSetupMode: (mode: 'CREATE' | 'JOIN') => void;
  goHome: () => void;

  // Identity & Client state
  localPlayer: Player;
  room: RoomState | null;
  devPerspectiveId: string | null;
  isDevSimActive: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;

  // Actions
  setSoundEnabled: (enabled: boolean) => void;
  setHapticsEnabled: (enabled: boolean) => void;
  setLocalPlayerName: (name: string) => void;
  setLocalPlayerAvatar: (avatar: string) => void;
  setLocalPlayerColor: (color: string) => void;
  
  createRoom: (hostName: string, avatar?: string, color?: string) => void;
  joinRoom: (roomCode: string, guestName: string, avatar?: string, color?: string) => void;
  leaveRoom: () => void;
  
  // Dev Mode Sandbox
  toggleDevSim: () => void;
  setDevPerspective: (playerId: string | null) => void;
  simulateBotAction: (botId: string, action: string, data?: any) => void;

  // In-Game Intents
  dispatchIntent: (action: PlayerIntentPayload['action'], data?: any) => void;
  handleIncomingIntent: (intent: PlayerIntentPayload) => void;
  syncRoomState: (state: RoomState) => void;

  // Host Controls
  startGame: (game: GameType) => void;
  advancePhase: (phase: RoomPhase) => void;
  extendTimer: (seconds?: number) => void;
  addCustomNoun: (noun: string) => void;
  toggleAFK: (playerId?: string) => void;
  cashOutReceipt: () => void;
  resetToLobby: () => void;
  calculateScores: () => void;
}

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // Navigation state
      appScreen: 'HOME' as AppScreen,
      selectedGameType: null as GameType | null,
      setupMode: 'CREATE' as 'CREATE' | 'JOIN',

      navigateTo: (screen) => set({ appScreen: screen }),

      selectGameForDetail: (game) => set({ selectedGameType: game, appScreen: 'GAME_DETAIL' }),

      setSetupMode: (mode) => set({ setupMode: mode }),

      goHome: () => {
        networkManager.leaveRoom();
        set({ appScreen: 'HOME', room: null, selectedGameType: null, devPerspectiveId: null, isDevSimActive: false });
      },

      localPlayer: {
        id: 'player-' + Math.random().toString(36).substring(2, 9),
        name: 'PLAYER 1',
        avatar: '👾',
        color: '#00F0FF',
        isHost: false,
        isConnected: true,
        isAFK: false,
        score: 0,
        stats: { bluffsWon: 0, correctVotes: 0, timesFooled: 0 },
      },
      room: null,
      devPerspectiveId: null,
      isDevSimActive: false,
      soundEnabled: true,
      hapticsEnabled: true,

      setSoundEnabled: (enabled) => {
        soundFX.soundEnabled = enabled;
        set({ soundEnabled: enabled });
      },

      setHapticsEnabled: (enabled) => {
        soundFX.hapticsEnabled = enabled;
        set({ hapticsEnabled: enabled });
      },

      setLocalPlayerName: (name) => {
        set((state) => ({ localPlayer: { ...state.localPlayer, name } }));
      },

      setLocalPlayerAvatar: (avatar) => {
        set((state) => ({ localPlayer: { ...state.localPlayer, avatar } }));
      },

      setLocalPlayerColor: (color) => {
        set((state) => ({ localPlayer: { ...state.localPlayer, color } }));
      },

      createRoom: (hostName, avatar, color) => {
        const roomCode = generateRoomCode();
        const hostPlayer: Player = {
          ...get().localPlayer,
          name: hostName.trim() || 'HOST',
          avatar: avatar || get().localPlayer.avatar || '👾',
          color: color || get().localPlayer.color || '#00F0FF',
          isHost: true,
          isConnected: true,
          isAFK: false,
        };

        const initialRoom: RoomState = {
          roomCode,
          players: [hostPlayer],
          activeGame: 'LOBBY',
          phase: 'LOBBY',
          roundNumber: 0,
          timerEndAt: null,
          customNouns: [],
          gameState: null,
        };

        soundFX.coinChime();

        set({
          localPlayer: hostPlayer,
          room: initialRoom,
          devPerspectiveId: null,
          appScreen: 'LOBBY',
        });

        // Initialize networking
        networkManager.joinRoom(
          roomCode,
          hostPlayer,
          (state) => get().syncRoomState(state),
          (intent) => get().handleIncomingIntent(intent),
          (presences) => {
            // Host reconciles presence
            const currentRoom = get().room;
            if (!currentRoom || !get().localPlayer.isHost) return;
            const updated = currentRoom.players.map((p) => {
              const stillPresent = presences.some((pr) => pr.id === p.id);
              return { ...p, isConnected: p.id === hostPlayer.id || stillPresent };
            });
            const newState = { ...currentRoom, players: updated };
            set({ room: newState });
            networkManager.broadcastState(newState);
          }
        );

        networkManager.broadcastState(initialRoom);
      },

      joinRoom: (roomCode, guestName, avatar, color) => {
        const normalizedCode = roomCode.trim().toUpperCase();
        const guestPlayer: Player = {
          ...get().localPlayer,
          name: guestName.trim() || 'GUEST',
          avatar: avatar || get().localPlayer.avatar || '🕹️',
          color: color || get().localPlayer.color || '#FFC700',
          isHost: false,
          isConnected: true,
          isAFK: false,
        };

        soundFX.coinChime();

        set({
          localPlayer: guestPlayer,
          room: {
            roomCode: normalizedCode,
            players: [guestPlayer],
            activeGame: 'LOBBY',
            phase: 'LOBBY',
            roundNumber: 0,
            timerEndAt: null,
            customNouns: [],
            gameState: null,
          },
          devPerspectiveId: null,
          appScreen: 'LOBBY',
        });

        networkManager.joinRoom(
          normalizedCode,
          guestPlayer,
          (state) => get().syncRoomState(state),
          (intent) => get().handleIncomingIntent(intent)
        );

        // Notify host
        networkManager.sendIntent({
          playerId: guestPlayer.id,
          action: 'TOGGLE_AFK', // Ping host to trigger player roster merge
          data: guestPlayer,
        });
      },

      leaveRoom: () => {
        networkManager.leaveRoom();
        set({ room: null, devPerspectiveId: null, isDevSimActive: false, appScreen: 'HOME' });
      },

      toggleDevSim: () => {
        const state = get();
        const currentRoom = state.room;
        if (!currentRoom) return;

        if (state.isDevSimActive) {
          // Remove bots
          const realPlayers = currentRoom.players.filter((p) => !p.id.startsWith('bot-'));
          const updatedRoom = { ...currentRoom, players: realPlayers };
          set({ room: updatedRoom, isDevSimActive: false, devPerspectiveId: null });
          if (state.localPlayer.isHost) networkManager.broadcastState(updatedRoom);
        } else {
          // Add 3 virtual bots: ROHIT, ADITYA, SURAJ
          const bots: Player[] = [
            {
              id: 'bot-rohit',
              name: 'ROHIT',
              avatar: '🦊',
              color: '#FF3366',
              isHost: false,
              isConnected: true,
              isAFK: false,
              score: 250,
              stats: { bluffsWon: 1, correctVotes: 2, timesFooled: 1 },
            },
            {
              id: 'bot-aditya',
              name: 'ADITYA',
              avatar: '🤖',
              color: '#00E676',
              isHost: false,
              isConnected: true,
              isAFK: false,
              score: 300,
              stats: { bluffsWon: 2, correctVotes: 1, timesFooled: 0 },
            },
            {
              id: 'bot-suraj',
              name: 'SURAJ',
              avatar: '🍕',
              color: '#B537F2',
              isHost: false,
              isConnected: true,
              isAFK: false,
              score: 150,
              stats: { bluffsWon: 0, correctVotes: 1, timesFooled: 2 },
            },
          ];

          // Ensure no duplicates
          const existingIds = new Set(currentRoom.players.map((p) => p.id));
          const newBots = bots.filter((b) => !existingIds.has(b.id));
          const updatedPlayers = [...currentRoom.players, ...newBots];
          const updatedRoom = { ...currentRoom, players: updatedPlayers };

          soundFX.relayClick();
          set({ room: updatedRoom, isDevSimActive: true });
          if (state.localPlayer.isHost) networkManager.broadcastState(updatedRoom);
        }
      },

      setDevPerspective: (playerId) => {
        soundFX.relayClick();
        set({ devPerspectiveId: playerId });
      },

      simulateBotAction: (botId, action, data) => {
        get().handleIncomingIntent({
          playerId: botId,
          action: action as any,
          data,
        });
      },

      dispatchIntent: (action, data) => {
        const state = get();
        const activePerspectiveId = state.devPerspectiveId || state.localPlayer.id;
        const payload: PlayerIntentPayload = {
          playerId: activePerspectiveId,
          action,
          data,
        };

        if (state.localPlayer.isHost) {
          get().handleIncomingIntent(payload);
        } else {
          networkManager.sendIntent(payload);
        }
      },

      syncRoomState: (newState) => {
        set({ room: newState });
      },

      handleIncomingIntent: (intent) => {
        const state = get();
        if (!state.localPlayer.isHost || !state.room) return;

        let room = { ...state.room };
        const { playerId, action, data } = intent;

        switch (action) {
          case 'ADD_CUSTOM_NOUN': {
            if (typeof data === 'string' && data.trim()) {
              const cleanNoun = data.trim();
              if (!room.customNouns.includes(cleanNoun)) {
                room.customNouns = [...room.customNouns, cleanNoun];
                soundFX.coinChime();
              }
            }
            break;
          }

          case 'TOGGLE_AFK': {
            // If data is a new player object, register them into the roster
            if (data && data.id && !room.players.some((p) => p.id === data.id)) {
              room.players = [...room.players, data];
            } else {
              room.players = room.players.map((p) => 
                p.id === playerId ? { ...p, isAFK: !p.isAFK } : p
              );
            }
            break;
          }

          case 'SUBMIT_VOTE': {
            if (room.activeGame === 'CHAMELEON' && room.gameState) {
              const gs = { ...room.gameState } as ChameleonGameState;
              gs.votes = { ...gs.votes, [playerId]: data };
              room.gameState = gs;

              // Check if all active non-AFK players voted
              const activeVoters = room.players.filter((p) => !p.isAFK && p.isConnected);
              const voteCount = Object.keys(gs.votes).length;
              if (voteCount >= activeVoters.length) {
                // Tally votes
                const tally: Record<string, number> = {};
                Object.values(gs.votes).forEach((targetId) => {
                  tally[targetId] = (tally[targetId] || 0) + 1;
                });

                // Find highest vote getter
                let maxVotes = 0;
                let mostVotedPlayerId = '';
                for (const [tId, count] of Object.entries(tally)) {
                  if (count > maxVotes) {
                    maxVotes = count;
                    mostVotedPlayerId = tId;
                  }
                }

                const chameleonCaught = mostVotedPlayerId === gs.chameleonId;
                gs.chameleonCaught = chameleonCaught;
                room.gameState = gs;
                room.phase = 'REVEAL';

                if (chameleonCaught) {
                  // Give Chameleon 15s timer to guess
                  room.timerEndAt = Date.now() + 15000;
                } else {
                  // Chameleon escaped immediately!
                  gs.escapeWon = true;
                  soundFX.buzzer();
                  get().calculateScores();
                  return;
                }
              }
            } else if (room.activeGame === 'FAKIN_IT' && room.gameState) {
              const gs = { ...room.gameState } as FakinItGameState;
              gs.votes = { ...gs.votes, [playerId]: data };
              room.gameState = gs;

              const activeVoters = room.players.filter((p) => !p.isAFK && p.isConnected);
              if (Object.keys(gs.votes).length >= activeVoters.length) {
                // Tally
                const tally: Record<string, number> = {};
                Object.values(gs.votes).forEach((targetId) => {
                  tally[targetId] = (tally[targetId] || 0) + 1;
                });
                let maxVotes = 0;
                let mostVotedPlayerId = '';
                for (const [tId, count] of Object.entries(tally)) {
                  if (count > maxVotes) {
                    maxVotes = count;
                    mostVotedPlayerId = tId;
                  }
                }
                gs.fakerCaught = mostVotedPlayerId === gs.fakerId;
                room.gameState = gs;
                room.phase = 'REVEAL';
                get().calculateScores();
                return;
              }
            } else if (room.activeGame === 'HOT_TAKES' && room.gameState) {
              const gs = { ...room.gameState } as HotTakesGameState;
              gs.votes = { ...gs.votes, [playerId]: data }; // 'TRUTH' or 'BLUFF'
              room.gameState = gs;

              // Non-speaker active players
              const voters = room.players.filter((p) => !p.isAFK && p.isConnected && p.id !== gs.speakerId);
              if (Object.keys(gs.votes).length >= voters.length) {
                room.phase = 'REVEAL';
                get().calculateScores();
                return;
              }
            }
            break;
          }

          case 'CHAMELEON_END_SPEAKER_TURN': {
            if (room.activeGame === 'CHAMELEON' && room.gameState) {
              const gs = { ...room.gameState } as ChameleonGameState;
              if (gs.currentSpeakerIndex + 1 < gs.speakerOrder.length) {
                gs.currentSpeakerIndex += 1;
                soundFX.relayClick();
              } else {
                // All spoken, move to voting!
                room.phase = 'VOTING';
                soundFX.countdownBeep(true);
              }
              room.gameState = gs;
            }
            break;
          }

          case 'CHAMELEON_GUESS_WORD': {
            if (room.activeGame === 'CHAMELEON' && room.gameState) {
              const gs = { ...room.gameState } as ChameleonGameState;
              const guessedWord = data as string;
              gs.chameleonGuess = guessedWord;
              gs.chameleonGuessSuccess = guessedWord.toLowerCase().trim() === gs.targetWord.toLowerCase().trim();
              room.gameState = gs;
              room.timerEndAt = null;
              get().calculateScores();
              return;
            }
            break;
          }

          case 'WAVELENGTH_SUBMIT_CLUE': {
            if (room.activeGame === 'WAVELENGTH' && room.gameState) {
              const gs = { ...room.gameState } as WavelengthGameState;
              gs.clue = (data as string).trim();
              room.gameState = gs;
              room.phase = 'VOTING'; // Tuning phase
              room.timerEndAt = Date.now() + 60000;
              soundFX.coinChime();
            }
            break;
          }

          case 'WAVELENGTH_TUNE_VALUE': {
            if (room.activeGame === 'WAVELENGTH' && room.gameState) {
              const gs = { ...room.gameState } as WavelengthGameState;
              gs.guesses[playerId] = Math.max(0, Math.min(100, Math.round(Number(data))));
              room.gameState = gs;
            }
            break;
          }

          case 'LOCK_DIAL': {
            if (room.activeGame === 'WAVELENGTH' && room.gameState) {
              const gs = { ...room.gameState } as WavelengthGameState;
              const val = Math.max(0, Math.min(100, Math.round(Number(data ?? gs.guesses[playerId] ?? 50))));
              gs.guesses[playerId] = val;
              gs.lockedGuesses[playerId] = true;
              room.gameState = gs;
              soundFX.relayClick();

              // Check if all non-psychic players locked
              const guessers = room.players.filter((p) => !p.isAFK && p.isConnected && p.id !== gs.psychicId);
              const lockedCount = guessers.filter((p) => gs.lockedGuesses[p.id]).length;
              if (lockedCount >= guessers.length) {
                room.phase = 'REVEAL';
                room.timerEndAt = null;
                get().calculateScores();
                return;
              }
            }
            break;
          }

          case 'FAKIN_IT_TRIGGER_COUNTDOWN': {
            if (room.activeGame === 'FAKIN_IT' && room.gameState) {
              const gs = { ...room.gameState } as FakinItGameState;
              gs.countdownTriggered = true;
              gs.countdownEndAt = Date.now() + 3500;
              room.gameState = gs;
              room.phase = 'ACTION';
              soundFX.countdownBeep(true);
            }
            break;
          }

          case 'HOT_TAKES_SEND_REACTION': {
            if (room.activeGame === 'HOT_TAKES' && room.gameState) {
              const gs = { ...room.gameState } as HotTakesGameState;
              const sender = room.players.find((p) => p.id === playerId);
              const badgeType = data.badge as 'SUS' | 'SPICY' | 'CAP';
              const emojiMap = { SUS: '🚨', SPICY: '🔥', CAP: '🧢' };

              const newBadge: ReactionBadge = {
                id: Math.random().toString(36).substring(2, 8),
                senderId: playerId,
                senderName: sender?.name || 'GUEST',
                badge: badgeType,
                emoji: emojiMap[badgeType],
                x: Math.floor(Math.random() * 70) + 15,
                timestamp: Date.now(),
              };

              gs.reactions = [...gs.reactions.slice(-15), newBadge];
              room.gameState = gs;
              soundFX.rotaryTick();
            }
            break;
          }

          case 'HOST_ADVANCE_PHASE': {
            room.phase = data as RoomPhase;
            if (data === 'REVEAL') {
              get().calculateScores();
              return;
            }
            break;
          }

          case 'HOST_SET_GAME': {
            get().startGame(data as GameType);
            return;
          }

          case 'HOST_EXTEND_TIMER': {
            const addMs = (data || 30) * 1000;
            room.timerEndAt = (room.timerEndAt || Date.now()) + addMs;
            soundFX.relayClick();
            break;
          }
        }

        set({ room });
        networkManager.broadcastState(room);
      },

      startGame: (gameType) => {
        const state = get();
        if (!state.localPlayer.isHost || !state.room) return;

        const currentPlayers = state.room.players.filter((p) => !p.isAFK && p.isConnected);
        if (currentPlayers.length === 0) return;

        soundFX.victoryFanfare();

        let initialGameState: any = null;
        let initialPhase: RoomPhase = 'DEAL';
        let timerEndAt: number | null = null;

        if (gameType === 'CHAMELEON') {
          // Select category and 16 words
          const catIndex = Math.floor(Math.random() * promptsData.chameleon.length);
          const chosenCat = promptsData.chameleon[catIndex];
          let words = [...chosenCat.words];

          // Inject custom noun if available
          if (state.room.customNouns.length > 0 && Math.random() > 0.4) {
            const randNoun = state.room.customNouns[Math.floor(Math.random() * state.room.customNouns.length)];
            const replaceIdx = Math.floor(Math.random() * words.length);
            words[replaceIdx] = randNoun;
          }

          const targetWord = words[Math.floor(Math.random() * words.length)];
          const chameleonPlayer = currentPlayers[Math.floor(Math.random() * currentPlayers.length)];

          // Randomized speaker turn order
          const speakerOrder = [...currentPlayers.map((p) => p.id)].sort(() => Math.random() - 0.5);

          initialGameState = {
            category: chosenCat.category,
            words,
            targetWord,
            chameleonId: chameleonPlayer.id,
            speakerOrder,
            currentSpeakerIndex: 0,
            votes: {},
            chameleonCaught: false,
            chameleonGuess: null,
            chameleonGuessSuccess: null,
            escapeWon: false,
          } as ChameleonGameState;

          initialPhase = 'DEAL';
        } else if (gameType === 'WAVELENGTH') {
          const specIndex = Math.floor(Math.random() * promptsData.wavelength.length);
          const spectrum = promptsData.wavelength[specIndex] as [string, string];
          const psychic = currentPlayers[Math.floor(Math.random() * currentPlayers.length)];
          const targetValue = Math.floor(Math.random() * 81) + 10; // 10 to 90

          initialGameState = {
            spectrum,
            psychicId: psychic.id,
            targetValue,
            clue: '',
            guesses: {},
            lockedGuesses: {},
          } as WavelengthGameState;

          initialPhase = 'ACTION';
        } else if (gameType === 'FAKIN_IT') {
          const faker = currentPlayers[Math.floor(Math.random() * currentPlayers.length)];
          const promptItem = promptsData.fakinIt[Math.floor(Math.random() * promptsData.fakinIt.length)];

          initialGameState = {
            fakerId: faker.id,
            taskType: promptItem.type as any,
            realPrompt: promptItem.prompt,
            countdownTriggered: false,
            countdownEndAt: null,
            votes: {},
          } as FakinItGameState;

          initialPhase = 'DEAL';
        } else if (gameType === 'HOT_TAKES') {
          const speaker = currentPlayers[Math.floor(Math.random() * currentPlayers.length)];
          let statement = promptsData.hotTakes[Math.floor(Math.random() * promptsData.hotTakes.length)];

          // Inject custom noun if available
          if (state.room.customNouns.length > 0 && Math.random() > 0.4) {
            const noun = state.room.customNouns[Math.floor(Math.random() * state.room.customNouns.length)];
            statement = `"${noun}" is massively overrated and nobody should ever bring it up again.`;
          }

          const directive = Math.random() > 0.5 ? 'TRUTH' : 'DEVIL';

          initialGameState = {
            speakerId: speaker.id,
            statement,
            directive,
            reactions: [],
            votes: {},
          } as HotTakesGameState;

          initialPhase = 'DEAL';
        }

        const updatedRoom: RoomState = {
          ...state.room,
          activeGame: gameType,
          phase: initialPhase,
          roundNumber: state.room.roundNumber + 1,
          timerEndAt,
          gameState: initialGameState,
        };

        set({ room: updatedRoom, appScreen: 'PLAYING' });
        networkManager.broadcastState(updatedRoom);
      },

      advancePhase: (nextPhase) => {
        const state = get();
        if (!state.localPlayer.isHost || !state.room) return;

        let timerEndAt = state.room.timerEndAt;
        if (nextPhase === 'DISCUSSION') {
          timerEndAt = Date.now() + 45000;
        } else if (nextPhase === 'ACTION' && state.room.activeGame === 'HOT_TAKES') {
          timerEndAt = Date.now() + 45000;
        } else if (nextPhase === 'VOTING') {
          timerEndAt = Date.now() + 30000;
        }

        const updatedRoom = {
          ...state.room,
          phase: nextPhase,
          timerEndAt,
        };

        if (nextPhase === 'REVEAL') {
          get().calculateScores();
          return;
        }

        soundFX.relayClick();
        set({ room: updatedRoom });
        networkManager.broadcastState(updatedRoom);
      },

      extendTimer: (seconds = 30) => {
        const state = get();
        if (!state.localPlayer.isHost || !state.room) return;

        const currentEnd = state.room.timerEndAt || Date.now();
        const updatedRoom = {
          ...state.room,
          timerEndAt: currentEnd + seconds * 1000,
        };

        soundFX.relayClick();
        set({ room: updatedRoom });
        networkManager.broadcastState(updatedRoom);
      },

      addCustomNoun: (noun) => {
        get().dispatchIntent('ADD_CUSTOM_NOUN', noun);
      },

      toggleAFK: (playerId) => {
        get().dispatchIntent('TOGGLE_AFK', playerId);
      },

      cashOutReceipt: () => {
        const state = get();
        if (!state.localPlayer.isHost || !state.room) return;

        soundFX.victoryFanfare();
        const updatedRoom = {
          ...state.room,
          activeGame: 'RECEIPT' as GameType,
          phase: 'SCOREBOARD' as RoomPhase,
        };

        set({ room: updatedRoom });
        networkManager.broadcastState(updatedRoom);
      },

      resetToLobby: () => {
        const state = get();
        if (!state.localPlayer.isHost || !state.room) return;

        soundFX.coinChime();
        const updatedRoom = {
          ...state.room,
          activeGame: 'LOBBY' as GameType,
          phase: 'LOBBY' as RoomPhase,
          gameState: null,
          timerEndAt: null,
        };

        set({ room: updatedRoom, appScreen: 'LOBBY' });
        networkManager.broadcastState(updatedRoom);
      },

      calculateScores: () => {
        const state = get();
        if (!state.room || !state.localPlayer.isHost) return;

        const room = { ...state.room };
        const { activeGame, gameState } = room;
        const roundScores: Record<string, number> = {};

        if (activeGame === 'CHAMELEON') {
          const gs = gameState as ChameleonGameState;
          const chameleonCaught = gs.chameleonCaught;
          const guessSuccess = gs.chameleonGuessSuccess;

          if (!chameleonCaught || gs.escapeWon) {
            // Chameleon escaped completely
            roundScores[gs.chameleonId] = 200;
          } else if (guessSuccess) {
            // Caught but stole win via sudden death
            roundScores[gs.chameleonId] = 150;
          } else {
            // Innocents win
            room.players.forEach((p) => {
              if (p.id !== gs.chameleonId && !p.isAFK) {
                roundScores[p.id] = 100;
              }
            });
          }

          // Update player stats
          room.players = room.players.map((p) => {
            const addPts = roundScores[p.id] || 0;
            const isChameleon = p.id === gs.chameleonId;
            const wonBluff = isChameleon && (!chameleonCaught || guessSuccess === true);
            const votedCorrectly = gs.votes[p.id] === gs.chameleonId;
            const fooled = !isChameleon && !votedCorrectly;

            return {
              ...p,
              score: p.score + addPts,
              stats: {
                bluffsWon: p.stats.bluffsWon + (wonBluff ? 1 : 0),
                correctVotes: p.stats.correctVotes + (votedCorrectly ? 1 : 0),
                timesFooled: p.stats.timesFooled + (fooled ? 1 : 0),
              },
            };
          });

          gs.roundScores = roundScores;
          room.gameState = gs;
        } else if (activeGame === 'WAVELENGTH') {
          const gs = gameState as WavelengthGameState;
          const target = gs.targetValue;
          let totalDiff = 0;
          let guessCount = 0;

          // Score each guesser
          room.players.forEach((p) => {
            if (p.id !== gs.psychicId && !p.isAFK) {
              const guess = gs.guesses[p.id] ?? 50;
              const diff = Math.abs(guess - target);
              totalDiff += diff;
              guessCount++;

              let pts = 0;
              if (diff <= 4) pts = 400; // BULLSEYE!
              else if (diff <= 10) pts = 300;
              else if (diff <= 18) pts = 150;

              roundScores[p.id] = pts;
            }
          });

          // Operator bonus if room average within ±12
          const avgDiff = guessCount > 0 ? totalDiff / guessCount : 999;
          if (avgDiff <= 12) {
            roundScores[gs.psychicId] = 200;
          }

          room.players = room.players.map((p) => {
            const addPts = roundScores[p.id] || 0;
            return {
              ...p,
              score: p.score + addPts,
              stats: {
                ...p.stats,
                correctVotes: p.stats.correctVotes + (addPts >= 300 ? 1 : 0),
              },
            };
          });

          gs.roundScores = roundScores;
          room.gameState = gs;
        } else if (activeGame === 'FAKIN_IT') {
          const gs = gameState as FakinItGameState;
          const fakerCaught = gs.fakerCaught;

          if (fakerCaught) {
            room.players.forEach((p) => {
              if (p.id !== gs.fakerId && !p.isAFK) {
                roundScores[p.id] = 100;
              }
            });
          } else {
            roundScores[gs.fakerId] = 250;
          }

          room.players = room.players.map((p) => {
            const addPts = roundScores[p.id] || 0;
            const isFaker = p.id === gs.fakerId;
            const wonBluff = isFaker && !fakerCaught;
            const votedCorrectly = gs.votes[p.id] === gs.fakerId;
            const fooled = !isFaker && !votedCorrectly;

            return {
              ...p,
              score: p.score + addPts,
              stats: {
                bluffsWon: p.stats.bluffsWon + (wonBluff ? 1 : 0),
                correctVotes: p.stats.correctVotes + (votedCorrectly ? 1 : 0),
                timesFooled: p.stats.timesFooled + (fooled ? 1 : 0),
              },
            };
          });

          gs.roundScores = roundScores;
          room.gameState = gs;
        } else if (activeGame === 'HOT_TAKES') {
          const gs = gameState as HotTakesGameState;
          const trueDirective = gs.directive; // 'TRUTH' or 'DEVIL'
          const correctDirectiveGuess = trueDirective === 'TRUTH' ? 'TRUTH' : 'BLUFF';

          let fooledCount = 0;
          room.players.forEach((p) => {
            if (p.id !== gs.speakerId && !p.isAFK) {
              const vote = gs.votes[p.id];
              if (vote === correctDirectiveGuess) {
                roundScores[p.id] = 100;
              } else {
                fooledCount++;
              }
            }
          });

          // Speaker earns 100 per fooled player
          const speakerPts = fooledCount * 100;
          roundScores[gs.speakerId] = speakerPts;
          gs.speakerPoints = speakerPts;

          room.players = room.players.map((p) => {
            const addPts = roundScores[p.id] || 0;
            const isSpeaker = p.id === gs.speakerId;
            const wonBluff = isSpeaker && fooledCount > 0;
            const votedCorrectly = gs.votes[p.id] === correctDirectiveGuess;
            const fooled = !isSpeaker && !votedCorrectly;

            return {
              ...p,
              score: p.score + addPts,
              stats: {
                bluffsWon: p.stats.bluffsWon + (wonBluff ? 1 : 0),
                correctVotes: p.stats.correctVotes + (votedCorrectly ? 1 : 0),
                timesFooled: p.stats.timesFooled + (fooled ? 1 : 0),
              },
            };
          });

          gs.roundScores = roundScores;
          room.gameState = gs;
        }

        soundFX.victoryFanfare();
        room.phase = 'REVEAL';
        set({ room });
        networkManager.broadcastState(room);
      },
    }),
    {
      name: 'houseparty-arcade-store',
      partialize: (state) => ({
        localPlayer: state.localPlayer,
        room: state.room,
        soundEnabled: state.soundEnabled,
        hapticsEnabled: state.hapticsEnabled,
        selectedGameType: state.selectedGameType,
        // Restore appScreen based on room existence
        appScreen: state.room
          ? (state.room.activeGame !== 'LOBBY' ? 'PLAYING' : 'LOBBY')
          : 'HOME',
      }),
    }
  )
);
