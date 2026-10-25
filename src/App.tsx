import React, { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import { HomeView } from './components/views/HomeView';
import { GameDetailView } from './components/views/GameDetailView';
import { SetupView } from './components/views/SetupView';
import { LobbyView } from './components/views/LobbyView';
import { ChameleonView } from './components/views/ChameleonView';
import { WavelengthView } from './components/views/WavelengthView';
import { FakinItView } from './components/views/FakinItView';
import { HotTakesView } from './components/views/HotTakesView';
import { ReceiptView } from './components/views/ReceiptView';

const InGameStatusBar: React.FC = () => {
  const { room, localPlayer } = useGameStore();
  if (!room) return null;

  const totalScore = localPlayer.score;

  return (
    <div
      className="w-full px-4 py-2.5 flex items-center justify-between shrink-0"
      style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-center gap-2">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center text-sm"
          style={{ background: localPlayer.color + '30', border: `1.5px solid ${localPlayer.color}` }}
        >
          {localPlayer.avatar}
        </div>
        <span className="text-xs font-bold text-white">{localPlayer.name}</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-sm">🎟️</span>
        <span className="text-xs font-black text-white">{totalScore}</span>
      </div>
    </div>
  );
};

const renderGame = (activeGame: string) => {
  switch (activeGame) {
    case 'CHAMELEON': return <ChameleonView />;
    case 'WAVELENGTH': return <WavelengthView />;
    case 'FAKIN_IT': return <FakinItView />;
    case 'HOT_TAKES': return <HotTakesView />;
    case 'RECEIPT': return <ReceiptView />;
    default: return <LobbyView />;
  }
};

export const App: React.FC = () => {
  const { appScreen, room, navigateTo } = useGameStore();

  // Sync screen when room changes externally (guest receives host broadcast)
  useEffect(() => {
    if (!room) return;
    if (room.activeGame !== 'LOBBY' && appScreen === 'LOBBY') {
      navigateTo('PLAYING');
    } else if (room.activeGame === 'LOBBY' && appScreen === 'PLAYING') {
      navigateTo('LOBBY');
    }
  }, [room?.activeGame]);

  const renderScreen = () => {
    switch (appScreen) {
      case 'HOME':        return <HomeView />;
      case 'GAME_DETAIL': return <GameDetailView />;
      case 'SETUP':       return <SetupView />;
      case 'LOBBY':       return <LobbyView />;
      case 'PLAYING':
        if (!room) { navigateTo('HOME'); return null; }
        return (
          <>
            <InGameStatusBar />
            <div className="flex-1 w-full overflow-hidden">
              {renderGame(room.activeGame)}
            </div>
          </>
        );
      default:
        return <HomeView />;
    }
  };

  return (
    <div
      className="w-full h-[100dvh] flex items-center justify-center overflow-hidden"
      style={{ background: '#0B0B10' }}
    >
      <main
        className="w-full max-w-[430px] h-[100dvh] flex flex-col overflow-hidden select-none relative"
        style={{ background: '#0B0B10' }}
        aria-label="HouseParty Arcade"
      >
        {renderScreen()}
      </main>
    </div>
  );
};

export default App;
