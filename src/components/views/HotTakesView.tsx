import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { RotateCcw, Check } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import type { HotTakesGameState } from '../../types/game';
import { ArcadeButton } from '../arcade/ArcadeButton';
import { SecretRoleShutter } from '../arcade/SecretRoleShutter';

export const HotTakesView: React.FC = () => {
  const { 
    room, 
    localPlayer, 
    devPerspectiveId, 
    dispatchIntent, 
    advancePhase, 
    startGame, 
    resetToLobby 
  } = useGameStore();

  const [rantTimer, setRantTimer] = useState<number>(45);

  if (!room || !room.gameState) return null;

  const gs = room.gameState as HotTakesGameState;
  const activePerspectiveId = devPerspectiveId || localPlayer.id;
  const isSpeaker = activePerspectiveId === gs.speakerId;
  const isHost = localPlayer.isHost;

  const speakerPlayer = room.players.find((p) => p.id === gs.speakerId);
  const myVote = gs.votes?.[activePerspectiveId];

  // 45s Rant Timer in ACTION phase
  useEffect(() => {
    if (room.phase === 'ACTION' && room.timerEndAt) {
      const interval = setInterval(() => {
        const remaining = Math.max(0, Math.ceil((room.timerEndAt! - Date.now()) / 1000));
        setRantTimer(remaining);
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

  const sendReaction = (badge: 'SUS' | 'SPICY' | 'CAP') => {
    dispatchIntent('HOT_TAKES_SEND_REACTION', { badge });
  };

  // 1. DEAL PHASE: Secret Directive
  if (room.phase === 'DEAL') {
    return (
      <div className="w-full h-full flex flex-col justify-between gap-3 p-4 select-none">
        <div className="text-center">
          <span className="text-xs font-semibold text-white/40">In the Hot Seat</span>
          <h2 className="text-xl font-black text-white tracking-tight mt-0.5">
            {speakerPlayer?.name}
          </h2>
        </div>

        {/* Statement Card */}
        <div className="w-full bg-[#14141E] rounded-3xl border border-white/10 p-4 text-center shadow-lg">
          <span className="text-xs font-semibold text-white/40">Topic Statement:</span>
          <div className="text-base font-black text-white mt-1 leading-snug">
            "{gs.statement}"
          </div>
        </div>

        {/* Shutter Well */}
        <div className="flex-1 w-full min-h-[260px]">
          <SecretRoleShutter
            title="Secret Directive"
            subtitle="Argue your position out loud with total conviction"
            warningText="Hold to reveal secret directive"
          >
            {isSpeaker ? (
              <div className="flex flex-col items-center justify-center gap-2 p-2 text-center">
                <div
                  className={`
                    px-3.5 py-1.5 rounded-full text-xs font-bold
                    ${gs.directive === 'TRUTH'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                    }
                  `}
                >
                  {gs.directive === 'TRUTH' ? 'Speak Your Truth' : "Devil's Advocate"}
                </div>

                <div className="text-xl font-black text-white tracking-tight mt-1">
                  {gs.directive === 'TRUTH' ? 'Defend what you truly believe' : 'Argue for the opposite side!'}
                </div>

                <p className="text-xs text-white/60 max-w-[280px] leading-relaxed mt-1">
                  {gs.directive === 'TRUTH'
                    ? 'Give your real, genuine opinion on this topic with passion and honesty.'
                    : 'Argue passionately for a viewpoint you actually disagree with. Try to fool the room!'}
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-center p-2">
                <span className="text-xs font-semibold text-white/40">Audience Role:</span>
                <p className="text-xs text-white/70 max-w-[260px] leading-relaxed">
                  Listen closely to {speakerPlayer?.name}'s 45-second rant. You will vote on whether they are telling the truth or playing Devil's Advocate!
                </p>
              </div>
            )}
          </SecretRoleShutter>
        </div>

        {/* Host Advance */}
        {isHost ? (
          <ArcadeButton
            color="amber"
            size="lg"
            fullWidth
            onClick={() => advancePhase('ACTION')}
          >
            Start 45s Rant
          </ArcadeButton>
        ) : (
          <div className="py-3.5 px-4 rounded-2xl bg-white/5 border border-white/5 text-center text-xs font-medium text-white/40">
            Waiting for host to start rant timer...
          </div>
        )}
      </div>
    );
  }

  // 2. ACTION PHASE: 45s Rant & Live Reactions
  if (room.phase === 'ACTION') {
    return (
      <div className="w-full h-full flex flex-col justify-between gap-3 p-4 select-none relative overflow-hidden">
        {/* Floating live reaction bubbles */}
        <div className="absolute inset-x-4 top-16 bottom-24 pointer-events-none overflow-hidden z-20">
          <AnimatePresence>
            {gs.reactions?.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 1, y: 120, x: (Math.random() - 0.5) * 160, scale: 0.8 }}
                animate={{ opacity: 0, y: -60, scale: 1.2 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.8, ease: 'easeOut' }}
                className="absolute left-1/2 bottom-8 -translate-x-1/2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black shadow-lg"
              >
                {r.badge === 'SUS' && '🚨 Sus'}
                {r.badge === 'SPICY' && '🔥 Spicy'}
                {r.badge === 'CAP' && '🧢 Cap'}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Timer Header */}
        <div className="text-center">
          <span className="text-xs font-semibold text-white/40">Speaking Time Remaining</span>
          <div className="text-4xl font-black text-amber-400 mt-0.5">
            {rantTimer}s
          </div>
        </div>

        {/* Statement Card */}
        <div className="flex-1 w-full bg-[#14141E] rounded-3xl border border-white/10 p-5 flex flex-col items-center justify-between text-center shadow-xl">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{speakerPlayer?.avatar}</span>
            <span className="text-sm font-bold text-white/80">{speakerPlayer?.name} is on the mic</span>
          </div>

          <div className="text-xl font-black text-white p-4 bg-white/5 rounded-2xl w-full my-auto leading-snug">
            "{gs.statement}"
          </div>

          <p className="text-xs text-white/40 max-w-[260px]">
            {isSpeaker 
              ? 'Defend your assigned position with everything you have!'
              : 'Listen to tone, hesitation, and body language!'}
          </p>
        </div>

        {/* Audience Live Reactions or Speaker Mic */}
        <div className="w-full">
          {!isSpeaker ? (
            <div className="flex flex-col gap-2">
              <span className="text-center text-xs font-semibold text-white/40">Send live reaction:</span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => sendReaction('SUS')}
                  className="py-3 px-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold text-white transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span>🚨</span>
                  <span>Sus</span>
                </button>
                <button
                  type="button"
                  onClick={() => sendReaction('SPICY')}
                  className="py-3 px-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold text-white transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span>🔥</span>
                  <span>Spicy</span>
                </button>
                <button
                  type="button"
                  onClick={() => sendReaction('CAP')}
                  className="py-3 px-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs font-bold text-white transition-all active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <span>🧢</span>
                  <span>Cap</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="py-3.5 px-4 rounded-2xl bg-white/5 border border-white/5 text-center text-xs font-medium text-white/40">
              Rant out loud to the room!
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. VOTING PHASE
  if (room.phase === 'VOTING') {
    return (
      <div className="w-full h-full flex flex-col justify-between gap-3 p-4 select-none">
        <div className="text-center">
          <h2 className="text-xl font-black text-white tracking-tight">
            Real or Cap?
          </h2>
          <p className="text-xs text-white/40 mt-0.5">
            Was {speakerPlayer?.name} speaking their truth or playing Devil's Advocate?
          </p>
        </div>

        {/* Statement Recall */}
        <div className="w-full bg-[#14141E] rounded-3xl border border-white/10 p-4 text-center">
          <div className="text-sm font-bold text-white/90">
            "{gs.statement}"
          </div>
        </div>

        {/* Voting Options */}
        <div className="flex-1 w-full flex flex-col justify-center gap-3">
          {isSpeaker ? (
            <div className="py-6 px-4 rounded-3xl bg-[#14141E] border border-white/10 text-center flex flex-col items-center gap-2">
              <span className="text-2xl">🤫</span>
              <span className="text-sm font-bold text-white">You are the Speaker</span>
              <p className="text-xs text-white/40 max-w-[240px]">
                The audience is voting now. If you fool them, you take the points!
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => dispatchIntent('SUBMIT_VOTE', 'TRUTH')}
                className={`w-full py-4 px-5 rounded-2xl font-bold text-sm flex items-center justify-between transition-all duration-150 active:scale-95 ${
                  myVote === 'TRUTH'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 ring-2 ring-emerald-400'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">💚</span>
                  <div className="text-left">
                    <div className="font-black text-base">Real Talk</div>
                    <div className="text-xs text-white/50">They genuinely believe this</div>
                  </div>
                </div>
                {myVote === 'TRUTH' && <Check className="w-5 h-5" />}
              </button>

              <button
                type="button"
                onClick={() => dispatchIntent('SUBMIT_VOTE', 'BLUFF')}
                className={`w-full py-4 px-5 rounded-2xl font-bold text-sm flex items-center justify-between transition-all duration-150 active:scale-95 ${
                  myVote === 'BLUFF'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 ring-2 ring-rose-400'
                    : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">🔴</span>
                  <div className="text-left">
                    <div className="font-black text-base">Total Cap</div>
                    <div className="text-xs text-white/50">Devil's Advocate / Faking it</div>
                  </div>
                </div>
                {myVote === 'BLUFF' && <Check className="w-5 h-5" />}
              </button>
            </div>
          )}
        </div>

        {/* Voting Progress */}
        <div className="w-full bg-white/5 rounded-2xl p-3 flex items-center justify-between text-xs text-white/40">
          <span>Votes Cast:</span>
          <span className="font-bold text-white">
            {Object.keys(gs.votes || {}).length} of {room.players.filter((p) => p.id !== gs.speakerId).length}
          </span>
        </div>
      </div>
    );
  }

  // 4. REVEAL PHASE
  const actualDirective = gs.directive;
  const speakerPoints = gs.speakerPoints || 0;

  return (
    <div className="w-full h-full flex flex-col justify-between gap-3 p-4 select-none overflow-y-auto no-scrollbar">
      <div className="text-center">
        <h2 className="text-2xl font-black text-white tracking-tight">
          {actualDirective === 'TRUTH' ? 'It was 100% Real Talk!' : "It was Devil's Advocate!"}
        </h2>
      </div>

      {/* Outcome Card */}
      <div className="w-full bg-[#14141E] rounded-3xl border border-white/10 p-5 flex flex-col items-center text-center gap-3 shadow-xl">
        <div className="text-3xl">
          {actualDirective === 'TRUTH' ? '💚' : '😈'}
        </div>

        <div className="text-base font-bold text-white">
          {speakerPlayer?.name} was {actualDirective === 'TRUTH' ? 'telling their genuine truth' : 'playing Devil’s Advocate'}!
        </div>

        <div className="text-xs text-white/50 max-w-[260px] leading-relaxed">
          {speakerPoints > 0 
            ? `Successfully fooled the room! (+${speakerPoints} tickets)`
            : 'The room saw right through it!'}
        </div>
      </div>

      {/* Statement Recall */}
      <div className="w-full bg-[#14141E] rounded-3xl border border-white/10 p-4 text-center">
        <span className="text-xs font-semibold text-white/40">The topic was:</span>
        <div className="text-sm font-bold text-white mt-1">
          "{gs.statement}"
        </div>
      </div>

      {/* Controls */}
      <div className="w-full flex flex-col gap-2 pt-1">
        {isHost && (
          <ArcadeButton
            color="amber"
            size="lg"
            fullWidth
            onClick={() => startGame('HOT_TAKES')}
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Next Hot Seat Round
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
