import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle, Clock, RotateCcw, Zap, Check } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import type { FakinItGameState } from '../../types/game';
import { ArcadeButton } from '../arcade/ArcadeButton';
import { SecretRoleShutter } from '../arcade/SecretRoleShutter';

export const FakinItView: React.FC = () => {
  const { 
    room, 
    localPlayer, 
    devPerspectiveId, 
    dispatchIntent, 
    advancePhase, 
    startGame, 
    resetToLobby 
  } = useGameStore();

  const [countdownNum, setCountdownNum] = useState<number | string>(3);
  const [discussionTimer, setDiscussionTimer] = useState<number>(45);

  if (!room || !room.gameState) return null;

  const gs = room.gameState as FakinItGameState;
  const activePerspectiveId = devPerspectiveId || localPlayer.id;
  const isFaker = activePerspectiveId === gs.fakerId;
  const isHost = localPlayer.isHost;

  const activePlayers = room.players.filter((p) => !p.isAFK && p.isConnected);
  const myVote = gs.votes?.[activePerspectiveId];

  // 3-2-1 Countdown listener
  useEffect(() => {
    if (room.phase === 'ACTION' && gs.countdownEndAt) {
      const timer = setInterval(() => {
        const remainingMs = gs.countdownEndAt! - Date.now();
        if (remainingMs > 2000) {
          setCountdownNum(3);
        } else if (remainingMs > 1000) {
          setCountdownNum(2);
        } else if (remainingMs > 0) {
          setCountdownNum(1);
        } else {
          setCountdownNum('GO!');
          clearInterval(timer);
          if (isHost) {
            advancePhase('DISCUSSION');
          }
        }
      }, 250);
      return () => clearInterval(timer);
    }
  }, [room.phase, gs.countdownEndAt, isHost]);

  // 45s Discussion Timer
  useEffect(() => {
    if (room.phase === 'DISCUSSION' && room.timerEndAt) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((room.timerEndAt! - Date.now()) / 1000));
        setDiscussionTimer(remaining);
        if (remaining <= 0 && isHost) {
          clearInterval(interval);
          advancePhase('VOTING');
        }
      }, 500);
      return () => clearInterval(interval);
    }
  }, [room.phase, room.timerEndAt, isHost]);

  // Trigger confetti on reveal
  useEffect(() => {
    if (room.phase === 'REVEAL') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
      });
    }
  }, [room.phase]);

  // 1. DEAL PHASE: Secret Prompt vs Faker Directive
  if (room.phase === 'DEAL') {
    return (
      <div className="w-full h-full flex flex-col justify-between gap-3 p-4 select-none">
        <div className="text-center">
          <span className="text-xs font-semibold text-white/40">Action Type · {gs.taskType}</span>
          <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
            Fakin' It
          </h2>
        </div>

        {/* Shutter Well */}
        <div className="flex-1 w-full min-h-[300px]">
          <SecretRoleShutter
            title="Action Prompt"
            subtitle="Everyone performs this action simultaneously on GO!"
            warningText="Hold to reveal secret action"
          >
            {isFaker ? (
              <div className="flex flex-col items-center justify-center gap-2 p-2 text-center">
                <div className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold">
                  You are the Faker!
                </div>
                <div className="text-2xl font-black text-white tracking-tight mt-1">
                  🕵️ Act Natural!
                </div>
                <p className="text-xs text-white/60 max-w-[260px] leading-relaxed mt-1">
                  {gs.taskType === 'FINGERS' && 'Hold up 1 to 5 fingers when the horn sounds. Watch other hands and match their vibe!'}
                  {gs.taskType === 'POINT' && 'Point forcefully at any player in the room when the buzzer sounds! Do not hesitate!'}
                  {gs.taskType === 'FACE' && 'Make a dramatic, expressive face when the buzzer sounds and act confident!'}
                </p>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-2.5 text-center p-2">
                <span className="text-xs font-semibold text-white/50">Your Secret Action:</span>
                <div className="text-lg font-black text-white p-4 rounded-2xl bg-white/10 w-full leading-snug">
                  "{gs.realPrompt}"
                </div>
                <span className="text-xs text-white/40">
                  Perform this physically when the 3-2-1 countdown hits GO!
                </span>
              </div>
            )}
          </SecretRoleShutter>
        </div>

        {/* Host Trigger Countdown Button */}
        {isHost ? (
          <ArcadeButton
            color="red"
            size="lg"
            fullWidth
            soundType="coin"
            onClick={() => dispatchIntent('FAKIN_IT_TRIGGER_COUNTDOWN')}
            icon={<Zap className="w-4 h-4" />}
          >
            Start 3-2-1 Countdown
          </ArcadeButton>
        ) : (
          <div className="py-3.5 px-4 rounded-2xl bg-white/5 border border-white/5 text-center text-xs font-medium text-white/40">
            Waiting for host to trigger countdown...
          </div>
        )}
      </div>
    );
  }

  // 2. ACTION PHASE: Synchronized Countdown
  if (room.phase === 'ACTION') {
    return (
      <div className="fixed inset-0 z-50 bg-[#0B0B10] flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden">
        <motion.div
          key={String(countdownNum)}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.3, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="text-xs font-bold text-white/40 tracking-wider">
            GET READY
          </div>

          <div
            className={`
              font-black tracking-tight leading-none
              ${countdownNum === 'GO!' 
                ? 'text-6xl text-emerald-400' 
                : 'text-9xl text-white'
              }
            `}
          >
            {countdownNum}
          </div>

          <div className="text-sm font-semibold text-white/60 mt-3">
            Look up at the room! Do not look down!
          </div>
        </motion.div>
      </div>
    );
  }

  // 3. DISCUSSION PHASE
  if (room.phase === 'DISCUSSION') {
    return (
      <div className="w-full h-full flex flex-col justify-between gap-3 p-4 select-none">
        <div className="text-center">
          <span className="text-xs font-semibold text-white/40">Discuss & Interrogate</span>
          <div className="text-3xl font-black text-rose-500 mt-0.5">
            {discussionTimer}s
          </div>
        </div>

        {/* Revealed Prompt Display */}
        <div className="flex-1 w-full bg-[#14141E] rounded-3xl border border-white/10 p-5 flex flex-col items-center justify-between text-center shadow-xl">
          <span className="text-xs font-semibold text-white/40">
            The Real Action Prompt was:
          </span>

          <div className="text-xl font-black text-white p-4 bg-white/5 rounded-2xl w-full my-auto leading-snug">
            "{gs.realPrompt}"
          </div>

          <p className="text-xs text-white/50 max-w-[280px]">
            Look around the room! Whose reaction was delayed, hesitant, or completely copied from someone else?
          </p>
        </div>

        {/* Host Advance to Voting */}
        {isHost ? (
          <ArcadeButton
            color="red"
            size="lg"
            fullWidth
            onClick={() => advancePhase('VOTING')}
          >
            Open Voting
          </ArcadeButton>
        ) : (
          <div className="py-3.5 px-4 rounded-2xl bg-white/5 border border-white/5 text-center text-xs font-medium text-white/40">
            Interrogate suspects out loud in the room...
          </div>
        )}
      </div>
    );
  }

  // 4. VOTING PHASE
  if (room.phase === 'VOTING') {
    return (
      <div className="w-full h-full flex flex-col justify-between gap-3 p-4 select-none">
        <div className="text-center">
          <h2 className="text-xl font-black text-white tracking-tight">
            Who faked the action?
          </h2>
          <p className="text-xs text-white/40 mt-0.5">
            Tap the player you think had no clue what they were doing
          </p>
        </div>

        {/* Voter Roster */}
        <div className="w-full bg-[#14141E] rounded-3xl border border-white/10 p-4 flex flex-col gap-2 shadow-xl">
          <div className="text-xs font-semibold text-white/40 flex items-center justify-between pb-1 border-b border-white/5">
            <span>Votes</span>
            <span>{Object.keys(gs.votes || {}).length} of {activePlayers.length} in</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {activePlayers.map((p) => {
              const hasVoted = Boolean(gs.votes?.[p.id]);
              return (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-xs">
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

        {/* Voting Buttons */}
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
                      ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-2 ring-rose-400'
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

  // 5. REVEAL PHASE
  const fakerPlayer = room.players.find((p) => p.id === gs.fakerId);
  const fakerCaught = gs.fakerCaught;

  return (
    <div className="w-full h-full flex flex-col justify-between gap-3 p-4 select-none overflow-y-auto no-scrollbar">
      <div className="text-center">
        <h2 className="text-2xl font-black text-white tracking-tight">
          {fakerCaught ? 'The Faker was Caught!' : 'The Faker Escaped!'}
        </h2>
      </div>

      {/* Identity Card */}
      <div className="w-full bg-[#14141E] rounded-3xl border border-white/10 p-5 flex flex-col items-center text-center gap-3 shadow-xl">
        <span className="text-xs font-semibold text-white/40">The Faker was</span>

        <div className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-rose-500/20 text-rose-300">
          <span className="text-2xl">{fakerPlayer?.avatar}</span>
          <span className="text-base font-black">
            {fakerPlayer?.name}
          </span>
        </div>

        <div className="text-xs text-white/50 max-w-[260px] leading-relaxed">
          {fakerCaught 
            ? 'The group spotted the bluff! Innocents score tickets.'
            : `${fakerPlayer?.name} bluffed undetected and takes the points!`}
        </div>
      </div>

      {/* Action Prompt Recall */}
      <div className="w-full bg-[#14141E] rounded-3xl border border-white/10 p-4 text-center">
        <span className="text-xs font-semibold text-white/40">The real prompt was:</span>
        <div className="text-base font-black text-white mt-1">
          "{gs.realPrompt}"
        </div>
      </div>

      {/* Controls */}
      <div className="w-full flex flex-col gap-2 pt-1">
        {isHost && (
          <ArcadeButton
            color="red"
            size="lg"
            fullWidth
            onClick={() => startGame('FAKIN_IT')}
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Play Next Action
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
