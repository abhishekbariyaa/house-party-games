import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, Skull, Target, Home } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { ArcadeButton } from '../arcade/ArcadeButton';
import { soundFX } from '../../utils/audio';

export const ReceiptView: React.FC = () => {
  const { room, localPlayer, resetToLobby } = useGameStore();

  useEffect(() => {
    soundFX.ticketPrint();
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.5 },
    });
  }, []);

  if (!room) return null;

  const players = [...room.players];
  const isHost = localPlayer.isHost;

  // 1. Grand Champion: highest score
  const grandChampion = [...players].sort((a, b) => b.score - a.score)[0];

  // 2. Master Deceiver: most bluffs won
  const masterDeceiver = [...players].sort((a, b) => b.stats.bluffsWon - a.stats.bluffsWon)[0];

  // 3. Easy Target: fooled the most times
  const easyTarget = [...players].sort((a, b) => b.stats.timesFooled - a.stats.timesFooled)[0];

  return (
    <div className="w-full h-full flex flex-col justify-between overflow-y-auto no-scrollbar select-none pb-2 gap-2">
      {/* Animated Jagged-Edge Thermal Receipt */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="w-full bg-[#FFF8E7] text-[#12111A] rounded-2xl p-4 border-2 border-[#12111A] shadow-[0_8px_20px_rgba(0,0,0,0.6)] font-mono flex flex-col gap-3 relative"
      >
        {/* Receipt Header */}
        <div className="text-center border-b-2 border-dashed border-[#12111A]/40 pb-2">
          <div className="text-[10px] tracking-widest font-black uppercase text-gray-700">
            *** OFFICIAL ARCADE AUDIT ***
          </div>
          <div className="font-display font-black text-2xl uppercase tracking-wider text-[#12111A]">
            HOUSEPARTY ARCADE
          </div>
          <div className="text-[10px] text-gray-600 font-bold">
            ROOM: {room.roomCode} • TOTAL ROUNDS: {room.roundNumber}
          </div>
        </div>

        {/* Grand Champion Trophy Section */}
        <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#12111A] text-2xl flex items-center justify-center">
              {grandChampion?.avatar}
            </div>
            <div>
              <div className="text-[9px] uppercase font-black text-amber-800 tracking-wider flex items-center gap-1">
                <Trophy className="w-3 h-3 text-amber-600 inline" />
                GRAND CHAMPION
              </div>
              <div className="text-base font-display font-black text-[#12111A] uppercase">
                {grandChampion?.name}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-black text-[#12111A]">{grandChampion?.score}</div>
            <div className="text-[9px] text-gray-600 uppercase">TICKETS</div>
          </div>
        </div>

        {/* Superlative Awards */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {/* Master Deceiver */}
          <div className="p-2.5 bg-purple-500/10 rounded-xl border border-purple-500/20 flex flex-col justify-between">
            <div className="text-[9px] uppercase font-black text-purple-800 flex items-center gap-1">
              <Skull className="w-3 h-3 text-purple-600" />
              MASTER DECEIVER
            </div>
            <div className="text-sm font-display font-black text-[#12111A] uppercase truncate mt-1">
              {masterDeceiver?.name}
            </div>
            <div className="text-[10px] text-gray-600 mt-0.5">
              {masterDeceiver?.stats.bluffsWon} BLUFFS WON
            </div>
          </div>

          {/* Easy Target */}
          <div className="p-2.5 bg-rose-500/10 rounded-xl border border-rose-500/20 flex flex-col justify-between">
            <div className="text-[9px] uppercase font-black text-rose-800 flex items-center gap-1">
              <Target className="w-3 h-3 text-rose-600" />
              EASY TARGET
            </div>
            <div className="text-sm font-display font-black text-[#12111A] uppercase truncate mt-1">
              {easyTarget?.name}
            </div>
            <div className="text-[10px] text-gray-600 mt-0.5">
              FOOLED {easyTarget?.stats.timesFooled} TIMES
            </div>
          </div>
        </div>

        {/* Complete Leaderboard */}
        <div className="flex flex-col gap-1 border-t-2 border-dashed border-[#12111A]/30 pt-2">
          <div className="text-[9px] font-black uppercase text-gray-600 tracking-wider">
            PARTY LEADERBOARD:
          </div>
          <div className="flex flex-col gap-1">
            {[...players]
              .sort((a, b) => b.score - a.score)
              .map((p, idx) => (
                <div key={p.id} className="flex items-center justify-between text-xs font-bold">
                  <span className="truncate">
                    #{idx + 1} {p.avatar} {p.name}
                  </span>
                  <span className="font-mono text-[#12111A] shrink-0">
                    {p.score} 🎟️
                  </span>
                </div>
              ))}
          </div>
        </div>


        {/* Barcode Footer */}
        <div className="border-t-2 border-dashed border-[#12111A]/30 pt-3 flex flex-col items-center gap-1">
          {/* Simulated 1D Barcode */}
          <div className="flex items-center justify-center gap-[2px] h-8 w-full max-w-[240px] px-2 overflow-hidden">
            {Array.from({ length: 48 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#12111A] h-full"
                style={{
                  width: `${(i % 3) + 1.5}px`,
                  opacity: i % 7 === 0 ? 0.3 : 1,
                }}
              />
            ))}
          </div>
          <div className="text-[9px] font-mono tracking-widest text-gray-500 font-bold">
            NO REFUNDS • THANKS FOR PLAYING
          </div>
        </div>
      </motion.div>

      {/* Navigation Buttons */}
      <div className="w-full flex items-center gap-2 pt-1">
        {isHost ? (
          <ArcadeButton
            color="amber"
            size="lg"
            fullWidth
            soundType="coin"
            onClick={() => resetToLobby()}
            icon={<Home className="w-4 h-4" />}
          >
            RETURN TO LOBBY
          </ArcadeButton>
        ) : (
          <div className="w-full py-3 px-4 rounded-xl bg-[#1C1A27] border border-[#2D2A3E] text-center text-xs font-mono text-gray-400">
            Waiting for host to return to lobby...
          </div>
        )}
      </div>
    </div>
  );
};
