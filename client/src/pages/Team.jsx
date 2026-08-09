/**
 * Team Page – The buzzer dashboard for participating teams.
 * Shows the large animated buzzer, winner announcements, leaderboard, and countdown.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Lock, Unlock } from 'lucide-react';
import { useSocket } from '../hooks/useSocket';
import { useRoom } from '../hooks/useRoom';
import BuzzerButton from '../components/BuzzerButton';
import Countdown from '../components/Countdown';
import WinnerModal from '../components/WinnerModal';
import Leaderboard from '../components/Leaderboard';
import Navbar from '../components/Navbar';

export default function Team() {
  const navigate = useNavigate();
  const { joinRoom, buzz } = useSocket();
  const {
    roomCode, teamName, members, isConnected, isConnecting,
    buzzStatus, canBuzz, winner, countdown, locked,
    teams, history, quizEnded, isWinner,
  } = useRoom();

  // Redirect if no room/team context
  useEffect(() => {
    if (!roomCode || !teamName) {
      navigate('/', { replace: true });
    }
  }, [roomCode, teamName, navigate]);

  // Connect socket and join room on mount
  useEffect(() => {
    if (!roomCode || !teamName) return;
    joinRoom({ roomCode, teamName, members, isHost: false });

    return () => {
      // Keep socket alive for reconnection — don't disconnect on unmount
    };
  }, [roomCode, teamName]); // eslint-disable-line

  // Redirect to results when quiz ends
  useEffect(() => {
    if (quizEnded) navigate('/results');
  }, [quizEnded, navigate]);

  const handleBuzz = () => {
    if (!canBuzz) return;
    buzz({ roomCode, teamName });
  };

  const [showWinnerModal, setShowWinnerModal] = useState(!!winner);
  useEffect(() => {
    if (winner) setShowWinnerModal(true);
  }, [winner]);

  if (!roomCode || !teamName) return null;

  return (
    <div className="min-h-screen bg-buzz-bg bg-mesh flex flex-col">
      <Navbar />

      {/* Countdown overlay */}
      <Countdown value={countdown} />

      {/* Winner modal */}
      <WinnerModal
        show={showWinnerModal}
        winner={winner}
        reactionTime={null}
        isMyTeam={isWinner}
        onClose={() => setShowWinnerModal(false)}
      />

      <main className="flex-1 flex flex-col items-center justify-start px-4 py-6 gap-6 max-w-lg mx-auto w-full">

        {/* Status banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          {isConnecting && !isConnected && (
            <div className="glass-card px-4 py-3 flex items-center gap-3 text-sm">
              <span className="w-4 h-4 border-2 border-buzz-yellow border-t-transparent rounded-full animate-spin flex-shrink-0" />
              <span className="text-buzz-muted">Connecting to room <strong className="text-buzz-yellow">{roomCode}</strong>...</span>
            </div>
          )}

          {isConnected && (
            <div className={`glass-card px-4 py-3 flex items-center gap-3 text-sm ${
              locked ? 'border-gray-600/30' : 'border-green-500/30'
            }`}>
              {locked
                ? <Lock className="w-4 h-4 text-buzz-muted flex-shrink-0" />
                : <Unlock className="w-4 h-4 text-green-400 flex-shrink-0" />
              }
              <span className="text-buzz-muted">
                {winner
                  ? <><strong className="text-buzz-yellow">{winner}</strong> buzzed first!</>
                  : locked
                  ? 'Waiting for host to start the round...'
                  : <span className="text-green-400 font-semibold">Buzzers are LIVE — hit it!</span>
                }
              </span>
              <div className="ml-auto flex items-center gap-1.5">
                <Users className="w-3 h-3 text-buzz-muted" />
                <span className="text-xs text-buzz-muted">{teams.length}</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Team name */}
        <div className="text-center">
          <p className="text-xs text-buzz-muted uppercase tracking-widest mb-1">Playing as</p>
          <h2 className="text-2xl font-black text-buzz-text">{teamName}</h2>
        </div>

        {/* Main buzzer */}
        <div className="py-4">
          <BuzzerButton
            buzzStatus={buzzStatus}
            canBuzz={canBuzz}
            onBuzz={handleBuzz}
          />
        </div>

        {/* Winner result (below buzzer, if no modal) */}
        {winner && !showWinnerModal && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`w-full glass-card px-4 py-3 text-center ${
              isWinner ? 'border-buzz-yellow/40' : 'border-buzz-red/20'
            }`}
          >
            <p className={`font-bold text-sm ${isWinner ? 'text-buzz-yellow' : 'text-buzz-muted'}`}>
              {isWinner ? '🏆 You buzzed first!' : `⚡ ${winner} buzzed first`}
            </p>
          </motion.div>
        )}

        {/* Live Leaderboard */}
        {teams.length > 0 && (
          <div className="w-full">
            <Leaderboard teams={teams} highlightTeam={teamName} />
          </div>
        )}
      </main>
    </div>
  );
}

