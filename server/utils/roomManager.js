/**
 * In-Memory Room Manager
 * Single source of truth for all active quiz rooms.
 * Rooms auto-expire after ROOM_EXPIRY_HOURS hours of inactivity.
 */

const EXPIRY_MS = (parseInt(process.env.ROOM_EXPIRY_HOURS) || 6) * 60 * 60 * 1000;

/** @type {Map<string, Room>} */
const rooms = new Map();

/** @typedef {{ name: string, members: string[], score: number, buzzWins: number, socketId: string }} Team */
/** @typedef {{ roundNumber: number, winner: string|null, reactionTime: number|null, scores: Object }} HistoryEntry */
/**
 * @typedef {Object} Room
 * @property {string} roomCode
 * @property {string} hostPassword
 * @property {string} hostSocketId
 * @property {Map<string, Team>} teams
 * @property {boolean} locked         - Buzzer locked (no buzzes accepted)
 * @property {string|null} winner     - Team name of current winner
 * @property {number|null} roundStart - Timestamp when GO was emitted
 * @property {number} roundNumber
 * @property {HistoryEntry[]} history
 * @property {NodeJS.Timeout|null} expiryTimer
 */

/**
 * Create a new room with defaults.
 */
function createRoom(roomCode, hostPassword, hostSocketId) {
  const room = {
    roomCode,
    hostPassword,
    hostSocketId,
    teams: new Map(),
    locked: true,
    winner: null,
    roundStart: null,
    roundNumber: 0,
    history: [],
    expiryTimer: null,
  };
  rooms.set(roomCode, room);
  _resetExpiry(roomCode);
  console.log(`[RoomManager] Room created: ${roomCode}`);
  return room;
}

/**
 * Get room by code.
 */
function getRoom(roomCode) {
  const room = rooms.get(roomCode);
  if (room) _resetExpiry(roomCode);
  return room;
}

/**
 * Add a team to a room.
 * @param {string} roomCode
 * @param {string} teamName
 * @param {string[]} members  - Participant names (min 2, max 4)
 * @param {string} socketId
 * @returns {{ success: boolean, error?: string }}
 */
function addTeam(roomCode, teamName, members, socketId) {
  const room = getRoom(roomCode);
  if (!room) return { success: false, error: 'Room not found' };

  const normalizedName = teamName.trim();
  if (!normalizedName) return { success: false, error: 'Team name cannot be empty' };
  if (normalizedName.length > 30) return { success: false, error: 'Team name too long (max 30 chars)' };

  // Validate members array
  const cleanMembers = (Array.isArray(members) ? members : [])
    .map((m) => (typeof m === 'string' ? m.trim() : ''))
    .filter(Boolean);

  if (cleanMembers.length < 2) {
    return { success: false, error: 'A team must have at least 2 members' };
  }
  if (cleanMembers.length > 4) {
    return { success: false, error: 'A team can have at most 4 members' };
  }
  for (const m of cleanMembers) {
    if (m.length > 40) return { success: false, error: `Member name too long: "${m}"` };
  }

  // Prevent duplicate team names (case-insensitive)
  for (const [name] of room.teams) {
    if (name.toLowerCase() === normalizedName.toLowerCase() && room.teams.get(name).socketId !== socketId) {
      return { success: false, error: 'Team name already taken in this room' };
    }
  }

  room.teams.set(normalizedName, {
    name: normalizedName,
    members: cleanMembers,
    score: 0,
    buzzWins: 0,
    socketId,
  });

  return { success: true };
}

/**
 * Remove a team from a room.
 */
function removeTeam(roomCode, teamName) {
  const room = getRoom(roomCode);
  if (!room) return false;
  return room.teams.delete(teamName);
}

/**
 * Edit a team's name.
 */
function editTeam(roomCode, oldName, newName) {
  const room = getRoom(roomCode);
  if (!room) return { success: false, error: 'Room not found' };
  const team = room.teams.get(oldName);
  if (!team) return { success: false, error: 'Team not found' };
  room.teams.delete(oldName);
  team.name = newName;
  room.teams.set(newName, team);
  return { success: true };
}

/**
 * Record the round winner. Sets locked = true so no further buzzes are accepted.
 */
function setWinner(roomCode, teamName) {
  const room = getRoom(roomCode);
  if (!room) return { success: false };
  if (room.locked || room.winner) return { success: false };

  room.locked = true;
  room.winner = teamName;

  const reactionTime = room.roundStart ? Date.now() - room.roundStart : null;

  const team = room.teams.get(teamName);
  if (team) team.buzzWins += 1;

  return { success: true, reactionTime };
}

/**
 * Update a team's score.
 */
function updateScore(roomCode, teamName, delta) {
  const room = getRoom(roomCode);
  if (!room) return { success: false, error: 'Room not found' };
  const team = room.teams.get(teamName);
  if (!team) return { success: false, error: 'Team not found' };
  team.score += delta;
  return { success: true, newScore: team.score };
}

/**
 * Reset the current round: clear winner, lock buzzers, increment round.
 */
function resetRound(roomCode) {
  const room = getRoom(roomCode);
  if (!room) return false;

  if (room.winner !== null) {
    room.history.push({
      roundNumber: room.roundNumber,
      winner: room.winner,
      reactionTime: null,
      scores: getLeaderboard(roomCode),
    });
  }

  room.winner = null;
  room.locked = true;
  room.roundStart = null;
  room.roundNumber += 1;
  return true;
}

/**
 * Mark round start (when GO is emitted). Unlock buzzers.
 */
function startRound(roomCode) {
  const room = getRoom(roomCode);
  if (!room) return false;
  room.locked = false;
  room.winner = null;
  room.roundStart = Date.now();
  return true;
}

/**
 * Get sorted leaderboard array (includes members).
 * @param {string} roomCode
 * @returns {Array<{name: string, members: string[], score: number, buzzWins: number}>}
 */
function getLeaderboard(roomCode) {
  const room = getRoom(roomCode);
  if (!room) return [];
  return [...room.teams.values()]
    .sort((a, b) => b.score - a.score || b.buzzWins - a.buzzWins)
    .map(({ name, members, score, buzzWins }) => ({
      name,
      members: members || [],
      score,
      buzzWins,
    }));
}

/**
 * Get raw teams array.
 */
function getTeams(roomCode) {
  const room = getRoom(roomCode);
  if (!room) return [];
  return [...room.teams.values()];
}

/**
 * Delete a room.
 */
function deleteRoom(roomCode) {
  const room = rooms.get(roomCode);
  if (room && room.expiryTimer) clearTimeout(room.expiryTimer);
  rooms.delete(roomCode);
  console.log(`[RoomManager] Room deleted: ${roomCode}`);
}

/**
 * Validate host password.
 */
function validateHost(roomCode, password) {
  const room = getRoom(roomCode);
  if (!room) return false;
  return room.hostPassword === password;
}

/**
 * Reset the expiry timer for a room.
 * @private
 */
function _resetExpiry(roomCode) {
  const room = rooms.get(roomCode);
  if (!room) return;
  if (room.expiryTimer) clearTimeout(room.expiryTimer);
  room.expiryTimer = setTimeout(() => {
    console.log(`[RoomManager] Room expired: ${roomCode}`);
    rooms.delete(roomCode);
  }, EXPIRY_MS);
}

module.exports = {
  createRoom,
  getRoom,
  addTeam,
  removeTeam,
  editTeam,
  setWinner,
  updateScore,
  resetRound,
  startRound,
  getLeaderboard,
  getTeams,
  deleteRoom,
  validateHost,
};
