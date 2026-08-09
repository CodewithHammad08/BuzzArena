/**
 * Admin Page – Host dashboard for full quiz control.
 * Features: QR code, team management, start/reset round, scoring, export.
 */

import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, RotateCcw, Lock, Unlock, Trophy, Plus, Minus,
  Download, X, Users, CheckCircle, XCircle, Zap, Hash,
  AlertTriangle, Power,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSocket } from '../hooks/useSocket';
import { useRoom } from '../hooks/useRoom';
import Leaderboard from '../components/Leaderboard';
import TeamCard from '../components/TeamCard';
import QRCode from '../components/QRCode';
import RoundHistory from '../components/RoundHistory';
import Countdown from '../components/Countdown';
import WinnerModal from '../components/WinnerModal';
import Navbar from '../components/Navbar';
import { exportCSV, exportJSON, exportPDF } from '../utils/exportResults';

export default function Admin() {
  const navigate = useNavigate();
  const {
    joinRoom, startRound, resetRound, submitScore,
    lockBuzzers, removeTeam, editTeam, endQuiz,
  } = useSocket();

  const {
    roomCode, hostPassword, isConnected, isConnecting,
    teams, history, winner, locked, countdown,
    roundNumber, quizEnded,
  } = useRoom();

  const [scoreTarget, setScoreTarget] = useState(winner || '');
  const [endConfirm, setEndConfirm] = useState(false);
  const [exportMenu, setExportMenu] = useState(false);
  const [activeTab, setActiveTab] = useState('control'); // 'control' | 'teams' | 'leaderboard'
  const [showWinnerModal, setShowWinnerModal] = useState(!!winner);

  // Redirect if no host context
  useEffect(() => {
    if (!roomCode || !hostPassword) {
      navigate('/', { replace: true });
    }
  }, [roomCode, hostPassword, navigate]);

  // Connect as host
  useEffect(() => {
    if (!roomCode || !hostPassword) return;
    joinRoom({ roomCode, isHost: true, hostPassword });
  }, [roomCode, hostPassword]); // eslint-disable-line

  // Auto-set score target to winner and show modal
  useEffect(() => {
    if (winner) {
      setScoreTarget(winner);
      setShowWinnerModal(true);
    }
  }, [winner]);

  // Redirect to results when quiz ends
  useEffect(() => {
    if (quizEnded) navigate('/results');
  }, [quizEnded, navigate]);

  const handleStartRound = () => {
    if (!winner && !locked) {
      toast('Round already started!', { icon: '⚡' });
      return;
    }
    startRound({ roomCode, hostPassword });
    toast.success('Countdown started!');
  };

  const handleReset = () => {
    resetRound({ roomCode, hostPassword });
  };

  const handleScore = (delta) => {
    if (!scoreTarget) return toast.error('Select a team to score');
    submitScore({ roomCode, hostPassword, teamName: scoreTarget, delta });
    toast.success(`${delta > 0 ? '+' : ''}${delta} to ${scoreTarget}`);
  };

  const handleLock = () => {
    lockBuzzers({ roomCode, hostPassword });
    toast('Buzzers locked', { icon: '🔒' });
  };

  const handleEndQuiz = () => {
    endQuiz({ roomCode, hostPassword });
    setEndConfirm(false);
  };

  if (!roomCode) return null;

  return (
    <div className="min-h-screen bg-buzz-bg bg-mesh flex flex-col">
      <Navbar />
      <Countdown value={countdown} />
      <WinnerModal
        show={showWinnerModal}
        winner={winner}
        reactionTime={null}
        isMyTeam={false}
        onClose={() => setShowWinnerModal(false)}
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6">

        {/* Top bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Hash className="w-4 h-4 text-buzz-yellow" />
              <span className="font-black text-2xl text-buzz-yellow tracking-widest">{roomCode}</span>
              <span className={`badge ${locked ? 'badge-red' : 'badge-green'} ml-2`}>
                {locked ? <><Lock className="w-2.5 h-2.5" /> Locked</> : <><Unlock className="w-2.5 h-2.5" /> Live</>}
              </span>
            </div>
            <p className="text-xs text-buzz-muted">
              Round <strong className="text-buzz-text">{roundNumber}</strong> ·{' '}
              <strong className="text-buzz-text">{teams.length}</strong> teams ·{' '}
              {isConnected
                ? <span className="text-green-400">● Connected</span>
                : <span className="text-red-400">● Disconnected</span>
              }
            </p>
          </div>

          <div className="flex gap-2 sm:ml-auto flex-wrap">
            {/* Export */}
            <div className="relative">
              <button
                id="export-btn"
                onClick={() => setExportMenu(!exportMenu)}
                className="btn-secondary text-xs py-2 px-3"
              >
                <Download className="w-3.5 h-3.5" />
                Export
              </button>
              <AnimatePresence>
                {exportMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-36 glass-card p-1 z-20"
                    onMouseLeave={() => setExportMenu(false)}
                  >
                    {[
                      { label: 'CSV', fn: () => exportCSV(teams, history) },
                      { label: 'JSON', fn: () => exportJSON(teams, history, roomCode) },
                      { label: 'PDF', fn: () => exportPDF(teams, history, roomCode) },
                    ].map(({ label, fn }) => (
                      <button
                        key={label}
                        onClick={() => { fn(); setExportMenu(false); }}
                        className="w-full text-left px-3 py-2 text-xs text-buzz-text hover:bg-white/5 rounded-lg transition-colors"
                      >
                        Download {label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* End quiz */}
            {!endConfirm ? (
              <button
                id="end-quiz-btn"
                onClick={() => setEndConfirm(true)}
                className="btn-danger text-xs py-2 px-3"
              >
                <Power className="w-3.5 h-3.5" />
                End Quiz
              </button>
            ) : (
              <div className="flex items-center gap-1 glass-card px-3 py-1.5 border-red-500/30">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs text-red-300">End quiz?</span>
                <button onClick={handleEndQuiz} className="ml-2 text-xs text-red-400 font-bold hover:text-red-300">Yes</button>
                <button onClick={() => setEndConfirm(false)} className="ml-1 text-xs text-buzz-muted hover:text-buzz-text">No</button>
              </div>
            )}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* ─── Left column: QR + Controls ─────────────────────── */}
          <div className="space-y-4">
            <QRCode roomCode={roomCode} size={140} />

            {/* Round controls */}
            <div className="glass-card p-4 space-y-3">
              <p className="section-title">Round Controls</p>

              <button
                id="start-round-btn"
                onClick={handleStartRound}
                className="btn-primary w-full"
              >
                <Play className="w-4 h-4" />
                Start Round
              </button>

              <button
                id="reset-round-btn"
                onClick={handleReset}
                className="btn-secondary w-full"
              >
                <RotateCcw className="w-4 h-4" />
                Reset Round
              </button>

              <button
                id="lock-buzzers-btn"
                onClick={handleLock}
                disabled={locked}
                className="btn-ghost w-full border border-buzz-border text-xs"
              >
                <Lock className="w-3.5 h-3.5" />
                Lock Buzzers
              </button>
            </div>

            {/* Scoring panel */}
            <div className="glass-card p-4 space-y-3">
              <p className="section-title">Score Award</p>

              {/* Team picker */}
              <select
                id="score-team-select"
                value={scoreTarget}
                onChange={(e) => setScoreTarget(e.target.value)}
                className="input-field text-sm"
              >
                <option value="">Select team...</option>
                {teams.map((t) => (
                  <option key={t.name} value={t.name}>{t.name}</option>
                ))}
              </select>

              {/* Winner badge */}
              {winner && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-buzz-yellow/10 border border-buzz-yellow/20">
                  <Trophy className="w-3.5 h-3.5 text-buzz-yellow" />
                  <span className="text-xs text-buzz-yellow font-semibold truncate">{winner} buzzed first</span>
                </div>
              )}

              {/* Score buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="correct-btn"
                  onClick={() => handleScore(10)}
                  disabled={!scoreTarget}
                  className="btn-primary py-2 text-xs"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  +10 Correct
                </button>
                <button
                  id="wrong-btn"
                  onClick={() => handleScore(-5)}
                  disabled={!scoreTarget}
                  className="btn-danger py-2 text-xs"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  -5 Wrong
                </button>
              </div>

              {/* Custom score */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleScore(5)}
                  disabled={!scoreTarget}
                  className="btn-ghost text-xs border border-buzz-border flex-1 py-1.5"
                >
                  <Plus className="w-3 h-3" /> +5
                </button>
                <button
                  onClick={() => handleScore(-10)}
                  disabled={!scoreTarget}
                  className="btn-ghost text-xs border border-buzz-border flex-1 py-1.5"
                >
                  <Minus className="w-3 h-3" /> -10
                </button>
              </div>
            </div>
          </div>

          {/* ─── Right columns: Teams + Leaderboard + History ──── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Tab nav */}
            <div className="flex rounded-xl bg-buzz-surface border border-buzz-border p-1">
              {[
                { id: 'leaderboard', label: 'Leaderboard', icon: <Trophy className="w-3.5 h-3.5" /> },
                { id: 'teams', label: `Teams (${teams.length})`, icon: <Users className="w-3.5 h-3.5" /> },
              ].map((tab) => (
                <button
                  key={tab.id}
                  id={`admin-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-buzz-yellow text-buzz-bg'
                      : 'text-buzz-muted hover:text-buzz-text'
                  }`}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Leaderboard tab */}
            {activeTab === 'leaderboard' && (
              <motion.div
                key="leaderboard-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <Leaderboard teams={teams} />
                <RoundHistory history={history} />
              </motion.div>
            )}

            {/* Teams tab */}
            {activeTab === 'teams' && (
              <motion.div
                key="teams-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-2"
              >
                {teams.length === 0 ? (
                  <div className="glass-card p-8 text-center">
                    <Users className="w-8 h-8 text-buzz-muted mx-auto mb-3" />
                    <p className="text-buzz-muted text-sm">No teams have joined yet</p>
                    <p className="text-xs text-buzz-muted mt-1">Share the QR code or room code</p>
                  </div>
                ) : (
                  <AnimatePresence>
                    {teams.map((team, i) => (
                      <TeamCard
                        key={team.name}
                        team={team}
                        rank={i + 1}
                        isWinner={team.name === winner}
                        onEdit={(oldName, newName) => editTeam({ roomCode, hostPassword, oldName, newName })}
                        onRemove={(name) => removeTeam({ roomCode, hostPassword, teamName: name })}
                      />
                    ))}
                  </AnimatePresence>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
