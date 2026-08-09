/**
 * Home Page – Landing page with Create Room and Join Room flows.
 *
 * Create Room is protected by an Admin Secret that only the host/faculty knows.
 * The secret is validated on the SERVER — frontend is just a form, not a guard.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Shield, Users, Trophy, ArrowRight,
  Lock, Hash, Eye, EyeOff, ShieldAlert, KeyRound,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRoom } from '../hooks/useRoom';

const FEATURES = [
  {
    icon: <Zap className="w-5 h-5 text-buzz-yellow" />,
    title: 'Server-Side Fairness',
    desc: 'Winner decided by the server. Zero frontend cheating possible.',
  },
  {
    icon: <Shield className="w-5 h-5 text-buzz-yellow" />,
    title: 'Host Controls',
    desc: 'Lock buzzers, award scores, reset rounds, remove teams.',
  },
  {
    icon: <Users className="w-5 h-5 text-buzz-yellow" />,
    title: '100+ Teams',
    desc: 'Built for large college events with dozens of teams.',
  },
  {
    icon: <Trophy className="w-5 h-5 text-buzz-yellow" />,
    title: 'Live Leaderboard',
    desc: 'Real-time scores with confetti and buzz sounds.',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const { setRoom } = useRoom();

  const [activeTab, setActiveTab] = useState('join');
  const [hostPassword, setHostPassword] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAdminSecret, setShowAdminSecret] = useState(false);
  const [showHostPassword, setShowHostPassword] = useState(false);

  // ── Create Room ────────────────────────────────────────────────
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!adminSecret.trim()) return toast.error('Admin secret is required');
    if (hostPassword.trim().length < 4) return toast.error('Host password must be at least 4 characters');

    setLoading(true);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminSecret: adminSecret.trim(),
          hostPassword: hostPassword.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Give a clear, specific message for auth failures
        if (data.code === 'INVALID_ADMIN_SECRET' || data.code === 'MISSING_ADMIN_SECRET') {
          throw new Error('❌ Wrong admin secret. Contact your Technical Head.');
        }
        throw new Error(data.error || 'Failed to create room');
      }

      setRoom({
        roomCode: data.roomCode,
        isHost: true,
        hostPassword: hostPassword.trim(),
      });

      toast.success(`Room ${data.roomCode} created!`);
      navigate('/admin');
    } catch (err) {
      toast.error(err.message, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  // ── Join Room ──────────────────────────────────────────────
  const handleJoin = (e) => {
    e.preventDefault();
    const code = roomCode.trim().toUpperCase();
    if (code.length < 4) return toast.error('Enter a valid room code');
    // Navigate to full join page — member names are collected there
    navigate(`/join/${code}`);
  };

  return (
    <div className="min-h-screen bg-buzz-bg bg-mesh flex flex-col">

      {/* ─── Hero Section ───────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center gap-3 mb-6 bg-white/5 p-3 pr-6 rounded-2xl border border-white/10 shadow-glass backdrop-blur-md">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="bg-gradient-to-br from-buzz-yellow to-orange-500 p-2 rounded-xl shadow-glow-yellow"
            >
              <Zap className="w-6 h-6 text-black" />
            </motion.div>
            <div className="text-left">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none drop-shadow-md">
                BuzzArena
              </h1>
              <p className="text-[10px] text-buzz-yellow font-bold tracking-[0.25em] uppercase mt-1">
                Real-Time Buzzer
              </p>
            </div>
          </div>

          <p className="text-buzz-text-dim text-sm sm:text-base max-w-sm mx-auto leading-relaxed mb-6">
            The fastest, fairest quiz buzzer.
            <br />
            <span className="text-white font-semibold drop-shadow-sm">Server decides the winner — instantly.</span>
          </p>
        </motion.div>

        {/* ─── Tab Card ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-full max-w-md"
        >
          {/* Tabs */}
          <div className="flex rounded-2xl bg-black/40 border border-white/5 p-1.5 mb-6 backdrop-blur-md shadow-inner">
            {[
              { id: 'join',   label: 'Join Room',   icon: <Users className="w-4 h-4" /> },
              { id: 'create', label: 'Host Room',   icon: <Shield className="w-4 h-4" /> },
            ].map((tab) => (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-br from-buzz-yellow to-orange-500 text-black shadow-glow-yellow scale-[1.02]'
                    : 'text-buzz-muted hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Forms */}
          <AnimatePresence mode="wait">
            {/* ── Join Form ─────────────────────────────── */}
            {activeTab === 'join' && (
              <motion.div
                key="join"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.2 }}
                className="glass-card p-6"
              >
                <form onSubmit={handleJoin} className="flex flex-col gap-4">
                  <div>
                    <label className="section-title block mb-2">Room Code</label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-buzz-muted" />
                      <input
                        id="room-code-input"
                        type="text"
                        value={roomCode}
                        onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                        placeholder="ABCD12"
                        maxLength={8}
                        className="input-field pl-10 font-mono uppercase tracking-widest text-lg text-center"
                        required
                      />
                    </div>
                  </div>
                  <button id="join-btn" type="submit" className="btn-primary w-full py-3 text-base">
                    Next <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── Create / Host Form ────────────────────── */}
            {activeTab === 'create' && (
              <motion.div
                key="create"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="glass-card p-6"
              >
                {/* Warning banner */}
                <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/8 border border-red-500/20 mb-5">
                  <ShieldAlert className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-red-300 mb-0.5">Authorized Hosts Only</p>
                    <p className="text-xs text-red-400/80 leading-relaxed">
                      Room creation requires the Admin Secret set by your Technical Head.
                      Students cannot access this.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCreate} className="flex flex-col gap-4">
                  {/* Admin Secret */}
                  <div>
                    <label className="section-title block mb-2 flex items-center gap-1.5">
                      <KeyRound className="w-3 h-3" /> Admin Secret
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-buzz-muted" />
                      <input
                        id="admin-secret-input"
                        type={showAdminSecret ? 'text' : 'password'}
                        value={adminSecret}
                        onChange={(e) => setAdminSecret(e.target.value)}
                        placeholder="Enter admin secret key"
                        className="input-field pl-10 pr-10"
                        autoComplete="off"
                        required
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowAdminSecret((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-buzz-muted hover:text-buzz-text transition-colors"
                      >
                        {showAdminSecret
                          ? <EyeOff className="w-4 h-4" />
                          : <Eye className="w-4 h-4" />
                        }
                      </button>
                    </div>
                    <p className="text-xs text-buzz-muted mt-1 ml-1">
                      Only the Technical Head / Faculty knows this.
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="divider-glow" />

                  {/* Host Password */}
                  <div>
                    <label className="section-title block mb-2">Quiz Host Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-buzz-muted" />
                      <input
                        id="host-password-input"
                        type={showHostPassword ? 'text' : 'password'}
                        value={hostPassword}
                        onChange={(e) => setHostPassword(e.target.value)}
                        placeholder="Min. 4 characters"
                        minLength={4}
                        className="input-field pl-10 pr-10"
                        required
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowHostPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-buzz-muted hover:text-buzz-text transition-colors"
                      >
                        {showHostPassword
                          ? <EyeOff className="w-4 h-4" />
                          : <Eye className="w-4 h-4" />
                        }
                      </button>
                    </div>
                    <p className="text-xs text-buzz-muted mt-1 ml-1">
                      You'll use this to control the quiz (start, reset, score).
                    </p>
                  </div>

                  <button
                    id="create-room-btn"
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-3 text-base"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Creating Room...
                      </span>
                    ) : (
                      <>Create Room <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* ─── Features ──────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto w-full px-4 pb-16">
        <div className="divider-glow mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="glass-card p-4 flex gap-3"
            >
              <div className="flex-shrink-0 mt-0.5">{f.icon}</div>
              <div>
                <h3 className="text-sm font-bold text-buzz-text mb-0.5">{f.title}</h3>
                <p className="text-xs text-buzz-muted leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <p className="text-center text-xs text-buzz-muted mt-8">
          BuzzArena v1.0 · Built for college events · Real-time · Fair · Fast
        </p>
      </section>
    </div>
  );
}
