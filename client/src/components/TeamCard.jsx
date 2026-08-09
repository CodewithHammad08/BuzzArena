/**
 * TeamCard – Displays a single team's info in the Admin dashboard.
 * Supports inline editing, score display, and remove action.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Check, X, Zap, Award } from 'lucide-react';
import { truncate } from '../utils/formatters';

/**
 * @param {{
 *   team: { name: string, score: number, buzzWins: number },
 *   rank: number,
 *   isWinner: boolean,
 *   onEdit: (oldName: string, newName: string) => void,
 *   onRemove: (teamName: string) => void,
 * }} props
 */
export default function TeamCard({ team, rank, isWinner, onEdit, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(team.name);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const handleEdit = () => {
    if (editName.trim() && editName.trim() !== team.name) {
      onEdit(team.name, editName.trim());
    }
    setEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(team.name);
    setEditing(false);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`glass-card p-4 flex items-center gap-4 transition-all duration-300 hover:shadow-glass-hover ${
        isWinner ? 'border-buzz-yellow/50 shadow-glow-yellow bg-gradient-to-r from-buzz-yellow/10 to-transparent' : ''
      }`}
    >
      {/* Rank badge */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
        rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
        rank === 2 ? 'bg-gray-400/20 text-gray-300' :
        rank === 3 ? 'bg-orange-500/20 text-orange-400' :
        'bg-white/5 text-buzz-muted'
      }`}>
        {rank}
      </div>

      {/* Name (editable) */}
      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            autoFocus
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleEdit();
              if (e.key === 'Escape') handleCancelEdit();
            }}
            maxLength={30}
            className="input-field py-1 text-sm w-full"
          />
        ) : (
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-buzz-text truncate">
                {truncate(team.name, 22)}
              </span>
              {isWinner && (
                <span className="badge-yellow text-xs flex items-center gap-1">
                  <Award className="w-2.5 h-2.5" /> Winner
                </span>
              )}
            </div>
            {team.members && team.members.length > 0 && (
              <div className="text-[10px] text-buzz-muted truncate mt-0.5">
                {team.members.join(', ')}
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-buzz-muted">
            <span className="font-bold text-buzz-text">{team.score}</span> pts
          </span>
          <span className="text-xs text-buzz-muted flex items-center gap-0.5">
            <Zap className="w-2.5 h-2.5 text-buzz-yellow" />
            <span className="font-bold text-buzz-text">{team.buzzWins}</span> buzz{team.buzzWins !== 1 ? 'es' : ''}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {editing ? (
          <>
            <button
              onClick={handleEdit}
              className="p-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 transition-colors"
              title="Save"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-1.5 rounded-lg bg-white/5 text-buzz-muted hover:bg-white/10 transition-colors"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : confirmRemove ? (
          <>
            <button
              onClick={() => { onRemove(team.name); setConfirmRemove(false); }}
              className="px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmRemove(false)}
              className="p-1.5 rounded-lg bg-white/5 text-buzz-muted hover:bg-white/10 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => { setEditing(true); setEditName(team.name); }}
              className="p-1.5 rounded-lg bg-white/5 text-buzz-muted hover:text-buzz-yellow hover:bg-buzz-yellow/10 transition-colors"
              title="Edit team name"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setConfirmRemove(true)}
              className="p-1.5 rounded-lg bg-white/5 text-buzz-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Remove team"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
}
