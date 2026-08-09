/**
 * Join Page – Team registration with participant names.
 * - Room code (pre-filled from QR URL)
 * - Team name
 * - Member names: minimum 2, maximum 4
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Users, Hash, ArrowRight, UserPlus, Trash2, User, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRoom } from '../hooks/useRoom';

const MIN_MEMBERS = 2;
const MAX_MEMBERS = 4;

export default function Join() {
  const navigate = useNavigate();
  const { code } = useParams();
  const { setRoom } = useRoom();

  const [step, setStep] = useState(1); // 1 = room+team, 2 = members
  const [roomCode, setRoomCode] = useState(code?.toUpperCase() || '');
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState(['', '']); // start with 2 empty slots
  const [roomValid, setRoomValid] = useState(null);
  const [validating, setValidating] = useState(false);
  const [joining, setJoining] = useState(false);

  // Validate room code from URL
  useEffect(() => {
    if (!code) return;
    const validate = async () => {
      setValidating(true);
      try {
        const res = await fetch(`/api/rooms/${code.toUpperCase()}`);
        setRoomValid(res.ok);
        if (!res.ok) toast.error('Room not found or expired');
      } catch {
        setRoomValid(false);
      } finally {
        setValidating(false);
      }
    };
    validate();
  }, [code]);

  // ── Member helpers ──────────────────────────────────────────────
  const updateMember = (i, val) => {
    const next = [...members];
    next[i] = val;
    setMembers(next);
  };

  const addMember = () => {
    if (members.length < MAX_MEMBERS) setMembers([...members, '']);
  };

  const removeMember = (i) => {
    if (members.length <= MIN_MEMBERS) return;
    setMembers(members.filter((_, idx) => idx !== i));
  };

  // ── Step 1: validate room + team name ──────────────────────────
  const handleStep1 = async (e) => {
    e.preventDefault();
    const trimCode = roomCode.trim().toUpperCase();
    const trimName = teamName.trim();

    if (trimCode.length < 4) return toast.error('Enter a valid room code');
    if (!trimName) return toast.error('Enter your team name');
    if (trimName.length > 30) return toast.error('Team name too long (max 30 chars)');

    // Validate room against server if not already done
    if (roomValid === null || roomValid === false) {
      setValidating(true);
      try {
        const res = await fetch(`/api/rooms/${trimCode}`);
        if (!res.ok) {
          setRoomValid(false);
          toast.error('Room not found. Check the code and try again.');
          setValidating(false);
          return;
        }
        setRoomValid(true);
      } catch {
        toast.error('Could not reach server. Check your connection.');
        setValidating(false);
        return;
      }
      setValidating(false);
    }

    setStep(2);
  };

  // ── Step 2: submit with members ────────────────────────────────
  const handleJoin = (e) => {
    e.preventDefault();

    const cleanMembers = members.map((m) => m.trim()).filter(Boolean);

    if (cleanMembers.length < MIN_MEMBERS) {
      return toast.error(`Please enter at least ${MIN_MEMBERS} member names`);
    }

    // Check for duplicate member names
    const unique = new Set(cleanMembers.map((m) => m.toLowerCase()));
    if (unique.size !== cleanMembers.length) {
      return toast.error('Member names must be unique');
    }

    setJoining(true);

    setRoom({
      roomCode: roomCode.trim().toUpperCase(),
      teamName: teamName.trim(),
      members: cleanMembers,
      isHost: false,
    });

    navigate('/team');
  };

  const filledMemberCount = members.filter((m) => m.trim()).length;
  const canSubmit = filledMemberCount >= MIN_MEMBERS;

  return (
    <div className="min-h-screen bg-buzz-bg bg-mesh flex flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="inline-flex items-center gap-3 mb-4 bg-white/5 p-2 pr-5 rounded-2xl border border-white/10 shadow-glass backdrop-blur-md"
          >
            <div className="bg-gradient-to-br from-buzz-yellow to-orange-500 p-2 rounded-xl shadow-glow-yellow">
              <Zap className="w-5 h-5 text-black" />
            </div>
            <span className="font-black text-xl text-white tracking-tight drop-shadow-md">BuzzArena</span>
          </motion.div>
          <h2 className="text-2xl font-black text-white drop-shadow-sm">Join the Arena</h2>
          <p className="text-buzz-text-dim text-sm mt-1">Register your team to compete</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-5">
          {[1, 2].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300 ${
                step > s
                  ? 'bg-buzz-yellow border-buzz-yellow text-buzz-bg'
                  : step === s
                  ? 'border-buzz-yellow text-buzz-yellow bg-buzz-yellow/10'
                  : 'border-buzz-border text-buzz-muted'
              }`}>
                {step > s ? <CheckCircle className="w-3.5 h-3.5" /> : s}
              </div>
              <span className={`text-xs font-semibold transition-colors duration-300 ${
                step >= s ? 'text-buzz-text' : 'text-buzz-muted'
              }`}>
                {s === 1 ? 'Room & Team' : 'Members'}
              </span>
              {s < 2 && <div className={`flex-1 h-px transition-all duration-500 ${step > s ? 'bg-buzz-yellow/50' : 'bg-buzz-border'}`} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── Step 1: Room code + Team name ────────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="glass-card p-6"
            >
              {/* Room valid banner */}
              {code && roomValid !== null && (
                <div className={`mb-4 p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  roomValid
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                }`}>
                  <span>{roomValid ? '✓' : '✗'}</span>
                  {roomValid ? 'Room found! Enter your team details.' : 'Room not found or expired.'}
                </div>
              )}

              <form onSubmit={handleStep1} className="flex flex-col gap-4">
                {/* Room code */}
                <div>
                  <label className="section-title block mb-2">Room Code</label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-buzz-muted" />
                    <input
                      id="join-room-code"
                      type="text"
                      value={roomCode}
                      onChange={(e) => { setRoomCode(e.target.value.toUpperCase()); setRoomValid(null); }}
                      placeholder="ABCD12"
                      maxLength={8}
                      className="input-field pl-10 font-mono uppercase tracking-widest text-lg text-center"
                      required
                      readOnly={!!code && roomValid === true}
                    />
                  </div>
                </div>

                {/* Team name */}
                <div>
                  <label className="section-title block mb-2">Team Name</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-buzz-muted" />
                    <input
                      id="join-team-name"
                      type="text"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="Team Alpha"
                      maxLength={30}
                      className="input-field pl-10"
                      autoFocus={!!code}
                      required
                    />
                  </div>
                  <p className="text-xs text-buzz-muted mt-1 ml-1">{teamName.length}/30 characters</p>
                </div>

                <button
                  id="step1-next-btn"
                  type="submit"
                  disabled={validating || (code && roomValid === false)}
                  className="btn-primary w-full py-3 text-base"
                >
                  {validating
                    ? <><span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Checking...</>
                    : <>Next: Add Members <ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              </form>
            </motion.div>
          )}

          {/* ── Step 2: Member names ──────────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25 }}
              className="glass-card p-6"
            >
              {/* Team header recap */}
              <div className="flex items-center gap-3 mb-5 p-3 rounded-xl bg-buzz-yellow/5 border border-buzz-yellow/20">
                <div className="p-2 rounded-lg bg-buzz-yellow/10">
                  <Users className="w-4 h-4 text-buzz-yellow" />
                </div>
                <div>
                  <p className="text-xs text-buzz-muted">Team</p>
                  <p className="font-bold text-buzz-yellow text-sm">{teamName}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-xs text-buzz-muted">Room</p>
                  <p className="font-mono font-bold text-buzz-text text-sm tracking-widest">{roomCode}</p>
                </div>
              </div>

              <div className="mb-3 flex items-center justify-between">
                <label className="section-title">
                  Participant Names
                </label>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  filledMemberCount >= MIN_MEMBERS
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  {filledMemberCount}/{MAX_MEMBERS} · min {MIN_MEMBERS}
                </span>
              </div>

              <form onSubmit={handleJoin} className="flex flex-col gap-3">
                <AnimatePresence>
                  {members.map((member, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-2"
                    >
                      {/* Member number badge */}
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                        member.trim()
                          ? 'bg-buzz-yellow/20 text-buzz-yellow'
                          : 'bg-white/5 text-buzz-muted'
                      }`}>
                        {i + 1}
                      </div>

                      {/* Input */}
                      <div className="flex-1 relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-buzz-muted" />
                        <input
                          id={`member-${i}`}
                          type="text"
                          value={member}
                          onChange={(e) => updateMember(i, e.target.value)}
                          placeholder={i < MIN_MEMBERS ? `Member ${i + 1} (required)` : `Member ${i + 1} (optional)`}
                          maxLength={40}
                          className={`input-field pl-9 py-2.5 text-sm ${
                            i < MIN_MEMBERS ? 'border-buzz-border' : 'border-buzz-border/50'
                          }`}
                          required={i < MIN_MEMBERS}
                          autoFocus={i === 0}
                        />
                      </div>

                      {/* Remove button (only for optional members) */}
                      {i >= MIN_MEMBERS && (
                        <button
                          type="button"
                          onClick={() => removeMember(i)}
                          className="p-2 rounded-lg text-buzz-muted hover:text-red-400 hover:bg-red-500/10 transition-colors flex-shrink-0"
                          title="Remove member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Add member button */}
                {members.length < MAX_MEMBERS && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    type="button"
                    onClick={addMember}
                    className="btn-ghost text-xs border border-dashed border-buzz-border py-2.5 w-full hover:border-buzz-yellow hover:text-buzz-yellow"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Add Member ({members.length}/{MAX_MEMBERS})
                  </motion.button>
                )}

                {/* Info note */}
                <p className="text-xs text-buzz-muted text-center pt-1">
                  {MIN_MEMBERS} members required · up to {MAX_MEMBERS} allowed
                </p>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-secondary flex-none px-4 text-sm"
                  >
                    ← Back
                  </button>
                  <button
                    id="join-submit-btn"
                    type="submit"
                    disabled={joining || !canSubmit}
                    className="btn-primary flex-1 py-3 text-base"
                  >
                    {joining
                      ? <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      : <><span>Enter Arena</span> <ArrowRight className="w-4 h-4" /></>
                    }
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => navigate('/')}
          className="btn-ghost w-full mt-4 text-sm"
        >
          ← Back to Home
        </button>
      </motion.div>
    </div>
  );
}
