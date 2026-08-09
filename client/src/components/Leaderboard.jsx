/**
 * Leaderboard – Live ranked table with animated row updates.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, TrendingUp } from 'lucide-react';
import { getMedal, truncate } from '../utils/formatters';

/**
 * @param {{ teams: Array<{name: string, score: number, buzzWins: number}>, highlightTeam?: string }} props
 */
export default function Leaderboard({ teams = [], highlightTeam }) {
  if (teams.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <Trophy className="w-8 h-8 text-buzz-muted mx-auto mb-2" />
        <p className="text-buzz-text-dim text-sm">No teams yet</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-buzz-border flex items-center gap-2">
        <Trophy className="w-4 h-4 text-buzz-yellow" />
        <h3 className="text-sm font-semibold text-buzz-text uppercase tracking-wider">Live Leaderboard</h3>
        <span className="ml-auto badge-yellow">{teams.length} teams</span>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-12 px-4 py-2 text-xs text-buzz-muted font-semibold uppercase tracking-wider border-b border-buzz-border/50">
        <span className="col-span-1">#</span>
        <span className="col-span-5">Team</span>
        <span className="col-span-3 text-right">Score</span>
        <span className="col-span-3 text-right flex items-center justify-end gap-1">
          <Zap className="w-3 h-3" />Buzz
        </span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-buzz-border/30">
        <AnimatePresence>
          {teams.map((team, index) => {
            const isHighlighted = team.name === highlightTeam;
            const isTop = index === 0;
            const medal = getMedal(index + 1);

            return (
              <motion.div
                key={team.name}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.4, delay: index * 0.05, type: 'spring' }}
                className={`grid grid-cols-12 items-center px-4 py-3.5 transition-all duration-300 ${
                  isHighlighted
                    ? 'bg-gradient-to-r from-buzz-yellow/20 to-transparent border-l-4 border-buzz-yellow shadow-[inset_4px_0_0_0_#FFD700]'
                    : isTop
                    ? 'bg-gradient-to-r from-white/10 to-transparent shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]'
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Rank */}
                <span className="col-span-1 text-sm font-bold">
                  {typeof medal === 'string' && medal.includes('#')
                    ? <span className="text-buzz-muted">{index + 1}</span>
                    : <span>{medal}</span>
                  }
                </span>

                {/* Team name & Members */}
                <div className="col-span-5 flex flex-col justify-center">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ background: teamColor(index) }}
                    />
                    <span className={`text-sm font-semibold truncate ${
                      isHighlighted ? 'text-buzz-yellow' : 'text-buzz-text'
                    }`}>
                      {truncate(team.name, 18)}
                    </span>
                    {isHighlighted && (
                      <span className="text-xs text-buzz-yellow font-bold ml-1">(You)</span>
                    )}
                  </div>
                  {team.members && team.members.length > 0 && (
                    <div className="text-[10px] text-buzz-muted truncate mt-0.5 ml-4">
                      {team.members.join(', ')}
                    </div>
                  )}
                </div>

                {/* Score */}
                <div className="col-span-3 text-right">
                  <motion.span
                    key={team.score}
                    initial={{ scale: 1.4, color: '#f5c518' }}
                    animate={{ scale: 1, color: '#f1f5f9' }}
                    transition={{ duration: 0.4 }}
                    className="text-sm font-bold tabular-nums"
                  >
                    {team.score}
                  </motion.span>
                  <span className="text-xs text-buzz-muted ml-0.5">pts</span>
                </div>

                {/* Buzz wins */}
                <div className="col-span-3 text-right">
                  <span className="text-sm font-semibold text-buzz-text-dim tabular-nums">
                    {team.buzzWins}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Returns a hue-based color for team indicator dot */
function teamColor(index) {
  const hues = [45, 210, 0, 140, 280, 180, 320, 60];
  return `hsl(${hues[index % hues.length]}, 80%, 60%)`;
}
