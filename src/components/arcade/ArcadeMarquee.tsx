import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Vibrate, 
  VibrateOff, 
  Users, 
  Wrench, 
  Clock, 
  FastForward, 
  Gamepad2, 
  Receipt, 
  ChevronDown, 
  ChevronUp,
  Zap
} from 'lucide-react';
import { useGameStore } from '../../store/gameStore';

export const ArcadeMarquee: React.FC = () => {
  const {
    room,
    localPlayer,
    devPerspectiveId,
    soundEnabled,
    hapticsEnabled,
    setSoundEnabled,
    setHapticsEnabled,
    toggleAFK,
    toggleDevSim,
    isDevSimActive,
    advancePhase,
    extendTimer,
    cashOutReceipt,
    resetToLobby,
  } = useGameStore();

  const [isHostMenuOpen, setIsHostMenuOpen] = useState(false);

  const activePlayerId = devPerspectiveId || localPlayer.id;
  const activePlayer = room?.players.find((p) => p.id === activePlayerId) || localPlayer;

  const connectedCount = room?.players.filter((p) => p.isConnected).length || 1;
  const isHost = localPlayer.isHost;

  const handleNextPhase = () => {
    if (!room) return;
    const order = ['LOBBY', 'DEAL', 'ACTION', 'DISCUSSION', 'VOTING', 'REVEAL'];
    const currentIdx = order.indexOf(room.phase);
    if (currentIdx !== -1 && currentIdx < order.length - 1) {
      advancePhase(order[currentIdx + 1] as any);
    } else {
      advancePhase('REVEAL');
    }
  };

  return (
    <header className="relative w-full z-40 flex flex-col gap-1.5 select-none" aria-label="Arcade Cabinet Header">
      {/* LED Dot-Matrix Top Bar */}
      <div className="w-full h-11 px-3 rounded-xl bg-[#1C1A27] border-2 border-[#2D2A3E] shadow-md flex items-center justify-between text-xs font-mono relative overflow-hidden">
        {/* Subtle dot matrix LED texture */}
        <div className="absolute inset-0 led-matrix pointer-events-none opacity-40" />

        {/* Left: Room Code & Ticket Counter */}
        <div className="flex items-center gap-2 z-10">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#12111A] border border-cyan-500/40 text-arcade-cyan font-bold">
            <span className="text-[10px] text-gray-500">RM:</span>
            <span className="font-display tracking-widest">{room?.roomCode || 'LOBBY'}</span>
          </div>

          <div className="flex items-center gap-1 text-arcade-amber font-bold">
            <span className="text-xs">🎟️</span>
            <span>{activePlayer.score}</span>
          </div>
        </div>

        {/* Right: Quick Controls (Players, Audio, AFK, Host Menu, Dev Wrench) */}
        <div className="flex items-center gap-1.5 z-10">
          {/* Players count */}
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#12111A] border border-[#2D2A3E] text-gray-300">
            <Users className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[11px] font-bold">{connectedCount}</span>
          </div>

          {/* Sound FX Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            aria-label={soundEnabled ? 'Mute arcade sound effects' : 'Unmute arcade sound effects'}
            className="p-1 rounded bg-[#12111A] border border-[#2D2A3E] text-gray-400 hover:text-white transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-gray-600" />}
          </button>

          {/* Haptics Toggle */}
          <button
            type="button"
            onClick={() => setHapticsEnabled(!hapticsEnabled)}
            aria-label={hapticsEnabled ? 'Disable haptic vibration' : 'Enable haptic vibration'}
            className="p-1 rounded bg-[#12111A] border border-[#2D2A3E] text-gray-400 hover:text-white transition-colors"
          >
            {hapticsEnabled ? <Vibrate className="w-3.5 h-3.5 text-green-400" /> : <VibrateOff className="w-3.5 h-3.5 text-gray-600" />}
          </button>

          {/* AFK Toggle Button */}
          <button
            type="button"
            onClick={() => toggleAFK(activePlayer.id)}
            title="Toggle AFK Mode"
            className={`
              px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border transition-all
              ${activePlayer.isAFK 
                ? 'bg-red-500/20 text-red-400 border-red-500/50 animate-pulse' 
                : 'bg-[#12111A] text-gray-400 border-[#2D2A3E] hover:text-white'
              }
            `}
          >
            {activePlayer.isAFK ? 'AFK' : 'ACTIVE'}
          </button>

          {/* Dev Mode Wrench Toggle */}
          <button
            type="button"
            onClick={toggleDevSim}
            title={isDevSimActive ? 'Disable 4-Player Simulation' : 'Enable 4-Player Sandbox Simulator'}
            className={`
              p-1 rounded border transition-all
              ${isDevSimActive 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-[0_0_8px_rgba(255,199,0,0.4)]' 
                : 'bg-[#12111A] text-gray-500 border-[#2D2A3E] hover:text-amber-400'
              }
            `}
          >
            <Wrench className="w-3.5 h-3.5" />
          </button>

          {/* Host Operator Dropdown Toggle */}
          {isHost && (
            <button
              type="button"
              onClick={() => setIsHostMenuOpen(!isHostMenuOpen)}
              className="px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300 text-[10px] font-bold flex items-center gap-1 hover:bg-purple-900/60 transition-colors"
            >
              <span>HOST</span>
              {isHostMenuOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* Host Operator Collapsible Bar */}
      {isHost && isHostMenuOpen && (
        <div className="w-full bg-[#181622] rounded-xl border border-purple-500/40 p-2.5 flex flex-col gap-2 shadow-2xl animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center justify-between text-[11px] font-mono text-purple-300 font-bold px-1 border-b border-purple-500/20 pb-1">
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-purple-400" />
              HOST OPERATOR DECK
            </span>
            <span className="text-[10px] text-gray-400 uppercase">
              Phase: {room?.phase || 'LOBBY'}
            </span>
          </div>

          {/* Host Action Quick Buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={handleNextPhase}
              className="py-1.5 px-1 bg-[#242133] hover:bg-[#2e2a42] text-cyan-300 text-[10px] font-bold font-mono rounded-lg border border-cyan-500/30 flex flex-col items-center gap-0.5"
            >
              <FastForward className="w-3.5 h-3.5 text-cyan-400" />
              <span>SKIP PHASE</span>
            </button>

            <button
              type="button"
              onClick={() => extendTimer(30)}
              className="py-1.5 px-1 bg-[#242133] hover:bg-[#2e2a42] text-amber-300 text-[10px] font-bold font-mono rounded-lg border border-amber-500/30 flex flex-col items-center gap-0.5"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>+30s TIMER</span>
            </button>

            <button
              type="button"
              onClick={() => resetToLobby()}
              className="py-1.5 px-1 bg-[#242133] hover:bg-[#2e2a42] text-green-300 text-[10px] font-bold font-mono rounded-lg border border-green-500/30 flex flex-col items-center gap-0.5"
            >
              <Gamepad2 className="w-3.5 h-3.5 text-green-400" />
              <span>TO LOBBY</span>
            </button>

            <button
              type="button"
              onClick={() => cashOutReceipt()}
              className="py-1.5 px-1 bg-[#242133] hover:bg-[#2e2a42] text-rose-300 text-[10px] font-bold font-mono rounded-lg border border-rose-500/30 flex flex-col items-center gap-0.5"
            >
              <Receipt className="w-3.5 h-3.5 text-rose-400" />
              <span>CASH OUT</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
