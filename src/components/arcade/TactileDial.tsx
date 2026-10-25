import React, { useRef, useState } from 'react';
import { soundFX } from '../../utils/audio';

interface TactileDialProps {
  value: number; // 0 - 100
  onChange?: (val: number) => void;
  disabled?: boolean;
  minLabel?: string;
  maxLabel?: string;
  showBullseye?: boolean;
  targetValue?: number; // 10 - 90
  revealedGuesses?: Array<{ playerId: string; name: string; avatar: string; color: string; guess: number }>;
}

export const TactileDial: React.FC<TactileDialProps> = ({
  value,
  onChange,
  disabled = false,
  minLabel = '0%',
  maxLabel = '100%',
  showBullseye = false,
  targetValue = 50,
  revealedGuesses = [],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const lastNotchRef = useRef(Math.round(value / 5));

  const updateFromPointer = (clientX: number) => {
    if (!containerRef.current || disabled) return;
    const rect = containerRef.current.getBoundingClientRect();
    const rawRatio = (clientX - rect.left) / rect.width;
    const clampedRatio = Math.max(0, Math.min(1, rawRatio));
    const nextVal = Math.round(clampedRatio * 100);

    const currentNotch = Math.round(nextVal / 2);
    if (currentNotch !== lastNotchRef.current) {
      lastNotchRef.current = currentNotch;
      soundFX.rotaryTick();
    }

    onChange?.(nextVal);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateFromPointer(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || disabled) return;
    updateFromPointer(e.clientX);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    }
  };

  // Generate tick markers
  const ticks = Array.from({ length: 21 }, (_, i) => i * 5);

  return (
    <div className="w-full flex flex-col gap-2 select-none">
      {/* Spectrum Labels */}
      <div className="flex items-center justify-between text-xs font-bold px-1">
        <span className="text-white/80 truncate max-w-[42%] text-left">
          {minLabel}
        </span>
        <span className="text-sm font-black px-2.5 py-0.5 rounded-full bg-white/10 text-white">
          {value}
        </span>
        <span className="text-white/80 truncate max-w-[42%] text-right">
          {maxLabel}
        </span>
      </div>

      {/* Tuner Chassis & Rail */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className={`
          relative w-full h-24 rounded-2xl bg-[#0F0F17] border border-white/10
          p-2 flex flex-col justify-between overflow-hidden shadow-inner
          ${disabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}
        `}
      >
        {/* Revealed Target Bullseye (Target Zone) */}
        {showBullseye && (
          <div
            className="absolute top-0 bottom-0 pointer-events-none transition-all duration-500 rounded-lg overflow-hidden flex items-center justify-center"
            style={{
              left: `${Math.max(0, targetValue - 18)}%`,
              width: '36%',
              background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.25) 0%, rgba(245, 158, 11, 0.35) 25%, rgba(16, 185, 129, 0.6) 50%, rgba(245, 158, 11, 0.35) 75%, rgba(239, 68, 68, 0.25) 100%)',
            }}
          >
            <div className="w-0.5 h-full bg-emerald-400 shadow-lg" />
          </div>
        )}

        {/* Notched Tick Rail */}
        <div className="w-full flex justify-between items-center px-2 pt-1 opacity-25">
          {ticks.map((t) => (
            <div
              key={t}
              className={`w-0.5 bg-white ${t % 25 === 0 ? 'h-3' : 'h-1.5'}`}
            />
          ))}
        </div>

        {/* Revealed Player Pins */}
        {revealedGuesses.length > 0 && (
          <div className="absolute inset-x-2 top-2 h-7 pointer-events-none">
            {revealedGuesses.map((p) => (
              <div
                key={p.playerId}
                className="absolute -translate-x-1/2 flex flex-col items-center transition-all duration-500"
                style={{ left: `${p.guess}%` }}
              >
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] shadow-md border border-white"
                  style={{ backgroundColor: p.color }}
                  title={`${p.name}: ${p.guess}`}
                >
                  {p.avatar}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Draggable Indicator Needle */}
        <div
          className="absolute top-2 bottom-2 w-1.5 -translate-x-1/2 pointer-events-none transition-all duration-75"
          style={{ left: `${value}%` }}
        >
          <div className="w-full h-full bg-indigo-500 rounded-full shadow-lg" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-3 h-3 bg-white rounded-full shadow-md" />
        </div>

        {/* Bottom Rail Axis */}
        <div className="w-full h-1 bg-white/10 rounded-full" />
      </div>
    </div>
  );
};
