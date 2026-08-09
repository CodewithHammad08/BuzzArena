/**
 * Results Page – Final quiz results with export options.
 * Shown after the host ends the quiz.
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, Download, Home, RotateCcw, Star } from 'lucide-react';
import { useRoom } from '../hooks/useRoom';
import { exportCSV, exportJSON, exportPDF } from '../utils/exportResults';
import { getMedal } from '../utils/formatters';

const PODIUM_COLORS = [
  'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30',
  'from-gray-400/20 to-gray-500/10 border-gray-400/30',
  'from-orange-500/20 to-orange-600/10 border-orange-500/30',
];

export default function Results() {
  const navigate = useNavigate();
  const { teams, history, roomCode, resetSession } = useRoom();

  // Launch confetti for top team
  useEffect(() => {
    if (teams.length === 0) return;
    let cancelled = false;

    (async () => {
      try {
        const confetti = (await import('canvas-confetti')).default;
        if (cancelled) return;

        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:999;';
        document.body.appendChild(canvas);

        const myConfetti = confetti.create(canvas, { resize: true, useWorker: true });

        const blast = () => {
          myConfetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.4 },
            colors: ['#f5c518', '#ffd700', '#ffffff', '#ef4444', '#22c55e'],
          });
        };

        blast();
        setTimeout(() => { if (!cancelled) blast(); }, 600);
        setTimeout(() => { if (canvas.parentNode) canvas.parentNode.removeChild(canvas); }, 5000);
      } catch {}
    })();

    return () => { cancelled = true; };
  }, [teams.length]);

  const handleHome = () => {
    resetSession();
    navigate('/');
  };

  const podium = teams.slice(0, 3);
  const rest = teams.slice(3);

  return (
    <div className="min-h-screen bg-buzz-bg bg-mesh flex flex-col">
      {/* Header */}
      <header className="text-center pt-12 pb-6 px-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="inline-flex p-4 rounded-2xl bg-buzz-yellow/10 border border-buzz-yellow/20 mb-4"
        >
          <Trophy className="w-10 h-10 text-buzz-yellow" />
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-black text-gradient-yellow mb-2"
        >
          Quiz Complete!
        </motion.h1>
        {roomCode && (
          <p className="text-buzz-muted text-sm">Room {roomCode} · {teams.length} teams competed</p>
        )}
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 pb-12 space-y-6">

        {/* Podium */}
        {podium.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <p className="section-title text-center mb-4">🏆 Podium</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {podium.map((team, i) => (
                <motion.div
                  key={team.name}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1, type: 'spring', stiffness: 200 }}
                  className={`glass-card p-5 text-center border bg-gradient-to-br ${PODIUM_COLORS[i] || ''} ${
                    i === 0 ? 'sm:order-2 sm:scale-105' : i === 1 ? 'sm:order-1' : 'sm:order-3'
                  }`}
                >
                  <div className="text-3xl mb-2">{getMedal(i + 1)}</div>
                  <h3 className={`font-black text-lg mb-1 ${i === 0 ? 'text-buzz-yellow' : 'text-buzz-text'}`}>
                    {team.name}
                  </h3>
                  <p className="text-2xl font-black text-buzz-text">{team.score}</p>
                  <p className="text-xs text-buzz-muted">points</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    <Star className="w-3 h-3 text-buzz-yellow" />
                    <span className="text-xs text-buzz-muted">{team.buzzWins} buzz{team.buzzWins !== 1 ? 'es' : ''}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Full leaderboard */}
        {rest.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="glass-card overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-buzz-border">
              <p className="section-title">Full Rankings</p>
            </div>
            <div className="divide-y divide-buzz-border/30">
              {rest.map((team, i) => (
                <div key={team.name} className="grid grid-cols-12 items-center px-4 py-3">
                  <span className="col-span-1 text-sm text-buzz-muted font-bold">{i + 4}</span>
                  <span className="col-span-6 text-sm font-semibold text-buzz-text">{team.name}</span>
                  <span className="col-span-3 text-right text-sm font-bold text-buzz-text tabular-nums">{team.score} <span className="text-xs text-buzz-muted font-normal">pts</span></span>
                  <span className="col-span-2 text-right text-xs text-buzz-muted">{team.buzzWins}⚡</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Round history */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="glass-card overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-buzz-border">
              <p className="section-title">Round Summary</p>
            </div>
            <div className="divide-y divide-buzz-border/30 max-h-48 overflow-y-auto">
              {history.map((h) => (
                <div key={h.roundNumber} className="flex items-center justify-between px-4 py-2.5">
                  <span className="text-xs text-buzz-muted">Round {h.roundNumber}</span>
                  <span className="text-sm font-semibold text-buzz-text">{h.winner || '—'}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state */}
        {teams.length === 0 && (
          <div className="glass-card p-12 text-center">
            <Trophy className="w-10 h-10 text-buzz-muted mx-auto mb-3" />
            <p className="text-buzz-muted">No results yet</p>
            <p className="text-xs text-buzz-muted mt-1">Complete a quiz to see results here</p>
          </div>
        )}

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          {/* Export */}
          {teams.length > 0 && (
            <>
              <button
                onClick={() => exportCSV(teams, history)}
                className="btn-secondary flex-1 text-sm"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={() => exportPDF(teams, history, roomCode)}
                className="btn-secondary flex-1 text-sm"
              >
                <Download className="w-4 h-4" />
                Export PDF
              </button>
              <button
                onClick={() => exportJSON(teams, history, roomCode)}
                className="btn-secondary flex-1 text-sm"
              >
                <Download className="w-4 h-4" />
                Export JSON
              </button>
            </>
          )}
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          onClick={handleHome}
          className="btn-primary w-full text-base py-3"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </motion.button>
      </main>
    </div>
  );
}
