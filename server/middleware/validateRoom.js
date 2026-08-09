/**
 * validateRoom middleware
 * Checks that a room exists before passing to the route handler.
 */

const { getRoom } = require('../utils/roomManager');

function validateRoom(req, res, next) {
  const code = (req.params.code || req.body.roomCode || '').trim().toUpperCase();
  if (!code) return res.status(400).json({ error: 'Room code is required' });

  const room = getRoom(code);
  if (!room) return res.status(404).json({ error: 'Room not found' });

  req.room = room;
  req.roomCode = code;
  next();
}

module.exports = { validateRoom };
