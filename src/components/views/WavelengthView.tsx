import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Radio, Send, Lock, RotateCcw, Check, Users } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import type { WavelengthGameState } from '../../types/game';
import { ArcadeButton } from '../arcade/ArcadeButton';
import { TactileDial } from '../arcade/TactileDial';

export const WavelengthView: React.FC = () => {
  const { 
    room, 
    localPlayer, 
    devPerspectiveId, 
    dispatchIntent, 
    startGame, 
    resetToLobby 
  } = useGameStore();

  const [clueInput, setClueInput] = useState('');
  const [localDialValue, setLocalDialValue] = useState(50);

  if (!room || !room.gameState) return null;

  const gs = room.gameState as WavelengthGameState;
  const activePerspectiveId = devPerspectiveId || localPlayer.id;
  const isPsychic = activePerspectiveId === gs.psychicId;
  const isHost = localPlayer.isHost;

  const psychicPlayer = room.players.find((p) => p.id === gs.psychicId);
  const isLocked = Boolean(gs.lockedGuesses?.[activePerspectiveId]);

  // Sync dial value with store
  useEffect(() => {
    if (gs.guesses?.[activePerspectiveId] !== undefined) {
      setLocalDialValue(gs.guesses[activePerspectiveId]);
    } else {
      setLocalDialValue(50);
    }
  }, [activePerspectiveId, gs.guesses]);

  // Trigger confetti on reveal
  useEffect(() => {
    if (room.phase === 'REVEAL') {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [room.phase]);

  const handleDialChange = (val: number) => {
    setLocalDialValue(val);
    dispatchIntent('WAVELENGTH_TUNE_VALUE', val);
  };

  const handleLockFrequency = () => {
    dispatchIntent('LOCK_DIAL', localDialValue);
  };

  const handleBroadcastClue = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clueInput.trim()) return;
    dispatchIntent('WAVELENGTH_SUBMIT_CLUE', clueInput.trim());
  };

  const revealedPins = room.players
    .filter((p) => p.id !== gs.psychicId && gs.guesses[p.id] !== undefined)
    .map((p) => ({
      playerId: p.id,
      name: p.name,
      avatar: p.avatar,
      color: p.color,
      guess: gs.guesses[p.id],
    }));

  // 1. ACTION PHASE: Clue Giving
  if (room.phase === 'ACTION' || room.phase === 'DEAL') {
    return (
      <div className="w-full h-full flex flex-col justify-between gap-3 p-4 select-none">
        {/* Spectrum Marquee */}
        <div className="text-center">
          <span className="text-xs font-semibold text-white/40">Spectrum</span>
          <div className="text-base font-black text-white mt-0.5 tracking-tight">
            {gs.spectrum[0]} ← → {gs.spectrum[1]}
          </div>
        </div>

        {/* Center Display */}
        <div className="flex-1 w-full bg-[#14141E] rounded-3xl border border-white/10 p-5 flex flex-col items-center justify-between shadow-xl">
          {/* Operator Banner */}
          <div className="w-full flex items-center justify-between text-xs font-medium text-white/40 border-b border-white/5 pb-2.5">
            <span className="flex items-center gap-1.5 text-indigo-400 font-bold">
              <Radio className="w-4 h-4" />
              Psychic: {psychicPlayer?.name}
            </span>
            <span className="text-lg">{psychicPlayer?.avatar}</span>
          </div>

          {/* Operator View vs Player View */}
          <div className="w-full my-auto flex flex-col items-center gap-3">
            {isPsychic ? (
              <div className="w-full flex flex-col items-center gap-2">
                <span className="text-xs font-semibold text-white/60">
                  Your Secret Target Position:
                </span>
                <div className="text-4xl font-black text-white px-5 py-1.5 rounded-2xl bg-white/10 mb-2">
                  {gs.targetValue}%
                </div>

                {/* Secret Bullseye Dial Preview */}
                <div className="w-full">
                  <TactileDial
                    value={gs.targetValue}
                    minLabel={gs.spectrum[0]}
                    maxLabel={gs.spectrum[1]}
                    showBullseye={true}
                    targetValue={gs.targetValue}
                    disabled={true}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Radio className="w-8 h-8 text-indigo-400 animate-pulse" />
                </div>
                <div className="text-base font-bold text-white tracking-tight">
                  Tuning into Psychic...
                </div>
                <p className="text-xs text-white/40 max-w-[260px] leading-relaxed">
                  {psychicPlayer?.name} is viewing the target and thinking of a clue to say aloud...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Control */}
        <div className="w-full">
          {isPsychic ? (
            <form onSubmit={handleBroadcastClue} className="flex flex-col gap-2">
              <input
                type="text"
                maxLength={45}
                value={clueInput}
                onChange={(e) => setClueInput(e.target.value)}
                placeholder="Type your clue (or speak aloud)..."
                className="w-full py-3.5 px-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500"
              />
              <ArcadeButton
                color="cyan"
                size="lg"
                fullWidth
                disabled={!clueInput.trim()}
                icon={<Send className="w-4 h-4" />}
              >
                Send Clue to Room
              </ArcadeButton>
            </form>
          ) : (
            <div className="py-3.5 px-4 rounded-2xl bg-white/5 border border-white/5 text-center text-xs font-medium text-white/40">
              Listen for {psychicPlayer?.name}'s clue in the room!
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. VOTING / TUNING PHASE: Players drag dial & lock
  if (room.phase === 'VOTING') {
    return (
      <div className="w-full h-full flex flex-col justify-between gap-3 p-4 select-none">
        {/* Clue Card */}
        <div className="w-full bg-[#14141E] rounded-3xl border border-white/10 p-4 flex flex-col items-center text-center gap-1 shadow-lg">
          <span className="text-xs font-semibold text-white/40">
            Psychic's Clue
          </span>
          <div className="text-xl font-black text-white tracking-tight">
            "{gs.clue || 'Clue spoken aloud'}"
          </div>
          <div className="text-xs text-white/50 mt-0.5">
            {gs.spectrum[0]} ← → {gs.spectrum[1]}
          </div>
        </div>

        {/* Tuner Deck */}
        <div className="flex-1 w-full bg-[#14141E] rounded-3xl border border-white/10 p-4 flex flex-col justify-between shadow-xl">
          <div className="flex items-center justify-between text-xs font-semibold text-white/40">
            <span>Spectrum Dial</span>
            <span className={isLocked ? 'text-emerald-400' : 'text-indigo-400'}>
              {isLocked ? 'Locked In' : 'Drag to tune'}
            </span>
          </div>

          {/* Notched Tactile Dial */}
          <div className="w-full my-auto">
            <TactileDial
              value={localDialValue}
              onChange={handleDialChange}
              disabled={isLocked || isPsychic}
              minLabel={gs.spectrum[0]}
              maxLabel={gs.spectrum[1]}
            />
          </div>

          {/* Locked Players Counter */}
          <div className="w-full flex items-center justify-between text-xs font-medium text-white/40 pt-2 border-t border-white/5">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              Players ready:
            </span>
            <span className="text-white font-bold">
              {Object.keys(gs.lockedGuesses || {}).length} of {room.players.filter((p) => p.id !== gs.psychicId).length}
            </span>
          </div>
        </div>

        {/* Bottom Lock Button */}
        <div className="w-full">
          {isPsychic ? (
            <div className="py-3.5 px-4 rounded-2xl bg-white/5 border border-white/5 text-center text-xs font-medium text-white/40">
              You are the Psychic. Watch the room debate their dial guess!
            </div>
          ) : isLocked ? (
            <div className="py-3.5 px-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center font-bold text-sm flex items-center justify-center gap-2">
              <Check className="w-4 h-4" />
              <span>Locked at {localDialValue}%</span>
            </div>
          ) : (
            <ArcadeButton
              color="amber"
              size="dome"
              fullWidth
              soundType="coin"
              onClick={handleLockFrequency}
              icon={<Lock className="w-4 h-4" />}
            >
              Lock in Guess ({localDialValue}%)
            </ArcadeButton>
          )}
        </div>
      </div>
    );
  }

  // 3. REVEAL PHASE
  const target = gs.targetValue;

  return (
    <div className="w-full h-full flex flex-col justify-between gap-3 p-4 select-none overflow-y-auto no-scrollbar">
      {/* Header Outcome */}
      <div className="text-center">
        <span className="text-xs font-semibold text-white/40">Target was</span>
        <h2 className="text-2xl font-black text-white tracking-tight mt-0.5">
          {target}% on Spectrum
        </h2>
        <div className="text-sm font-medium text-white/70 mt-0.5">
          Clue: "{gs.clue}"
        </div>
      </div>

      {/* Shared Revealed Spectrum Dial */}
      <div className="w-full bg-[#14141E] rounded-3xl border border-white/10 p-4 shadow-xl">
        <TactileDial
          value={target}
          minLabel={gs.spectrum[0]}
          maxLabel={gs.spectrum[1]}
          showBullseye={true}
          targetValue={target}
          revealedGuesses={revealedPins}
          disabled={true}
        />
      </div>

      {/* Scoring Breakdown Grid */}
      <div className="w-full bg-[#14141E] rounded-3xl border border-white/10 p-4 flex flex-col gap-2 shadow-xl">
        <div className="text-xs font-bold text-white/60 flex items-center justify-between pb-1 border-b border-white/5">
          <span>Points Awarded</span>
          <span className="text-[11px] text-white/40">±4: 400 · ±10: 300 · ±18: 150</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {room.players.map((p) => {
            const pts = gs.roundScores?.[p.id] || 0;
            const guess = gs.guesses[p.id];
            const isOp = p.id === gs.psychicId;
            return (
              <div key={p.id} className="flex items-center justify-between p-2 bg-white/5 rounded-xl border border-white/5">
                <span className="truncate text-white/80">
                  {p.name} {isOp ? '🔮' : `(${guess ?? '-'}%)`}
                </span>
                <span className={`font-bold ${pts > 0 ? 'text-emerald-400' : 'text-white/40'}`}>
                  +{pts}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Host Controls */}
      {isHost && (
        <div className="flex items-center gap-2 pt-1">
          <ArcadeButton
            color="cyan"
            size="md"
            fullWidth
            onClick={() => startGame('WAVELENGTH')}
            icon={<RotateCcw className="w-4 h-4" />}
          >
            Next Spectrum
          </ArcadeButton>
          <button
            type="button"
            onClick={resetToLobby}
            className="px-4 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 font-bold text-xs"
          >
            Lobby
          </button>
        </div>
      )}
    </div>
  );
};
