import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import type { GameType } from '../../types/game';

interface TutorialStep {
  icon: string;
  title: string;
  body: string;
}

interface GameInfo {
  emoji: string;
  name: string;
  players: string;
  gradient: string;
  shadowColor: string;
  steps: TutorialStep[];
}

const GAME_INFO: Record<GameType, GameInfo> = {
  CHAMELEON: {
    emoji: '🦎',
    name: 'Chameleon',
    players: 'Min: 3 · Max: 12 players',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
    shadowColor: 'rgba(124, 58, 237, 0.4)',
    steps: [
      {
        icon: '🃏',
        title: 'Deal the roles',
        body: 'Everyone sees the same secret word grid — except ONE player, the Chameleon, who gets a blank card.',
      },
      {
        icon: '💬',
        title: 'Give a clue',
        body: 'Going around the room, each player says ONE clue word that hints at the secret word without being too obvious.',
      },
      {
        icon: '🗳️',
        title: 'Vote & debate',
        body: 'After everyone speaks, discuss and vote on who you think is the Chameleon trying to blend in.',
      },
      {
        icon: '⚡',
        title: 'Sudden death',
        body: 'Caught Chameleon? They get 15 seconds to guess the secret word and steal the win. Outsmart everyone!',
      },
    ],
  },
  WAVELENGTH: {
    emoji: '📻',
    name: 'Wavelength',
    players: 'Min: 2 · Max: 15 players',
    gradient: 'linear-gradient(135deg, #0EA5E9 0%, #06B6D4 100%)',
    shadowColor: 'rgba(14, 165, 233, 0.4)',
    steps: [
      {
        icon: '🎯',
        title: 'Secret target',
        body: 'The Radio Operator secretly sees where on the spectrum (e.g. COLD → HOT) the target sits.',
      },
      {
        icon: '🗣️',
        title: 'Give one clue',
        body: 'The Radio Operator gives exactly ONE clue word that describes where on the spectrum the target lands.',
      },
      {
        icon: '🎛️',
        title: 'Tune your dial',
        body: 'Everyone else drags their dial to where they think the clue word points on the spectrum.',
      },
      {
        icon: '🏆',
        title: 'Score points',
        body: 'Closer to the bullseye = more tickets. A perfect match wins the round for everyone!',
      },
    ],
  },
  FAKIN_IT: {
    emoji: '🕵️',
    name: "Fakin' It",
    players: 'Min: 3 · Max: 10 players',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    shadowColor: 'rgba(245, 158, 11, 0.4)',
    steps: [
      {
        icon: '📱',
        title: 'Get your prompt',
        body: 'Everyone gets the SAME secret physical prompt on their phone — except the Faker, who gets a blank.',
      },
      {
        icon: '🙌',
        title: 'Act simultaneously',
        body: 'On GO, everyone performs the action at the same time (raise your hand, stand up, point at someone...).',
      },
      {
        icon: '😅',
        title: 'Faker must improvise',
        body: 'The Faker has no idea what the prompt is. They must watch others and react naturally without getting caught!',
      },
      {
        icon: '🔍',
        title: 'Vote the faker out',
        body: 'Discuss who looked confused and vote them out. Faker survives = they win big. Caught = everyone else scores!',
      },
    ],
  },
  HOT_TAKES: {
    emoji: '🔥',
    name: 'Hot Seat',
    players: 'Min: 2 · Max: 12 players',
    gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    shadowColor: 'rgba(16, 185, 129, 0.4)',
    steps: [
      {
        icon: '💺',
        title: 'Take the hot seat',
        body: 'One player sits in the Hot Seat and receives a spicy opinion statement to rant about.',
      },
      {
        icon: '🎭',
        title: 'Truth or Devil\'s Advocate?',
        body: 'Secretly, are they speaking their genuine truth 💚 or playing devil\'s advocate 🔴 for a position they hate?',
      },
      {
        icon: '🎙️',
        title: 'Rant for 45 seconds',
        body: 'The speaker defends the statement passionately. Audience reacts live: 🚨 Suspicious, 🔥 Spicy, 🧢 Cap.',
      },
      {
        icon: '🗳️',
        title: 'Vote: Real or Cap?',
        body: 'Everyone votes — is this their real opinion? Speaker earns tickets for every person they fool!',
      },
    ],
  },
  LOBBY: {
    emoji: '🏠',
    name: 'Lobby',
    players: '',
    gradient: '',
    shadowColor: '',
    steps: [],
  },
  RECEIPT: {
    emoji: '🧾',
    name: 'Receipt',
    players: '',
    gradient: '',
    shadowColor: '',
    steps: [],
  },
};

export const GameDetailView: React.FC = () => {
  const { selectedGameType, navigateTo, setSetupMode } = useGameStore();
  const [step, setStep] = useState(0);

  if (!selectedGameType || !GAME_INFO[selectedGameType]) return null;

  const info = GAME_INFO[selectedGameType];
  const steps = info.steps;
  const totalSteps = steps.length;

  const handleCreate = () => {
    setSetupMode('CREATE');
    navigateTo('SETUP');
  };

  const handleJoin = () => {
    setSetupMode('JOIN');
    navigateTo('SETUP');
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 shrink-0 flex items-center gap-3">
        <button
          type="button"
          id="back-to-home"
          onClick={() => navigateTo('HOME')}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
          style={{ background: 'rgba(255,255,255,0.08)' }}
          aria-label="Back to home"
        >
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>

        {/* Game badge */}
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl flex-1"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        >
          <span className="text-xl">{info.emoji}</span>
          <div>
            <div className="text-sm font-black text-white leading-tight">{info.name}</div>
            {info.players && (
              <div className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {info.players}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tutorial card area */}
      <div className="flex-1 overflow-hidden flex flex-col px-4 gap-3">
        {/* Section label */}
        <div className="flex items-center justify-between shrink-0 px-1">
          <span className="text-xs font-semibold text-white/50">
            Rules & Gameplay
          </span>
          <span className="text-xs font-semibold text-white/40">
            {step + 1} of {totalSteps}
          </span>
        </div>

        {/* Tutorial card */}
        <div
          className="flex-1 rounded-3xl p-6 flex flex-col justify-center gap-4 transition-all duration-200 border border-white/10"
          style={{
            background: info.gradient,
            boxShadow: '0 12px 30px -6px rgba(0,0,0,0.5)',
          }}
        >
          <div className="text-5xl text-center select-none">{steps[step]?.icon}</div>
          <div className="text-center">
            <h2 className="text-xl font-black text-white mb-2 tracking-tight">
              {steps[step]?.title}
            </h2>
            <p className="text-sm leading-relaxed text-white/85">
              {steps[step]?.body}
            </p>
          </div>
        </div>

        {/* Step dots + navigation */}
        <div className="shrink-0 flex items-center justify-center gap-4 py-1">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white disabled:opacity-20 transition-opacity bg-white/10"
            aria-label="Previous step"
          >
            ←
          </button>

          {/* Dots */}
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setStep(i)}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === step ? '20px' : '6px',
                  height: '6px',
                  background: i === step ? '#fff' : 'rgba(255,255,255,0.25)',
                }}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setStep((s) => Math.min(totalSteps - 1, s + 1))}
            disabled={step === totalSteps - 1}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white disabled:opacity-20 transition-opacity bg-white/10"
            aria-label="Next step"
          >
            →
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-4 pb-5 pt-3 shrink-0 flex flex-col gap-2.5">
        <button
          type="button"
          id="create-room-btn"
          onClick={handleCreate}
          className="w-full py-4 rounded-2xl text-sm font-bold bg-white text-slate-900 transition-all hover:bg-white/95 active:scale-[0.98] shadow-lg shadow-white/5"
        >
          Create Room (Host Game)
        </button>
        <button
          type="button"
          id="join-room-btn"
          onClick={handleJoin}
          className="w-full py-3.5 rounded-2xl text-sm font-semibold text-white/70 hover:text-white transition-all bg-white/5 hover:bg-white/10 active:scale-[0.98]"
        >
          Join Room with Code
        </button>
      </div>
    </div>
  );
};
