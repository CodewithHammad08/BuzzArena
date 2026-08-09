/**
 * Room Controller – REST API handlers
 */

const { createRoom, getRoom, getLeaderboard } = require('../utils/roomManager');
const { generateRoomCode } = require('../utils/generateCode');

// ─── Admin Secret ──────────────────────────────────────────────────────────────
// Loaded once at startup from .env. Never sent to the client.
const ADMIN_SECRET = process.env.ADMIN_SECRET;

if (!ADMIN_SECRET) {
  console.warn(
    '\n⚠️  [Security] ADMIN_SECRET is not set in .env!\n' +
    '   Anyone can create rooms. Set ADMIN_SECRET to restrict access.\n'
  );
}

/**
 * POST /api/rooms
 * Body: { adminSecret: string, hostPassword: string }
 *
 * adminSecret  — must match ADMIN_SECRET env var (faculty-only key)
 * hostPassword — password used to control the room during the quiz
 */
async function createRoomHandler(req, res) {
  try {
    const { adminSecret, hostPassword } = req.body;

    // ── Gate 1: Admin secret check ────────────────────────────────
    // Only validates when ADMIN_SECRET is configured.
    if (ADMIN_SECRET) {
      if (!adminSecret) {
        return res.status(401).json({
          error: 'Admin secret required to create a room.',
          code: 'MISSING_ADMIN_SECRET',
        });
      }
      if (adminSecret.trim() !== ADMIN_SECRET) {
        // Log the attempt (useful to catch brute-force in production)
        console.warn(`[Security] Failed room creation attempt — wrong admin secret from ${req.ip}`);
        return res.status(401).json({
          error: 'Invalid admin secret. Only authorized hosts can create rooms.',
          code: 'INVALID_ADMIN_SECRET',
        });
      }
    }

    // ── Gate 2: Host password validation ─────────────────────────
    if (!hostPassword || hostPassword.trim().length < 4) {
      return res.status(400).json({ error: 'Host password must be at least 4 characters' });
    }

    // ── Generate unique room code ─────────────────────────────────
    let roomCode;
    let attempts = 0;
    do {
      roomCode = generateRoomCode();
      attempts++;
      if (attempts > 100) {
        return res.status(500).json({ error: 'Could not generate unique room code' });
      }
    } while (getRoom(roomCode));

    createRoom(roomCode, hostPassword.trim(), null);

    console.log(`[Controller] Room created: ${roomCode} by ${req.ip}`);
    return res.status(201).json({
      success: true,
      roomCode,
      message: 'Room created successfully',
    });
  } catch (err) {
    console.error('[Controller] createRoom error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/rooms/:code
 * Returns public room info (no passwords, no secrets)
 */
async function getRoomHandler(req, res) {
  try {
    const code = req.params.code.trim().toUpperCase();
    const room = getRoom(code);

    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    return res.json({
      success: true,
      roomCode: code,
      teamCount: room.teams.size,
      locked: room.locked,
      roundNumber: room.roundNumber,
      leaderboard: getLeaderboard(code),
    });
  } catch (err) {
    console.error('[Controller] getRoom error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { createRoomHandler, getRoomHandler };
