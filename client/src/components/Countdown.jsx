/**
 * Countdown – Animated 3-2-1-GO overlay.
 * Shown as a full-screen overlay during the countdown phase.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { useSound } from '../hooks/useSound';

const tickColors = {
  3: 'text-blue-400',
  2: 'text-yellow-400',
  1: 'text-red-400',
  GO: 'text-green-400',
};

/**
 * @param {{ value: number|string|null }} props
 */
export default function Countdown({ value }) {
  const { playTick, playGo } = useSound();

  useEffect(() => {
    if (value === 'GO') playGo();
    else if (value !== null && value !== undefined) playTick();
  }, [value, playTick, playGo]);

  return (
    <AnimatePresence>
      {value !== null && value !== undefined && (
        <motion.div
          key="countdown-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: 'rgba(10, 10, 15, 0.85)', backdropFilter: 'blur(8px)' }}
        >
          <div className="flex flex-col items-center gap-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={String(value)}
                initial={{ scale: 0.3, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 1.5, opacity: 0, rotate: 5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                className={`font-black leading-none select-none ${tickColors[value] || 'text-white'} ${
                  value === 'GO' ? 'text-7xl sm:text-9xl' : 'text-8xl sm:text-[10rem]'
                }`}
                style={{
                  textShadow: value === 'GO'
                    ? '0 0 40px rgba(34,197,94,0.8), 0 0 80px rgba(34,197,94,0.4)'
                    : value === 1
                    ? '0 0 40px rgba(239,68,68,0.8)'
                    : '0 0 30px rgba(255,255,255,0.3)',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                {value}
              </motion.div>
            </AnimatePresence>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-buzz-text-dim text-lg font-medium tracking-widest uppercase"
            >
              {value === 'GO' ? 'Press your buzzer!' : 'Get ready...'}
            </motion.p>

            {/* Progress dots */}
            {value !== 'GO' && (
              <div className="flex gap-2 mt-2">
                {[3, 2, 1].map((n) => (
                  <div
                    key={n}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      n >= value ? 'bg-white' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
