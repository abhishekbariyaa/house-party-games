import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import type { GameType } from '../../types/game';

const AVATARS = ['👾', '🦊', '🐼', '🐯', '🦁', '🐸', '🦋', '🐙', '🐺', '🦄', '🐲', '🤖'];

const COLORS = [
  '#00F0FF', '#7C3AED', '#F59E0B', '#10B981',
  '#EF4444', '#EC4899', '#3B82F6', '#F97316',
];

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

export const SetupView: React.FC = () => {
  const { setupMode, selectedGameType, navigateTo, createRoom, joinRoom, localPlayer } = useGameStore();

  const isCreating = setupMode === 'CREATE';
  const [name, setName] = useState(localPlayer.name !== 'PLAYER 1' ? localPlayer.name : '');
  const [roomCode, setRoomCode] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(localPlayer.avatar || '👾');
  const [selectedColor, setSelectedColor] = useState(localPlayer.color || '#00F0FF');
  const [error, setError] = useState('');

  const gradient = (selectedGameType && GAME_GRADIENTS[selectedGameType]) || 'linear-gradient(135deg, #7C3AED, #4F46E5)';
  const gameName = (selectedGameType && GAME_NAMES[selectedGameType]) || 'Game';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Enter your name to continue.');
      return;
    }

    if (!isCreating) {
      const code = roomCode.trim().toUpperCase();
      if (code.length !== 4) {
        setError('Room code must be 4 characters.');
        return;
      }
      joinRoom(code, trimmedName, selectedAvatar, selectedColor);
    } else {
      createRoom(trimmedName, selectedAvatar, selectedColor);
    }
  };

  const handleBack = () => {
    if (!isCreating || !selectedGameType) {
      navigateTo('HOME');
    } else {
      navigateTo('GAME_DETAIL');
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 shrink-0 flex items-center gap-3">
        <button
          type="button"
          id="back-to-game-detail"
          onClick={handleBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ background: 'rgba(255,255,255,0.08)' }}
          aria-label="Back"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div>
          <div className="text-base font-black text-white" style={{ letterSpacing: '-0.02em' }}>
            {isCreating ? 'Create Room' : 'Join Room'}
          </div>
          <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {isCreating ? gameName : 'Enter the 4-letter code'}
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar px-4 pb-4 flex flex-col gap-4">
        {/* Room code (join only) */}
        {!isCreating && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="room-code-input" className="text-xs font-semibold text-white/60">
              Room Code
            </label>
            <input
              id="room-code-input"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4))}
              placeholder="ABCD"
              autoComplete="off"
              autoCapitalize="characters"
              maxLength={4}
              className="w-full py-3.5 px-4 rounded-2xl text-center text-3xl font-black tracking-[0.25em] text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all bg-white/5 border border-white/10"
            />
          </div>
        )}

        {/* Name */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="player-name-input" className="text-xs font-semibold text-white/60">
            Your Name
          </label>
          <input
            id="player-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 18))}
            placeholder="Enter your nickname"
            maxLength={18}
            autoComplete="off"
            className="w-full py-3.5 px-4 rounded-2xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all bg-white/5 border border-white/10 placeholder:text-white/30"
          />
        </div>

        {/* Avatar */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-white/60">
            Choose Avatar
          </label>
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map((av) => (
              <button
                key={av}
                type="button"
                id={`avatar-${av}`}
                onClick={() => setSelectedAvatar(av)}
                className={`aspect-square rounded-2xl text-xl flex items-center justify-center transition-all duration-150 active:scale-95 ${
                  selectedAvatar === av
                    ? 'bg-indigo-600 text-white ring-2 ring-white/40 shadow-lg shadow-indigo-600/30'
                    : 'bg-white/5 hover:bg-white/10 text-white/80 border border-white/5'
                }`}
                aria-label={`Avatar ${av}`}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-white/60">
            Color Accent
          </label>
          <div className="flex gap-2">
            {COLORS.map((col) => (
              <button
                key={col}
                type="button"
                id={`color-${col.replace('#', '')}`}
                onClick={() => setSelectedColor(col)}
                className="w-8 h-8 rounded-full transition-all duration-150 active:scale-90"
                style={{
                  background: col,
                  outline: selectedColor === col ? `3px solid white` : '3px solid transparent',
                  outlineOffset: '2px',
                  transform: selectedColor === col ? 'scale(1.15)' : 'scale(1)',
                }}
                aria-label={`Color ${col}`}
              />
            ))}
          </div>
        </div>

        {/* Preview pill */}
        <div
          className="flex items-center gap-3 p-3.5 rounded-2xl bg-white/5 border border-white/5"
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold shrink-0"
            style={{ background: selectedColor + '25', border: `2px solid ${selectedColor}` }}
          >
            {selectedAvatar}
          </div>
          <div>
            <div className="text-sm font-bold text-white">{name || 'Your name'}</div>
            <div className="text-xs text-white/40">
              {isCreating ? 'Host' : 'Player'}
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-3 py-2 rounded-xl text-sm font-medium" style={{ background: 'rgba(239,68,68,0.15)', color: '#FCA5A5' }}>
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          id="setup-submit-btn"
          className="w-full py-4 rounded-2xl text-sm font-black text-white transition-transform active:scale-95"
          style={{
            background: gradient,
            boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
            letterSpacing: '-0.01em',
          }}
        >
          {isCreating ? '✨ Create Room' : '🚀 Join Room'}
        </button>
      </form>
    </div>
  );
};
