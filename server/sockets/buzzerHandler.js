/**
 * BuzzArena Socket.IO Event Handlers
 *
 * ALL winner logic is decided HERE on the server.
 * The frontend NEVER decides who won — it only displays what the server broadcasts.
 *
 * Events received (Client → Server):
 *   join-room     – Team or host joins a room
 *   buzz          – Team presses the buzzer
 *   start-round   – Host starts the countdown + enables buzzers
 *   reset-round   – Host resets the current round
 *   submit-score  – Host awards/deducts points
 *   lock-buzzers  – Host manually locks buzzers
 *   remove-team   – Host removes a team
 *   edit-team     – Host edits a team name
 *   end-quiz      – Host ends the quiz session
 *
 * Events emitted (Server → Client):
 *   winner            – Winner detected
 *   leaderboard-update – Scores changed
 *   countdown         – Countdown tick (3,2,1,'GO')
 *   round-reset       – Round was reset
 *   team-joined       – A new team joined
 *   room-update       – General room state update
 *   error             – Error message
 *   quiz-ended        – Quiz session ended
 */

const {
  getRoom,
  addTeam,
  removeTeam,
  editTeam,
  setWinner,
  updateScore,
  resetRound,
  startRound,
  getLeaderboard,
  validateHost,
  deleteRoom,
} = require('../utils/roomManager');

/**
 * Register all socket event handlers for a connected client.
 * @param {import('socket.io').Server} io
 * @param {import('socket.io').Socket} socket
 */
function registerBuzzerHandlers(io, socket) {

  // ─── join-room ──────────────────────────────────────────────────────────────
  socket.on('join-room', ({ roomCode, teamName, members, isHost, hostPassword } = {}) => {
    try {
      if (!roomCode) return socket.emit('error', { message: 'Room code is required' });

      const code = roomCode.trim().toUpperCase();
      const room = getRoom(code);
      if (!room) return socket.emit('error', { message: 'Room not found. Check the code and try again.' });

      if (isHost) {
        // Host reconnect / verification
        if (room.hostPassword !== hostPassword) {
          return socket.emit('error', { message: 'Invalid host password' });
        }
        room.hostSocketId = socket.id;
        socket.join(code);
        socket.emit('room-update', {
          roomCode: code,
          locked: room.locked,
          winner: room.winner,
          teams: getLeaderboard(code),
          history: room.history,
          roundNumber: room.roundNumber,
        });
        console.log(`[Socket] Host reconnected to room ${code}`);
        return;
      }

      // Team joining
      if (!teamName) return socket.emit('error', { message: 'Team name is required' });

      const result = addTeam(code, teamName.trim(), members, socket.id);
      if (!result.success) return socket.emit('error', { message: result.error });

      socket.join(code);
      socket.data.roomCode = code;
      socket.data.teamName = teamName.trim();

      const memberCount = Array.isArray(members) ? members.filter(Boolean).length : 0;
      console.log(`[Socket] Team "${teamName.trim()}" (${memberCount} members) joined room ${code}`);

      // Notify joining team
      socket.emit('room-update', {
        roomCode: code,
        locked: room.locked,
        winner: room.winner,
        teams: getLeaderboard(code),
        history: room.history,
        roundNumber: room.roundNumber,
      });

      // Notify everyone in the room
      io.to(code).emit('team-joined', {
        teamName: teamName.trim(),
        teams: getLeaderboard(code),
      });

      io.to(code).emit('leaderboard-update', { teams: getLeaderboard(code) });
    } catch (err) {
      console.error('[Socket] join-room error:', err);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // ─── buzz ───────────────────────────────────────────────────────────────────
  socket.on('buzz', ({ roomCode, teamName } = {}) => {
    try {
      if (!roomCode || !teamName) return;

      const code = roomCode.trim().toUpperCase();
      const room = getRoom(code);
      if (!room) return socket.emit('error', { message: 'Room not found' });

      // CRITICAL: setWinner handles the lock atomically.
      // If room is already locked (winner exists), this returns { success: false }
      const result = setWinner(code, teamName.trim());

      if (!result.success) {
        // Buzzer was already won — tell this client they were too late
        socket.emit('buzz-too-late', { message: 'Too late! Another team buzzed first.' });
        return;
      }

      console.log(`[Socket] 🏆 WINNER: "${teamName}" in room ${code} | Reaction: ${result.reactionTime}ms`);

      // Broadcast winner to EVERYONE in the room (including winner themselves)
      io.to(code).emit('winner', {
        teamName: teamName.trim(),
        reactionTime: result.reactionTime,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error('[Socket] buzz error:', err);
      socket.emit('error', { message: 'Buzz failed' });
    }
  });

  // ─── start-round ────────────────────────────────────────────────────────────
  socket.on('start-round', ({ roomCode, hostPassword } = {}) => {
    try {
      const code = roomCode?.trim().toUpperCase();
      if (!validateHost(code, hostPassword)) {
        return socket.emit('error', { message: 'Unauthorized: Invalid host credentials' });
      }

      const room = getRoom(code);
      if (!room) return socket.emit('error', { message: 'Room not found' });

      // Emit countdown ticks: 3, 2, 1, 'GO'
      const ticks = [3, 2, 1, 'GO'];
      let i = 0;

      io.to(code).emit('countdown', { value: ticks[i], total: 3 });
      i++;

      const interval = setInterval(() => {
        io.to(code).emit('countdown', { value: ticks[i], total: 3 });

        if (ticks[i] === 'GO') {
          clearInterval(interval);
          // Unlock buzzers ONLY after GO
          startRound(code);
          io.to(code).emit('round-started', { roundNumber: room.roundNumber });
        }

        i++;
      }, 1000);
    } catch (err) {
      console.error('[Socket] start-round error:', err);
      socket.emit('error', { message: 'Failed to start round' });
    }
  });

  // ─── reset-round ────────────────────────────────────────────────────────────
  socket.on('reset-round', ({ roomCode, hostPassword } = {}) => {
    try {
      const code = roomCode?.trim().toUpperCase();
      if (!validateHost(code, hostPassword)) {
        return socket.emit('error', { message: 'Unauthorized: Invalid host credentials' });
      }

      resetRound(code);
      const room = getRoom(code);

      io.to(code).emit('round-reset', {
        roundNumber: room?.roundNumber || 0,
        history: room?.history || [],
      });

      io.to(code).emit('leaderboard-update', { teams: getLeaderboard(code) });
      console.log(`[Socket] Round reset in room ${code}`);
    } catch (err) {
      console.error('[Socket] reset-round error:', err);
      socket.emit('error', { message: 'Failed to reset round' });
    }
  });

  // ─── submit-score ───────────────────────────────────────────────────────────
  socket.on('submit-score', ({ roomCode, hostPassword, teamName, delta } = {}) => {
    try {
      const code = roomCode?.trim().toUpperCase();
      if (!validateHost(code, hostPassword)) {
        return socket.emit('error', { message: 'Unauthorized: Invalid host credentials' });
      }

      if (typeof delta !== 'number') {
        return socket.emit('error', { message: 'Invalid score delta' });
      }

      const result = updateScore(code, teamName, delta);
      if (!result.success) return socket.emit('error', { message: result.error });

      io.to(code).emit('leaderboard-update', { teams: getLeaderboard(code) });
      console.log(`[Socket] Score update: "${teamName}" ${delta > 0 ? '+' : ''}${delta} in room ${code}`);
    } catch (err) {
      console.error('[Socket] submit-score error:', err);
      socket.emit('error', { message: 'Failed to submit score' });
    }
  });

  // ─── lock-buzzers (manual) ──────────────────────────────────────────────────
  socket.on('lock-buzzers', ({ roomCode, hostPassword } = {}) => {
    try {
      const code = roomCode?.trim().toUpperCase();
      if (!validateHost(code, hostPassword)) {
        return socket.emit('error', { message: 'Unauthorized' });
      }
      const room = getRoom(code);
      if (room) {
        room.locked = true;
        io.to(code).emit('room-update', { locked: true });
      }
    } catch (err) {
      console.error('[Socket] lock-buzzers error:', err);
    }
  });

  // ─── remove-team ────────────────────────────────────────────────────────────
  socket.on('remove-team', ({ roomCode, hostPassword, teamName } = {}) => {
    try {
      const code = roomCode?.trim().toUpperCase();
      if (!validateHost(code, hostPassword)) {
        return socket.emit('error', { message: 'Unauthorized' });
      }
      removeTeam(code, teamName);
      io.to(code).emit('team-removed', { teamName });
      io.to(code).emit('leaderboard-update', { teams: getLeaderboard(code) });
    } catch (err) {
      console.error('[Socket] remove-team error:', err);
    }
  });

  // ─── edit-team ───────────────────────────────────────────────────────────────
  socket.on('edit-team', ({ roomCode, hostPassword, oldName, newName } = {}) => {
    try {
      const code = roomCode?.trim().toUpperCase();
      if (!validateHost(code, hostPassword)) {
        return socket.emit('error', { message: 'Unauthorized' });
      }
      const result = editTeam(code, oldName, newName);
      if (!result.success) return socket.emit('error', { message: result.error });
      io.to(code).emit('leaderboard-update', { teams: getLeaderboard(code) });
    } catch (err) {
      console.error('[Socket] edit-team error:', err);
    }
  });

  // ─── end-quiz ───────────────────────────────────────────────────────────────
  socket.on('end-quiz', ({ roomCode, hostPassword } = {}) => {
    try {
      const code = roomCode?.trim().toUpperCase();
      if (!validateHost(code, hostPassword)) {
        return socket.emit('error', { message: 'Unauthorized' });
      }
      const room = getRoom(code);
      const finalLeaderboard = getLeaderboard(code);
      const history = room?.history || [];

      io.to(code).emit('quiz-ended', {
        leaderboard: finalLeaderboard,
        history,
      });

      // Clean up room after a short delay
      setTimeout(() => deleteRoom(code), 5 * 60 * 1000);
      console.log(`[Socket] Quiz ended in room ${code}`);
    } catch (err) {
      console.error('[Socket] end-quiz error:', err);
    }
  });

  // ─── disconnect ─────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    const { roomCode, teamName } = socket.data || {};
    if (roomCode && teamName) {
      // Don't remove team on disconnect — they may reconnect
      const room = getRoom(roomCode);
      if (room) {
        io.to(roomCode).emit('room-update', {
          teams: getLeaderboard(roomCode),
        });
      }
    }
  });
}

module.exports = { registerBuzzerHandlers };
