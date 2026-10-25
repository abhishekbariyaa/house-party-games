import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Lock, EyeOff } from 'lucide-react';
import { soundFX } from '../../utils/audio';

interface SecretRoleShutterProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  warningText?: string;
}

export const SecretRoleShutter: React.FC<SecretRoleShutterProps> = ({
  title = 'Secret Role',
  subtitle = 'Keep your screen hidden from others',
  children,
  warningText = 'Hold to Reveal Role',
}) => {
  const [isPeeking, setIsPeeking] = useState(false);

  const handlePointerDown = () => {
    setIsPeeking(true);
    soundFX.relayClick();
  };

  const handlePointerUp = () => {
    if (isPeeking) {
      setIsPeeking(false);
      soundFX.shutterSlam();
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden rounded-3xl bg-[#14141E] border border-white/10 p-3.5 shadow-xl">
      {/* Secret Card Interior (Visible only when peeking) */}
      <div className="relative flex-1 w-full flex flex-col items-center justify-center p-3 text-center overflow-hidden">
        <AnimatePresence>
          {isPeeking ? (
            <motion.div
              key="secret-content"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.12 }}
              className="w-full h-full flex flex-col items-center justify-center"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white/80 text-xs font-semibold mb-3">
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span>Private to You</span>
              </div>
              {children}
            </motion.div>
          ) : (
            <motion.div
              key="closed-placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-white/40 mb-1">
                <Lock className="w-6 h-6" />
              </div>
              <div className="text-base font-bold text-white tracking-tight">
                {title}
              </div>
              <div className="text-xs text-white/40 max-w-[220px]">
                {subtitle}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Shutter Physical Door Overlay */}
      <motion.div
        animate={{
          y: isPeeking ? '-104%' : '0%',
        }}
        transition={{
          type: 'spring',
          stiffness: 420,
          damping: 32,
        }}
        className="absolute inset-x-0 top-0 h-[calc(100%-66px)] z-20 flex flex-col justify-between p-4 rounded-3xl bg-[#1A1A28] border border-white/10 shadow-2xl"
      >
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-xs font-bold text-white/70">Confidential</span>
          </div>
          <Lock className="w-4 h-4 text-white/40" />
        </div>

        <div className="w-full text-center py-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
            <Lock className="w-7 h-7 text-indigo-400" />
          </div>
          <div className="text-lg font-black text-white tracking-tight">
            Role Shield Active
          </div>
          <p className="text-xs text-white/40 mt-1 max-w-[240px] mx-auto">
            Screen is protected. Press and hold below to reveal your secret card.
          </p>
        </div>

        <div className="w-12 h-1 bg-white/20 rounded-full mx-auto" />
      </motion.div>

      {/* Bottom Hold to Peek Button */}
      <div className="relative z-30 pt-2">
        <button
          type="button"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onContextMenu={(e) => e.preventDefault()}
          className={`
            w-full py-3.5 px-4 rounded-2xl font-bold text-sm tracking-tight
            flex items-center justify-center gap-2 select-none touch-none
            transition-all duration-150 active:scale-[0.98]
            ${isPeeking 
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
              : 'bg-white text-[#0B0B10] hover:bg-white/95'
            }
          `}
        >
          {isPeeking ? (
            <>
              <EyeOff className="w-4 h-4" />
              <span>Release to hide</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4" />
              <span>{warningText}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
