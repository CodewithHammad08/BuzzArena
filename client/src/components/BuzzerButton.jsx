/**
 * BuzzerButton – The main, highly tactile, 3D animated buzzer button.
 * States: idle, active (can buzz), sent, won, lost
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Zap, CheckCircle, XCircle, Clock } from 'lucide-react';

const states = {
  idle: {
    label: 'WAITING...',
    sublabel: 'Get ready for the next question',
    gradient: 'from-[#1A1A2E] to-[#0D0D1A]',
    shadow: 'shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_-10px_20px_rgba(0,0,0,0.6),inset_0_2px_5px_rgba(255,255,255,0.1)]',
    border: 'border-buzz-border/50',
    icon: <Clock className="w-10 h-10 text-buzz-muted" />,
    disabled: true,
    pulse: false,
    textColor: 'text-buzz-muted',
  },
  active: {
    label: 'BUZZ!',
    sublabel: 'Smash to answer first!',
    gradient: 'from-[#FFD700] via-[#FFA500] to-[#FF8C00]',
    shadow: 'shadow-buzzer-idle',
    border: 'border-[#FFF0B3]',
    icon: <Zap className="w-14 h-14 text-white drop-shadow-md" />,
    disabled: false,
    pulse: true,
    textColor: 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]',
  },
  sent: {
    label: 'SENT!',
    sublabel: 'Determining the winner...',
    gradient: 'from-[#007AFF] to-[#0055B3]',
    shadow: 'shadow-glow-yellow',
    border: 'border-[#66B2FF]',
    icon: <Zap className="w-10 h-10 text-white animate-spin-slow" />,
    disabled: true,
    pulse: false,
    textColor: 'text-white',
  },
  won: {
    label: 'WINNER!',
    sublabel: 'You buzzed first! 🏆',
    gradient: 'from-[#34C759] to-[#248A3D]',
    shadow: 'shadow-glow-green',
    border: 'border-[#86DF9F]',
    icon: <CheckCircle className="w-12 h-12 text-white drop-shadow-md" />,
    disabled: true,
    pulse: false,
    textColor: 'text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]',
  },
  lost: {
    label: 'TOO LATE',
    sublabel: 'Another team was faster',
    gradient: 'from-[#FF3B30] to-[#B3241D]',
    shadow: 'shadow-glow-red',
    border: 'border-[#FF9E99]',
    icon: <XCircle className="w-10 h-10 text-white" />,
    disabled: true,
    pulse: false,
    textColor: 'text-white',
  },
};

/**
 * @param {{ buzzStatus: 'idle'|'active'|'sent'|'won'|'lost', onBuzz: () => void, canBuzz: boolean }} props
 */
export default function BuzzerButton({ buzzStatus = 'idle', onBuzz, canBuzz }) {
  const effectiveStatus = canBuzz ? 'active' : buzzStatus;
  const config = states[effectiveStatus] || states.idle;

  return (
    <div className="flex flex-col items-center gap-8 select-none w-full max-w-sm mx-auto">
      {/* Outer glow rings for active state */}
      <div className="relative flex items-center justify-center w-full aspect-square max-w-[320px]">
        
        {/* Pulsing rings when active */}
        <AnimatePresence>
          {config.pulse && (
            <>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-buzz-yellow to-orange-500 blur-2xl opacity-40 animate-pulse-ring"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 rounded-full bg-gradient-to-r from-buzz-yellow to-orange-500 blur-xl opacity-30 animate-pulse-ring-fast"
                style={{ animationDelay: '0.75s' }}
              />
            </>
          )}
        </AnimatePresence>

        {/* Base shadow plate */}
        <div className="absolute inset-4 rounded-full bg-black/60 blur-xl" />

        {/* Main 3D button */}
        <motion.button
          id="buzzer-btn"
          onClick={config.disabled ? undefined : onBuzz}
          disabled={config.disabled}
          aria-label={`Buzzer: ${config.label}`}
          whileTap={!config.disabled ? { scale: 0.90, y: 8, filter: 'brightness(0.9)' } : {}}
          whileHover={!config.disabled ? { scale: 1.05 } : {}}
          transition={{ type: 'spring', stiffness: 500, damping: 25 }}
          className={`
            relative z-10 w-full h-full rounded-full
            bg-gradient-to-b ${config.gradient}
            border-[6px] sm:border-[8px] ${config.border}
            ${config.shadow}
            flex flex-col items-center justify-center gap-2 sm:gap-3
            transition-colors duration-500
            ${config.disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
            focus:outline-none focus:ring-8 focus:ring-buzz-yellow/30
            overflow-hidden
          `}
          style={{
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {/* Inner highlight for glass effect */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[30%] bg-white/20 rounded-b-full blur-md" />
          
          <AnimatePresence mode="wait">
            <motion.div
              key={effectiveStatus}
              initial={{ scale: 0.4, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.4, opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="flex flex-col items-center gap-1 sm:gap-2 relative z-10 pointer-events-none mt-4"
            >
              {config.icon}
              <span className={`text-2xl sm:text-3xl font-black tracking-[0.15em] uppercase ${config.textColor}`}>
                {config.label}
              </span>
            </motion.div>
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Status label below button */}
      <AnimatePresence mode="wait">
        <motion.div
          key={effectiveStatus + '-label'}
          initial={{ opacity: 0, y: 12, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="glass-card px-6 py-3 rounded-full"
        >
          <p className="text-sm sm:text-base text-buzz-text font-semibold text-center tracking-wide">
            {config.sublabel}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
