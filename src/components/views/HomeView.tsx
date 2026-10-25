import React from 'react';
import { LogIn } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import type { GameType } from '../../types/game';

interface GameCard {
  id: GameType;
  emoji: string;
  name: string;
  tagline: string;
  minPlayers: number;
  maxPlayers: number;
  gradient: string;
  shadowColor: string;
  textColor: string;
}

const GAMES: GameCard[] = [
  {
    id: 'WAVELENGTH',
    emoji: '📻',
    name: 'Wavelength',
    tagline: 'Tune into each other\'s minds',
    minPlayers: 2,
    maxPlayers: 15,
    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
    shadowColor: 'rgba(14, 165, 233, 0.45)',
    textColor: '#fff',
  },
  {
    id: 'HOT_TAKES',
    emoji: '🔥',
    name: 'Hot Seat',
    tagline: 'Real talk or total cap?',
    minPlayers: 2,
    maxPlayers: 12,
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    shadowColor: 'rgba(16, 185, 129, 0.45)',
    textColor: '#fff',
  },
  {
    id: 'CHAMELEON',
    emoji: '🦎',
    name: 'Chameleon',
    tagline: 'Find the spy in the group',
    minPlayers: 3,
    maxPlayers: 12,
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
    shadowColor: 'rgba(124, 58, 237, 0.45)',
    textColor: '#fff',
  },
  {
    id: 'FAKIN_IT',
    emoji: '🕵️',
    name: "Fakin' It",
    tagline: 'Who has no idea what\'s going on?',
    minPlayers: 3,
    maxPlayers: 10,
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    shadowColor: 'rgba(245, 158, 11, 0.45)',
    textColor: '#fff',
  },
];

export const HomeView: React.FC = () => {
  const { selectGameForDetail, navigateTo, setSetupMode } = useGameStore();

  const handleJoinWithCode = () => {
    setSetupMode('JOIN');
    navigateTo('SETUP');
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🎮</span>
          <span
            className="text-xl font-black tracking-tight"
            style={{ color: '#fff', letterSpacing: '-0.02em' }}
          >
            HouseParty
          </span>
        </div>
        <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
          Pick a game to get started
        </p>
      </div>

      {/* Game grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {GAMES.map((game) => (
            <button
              key={game.id}
              type="button"
              id={`game-card-${game.id.toLowerCase()}`}
              onClick={() => selectGameForDetail(game.id)}
              className="relative flex flex-col justify-between rounded-3xl p-4 text-left transition-all duration-150 active:scale-95 border border-white/10"
              style={{
                background: game.gradient,
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5), 0 4px 10px -2px rgba(0,0,0,0.25)',
                minHeight: '158px',
                color: game.textColor,
              }}
            >
              {/* Min/Max player badges */}
              <div className="flex items-center justify-between w-full mb-1">
                <div
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/25 text-white/95"
                >
                  Min: {game.minPlayers} · Max: {game.maxPlayers}
                </div>
                {game.minPlayers === 2 && (
                  <span
                    className="text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider bg-white/25 text-white"
                  >
                    2P
                  </span>
                )}
              </div>

              {/* Emoji */}
              <div className="text-3xl mb-1 select-none" aria-hidden>
                {game.emoji}
              </div>

              {/* Name + tagline */}
              <div>
                <div className="text-base font-black leading-tight tracking-tight">
                  {game.name}
                </div>
                <div className="text-xs mt-0.5 leading-snug line-clamp-2 text-white/80">
                  {game.tagline}
                </div>
              </div>

              {/* Tap arrow */}
              <div
                className="absolute bottom-3.5 right-3.5 w-6 h-6 rounded-full flex items-center justify-center text-xs bg-white/20 text-white"
              >
                →
              </div>
            </button>
          ))}
        </div>

        {/* Join with code */}
        <button
          type="button"
          id="join-with-code-btn"
          onClick={handleJoinWithCode}
          className="mt-4 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold bg-white text-slate-900 transition-all hover:bg-white/95 active:scale-[0.98] shadow-lg shadow-white/5"
        >
          <LogIn className="w-4 h-4" />
          Join Room with Code
        </button>

        {/* Footer hint */}
        <div className="mt-3 text-center">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
            All games work 100% offline · No accounts needed
          </p>
        </div>
      </div>
    </div>
  );
};
