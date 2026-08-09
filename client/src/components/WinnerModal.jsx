/**
 * WinnerModal – Full-screen winner announcement with confetti.
 * Shown when the server broadcasts the winner event.
 */

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Clock } from 'lucide-react';
import { formatReactionTime } from '../utils/formatters';

/**
 * @param {{
 *   winner: string|null,
 *   reactionTime: number|null,
 *   isMyTeam: boolean,
 *   onClose?: () => void
 * }} props
 */
export default function WinnerModal({ winner, reactionTime, isMyTeam, onClose, show = true }) {
  const confettiRef = useRef(null);

  // Launch confetti when winner is announced
  useEffect(() => {
    if (!winner || !show) return;

    let cancelled = false;

    (async () => {
      try {
        const confetti = (await import('canvas-confetti')).default;

        if (cancelled) return;

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.id = 'confetti-canvas';
        document.body.appendChild(canvas);
        confettiRef.current = canvas;

        const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });

        // Main burst
        myConfetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#f5c518', '#ef4444', '#ffffff', '#22c55e', '#3b82f6'],
        });

        // Side bursts
        setTimeout(() => {
          if (cancelled) return;
          myConfetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0, y: 0.6 } });
          myConfetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1, y: 0.6 } });
        }, 250);
      } catch {
        // Ignore if canvas-confetti not available
      }
    })();

    return () => {
      cancelled = true;
      if (confettiRef.current) {
        document.body.removeChild(confettiRef.current);
        confettiRef.current = null;
      }
    };
  }, [winner, show]);

  return (
    <AnimatePresence>
      {winner && show && (
        <motion.div
          key="winner-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-center justify-center p-4"
          style={{ background: 'rgba(10, 10, 15, 0.7)', backdropFilter: 'blur(6px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card max-w-sm w-full text-center p-8 relative overflow-hidden"
            style={{
              border: isMyTeam
                ? '1px solid rgba(245, 197, 24, 0.5)'
                : '1px solid rgba(239, 68, 68, 0.5)',
              boxShadow: isMyTeam
                ? '0 0 60px rgba(245,197,24,0.3), 0 0 120px rgba(245,197,24,0.1)'
                : '0 0 60px rgba(239,68,68,0.3)',
            }}
          >
            {/* Background glow */}
            <div className={`absolute inset-0 opacity-10 ${
              isMyTeam ? 'bg-buzz-yellow' : 'bg-buzz-red'
            }`} />

            {/* Trophy icon */}
            <motion.div
              animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative z-10 mb-4"
            >
              <div className={`inline-flex p-4 rounded-full ${
                isMyTeam ? 'bg-buzz-yellow/20' : 'bg-buzz-red/20'
              }`}>
                {isMyTeam
                  ? <Trophy className="w-10 h-10 text-buzz-yellow" />
                  : <Zap className="w-10 h-10 text-buzz-red" />
                }
              </div>
            </motion.div>

            {/* Label */}
            <p className="relative z-10 text-xs font-bold uppercase tracking-widest text-buzz-muted mb-2">
              {isMyTeam ? '🎉 Congratulations!' : '⚡ First Buzz!'}
            </p>

            {/* Winner name */}
            <motion.h2
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
              className={`relative z-10 text-3xl sm:text-4xl font-black mb-2 ${
                isMyTeam ? 'text-gradient-yellow' : 'text-white'
              }`}
            >
              {winner}
            </motion.h2>

            <p className="relative z-10 text-buzz-text-dim text-sm mb-4">
              {isMyTeam ? 'buzzed first!' : 'buzzed first'}
            </p>

            {/* Reaction time */}
            {reactionTime && (
              <div className="relative z-10 flex items-center justify-center gap-2 text-xs text-buzz-muted bg-white/5 rounded-lg px-4 py-2 mb-6">
                <Clock className="w-3 h-3" />
                <span>Reaction time: <strong className="text-buzz-text">{formatReactionTime(reactionTime)}</strong></span>
              </div>
            )}

            {/* Dismiss hint */}
            {onClose && (
              <button
                onClick={onClose}
                className="relative z-10 btn-ghost text-xs w-full"
              >
                Click anywhere to dismiss
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
