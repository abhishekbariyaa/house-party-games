import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';
import { soundFX } from '../../utils/audio';

export type ArcadeColor = 'red' | 'amber' | 'cyan' | 'green' | 'purple' | 'ticket' | 'gray' | 'white';
export type ArcadeSize = 'sm' | 'md' | 'lg' | 'xl' | 'dome';

interface ArcadeButtonProps extends Omit<HTMLMotionProps<'button'>, 'color'> {
  color?: ArcadeColor;
  size?: ArcadeSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  soundType?: 'click' | 'coin' | 'buzz';
}

const COLOR_MAP: Record<ArcadeColor, { bg: string; text: string; shadow: string }> = {
  red: {
    bg: 'bg-rose-500 hover:bg-rose-600',
    text: 'text-white',
    shadow: 'shadow-lg shadow-rose-500/25',
  },
  amber: {
    bg: 'bg-amber-500 hover:bg-amber-600',
    text: 'text-black',
    shadow: 'shadow-lg shadow-amber-500/25',
  },
  cyan: {
    bg: 'bg-indigo-600 hover:bg-indigo-500',
    text: 'text-white',
    shadow: 'shadow-lg shadow-indigo-600/30',
  },
  green: {
    bg: 'bg-emerald-500 hover:bg-emerald-600',
    text: 'text-white',
    shadow: 'shadow-lg shadow-emerald-500/25',
  },
  purple: {
    bg: 'bg-purple-600 hover:bg-purple-500',
    text: 'text-white',
    shadow: 'shadow-lg shadow-purple-600/30',
  },
  white: {
    bg: 'bg-white hover:bg-white/95',
    text: 'text-slate-900',
    shadow: 'shadow-lg shadow-white/10',
  },
  ticket: {
    bg: 'bg-amber-100 hover:bg-amber-50',
    text: 'text-slate-900',
    shadow: 'shadow-md shadow-amber-500/10',
  },
  gray: {
    bg: 'bg-white/10 hover:bg-white/15',
    text: 'text-white/70',
    shadow: 'none',
  },
};

const SIZE_MAP: Record<ArcadeSize, string> = {
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-xl',
  md: 'px-4 py-2.5 text-sm font-bold rounded-2xl',
  lg: 'px-5 py-3 text-base font-bold rounded-2xl',
  xl: 'px-6 py-3.5 text-base font-extrabold rounded-2xl',
  dome: 'w-full py-4 text-base font-black rounded-2xl',
};

export const ArcadeButton: React.FC<ArcadeButtonProps> = ({
  color = 'cyan',
  size = 'md',
  children,
  icon,
  fullWidth = false,
  soundType = 'click',
  disabled,
  onClick,
  className = '',
  ...props
}) => {
  const currentTheme = COLOR_MAP[disabled ? 'gray' : color];

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (soundType === 'coin') {
      soundFX.coinChime();
    } else if (soundType === 'buzz') {
      soundFX.buzzer();
    } else {
      soundFX.relayClick();
    }
    onClick?.(e);
  };

  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      disabled={disabled}
      onClick={handleClick}
      className={`
        relative inline-flex items-center justify-center gap-2
        ${currentTheme.bg} ${currentTheme.text} ${currentTheme.shadow}
        ${SIZE_MAP[size]}
        ${fullWidth ? 'w-full' : ''}
        select-none tracking-tight
        transition-all duration-150
        ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-95'}
        ${className}
      `}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </motion.button>
  );
};
