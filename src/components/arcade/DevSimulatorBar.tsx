import React from 'react';
import { Bot, Sparkles } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export const DevSimulatorBar: React.FC = () => {
  const { 
    room, 
    localPlayer, 
    devPerspectiveId, 
    setDevPerspective, 
    isDevSimActive,
    handleIncomingIntent
  } = useGameStore();

  if (!isDevSimActive || !room) return null;

  const currentPerspective = devPerspectiveId || localPlayer.id;

  // Bot Auto-Action Helper: automatically fills reasonable bot inputs for current game phase
  const autoFillBotActions = () => {
    if (!room.gameState) return;
    const botPlayers = room.players.filter((p) => p.id.startsWith('bot-'));

    if (room.activeGame === 'CHAMELEON' && room.phase === 'VOTING') {
      // Each bot votes for a random other player
      botPlayers.forEach((bot) => {
        const otherPlayers = room.players.filter((p) => p.id !== bot.id);
        const randomTarget = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
        handleIncomingIntent({
          playerId: bot.id,
          action: 'SUBMIT_VOTE',
          data: randomTarget.id,
        });
      });
    } else if (room.activeGame === 'WAVELENGTH' && room.phase === 'VOTING') {
      // Each non-psychic bot guesses near the middle or random
      botPlayers.forEach((bot) => {
        if (bot.id !== room.gameState.psychicId) {
          const guess = Math.floor(Math.random() * 50) + 25;
          handleIncomingIntent({
            playerId: bot.id,
            action: 'LOCK_DIAL',
            data: guess,
          });
        }
      });
    } else if (room.activeGame === 'FAKIN_IT' && room.phase === 'VOTING') {
      botPlayers.forEach((bot) => {
        const otherPlayers = room.players.filter((p) => p.id !== bot.id);
        const randomTarget = otherPlayers[Math.floor(Math.random() * otherPlayers.length)];
        handleIncomingIntent({
          playerId: bot.id,
          action: 'SUBMIT_VOTE',
          data: randomTarget.id,
        });
      });
    } else if (room.activeGame === 'HOT_TAKES' && room.phase === 'VOTING') {
      botPlayers.forEach((bot) => {
        if (bot.id !== room.gameState.speakerId) {
          const vote = Math.random() > 0.5 ? 'TRUTH' : 'BLUFF';
          handleIncomingIntent({
            playerId: bot.id,
            action: 'SUBMIT_VOTE',
            data: vote,
          });
        }
      });
    }
  };

  return (
    <div className="w-full bg-[#181525] border-2 border-amber-500/50 rounded-xl p-2 shadow-xl flex flex-col gap-1.5 z-40 animate-in fade-in slide-in-from-top-1">
      <div className="flex items-center justify-between text-[11px] font-mono text-amber-300 font-bold px-1">
        <div className="flex items-center gap-1.5">
          <Bot className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>DEV SIMULATOR PERSPECTIVE</span>
        </div>

        {/* Quick auto-complete bot actions */}
        <button
          type="button"
          onClick={autoFillBotActions}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 text-[10px] font-bold"
          title="Auto-cast votes or actions for all 3 bots"
        >
          <Sparkles className="w-3 h-3 text-amber-300" />
          <span>AUTO-BOTS</span>
        </button>
      </div>

      {/* 4 Quick-Switch Perspective Tabs */}
      <div className="grid grid-cols-4 gap-1">
        {/* Host Perspective */}
        <button
          type="button"
          onClick={() => setDevPerspective(null)}
          className={`
            py-1.5 px-1 rounded-lg text-[10px] font-mono font-bold uppercase border flex flex-col items-center gap-0.5 transition-all
            ${currentPerspective === localPlayer.id
              ? 'bg-cyan-500 text-[#12111A] border-cyan-300 shadow-[0_2px_8px_rgba(0,240,255,0.4)]'
              : 'bg-[#12111A] text-gray-400 border-[#2D2A3E] hover:text-white'
            }
          `}
        >
          <span className="text-xs">{localPlayer.avatar}</span>
          <span className="truncate w-full text-center">YOU (HOST)</span>
        </button>

        {/* Bot 1: Rohit */}
        <button
          type="button"
          onClick={() => setDevPerspective('bot-rohit')}
          className={`
            py-1.5 px-1 rounded-lg text-[10px] font-mono font-bold uppercase border flex flex-col items-center gap-0.5 transition-all
            ${currentPerspective === 'bot-rohit'
              ? 'bg-rose-500 text-white border-rose-300 shadow-[0_2px_8px_rgba(244,63,94,0.4)]'
              : 'bg-[#12111A] text-gray-400 border-[#2D2A3E] hover:text-white'
            }
          `}
        >
          <span className="text-xs">🦊</span>
          <span className="truncate w-full text-center">ROHIT</span>
        </button>

        {/* Bot 2: Aditya */}
        <button
          type="button"
          onClick={() => setDevPerspective('bot-aditya')}
          className={`
            py-1.5 px-1 rounded-lg text-[10px] font-mono font-bold uppercase border flex flex-col items-center gap-0.5 transition-all
            ${currentPerspective === 'bot-aditya'
              ? 'bg-emerald-500 text-[#12111A] border-emerald-300 shadow-[0_2px_8px_rgba(16,185,129,0.4)]'
              : 'bg-[#12111A] text-gray-400 border-[#2D2A3E] hover:text-white'
            }
          `}
        >
          <span className="text-xs">🤖</span>
          <span className="truncate w-full text-center">ADITYA</span>
        </button>

        {/* Bot 3: Suraj */}
        <button
          type="button"
          onClick={() => setDevPerspective('bot-suraj')}
          className={`
            py-1.5 px-1 rounded-lg text-[10px] font-mono font-bold uppercase border flex flex-col items-center gap-0.5 transition-all
            ${currentPerspective === 'bot-suraj'
              ? 'bg-purple-500 text-white border-purple-300 shadow-[0_2px_8px_rgba(168,85,247,0.4)]'
              : 'bg-[#12111A] text-gray-400 border-[#2D2A3E] hover:text-white'
            }
          `}
        >
          <span className="text-xs">🍕</span>
          <span className="truncate w-full text-center">SURAJ</span>
        </button>
      </div>
    </div>
  );
};
