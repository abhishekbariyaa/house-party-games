import React, { useState } from 'react';
import { Copy, Check, Users, LogOut } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import type { GameType } from '../../types/game';

const GAME_NAMES: Partial<Record<GameType, string>> = {
  CHAMELEON: 'Chameleon',
  WAVELENGTH: 'Wavelength',
  FAKIN_IT: "Fakin' It",
  HOT_TAKES: 'Hot Seat',
};

const GAME_GRADIENTS: Partial<Record<GameType, string>> = {
  CHAMELEON: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
  WAVELENGTH: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
  FAKIN_IT: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  HOT_TAKES: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
};

const MIN_PLAYERS: Partial<Record<GameType, number>> = {
  CHAMELEON: 3,
  WAVELENGTH: 2,
  FAKIN_IT: 3,
  HOT_TAKES: 2,
};

const MAX_PLAYERS: Partial<Record<GameType, number>> = {
  CHAMELEON: 12,
  WAVELENGTH: 15,
  FAKIN_IT: 10,
  HOT_TAKES: 12,
};

export const LobbyView: React.FC = () => {
  const { room, localPlayer, startGame, goHome, selectedGameType } = useGameStore();
  const [copied, setCopied] = useState(false);

  if (!room) return null;

  const isHost = localPlayer.isHost;
  const gameType = selectedGameType as GameType;
  const gradient = (gameType && GAME_GRADIENTS[gameType]) || 'linear-gradient(135deg, #7C3AED, #4F46E5)';
  const gameName = (gameType && GAME_NAMES[gameType]) || 'Game';
  const minRequired = (gameType && MIN_PLAYERS[gameType]) || 2;
  const maxAllowed = (gameType && MAX_PLAYERS[gameType]) || 12;

  const shareText = `Join my ${gameName} room! Code: ${room.roomCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const canStart = room.players.length >= minRequired;

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="px-4 pt-4 pb-3 shrink-0 flex items-center justify-between">
        <div>
          <div className="text-base font-black text-white" style={{ letterSpacing: '-0.02em' }}>
            {gameName} Lobby
          </div>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            Share the code to invite friends
          </div>
        </div>
        <button
          type="button"
          id="leave-room-btn"
          onClick={goHome}
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(239,68,68,0.12)' }}
          aria-label="Leave room"
        >
          <LogOut className="w-4 h-4" style={{ color: '#FCA5A5' }} />
        </button>
      </div>

      {/* Room code card */}
      <div className="px-4 shrink-0">
        <div
          className="rounded-3xl p-5 flex items-center justify-between bg-[#14141E] border border-white/10 shadow-lg"
        >
          <div>
            <span className="text-xs font-semibold text-white/40 block mb-0.5">
              Room Code
            </span>
            <div className="text-3xl font-black text-white tracking-[0.2em]">
              {room.roomCode}
            </div>
          </div>
          <button
            type="button"
            id="copy-room-code"
            onClick={handleCopy}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all active:scale-95 ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-white/10 hover:bg-white/15 text-white'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy Code'}
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 flex flex-col gap-3">
        {/* Players */}
        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-white/40" />
              <span className="text-xs font-semibold text-white/60">
                Players ({room.players.length} / {maxAllowed})
              </span>
            </div>
            <span className="text-[11px] font-medium text-white/40">
              Min {minRequired} · Max {maxAllowed}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {room.players.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-2.5 p-2.5 rounded-2xl transition-all"
                style={{
                  background: p.id === localPlayer.id
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(255,255,255,0.05)',
                  border: p.id === localPlayer.id
                    ? '1.5px solid rgba(255,255,255,0.2)'
                    : '1.5px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ background: p.color + '30', border: `2px solid ${p.color}` }}
                >
                  {p.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-black text-white truncate uppercase">{p.name}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {p.isHost ? '👑 Host' : '🎮 Player'}
                  </div>
                </div>
              </div>
            ))}

            {/* Empty slots hint */}
            {room.players.length < minRequired && (
              <div
                className="flex items-center justify-center p-2.5 rounded-2xl col-span-2"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1.5px dashed rgba(255,255,255,0.1)',
                }}
              >
                <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Need at least {minRequired} players to start...
                </span>
              </div>
            )}
          </div>
        </div>


      </div>

      {/* Bottom action */}
      <div className="px-4 pb-5 pt-2 shrink-0">
        {isHost ? (
          <button
            type="button"
            id="start-game-btn"
            disabled={!canStart}
            onClick={() => startGame(gameType)}
            className="w-full py-4 rounded-2xl text-base font-black text-white transition-all active:scale-95 disabled:opacity-40"
            style={{
              background: canStart ? gradient : 'rgba(255,255,255,0.1)',
              boxShadow: canStart ? '0 8px 24px rgba(0,0,0,0.35)' : 'none',
              letterSpacing: '-0.01em',
            }}
          >
            {canStart ? `🚀 Start ${gameName}` : `⏳ Need ${minRequired - room.players.length} more player${minRequired - room.players.length !== 1 ? 's' : ''} (Min: ${minRequired})`}
          </button>
        ) : (
          <div
            className="w-full py-4 rounded-2xl text-center text-sm font-bold"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}
          >
            ⏳ Waiting for host to start...
          </div>
        )}
      </div>
    </div>
  );
};
