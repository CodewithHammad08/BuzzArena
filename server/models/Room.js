/**
 * MongoDB Room Model (optional persistence)
 * Set MONGODB_URI in .env to activate.
 * Current game state works entirely in memory via roomManager.js
 */

const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  score: { type: Number, default: 0 },
  buzzWins: { type: Number, default: 0 },
});

const HistoryEntrySchema = new mongoose.Schema({
  roundNumber: Number,
  winner: String,
  reactionTime: Number,
  timestamp: { type: Date, default: Date.now },
});

const RoomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true, index: true },
  teams: [TeamSchema],
  history: [HistoryEntrySchema],
  roundNumber: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'ended'], default: 'active' },
  createdAt: { type: Date, default: Date.now, expires: 21600 }, // Auto-delete after 6h
});

module.exports = mongoose.model('Room', RoomSchema);
