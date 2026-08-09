/**
 * Navbar – Premium frosted glass top navigation bar.
 */

import { Zap, Wifi, WifiOff, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRoom } from '../hooks/useRoom';
import { socket } from '../socket/socket';
import { truncate } from '../utils/formatters';

export default function Navbar() {
  const navigate = useNavigate();
  const { roomCode, teamName, isHost, isConnected, roundNumber, resetSession } = useRoom();

  const handleLeave = () => {
    socket.disconnect();
    resetSession();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-black/40 backdrop-blur-glass border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-buzz-yellow/20 to-transparent" />
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2 font-black text-xl tracking-tight text-white drop-shadow-sm cursor-pointer" onClick={() => navigate('/')}>
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-buzz-yellow to-orange-500 shadow-glow-yellow">
            <Zap className="w-5 h-5 text-black" fill="currentColor" />
          </div>
          BuzzArena
        </div>

        {/* Room info */}
        {roomCode && (
          <div className="flex items-center gap-2 ml-4">
            <span className="hidden sm:block text-xs font-semibold text-buzz-muted tracking-widest uppercase">Room</span>
            <span className="badge-yellow text-sm tracking-widest bg-buzz-yellow/20 border-buzz-yellow/40">{roomCode}</span>
            {roundNumber > 0 && (
              <span className="hidden md:block text-xs font-bold text-buzz-text-dim bg-white/5 px-2 py-1 rounded-md">Round {roundNumber}</span>
            )}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Team/Host name */}
        {(teamName || isHost) && (
          <div className="hidden sm:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
            <span className="text-sm font-bold text-buzz-text truncate max-w-[150px]">
              {isHost ? '👑 Host Dashboard' : truncate(teamName || '', 20)}
            </span>
          </div>
        )}

        {/* Connection status */}
        <div className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border ${
          isConnected ? 'text-buzz-green bg-buzz-green/10 border-buzz-green/20' : 'text-buzz-red bg-buzz-red/10 border-buzz-red/20'
        }`}>
          {isConnected
            ? <Wifi className="w-3.5 h-3.5" />
            : <WifiOff className="w-3.5 h-3.5" />
          }
          <span className="hidden sm:inline tracking-wide">{isConnected ? 'LIVE' : 'OFFLINE'}</span>
        </div>

        {/* Leave */}
        <button
          onClick={handleLeave}
          className="p-2 sm:px-4 sm:py-2 rounded-xl font-bold text-sm text-buzz-muted hover:text-white hover:bg-white/10 transition-colors flex items-center gap-2"
          title="Leave room"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>
    </header>
  );
}
