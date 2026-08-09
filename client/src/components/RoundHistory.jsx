/**
 * RoundHistory – Displays the log of past rounds.
 */

import { motion } from 'framer-motion';
import { History, Trophy, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { formatReactionTime } from '../utils/formatters';

/**
 * @param {{ history: Array<{ roundNumber: number, winner: string|null, reactionTime: number|null }> }} props
 */
export default function RoundHistory({ history = [] }) {
  const [expanded, setExpanded] = useState(true);

  if (history.length === 0) {
    return (
      <div className="glass-card p-4 text-center">
        <History className="w-6 h-6 text-buzz-muted mx-auto mb-2" />
        <p className="text-xs text-buzz-muted">No rounds played yet</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full px-4 py-3 border-b border-buzz-border flex items-center gap-2 hover:bg-white/3 transition-colors"
      >
        <History className="w-4 h-4 text-buzz-yellow" />
        <span className="text-sm font-semibold text-buzz-text uppercase tracking-wider">Round History</span>
        <span className="ml-auto badge-yellow">{history.length}</span>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-buzz-muted ml-1" />
          : <ChevronDown className="w-4 h-4 text-buzz-muted ml-1" />
        }
      </button>

      {expanded && (
        <div className="divide-y divide-buzz-border/30 max-h-64 overflow-y-auto no-scrollbar">
          {[...history].reverse().map((entry, i) => (
            <motion.div
              key={entry.roundNumber}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className="flex items-center gap-3 px-4 py-3"
            >
              {/* Round number */}
              <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold text-buzz-muted flex-shrink-0">
                R{entry.roundNumber}
              </div>

              {/* Winner */}
              <div className="flex-1 min-w-0">
                {entry.winner ? (
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-3 h-3 text-buzz-yellow flex-shrink-0" />
                    <span className="text-sm font-semibold text-buzz-text truncate">{entry.winner}</span>
                  </div>
                ) : (
                  <span className="text-sm text-buzz-muted">No winner</span>
                )}
              </div>

              {/* Reaction time */}
              {entry.reactionTime && (
                <div className="flex items-center gap-1 text-xs text-buzz-muted flex-shrink-0">
                  <Clock className="w-3 h-3" />
                  {formatReactionTime(entry.reactionTime)}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
