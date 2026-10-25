import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle, Clock, RotateCcw, ArrowRight, Check } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import type { ChameleonGameState } from '../../types/game';
import { ArcadeButton } from '../arcade/ArcadeButton';
import { SecretRoleShutter } from '../arcade/SecretRoleShutter';

export const ChameleonView: React.FC = () => {
  const { 
    room, 
    localPlayer, 
    devPerspectiveId, 
    dispatchIntent, 
    advancePhase, 
    startGame, 
    resetToLobby 
  } = useGameStore();

  const [suddenDeathTimer, setSuddenDeathTimer] = useState<number | null>(null);

  if (!room || !room.gameState) return null;

  const gs = room.gameState as ChameleonGameState;
  const activePerspectiveId = devPerspectiveId || localPlayer.id;
  const isChameleon = activePerspectiveId === gs.chameleonId;
  const isHost = localPlayer.isHost;

  const currentSpeakerId = gs.speakerOrder?.[gs.currentSpeakerIndex];
  const isMySpeakerTurn = activePerspectiveId === currentSpeakerId;
  const currentSpeakerPlayer = room.players.find((p) => p.id === currentSpeakerId);

  // Active non-AFK players
  const activePlayers = room.players.filter((p) => !p.isAFK && p.isConnected);
  const myVote = gs.votes?.[activePerspectiveId];

  // 15s Sudden Death Countdown listener for Chameleon
  useEffect(() => {
    if (room.phase === 'REVEAL' && gs.chameleonCaught && !gs.chameleonGuess && room.timerEndAt) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((room.timerEndAt! - Date.now()) / 1000));
        setSuddenDeathTimer(remaining);
        if (remaining <= 0) {
          clearInterval(interval);
          if (isHost && !gs.chameleonGuess) {
            dispatchIntent('CHAMELEON_GUESS_WORD', 'TIMEOUT_NONE');
          }
        }
      }, 250);
      return () => clearInterval(interval);
    }
  }, [room.phase, gs.chameleonCaught, gs.chameleonGuess, room.timerEndAt, isHost]);

  // Trigger confetti on reveal
  useEffect(() => {
    if (room.phase === 'REVEAL') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  }, [room.phase]);

  // 1. DEAL PHASE: Secret Role Shutter
  if (room.phase === 'DEAL') {
    return (
      <div className="w-full h-full flex flex-col justify-between gap-3 p-4 select-none">
        {/* Category Header */}
        <div className="text-center">
          <span className="text-xs font-semibold text-white/50">Category</span>
          <h2 className="text-xl font-black text-white mt-0.5 tracking-tight">
            {gs.category}
          </h2>
        </div>

        {/* Shutter Well */}
        <div className="flex-1 w-full min-h-[300px]">
          <SecretRoleShutter
            title="Secret Role"
            subtitle="Keep screen hidden from nearby players"
            warningText="Hold to reveal secret role"
          >
            {isChameleon ? (
              <div className="flex flex-col items-center justify-center gap-2 p-2 text-center">
                <div className="px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold">
                  You are the Chameleon
                </div>
                <div className="text-2xl font-black text-white tracking-tight mt-1">
                  🦎 Blend In!
                </div>
                <p className="text-xs text-white/60 max-w-[260px] mt-1 leading-relaxed">
                  You do not know the secret word. Listen to everyone's one-word clues and try not to get caught!
                </p>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-2.5">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold">
                  <span>Secret Word:</span>
                  <span className="text-white font-black">{gs.targetWord}</span>
                </div>

                {/* 4x4 Word Grid */}
                <div className="grid grid-cols-4 gap-1.5 w-full max-h-[220px] overflow-y-auto no-scrollbar pt-1">
                  {gs.words.map((word, i) => {
                    const isTarget = word.toLowerCase() === gs.targetWord.toLowerCase();
                    return (
                      <div
                        key={i}
                        className={`
                          p-2 rounded-xl text-[11px] font-bold text-center flex items-center justify-center transition-all
                          ${isTarget
                            ? 'bg-emerald-600 text-white font-black shadow-md'
                            : 'bg-white/5 text-white/70 border border-white/5'
                          }
                        `}
                      >
                        <span className="truncate">{word}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </SecretRoleShutter>
        </div>

        {/* Host Ready Button */}
        {isHost ? (
          <ArcadeButton
            color="green"
            size="lg"
            fullWidth
            onClick={() => advancePhase('ACTION')}
            icon={<ArrowRight className="w-4 h-4" />}
          >
            Start Clue Round
          </ArcadeButton>
        ) : (
          <div className="py-3 px-4 rounded-2xl bg-white/5 border border-white/5 text-center text-xs font-medium text-white/40">
            Waiting for host to start clue round...
          </div>
        )}
      </div>
    );
  }

  // 2. ACTION PHASE: Clue Relay (Heads up in the room)
  if (room.phase === 'ACTION') {
    return (
      <div className="w-full h-full flex flex-col justify-between gap-3 p-4 select-none">
        {/* Category banner */}
        <div className="text-center">
          <span className="text-xs font-semibold text-white/40">Category · </span>
          <span className="text-xs font-bold text-white">
            {gs.category}
          </span>
        </div>

        {/* Clue Speaker Card */}
        <div className="flex-1 w-full bg-[#14141E] rounded-3xl border border-white/10 p-5 flex flex-col items-center justify-between text-center shadow-xl">
          {/* Turn Order Header */}
          <div className="w-full flex items-center justify-between text-xs font-semibold text-white/40 border-b border-white/5 pb-3">
            <span>Clue Round</span>
            <span>
              Turn {gs.currentSpeakerIndex + 1} of {gs.speakerOrder.length}
            </span>
          </div>

          {/* Current Speaker Display */}
          <div className="flex flex-col items-center gap-3 my-auto">
            <div
              className="w-16 h-16 rounded-2xl border-2 border-white/20 text-3xl flex items-center justify-center shadow-md"
              style={{ backgroundColor: currentSpeakerPlayer?.color || '#6366F1' }}
            >
              {currentSpeakerPlayer?.avatar || '👾'}
            </div>

            <div className="text-xl font-black text-white tracking-tight">
              {currentSpeakerPlayer?.name}
            </div>

            <div className={`px-3.5 py-1.5 rounded-full text-xs font-bold ${
              isMySpeakerTurn 
                ? 'bg-amber-500/20 text-amber-300' 
                : 'bg-white/10 text-white/70'
            }`}>
              {isMySpeakerTurn ? 'Your Turn! Say 1 clue word aloud' : 'Speaking out loud in the room'}
            </div>
          </div>

          {/* Turn Order Dots */}
          <div className="w-full flex items-center justify-center gap-1.5 pt-3 border-t border-white/5">
            {gs.speakerOrder.map((spId, idx) => {
              const spPlayer = room.players.find((p) => p.id === spId);
              const isPast = idx < gs.currentSpeakerIndex;
              const isCurr = idx === gs.currentSpeakerIndex;
              return (
                <div
                  key={spId}
                  className={`
                    w-7 h-7 rounded-xl text-xs flex items-center justify-center font-bold transition-all
                    ${isCurr ? 'ring-2 ring-white scale-110 shadow' : isPast ? 'opacity-30' : 'opacity-60'}
                  `}
                  style={{ backgroundColor: spPlayer?.color }}
                >
                  {spPlayer?.avatar}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Control */}
        <div className="w-full">
          {isMySpeakerTurn ? (
            <ArcadeButton
              color="amber"
              size="dome"
              fullWidth
              soundType="click"
              onClick={() => dispatchIntent('CHAMELEON_END_SPEAKER_TURN')}
            >
              Done Speaking (Next Player)
            </ArcadeButton>
          ) : (
            <div className="w-full py-3.5 px-4 rounded-2xl bg-white/5 border border-white/5 text-center text-xs font-medium text-white/50">
              Listen to {currentSpeakerPlayer?.name}'s clue in the room...
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. VOTING PHASE: Who is the Chameleon?
  if (room.phase === 'VOTING') {
    return (
      <div className="w-full h-full flex flex-col justify-between gap-3 p-4 select-none">
        <div className="text-center">
          <h2 className="text-xl font-black text-white tracking-tight">
            Who is the Chameleon?
          </h2>
          <p className="text-xs text-white/40 mt-0.5">
            Discuss with the group, then tap to cast your vote
          </p>
        </div>

        {/* Voting Status Grid */}
        <div className="w-full bg-[#14141E] rounded-3xl border border-white/10 p-4 flex flex-col gap-3">
          <div className="text-xs font-semibold text-white/40 flex items-center justify-between">
            <span>Votes</span>
            <span>
              {Object.keys(gs.votes || {}).length} of {activePlayers.length} in
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {activePlayers.map((p) => {
              const hasVoted = Boolean(gs.votes?.[p.id]);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-xs font-medium"
                >
                  <span className="truncate text-white/80">{p.name}</span>
                  {hasVoted ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <Clock className="w-3.5 h-3.5 text-white/20 shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Voting Selection */}
        <div className="w-full flex flex-col gap-2">
          <div className="text-xs font-semibold text-white/50 px-1">
            {myVote ? 'Vote locked in' : 'Vote for suspect:'}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {activePlayers.map((targetPlayer) => {
              const isSelected = myVote === targetPlayer.id;
              return (
                <button
                  key={targetPlayer.id}
                  type="button"
                  onClick={() => dispatchIntent('SUBMIT_VOTE', targetPlayer.id)}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl transition-all duration-150 active:scale-95 text-left ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-2 ring-indigo-400'
                      : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/5'
                  }`}
                >
                  <span className="text-xl">{targetPlayer.avatar}</span>
                  <span className="text-xs font-bold truncate flex-1">{targetPlayer.name}</span>
                  {isSelected && <Check className="w-4 h-4 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // 4. REVEAL PHASE: Sudden Death Guess & Outcome
  const chameleonPlayer = room.players.find((p) => p.id === gs.chameleonId);
  const chameleonCaught = gs.chameleonCaught;
  const guessSuccess = gs.chameleonGuessSuccess;
  const isSuddenDeathActive = chameleonCaught && gs.chameleonGuess === null;

  return (
    <div className="w-full h-full flex flex-col justify-between gap-3 p-4 select-none overflow-y-auto no-scrollbar">
      <div className="text-center">
        <h2 className="text-2xl font-black text-white tracking-tight">
          {chameleonCaught
            ? guessSuccess === true
              ? 'Chameleon Stole the Win!'
              : guessSuccess === false
              ? 'Innocents Win!'
              : 'Chameleon Caught!'
            : 'Chameleon Escaped!'}
        </h2>
      </div>

      {/* Chameleon Identity Card */}
      <div className="w-full bg-[#14141E] rounded-3xl border border-white/10 p-5 flex flex-col items-center text-center gap-3 shadow-xl">
        <span className="text-xs font-semibold text-white/40">The Chameleon was</span>

        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-purple-500/20 text-purple-300">
          <span className="text-2xl">{chameleonPlayer?.avatar}</span>
          <span className="text-base font-black">
            {chameleonPlayer?.name}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-white/40">Secret Word:</span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold">
            {gs.targetWord}
          </span>
        </div>
      </div>

      {/* Sudden Death / Guess section */}
      {isSuddenDeathActive ? (
        <div className="w-full bg-[#14141E] rounded-3xl border border-white/10 p-4 flex flex-col items-center gap-3">
          <div className="text-xs font-bold text-amber-400">
            ⚡ Sudden Death: {suddenDeathTimer !== null ? `${suddenDeathTimer}s` : '15s'}
          </div>
          <p className="text-xs text-white/60 text-center">
            {isChameleon 
              ? 'You were caught! Guess the secret word to steal the win:'
              : `${chameleonPlayer?.name} is guessing the secret word...`}
          </p>

          {isChameleon && (
            <div className="grid grid-cols-4 gap-1.5 w-full max-h-[160px] overflow-y-auto no-scrollbar">
              {gs.words.map((word, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => dispatchIntent('CHAMELEON_GUESS_WORD', word)}
                  className="p-2 rounded-xl text-[10px] font-bold bg-white/5 hover:bg-white/10 border border-white/10 text-white truncate active:scale-95 transition-all"
                >
                  {word}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Post game actions */}
      <div className="w-full flex flex-col gap-2 pt-2">
        {isHost && (
          <ArcadeButton
            color="cyan"
            size="lg"
            fullWidth
            onClick={() => startGame('CHAMELEON')}
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Play Another Round
          </ArcadeButton>
        )}
        <button
          type="button"
          onClick={resetToLobby}
          className="w-full py-3 rounded-2xl text-xs font-bold text-white/50 hover:text-white/80 transition-colors"
        >
          Return to Lobby
        </button>
      </div>
    </div>
  );
};
